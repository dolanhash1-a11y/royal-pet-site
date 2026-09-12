(()=>{
const API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
const set=(s,v)=>document.querySelectorAll(s).forEach(e=>e.textContent=v??'');
const attr=(s,a,v)=>document.querySelectorAll(s).forEach(e=>e.setAttribute(a,v??''));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function get(){
 if(!API)return null;
 for(let i=0;i<4;i++){
  try{
   const r=await fetch(API+'/public/hours?home='+Date.now(),{cache:'no-store',headers:{'Cache-Control':'no-cache'}});
   if(!r.ok)throw Error('API '+r.status);
   const d=await r.json();
   if(!d.__home__)throw Error('home data missing');
   return JSON.parse(d.__home__);
  }catch(e){if(i===3){console.error('Royal Pet home sync:',e);return null}await wait(300)}
 }
 return null;
}
function apply(h){
 document.documentElement.dataset.homeLive='1';
 document.title=`${h.name||'Royal Pet'} — грумінг-студія`;
 set('[data-site-name]',h.name);set('[data-site-location]',h.location);set('[data-site-address]',h.address);set('[data-site-phone]',h.phone);
 document.querySelectorAll('[data-site-phone]').forEach(e=>e.href=`tel:${String(h.phone||'').replace(/[^\d+]/g,'')}`);
 ['instagram','facebook','tiktok','telegram'].forEach(n=>{document.querySelectorAll(`[data-site-${n}]`).forEach(e=>e.href=h[n]||'#');document.querySelectorAll(`[data-social-${n}]`).forEach(e=>e.href=h[n]||'#')});
 set('[data-home-title]',h.title);set('[data-home-subtitle]',h.subtitle);set('[data-home-description]',h.description);set('[data-home-button]',h.button_text);attr('[data-home-button]','href',h.button_link);
 set('[data-home-secondary-button]',h.secondary_button_text?`${h.secondary_button_text} →`:'');attr('[data-home-secondary-button]','href',h.secondary_button_link);
 set('[data-about-label]',h.about_label);set('[data-about-title]',h.about_title);set('[data-about-text]',h.about_text);
 const b=document.querySelectorAll('.about .benefits article');[['benefit1_title','benefit1_text'],['benefit2_title','benefit2_text'],['benefit3_title','benefit3_text']].forEach((p,i)=>{if(b[i]){b[i].querySelector('h3').textContent=h[p[0]]||'';b[i].querySelector('p').textContent=h[p[1]]||''}});
 set('#services .eyebrow',h.services_label);set('#services h2',h.services_title);set('#services .section-heading>p',h.services_text);
 set('#pricing .eyebrow',h.pricing_label);set('#pricing h2',h.pricing_title);set('#pricing .section-heading>p',h.pricing_text);set('#pricing .home-pricing-actions .button',h.pricing_button);
 set('#gallery .eyebrow',h.gallery_label);set('#gallery h2',h.gallery_title);set('#reviews .eyebrow',h.reviews_label);set('#reviews h2',h.reviews_title);
 set('.booking-intro .eyebrow',h.booking_label);set('.booking-intro h2',h.booking_title);const p=document.querySelector('.booking-intro p');if(p)p.textContent=h.booking_text||'';set('.booking-intro .button',h.booking_button);
 set('#contacts .eyebrow',h.contacts_label);set('#contacts h2',h.contacts_title);set('[data-contact-text]',h.contacts_text);set('[data-contact-address-label]',h.address_label?`${h.address_label}:`:'');set('[data-contact-hours-label]',h.hours_label?`${h.hours_label}:`:'');set('[data-contact-phone-label]',h.phone_label?`${h.phone_label}:`:'');
 set('section[aria-labelledby="hours-title"] .eyebrow',h.hours_section_label);set('#hours-title',h.hours_title);set('[data-footer-text]',h.footer_text);set('[data-footer-description]',h.footer_description);set('[data-footer-copyright]',h.footer_copyright);
 const box=document.querySelector('.hero-photo');
 if(box&&h.hero_image){
  let hero=box.querySelector('img');
  if(!hero){hero=document.createElement('img');hero.decoding='async';box.innerHTML='';box.appendChild(hero)}
  hero.hidden=false;
  hero.src=h.hero_image+(h.hero_image.includes('?')?'&':'?')+'v='+Date.now();
  hero.alt=h.hero_alt||h.name||'Royal Pet';
 }
}
async function run(){const h=await get();if(h)apply(h)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
