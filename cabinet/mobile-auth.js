(()=>{
  const API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
  const KEY='royal_pet_admin_token';
  const originalFetch=window.fetch.bind(window);
  if(!API||window.__royalPetMobileAuth)return;
  window.__royalPetMobileAuth=true;

  window.fetch=async(input,init={})=>{
    const url=typeof input==='string'?input:(input&&input.url)||'';
    const isApi=url===API||url.startsWith(API+'/');
    const isLogin=isApi&&url===API+'/auth/login';
    const token=localStorage.getItem(KEY);
    const opts={...init,credentials:isApi?'include':(init.credentials||'same-origin'),headers:new Headers(init.headers||{})};
    if(isApi&&!isLogin&&token)opts.headers.set('Authorization','Bearer '+token);

    let response=await originalFetch(input,opts);
    if(isLogin&&response.ok){
      try{
        const data=await response.clone().json();
        if(data?.token)localStorage.setItem(KEY,String(data.token));
      }catch{}
    }

    if(isApi&&!isLogin&&response.status===401&&token){
      const retry={...opts,headers:new Headers(opts.headers)};
      retry.headers.delete('Authorization');
      response=await originalFetch(input,retry);
    }

    if(isApi&&!isLogin&&response.status===401)localStorage.removeItem(KEY);
    return response;
  };
})();
