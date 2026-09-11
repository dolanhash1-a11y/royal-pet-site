(()=>{
  const VERSION='booking-breeds-fix-20260911';
  async function loadBreeds(){
    try{
      const r=await fetch(`content/breeds.json?v=${Date.now()}`,{cache:'no-store'});
      if(!r.ok)throw new Error('breeds.json');
      const d=await r.json();
      return {dog:Array.isArray(d.dog)?d.dog:[],cat:Array.isArray(d.cat)?d.cat:[]};
    }catch(e){
      console.error('Royal Pet: не вдалося завантажити породи',e);
      return {dog:[],cat:[]};
    }
  }
  async function install(){
    const form=document.getElementById('booking-form');
    if(!form||form.dataset.breedsFix===VERSION)return false;
    const animal=form.querySelector('[name="animal_type"]');
    const breed=form.querySelector('[name="breed"]');
    if(!animal||!breed)return false;
    form.dataset.breedsFix=VERSION;
    const breeds=await loadBreeds();
    const populate=()=>{
      const list=breeds[animal.value]||[];
      const current=breed.value;
      breed.innerHTML='<option value="">Оберіть породу</option>'+
        list.map(x=>`<option value="${String(x.name).replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]))}" data-category="${String(x.category||'').replace(/[^a-z]/gi,'')}">${String(x.name).replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]))}</option>`).join('');
      if(current && [...breed.options].some(o=>o.value===current))breed.value=current;
      if(!list.length){
        breed.innerHTML='<option value="">Породи не знайдено</option>';
      }
      breed.dispatchEvent(new Event('change',{bubbles:true}));
    };
    animal.addEventListener('change',populate);
    populate();
    return true;
  }
  function boot(){
    install().catch(()=>{});
    const root=document.getElementById('booking-form')||document.body;
    const obs=new MutationObserver(()=>install().catch(()=>{}));
    obs.observe(root,{childList:true,subtree:true});
    setTimeout(()=>obs.disconnect(),20000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
