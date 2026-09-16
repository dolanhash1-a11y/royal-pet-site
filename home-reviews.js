(()=>{
'use strict';
const API=window.ROYAL_PET_ADMIN_API||'https://royal-pet-admin-api.dolanhash1.workers.dev';
const root=document.querySelector('[data-reviews]');
if(!root)return;

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stars=n=>{
  const rating=Math.max(0,Math.min(5,Number(n)||0));
  return Array.from({length:5},(_,i)=>i<rating?'★':'☆').join('');
};
const formatDate=v=>{
  const d=new Date(v);
  if(Number.isNaN(d.getTime()))return '';
  return new Intl.DateTimeFormat('uk-UA',{day:'numeric',month:'long',year:'numeric'}).format(d);
};

function render(reviews){
  if(!Array.isArray(reviews)||!reviews.length){
    root.innerHTML='<blockquote class="review-card review-empty"><p>Поки що відгуків немає.</p><footer>Будьте першими, хто поділиться враженнями про Royal Pet.</footer></blockquote>';
    return;
  }
  root.innerHTML=reviews.map(r=>{
    const name=esc(r.name||'Клієнт Royal Pet');
    const text=esc(r.text||'');
    const reply=r.reply?`<div class="review-reply"><strong>Royal Pet</strong><p>${esc(r.reply)}</p></div>`:'';
    const date=formatDate(r.created_at);
    return `<blockquote class="review-card"><div class="review-rating" aria-label="Оцінка ${Number(r.rating)||0} з 5">${stars(r.rating)}</div><p>${text}</p><footer><strong>${name}</strong>${date?`<time datetime="${esc(r.created_at)}">${date}</time>`:''}</footer>${reply}</blockquote>`;
  }).join('');
}

async function load(){
  try{
    const r=await fetch(`${API}/public/reviews?home_reviews=${Date.now()}`,{method:'GET',credentials:'omit',cache:'no-store',headers:{Accept:'application/json'}});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    const data=await r.json();
    render(data);
  }catch(e){
    console.error('Royal Pet reviews:',e);
    root.innerHTML='<blockquote class="review-card review-empty"><p>Відгуки тимчасово недоступні.</p><footer>Будь ласка, спробуйте трохи пізніше.</footer></blockquote>';
  }
}

load();
})();
