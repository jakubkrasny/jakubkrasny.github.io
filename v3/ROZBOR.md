# Rozbor v3 proti živému webu

v3 je klidná prodejní stránka. V první obrazovce je vidět, kdo Jakub je, co firma dostane a jak si domluvit hodinu zdarma. Živý web pořád začíná velkým jménem a efekty. v2 nadpis opravilo, ale pořád je to tentýž efektový web. Tohle je verze na porovnání, ne přepnutí. Živý web, `/v2/`, nábor, akce ani CNAME jsem neměnil. Stránka má `noindex,nofollow`.

## Co je lepší

**Struktura.** Pořadí je nabídka, čísla, co se stane na hovoru a jak se termín domlouvá, příklady „z hodin minuty“, pro koho, proč Everbot, Jakub, reference s případovkami a videi, média, novinky, registrace zdarma, kalendář. Postup rezervace je hned pod úvodem. Na živém webu je až nad kalendářem. To byl i postřeh Anety.

**Nadpis.** Živý web má v H1 jen „Jakub Krásný“. v3 nechává nadpis z v2: „Ukážu vám, jak AI ve vaší firmě ušetří čas i peníze.“ Pod ním je, pro koho to je a že ukázka je živě, včetně třetího slibu z původního textu (lepší výsledky).

**Výzva k akci.** Jedno znění, „Rezervovat konzultaci“, v hlavičce, v úvodu, po postupu a po referencích. Všechno jen odscrolluje na kalendář. Živý web střídá čtyři různá znění a na rezervaci umí skočit přes zatmění. To jste označil za nepřirozené.

**Text.** První osoba, věty z dnešního webu. Žádné nové sliby, žádná nová jména, žádná nová čísla. Citace, Westlogic, Fexi a Foa, videa i značky jsou doslova.

**Hierarchie a mobil.** Jedno H1, sekce mají H2. Reference nejsou karusel, čísla se nepočítají animací. Na telefonu je text a tlačítko nad fotkou. Na šířkách 390 px a 320 px stránka nepřetéká do strany.

**Rychlost a přístupnost.** Lighthouse proti lokálnímu serveru, se zpomalením sítě (9. 11. 2026):

| | Výkon | Přístupnost | Best practices | FCP | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|
| Desktop | 86 | 100 | 100 | 0,9 s | 2,4 s | 0 ms | 0,006 |
| Mobil | 99 | 100 | 100 | 0,9 s | 2,2 s | 0 ms | 0,034 |

Živý web ve stejném běhu měřený nebyl. Rozdíl je v tom, že v3 nenačítá GSAP, ScrollTrigger ani úvodní efekt a fotky jsou v AVIF/WebP. Kontrast, pořadí nadpisů, názvy odkazů i title u iframe prošly. Je tam skip link, focus stav a vypnutí animací při `prefers-reduced-motion`. Cal.com se na desktopu i mobilu načetl: listopad 2026, month view, „Requires confirmation“, stejná URL včetně `theme=dark` a `attendeePhoneNumber=+420`.

## Co zůstalo

Everbot barvy (`#2ef379`), DM Sans, logo i s „Vyrobeno v Česku“. Stejná událost Cal.com. Telefon +420 733 173 863 a jakub.krasny@everbot.ai. Věta, že termín je závazný až po potvrzení a že předtím zavoláte. Registrace zdarma na app.everbot.ai, schválně až pod referencemi, ať nepřebije hovor. Odkaz na everbot.ai/recenze. Weby U Matušků a TMJ Aviation. Novinky z `news.json`: na Pages si v3 bere kořenový soubor, který aktualizuje stávající akce, takže akci není třeba měnit.

## Co jsem vyhodil

Efekty: úvodní animace, kurzor, připnuté scény, magnetická tlačítka, karusely, běžící pás modelů, maskot s bublinou přes fotku. Efekty máte rád, zároveň jste řekl, že skok na kalendář působí neodladěně, a Aneta že je toho moc. v3 je ta klidná varianta. Živý web o efekty nepřišel.

Cílové skupiny **E-shopy** a **Města a obce**. V chatu jste je nechtěl jmenovat, mělo to být univerzální. Nechal jsem podnikatele, marketéry, freelancery, tvůrce obsahu a vzdělávání v původním znění. „e-shop U Matušků“ a „CSO, e-shopy Fexi a Foa“ zůstávají, to jsou označení klientů, ne cílová skupina. Jedna novinka Everbotu má v titulku „pro e-shopy“. Je to jejich titulek, nepřepisoval jsem ho.

Nábor, LinkedIn u referencí, odkaz na Google recenze, řeznictví i jakákoli jiná předchozí práce. Dekorativní fotky cizích lidí u cílových skupin. Aneta u nich nepoznala, kdo to je.

## Co musíte rozhodnout

1. **Hlavní fotka.** Pořád je to pódiový snímek s mikrofonem, který se vám nelíbil. Je jen klidněji oříznutý, bez maskota. Až budete chtít jinou, stačí poslat 3–5 fotek.
2. **Druhá fotka** je ze sálu a je na ní i druhý člověk. Popisek je stejný jako dnes: „Jakub Krásný přednáší“. Potvrďte, že tam může být.
3. **45 vs. 60 minut.** Web říká 60 minut, stejně jako dnes a podle vašeho „dej to na hodinu“. Cal.com u události ukazuje 45 minut. Sjednotit to v Cal.com, ne větou na webu.
4. **25 % a 3×** jsou v horním pruhu i v případovce Westlogic. Nechal jsem obojí, jak to živý web má. Řekněte, jestli horní pruh je číslo celé platformy, nebo jen Westlogic. Stejně vedle sebe zůstalo „100+ nástrojů“, „přes 20 nástrojů a 60 modelů“ a „+ 100 dalších“. Nic jsem neslučoval, ať se to nerozbije.
5. **4,7 z 5** je hodnocení na everbot.ai, ne na Googlu. Google jsem nepropojil.
6. Odkaz na tmj-aviation.cz je na dnešním webu. V README je poznámka, že nebyl ověřený.
7. Nad kalendář jsem přidal větu: „Schůzka se do kalendáře zapíše, teprve až ji potvrdím.“ Je to totéž, co už dělá Cal.com. Když ji nechcete veřejně, smaže se jedna věta.
8. V úvodu jsem čip „Česká podpora“ vyměnil za „Nejdřív vám zavolám“. Česká podpora zůstává v důvodech, proč Everbot. Hovor před schůzkou je důležitější očekávání.

Až budete chtít v3 na hlavní adrese, řekněte. Do té doby je to jen `/v3/`.
