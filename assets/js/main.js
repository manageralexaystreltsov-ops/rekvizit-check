(function(){
'use strict';
var DATA=null;
async function load(){
  try{var r=await fetch('data/clients.json');DATA=await r.json();renderList()}catch(e){console.error(e)}
}

function maskPhone(p){if(!p||p.length<7)return p;return p.substring(0,4)+'****'+p.substring(p.length-3)}

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
  var active=DATA.clients.filter(function(c){return c.status!=='return_done'}).slice(0,50);
  wrap.innerHTML=active.map(function(c){
    var amt=c.amount?c.amount.toLocaleString('ru-RU')+' ₸':'—';
    return'<div class="cl-item" onclick="showCase(\''+c.caseNumber+'\')"><div class="cl-row"><div class="cl-num">'+c.caseNumber+'</div><div class="cl-badge cl-badge-'+c.status+'">'+c.statusName+'</div></div><div class="cl-row"><div class="cl-name">'+c.firstName+' '+c.lastName+'</div><div class="cl-city">'+c.city+'</div></div><div class="cl-row"><div class="cl-platform">'+c.platform+'</div><div class="cl-amount">'+amt+'</div></div><div class="cl-row"><div class="cl-phone">'+maskPhone(c.phone)+'</div><div class="cl-date">'+c.lastUpdate+'</div></div></div>';
  }).join('');
}

function buildTimeline(c){
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
  var idx=order.indexOf(c.status);
  return stages.map(function(s,i){
    var cls='pending';
    if(c.status==='partial_return'&&i<=10)cls='done';
    else if(c.status==='blocked'&&i<=Math.min(idx,11))cls=i<idx?'done':'active';
    else if(i<idx)cls='done';
    else if(i===idx)cls='active';
    return'<li class="tl-item '+cls+'"><div class="tl-dot"></div><div class="tl-title">'+s.name+'</div>'+(i===idx?'<div class="tl-desc">'+(c.statusDescription||'')+'</div>':'')+'</li>';
  }).join('');
}

function buildHistory(h){
  if(!h||!h.length)return'';
  return'<div class="history">'+h.map(function(e){
    var tc='h-system';
    if(e.type==='success')tc='h-success';
    else if(e.type==='warning')tc='h-warning';
    else if(e.type==='action')tc='h-action';
    else if(e.type==='info')tc='h-info';
    return'<div class="h-item '+tc+'"><div class="h-icon">'+e.icon+'</div><div class="h-content"><div class="h-text">'+e.text+'</div><div class="h-date">'+e.date+' '+e.time+'</div></div></div>';
  }).join('')+'</div>';
}

function buildNextSteps(status){
  var map={
    new:[
      {icon:'📞',text:'Наш специалист свяжется с вами в течение 24 часов',time:'Ближайшее время'},
      {icon:'📋',text:'Проведём первичный анализ ситуации',time:'1-2 дня'},
      {icon:'📊',text:'Оценим шансы и составим план действий',time:'2-3 дня'}
    ],
    docs_collect:[
      {icon:'📄',text:'Собираем полный пакет документов',time:'3-7 дней'},
      {icon:'🔍',text:'Проверяем подлинность и полноту',time:'1-2 дня'},
      {icon:'⚖️',text:'Передаём в юридический отдел',time:'После сбора'}
    ],
    docs_ready:[
      {icon:'⚖️',text:'Юрист формирует правовую позицию',time:'2-3 дня'},
      {icon:'🏦',text:'Подготавливаем обращение в банк',time:'3-5 дней'},
      {icon:'📤',text:'Отправляем запрос на оспаривание',time:'5-7 дней'}
    ],
    bank_check:[
      {icon:'🏦',text:'Ожидаем ответа от банка-эмитента',time:'5-30 рабочих дней'},
      {icon:'📞',text:'Контролируем процесс',time:'Еженедельно'},
      {icon:'📊',text:'При необходимости — повторные обращения',time:'По графику'}
    ],
    bank_review:[
      {icon:'🔍',text:'Банк проводит проверку',time:'15-45 дней'},
      {icon:'📋',text:'Предоставляем дополнительные доказательства',time:'По запросу'},
      {icon:'💰',text:'Ожидаем решение о возврате',time:'До 30 дней'}
    ],
    regulator:[
      {icon:'🏛️',text:'АРРФР регистрирует обращение',time:'5-10 дней'},
      {icon:'🔍',text:'Регулятор запрашивает документацию',time:'30-60 дней'},
      {icon:'⚠️',text:'Платформа вносится в чёрный список',time:'По решению'}
    ],
    regulator_review:[
      {icon:'🏛️',text:'Проверка деятельности платформы',time:'30-90 дней'},
      {icon:'🔒',text:'Возможна блокировка операций',time:'По решению'},
      {icon:'📋',text:'Официальный ответ регулятора',time:'До 90 дней'}
    ],
    court_prep:[
      {icon:'📝',text:'Составляем исковое заявление',time:'3-5 дней'},
      {icon:'📋',text:'Формируем доказательную базу',time:'2-3 дня'},
      {icon:'📤',text:'Подаём иск в суд',time:'После подготовки'}
    ],
    court:[
      {icon:'🏛️',text:'Суд принимает дело',time:'5-10 дней'},
      {icon:'📅',text:'Предварительное заседание',time:'1-2 месяца'},
      {icon:'⚖️',text:'Рассмотрение по существу',time:'1-6 месяцев'}
    ],
    court_win:[
      {icon:'📄',text:'Получаем исполнительный лист',time:'5-10 дней'},
      {icon:'🏦',text:'Направляем лист в банк',time:'3-5 дней'},
      {icon:'💰',text:'Банк выполняет решение суда',time:'30-60 дней'}
    ],
    return_process:[
      {icon:'💰',text:'Банк зачисляет средства',time:'3-10 дней'},
      {icon:'📋',text:'Проверяем поступление',time:'1-2 дня'},
      {icon:'💳',text:'Переводим на вашу карту',time:'1-3 дня'}
    ],
    return_done:[
      {icon:'🎉',text:'Средства возвращены!',time:'Завершено'},
      {icon:'📋',text:'Храните документы',time:'Бессрочно'}
    ],
    partial_return:[
      {icon:'💰',text:'Часть средств на вашем счёте',time:'Проверьте баланс'},
      {icon:'⚖️',text:'Работаем по остатку суммы',time:'1-3 месяца'},
      {icon:'📤',text:'Заявление в суд на остаток',time:'В процессе'}
    ],
    blocked:[
      {icon:'📞',text:'Свяжитесь с куратором',time:'Как можно скорее'},
      {icon:'📄',text:'Предоставьте недостающие документы',time:'В ближайшее время'},
      {icon:'⏳',text:'Дело продолжится после получения',time:'После предоставления'}
    ]
  };
  var list=map[status]||map.new;
  return'<div class="next-steps">'+list.map(function(s,i){
    return'<div class="ns-item" style="animation-delay:'+(i*0.1+0.1)+'s"><div class="ns-icon">'+s.icon+'</div><div class="ns-text">'+s.text+'</div><div class="ns-time">'+s.time+'</div></div>';
  }).join('')+'</div>';
}

function formatDate(d){if(!d)return'—';var p=d.split('-');return p[2]+'.'+p[1]+'.'+p[0]}

function renderResult(c){
  var cls=classByStatus(c.status);
  var alertMap={
    new:{cls:'info',text:'Заявление принято. Специалист свяжется в течение 24 часов.'},
    docs_collect:{cls:'warning',text:'Необходимо предоставить документы. Свяжитесь с куратором.'},
    docs_ready:{cls:'info',text:'Документы получены. Дело передано в юридический отдел.'},
    bank_check:{cls:'info',text:'Запрос отправлен в банк. Срок ответа: 5-30 дней.'},
    bank_review:{cls:'info',text:'Банк рассматривает оспаривание. Контролируем процесс.'},
    regulator:{cls:'info',text:'Дело передано в АРРФР/НБ РК. Проверка законности операций.'},
    regulator_review:{cls:'info',text:'Регулятор рассматривает обращение. Срок: 30-90 дней.'},
    court_prep:{cls:'warning',text:'Готовится исковое заявление. 5 рабочих дней на подготовку.'},
    court:{cls:'info',text:'Дело в судебном производстве. Срок: 1-6 месяцев.'},
    court_win:{cls:'success',text:'Суд вынес решение! Начинается процедура возврата.'},
    return_process:{cls:'success',text:'Возврат средств запущен. Деньги поступят на счёт.'},
    return_done:{cls:'success',text:'Средства возвращены! Дело закрыто.'},
    partial_return:{cls:'warning',text:'Часть средств возвращена. Работа по остатку продолжается.'},
    blocked:{cls:'warning',text:'Дело приостановлено. Свяжитесь с куратором.'}
  };
  var a=alertMap[c.status]||alertMap.new;
  var amt=c.amount?c.amount.toLocaleString('ru-RU')+' ₸':'—';
  var html='<div class="case-card">';
  html+='<div class="case-header '+cls+'">';
  html+='<div class="case-id">ДЕЛО № '+c.caseNumber+'</div>';
  html+='<div class="case-title">'+c.statusName+'</div>';
  html+='<div class="case-subtitle">'+c.firstName+' '+c.lastName+' · '+c.city+'</div>';
  html+='</div>';
  html+='<div class="case-body">';
  html+='<div class="case-alert '+a.cls+'">ℹ️ '+a.text+'</div>';
  html+='<div class="case-grid">';
  html+='<div class="case-field"><label>ФИО</label><span>'+c.firstName+' '+c.lastName+'</span></div>';
  html+='<div class="case-field"><label>Телефон</label><span>'+maskPhone(c.phone)+'</span></div>';
  html+='<div class="case-field"><label>Город</label><span>'+c.city+'</span></div>';
  html+='<div class="case-field"><label>Платформа</label><span>'+c.platform+'</span></div>';
  html+='<div class="case-field"><label>Сумма убытка</label><span>'+amt+'</span></div>';
  html+='<div class="case-field"><label>Дата обращения</label><span>'+formatDate(c.caseDate)+'</span></div>';
  html+='<div class="case-field"><label>Обновлено</label><span>'+formatDate(c.lastUpdate)+'</span></div>';
  html+='<div class="case-field"><label>Куратор</label><span>'+c.assignedTo+'</span></div>';
  html+='</div>';
  html+='<div class="section-title">Хронология дела</div>';
  html+='<ul class="timeline">'+buildTimeline(c)+'</ul>';
  html+='<div class="section-title">Подробная история</div>';
  html+=buildHistory(c.history);
  html+='<div class="section-title">📋 Что будет дальше</div>';
  html+=buildNextSteps(c.status);
  html+='</div></div>';
  return html;
}

function search(q){
  if(!DATA||!q)return null;
  var s=q.toLowerCase().trim();
  return DATA.clients.find(function(c){
    return(c.caseNumber&&c.caseNumber.toLowerCase().includes(s))||
      (c.firstName&&c.firstName.toLowerCase().includes(s))||
      (c.lastName&&c.lastName.toLowerCase().includes(s))||
      (c.phone&&c.phone.includes(s))||
      ((c.firstName+' '+c.lastName).toLowerCase().includes(s));
  });
}

window.showCase=function(caseNum){
  if(!DATA)return;
  var c=DATA.clients.find(function(x){return x.caseNumber===caseNum});
  if(!c)return;
  document.getElementById('clients-list-wrap').style.display='none';
  document.getElementById('result-wrap').innerHTML=renderResult(c);
  document.getElementById('result-wrap').scrollIntoView({behavior:'smooth'});
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
  var loader=document.getElementById('search-loading');

  form.addEventListener('submit',function(e){
    e.preventDefault();
    var q=input.value.trim();
    if(!q||q.length<2)return;
    loader.classList.add('on');
    document.getElementById('clients-list-wrap').style.display='none';
    document.getElementById('back-btn').style.display='inline-block';
    setTimeout(function(){
      var c=search(q);
      loader.classList.remove('on');
      if(c){wrap.innerHTML=renderResult(c);wrap.scrollIntoView({behavior:'smooth'})}
      else{wrap.innerHTML='<div class="not-found"><div class="not-found-icon">🔍</div><h3>Дело не найдено</h3><p>Проверьте правильность ввода</p></div>';}
    },1200);
  });
});
})();
