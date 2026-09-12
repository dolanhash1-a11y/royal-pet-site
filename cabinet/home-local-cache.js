(()=>{
'use strict';
const API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
const KEY='royalPetHomeLive';
async function sync(){
  if(!API)return;
  try{
    const r=await fetch(API+'/hours?home_cache='+Date.now(),{credentials:'include',cache:'no-store'});
    if(!r.ok)return;
    const d=await r.json();
    if(d&&d.__home__)localStorage.setItem(KEY,d.__home__);
  }catch{}
}
function bind(){
  document.addEventListener('click',e=>{
    if(!e.target.closest('#home-save'))return;
    setTimeout(sync,1800);
  },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();