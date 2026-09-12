(()=>{
const API=window.ROYAL_PET_ADMIN_API||'';
const set=(sel,v)=>document.querySelectorAll(sel).forEach(e=>e.textContent=v??'');
const setAttr=(sel,a,v)=>document.querySelectorAll(sel).forEach(e=>e.setAttribute(a,v||''));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function loadHome(){
  if(!API)return null;
  for(let attempt=0;attempt<4;attempt++){
    try{
      const r=await fetch(API+'/public/hours?sync='+Date.now(),{cache:'no-store',headers:{'Cache-Control':'no-cache'}});
      if(!r.ok)throw Error('API '+r.status);
      const d=await r.json();
      if(!d.__home__)throw Error('home data missing');
      return JSON.parse(d.__home__);
    }catch(e){
      if(attempt===3){console.error('Royal Pet home sync:',e);return null}
      await sleep(350*(attempt+1));
    }
  }
  return null;
}
async function run(){
  const h=await loadHome();
  if(!h)return;
  document.documentElement.dataset.homeLive='1';
  const v=Date.now();
  document.title=`${h.name||'Royal Pet'} — грумінг-студія`;
  set('[data-site-name]',h.name);set('[data-site-location]',h.location);set('[data-site-address]',h.address);set('[data-site-phone]',h.phone);
  document.querySelectorAll('[data-site-phone]').forEach(e=>e.href=`tel:${String(h.phone||'').replace(/[^\d+]/g,'')}`);
  ['instagram','facebook','tiktok','telegram'].forEach(n=>{document.querySelectorAll(`[data-site-${n}]`).forEach(e=>e.href=h[n]||'#');document.querySelectorAll(`[data-social-${n}]`).forEach(e=>e.href=h[n]||'#')});
  set('[data-home-title]',h.title);set('[data-home-subtitle]',h.subtitle);set('[data-home-description]',h.description);set('[data-home-button]',h.button_text);setAttr('[data-home-button]','href',h.button_link);
  set('[data-home-secondary-button]',h.secondary_button_text?`${h.secondary_button_text} →`:'');setAttr('[data-home-secondary-button]','href',h.secondary_button_link);
  set('[data-about-label]',h.about_label);set('[data-about-title]',h.about_title);set('[data-about-text]',h.about_text);
  const benefits=document.querySelectorAll('.about .benefits article');
  [['benefit1_title','benefit1_text'],['benefit2_title','benefit2_text'],['benefit3_title','benefit3_text']].forEach((p,i)=>{if(benefits[i]){benefits[i].querySelector('h3').textContent=h[p[0]]||'';benefits[i].querySelector('p').textContent=h[p[1]]||''}});
  set('#services .eyebrow',h.services_label);set('#services h2',h.services_title);set('#services .section-heading>p',h.services_text);
  set('#pricing .eyebrow',h.pricing_label);set('#pricing h2',h.pricing_title);set('#pricing .section-heading>p',h.pricing_text);set('#pricing .home-pricing-actions .button',h.pricing_button);
  set('#gallery .eyebrow',h.gallery_label);set('#gallery h2',h.gallery_title);set('#reviews .eyebrow',h.reviews_label);set('#reviews h2',h.reviews_title);
  set('.booking-intro .eyebrow',h.booking_label);set('.booking-intro h2',h.booking_title);const bp=document.querySelector('.booking-intro p');if(bp)bp.textContent=h.booking_text||'';set('.booking-intro .button',h.booking_button);
  set('#contacts .eyebrow',h.contacts_label);set('#contacts h2',h.contacts_title);set('[data-contact-text]',h.contacts_text);set('[data-contact-address-label]',h.address_label?`${h.address_label}:`:'');set('[data-contact-hours-label]',h.hours_label?`${h.hours_label}:`:'');set('[data-contact-phone-label]',h.phone_label?`${h.phone_label}:`:'');
  set('section[aria-labelledby="hours-title"] .eyebrow',h.hours_section_label);set('#hours-title',h.hours_title);set('[data-footer-text]',h.footer_text);set('[data-footer-description]',h.footer_description);set('[data-footer-copyright]',h.footer_copyright);
  const hero=document.querySelector('.hero-photo img');
  if(hero&&h.hero_image){hero.src=h.hero_image+(h.hero_image.includes('?')?'&':'?')+'v='+v;hero.alt=h.hero_alt||h.name||'Royal Pet'}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{run();setTimeout(run,1200)});else{run();setTimeout(run,1200)}
})();
