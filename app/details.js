(()=>{
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const key='rp-open-appointment';
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
      const details=document.createElement('div');details.className='appointment-details hidden';
      details.innerHTML=`<div class="appointment-details-grid"><div><small>Улюбленець</small><b>${esc(card.querySelector('.appointment-top strong')?.textContent||'Улюбленець')}</b></div><div><small>Дата та час</small><b>${esc(time)}</b></div><div><small>Тварина / порода</small><b>${esc(breed)}</b></div><div><small>Послуги</small><b>${esc(service)}</b></div></div>`;
      action.before(details);
      const open=()=>{const was=!details.classList.contains('hidden');root.querySelectorAll('.appointment-details').forEach(x=>x.classList.add('hidden'));root.querySelectorAll('.appointment-details-toggle').forEach(x=>x.textContent='Деталі');if(was){localStorage.removeItem(key);return}details.classList.remove('hidden');btn.textContent='Сховати';localStorage.setItem(key,card.dataset.detailsId||'');};
      card.dataset.detailsId=card.querySelector('.cancel-btn,.rebook-btn,.reschedule-btn')?.dataset.id||time;
      btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();open()});
      card.addEventListener('click',e=>{if(e.target.closest('button,input,select,textarea,a'))return;open()});
    });
  }
  const base=window.renderCustomerAppointments;
  if(typeof base==='function')window.renderCustomerAppointments=async()=>{await base();setTimeout(enhance,0)};
  window.addEventListener('hashchange',()=>{if(location.hash.slice(1)==='appointments')setTimeout(enhance,120)});
  setTimeout(enhance,500);
})();
