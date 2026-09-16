(()=>{
'use strict';
if(!window.matchMedia('(max-width:620px)').matches)return;
const API='https://royal-pet-admin-api.dolanhash1.workers.dev';
const CONFIG_KEY='__booking_config__';
const form=()=>document.getElementById('booking-form');
const esc=v=>String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]));
let config=null;
function normalizeBreeds(value){if(!Array.isArray(value))return[];return value.map(x=>Array.isArray(x)?String(x[0]??'').trim():String(x??'').trim()).filter(Boolean)}
async function loadConfig(){try{const r=await fetch(`${API}/hours?booking_config=${Date.now()}`,{credentials:'omit',cache:'no-store'});if(!r.ok)throw Error(`API ${r.status}`);const d=await r.json();const raw=d?.[CONFIG_KEY];if(!raw)throw Error('booking config not found');const saved=typeof raw==='string'?JSON.parse(raw):raw;config={dog:normalizeBreeds(saved?.breeds?.dog),cat:normalizeBreeds(saved?.breeds?.cat)};return config}catch(e){console.warn('[Royal Pet] Mobile breed config unavailable:',e);return null}}
function renderBreeds(){const f=form();if(!f)return;const select=f.querySelector('#breed');if(!select)return;const type=f.querySelector('[name="pet_type"]:checked')?.value==='Кіт'?'cat':'dog';const list=config?.[type]||[];if(!list.length)return;select.innerHTML='<option value="">Оберіть породу</option>'+list.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('')}
async function init(){const f=form();if(!f)return;config=await loadConfig();if(!config)return;renderBreeds();f.querySelectorAll('[name="pet_type"]').forEach(x=>x.addEventListener('change',renderBreeds))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
