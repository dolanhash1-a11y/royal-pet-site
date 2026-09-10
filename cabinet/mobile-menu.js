(()=>{
  const items=[
    ['dashboard','🏠','Огляд'],
    ['appointments','📋','Записи'],
    ['calendar','📅','Календар'],
    ['clients','👥','Клієнти'],
    ['hours','🕐','Графік'],
    ['reviews','⭐','Відгуки'],
    ['services','✂','Послуги'],
    ['pricing','₴','Прайс']
  ];

  function getRoot(){return document.getElementById('rp-mobile-menu')}
  function close(){
    const root=getRoot();
    if(!root)return;
    root.classList.remove('open');
    document.body.classList.remove('rp-mobile-menu-lock');
    const toggle=root.querySelector('.rp-mobile-menu-button');
    if(toggle)toggle.setAttribute('aria-expanded','false');
  }
  function toggleMenu(ev){
    if(ev){ev.preventDefault();ev.stopPropagation()}
    const root=getRoot();
    if(!root)return;
    const isOpen=root.classList.toggle('open');
    document.body.classList.toggle('rp-mobile-menu-lock',isOpen);
    const toggle=root.querySelector('.rp-mobile-menu-button');
    if(toggle)toggle.setAttribute('aria-expanded',String(isOpen));
  }

  function go(view){
    close();
    const button=document.querySelector(`.sidebar .nav-item[data-view="${view}"]`);
    if(button){button.click();return}
    if(view==='dashboard'&&typeof window.dashboard==='function')window.dashboard();
  }

  function build(){
    if(document.getElementById('rp-mobile-menu'))return;

    const root=document.createElement('div');
    root.id='rp-mobile-menu';
    root.innerHTML=`
      <button class="rp-mobile-menu-button" type="button" aria-label="Відкрити меню" aria-expanded="false">
        <span class="rp-mobile-menu-icon">☰</span><span class="rp-mobile-menu-label">Меню</span>
      </button>
      <div class="rp-mobile-menu-backdrop" aria-hidden="true"></div>
      <aside class="rp-mobile-menu-panel" aria-label="Меню кабінету">
        <div class="rp-mobile-menu-head">
          <strong>Меню</strong>
          <button class="rp-mobile-menu-close" type="button" aria-label="Закрити меню">×</button>
        </div>
        <div class="rp-mobile-menu-list">
          ${items.map(([id,icon,label])=>`<button class="rp-mobile-menu-item" type="button" data-mobile-view="${id}"><span class="mi-icon">${icon}</span><span>${label}</span><span class="mi-badge" data-mobile-count="${id}" hidden></span></button>`).join('')}
          <div class="rp-mobile-menu-spacer"></div>
          <button class="rp-mobile-menu-item rp-mobile-menu-logout" type="button" data-mobile-logout="1"><span class="mi-icon">🚪</span><span>Вийти</span></button>
        </div>
      </aside>`;

    document.body.appendChild(root);

    const toggle=root.querySelector('.rp-mobile-menu-button');
    toggle.addEventListener('click',toggleMenu,{passive:false});
    toggle.addEventListener('pointerup',e=>{if(e.pointerType==='touch')toggleMenu(e)},{passive:false});
    root.querySelector('.rp-mobile-menu-close').addEventListener('click',e=>{e.preventDefault();close()},{passive:false});
    root.querySelector('.rp-mobile-menu-backdrop').addEventListener('click',close);
    root.querySelectorAll('[data-mobile-view]').forEach(btn=>btn.addEventListener('click',()=>go(btn.dataset.mobileView)));
    root.querySelector('[data-mobile-logout]').addEventListener('click',()=>{
      close();
      const button=document.getElementById('logout');
      if(button)button.click();
    });

    const updateCount=()=>{
      const source=document.getElementById('new-count');
      const badge=root.querySelector('[data-mobile-count="appointments"]');
      if(!source||!badge)return;
      const value=String(source.textContent||'0').trim();
      const n=Number(value);
      badge.hidden=!n;
      badge.textContent=value;
    };
    updateCount();
    const source=document.getElementById('new-count');
    if(source)new MutationObserver(updateCount).observe(source,{childList:true,characterData:true,subtree:true});
  }

  function boot(){build()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
