function renderNav(activePage){
  var path=location.pathname;
  var base='/rekvizit-check/';
  var idx=path.indexOf(base);
  var after=idx>=0?path.substring(idx+base.length):'';
  var depth=0;
  if(after){
    var parts=after.replace(/\/$/,'').split('/');
    if(parts.length===1&&parts[0]!=='index.html'&&parts[0]!=='')depth=1;
    if(parts.length>=2)depth=2;
  }
  var pre='';
  if(depth===1)pre='../';
  if(depth===2)pre='../../';
  var pages=[
    {id:'home',href:pre||'./',label:'Главная',icon:'🏠'},
    {id:'articles',href:pre+'articles/',label:'Аналитика',icon:'📊'},
    {id:'organizations',href:pre+'organizations/',label:'Реестр',icon:'🏛️'},
    {id:'success',href:pre+'success/',label:'Кейсы',icon:'✨'},
    {id:'contacts',href:pre+'contacts/',label:'Заявка',icon:'✉️',cta:true}
  ];
  var isHome=activePage==='home';
  var topNav='<nav class="nav-top" id="nav-top">';
  topNav+='<a href="'+(pre||'./')+'" class="nav-brand"><div class="nav-mark">🌐</div><div><div class="nav-name">GlobalSafe Finance</div><div class="nav-tag">Центр возврата средств</div></div></a>';
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
  var s=false;
  window.addEventListener('scroll',function(){
    var n=document.getElementById('nav-top');
    if(!n)return;
    var v=window.scrollY>16;
    if(v!==s){n.classList.toggle('scrolled',v);s=v}
  },{passive:true});
});
