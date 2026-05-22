---
title: "Dátový sklad, OLTP a ROLAP"
description: "Dátový sklad, OLTP a ROLAP: distilled must-know exam answer."
tags:
  - pis
  - must-know
---

# Dátový sklad, OLTP a ROLAP

**Frekvencia/signál:** 3x ROLAP/star/snowflake, 1x DWH, plus recent DWH

**Plná téma:** [olap kocky datovy sklad](../topics/olap-kocky-datovy-sklad)

## Otázka 1: Definujte dátový sklad a porovnajte ho s OLTP.

### Intuícia

- OLTP je každodenná prevádzka systému.
- Dátový sklad je oddelený priestor na analýzu a históriu.
- DWH je optimalizovaný na čítanie a rozhodovanie, nie na rýchle transakčné zápisy.

### Krátka odpoveď

Dátový sklad je oddelené analytické úložisko na podporu rozhodovania. Oproti OLTP neoptimalizuje operatívne transakcie, ale historické čítanie, integráciu zdrojov a agregované analytické dotazy.

### Čo napísať na skúške

- DWH je subjektovo orientovaný, integrovaný, historický a nemenný/read-only.
- OLTP rieši aktuálne operácie, zápisy, zmeny a konzistenciu prevádzky.
- DWH sa periodicky dopĺňa cez ETL.
- DWH typicky obsahuje aktuálne aj historické údaje.

### Diagram / obrázok / kód

![Architektúra dátového skladu](../assets/images/past-image21.png)

### Pozor na pasce

- DWH nie je obyčajná produkčná databáza; pointa je analytika a história.


---

## Otázka 2: Charakterizujte OLAP a ROLAP. Ako sa ukladá do relačnej DB?

### Intuícia

- OLAP je analytický pohľad nad dátami.
- ROLAP tento pohľad skladá z relačných tabuliek.
- Hľadaj faktovú tabuľku v strede a dimenzie okolo nej.

### Krátka odpoveď

OLAP slúži na analytické spracovanie a podporu rozhodovania. ROLAP necháva dáta v relačných tabuľkách, ale používateľovi ich prezentuje ako multidimenzionálny pohľad.

### Čo napísať na skúške

- ROLAP používa relačné alebo rozšírené relačné SŘBD.
- Dáta sú uložené ako tabuľky faktov a tabuľky dimenzií.
- Výhoda ROLAP: menšia redundancia a dobrá škálovateľnosť.
- Nevýhoda: zložitejšie dotazy a potreba agregačnej logiky.

### Diagram / obrázok / kód

![Dátový model skladu](../assets/images/past-image22.png)

### Pozor na pasce

- ROLAP nie je vlastná multidimenzionálna štruktúra v pamäti; to je skôr MOLAP.


---

## Otázka 3: Popíšte schému hviezdy a vločky.

### Intuícia

- Hviezda je jednoduchá: fakty v strede, dimenzie okolo.
- Vločka normalizuje dimenzie do ďalších tabuliek.
- Hviezda sa ľahšie dotazuje, vločka lepšie modeluje hierarchie.

### Krátka odpoveď

Hviezda má jednu centrálnu tabuľku faktov a okolo nej tabuľky dimenzií. Vločka je zjemnenie hviezdy, kde sú hierarchie dimenzií normalizované do viacerých tabuliek.

### Čo napísať na skúške

- Tabuľka faktov obsahuje numerické miery a cudzie kľúče do dimenzií.
- Dimenzie obsahujú popisné údaje, napríklad čas, produkt, miesto.
- Hviezda je jednoduchšia a menej normalizovaná.
- Vločka lepšie reprezentuje hierarchie, ale komplikuje dotazy.

### Diagram / obrázok / kód

![Star schema](../assets/images/prep-image37.png)

![Snowflake schema](../assets/images/prep-image38.png)

![Fact constellation](../assets/images/prep-image39.png)

### Pozor na pasce

- Nezameniť vločku s konšteláciou faktov; konštelácia má viac tabuliek faktov.

