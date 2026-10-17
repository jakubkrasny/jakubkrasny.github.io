setTimeout(function(){document.documentElement.classList.add('ready')},1800);
(function(){
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var touch=matchMedia('(hover: none)').matches;
var $=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var glow=document.getElementById('glow');

/* ---------- cursor: smoothed glow, parallax, tilt, magnetic buttons, mascot eyes ---------- */
var mx=innerWidth/2,my=innerHeight*.3,gx=mx,gy=my;
if(!touch&&!reduce){
  var photo=$('.hero .ph'),pupils=$$('#mascot .pupil'),mascot=document.getElementById('mascot');
  addEventListener('mousemove',function(e){
    mx=e.clientX;my=e.clientY;
    var x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;
    if(window.gsap){
      if(photo)gsap.to(photo,{rotationY:x*14,rotationX:-y*10,transformPerspective:1000,duration:.9,ease:'power3.out',overwrite:'auto'});
      gsap.to('.o1',{x:x*80,y:y*60,duration:1.6,ease:'power3.out',overwrite:'auto'});gsap.to('.o2',{x:-x*100,y:-y*70,duration:1.8,ease:'power3.out',overwrite:'auto'});
      gsap.to('.hero-text',{x:x*-14,y:y*-10,duration:1.1,ease:'power3.out',overwrite:'auto'});
    }
  },{passive:true});
  (function loop(){gx+=(mx-gx)*.14;gy+=(my-gy)*.14;glow.style.setProperty('--mx',gx.toFixed(1)+'px');glow.style.setProperty('--my',gy.toFixed(1)+'px');
    if(mascot&&pupils.length){var r=mascot.getBoundingClientRect(),cx=r.left+r.width*.3,cy=r.top+r.height*.45,dx=gx-cx,dy=gy-cy,d=Math.hypot(dx,dy)||1,k=Math.min(3,d/60);
      pupils.forEach(function(p){p.style.transform='translate('+(dx/d*k).toFixed(2)+'px,'+(dy/d*k).toFixed(2)+'px)'})}
    requestAnimationFrame(loop)})();
  if(window.gsap){
    $$('.tilt,.mc,.nc,.card').forEach(function(c){
      c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
        gsap.to(c,{rotationY:x*8,rotationX:-y*8,y:-5,transformPerspective:900,duration:.5,ease:'power3.out',overwrite:'auto'})});
      c.addEventListener('mouseleave',function(){gsap.to(c,{rotationY:0,rotationX:0,y:0,duration:.8,ease:'power3.out',overwrite:'auto'})});
    });
    $$('.btn').forEach(function(b){
      b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();gsap.to(b,{x:(e.clientX-r.left-r.width/2)*.22,y:(e.clientY-r.top-r.height/2)*.32,scale:1.05,duration:.4,ease:'power3.out',overwrite:'auto'})});
      b.addEventListener('mouseleave',function(){gsap.to(b,{x:0,y:0,scale:1,duration:.7,ease:'elastic.out(1,.5)',overwrite:'auto'})});
    });
  }
}

/* ---------- inertial smooth scroll (Lenis) ---------- */
var lenis=null;
if(window.Lenis&&!reduce&&!touch){
  lenis=new Lenis({lerp:.09,wheelMultiplier:.9,smoothWheel:true});
  if(window.ScrollTrigger){lenis.on('scroll',ScrollTrigger.update)}
  if(window.gsap){gsap.ticker.add(function(t){lenis.raf(t*1000)});gsap.ticker.lagSmoothing(0)}else{(function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(0)}
  document.documentElement.classList.add('lenis');
}
$$('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var id=a.getAttribute('href');if(id.length<2)return;var t=document.querySelector(id);if(!t)return;e.preventDefault();
  if(lenis)lenis.scrollTo(t,{duration:1.6,easing:function(x){return 1-Math.pow(1-x,4)}});else t.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'})})});

/* ---------- dynamic tabs: auto-rotate, hover pauses, click -> booking ---------- */
var A=[["Podnikatelé","Získejte zpět svůj čas a nechte rutinu na AI."],["E-shopy","Produktové popisky a fotky, které okamžitě prodávají."],["Marketéři","Spusťte marketingové kampaně 10× rychleji než konkurence."],["Freelanceři","Zvládněte více zakázek v prémiové kvalitě a s menším úsilím."],["Tvůrci obsahu","Nekonečná inspirace pro vaše videa, podcasty a sociální sítě."],["Města a obce","Komunikujte s občany rychleji a efektivněji. Fungujte jako profesionální úřad i s malým týmem."],["Vzdělávání","Ušetřete čas na přípravu a věnujte ho žákům."]];
var R=[["1","Jedna AI platforma","Jedna platba, jeden login. Přes 20 špičkových AI nástrojů a 60 modelů na jednom místě."],["Pár kliknutí","Jednoduchost na prvním místě","Pracovat v Everbotu se naučí každý na pár kliknutí."],["Školení","Naučíme vás AI používat","Video návody, webináře a online živé workshopy s AI odborníky."],["Desítky hodin","Ušetříte čas měsíčně","Everbot vyřeší během minut to, co by vám trvalo hodiny."],["Česky","Česká zákaznická podpora","Přístup k podpoře na e-mailu a telefonu."]];
function goBook(){var t=document.getElementById('rezervace');if(!t)return;if(lenis)lenis.scrollTo(t,{duration:1.8,easing:function(x){return 1-Math.pow(1-x,4)}});else t.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'})}
$$('.qrow').forEach(function(r){r.querySelectorAll('.qc').forEach(function(c,i,all){if(i>=all.length/2){c.setAttribute('aria-hidden','true')}})});
$$('.frow').forEach(function(r){r.innerHTML+=r.innerHTML;r.querySelectorAll('.fc').forEach(function(c,i,all){if(i>=all.length/2){c.setAttribute('aria-hidden','true');c.tabIndex=-1}});var sp=+r.dataset.speed||50;r.style.animationDuration=sp+'s'});

/* ---------- live news from news.json (refreshed daily by GitHub Action) ---------- */
(function(){var box=document.getElementById('ncards');if(!box||!window.fetch)return;
fetch('news.json',{cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(j){
  if(!j||!j.items||!j.items.length)return;
  box.innerHTML=j.items.slice(0,4).map(function(n){var a=document.createElement('a');a.className='nc';a.href=n.url;a.target='_blank';a.rel='noopener';var s=document.createElement('small');s.textContent=n.date||'';var h=document.createElement('h3');h.textContent=n.title;a.appendChild(s);a.appendChild(h);return a.outerHTML}).join('');
}).catch(function(){})})();

/* ---------- scroll animations (GSAP) ---------- */
if(!window.gsap||!window.ScrollTrigger||reduce){document.documentElement.classList.add('ready');return}
gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ease:'power3.out'});
function reveal(targets,trigger,opts){opts=opts||{};
  gsap.set(targets,{y:opts.y||48,opacity:0});
  ScrollTrigger.batch(targets,{start:opts.start||'top 88%',once:true,onEnter:function(b){gsap.to(b,{y:0,opacity:1,duration:1.1,stagger:opts.stagger||.1,ease:'power3.out',overwrite:true,clearProps:'opacity'})}})}
// hero entrance (after fonts) + scroll-out
document.documentElement.classList.add('ready');
var hi=gsap.timeline({delay:.15});
hi.from('[data-r]',{y:60,opacity:0,duration:1.3,stagger:.14,ease:'power4.out'})
  .from('.hero .ph',{scale:.92,opacity:0,duration:1.6,ease:'power3.out'},0.1)
  .from('#mascot',{scale:0,opacity:0,duration:1,ease:'back.out(1.8)'},.9)
  .from('.nav',{y:-30,opacity:0,duration:1},.2);
gsap.to('.hero-photo',{yPercent:-14,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.8}});
gsap.to('.hero-text',{yPercent:-18,opacity:.0,ease:'none',scrollTrigger:{trigger:'.hero',start:'30% top',end:'bottom 15%',scrub:.8}});
var mm=gsap.matchMedia();
mm.add('(min-width:861px)',function(){
  var tl=gsap.timeline({scrollTrigger:{trigger:'#demo',start:'top top',end:'+=1900',scrub:1,pin:true,anticipatePin:1}});
  tl.from('#demo .w',{opacity:.06,y:70,scale:.94,stagger:.45,duration:1,ease:'power2.out'}).from('#demo .step',{opacity:0,y:90,stagger:.5,duration:1,ease:'power2.out'},'+=0.15');
});
mm.add('(max-width:860px)',function(){
  reveal('#demo .w','#demo',{stagger:.15});reveal('#demo .step','#demo',{stagger:.12});
});
reveal('.models p,.models .track','.models');
reveal('.aud h2,.aud .ct,.aud .panel','.aud',{stagger:.08});
reveal('.why h2,.why .rs,.why .reason-view','.why',{stagger:.08});
reveal('.stage-text > *','.stage',{stagger:.14});
gsap.fromTo('.stage .ph',{clipPath:'inset(0 100% 0 0 round 28px)'},{clipPath:'inset(0 0% 0 0 round 28px)',duration:1.6,ease:'power3.inOut',scrollTrigger:{trigger:'.stage',start:'top 72%',once:true}});
reveal('.reviews h2,.feature,.refcol .card','.reviews',{stagger:.12});
reveal('.reviews .qwall,.reviews .score,.reviews .bigs,.reviews .sub-eyebrow','.reviews',{stagger:.1});
reveal('.media h2,.mc','.media',{stagger:.09});
reveal('.news h2,.nc','.news',{stagger:.09});
reveal('.how .eyebrow,.how .step','.how',{stagger:.12});
reveal('.free > *','.free',{stagger:.1});
reveal('.book h2,.book .sub,.cal-box,.contact','.book',{stagger:.12});
// counters
$$('.stats b').forEach(function(el){var o={v:0},t=+el.dataset.n,suf=el.dataset.s;
  ScrollTrigger.create({trigger:'.stats',start:'top 88%',once:true,onEnter:function(){gsap.to(o,{v:t,duration:2.2,ease:'power2.out',onUpdate:function(){var v=Math.round(o.v);el.textContent=(t>=1000?v.toLocaleString('cs-CZ'):v)+suf}})}})});
var n={v:0};
ScrollTrigger.create({trigger:'.score',start:'top 88%',once:true,onEnter:function(){gsap.to(n,{v:4.7,duration:2,ease:'power2.out',onUpdate:function(){$('.num').textContent=n.v.toFixed(1).replace('.',',')}})}});
// background tint breathing with scroll
gsap.to('.glow',{opacity:.8,ease:'none',scrollTrigger:{trigger:document.body,start:'top top',end:'bottom bottom',scrub:true}});

/* ---------- glowing connector line ---------- */
function drawLine(){
  var svg=document.getElementById('line'),p=document.getElementById('linePath');if(!svg||!p)return;
  var H=document.body.scrollHeight;svg.setAttribute('viewBox','0 0 '+innerWidth+' '+H);svg.style.height=H+'px';
  var secs=$$('main section'),W=innerWidth,d='M '+W*.5+' 90',side=1;
  secs.forEach(function(s){var y=s.offsetTop+s.offsetHeight,x=W*(.5+side*.42);d+=' C '+W*.5+' '+(y-s.offsetHeight*.4)+' '+x+' '+(y-s.offsetHeight*.5)+' '+x+' '+y;side*=-1});
  p.setAttribute('d',d);var L=p.getTotalLength();p.style.strokeDasharray=L;p.style.strokeDashoffset=L;
  if(drawLine.t)drawLine.t.kill();
  drawLine.t=gsap.to(p,{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:document.body,start:'top top',end:'bottom bottom',scrub:.8}});
}
addEventListener('load',function(){drawLine();ScrollTrigger.refresh()});
var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(drawLine,300)});

/* ---------- v3 extras ---------- */
(function(){
  var pb=document.createElement('div');pb.className='progress';document.body.appendChild(pb);
  ScrollTrigger.create({start:0,end:'max',onUpdate:function(s){pb.style.transform='scaleX('+s.progress+')'}});
  // word-by-word headline reveal
  $$('h2').forEach(function(h){if(h.closest('.hero')||h.classList.contains('big'))return;
    var walk=function(n){[].slice.call(n.childNodes).forEach(function(c){
      if(c.nodeType===3){var f=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(function(w){if(!w)return;if(/^\s+$/.test(w)){f.appendChild(document.createTextNode(' '));return}var s=document.createElement('span');s.className='wd';var i=document.createElement('i');i.textContent=w;s.appendChild(i);f.appendChild(s)});c.parentNode.replaceChild(f,c)}
      else if(c.nodeType===1)walk(c)})};
    walk(h);
    gsap.set(h.querySelectorAll('.wd>i'),{yPercent:115,rotate:4});
    ScrollTrigger.create({trigger:h,start:'top 88%',once:true,onEnter:function(){gsap.to(h.querySelectorAll('.wd>i'),{yPercent:0,rotate:0,duration:1.1,stagger:.06,ease:'power4.out'})}})});
  // spotlight on bento cards + auto-lit cycling
  var bts=$$('.bt');
  bts.forEach(function(b){b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.setProperty('--mx',(e.clientX-r.left)+'px');b.style.setProperty('--my',(e.clientY-r.top)+'px')})});
  if(bts.length&&!reduce){var k=0,hov=false,vis=false;
    bts.forEach(function(b){b.addEventListener('mouseenter',function(){hov=true;bts.forEach(function(x){x.classList.remove('lit')})});b.addEventListener('mouseleave',function(){hov=false})});
    new IntersectionObserver(function(en){vis=en[0].isIntersecting},{threshold:.3}).observe($('#bento'));
    setInterval(function(){if(hov||!vis)return;bts.forEach(function(x){x.classList.remove('lit')});var b=bts[k%bts.length];b.style.setProperty('--mx','70%');b.style.setProperty('--my','30%');b.classList.add('lit');k++},2400)}
  // sticky stack: previous cards recede
  var sc=$$('.sc');
  if(matchMedia('(min-width:601px)').matches)sc.forEach(function(c,i){if(i===sc.length-1)return;
    gsap.to(c,{scale:.94,'--dim':.7,ease:'none',scrollTrigger:{trigger:sc[i+1],start:'top 78%',end:'top 22%',scrub:true}})});
  // custom cursor ring
  if(!touch&&!reduce){var cur=document.createElement('div');cur.className='cur';cur.style.opacity=0;document.body.appendChild(cur);var cx=-100,cy=-100,tx=-100,ty=-100,run=false;
    function cl(){cx+=(tx-cx)*.2;cy+=(ty-cy)*.2;cur.style.transform='translate3d('+cx+'px,'+cy+'px,0)';if(Math.abs(tx-cx)>.3||Math.abs(ty-cy)>.3)requestAnimationFrame(cl);else run=false}
    addEventListener('mousemove',function(e){tx=e.clientX;ty=e.clientY;cur.style.opacity=1;if(!run){run=true;requestAnimationFrame(cl)}},{passive:true});
    document.addEventListener('mouseover',function(e){cur.classList.toggle('big',!!e.target.closest('a,button,.bt,.sc'))});}
  // headline shimmer on green text
  $$('.big .g,.hero h1 .g').forEach(function(e){e.classList.add('g-shine')});
})();
})();
