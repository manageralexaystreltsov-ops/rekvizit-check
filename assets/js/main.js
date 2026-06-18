(function(){
'use strict';
var DATA=null;
async function load(){
  try{
    var r=await fetch('data/clients.json');
    DATA=await r.json();
    renderList();
  }catch(e){console.error(e)}
}

function maskPhone(p){
  if(!p||p.length<7)return p;
  return p.substring(0,4)+'****'+p.substring(p.length-3);
}

function classByStatus(s){
  if(['new'].includes(s))return's-new';
  if(['docs_collect','docs_ready'].includes(s))return's-docs';
  if(['bank_check','bank_review'].includes(s))return's-bank';
  if(['regulator','regulator_review'].includes(s))return's-reg';
  if(['court_prep','court','court_win'].includes(s))return's-court';
  if(['return_done'].includes(s))return's-done';
  if(['partial_return'].includes(s))return's-partial';
  if(['blocked'].includes(s))return's-blocked';
  if(['return_process'].includes(s))return's-return';
  return's-new';
}

function renderList(){
  if(!DATA||!DATA.clients)return;
  var wrap=document.getElementById('clients-list');
  if(!wrap)return;
  // Показываем последние 50 активных дел (не закрытые)
  var active=DATA.clients.filter(function(c){
    return['return_done'].indexOf(c.status)===-1;
  }).slice(0,50);

  var html=active.map(function(c){
    var cls=classByStatus(c.status);
    var amt=c.amount?c.amount.toLocaleString('ru-RU')+' ₸':'—';
    return'<div class="cl-item" data-id="'+c.id+'" onclick="showCase(\''+c.caseNumber+'\')"><div class="cl-row"><div class="cl-num">'+c.caseNumber+'</div><div class="cl-badge cl-badge-'+c.status+'">'+c.statusName+'</div></div><div class="cl-row"><div class="cl-name">'+c.firstName+' '+c.lastName+'</div><div class="cl-city">'+c.city+'</div></div><div class="cl-row"><div class="cl-platform">'+c.platform+'</div><div class="cl-amount">'+amt+'</div></div><div class="cl-row"><div class="cl-phone">'+maskPhone(c.phone)+'</div><div class="cl-date">'+c.lastUpdate+'</div></div></div>';
  }).join('');
  wrap.innerHTML=html;
}

function buildTimeline(client){
  var stages=[
    {key:'new',name:'Заявка принята'},
    {key:'docs_collect',name:'Сбор документов'},
    {key:'docs_ready',name:'Документы готовы'},
    {key:'bank_check',name:'Проверка банка'},
    {key:'bank_review',name:'Рассмотрение банком'},
    {key:'regulator',name:'Обращение в регулятор'},
    {key:'regulator_review',name:'Рассмотрение регулятором'},
    {key:'court_prep',name:'Подготовка иска'},
    {key:'court',name:'В суде'},
    {key:'court_win',name:'Решение суда'},
    {key:'return_process',name:'Возврат средств'},
    {key:'return_done',name:'Средства возвращены'}
  ];
  var order=['new','docs_collect','docs_ready','bank_check','bank_review','regulator','regulator_review','court_prep','court','court_win','return_process','return_done'];
  var idx=order.indexOf(client.status);
  return stages.map(function(s,i){
    var cls='pending';
    if(client.status==='partial_return'&&i<=10)cls='done';
    else if(client.status==='blocked'&&i<=Math.min(idx,order.length-1))cls=i<idx?'done':'active';
    else if(i<idx)cls='done';
    else if(i===idx)cls='active';
    return'<li class="tl-item '+cls+'"><div class="tl-dot"></div><div class="tl-title">'+s.name+'</div>'+(i===idx?'<div class="tl-desc">'+(client.statusDescription||'')+'</div>':'')+'</li>';
  }).join('');
}

function buildHistory(history){
  if(!history||!history.length)return'';
  var items=history.map(function(h){
    var typeClass='';
    if(h.type==='success')typeClass='h-success';
    else if(h.type==='warning')typeClass='h-warning';
    else if(h.type==='action')typeClass='h-action';
    else if(h.type==='info')typeClass='h-info';
    else typeClass='h-system';
    return'<div class="h-item '+typeClass+'"><div class="h-icon">'+h.icon+'</div><div class="h-content"><div class="h-text">'+h.text+'</div><div class="h-date">'+h.date+' '+h.time+'</div></div></div>';
  }).join('');
  return'<div class="history">'+items+'</div>';
}

function buildNextSteps(status){
  var steps={
    new:[
      {icon:'📞',text:'Наш специалист свяжется с вами в течение 24 часов',time:'Ближайшее время'},
      {icon:'📋',text:'Проведём первичный анализ вашей ситуации',time:'1-2 дня'},
      {icon:'📊',text:'Оценим шансы на возврат и составим план действий',time:'2-3 дня'},
    ],
    docs_collect:[
      {icon:'📄',text:'Собираем полный пакет документов',time:'3-7 дней'},
      {icon:'🔍',text:'Проверяем подлинность и полноту документов',time:'1-2 дня'},
      {icon:'⚖️',text:'Передаём в юридический отдел для анализа',time:'После сбора'},
    ],
    docs_ready:[
      {icon:'⚖️',text:'Юрист изучает документы и формирует правовую позицию',time:'2-3 дня'},
      {icon:'🏦',text:'Подготавливаем обращение в банк-эмитент',time:'3-5 дней'},
      {icon:'📤',text:'Отправляем запрос на оспаривание транзакций',time:'5-7 дней'},
    ],
    bank_check:[
      {icon:'🏦',text:'Ожидаем ответа от банка-эмитента',time:'5-30 рабочих дней'},
      {icon:'📞',text:'Контролируем процесс, следим за статусом',time:'Еженедельно'},
      {icon:'📊',text:'При необходимости подаём повторные обращения',time:'По графику'},
    ],
    bank_review:[
      {icon:'🔍',text:'Банк проводит внутреннюю проверку',time:'15-45 дней'},
      {icon:'📋',text:'Мы предоставляем дополнительные доказательства',time:'По запросу банка'},
      {icon:'💰',text:'Ожидаем решения о возврате средств',time:'До 30 дней'},
    ],
    regulator:[
      {icon:'🏛️',text:'АРРФР/НБ РК регистрирует обращение',time:'5-10 дней'},
      {icon:'🔍',text:'Регулятор запраšивает документацию у платформы',time:'30-60 дней'},
      {icon:'⚠️',text:'Платформа вносится в список предупреждений',time:'По решению'},
    ],
    regulator_review:[
      {icon:'🏛️',text:'Регулятор проводит проверку деятельности платформы',time:'30-90 дней'},
      {icon:'🔒',text:'Возможна блокировка операций платформы',time:'По решению'},
      {icon:'📋',text:'Получаем официальный ответ от регулятора',time:'До 90 дней'},
    ],
    court_prep:[
      {icon:'📝',text:'Составляем исковое заявление',time:'3-5 дней'},
      {icon:'📋',text:'Формируем доказательную базу',time:'2-3 дня'},
      {icon:'📤',text:'Подаём иск в суд',time:'После подготовки'},
    ],
    court:[
      {icon:'🏛️',text:'Суд принимает дело к производству',time:'5-10 дней'},
      {icon:'📅',text:'Назначается предварительное заседание',time:'1-2 месяца'},
      {icon:'⚖️',text:'Рассмотрение дела по существу',time:'1-6 месяцев'},
    ],
    court_win:[
      {icon:'📄',text:'Получаем исполнительный лист',time:'5-10 дней'},
      {icon:'🏦',text:'Направляем исполнительный лист в банк',time:'3-5 дней'},
      {icon:'💰',text:'Банк выполняет решение суда',time:'30-60 дней'},
    ],
    return_process:[
      {icon:'💰',text:'Банк зачисляет средства на наш счёт',time:'3-10 дней'},
      {icon:'📋',text:'Мы проверяем поступление средств',time:'1-2 дня'},
      {icon:'💳',text:'Переводим деньги на вашу карту',time:'1-3 дня'},
    ],
    return_done:[
      {icon:'🎉',text:'Дело закрыто. Средства возвращены!',time:'Завершено'},
      {icon:'📋',text:'Храните документы на случай вопросов',time:'Бессрочно'},
    ],
    partial_return:[
      {icon:'💰',text:'Часть средств уже на вашем счёте',time:'Проверьте баланс'},
      {icon:'⚖️',text:'Работаем по возврату оставшейся суммы',time:'1-3 месяца'},
      {icon:'📤',text:'Подано заявление в суд на остаток',time:'В процессе'},
    ],
    blocked:[
      {icon:'📞',text:'Свяжитесь с куратором для уточнения',time:'Как можно скорее'},
      {icon:'📄',text:'Предоставьте недостающие документы',time:'В ближайшее время'},
      {icon:'⏳',text:'После получения документов дело продолжится',time:'После предоставления'},
    ]
  };
  var list=steps[status]||steps.new;
  return'<div class="next-steps">'+list.map(function(s){
    return'<div class="ns-item"><div class="ns-icon">'+s.icon+'</div><div class="ns-text">'+s.text+'</div><div class="ns-time">'+s.time+'</div></div>';
  }).join('')+'</div>';
}

function formatDate(d){if(!d)return'—';var p=d.split('-');return p[2]+'.'+p[1]+'.'+p[0]}

function renderResult(c){
  var cls=classByStatus(c.status);
  var alertMap={
    new:{cls:'info',text:'Ваше заявление принято и ожидает первичного анализа. Наш специалист свяжется с вами в течение 24 часов.'},
    docs_collect:{cls:'warning',text:'Необходимо предоставить документы. Свяжитесь с вашим куратором для уточнения списка.'},
    docs_ready:{cls:'info',text:'Все документы получены. Дело передано в юридический отдел для дальнейшей работы.'},
    bank_check:{cls:'info',text:'Запрос отправлен в банк-эмитент. Срок ответа — от 5 до 30 рабочих дней.'},
    bank_review:{cls:'info',text:'Банк рассматривает ваше оспаривание. Мы контролируем процесс.'},
    regulator:{cls:'info',text:'Дело передано в АРРФР/НБ РК. Регулятор проверяет законность операций.'},
    regulator_review:{cls:'info',text:'Регулятор рассматривает ваше обращение. Срок — от 30 до 90 дней.'},
    court_prep:{cls:'warning',text:'Готовится исковое заявление. Юрист подготовит документы в течение 5 рабочих дней.'},
    court:{cls:'info',text:'Дело находится в судебном производстве. Срок рассмотрения — от 1 до 6 месяцев.'},
    court_win:{cls:'success',text:'Суд вынес решение в вашу пользу! Начинается процедура возврата средств.'},
    return_process:{cls:'success',text:'Процесс возврата средств запущен. Деньги будут зачислены на ваш счёт.'},
    return_done:{cls:'success',text:'Средства успешно возвращены! Дело закрыто. Спасибо за доверие.'},
    partial_return:{cls:'warning',text:'Часть средств возвращена. Работа по возврату оставшейся суммы продолжается.'},
    blocked:{cls:'warning',text:'Дело приостановлено. Свяжитесь с куратором для получения подробной информации.'}
  };
  var a=alertMap[c.status]||alertMap.new;
  var amt=c.amount?c.amount.toLocaleString('ru-RU')+' ₸':'—';
  return'<div class="case-card"><div class="case-header '+cls+'"><div class="case-id">Дело № '+c.caseNumber+'</div><div class="case-title">'+c.statusName+'</div><div class="case-subtitle">'+c.firstName+' '+c.lastName+' · '+c.city+'</div></div><div class="case-body"><div class="case-alert '+a.cls+'">ℹ️ '+a.text+'</div><div class="case-grid"><div class="case-field"><label>ФИО</label><span>'+c.firstName+' '+c.lastName+'</span></div><div class="case-field"><label>Телефон</label><span>'+maskPhone(c.phone)+'</span></div><div class="case-field"><label>Город</label><span>'+c.city+'</span></div><div class="case-field"><label>Платформа</label><span>'+c.platform+'</span></div><div class="case-field"><label>Сумма убытка</label><span>'+amt+'</span></div><div class="case-field"><label>Дата обращения</label><span>'+formatDate(c.caseDate)+'</span></div><div class="case-field"><label>Последнее обновление</label><span>'+formatDate(c.lastUpdate)+'</span></div><div class="case-field"><label>Куратор</label><span>'+c.assignedTo+'</span></div></div><h3 style="margin:20px 0 12px;font-size:1rem">Хронология дела</h3><ul class="timeline">'+buildTimeline(c)+'</ul><h3 style="margin:24px 0 12px;font-size:1rem">Подробная история</h3>'+buildHistory(c.history)+'<h3 style="margin:24px 0 12px;font-size:1rem">📋 Что будет дальше</h3>'+buildNextSteps(c.status)+'</div></div>';
}

function search(q){
  if(!DATA||!q)return null;
  var s=q.toLowerCase().trim();
  return DATA.clients.find(function(c){
    return(c.caseNumber&&c.caseNumber.toLowerCase().includes(s))||
      (c.firstName&&c.firstName.toLowerCase().includes(s))||
      (c.lastName&&c.lastName.toLowerCase().includes(s))||
      (c.phone&&c.phone.includes(s))||
      (c.email&&c.email.toLowerCase().includes(s))||
      ((c.firstName+' '+c.lastName).toLowerCase().includes(s));
  });
}

// Global function for onclick
window.showCase=function(caseNum){
  if(!DATA)return;
  var c=DATA.clients.find(function(x){return x.caseNumber===caseNum});
  if(!c)return;
  var wrap=document.getElementById('result-wrap');
  var listWrap=document.getElementById('clients-list-wrap');
  listWrap.style.display='none';
  wrap.innerHTML=renderResult(c);
  wrap.scrollIntoView({behavior:'smooth'});
  document.getElementById('back-btn').style.display='inline-block';
};

window.backToList=function(){
  document.getElementById('result-wrap').innerHTML='';
  document.getElementById('clients-list-wrap').style.display='block';
  document.getElementById('back-btn').style.display='none';
  window.scrollTo({top:0,behavior:'smooth'});
};

document.addEventListener('DOMContentLoaded',function(){
  load();
  var form=document.getElementById('search-form');
  var input=document.getElementById('search-input');
  var wrap=document.getElementById('result-wrap');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var q=input.value.trim();
    if(!q||q.length<2)return;
    wrap.innerHTML='<div class="loading on"><div class="spinner"></div>Проверка...</div>';
    document.getElementById('clients-list-wrap').style.display='none';
    document.getElementById('back-btn').style.display='inline-block';
    setTimeout(function(){
      var c=search(q);
      if(c){wrap.innerHTML=renderResult(c)}
      else{wrap.innerHTML='<div class="not-found"><div class="not-found-icon">🔍</div><h3>Дело не найдено</h3><p>Проверьте правильность ввода номера дела, ФИО или телефона</p></div>';}
    },400);
  });
});
})();
