const API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
const days=[['monday','Понеділок'],['tuesday','Вівторок'],['wednesday','Середа'],['thursday','Четвер'],['friday','П’ятниця'],['saturday','Субота'],['sunday','Неділя']];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const fmt=v=>{if(!v)return'—';const d=new Date(v);return isNaN(d)?v:d.toLocaleString('uk-UA',{dateStyle:'short',timeStyle:'short'})};

function view(v){
 document.querySelectorAll('.view').forEach(x=>x.classList.add('hidden'));
 const root=document.getElementById('view-'+v); if(root) root.classList.remove('hidden');
 document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===v));
 const titles={dashboard:'Огляд',appointments:'Записи',calendar:'Календар',hours:'Графік роботи',reviews:'Відгуки',services:'Послуги'};
 const title=document.getElementById('page-title'); if(title) title.textContent=titles[v]||v;
 const renderers={dashboard:window.renderDashboard,appointments:window.renderAppointments,hours:window.royalPetRenderSchedule||window.renderHours,reviews:window.renderReviews,services:window.renderServices,calendar:window.royalPetCalendar};
 if(typeof renderers[v]==='function') renderers[v]();
}

document.addEventListener('click',e=>{
 const b=e.target.closest('.sidebar .nav-item');
 if(!b)return;
 e.preventDefault();
 view(b.dataset.view);
});

// Keep the original cabinet modules available without changing their APIs.
window.royalPetView=view;

async function loadAppointments(){try{const r=await fetch(API+'/appointments',{credentials:'include',cache:'no-store'});return r.ok?await r.json():[]}catch{return[]}}

function showAppointment(x){
 const modal=document.getElementById('appointment-modal');
 if(!modal){alert(`${x?.name||'Клієнт'}\n${x?.preferred_time||''}`);return;}
 modal.classList.remove('hidden');
 const time=modal.querySelector('[name="preferred_time"]'); if(time&&x?.preferred_time) time.value=String(x.preferred_time).slice(0,16);
}
window.showAppointment=showAppointment;
