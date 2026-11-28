/* Everbot chat – animace rekonstrukce aplikace. Klidný režim / bez JS = statický konečný stav. */
(function(){
  'use strict';
  var root=document.documentElement;
  var calm=function(){return root.classList.contains('calm')||matchMedia('(prefers-reduced-motion: reduce)').matches};
  var SCRIPTS={
    hero:[
      {p:null,m:'claude',n:'Claude 5.5 Sonnet',a:null},
      {p:'Tady jsou moje poznámky ze schůzky s klientem. Udělej z nich stručný zápis a seznam úkolů: kdo co a do kdy.',m:'openai',n:'GPT-6.2 Sol',
       a:'<p><strong>Zápis ze schůzky</strong></p><ul><li>Klient chce zrychlit odpovídání na poptávky.</li><li>Dohodli jsme menší pilot v jednom týmu.</li><li>Výsledky vyhodnotíme společně před dalším rozhodnutím.</li></ul><p><strong>Úkoly</strong></p><ul><li><strong>Obchod:</strong> poslat návrh pilotu, do konce týdne</li><li><strong>Klient:</strong> určit tým a kontaktní osobu</li><li><strong>Marketing:</strong> připravit podklady k představení, do středy</li></ul>'},
      {p:'Zítra mám první schůzku s novým klientem. Na co se ho zeptat, abych poznal, kde mu utíká nejvíc času?',m:'gemini',n:'Gemini 3.1 Pro',
       a:'<p><strong>Otázky na první schůzku</strong></p><ul><li>Které úkoly se vám ve firmě opakují každý týden?</li><li>Co vás z nich nejvíc zdržuje nebo otravuje?</li><li>Kdo je dělá a kolik lidí se na nich střídá?</li><li>Jaké nástroje dnes používáte a co v nich chybí?</li><li>Co byste si přáli mít hotové dřív, než si sednete k počítači?</li></ul><p>Na závěr si shrňte tři nejčastější úkoly a navrhněte, který zkusit jako první.</p>'},
      {p:'Přepiš tenhle text v našem Hlasu značky, ať zní lidsky a bez korporátních frází: „Dovolujeme si Vás informovat o možnosti využití našich služeb.“',m:'grok',n:'Grok 4.3',
       a:'<p><strong>Ve stylu vaší značky</strong></p><p>Dobrý den, rádi vám ukážeme, jak by vám naše služby mohly ušetřit práci. Stačí odpovědět a domluvíme krátký hovor.</p><p><strong>Kratší varianta</strong></p><p>Ozvěte se, ukážeme vám, jak na to.</p>'}
    ],
    show:[
      {p:null,m:'claude',n:'Claude 5.5 Sonnet',a:null,picker:'Gemini 3.1 Pro'},
      {p:'Napiš popis produktu do e-shopu: ručně vyrobený keramický hrnek. Tři věty, hřejivý tón, bez klišé.',m:'openai',n:'GPT-6.2 Sol',picker:'Claude 5.5 Sonnet',
       a:'<p><strong>Ručně vyrobený keramický hrnek</strong></p><p>Každý hrnek vzniká na hrnčířském kruhu, a tak není dvakrát stejný. Sedne vám do dlaně a udrží teplo čaje nebo kávy déle, než čekáte. Je to malý rituál, který si zasloužíte každé ráno.</p>'}
    ]
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
