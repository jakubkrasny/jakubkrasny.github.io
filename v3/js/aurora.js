/* Aurora – celostránkový WebGL shader v barvách Everbotu (bez knihoven).
   Hedvábné světelné stuhy (mint → modrá → fialová) přes tmavé pozadí, jemně uhýbají kurzoru.
   Výkon: render v nižším rozlišení, pauza na skryté záložce, žádné readPixels. */
(function(){
  'use strict';
  var root=document.documentElement;
  var wrap=document.querySelector('.aurora'), cv=document.getElementById('aurora');
  var api={shift:0,target:0,boost:0,boostTarget:0,scroll:0,ready:false,setTarget:function(v){api.target=v},setBoost:function(v){api.boostTarget=v},frame:function(){}};
  window.Aurora=api;
  if(!cv) return;
  if(root.classList.contains('calm')) return; /* CSS gradient stačí; shader se nekompiluje */
  var started=false;
  function boot(){
    if(started)return;started=true;
    startGL();
  }
  api.start=boot;
  /* Kompilace shaderu je na softwarovém GPU drahá — až po prvním vykreslení textu (LCP),
     nebo hned při pohybu myši / scrollu, ať pozadí přijde, jakmile ho návštěvník „aktivuje“. */
  function arm(){
    var go=function(){requestAnimationFrame(function(){setTimeout(boot,0)})};
    addEventListener('pointerdown',go,{once:true,passive:true});
    addEventListener('pointermove',go,{once:true,passive:true});
    addEventListener('scroll',go,{once:true,passive:true});
    addEventListener('keydown',go,{once:true,passive:true});
    addEventListener('touchstart',go,{once:true,passive:true});
    /* Bez časového spouštěče: kompilace shaderu je dlouhý úkol a nesmí zdržet LCP.
       CSS gradient je vidět hned; živá aurora naskočí při prvním pohybu nebo scrollu. */
  }
  if(document.readyState==='complete')arm();else addEventListener('load',arm);
  function startGL(){
  var gl=cv.getContext('webgl',{antialias:false,alpha:false,depth:false,stencil:false,powerPreference:'low-power',preserveDrawingBuffer:false});
  if(!gl) return;

  var vs='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var fs=[
  'precision highp float;',
  'uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform float uShift;uniform float uScroll;uniform float uBoost;',
  // 3D simplex noise (Ashima / Stefan Gustavson, MIT)
  'vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}',
  'vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}',
  'float snoise(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}',
  'vec3 pal(float t){t=fract(t);vec3 a=vec3(.18,.953,.475);vec3 a2=vec3(.373,1.,.612);vec3 b=vec3(0.,.588,.914);vec3 c=vec3(.729,.251,1.);',
  ' if(t<.25)return mix(a2,a,t*4.);if(t<.5)return mix(a,b,(t-.25)*4.);if(t<.75)return mix(b,c,(t-.5)*4.);return mix(c,a2,(t-.75)*4.);}',
  'float ribbon(vec2 p,float off,float amp,float fr,float ph,float t){',
  ' float y=off+amp*sin(p.x*fr+ph+t)+.18*snoise(vec3(p.x*.7,ph,t*.6));',
  ' return abs(p.y-y);}',
  'void main(){',
  ' vec2 uv=gl_FragCoord.xy/uRes;float asp=uRes.x/uRes.y;vec2 p=(uv-.5)*vec2(asp,1.);',
  ' float t=uTime*.07;',
  ' vec2 m=(uMouse-.5)*vec2(asp,1.);float md=length(p-m);',
  ' p+=(p-m)*.10*exp(-md*md*5.);',
  ' p.y+=uScroll*.35;',
  ' vec2 q=vec2(snoise(vec3(p*.5,t*.5)),snoise(vec3(p*.5+vec2(4.1,1.7),t*.55)));',
  ' vec2 r=p+q*.35;',
  ' vec3 col=vec3(.010,.014,.026);',
  // barevné mlhy (mint vlevo nahoře, modrá vpravo, fialová dole)
  ' vec2 b1=vec2(-.55*asp+.25*sin(t*.9),.38+.1*cos(t*.7));vec2 b2=vec2(.45*asp+.2*cos(t*.6),.15+.15*sin(t*.8));vec2 b3=vec2(.1*asp+.3*sin(t*.5),-.55+.1*cos(t));',
  ' float n=snoise(vec3(r*1.2,t))*.15;float pk=.5+.5*clamp(asp,.45,1.);',
  ' col+=pk*pal(.18+uShift)*.26*exp(-pow(length(r-b1)+n,2.)*2.6);',
  ' col+=pk*pal(.46+uShift)*.24*exp(-pow(length(r-b2)+n,2.)*2.6);',
  ' col+=pk*pal(.70+uShift)*.30*exp(-pow(length(r-b3)+n,2.)*2.4);',
  // hedvábné stuhy (vlnité oblouky jako na pozadí Everbotu)
  ' for(int i=0;i<4;i++){float fi=float(i);',
  '  float d=ribbon(r,-.35+fi*.26,.22+.06*fi,1.1+.25*fi,fi*1.9,t*(1.+.2*fi));',
  '  float w=.006+.004*fi;',
  '  float core=w/(d+w*.6);float glow=exp(-d*7.)*.22;',
  '  float along=.5+.5*sin(r.x*1.3+fi+t*1.4);',
  '  vec3 c=pal(.08+fi*.17+uShift+r.x*.12+along*.2);',
  '  float fade=smoothstep(-.9*asp,.2,r.x+.6*sin(t+fi))*(.55+.45*along);',
  '  col+=c*(core*.55+glow)*fade*(1.+uBoost*.35);}',
  // jemná zrnitá „mlha“ ze šumu
  ' float f=snoise(vec3(r*2.2,t*1.3));col+=pal(.3+f*.3+uShift)*pow(max(f,0.),3.)*.08;',
  ' col+=pal(.2+uShift)*.08*exp(-md*md*4.);',
  ' float v=smoothstep(1.35,.3,length((uv-.5)*vec2(1.,1.2)));col*=.6+.4*v;',
  ' col=col/(1.+col*.45);',
  ' float g=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233))+uTime)*43758.5453);col+=(g-.5)*.02;',
  ' gl_FragColor=vec4(col,1.);',
  '}'].join('\n');

  function sh(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.warn(gl.getShaderInfoLog(s));return null}return s}
  var v=sh(gl.VERTEX_SHADER,vs),f=sh(gl.FRAGMENT_SHADER,fs);if(!v||!f)return;
  var pr=gl.createProgram();gl.attachShader(pr,v);gl.attachShader(pr,f);gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return;
  gl.useProgram(pr);
  var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  var loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  var U={};['uRes','uTime','uMouse','uShift','uScroll','uBoost'].forEach(function(n){U[n]=gl.getUniformLocation(pr,n)});

  var mobile=matchMedia('(max-width: 860px), (hover: none)').matches;
  var scale=mobile?0.42:0.55;
  var W=0,H=0;
  function resize(){
    var dpr=Math.min(window.devicePixelRatio||1,2);
    W=Math.max(2,Math.round(innerWidth*dpr*scale));H=Math.max(2,Math.round(innerHeight*dpr*scale));
    cv.width=W;cv.height=H;gl.viewport(0,0,W,H);gl.uniform2f(U.uRes,W,H);
  }
  resize();
  var rT;addEventListener('resize',function(){clearTimeout(rT);rT=setTimeout(resize,120)});

  var mx=.5,my=.6,tmx=.5,tmy=.6;
  addEventListener('pointermove',function(e){tmx=e.clientX/innerWidth;tmy=1-e.clientY/innerHeight},{passive:true});

  var start=performance.now(),last=start,running=true,frames=0,slow=0;
  function calm(){return root.classList.contains('calm')}
  function draw(now){
    var t=(now-start)/1000;
    mx+=(tmx-mx)*.04;my+=(tmy-my)*.04;
    api.shift+=(api.target-api.shift)*.03;
    api.boost+=(api.boostTarget-api.boost)*.04;
    gl.uniform1f(U.uTime,calm()?12.0:t);
    gl.uniform2f(U.uMouse,mx,my);
    gl.uniform1f(U.uShift,api.shift);
    gl.uniform1f(U.uScroll,api.scroll);
    gl.uniform1f(U.uBoost,api.boost);
    gl.drawArrays(gl.TRIANGLES,0,3);
  }
  function loop(now){
    if(!running)return;
    // automatické snížení rozlišení na slabém zařízení
    if(mobile&&now-last<30){requestAnimationFrame(loop);return}  // ~30 fps na mobilu
    var dt=now-last;last=now;frames++;
    if(frames>20&&frames<200){if(dt>40)slow++;if(slow>25&&scale>0.3){scale=0.3;resize();slow=-999}}
    draw(now);
    if(!calm())requestAnimationFrame(loop);else running=false;
  }
  api.frame=function(){draw(performance.now())};
  api.wake=function(){if(!running&&!calm()&&!document.hidden){running=true;last=performance.now();requestAnimationFrame(loop)}else if(calm()){draw(performance.now())}};
  document.addEventListener('visibilitychange',function(){if(document.hidden){running=false}else api.wake()});
  addEventListener('scroll',function(){api.scroll=scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight);if(calm())draw(performance.now())},{passive:true});

  function go(){draw(performance.now());wrap.classList.add('is-live');api.ready=true;if(!calm())requestAnimationFrame(loop);else running=false}
  go();
  } /* startGL */
})();
