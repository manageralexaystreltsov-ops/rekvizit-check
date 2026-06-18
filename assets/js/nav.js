function renderNav(activePage){
  var pages=[
    {id:'home',href:'../',label:'Главная'},
    {id:'articles',href:'../articles/',label:'Аналитика'},
    {id:'success',href:'../success/',label:'Кейсы'},
    {id:'organizations',href:'../organizations/',label:'Организации'},
    {id:'contacts',href:'../contacts/',label:'Оставить заявку',cta:true}
  ];
  var isHome=activePage==='home';
  var prefix=isHome?'':'../';
  
  var html='<nav class="nav" id="nav">';
  html+='<a href="'+prefix+'" class="nav-brand"><div class="nav-mark">🌐</div><div><div class="nav-name">GlobalSafe Finance</div><div class="nav-tag">Центр возврата средств</div></div></a>';
  html+='<div class="nav-menu">';
  pages.forEach(function(p){
    if(p.id==='home'&&isHome){
      // skip home link on home page
    }else{
      var href=isHome?p.href:p.href;
      var cls=p.id===activePage?'active':'';
      if(p.cta)cls+=' nav-cta';
      html+='<a href="'+href+'" class="'+cls+'">'+p.label+'</a>';
    }
  });
  html+='</div></nav>';
  return html;
}

// Auto-inject nav
document.addEventListener('DOMContentLoaded',function(){
  var navContainer=document.getElementById('nav-container');
  if(navContainer){
    var page=navContainer.dataset.page||'home';
    navContainer.outerHTML=renderNav(page);
  }
  
  // Scroll effect
  window.addEventListener('scroll',function(){
    var nav=document.getElementById('nav');
    if(nav)nav.classList.toggle('scrolled',window.scrollY>50);
  });
});
