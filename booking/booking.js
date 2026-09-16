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
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const CAT_WORDS = ['кіт', 'коти', 'котик', 'котики', 'коты', 'cat', 'cats', 'feline'];
  let config = { breeds: { dog: [], cat: [] }, services: [], dogServices: [], catServices: [] }, appointments = [], hours = {};

  const esc = v => String(v ?? '').replace(/[&<>\"']/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#039;' }[m]));
  const text = v => String(v ?? '').trim().toLowerCase();

  async function api(path, options = {}) {
    const r = await fetch(API + path, {
      credentials: 'include',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    let d = {};
    try { d = await r.json(); } catch {}
    if (!r.ok) throw new Error(d.error || `API ${r.status}`);
    return d;
  }

  function setMessage(el, textValue, type = '') {
    el.className = type ? `message ${type}` : 'message';
    el.textContent = textValue || '';
  }

  function animalOfService(service) {
    const values = [
      service?.category,
      service?.animal,
      service?.pet_type,
      service?.animal_type,
      service?.animal_type_label,
      service?.petType,
      service?.type
    ].map(text).filter(Boolean);
    const all = values.join(' | ');
    if (CAT_WORDS.some(v => values.includes(v)) || /\b(cat|cats|feline)\b|кіт|коти|котик|котики|коты/.test(all)) return 'cat';
    if (/\b(dog|dogs|canine)\b|собак|пес/.test(all)) return 'dog';
    return 'all';
  }

  function normalizeService(service, index, animal = 'all') {
    if (typeof service === 'string') return { id: `service-${index + 1}`, title: service.trim(), animal };
    return {
      id: String(service?.id || `service-${index + 1}`),
      title: String(service?.title || service?.name || '').trim(),
      category: service?.category,
      animal: service?.animal ?? animal,
      pet_type: service?.pet_type,
      animal_type: service?.animal_type,
      animal_type_label: service?.animal_type_label,
      petType: service?.petType,
      type: service?.type,
      active: service?.active !== false
    };
  }

  async function loadConfig() {
    try {
      const d = await api('/hours?booking_config=' + Date.now());
      const raw = d && d[CONFIG_KEY];
      if (!raw) return;
      const saved = typeof raw === 'string' ? JSON.parse(raw) : raw;

      if (saved?.breeds && typeof saved.breeds === 'object') {
        for (const kind of ['dog', 'cat']) {
          if (Array.isArray(saved.breeds[kind])) {
            config.breeds[kind] = saved.breeds[kind]
              .map(x => Array.isArray(x) ? String(x[0] ?? '') : String(x ?? ''))
              .filter(Boolean);
          }
        }
      }

      // Новий формат: окремі списки послуг для собак і котів.
      if (Array.isArray(saved?.dogServices)) {
        config.dogServices = saved.dogServices
          .map((service, index) => normalizeService(service, index, 'dog'))
          .filter(service => service.title && service.active);
      }
      if (Array.isArray(saved?.catServices)) {
        config.catServices = saved.catServices
          .map((service, index) => normalizeService(service, index, 'cat'))
          .filter(service => service.title && service.active);
      }

      // Старий формат services залишаємо для сумісності.
      if (Array.isArray(saved?.services)) {
        config.services = saved.services
          .map((service, index) => normalizeService(service, index))
          .filter(service => service.title && service.active);
      }
    } catch (error) {
      console.error('[Royal Pet] Не вдалося завантажити налаштування запису:', error);
    }
  }

  function renderServices() {
    const petType = form.querySelector('input[name="pet_type"]:checked')?.value === 'Кіт' ? 'cat' : 'dog';

    // Спочатку використовуємо нові окремі списки з кабінету.
    let list = petType === 'cat' ? config.catServices : config.dogServices;

    // Якщо окремий список ще не збережений — використовуємо старий services.
    if (!Array.isArray(list) || !list.length) {
      list = (Array.isArray(config.services) ? config.services : []).filter(service => {
        const animal = animalOfService(service);
        return animal === 'all' || animal === petType;
      });
    }

    const visible = list.filter(service => service && service.title && service.active !== false);

    servicesRoot.innerHTML = visible.length
      ? visible.map(service => `<label class="service-option"><input type="checkbox" name="services" value="${esc(service.title)}"><span><b>${esc(service.title)}</b><small>${petType === 'cat' ? 'Royal Pet · догляд за котиком' : 'Royal Pet · догляд за улюбленцем'}</small></span><i>›</i></label>`).join('')
      : '<div class="loading-state">У кабінеті ще не додано послуг для цього типу тварини.</div>';
  }

  function renderBreeds() {
    const type = form.querySelector('input[name="pet_type"]:checked')?.value === 'Кіт' ? 'cat' : 'dog';
    const list = Array.isArray(config.breeds?.[type]) ? config.breeds[type] : [];
    breedSelect.innerHTML = '<option value="">Оберіть породу</option>' + list.map(value => `<option value="${esc(value)}">${esc(value)}</option>`).join('');
  }

  function parseHours(v) {
    const t = String(v || '');
    if (/вихідний|закрит/i.test(t)) return { closed: true, from: '09:00', to: '19:00' };
    const m = t.match(/(\d{1,2}:\d{2})\s*[–—-]\s*(\d{1,2}:\d{2})/);
    return { closed: false, from: m?.[1] || '09:00', to: m?.[2] || '19:00' };
  }

  const mins = v => { const [a, b] = String(v).split(':').map(Number); return a * 60 + b; };
  function dateKey(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
  function asDate(v) { const d = new Date(v); return Number.isNaN(d.getTime()) ? null : d; }
  function sameDay(v, key) { const d = asDate(v); return d ? dateKey(d) === key : false; }

  function renderTimeSlots() {
    const key = dateInput.value;
    timeSelect.innerHTML = '<option value="">Оберіть доступний час</option>';
    if (!key) return;
    const selected = new Date(key + 'T12:00:00');
    const schedule = parseHours(hours[`date:${key}`] ?? hours[days[selected.getDay()]]);
    if (schedule.closed) {
      timeSelect.innerHTML = '<option value="">Цього дня вихідний</option>';
      setMessage(availabilityMessage, 'У цей день Royal Pet не працює. Оберіть іншу дату.', 'error');
      return;
    }
    const now = new Date(), today = dateKey(now), current = now.getHours() * 60 + now.getMinutes();
    const start = mins(schedule.from), end = mins(schedule.to);
    const busy = appointments
      .filter(a => !/cancelled|canceled/i.test(String(a.status || '')) && sameDay(a.preferred_time, key))
      .map(a => { const d = asDate(a.preferred_time); return d ? d.getHours() * 60 + d.getMinutes() : null; })
      .filter(v => v !== null);
    let count = 0;
    for (let m = start; m < end; m += 30) {
      if (key === today && m <= current) continue;
      if (busy.includes(m)) continue;
      const value = `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
      const o = document.createElement('option');
      o.value = value;
      o.textContent = value;
      timeSelect.appendChild(o);
      count++;
    }
    setMessage(availabilityMessage, count ? `Доступно годин для запису: ${count}.` : 'На цю дату вільного часу немає. Оберіть іншу дату.', count ? 'success' : 'error');
  }

  async function loadAvailability() {
    timeSelect.innerHTML = '<option value="">Завантажуємо доступний час…</option>';
    setMessage(availabilityMessage, '');
    try {
      const [h, a] = await Promise.all([api('/hours'), api('/appointments')]);
      hours = h || {};
      appointments = Array.isArray(a) ? a : [];
      renderTimeSlots();
    } catch {
      timeSelect.innerHTML = '<option value="">Не вдалося завантажити час</option>';
      setMessage(availabilityMessage, 'Не вдалося завантажити графік. Спробуйте оновити сторінку.', 'error');
    }
  }

  function setMinimumDate() {
    const now = new Date();
    dateInput.min = dateKey(now);
    if (!dateInput.value || dateInput.value < dateInput.min) {
      const d = new Date(now);
      d.setDate(d.getDate() + 1);
      dateInput.value = dateKey(d);
    }
  }

  async function submitBooking(e) {
    e.preventDefault();
    setMessage(formMessage, '');
    if (!form.reportValidity()) return;

    const selected = [...form.querySelectorAll('input[name="services"]:checked')].map(i => i.value);
    if (!selected.length) {
      setMessage(formMessage, 'Будь ласка, оберіть хоча б одну послугу.', 'error');
      servicesRoot.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!timeSelect.value) {
      setMessage(formMessage, 'Будь ласка, оберіть доступний час.', 'error');
      timeSelect.focus();
      return;
    }

    const preferredTime = `${dateInput.value}T${timeSelect.value}`;
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(preferredTime)) {
      setMessage(formMessage, 'Не вдалося визначити дату та час.', 'error');
      return;
    }

    const type = form.querySelector('input[name="pet_type"]:checked')?.value || 'Собака';
    const payload = {
      pet_name: form.elements.pet_name.value.trim(),
      age: form.elements.pet_age.value.trim(),
      breed: form.elements.breed.value.trim(),
      owner_name: form.elements.owner_name.value.trim(),
      owner_contact: form.elements.phone.value.trim(),
      preferred_time: preferredTime,
      additional_services: selected.join(', '),
      home_care: `Вид тварини: ${type}`,
      comment: form.elements.comment.value.trim()
    };

    submitButton.disabled = true;
    submitButton.classList.add('is-loading');
    submitButton.querySelector('span').textContent = '…';
    setMessage(formMessage, 'Надсилаємо заявку…');

    try {
      const fresh = await api('/appointments');
      const currentBusy = (Array.isArray(fresh) ? fresh : [])
        .filter(a => !/cancelled|canceled/i.test(String(a.status || '')))
        .some(a => {
          const d = asDate(a.preferred_time);
          return d && sameDay(a.preferred_time, dateInput.value) &&
            `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` === timeSelect.value;
        });
      if (currentBusy) throw new Error('Цей час щойно зайняли. Оберіть інший.');

      await api('/appointments', { method: 'POST', body: JSON.stringify(payload) });
      setMessage(formMessage, 'Заявку успішно надіслано ✓ Вона вже з’явилася в кабінеті Royal Pet у розділі «Записи».', 'success');
      form.reset();
      form.querySelector('input[name="pet_type"][value="Собака"]').checked = true;
      renderBreeds();
      renderServices();
      setMinimumDate();
      await loadAvailability();
      window.scrollTo({ top: document.getElementById('form-message').getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
    } catch (err) {
      const message = String(err?.message || 'Не вдалося надіслати заявку.');
      setMessage(formMessage, message === 'invalid_or_unavailable_time' ? 'Цей час більше недоступний. Оберіть інший.' : `Не вдалося надіслати заявку: ${message}`, 'error');
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
    form.querySelectorAll('input[name="pet_type"]').forEach(input => input.addEventListener('change', () => {
      renderBreeds();
      renderServices();
    }));
    dateInput.addEventListener('change', loadAvailability);
    form.addEventListener('submit', submitBooking);
    await loadAvailability();
  }

  init();
})();
