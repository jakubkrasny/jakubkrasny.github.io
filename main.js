
// interactive Everbot demo
(function(){
var tabs=document.querySelectorAll('.tab'),pt=document.getElementById('ptext'),out=document.getElementById('out');if(!tabs.length)return;
var timers=[],cur='chat',user=false,reduceM=matchMedia('(prefers-reduced-motion: reduce)').matches;
function clr(){timers.forEach(clearTimeout);timers=[]}
function at(f,ms){timers.push(setTimeout(f,ms))}
function type(el,txt,speed,done){var i=0;(function step(){el.textContent=txt.slice(0,i);if(i++<txt.length)at(step,reduceM?0:speed);else done&&done()})()}
var D={
chat:{p:'Napiš krátký e-mail klientovi, který se mi dva týdny neozval.',run:function(){out.innerHTML='<div class="reply" id="rp"></div>';var t='Dobrý den,\n\nrád bych se připomněl s naší poslední domluvou. Pokud se vám změnily priority, klidně mi dejte vědět, přizpůsobím návrh. Stačí krátká odpověď a domluvíme termín, který vám vyhovuje.\n\nS pozdravem';type(document.getElementById('rp'),t,16)}},
img:{p:'Vytvoř tři bannery na jarní akci, výrazné, v odstínech značky.',run:function(){out.innerHTML='<div class="gen"><span>Generuji…</span><div class="bar"><i id="pb"></i></div></div><div class="bnr"><div class="bn" style="background:linear-gradient(135deg,#2ef379,#0b6b45);color:#00210f">Jarní akce<small>Sleva až 20 %</small></div><div class="bn" style="background:linear-gradient(135deg,#7c5cff,#1d135e);color:#fff">Nová kolekce<small>Již v prodeji</small></div><div class="bn" style="background:linear-gradient(135deg,#ffb86b,#ff6f61);color:#2a0d00">Jen tento týden<small>Doprava zdarma</small></div></div>';var pb=document.getElementById('pb');at(function(){pb.style.transition='width 1.6s ease';pb.style.width='100%'},50);document.querySelectorAll('.bn').forEach(function(b,i){at(function(){b.classList.add('in')},1500+i*450)})}},
vid:{p:'Udělej 10sekundové video: produkt na dřevěném stole, jemný pohyb kamery.',run:function(){out.innerHTML='<div class="gen"><span>Vytvářím video…</span><div class="bar"><i id="pb"></i></div></div><div class="vid"><b>▶</b><div class="tl"><i id="tl"></i></div></div>';var pb=document.getElementById('pb'),tl=document.getElementById('tl');at(function(){pb.style.transition='width 1.6s ease';pb.style.width='100%'},50);at(function(){tl.style.transition='width 7s linear';tl.style.width='100%'},1800)}},
aud:{p:'Namluv text: „Vítejte u nás, rádi vám pomůžeme.“ Přirozený ženský hlas, česky.',run:function(){out.innerHTML='<div class="gen"><span>Hlas: přirozená čeština</span></div><div class="wave">'+new Array(48).join('<u></u>')+'</div>'}}
};
function show(k){clr();cur=k;tabs.forEach(function(t){var on=t.dataset.t===k;t.classList.toggle('on',on);t.setAttribute('aria-selected',on)});out.innerHTML='';pt.textContent='';type(pt,D[k].p,reduceM?0:28,function(){at(D[k].run,300)});}
tabs.forEach(function(t){t.addEventListener('click',function(){user=true;show(t.dataset.t)})});
var started=false,order=['chat','img','vid','aud'];
function loop(){if(user)return;var n=order[(order.indexOf(cur)+1)%4];show(n);at(loop,11000)}
var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting&&!started){started=true;show('chat');if(!reduceM)at(loop,11000)}})},{threshold:.35});io.observe(document.getElementById('aplikace'));
})();

// audience + reasons tabs
(function(){
var A=[["Podnikatelé","Získejte zpět svůj čas a nechte rutinu na AI."],["E-shopy","Produktové popisky a fotky, které okamžitě prodávají."],["Marketéři","Spusťte marketingové kampaně 10× rychleji než konkurence."],["Freelanceři","Zvládněte více zakázek v prémiové kvalitě a s menším úsilím."],["Tvůrci obsahu","Nekonečná inspirace pro vaše videa, podcasty a sociální sítě."],["Města a obce","Komunikujte s občany rychleji a efektivněji. Fungujte jako profesionální úřad i s malým týmem."],["Vzdělávání","Ušetřete čas na přípravu a věnujte ho žákům."]];
var R=[["1","Jedna AI platforma","Jedna platba, jeden login. Přes 20 špičkových AI nástrojů a 60 modelů na jednom místě."],["Pár kliknutí","Jednoduchost na prvním místě","Pracovat v Everbotu se naučí každý na pár kliknutí."],["Školení","Naučíme vás AI používat","Video návody, webináře a online živé workshopy s AI odborníky."],["Desítky hodin","Ušetříte čas měsíčně","Everbot vyřeší během minut to, co by vám trvalo hodiny."],["Česky","Česká zákaznická podpora","Přístup k podpoře na e-mailu a telefonu."]];
function wire(sel,panel,fn,data){var bs=document.querySelectorAll(sel);function set(k){bs.forEach(function(b){b.classList.toggle('on',b.dataset.k==k)});panel.classList.add('sw');setTimeout(function(){fn(data[k]);panel.classList.remove('sw')},180)}bs.forEach(function(b){b.addEventListener('click',function(){set(b.dataset.k)})});fn(data[0])}
var ap=document.getElementById('audPanel');if(ap)wire('.ct',ap,function(d){document.getElementById('audH').textContent=d[1].split('. ')[0].replace(/\.$/,'')+'.';document.getElementById('audP').textContent=d[1].split('. ').slice(1).join('. ')||'Na konzultaci vám ukážu, jak přesně.'},A);
var rv=document.getElementById('rview');if(rv)wire('.rs',rv,function(d){document.getElementById('rn').textContent=d[0];document.getElementById('rh').textContent=d[1];document.getElementById('rp2').textContent=d[2]},R);
})();
