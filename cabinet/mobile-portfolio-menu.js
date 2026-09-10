(()=>{
  function patch(){
    const root=document.getElementById('rp-mobile-menu');
    const panel=root?.querySelector('.rp-mobile-menu-panel');
    if(!panel||panel.querySelector('[data-mobile-view="portfolio"]'))return;
    const logout=panel.querySelector('.rp-mobile-menu-logout');
    const item=document.createElement('button');
    item.type='button';item.dataset.mobileView='portfolio';item.className='rp-mobile-menu-item';item.innerHTML='<span class="rp-mobile-menu-icon">▣</span><span>Портфоліо</span>';
    item.addEventListener('click',()=>{root.classList.remove('open');document.body.classList.remove('rp-mobile-menu-lock');document.querySelector('.sidebar .nav-item[data-view="portfolio"]')?.click()});
    logout?panel.insertBefore(item,logout):panel.appendChild(item);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(patch,0),{once:true});else setTimeout(patch,0);
  const mo=new MutationObserver(patch);mo.observe(document.documentElement,{childList:true,subtree:true});setTimeout(()=>mo.disconnect(),4000);
})();
