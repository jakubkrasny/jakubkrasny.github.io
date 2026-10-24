/* Načte vybraný úvodní efekt. Náhled: přidej k adrese ?efekt=1 až ?efekt=5. Bez parametru se použije výchozí. */
(function(){
var DEFAULT='4';
var q=new URLSearchParams(location.search).get('efekt');var n=/^[1-9]$/.test(q||'')?q:DEFAULT;
var cs=document.currentScript,src=cs?cs.src:'';var v=(src.match(/\?v=\w+/)||[''])[0];var base=src.replace(/fx\.js.*$/,'fx/');
function add(u,cb,err){var s=document.createElement('script');s.src=base+u+v;s.onload=cb;s.onerror=err||cb;document.head.appendChild(s)}
function fail(){var d=document.documentElement;d.classList.add('fx-done');var h=document.querySelector('.hero');h&&h.classList.add('nm-on')}
add('lib.js',function(){add('efekt-'+n+'.js',function(){},fail)});add('page.js',function(){});
})();
