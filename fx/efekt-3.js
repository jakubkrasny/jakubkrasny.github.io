/* Efekt 3: dekódování. Kódový déšť, jméno se rozluští z náhodných znaků a fotka se zaostří z hrubých pixelů. */
(function(){
var D=document.documentElement;if(!D.classList.contains('fx'))return;
var hero=document.querySelector('.hero'),h1=hero&&hero.querySelector('h1'),photo=hero&&hero.querySelector('.hero-photo'),htext=hero&&hero.querySelector('.hero-text'),ph=photo&&photo.querySelector('.ph'),img=ph&&ph.querySelector('img');
function fail(){D.classList.add('fx-done');if(hero)hero.classList.add('nm-on')}
if(!hero||!h1||!photo||!ph||!window.gsap||scrollY>240){fail();return}
D.classList.add('fx-ok','fx3');
var GL='01<>/{}[]#%@$&*+=ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function go(){
try{
  var label=h1.textContent.replace(/\s+/g,' ').trim();h1.setAttribute('aria-label',label);
  var tw=document.createTreeWalker(h1,NodeFilter.SHOW_TEXT),nodes=[],n;while(n=tw.nextNode())nodes.push(n);
  nodes.forEach(function(node){var parts=node.nodeValue.split(/(\s+)/),frag=document.createDocumentFragment();
    parts.forEach(function(p){if(!p)return;if(/^\s+$/.test(p)){frag.appendChild(document.createTextNode(' '));return}
      var w=document.createElement('span');w.className='fxw';w.setAttribute('aria-hidden','true');
      p.split('').forEach(function(c){var s=document.createElement('span');s.className='fxch';s.dataset.c=c;s.style.minWidth='0';s.textContent=GL[Math.floor(Math.random()*GL.length)];s.classList.add('fxdec');w.appendChild(s)});frag.appendChild(w)});
    node.parentNode.replaceChild(frag,node)});
  var chars=[].slice.call(h1.querySelectorAll('.fxch'));
  /* zafixuj šířky, ať se nápis při luštění nehýbe */
  chars.forEach(function(c){var t=c.textContent;c.textContent=c.dataset.c;c._w=c.getBoundingClientRect().width;c.textContent=t});
  chars.forEach(function(c){c.style.width=c._w+'px';c.style.textAlign='center'});
  hero.classList.add('nm-on');
  var hr=hero.getBoundingClientRect(),W=Math.round(hr.width),H=Math.round(hr.height);
  var items=[].slice.call(htext.children).filter(function(e){return e!==h1}).concat([].slice.call(hero.querySelectorAll('.scroll-cue')));
  /* kódový déšť */
  var cv=document.createElement('canvas'),dpr=Math.min(2,devicePixelRatio||1);cv.className='fxrain';cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';hero.appendChild(cv);
  var cx=cv.getContext('2d');cx.scale(dpr,dpr);var fs=16,cols=Math.ceil(W/fs),drops=[];for(var i=0;i<cols;i++)drops.push(Math.random()*-40);
  var rain=true,alpha=.85,last=0;
  function rainFrame(t){if(!rain)return;if(t-last>42){last=t;
      cx.globalCompositeOperation='destination-out';cx.fillStyle='rgba(0,0,0,.14)';cx.fillRect(0,0,W,H);cx.globalCompositeOperation='source-over';
      cx.font=fs+'px monospace';
      for(var i=0;i<cols;i++){var y=drops[i]*fs;var ch=GL[Math.floor(Math.random()*GL.length)];
        cx.fillStyle=Math.random()<.06?'#fff':'rgba(46,243,121,'+alpha+')';cx.fillText(ch,i*fs,y);
        if(y>H&&Math.random()>.975)drops[i]=Math.random()*-12;drops[i]+=1}}
    cv.style.opacity=alpha<.3?alpha*3:1;requestAnimationFrame(rainFrame)}
  requestAnimationFrame(rainFrame);
  gsap.to({a:0},{a:1,duration:2.6,onComplete:function(){gsap.to(cv,{opacity:0,duration:1.2,onComplete:function(){rain=false;cv.remove()}})}});
  /* luštění jména */
  var order=chars.slice();var tstart=performance.now()+700,per=95,state=chars.map(function(c,i){return {c:c,at:tstart+i*per+Math.random()*60,done:false}});
  var cur=document.createElement('span');cur.className='fxcur';h1.appendChild(cur);
  function dec(now){var allDone=true,lastDone=-1;
    state.forEach(function(s,i){if(s.done){lastDone=i;return}allDone=false;
      if(now>=s.at){s.done=true;s.c.textContent=s.c.dataset.c;s.c.classList.remove('fxdec');gsap.fromTo(s.c,{scale:1.25,filter:'brightness(3)'},{scale:1,filter:'brightness(1)',duration:.5,ease:'power2.out'});lastDone=i}
      else{if(now%2<1)s.c.textContent=GL[Math.floor(Math.random()*GL.length)]}});
    var lc=state[Math.max(0,lastDone)].c;lc.parentNode.insertBefore(cur,lc.nextSibling);
    if(!allDone)setTimeout(function(){dec(performance.now())},48);else setTimeout(function(){gsap.to(cur,{opacity:0,duration:.4,onComplete:function(){cur.remove()}})},700)}
  setTimeout(function(){dec(performance.now())},700);
  /* fotka: zaostření z pixelů */
  gsap.set(photo,{opacity:1});
  var pc=document.createElement('canvas');pc.className='fxpix';ph.appendChild(pc);var pw=ph.clientWidth||400,pH=ph.clientHeight||500;pc.width=pw;pc.height=pH;var px=pc.getContext('2d');
  var sizes=[64,48,36,26,18,12,8,5,3,2,1],si=0;
  function drawPix(sz){var im=img;if(!im||!im.naturalWidth){pc.style.background='#0b0e1d';return}
    var iw=im.naturalWidth,ih=im.naturalHeight,sc=Math.max(pw/iw,pH/ih),dw=iw*sc,dh=ih*sc,dx=(pw-dw)/2,dy=(pH-dh)/2;
    var sw=Math.max(2,Math.ceil(pw/sz)),sh=Math.max(2,Math.ceil(pH/sz));
    var off=drawPix.o||(drawPix.o=document.createElement('canvas'));off.width=sw;off.height=sh;var ox=off.getContext('2d');ox.imageSmoothingEnabled=true;
    ox.drawImage(im,(dx)/sz,(dy)/sz,dw/sz,dh/sz);
    px.imageSmoothingEnabled=false;px.clearRect(0,0,pw,pH);px.drawImage(off,0,0,sw,sh,0,0,sw*sz,sh*sz)}
  function pixStep(){if(si>=sizes.length){pc.remove();return}
    drawPix(sizes[si]);var gl=si<6&&Math.random()<.5;ph.style.filter=gl?'hue-rotate('+(Math.random()*40-20)+'deg) saturate(1.5)':'none';si++;setTimeout(pixStep,si<8?150:110)}
  gsap.fromTo(ph,{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',duration:.9,ease:'steps(14)',delay:.5,onStart:function(){drawPix(sizes[0]);setTimeout(pixStep,400)},onComplete:function(){ph.style.clipPath='none'}});
  /* zbytek */
  gsap.fromTo(items,{opacity:0,y:30},{opacity:1,y:0,duration:.8,stagger:.12,ease:'power3.out',delay:chars.length*.095+1.0,onComplete:function(){D.classList.add('fx-done');ph.style.filter='none'}});
  /* interakce: znovu zluštit písmeno po najetí */
  if(!matchMedia('(hover: none)').matches)chars.forEach(function(c){c.addEventListener('mouseenter',function(){if(c.classList.contains('fxdec'))return;var k=0,iv=setInterval(function(){c.textContent=GL[Math.floor(Math.random()*GL.length)];c.classList.add('fxdec');if(++k>7){clearInterval(iv);c.textContent=c.dataset.c;c.classList.remove('fxdec')}},45)})});
}catch(e){fail()}
}
(document.fonts&&document.fonts.ready?Promise.race([document.fonts.ready,new Promise(function(r){setTimeout(r,1400)})]):Promise.resolve()).then(function(){requestAnimationFrame(go)});
})();
