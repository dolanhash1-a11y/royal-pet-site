(()=>{
const API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
const esc=v=>String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]));
const money=v=>Number(v||0).toLocaleString('uk-UA');
const PRICING_ORDER=[
 {key:'complex',title:'Комплекс',price:600},
 {key:'hygiene',title:'Гігієна',price:600},
 {key:'adaptive',title:'Адаптація',price:500},
 {key:'sheddingBath',title:'Вичісування линяючої шерсті шпіца + купання',price:900},
 {key:'shedding',title:'Вичісування линяючої шерсті шпіца',price:500},
 {key:'tangles',title:'Вичісування ковтунів',price:300},
 {key:'shaveTangles',title:'Збривання ковтунів',price:400},
 {key:'bath10',title:'Купання до 10 кг',price:500},
 {key:'teeth',title:'Гігієна зубів',price:100},
 {key:'eyes',title:'Гігієна очей',price:100}
];
function style(){if(document.getElementById('home-pricing-style'))return;const s=document.createElement('style');s.id='home-pricing-style';s.textContent=`#pricing .home-pricing-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:24px}#pricing .home-price-card{padding:20px;border:1px solid rgba(215,173,85,.18);border-radius:16px;background:rgba(255,255,255,.02)}#pricing .home-price-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}#pricing .home-price-card h3{margin:0;font-size:24px}#pricing .home-price-from{color:#d7ad55;font-weight:700;white-space:nowrap}#pricing .home-price-note{color:#999;font-size:12px;line-height:1.5;margin:8px 0 0}.home-pricing-actions{display:flex;justify-content:center;margin-top:22px}@media(max-width:700px){#pricing .home-pricing-grid{grid-template-columns:1fr}#pricing .home-price-head{display:block}#pricing .home-price-from{display:block;margin-top:8px}}`;document.head.appendChild(s)}
function normalizeTitle(x){return String(x||'').trim().toLowerCase().replace(/\s+/g,' ')}
function titlePrice(s){const t=normalizeTitle(s?.title);if(/комплекс/.test(t))return 600;if(/гігієн/.test(t))return 600;if(/адаптив|адаптац/.test(t))return 500;if(t.includes('вичісування линяючої шерсті шпіца + купання'))return 900;if(t.includes('вичісування линяючої шерсті шпіца'))return 500;if(t.includes('вичісування ковтунів'))return 300;if(t.includes('збривання ковтунів'))return 400;if(t.includes('купання до 10 кг'))return 500;if(/зуб/.test(t))return 100;if(/оч/.test(t))return 100;return Number(String(s?.price??'').replace(',','.').replace(/[^0-9.\-]/g,''))||0}
async function load(){style();const root=document.querySelector('#pricing [data-home-pricing]');if(!root)return;root.innerHTML='<div class="card">Завантаження прайсу…</div>';try{let active=[];const r=await fetch(API+'/public/services?sync='+Date.now(),{cache:'no-store'});if(r.ok){const list=await r.json();active=(Array.isArray(list)?list:[]).filter(x=>x.active!==false)}const used=new Set();const rows=PRICING_ORDER.map(item=>{const s=active.find(x=>{const t=normalizeTitle(x.title);if(used.has(x.id))return false;if(item.key==='complex')return /комплекс/.test(t);if(item.key==='hygiene')return /гігієн/.test(t);if(item.key==='adaptive')return /адаптив|адаптац/.test(t);return t===normalizeTitle(item.title)});if(s)used.add(s.id);const price=s?titlePrice(s):item.price;return `<article class="home-price-card"><div class="home-price-head"><h3>${esc(item.title)}</h3><span class="home-price-from">від ${money(price)} грн</span></div><p class="home-price-note">${s&&s.description?esc(s.description):'Точна вартість залежить від породи, розміру та стану шерсті.'}</p></article>`}).join('');root.innerHTML=`<div class="home-pricing-grid">${rows}</div>`}catch(e){root.innerHTML='<div class="card">Прайс тимчасово недоступний.</div>'}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();