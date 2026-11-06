/* Sdílené pomůcky pro úvodní efekty 3-5 (rozdělení nadpisu na písmena, "difuzní" zaostření fotky z šumu). */
window.FXL={
split:function(h1){
  h1.setAttribute('aria-label',h1.textContent.replace(/\s+/g,' ').trim());
  var tw=document.createTreeWalker(h1,NodeFilter.SHOW_TEXT),nodes=[],n;while(n=tw.nextNode())nodes.push(n);
  nodes.forEach(function(node){var parts=node.nodeValue.split(/(\s+)/),frag=document.createDocumentFragment();
    parts.forEach(function(p){if(!p)return;if(/^\s+$/.test(p)){frag.appendChild(document.createTextNode(' '));return}
      var w=document.createElement('span');w.className='fxw';w.setAttribute('aria-hidden','true');
      p.split('').forEach(function(c){var s=document.createElement('span');s.className='fxch';s.dataset.c=c;s.textContent=c;w.appendChild(s)});frag.appendChild(w)});
    node.parentNode.replaceChild(frag,node)});
  return [].slice.call(h1.querySelectorAll('.fxch'));
},
splitWords:function(el){
  var t=el.textContent.replace(/\s+/g,' ').trim();el.setAttribute('aria-label',t);el.textContent='';
  return t.split(' ').map(function(w,i){var s=document.createElement('span');s.className='fxtok';s.setAttribute('aria-hidden','true');s.textContent=(i?' ':'')+w;el.appendChild(s);return s});
},
denoise:function(ph,img){
  var r=ph.getBoundingClientRect(),pw=Math.round(r.width)||400,pH=Math.round(r.height)||500;
  var pc=document.createElement('canvas');pc.className='fxpix';pc.width=pw;pc.height=pH;ph.appendChild(pc);
  var px=pc.getContext('2d'),ok=img&&img.complete&&img.naturalWidth;
  var tiles=[];for(var k=0;k<4;k++){var t=document.createElement('canvas');t.width=t.height=160;var tc=t.getContext('2d'),id=tc.createImageData(160,160),d=id.data;
    for(var i=0;i<d.length;i+=4){var v=Math.random()*255;d[i]=v*(.7+Math.random()*.6);d[i+1]=v;d[i+2]=v*(.7+Math.random()*.6);d[i+3]=255}tc.putImageData(id,0,0);tiles.push(t)}
  var off=document.createElement('canvas');
  function draw(p){px.globalAlpha=1;px.clearRect(0,0,pw,pH);
    if(ok){var iw=img.naturalWidth,ih=img.naturalHeight,sc=Math.max(pw/iw,pH/ih),dw=iw*sc,dh=ih*sc,dx=(pw-dw)/2,dy=(pH-dh)/2;
      var s=Math.min(1,.03+Math.pow(p,2.2)*.97),sw=Math.max(3,Math.round(pw*s)),sh=Math.max(3,Math.round(pH*s));
      off.width=sw;off.height=sh;off.getContext('2d').drawImage(img,dx*s,dy*s,dw*s,dh*s);
      px.imageSmoothingEnabled=true;px.imageSmoothingQuality='high';px.drawImage(off,0,0,sw,sh,0,0,pw,pH)}
    else{px.fillStyle='#0b0e1d';px.fillRect(0,0,pw,pH)}
    var a=Math.pow(1-p,1.4)*.92;
    if(a>.01){px.globalAlpha=a;var tl=tiles[Math.floor(Math.random()*4)],ox=-Math.floor(Math.random()*160),oy=-Math.floor(Math.random()*160);
      for(var x=ox;x<pw;x+=160)for(var y=oy;y<pH;y+=160)px.drawImage(tl,x,y);px.globalAlpha=1}}
  return {canvas:pc,draw:draw,remove:function(){pc.remove()}};
}
};
