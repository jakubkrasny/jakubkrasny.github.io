# Jakub Krásný – AI konzultant | Everbot

Osobní web: https://jakubkrasny.github.io (repozitář `jakubkrasny/jakubkrasny.github.io`, větev `main`, GitHub Pages zdarma).

## Stav (18. 10. 2026)
Hotová verze 1 pro klienty: bezplatná 60min konzultace s rezervací přes Cal.com (každou rezervaci Jakub potvrzuje ručně a před schůzkou volá).

## Struktura
- `index.html`, `style.css`, `main.js` – celý web (bez frameworku; GSAP + ScrollTrigger v `vendor/`)
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
