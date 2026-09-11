(()=>{
const API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
const V='booking-submit-20260911-v1';
function init(){
  const form=document.getElementById('booking-form');
  if(!form||form.dataset.submitFix===V||!API)return;
  form.dataset.submitFix=V;
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const msg=document.getElementById('form-message');
    const button=form.querySelector('button[type="submit"]');
    const value=n=>String(form.querySelector(`[name="${n}"]`)?.value||'').trim();
    const pet_name=value('pet_name');
    const age=value('age');
    const breed=value('breed');
    const animal_type=value('animal_type');
    const owner_name=value('owner_name');
    const owner_contact=value('owner_contact');
    const last_grooming=value('last_grooming');
    const preferred_time=value('preferred_time');
    const additional_services=value('additional_services');
    const selected_services=value('selected_services');
    const estimated_total=Number(value('estimated_total')||0)||0;
    const comment=value('comment');
    const home_care=form.querySelector('[name="home_care"]:checked')?.value||'';
    if(!pet_name||!age||!animal_type||!breed||!owner_name||!owner_contact||!last_grooming||!home_care||!preferred_time||!selected_services){
      if(msg)msg.textContent='❌ Будь ласка, заповніть усі обов’язкові поля, оберіть послугу та вільний час.';
      return;
    }
    const payload={pet_name,age,breed,animal_type,owner_name,owner_contact,last_grooming,preferred_time,additional_services,home_care,comment,selected_services,estimated_total};
    const oldText=button?.textContent;
    if(button){button.disabled=true;button.textContent='Надсилаємо…'}
    if(msg)msg.textContent='Надсилаємо заявку…';
    try{
      const r=await fetch(API+'/appointments',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),cache:'no-store'});
      const data=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(data.error==='time_already_booked'?'Цей час щойно зайняли. Оберіть інший.':data.error==='invalid_or_unavailable_time'?'Цей час більше недоступний. Оберіть інший час.':data.error||`Помилка ${r.status}`);
      if(msg)msg.textContent='✅ Заявку успішно надіслано! Ми зв’яжемося з вами для підтвердження.';
      form.reset();
      form.querySelector('[name="preferred_time"]')?.removeAttribute('value');
      window.dispatchEvent(new Event('booking:submitted'));
    }catch(err){
      if(msg)msg.textContent='❌ '+String(err?.message||err);
      console.error('Booking submit error',err);
    }finally{
      if(button){button.disabled=false;button.textContent=oldText||'Надіслати заявку'}
    }
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
