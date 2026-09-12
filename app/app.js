(()=>{

const ADMIN_API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
const CUSTOMER_API=(window.ROYAL_PET_CUSTOMER_API||ADMIN_API||'').replace(/\/$/,'');
const STORE='royal_pet_customer';

const breeds={
  dog:['Йоркширський тер’єр','Померанський шпіц','Мальтіпу','Мальтезе','Той-пудель','Чихуахуа','Ши-тцу','Французький бульдог','Мопс','Кокер-спанієль','Бігль','Бордер-колі','Самоїд','Лабрадор-ретривер','Золотистий ретривер','Німецька вівчарка','Хаскі','Маламут','Ротвейлер','Великий пудель','Інша порода'],
  cat:['Британська короткошерста','Шотландська висловуха','Мейн-кун','Сибірська','Перська','Бенгальська','Сфінкс','Регдол','Абіссінська','Бірманська','Норвезька лісова','Дворова / метис','Інша порода']
};

let services=[
  ['complex','Комплекс'],['hygiene','Гігієна'],['adaptive','Адаптація'],
  ['pomeranian-shedding-bath','Вичісування + купання'],['mat-removal','Вичісування ковтунів'],
  ['mat-shaving','Збривання ковтунів'],['bath-up-to-10kg','Купання до 10 кг'],
  ['teeth-hygiene','Гігієна зубів'],['eye-hygiene','Гігієна очей']
];

let step=1;
let chosenTime='';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const read=()=>{try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch{return {}}};
const write=data=>localStorage.setItem(STORE,JSON.stringify(data));
function today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function getCustomerToken(){return localStorage.getItem('royal_pet_customer_session')||''}

async function loadBookingConfig(){
  if(!ADMIN_API)return;
  try{
    const r=await fetch(`${ADMIN_API}/public/hours?booking_config=${Date.now()}`,{cache:'no-store'});
    if(!r.ok)return;
    const data=await r.json();
    const raw=data?.__booking_config__;
    const cfg=typeof raw==='string'?JSON.parse(raw):raw;
    if(!cfg||typeof cfg!=='object')return;
    for(const kind of ['dog','cat']){
      if(Array.isArray(cfg.breeds?.[kind])){
        const next=cfg.breeds[kind].map(x=>Array.isArray(x)?String(x[0]??'').trim():String(x??'').trim()).filter(Boolean);
        if(next.length)breeds[kind]=next;
      }
    }
    if(Array.isArray(cfg.services)){
      const next=cfg.services.map(x=>[String(x?.id||''),String(x?.title||'').trim()]).filter(x=>x[0]&&x[1]);
      if(next.length)services=next;
    }
  }catch{}
}

function show(n){
  step=n;
  document.querySelectorAll('.step').forEach(x=>x.classList.toggle('hidden',+x.dataset.step!==n));
  ['p1','p2','p3'].forEach((id,i)=>$(id)?.classList.toggle('active',i<n));
  if(n===3)summary();
}
function summary(){
  $('summary').innerHTML=`<b>${$('pet').value}</b> · ${$('animal').value==='dog'?'собака':'кіт'}<br>${$('breed').value}<br>Послуги: ${[...document.querySelectorAll('.service.selected')].map(x=>x.dataset.name).join(', ')||'—'}<br>Час: ${chosenTime||'—'}`;
}
function renderServices(){
  $('services').innerHTML=services.map(([id,name])=>`<label class="service" data-id="${id}" data-name="${name}"><input type="checkbox" value="${id}">${name}</label>`).join('');
  document.querySelectorAll('.service').forEach(x=>{x.onclick=e=>{e.preventDefault();x.classList.toggle('selected');const input=x.querySelector('input');if(input)input.checked=x.classList.contains('selected')}});
}
function renderBreeds(){
  const animal=$('animal').value;const list=breeds[animal]||[];
  $('breed').innerHTML='<option value="">Оберіть породу</option>'+list.map(x=>`<option>${esc(x)}</option>`).join('');
}
async function loadSlots(){
  const date=$('date').value,root=$('slots');root.innerHTML='';chosenTime='';if(!date)return;
  try{
    const h=await fetch(`${ADMIN_API}/public/hours?sync=${Date.now()}`,{cache:'no-store'}).then(r=>r.json());
    const raw=String(h?.[`date:${date}`]??'').trim();
    const m=[...raw.matchAll(/(\d{1,2}):(\d{2})\s*[–—-]\s*(\d{1,2}):(\d{2})/g)];
    if(!m.length){root.textContent='На цю дату запис недоступний.';return}
    const busy=await fetch(`${ADMIN_API}/public/availability?date=${date}&sync=${Date.now()}`,{cache:'no-store'}).then(r=>r.ok?r.json():{}).catch(()=>({}));
    const used=new Set((busy.slots||[]).filter(x=>x.status==='busy').map(x=>x.time));
    m.forEach(x=>{const t=x[1].padStart(2,'0')+':'+x[2],b=document.createElement('button');b.type='button';b.className='slot';b.textContent=t;if(used.has(t)){b.disabled=true;b.classList.add('busy')}b.onclick=()=>{document.querySelectorAll('.slot').forEach(z=>z.classList.remove('selected'));b.classList.add('selected');chosenTime=t};root.append(b)});
  }catch{root.textContent='Не вдалося завантажити вільний час. Оновіть сторінку.'}
}
function saveAppointment(payload,serverAppointment=null){
  const data=read();data.appointments=Array.isArray(data.appointments)?data.appointments:[];
  const item=serverAppointment||{id:Date.now(),pet_name:payload.pet_name,animal_type:payload.animal_type,breed:payload.breed,age:payload.age,owner_name:payload.owner_name,owner_contact:payload.owner_contact,preferred_time:payload.preferred_time,services:payload.additional_services,status:'Нова заявка',created_at:new Date().toISOString()};
  data.appointments.unshift(item);data.profile={...(data.profile||{}),name:payload.owner_name,phone:payload.owner_contact};
  const pets=Array.isArray(data.pets)?data.pets:[];const key=String(payload.pet_name||'').trim().toLowerCase();
  if(key){const i=pets.findIndex(p=>String(p?.pet_name||'').trim().toLowerCase()===key);const p={pet_name:String(payload.pet_name||'').trim(),animal_type:payload.animal_type||'dog',breed:payload.breed||'',age:payload.age||''};if(i<0)pets.push(p);else pets[i]={...pets[i],...p};data.pets=pets}
  write(data);
}

function getSavedPets(){const data=read();return Array.isArray(data.pets)?data.pets:[]}
function applyPet(p){
  if(!p)return;
  $('animal').value=p.animal_type||'dog';renderBreeds();
  $('pet').value=p.pet_name||'';$('age').value=p.age||'';
  $('breed').value=p.breed||'';
}
function renderPetPicker(){
  const stepRoot=document.querySelector('.step[data-step="1"]');if(!stepRoot)return;
  let box=document.getElementById('booking-pet-picker');
  if(!box){box=document.createElement('div');box.id='booking-pet-picker';box.className='booking-pet-picker';const title=stepRoot.querySelector('h2');title?.insertAdjacentElement('afterend',box)}
  const pets=getSavedPets();
  box.innerHTML=`<div class="booking-pet-picker-head"><span>Швидкий вибір</span>${pets.length?'<button type="button" class="picker-new">+ Новий</button>':''}</div>`+
    (pets.length?`<div class="booking-pet-picker-list">${pets.map((p,i)=>`<button type="button" class="booking-pet-option" data-index="${i}"><span class="pet-icon">${p.animal_type==='cat'?'🐱':'🐶'}</span><span><b>${esc(p.pet_name)}</b><small>${esc(p.breed||'Порода не вказана')}</small></span></button>`).join('')}</div>`:'<div class="booking-pet-picker-empty">У вас ще немає збережених улюбленців. Після першого запису він з’явиться тут.</div>');
  box.querySelector('.picker-new')?.addEventListener('click',()=>{ $('animal').value='';renderBreeds();$('pet').value='';$('breed').value='';$('age').value=''; });
  box.querySelectorAll('.booking-pet-option').forEach(btn=>btn.addEventListener('click',()=>{const p=pets[+btn.dataset.index];applyPet(p);box.querySelectorAll('.booking-pet-option').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected')}));
}

window.renderCustomerAppointments=window.renderCustomerAppointments||(()=>{});
window.renderCustomerProfile=window.renderCustomerProfile||(()=>{});

$('profile-form')?.addEventListener('submit',e=>{e.preventDefault();const data=read();data.profile={name:$('profile-name').value.trim(),phone:$('profile-phone').value.trim()};write(data);$('profile-message').textContent='✅ Профіль збережено';setTimeout(()=>$('profile-message').textContent='',1800)});
$('start')?.addEventListener('click',()=>{location.hash='booking';window.dispatchEvent(new HashChangeEvent('hashchange'));$('booking')?.scrollIntoView({behavior:'smooth'});setTimeout(renderPetPicker,80)});
$('newBooking')?.addEventListener('click',()=>{location.hash='booking';window.dispatchEvent(new HashChangeEvent('hashchange'));setTimeout(renderPetPicker,80)});
$('animal')?.addEventListener('change',renderBreeds);
$('date').min=today();if(!$('date').value)$('date').value=today();$('date').addEventListener('change',loadSlots);

document.querySelectorAll('.next').forEach(b=>{b.onclick=()=>{if(step===1){const s=document.querySelector('.step[data-step="1"]');if(!s.querySelector('input:invalid,select:invalid'))show(2);else s.querySelector('input:invalid,select:invalid')?.reportValidity()}else if(step===2){if(!document.querySelector('.service.selected')||!chosenTime){$('message').textContent='Оберіть послугу та вільний час.';return}show(3)}}});
document.querySelectorAll('.back').forEach(b=>{b.onclick=()=>show(step-1)});

$('form')?.addEventListener('submit',async e=>{
  e.preventDefault();const message=$('message'),token=getCustomerToken();
  if(!token){message.textContent='❌ Щоб записатися, спочатку увійдіть або зареєструйте акаунт у «Мої записи».';location.hash='appointments';window.dispatchEvent(new HashChangeEvent('hashchange'));return}
  message.textContent='Надсилаємо заявку…';
  const selected=[...document.querySelectorAll('.service.selected')];
  const payload={pet_name:$('pet').value.trim(),age:$('age').value.trim(),animal_type:$('animal').value,breed:$('breed').value,owner_name:$('owner').value.trim(),owner_contact:$('phone').value.trim(),last_grooming:'Не вказано',preferred_time:`${$('date').value}T${chosenTime}`,selected_services:selected.map(x=>x.dataset.id).join(','),additional_services:selected.map(x=>x.dataset.name).join(', '),estimated_total:0,home_care:'Поки не цікавить',comment:$('comment').value.trim()};
  try{
    const r=await fetch(`${CUSTOMER_API}/customer/appointments`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(payload)});
    const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||d.details||`Помилка сервера (${r.status})`);
    saveAppointment(payload,d.appointment||null);message.textContent='✅ Запис успішно створено! Він збережений у «Мої записи»';
    setTimeout(()=>{document.getElementById('form').reset();chosenTime='';document.querySelectorAll('.service.selected').forEach(x=>x.classList.remove('selected'));show(1);renderPetPicker();location.hash='appointments';window.dispatchEvent(new HashChangeEvent('hashchange'));window.refreshCustomerAppointments?.();window.renderCustomerAppointments?.()},700);
  }catch(err){message.textContent='❌ '+(err.message||'Не вдалося створити запис.')}
});

$('animal')?.addEventListener('change',()=>{renderBreeds();});
renderServices();renderBreeds();loadSlots();
loadBookingConfig().then(()=>{renderServices();renderBreeds()});

window.applyRebookDraft=()=>{
  const raw=localStorage.getItem('royal_pet_rebook_draft');if(!raw||!$('booking')||$('booking').classList.contains('hidden'))return false;
  let draft;try{draft=JSON.parse(raw)}catch{localStorage.removeItem('royal_pet_rebook_draft');return false}
  if(draft.animal_type){$('animal').value=draft.animal_type;renderBreeds()}
  if(draft.pet_name)$('pet').value=draft.pet_name;
  if(draft.age)$('age').value=draft.age;
  if(draft.breed)$('breed').value=draft.breed;
  const names=String(draft.additional_services||'').split(',').map(x=>x.trim()).filter(Boolean);
  document.querySelectorAll('.service').forEach(card=>{const yes=names.includes(String(card.dataset.name||''));card.classList.toggle('selected',yes);const input=card.querySelector('input');if(input)input.checked=yes});
  const p=read().profile||{};if($('owner')&&!$('owner').value)$('owner').value=p.name||'';if($('phone')&&!$('phone').value)$('phone').value=p.phone||'';
  localStorage.removeItem('royal_pet_rebook_draft');renderPetPicker();return true;
};
window.addEventListener('hashchange',()=>{if(location.hash.slice(1)==='booking')setTimeout(()=>{window.applyRebookDraft?.();renderPetPicker()},60)});
setTimeout(renderPetPicker,180);
})();