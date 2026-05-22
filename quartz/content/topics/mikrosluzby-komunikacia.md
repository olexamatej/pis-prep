---
title: "Mikroslužby a Komunikácia"
description: "Mikroslužby a Komunikácia: exam-first answer, historical questions, source notes and image diagrams."
tags:
  - pis
  - architecture
  - high-roi
---

# Mikroslužby a Komunikácia

**ROI:** 9 bodov = 4 historická frekvencia + 5 recent boost.

**Minimum:** Monolit vs mikroslužby, 3 sync API, async broker.

## Must Know subpages

- [Mikroslužby a komunikácia](../must-know/mikrosluzby-komunikacia) - 4x historicky, plus recent mikroslužby signály


## Skúšková odpoveď

Mikroslužby delia systém na malé samostatné služby s vlastnou business logikou, API a často vlastnou databázou. Monolit sa vyvíja a nasadzuje ako jeden celok so zdieľanou databázou.

Výhody mikroslužieb sú nezávislé nasadzovanie, technologická voľnosť a kontinuálny vývoj. Nevýhody sú sieťová réžia, zložitejšie testovanie, distribuované zlyhania a kompatibilita API.

Synchrónna komunikácia znamená request/response a čakanie na odpoveď. Typické rozhrania sú REST/HTTP JSON, gRPC a SOAP; podľa stacku sa môže objaviť aj GraphQL. Asynchrónna komunikácia ide cez message broker: queue doručuje jednému konzumentovi, publish/subscribe doručuje všetkým odberateľom témy. Príklady: RabbitMQ, ActiveMQ, SQS, Kafka, Pulsar, SNS.

## Čo musíš vedieť

- Nakresliť web UI, API gateway, viac služieb a ich databázy.
- Porovnať monolit a mikroslužby.
- Vymenovať vlastnosti mikroslužby: API, konfigurácia, logovanie, health check.
- Rozlíšiť synchrónnu a asynchrónnu komunikáciu.
- Vedieť povedať aspoň 3 príklady synchrónnych API rozhraní.
- Povedať queue vs publish/subscribe a príklady technológií.

## Recent signály

- Opravný 2024/25: Mikroslužby, rozdiel od monolitu a komunikácia.
- Riadny 2024/25: Mikroslužby a asynchrónna komunikácia, technológie a príklady.
- Finálny zoznam: Mikroslužby.
- Riadny 2025/2026: Mikroslužby, synchrónne API rozhrania a asynchrónna komunikácia s implementáciou.

## Staré otázky a odpovede

### 4x Architektura IS sestávající z mikroslužeb, co to je mikrosluzba a jeji vlastnosti, porovnat s monolitickou architekturou a nakreslit priklad IS s webovym rozhrani a mikrosluzbami.
Frekvencia v zdroji: **4x**.
**Mikroslužby**

Aplikace je rozdělena na malé části. Typicky vlastní databáze (nepřístupná vně systému), komunikace mezi jednotlivými částmi. Spojovacim bodem je pouze API gateaway. Typicky malý tým vývojářů na každou část (2 pizzas rule). 

**Výhody** - technologická nezávislost = rôzne vývojové prostredie, snadné aktualizace = aktualizuje sa iba jedna mikroslužba z veľkého celku, kontinuální vývoj

**Nevýhody** - špatná testovatelnost (závislosti na dalších službách) - hrubé testy je možné spustiť lokálne, ostatnú funkcionalitu až v reálnom provoze, režie komunikace = formulace, dekodovani správy, možné řetězové selhání, riziko nekompatibility

**Vlastnosti mikroslužby** - disponuje vnějším API, externí konfigurace, logování, vzdálené sledování (telemetrie, *health check*)

 

**Monolitická architektura**

Jedna aplikace - Jedna databáze, webové (aplikační) rozhraní, Business moduly – např. objednávky, doprava, sklad, …

**Výhody** - Jednotná technologie, sdílený popis dat, testovatelnost, rychlé nasazení (jeden balík)

**Nevýhody** - Rozměry aplikace mohou přerůst únosnou mez, neumožňuje rychlé aktualizace částí, reakce na problémy, pokud použité technologie zastarají, přepsání je téměř nemožné

 

**Příklad mikroslužby (Uber):**  
**![](../assets/images/past-image10.png)**

## Poznámky z prípravy

### Architektúry IS

* **Dvojvrstvová (Klient-server):** Využíva dva druhy oddelených výpočetných systémov; „hrúbka“ klienta závisí od jeho inteligencie (množstva logiky, ktorú spracováva).  
* **Trojvrstvová architektúra (Three-tier):** Štandard pre moderné informačné systémy, ktorý oddeľuje:  
  * **Prezentačná vrstva:** Vizualizácia informácií (GUI), kontrola vstupov, neobsahuje spracovanie dát.  
  * **Aplikačná (Business) vrstva:** Jadro aplikácie, implementuje logiku, funkcie a výpočty.  
  * **Dátová vrstva:** Správa dát (databáza, súborový systém alebo webová služba).

**Tier vs. Layer**

* **Tier (Fyzická vrstva):** Jednotka nasadenia (deployment); určuje, na akom hardvéri/serveri časť systému beží (napr. DB server, aplikačný server).  
* **Layer (Logická vrstva):** Jednotka organizácie kódu v rámci aplikácie (napr. Data layer, Business layer, Presentation layer).

![](../assets/images/prep-image4.png)![](../assets/images/prep-image5.png)

**Monolitická architektúra**

* **Charakteristika:** Systém sa vyvíja a nasadzuje ako **jeden celok** (jeden balík) s jednotnou technológiou a zdieľanou databázou.  
* **Výhody:** Jednoduchší vývoj a testovanie, rýchle úvodné nasadenie.  
* **Nevýhody:** Obtiažna aktualizácia častí, riziko, že aplikácia prerastie únosnú medzu, technologická závislosť (ťažký prepis pri zastaraní technológií).

**Mikroslužby (Microservices)**

* **Charakteristika:** Aplikácia je rozdelená na **malé, nezávislé časti**, ktoré komunikujú cez API (napr. REST).  
* **Vlastnosti:** Každá služba má vlastnú databázu, vlastnú business logiku a spravuje ju malý tím.  
* **Výhody:** Technologická nezávislosť služieb, jednoduché čiastkové aktualizácie, kontinuálny vývoj.  
* **Nevýhody:** Komplexné testovanie (závislosti), réžia sieťovej komunikácie, riziko reťazového zlyhania.

## P5

### Ďalšie architektúry API

**WSDL (Web Services Description Language)**

* **Účel:** Slúži na **formálny popis rozhraní** webových služieb nezávislý od platformy.  
* **Formát:** Ide o XML dokument, ktorý využíva XML menné priestory (Namespaces) a XML schémy.  
* **Čo definuje:**  
  * Názvy dostupných funkcií.  
  * Ich vstupné a výstupné parametre.  
  * Spôsob volania vrátane cieľovej URL adresy.  
* **Využitie v praxi:**  
  * Umožňuje **automatické generovanie rozhraní** v cieľovom programovacom jazyku (tzv. **„Stub“** – zástupná metóda pre volanie cez HTTP).  
  * Funguje to aj opačne – z existujúceho kódu možno vygenerovať WSDL popis.

**SOAP**

* **Charakteristika:** Komplikovaný štandard pre webové služby, ktorý vznikol ako snaha o maximálnu štandardizáciu volaní cez HTTP.  
* **Úloha:** Predstavuje samotný **protokol pre volanie** služby a prenos dát.  
* **Štruktúra správy:** Dáta sú zabalené v XML obálke (`<env:Envelope>`), ktorá sa delí na hlavičku (`<env:Header>`) a telo (`<env:Body>`).  
* **Porovnanie:** Na rozdiel od RESTu, ktorý je flexibilný, SOAP striktne vyžaduje WSDL popis a XML formát.

### Synchrónna komunikácia

* **Charakteristika:** Ide o najčastejší spôsob komunikácie, typicky realizovaný cez **REST**.  
* **Princíp:** Klientska služba odošle požiadavku a následne **čaká na odpoveď** od volanej služby, čo spôsobuje **blokovanie** jej ďalšej činnosti.  
* **Nevýhody:** Ak volaná služba nie je dostupná, klientska služba musí čakať (timeout) alebo sama zlyhá.

### Asynchrónna komunikácia

* **Charakteristika:** Služba odošle správu a **nečaká na okamžitú odpoveď**, čím môže plynule pokračovať vo svojej práci.  
* **Sprostredkovateľ:** Výmenu správ medzi službami zabezpečuje centrálny **message broker**.

#### Message Broker a jeho modely

Message broker je samostatný systém, ktorý garantuje doručenie správ medzi producentmi a konzumentmi. Existujú dva hlavné modely doručovania:

* **1\. Message Queue (Fronta správ):**  
  * Zprávy od konkrétneho producenta sa radia do fronty pre **jedného konkrétneho konzumenta**.  
  * **Príklady:** RabbitMQ, Apache ActiveMQ, Amazon SQS.  
* **2\. Publish / Subscribe (Publikácia / Odber):**  
  * Zprávy sú priraďované k určitým **témam (topics)**.  
  * Producent publikuje správu do témy a správa je doručená **všetkým konzumentom**, ktorí sú prihlásení na odber danej témy.  
  * **Príklady:** Apache Kafka, Pulsar, Amazon SNS.

