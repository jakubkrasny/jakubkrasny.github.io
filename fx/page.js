/* Efekty na celé stránce: živé pozadí (neuronová síť), neonový ukazatel postupu, AI průvodce s komentářem u každé sekce,
   dekódování nadpisů, kurzorové světlo na kartách a magnetická tlačítka. Vše se vypne při "omezit pohyb". */
(function(){
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var fine=matchMedia('(pointer: fine)').matches,wide=innerWidth>860,career=document.body.classList.contains('career');
function ready(f){document.readyState!=='loading'?f():document.addEventListener('DOMContentLoaded',f)}
ready(function(){
/* 1) ukazatel postupu */
var bar=document.createElement('div');bar.className='fxbar';document.body.appendChild(bar);
function pr(){var h=document.documentElement.scrollHeight-innerHeight;bar.style.transform='scaleX('+(h>0?Math.min(1,scrollY/h):0)+')'}
addEventListener('scroll',pr,{passive:true});pr();

/* 2) živé pozadí: hvězdy spojené do sítě, reagují na kurzor a scroll */
(function(){
var cv=document.createElement('canvas');cv.className='fxbg';document.body.insertBefore(cv,document.body.firstChild);
var cx=cv.getContext('2d'),W,H,dpr=Math.min(2,devicePixelRatio||1),P=[],mx=-999,my=-999,sy=scrollY,on=true;
function size(){W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);var n=Math.round(Math.min(90,W*H/16000));P=[];for(var i=0;i<n;i++)P.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,z:.3+Math.random()*.7,ph:Math.random()*6})}
size();addEventListener('resize',size);
addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY},{passive:true});
document.addEventListener('visibilitychange',function(){on=!document.hidden;if(on)requestAnimationFrame(fr)});
var lastY=scrollY,vel=0;
function fr(t){if(!on)return;requestAnimationFrame(fr);
  vel=vel*.9+(scrollY-lastY)*.1;lastY=scrollY;cx.clearRect(0,0,W,H);
  var L=W<700?110:150;
  for(var i=0;i<P.length;i++){var a=P[i];a.x+=a.vx;a.y+=a.vy-vel*.12*a.z;
    if(a.x<0)a.x=W;if(a.x>W)a.x=0;if(a.y<0)a.y=H;if(a.y>H)a.y=0;
    var dm=Math.hypot(a.x-mx,a.y-my);if(dm<180){a.x+=(mx-a.x)*.004;a.y+=(my-a.y)*.004}
    var tw=.45+.35*Math.sin(t/900+a.ph);
    cx.fillStyle='rgba(120,255,175,'+(tw*a.z)+')';cx.beginPath();cx.arc(a.x,a.y,1+a.z*1.1,0,6.3);cx.fill();
    for(var j=i+1;j<P.length;j++){var b=P[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d<L){cx.strokeStyle='rgba(46,243,121,'+(.16*(1-d/L)*Math.min(a.z,b.z))+')';cx.lineWidth=1;cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke()}}
    if(dm<170){cx.strokeStyle='rgba(180,255,210,'+(.4*(1-dm/170))+')';cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(mx,my);cx.stroke()}}}
requestAnimationFrame(fr);
})();

/* 3) AI průvodce: bublina vlevo dole, která komentuje, kde zrovna jsi */
(function(){
if(!wide)return;
var MSG=career?{
 demo:'Zavoláš firmě, vedeš konzultaci a uzavřeš předplatné. Žádné slepé obvolávání.',
 cesta:'Takhle vypadá tvoje cesta: od učení AI až po vedení lidí.',
 nabizim:'Tohle ti nabízím: provize podle výkonu, zaškolení a podporu týmu.',
 koho:'Nepotřebuješ zkušenost s AI. Důležitá je chuť vydělávat a komunikovat.',
 vyber:'Výběr je jednoduchý a zabere pár dní.',
 kontakt:'Ozvi se mi napřímo, rád ti vše vysvětlím.'}:{
 demo:'Na konzultaci ušetříš čas, snížíš náklady a získáš lepší výsledky.',
 vysledky:'Takhle vypadají reálné výstupy: texty, obrázky, videa i hlas.',
 'pro-koho':'AI se hodí podnikatelům, e-shopům i firmám všech velikostí.',
 proc:'Proč Everbot: všechny modely na jednom místě a česká podpora.',
 recenze:'Tohle říkají klienti. Čtyři a půl hvězdy z reálných recenzí.',
 media:'O Everbotu se píše i v médiích.',
 novinky:'Čerstvé novinky ze světa AI, každý den nové.',
 zdarma:'A konzultace je úplně zdarma.',
 rezervace:'Poslední krok: vyber si termín. Potvrdím ti ho telefonicky.'};
var el=document.createElement('div');el.className='fxguide';el.setAttribute('aria-live','polite');
el.innerHTML='<div class="fxg-h"><span class="fxg-dot"></span><b>AI průvodce</b><button type="button" aria-label="Skrýt průvodce">×</button></div><p></p>';
document.body.appendChild(el);
var p=el.querySelector('p'),closed=false,cur=null,tm=null,txt='';
try{closed=sessionStorage.getItem('fxg')==='1'}catch(e){}
el.querySelector('button').onclick=function(){closed=true;el.classList.remove('on');try{sessionStorage.setItem('fxg','1')}catch(e){}};
function say(s){if(s===txt)return;txt=s;clearTimeout(tm);var i=0;p.textContent='';p.classList.add('typing');
  (function nx(){p.textContent=s.slice(0,i++);if(i<=s.length)tm=setTimeout(nx,18+Math.random()*16);else p.classList.remove('typing')})()}
var ids=Object.keys(MSG),secs=ids.map(function(id){return document.getElementById(id)}).filter(Boolean);
function upd(){if(closed)return;var mid=innerHeight*.5,best=null;
  secs.forEach(function(s){var r=s.getBoundingClientRect();if(r.top<mid&&r.bottom>mid)best=s});
  if(!best){el.classList.remove('on');return}
  var id=best.id;if(id==='rezervace'||id==='kontakt'){/* u rezervace průvodce zůstane, ale přepne text */}
  el.classList.add('on');if(id!==cur){cur=id;say(MSG[id])}}
var raf=0;addEventListener('scroll',function(){if(!raf)raf=requestAnimationFrame(function(){raf=0;upd()})},{passive:true});
setTimeout(upd,5500);
})();

/* 4) dekódování nadpisů při příjezdu do záběru */
(function(){
if(!('IntersectionObserver' in window))return;
var G='01#%&<>/{}ABCDEFGHJKLMNPRSTUVXYZ',hs=[].slice.call(document.querySelectorAll('.scene h2:not(.big)'));
function run(h){var tw=document.createTreeWalker(h,NodeFilter.SHOW_TEXT),ns=[],n;while(n=tw.nextNode())if(n.nodeValue.trim())ns.push({n:n,o:n.nodeValue});
  var tot=ns.reduce(function(a,b){return a+b.o.length},0),t0=performance.now(),D=Math.min(900,300+tot*14);
  (function f(now){var k=Math.min(1,(now-t0)/D),shown=Math.floor(k*tot),c=0;
    ns.forEach(function(x){var o=x.o,s='';for(var i=0;i<o.length;i++,c++){var ch=o[i];s+=(c<shown||ch===' ')?ch:G[Math.floor(Math.random()*G.length)]}x.n.nodeValue=s});
    if(k<1)requestAnimationFrame(f);else ns.forEach(function(x){x.n.nodeValue=x.o})})(t0)}
var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){io.unobserve(e.target);run(e.target)}})},{threshold:.7});
hs.forEach(function(h){io.observe(h)});
})();

/* 5) kurzorové světlo na kartách a magnetická tlačítka */
if(fine){
var sel='.uc,.bt,.sc,.card,.mc,.vc,.step,.story';
document.querySelectorAll(sel).forEach(function(c){var s=document.createElement('i');s.className='fxspot';s.setAttribute('aria-hidden','true');c.appendChild(s);
  c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();s.style.setProperty('--sx',(e.clientX-r.left)+'px');s.style.setProperty('--sy',(e.clientY-r.top)+'px')})});
document.querySelectorAll('.btn').forEach(function(b){
  b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);b.style.translate=(dx*.18)+'px '+(dy*.3)+'px'});
  b.addEventListener('pointerleave',function(){b.style.translate='0 0'})});
}

/* 6) přechod na rezervaci: jemné zatemnění, okamžitý přeskok (bez projíždění celou stránkou) a plynulé vyjetí kalendáře */
(function(){
if(!window.gsap)return;
var targetId=career?'kontakt':'rezervace',tgt=document.getElementById(targetId);if(!tgt)return;
var busy=false;
function warp(){
  if(busy)return;busy=true;
  var yy=Math.max(0,tgt.getBoundingClientRect().top+scrollY-(innerWidth<860?10:70));
  if(Math.abs(yy-scrollY)<innerHeight*3){/* krátká vzdálenost: plynulý posun bez zatemnění */
    var o={y:scrollY};gsap.to(o,{y:yy,duration:Math.max(.6,Math.min(1.1,Math.abs(yy-scrollY)/2400)),ease:'power2.inOut',onUpdate:function(){window.scrollTo(0,o.y)},onComplete:function(){try{history.pushState(null,'','#'+targetId)}catch(e){}busy=false;tgt.classList.remove('fxland');void tgt.offsetWidth;tgt.classList.add('fxland');setTimeout(function(){tgt.classList.remove('fxland')},2200)}});
    return}
  var ov=document.createElement('div');ov.className='fxveil';ov.innerHTML='<span><i></i>Otevírám kalendář</span>';document.body.appendChild(ov);
  var lab=ov.firstChild,y1=Math.max(0,tgt.getBoundingClientRect().top+scrollY-(innerWidth<860?10:70));
  var kids=[].slice.call(tgt.children);
  gsap.set(ov,{opacity:0});gsap.set(lab,{opacity:0,y:10});
  var tl=gsap.timeline({onComplete:function(){ov.remove();busy=false;kids.forEach(function(k){k.style.opacity='';k.style.transform=''})}});
  tl.to(ov,{opacity:1,duration:.32,ease:'power2.out'})
    .to(lab,{opacity:1,y:0,duration:.25},.08)
    .add(function(){window.scrollTo({top:y1,behavior:'instant'});try{history.pushState(null,'','#'+targetId)}catch(e){}
      if(window.ScrollTrigger)ScrollTrigger.update();gsap.set(kids,{opacity:0,y:36})},.5)
    .to(lab,{opacity:0,duration:.2},.62)
    .to(ov,{opacity:0,duration:.55,ease:'power2.inOut'},.7)
    .to(kids,{opacity:1,y:0,duration:.8,stagger:.1,ease:'power3.out'},.8)
    .add(function(){tgt.classList.remove('fxland');void tgt.offsetWidth;tgt.classList.add('fxland');setTimeout(function(){tgt.classList.remove('fxland')},2200)},1.0);
}
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href="#'+targetId+'"]');if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey)return;if(a.closest('nav')&&false)return;e.preventDefault();warp()},true);
})();

/* 7) návrat nahoru: úvodní efekt se přehraje znovu (po jemném zatemnění se stránka sama obnoví) */
(function(){
var hero=document.querySelector('.hero');if(!hero)return;var away=false,going=false;
addEventListener('scroll',function(){
  if(scrollY>innerHeight*1.5)away=true;
  if(away&&!going&&scrollY<24&&document.documentElement.classList.contains('fx-done')){
    away=false;going=true;
    var v=document.createElement('div');v.className='fxveil';v.style.opacity=0;document.body.appendChild(v);
    gsap.to(v,{opacity:1,duration:.3,onComplete:function(){try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}location.reload()}})}
},{passive:true});
})();

/* 8) mobil: plovoucí tlačítko schovat v úvodu (je tam vlastní) a u rezervace/kontaktu (kalendář nesmí být zakrytý) */
(function(){
if(!('IntersectionObserver' in window)||!document.querySelector('.fab'))return;
var vis={};function upd(){document.body.classList.toggle('fab-off',Object.keys(vis).some(function(k){return vis[k]}))}
['hero',career?'kontakt':'rezervace'].forEach(function(id){var el=document.getElementById(id);if(!el)return;
  new IntersectionObserver(function(en){vis[id]=en[0].intersectionRatio>(id==='hero'?.45:.15);upd()},{threshold:[0,.15,.45,.7]}).observe(el)});
})();
});
})();
