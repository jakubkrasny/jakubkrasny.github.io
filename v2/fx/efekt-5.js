/* Efekt 5 (neuronová síť): přes celou úvodní obrazovku se rozsvítí neuronová síť, signál ji projde zleva doprava a rozsvítí jméno; fotku "vidí" počítačové vidění (skenování, rámečky detekce). Síť zůstane jemně žít na pozadí a reaguje na kurzor. */
(function(){
var D=document.documentElement;if(!D.classList.contains('fx'))return;
var hero=document.querySelector('.hero'),h1=hero&&hero.querySelector('h1'),photo=hero&&hero.querySelector('.hero-photo'),htext=hero&&hero.querySelector('.hero-text'),ph=photo&&photo.querySelector('.ph');
function fail(){D.classList.add('fx-done');if(hero)hero.classList.add('nm-on')}
if(!hero||!h1||!photo||!ph||!window.gsap||!window.FXL||scrollY>240){fail();return}
D.classList.add('fx-ok','fx5');
/* úprava pro jinou fotku: rámeček člověka a obličeje v % fotky [x,y,šířka,výška] */
var BODY=[14,7,76,93],FACE=[36,17,30,30];
function go(){
try{
  var chars=FXL.split(h1);gsap.set(chars,{opacity:0});
  hero.classList.add('nm-on');
  var W=0,H=0,dpr=Math.min(2,devicePixelRatio||1),cv=document.createElement('canvas');cv.className='fxnet';hero.insertBefore(cv,hero.firstChild);
  var cx=cv.getContext('2d'),nodes=[],edges=[],front=-1,ambient=0,mx=-999,my=-999,run=true,visible=true;
  var items=[].slice.call(htext.children).filter(function(e){return e!==h1}).concat([].slice.call(hero.querySelectorAll('.scroll-cue')));
  function build(){var r=hero.getBoundingClientRect();W=Math.round(r.width);H=Math.round(r.height);cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';cx.setTransform(dpr,0,0,dpr,0,0);
    var L=W<700?5:8,cnt=W<700?[3,5,6,5,3]:[4,7,9,10,10,9,7,4];nodes=[];edges=[];var lay=[];
    for(var l=0;l<L;l++){var a=[],n=cnt[l];for(var i=0;i<n;i++){var nd={x:W*(.03+.94*l/(L-1))+(Math.random()-.5)*W*.03,y:H*((i+.5)/n)+(Math.random()-.5)*H*.05,l:l,lit:0,born:l*.12+Math.random()*.25};a.push(nd);nodes.push(nd)}lay.push(a)}
    for(l=0;l<L-1;l++)lay[l].forEach(function(a){var c=lay[l+1].slice().sort(function(p,q){return Math.abs(p.y-a.y)-Math.abs(q.y-a.y)}).slice(0,2+(Math.random()<.5?1:0));c.forEach(function(b){edges.push({a:a,b:b,born:.5+l*.12+Math.random()*.3,pk:Math.random()<.45?Math.random():-1,ps:.25+Math.random()*.4})})})}
  build();
  var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(build,250)});
  hero.addEventListener('pointermove',function(e){var r=hero.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top});hero.addEventListener('pointerleave',function(){mx=my=-999});
  if('IntersectionObserver' in window)new IntersectionObserver(function(en){visible=en[0].isIntersecting}).observe(hero);
  var t0=performance.now(),netA={a:0};
  function frame(now){if(!run)return;requestAnimationFrame(frame);if(!visible)return;var t=(now-t0)/1000;
    cx.clearRect(0,0,W,H);var amb=ambient,A=netA.a;
    edges.forEach(function(e){var k=Math.min(1,Math.max(0,(t-e.born)/.45));if(k<=0)return;
      var mid=(e.a.x+e.b.x)/2,d=Math.abs(mid-front),g=front<0?0:Math.max(0,1-d/(W*.16)),al=(.1+g*.55)*A*k+(amb?.05:0);
      cx.strokeStyle='rgba(46,243,121,'+Math.min(.85,al)+')';cx.lineWidth=g>.2?1.6:1;cx.beginPath();cx.moveTo(e.a.x,e.a.y);cx.lineTo(e.a.x+(e.b.x-e.a.x)*k,e.a.y+(e.b.y-e.a.y)*k);cx.stroke();
      if(e.pk>=0&&k>=1&&t>1.2){var p=(t*e.ps+e.pk)%1.6;if(p<1){var px=e.a.x+(e.b.x-e.a.x)*p,py=e.a.y+(e.b.y-e.a.y)*p;cx.fillStyle='rgba(220,255,235,'+(.85*A)+')';cx.shadowColor='#2ef379';cx.shadowBlur=10;cx.beginPath();cx.arc(px,py,2,0,6.3);cx.fill();cx.shadowBlur=0}}});
    nodes.forEach(function(n){var k=Math.min(1,Math.max(0,(t-n.born)/.4));if(k<=0)return;var d=Math.abs(n.x-front),g=front<0?0:Math.max(0,1-d/(W*.1));
      var m=Math.hypot(n.x-mx,n.y-my),mg=m<150?(1-m/150):0,s=g+mg;
      if(mg>0){cx.strokeStyle='rgba(46,243,121,'+(mg*.5*A)+')';cx.lineWidth=1;cx.beginPath();cx.moveTo(n.x,n.y);cx.lineTo(mx,my);cx.stroke()}
      cx.fillStyle=s>.2?'rgba(230,255,240,'+Math.min(1,(.6+s)*A)+')':'rgba(46,243,121,'+(.55*A*k)+')';cx.shadowColor='#2ef379';cx.shadowBlur=s>.2?18*s:6;
      cx.beginPath();cx.arc(n.x,n.y,(2.6+s*3.2)*k,0,6.3);cx.fill();cx.shadowBlur=0})}
  requestAnimationFrame(frame);
  gsap.to(netA,{a:1,duration:.6});
  /* dopředný průchod: čelo signálu probíhá zleva doprava, písmena se rozsvěcí podle polohy */
  var fr={x:-W*.05};
  var hr=hero.getBoundingClientRect();
  chars.forEach(function(c){c._x=c.getBoundingClientRect().left-hr.left+c.offsetWidth/2});
  var tl=gsap.timeline({delay:1.0});
  tl.to(fr,{x:W*1.05,duration:1.9,ease:'power1.inOut',onUpdate:function(){front=fr.x}},0);
  chars.forEach(function(c){var at=Math.max(0,(c._x/W))*1.65+.1;
    tl.fromTo(c,{opacity:0,scale:1.6,filter:'brightness(4) drop-shadow(0 0 22px #2ef379)'},{opacity:1,scale:1,filter:'brightness(1) drop-shadow(0 0 0px #2ef379)',duration:.55,ease:'power3.out'},at)});
  tl.to(netA,{a:.5,duration:1.2},2.4).add(function(){front=-1;ambient=1},2.9);
  /* fotka: počítačové vidění */
  var pr=ph.getBoundingClientRect();
  gsap.set(photo,{opacity:1});
  gsap.set(ph,{filter:'grayscale(1) brightness(.45) contrast(1.4)',opacity:0});
  var scan=document.createElement('div');scan.className='fxvscan';ph.appendChild(scan);
  var grid=document.createElement('div');grid.className='fxgrid';ph.appendChild(grid);
  function mkBox(b,label,cls){var d=document.createElement('div');d.className='fxbox '+cls;d.style.cssText='left:'+b[0]+'%;top:'+b[1]+'%;width:'+b[2]+'%;height:'+b[3]+'%';d.innerHTML='<span>'+label+'</span>';ph.appendChild(d);return d}
  var b1=mkBox(BODY,'ČLOVĚK · <b>99,8 %</b>','b1'),b2=mkBox(FACE,'AI KONZULTANT · <b>EVERBOT</b>','b2');
  var dots=[];[[.25,.35],[.75,.35],[.5,.55],[.3,.8],[.7,.8],[.5,.1]].forEach(function(p){var d=document.createElement('i');d.className='fxdot';d.style.left=p[0]*100+'%';d.style.top=p[1]*100+'%';b2.appendChild(d);dots.push(d)});
  gsap.set([b1,b2],{opacity:0,scale:1.18});gsap.set(dots,{scale:0});gsap.set(scan,{top:'-4%',opacity:1});
  var pt=gsap.timeline({delay:.9});
  pt.to(ph,{opacity:1,duration:.5},0)
    .to(scan,{top:'100%',duration:1.7,ease:'none'},.5)
    .to(ph,{filter:'grayscale(0) brightness(1) contrast(1)',duration:1.7,ease:'power1.inOut'},.5)
    .to(b1,{opacity:1,scale:1,duration:.45,ease:'power3.out'},1.5)
    .to(b2,{opacity:1,scale:1,duration:.4,ease:'power3.out'},2.3)
    .to(dots,{scale:1,duration:.3,stagger:.07,ease:'back.out(3)'},2.5)
    .to([b1,b2,scan,grid],{opacity:0,duration:.6},4.1)
    .add(function(){[b1,b2,scan,grid].forEach(function(e){e.remove()});ph.style.filter=''},4.8);
  gsap.fromTo(items,{opacity:0,y:30},{opacity:1,y:0,duration:.8,stagger:.12,ease:'power3.out',delay:3.0,onComplete:function(){D.classList.add('fx-done');chars.forEach(function(c){c.style.filter='';c.style.opacity='';c.style.transform=''})}});
}catch(e){fail()}
}
(document.fonts&&document.fonts.ready?Promise.race([document.fonts.ready,new Promise(function(r){setTimeout(r,1400)})]):Promise.resolve()).then(function(){requestAnimationFrame(go)});
})();
