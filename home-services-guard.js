(()=>{
'use strict';
function boot(){const root=document.querySelector('[data-services]');if(!root||root.dataset.serviceGuardReady)return;root.dataset.serviceGuardReady='1';let timer=0;const repair=()=>{if(!root.querySelector('.home-animal-tab')&&root.querySelector('.service-card')&&typeof window.royalPetRenderServices==='function'){clearTimeout(timer);timer=setTimeout(()=>window.royalPetRenderServices(),40)}};new MutationObserver(repair).observe(root,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
