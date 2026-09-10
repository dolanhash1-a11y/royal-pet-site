(()=>{
const API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const money=v=>Number(v||0).toLocaleString('uk-UA');
const originalFetch=window.fetch.bind(window);

function numericPrice(v){const n=parseFloat(String(v??'').replace(',','.').replace(/[^0-9.\-]/g,''));return Number.isFinite(n)?n:0}

window.fetch=async function(input,init){
  const url=typeof input==='string'?input:(input?.url||'');
  const response=await originalFetch(input,init);
  if(url.includes('/content/service-pricing.json')){
    try{
      const base=await response.clone().json();
      const r=await originalFetch(API+'/services',{credentials:'include'});
      if(r.ok){
        const services=await r.json();
        base.services=base.services||{};
        services.forEach(s=>{
          const n=numericPrice(s.price);
          if(n>0){base.services[s.id]=base.services[s.id]||{};['small','medium','large'].forEach(k=>base.services[s.id][k]=n)}
        });
      }
      return new Response(JSON.stringify(base),{status:response.status,headers:{'Content-Type':'application/json'}});
    }catch{return response}
  }
  return response;
};

async function getServices(){const r=await originalFetch(API+'/services',{credentials:'include'});if(!r.ok)throw Error('Не вдалося завантажити прайс');return r.json()}
function getPricing(){return originalFetch('../content/service-pricing.json?v='+Date.now()).then(r=>r.json()).catch(()=>({categories:{small:'Мала',medium:'Середня',large:'Велика'},services:{}}))}
function style(){if(document.getElementById('rp-price-editor-style'))return;const s=document.createElement('style');s.id='rp-price-editor-style';s.textContent=`#view-pricing .price-edit-grid{display:grid;gap:12px}#view-pricing .price-row{display:grid;grid-template-columns:minmax(180px,1.5fr) repeat(3,minmax(120px,1fr)) minmax(110px,auto);gap:10px;align-items:center;padding:14px;border:1px solid rgba(215,173,85,.14);border-radius:12px;background:rgba(255,255,255,.02)}#view-pricing .price-row input{width:100%;box-sizing:border-box}#view-pricing .price-label{font-weight:700}#view-pricing .price-note{font-size:12px;color:#999}#view-pricing .price-status{min-height:18px;font-size:12px;color:#8bd69a}@media(max-width:900px){#view-pricing .price-row{grid-template-columns:1fr 1fr}#view-pricing .price-row .price-label{grid-column:1/-1}#view-pricing .price-row button{width:100%}}`;document.head.appendChild(s)}
async function render(){style();document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));let root=document.getElementById('view-pricing');if(!root){root=document.createElement('div');root.id='view-pricing';root.className='view';document.querySelector('.main')?.appendChild(root)}root.classList.remove('hidden');document.querySelectorAll('.nav-item').forEach(v=>v.classList.toggle('active',v.dataset.view==='pricing'));document.getElementById('page-title').textContent='Прайс';root.innerHTML='<div class="card">Завантаження прайсу…</div>';try{const [services,pricing]=await Promise.all([getServices(),getPricing()]);const p=pricing.services||{};const rows=services.filter(s=>s.active!==false).map(s=>{const sp=p[s.id]||{},base=numericPrice(s.price)||numericPrice(sp.medium);return `<div class="price-row" data-service="${esc(s.id)}"><div><div class="price-label">${esc(s.title)}</div><div class="price-note">Доплата за ковтуни: +${money(sp.light||0)} грн · сильні ковтуни: +${money(sp.severe||0)} грн</div></div><label>${esc(pricing.categories?.small||'Мала')}<input type="number" min="0" step="1" data-price-small value="${base}"></label><label>${esc(pricing.categories?.medium||'Середня')}<input type="number" min="0" step="1" data-price-medium value="${base}"></label><label>${esc(pricing.categories?.large||'Велика')}<input type="number" min="0" step="1" data-price-large value="${base}"></label><div><button class="small-btn gold" data-save-price="${esc(s.id)}">Зберегти</button><div class="price-status" data-price-status></div></div></div>`}).join('');root.innerHTML=`<div class="toolbar"><div><h3>Прайс</h3><span style="color:#aaa">Змінюйте базову ціну прямо тут. Зміна одразу зберігається.</span></div><button class="small-btn" id="price-reload">Оновити</button></div><div class="card"><div class="price-edit-grid">${rows||'<div>Послуг поки немає.</div>'}</div><div class="price-note" style="margin-top:14px">Стан шерсті: <b>Нормальний</b> — без доплати · <b>Є ковтуни</b> — за поточним прайсом · <b>Сильні ковтуни</b> — за поточним прайсом.</div><div class="price-note" style="margin-top:8px">Остаточна ціна конкретного запису не змінюється заднім числом.</div></div>`;root.querySelector('#price-reload').onclick=render;root.querySelectorAll('[data-save-price]').forEach(btn=>btn.onclick=async()=>{const row=btn.closest('.price-row'),status=row.querySelector('[data-price-status]');const vals=['small','medium','large'].map(k=>Number(row.querySelector(`[data-price-${k}]`).value));if(vals.some(v=>!Number.isFinite(v)||v<0)){status.textContent='Вкажіть коректну ціну';return}btn.disabled=true;status.textContent='Збереження…';try{const n=vals[1];const r=await originalFetch(API+'/services/'+encodeURIComponent(btn.dataset.savePrice),{method:'PATCH',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({price:String(n)})});const j=await r.json().catch(()=>({}));if(!r.ok)throw Error(j.error||`API ${r.status}`);status.textContent='Збережено ✓';vals.forEach((v,i)=>{row.querySelector(`[data-price-${['small','medium','large'][i]}]`).value=v});window.__rpPriceCacheBust=Date.now()}catch(e){status.textContent='Помилка: '+e.message}finally{btn.disabled=false}})}catch(e){root.innerHTML=`<div class="card error">Помилка: ${esc(e.message)}</div>`}}
function install(){const button=document.querySelector('[data-view="pricing"]');if(!button)return;if(button.dataset.priceEditorInstalled==='1')return;button.dataset.priceEditorInstalled='1';button.onclick=render}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
new MutationObserver(install).observe(document.body,{childList:true,subtree:true});
})();