(()=>{

const ADMIN_API=(window.ROYAL_PET_ADMIN_API||'').replace(/\/$/,'');
const CUSTOMER_API=(window.ROYAL_PET_CUSTOMER_API||ADMIN_API||'').replace(/\/$/,'');
const STORE='royal_pet_customer';

const breeds={
  dog:[
    'Йоркширський тер’єр','Померанський шпіц','Мальтіпу','Мальтезе',
    'Той-пудель','Чихуахуа','Ши-тцу','Французький бульдог','Мопс',
    'Кокер-спанієль','Бігль','Бордер-колі','Самоїд','Лабрадор-ретривер',
    'Золотистий ретривер','Німецька вівчарка','Хаскі','Маламут',
    'Ротвейлер','Великий пудель','Інша порода'
  ],
  cat:[
    'Британська короткошерста','Шотландська висловуха','Мейн-кун',
    'Сибірська','Перська','Бенгальська','Сфінкс','Регдол',
    'Абіссінська','Бірманська','Норвезька лісова',
    'Дворова / метис','Інша порода'
  ]
};

const services=[
  ['complex','Комплекс'],
  ['hygiene','Гігієна'],
  ['adaptive','Адаптація'],
  ['pomeranian-shedding-bath','Вичісування + купання'],
  ['mat-removal','Вичісування ковтунів'],
  ['mat-shaving','Збривання ковтунів'],
  ['bath-up-to-10kg','Купання до 10 кг'],
  ['teeth-hygiene','Гігієна зубів'],
  ['eye-hygiene','Гігієна очей']
];

let step=1;
let chosenTime='';

const $=id=>document.getElementById(id);

const read=()=>{
  try{
    return JSON.parse(localStorage.getItem(STORE)||'{}');
  }catch{
    return {};
  }
};

const write=data=>{
  localStorage.setItem(STORE,JSON.stringify(data));
};

function today(){
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getCustomerToken(){
  return localStorage.getItem('royal_pet_customer_session')||'';
}

function show(n){
  step=n;

  document.querySelectorAll('.step').forEach(x=>{
    x.classList.toggle('hidden',+x.dataset.step!==n);
  });

  ['p1','p2','p3'].forEach((id,i)=>{
    $(id)?.classList.toggle('active',i<n);
  });

  if(n===3) summary();
}

function summary(){
  $('summary').innerHTML=
    `<b>${$('pet').value}</b> · ${$('animal').value==='dog'?'собака':'кіт'}<br>`+
    `${$('breed').value}<br>`+
    `Послуги: ${
      [...document.querySelectorAll('.service.selected')]
        .map(x=>x.dataset.name)
        .join(', ')||'—'
    }<br>`+
    `Час: ${chosenTime||'—'}`;
}

function renderServices(){
  $('services').innerHTML=services.map(([id,name])=>
    `<label class="service" data-id="${id}" data-name="${name}">
      <input type="checkbox" value="${id}">
      ${name}
    </label>`
  ).join('');

  document.querySelectorAll('.service').forEach(x=>{
    x.onclick=()=>{
      x.classList.toggle('selected');
      const input=x.querySelector('input');
      if(input) input.checked=x.classList.contains('selected');
    };
  });
}

function renderBreeds(){
  const animal=$('animal').value;
  const list=breeds[animal]||[];

  $('breed').innerHTML=
    '<option value="">Оберіть породу</option>'+
    list.map(x=>`<option>${x}</option>`).join('');
}

async function loadSlots(){
  const date=$('date').value;
  const root=$('slots');

  root.innerHTML='';
  chosenTime='';

  if(!date) return;

  try{
    const h=await fetch(
      `${ADMIN_API}/public/hours?sync=${Date.now()}`,
      {cache:'no-store'}
    ).then(r=>r.json());

    const raw=String(h?.[`date:${date}`]??'').trim();

    const m=[
      ...raw.matchAll(
        /(\d{1,2}):(\d{2})\s*[–—-]\s*(\d{1,2}):(\d{2})/g
      )
    ];

    if(!m.length){
      root.textContent='На цю дату запис недоступний.';
      return;
    }

    const busy=await fetch(
      `${ADMIN_API}/public/availability?date=${date}&sync=${Date.now()}`,
      {cache:'no-store'}
    )
      .then(r=>r.ok?r.json():{})
      .catch(()=>({}));

    const used=new Set(
      (busy.slots||[])
        .filter(x=>x.status==='busy')
        .map(x=>x.time)
    );

    m.forEach(x=>{
      const t=
        x[1].padStart(2,'0')+
        ':'+
        x[2];

      const b=document.createElement('button');

      b.type='button';
      b.className='slot';
      b.textContent=t;

      if(used.has(t)){
        b.disabled=true;
        b.classList.add('busy');
      }

      b.onclick=()=>{
        document.querySelectorAll('.slot')
          .forEach(z=>z.classList.remove('selected'));

        b.classList.add('selected');
        chosenTime=t;
      };

      root.append(b);
    });

  }catch{
    root.textContent=
      'Не вдалося завантажити вільний час. Оновіть сторінку.';
  }
}

function saveAppointment(payload,serverAppointment=null){
  const data=read();

  data.appointments=
    Array.isArray(data.appointments)
      ? data.appointments
      : [];

  const item=serverAppointment||{
    id:Date.now(),
    pet_name:payload.pet_name,
    animal_type:payload.animal_type,
    breed:payload.breed,
    age:payload.age,
    owner_name:payload.owner_name,
    owner_contact:payload.owner_contact,
    preferred_time:payload.preferred_time,
    services:payload.additional_services,
    status:'Нова заявка',
    created_at:new Date().toISOString()
  };

  data.appointments.unshift(item);

  data.profile={
    ...(data.profile||{}),
    name:payload.owner_name,
    phone:payload.owner_contact
  };

  write(data);
}

window.renderCustomerAppointments=()=>{
  const root=$('appointments-list');
  if(!root) return;

  const items=read().appointments||[];

  if(!items.length){
    root.innerHTML=
      '<div class="empty-state">'+
      '<div class="empty-icon">✂</div>'+
      '<h3>Записів ще немає</h3>'+
      '<p>Оберіть послугу та зручний час — і перший запис з’явиться тут.</p>'+
      '<button class="primary" id="empty-booking">Записатися</button>'+
      '</div>';

    $('empty-booking')?.addEventListener('click',()=>{
      location.hash='booking';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    return;
  }

  root.innerHTML=items.map(x=>{
    const d=x.preferred_time?.replace('T',' · ')||'—';

    return `
      <article class="appointment-item">
        <div class="appointment-top">
          <strong>${x.pet_name||'Улюбленець'}</strong>
          <span>${x.status||'Нова заявка'}</span>
        </div>
        <div>
          ${x.animal_type==='dog'?'🐶':'🐱'}
          ${x.breed||''}
        </div>
        <div class="appointment-time">
          📅 ${d}
        </div>
        <div class="appointment-services">
          ${x.services||x.additional_services||'Послуги не вказані'}
        </div>
      </article>
    `;
  }).join('');
};

window.renderCustomerProfile=()=>{
  const data=read();
  const p=data.profile||{};

  $('profile-name').value=p.name||'';
  $('profile-phone').value=p.phone||'';

  const pets=[...(data.appointments||[])]
    .reduce((a,x)=>{
      return a.some(y=>y.pet_name===x.pet_name)
        ? a
        : a.concat(x);
    },[]);

  $('profile-pets').innerHTML=
    pets.length
      ? `<h3>Мої улюбленці</h3>${
          pets.map(x=>`
            <div class="pet-mini">
              ${x.animal_type==='dog'?'🐶':'🐱'}
              <b>${x.pet_name}</b>
              <span>${x.breed||''}</span>
            </div>
          `).join('')
        }`
      : '<h3>Мої улюбленці</h3><p class="muted">Додайте улюбленця під час першого запису.</p>';
};

$('profile-form')?.addEventListener('submit',e=>{
  e.preventDefault();

  const data=read();

  data.profile={
    name:$('profile-name').value.trim(),
    phone:$('profile-phone').value.trim()
  };

  write(data);

  $('profile-message').textContent='✅ Профіль збережено';

  setTimeout(()=>{
    $('profile-message').textContent='';
  },1800);
});

$('start')?.addEventListener('click',()=>{
  location.hash='booking';
  window.dispatchEvent(new HashChangeEvent('hashchange'));
  $('booking')?.scrollIntoView({behavior:'smooth'});
});

$('newBooking')?.addEventListener('click',()=>{
  location.hash='booking';
  window.dispatchEvent(new HashChangeEvent('hashchange'));
});

$('animal')?.addEventListener('change',renderBreeds);

$('date').min=today();
$('date').value=today();
$('date').addEventListener('change',loadSlots);

document.querySelectorAll('.next').forEach(b=>{
  b.onclick=()=>{
    if(step===1){
      const s=document.querySelector('.step[data-step="1"]');

      if(!s.querySelector('input:invalid,select:invalid')){
        show(2);
      }else{
        s.querySelector('input:invalid,select:invalid')
          ?.reportValidity();
      }

    }else if(step===2){

      if(
        !document.querySelector('.service.selected')||
        !chosenTime
      ){
        $('message').textContent=
          'Оберіть послугу та вільний час.';
        return;
      }

      show(3);
    }
  };
});

document.querySelectorAll('.back').forEach(b=>{
  b.onclick=()=>show(step-1);
});

$('form')?.addEventListener('submit',async e=>{
  e.preventDefault();

  const message=$('message');
  const token=getCustomerToken();

  if(!token){
    message.textContent=
      '❌ Щоб записатися, спочатку увійдіть або зареєструйте акаунт у «Мої записи».';
    location.hash='appointments';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    return;
  }

  message.textContent='Надсилаємо заявку…';

  const selected=[
    ...document.querySelectorAll('.service.selected')
  ];

  const payload={
    pet_name:$('pet').value.trim(),
    age:$('age').value.trim(),
    animal_type:$('animal').value,
    breed:$('breed').value,
    owner_name:$('owner').value.trim(),
    owner_contact:$('phone').value.trim(),
    last_grooming:'Не вказано',
    preferred_time:`${$('date').value}T${chosenTime}`,
    selected_services:selected
      .map(x=>x.dataset.id)
      .join(','),
    additional_services:selected
      .map(x=>x.dataset.name)
      .join(', '),
    estimated_total:0,
    home_care:'Поки не цікавить',
    comment:$('comment').value.trim()
  };

  try{

    const r=await fetch(
      `${CUSTOMER_API}/customer/appointments`,
      {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'Accept':'application/json',
          'Authorization':`Bearer ${token}`
        },
        body:JSON.stringify(payload)
      }
    );

    const d=await r.json().catch(()=>({}));

    if(!r.ok){
      throw Error(
        d.error||
        d.details||
        `Помилка сервера (${r.status})`
      );
    }

    saveAppointment(payload,d.appointment||null);

    message.textContent=
      '✅ Запис успішно створено! Він збережений у «Мої записи».';

    setTimeout(()=>{
      document.getElementById('form').reset();

      chosenTime='';

      document
        .querySelectorAll('.service.selected')
        .forEach(x=>x.classList.remove('selected'));

      show(1);

      location.hash='appointments';
      window.dispatchEvent(new HashChangeEvent('hashchange'));

      window.refreshCustomerAppointments?.();
      window.renderCustomerAppointments?.();

    },700);

  }catch(err){

    message.textContent=
      '❌ '+(err.message||'Не вдалося створити запис.');

  }
});

renderServices();
renderBreeds();
loadSlots();

})();
