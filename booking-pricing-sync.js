(()=>{
const API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
const originalFetch=window.fetch.bind(window);
const num=v=>{const n=parseFloat(String(v??'').replace(',','.').replace(/[^0-9.\-]/g,''));return Number.isFinite(n)?n:0};
window.fetch=async function(input,init){
 const url=typeof input==='string'?input:(input?.url||'');
 const response=await originalFetch(input,init);
 if(!url.includes('/content/service-pricing.json'))return response;
 try{
  const base=await response.clone().json();
  const r=await originalFetch(API+'/public/services',{cache:'no-store'});
  if(r.ok){const services=await r.json();base.services=base.services||{};services.forEach(s=>{const n=num(s.price);if(n>0){base.services[s.id]=base.services[s.id]||{};['small','medium','large'].forEach(k=>base.services[s.id][k]=n)}})}
  return new Response(JSON.stringify(base),{status:response.status,statusText:response.statusText,headers:response.headers});
 }catch{return response}
};
})();