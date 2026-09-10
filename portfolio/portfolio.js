(()=>{
  const root=document.querySelector('[data-portfolio-albums]');
  const lightbox=document.querySelector('[data-lightbox]');
  const media=document.querySelector('[data-lightbox-media]');
  const caption=document.querySelector('[data-lightbox-caption]');
  let galleryItems=[];
  let current=0;
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const src=v=>String(v||'').startsWith('/uploads/')?'..'+v:v;
  async function load(){
    try{
      const r=await fetch(`../content/portfolio.json?v=${Date.now()}`,{cache:'no-store'});
      if(!r.ok)throw Error('Не вдалося завантажити портфоліо');
      const d=await r.json();
      let albums=Array.isArray(d.albums)?d.albums:[];
      if(!albums.length&&Array.isArray(d.items)){
        const map=new Map();
        d.items.forEach(x=>{const key=x.album||'Наші роботи';if(!map.has(key))map.set(key,[]);map.get(key).push(x)});
        albums=[...map.entries()].map(([title,items],i)=>({id:`album-${i+1}`,title,description:'',cover:items.find(x=>x.image)?.image||'',items}));
      }
      if(!albums.length){root.innerHTML='<div class="card">Портфоліо поки що порожнє.</div>';return}
      root.innerHTML=albums.map((a,ai)=>{
        const items=Array.isArray(a.items)?a.items:[];
        const cover=a.cover||(items.find(x=>x.image)?.image||'');
        return `<article class="portfolio-album"><div class="portfolio-album-head">${cover?`<div class="portfolio-album-cover"><img src="${esc(src(cover))}" alt="${esc(a.title)}" loading="lazy"></div>`:''}<div><p class="eyebrow">Альбом ${ai+1}</p><h2>${esc(a.title||'Без назви')}</h2>${a.description?`<p>${esc(a.description)}</p>`:''}<span class="portfolio-count">${items.length} ${items.length===1?'робота':items.length<5?'роботи':'робіт'}</span></div></div><div class="portfolio-grid">${items.map(x=>{
          const type=x.type==='video'?'video':(x.video_url&&!x.image?'video':'image');
          const mediaUrl=x.image||x.video_url||'';
          if(!mediaUrl)return '';
          return `<button class="portfolio-item ${type==='video'?'is-video':''}" type="button" data-type="${type}" data-src="${esc(src(mediaUrl))}" data-title="${esc(x.title||'Royal Pet')}" data-desc="${esc(x.description||'')}">${type==='video'?`<video src="${esc(src(mediaUrl))}" muted playsinline preload="metadata"></video><span class="portfolio-play">▶</span>`:`<img src="${esc(src(mediaUrl))}" alt="${esc(x.title||a.title||'Royal Pet')}" loading="lazy">`}${x.title?`<span class="portfolio-item-title">${esc(x.title)}</span>`:''}</button>`
        }).join('')}</div></article>`;
      }).join('');
      galleryItems=[...root.querySelectorAll('.portfolio-item')];
      galleryItems.forEach((b,i)=>{b.dataset.index=i;b.addEventListener('click',()=>open(i))});
    }catch(e){root.innerHTML=`<div class="card error">${esc(e.message)}</div>`}
  }
  function open(i){current=(i+galleryItems.length)%galleryItems.length;const b=galleryItems[current];if(!b)return;const type=b.dataset.type,srcUrl=b.dataset.src;media.innerHTML=type==='video'?`<video src="${esc(srcUrl)}" controls autoplay playsinline></video>`:`<img src="${esc(srcUrl)}" alt="${esc(b.dataset.title)}">`;caption.innerHTML=`<strong>${esc(b.dataset.title)}</strong>${b.dataset.desc?`<span>${esc(b.dataset.desc)}</span>`:''}`;lightbox.classList.add('open');lightbox.setAttribute('aria-hidden','false');document.body.classList.add('portfolio-lock')}
  function close(){lightbox.classList.remove('open');lightbox.setAttribute('aria-hidden','true');media.innerHTML='';document.body.classList.remove('portfolio-lock')}
  function step(delta){open(current+delta)}
  lightbox?.querySelector('.portfolio-lightbox-close')?.addEventListener('click',close);
  lightbox?.querySelector('.portfolio-lightbox-prev')?.addEventListener('click',()=>step(-1));
  lightbox?.querySelector('.portfolio-lightbox-next')?.addEventListener('click',()=>step(1));
  lightbox?.addEventListener('click',e=>{if(e.target===lightbox)close()});
  document.addEventListener('keydown',e=>{if(!lightbox.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')step(-1);if(e.key==='ArrowRight')step(1)});
  load();
})();
