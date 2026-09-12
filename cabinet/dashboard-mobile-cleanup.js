(()=>{
const removeSchedule=()=>{const root=document.getElementById('view-dashboard');if(!root)return;root.querySelectorAll('.section-title').forEach(h=>{if(String(h.textContent||'').trim()==='Поточний графік'){const card=h.nextElementSibling;h.remove();if(card?.classList.contains('card'))card.remove();}})};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>new MutationObserver(removeSchedule).observe(document.getElementById('view-dashboard')||document.body,{childList:true,subtree:true}),{once:true});else{removeSchedule();new MutationObserver(removeSchedule).observe(document.getElementById('view-dashboard')||document.body,{childList:true,subtree:true})}
})();
