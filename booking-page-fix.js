(()=>{
  const VERSION='booking-page-fix-20260911-v1';
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const load=async()=>{const r=await fetch(`content/breeds.json?v=${Date.now()}`,{cache:'no-store'});if(!r.ok)throw Error('Не вдалося завантажити список порід');return r.json()};
  const style=()=>{if(document.getElementById('booking-page-fix-styles'))return;const s=document.createElement('style');s.id='booking-page-fix-styles';s.textContent=`
  .rp-booking-animal{display:grid!important;grid-template-columns:1fr 1fr;gap:14px;grid-column:1/-1}
  .rp-booking-field label{display:block}
  .rp-booking-services{position:relative;grid-column:1/-1}
  .rp-service-toggle{width:100%;min-height:52px;border:1px solid rgba(215,173,85,.38);background:linear-gradient(180deg,#171717,#101010);color:#f5f5f5;border-radius:12px;padding:14px 46px 14px 16px;text-align:left;font:inherit;cursor:pointer;position:relative}
  .rp-service-toggle:after{content:'⌄';position:absolute;right:16px;top:50%;transform:translateY(-55%);font-size:20px;color:#d7ad55}
  .rp-service-toggle.open:after{content:'⌃'}
  .rp-service-menu{display:none;position:absolute;z-index:100;left:0;right:0;top:calc(100% + 8px);background:#111;border:1px solid rgba(215,173,85,.42);border-radius:14px;padding:8px;box-shadow:0 18px 45px rgba(0,0,0,.5);max-height:320px;overflow:auto}
  .rp-service-menu.open{display:block}
  .rp-service-option{display:flex;align-items:center;gap:12px;padding:12px 13px;border-radius:10px;cursor:pointer}
  .rp-service-option:hover{background:rgba(215,173,85,.09)}
  .rp-service-option input{margin:0;accent-color:#d7ad55;transform:scale(1.05)}
  .rp-service-main{min-width:0;display:flex;flex-direction:column;gap:3px;flex:1}
  .rp-service-main strong{font-size:.96rem;font-weight:600;color:#f2f2f2}
  .rp-service-main span{font-size:.78rem;color:#999}
  .rp-service-price{font-size:.88rem;color:#d7ad55;white-space:nowrap}
  .rp-service-summary{margin-top:10px;padding:14px 16px;border:1px solid rgba(215,173,85,.22);border-radius:12px;background:rgba(215,173,85,.045)}
  .rp-service-summary-title{font-size:.82rem;color:#a9a9a9;margin-bottom:6px}
  .rp-service-summary-list{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
  .rp-service-chip{padding:6px 9px;border-radius:999px;background:rgba(215,173,85,.09);border:1px solid rgba(215,173,85,.18);font-size:.8rem;color:#eee}
  .rp-service-total{display:flex;justify-content:space-between;gap:12px;font-weight:700;font-size:1.05rem}
  .rp-booking-help{display:block;margin-top:6px;font-size:.78rem;color:#888}
  @media(max-width:640px){.rp-booking-animal{grid-template-columns:1fr}.rp-service-menu{max-height:55vh}.rp-service-option{padding:11px 10px}.rp-service-main strong{font-size:.9rem}}
  `;document.head.appendChild(s)};
  async function install(){
    const form=document.getElementById('booking-form');
    if(!form||form.dataset.bookingPageFix===VERSION)return false;
    const oldBreed=form.querySelector('[name="breed"]');
    const originalAdditional=form.querySelector('[name="additional_services"]');
    if(!oldBreed)return false;
    form.dataset.bookingPageFix=VERSION;
    style();
    let breeds={dog:[],cat:[]};try{breeds=await load()}catch(e){console.error(e)}
    const oldBreedWrap=oldBreed.closest('label')||oldBreed.parentElement;
    oldBreedWrap.innerHTML='🐾 Порода';
    const animalLabel=document.createElement('label');animalLabel.className='rp-booking-field';animalLabel.innerHTML='<span>🐶 Тип тварини</span>';
    const animal=document.createElement('select');animal.className='booking-select';animal.name='animal_type';animal.required=true;animal.innerHTML='<option value="">Оберіть тип тварини</option><option value="dog">Собака</option><option value="cat">Кіт</option>';animalLabel.appendChild(animal);
    oldBreedWrap.parentNode.insertBefore(animalLabel,oldBreedWrap);
    const breed=document.createElement('select');breed.className='booking-select';breed.name='breed';breed.id='booking-breed';breed.required=true;oldBreedWrap.appendChild(breed);oldBreedWrap.insertAdjacentHTML('beforeend','<span class="rp-booking-help">Спочатку оберіть тип тварини.</span>');
    const populate=()=>{const list=Array.isArray(breeds[animal.value])?breeds[animal.value]:[];breed.innerHTML='<option value="">Оберіть породу</option>'+list.map(x=>`<option value="${esc(x.name)}" data-category="${esc(x.category||'')}">${esc(x.name)}</option>`).join('');breed.disabled=!animal.value;breed.dispatchEvent(new Event('change',{bubbles:true}))};
    animal.addEventListener('change',populate);populate();
    if(originalAdditional){
      const oldWrap=originalAdditional.closest('label')||originalAdditional.parentElement;oldWrap.remove();
    }
    const serviceLabel=document.createElement('label');serviceLabel.className='rp-booking-services';serviceLabel.innerHTML='✂️ Оберіть послуги';
    const picker=document.createElement('div');picker.className='rp-service-picker';
    const toggle=document.createElement('button');toggle.type='button';toggle.className='rp-service-toggle';toggle.textContent='Оберіть послугу';
    const menu=document.createElement('div');menu.className='rp-service-menu';
    const summary=document.createElement('div');summary.className='rp-service-summary';summary.innerHTML='<div class="rp-service-summary-title">Обрані послуги</div><div class="rp-service-summary-list"><span class="rp-service-chip">Поки нічого не обрано</span></div><div class="rp-service-total"><span>Разом</span><strong>0 грн</strong></div>';
    picker.append(toggle,menu);serviceLabel.append(picker,summary);
    const marker=form.querySelector('fieldset.full');form.insertBefore(serviceLabel,marker||form.lastElementChild);
    let services=[];if(window.ROYAL_PET_ADMIN_API){try{const r=await fetch(window.ROYAL_PET_ADMIN_API.replace(/\/$/,'')+'/public/services',{cache:'no-store'});if(r.ok)services=await r.json()}catch(e){}}
    if(!services.length){try{const d=await (await fetch(`content/services.json?v=${Date.now()}`,{cache:'no-store'})).json();services=(d.items||[]).filter(x=>x.active!==false)}catch(e){}}
    const price=x=>Number(String(x.price??0).replace(/[^0-9.]/g,''))||0;
    services.forEach(x=>{const lab=document.createElement('label');lab.className='rp-service-option';const cb=document.createElement('input');cb.type='checkbox';cb.value=x.id||x.title;const main=document.createElement('span');main.className='rp-service-main';main.innerHTML=`<strong>${esc(x.title||'Послуга')}</strong><span>${esc(x.duration||'')}</span>`;const pr=document.createElement('span');pr.className='rp-service-price';pr.textContent=price(x)?`${price(x).toLocaleString('uk-UA')} грн`:'Ціна за породою';lab.append(cb,main,pr);menu.appendChild(lab)});
    const selected=()=>[...menu.querySelectorAll('input:checked')].map(cb=>services.find(x=>String(x.id||x.title)===String(cb.value))).filter(Boolean);
    const hidden=document.createElement('input');hidden.type='hidden';hidden.name='selected_services';const addHidden=document.createElement('input');addHidden.type='hidden';addHidden.name='additional_services';serviceLabel.append(hidden,addHidden);
    const update=()=>{const items=selected();const total=items.reduce((n,x)=>n+price(x),0);hidden.value=items.map(x=>x.title).join(', ');addHidden.value=hidden.value;toggle.textContent=items.length?`Обрано послуг: ${items.length}`:'Оберіть послугу';summary.querySelector('.rp-service-summary-list').innerHTML=items.length?items.map(x=>`<span class="rp-service-chip">${esc(x.title)}</span>`).join(''):'<span class="rp-service-chip">Поки нічого не обрано</span>';summary.querySelector('.rp-service-total strong').textContent=total?`${total.toLocaleString('uk-UA')} грн`:'0 грн'};
    menu.addEventListener('change',update);toggle.addEventListener('click',()=>{menu.classList.toggle('open');toggle.classList.toggle('open',menu.classList.contains('open'))});document.addEventListener('click',e=>{if(!serviceLabel.contains(e.target)){menu.classList.remove('open');toggle.classList.remove('open')}});update();
    return true;
  }
  const boot=()=>{install().catch(e=>console.error('booking-page-fix',e))};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
