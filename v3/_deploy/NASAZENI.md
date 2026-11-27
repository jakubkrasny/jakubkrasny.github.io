# Nasazení v3 (až po schválení Jakubem)

Nic z toho se nedělá bez Jakubova výslovného „ano“ (náhled) a „přepni“ (hlavní adresa).

## Krok A – náhled na jakubkrasny.cz/v3/ (po schválení plánu)
1. Do `main` přenést jen složku `v3/` z větve `v3-redesign` (domovská stránka, `/v2/`, `/nabor/` beze změny):
   `git checkout main && git pull && git checkout origin/v3-redesign -- v3 && git commit -m "Náhled v3 na /v3/ (noindex)" && git push`
2. Ověřit https://jakubkrasny.cz/v3/ a https://jakubkrasny.cz/v3/soukromi/ (obě mají `noindex`).
3. Před zveřejněním odkazu komukoli dalšímu doplnit v `v3/soukromi/index.html` všechna pole `[DOPLNIT]` a `[OVĚŘIT]`.

## Krok B – Cal.com (dělá Jakub ve svém účtu, nebo s ním)
- Událost `jakub-krasny-yqwrbf/konzultace`: délka **45 → 60 minut**. Buffery (dnes 45 před + 45 po) zvážit podle toho, kolik času má zůstat blokované.
- Zkontrolovat název a popis události („Hodinová online konzultace zdarma…“) – musí sedět s 60 minutami.
- Zkontrolovat potvrzovací e-mail z Apps Scriptu (`processCalMails`), že neuvádí 45 minut.
- Web má v embedu `hideEventTypeDetails: true`, takže délku z Cal.com návštěvník v kalendáři nevidí; v e-mailech a na cal.com stránce ji ale uvidí.

## Krok C – přepnutí na hlavní adresu (až Jakub řekne „přepni“)
1. Zálohovat současný kořen do větve, např. `zaloha-2026-MM-DD-pred-v3`.
2. Obsah `v3/` zkopírovat do kořene (cesty jsou relativní, fungují i v kořeni). `nabor/`, `CNAME`, `.nojekyll`, workflow novinek ponechat.
3. V kořenovém `index.html` a `soukromi/index.html`: smazat `<meta name="robots" content="noindex,nofollow">`, odkomentovat `<link rel="canonical" href="https://jakubkrasny.cz/">`, `og:url`, `og:image` a `"image"` v JSON-LD (Person) změnit z `/v3/` na kořen.
4. Do kořene dát `_deploy/robots.txt` a `_deploy/sitemap.xml`. Složku `_deploy/` z kořene nenasazovat.
5. Workflow „Aktualizace novinek“ zapisuje jen `news.json` v kořeni. Nová v3 sekci novinek nemá, takže workflow nic nerozbije; po přepnutí ho lze vypnout (zbytečné denní commity).
6. Po nasazení: Google Search Console + Seznam Webmaster, odeslat sitemapu.
