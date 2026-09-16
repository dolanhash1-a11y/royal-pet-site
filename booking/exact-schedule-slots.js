(()=>{
'use strict';
const API=(window.ROYAL_PET_ADMIN_API||'https://royal-pet-admin-api.dolanhash1.workers.dev').replace(/\/$/,'');
const dateEl=document.getElementById('booking-date'),timeEl=document.getElementById('booking-time');
if(!dateEl||!timeEl)return;
const parse=v=>/вихідний/i.test(String(v||''))?[]:[...String(v||'').matchAll(/(\d{1,2}:\d{2})\s*[–—-]\s*(\d{1,2}:\d{2})/g)].map(x=>x[1]);
let busy=false,lastKey='';
async function apply(){const date=dateEl.value;if(!date||busy)return;const d=new Date(date+'T12:00:00');const key=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][d.getDay()];try{const h=await fetch(API+'/public/hours?exact_slots='+Date.now(),{cache:'no-store'}).then(r=>r.json());const allowed=new Set(parse(h[key]));const current=[...timeEl.options].map(o=>o.value).filter(Boolean);const keep=current.filter(x=>allowed.has(x));const signature=date+'|'+keep.join(',');if(signature===lastKey)return;lastKey=signature;busy=true;timeEl.innerHTML='<option value="">'+(keep.length?'Оберіть час':'На цей день немає часових слотів')+'</option>'+keep.map(x=>`<option value="${x}">${x}</option>`).join('');busy=false}catch(e){busy=false}}
function refresh(){lastKey='';setTimeout(apply,300);setTimeout(apply,1000)}
dateEl.addEventListener('change',refresh);new MutationObserver(()=>{if(!busy&&dateEl.value){clearTimeout(window.__rpExactSlotTimer);window.__rpExactSlotTimer=setTimeout(apply,250)}}).observe(timeEl,{childList:true});refresh();
})();