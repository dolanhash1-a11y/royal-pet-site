(()=>{
  const API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
  const KEY='royal_pet_admin_token';
  const originalFetch=window.fetch.bind(window);

  window.fetch=async(input,init={})=>{
    const url=typeof input==='string'?input:(input&&input.url)||'';
    const isApi=url.startsWith(API+'/')||url===API;
    const isLogin=isApi&&url===API+'/auth/login';
    const token=localStorage.getItem(KEY);
    const opts={...init,headers:new Headers(init.headers||{})};
    if(isApi&&!isLogin&&token)opts.headers.set('Authorization','Bearer '+token);

    const response=await originalFetch(input,opts);
    if(isLogin&&response.ok){
      try{
        const data=await response.clone().json();
        if(data&&data.token)localStorage.setItem(KEY,data.token);
      }catch{}
    }
    if(isApi&&!isLogin&&response.status===401)localStorage.removeItem(KEY);
    return response;
  };
})();
