(()=>{
 const API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,''),KEY='portfolio-r2-integrity-v1';
 const b64=a=>{let s='';for(const v of new Uint8Array(a))s+=String.fromCharCode(v);return btoa(s)};
 const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
 async function hash(buf){return crypto.subtle.digest('SHA-256',buf)}
 async function api(path,opts={}){const h=new Headers(opts.headers||{});if(!(opts.body instanceof FormData)&&!h.has('Content-Type'))h.set('Content-Type','application/json');const r=await fetch(API+path,{...opts,credentials:'include',headers:h});let j={};try{j=await r.json()}catch{}if(!r.ok)throw Error(j.error||`API ${r.status}`);return j}
 async function replaceForm(){const box=document.getElementById('portfolio-r2-manager');if(!box||box.dataset.integrity===KEY)return;const form=box.querySelector('form');if(!form)return;const clone=form.cloneNode(true);form.replaceWith(clone);box.dataset.integrity=KEY;
  const status=clone.querySelector('[data-status]');const submit=clone.querySelector('[data-submit]');
  clone.addEventListener('submit',async e=>{e.preventDefault();const files=[...clone.querySelector('[data-files]').files];const album=clone.querySelector('[data-album-select]').value;if(!files.length)return alert('Оберіть фото або відео.');if(!album)return alert('Спочатку створіть або оберіть альбом.');submit.disabled=true;status.textContent='Перевірка та завантаження…';try{for(const file of files){const type=file.type.startsWith('video/')?'video':'image';const data=await file.arrayBuffer();const digest=await hash(data);const endpoint=API+'/media/upload?type='+encodeURIComponent(type)+'&filename='+encodeURIComponent(file.name);const r=await fetch(endpoint,{method:'PUT',body:data,credentials:'include',headers:{'Content-Type':file.type,'X-Content-SHA256':b64(digest)}});let j={};try{j=await r.json()}catch{}if(!r.ok)throw Error(j.error||`Помилка завантаження HTTP ${r.status}`);if(type==='image'){const check=await fetch(j.url+'?verify='+Date.now(),{cache:'no-store'});if(!check.ok)throw Error(`R2 повернув HTTP ${check.status} для завантаженого фото`);const returned=await check.arrayBuffer();const got=await hash(returned);if(returned.byteLength!==data.byteLength||b64(got)!==b64(digest))throw Error(`R2 отримав пошкоджені дані: оригінал ${data.byteLength} байт, R2 ${returned.byteLength} байт`)}
      await api('/portfolio/items',{method:'POST',body:JSON.stringify({album_id:album,type,title:clone.querySelector('[data-title]').value.trim()||file.name.replace(/\.[^.]+$/,''),description:clone.querySelector('[data-description]').value.trim(),object_key:j.key,sort_order:Date.now(),active:true,set_cover:clone.querySelector('[data-cover]').checked})});
    }
    clone.querySelector('[data-files]').value='';clone.querySelector('[data-title]').value='';clone.querySelector('[data-description]').value='';clone.querySelector('[data-cover]').checked=false;status.textContent=`Готово: ${files.length} файл(ів) ✓`;window.dispatchEvent(new CustomEvent('royal-pet-portfolio-updated'));
  }catch(err){status.textContent='';alert(err.message)}finally{submit.disabled=false}});
 }
 function tick(){replaceForm().catch(()=>{})}
 const obs=new MutationObserver(tick);obs.observe(document.body,{childList:true,subtree:true});tick();setInterval(tick,1000);
})();
