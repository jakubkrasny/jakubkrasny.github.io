/* Everbot chat – animace rekonstrukce aplikace. Klidný režim / bez JS = statický konečný stav. */
(function(){
  'use strict';
  var root=document.documentElement;
  var calm=function(){return root.classList.contains('calm')||matchMedia('(prefers-reduced-motion: reduce)').matches};
  var SCRIPTS={
    hero:[
      {p:null,m:'claude',n:'Claude 5.5 Sonnet',a:null},
      {p:'Napiš follow-up e-mail po schůzce s potenciálním klientem. Shrň, na čem jsme se domluvili, a navrhni další krok.',m:'openai',n:'GPT-6.2 Sol',
       a:'<p><strong>Předmět:</strong> Děkuji za schůzku – shrnutí a další krok</p><p>Dobrý den,</p><p>děkuji za dnešní čas a otevřený rozhovor. Pro přehled posílám, na čem jsme se shodli:</p><ul><li>hlavní cíl je zrychlit odpovídání na poptávky</li><li>začneme menším pilotem v jednom týmu</li><li>výsledky společně vyhodnotíme, než se rozhodnete o dalším postupu</li></ul><p><strong>Další krok:</strong> do konce týdne vám pošlu návrh pilotu. Hodí se vám krátký hovor příští týden?</p><p>S pozdravem</p>'},
      {p:'Připrav inzerát na pozici obchodního zástupce. Krátce, lidsky a s jasným popisem, co bude dělat.',m:'gemini',n:'Gemini 3.1 Pro',
       a:'<p><strong>Hledáme obchodního zástupce / zástupkyni</strong></p><p>Baví vás jednat s lidmi a dotahovat věci do konce? Přidejte se k nám.</p><p><strong>Co budete dělat</strong></p><ul><li>starat se o stávající zákazníky a hledat nové</li><li>připravovat nabídky a vést obchodní jednání</li><li>spolupracovat s marketingem na kampaních</li></ul><p><strong>Co nabízíme</strong></p><ul><li>samostatnou práci a férové jednání</li><li>zaškolení a podporu týmu</li></ul><p>Pošlete nám krátký životopis a pár vět o sobě.</p>'}
    ],
    show:[{p:null,m:'claude',n:'Claude 5.5 Sonnet',a:null,picker:'Gemini 3.1 Pro'}]
  };
  function wrapWords(md){
    var walker=document.createTreeWalker(md,NodeFilter.SHOW_TEXT,null),nodes=[],n;
    while((n=walker.nextNode()))if(n.nodeValue.trim())nodes.push(n);
    nodes.forEach(function(t){
      var parts=t.nodeValue.split(/(\s+)/),f=document.createDocumentFragment();
      parts.forEach(function(s){if(!s)return;if(/^\s+$/.test(s)){f.appendChild(document.createTextNode(s))}else{var sp=document.createElement('span');sp.className='w';sp.textContent=s;f.appendChild(sp)}});
      t.parentNode.replaceChild(f,t)});
    return [].slice.call(md.querySelectorAll('.w'));
  }
  function App(el){
    var q=function(s){return el.querySelector(s)};
    var kind=el.getAttribute('data-eba'),thread=q('.eba-thread'),typed=q('.eba-typed'),userP=q('.eba-user p'),md=q('.eba-md'),
        pillT=q('.eba-pill span'),pillM=q('.eba-pill use'),send=q('.eba-send'),mp=q('.eba-mp'),mpT=q('.eba-mp-t'),mpIc=q('.eba-mp-ic'),
        cursor=q('.eba-cursor'),rows=[].slice.call(el.querySelectorAll('.eba-pk-r'));
    var scripts=SCRIPTS[kind]||SCRIPTS.hero;
    scripts.forEach(function(s){if(!s.p)s.p=userP.textContent;if(!s.a)s.a=md.innerHTML});
    var mpOrig=mpIc.innerHTML;
    // statický konečný stav: posunout vlákno dolů, ať je vidět celá odpověď
    function settle(){thread.scrollTop=thread.scrollHeight}
    if(calm()){settle();return}
    // hodiny, které běží jen když je okno vidět
    var clock=0,last=0,visible=false,waiters=[],raf=0,scrollT=0,gen=0;
    function tick(t){if(!last)last=t;var dt=Math.min(250,t-last);last=t;clock+=dt;
      for(var i=waiters.length-1;i>=0;i--)if(clock>=waiters[i].at){var w=waiters.splice(i,1)[0];w.fn()}
      var cur=thread.scrollTop;if(Math.abs(scrollT-cur)>.5)thread.scrollTop=cur+(scrollT-cur)*.16;
      raf=visible?requestAnimationFrame(tick):0}
    function wait(ms){var g=gen;return new Promise(function(res,rej){waiters.push({at:clock+ms,fn:function(){g===gen?res():rej('x')}})})}
    function start(){if(!raf){last=0;raf=requestAnimationFrame(tick)}}
    new IntersectionObserver(function(es){visible=es[0].isIntersecting&&!document.hidden;if(visible)start()},{rootMargin:'80px'}).observe(el);
    document.addEventListener('visibilitychange',function(){visible=!document.hidden&&visible;if(!document.hidden){var r=el.getBoundingClientRect();visible=r.bottom>0&&r.top<innerHeight;if(visible)start()}});
    function cls(c,on){el.classList.toggle(c,on)}
    function follow(node){var tr=thread.getBoundingClientRect(),nr=node.getBoundingClientRect();var need=nr.bottom-tr.bottom+28;if(need>0)scrollT=Math.min(thread.scrollHeight-thread.clientHeight,thread.scrollTop+need)}
    function moveCursor(target,dx,dy){var er=el.getBoundingClientRect(),r=target.getBoundingClientRect();
      cursor.style.transform='translate('+(r.left-er.left+(dx||r.width*.5))+'px,'+(r.top-er.top+(dy||r.height*.55))+'px)'}
    function setModel(use,name){pillM.setAttribute('href','#em-'+use);pillT.textContent=name}
    function reset(){
      ['st-sent','st-ans','st-done','is-think','is-picker','has-text','is-typing','is-fade'].forEach(function(c){cls(c,false)});
      cls('st-empty',true);typed.textContent='';thread.scrollTop=0;scrollT=0;
      mpT.textContent='Auto-model';mpIc.innerHTML=mpOrig;
      rows.forEach(function(r,i){r.classList.toggle('on',i===0)});
      if(cursor)cursor.style.opacity=0;
    }
    el.classList.add('is-anim');
    var idx=0;
    async function run(){
      var s=scripts[idx%scripts.length];idx++;
      reset();userP.textContent=s.p;md.innerHTML=s.a;var words=wrapWords(md);setModel(s.m,s.n);
      await wait(kind==='hero'?900:1200);
      cls('is-typing',true);
      for(var c=1;c<=s.p.length;c++){typed.textContent=s.p.slice(0,c);if(c===1)cls('has-text',true);await wait(s.p[c-1]===' '?38:22+Math.random()*30)}
      await wait(450);cls('is-typing',false);
      send.classList.add('is-press');await wait(160);send.classList.remove('is-press');
      typed.textContent='';cls('has-text',false);cls('st-empty',false);cls('st-sent',true);
      await wait(550);cls('st-ans',true);cls('is-think',true);
      await wait(1100);cls('is-think',false);
      var blocks=[];
      for(var i=0;i<words.length;i++){var w=words[i];w.classList.add('on');var li=w.closest('li');if(li&&!li.classList.contains('on'))li.classList.add('on');
        if(i%3===0)follow(w);await wait(32+Math.random()*44+(/[.:,]$/.test(w.textContent)?90:0))}
      await wait(250);cls('st-done',true);follow(q('.eba-act'));
      if(s.picker&&rows.length){
        await wait(1500);
        cursor.style.transition='none';moveCursor(q('.eba-act'),40,-10);cursor.offsetWidth;cursor.style.transition='';cursor.style.opacity=1;
        await wait(60);moveCursor(mp);await wait(950);mp.classList.add('is-press');await wait(180);mp.classList.remove('is-press');
        cls('is-picker',true);await wait(900);
        var target=rows.filter(function(r){return r.getAttribute('data-m')===s.picker})[0]||rows[2];
        var tour=rows.slice(1,Math.max(2,rows.indexOf(target)));
        for(var h=0;h<tour.length;h++){moveCursor(tour[h],60);tour[h].classList.add('is-hover');await wait(650);tour[h].classList.remove('is-hover')}
        moveCursor(target,60);await wait(800);rows.forEach(function(r){r.classList.toggle('on',r===target)});await wait(1400);
        cls('is-picker',false);mpT.textContent=s.picker;mpIc.innerHTML='<svg class="mi"><use href="#em-'+(target.getAttribute('data-ic')||'openai')+'"/></svg>';
        moveCursor(mp);await wait(1100);cursor.style.opacity=0;await wait(1600);
      }else{await wait(3600)}
      cls('is-fade',true);await wait(600);
      run().catch(function(){});
    }
    run().catch(function(){});
  }
  function init(){[].forEach.call(document.querySelectorAll('[data-eba]'),App)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
