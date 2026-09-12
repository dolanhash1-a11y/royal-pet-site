(()=>{
const API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
const CATEGORIES={
 complex:{title:'Комплекс',text:'Повний комплекс догляду з урахуванням породи та стану шерсті.'},
 hygiene:{title:'Гігієна',text:'Гігієнічні процедури для чистоти, комфорту та здоров’я улюбленця.'},
 adaptive:{title:'Адаптивний грумінг',text:'Дбайливий формат для улюбленців, яким потрібен адаптивний підхід.'},
 additional:{title:'Додаткові послуги',text:'Окремі процедури та доповнення до основного грумінгу.'}
};
const KEYS=Object.keys(CATEGORIES);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const img=v=>v&&String(v).startsWith('/uploads/')?'.'+v:String(v||'');
function normalizeCategory(x){
 const c=String(x?.category||'').trim().toLowerCase();
 if(c==='complex'||c==='комплекс'||c==='грумінг'||c==='грумінг / комплекс'||c==='комплексний грумінг'||c==='грумінг (комплекс)'||c==='комплексний грумінг / догляд')return'complex';
 if(c==='hygiene'||c==='гігієна'||c==='гігієнічний грумінг')return'hygiene';
 if(c==='adaptive'||c==='адаптивний грумінг')return'adaptive';
 if(c==='additional'||c==='додаткові послуги')return'additional';
 if(x?.id==='service-1')return'complex';
 if(x?.id==='service-2'||x?.id==='service-3'||x?.id==='service-5')return'hygiene';
 if(x?.id==='service-4')return'adaptive';
 return'complex';
}
async function getServices(){if(API){try{const r=await fetch(`${API}/public/services?sync=${Date.now()}`,{cache:'no-store'});if(r.ok){const d=await r.json();if(Array.isArray(d))return d.filter(x=>x.active!==false)}}catch{}}try{const path=location.pathname.includes('/services/')?'../../content/services.json':'content/services.json';const r=await fetch(`${path}?v=${Date.now()}`,{cache:'no-store'});const d=await r.json();return Array.isArray(d.items)?d.items.filter(x=>x.active!==false):[]}catch{return[]}}
function card(category,count){const c=CATEGORIES[category];return `<a class="service-category-card" href="services/${category}/"><div class="service-category-number">0${KEYS.indexOf(category)+1}</div><div><h3>${esc(c.title)}</h3><p>${esc(c.text)}${count?` Доступних позицій: ${count}.`:''}</p></div><span class="service-category-arrow">Переглянути →</span></a>`}
async function home(){const root=document.querySelector('[data-services]');if(!root)return;const items=await getServices();const counts=Object.fromEntries(KEYS.map(k=>[k,0]));items.forEach(x=>counts[normalizeCategory(x)]++);root.className='service-category-grid';root.dataset.serviceCategoriesRendered='1';root.innerHTML=KEYS.map(k=>card(k,counts[k])).join('');}
async function page(){const root=document.querySelector('[data-service-category-page]');if(!root)return;const key=String(root.dataset.serviceCategoryPage||'').trim();if(!KEYS.includes(key))return;const cat=CATEGORIES[key];root.innerHTML=`<section class="service-category-hero"><p class="eyebrow">Послуги</p><h1>${esc(cat.title)}</h1><p>${esc(cat.text)}</p><a class="text-link" href="../../#services">← Повернутися до послуг</a></section><section class="service-category-list-section"><div class="service-category-list" data-category-list><div class="service-loading">Завантаження…</div></div></section>`;const items=(await getServices()).filter(x=>normalizeCategory(x)===key);const list=root.querySelector('[data-category-list]');if(!items.length){list.innerHTML='<div class="service-empty">У цій категорії поки немає доданих позицій.</div>';return}list.innerHTML=items.sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0)).map(x=>{const price=String(x.price??'').trim();return `<article class="breed-price-card">${x.image?`<div class="breed-price-image"><img src="${esc(img(x.image))}" alt="${esc(x.title)}" loading="lazy"></div>`:''}<div class="breed-price-body"><h2>${esc(x.title||'Без назви')}</h2>${x.description?`<p>${esc(x.description)}</p>`:''}<strong>${price?esc(price)+(Number(price)===0?'':' грн'):'Ціна уточнюється'}</strong></div></article>`}).join('')}
function watchHome(){const root=document.querySelector('[data-services]');if(!root||root.dataset.serviceCategoriesWatch)return;root.dataset.serviceCategoriesWatch='1';const obs=new MutationObserver(()=>{if(!root.dataset.serviceCategoriesLock&&(!root.querySelector('.service-category-card')||root.children.length!==KEYS.length))home()});obs.observe(root,{childList:true});setTimeout(home,350)}
function run(){page();watchHome();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
