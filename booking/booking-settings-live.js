(()=>{
'use strict';
const API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
const V='booking-services-20260916-v3';
const GROUP_MARKERS=new Set(['комплекс','гігієна','адаптація','адаптаційний грумінг','додаткові послуги']);
const FALLBACK={breeds:{dog:[['Йоркширський тер’єр','small'],['Померанський шпіц','small'],['Шпіц німецький','small'],['Мальтіпу','small'],['Мальтезе','small'],['Той-пудель','small'],['Чихуахуа','small'],['Той-тер’єр','small'],['Пекінес','small'],['Ши-тцу','small'],['Французький бульдог','small'],['Мопс','small'],['Джек-рассел-тер’єр','small'],['Кавалер-кінг-чарльз-спанієль','small'],['Кокер-спанієль','medium'],['Бігль','medium'],['Шарпей','medium'],['Бордер-колі','medium'],['Австралійська вівчарка','medium'],['Самоїд','medium'],['Середній пудель','medium'],['Басенджі','medium'],['Лабрадор-ретривер','large'],['Золотистий ретривер','large'],['Німецька вівчарка','large'],['Хаскі','large'],['Маламут','large'],['Доберман','large'],['Ротвейлер','large'],['Боксер','large'],['Далматинець','large'],['Великий пудель','large'],['Бернський зенненхунд','large'],['Ньюфаундленд','large'],['Алабай','large'],['Інша порода','other']],cat:[['Британська короткошерста','medium'],['Шотландська висловуха','medium'],['Мейн-кун','large'],['Сибірська','medium'],['Перська','medium'],['Бенгальська','medium'],['Сфінкс','medium'],['Регдол','medium'],['Абіссінська','small'],['Бірманська','medium'],['Норвезька лісова','large'],['Орієнтальна','small'],['Дворова / метис','medium'],['Інша порода','other']]}};
const text=v=>String(v??'').trim().toLowerCase();
const esc=v=>String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]));
function animalOf(x){
  const vals=[x?.category,x?.animal,x?.pet_type,x?.animal_type,x?.petType,x?.type].map(text).filter(Boolean);
  const joined=vals.join(' | ');
  if(vals.some(v=>['cat','cats','кіт','коти','котик','котики','коты','коти/котики','feline'].includes(v)))return'cat';
  if(/\b(cat|cats|feline)\b|кіт|коти|котик|котики|коты/.test(joined))return'cat';
  if(vals.some(v=>['dog','dogs','собака','собаки','пес','песи','песики','песик','canine'].includes(v)))return'dog';
  if(/\b(dog|dogs|canine)\b|собак|пес|песи|песик|песики/.test(joined))return'dog';
  return'';
}
function cleanServices(list){
  const seen=new Set();
  return (Array.isArray(list)?list:[]).filter(x=>x&&x.active!==false).map(x=>({
    id:String(x?.id||x?.title||''),
    title:String(x?.title||'').trim(),
    price:x?.price,
    category:x?.category,
    animal:x?.animal,
    pet_type:x?.pet_type,
    animal_type:x?.animal_type,
    group:x?.group||x?.service_group,
    description:x?.description,
    duration:x?.duration,
    order:x?.order
  })).filter(x=>x.id&&x.title&&x.title.length<180&&!GROUP_MARKERS.has(x.title.toLowerCase())).filter(x=>{const key=`${animalOf(x)}|${x.title.toLowerCase()}`;if(seen.has(key))return false;seen.add(key);return true});
}
async function loadConfig(){
  const c={...FALLBACK,services:[]};
  if(!API)return c;
  try{const r=await fetch(`${API}/public/services?booking_services=${Date.now()}`,{cache:'no-store',credentials:'omit',headers:{Accept:'application/json'}});if(r.ok){const live=await r.json();if(Array.isArray(live))c.services=cleanServices(live)}}catch(e){console.warn('[Royal Pet] booking services load',e)}
  return c;
}
function priceNumber(v){const s=String(v??'').replace(/\s/g,'').replace(',','.');const nums=s.match(/\d+(?:\.\d+)?/g);return nums?.length?Number(nums[0])||0:0}
function init(c){
  const form=document.getElementById('booking-form');
  if(!form||form.dataset.liveServicesReady===V)return;
  const animal=form.querySelector('[name="animal_type"]'),breed=form.querySelector('[name="breed"]'),service=form.querySelector('.live-service');
  if(!animal||!breed||!service)return;
  form.dataset.liveServicesReady=V;
  const menu=service.querySelector('.live-menu'),summary=service.querySelector('.live-summary-items'),trigger=service.querySelector('.live-trigger span'),selected=service.querySelector('[name="selected_services"]'),additional=service.querySelector('[name="additional_services"]'),totalField=service.querySelector('[name="estimated_total"]');
  const renderBreeds=()=>{const arr=c.breeds[animal.value]||[];breed.innerHTML='<option value="">Оберіть породу</option>'+arr.map(x=>`<option value="${esc(x[0])}" data-category="${esc(x[1])}">${esc(x[0])}</option>`).join('')};
  const availableServices=()=>animal.value?c.services.filter(x=>animalOf(x)===animal.value):[];
  const update=()=>{
    const valid=[...menu.querySelectorAll('input[type="checkbox"]:checked')].map(box=>c.services.find(x=>String(x.id)===String(box.value))).filter(x=>x&&animalOf(x)===animal.value);
    const names=valid.map(x=>x.title),sum=valid.reduce((acc,x)=>acc+priceNumber(x.price),0);
    if(selected)selected.value=valid.map(x=>x.id).join(',');
    if(additional)additional.value=names.join(', ');
    if(totalField)totalField.value=String(sum);
    if(summary)summary.textContent=names.length?names.join(' • '):'Поки нічого не обрано';
    if(trigger)trigger.textContent=names.length?`Обрано послуг: ${names.length}`:'Оберіть одну або кілька послуг';
  };
  const renderServices=()=>{
    const available=availableServices();
    menu.innerHTML='';
    if(!animal.value){menu.innerHTML='<div class="live-empty">Спочатку оберіть тип тварини</div>';update();return}
    if(!available.length){menu.innerHTML='<div class="live-empty">Для цієї тварини послуги ще не додані.</div>';update();return}
    available.slice().sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0)||a.title.localeCompare(b.title,'uk')).forEach(x=>{
      const row=document.createElement('label');
      row.className='live-row';
      row.setAttribute('data-service-id',x.id);
      const box=document.createElement('input');
      box.type='checkbox';
      box.name='service_choice';
      box.value=x.id;
      box.dataset.price=String(x.price??'');
      box.setAttribute('aria-label',x.title);
      const name=document.createElement('span');
      name.textContent=x.title;
      const price=document.createElement('span');
      price.className='live-row-price';
      price.textContent='';
      row.append(box,name,price);
      box.addEventListener('change',update);
      menu.appendChild(row);
    });
    update();
  };
  animal.addEventListener('change',()=>{breed.value='';renderBreeds();if(selected)selected.value='';if(additional)additional.value='';if(totalField)totalField.value='0';renderServices()});
  const picker=service.querySelector('.live-picker');
  service.querySelector('.live-trigger')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(!animal.value)return;menu.hidden=!menu.hidden});
  menu.addEventListener('click',e=>e.stopPropagation());
  document.addEventListener('click',e=>{if(picker&&!picker.contains(e.target))menu.hidden=true});
  renderBreeds();
  renderServices();
  const s=document.createElement('style');s.id='booking-live-services-v3';s.textContent='.live-row{display:grid!important;grid-template-columns:22px minmax(0,1fr)!important;align-items:center!important;gap:10px!important;user-select:none;cursor:pointer}.live-row input{display:block!important;opacity:1!important;visibility:visible!important;width:18px!important;height:18px!important;margin:0!important;pointer-events:auto!important;cursor:pointer}.live-row-price{display:none}.live-empty{padding:14px 10px;opacity:.7;text-align:center}';if(!document.getElementById(s.id))document.head.appendChild(s);
}
async function start(){for(let i=0;i<50;i++){if(document.querySelector('[name="animal_type"]')&&document.querySelector('[name="breed"]')&&document.querySelector('.live-service'))break;await new Promise(r=>setTimeout(r,100))}const c=await loadConfig();init(c)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
