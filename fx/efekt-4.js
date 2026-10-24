/* Efekt 4 (prompt): v poli se napíše zadání pro AI, Everbot vybere model, text se pak "streamuje" po slovech jako odpověď chatbota a fotka se vygeneruje difuzí ze šumu. */
(function(){
var D=document.documentElement;if(!D.classList.contains('fx'))return;
var hero=document.querySelector('.hero'),h1=hero&&hero.querySelector('h1'),photo=hero&&hero.querySelector('.hero-photo'),htext=hero&&hero.querySelector('.hero-text'),ph=photo&&photo.querySelector('.ph'),img=ph&&ph.querySelector('img');
function fail(){D.classList.add('fx-done');if(hero)hero.classList.add('nm-on')}
if(!hero||!h1||!photo||!ph||!window.gsap||!window.FXL||scrollY>240){fail();return}
D.classList.add('fx-ok','fx4');
function go(){
try{
  var chars=FXL.split(h1),lead=htext.querySelector('.lead'),toks=lead?FXL.splitWords(lead):[];
  var pill=htext.querySelector('.pill'),rest=[].slice.call(htext.children).filter(function(e){return e!==h1&&e!==lead&&e!==pill}).concat([].slice.call(hero.querySelectorAll('.scroll-cue')));
  gsap.set(chars,{opacity:0});gsap.set(toks,{opacity:0});
  hero.classList.add('nm-on');
  var hr=hero.getBoundingClientRect(),h1r=h1.getBoundingClientRect(),narrow=hr.width<640;
  htext.style.position='relative';
  /* pole pro prompt */
  var box=document.createElement('div');box.className='fxprompt';
  var cw=Math.min(560,htext.clientWidth);box.style.width=cw+'px';box.style.left='0px';box.style.top=(h1.offsetTop+(narrow?0:14))+'px';
  box.innerHTML='<div class="fxp-top"><span class="fxp-dot"></span><b>Everbot</b><em></em></div><div class="fxp-in"><span class="fxp-txt"></span><i class="fxtc"></i><button type="button" tabindex="-1" aria-hidden="true">↑</button></div><div class="fxp-models"><span>GPT</span><span>Claude</span><span>Gemini</span><span>Nano Banana</span></div>';
  htext.appendChild(box);
  var txt=box.querySelector('.fxp-txt'),tcur=box.querySelector('.fxtc'),st=box.querySelector('em'),models=[].slice.call(box.querySelectorAll('.fxp-models span')),btn=box.querySelector('button');
  var prompt=narrow?'Vytvoř web pro AI konzultanta Jakuba Krásného':'Vytvoř úvodní stránku pro Jakuba Krásného, AI konzultanta Everbotu',pi=0;
  gsap.from(box,{opacity:0,y:20,scale:.96,duration:.5,ease:'power3.out'});
  if(pill)gsap.set(pill,{opacity:0});
  function type(){if(pi<=prompt.length){txt.textContent=prompt.slice(0,pi++);setTimeout(type,24+Math.random()*34)}else send()}
  setTimeout(type,500);
  function send(){
    gsap.to(btn,{scale:1.25,duration:.12,yoyo:true,repeat:1});
    btn.classList.add('on');tcur.remove();st.textContent='Vybírám model…';
    var i=0,iv=setInterval(function(){models.forEach(function(m){m.classList.remove('on')});models[i%models.length].classList.add('on');i++;if(i>9){clearInterval(iv);models.forEach(function(m){m.classList.remove('on')});models[2].classList.add('on','pick');st.textContent='Gemini · generuji…';stream()}},95);
  }
  function stream(){
    gsap.to(box,{opacity:0,y:-18,scale:.97,duration:.5,delay:.35,ease:'power2.in',onComplete:function(){box.remove()}});
    var cur=document.createElement('span');cur.className='fxcur';
    /* obrázek: difuze + popisek */
    gsap.set(photo,{opacity:1});
    var dn=FXL.denoise(ph,img);dn.draw(0);
    var hud=document.createElement('div');hud.className='fxprog';hud.innerHTML='<span></span><i><u></u></i>';ph.appendChild(hud);
    var hs=hud.firstChild,hb=hud.querySelector('u'),s={p:0};
    gsap.from(ph,{opacity:0,duration:.5});
    gsap.to(s,{p:1,duration:3.4,delay:.3,ease:'power2.inOut',onUpdate:function(){dn.draw(s.p);hs.textContent='Nano Banana generuje obrázek… '+Math.round(s.p*100)+' %';hb.style.width=s.p*100+'%'},
      onComplete:function(){gsap.to([dn.canvas,hud],{opacity:0,duration:.45,onComplete:function(){dn.remove();hud.remove()}})}});
    /* pilulka, nadpis po "tokenech" (2-3 znaky), pak perex po slovech */
    if(pill)gsap.to(pill,{opacity:1,duration:.5,delay:.7});
    var k=0,tokTimer;
    function nextTok(){if(k>=chars.length){h1.appendChild(cur);return streamLead()}
      var n=2+Math.floor(Math.random()*2),grp=chars.slice(k,k+n);k+=n;
      grp.forEach(function(c){gsap.fromTo(c,{opacity:0,filter:'blur(8px)',y:6},{opacity:1,filter:'blur(0px)',y:0,duration:.35,ease:'power2.out'})});
      var last=grp[grp.length-1];last.parentNode.insertBefore(cur,last.nextSibling);
      setTimeout(nextTok,70+Math.random()*50)}
    setTimeout(nextTok,800);
    function streamLead(){var j=0;if(!toks.length)return fin();
      lead.appendChild(cur);gsap.set(lead,{opacity:1});
      (function nx(){if(j>=toks.length)return fin();var t=toks[j++];gsap.fromTo(t,{opacity:0,filter:'blur(4px)'},{opacity:1,filter:'blur(0px)',duration:.25});t.parentNode.insertBefore(cur,t.nextSibling);setTimeout(nx,38+Math.random()*34)})()}
    function fin(){setTimeout(function(){cur.remove()},500);
      gsap.fromTo(rest,{opacity:0,y:24},{opacity:1,y:0,duration:.7,stagger:.12,ease:'power3.out',onComplete:function(){D.classList.add('fx-done');chars.forEach(function(c){c.style.filter='';c.style.opacity=''});toks.forEach(function(c){c.style.filter='';c.style.opacity=''})}})}
  }
}catch(e){fail()}
}
(document.fonts&&document.fonts.ready?Promise.race([document.fonts.ready,new Promise(function(r){setTimeout(r,1400)})]):Promise.resolve()).then(function(){requestAnimationFrame(go)});
})();
