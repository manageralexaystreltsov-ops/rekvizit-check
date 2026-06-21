function renderNav(activePage){
  var b='/rekvizit-check/';
  var pages=[
    {id:'home',href:b,label:'Главная',icon:'🏠'},
    {id:'check',href:b+'check/',label:'Проверка',icon:'🔍'},
    {id:'quiz',href:b+'quiz/',label:'Стадия',icon:'🎯'},
    {id:'services',href:b+'services/',label:'Услуги',icon:'📋'},
    {id:'team',href:b+'team/',label:'Команда',icon:'👨‍⚖️'},
    {id:'success',href:b+'success/',label:'Кейсы',icon:'✨'},
    {id:'contacts',href:b+'contacts/',label:'Заявка',icon:'✉️',cta:true}
  ];
  var isHome=activePage==='home';

  // Top nav with hamburger
  var topNav='<nav class="nav-top" id="nav-top">';
  topNav+='<a href="'+b+'" class="nav-brand"><div class="nav-mark">🛡️</div><div><div class="nav-name">Антифрод Центр</div><div class="nav-tag">Казахстан</div></div></a>';

  // Hamburger button for mobile
  topNav+='<button class="nav-hamburger" id="nav-hamburger" onclick="toggleMobileMenu()">';
  topNav+='<span></span><span></span><span></span>';
  topNav+='</button>';

  // Desktop links
  topNav+='<div class="nav-desktop">';
  pages.forEach(function(p){
    if(p.id==='home'&&isHome)return;
    var cls=p.id===activePage?'active':'';
    if(p.cta)cls+=' cta';
    topNav+='<a href="'+p.href+'" class="'+cls+'">'+p.label+'</a>';
  });
  topNav+='</div></nav>';

  // Mobile slide-down menu
  var mobileMenu='<div class="mobile-menu" id="mobile-menu">';
  pages.forEach(function(p){
    var cls=p.id===activePage?'active':'';
    if(p.cta)cls+=' cta';
    mobileMenu+='<a href="'+p.href+'" class="mobile-menu-item '+cls+'">';
    mobileMenu+='<span class="mm-icon">'+p.icon+'</span>';
    mobileMenu+='<span class="mm-label">'+p.label+'</span>';
    mobileMenu+='</a>';
  });
  mobileMenu+='</div>';

  // Bottom nav for mobile
  var botNav='<nav class="nav-mobile">';
  pages.forEach(function(p){
    var cls=p.id===activePage?'active':'';
    if(p.cta)cls+=' cta';
    botNav+='<a href="'+p.href+'" class="'+cls+'"><span class="nm-icon">'+p.icon+'</span><span class="nm-label">'+p.label+'</span></a>';
  });
  botNav+='</nav>';

  return topNav+mobileMenu+botNav;
}

function toggleMobileMenu(){
  var menu=document.getElementById('mobile-menu');
  var hamburger=document.getElementById('nav-hamburger');
  if(menu&&hamburger){
    menu.classList.toggle('open');
    hamburger.classList.toggle('open');
  }
}

document.addEventListener('DOMContentLoaded',function(){
  var c=document.getElementById('nav-container');
  if(c){c.outerHTML=renderNav(c.dataset.page||'home')}

  // Scroll effect for top nav
  var s=false;
  window.addEventListener('scroll',function(){
    var n=document.getElementById('nav-top');
    if(!n)return;
    var v=window.scrollY>16;
    if(v!==s){n.classList.toggle('scrolled',v);s=v}
  },{passive:true});

  // Close mobile menu on link click
  document.querySelectorAll('.mobile-menu-item').forEach(function(item){
    item.addEventListener('click',function(){
      var menu=document.getElementById('mobile-menu');
      var hamburger=document.getElementById('nav-hamburger');
      if(menu)menu.classList.remove('open');
      if(hamburger)hamburger.classList.remove('open');
    });
  });
});
