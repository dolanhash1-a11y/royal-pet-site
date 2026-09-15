(()=>{
'use strict';
const V='booking-persist-metadata-20260916-v2';
function value(form,name){return String(form.querySelector(`[name="${name}"]`)?.value||'').trim()}
function init(){
 const f=document.getElementById('booking-form');
 if(!f||f.dataset.persistMetadata===V)return;
 f.dataset.persistMetadata=V;
 f.addEventListener('submit',()=>{
  try{
   const ids=value(f,'selected_services').split(',').map(x=>x.trim()).filter(Boolean);
   const rawAdditional=value(f,'additional_services');
   const total=Number(value(f,'estimated_total')||0)||0;
   const breed=f.querySelector('[name="breed"]');
   const animal=value(f,'animal_type');
   let sourceMeta=null;
   try{sourceMeta=JSON.parse(rawAdditional)}catch{}
   const rows=[...f.querySelectorAll('.rp-service,.live-row')];
   const services=ids.map((id,i)=>{
    const row=rows.find(x=>x.querySelector('input')?.value===id);
    const title=row?.querySelector('.rp-service-name')?.textContent?.trim()||row?.querySelector('span')?.textContent?.trim()||sourceMeta?.services?.[i]?.title||id;
    const priceText=row?.querySelector('.rp-service-price')?.textContent||row?.querySelector('b')?.textContent||sourceMeta?.services?.[i]?.price||'';
    const pm=String(priceText).match(/\d+(?:[.,]\d+)?/);
    return{id,title,price:pm?Number(pm[0].replace(',','.')):sourceMeta?.services?.[i]?.price??null,surcharge:0};
   });
   const meta={version:2,source:'online-booking',animal_type:animal,breed:value(f,'breed'),breed_category:breed?.selectedOptions?.[0]?.dataset?.category||'',coat_condition:'none',services,selected_services:ids,estimated_total:total,final_price:null};
   const hidden=f.querySelector('[name="additional_services"]');
   if(hidden)hidden.value=JSON.stringify(meta);
  }catch(e){console.warn('[Royal Pet] metadata persist',e)}
 },{capture:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
