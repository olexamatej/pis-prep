---
title: "PIS Exam Speedrun"
description: "Exam-first Quartz study site for PIS with ROI plan, bare minimum and frequency analysis."
tags:
  - pis
  - dashboard
---

# PIS Exam Speedrun

Toto je skúškový web pre PIS. Je postavený frekvenčne: najprv témy, ktoré sa historicky opakujú a zároveň sa objavili v posledných termínoch zo súboru PIS-zbytok.md.

Ak cieliš na prvý opravný termín, pozri aj [Prvý opravný prediction](analysis/prvy-opravny-prediction).

## Najvyšší ROI

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

## Rýchly štart

1. Prejdi [Must Know](must-know) - krátke odpovede na to, čo sa reálne pýta.
2. Prejdi [bare minimum](analysis/bare-minimum) a nauč sa kresliť požadované schémy.
3. Choď podľa [ROI plánu](analysis/roi-plan), zhora nadol.
4. Pri každej téme si najprv prečítaj Must Know, potom "Skúšková odpoveď", potom "Staré otázky".
5. Ak nevieš nakresliť diagram bez pozerania, téma ešte nie je hotová.

## Must Know subcategory

| Téma | Frekvencia | Zdroj |
|---|---|---|
| [Workflow pojmy a súvislosti](must-know/workflow-pojmy) | 8x historicky, plus recent workflow signál | [topic](topics/workflow-a-wfmc) |
| [WfMC referenčný model](must-know/wfmc-referencny-model) | 4x historicky, plus recent workflow otázky | [topic](topics/workflow-a-wfmc) |
| [Workflow dáta, aplikácie a brány](must-know/workflow-data-brany) | 2x dáta/aplikácie, 1x AND/XOR, recent AND/OR split/join | [topic](topics/workflow-a-wfmc) |
| [OLAP kocka a operácie](must-know/olap-kocka-operacie) | 8x historicky, plus recent OLAP/kocka signál | [topic](topics/olap-kocky-datovy-sklad) |
| [Dátový sklad, OLTP a ROLAP](must-know/datovy-sklad-rolap) | 3x ROLAP/star/snowflake, 1x DWH, plus recent DWH | [topic](topics/olap-kocky-datovy-sklad) |
| [Zotaviteľná fronta](must-know/zotavitelna-fronta) | 6x historicky, plus recent fronta otázka | [topic](topics/zotavitelne-fronty-transakcie) |
| [Zreťazené transakcie vs savepointy](must-know/zretazene-transakcie-savepointy) | 2x historicky, plus recent commit()/chain() otázka | [topic](topics/zotavitelne-fronty-transakcie) |
| [Canvas, SVG, D3 a GeoJSON](must-know/canvas-svg-d3) | 3x Canvas/SVG, 2x D3, 1x GeoJSON, plus recent webviz signál | [topic](topics/canvas-svg-d3-geojson) |
| [GraphQL, REST a JWT](must-know/graphql-rest-jwt) | 4x GraphQL, 2x REST/JWT, plus recent GraphQL signál | [topic](topics/rest-jwt-graphql-soap) |
| [SOAP, WSDL a UDDI](must-know/soap-wsdl-uddi) | Recent riadny termín | [topic](topics/rest-jwt-graphql-soap) |
| [Mikroslužby a komunikácia](must-know/mikrosluzby-komunikacia) | 4x historicky, plus recent mikroslužby signály | [topic](topics/mikrosluzby-komunikacia) |
| [Gestalt, vnímanie a bullet graf](must-know/gestalt-vnimanie-bullet) | 4x Gestalt, 3x vnímanie, 1x bullet graf | [topic](topics/gestalt-vnimanie-dashboardy) |

## Zdroje

- [Must Know](must-know)
- [Frekvenčná analýza](analysis/frequency-analysis)
- [ROI plán](analysis/roi-plan)
- [Bare minimum](analysis/bare-minimum)
- [Prvý opravný prediction](analysis/prvy-opravny-prediction)
- [Transformovaný preparation speedrun](sources/preparation-speedrun)
- [Transformované časté otázky](sources/past-questions)
- [Recent otázky z PIS-zbytok](sources/recent-2024-25)
