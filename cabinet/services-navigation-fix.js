(()=>{
'use strict';
function openServices(){
  if(typeof window.royalPetRenderServices==='function'){
    window.royalPetRenderServices('dog','complex');
  }
}
document.addEventListener('click',e=>{
  const target=e.target?.closest?.('[data-view="services"],[data-go="services"]');
  if(!target)return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  openServices();
},true);
})();
