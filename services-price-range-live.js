(()=>{
const API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
const fmt=v=>{const raw=String(v??'').trim().replace(/\s*грн\.?\s*$/i,'');const m=raw.match(/^(\d+(?:[.,]\d+)?)\s*[–—-]\s*(\d+(?:[.,]\d+)?)$/);if(!raw)return'Ціна уточнюється';if(!m)return`${raw} грн`;const a=Number(m[1].replace(',','.')),b=Number(m[2].replace(',','.'));return a===b?`${a.toLocaleString('uk-UA')} грн`:`${a.toLocaleString('uk-UA')}–${b.toLocaleString('uk-UA')} грн`};
async function run(){if(!API)return;try{const r=await fetch(`${API}/public/services?range=${Date.now()}`,{cache:'no-store'});if(!r.ok)return;const items=await r.json();const byTitle=new Map((Array.isArray(items)?items:[]).map(x=>[String(x.title||''),x]));document.querySelectorAll('[data-services] .service-card').forEach(card=>{const title=card.querySelector('h3')?.textContent?.trim();const price=card.querySelector('strong');const item=byTitle.get(title);if(price&&item)price.textContent=fmt(item.price)});}catch{}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
