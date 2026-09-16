(()=>{
'use strict';
const API=(window.ROYAL_PET_ADMIN_API||'https://royal-pet-admin-api.dolanhash1.workers.dev').replace(/\/$/,'');
const KEY='__booking_config__';
const DEFAULT={
 eyebrow:'ROYAL PET · ОНЛАЙН-ЗАПИС',
 title:'Запишіть улюбленця|на грумінг',
 intro:'Оберіть улюбленця, послугу, зручну дату та доступний час. Заявка одразу потрапить у розділ «Записи» кабінету Royal Pet.',
 trust1Title:'Розкажіть про улюбленця',trust1Text:'Ім’я, порода та основна інформація',
 trust2Title:'Оберіть послугу та час',trust2Text:'Послуги беруться зі списку «Запис» у кабінеті',
 trust3Title:'Надішліть заявку',trust3Text:'Запис з’явиться у кабінеті Royal Pet',
 step1:'Крок 1',step1Title:'Ваш улюбленець',
 step2:'Крок 2',step2Title:'Оберіть послугу',step2Text:'Тут відображаються активні послуги зі списку «Запис» у кабінеті Royal Pet.',
 step3:'Крок 3',step3Title:'Дата та час',step3Text:'Показуємо час у межах робочого графіка та без зайнятих записів.',
 step4:'Крок 4',step4Title:'Ваші контакти',
 petTypeLabel:'Вид тварини',dogLabel:'Собака',catLabel:'Кіт',petNameLabel:'Ім’я улюбленця',petNamePlaceholder:'Наприклад, Боня',ageLabel:'Вік',agePlaceholder:'Наприклад, 3 роки',breedLabel:'Порода',breedPlaceholder:'Оберіть породу',
 dateLabel:'Дата',timeLabel:'Час',timePlaceholder:'Спочатку оберіть дату',ownerNameLabel:'Ваше ім’я',ownerNamePlaceholder:'Як до вас звертатися',phoneLabel:'Номер телефону',phonePlaceholder:'+380 __ ___ __ __',commentLabel:'Побажання або особливості',commentPlaceholder:'Важливі особливості, страхи, побажання тощо',
 submitNote:'Надсилаючи заявку, ви погоджуєтесь на зв’язок для підтвердження запису.',submitText:'Надіслати заявку',backText:'← На головну',footerText:'Професійний догляд для собак та котиків'
};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
async function load(){try{const r=await fetch(API+'/hours?booking_config='+Date.now(),{credentials:'include',cache:'no-store'});if(!r.ok)return;const d=await r.json();let x=d?.[KEY];if(typeof x==='string')x=JSON.parse(x);const t=x?.bookingText||{};const s=(k,def=DEFAULT[k])=>typeof t[k]==='string'&&t[k].trim()?t[k]:def;
 const map={'.eyebrow':s('eyebrow'),'#booking-title':s('title').split('|')[0]+'<br><em>'+esc(s('title').split('|').slice(1).join('|'))+'</em>','.intro>p':s('intro'),
 '.trust-list>div:nth-child(1) strong':s('trust1Title'),'.trust-list>div:nth-child(1) small':s('trust1Text'),'.trust-list>div:nth-child(2) strong':s('trust2Title'),'.trust-list>div:nth-child(2) small':s('trust2Text'),'.trust-list>div:nth-child(3) strong':s('trust3Title'),'.trust-list>div:nth-child(3) small':s('trust3Text'),
 '.form-head:nth-of-type(1)>span':s('step1'),'.form-head:nth-of-type(1) h2':s('step1Title'),'.form-head:nth-of-type(2)>span':s('step2'),'.form-head:nth-of-type(2) h2':s('step2Title'),'.form-head:nth-of-type(2) p':s('step2Text'),'.form-head:nth-of-type(3)>span':s('step3'),'.form-head:nth-of-type(3) h2':s('step3Title'),'.form-head:nth-of-type(3) p':s('step3Text'),'.form-head:nth-of-type(4)>span':s('step4'),'.form-head:nth-of-type(4) h2':s('step4Title'),
 '.pet-type':null,'.type-option input[value="Собака"]+span b':s('dogLabel'),'.type-option input[value="Кіт"]+span b':s('catLabel'),
 '.form-footer p':s('submitNote'),'.submit':s('submitText'),'.back-link':s('backText'),'footer span:last-child':s('footerText')};
 document.querySelectorAll('label').forEach(label=>{const input=label.querySelector('input,select,textarea');if(!input)return;let key=null;if(input.name==='pet_name')key='petNameLabel';else if(input.name==='pet_age')key='ageLabel';else if(input.name==='breed')key='breedLabel';else if(input.name==='date')key='dateLabel';else if(input.name==='time')key='timeLabel';else if(input.name==='owner_name')key='ownerNameLabel';else if(input.name==='phone')key='phoneLabel';else if(input.name==='comment')key='commentLabel';if(key)label.childNodes[0].textContent=s(key)+'';if(input.name==='pet_name')input.placeholder=s('petNamePlaceholder');if(input.name==='pet_age')input.placeholder=s('agePlaceholder');if(input.name==='breed'){const o=input.querySelector('option');if(o)o.textContent=s('breedPlaceholder')}if(input.name==='time'){const o=input.querySelector('option');if(o&&!input.value)o.textContent=s('timePlaceholder')}if(input.name==='owner_name')input.placeholder=s('ownerNamePlaceholder');if(input.name==='phone')input.placeholder=s('phonePlaceholder');if(input.name==='comment')input.placeholder=s('commentPlaceholder')});
 Object.entries(map).forEach(([sel,val])=>{if(val===null)return;const el=document.querySelector(sel);if(!el)return;if(sel==='.submit')el.innerHTML=esc(s('submitText'))+' <span>→</span>';else if(sel==='#booking-title')el.innerHTML=val;else el.textContent=val});
 }catch(e){console.warn('[Royal Pet] booking text sync:',e)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();
