(()=>{
  const API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const money=v=>Number(v||0).toLocaleString('uk-UA');
  const coatLabels={none:'Нормальний стан',light:'Є ковтуни',severe:'Сильні ковтуни / запущена шерсть'};
  const coatClasses={none:'coat-ok',light:'coat-light',severe:'coat-severe'};

  function meta(x){
    const raw=x?.additional_services||'';
    try{
      const o=JSON.parse(raw);
      if(o&&typeof o==='object'&&!Array.isArray(o))return o;
    }catch{}
    return {};
  }

  function serviceItems(m){
    return Array.isArray(m?.services)
      ? m.services.map(v=>typeof v==='string'?{title:v,price:null,surcharge:0}:v).filter(v=>v&&v.title)
      : [];
  }

  function installStyles(){
    if(document.getElementById('appointment-pricing-styles'))return;
    const style=document.createElement('style');
    style.id='appointment-pricing-styles';
    style.textContent=`
      #view-appointments table{min-width:1180px}
      #view-appointments .appointment-pricing-cell{min-width:310px;vertical-align:top}
      #view-appointments .appointment-price-cell{min-width:155px;vertical-align:top}
      #view-appointments .appointment-info{display:flex;flex-direction:column;gap:8px}
      #view-appointments .appointment-services{display:grid;gap:6px}
      #view-appointments .appointment-service{display:grid;grid-template-columns:1fr auto;gap:14px;align-items:baseline}
      #view-appointments .appointment-service-name{color:#f1eee7;font-weight:600}
      #view-appointments .appointment-service-price{font-weight:800;white-space:nowrap;color:#d7ad55}
      #view-appointments .appointment-meta-row{font-size:12px;color:#a8a39a}
      #view-appointments .coat-badge{display:inline-flex;width:max-content;padding:5px 9px;border-radius:999px;font-size:12px;font-weight:700}
      #view-appointments .coat-ok{background:rgba(90,170,105,.14);color:#8bd69a}
      #view-appointments .coat-light{background:rgba(225,170,60,.14);color:#e5bf6d}
      #view-appointments .coat-severe{background:rgba(210,85,70,.16);color:#ee9b8f}
      #view-appointments .appointment-total{font-size:18px;font-weight:800;color:#f4efe4}
      #view-appointments .appointment-final{font-size:18px;font-weight:800;color:#d7ad55}
      #view-appointments .appointment-label{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#8f8a80;margin-bottom:3px}
      #view-appointments .appointment-surcharge{font-size:12px;color:#cdb477;margin-top:-2px}
      #view-appointments .appointment-empty{color:#77736b}
      @media(max-width:1100px){#view-appointments .appointment-pricing-cell{min-width:250px}}
    `;
    document.head.appendChild(style);
  }

  function getRowId(row){
    const btn=row.querySelector('[data-edit],[data-id]');
    return btn?.dataset.edit||btn?.dataset.id||'';
  }

  function renderPricingCell(x){
    const m=meta(x);
    const services=serviceItems(m);
    const coat=String(m.coat_condition||'none');
    const coatLabel=coatLabels[coat]||coatLabels.none;
    const category=m.breed_category?String(m.breed_category):'';
    const estimated=Number(m.estimated_total||0);
    const hasFinal=m.final_price!==null&&m.final_price!==undefined&&m.final_price!==''&&!Number.isNaN(Number(m.final_price));
    const finalPrice=hasFinal?Number(m.final_price):null;

    const serviceHtml=services.length
      ? `<div class="appointment-services">${services.map(s=>{
          const price=s.price===null||s.price===undefined||s.price===''?null:Number(s.price);
          const surcharge=Number(s.surcharge||s.coat_surcharge||0);
          return `<div class="appointment-service"><span class="appointment-service-name">${esc(s.title)}</span><span class="appointment-service-price">${price===null?'—':money(price)+' грн'}</span></div>${surcharge?`<div class="appointment-surcharge">Доплата за стан шерсті: +${money(surcharge)} грн</div>`:''}`;
        }).join('')}</div>`
      : '<div class="appointment-meta-row appointment-empty">Послуги не вказані</div>';

    return `
      <td class="appointment-pricing-cell">
        <div class="appointment-info">
          ${category?`<div class="appointment-meta-row">Категорія: <b>${esc(category)}</b></div>`:''}
          <div class="appointment-label">Обрані послуги</div>
          ${serviceHtml}
          <span class="coat-badge ${esc(coatClasses[coat]||'coat-ok')}">Стан шерсті: ${esc(coatLabel)}</span>
        </div>
      </td>
      <td class="appointment-price-cell">
        ${hasFinal
          ? `<div class="appointment-label">Остаточна ціна</div><div class="appointment-final">${money(finalPrice)} грн</div>${estimated?`<div class="appointment-meta-row">Орієнтовно: ${money(estimated)} грн</div>`:''}`
          : `<div class="appointment-label">Орієнтовна ціна</div><div class="appointment-total">${estimated?money(estimated)+' грн':'—'}</div>`}
      </td>`;
  }

  async function refresh(root){
    if(!root||root.dataset.rpBusy==='1')return;
    const table=root.querySelector('table');
    const body=table?.querySelector('tbody');
    if(!table||!body)return;

    root.dataset.rpBusy='1';
    try{
      const r=await fetch(API+'/appointments',{credentials:'include',cache:'no-store'});
      if(!r.ok)throw new Error('Не вдалося завантажити записи');
      const records=await r.json();
      const map=new Map((Array.isArray(records)?records:[]).map(x=>[String(x.id),x]));
      const head=table.querySelector('thead tr');
      if(head&&!head.querySelector('[data-rp-pricing-col]')){
        head.insertAdjacentHTML('beforeend','<th data-rp-pricing-col>Послуги та стан шерсті</th><th data-rp-pricing-col>Вартість</th>');
      }
      body.querySelectorAll('tr').forEach(row=>{
        if(row.dataset.rpDone==='1')return;
        const id=getRowId(row);
        if(!id){return;}
        const x=map.get(String(id));
        row.insertAdjacentHTML('beforeend',x?renderPricingCell(x):'<td>—</td><td>—</td>');
        row.dataset.rpDone='1';
      });
    }catch(e){
      console.warn('[Royal Pet] pricing display:',e);
      root.dataset.rpRetry='1';
    }finally{
      root.dataset.rpBusy='0';
    }
  }

  function install(){
    installStyles();
    const root=document.getElementById('view-appointments');
    if(!root||root.dataset.rpObserver)return;
    root.dataset.rpObserver='1';
    const run=()=>refresh(root);
    new MutationObserver(()=>setTimeout(run,30)).observe(root,{childList:true,subtree:true});
    run();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
})();