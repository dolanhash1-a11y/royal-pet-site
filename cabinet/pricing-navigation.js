(()=>{
function setup(){
  const nav=document.querySelector('.sidebar nav');
  if(!nav)return;
  let btn=nav.querySelector('[data-view="pricing"]');
  if(!btn){
    btn=document.createElement('button');
    btn.className='nav-item';
    btn.dataset.view='pricing';
    btn.innerHTML='₴ <span>Прайс</span>';
    nav.appendChild(btn);
  }
  btn.onclick=e=>{
    e.preventDefault();
    if(typeof window.renderPricing==='function') window.renderPricing();
  };
  let root=document.getElementById('view-pricing');
  if(!root){
    root=document.createElement('section');
    root.id='view-pricing';
    root.className='view hidden';
    document.querySelector('.main')?.appendChild(root);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
new MutationObserver(setup).observe(document.body,{childList:true,subtree:true});
})();
