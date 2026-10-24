# Jakub Krásný – AI konzultant | Everbot

Osobní web: https://jakubkrasny.github.io (repozitář `jakubkrasny/jakubkrasny.github.io`, větev `main`, GitHub Pages zdarma).

## Stav (24. 10. 2026)
Klientská stránka + skrytá náborová stránka `nabor/` (bez odkazu z hlavního webu, `noindex`; adresa se rozdává přímo/QR).
Úvodní efekt: výchozí je efekt 4 (prompt + streamování + difuzní generování fotky). Náhled ostatních: `?efekt=1` až `?efekt=5`; výchozí se mění v `fx.js` (`DEFAULT`).
Efekty na celé stránce (`fx/page.js`): živé pozadí, ukazatel postupu, AI průvodce (jen desktop), dekódování nadpisů, světlo na kartách, magnetická tlačítka, přechod na rezervaci (krátký posun plynule, dlouhý přes zatemnění), po návratu nahoru se úvodní efekt přehraje znovu. Vše se vypne při „omezit pohyb“.
Zálohy: větve `zaloha-2026-10-24-v2`, `zaloha-2026-10-24-v3`.

## Další kroky
- Nová hlavní fotka (nahradit `img/jakub-1.jpg`, srovnat rámečky detekce v `fx/efekt-5.js`), fotky z akcí se souhlasem týmu.
- Doména jakubkrasny.cz (soubor `CNAME`, DNS u VEDOS, HTTPS), pak ověřit na telefonu.

## Struktura
- `index.html`, `nabor/index.html`, `style.css`, `main.js`, `fx.js` + `fx/` – celý web (bez frameworku; GSAP + ScrollTrigger v `vendor/`)
- `img/` – fotky Jakuba (jakub-1 úvod, jakub-2 pódium)
- `news.json` + `scripts/update_news.py` + `.github/workflows/news.yml` – denní automatická aktualizace novinek z everbot.ai/novinky
- Rezervace: Cal.com `jakub-krasny-yqwrbf/konzultace` (60 min, vyžaduje potvrzení, popisek je nastavený v Cal.com)

## Kontakt na webu
Tel. +420 733 173 863, e-mail jakub.krasny@everbot.ai

## Plán
1. Koupit doménu jakubkrasny.cz (VEDOS, cca 193,60 Kč/rok) a napojit na GitHub Pages (soubor `CNAME` + dva DNS záznamy, pak HTTPS).
2. Na stejné doméně přidat stránku pro nábor obchodníků (fotky z akcí: Frenštát pod Radhoštěm 9. 1. 2026, Futurum 8.–10. 10. 2026; potřeba souhlas týmu).
3. Ověřit odkaz na web klienta TMJ Aviation (tmj-aviation.cz byl odvozen, neověřen).

## Poznámky k designu
Tmavý Everbot vzhled (DM Sans, zelená #2ef379), maskot, efekty vázané na scroll, svícení za kurzorem. Karty „AI pro každého" a „Proč Everbot" se nepřesměrovávají, jen reagují efektem. Žádné odkazy na Google recenze ani na Jakubův LinkedIn u klientů.


## Doména (24. 10. 2026)
- Web běží na https://jakubkrasny.cz (CNAME v repozitáři, WEDOS DNS: 4× A na GitHub Pages + www CNAME, HTTPS vynucené). Skrytý nábor: /nabor/.
- Rezervace: Cal.com + Apps Script `apps-script/CalMail.gs` (časovač 5 min) → tabulka Žádosti o konzultaci z webu + uvítací e-mail.
- Prodloužení domény: WEDOS, ~194 Kč/rok.
