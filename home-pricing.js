(()=>{
const API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const money=v=>Number(v||0).toLocaleString('uk-UA');
const PRICING_ORDER=[
 {key:'complex',title:'Комплекс',match:s=>/комплекс/i.test(String(s.title||''))},
 {key:'hygiene',title:'Гігієна',match:s=>/гігієн/i.test(String(s.title||''))},
 {key:'adaptive',title:'Адаптація',match:s=>/адаптив|адаптац/i.test(String(s.title||''))},
 {key:'sheddingBath',title:'Вичісування линяючої шерсті шпіца + купання'},
 {key:'shedding',title:'Вичісування линяючої шерсті шпіца'},
 {key:'tangles',title:'Вичісування ковтунів'},
 {key:'shaveTangles',title:'Збривання ковтунів'},
 {key:'bath10',title:'Купання до 10 кг'},
 {key:'teeth',title:'Гігієна зубів',match:s=>/зуб/i.test(String(s.title||''))},
 {key:'eyes',title:'Гігієна очей',match:s=>/оч/i.test(String(s.title||''))}
];
function style(){if(document.getElementById('home-pricing-style'))return;const s=document.createElement('style');s.id='home-pricing-style';s.textContent=`#pricing .home-pricing-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:24px}#pricing .home-price-card{padding:20px;border:1px solid rgba(215,173,85,.18);border-radius:16px;background:rgba(255,255,255,.02)}#pricing .home-price-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}#pricing .home-price-card h3{margin:0;font-size:24px}#pricing .home-price-from{color:#d7ad55;font-weight:700;white-space:nowrap}#pricing .home-price-note{color:#999;font-size:12px;line-height:1.5;margin:8px 0 0}.home-pricing-actions{display:flex;justify-content:center;margin-top:22px}@media(max-width:700px){#pricing .home-pricing-grid{grid-template-columns:1fr}#pricing .home-price-head{display:block}#pricing .home-price-from{display:block;margin-top:8px}}`;document.head.appendChild(s)}
async function load(){style();const root=document.querySelector('#pricing [data-home-pricing]');if(!root)return;root.innerHTML='<div class="card">Завантаження прайсу…</div>';try{const r=await fetch(API+'/public/services',{cache:'no-store'});if(!r.ok)throw Error('pricing_unavailable');const services=(Array.isArray(await r.json())?await fetch(API+'/public/services',{cache:'no-store'}):null);let list=[];const rr=await fetch(API+'/public/services',{cache:'no-store'});if(rr.ok)list=await rr.json();const active=(Array.isArray(list)?list:[]).filter(x=>x.active!==false);const used=new Set();const rows=PRICING_ORDER.map(item=>{let s=item.match?active.find(x=>!used.has(x.id)&&item.match(x)):active.find(x=>!used.has(x.id)&&String(x.title||'').trim().toLowerCase()===item.title.toLowerCase());if(s)used.add(s.id);const price=s?Number(String(s.price??'').replace(',','.').replace(/[^0-9.\-]/g,''))||0:0;return `<article class="home-price-card"><div class="home-price-head"><h3>${esc(item.title)}</h3>${price?`<span class="home-price-from">від ${money(price)} грн</span>`:''}</div><p class="home-price-note">${s&&s.description?esc(s.description):'Точна вартість залежить від породи, розміру та стану шерсті.'}</p></article>`}).join('');root.innerHTML=`<div class="home-pricing-grid">${rows}</div>`}catch(e){root.innerHTML='<div class="card">Прайс тимчасово недоступний.</div>'}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();