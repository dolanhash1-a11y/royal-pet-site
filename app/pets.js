(()=>{
  const enhance=async()=>{
    const root=document.getElementById('profile-pets');
    if(!root||root.dataset.petActions==='1')return;
    const cards=[...root.querySelectorAll('.pet-mini')];
    if(!cards.length)return;
    root.dataset.petActions='1';
    let items=[];
    try{items=await window.customerAuth?.appointments?.()||[]}catch{items=[]}
    cards.forEach(card=>{
      const name=card.querySelector('b')?.textContent?.trim()||'';
      if(!name)return;
      const match=items.find(x=>String(x.pet_name||'').trim()===name);
      if(!match)return;
      const button=document.createElement('button');
      button.type='button';
      button.className='pet-book-btn';
      button.textContent='Записати знову';
      button.addEventListener('click',()=>{
        localStorage.setItem('royal_pet_rebook_draft',JSON.stringify({
          pet_name:match.pet_name||'',
          animal_type:match.animal_type||'',
          breed:match.breed||'',
          age:match.age||'',
          additional_services:match.additional_services||match.services||''
        }));
        location.hash='booking';
        window.dispatchEvent(new HashChangeEvent('hashchange'));
        setTimeout(()=>window.applyRebookDraft?.(),120);
      });
      card.append(button);
    });
  };
  const wrap=window.renderCustomerProfile;
  if(typeof wrap==='function'){
    window.renderCustomerProfile=async()=>{await wrap();await enhance()};
  }
  window.addEventListener('hashchange',()=>{
    if(location.hash.slice(1)==='profile')setTimeout(enhance,80);
  });
  setTimeout(enhance,180);
})();
