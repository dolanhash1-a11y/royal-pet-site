(()=>{
function install(){
  const form=document.getElementById('booking-form');
  if(!form||form.dataset.rpBookingEnhanced==='1')return false;
  const coat=form.querySelector('[name="coat_condition"]');
  if(!coat)return false;
  form.dataset.rpBookingEnhanced='1';
  const wrap=coat.closest('label')||coat.parentElement;
  const note=document.createElement('div');
  note.className='rp-booking-note';
  note.innerHTML='<strong>Зверніть увагу:</strong> за наявності ковтунів або сильно запущеної шерсті може застосовуватися додаткова оплата залежно від складності роботи.';
  wrap.insertAdjacentElement('afterend',note);
  const style=document.createElement('style');
  style.textContent='.rp-booking-note{margin:0 0 12px;padding:12px 14px;border:1px solid rgba(215,173,85,.2);border-radius:10px;background:rgba(215,173,85,.05);font-size:.86rem;line-height:1.5;opacity:.9}.rp-booking-note strong{display:inline-block;margin-right:4px}.booking-form .booking-summary{margin-bottom:8px}';
  document.head.appendChild(style);
  return true;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{if(!install()){const o=new MutationObserver(()=>{if(install())o.disconnect()});o.observe(document.getElementById('booking-form')||document.body,{childList:true,subtree:true})}});else if(!install()){const o=new MutationObserver(()=>{if(install())o.disconnect()});o.observe(document.getElementById('booking-form')||document.body,{childList:true,subtree:true})}
})();
