(()=>{
'use strict';
const API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

const fallback={
 name:'Royal Pet',phone:'+38 (000) 000-00-00',address:'м. Київ, вул. Прикладна, 10',location:'у Києві',
 instagram:'',facebook:'',tiktok:'',telegram:'',
 title:'Грумінг, який дарує улюбленцю красу та комфорт.',subtitle:'Професійний грумінг для собак та котиків',description:'Дбайливий догляд, професійний підхід та любов до кожного нашого клієнта.',button_text:'Записатися на грумінг',button_link:'booking/',hero_image:'',hero_alt:'Доглянутий білий песик',
 about_label:'Про нас',about_title:'Тут хвостики — у надійних руках',about_text:'Ми створили спокійний простір, де кожному улюбленцю приділяють час, увагу й турботу.',benefit1_title:'Досвідчені грумери',benefit1_text:'Дбайливо працюємо з тваринами будь-якого темпераменту.',benefit2_title:'Професійна косметика',benefit2_text:'Використовуємо безпечні засоби для шерсті й шкіри.',benefit3_title:'Турбота без стресу',benefit3_text:'Комфортний темп і м’який підхід до кожного гостя.',
 services_label:'Послуги',services_title:'Краса та здоров’я в одному візиті',services_text:'Остаточна вартість залежить від породи, розміру та стану шерсті.',
 reviews_label:'Відгуки',reviews_title:'Нас рекомендують хвостиками',
 contacts_label:'Контакти',contacts_title:'Контакти',address_label:'Адреса',hours_label:'Графік',phone_label:'Телефон',
 footer_text:'Догляд, який ваш улюбленець відчує.',footer_description:'',footer_copyright:'© 2026 Royal Pet. Усі права захищені.'
};

const sections=[
 ['Основна інформація',[['name','Назва студії'],['phone','Телефон'],['address','Адреса'],['location','Місто / локація']]],
 ['Соціальні мережі',[['instagram','Instagram — посилання'],['tiktok','TikTok — посилання'],['facebook','Facebook — посилання'],['telegram','Telegram — посилання']]],
 ['Головний екран',[['title','Заголовок'],['subtitle','Підзаголовок'],['description','Опис'],['button_text','Текст кнопки'],['button_link','Посилання кнопки'],['hero_alt','Опис головного фото']]],
 ['Про нас',[['about_label','Мітка секції'],['about_title','Заголовок'],['about_text','Текст'],['benefit1_title','Перевага 1 — заголовок'],['benefit1_text','Перевага 1 — текст'],['benefit2_title','Перевага 2 — заголовок'],['benefit2_text','Перевага 2 — текст'],['benefit3_title','Перевага 3 — заголовок'],['benefit3_text','Перевага 3 — текст']]],
 ['Послуги',[['services_label','Мітка секції'],['services_title','Заголовок'],['services_text','Текст під заголовком']]],
 ['Відгуки',[['reviews_label','Мітка секції'],['reviews_title','Заголовок']]],
 ['Контакти',[['contacts_label','Мітка секції'],['contacts_title','Заголовок'],['address_label','Підпис адреси'],['hours_label','Підпис графіка'],['phone_label','Підпис телефону']]],
 ['Нижня частина',[['footer_text','Текст футера'],['footer_description','Додатковий текст футера'],['footer_copyright','Копірайт']]]
];

const areaKeys=new Set(['description','about_text','services_text','footer_description']);
const socialKeys=new Set(['instagram','tiktok','facebook','telegram']);
const editableKeys=new Set(sections.flatMap(([,items])=>items.map(([k])=>k)));

function field(k,l,v){
 const area=areaKeys.has(k);
 const ph=socialKeys.has(k)?'https://...':'';
 return `<label class="home-edit-field"><span>${esc(l)}</span>${area?`<textarea data-home-field="${k}" rows="3">${esc(v)}</textarea>`:`<input data-home-field="${k}" value="${esc(v)}" type="${k==='phone'?'tel':'text'}" placeholder="${ph}">${socialKeys.has(k)?'<small style="display:block;color:#888;margin-top:5px">Вкажіть повне посилання</small>':''}`}</label>`;
}

async function getHome(){
 let h={...fallback};
 if(!API)return h;
 try{
  const r=await fetch(API+'/hours?home_sync='+Date.now(),{credentials:'include',cache:'no-store'});
  if(r.ok){
   const d=await r.json();
   if(d&&d.__home__){try{const saved=JSON.parse(d.__home__);if(saved&&typeof saved==='object')h={...h,...saved}}catch{}}
  }
 }catch{}
 return h;
}

function ensureRoot(){
 let root=document.getElementById('view-home-editor');
 if(!root){const main=document.querySelector('.main');if(!main)return null;root=document.createElement('section');root.id='view-home-editor';root.className='view hidden';main.appendChild(root)}
 return root;
}

function installNav(){
 const nav=document.querySelector('.sidebar nav');if(!nav)return;
 let b=nav.querySelector('[data-view="home-editor"]');
 if(!b){b=document.createElement('button');b.className='nav-item';b.dataset.view='home-editor';b.innerHTML='⌂ <span>Головна</span>';nav.appendChild(b)}
}

async function render(){
 const root=ensureRoot();if(!root)return;
 root.innerHTML='<div class="card"><div class="home-editor-loading">Завантаження налаштувань головної сторінки…</div></div>';
 const h=await getHome();
 root.innerHTML=`
 <div class="home-editor-head">
  <div><span class="gold-label">РЕДАГУВАННЯ САЙТУ</span><h2>Головна сторінка</h2><p>Редагуйте тільки ті блоки та дані, які зараз використовуються на головній сторінці.</p></div>
  <button class="small-btn gold" id="home-save">Зберегти зміни</button>
 </div>
 <div class="card home-photo-card">
  <div><h3>Головне фото</h3><p>Фото у верхньому блоці сайту.</p></div>
  <div class="home-photo-row"><div class="home-photo-preview" id="home-photo-preview">${h.hero_image?`<img src="${esc(h.hero_image)}" alt="">`:'Фото ще не вибрано'}</div><div><input id="home-photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif"><small>До 15 МБ. Фото завантажиться в R2.</small></div></div>
 </div>
 ${sections.map(([title,items])=>`<div class="card home-editor-section"><h3>${esc(title)}</h3><div class="home-editor-grid">${items.map(([k,l])=>field(k,l,h[k]??'')).join('')}</div></div>`).join('')}
 <div id="home-editor-msg" class="save-message"></div>`;

 const fileInput=root.querySelector('#home-photo');
 if(fileInput)fileInput.onchange=()=>{const f=fileInput.files[0];if(f){const u=URL.createObjectURL(f);root.querySelector('#home-photo-preview').innerHTML=`<img src="${u}" alt="">`}};
 const save=root.querySelector('#home-save');if(!save)return;
 save.onclick=async()=>{
  save.disabled=true;save.textContent='Зберігаємо…';
  try{
   const next={...fallback,...Object.fromEntries(Object.entries(h).filter(([k])=>editableKeys.has(k)))};
   root.querySelectorAll('[data-home-field]').forEach(x=>next[x.dataset.homeField]=x.value.trim());
   const file=fileInput?.files?.[0];
   if(file){
    const r=await fetch(API+'/media/upload?type=image&filename='+encodeURIComponent(file.name),{method:'PUT',credentials:'include',headers:{'Content-Type':file.type},body:file});
    const j=await r.json().catch(()=>({}));
    if(!r.ok)throw Error(j.error||'Не вдалося завантажити фото');
    next.hero_image=j.url||next.hero_image;
   }else if(h.hero_image)next.hero_image=h.hero_image;
   const r=await fetch(API+'/hours',{method:'PUT',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({__home__:JSON.stringify(next)})});
   const j=await r.json().catch(()=>({}));
   if(!r.ok)throw Error(j.error||'Не вдалося зберегти');
   h={...next};
   root.querySelector('#home-editor-msg').textContent='Зміни збережено ✓';
  }catch(e){alert(e.message)}finally{save.disabled=false;save.textContent='Зберегти зміни'}
 };
}

function open(){
 installNav();const root=ensureRoot();if(!root)return;
 document.querySelectorAll('.view').forEach(x=>x.classList.add('hidden'));
 root.classList.remove('hidden');
 document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.view==='home-editor'));
 const title=document.getElementById('page-title');if(title)title.textContent='Головна сторінка';
 render();
}

function bind(){
 installNav();ensureRoot();
 document.addEventListener('click',e=>{const b=e.target.closest('.nav-item[data-view="home-editor"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();open()},true);
 window.royalPetOpenHomeEditor=open;
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
