(()=>{
'use strict';
const API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
const STORAGE_KEY='__booking_config__';
const DEFAULTS={
 breeds:{
  dog:[['Йоркширський тер’єр'],['Померанський шпіц'],['Шпіц німецький'],['Мальтіпу'],['Мальтезе'],['Той-пудель'],['Чихуахуа'],['Той-тер’єр'],['Пекінес'],['Ши-тцу'],['Французький бульдог'],['Мопс'],['Джек-рассел-тер’єр'],['Кавалер-кінг-чарльз-спанієль'],['Кокер-спанієль'],['Бігль'],['Шарпей'],['Бордер-колі'],['Австралійська вівчарка'],['Самоїд'],['Середній пудель'],['Басенджі'],['Лабрадор-ретривер'],['Золотистий ретривер'],['Німецька вівчарка'],['Хаскі'],['Маламут'],['Доберман'],['Ротвейлер'],['Боксер'],['Далматинець'],['Великий пудель'],['Бернський зенненхунд'],['Ньюфаундленд'],['Алабай'],['Інша порода']],
  cat:[['Британська короткошерста'],['Шотландська висловуха'],['Мейн-кун'],['Сибірська'],['Перська'],['Бенгальська'],['Сфінкс'],['Регдол'],['Абіссінська'],['Бірманська'],['Норвезька лісова'],['Орієнтальна'],['Дворова / метис'],['Інша порода']]
 },
 dogServices:[
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
 ],
 catServices:[
  {id:'cat-full-grooming',title:'Комплексний грумінг кота'},
  {id:'cat-hygiene',title:'Гігієнічний грумінг кота'},
  {id:'cat-bath',title:'Купання та сушка кота'},
  {id:'cat-combing',title:'Вичісування кота'},
  {id:'cat-mats',title:'Вичісування ковтунів у кота'},
  {id:'cat-claws',title:'Підстригання кігтів'},
  {id:'cat-eyes',title:'Гігієна очей та вух'}
 ]
};
const clone=x=>JSON.parse(JSON.stringify(x));
const esc=v=>String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]));
const slug=v=>String(v||'service').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60)||('service-'+Date.now());
function animalOf(x){const s=String(x?.animal||x?.pet_type||x?.animal_type||'').toLowerCase().trim();if(s==='cat'||s==='cats'||s==='кіт'||s==='коти'||s==='котик'||s==='котики')return'cat';if(s==='dog'||s==='dogs'||s==='собака'||s==='собаки'||s==='пес')return'dog';return''}
async function getConfig(){
 let cfg=clone(DEFAULTS);if(!API)return cfg;
 try{const r=await fetch(API+'/hours?booking_config='+Date.now(),{credentials:'include',cache:'no-store'});if(r.ok){const d=await r.json();if(d&&d[STORAGE_KEY]){const saved=typeof d[STORAGE_KEY]==='string'?JSON.parse(d[STORAGE_KEY]):d[STORAGE_KEY];if(saved&&typeof saved==='object'){
  if(saved.breeds&&typeof saved.breeds==='object'){for(const kind of ['dog','cat'])if(Array.isArray(saved.breeds[kind]))cfg.breeds[kind]=saved.breeds[kind].map(x=>Array.isArray(x)?[String(x[0]??'')]:[String(x??'')]).filter(x=>x[0].trim())}
  if(Array.isArray(saved.services)){
   const normalized=saved.services.map(x=>({id:String(x?.id||slug(x?.title||'service')),title:String(x?.title||'').trim(),animal:animalOf(x)})).filter(x=>x.title);
   const hasAnimals=normalized.some(x=>x.animal);
   if(hasAnimals){cfg.dogServices=normalized.filter(x=>x.animal==='dog').map(x=>({id:x.id,title:x.title}));cfg.catServices=normalized.filter(x=>x.animal==='cat').map(x=>({id:x.id,title:x.title}))}
   else cfg.dogServices=normalized.map(x=>({id:x.id,title:x.title}));
  }
  if(Array.isArray(saved.dogServices))cfg.dogServices=saved.dogServices.map(x=>({id:String(x?.id||slug(x?.title||'service')),title:String(x?.title||'')})).filter(x=>x.title.trim());
  if(Array.isArray(saved.catServices))cfg.catServices=saved.catServices.map(x=>({id:String(x?.id||slug(x?.title||'service')),title:String(x?.title||'')})).filter(x=>x.title.trim());
 }}}}catch{}return cfg;
}
function root(){return document.getElementById('view-booking-settings')}
function installNav(){const nav=document.querySelector('.sidebar nav');if(!nav)return;let b=nav.querySelector('[data-view="booking-settings"]');if(!b){b=document.createElement('button');b.className='nav-item';b.dataset.view='booking-settings';b.innerHTML='✎ <span>Запис</span>';nav.appendChild(b)}}
function css(){if(document.getElementById('booking-settings-style'))return;const s=document.createElement('style');s.id='booking-settings-style';s.textContent=`.bs-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:18px}.bs-card{background:var(--card,#171717);border:1px solid rgba(215,173,85,.16);border-radius:16px;padding:18px;margin-bottom:16px}.bs-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;margin-top:10px}.bs-row input{width:100%;box-sizing:border-box}.bs-actions{display:flex;gap:6px}.bs-muted{opacity:.62;font-size:.85rem}.bs-empty{padding:14px;border:1px dashed rgba(215,173,85,.2);border-radius:12px;opacity:.65}.bs-section-title{display:flex;justify-content:space-between;align-items:center;gap:12px}.bs-save{position:sticky;top:12px;z-index:5}.bs-service-note{margin:8px 0 14px;opacity:.68;font-size:.86rem}.bs-service-list{margin-top:8px}@media(max-width:700px){.bs-head{flex-direction:column}.bs-row{grid-template-columns:1fr}.bs-actions{justify-content:flex-end}.bs-save{position:static}}`;document.head.appendChild(s)}
function field(v){return `<input class="bs-name" value="${esc(v)}" placeholder="Назва послуги">`}
function normalizeList(arr,animal){return(Array.isArray(arr)?arr:[]).map(x=>({id:String(x?.id||slug(x?.title||'service')),title:String(x?.title||'').trim(),animal})).filter(x=>x.title)}
async function render(){
 const el=root();if(!el)return;css();el.innerHTML='<div class="bs-card">Завантаження налаштувань запису…</div>';const cfg=await getConfig();
 el.innerHTML=`<div class="bs-head"><div><span class="gold-label">НАЛАШТУВАННЯ ЗАПИСУ</span><h2>Породи та послуги</h2><p>Окремо налаштовуйте послуги для собак і котів. Саме ці списки відображаються клієнту у формі онлайн-запису.</p></div><button class="small-btn gold bs-save" id="bs-save">Зберегти зміни</button></div>
 <div class="bs-card"><div class="bs-section-title"><div><h3>🐶 Породи собак</h3><div class="bs-muted">Редагуйте лише назву породи.</div></div><button class="small-btn" id="bs-add-dog">+ Додати</button></div><div id="bs-dog-list"></div></div>
 <div class="bs-card"><div class="bs-section-title"><div><h3>🐱 Породи котів</h3><div class="bs-muted">Редагуйте лише назву породи.</div></div><button class="small-btn" id="bs-add-cat">+ Додати</button></div><div id="bs-cat-list"></div></div>
 <div class="bs-card"><div class="bs-section-title"><div><h3>🐶 Послуги для собак</h3><button class="small-btn" id="bs-add-dog-service">+ Додати послугу</button></div></div><div class="bs-service-note">Цей список показується на сторінці запису, коли клієнт обирає собаку.</div><div id="bs-dog-service-list" class="bs-service-list"></div></div>
 <div class="bs-card"><div class="bs-section-title"><div><h3>🐱 Послуги для котів</h3><button class="small-btn" id="bs-add-cat-service">+ Додати послугу</button></div></div><div class="bs-service-note">Цей список показується на сторінці запису, коли клієнт обирає кота.</div><div id="bs-cat-service-list" class="bs-service-list"></div></div>
 <div id="bs-msg" class="save-message"></div>`;
 const renderBreeds=kind=>{const list=el.querySelector('#bs-'+kind+'-list'),arr=cfg.breeds[kind]||[];list.innerHTML=arr.length?arr.map((x,i)=>`<div class="bs-row" data-i="${i}">${field(Array.isArray(x)?x[0]:x)}<div class="bs-actions"><button type="button" class="small-btn bs-up">↑</button><button type="button" class="small-btn bs-down">↓</button><button type="button" class="small-btn" data-remove="1">×</button></div></div>`).join(''):'<div class="bs-empty">Список порожній.</div>';
  list.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{cfg.breeds[kind].splice(Number(b.closest('.bs-row').dataset.i),1);renderBreeds(kind)});
  list.querySelectorAll('.bs-up').forEach(b=>b.onclick=()=>{const i=Number(b.closest('.bs-row').dataset.i);if(i>0){[cfg.breeds[kind][i-1],cfg.breeds[kind][i]]=[cfg.breeds[kind][i],cfg.breeds[kind][i-1]];renderBreeds(kind)}});
  list.querySelectorAll('.bs-down').forEach(b=>b.onclick=()=>{const i=Number(b.closest('.bs-row').dataset.i);if(i<cfg.breeds[kind].length-1){[cfg.breeds[kind][i+1],cfg.breeds[kind][i]]=[cfg.breeds[kind][i],cfg.breeds[kind][i+1]];renderBreeds(kind)}});
 };
 const renderServices=(kind)=>{const list=el.querySelector('#bs-'+kind+'-service-list'),arr=cfg[kind+'Services']||[];list.innerHTML=arr.length?arr.map((x,i)=>`<div class="bs-row" data-i="${i}">${field(x.title)}<div class="bs-actions"><button type="button" class="small-btn bs-up">↑</button><button type="button" class="small-btn bs-down">↓</button><button type="button" class="small-btn" data-remove="1">×</button></div></div>`).join(''):'<div class="bs-empty">Список послуг порожній.</div>';
  list.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{cfg[kind+'Services'].splice(Number(b.closest('.bs-row').dataset.i),1);renderServices(kind)});
  list.querySelectorAll('.bs-up').forEach(b=>b.onclick=()=>{const i=Number(b.closest('.bs-row').dataset.i);if(i>0){[cfg[kind+'Services'][i-1],cfg[kind+'Services'][i]]=[cfg[kind+'Services'][i],cfg[kind+'Services'][i-1]];renderServices(kind)}});
  list.querySelectorAll('.bs-down').forEach(b=>b.onclick=()=>{const i=Number(b.closest('.bs-row').dataset.i);if(i<cfg[kind+'Services'].length-1){[cfg[kind+'Services'][i+1],cfg[kind+'Services'][i]]=[cfg[kind+'Services'][i],cfg[kind+'Services'][i+1]];renderServices(kind)}});
 };
 const addBreed=kind=>{cfg.breeds[kind].push(['Нова порода']);renderBreeds(kind);setTimeout(()=>{const input=el.querySelector('#bs-'+kind+'-list .bs-row:last-child .bs-name');input?.focus();input?.select()},0)};
 const addService=kind=>{cfg[kind+'Services'].push({id:slug(kind+'-service-'+Date.now()),title:'Нова послуга'});renderServices(kind);setTimeout(()=>{const input=el.querySelector('#bs-'+kind+'-service-list .bs-row:last-child .bs-name');input?.focus();input?.select()},0)};
 el.querySelector('#bs-add-dog').onclick=()=>addBreed('dog');el.querySelector('#bs-add-cat').onclick=()=>addBreed('cat');el.querySelector('#bs-add-dog-service').onclick=()=>addService('dog');el.querySelector('#bs-add-cat-service').onclick=()=>addService('cat');
 renderBreeds('dog');renderBreeds('cat');renderServices('dog');renderServices('cat');
 el.addEventListener('input',e=>{const row=e.target.closest('.bs-row');if(!row)return;const i=Number(row.dataset.i);if(row.closest('#bs-dog-list'))cfg.breeds.dog[i]=[row.querySelector('.bs-name').value];else if(row.closest('#bs-cat-list'))cfg.breeds.cat[i]=[row.querySelector('.bs-name').value];else if(row.closest('#bs-dog-service-list'))cfg.dogServices[i].title=row.querySelector('.bs-name').value;else if(row.closest('#bs-cat-service-list'))cfg.catServices[i].title=row.querySelector('.bs-name').value;});
 el.querySelector('#bs-save').onclick=async()=>{const save=el.querySelector('#bs-save');save.disabled=true;save.textContent='Зберігаємо…';try{
  const used=new Set();const prepare=(arr,animal)=>normalizeList(arr,animal).map(s=>{let id=s.id,n=2;while(used.has(id)){id=`${s.id}-${n++}`}used.add(id);return{id,title:s.title,animal}});
  const dog=prepare(cfg.dogServices,'dog'),cat=prepare(cfg.catServices,'cat');
  for(const kind of ['dog','cat'])cfg.breeds[kind]=cfg.breeds[kind].map(x=>[String(Array.isArray(x)?x[0]:x).trim()]).filter(x=>x[0]);
  const payload={breeds:cfg.breeds,services:[...dog,...cat]};
  const r=await fetch(API+'/hours',{method:'PUT',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({[STORAGE_KEY]:JSON.stringify(payload)})});
  const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||'Не вдалося зберегти налаштування');el.querySelector('#bs-msg').textContent='Зміни збережено ✓';
 }catch(e){alert(e.message)}finally{save.disabled=false;save.textContent='Зберегти зміни'}};
}
function open(){installNav();const r=root();if(!r)return;document.querySelectorAll('.view').forEach(x=>x.classList.add('hidden'));r.classList.remove('hidden');document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.view==='booking-settings'));const t=document.getElementById('page-title');if(t)t.textContent='Породи та послуги для запису';render()}
function bind(){installNav();if(!root()){const main=document.querySelector('.main');if(main){const s=document.createElement('section');s.id='view-booking-settings';s.className='view hidden';main.appendChild(s)}}document.addEventListener('click',e=>{const b=e.target.closest('.nav-item[data-view="booking-settings"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();open()},true);window.royalPetOpenBookingSettings=open}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();