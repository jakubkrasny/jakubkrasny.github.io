/* jakubkrasny.cz v3 – interakce. Veškerý text je v HTML; skript jen přidává pohyb. */
(function(){
  'use strict';
  var root=document.documentElement;
  var calm=function(){return root.classList.contains('calm')};
  var finePointer=matchMedia('(hover: hover) and (pointer: fine)').matches;
  var mobile=matchMedia('(max-width: 860px)').matches;
  var $=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};

  /* ---------- Klidná verze ---------- */
  var calmBtn=$('#calm-toggle');
  function syncCalmBtn(){if(calmBtn)calmBtn.setAttribute('aria-pressed',calm()?'true':'false')}
  syncCalmBtn();
  if(calmBtn)calmBtn.addEventListener('click',function(){
    var on=!calm();try{localStorage.setItem('calm',on?'1':'0')}catch(e){}
    location.reload();
  });

  /* ---------- Nadpis po slovech (text zůstává v HTML) ---------- */
  $$('.split').forEach(function(el){
    var i=0;
    (function walk(node){
      Array.prototype.slice.call(node.childNodes).forEach(function(n){
        if(n.nodeType===3){
          var parts=n.textContent.split(/(\s+)/);var frag=document.createDocumentFragment();
          parts.forEach(function(p){if(!p)return;if(/^\s+$/.test(p)){frag.appendChild(document.createTextNode(p));return}
            var s=document.createElement('span');s.className='w';s.style.setProperty('--i',i++);s.textContent=p;frag.appendChild(s)});
          node.replaceChild(frag,n);
        }else if(n.nodeType===1&&!n.classList.contains('grad')){walk(n)}
        else if(n.nodeType===1){n.classList.add('w');n.style.setProperty('--i',i++);n.style.display='inline-block'}
      });
    })(el);
  });

  /* ---------- Reveal ---------- */
  var rv=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');rv.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.08});
  $$('.reveal').forEach(function(el,idx){
    var sib=el.parentElement?Array.prototype.indexOf.call(el.parentElement.children,el):0;
    el.style.transitionDelay=Math.min(sib,6)*70+'ms';
    rv.observe(el);
  });

  /* ---------- Hlavička, navigace, dock ---------- */
  var header=$('.site-header'),dock=$('#dock'),hero=$('#uvod'),book=$('#rezervace');
  var navLinks=$$('.nav a');
  function onScroll(){
    var y=scrollY;
    header.classList.toggle('is-scrolled',y>30);
    if(dock){var hb=hero.getBoundingClientRect().bottom,bt=book.getBoundingClientRect().top;dock.classList.toggle('show',hb<0&&bt>innerHeight*.6)}
  }
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  var secIO=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var id=e.target.id;navLinks.forEach(function(a){a.classList.toggle('is-active',a.getAttribute('href')==='#'+id)})}})},{rootMargin:'-45% 0px -50% 0px'});
  navLinks.forEach(function(a){var s=$(a.getAttribute('href'));if(s)secIO.observe(s)});

  /* ---------- Barva aurory podle sekce ---------- */
  var hues={uvod:0,konzultace:.05,ukazka:.3,everbot:.2,'pro-koho':.1,'kdo-jsem':.45,reference:.6,media:.5,otazky:.15,zdarma:.1,rezervace:0};
  var hueIO=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&window.Aurora){var id=e.target.id;Aurora.setTarget(hues[id]||0);Aurora.setBoost(id==='rezervace'||id==='uvod'?1:0)}})},{rootMargin:'-40% 0px -40% 0px'});
  Object.keys(hues).forEach(function(id){var s=document.getElementById(id);if(s)hueIO.observe(s)});

  /* ---------- Kurzor: světlo, oči maskota, magnetická tlačítka, tilt ---------- */
  var spot=$('.spot'),pupils=$$('#mascot .pupil'),mascot=$('#mascot');
  if(finePointer&&!calm()){
    var sx=-999,sy=-999,tx=-999,ty=-999;
    addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY},{passive:true});
    (function raf(){sx+=(tx-sx)*.18;sy+=(ty-sy)*.18;if(spot)spot.style.transform='translate3d('+sx+'px,'+sy+'px,0)';
      if(mascot&&pupils.length){var r=mascot.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=tx-cx,dy=ty-cy,d=Math.hypot(dx,dy)||1,m=Math.min(3.2,d/60);
        pupils.forEach(function(p){p.style.transform='translate('+(dx/d*m)+'px,'+(dy/d*m)+'px)'})}
      requestAnimationFrame(raf)})();
    $$('.magnetic').forEach(function(b){
      b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;b.style.transform='translate('+x*.18+'px,'+y*.28+'px)';var s=b.querySelector('span');if(s)s.style.transform='translate('+x*.08+'px,'+y*.1+'px)'});
      b.addEventListener('pointerleave',function(){b.style.transform='';var s=b.querySelector('span');if(s)s.style.transform=''});
    });
    $$('.tilt').forEach(function(t){
      t.addEventListener('pointermove',function(e){var r=t.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
        t.style.transform='perspective(1000px) rotateX('+((.5-py)*5)+'deg) rotateY('+((px-.5)*6)+'deg)';t.style.setProperty('--mx',px*100+'%');t.style.setProperty('--my',py*100+'%')});
      t.addEventListener('pointerleave',function(){t.style.transform=''});
    });
  }

  /* ---------- Marquee ---------- */
  $$('[data-marquee]').forEach(function(m){if(calm())return;var ul=m.querySelector('ul');var clone=ul.innerHTML;ul.innerHTML+=clone+clone+clone;$$('li',ul).forEach(function(li,i){if(i>=ul.children.length/4)li.setAttribute('aria-hidden','true')});m.classList.add('run')});

  /* ---------- Přehrávač videorecenzí (youtube-nocookie, načte se až po kliknutí) ---------- */
  var dlg=$('#player'),frame=$('#player-frame'),ptitle=$('#player-title');
  $$('[data-yt]').forEach(function(b){b.addEventListener('click',function(e){
    if(!dlg||typeof dlg.showModal!=='function')return; e.preventDefault();
    ptitle.textContent=b.dataset.title||'Video';frame.src='https://www.youtube-nocookie.com/embed/'+b.dataset.yt+'?autoplay=1&rel=0';dlg.showModal();
  })});
  if(dlg){var close=function(){frame.src='about:blank';if(dlg.open)dlg.close()};$('[data-close]',dlg).addEventListener('click',close);dlg.addEventListener('close',function(){frame.src='about:blank'});dlg.addEventListener('click',function(e){if(e.target===dlg)close()})}

  /* ---------- Cal.com: načíst až při přiblížení k rezervaci ---------- */
  var calEl=$('#cal-inline'),calLoaded=false;
  function loadCal(){
    if(calLoaded||!calEl)return;calLoaded=true;
    (function(C,A,L){var p=function(a,ar){a.q.push(ar)};var d=C.document;C.Cal=C.Cal||function(){var cal=C.Cal;var ar=arguments;if(!cal.loaded){cal.ns={};cal.q=cal.q||[];d.head.appendChild(d.createElement('script')).src=A;cal.loaded=true}if(ar[0]===L){var api=function(){p(api,arguments)};var namespace=ar[1];api.q=api.q||[];if(typeof namespace==='string'){cal.ns[namespace]=cal.ns[namespace]||api;p(cal.ns[namespace],ar);p(cal,['initNamespace',namespace])}else p(cal,ar);return}p(cal,ar)}})(window,'https://app.cal.com/embed/embed.js','init');
    Cal('init','konzultace',{origin:'https://app.cal.com'});
    Cal.ns.konzultace('inline',{elementOrSelector:'#cal-inline',calLink:calEl.dataset.calLink,config:{layout:'month_view',theme:'dark',attendeePhoneNumber:'+420'}});
    Cal.ns.konzultace('ui',{theme:'dark',hideEventTypeDetails:true,layout:'month_view',
      cssVarsPerTheme:{dark:{'cal-brand':'#2EF379','cal-brand-emphasis':'#5FFF9C','cal-brand-text':'#03130A','cal-bg':'#080C12','cal-bg-muted':'#0E141C','cal-bg-subtle':'#121A24','cal-bg-emphasis':'#1A2430','cal-border':'#1F2A36','cal-border-subtle':'#17202A','cal-text':'#E6ECF2','cal-text-emphasis':'#FFFFFF','cal-text-subtle':'#A9B3BE','cal-text-muted':'#7D8894'}}});
    Cal.ns.konzultace('on',{action:'linkReady',callback:function(){var l=$('.cal-loading',calEl);if(l)l.remove()}});
  }
  if(calEl){
    if('IntersectionObserver' in window){var cio=new IntersectionObserver(function(es){if(es[0].isIntersecting){loadCal();cio.disconnect()}},{rootMargin:'1200px 0px'});cio.observe(calEl)}else loadCal();
    $$('a[href="#rezervace"]').forEach(function(a){a.addEventListener('click',loadCal)});
  }

  /* ---------- Portrét ---------- */
  var pcv=$('#portrait');
  if(pcv&&window.Portrait){var pio=new IntersectionObserver(function(es){if(es[0].isIntersecting){Portrait.init(pcv);pio.disconnect()}},{rootMargin:'600px 0px'});pio.observe(pcv)}

  /* ---------- GSAP: smooth scroll, časová osa, připnutá scéna ---------- */
  function initGsap(){
    if(!window.gsap||!window.ScrollTrigger)return;
    gsap.registerPlugin(ScrollTrigger);
    var lenis=null;
    if(!calm()&&finePointer&&window.Lenis){
      lenis=new Lenis({lerp:.11,wheelMultiplier:1,smoothWheel:true});
      lenis.on('scroll',ScrollTrigger.update);
      gsap.ticker.add(function(t){lenis.raf(t*1000)});gsap.ticker.lagSmoothing(0);
      $$('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var id=a.getAttribute('href');if(id.length<2)return;var t=$(id);if(!t)return;e.preventDefault();lenis.scrollTo(t,{offset:id==='#uvod'?-200:-76,duration:1.3});history.replaceState(null,'',id)})});
      window.__lenis=lenis;
    }
    if(calm())return;

    // Everbot okna: hloubka a náklon při scrollu
    var show=$('.ebx--show');
    if(show){gsap.fromTo(show,{rotationX:mobile?8:16,scale:mobile?.96:.92,y:mobile?20:50,transformOrigin:'50% 0%'},{rotationX:0,scale:1,y:0,ease:'none',scrollTrigger:{trigger:'.ebx-stage--show',start:'top 98%',end:'top 30%',scrub:.6}})}
    var hst=$('.ebx-stage--hero');
    if(hst&&!mobile){gsap.to(hst,{rotationX:10,y:60,scale:.96,transformOrigin:'50% 100%',ease:'none',scrollTrigger:{trigger:'#uvod',start:'top top',end:'bottom top',scrub:.5}})}

    // čára časové osy
    var line=$('.timeline-line path');
    if(line){gsap.fromTo(line,{'--dash':1000},{'--dash':0,ease:'none',scrollTrigger:{trigger:'#timeline',start:'top 75%',end:'bottom 55%',scrub:true}})}

    // připnutá scéna „Z hodin minuty“
    var scene=$('#ukazka'),stage=$('.scene-stage',scene),chips=$$('.chip',scene),hub=$('.hub',scene),hubLis=$$('.hub-list li',scene),steps=$$('.scene-steps li',scene),hours=$('.w-hours',scene),mins=$('.w-minutes',scene),bar=$('.scene-progress',scene);
    if(scene&&stage){
      root.classList.add('scene-on');
      var sr=stage.getBoundingClientRect(),SW=sr.width,SH=sr.height;
      // rozházené pozice čipů (deterministicky)
      var spots=[[-.42,-.40],[.18,-.44],[-.10,-.22],[.38,-.20],[-.46,.02],[.30,.06],[-.25,.28],[.10,.30],[-.38,.44],[.36,.42]];
      var kx=mobile?.86:1,ky=mobile?.8:1;
      chips.forEach(function(c,i){var s=spots[i%spots.length];var w=c.offsetWidth,h=c.offsetHeight;
        var cxp=Math.max(-SW/2+4,Math.min(SW/2-w-4,s[0]*kx*SW-w/2));
        gsap.set(c,{x:cxp,y:s[1]*ky*SH-h/2,rotation:(i%2?1:-1)*(4+i%3*3),opacity:1,filter:'saturate(0.6)'})});
      gsap.set(hub,{opacity:0,scale:.86,y:30});
      gsap.set(hubLis,{opacity:0,x:-14});
      gsap.set(mins,{opacity:.12,y:16});
      var setStep=function(n){steps.forEach(function(s,i){s.classList.toggle('is-on',i===n)})};
      var tl=gsap.timeline({defaults:{ease:'power2.inOut'},scrollTrigger:{trigger:scene,start:'top top',end:mobile?'+=170%':'+=230%',pin:'.scene-pin',scrub:.6,anticipatePin:1,
        onUpdate:function(st){bar.style.setProperty('--p',st.progress.toFixed(3));var n=st.progress<.33?0:st.progress<.62?1:2;setStep(n);if(window.Aurora)Aurora.setTarget(.25+st.progress*.35)}}});
      // 1) čipy se chaoticky vznáší
      tl.to(chips,{y:'-=26',rotation:function(i){return (i%2?-1:1)*8},duration:1,stagger:{each:.04,from:'random'}},0)
      // 2) přeškrtnout hodiny
        .to(hours,{'--strike':1,duration:.8},.9)
      // 3) čipy vletí do hubu
        .to(hub,{opacity:1,scale:1,y:0,duration:1},1.4)
        .to(chips,{x:function(i,c){return -c.offsetWidth/2},y:function(i,c){return -c.offsetHeight/2},scale:.35,opacity:0,rotation:0,filter:'saturate(1)',duration:1.2,stagger:.05},1.5)
        .to(hubLis,{opacity:1,x:0,duration:.6,stagger:.12},2.3)
        .to(hours,{opacity:.88,duration:.6},2.3)
        .to(mins,{opacity:1,y:0,duration:.8},2.4)
        .to({}, {duration:.6});
    }
  }
  if(document.readyState==='complete')initGsap();else addEventListener('load',initGsap);
})();
