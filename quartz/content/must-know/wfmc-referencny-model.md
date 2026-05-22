---
title: "WfMC referenčný model"
description: "WfMC referenčný model: distilled must-know exam answer."
tags:
  - pis
  - must-know
---

# WfMC referenčný model

**Frekvencia/signál:** 4x historicky, plus recent workflow otázky

**Plná téma:** [workflow a wfmc](../topics/workflow-a-wfmc)

## Otázka: Nakreslite schému referenčného modelu. Popíšte prvky a rozhrania stručne.

### Intuícia

- Zapamätaj si stred: WES + workflow engine.
- Okolo stredu je päť typov napojenia: definícia, klient, vyvolaná aplikácia, iný WES, admin.
- Kresba má ukázať, čo engine riadi a s čím komunikuje.

### Krátka odpoveď

V strede modelu je WES, teda Workflow Enactment Service. WES obsahuje jeden alebo viac workflow enginov, ktoré interpretujú definíciu procesu, vytvárajú inštancie a riadia prechody medzi aktivitami.

### Čo napísať na skúške

- Rozhranie 1: nástroje pre definíciu procesov.
- Rozhranie 2: workflow klienti.
- Rozhranie 3: vyvolané aplikácie.
- Rozhranie 4: iné WES/WFM systémy.
- Rozhranie 5: administrácia a monitoring.
- Workflow engine vytvára pracovné položky a riadi stav inštancií.

### Diagram / obrázok / kód

![WfMC referenčný model zo starých otázok](../assets/images/past-image2.png)

![WfMC referenčný model z prípravy](../assets/images/prep-image24.png)

### Pozor na pasce

- Nestačí napísať len WES; body sú za prvky a rozhrania.
- Klientská aplikácia nie je vyvolaná aplikácia.

