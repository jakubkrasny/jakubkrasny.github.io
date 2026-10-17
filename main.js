(function(){
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var touch=matchMedia('(hover: none)').matches;
var glow=document.getElementById('glow');
if(!touch&&!reduce){
  var photo=document.querySelector('.hero .ph');
  addEventListener('mousemove',function(e){
    glow.style.setProperty('--mx',e.clientX+'px');glow.style.setProperty('--my',e.clientY+'px');
    var x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;
    if(window.gsap){
      gsap.to(photo,{rotationY:x*14,rotationX:-y*10,duration:.6,ease:'power2.out'});
      gsap.to('.o1',{x:x*80,y:y*60,duration:1.2});
      gsap.to('.o2',{x:-x*100,y:-y*70,duration:1.4});
    }
  });
}
// tilt cards toward cursor
if(!touch&&!reduce){document.querySelectorAll('.tilt').forEach(function(c){c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform='perspective(800px) rotateY('+x*12+'deg) rotateX('+(-y*12)+'deg) translateY(-6px)'});c.addEventListener('mouseleave',function(){c.style.transform=''});c.style.transition='transform .25s ease-out, box-shadow .3s'})}
// mascot eyes follow cursor
(function(){var pupils=document.querySelectorAll('#mascot .pupil');if(!pupils.length||touch||reduce)return;
addEventListener('mousemove',function(e){var r=document.getElementById('mascot').getBoundingClientRect();var cx=r.left+r.width*.3,cy=r.top+r.height*.45;var dx=e.clientX-cx,dy=e.clientY-cy,d=Math.hypot(dx,dy)||1,k=Math.min(3,d/60);pupils.forEach(function(p){p.style.transform='translate('+(dx/d*k)+'px,'+(dy/d*k)+'px)'})});})();
if(!window.gsap||!window.ScrollTrigger||reduce)return;
gsap.registerPlugin(ScrollTrigger);
gsap.from('[data-r]',{y:50,opacity:0,duration:1,stagger:.15,ease:'power3.out',delay:.2});
gsap.from('.hero .ph',{scale:.9,opacity:0,duration:1.4,ease:'power3.out'});
gsap.to('.hero-photo',{yPercent:-12,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
// pinned scene: words appear one by one, then steps
var mm=gsap.matchMedia();
mm.add('(min-width:861px)',function(){
  var tl=gsap.timeline({scrollTrigger:{trigger:'#demo',start:'top top',end:'+=1800',scrub:.6,pin:true}});
  tl.from('#demo .w',{opacity:.08,y:60,scale:.92,stagger:.4,duration:1})
    .from('#demo .step',{opacity:0,y:80,stagger:.5,duration:1},'+=0.2');
});
mm.add('(max-width:860px)',function(){
  gsap.from('#demo .w',{opacity:0,y:30,stagger:.2,scrollTrigger:{trigger:'#demo',start:'top 75%'}});
  gsap.from('#demo .step',{opacity:0,y:40,stagger:.15,scrollTrigger:{trigger:'#demo .steps',start:'top 85%'}});
});
gsap.from('.stage .ph',{clipPath:'inset(0 100% 0 0 round 28px)',duration:1.4,ease:'power3.inOut',scrollTrigger:{trigger:'.stage',start:'top 70%'}});
gsap.from('.stage-text > *',{y:40,opacity:0,stagger:.15,scrollTrigger:{trigger:'.stage-text',start:'top 80%'}});
gsap.from('.reviews .card',{y:70,opacity:0,stagger:.12,duration:.9,scrollTrigger:{trigger:'.cards',start:'top 85%'}});
var n={v:0};
gsap.to(n,{v:4.7,duration:1.6,scrollTrigger:{trigger:'.score',start:'top 85%'},onUpdate:function(){document.querySelector('.num').textContent=n.v.toFixed(1).replace('.',',')}});
document.querySelectorAll('.stats b').forEach(function(el){var o={v:0},t=+el.dataset.n,suf=el.dataset.s;gsap.to(o,{v:t,duration:1.8,ease:'power2.out',scrollTrigger:{trigger:'.stats',start:'top 85%'},onUpdate:function(){var v=Math.round(o.v);el.textContent=(t>=1000?v.toLocaleString('cs-CZ'):v)+suf.replace(/^\+ hodin/,'+ hodin')}})});
gsap.from('.app .ac, .app h2, .tools span',{y:60,opacity:0,stagger:.08,scrollTrigger:{trigger:'.app',start:'top 75%'}});
gsap.from('.why .card, .why h2',{y:50,opacity:0,stagger:.12,scrollTrigger:{trigger:'.why',start:'top 75%'}});
gsap.from('.quote',{y:60,opacity:0,scrollTrigger:{trigger:'.quote',start:'top 85%'}});
gsap.from('.how .step',{y:60,opacity:0,stagger:.2,scrollTrigger:{trigger:'.how',start:'top 75%'}});
gsap.from('.free > *',{y:40,opacity:0,stagger:.12,scrollTrigger:{trigger:'.free',start:'top 80%'}});
gsap.from('.book h2, .book .sub, .cal-box',{y:50,opacity:0,stagger:.15,scrollTrigger:{trigger:'.book',start:'top 75%'}});
// glowing connector line drawn on scroll
function drawLine(){
  var svg=document.getElementById('line'),p=document.getElementById('linePath');
  var H=document.body.scrollHeight;svg.setAttribute('viewBox','0 0 '+innerWidth+' '+H);svg.style.height=H+'px';
  var secs=[].slice.call(document.querySelectorAll('main section')),W=innerWidth,d='M '+W*.5+' 90',side=1;
  secs.forEach(function(s,i){var y=s.offsetTop+s.offsetHeight;var x=W*(.5+side*.42);d+=' C '+W*.5+' '+(y-s.offsetHeight*.4)+' '+x+' '+(y-s.offsetHeight*.5)+' '+x+' '+y;side*=-1;});
  p.setAttribute('d',d);var L=p.getTotalLength();p.style.strokeDasharray=L;p.style.strokeDashoffset=L;
  if(drawLine.t)drawLine.t.kill();
  drawLine.t=gsap.to(p,{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:document.body,start:'top top',end:'bottom bottom',scrub:.8}});
}
addEventListener('load',drawLine);
var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(drawLine,300)});
})();
