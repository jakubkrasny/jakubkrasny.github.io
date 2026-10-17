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
  var ticking=false;
  function loop(){gx+=(mx-gx)*.12;gy+=(my-gy)*.12;
    glow.style.transform='translate3d('+gx.toFixed(1)+'px,'+gy.toFixed(1)+'px,0)';
    if(mascot&&pupils.length){var r=mascot.getBoundingClientRect(),cx=r.left+r.width*.3,cy=r.top+r.height*.45,dx=gx-cx,dy=gy-cy,d=Math.hypot(dx,dy)||1,k=Math.min(3,d/60);
      pupils.forEach(function(p){p.style.transform='translate('+(dx/d*k).toFixed(2)+'px,'+(dy/d*k).toFixed(2)+'px)'})}
    if(Math.abs(mx-gx)>.4||Math.abs(my-gy)>.4)requestAnimationFrame(loop);else ticking=false}
  addEventListener('mousemove',function(){if(!ticking){ticking=true;requestAnimationFrame(loop)}},{passive:true});
  if(window.gsap){
    $$('.btn').forEach(function(b){
      b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();gsap.to(b,{x:(e.clientX-r.left-r.width/2)*.22,y:(e.clientY-r.top-r.height/2)*.32,scale:1.05,duration:.4,ease:'power3.out',overwrite:'auto'})});
      b.addEventListener('mouseleave',function(){gsap.to(b,{x:0,y:0,scale:1,duration:.7,ease:'elastic.out(1,.5)',overwrite:'auto'})});
    });
  }
}

var lenis=null;
$$('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var id=a.getAttribute('href');if(id.length<2)return;var t=document.querySelector(id);if(!t)return;e.preventDefault();
  if(lenis)lenis.scrollTo(t,{duration:1.6,easing:function(x){return 1-Math.pow(1-x,4)}});else t.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'})})});

/* ---------- dynamic tabs: auto-rotate, hover pauses, click -> booking ---------- */
var A=[["Podnikatelé","Získejte zpět svůj čas a nechte rutinu na AI."],["E-shopy","Produktové popisky a fotky, které okamžitě prodávají."],["Marketéři","Spusťte marketingové kampaně 10× rychleji než konkurence."],["Freelanceři","Zvládněte více zakázek v prémiové kvalitě a s menším úsilím."],["Tvůrci obsahu","Nekonečná inspirace pro vaše videa, podcasty a sociální sítě."],["Města a obce","Komunikujte s občany rychleji a efektivněji. Fungujte jako profesionální úřad i s malým týmem."],["Vzdělávání","Ušetřete čas na přípravu a věnujte ho žákům."]];
var R=[["1","Jedna AI platforma","Jedna platba, jeden login. Přes 20 špičkových AI nástrojů a 60 modelů na jednom místě."],["Pár kliknutí","Jednoduchost na prvním místě","Pracovat v Everbotu se naučí každý na pár kliknutí."],["Školení","Naučíme vás AI používat","Video návody, webináře a online živé workshopy s AI odborníky."],["Desítky hodin","Ušetříte čas měsíčně","Everbot vyřeší během minut to, co by vám trvalo hodiny."],["Česky","Česká zákaznická podpora","Přístup k podpoře na e-mailu a telefonu."]];
function goBook(){var t=document.getElementById('rezervace');if(!t)return;if(lenis)lenis.scrollTo(t,{duration:1.8,easing:function(x){return 1-Math.pow(1-x,4)}});else t.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'})}
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
gsap.to('.hero-photo',{yPercent:-14,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
gsap.to('.hero-text',{yPercent:-18,opacity:.0,ease:'none',scrollTrigger:{trigger:'.hero',start:'30% top',end:'bottom 15%',scrub:true}});
reveal('#demo .w','#demo',{stagger:.18});reveal('#demo .step','#demo',{stagger:.14});
reveal('.models p,.models .track','.models');
reveal('.aud h2,.aud .flow','.aud',{stagger:.1});
reveal('.why h2,.why .flow,.why .stats > div','.why',{stagger:.08});
reveal('.stage-text > *','.stage',{stagger:.14});
gsap.fromTo('.stage .ph',{clipPath:'inset(0 100% 0 0 round 28px)'},{clipPath:'inset(0 0% 0 0 round 28px)',duration:1.6,ease:'power3.inOut',scrollTrigger:{trigger:'.stage',start:'top 72%',once:true}});
reveal('.reviews h2,.feature,.reviews .cards.refs .card','.reviews',{stagger:.12});
reveal('.reviews .cards:not(.refs) .card,.reviews .score,.reviews .bigs,.reviews .sub-eyebrow','.reviews',{stagger:.1});
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
})();
