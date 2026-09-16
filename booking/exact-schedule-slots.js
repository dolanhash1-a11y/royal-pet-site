(()=>{
'use strict';
const API=(window.ROYAL_PET_ADMIN_API||'https://royal-pet-admin-api.dolanhash1.workers.dev').replace(/\/$/,'');
const dateEl=document.getElementById('booking-date'),timeEl=document.getElementById('booking-time');
if(!dateEl||!timeEl)return;
const parse=v=>/вихідний/i.test(String(v||''))?[]:[...String(v||'').matchAll(/(\d{1,2}:\d{2})\s*[–—-]\s*(\d{1,2}:\d{2})/g)].map(x=>x[1]);
async function apply(){const date=dateEl.value;if(!date)return;try{const h=await fetch(API+'/public/hours?exact_slots='+Date.now(),{cache:'no-store'}).then(r=>r.json());const d=new Date(date+'T12:00:00');const key=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][d.getDay()];const allowed=new Set(parse(h[key]));const current=[...timeEl.options].map(o=>o.value).filter(Boolean);const keep=current.filter(x=>allowed.has(x));timeEl.innerHTML='<option value="">Оберіть час</option>'+keep.map(x=>`<option value="${x}">${x}</option>`).join('');if(!keep.length)timeEl.innerHTML='<option value="">На цей день немає вільних слотів</option>'}catch(e){}}
dateEl.addEventListener('change',apply);new MutationObserver(()=>{if(dateEl.value)apply()}).observe(timeEl,{childList:true});setTimeout(apply,500);
})();