(function(){
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var touch=matchMedia('(hover: none)').matches;
var $=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var glow=document.getElementById('glow');

/* ---------- cursor: glow, parallax, tilt, magnetic buttons, mascot eyes ---------- */
if(!touch&&!reduce){
  var photo=$('.hero .ph'),pupils=$$('#mascot .pupil'),mascot=document.getElementById('mascot');
  addEventListener('mousemove',function(e){
    glow.style.setProperty('--mx',e.clientX+'px');glow.style.setProperty('--my',e.clientY+'px');
    var x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;
    if(window.gsap){
      if(photo)gsap.to(photo,{rotationY:x*14,rotationX:-y*10,duration:.6,ease:'power2.out'});
      gsap.to('.o1',{x:x*80,y:y*60,duration:1.2});gsap.to('.o2',{x:-x*100,y:-y*70,duration:1.4});
      gsap.to('.hero-text',{x:x*-14,y:y*-10,duration:.9,ease:'power2.out'});
    }
    if(mascot){var r=mascot.getBoundingClientRect(),cx=r.left+r.width*.3,cy=r.top+r.height*.45,dx=e.clientX-cx,dy=e.clientY-cy,d=Math.hypot(dx,dy)||1,k=Math.min(3,d/60);
      pupils.forEach(function(p){p.style.transform='translate('+(dx/d*k)+'px,'+(dy/d*k)+'px)'})}
  });
  $$('.tilt,.mc,.nc,.card').forEach(function(c){
    c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      c.style.transform='perspective(900px) rotateY('+x*8+'deg) rotateX('+(-y*8)+'deg) translateY(-4px)'});
    c.addEventListener('mouseleave',function(){c.style.transform=''});
  });
  $$('.btn').forEach(function(b){
    b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.2)+'px,'+((e.clientY-r.top-r.height/2)*.3)+'px) scale(1.04)'});
    b.addEventListener('mouseleave',function(){b.style.transform=''});
  });
}

/* ---------- dynamic tabs: auto-rotate, hover pauses, click -> booking ---------- */
var A=[["Podnikatelé","Získejte zpět svůj čas a nechte rutinu na AI."],["E-shopy","Produktové popisky a fotky, které okamžitě prodávají."],["Marketéři","Spusťte marketingové kampaně 10× rychleji než konkurence."],["Freelanceři","Zvládněte více zakázek v prémiové kvalitě a s menším úsilím."],["Tvůrci obsahu","Nekonečná inspirace pro vaše videa, podcasty a sociální sítě."],["Města a obce","Komunikujte s občany rychleji a efektivněji. Fungujte jako profesionální úřad i s malým týmem."],["Vzdělávání","Ušetřete čas na přípravu a věnujte ho žákům."]];
var R=[["1","Jedna AI platforma","Jedna platba, jeden login. Přes 20 špičkových AI nástrojů a 60 modelů na jednom místě."],["Pár kliknutí","Jednoduchost na prvním místě","Pracovat v Everbotu se naučí každý na pár kliknutí."],["Školení","Naučíme vás AI používat","Video návody, webináře a online živé workshopy s AI odborníky."],["Desítky hodin","Ušetříte čas měsíčně","Everbot vyřeší během minut to, co by vám trvalo hodiny."],["Česky","Česká zákaznická podpora","Přístup k podpoře na e-mailu a telefonu."]];
function goBook(){var t=document.getElementById('rezervace');if(t)t.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'})}
function rotator(btnSel,panel,render,data,ms){
  var bs=$$(btnSel);if(!bs.length||!panel)return;var pc=panel.querySelector('.pc'),cur=-1,paused=false,visible=false,busy=false;
  function set(k,instant){if(k===cur||busy)return;busy=true;cur=k;
    bs.forEach(function(b,i){b.classList.remove('on');b.classList.remove('hold');b.style.setProperty('--dur',(ms/1000)+'s');if(i===k){void b.offsetWidth;if(!reduce)b.classList.add('on');else b.classList.add('on')}});
    if(instant||reduce){render(data[k]);busy=false;return}
    pc.classList.add('out');setTimeout(function(){render(data[k]);pc.classList.remove('out');busy=false},320)}
  function next(){if(visible&&!paused)set((cur+1)%data.length)}
  bs.forEach(function(b,i){
    b.addEventListener('mouseenter',function(){paused=true;set(i);b.classList.add('hold')});
    b.addEventListener('mouseleave',function(){paused=false;b.classList.remove('hold')});
    b.addEventListener('focus',function(){set(i)});
    b.addEventListener('click',goBook);
    b.addEventListener('animationend',function(){if(b.classList.contains('on'))next()});
  });
  panel.addEventListener('mouseenter',function(){paused=true;bs[cur]&&bs[cur].classList.add('hold')});
  panel.addEventListener('mouseleave',function(){paused=false;bs[cur]&&bs[cur].classList.remove('hold')});
  panel.addEventListener('mousemove',function(e){var r=panel.getBoundingClientRect();panel.style.setProperty('--px',((e.clientX-r.left)/r.width*100)+'%');panel.style.setProperty('--py',((e.clientY-r.top)/r.height*100)+'%')});
  panel.addEventListener('click',function(e){if(e.target.closest('a'))return;goBook()});
  set(0,true);bs[0].classList.remove('on');
  new IntersectionObserver(function(en){visible=en[0].isIntersecting;if(visible&&!reduce){bs[cur].classList.remove('on');void bs[cur].offsetWidth;bs[cur].classList.add('on')}},{threshold:.3}).observe(panel);
}
rotator('.ct',document.getElementById('audPanel'),function(d){var p=d[1].split('. ');document.getElementById('audK').textContent=d[0];document.getElementById('audH').textContent=p[0].replace(/\.$/,'')+'.';document.getElementById('audP').textContent=p.slice(1).join('. ')||'Na konzultaci vám ukážu, jak přesně.'},A,4200);
rotator('.rs',document.getElementById('rview'),function(d){document.getElementById('rn').textContent=d[0];document.getElementById('rh').textContent=d[1];document.getElementById('rp2').textContent=d[2]},R,4500);

/* ---------- live news from news.json (refreshed daily by GitHub Action) ---------- */
(function(){var box=document.getElementById('ncards');if(!box||!window.fetch)return;
fetch('news.json',{cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(j){
  if(!j||!j.items||!j.items.length)return;
  box.innerHTML=j.items.slice(0,4).map(function(n){var a=document.createElement('a');a.className='nc';a.href=n.url;a.target='_blank';a.rel='noopener';var s=document.createElement('small');s.textContent=n.date||'';var h=document.createElement('h3');h.textContent=n.title;a.appendChild(s);a.appendChild(h);return a.outerHTML}).join('');
}).catch(function(){})})();

/* ---------- scroll animations (GSAP) ---------- */
if(!window.gsap||!window.ScrollTrigger||reduce)return;
gsap.registerPlugin(ScrollTrigger);
gsap.from('[data-r]',{y:50,opacity:0,duration:1,stagger:.15,ease:'power3.out',delay:.2});
gsap.from('.hero .ph',{scale:.9,opacity:0,duration:1.4,ease:'power3.out'});
gsap.to('.hero-photo',{yPercent:-12,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
var mm=gsap.matchMedia();
mm.add('(min-width:861px)',function(){
  var tl=gsap.timeline({scrollTrigger:{trigger:'#demo',start:'top top',end:'+=1800',scrub:.6,pin:true}});
  tl.from('#demo .w',{opacity:.08,y:60,scale:.92,stagger:.4,duration:1}).from('#demo .step',{opacity:0,y:80,stagger:.5,duration:1},'+=0.2');
});
mm.add('(max-width:860px)',function(){
  gsap.from('#demo .w',{opacity:0,y:30,stagger:.2,scrollTrigger:{trigger:'#demo',start:'top 75%'}});
  gsap.from('#demo .step',{opacity:0,y:40,stagger:.15,scrollTrigger:{trigger:'#demo .steps',start:'top 85%'}});
});
gsap.from('.aud h2,.aud .ct,.aud .panel',{y:40,opacity:0,stagger:.07,scrollTrigger:{trigger:'.aud',start:'top 75%'}});
gsap.from('.why h2,.why .rs,.why .reason-view',{y:40,opacity:0,stagger:.08,scrollTrigger:{trigger:'.why',start:'top 75%'}});
$$('.stats b').forEach(function(el){var o={v:0},t=+el.dataset.n,suf=el.dataset.s;
  gsap.to(o,{v:t,duration:1.8,ease:'power2.out',scrollTrigger:{trigger:'.stats',start:'top 85%'},onUpdate:function(){var v=Math.round(o.v);el.textContent=(t>=1000?v.toLocaleString('cs-CZ'):v)+suf}})});
gsap.from('.stage .ph',{clipPath:'inset(0 100% 0 0 round 28px)',duration:1.4,ease:'power3.inOut',scrollTrigger:{trigger:'.stage',start:'top 70%'}});
gsap.from('.stage-text > *',{y:40,opacity:0,stagger:.15,scrollTrigger:{trigger:'.stage-text',start:'top 80%'}});
gsap.from('.feature',{y:60,opacity:0,scrollTrigger:{trigger:'.feature',start:'top 85%'}});
gsap.from('.reviews .card',{y:70,opacity:0,stagger:.12,duration:.9,scrollTrigger:{trigger:'.reviews .cards',start:'top 85%'}});
var n={v:0};
gsap.to(n,{v:4.7,duration:1.6,scrollTrigger:{trigger:'.score',start:'top 85%'},onUpdate:function(){$('.num').textContent=n.v.toFixed(1).replace('.',',')}});
gsap.from('.media h2,.mc',{y:50,opacity:0,stagger:.08,scrollTrigger:{trigger:'.media',start:'top 70%'}});
gsap.from('.news h2,.nc',{y:50,opacity:0,stagger:.08,scrollTrigger:{trigger:'.news',start:'top 75%'}});
gsap.from('.how .step',{y:60,opacity:0,stagger:.2,scrollTrigger:{trigger:'.how',start:'top 75%'}});
gsap.from('.free > *',{y:40,opacity:0,stagger:.12,scrollTrigger:{trigger:'.free',start:'top 80%'}});
gsap.from('.book h2, .book .sub, .cal-box',{y:50,opacity:0,stagger:.15,scrollTrigger:{trigger:'.book',start:'top 75%'}});

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
})();
