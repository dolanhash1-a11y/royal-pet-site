(()=>{
const API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const money=v=>Number(v||0).toLocaleString('uk-UA');
function meta(x){const raw=x?.additional_services||'';try{const o=JSON.parse(raw);if(o&&typeof o==='object'&&!Array.isArray(o))return o}catch{}return{} }
function serviceText(m){const arr=Array.isArray(m.services)?m.services:[];return arr.map(v=>typeof v==='string'?v:(v?.title||'')).filter(Boolean)}
async function refreshPricingInAppointments(root){
 if(!root||root.dataset.pricingBusy==='1')return;
 const table=root.querySelector('table');const body=table?.querySelector('tbody');if(!table||!body)return;
 if(table.dataset.pricingReady==='1')return;
 root.dataset.pricingBusy='1';
 try{
  const r=await fetch(API+'/appointments',{credentials:'include'});if(!r.ok)return;const a=await r.json();
  const head=table.querySelector('thead tr');
  if(head&&!head.querySelector('[data-pricing-col]')){
   head.insertAdjacentHTML('beforeend','<th data-pricing-col>Послуги</th><th data-pricing-col>Орієнтовно</th>');
  }
  [...body.querySelectorAll('tr')].forEach((tr,i)=>{
   if(tr.dataset.pricingRow==='1')return;
   const x=a[i];const m=meta(x);const sv=serviceText(m);const total=Number(m.estimated_total||0);const final=m.final_price===null||m.final_price===undefined||m.final_price===''?null:Number(m.final_price);
   const services=sv.length?sv.map(s=>esc(s)).join('<br>'):'—';
   const amount=final!==null&&!Number.isNaN(final)?`<span style="color:#d7ad55;font-weight:700">${money(final)} грн</span><br><small>остаточна</small>`:total?`${money(total)} грн<br><small>орієнтовно</small>`:'—';
   tr.insertAdjacentHTML('beforeend',`<td>${services}</td><td>${amount}</td>`);tr.dataset.pricingRow='1';
  });
 }finally{root.dataset.pricingBusy='0';table.dataset.pricingReady='1'}
}
function install(){const root=document.getElementById('view-appointments');if(!root||root.dataset.pricingObserver)return;root.dataset.pricingObserver='1';const run=()=>{const table=root.querySelector('table');if(table&&table.dataset.pricingReady!=='1'){table.dataset.pricingReady='0';refreshPricingInAppointments(root)}};new MutationObserver(run).observe(root,{childList:true,subtree:true});run()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
