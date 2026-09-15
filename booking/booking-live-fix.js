(()=>{
'use strict';
const V='booking-live-fix-20260915-structure';
const BREEDS={dog:[['Йоркширський тер’єр','small'],['Померанський шпіц','small'],['Шпіц німецький','small'],['Мальтіпу','small'],['Мальтезе','small'],['Той-пудель','small'],['Чихуахуа','small'],['Той-тер’єр','small'],['Пекінес','small'],['Ши-тцу','small'],['Французький бульдог','small'],['Мопс','small'],['Джек-рассел-тер’єр','small'],['Кавалер-кінг-чарльз-спанієль','small'],['Кокер-спанієль','medium'],['Бігль','medium'],['Шарпей','medium'],['Бордер-колі','medium'],['Австралійська вівчарка','medium'],['Самоїд','medium'],['Середній пудель','medium'],['Басенджі','medium'],['Лабрадор-ретривер','large'],['Золотистий ретривер','large'],['Німецька вівчарка','large'],['Хаскі','large'],['Маламут','large'],['Доберман','large'],['Ротвейлер','large'],['Боксер','large'],['Далматинець','large'],['Великий пудель','large'],['Бернський зенненхунд','large'],['Ньюфаундленд','large'],['Алабай','large'],['Інша порода','other']],cat:[['Британська короткошерста','medium'],['Шотландська висловуха','medium'],['Мейн-кун','large'],['Сибірська','medium'],['Перська','medium'],['Бенгальська','medium'],['Сфінкс','medium'],['Регдол','medium'],['Абіссінська','small'],['Бірманська','medium'],['Норвезька лісова','large'],['Орієнтальна','small'],['Дворова / метис','medium'],['Інша порода','other']]};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function init(){
  const f=document.getElementById('booking-form');
  if(!f||f.dataset.liveFix===V)return;
  f.dataset.liveFix=V;
  const oldBreed=f.querySelector('[name="breed"]')?.closest('label');
  if(!oldBreed)return;
  oldBreed.remove();
  f.querySelectorAll('.rp-field,.rp-services,[data-clean-booking],[name="animal_type"],[name="breed_category"],[name="coat_condition"]').forEach(x=>x.closest('label')?.remove());
  const make=label=>{const w=document.createElement('label');const s=document.createElement('span');s.className='live-label';s.textContent=label;w.appendChild(s);return w};
  const animalW=make('🐾 Тип тварини'),animal=document.createElement('select');
  animal.className='live-select';animal.name='animal_type';animal.required=true;
  animal.innerHTML='<option value="">Оберіть тип тварини</option><option value="dog">Собака</option><option value="cat">Кіт</option>';
  animalW.appendChild(animal);
  const breedW=make('🐶 Порода'),breed=document.createElement('select');
  breed.className='live-select';breed.name='breed';breed.required=true;breed.id='booking-breed';
  breed.innerHTML='<option value="">Спочатку оберіть тварину</option>';breedW.appendChild(breed);
  const owner=f.querySelector('[name="owner_name"]')?.closest('label');
  (owner||f.firstElementChild||oldBreed).before(animalW,breedW);
  const svcOld=f.querySelector('[name="additional_services"]')?.closest('label');
  if(svcOld){
    const root=document.createElement('div');
    root.className='full live-service';
    root.innerHTML='<span class="live-label">✂️ Оберіть послуги</span><div class="live-picker"><button type="button" class="live-trigger"><span>Оберіть одну або кілька послуг</span><span>⌄</span></button><div class="live-menu" hidden></div></div><div class="live-summary"><div class="live-summary-title">Вибрані послуги</div><div class="live-summary-items">Поки нічого не обрано</div></div><input type="hidden" name="selected_services"><input type="hidden" name="additional_services"><input type="hidden" name="estimated_total" value="0">';
    svcOld.replaceWith(root);
  }
  const menu=f.querySelector('.live-menu'),trigger=f.querySelector('.live-trigger');
  const renderBreeds=()=>{const arr=BREEDS[animal.value]||[];breed.innerHTML=arr.length?'<option value="">Оберіть породу</option>'+arr.map(x=>`<option value="${esc(x[0])}" data-category="${esc(x[1])}">${esc(x[0])}</option>`).join(''):'<option value="">Спочатку оберіть тварину</option>';};
  animal.addEventListener('change',()=>{breed.value='';renderBreeds();if(menu)menu.innerHTML='';});
  trigger?.addEventListener('click',e=>{e.preventDefault();if(!animal.value)return;menu.hidden=!menu.hidden;});
  const box=f.querySelector('.live-picker');
  document.addEventListener('click',e=>{if(box&&!box.contains(e.target)&&menu)menu.hidden=true});
  const style=document.createElement('style');style.id='live-booking-style-structure';style.textContent=`.live-label{display:block;font-weight:600;margin-bottom:8px}.live-select{width:100%;min-height:48px;box-sizing:border-box;padding:12px 14px;border:1px solid rgba(215,173,85,.4);border-radius:12px;background:#101010;color:inherit;font:inherit}.live-service{position:relative}.live-trigger{width:100%;min-height:50px;display:flex;justify-content:space-between;align-items:center;padding:12px 15px;border:1px solid rgba(215,173,85,.4);border-radius:12px;background:#111;color:inherit;font:inherit;text-align:left;cursor:pointer}.live-picker{position:relative}.live-menu{position:absolute;left:0;right:0;top:calc(100% + 8px);z-index:9999;background:#151515;border:1px solid rgba(215,173,85,.35);border-radius:14px;padding:7px;box-shadow:0 20px 45px rgba(0,0,0,.45);max-height:300px;overflow:auto}.live-row{display:grid;grid-template-columns:22px 1fr;align-items:center;gap:10px;padding:12px 9px;border-radius:9px;cursor:pointer}.live-row:hover{background:rgba(215,173,85,.08)}.live-row input{width:18px;height:18px}.live-summary{margin-top:9px;padding:13px 14px;border:1px solid rgba(215,173,85,.2);border-radius:12px;background:rgba(215,173,85,.05)}.live-summary-title{font-size:.78rem;text-transform:uppercase;opacity:.6}.live-summary-items{margin-top:5px;line-height:1.5}@media(max-width:600px){.live-menu{position:fixed;left:12px;right:12px;top:50%;transform:translateY(-50%);max-height:65vh}}`;document.head.appendChild(style);
  renderBreeds();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
