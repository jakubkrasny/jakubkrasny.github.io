/* Efekt 2: neonový paprsek přejede stránku, písmena se přetočí z hloubky (3D) a fotka se otevře jako žaluzie. */
(function(){
var D=document.documentElement;if(!D.classList.contains('fx'))return;
var hero=document.querySelector('.hero'),h1=hero&&hero.querySelector('h1'),photo=hero&&hero.querySelector('.hero-photo'),htext=hero&&hero.querySelector('.hero-text'),ph=photo&&photo.querySelector('.ph');
function fail(){D.classList.add('fx-done');if(hero)hero.classList.add('nm-on')}
if(!hero||!h1||!photo||!ph||!window.gsap||scrollY>240){fail();return}
D.classList.add('fx-ok','fx2');
function go(){
try{
  var label=h1.textContent.replace(/\s+/g,' ').trim();h1.setAttribute('aria-label',label);
  var tw=document.createTreeWalker(h1,NodeFilter.SHOW_TEXT),nodes=[],n;while(n=tw.nextNode())nodes.push(n);
  nodes.forEach(function(node){var parts=node.nodeValue.split(/(\s+)/),frag=document.createDocumentFragment();
    parts.forEach(function(p){if(!p)return;if(/^\s+$/.test(p)){frag.appendChild(document.createTextNode(' '));return}
      var w=document.createElement('span');w.className='fxw';w.setAttribute('aria-hidden','true');
      p.split('').forEach(function(c){var s=document.createElement('span');s.className='fxch';s.textContent=c;w.appendChild(s)});frag.appendChild(w)});
    node.parentNode.replaceChild(frag,node)});
  var chars=[].slice.call(h1.querySelectorAll('.fxch'));
  var hr=hero.getBoundingClientRect(),W=hr.width,H=hr.height,DUR=1.5;
  gsap.set(chars,{opacity:0,rotationX:-100,z:-600,y:70,rotationY:function(){return gsap.utils.random(-70,70)},transformOrigin:'50% 100%'});
  hero.classList.add('nm-on');
  /* fotka: žaluzie */
  ph.style.setProperty('--p','0');
  var mk='linear-gradient(90deg,#000 calc(var(--p)*1%),transparent calc(var(--p)*1%))';ph.style.webkitMaskImage=mk;ph.style.maskImage=mk;
  gsap.set(photo,{opacity:1});
  /* paprsek */
  var scan=document.createElement('div');scan.className='fxscan';scan.style.left='-10px';hero.appendChild(scan);
  var items=[].slice.call(htext.children).filter(function(e){return e!==h1}).concat([].slice.call(hero.querySelectorAll('.scroll-cue')));
  var tl=gsap.timeline({delay:.35,onComplete:function(){scan.remove();ph.style.webkitMaskImage=ph.style.maskImage='none';ph.style.removeProperty('-webkit-mask-size');D.classList.add('fx-done');chars.forEach(function(c){c.classList.remove('gl')})}});
  tl.to(scan,{left:W+10,duration:DUR,ease:'power2.inOut'},0);
  chars.forEach(function(c){var r=c.getBoundingClientRect(),cx=(r.left+r.width/2-hr.left)/W,d=Math.max(0,cx*DUR*.86);
    c.classList.add('gl');
    tl.to(c,{opacity:1,rotationX:0,rotationY:0,z:0,y:0,duration:.95,ease:'back.out(1.5)'},d+.05);
    tl.add(function(){c.classList.remove('gl')},d+.75)});
  var pr=photo.getBoundingClientRect(),stacked=pr.top-hr.top>H*.45,pd=stacked?DUR*.7:Math.max(.2,(pr.left+pr.width/2-hr.left)/W*DUR*.86);
  tl.fromTo(ph,{'--p':0,scale:1.2,filter:'brightness(2.4) saturate(.4)'},{'--p':100,scale:1,filter:'brightness(1) saturate(1)',duration:1.25,ease:'power3.out'},pd);
  tl.fromTo(items,{opacity:0,y:36,filter:'blur(8px)'},{opacity:1,y:0,filter:'blur(0px)',duration:.9,stagger:.12,ease:'power3.out'},DUR*.8);
  /* záblesk zeleného písma po průchodu */
  var g=h1.querySelectorAll('.g .fxch');
  if(g.length)tl.to(g,{filter:'drop-shadow(0 0 22px rgba(46,243,121,.95))',duration:.35,yoyo:true,repeat:1,stagger:.04,ease:'power2.out'},DUR+.15);
  /* interakce: naklonění nápisu a "pop" písmen */
  if(!matchMedia('(hover: none)').matches){
    var rx=gsap.quickTo(h1,'rotationY',{duration:.6,ease:'power3.out'}),ry=gsap.quickTo(h1,'rotationX',{duration:.6,ease:'power3.out'});
    gsap.set(h1,{transformPerspective:900,transformOrigin:'0% 50%'});
    addEventListener('pointermove',function(e){if(scrollY>hero.offsetHeight)return;rx((e.clientX/innerWidth-.3)*14);ry(-(e.clientY/innerHeight-.4)*10)},{passive:true});
    chars.forEach(function(c){c.addEventListener('mouseenter',function(){if(tl.isActive())return;gsap.fromTo(c,{scale:1.35,y:-12,rotationZ:gsap.utils.random(-12,12)},{scale:1,y:0,rotationZ:0,duration:.8,ease:'elastic.out(1.1,.4)',overwrite:'auto'})})})}
}catch(e){fail()}
}
(document.fonts&&document.fonts.ready?Promise.race([document.fonts.ready,new Promise(function(r){setTimeout(r,1400)})]):Promise.resolve()).then(function(){requestAnimationFrame(go)});
})();
