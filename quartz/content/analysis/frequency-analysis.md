---
title: "Frekvenčná Analýza"
description: "Historical frequency and recent signal analysis for PIS exam topics."
tags:
  - pis
  - analysis
---

# Frekvenčná Analýza

Skóre používa historické výskyty zo súboru `PIS-najčastejšie otázky.md` a recent boost zo súboru `PIS-zbytok.md`.

## Topic ROI tabuľka

| Poradie | Téma | Base | Recent boost | ROI | Minimum |
|---:|---|---:|---:|---:|---|
| 1 | [Workflow a WfMC](topics/workflow-a-wfmc) | 15 | 5 | **20** | Definície, WfMC model, AND/XOR/OR brány. |
| 2 | [OLAP, Kocky a Dátový Sklad](topics/olap-kocky-datovy-sklad) | 13 | 5 | **18** | Kocka, agregácie, DWH vs OLTP, star/snowflake. |
| 3 | [Canvas, SVG, D3 a GeoJSON](topics/canvas-svg-d3-geojson) | 6 | 8 | **14** | Rozdiel Canvas/SVG, D3 selekcie, GeoJSON typy a knižnice. |
| 4 | [Zotaviteľné Fronty a Transakcie](topics/zotavitelne-fronty-transakcie) | 8 | 5 | **13** | Fronta, riadiaca/stavová vrstva, commit vs chain. |
| 5 | [REST, JWT, GraphQL, SOAP a WSDL](topics/rest-jwt-graphql-soap) | 6 | 5 | **11** | GraphQL vs REST, JWT časti, SOAP/WSDL/UDDI. |
| 6 | [Mikroslužby a Komunikácia](topics/mikrosluzby-komunikacia) | 4 | 5 | **9** | Monolit vs mikroslužby, 3 sync API, async broker. |
| 7 | [Gestalt, Vnímanie a Dashboardy](topics/gestalt-vnimanie-dashboardy) | 8 | 0 | **8** | Gestalt, podvedomé atribúty, bullet graf. |
| 8 | [Objektový Model, Dedičnosť a Vícetypovosť](topics/objektovy-model-dedicnost-vicetypovost) | 2 | 0 | **2** | Jednoduchá/vícenásobná dedičnosť, extent, roly. |
| 9 | [CDI a Java Backend](topics/cdi-java-backend) | 2 | 0 | **2** | DI, CDI kontajner, scopes. |

## Interpretácia

- **Workflow** je najvyšší signál: historicky 15x a znovu v oboch 2024/25 termínoch aj v riadnom 2025/2026.
- **OLAP/DWH** je druhý veľký blok: kocka, dátový sklad, OLAP operácie a DWH model sa opakujú aj v riadnom 2025/2026.
- **Canvas/SVG/D3/GeoJSON** má síce nižší historický základ, ale silný recent boost; GeoJSON sa objavil aj v riadnom 2025/2026.
- **Zotaviteľná fronta a transakcie** sú menší rozsah, ale opakovane sa vracia aspoň commit()/chain() a transakčná logika.
- **Mikroslužby** sú potvrdené aj v riadnom 2025/2026: sync rozhrania + async broker komunikácia.
- **API** ostáva pravdepodobné podľa 2024/25, najmä GraphQL a SOAP/WSDL/UDDI.

## Jednotlivé staré otázky

| Count | Otázka |
|---:|---|
| 8 | 15x WF – 8x  Definujte pojmy proces, uloha, pripad, zdroj, pracovna polozka, aktivita. Uvedte ako spolu suvisia. |
| 8 | 8x Multidimenzionalna kocka pre priemer, sucet. Definicia kocky, ar. priemeru. roll-up, drill-down, pivot, slice\&dice. |
| 6 | 6x Zotavitelna fronta. Definicia, princip, suvislost s transakciami. Popisat jej vlastnosti a operacie. Ukazat pouzitie na jednoduchom priklade. |
| 4 | 15x WF \- 4x \- Schema referencneho modelu. Nakreslit schemu, popisat prvky a rozhrania (strucne). |
| 4 | 4x Architektura IS sestávající z mikroslužeb, co to je mikrosluzba a jeji vlastnosti, porovnat s monolitickou architekturou a nakreslit priklad IS s webovym rozhrani a mikrosluzbami. |
| 4 | 4x GraphQL Co to je? V com sa lisi od REST? Popisat vlastnosti a datovy model (datove typy). Co treba definovat na klientskej a serverovej strane aby sme ho mohli pouzit? |
| 4 | 4x Gestalt principy, vyjmenovat a nakreslit a popsat (7b) |
| 3 | 3x OLAP charakteristika, ROLAP, jak se ukládá do relační DB \- schémata hvězda a vločka popsat. |
| 3 | 3x Canvas a SVG, popsat, uvest jak se vztahuji k DOM a pro vykresleni diagramu. |
| 3 | 3x Vedome vs. podvedome vnimanie. Atributy podvedomeho vnimania. Ako sa podvedome vnimanie uplatni vo vizualizacii? Ako sa podvedome vnimanie uplatni v dashboardech? |
| 2 | 15x WF \- 2x Popiste klientske a vyvolane aplikacie vo WF. Popiste aplikacne, vecne, riadace data vo WF. |
| 2 | 2x D3.js popsat, co ma na vstupu/vystupu. Uveden seznam items \= \[15,312,24124...\] a bylo potreba napsat prikaz ktery ziska nejaky seznam a nahradi jeho hodnoty s hodnotami v seznamu items. |
| 2 | 2x Autentizacia v RESTe. Preco nie je mozne pouzit sessions? Uvedte mechanizmy autentizacie pre REST. Popiste JSON Web Token, co to je, z coho sa sklada a ako prebieha autentizacia pomocou JWT. |
| 2 | 2x CDI \- Popiste CDI, ako sa definuju CDI objekty, kto ich vytvara. Popiste pojem scope v tomto kontexte, vysvetlite request, session, application scope. |
| 2 | 2x Sekvencni a hierachicke procesy a nakreslit v UML |
| 2 | 2x Zretazene procesy vs Savepointy |
| 1 | 15x WF \- 1x  Nakreslete a popište co dělají jednotlivé prvky řízení toku ve workflow: AND-split, AND-join, XOR-split, XOR-merge |
| 1 | 1x Typy geografickych grafu / vizualizace geografických dat, co je GeoJSON a použití |
| 1 | 1x dedicnost v objektovem modelu. definice jednoduche a vicenasobne dedicnosti \+ jejich grafy. |
| 1 | 1x Datový sklad \- schéma, datový model, jak se liší od OLTP |
| 1 | 1x Jak vypadá Bullet graf, co z něj lze vyčíst |
| 1 | 1x Vícetypovost \- k čemu je potřeba, jaký je s ní spojen problém, jak se řeší, uvést příklad |
| 1 | TODO \- 1x , definovat multidimenzionalni kostku, nakreslit 4D kostku pro time, item, location, supplier. Popísať kostku pro počet. |

## Recent zdroj

```text
Opravný 2024/25
Definovat datový sklad, porovnat s OLTP
GraphQL, porovnat s REST, jak je uložen
Mikroslužby, jak se liší od monolytického procesu a jak komunikují
Porovnání zřetězených transakcí s přístupem commit() a chain(), říct zda jsou dílčí transakce a celá transakce atomické a izolované
Workflow jako řádný termín akorát OR split
GeoJSON, využití, co obsahuje
SVG, popsat napsat kód krátký a říct výhody a nevýhody, říct druhý způsob(Canvas)


řádný 2024/25
Obecně definovat kostku, jak se provede součet v OLAP, definovat roll-up, drill-down, pivot a dice&slice
Webservices podle SOAP. K čemu jsou standardy WDSL a UDDI
Microservices - jaké jsou způsoby asynchornní komunikace, pomocí čeho jsou uskutečněné a přidat konkrétní co známe (asi způsoby uskutečnění)
Zotavitelná fronta - k čemu je, vypsat a popsat operace, vlastnosti a napsat jednoduchý příklad
Workflow -  k čemu slouží, jak je definovaný návrhářem a jak vypadá zobrazení; AND-split nakreslit a popsat 1 větou
Canvas - 1 věta co to je, k čemu to je + jak se liší od svg, 1 prvek z contextu a napsat jak by vypadal kód tohoto prvku
Stručně popsat D3 a napsat kód pro selekci podle id a nahrazení v <p> a dogenerování podle seznamu


Kostka - dimenze, aktivni dimenze, olap operace s kostkou
GraphQl
Mikroslužby
zotavitelná fronta
Workflow - riadne procesu
Canvas
D3js


riadny 2025/2026
1) DSklad - co to je + schéma, OLAP vs OLTP, datový model skladu 
2) Microservices - a) co to je, co je je mikroslužba, b) jakými synchronními aplikačními rozhraními komunikují (3 příklady) a popsat jednou větou synchronní komunikaci, c) asynchronní komunikace, jaké jsou typy, jak komunikují, jak jsou implementované, příklady implementace
3) Workflow -co to je, jak se popisuje BDSM? ,AND split/join
4) a) vrstva řízení, vrstva stavu, b) nakreslit příklad vrstvy řízení (nevím už co přesně) c) Porovnat dva typy způsobu provádění zřetězených transakcí (asi commit vs chain) 
5) GeoJSON - co to je, 2 typy/struktury z toho, 2 praktický použití, jaká JS knihovn
```
