(()=>{
  const API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const money=v=>Number(v||0).toLocaleString('uk-UA');

  const coatLabels={
    none:'Нормальний стан',
    light:'Є ковтуни',
    severe:'Сильні ковтуни / запущена шерсть'
  };

  const coatClasses={
    none:'coat-ok',
    light:'coat-light',
    severe:'coat-severe'
  };

  function meta(x){
    const raw=x?.additional_services||'';
    try{
      const o=JSON.parse(raw);
      if(o&&typeof o==='object'&&!Array.isArray(o))return o;
    }catch{}
    return{};
  }

  function appointmentKey(x){
    return [x?.pet_name,x?.owner_name,x?.owner_contact,x?.breed]
      .map(v=>String(v??'').trim().toLowerCase())
      .join('|');
  }

  function serviceItems(m){
    if(!Array.isArray(m.services))return[];
    return m.services
      .map(v=>typeof v==='string'?{title:v,price:null,surcharge:0}:v)
      .filter(v=>v&&v.title);
  }

  function installStyles(){
    if(document.getElementById('appointment-pricing-styles'))return;
    const style=document.createElement('style');
    style.id='appointment-pricing-styles';
    style.textContent=`
      #view-appointments .appointment-pricing-cell{min-width:250px;vertical-align:top}
      #view-appointments .appointment-price-cell{min-width:140px;vertical-align:top}
      #view-appointments .appointment-info{display:flex;flex-direction:column;gap:7px}
      #view-appointments .appointment-services{display:flex;flex-direction:column;gap:4px}
      #view-appointments .appointment-service{display:flex;justify-content:space-between;gap:14px;line-height:1.35}
      #view-appointments .appointment-service-name{color:#f1eee7}
      #view-appointments .appointment-service-price{font-weight:700;white-space:nowrap;color:#d7ad55}
      #view-appointments .appointment-meta-row{font-size:12px;color:#a8a39a}
      #view-appointments .coat-badge{display:inline-flex;align-items:center;width:max-content;padding:4px 8px;border-radius:999px;font-size:12px;font-weight:700}
      #view-appointments .coat-ok{background:rgba(90,170,105,.14);color:#8bd69a}
      #view-appointments .coat-light{background:rgba(225,170,60,.14);color:#e5bf6d}
      #view-appointments .coat-severe{background:rgba(210,85,70,.16);color:#ee9b8f}
      #view-appointments .appointment-total{font-size:16px;font-weight:800;color:#f4efe4}
      #view-appointments .appointment-final{font-size:16px;font-weight:800;color:#d7ad55}
      #view-appointments .appointment-label{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#8f8a80}
      #view-appointments .appointment-surcharge{font-size:12px;color:#cdb477}
      @media(max-width:1100px){
        #view-appointments .appointment-pricing-cell{min-width:210px}
      }
    `;
    document.head.appendChild(style);
  }

  function findRecord(row,records){
    const cells=[...row.children].map(td=>td.textContent.replace(/\s+/g,' ').trim());
    const pet=(cells[1]||'').split(' ')[0].trim().toLowerCase();
    const breed=(cells[2]||'').trim().toLowerCase();
    const owner=(cells[3]||'').trim().toLowerCase();
    const contact=(cells[4]||'').trim().toLowerCase();
    return records.find(x=>{
      const okPet=String(x?.pet_name||'').trim().toLowerCase()===pet;
      const okBreed=String(x?.breed||'').trim().toLowerCase()===breed;
      const okOwner=String(x?.owner_name||'').trim().toLowerCase()===owner;
      const okContact=String(x?.owner_contact||'').trim().toLowerCase()===contact;
      return okPet&&okBreed&&okOwner&&okContact;
    }) || records.find(x=>appointmentKey(x)===appointmentKey({pet_name:pet,breed,owner_name:owner,owner_contact:contact}));
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
      : '<div class="appointment-meta-row">Послуги не вказані</div>';

    const serviceCell=`<td class="appointment-pricing-cell">
      <div class="appointment-info">
        ${category?`<div class="appointment-meta-row">Категорія: <b>${esc(category)}</b></div>`:''}
        ${serviceHtml}
        <span class="coat-badge ${esc(coatClasses[coat]||'coat-ok')}">Стан шерсті: ${esc(coatLabel)}</span>
      </div>
    </td>`;

    const priceCell=hasFinal
      ? `<td class="appointment-price-cell"><div class="appointment-label">Остаточна ціна</div><div class="appointment-final">${money(finalPrice)} грн</div>${estimated?`<div class="appointment-meta-row">Орієнтовно: ${money(estimated)} грн</div>`:''}</td>`
      : `<td class="appointment-price-cell"><div class="appointment-label">Орієнтовна ціна</div><div class="appointment-total">${estimated?money(estimated)+' грн':'—'}</div></td>`;

    return serviceCell+priceCell;
  }

  async function refreshPricingInAppointments(root){
    if(!root||root.dataset.pricingBusy==='1')return;
    const table=root.querySelector('table');
    const body=table?.querySelector('tbody');
    if(!table||!body)return;

    root.dataset.pricingBusy='1';
    try{
      const r=await fetch(API+'/appointments',{credentials:'include'});
      if(!r.ok)return;
      const records=await r.json();
      const head=table.querySelector('thead tr');

      if(head&&!head.querySelector('[data-pricing-col]')){
        head.insertAdjacentHTML('beforeend','<th data-pricing-col>Послуги та стан шерсті</th><th data-pricing-col>Вартість</th>');
      }

      [...body.querySelectorAll('tr')].forEach(tr=>{
        if(tr.dataset.pricingRow==='1')return;
        if(tr.children.length<6)return;
        const x=findRecord(tr,records);
        if(x)tr.insertAdjacentHTML('beforeend',renderPricingCell(x));
        else tr.insertAdjacentHTML('beforeend','<td class="appointment-pricing-cell">—</td><td class="appointment-price-cell">—</td>');
        tr.dataset.pricingRow='1';
      });

      table.dataset.pricingReady='1';
    }finally{
      root.dataset.pricingBusy='0';
    }
  }

  function install(){
    installStyles();
    const root=document.getElementById('view-appointments');
    if(!root||root.dataset.pricingObserver)return;
    root.dataset.pricingObserver='1';

    const run=()=>{
      const table=root.querySelector('table');
      if(table&&!table.dataset.pricingReady){
        refreshPricingInAppointments(root);
      }
    };

    new MutationObserver(()=>{
      const table=root.querySelector('table');
      if(table&&!table.dataset.pricingReady)run();
    }).observe(root,{childList:true,subtree:true});

    run();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
})();