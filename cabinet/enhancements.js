(()=>{
  const API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const fmt=v=>{if(!v)return'—';const d=new Date(v);return isNaN(d)?v:d.toLocaleString('uk-UA',{dateStyle:'short',timeStyle:'short'})};
  async function getAppointments(){const r=await fetch(API+'/appointments',{credentials:'include'});if(!r.ok)throw Error('Не вдалося отримати записи');return r.json()}

  function addNav(){
    const nav=document.querySelector('.sidebar nav');
    if(!nav||document.querySelector('[data-view="calendar"]'))return;
    nav.insertAdjacentHTML('beforeend','<button class="nav-item" data-view="calendar">▦ <span>Календар</span></button><button class="nav-item" data-view="clients">♙ <span>Клієнти</span></button>');
    ['calendar','clients'].forEach(v=>document.querySelector(`[data-view="${v}"]`).onclick=()=>showEnhanced(v));
  }

  function addViews(){
    const main=document.querySelector('.main');
    if(!main)return;
    if(!document.getElementById('view-calendar'))main.insertAdjacentHTML('beforeend','<div id="view-calendar" class="view hidden"></div><div id="view-clients" class="view hidden"></div>');
  }

  function addNotification(){
    const top=document.querySelector('.topbar');
    if(!top||document.getElementById('notify-btn'))return;
    const b=document.createElement('button');
    b.id='notify-btn';b.className='notify-button';b.type='button';
    b.innerHTML='🔔 <span id="notify-count">0</span>';b.title='Нові заявки';
    b.onclick=()=>document.querySelector('[data-view="appointments"]')?.click();
    top.appendChild(b);
  }

  async function refreshNotification(){
    try{
      const a=await getAppointments(),n=a.filter(x=>x.status==='new').length;
      const el=document.getElementById('notify-count');if(el)el.textContent=n;
      const badge=document.getElementById('new-count');if(badge)badge.textContent=n;
    }catch{}
  }

  function enhanceDashboard(){
    const root=document.getElementById('view-dashboard'),table=root?.querySelector('.table');
    if(!table||table.dataset.ownerEnhanced||table.dataset.ownerEnhancing)return;
    table.dataset.ownerEnhancing='1';
    const head=table.querySelector('thead tr');
    if(!head){delete table.dataset.ownerEnhancing;return}
    const th=document.createElement('th');th.textContent='Господар';head.insertBefore(th,head.children[2]||null);
    const rows=[...table.querySelectorAll('tbody tr')];
    getAppointments().then(a=>{
      rows.forEach(row=>{
        if(row.dataset.ownerDone)return;
        const pet=row.children[1]?.textContent.trim();
        const x=a.find(z=>z.pet_name===pet);
        const td=document.createElement('td');td.textContent=x?.owner_name||'—';
        row.insertBefore(td,row.children[2]||null);row.dataset.ownerDone='1';
      });
      table.dataset.ownerEnhanced='1';delete table.dataset.ownerEnhancing;
    }).catch(()=>{
      const headCells=[...table.querySelectorAll('thead th')];
      if(headCells[2]?.textContent==='Господар')headCells[2].remove();
      delete table.dataset.ownerEnhancing;
    });
  }

  function enhancedNav(v){
    document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.view===v));
    const title=document.getElementById('page-title');
    if(title)title.textContent=v==='calendar'?'Календар':'Клієнти';
  }

  async function showEnhanced(v){
    document.querySelectorAll('.view').forEach(x=>x.classList.add('hidden'));
    const target=document.getElementById('view-'+v);if(!target)return;
    target.classList.remove('hidden');enhancedNav(v);
    try{const a=await getAppointments();v==='calendar'?renderCalendar(a):renderClients(a)}
    catch(e){target.innerHTML=`<div class="card error">Помилка: ${esc(e.message)}</div>`}
  }

  function renderCalendar(a){
    const root=document.getElementById('view-calendar'),now=new Date();now.setHours(0,0,0,0);
    const end=new Date(now);end.setDate(end.getDate()+14);
    const upcoming=a.filter(x=>{const d=new Date(x.preferred_time);return !isNaN(d)&&d>=now&&d<end&&x.status!=='cancelled'}).sort((x,y)=>new Date(x.preferred_time)-new Date(y.preferred_time));
    const groups={};
    upcoming.forEach(x=>{const d=new Date(x.preferred_time),key=d.toLocaleDateString('uk-UA',{weekday:'long',day:'numeric',month:'long'});(groups[key]??=[]).push(x)});
    root.innerHTML=`<div class="toolbar"><div><h3>Найближчі 14 днів</h3><span style="color:#aaa">${upcoming.length} записів</span></div><button class="small-btn" id="cal-refresh">Оновити</button></div>${Object.keys(groups).length?Object.entries(groups).map(([day,items])=>`<div class="calendar-day"><h3>${esc(day)}</h3><div class="calendar-list">${items.map(x=>`<div class="card calendar-item"><div class="calendar-time">${esc(new Date(x.preferred_time).toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit'}))}</div><div><b>${esc(x.pet_name)}</b><span>${esc(x.breed||'Без породи')}</span></div><div><b>${esc(x.owner_name||'—')}</b><span>${esc(x.owner_contact)}</span></div><div><span class="badge ${esc(x.status)}">${esc(({new:'Нова',confirmed:'Підтверджена',done:'Виконана'})[x.status]||x.status)}</span></div></div>`).join('')}</div></div>`).join(''):'<div class="card">На найближчі 14 днів записів немає.</div>'}`;
    const b=document.getElementById('cal-refresh');if(b)b.onclick=()=>showEnhanced('calendar');
  }

  function openClientCard(client){
    const visits=[...client.visits].sort((a,b)=>new Date(b.preferred_time)-new Date(a.preferred_time));
    const pets=[...client.pets].sort((a,b)=>String(a).localeCompare(String(b),'uk'));
    const rows=visits.map(x=>`<tr><td>${esc(fmt(x.preferred_time))}</td><td><b>${esc(x.pet_name||'—')}</b></td><td>${esc(x.breed||'—')}</td><td>${esc(({new:'Нова',confirmed:'Підтверджена',done:'Виконана',cancelled:'Скасована'})[x.status]||x.status||'—')}</td><td>${esc(x.additional_services||'—')}</td><td>${esc(x.comment||'—')}</td></tr>`).join('');
    const petsText=pets.length?pets.map(esc).join(', '):'—';
    const html=`<h3>Картка клієнта</h3><div class="card" style="margin-bottom:14px"><div style="display:grid;gap:8px"><div><b>Господар:</b> ${esc(client.name)}</div><div><b>Телефон:</b> ${esc(client.contact)}</div><div><b>Улюбленці:</b> ${petsText}</div><div><b>Візитів:</b> ${client.visits.length}</div><div><b>Останній запис:</b> ${esc(fmt(client.last))}</div></div></div><h4 style="margin:0 0 10px">Історія відвідувань</h4><div class="table-wrap"><table class="table"><thead><tr><th>Дата</th><th>Улюбленець</th><th>Порода</th><th>Статус</th><th>Додаткові послуги</th><th>Коментар</th></tr></thead><tbody>${rows||'<tr><td colspan="6">Історії ще немає.</td></tr>'}</tbody></table></div><div class="modal-actions"><button class="small-btn" onclick="closeModal()">Закрити</button></div>`;
    if(typeof window.modal==='function')window.modal(html);
  }

  function renderClients(a){
    const root=document.getElementById('view-clients'),map=new Map();
    a.forEach(x=>{
      const key=(x.owner_contact||'').trim().toLowerCase()||x.id;
      const old=map.get(key);
      if(!old)map.set(key,{name:x.owner_name||'—',contact:x.owner_contact||'—',pets:new Set([x.pet_name||'—']),visits:[x],last:x.preferred_time});
      else{
        if(old.name==='—'&&x.owner_name)old.name=x.owner_name;
        old.pets.add(x.pet_name||'—');old.visits.push(x);
        if(new Date(x.preferred_time)>new Date(old.last))old.last=x.preferred_time;
      }
    });
    const clients=[...map.values()].sort((a,b)=>b.visits.length-a.visits.length);
    root.innerHTML=`<div class="toolbar"><div><h3>Клієнти</h3><span style="color:#aaa">${clients.length} контактів · натисніть на клієнта для повної картки</span></div><input id="client-search" placeholder="Пошук господаря, телефону або улюбленця"></div><div class="card table-wrap"><table class="table"><thead><tr><th>Господар</th><th>Телефон</th><th>Улюбленці</th><th>Візитів</th><th>Останній запис</th><th></th></tr></thead><tbody id="client-body">${clients.map((c,i)=>`<tr data-client-index="${i}" style="cursor:pointer"><td><b>${esc(c.name)}</b></td><td>${esc(c.contact)}</td><td>${[...c.pets].map(esc).join(', ')}</td><td>${c.visits.length}</td><td>${esc(fmt(c.last))}</td><td><button class="small-btn" type="button" data-client-open="${i}">Відкрити</button></td></tr>`).join('')||'<tr><td colspan="6">Клієнтів поки немає.</td></tr>'}</tbody></table></div>`;
    const search=document.getElementById('client-search');
    if(search)search.oninput=()=>{const q=search.value.toLowerCase();document.querySelectorAll('#client-body tr').forEach(tr=>tr.style.display=tr.textContent.toLowerCase().includes(q)?'':'none')};
    const body=document.getElementById('client-body');
    if(body)body.onclick=e=>{const row=e.target.closest('tr[data-client-index]');if(!row)return;openClientCard(clients[Number(row.dataset.clientIndex)])};
  }

  function boot(){
    addNav();addViews();addNotification();refreshNotification();setInterval(refreshNotification,60000);
    const root=document.getElementById('view-dashboard');
    if(root){const observer=new MutationObserver(enhanceDashboard);observer.observe(root,{childList:true,subtree:true});enhanceDashboard()}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
