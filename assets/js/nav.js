function renderNav(activePage){
  var pages=[
    {id:'home',href:'../',label:'Главная',icon:'🏠'},
    {id:'articles',href:'../articles/',label:'Аналитика',icon:'📊'},
    {id:'organizations',href:'../organizations/',label:'Реестр',icon:'🏛️'},
    {id:'success',href:'../success/',label:'Кейсы',icon:'📋'},
    {id:'contacts',href:'../contacts/',label:'Заявка',icon:'✉️',cta:true}
  ];
  var isHome=activePage==='home';

  var topNav='<nav class="nav-top" id="nav-top">';
  topNav+='<a href="'+(isHome?'#':'../')+'" class="nav-brand"><div class="nav-mark">🌐</div><div><div class="nav-name">GlobalSafe Finance</div><div class="nav-tag">Центр возврата средств</div></div></a>';
  topNav+='<div class="nav-desktop">';
  pages.forEach(function(p){
    if(p.id==='home'&&isHome)return;
    var cls=p.id===activePage?'active':'';
    if(p.cta)cls+=' cta';
    topNav+='<a href="'+p.href+'" class="'+cls+'">'+p.label+'</a>';
  });
  topNav+='</div></nav>';

  var botNav='<nav class="nav-mobile">';
  pages.forEach(function(p){
    var cls=p.id===activePage?'active':'';
    if(p.cta)cls+=' cta';
    botNav+='<a href="'+p.href+'" class="'+cls+'"><span class="nm-icon">'+p.icon+'</span><span class="nm-label">'+p.label+'</span></a>';
  });
  botNav+='</nav>';

  return topNav+botNav;
}

document.addEventListener('DOMContentLoaded',function(){
  var c=document.getElementById('nav-container');
  if(c){c.outerHTML=renderNav(c.dataset.page||'home')}
  var scrolled=false;
  window.addEventListener('scroll',function(){
    var n=document.getElementById('nav-top');
    if(!n)return;
    var s=window.scrollY>20;
    if(s!==scrolled){n.classList.toggle('scrolled',s);scrolled=s}
  },{passive:true});
});
