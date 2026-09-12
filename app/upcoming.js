(()=>{
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const getDateTime=v=>{const m=String(v||'').match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);return m?{date:m[1],time:m[2]}:null};
  const labelDate=d=>{try{return new Intl.DateTimeFormat('uk-UA',{weekday:'long',day:'numeric',month:'long'}).format(new Date(`${d}T12:00:00`)).replace(/^./,x=>x.toUpperCase())}catch{return d}};
  async function render(){
    const pets=document.getElementById('profile-pets');
    if(!pets||!window.customerAuth?.me||!window.customerAuth?.appointments)return;
    let user=null,items=[];try{user=await window.customerAuth.me();if(user)items=await window.customerAuth.appointments()}catch{return}
    if(!user)return;
    const now=new Date();
    const future=(Array.isArray(items)?items:[]).filter(x=>{const dt=getDateTime(x.preferred_time);if(!dt)return false;const status=String(x.status||'').toLowerCase();if(['cancelled','canceled','done','completed','rejected'].includes(status))return false;return new Date(x.preferred_time)>now}).sort((a,b)=>String(a.preferred_time).localeCompare(String(b.preferred_time)));
    const old=document.getElementById('profile-upcoming');if(old)old.remove();
    if(!future.length)return;
    const item=future[0],dt=getDateTime(item.preferred_time),kind=item.animal_type==='cat'?'🐱':'🐶';
    const block=document.createElement('section');block.id='profile-upcoming';block.className='upcoming-card';
    block.innerHTML=`<div class="upcoming-eyebrow">НАЙБЛИЖЧИЙ ЗАПИС</div><div class="upcoming-main"><div class="upcoming-pet"><span>${kind}</span><div><strong>${esc(item.pet_name||'Улюбленець')}</strong><small>${esc(item.breed||'Порода не вказана')}</small></div></div><div class="upcoming-datetime"><b>${esc(labelDate(dt.date))}</b><span>🕐 ${esc(dt.time)}</span></div></div><div class="upcoming-service">${esc(item.additional_services||item.services||'Послуги не вказані')}</div><div class="upcoming-actions"><button type="button" class="ghost upcoming-show">Мої записи</button><button type="button" class="primary upcoming-repeat">Записати знову</button></div>`;
    const anchor=document.getElementById('profile-hours');pets.after(block);
    block.querySelector('.upcoming-show')?.addEventListener('click',()=>{location.hash='appointments';window.dispatchEvent(new HashChangeEvent('hashchange'))});
    block.querySelector('.upcoming-repeat')?.addEventListener('click',()=>{localStorage.setItem('royal_pet_rebook_draft',JSON.stringify({pet_name:item.pet_name||'',animal_type:item.animal_type||'',breed:item.breed||'',age:item.age||'',additional_services:item.additional_services||item.services||''}));location.hash='booking';window.dispatchEvent(new HashChangeEvent('hashchange'));setTimeout(()=>window.applyRebookDraft?.(),100)});
  }
  const base=window.renderCustomerProfile;
  if(typeof base==='function')window.renderCustomerProfile=async()=>{await base();setTimeout(render,40)};
  window.addEventListener('hashchange',()=>{if(location.hash.slice(1)==='profile')setTimeout(render,120)});
  setTimeout(render,350);
})();
