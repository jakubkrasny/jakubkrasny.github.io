/* Efekt 3 (AI terminál): binární déšť, příkaz everbot.generate(...) se píše do terminálu, jméno se rozluští z náhodných znaků a fotka se "vygeneruje" difuzí ze šumu (s počítadlem kroků). */
(function(){
var D=document.documentElement;if(!D.classList.contains('fx'))return;
var hero=document.querySelector('.hero'),h1=hero&&hero.querySelector('h1'),photo=hero&&hero.querySelector('.hero-photo'),htext=hero&&hero.querySelector('.hero-text'),ph=photo&&photo.querySelector('.ph'),img=ph&&ph.querySelector('img');
function fail(){D.classList.add('fx-done');if(hero)hero.classList.add('nm-on')}
if(!hero||!h1||!photo||!ph||!window.gsap||!window.FXL||scrollY>240){fail();return}
D.classList.add('fx-ok','fx3');
var GL='01010101<>/{}[]#%@$&*+=ABCDEF0123456789';
function go(){
try{
  var chars=FXL.split(h1);
  chars.forEach(function(c){c.style.minWidth='0';c.textContent=GL[Math.floor(Math.random()*GL.length)];c.classList.add('fxdec')});
  chars.forEach(function(c){var t=c.textContent;c.textContent=c.dataset.c;c._w=c.getBoundingClientRect().width;c.textContent=t});
  chars.forEach(function(c){c.style.width=c._w+'px';c.style.textAlign='center'});
  hero.classList.add('nm-on');
  var hr=hero.getBoundingClientRect(),W=Math.round(hr.width),H=Math.round(hr.height),narrow=W<640;
  var pill=htext.querySelector('.pill');
  var items=[].slice.call(htext.children).filter(function(e){return e!==h1}).concat([].slice.call(hero.querySelectorAll('.scroll-cue')));
  /* binární déšť ve třech hloubkách */
  var cv=document.createElement('canvas'),dpr=Math.min(2,devicePixelRatio||1);cv.className='fxrain';cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';hero.appendChild(cv);
  var cx=cv.getContext('2d');cx.scale(dpr,dpr);
  var layers=[{fs:12,sp:.7,a:.35,n:0},{fs:16,sp:1,a:.7,n:0},{fs:24,sp:1.5,a:1,n:0}].map(function(L){L.cols=Math.ceil(W/L.fs);L.d=[];for(var i=0;i<L.cols;i++)L.d.push(Math.random()<.45?Math.random()*-40:-999);return L});
  var rain=true,last=0,fade=1;
  function rainFrame(t){if(!rain)return;if(t-last>40){last=t;
      cx.globalCompositeOperation='destination-out';cx.fillStyle='rgba(0,0,0,.16)';cx.fillRect(0,0,W,H);cx.globalCompositeOperation='source-over';
      layers.forEach(function(L){cx.font=L.fs+'px monospace';
        for(var i=0;i<L.cols;i++){if(L.d[i]<-900){if(Math.random()<.004)L.d[i]=0;continue}
          var y=L.d[i]*L.fs,ch=GL[Math.floor(Math.random()*GL.length)];
          cx.fillStyle='rgba(235,255,242,'+L.a+')';cx.fillText(ch,i*L.fs,y);
          cx.fillStyle='rgba(46,243,121,'+L.a*.9+')';cx.fillText(GL[Math.floor(Math.random()*GL.length)],i*L.fs,y-L.fs);
          if(y>H&&Math.random()>.97)L.d[i]=Math.random()*-10;L.d[i]+=L.sp}})}
    cv.style.opacity=fade;requestAnimationFrame(rainFrame)}
  requestAnimationFrame(rainFrame);
  var fo={a:1};gsap.to(fo,{a:0,duration:1.4,delay:2.4,ease:'power1.in',onUpdate:function(){fade=fo.a},onComplete:function(){rain=false;cv.remove()}});
  /* terminál na místě pilulky */
  var term=document.createElement('div');term.className='fxterm';
  if(pill){htext.style.position='relative';term.style.left=pill.offsetLeft+'px';term.style.top=pill.offsetTop+'px';term.style.height=pill.offsetHeight+'px'}
  htext.appendChild(term);
  var cmd='> everbot.generate("Jakub Krásný")',ci=0,tcur=document.createElement('i');tcur.className='fxtc';
  function typeCmd(){if(ci<=cmd.length){term.textContent=cmd.slice(0,ci++);term.appendChild(tcur);setTimeout(typeCmd,26+Math.random()*30)}
    else if(!narrow){var ok=document.createElement('b');ok.textContent='  ✓ GPT  ✓ Claude  ✓ Gemini';term.insertBefore(ok,tcur)}}
  setTimeout(typeCmd,150);
  /* luštění jména */
  var tstart=performance.now()+1100,per=92,state=chars.map(function(c,i){return {c:c,at:tstart+i*per+Math.random()*70,done:false}});
  var cur=document.createElement('span');cur.className='fxcur';h1.appendChild(cur);
  function dec(now){var allDone=true,lastDone=-1;
    state.forEach(function(s,i){if(s.done){lastDone=i;return}allDone=false;
      if(now>=s.at){s.done=true;s.c.textContent=s.c.dataset.c;s.c.classList.remove('fxdec');gsap.fromTo(s.c,{scale:1.3,filter:'brightness(3)'},{scale:1,filter:'brightness(1)',duration:.5,ease:'power2.out'});lastDone=i}
      else s.c.textContent=GL[Math.floor(Math.random()*GL.length)]});
    var lc=state[Math.max(0,lastDone)].c;lc.parentNode.insertBefore(cur,lc.nextSibling);
    if(!allDone)setTimeout(function(){dec(performance.now())},48);else setTimeout(function(){gsap.to(cur,{opacity:0,duration:.4,onComplete:function(){cur.remove()}});gsap.to(term,{opacity:0,duration:.5,onComplete:function(){term.remove()}})},600)}
  setTimeout(function(){dec(performance.now())},1100);
  /* fotka: difuze ze šumu + počítadlo kroků */
  gsap.set(photo,{opacity:1});
  var dn=FXL.denoise(ph,img);dn.draw(0);
  var hud=document.createElement('div');hud.className='fxprog';hud.innerHTML='<span></span><i><u></u></i>';ph.appendChild(hud);
  var hs=hud.firstChild,hb=hud.querySelector('u'),st={p:0};
  gsap.from(ph,{opacity:0,duration:.5,delay:.5});
  gsap.to(st,{p:1,duration:3.1,delay:.6,ease:'power2.inOut',onUpdate:function(){dn.draw(st.p);var k=Math.max(1,Math.round(st.p*50));hs.textContent='Generuji obrázek · krok '+k+'/50 · '+Math.round(st.p*100)+' %';hb.style.width=st.p*100+'%'},
    onComplete:function(){gsap.to([dn.canvas,hud],{opacity:0,duration:.45,onComplete:function(){dn.remove();hud.remove()}})}});
  /* zbytek */
  gsap.fromTo(items,{opacity:0,y:30},{opacity:1,y:0,duration:.8,stagger:.12,ease:'power3.out',delay:chars.length*.092+1.5,onComplete:function(){D.classList.add('fx-done')}});
  /* interakce: znovu zluštit písmeno po najetí */
  if(!matchMedia('(hover: none)').matches)chars.forEach(function(c){c.addEventListener('mouseenter',function(){if(c.classList.contains('fxdec'))return;var k=0,iv=setInterval(function(){c.textContent=GL[Math.floor(Math.random()*GL.length)];c.classList.add('fxdec');if(++k>7){clearInterval(iv);c.textContent=c.dataset.c;c.classList.remove('fxdec')}},45)})});
}catch(e){fail()}
}
(document.fonts&&document.fonts.ready?Promise.race([document.fonts.ready,new Promise(function(r){setTimeout(r,1400)})]):Promise.resolve()).then(function(){requestAnimationFrame(go)});
})();
