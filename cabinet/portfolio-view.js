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
  function openCms(){window.open('../admin/portfolio.html','_blank','noopener')}
  async function show(){
    document.querySelectorAll('.view').forEach(x=>x.classList.add('hidden'));
    const root=document.getElementById('view-portfolio');if(!root)return;
    root.classList.remove('hidden');document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.view==='portfolio'));
    const title=document.getElementById('page-title');if(title)title.textContent='Портфоліо';
    root.innerHTML='<div class="portfolio-admin-head"><div><h3>Портфоліо</h3><p>Альбоми, фото та відео робіт Royal Pet.</p></div><div class="portfolio-admin-actions"><a class="small-btn" href="../portfolio/" target="_blank" rel="noopener">Відкрити сторінку</a><button class="small-btn gold" id="open-portfolio-editor" type="button">＋ Додати фото / відео</button></div></div><div class="card portfolio-admin-note"><b>Керування медіа</b><span>Редактор відкриється в окремій вкладці. Там можна завантажувати фото/відео, задавати назву альбому, опис і порядок робіт. Після збереження зміни автоматично з’являться на сайті.</span></div><div id="portfolio-admin-list" class="portfolio-admin-list">Завантаження…</div>';
    document.getElementById('open-portfolio-editor').onclick=openCms;
    try{
      const r=await fetch('../content/portfolio.json?v='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('Не вдалося завантажити дані портфоліо');
      const d=await r.json();let albums=Array.isArray(d.albums)?d.albums:[];
      if(!albums.length&&Array.isArray(d.items)){const map=new Map();d.items.forEach(x=>{const k=x.album||'Наші роботи';if(!map.has(k))map.set(k,[]);map.get(k).push(x)});albums=[...map.entries()].map(([album,items])=>({title:album,items}))}
      const list=document.getElementById('portfolio-admin-list');
      list.innerHTML=albums.length?albums.map(a=>`<div class="card portfolio-admin-album"><div><h4>${esc(a.title||'Без назви')}</h4><span>${Array.isArray(a.items)?a.items.length:0} матеріалів</span></div><div class="portfolio-admin-thumbs">${(a.items||[]).slice(0,6).map(x=>x.image?`<img src="${esc(src(x.image))}" alt="${esc(x.title||'')}" loading="lazy">`:`<span class="portfolio-admin-video">▶ Відео</span>`).join('')}</div></div>`).join(''):'<div class="card">Альбомів поки немає.</div>';
    }catch(e){document.getElementById('portfolio-admin-list').innerHTML=`<div class="card error">${esc(e.message)}</div>`}
  }
  function boot(){addNav();addView()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
