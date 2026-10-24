/* Úvodní efekt: výbuch ze středu fotky, ze kterého se poskládá jméno. Částice odskakují od kurzoru. */
(function(){
var D=document.documentElement;if(!D.classList.contains('fx'))return;
var hero=document.querySelector('.hero'),h1=hero&&hero.querySelector('h1'),photo=hero&&hero.querySelector('.hero-photo'),htext=hero&&hero.querySelector('.hero-text');
function fail(){D.classList.add('fx-done');if(hero)hero.classList.add('nm-on')}
if(!hero||!h1||!photo||!window.gsap||scrollY>240){fail();return}
D.classList.add('fx-ok');
var touch=matchMedia('(hover: none)').matches,dpr=Math.min(2,window.devicePixelRatio||1);
var cv=document.createElement('canvas');cv.className='fxcv';hero.appendChild(cv);var ctx=cv.getContext('2d');
var W=0,H=0,P=[],N=0,base={x:0,y:0},step=3,box={x:0,y:0,w:0,h:0};
var X,Y,TX,TY,VX,VY,DL,CL;
var mode='intro',t0=0,mx=-999,my=-999,lastNear=0,run=false,dirty=false,ox=0,oy=0;

function rel(){var r=hero.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height}}
function sample(){
  var hr=rel();W=Math.round(hr.w);H=Math.round(hr.h);cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
  var words=[],tw=document.createTreeWalker(h1,NodeFilter.SHOW_TEXT),n,minx=1e9,miny=1e9,maxx=0,maxy=0;
  while(n=tw.nextNode()){var re=/\S+/g,m;while(m=re.exec(n.nodeValue)){var r=document.createRange();r.setStart(n,m.index);r.setEnd(n,m.index+m[0].length);var b=r.getClientRects()[0];if(!b)continue;
    var pe=n.parentElement,cs=getComputedStyle(pe),fill=cs.webkitTextFillColor,col=(pe.classList.contains('g')||!fill||fill==='rgba(0, 0, 0, 0)')?(pe.classList.contains('g')?'#2ef379':cs.color):fill;
    if(!pe.classList.contains('g')&&(col==='rgba(0, 0, 0, 0)'||col==='transparent'))col='#f4f6ff';
    words.push({t:m[0],x:b.left-hr.x,y:b.top-hr.y,w:b.width,h:b.height,font:cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily,ls:cs.letterSpacing,fs:parseFloat(cs.fontSize),col:col,g:pe.classList.contains('g')});
    minx=Math.min(minx,b.left-hr.x);miny=Math.min(miny,b.top-hr.y);maxx=Math.max(maxx,b.right-hr.x);maxy=Math.max(maxy,b.bottom-hr.y)}}
  if(!words.length)throw new Error('no words');
  var pad=12;minx=Math.max(0,Math.floor(minx-pad));miny=Math.max(0,Math.floor(miny-pad));maxx=Math.min(W,Math.ceil(maxx+pad));maxy=Math.min(H,Math.ceil(maxy+pad));
  box={x:minx,y:miny,w:maxx-minx,h:maxy-miny};
  var oc=document.createElement('canvas');oc.width=box.w;oc.height=box.h;var o=oc.getContext('2d',{willReadFrequently:true});o.textBaseline='alphabetic';
  words.forEach(function(w){o.font=w.font;if('letterSpacing' in o&&w.ls&&w.ls!=='normal')o.letterSpacing=w.ls;o.fillStyle=w.col;
    var asc=w.fs*0.80,y=w.y+(w.h-w.fs*1.0)/2+asc;o.fillText(w.t,w.x-box.x,y-box.y)});
  var s=step=Math.max(3,Math.round(Math.min(box.w,900)/230));
  var img,pts;
  for(;;){img=o.getImageData(0,0,box.w,box.h).data;pts=[];
    for(var yy=0;yy<box.h;yy+=s)for(var xx=0;xx<box.w;xx+=s){var i=(yy*box.w+xx)*4;if(img[i+3]>140)pts.push(xx,yy,(img[i+1]-img[i]>50&&img[i]<140)?1:0)}
    if(pts.length/3>(touch?3600:7000)){s++;continue}break}
  step=s;N=pts.length/3;
  X=new Float32Array(N);Y=new Float32Array(N);TX=new Float32Array(N);TY=new Float32Array(N);VX=new Float32Array(N);VY=new Float32Array(N);DL=new Float32Array(N);CL=new Uint8Array(N);
  for(var k=0;k<N;k++){TX[k]=box.x+pts[k*3]+s/2;TY[k]=box.y+pts[k*3+1]+s/2;CL[k]=pts[k*3+2]}
  var h1r=h1.getBoundingClientRect();base={x:h1r.left-hr.x,y:h1r.top-hr.y};
}
function origin(){var hr=rel(),pr=photo.getBoundingClientRect();return {x:pr.left-hr.x+pr.width/2,y:pr.top-hr.y+pr.height/2}}
function burst(){
  var og=origin();
  for(var k=0;k<N;k++){X[k]=og.x+(Math.random()-.5)*10;Y[k]=og.y+(Math.random()-.5)*10;var a=Math.random()*6.2832,sp=(5+Math.random()*24)*(touch?.7:1);VX[k]=Math.cos(a)*sp;VY[k]=Math.sin(a)*sp;DL[k]=.34+Math.random()*.55}
}
function place(){for(var k=0;k<N;k++){X[k]=TX[k];Y[k]=TY[k];VX[k]=VY[k]=0;DL[k]=0}}
var K=.052,DMP=.82,R=touch?90:120;
function frame(now){
  if(!run)return;
  var hr=h1.getBoundingClientRect(),hh=hero.getBoundingClientRect();ox=hr.left-hh.left-base.x;oy=hr.top-hh.top-base.y;
  var al=1;if(htext){var op=gsap.getProperty(htext,'opacity');if(op!==undefined&&op!==null)al=+op}
  var t=mode==='intro'?(now-t0)/1000:99,moving=0,mxl=mx-ox,myl=my-oy;
  for(var k=0;k<N;k++){
    var vx=VX[k],vy=VY[k],x=X[k],y=Y[k];
    if(t<DL[k]){x+=vx;y+=vy;vx*=.955;vy*=.955}
    else{vx=(vx+(TX[k]-x)*K)*DMP;vy=(vy+(TY[k]-y)*K)*DMP;x+=vx;y+=vy}
    var dx=x-mxl,dy=y-myl,d2=dx*dx+dy*dy;
    if(d2<R*R){var d=Math.sqrt(d2)||1,f=(1-d/R);f=f*f*9;vx+=dx/d*f;vy+=dy/d*f}
    VX[k]=vx;VY[k]=vy;X[k]=x;Y[k]=y;
    if(Math.abs(TX[k]-x)+Math.abs(TY[k]-y)>1.2||vx*vx+vy*vy>.5)moving++
  }
  ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=al;
  var sz=mode==='intro'&&t<1.6?Math.max(2,step*.85):step*.92;
  for(var c=0;c<2;c++){ctx.fillStyle=c?'#2ef379':'#f4f6ff';ctx.beginPath();
    for(var k2=0;k2<N;k2++){if(CL[k2]!==c)continue;ctx.rect(X[k2]+ox-sz/2,Y[k2]+oy-sz/2,sz,sz)}ctx.fill()}
  ctx.globalAlpha=1;
  if(mode==='intro'&&t>2.5&&moving<N*.02){settle();return}
  if(mode==='active'){var near=mxl>box.x-40&&mxl<box.x+box.w+40&&myl>box.y-40&&myl<box.y+box.h+40;if(near)lastNear=now;
    if(!moving&&now-lastNear>500){rest();return}}
  requestAnimationFrame(frame)
}
function settle(){mode='rest';hero.classList.add('nm-on');cv.style.opacity=0;run=false;D.classList.add('fx-done')}
function rest(){mode='rest';hero.classList.add('nm-on');cv.style.opacity=0;run=false}
function activate(){
  if(mode!=='rest')return;
  if(dirty){try{sample()}catch(e){return}dirty=false}
  place();mode='active';hero.classList.remove('nm-on');cv.style.opacity=1;lastNear=performance.now();run=true;requestAnimationFrame(frame)
}
function onMove(e){
  var hh=hero.getBoundingClientRect();mx=e.clientX-hh.left;my=e.clientY-hh.top;
  if(mode==='rest'||mode==='active'){var hr=h1.getBoundingClientRect(),inx=e.clientX>hr.left-20&&e.clientX<hr.right+20&&e.clientY>hr.top-20&&e.clientY<hr.bottom+20;if(inx&&mode==='rest')activate()}
}
addEventListener('pointermove',onMove,{passive:true});
addEventListener('pointerdown',onMove,{passive:true});
var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){dirty=true;if(mode==='rest'){}},300)});

function start(){
  try{sample()}catch(err){fail();return}
  var og=origin();
  var bomb=document.createElement('div');bomb.className='fxbomb';bomb.style.left=og.x+'px';bomb.style.top=og.y+'px';
  var flash=document.createElement('div');flash.className='fxflash';flash.style.setProperty('--ox',og.x+'px');flash.style.setProperty('--oy',og.y+'px');
  hero.appendChild(bomb);hero.appendChild(flash);
  var rings=[0,1,2].map(function(){var r=document.createElement('div');r.className='fxring';r.style.left=og.x+'px';r.style.top=og.y+'px';hero.appendChild(r);return r});
  var rest_items=[].slice.call(htext?htext.children:[]).filter(function(e){return e!==h1}).concat([].slice.call(hero.querySelectorAll('.scroll-cue')));
  gsap.set(bomb,{xPercent:-50,yPercent:-50,scale:0,opacity:0});
  var tl=gsap.timeline({onComplete:function(){bomb.remove();flash.remove();rings.forEach(function(r){r.remove()});gsap.set(photo,{clearProps:'clipPath,filter'})}});
  tl.to(bomb,{scale:1,opacity:1,duration:.5,ease:'power2.in'},.25)
    .to(bomb,{scale:2.4,duration:.22,ease:'power3.in'},.75)
    .add(function(){mode='intro';t0=performance.now();burst();run=true;requestAnimationFrame(frame)},.98)
    .to(bomb,{scale:14,opacity:0,duration:.45,ease:'power3.out'},.98)
    .fromTo(flash,{opacity:1},{opacity:0,duration:.9,ease:'power2.out'},.98)
    .fromTo(hero,{x:0,y:0},{x:function(){return gsap.utils.random(-9,9)},y:function(){return gsap.utils.random(-6,6)},duration:.045,repeat:9,yoyo:true,ease:'none',onComplete:function(){gsap.set(hero,{x:0,y:0,clearProps:'transform'})}},.98)
    .fromTo(photo,{opacity:1,clipPath:'circle(0% at 50% 50%)',scale:1.5,filter:'blur(22px) brightness(2.4)'},{clipPath:'circle(78% at 50% 50%)',scale:1,filter:'blur(0px) brightness(1)',duration:1.3,ease:'power3.out'},.98);
  rings.forEach(function(r,i){tl.fromTo(r,{xPercent:-50,yPercent:-50,scale:0,opacity:.95},{scale:[22,34,48][i],opacity:0,duration:1.2+i*.2,ease:'power2.out'},.98+i*.12)});
  tl.fromTo(rest_items,{opacity:0,y:34},{opacity:1,y:0,duration:.85,stagger:.13,ease:'power3.out'},2.1);
  setTimeout(function(){if(mode==='intro'&&!run){fail()}},6000);
}
var go=function(){requestAnimationFrame(start)};
if(document.fonts&&document.fonts.ready){var done=false;var f=function(){if(done)return;done=true;go()};document.fonts.ready.then(f);setTimeout(f,1400)}else go();
})();
