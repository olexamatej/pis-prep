---
title: "Prvý opravný prediction"
description: "Pattern-based prediction for the first retake term, derived from 2025/2026 riadny, 2024/25 riadny/opravný differences and topic swaps."
tags:
  - pis
  - analysis
  - prediction
---

# Prvý opravný prediction

Toto nie je istota, ale pattern-based tip z troch vecí:

1. čo bolo na **riadnom 2025/2026**,
2. čo sa líšilo medzi **riadnym a opravným 2024/25**,
3. ktoré koše otázok sa skôr **držia** a ktoré sa skôr **prehadzujú** medzi sebou.

## Rýchly záver

Ak by som mal tipnúť jadro prvého opravného termínu, tipoval by som tento balík:

1. [OLAP kocka a operácie](../must-know/olap-kocka-operacie)
2. [Mikroslužby a komunikácia](../must-know/mikrosluzby-komunikacia)
3. [Workflow dáta, aplikácie a brány](../must-know/workflow-data-brany) + [Workflow pojmy a súvislosti](../must-know/workflow-pojmy)
4. [Zotaviteľná fronta](../must-know/zotavitelna-fronta) + [Zreťazené transakcie vs savepointy](../must-know/zretazene-transakcie-savepointy)
5. [Canvas, SVG, D3 a GeoJSON](../must-know/canvas-svg-d3) — skôr cez Canvas/SVG/D3 než cez čistý GeoJSON

**Joker navyše:** [GraphQL, REST a JWT](../must-know/graphql-rest-jwt)

## 1. Čo bolo na riadnom 2025/2026

Z nového riadneho termínu v `PIS-zbytok.md` vychádza tento košík:

- **Dátový sklad**: čo to je, schéma, OLAP vs OLTP, dátový model skladu.
- **Mikroslužby**: čo sú, 3 synchrónne rozhrania, asynchrónna komunikácia a implementácie.
- **Workflow**: čo to je, ako sa popisuje, AND split/join.
- **Procesy/transakcie**: vrstva riadenia, vrstva stavu, commit() vs chain().
- **GeoJSON**: čo to je, typy/štruktúry, použitie, JS knižnice.

To znamená, že riadny 2025/2026 už pokryl:

- **DWH polovicu** BI koša,
- **AND variantu** workflow koša,
- **commit()/chain() polovicu** transakčného koša,
- **GeoJSON polovicu** webviz/geodata koša,
- a veľmi široko zobral **mikroslužby**.

## 2. Historický pattern: riadny 2024/25 vs opravný 2024/25

| Kôš | Riadny 2024/25 | Opravný 2024/25 | Pattern |
|---|---|---|---|
| BI / OLAP | kocka, roll-up, drill-down, pivot, dice & slice | dátový sklad vs OLTP | skôr sa prehadzuje **kocka ↔ DWH** |
| Workflow | workflow + **AND-split** | workflow + **OR-split** | jadro ostáva, mení sa typ brány |
| Transakcie | **zotaviteľná fronta** | **commit() vs chain()** | prehadzuje sa **fronta ↔ chain/savepoint** |
| Webviz / geodata | **Canvas + D3** | **GeoJSON + SVG/Canvas** | prehadzuje sa vizualizačný podkôš |
| API | **SOAP / WSDL / UDDI** | **GraphQL vs REST** | skôr sa prehadzuje **SOAP ↔ GraphQL** |
| Mikroslužby | async komunikácia | monolit vs mikroslužby + komunikácia | téma sa často **drží**, ale mení sa dôraz |

Toto je najsilnejší argument pre predikciu: keď sa jedna polovica koša objaví na riadnom, opravný často vytiahne **druhú polovicu** alebo ten istý kôš s mierne iným dôrazom.

## 3. Čo sa skôr drží a čo sa skôr prehadzuje

### Skôr sa drží

- **Workflow** ako celok.
- **Mikroslužby** ako celok.
- Všeobecne vysokofrekvenčné koše: workflow, OLAP/DWH, transakcie.

### Skôr sa prehadzuje

- **AND ↔ OR** vo workflow otázke.
- **DWH/model ↔ OLAP kocka/operácie**.
- **commit()/chain() ↔ zotaviteľná fronta**.
- **GeoJSON ↔ Canvas/SVG/D3**.
- **GraphQL/REST ↔ SOAP/WSDL/UDDI**.

Preto neočakávam úplne nový random set otázok. Skôr očakávam, že sa skúšajúci posunie na **susedné otázky v tom istom koši**.

## 4. Predikcia po košoch

### 1. OLAP kocka a operácie — vysoká istota

**Prečo:**

- 2025/2026 riadny už zobral **DWH + schéma + OLAP vs OLTP**.
- V 2024/25 bol medzi riadnym a opravným presne split **kocka vs DWH**.
- Historicky je to jeden z najsilnejších košov v celom predmete.

**Čo by som čakal vo formulácii:**

- definovať kocku,
- dimenzie a aktívne dimenzie,
- súčet/priemer v OLAP,
- roll-up, drill-down, pivot, slice, dice.

**Uč sa z:** [OLAP kocka a operácie](../must-know/olap-kocka-operacie)

### 2. Workflow — veľmi vysoká istota, ale skôr OR než AND

**Prečo:**

- workflow je historicky najsilnejší kôš,
- riadny 2025/2026 mal **AND split/join**,
- v 2024/25 sa opravný posunul z AND na **OR-split**.

**Čo by som čakal vo formulácii:**

- čo je workflow,
- ako sa popisuje,
- možno zobrazenie alebo návrh procesom,
- **OR-split / OR-join**, prípadne porovnanie s XOR a AND.

**Uč sa z:** [Workflow dáta, aplikácie a brány](../must-know/workflow-data-brany), [Workflow pojmy a súvislosti](../must-know/workflow-pojmy)

### 3. Zotaviteľná fronta — vysoká istota

**Prečo:**

- riadny 2025/2026 už zobral **commit() vs chain()** a vrstvy procesu,
- v 2024/25 sa oproti tomu na riadnom objavila **zotaviteľná fronta**,
- je to prirodzená druhá polovica toho istého transakčného koša.

**Čo by som čakal vo formulácii:**

- definícia zotaviteľnej fronty,
- vlož/vyber,
- rollback pravidlá,
- jednoduchý príklad objednávka -> expedícia -> fakturácia,
- možno krátke porovnanie so zreťazeným procesom.

**Uč sa z:** [Zotaviteľná fronta](../must-know/zotavitelna-fronta), [Zreťazené transakcie vs savepointy](../must-know/zretazene-transakcie-savepointy)

### 4. Canvas / SVG / D3 — stredne vysoká až vysoká istota

**Prečo:**

- riadny 2025/2026 už dal **GeoJSON**,
- historicky sa webviz kôš medzi termínmi láme na **GeoJSON/SVG** vs **Canvas/D3**,
- Canvas a D3 sú stále dosť časté a ľahko skúšateľné krátkym kódom.

**Čo by som čakal vo formulácii:**

- Canvas vs SVG a vzťah k DOM,
- jeden krátky Canvas alebo SVG kód,
- D3 selekcia podľa id,
- dogenerovanie prvkov zo zoznamu cez `data()` + `enter()`.

**Uč sa z:** [Canvas, SVG, D3 a GeoJSON](../must-know/canvas-svg-d3)

### 5. Mikroslužby — skôr zostanú, ale s iným dôrazom

**Prečo:**

- v 2024/25 boli mikroslužby v **oboch** termínoch,
- menil sa skôr dôraz: raz monolit vs mikroslužby, raz async komunikácia,
- 2025/2026 riadny ich už zobral veľmi široko, takže opravný môže prísť v užšej, priamočiarejšej verzii.

**Čo by som čakal vo formulácii:**

- čo je mikroslužba,
- rozdiel od monolitu,
- 3 synchrónne API rozhrania,
- queue vs pub/sub,
- príklady implementácie brokerov.

**Uč sa z:** [Mikroslužby a komunikácia](../must-know/mikrosluzby-komunikacia)

## 5. Joker / náhradná otázka

### GraphQL vs REST — stredná istota

Ak skúšajúci bude chcieť namiesto druhého mikroslužbového dôrazu vytiahnuť samostatný API kôš, najpravdepodobnejší kandidát je:

- **GraphQL vs REST**,
- dátový model GraphQL,
- čo sa definuje na klientovi a serveri.

**Prečo skôr GraphQL než SOAP:**

- v 2024/25 bol GraphQL práve na **opravnom** a SOAP na **riadnom**,
- z pohľadu interchange patternu je GraphQL prirodzenejší kandidát pre opravný než SOAP.

**Uč sa z:** [GraphQL, REST a JWT](../must-know/graphql-rest-jwt)

## 6. Ako by som sa učil na prvý opravný podľa tejto predikcie

Poradie učenia by som dal takto:

1. [Workflow dáta, aplikácie a brány](../must-know/workflow-data-brany)
2. [OLAP kocka a operácie](../must-know/olap-kocka-operacie)
3. [Zotaviteľná fronta](../must-know/zotavitelna-fronta)
4. [Canvas, SVG, D3 a GeoJSON](../must-know/canvas-svg-d3)
5. [Mikroslužby a komunikácia](../must-know/mikrosluzby-komunikacia)
6. [GraphQL, REST a JWT](../must-know/graphql-rest-jwt)

## 7. One-line prediction

Ak by som to mal zhrnúť do jednej vety:

> **Prvý opravný 2025/2026 bude pravdepodobne zrkadlo riadneho termínu: menej DWH a GeoJSON, viac kocka/OLAP operácie, OR-workflow, zotaviteľná fronta a Canvas/SVG/D3; mikroslužby skôr zostanú, ale s posunutým dôrazom.**
