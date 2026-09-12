(()=>{
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const getDateTime=v=>{const m=String(v||'').match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);return m?{date:m[1],time:m[2]}:null};
  const labelDate=d=>{try{return new Intl.DateTimeFormat('uk-UA',{weekday:'long',day:'numeric',month:'long'}).format(new Date(`${d}T12:00:00`)).replace(/^./,x=>x.toUpperCase())}catch{return d}};
  const blocked=s=>['cancelled','canceled','done','completed','rejected'].includes(String(s||'').toLowerCase());
  const reviewStatus=s=>['done','completed'].includes(String(s||'').toLowerCase());
  const tomorrowKey=()=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  function addReviewStyles(){if(document.getElementById('review-reminder-styles'))return;const s=document.createElement('style');s.id='review-reminder-styles';s.textContent='.review-reminder{display:flex;gap:13px;align-items:flex-start;margin:18px 0 2px;padding:16px;border:1px solid rgba(215,173,85,.28);border-radius:18px;background:linear-gradient(145deg,rgba(215,173,85,.095),rgba(255,255,255,.02));box-shadow:0 10px 28px rgba(0,0,0,.16)}.review-reminder-icon{width:40px;height:40px;flex:0 0 40px;border-radius:50%;display:grid;place-items:center;background:rgba(215,173,85,.12);border:1px solid rgba(215,173,85,.28);color:var(--gold);font-size:18px}.review-reminder-body{min-width:0;flex:1}.review-reminder-body strong{display:block;font-size:17px}.review-reminder-body p{margin:4px 0 11px;color:var(--muted);font-size:13px;line-height:1.45}.review-reminder-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.review-reminder-actions .primary,.review-reminder-actions .ghost{margin:0;min-height:42px;padding:10px 11px;font-size:13px}@media(max-width:520px){.review-reminder{padding:14px}.review-reminder-actions{grid-template-columns:1fr}.review-reminder-icon{width:36px;height:36px;flex-basis:36px;font-size:16px}}';document.head.appendChild(s)}
  function reviewNotice(items){
    const profile=document.getElementById('profile-pets');if(!profile)return;
    const old=document.getElementById('profile-review-reminder');if(old)old.remove();
    const list=Array.isArray(items)?items:[];const done=list.filter(x=>reviewStatus(x.status));if(!done.length)return;
    if(localStorage.getItem('royal_pet_review_dismissed')==='1')return;
    addReviewStyles();const item=done[0],pet=esc(item?.pet_name||'вашого улюбленця');
    const notice=document.createElement('section');notice.id='profile-review-reminder';notice.className='review-reminder';
    notice.innerHTML=`<div class="review-reminder-icon">★</div><div class="review-reminder-body"><strong>Як вам грумінг?</strong><p>Залиште короткий відгук про візит ${pet}. Це допомагає нам ставати кращими.</p><div class="review-reminder-actions"><button type="button" class="primary review-go">Залишити відгук</button><button type="button" class="ghost review-later">Не зараз</button></div></div>`;
    profile.after(notice);
    notice.querySelector('.review-go')?.addEventListener('click',()=>{const section=document.getElementById('reviews');if(section){section.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>section.querySelector('input[name="name"]')?.focus(),450)}});
    notice.querySelector('.review-later')?.addEventListener('click',()=>{localStorage.setItem('royal_pet_review_dismissed','1');notice.remove()});
  }
  function tomorrowNotice(items){
    const profile=document.getElementById('profile-pets');if(!profile)return;
    const old=document.getElementById('profile-tomorrow-reminder');if(old)old.remove();
    const key='royal_pet_tomorrow_notice_dismissed';if(localStorage.getItem(key)===tomorrowKey())return;
    const tomorrow=tomorrowKey();
    const item=(Array.isArray(items)?items:[]).filter(x=>{const dt=getDateTime(x.preferred_time);if(!dt||dt.date!==tomorrow||blocked(x.status))return false;return new Date(x.preferred_time)>new Date()}).sort((a,b)=>String(a.preferred_time).localeCompare(String(b.preferred_time)))[0];
    if(!item)return;
    addReviewStyles();const pet=esc(item.pet_name||'Улюбленець'),dt=getDateTime(item.preferred_time),services=esc(item.additional_services||item.services||'грумінг');
    const notice=document.createElement('section');notice.id='profile-tomorrow-reminder';notice.className='review-reminder';
    notice.innerHTML=`<div class="review-reminder-icon">🗓</div><div class="review-reminder-body"><strong>Завтра у вас грумінг</strong><p><b>${pet}</b> записаний${dt?.time?` на <b>${dt.time}</b>`:''}. Послуги: ${services}.</p><div class="review-reminder-actions"><button type="button" class="primary tomorrow-view">Переглянути запис</button><button type="button" class="ghost tomorrow-close">Зрозуміло</button></div></div>`;
    profile.after(notice);
    notice.querySelector('.tomorrow-view')?.addEventListener('click',()=>{location.hash='appointments';window.dispatchEvent(new HashChangeEvent('hashchange'))});
    notice.querySelector('.tomorrow-close')?.addEventListener('click',()=>{localStorage.setItem(key,tomorrow);notice.remove()});
  }
  function groupAppointments(){
    const root=document.getElementById('appointments-list');if(!root)return;const cards=[...root.querySelectorAll('.appointment-item')];if(!cards.length||root.dataset.grouped==='1')return;
    const now=new Date();const rows=cards.map(card=>{const text=card.querySelector('.appointment-time')?.textContent||'';const m=text.match(/(\d{4}-\d{2}-\d{2})\s*[· ]\s*(\d{1,2}):(\d{2})/);const dt=m?new Date(`${m[1]}T${m[2].padStart(2,'0')}:${m[3]}`):null;const status=card.querySelector('.appointment-top span')?.textContent||'';return {card,dt,active:!blocked(status)&&dt&&!Number.isNaN(dt.getTime())&&dt>=now}});
    const upcoming=rows.filter(x=>x.active).sort((a,b)=>a.dt-b.dt),history=rows.filter(x=>!x.active).sort((a,b)=>(b.dt?.getTime()||0)-(a.dt?.getTime()||0));const frag=document.createDocumentFragment();const heading=(text,extra='')=>{const h=document.createElement('div');h.className=`history-title appointments-group-title ${extra}`;h.textContent=text;return h};
    if(upcoming.length){frag.append(heading('Найближчі записи'));upcoming.forEach(x=>frag.append(x.card))}if(history.length){frag.append(heading('Історія записів','appointments-history-heading'));history.forEach(x=>frag.append(x.card))}root.innerHTML='';root.append(frag);root.dataset.grouped='1';
  }
  async function render(){
    const pets=document.getElementById('profile-pets');if(!pets||!window.customerAuth?.me||!window.customerAuth?.appointments)return;let user=null,items=[];try{user=await window.customerAuth.me();if(user)items=await window.customerAuth.appointments()}catch{return}if(!user)return;reviewNotice(items);tomorrowNotice(items);
    const now=new Date();const future=(Array.isArray(items)?items:[]).filter(x=>{const dt=getDateTime(x.preferred_time);if(!dt)return false;const status=String(x.status||'').toLowerCase();if(blocked(status))return false;return new Date(x.preferred_time)>now}).sort((a,b)=>String(a.preferred_time).localeCompare(String(b.preferred_time)));
    const old=document.getElementById('profile-upcoming');if(old)old.remove();if(!future.length)return;const item=future[0],dt=getDateTime(item.preferred_time),kind=item.animal_type==='cat'?'🐱':'🐶';
    const block=document.createElement('section');block.id='profile-upcoming';block.className='upcoming-card';block.innerHTML=`<div class="upcoming-eyebrow">НАЙБЛИЖЧИЙ ЗАПИС</div><div class="upcoming-main"><div class="upcoming-pet"><span>${kind}</span><div><strong>${esc(item.pet_name||'Улюбленець')}</strong><small>${esc(item.breed||'Порода не вказана')}</small></div></div><div class="upcoming-datetime"><b>${esc(labelDate(dt.date))}</b><span>🕐 ${esc(dt.time)}</span></div></div><div class="upcoming-service">${esc(item.additional_services||item.services||'Послуги не вказані')}</div><div class="upcoming-actions"><button type="button" class="ghost upcoming-show">Мої записи</button><button type="button" class="primary upcoming-repeat">Записати знову</button></div>`;pets.after(block);
    block.querySelector('.upcoming-show')?.addEventListener('click',()=>{location.hash='appointments';window.dispatchEvent(new HashChangeEvent('hashchange'))});block.querySelector('.upcoming-repeat')?.addEventListener('click',()=>{localStorage.setItem('royal_pet_rebook_draft',JSON.stringify({pet_name:item.pet_name||'',animal_type:item.animal_type||'',breed:item.breed||'',age:item.age||'',additional_services:item.additional_services||item.services||''}));location.hash='booking';window.dispatchEvent(new HashChangeEvent('hashchange'));setTimeout(()=>window.applyRebookDraft?.(),100)});
  }
  const baseProfile=window.renderCustomerProfile;if(typeof baseProfile==='function')window.renderCustomerProfile=async()=>{await baseProfile();setTimeout(render,40)};
  const baseAppointments=window.renderCustomerAppointments;if(typeof baseAppointments==='function')window.renderCustomerAppointments=async()=>{await baseAppointments();setTimeout(()=>{groupAppointments();render()},0)};
  window.addEventListener('hashchange',()=>{if(location.hash.slice(1)==='profile')setTimeout(render,120);if(location.hash.slice(1)==='appointments')setTimeout(groupAppointments,120)});
  setTimeout(()=>{render();groupAppointments()},350);
})();
