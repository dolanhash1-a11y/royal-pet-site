(()=>{
  const VERSION='booking-final-fix-20260911-v1';
  const BREEDS={dog:[
    ['Йоркширський тер’єр','small'],['Померанський шпіц','small'],['Шпіц німецький','small'],['Мальтіпу','small'],['Мальтезе','small'],['Той-пудель','small'],['Чихуахуа','small'],['Той-тер’єр','small'],['Пекінес','small'],['Ши-тцу','small'],['Французький бульдог','small'],['Мопс','small'],['Джек-рассел-тер’єр','small'],['Кавалер-кінг-чарльз-спанієль','small'],['Кокер-спанієль','medium'],['Бігль','medium'],['Шарпей','medium'],['Бордер-колі','medium'],['Австралійська вівчарка','medium'],['Самоїд','medium'],['Середній пудель','medium'],['Басенджі','medium'],['Лабрадор-ретривер','large'],['Золотистий ретривер','large'],['Німецька вівчарка','large'],['Хаскі','large'],['Маламут','large'],['Доберман','large'],['Ротвейлер','large'],['Боксер','large'],['Далматинець','large'],['Великий пудель','large'],['Бернський зенненхунд','large'],['Ньюфаундленд','large'],['Алабай','large'],['Інша порода','other']],cat:[
    ['Британська короткошерста','medium'],['Шотландська висловуха','medium'],['Мейн-кун','large'],['Сибірська','medium'],['Перська','medium'],['Бенгальська','medium'],['Сфінкс','medium'],['Регдол','medium'],['Абіссінська','small'],['Бірманська','medium'],['Норвезька лісова','large'],['Орієнтальна','small'],['Дворова / метис','medium'],['Інша порода','other']]};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  function init(){
    const form=document.getElementById('booking-form');
    if(!form||form.dataset.finalBooking===VERSION)return;
    const oldBreed=form.querySelector('[name="breed"]');
    if(!oldBreed)return;
    form.dataset.finalBooking=VERSION;
    form.querySelectorAll('[data-rp-final]').forEach(e=>e.remove());
    const labels=[...form.querySelectorAll('label')];
    const existingAnimal=form.querySelector('[name="animal_type"]');
    const animalLabel=existingAnimal?.closest('label');
    if(animalLabel)animalLabel.remove();
    const breedLabel=oldBreed.closest('label')||oldBreed.parentElement;
    breedLabel.replaceChildren();breedLabel.dataset.rpFinal='1';
    breedLabel.innerHTML='<span class="rp-final-label">🐶 Порода</span>';
    const breed=document.createElement('select');breed.name='breed';breed.id='booking-breed';breed.className='booking-select';breed.required=true;breedLabel.appendChild(breed);
    const animalWrap=document.createElement('label');animalWrap.dataset.rpFinal='1';animalWrap.innerHTML='<span class="rp-final-label">🐾 Тип тварини</span>';
    const animal=document.createElement('select');animal.name='animal_type';animal.className='booking-select';animal.required=true;animal.innerHTML='<option value="">Оберіть тип тварини</option><option value="dog">Собака</option><option value="cat">Кіт</option>';animalWrap.appendChild(animal);
    const owner=form.querySelector('[name="owner_name"]')?.closest('label');
    owner?form.insertBefore(animalWrap,owner):form.insertBefore(animalWrap,breedLabel);
    const catWrap=document.createElement('label');catWrap.dataset.rpFinal='1';catWrap.style.display='none';catWrap.innerHTML='<span class="rp-final-label">📏 Розмір / категорія</span>';
    const cat=document.createElement('select');cat.name='breed_category';cat.className='booking-select';cat.innerHTML='<option value="small">Мала</option><option value="medium">Середня</option><option value="large">Велика</option>';catWrap.appendChild(cat);breedLabel.after(catWrap);
    function updateBreeds(){const type=animal.value,arr=BREEDS[type]||[];breed.innerHTML='<option value="">Оберіть породу</option>'+arr.map(([n,c])=>`<option value="${esc(n)}" data-category="${esc(c)}">${esc(n)}</option>`).join('');catWrap.style.display=type==='cat'?'none':'none';breed.disabled=!type;if(type)breed.focus();}
    animal.addEventListener('change',updateBreeds);updateBreeds();
    const serviceOld=form.querySelector('[name="additional_services"]')?.closest('label');
    if(serviceOld)serviceOld.remove();
    const svc=document.createElement('label');svc.className='full';svc.dataset.rpFinal='1';svc.innerHTML='<span class="rp-final-label">✂️ Послуги</span><button type="button" class="rp-final-services">Оберіть послуги <span>⌄</span></button><div class="rp-final-menu" hidden></div><div class="rp-final-summary"><span class="rp-final-summary-label">Обрано:</span> <span class="rp-final-selected">нічого</span><strong>Орієнтовно: <span class="rp-final-total">0</span> грн</strong></div>';
    const fieldset=form.querySelector('fieldset.full');fieldset?form.insertBefore(svc,fieldset):form.appendChild(svc);
    const btn=svc.querySelector('.rp-final-services'),menu=svc.querySelector('.rp-final-menu'),selected=svc.querySelector('.rp-final-selected'),totalEl=svc.querySelector('.rp-final-total');
    const hs=document.createElement('input');hs.type='hidden';hs.name='selected_services';const ha=document.createElement('input');ha.type='hidden';ha.name='additional_services';const ht=document.createElement('input');ht.type='hidden';ht.name='estimated_total';svc.append(hs,ha,ht);
    const services=[...form.querySelectorAll('input[data-service-id]')];
    if(!services.length){const defaults=['Комплексний грумінг','Купання та сушка','Стрижка кігтів'];defaults.forEach((name,i)=>{const id='fallback-'+i;const row=document.createElement('label');row.className='rp-final-row';row.innerHTML=`<input type="checkbox" value="${id}"><span>${name}</span><b>За прайсом</b>`;menu.appendChild(row)})}
    function update(){const checks=[...menu.querySelectorAll('input[type=checkbox]:checked')];selected.textContent=checks.length?checks.map(x=>x.parentElement.querySelector('span').textContent).join(', '):'нічого';hs.value=checks.map(x=>x.value).join(',');ha.value=checks.map(x=>x.parentElement.querySelector('span').textContent).join(', ');totalEl.textContent='0';ht.value='0';btn.firstChild.textContent=checks.length?`Обрано: ${checks.length}`:'Оберіть послуги ';}
    btn.addEventListener('click',e=>{e.preventDefault();menu.hidden=!menu.hidden;btn.classList.toggle('open',!menu.hidden)});menu.addEventListener('change',update);document.addEventListener('click',e=>{if(!svc.contains(e.target)){menu.hidden=true;btn.classList.remove('open')}});update();
    const style=document.createElement('style');style.id='booking-final-style';style.textContent=`[data-rp-final]{box-sizing:border-box}.rp-final-label{display:block;font-weight:600;margin-bottom:8px}.booking-select{width:100%;min-height:48px;padding:12px 14px;border:1px solid rgba(215,173,85,.35);border-radius:12px;background:#101010;color:inherit;font:inherit}.rp-final-services{width:100%;min-height:50px;padding:0 15px;display:flex;align-items:center;justify-content:space-between;border:1px solid rgba(215,173,85,.35);border-radius:12px;background:#111;color:inherit;font:inherit;cursor:pointer;text-align:left}.rp-final-services.open{border-color:rgba(215,173,85,.8)}.rp-final-menu{margin-top:8px;max-height:280px;overflow:auto;padding:7px;border:1px solid rgba(215,173,85,.32);border-radius:14px;background:#121212;box-shadow:0 16px 40px rgba(0,0,0,.4)}.rp-final-menu[hidden]{display:none}.rp-final-row{display:grid!important;grid-template-columns:24px 1fr auto;gap:10px;align-items:center;padding:12px 9px;border-radius:10px;cursor:pointer}.rp-final-row:hover{background:rgba(215,173,85,.08)}.rp-final-row input{width:18px;height:18px}.rp-final-row b{font-size:.82rem;opacity:.65}.rp-final-summary{margin-top:9px;padding:13px 14px;border:1px solid rgba(215,173,85,.2);border-radius:12px;background:rgba(215,173,85,.05);line-height:1.5}.rp-final-summary-label{opacity:.65}.rp-final-summary strong{display:block;margin-top:5px;font-size:1.05rem}@media(max-width:600px){.rp-final-menu{position:fixed;left:12px;right:12px;top:50%;transform:translateY(-50%);max-height:70vh;z-index:9999}}`;
    document.head.appendChild(style);
    const submit=form.querySelector('button[type="submit"]');if(submit){submit.addEventListener('click',()=>{if(!animal.value||!breed.value){}},{capture:true})}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
