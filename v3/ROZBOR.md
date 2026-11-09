# Rozbor v3 proti živému webu

Druhé kolo: stránka má být na videohovoru „raketa“. Živý web, `/v2/`, nábor, akce ani CNAME jsem neměnil. Stránka má `noindex,nofollow`. Nadpis, fakta, citace a Cal.com zůstávají. Přibyl pohyb, karusely, podpisový efekt a vedení k rezervaci.

## Volba barev

Zkoušel jsem čistě tmavou plochu (minulé kolo) i světlé plochy značky. Čistá tma působila jako prázdná díra a bílý text se v ní ztrácel. Čistě světlá stránka by zabila hloubku fotek z pódia a světelný efekt. Nejsilnější je rytmus, ne kompromis uprostřed:

- **Námořnická `#00072D`** na úvodu a na velké videorecenzi. Tam žije podpisový efekt a Jakubova fotka.
- **Zelená `#15DD58`** na tlačítkách, maskotovi a světlech efektu. Stejná jako v karuselech Everbotu. Text na světlé ploše je tmavší zelená, ať se dá číst.
- **Světlé plochy** (`#f4fbf6`, bílé karty, mátový pruh) na číslech, postupu, cílových skupinách, referencích, otázkách a rezervaci.
- Písmo pořád DM Sans, logo pořád to opravdové (fialový wordmark + maskot, bílá kapsle).

Na hovoru tedy nejdřív uvidí tmavý, světelný úvod s fotkou. Pak se stránka otevře do světlé značky. Kalendář je tmavý widget uprostřed světlé sekce, ať se v něm dá vybírat.

## Podpisový efekt místo hvězdiček

Hvězdné pozadí ze živého webu tam není. Místo něj je **Mátový proud**: vlastní WebGL shader. Základ je námořnická, přes ni jdou dva proudy (mátový `#15DD58` a fialový odstín z loga). Není to pole teček. Vypadá to jako tkanina, která se skládá. Myš proud ohne, scroll posune vrstvy do hloubky. Když je v záběru rezervace, efekt ztlumí a zpomalí, ať nesežere výkon kalendáře a nic nepřekrývá (plátno má `pointer-events: none` a je pod obsahem). Na mobilu jsou tři oktávy šumu místo pěti a nižší rozlišení. Když WebGL není, úvod spadne na statický námořnicko-zelený přechod, ne na hvězdy.

V pozadí světlých sekcí je jemná vrstva maskota Everbotu. Na úvodu je maskot živý, u fotky, s bublinou „Ahoj, vítejte v Everbotu!“.

## Efekt, který jste chtěl zpátky

- Úvodní efekt 4: okno Everbotu, psaní zadání, přepínání GPT / Claude / Gemini / Nano Banana, fotka se skládá ze šumu. Scroll zůstává normální. Když člověk sjede dřív, efekt se vzdá a text je hned vidět. Žádný skok přes zatmění, žádné znovunačtení stránky nahoře.
- Karusely u příkladů, cílových skupin, důvodů Everbotu, citací, videí a médií. Šipky, pauza pod myší, na telefonu se to dá táhnout. Svislý scroll se nebere.
- Běžící pás modelů a značek.
- Světlo na kartách a jemný posun tlačítek pod kurzorem. Žádné lasery přes text a žádné modré kolečko.
- Sekce při příjezdu lehce najedou. Čísla se dopočítají na konečnou hodnotu, která už na stránce je.

## Jak to vede k rezervaci

Pořadí je příběh, ne seznam sekcí: nabídka a citace Petry hned u tlačítka, čísla, kde utíká čas, co se stane na hovoru, konkrétní minuty, pro koho a proč Everbot, kdo jste, důkazy, videa, média, otázky, dobrovolná registrace, kalendář. U kalendáře je věta Ondřeje Krenka a připomínka, že termín platí až po vašem telefonu. Lepící tlačítko „Rezervovat konzultaci“ se schová, jakmile je kalendář v záběru, ať ho nezakryje. Žádný odpočet, žádný vymyšlený počet míst.

## Cílové skupiny a video

Podnikatel, freelancer a tvůrce obsahu mají nové krajinky z Everbotu (`img/podnikatel.webp`, `img/freelancer.webp`, `img/tvurce-obsahu.webp`). Pořád je u nich text „Ilustrace Everbotu“, nejsou to klienti. Marketér a vzdělávání zůstávají u starších výřezů. `img/pozadi-everbot.webp` je jemný podklad velké videorecenze, pod tmavým nádechem, ať text zůstane čitelný. Obrázky z LinkedIn na webu nejsou.

Videorecenze jsou vpředu: velký Adam Filip s plakátem a přehráním na klik, pod tím karusel zbylých (Martin Tyšer, Jakub Fröhlich, Ondřej Holubec) a souhrnné video. YouTube se načte až po kliknutí.

## Kam vložit avatar video

Sekce „Proč já“, prvek `#avatar-jakub` v `v3/index.html`. Dokud jsou `data-src` a `data-yt` prázdné, návštěvník vidí jen vaši fotku. Žádné „brzy“ a žádné mrtvé tlačítko.

- Soubor: `data-src="video/jakub.mp4"` a soubor dejte do `/v3/video/jakub.mp4`.
- YouTube: `data-yt="ID"` (jen těch 11 znaků).

Jedna z těch dvou hodnot stačí. Skript v `v3/fx.js` (`setupAvatar`) z toho udělá přehrávač.

## Co je lepší

**Struktura.** Pořadí je nabídka, čísla, co se stane na hovoru a jak se termín domlouvá, příklady „z hodin minuty“, pro koho, proč Everbot, Jakub, reference s případovkami a videi, média, novinky, registrace zdarma, kalendář. Postup rezervace je hned pod úvodem. Na živém webu je až nad kalendářem. To byl i postřeh Anety.

**Nadpis.** Živý web má v H1 jen „Jakub Krásný“. v3 nechává nadpis z v2: „Ukážu vám, jak AI ve vaší firmě ušetří čas i peníze.“ Pod ním je, pro koho to je a že ukázka je živě, včetně třetího slibu z původního textu (lepší výsledky).

**Výzva k akci.** Jedno znění, „Rezervovat konzultaci“, v hlavičce, v úvodu, po postupu a po referencích. Všechno jen odscrolluje na kalendář. Živý web střídá čtyři různá znění a na rezervaci umí skočit přes zatmění. To jste označil za nepřirozené.

**Text.** První osoba, věty z dnešního webu. Žádné nové sliby, žádná nová jména, žádná nová čísla. Citace, Westlogic, Fexi a Foa, videa i značky jsou doslova.

**Hierarchie a mobil.** Jedno H1, sekce mají H2. Na telefonu je text a tlačítko nad fotkou. Stránka se do strany neroztahuje (`overflow-x: clip`), karusel se posouvá jen ve svém pásu.

**Rychlost a přístupnost.** Lighthouse proti lokálnímu serveru, se zpomalením sítě (9. 11. 2026):

| | Výkon | Přístupnost | Best practices | FCP | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|
| Desktop | 86 | 100 | 100 | 0,9 s | 2,4 s | 0 ms | 0,006 |
| Mobil | 99 | 100 | 100 | 0,9 s | 2,2 s | 0 ms | 0,034 |

Živý web ve stejném běhu měřený nebyl. Rozdíl je v tom, že v3 nenačítá GSAP, ScrollTrigger ani úvodní efekt a fotky jsou v AVIF/WebP. Kontrast, pořadí nadpisů, názvy odkazů i title u iframe prošly. Je tam skip link, focus stav a vypnutí animací při `prefers-reduced-motion`. Cal.com se na desktopu i mobilu načetl: listopad 2026, month view, „Requires confirmation“, stejná URL včetně `theme=dark` a `attendeePhoneNumber=+420`.

## Co zůstalo

Everbot barvy (`#2ef379`), DM Sans, logo i s „Vyrobeno v Česku“. Stejná událost Cal.com. Telefon +420 733 173 863 a jakub.krasny@everbot.ai. Věta, že termín je závazný až po potvrzení a že předtím zavoláte. Registrace zdarma na app.everbot.ai, schválně až pod referencemi, ať nepřebije hovor. Odkaz na everbot.ai/recenze. Weby U Matušků a TMJ Aviation. Novinky z `news.json`: na Pages si v3 bere kořenový soubor, který aktualizuje stávající akce, takže akci není třeba měnit.

## Co jsem vyhodil

V prvním kole jsem efekty sundal. V tomhle kole jsou zpátky, ale bez připnutých scén a bez skoku přes zatmění na kalendář. To pořád nechci, působilo to nepřirozeně. Tlačítko jen odscrolluje.

Cílové skupiny **E-shopy** a **Města a obce**. V chatu jste je nechtěl jmenovat, mělo to být univerzální. Nechal jsem podnikatele, marketéry, freelancery, tvůrce obsahu a vzdělávání v původním znění. „e-shop U Matušků“ a „CSO, e-shopy Fexi a Foa“ zůstávají, to jsou označení klientů, ne cílová skupina. Jedna novinka Everbotu má v titulku „pro e-shopy“. Je to jejich titulek, nepřepisoval jsem ho.

Nábor, LinkedIn u referencí, odkaz na Google recenze, řeznictví i jakákoli jiná předchozí práce. Dekorativní fotky cizích lidí u cílových skupin. Aneta u nich nepoznala, kdo to je.

## Co musíte rozhodnout

1. **Hlavní fotka.** Pořád je to pódiový snímek s mikrofonem. Maskot Everbotu je u ní zpátky, menší, ať nezakryje obličej. Až budete chtít jinou fotku, stačí poslat 3–5 záběrů.
2. **Druhá fotka** je ze sálu a je na ní i druhý člověk. Popisek je stejný jako dnes: „Jakub Krásný přednáší“. Potvrďte, že tam může být.
3. **45 vs. 60 minut.** Web říká 60 minut, stejně jako dnes a podle vašeho „dej to na hodinu“. Cal.com u události ukazuje 45 minut. Sjednotit to v Cal.com, ne větou na webu.
4. **25 % a 3×** jsou v horním pruhu i v případovce Westlogic. Nechal jsem obojí, jak to živý web má. Řekněte, jestli horní pruh je číslo celé platformy, nebo jen Westlogic. Stejně vedle sebe zůstalo „100+ nástrojů“, „přes 20 nástrojů a 60 modelů“ a „+ 100 dalších“. Nic jsem neslučoval, ať se to nerozbije.
5. **4,7 z 5** je hodnocení na everbot.ai, ne na Googlu. Google jsem nepropojil.
6. Odkaz na tmj-aviation.cz je na dnešním webu. V README je poznámka, že nebyl ověřený.
7. Nad kalendář jsem přidal větu: „Schůzka se do kalendáře zapíše, teprve až ji potvrdím.“ Je to totéž, co už dělá Cal.com. Když ji nechcete veřejně, smaže se jedna věta.
8. V úvodu jsem čip „Česká podpora“ vyměnil za „Nejdřív vám zavolám“. Česká podpora zůstává v důvodech, proč Everbot. Hovor před schůzkou je důležitější očekávání.

Až budete chtít v3 na hlavní adrese, řekněte. Do té doby je to jen `/v3/`.
