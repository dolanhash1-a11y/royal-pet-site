(() => {
  'use strict';

  const API = 'https://royal-pet-admin-api.dolanhash1.workers.dev';
  const CONFIG_KEY = '__booking_config__';
  const form = document.getElementById('booking-form');
  const servicesRoot = document.getElementById('services');
  const breedSelect = document.getElementById('breed');
  const dateInput = document.getElementById('booking-date');
  const timeSelect = document.getElementById('booking-time');
  const availabilityMessage = document.getElementById('availability-message');
  const formMessage = document.getElementById('form-message');
  const submitButton = document.getElementById('submit-button');

  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  let config = { breeds: { dog: [], cat: [] }, services: [] };
  let appointments = [];
  let hours = {};

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

  async function api(path, options = {}) {
    const response = await fetch(API + path, {
      credentials: 'include',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    let data = {};
    try { data = await response.json(); } catch {}
    if (!response.ok) throw new Error(data.error || `API ${response.status}`);
    return data;
  }

  function setMessage(element, text, type = '') {
    element.className = type ? `message ${type}` : 'message';
    element.textContent = text || '';
  }

  async function loadConfig() {
    try {
      const data = await api('/hours?booking_config=' + Date.now());
      const raw = data && data[CONFIG_KEY];
      if (raw) {
        const saved = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (saved && typeof saved === 'object') {
          if (saved.breeds) config.breeds = saved.breeds;
          if (Array.isArray(saved.services)) config.services = saved.services;
        }
      }
    } catch (error) {
      // The same defaults used by the cabinet keep the public form usable if config cannot be read.
      config = {
        breeds: {
          dog: [['Йоркширський тер’єр'],['Померанський шпіц'],['Шпіц німецький'],['Мальтіпу'],['Мальтезе'],['Той-пудель'],['Чихуахуа'],['Той-тер’єр'],['Пекінес'],['Ши-тцу'],['Французький бульдог'],['Мопс'],['Інша порода']],
          cat: [['Британська короткошерста'],['Шотландська висловуха'],['Мейн-кун'],['Сибірська'],['Перська'],['Бенгальська'],['Сфінкс'],['Регдол'],['Абіссінська'],['Бірманська'],['Дворова / метис'],['Інша порода']]
        },
        services: [
          {id:'complex',title:'Комплекс'},
          {id:'hygiene',title:'Гігієна'},
          {id:'adaptive',title:'Адаптація'},
          {id:'pomeranian-shedding-bath',title:'Вичісування линяючої шерсті шпіца + купання'},
          {id:'pomeranian-shedding',title:'Вичісування линяючої шерсті шпіца'},
          {id:'mat-removal',title:'Вичісування ковтунів'},
          {id:'mat-shaving',title:'Збривання ковтунів'},
          {id:'bath-up-to-10kg',title:'Купання до 10 кг'},
          {id:'teeth-hygiene',title:'Гігієна зубів'},
          {id:'eye-hygiene',title:'Гігієна очей'}
        ]
      };
    }
  }

  function renderServices() {
    const list = Array.isArray(config.services) ? config.services : [];
    servicesRoot.innerHTML = list.length ? list.map(service => `
      <label class="service-option">
        <input type="checkbox" name="services" value="${esc(service.title)}">
        <span><b>${esc(service.title)}</b><small>Послуга Royal Pet</small></span><i>›</i>
      </label>`).join('') : '<div class="loading-state">Послуги ще не налаштовані в кабінеті.</div>';
  }

  function renderBreeds() {
    const type = form.querySelector('input[name="pet_type"]:checked')?.value === 'Кіт' ? 'cat' : 'dog';
    const list = Array.isArray(config.breeds?.[type]) ? config.breeds[type] : [];
    const current = breedSelect.value;
    breedSelect.innerHTML = '<option value="">Оберіть породу</option>' + list.map(item => {
      const value = Array.isArray(item) ? item[0] : item;
      return `<option value="${esc(value)}">${esc(value)}</option>`;
    }).join('');
    if ([...breedSelect.options].some(o => o.value === current)) breedSelect.value = current;
  }

  function parseHours(value) {
    const text = String(value || '');
    if (/вихідний|закрит/i.test(text)) return { closed: true, from: '09:00', to: '19:00' };
    const match = text.match(/(\d{1,2}:\d{2})\s*[–—-]\s*(\d{1,2}:\d{2})/);
    return { closed: false, from: match?.[1] || '09:00', to: match?.[2] || '19:00' };
  }

  function toMinutes(value) {
    const [h, m] = String(value).split(':').map(Number);
    return h * 60 + m;
  }

  function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function appointmentDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function sameDay(value, dateKey) {
    const date = appointmentDate(value);
    return date ? formatDateKey(date) === dateKey : false;
  }

  function renderTimeSlots() {
    const dateKey = dateInput.value;
    timeSelect.innerHTML = '<option value="">Оберіть доступний час</option>';
    if (!dateKey) return;

    const selected = new Date(dateKey + 'T12:00:00');
    const schedule = parseHours(hours[days[selected.getDay()]]);
    if (schedule.closed) {
      timeSelect.innerHTML = '<option value="">Цього дня вихідний</option>';
      setMessage(availabilityMessage, 'У цей день Royal Pet не працює. Оберіть іншу дату.', 'error');
      return;
    }

    const now = new Date();
    const todayKey = formatDateKey(now);
    const minToday = now.getHours() * 60 + now.getMinutes();
    const start = toMinutes(schedule.from);
    const end = toMinutes(schedule.to);
    const busy = appointments
      .filter(a => a.status !== 'cancelled' && sameDay(a.preferred_time, dateKey))
      .map(a => {
        const d = appointmentDate(a.preferred_time);
        return d ? d.getHours() * 60 + d.getMinutes() : null;
      })
      .filter(v => v !== null);

    let count = 0;
    for (let minute = start; minute < end; minute += 30) {
      if (dateKey === todayKey && minute <= minToday) continue;
      if (busy.includes(minute)) continue;
      const hh = String(Math.floor(minute / 60)).padStart(2, '0');
      const mm = String(minute % 60).padStart(2, '0');
      const value = `${hh}:${mm}`;
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      timeSelect.appendChild(option);
      count++;
    }

    setMessage(availabilityMessage, count ? `Доступно часу: ${count}. Зайняті слоти приховані.` : 'На цю дату вільного часу немає. Оберіть іншу дату.', count ? 'success' : 'error');
  }

  async function loadAvailability() {
    const dateKey = dateInput.value;
    timeSelect.innerHTML = '<option value="">Завантажуємо час…</option>';
    try {
      const [hoursData, appointmentsData] = await Promise.all([api('/hours'), api('/appointments')]);
      hours = hoursData || {};
      appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
      renderTimeSlots();
    } catch (error) {
      timeSelect.innerHTML = '<option value="">Не вдалося завантажити час</option>';
      setMessage(availabilityMessage, 'Не вдалося завантажити графік. Спробуйте оновити сторінку.', 'error');
    }
  }

  function setMinimumDate() {
    const now = new Date();
    dateInput.min = formatDateKey(now);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = formatDateKey(tomorrow);
  }

  async function submitBooking(event) {
    event.preventDefault();
    setMessage(formMessage, '');
    if (!form.reportValidity()) return;

    const selectedServices = [...form.querySelectorAll('input[name="services"]:checked')].map(input => input.value);
    if (!selectedServices.length) {
      setMessage(formMessage, 'Будь ласка, оберіть хоча б одну послугу.', 'error');
      servicesRoot.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!timeSelect.value) {
      setMessage(formMessage, 'Будь ласка, оберіть доступний час.', 'error');
      timeSelect.focus();
      return;
    }

    const dateTime = new Date(`${dateInput.value}T${timeSelect.value}:00`);
    if (Number.isNaN(dateTime.getTime())) {
      setMessage(formMessage, 'Не вдалося визначити дату та час.', 'error');
      return;
    }

    const petType = form.querySelector('input[name="pet_type"]:checked')?.value || 'Собака';
    const payload = {
      pet_name: form.elements.pet_name.value.trim(),
      age: form.elements.pet_age.value.trim(),
      breed: form.elements.breed.value.trim(),
      owner_name: form.elements.owner_name.value.trim(),
      owner_contact: form.elements.phone.value.trim(),
      preferred_time: dateTime.toISOString(),
      additional_services: selectedServices.join(', '),
      home_care: `Вид тварини: ${petType}; Розмір: ${form.elements.size.value.trim()}`,
      comment: form.elements.comment.value.trim()
    };

    submitButton.disabled = true;
    submitButton.classList.add('is-loading');
    submitButton.querySelector('span').textContent = '…';
    setMessage(formMessage, 'Надсилаємо заявку…');

    try {
      await api('/appointments', { method: 'POST', body: JSON.stringify(payload) });
      setMessage(formMessage, 'Заявку успішно надіслано ✓ Вона вже з’явилася в кабінеті Royal Pet у розділі «Записи».', 'success');
      form.reset();
      form.querySelector('input[name="pet_type"][value="Собака"]').checked = true;
      renderBreeds();
      setMinimumDate();
      await loadAvailability();
      window.scrollTo({ top: document.getElementById('form-message').getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
    } catch (error) {
      setMessage(formMessage, `Не вдалося надіслати заявку: ${error.message}`, 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.classList.remove('is-loading');
      submitButton.querySelector('span').textContent = '→';
    }
  }

  async function init() {
    setMinimumDate();
    await loadConfig();
    renderServices();
    renderBreeds();
    form.querySelectorAll('input[name="pet_type"]').forEach(input => input.addEventListener('change', renderBreeds));
    dateInput.addEventListener('change', loadAvailability);
    form.addEventListener('submit', submitBooking);
    await loadAvailability();
  }

  init();
})();
