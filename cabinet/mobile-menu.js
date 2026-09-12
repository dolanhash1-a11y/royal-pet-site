(()=>{
const pages=[['dashboard','🏠','Огляд'],['appointments','📋','Записи'],['calendar','📅','Календар'],['hours','🕐','Графік'],['reviews','⭐','Відгуки'],['services','✂','Послуги'],['clients','👥','Клієнти'],['home-editor','✏️','Головна'],['booking-settings','📝','Запис']];
const root=()=>document.getElementById('rp-mobile-menu');
const navButton=v=>document.querySelector('.sidebar .nav-item[data-view="'+v+'"]');
const API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
function go(v){
  if(v==='clients'&&typeof window.royalPetShowClients==='function'){window.royalPetShowClients();sync();return}
  const b=navButton(v);if(b)b.click();else setTimeout(()=>{const x=navButton(v);if(x)x.click()},200);sync()
}
function sync(){const r=root();if(!r)return;const active=document.querySelector('.sidebar .nav-item.active')?.dataset.view;r.querySelectorAll('[data-mobile-view]').forEach(b=>b.classList.toggle('active',b.dataset.mobileView===active));const n=Number(document.getElementById('new-count')?.textContent||0);const badge=r.querySelector('[data-mobile-count="appointments"]');if(badge){badge.hidden=!n;badge.textContent=String(n)}}
function build(){let r=root();if(!r){r=document.createElement('nav');r.id='rp-mobile-menu';document.body.appendChild(r)}let html='<div class="rp-mobile-menu-scroll">';pages.forEach(p=>{html+='<button class="rp-mobile-menu-item" type="button" data-mobile-view="'+p[0]+'"><span class="mi-icon">'+p[1]+'</span><span class="mi-label">'+p[2]+'</span><span class="mi-badge" data-mobile-count="'+p[0]+'" hidden></span></button>'});html+='<button class="rp-mobile-menu-item rp-mobile-menu-logout" type="button" data-mobile-logout="1"><span class="mi-icon">🚪</span><span class="mi-label">Вийти</span></button></div>';r.innerHTML=html;
const scroll=r.querySelector('.rp-mobile-menu-scroll');r.querySelectorAll('[data-mobile-view]').forEach(b=>b.onclick=()=>go(b.dataset.mobileView));r.querySelector('[data-mobile-logout]')?.addEventListener('click',()=>document.getElementById('logout')?.click());let down=false,startX=0,startScroll=0;scroll.addEventListener('pointerdown',e=>{down=true;startX=e.clientX;startScroll=scroll.scrollLeft;scroll.setPointerCapture?.(e.pointerId)});scroll.addEventListener('pointermove',e=>{if(down)scroll.scrollLeft=startScroll-(e.clientX-startX)});scroll.addEventListener('pointerup',()=>down=false);scroll.addEventListener('pointercancel',()=>down=false);window.rpMobileMenuSync=sync;sync()}
async function markNoShow(id){
  if(!API||!id)return;
  const r=await fetch(API+'/appointments/'+encodeURIComponent(id),{method:'PATCH',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'no_show'})});
  let j={};try{j=await r.json()}catch{}
  if(!r.ok)throw Error(j.error||`API ${r.status}`);
}
function noShowStatusText(){return 'Не прийшов'}
function injectNoShow(){
  const view=document.getElementById('view-appointments');if(!view||view.classList.contains('hidden'))return;
  view.querySelectorAll('tbody tr').forEach(row=>{
    const idBtn=row.querySelector('[data-id]');
    if(!idBtn||row.querySelector('[data-no-show]'))return;
    const status=row.querySelector('.badge');
    const raw=(status?.textContent||'').trim().toLowerCase();
    if(raw==='виконана'||raw==='скасована'||raw==='не прийшов')return;
    const id=idBtn.dataset.id;
    const holder=row.querySelector('.actions');if(!holder)return;
    const btn=document.createElement('button');btn.type='button';btn.className='small-btn danger';btn.dataset.noShow=id;btn.textContent=noShowStatusText();
    holder.appendChild(btn);
  });
}
function bindNoShow(){
  const view=document.getElementById('view-appointments');if(!view||view.dataset.noShowBound==='1')return;
  view.dataset.noShowBound='1';
  const observe=()=>injectNoShow();
  new MutationObserver(observe).observe(view,{childList:true,subtree:true});
  view.addEventListener('click',async e=>{
    const btn=e.target.closest('[data-no-show]');if(!btn)return;e.preventDefault();e.stopPropagation();
    if(!confirm('Позначити цей запис як «Не прийшов»?'))return;
    btn.disabled=true;
    try{
      await markNoShow(btn.dataset.noShow);
      const badge=view.querySelector(`tr:has([data-no-show="${CSS.escape(btn.dataset.noShow)}"]) .badge`);
      if(badge){badge.className='badge no_show';badge.textContent=noShowStatusText()}
      btn.remove();
      document.getElementById('new-count')?.dispatchEvent(new Event('change'));
    }catch(err){alert(err.message||'Не вдалося змінити статус');btn.disabled=false}
  });
  injectNoShow();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{build();bindNoShow()},{once:true});else{build();bindNoShow()}
})();
