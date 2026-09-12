(()=>{
  const API=(window.ROYAL_PET_CUSTOMER_API||window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
  const KEY='royal_pet_customer_session';
  const $=id=>document.getElementById(id);

  function save(s){
    if(s)localStorage.setItem(KEY,s);
    else localStorage.removeItem(KEY);
  }

  function token(){
    return localStorage.getItem(KEY)||'';
  }

  async function req(path,opt={}){
    const h={Accept:'application/json',...(opt.headers||{})};
    if(token())h.Authorization=`Bearer ${token()}`;

    const r=await fetch(`${API}${path}`,{
      ...opt,
      headers:h,
      credentials:'omit'
    });

    const d=await r.json().catch(()=>({}));

    if(!r.ok){
      throw Error(
        [
          d.error,
          d.details&&`[${d.details}]`
        ].filter(Boolean).join(' ')||`Помилка сервера (${r.status})`
      );
    }

    return d;
  }

  function esc(v){
    return String(v??'').replace(/[&<>'\"]/g,c=>({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      "'":'&#39;',
      '"':'&quot;'
    }[c]));
  }

  function statusText(s){
    const x=String(s||'new').toLowerCase();

    return ({
      new:'Нова заявка',
      pending:'На підтвердженні',
      confirmed:'Підтверджено',
      scheduled:'Підтверджено',
      done:'Виконано',
      completed:'Виконано',
      cancelled:'Скасовано',
      canceled:'Скасовано',
      rejected:'Відхилено'
    })[x]||s||'Нова заявка';
  }

  function normalizeAppointments(items){
    return (Array.isArray(items)?items:[]).map(x=>({
      ...x,
      status_label:statusText(x.status)
    }));
  }

  function canCancelAppointment(status){
    const x=String(status||'new').toLowerCase();
    return [
      'new',
      'pending',
      'confirmed',
      'scheduled'
    ].includes(x);
  }

  async function cancelCustomerAppointment(appointmentId){
    if(!appointmentId){
      throw Error('Не вказано запис');
    }

    return await req(
      `/customer/appointments/${encodeURIComponent(appointmentId)}/cancel`,
      {method:'POST'}
    );
  }

  window.customerAuth={
    async me(){
      try{
        return (await req('/customer/me')).user;
      }catch{
        return null;
      }
    },

    async login(phone,password){
      const d=await req('/customer/login',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({phone,password})
      });

      save(d.token);
      return d.user;
    },

    async register(name,phone,password){
      const d=await req('/customer/register',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({name,phone,password})
      });

      save(d.token);
      return d.user;
    },

    async logout(){
      try{
        await req('/customer/logout',{method:'POST'});
      }finally{
        save('');
      }
    },

    async appointments(){
      return (await req('/customer/appointments')).appointments||[];
    },

    async cancelAppointment(appointmentId){
      return await cancelCustomerAppointment(appointmentId);
    }
  };

  window.renderCustomerAuth=async()=>{
    const user=await window.customerAuth.me();
    const box=$('auth-area');
    if(!box)return;

    if(user){
      box.innerHTML=`
        <div class="auth-user">
          <div>
            <strong>${esc(user.name)}</strong>
            <span>${esc(user.phone)}</span>
          </div>
          <button class="ghost" id="logout">Вийти</button>
        </div>`;

      $('logout').onclick=async()=>{
        await window.customerAuth.logout();
        window.renderCustomerAuth();
        window.renderCustomerAppointments?.();
        window.renderCustomerProfile?.();
      };
    }else{
      box.innerHTML=`
        <div class="auth-tabs">
          <button class="auth-tab active" data-mode="login">Вхід</button>
          <button class="auth-tab" data-mode="register">Реєстрація</button>
        </div>

        <form id="auth-form">
          <div id="auth-name-wrap" class="hidden">
            <label>
              Ваше ім'я
              <input id="auth-name" autocomplete="name">
            </label>
          </div>

          <label>
            Телефон
            <input
              id="auth-phone"
              type="tel"
              autocomplete="tel"
              placeholder="+380..."
            >
          </label>

          <label>
            Пароль
            <input
              id="auth-password"
              type="password"
              minlength="6"
              autocomplete="current-password"
              placeholder="Мінімум 6 символів"
            >
          </label>

          <button class="primary" type="submit" id="auth-submit">Увійти</button>
          <p class="message" id="auth-message"></p>
        </form>`;

      let mode='login';
      const tabs=box.querySelectorAll('.auth-tab');

      const apply=()=>{
        tabs.forEach(x=>x.classList.toggle('active',x.dataset.mode===mode));
        $('auth-name-wrap').classList.toggle('hidden',mode!=='register');
        $('auth-submit').textContent=mode==='login'?'Увійти':'Створити акаунт';
      };

      tabs.forEach(x=>x.onclick=()=>{
        mode=x.dataset.mode;
        apply();
      });

      $('auth-form').onsubmit=async e=>{
        e.preventDefault();
        $('auth-message').textContent='Перевіряємо дані…';

        try{
          if(mode==='login'){
            await window.customerAuth.login(
              $('auth-phone').value.trim(),
              $('auth-password').value
            );
          }else{
            await window.customerAuth.register(
              $('auth-name').value.trim(),
              $('auth-phone').value.trim(),
              $('auth-password').value
            );
          }

          $('auth-message').textContent='✅ Готово';
          window.renderCustomerAuth();
          await window.refreshCustomerAppointments?.();
          window.renderCustomerProfile?.();
        }catch(err){
          $('auth-message').textContent='❌ '+err.message;
        }
      };

      apply();
    }
  };

  window.renderCustomerAppointments=async()=>{
    const root=$('appointments-list');
    if(!root)return;

    const user=await window.customerAuth.me();

    if(!user){
      root.innerHTML=`
        <div class="empty-state">
          <h3>Увійдіть в акаунт</h3>
          <p>Після входу тут будуть ваші записи та їхні статуси.</p>
        </div>`;
      return;
    }

    try{
      const items=normalizeAppointments(
        await window.customerAuth.appointments()
      );

      const data=JSON.parse(
        localStorage.getItem('royal_pet_customer')||'{}'
      );

      data.appointments=items;
      data.profile={
        ...(data.profile||{}),
        name:user.name,
        phone:user.phone
      };

      localStorage.setItem(
        'royal_pet_customer',
        JSON.stringify(data)
      );

      if(!items.length){
        root.innerHTML=`
          <div class="empty-state">
            <div class="empty-icon">✂</div>
            <h3>Записів ще немає</h3>
            <p>Оберіть послугу та зручний час — ваш перший запис зʼявиться тут.</p>
            <button class="primary" id="empty-booking">Записатися</button>
          </div>`;

        $('empty-booking')?.addEventListener('click',()=>{
          location.hash='booking';
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        });

        return;
      }

      const statusClass=s=>{
        const v=String(s||'').toLowerCase();
        return v.includes('cancel')||v.includes('reject')
          ?'status-bad'
          :v.includes('done')||v.includes('complete')
            ?'status-done'
            :v.includes('confirm')||v.includes('scheduled')
              ?'status-good'
              :'status-new';
      };

      root.innerHTML=`
        <div class="profile-summary">
          <strong>${esc(user.name)}</strong>
          <span>${esc(user.phone)}</span>
          <small>${items.length} ${items.length===1?'запис':'записів'}</small>
        </div>

        <div class="history-title">Історія записів</div>

        ${items.map(x=>{
          const d=esc((x.preferred_time||'').replace('T',' · '));
          const cancelAllowed=canCancelAppointment(x.status);

          return `
            <article class="appointment-item" data-appointment-id="${esc(x.id)}">
              <div class="appointment-top">
                <strong>${esc(x.pet_name||'Улюбленець')}</strong>
                <span class="${statusClass(x.status)}">
                  ${esc(x.status_label)}
                </span>
              </div>

              <div>${x.animal_type==='dog'?'🐶':'🐱'} ${esc(x.breed||'')}</div>
              <div class="appointment-time">📅 ${d||'Дата не вказана'}</div>
              <div class="appointment-services">
                ${esc(x.additional_services||x.services||'Послуги не вказані')}
              </div>

              ${cancelAllowed?`
                <button
                  type="button"
                  class="ghost appointment-cancel"
                  data-cancel-id="${esc(x.id)}"
                >
                  Скасувати запис
                </button>
              `:''}
            </article>`;
        }).join('')}`;

      root.querySelectorAll('[data-cancel-id]').forEach(button=>{
        button.addEventListener('click',async()=>{
          const appointmentId=button.dataset.cancelId;
          const card=button.closest('.appointment-item');

          const ok=window.confirm(
            'Скасувати цей запис?\n\nПісля скасування статус запису зміниться на «Скасовано».'
          );

          if(!ok)return;

          button.disabled=true;
          button.textContent='Скасовуємо…';

          try{
            await window.customerAuth.cancelAppointment(appointmentId);

            await window.renderCustomerAppointments();
            window.renderCustomerProfile?.();
          }catch(err){
            button.disabled=false;
            button.textContent='Скасувати запис';

            const message=document.createElement('p');
            message.className='message';
            message.textContent='❌ '+err.message;

            card?.appendChild(message);

            setTimeout(()=>message.remove(),3500);
          }
        });
      });

    }catch(err){
      root.innerHTML=`<p class="message">❌ ${esc(err.message)}</p>`;
    }
  };

  window.refreshCustomerAppointments=async()=>{
    const user=await window.customerAuth.me();
    if(!user)return;

    await window.renderCustomerAppointments?.();
    window.renderCustomerProfile?.();
  };

  window.renderCustomerProfile=async()=>{
    const note=$('profile-auth-note');
    const form=$('profile-form');
    const petsRoot=$('profile-pets');

    if(!note||!form||!petsRoot)return;

    const user=await window.customerAuth.me();

    if(!user){
      note.textContent='Увійдіть в акаунт, щоб бачити свої записи та улюбленців на будь-якому пристрої.';
      form.classList.add('hidden');
      petsRoot.innerHTML='';
      return;
    }

    note.innerHTML=`Ви увійшли як <strong>${esc(user.name)}</strong>.`;
    form.classList.remove('hidden');
    $('profile-name').value=user.name||'';
    $('profile-phone').value=user.phone||'';

    try{
      const items=normalizeAppointments(
        await window.customerAuth.appointments()
      );

      const pets=[];

      for(const x of items){
        if(
          x.pet_name &&
          !pets.some(p=>p.pet_name===x.pet_name)
        ){
          pets.push(x);
        }
      }

      petsRoot.innerHTML=`
        <h3>Мої улюбленці</h3>`+
        (
          pets.length
            ?pets.map(x=>`
                <div class="pet-mini">
                  ${x.animal_type==='dog'?'🐶':'🐱'}
                  <b>${esc(x.pet_name)}</b>
                  <span>
                    ${esc(x.breed||'Порода не вказана')} ·
                    ${esc(x.age||'Вік не вказаний')}
                  </span>
                </div>
              `).join('')
            :'<p class="muted">Улюбленців ще немає. Додайте першого під час запису.</p>'
        );
    }catch{
      petsRoot.innerHTML=`
        <h3>Мої улюбленці</h3>
        <p class="muted">Не вдалося завантажити список улюбленців.</p>`;
    }
  };

  window.profileSaveBound=true;

  window.bindCustomerProfileForm=()=>{
    const f=$('profile-form');
    if(!f||f.dataset.bound)return;

    f.dataset.bound='1';

    f.addEventListener('submit',e=>{
      e.preventDefault();

      const data=JSON.parse(
        localStorage.getItem('royal_pet_customer')||'{}'
      );

      data.profile={
        name:$('profile-name').value.trim(),
        phone:$('profile-phone').value.trim()
      };

      localStorage.setItem(
        'royal_pet_customer',
        JSON.stringify(data)
      );

      $('profile-message').textContent='✅ Дані профілю збережено';

      setTimeout(()=>{
        $('profile-message').textContent='';
      },1800);
    });
  };

  window.bindCustomerProfileForm();
})();
