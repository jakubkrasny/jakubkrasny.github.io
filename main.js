(function(){
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,touch=matchMedia('(hover: none)').matches;
var $=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};

var useG=!!(window.gsap&&window.ScrollTrigger)&&!reduce;
/* reveal on scroll */
var groups=['.models p','.aud .eyebrow','.aud h2','.bt','.why .eyebrow','.why h2','.sc','.stats > div','.stage-text > *','.reviews .eyebrow','.reviews > h2','.feature','.refcol .card','.sub-eyebrow','.score','.bigs','.qwall','.media .eyebrow','.media h2','.mc','.news .eyebrow','.news h2','.nc','.how .eyebrow','.how .step','.free > *','.book h2','.book .sub','.cal-box','.contact'];
function mark(){groups.forEach(function(sel){$$(sel).forEach(function(el,i){if(el.hasAttribute('data-rv'))return;el.setAttribute('data-rv','');el.style.setProperty('--d',(Math.min(i%6,5)*0.08)+'s')})})}
mark();
if(!useG&&!reduce&&'IntersectionObserver' in window){
  var io=new IntersectionObserver(function(en){en.forEach(function(e){if(!e.isIntersecting)return;var el=e.target;el.classList.add('in');io.unobserve(el);setTimeout(function(){el.classList.add('done')},1400)})},{rootMargin:'0px 0px -8% 0px',threshold:.05});
  $$('[data-rv]').forEach(function(el){io.observe(el)});
}else if(!useG){$$('[data-rv]').forEach(function(el){el.classList.add('in','done')})}

var sp=$('.stage .ph.wide'),sw=$('.stage-wrap');
if(sp&&sw){sp.setAttribute('data-rv','');if(reduce||!('IntersectionObserver' in window))sp.classList.add('in');else new IntersectionObserver(function(en,o){if(en[0].isIntersecting){sp.classList.add('in');o.disconnect()}},{threshold:.25}).observe(sw)}
/* hero + pinned intro scene (GSAP, native scroll) */
if(window.gsap&&window.ScrollTrigger&&!reduce){
  gsap.registerPlugin(ScrollTrigger);
  gsap.to('.hero-photo',{yPercent:-12,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('.hero-text',{yPercent:-14,opacity:0,ease:'none',scrollTrigger:{trigger:'.hero',start:'35% top',end:'bottom 20%',scrub:true}});
  /* everything moves with the scroll (scrubbed) */
  $$('[data-rv]').forEach(function(el){if(el.matches('.ph.wide'))return;
    el.removeAttribute('data-rv');
    var h=el.matches('h2'),big=el.matches('.bigs,.feature,.qwall,.cal-box');
    gsap.fromTo(el,{y:h?60:big?90:70,x:h?-40:0,opacity:0,scale:big?.96:1},{y:0,x:0,opacity:1,scale:1,ease:'none',scrollTrigger:{trigger:el,start:'top 96%',end:'top '+(el.closest('.book,.free')?'80%':h?'66%':'60%'),scrub:.6}})});
  /* drifting background */
  $$('.bgorb').forEach(function(o,i){gsap.to(o,{y:i?-900:-1500,x:i?-120:140,ease:'none',scrollTrigger:{trigger:document.body,start:'top top',end:'bottom bottom',scrub:1.2}})});
  /* parallax inside photos + text */
  var si=$('.stage .ph img');if(si)gsap.fromTo(si,{yPercent:-9,scale:1.18},{yPercent:9,scale:1.18,ease:'none',scrollTrigger:{trigger:'.stage',start:'top bottom',end:'bottom top',scrub:true}});
  var st=$('.stage-text');if(st)gsap.fromTo(st,{y:70},{y:-50,ease:'none',scrollTrigger:{trigger:'.stage',start:'top bottom',end:'bottom top',scrub:true}});
  $$('.bt.b1,.sc:nth-child(1)').forEach(function(c){gsap.fromTo(c,{y:30},{y:-30,ease:'none',scrollTrigger:{trigger:c,start:'top bottom',end:'bottom top',scrub:true}})});
  /* marquees react to scroll speed */
  var tk=$$('.track,.qwall'),skew=gsap.quickTo?tk.map(function(t){return gsap.quickTo(t,'skewX',{duration:.5,ease:'power3.out'})}):[];
  ScrollTrigger.create({onUpdate:function(s){var v=Math.max(-7,Math.min(7,s.getVelocity()/-260));skew.forEach(function(q){q(v)})}});
  /* mascot rides along */
  gsap.to('#mascot',{y:-60,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  var mm=gsap.matchMedia();
  mm.add('(min-width:861px)',function(){
    var tl=gsap.timeline({scrollTrigger:{trigger:'#demo',start:'top top',end:'+=1700',scrub:1,pin:true,anticipatePin:1}});
    tl.from('#demo .eyebrow',{opacity:0,y:20,duration:.4}).from('#demo .w',{opacity:.06,y:60,scale:.95,stagger:.45,duration:1,ease:'power2.out'},0).from('#demo .step',{opacity:0,y:80,stagger:.45,duration:1,ease:'power2.out'},'+=0.1');
  });
  mm.add('(max-width:860px)',function(){
    gsap.from('#demo .eyebrow,#demo .w,#demo .step',{opacity:0,y:40,stagger:.12,duration:.9,ease:'power3.out',scrollTrigger:{trigger:'#demo',start:'top 80%',once:true}});
  });
}

/* counters */
function count(el,to,dur,fmt){var t0=null;function f(t){if(!t0)t0=t;var p=Math.min(1,(t-t0)/dur),v=to*(1-Math.pow(1-p,3));el.textContent=fmt(v);if(p<1)requestAnimationFrame(f)}requestAnimationFrame(f)}
if('IntersectionObserver' in window&&!reduce){
  var co=new IntersectionObserver(function(en){en.forEach(function(e){if(!e.isIntersecting)return;co.unobserve(e.target);var el=e.target;
    if(el.matches('.stats b')){var n=+el.dataset.n,s=el.dataset.s;count(el,n,2000,function(v){v=Math.round(v);return (n>=1000?v.toLocaleString('cs-CZ'):v)+s})}
    else count(el,4.7,1800,function(v){return v.toFixed(1).replace('.',',')})})},{threshold:.6});
  $$('.stats b').forEach(function(e){co.observe(e)});var num=$('.num');if(num)co.observe(num);
}

/* cursor effects (mouse only) */
if(!touch&&!reduce){
  var glow=$('#glow'),photo=$('.ph'),o1=$('.o1'),o2=$('.o2'),pupils=$$('#mascot .pupil'),mascot=$('#mascot');
  var mx=innerWidth/2,my=innerHeight*.3,gx=mx,gy=my,run=false;
  function loop(){gx+=(mx-gx)*.12;gy+=(my-gy)*.12;
    glow.style.transform='translate3d('+gx.toFixed(1)+'px,'+gy.toFixed(1)+'px,0)';
    var x=gx/innerWidth-.5,y=gy/innerHeight-.5;
    if(photo&&scrollY<innerHeight)photo.style.transform='rotateY('+(x*10).toFixed(2)+'deg) rotateX('+(-y*8).toFixed(2)+'deg)';
    if(o1)o1.style.transform='translate3d('+(x*70).toFixed(1)+'px,'+(y*50).toFixed(1)+'px,0)';
    if(o2)o2.style.transform='translate3d('+(-x*90).toFixed(1)+'px,'+(-y*60).toFixed(1)+'px,0)';
    if(mascot&&pupils.length&&scrollY<innerHeight){var r=mascot.getBoundingClientRect(),cx=r.left+r.width*.3,cy=r.top+r.height*.45,dx=gx-cx,dy=gy-cy,d=Math.hypot(dx,dy)||1,k=Math.min(3,d/60);
      pupils.forEach(function(p){p.style.transform='translate('+(dx/d*k).toFixed(2)+'px,'+(dy/d*k).toFixed(2)+'px)'})}
    if(Math.abs(mx-gx)>.4||Math.abs(my-gy)>.4)requestAnimationFrame(loop);else run=false}
  addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;if(!run){run=true;requestAnimationFrame(loop)}},{passive:true});
  $$('.bt,.sc').forEach(function(b){b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.setProperty('--mx',(e.clientX-r.left)+'px');b.style.setProperty('--my',(e.clientY-r.top)+'px')})});
}

/* click effect on cards: ripple + glow flash + stays selected */
$$('.bt,.sc').forEach(function(c){
  function fire(x,y){var grp=c.classList.contains('bt')?'.bt':'.sc';$$(grp+'.sel').forEach(function(o){if(o!==c)o.classList.remove('sel')});c.classList.toggle('sel');
    var r=c.getBoundingClientRect(),s=document.createElement('span');s.className='rip';var d=Math.max(r.width,r.height)*2.2;s.style.cssText='width:'+d+'px;height:'+d+'px;left:'+(x-r.left-d/2)+'px;top:'+(y-r.top-d/2)+'px';c.appendChild(s);setTimeout(function(){s.remove()},900);
    c.classList.remove('flash');void c.offsetWidth;c.classList.add('flash')}
  c.addEventListener('click',function(e){fire(e.clientX,e.clientY)});
  c.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();var r=c.getBoundingClientRect();fire(r.left+r.width/2,r.top+r.height/2)}})});

/* bento: cards light up one by one (pauses on hover) */
(function(){var bts=$$('.bt');if(!bts.length||reduce)return;var k=0,hov=false,vis=false;
  bts.forEach(function(b){b.addEventListener('mouseenter',function(){hov=true;bts.forEach(function(x){x.classList.remove('lit')})});b.addEventListener('mouseleave',function(){hov=false})});
  if('IntersectionObserver' in window)new IntersectionObserver(function(en){vis=en[0].isIntersecting},{threshold:.3}).observe($('#bento'));
  setInterval(function(){if(hov||!vis)return;bts.forEach(function(x){x.classList.remove('lit')});var b=bts[k%bts.length];b.style.setProperty('--mx','70%');b.style.setProperty('--my','30%');b.classList.add('lit');k++},2600)})();

/* marquee: duplicate quote row for seamless loop */
$$('.qrow').forEach(function(r){r.querySelectorAll('.qc').forEach(function(c,i,all){if(i>=all.length/2)c.setAttribute('aria-hidden','true')})});

/* live news from news.json (refreshed daily by GitHub Action) */
(function(){var box=$('#ncards');if(!box||!window.fetch)return;
fetch('news.json',{cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(j){
  if(!j||!j.items||!j.items.length)return;
  box.innerHTML=j.items.slice(0,4).map(function(n){var a=document.createElement('a');a.className='nc in done';a.setAttribute('data-rv','');a.href=n.url;a.target='_blank';a.rel='noopener';var s=document.createElement('small');s.textContent=n.date||'';var h=document.createElement('h3');h.textContent=n.title;a.appendChild(s);a.appendChild(h);return a.outerHTML}).join('');
}).catch(function(){})})();
})();
