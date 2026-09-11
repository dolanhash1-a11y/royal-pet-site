(()=>{
  const API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
  const rootId='view-appointments';
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const money=v=>Number(v||0).toLocaleString('uk-UA');
  const fmt=v=>{if(!v)return'—';const d=new Date(v);return isNaN(d)?String(v):d.toLocaleString('uk-UA',{dateStyle:'medium',timeStyle:'short'})};
  const animalLabels={dog:'Собака',cat:'Кіт'};
  const categoryLabels={small:'Мала',medium:'Середня',large:'Велика',other:'Інша'};
  const coatLabels={none:'Шерсть у нормальному стані',light:'Є ковтуни',severe:'Сильні ковтуни / запущена шерсть'};
  const statusLabels={new:'Нова',confirmed:'Підтверджена',done:'Виконана',cancelled:'Скасована'};

  function meta(x){
    try{
      const raw=String(x?.additional_services||'');
      const m=JSON.parse(raw);
      if(m&&typeof m==='object'&&!Array.isArray(m))return m;
    }catch{}
    return {services:[]};
  }

  function serviceRows(x){
    const m=meta(x);
    let items=Array.isArray(m.services)?m.services.filter(Boolean):[];
    if(!items.length){
      const raw=String(x?.additional_services||'').trim();
      if(raw&&!raw.startsWith('{'))items=raw.split(',').map(v=>v.trim()).filter(Boolean).map(title=>({title,price:null,surcharge:0}));
    }
    if(!items.length)return '<div class="m-appt-empty">Послуги не зазначені</div>';
    return items.map(s=>{
      const p=Number(s.price);
      const sur=Number(s.surcharge??s.coat_surcharge??0);
      return `<div class="m-appt-service"><span>${esc(s.title||'Послуга')}</span><strong>${Number.isFinite(p)&&p>0?money(p)+' грн':'—'}</strong>${sur?`<small>Доплата +${money(sur)} грн</small>`:''}</div>`;
    }).join('');
  }

  function priceBlock(x){
    const m=meta(x);
    const estimated=Number(m.estimated_total??x.estimated_total??0)||0;
    const finalRaw=m.final_price??x.final_price;
    const hasFinal=finalRaw!==null&&finalRaw!==undefined&&String(finalRaw)!==''&&!Number.isNaN(Number(finalRaw));
    const final=hasFinal?Number(finalRaw):estimated;
    if(!final&&!estimated)return '<div class="m-appt-price-empty">Ціну ще не визначено</div>';
    return `<div class="m-appt-price"><span>${hasFinal?'До оплати':'Орієнтовна ціна'}</span><strong>${money(final)} грн</strong>${hasFinal&&estimated?`<small>Орієнтовно: ${money(estimated)} грн</small>`:''}</div>`;
  }

  function card(x){
    const m=meta(x);
    const animal=animalLabels[x.animal_type||m.animal_type]||x.animal_type||m.animal_type||'—';
    const category=categoryLabels[x.breed_category||m.breed_category]||x.breed_category||m.breed_category||'—';
    const coat=coatLabels[m.coat_condition||'none']||m.coat_condition||'—';
    const status=statusLabels[x.status]||x.status||'—';
    const statusClass=esc(x.status||'');
    return `<article class="m-appt-card" data-id="${esc(x.id)}" data-search="${esc([x.pet_name,x.age,x.breed,x.owner_name,x.owner_contact,x.comment,m.animal_type,m.breed_category,m.coat_condition].join(' '))}">
      <div class="m-appt-head">
        <div><div class="m-appt-pet">${esc(x.pet_name||'Без імені')}</div><div class="m-appt-time">${esc(fmt(x.preferred_time))}</div></div>
        <span class="badge ${statusClass}">${esc(status)}</span>
      </div>
      <div class="m-appt-section"><div class="m-appt-section-title">Улюбленець</div><div class="m-appt-grid">
        <div><small>Тип</small><b>${esc(animal)}</b></div>
        <div><small>Вік</small><b>${esc(x.age||'—')}</b></div>
        <div><small>Порода</small><b>${esc(x.breed||m.breed||'—')}</b></div>
        <div><small>Розмір</small><b>${esc(category)}</b></div>
        <div><small>Стан шерсті</small><b>${esc(coat)}</b></div>
        <div><small>Останній грумінг</small><b>${esc(x.last_grooming||'—')}</b></div>
      </div></div>
      <div class="m-appt-section"><div class="m-appt-section-title">Господар</div><div class="m-appt-grid">
        <div><small>Ім’я</small><b>${esc(x.owner_name||'—')}</b></div>
        <div><small>Контакт</small><b>${esc(x.owner_contact||'—')}</b></div>
      </div></div>
      <div class="m-appt-section"><div class="m-appt-section-title">Послуги</div><div class="m-appt-services">${serviceRows(x)}</div></div>
      <div class="m-appt-price-wrap">${priceBlock(x)}</div>
      <div class="m-appt-section"><div class="m-appt-section-title">Додатково</div><div class="m-appt-extra"><div><small>Домашній догляд</small><span>${esc(x.home_care||'—')}</span></div><div><small>Коментар</small><span>${esc(x.comment||'—')}</span></div></div></div>
      <div class="m-appt-actions">
        <button class="small-btn" type="button" data-edit="${esc(x.id)}">Редагувати</button>
        ${x.status==='new'?`<button class="small-btn gold" type="button" data-status="confirmed" data-id="${esc(x.id)}">Підтвердити</button>`:''}
        ${!['done','cancelled'].includes(x.status)?`<button class="small-btn" type="button" data-status="done" data-id="${esc(x.id)}">Виконано</button><button class="small-btn danger" type="button" data-status="cancelled" data-id="${esc(x.id)}">Скасувати</button>`:''}
        <button class="small-btn danger" type="button" data-delete="${esc(x.id)}">Видалити</button>
      </div>
    </article>`;
  }

  function css(){
    if(document.getElementById('mobile-appt-css'))return;
    const s=document.createElement('style');
    s.id='mobile-appt-css';
    s.textContent=`
      @media(max-width:520px){
        #view-appointments .table-wrap{display:none}
        #view-appointments .toolbar{display:grid;grid-template-columns:1fr;gap:8px}
        #view-appointments .toolbar #m-appt-count{font-size:11px;color:#9b9489}
        .m-appt-list{display:grid;gap:12px}
        .m-appt-card{background:linear-gradient(145deg,#121212,#0c0c0c);border:1px solid #2a2418;border-radius:16px;padding:15px;box-shadow:0 12px 26px rgba(0,0,0,.18)}
        .m-appt-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding-bottom:12px;border-bottom:1px solid #272116}
        .m-appt-pet{font-family:'Cormorant Garamond',serif;font-size:27px;line-height:1.05;color:#f1d48a;font-weight:600}
        .m-appt-time{margin-top:5px;font-size:12px;color:#aaa39a;line-height:1.35}
        .m-appt-section{padding-top:13px}.m-appt-section-title{font-size:11px;text-transform:uppercase;letter-spacing:1.2px;color:#9e9587;margin-bottom:9px}
        .m-appt-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.m-appt-grid>div,.m-appt-extra>div{min-width:0;background:#101010;border:1px solid #211c15;border-radius:10px;padding:9px}
        .m-appt-grid small,.m-appt-extra small{display:block;color:#77716a;font-size:9px;margin-bottom:4px}.m-appt-grid b{display:block;color:#ddd6ca;font-size:12px;line-height:1.35;overflow-wrap:anywhere}
        .m-appt-services{display:grid;gap:7px}.m-appt-service{display:grid;grid-template-columns:1fr auto;gap:6px 8px;padding:9px 10px;border:1px solid #211c15;border-radius:10px;background:#101010;font-size:12px}.m-appt-service strong{color:#d7ad55}.m-appt-service small{grid-column:1/-1;color:#b99f67;font-size:10px}
        .m-appt-empty,.m-appt-price-empty{color:#777;font-size:11px}.m-appt-price-wrap{padding-top:13px}.m-appt-price{border:1px solid rgba(215,173,85,.28);background:rgba(215,173,85,.055);border-radius:12px;padding:11px 12px;display:grid;grid-template-columns:1fr auto;align-items:center;gap:4px 8px}.m-appt-price span{font-size:10px;color:#9f9688;text-transform:uppercase;letter-spacing:1px}.m-appt-price strong{font-size:20px;color:#f1d48a}.m-appt-price small{grid-column:1/-1;color:#888;font-size:10px}.m-appt-extra{display:grid;gap:8px}.m-appt-extra span{display:block;color:#d2cabf;font-size:12px;line-height:1.45;overflow-wrap:anywhere}.m-appt-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:14px;padding-top:12px;border-top:1px solid #272116}.m-appt-actions .small-btn{width:100%;min-height:42px}
      }
    `;
    document.head.appendChild(s);
  }

  async function load(){
    const r=await fetch(API+'/appointments',{credentials:'include',cache:'no-store'});
    let j={};try{j=await r.json()}catch{}
    if(!r.ok)throw Error(j.error||`API ${r.status}`);
    return Array.isArray(j)?j:[];
  }

  function render(a){
    const root=document.getElementById(rootId);if(!root)return;
    root.innerHTML=`<div class="toolbar">
      <button class="small-btn gold" id="m-add-a" type="button">＋ Новий запис</button>
      <input id="m-search" placeholder="Пошук господаря, телефону, улюбленця або породи">
      <select id="m-filter"><option value="">Усі статуси</option><option value="new">Нові</option><option value="confirmed">Підтверджені</option><option value="done">Виконані</option><option value="cancelled">Скасовані</option></select>
      <span id="m-appt-count"></span>
      <button class="small-btn" id="m-refresh-a" type="button">Оновити</button>
    </div><div class="m-appt-list" id="m-appt-list"></div>`;
    const list=document.getElementById('m-appt-list'),search=document.getElementById('m-search'),filter=document.getElementById('m-filter'),count=document.getElementById('m-appt-count');
    const draw=()=>{
      const q=search.value.trim().toLowerCase(),f=filter.value;
      const visible=a.filter(x=>(!f||x.status===f)&&(!q||`${x.pet_name} ${x.owner_name||''} ${x.owner_contact||''} ${x.breed||''} ${x.comment||''} ${x.age||''}`.toLowerCase().includes(q))).sort((x,y)=>new Date(x.preferred_time||0)-new Date(y.preferred_time||0));
      count.textContent=`Показано: ${visible.length} із ${a.length}`;
      list.innerHTML=visible.length?visible.map(card).join(''):'<div class="card">Записів не знайдено.</div>';
    };
    draw();
    document.getElementById('m-add-a').onclick=()=>window.showAppointment?.();
    document.getElementById('m-refresh-a').onclick=()=>boot(true);
    search.oninput=draw;filter.onchange=draw;
    list.onclick=async ev=>{
      const b=ev.target.closest('button');if(!b)return;
      const id=b.dataset.id||b.dataset.edit||b.dataset.delete||'';
      const x=a.find(z=>String(z.id)===String(id));if(!x)return;
      if(b.dataset.edit){window.showAppointment?.(x);return}
      try{
        if(b.dataset.delete){if(!confirm(`Видалити запис для ${x.pet_name||''}?`))return;await api(`/appointments/${encodeURIComponent(x.id)}`,{method:'DELETE'});}
        else if(b.dataset.status){await api(`/appointments/${encodeURIComponent(x.id)}`,{method:'PATCH',body:JSON.stringify({status:b.dataset.status})});}
        await boot(true);
        window.dashboard?.();
      }catch(e){alert(e.message)}
    };
  }

  async function api(path,opts={}){
    const r=await fetch(API+path,{credentials:'include',headers:{'Content-Type':'application/json',...(opts.headers||{})},...opts});
    let j={};try{j=await r.json()}catch{}
    if(!r.ok)throw Error(j.error||`API ${r.status}`);
    return j;
  }

  let running=false;
  async function boot(force){
    if(window.innerWidth>520)return;
    css();
    const root=document.getElementById(rootId);if(!root)return;
    if(running&&!force)return;
    running=true;
    try{render(await load())}catch(e){root.innerHTML=`<div class="card error">Помилка: ${esc(e.message)}</div>`}finally{running=false}
  }

  function observe(){
    const root=document.getElementById(rootId);if(!root)return;
    const observer=new MutationObserver(()=>{
      if(window.innerWidth>520)return;
      if(root.classList.contains('hidden'))return;
      if(root.querySelector('.m-appt-list'))return;
      setTimeout(()=>boot(false),50);
    });
    observer.observe(root,{childList:true,subtree:true});
    window.addEventListener('resize',()=>{if(window.innerWidth<=520&&!root.classList.contains('hidden'))boot(false)});
    setTimeout(()=>{if(!root.classList.contains('hidden'))boot(false)},150);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});else observe();
})();
