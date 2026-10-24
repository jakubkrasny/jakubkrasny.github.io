/* Načte vybraný úvodní efekt. Náhled: přidej k adrese ?efekt=1, ?efekt=2 nebo ?efekt=3. Bez parametru se použije výchozí. */
(function(){
var DEFAULT='1';
var q=new URLSearchParams(location.search).get('efekt');var n=/^[1-9]$/.test(q||'')?q:DEFAULT;
var cs=document.currentScript,src=cs?cs.src:'';var v=(src.match(/\?v=\w+/)||[''])[0];
var s=document.createElement('script');s.src=src.replace(/fx\.js.*$/,'fx/efekt-'+n+'.js')+v;
s.onerror=function(){var d=document.documentElement;d.classList.add('fx-done');var h=document.querySelector('.hero');h&&h.classList.add('nm-on')};
document.head.appendChild(s);
})();
