(()=>{
  const root=document.querySelector('#gallery .gallery');if(!root)return;
  const API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const src=v=>String(v||'').startsWith('/uploads/')?'.'+v:v;
  async function loadData(){if(API){try{const r=await fetch(API+'/public/portfolio?ts='+Date.now(),{cache:'no-store'});if(r.ok){const a=await r.json();if(Array.isArray(a))return a.flatMap(x=>(x.items||[]).map(i=>({...i,album:x.title})))}}catch{}}const r=await fetch(`content/portfolio.json?v=${Date.now()}`,{cache:'no-store'});if(!r.ok)throw Error();const d=await r.json();let items=[];if(Array.isArray(d.albums))d.albums.forEach(a=>(a.items||[]).forEach(x=>items.push({...x,album:a.title})));if(!items.length&&Array.isArray(d.items))items=d.items;return items}
  async function load(){try{const items=(await loadData()).filter(x=>x.url||x.image||x.video_url).slice(-6).reverse();if(!items.length){root.innerHTML='<p>Портфоліо поки що порожнє.</p>';return}root.innerHTML=items.map(x=>{const isVideo=x.type==='video'||(x.video_url&&!x.image);const media=x.url||x.image||x.video_url;return isVideo?`<a class="portfolio-card" href="portfolio/" aria-label="Відкрити відео портфоліо"><div style="aspect-ratio:1/1;display:grid;place-items:center;background:#111;font-size:2rem">▶</div><h3>${esc(x.title||'Відео')}</h3></a>`:`<a class="portfolio-card" href="portfolio/" aria-label="Відкрити портфоліо: ${esc(x.title||'Робота')}"><img src="${esc(src(media))}" alt="${esc(x.title||'Royal Pet')}" loading="lazy">${x.title?`<h3>${esc(x.title)}</h3>`:''}</a>`}).join('')}catch{root.innerHTML='<p>Портфоліо тимчасово недоступне.</p>'}}
  load();
})();
