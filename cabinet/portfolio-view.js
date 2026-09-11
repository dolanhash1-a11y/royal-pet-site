(()=>{
  const API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const src=v=>String(v||'').startsWith('/uploads/')?'.'+v:v;
  function addNav(){
    const nav=document.querySelector('.sidebar nav');
    if(!nav||document.querySelector('[data-view="portfolio"]'))return;
    nav.insertAdjacentHTML('beforeend','<button class="nav-item" data-view="portfolio">▣ <span>Портфоліо</span></button>');
    nav.querySelector('[data-view="portfolio"]').addEventListener('click',()=>show());
  }
  function addView(){const main=document.querySelector('.main');if(main&&!document.getElementById('view-portfolio'))main.insertAdjacentHTML('beforeend','<div id="view-portfolio" class="view hidden"></div>')}
  function focusManager(){const m=document.getElementById('portfolio-r2-manager');if(!m)return; m.scrollIntoView({behavior:'smooth',block:'start'});const f=m.querySelector('[data-files]');if(f)f.focus({preventScroll:true})}
  async function show(){
    document.querySelectorAll('.view').forEach(x=>x.classList.add('hidden'));
    const root=document.getElementById('view-portfolio');if(!root)return;
    root.classList.remove('hidden');document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.view==='portfolio'));
    const title=document.getElementById('page-title');if(title)title.textContent='Портфоліо';
    root.innerHTML='<div class="portfolio-admin-head"><div><h3>Портфоліо</h3><p>Альбоми, фото та відео робіт Royal Pet.</p></div><div class="portfolio-admin-actions"><a class="small-btn" href="../portfolio/" target="_blank" rel="noopener">Відкрити сторінку</a><button class="small-btn gold" id="focus-portfolio-editor" type="button">＋ Додати фото / відео</button></div></div><div class="card portfolio-admin-note"><b>Медіатека Cloudflare R2</b><span>Фото та відео можна завантажувати прямо тут: оберіть існуючий альбом або створіть новий, додайте опис і позначте обкладинку.</span></div><div id="portfolio-admin-list" class="portfolio-admin-list">Завантаження…</div>';
    document.getElementById('focus-portfolio-editor').onclick=focusManager;
    try{
      let albums=[];
      if(API){const r=await fetch(API+'/public/portfolio?ts='+Date.now(),{cache:'no-store'});if(r.ok){const d=await r.json();if(Array.isArray(d))albums=d}}
      const list=document.getElementById('portfolio-admin-list');
      list.innerHTML=albums.length?albums.map(a=>`<div class="card portfolio-admin-album"><div><h4>${esc(a.title||'Без назви')}</h4><span>${Array.isArray(a.items)?a.items.length:0} матеріалів</span></div><div class="portfolio-admin-thumbs">${(a.items||[]).slice(0,6).map(x=>{const u=x.url||x.image||x.video_url||'';return x.type==='video'||(x.video_url&&!x.image)?`<span class="portfolio-admin-video">▶ Відео</span>`:u?`<img src="${esc(src(u))}" alt="${esc(x.title||'')}" loading="lazy">`:''}).join('')}</div></div>`).join(''):'<div class="card">Альбомів поки немає. Створіть перший через форму нижче.</div>';
    }catch(e){document.getElementById('portfolio-admin-list').innerHTML=`<div class="card error">${esc(e.message)}</div>`}
    setTimeout(focusManager,80);
  }
  function boot(){addNav();addView()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
