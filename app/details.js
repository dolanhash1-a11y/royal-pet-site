(()=>{
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const key='rp-open-appointment';
  function addConfirmationStyles(){if(document.getElementById('booking-confirmation-styles'))return;const s=document.createElement('style');s.id='booking-confirmation-styles';s.textContent='.booking-confirmation{margin:18px 0;padding:24px 20px;border:1px solid rgba(215,173,85,.34);border-radius:22px;background:linear-gradient(145deg,rgba(215,173,85,.13),rgba(255,255,255,.02));box-shadow:0 16px 42px rgba(0,0,0,.22);text-align:center}.booking-confirmation-icon{width:60px;height:60px;margin:0 auto 10px;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(143,209,143,.45);background:rgba(143,209,143,.08);color:#8fd18f;font-size:30px;font-weight:900}.booking-confirmation-eyebrow{font-size:11px;letter-spacing:.12em;color:var(--gold);font-weight:850}.booking-confirmation h2{margin:5px 0 8px}.booking-confirmation-lead{margin:0 auto 16px;max-width:540px;color:var(--muted)}.booking-confirmation-card{display:grid;gap:10px;text-align:left}.booking-confirmation-card>div{padding:11px 12px;border-radius:13px;background:rgba(0,0,0,.16);border:1px solid rgba(215,173,85,.12)}.booking-confirmation-card small,.booking-confirmation-card b,.booking-confirmation-card span{display:block}.booking-confirmation-card small{text-transform:uppercase;letter-spacing:.08em;color:var(--gold);font-size:10px;font-weight:850}.booking-confirmation-card b{margin-top:2px}.booking-confirmation-card span{margin-top:2px;color:var(--muted);font-size:13px}.booking-confirmation-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:13px}.booking-confirmation-actions .primary,.booking-confirmation-actions .ghost{margin:0;min-height:44px}@media(max-width:520px){.booking-confirmation{padding:20px 15px}.booking-confirmation-actions{grid-template-columns:1fr}}';document.head.appendChild(s)}
  function showConfirmation(){
    if(document.getElementById('booking-confirmation'))return;
    const msg=document.getElementById('message');
    const text=String(msg?.textContent||'');if(!text.includes('Запис успішно створено'))return;
    addConfirmationStyles();
    const pet=document.getElementById('pet')?.value||'Улюбленець',animal=document.getElementById('animal')?.value==='cat'?'Кіт':'Собака',breed=document.getElementById('breed')?.value||'Порода не вказана',date=document.getElementById('date')?.value||'',time=document.querySelector('.slot.selected')?.textContent||'',services=[...document.querySelectorAll('.service.selected')].map(x=>x.dataset.name).filter(Boolean).join(', ')||'Послуги не вказані';
    let dateLabel=date;try{const [d]=date.split('T');dateLabel=new Intl.DateTimeFormat('uk-UA',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(`${d}T12:00:00`)).replace(/^./,x=>x.toUpperCase())}catch{}
    const root=document.createElement('section');root.id='booking-confirmation';root.className='booking-confirmation';root.innerHTML=`<div class="booking-confirmation-icon">✓</div><div class="booking-confirmation-eyebrow">ROYAL PET</div><h2>Запис успішно створено</h2><p class="booking-confirmation-lead">Ми отримали вашу заявку. Усі дані збережені в «Мої записи».</p><div class="booking-confirmation-card"><div><small>Улюбленець</small><b>${esc(pet)}</b><span>${esc(animal)} · ${esc(breed)}</span></div><div><small>Дата та час</small><b>${esc(dateLabel)}</b><span>🕐 ${esc(time||'Час збережено у записі')}</span></div><div><small>Послуги</small><b>${esc(services)}</b></div></div><div class="booking-confirmation-actions"><button type="button" class="primary confirmation-view">Переглянути запис</button><button type="button" class="ghost confirmation-new">Новий запис</button></div>`;
    const booking=document.getElementById('booking');booking?.classList.add('hidden');booking?.parentNode?.insertBefore(root,booking);
    root.querySelector('.confirmation-view')?.addEventListener('click',()=>{root.remove();location.hash='appointments';window.dispatchEvent(new HashChangeEvent('hashchange'));setTimeout(()=>window.refreshCustomerAppointments?.(),80)});
    root.querySelector('.confirmation-new')?.addEventListener('click',()=>{root.remove();location.hash='booking';window.dispatchEvent(new HashChangeEvent('hashchange'))});
    root.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function enhance(){
    const root=document.getElementById('appointments-list');if(!root)return;
    root.querySelectorAll('.appointment-item').forEach(card=>{
      if(card.dataset.detailsBound)return;card.dataset.detailsBound='1';
      const action=card.querySelector('.appointment-actions');if(!action)return;
      const btn=document.createElement('button');btn.type='button';btn.className='ghost appointment-details-toggle';btn.textContent='Деталі';
      action.insertBefore(btn,action.firstChild);
      const time=card.querySelector('.appointment-time')?.textContent.replace(/^📅\s*/,'').trim()||'Дата не вказана';
      const breed=card.querySelector('.appointment-top+div')?.textContent.trim()||'Порода не вказана';
      const service=card.querySelector('.appointment-services')?.textContent.replace(/^Послуги\s*/,'').trim()||'Послуги не вказані';
      const pet=card.querySelector('.appointment-top strong')?.textContent||'Улюбленець';
      const details=document.createElement('div');details.className='appointment-details hidden';details.innerHTML=`<div class="appointment-details-grid"><div><small>Улюбленець</small><b>${esc(pet)}</b></div><div><small>Дата та час</small><b>${esc(time)}</b></div><div><small>Тварина / порода</small><b>${esc(breed)}</b></div><div><small>Послуги</small><b>${esc(service)}</b></div></div>`;action.before(details);
      const status=(card.querySelector('.appointment-top span')?.textContent||'').trim().toLowerCase();
      if(status==='виконано'&&!action.querySelector('.review-appointment-btn')){const review=document.createElement('button');review.type='button';review.className='ghost review-appointment-btn';review.textContent='Залишити відгук';review.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();localStorage.setItem('royal_pet_review_draft',JSON.stringify({pet,appointmentId:card.dataset.detailsId||'',name:document.querySelector('#profile-name')?.value||''}));location.hash='profile';window.dispatchEvent(new HashChangeEvent('hashchange'));setTimeout(()=>document.getElementById('reviews')?.scrollIntoView({behavior:'smooth',block:'start'}),250)});action.append(review)}
      const open=()=>{const was=!details.classList.contains('hidden');root.querySelectorAll('.appointment-details').forEach(x=>x.classList.add('hidden'));root.querySelectorAll('.appointment-details-toggle').forEach(x=>x.textContent='Деталі');if(was){localStorage.removeItem(key);return}details.classList.remove('hidden');btn.textContent='Сховати';localStorage.setItem(key,card.dataset.detailsId||'')};
      card.dataset.detailsId=card.querySelector('.cancel-btn,.rebook-btn,.reschedule-btn')?.dataset.id||time;
      btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();open()});card.addEventListener('click',e=>{if(e.target.closest('button,input,select,textarea,a'))return;open()});
    });
  }
  const base=window.renderCustomerAppointments;if(typeof base==='function')window.renderCustomerAppointments=async()=>{await base();setTimeout(enhance,0)};
  window.addEventListener('hashchange',()=>{if(location.hash.slice(1)==='appointments')setTimeout(enhance,120)});
  setTimeout(enhance,500);
  const msg=document.getElementById('message');if(msg){const obs=new MutationObserver(showConfirmation);obs.observe(msg,{childList:true,subtree:true,characterData:true});if(String(msg.textContent||'').includes('Запис успішно створено'))setTimeout(showConfirmation,50)}
})();
