/* Částicový portrét pro sekci „Kdo jsem“ (koncept C).
   Z obrázku (data-src) se navzorkují body; při vjetí do sekce se složí z rozptýleného „prachu“,
   kurzor je odhrnuje, mint → modrá → fialová podle výšky a jasu. Bez WebGL / v klidné verzi je vidět jen fotka. Po složení částic se fotka odkryje. */
(function(){
  'use strict';
  window.Portrait={init:init};
  function init(cv){
    if(!cv||cv.dataset.ready)return null;cv.dataset.ready='1';
    var gl=cv.getContext('webgl',{antialias:false,alpha:true,premultipliedAlpha:false,powerPreference:'low-power'});
    if(!gl)return null;
    var fig=cv.closest('.portrait');
    var root=document.documentElement;
    var mobile=matchMedia('(max-width: 860px), (hover: none)').matches;
    var COLS=mobile?110:170;
    var img=new Image();img.decoding='async';
    var state={prog:0,target:0,mouse:[9,9],mouseOn:0,tmouse:[9,9],count:0,running:false,visible:false,t0:performance.now()};

    var vs=[
      'attribute vec2 aPos;attribute vec3 aD;',
      'uniform float uTime,uProg,uSize,uMouseOn;uniform vec2 uMouse,uAsp;',
      'varying float vL;varying float vY;varying float vK;varying float vF;',
      'void main(){',
      ' vec2 home=aPos;',
      ' vec2 sc=vec2(sin(aD.y*91.7+1.3),cos(aD.z*47.3+.7))*vec2(1.3,1.1)+vec2(0.,-.2);',
      ' float k=clamp(uProg*1.6-aD.y*.6,0.,1.);k=k*k*(3.-2.*k);',
      ' vec2 p=mix(sc,home,k);',
      ' p+=.004*vec2(sin(uTime*1.2+aD.y*30.),cos(uTime*1.05+aD.z*30.));',
      ' vec2 d=(p-uMouse)*uAsp;float dist=length(d);',
      ' float f=uMouseOn*smoothstep(.32,0.,dist);',
      ' p+=normalize(d+1e-5)/uAsp*f*.16;',
      ' gl_Position=vec4(p,0.,1.);',
      ' gl_PointSize=uSize*(.55+aD.x*.85)*(1.+f*1.2);',
      ' vL=aD.x;vY=home.y;vK=k;vF=f;',
      '}'].join('\n');
    var fs=[
      'precision mediump float;varying float vL;varying float vY;varying float vK;varying float vF;uniform float uTime;',
      'void main(){vec2 c=gl_PointCoord-.5;float r=length(c);if(r>.5)discard;float a=smoothstep(.5,.1,r);',
      ' vec3 mint=vec3(.37,1.,.61);vec3 blue=vec3(0.,.59,.91);vec3 vio=vec3(.73,.25,1.);',
      ' float y=vY*.5+.5;vec3 col=mix(vio,blue,smoothstep(.0,.45,y));col=mix(col,mint,smoothstep(.4,.95,y));',
      ' col=mix(col,vec3(1.),pow(vL,3.)*.55+vF*.4);',
      ' gl_FragColor=vec4(col,a*(.25+vL*.85)*mix(.35,1.,vK));}'].join('\n');
    function sh(t,s){var o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)){console.warn(gl.getShaderInfoLog(o));return null}return o}
    var pr=gl.createProgram(),v=sh(gl.VERTEX_SHADER,vs),f=sh(gl.FRAGMENT_SHADER,fs);if(!v||!f)return null;
    gl.attachShader(pr,v);gl.attachShader(pr,f);gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return null;
    gl.useProgram(pr);
    var U={};['uTime','uProg','uSize','uMouseOn','uMouse','uAsp'].forEach(function(n){U[n]=gl.getUniformLocation(pr,n)});
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    gl.clearColor(0,0,0,0);

    var W=1,H=1,dpr=1;
    function resize(){dpr=Math.min(devicePixelRatio||1,2);var r=cv.getBoundingClientRect();W=Math.max(2,Math.round(r.width*dpr));H=Math.max(2,Math.round(r.height*dpr));cv.width=W;cv.height=H;gl.viewport(0,0,W,H);gl.uniform2f(U.uAsp,W/H,1);gl.uniform1f(U.uSize,Math.max(1.6,(r.width/COLS)*dpr*1.25))}

    function build(){
      var iw=img.naturalWidth,ih=img.naturalHeight,cols=COLS,rows=Math.round(cols*ih/iw);
      var oc=document.createElement('canvas');oc.width=cols;oc.height=rows;var cx=oc.getContext('2d',{willReadFrequently:true});
      cx.drawImage(img,0,0,cols,rows);var d=cx.getImageData(0,0,cols,rows).data;
      var r=cv.getBoundingClientRect(),boxAsp=r.width/r.height,imgAsp=iw/ih;
      // obrázek „contain“, zarovnaný dolů
      var sx,sy;if(imgAsp>boxAsp){sx=1;sy=boxAsp/imgAsp}else{sy=1;sx=imgAsp/boxAsp}
      var pos=[],dat=[];
      for(var y=0;y<rows;y++)for(var x=0;x<cols;x++){
        var i=(y*cols+x)*4,a=d[i+3]/255;if(a<.45)continue;
        var l=(d[i]*.299+d[i+1]*.587+d[i+2]*.114)/255;if(l<.06)continue;
        var jx=(Math.random()-.5)/cols,jy=(Math.random()-.5)/rows;
        pos.push(((x/cols+jx)*2-1)*sx,(1-(y/rows+jy)*2)*sy-(1-sy));
        dat.push(l,Math.random(),Math.random());
      }
      state.count=pos.length/2;
      var b1=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b1);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pos),gl.STATIC_DRAW);
      var l1=gl.getAttribLocation(pr,'aPos');gl.enableVertexAttribArray(l1);gl.vertexAttribPointer(l1,2,gl.FLOAT,false,0,0);
      var b2=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b2);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(dat),gl.STATIC_DRAW);
      var l2=gl.getAttribLocation(pr,'aD');gl.enableVertexAttribArray(l2);gl.vertexAttribPointer(l2,3,gl.FLOAT,false,0,0);
      fig&&fig.classList.add('is-gl');
      kick();
    }
    function draw(now){
      var calm=root.classList.contains('calm');
      if(calm){state.prog=1;state.mouseOn=0}
      else{state.prog+=(state.target-state.prog)*.035}
      state.mouse[0]+=(state.tmouse[0]-state.mouse[0])*.12;state.mouse[1]+=(state.tmouse[1]-state.mouse[1])*.12;
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(U.uTime,calm?0:(now-state.t0)/1000);gl.uniform1f(U.uProg,state.prog);
      gl.uniform2f(U.uMouse,state.mouse[0],state.mouse[1]);gl.uniform1f(U.uMouseOn,state.mouseOn);
      gl.drawArrays(gl.POINTS,0,state.count);
      // jakmile se částice složí, odkryje se pod nimi skutečná fotka (viz CSS .is-formed)
      if(!state.formed&&state.prog>.88&&fig){state.formed=true;fig.classList.add('is-formed')}
    }
    function loop(now){if(!state.running)return;draw(now);if(root.classList.contains('calm')){state.running=false;return}requestAnimationFrame(loop)}
    function kick(){if(!state.count)return;if(root.classList.contains('calm')){draw(performance.now());return}if(!state.running&&state.visible){state.running=true;requestAnimationFrame(loop)}}
    var io=new IntersectionObserver(function(es){es.forEach(function(e){state.visible=e.isIntersecting;if(e.isIntersecting){state.target=1;kick()}else{state.running=false}})},{threshold:.15});
    io.observe(cv);
    cv.parentNode.addEventListener('pointermove',function(e){var r=cv.getBoundingClientRect();state.tmouse=[(e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2];state.mouseOn=1});
    cv.parentNode.addEventListener('pointerleave',function(){state.mouseOn=0;state.tmouse=[9,9]});
    var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){resize();},150)});
    resize();
    img.onload=build;img.src=cv.dataset.src;
    return {kick:kick};
  }
})();
