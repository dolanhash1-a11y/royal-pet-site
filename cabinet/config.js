window.ROYAL_PET_ADMIN_API = 'https://royal-pet-admin-api.dolanhash1.workers.dev';

// Install auth fetch wrapper BEFORE app.js runs so the login request itself
// is intercepted and any bearer token returned by the Worker is preserved.
(()=>{
  const API=String(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
  const KEY='royal_pet_admin_token';
  if(!API||window.__royalPetAuthBootstrap)return;
  window.__royalPetAuthBootstrap=true;
  const baseFetch=window.fetch.bind(window);
  window.fetch=async(input,init={})=>{
    const url=typeof input==='string'?input:(input&&input.url)||'';
    const isApi=url===API||url.startsWith(API+'/');
    const isLogin=url===API+'/auth/login';
    const headers=new Headers(init.headers||{});
    const token=localStorage.getItem(KEY);
    if(isApi&&!isLogin&&token)headers.set('Authorization','Bearer '+token);
    let response=await baseFetch(input,{...init,credentials:isApi?'include':(init.credentials||'same-origin'),headers});
    if(isLogin&&response.ok){
      try{
        const data=await response.clone().json();
        if(data?.token)localStorage.setItem(KEY,String(data.token));
      }catch{}
    }
    if(isApi&&!isLogin&&response.status===401&&token){
      const retryHeaders=new Headers(headers);
      retryHeaders.delete('Authorization');
      response=await baseFetch(input,{...init,credentials:'include',headers:retryHeaders});
    }
    if(isApi&&!isLogin&&response.status===401)localStorage.removeItem(KEY);
    return response;
  };
})();
