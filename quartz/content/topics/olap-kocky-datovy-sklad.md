---
title: "OLAP, Kocky a Dátový Sklad"
description: "OLAP, Kocky a Dátový Sklad: exam-first answer, historical questions, source notes and image diagrams."
tags:
  - pis
  - olap
  - high-roi
---

# OLAP, Kocky a Dátový Sklad

**ROI:** 18 bodov = 13 historická frekvencia + 5 recent boost.

**Minimum:** Kocka, agregácie, DWH vs OLTP, star/snowflake.

## Must Know subpages

- [OLAP kocka a operácie](../must-know/olap-kocka-operacie) - 8x historicky, plus recent OLAP/kocka signál
- [Dátový sklad, OLTP a ROLAP](../must-know/datovy-sklad-rolap) - 3x ROLAP/star/snowflake, 1x DWH, plus recent DWH


## Skúšková odpoveď

Dátový sklad je oddelené analytické úložisko pre rozhodovanie. Oproti OLTP je orientované na čítanie, historické dáta, integráciu zdrojov a agregácie. OLTP rieši aktuálne operačné transakcie.

Multidimenzionálna kocka je funkcia z kombinácie dimenzií do faktov. Najprv sa detailné záznamy zoskupia podľa rovnakých súradníc do základného kuboidu. Pri súčte sa fakty sčítajú, pri priemere treba niesť aj počet prvkov alebo súčet a count, inak priemer podkociek nemusí byť správny.

Operácie: roll-up zvyšuje agregáciu, drill-down zvyšuje detail, pivot mení usporiadanie dimenzií, slicing fixuje jednu dimenziu a dicing filtruje viac dimenzií. ROLAP drží dáta relačne, typicky v hviezde alebo vločke.

## Čo musíš vedieť

- Definovať DWH a povedať rozdiel oproti OLTP.
- Definovať dimenzie, fakty, základný kuboid a vrcholový kuboid.
- Vysvetliť súčet a priemer v kocke.
- Nakresliť hviezdu a vločku.
- Bez zaváhania vysvetliť roll-up, drill-down, pivot, slice a dice.

## Recent signály

- Opravný 2024/25: Definovať dátový sklad a porovnať s OLTP.
- Riadny 2024/25: Všeobecne definovať kocku, súčet v OLAP, roll-up, drill-down, pivot, dice & slice.
- Finálny zoznam: Kocka - dimenzie, aktívne dimenzie, OLAP operácie s kockou.
- Riadny 2025/2026: Dátový sklad, schéma, OLAP vs OLTP a dátový model skladu.

## Staré otázky a odpovede

### 8x Multidimenzionalna kocka pre priemer, sucet. Definicia kocky, ar. priemeru. roll-up, drill-down, pivot, slice\&dice.
Frekvencia v zdroji: **8x**.
* Dimenze je uspořádatelná množina hodnot diskrétního základního typu (integer, výčet, čas) nebo množina jejich struktur hierarchicky organizovaných  
     
  ![](../assets/images/past-image7.png)![](../assets/images/past-image8.png)  
    
  ![](../assets/images/past-image9.png)

Typicky se tvoří více dotazů po sobě (podle toho co manažer chce), proto OLAP systém umožňuje následující operace s kostkou:

- **roll-up** - vzrůst úrovně agregace = snížení detailu (takže uberu nějakou dimenzi)  
  - např. manažera nezajímá cena, tak tuto dimenzi ubere  
- **drill-down** - snížení úrovně agregace = zvýšení detailu (přidám dimenzi)  
  - např. manažer chce výsledný model agregovat podle jednotlivých produktů, tak přidá dimenzi produkt  
- **pivoting** - změna uspořádání dimenzí (to znamená že vznikne trochu jinak členěná výsledná kostka)  
  - např. manažer změní model tak, že nejprve agreguje podle času a až potom podle místa  
- **slicing & dicing** - výběr projekce (změna skutečné kardinality 1 nebo více dimenzí)   
  - např. manažer chce více rozšířit agregaci podle času - zanoří se v čase a bude agregovat podle dnů, nikoliv podle měsíců

---

### 3x OLAP charakteristika, ROLAP, jak se ukládá do relační DB \- schémata hvězda a vločka popsat.
Frekvencia v zdroji: **3x**.
**OLAP**  
online analytics processing. Je to system pro podporu rozhodovani pro podnikani (podpora Business Inteligence). OLAP zahrnuje v sebe procesy, technologie, a nastroje potrebne k pretvoreni dat a informaci do znalosti pro podporu rozhodovani na ruznych urovnich.

Architektury serveru OLAP: MOLAP, ROLAP, HOLAP, specialozovaný SQL server 

 

**Relační OLAP (ROLAP)**

* užívá relační nebo rozšířená relační SŘBD  
* údaje jsou získávány z relačních tabulek, jsou uživateli předkládány jako multidimenzionální pohled  
* data jsou uložena jako záznamy relační tabulky  
* žádná redundance

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

* zahrnují optimalizaci BE, implementaci agregační navigační logiky a dodatečných pomůcek/služeb  
* velká možnost škálování

 

**Hvězda**

jedna tabulka faktů je ve středu připojena k množině relací dimenzí

 

**Vločka**

poskytuje zjemnění schématu hvězdy tak, že hierarchie dimenzí je explicitně reprezentována normalizováním relací dimenzí

---

### 1x Datový sklad \- schéma, datový model, jak se liší od OLTP
Frekvencia v zdroji: **1x**.
Online Analytical Processing & Business Intelligence - str11. / merged 516

 ![](../assets/images/past-image21.png)

- Datovým skladem nazýváme technologii   
  - natažení (extrakce a transformation)   
  - uložení (loading) a   
  - poskytování dat pro podporu rozhodování prováděnou analýzou informací a vytvářením znalostí  
- je typicky provozován odděleně od základní operační databáze (též databáze detailů nebo produkční databáze)

datový model -  
![](../assets/images/past-image22.png)

---

### TODO \- 1x , definovat multidimenzionalni kostku, nakreslit 4D kostku pro time, item, location, supplier. Popísať kostku pro počet.
Frekvencia v zdroji: **1x**.
**![](../assets/images/past-image24.png)**  
**TODO - Ako by ste robili tu ten pocet ? Ma byt ten pocet = 10 alebo 5 ? Maju sa najskor zlucit tie riadky, ktore maju rovnake hodnoty a az potom sa rata ten pocet?**

## Poznámky z prípravy

## P8 Business intelligence a OLAP

### Dátový sklad (Data Warehouse – DWH)

Dátový sklad je podnikovo štruktúrovaný depozitár dát určený na podporu rozhodovania, ktorý obsahuje operačné aj agregované dáta.

* **Vlastnosti dátového skladu:**  
  * **Orientácia podľa subjektu:** Fakty sú organizované podľa priesečníkov n-dimenzií.  
  * **Integrácia:** Dáta z rôznych zdrojov sú ukladané jednotne (jednotná terminológia, merné jednotky) po predchádzajúcom vyčistení.  
  * **Časová premenlivosť:** Každý kľúč obsahuje časový údaj; historický horizont je typicky 5–10 rokov (na rozdiel od aktuálnych dát v OLTP).  
  * **Nemennosť:** Dáta sa v sklade neprepisujú, vykonávajú sa len operácie vkladania a čítania. Nepotrebuje transakčné spracovanie ani zložité mechanizmy súbežného prístupu.  
* **Architektúra dátového skladu (3 časti):**  
  * **Získanie dát:** Zahŕňa zdrojové dáta a miesto prípravy (proces **ETL** – Extraction, Transformation, Loading).  
  * **Uloženie dát:** Samotný dátový sklad, menšie celky (dátové trhy) a úložisko metadát. Sklad je navrhnutý ako **read-only** pre potreby analýzy.  
  * **Odovzdávanie výsledkov:** Výstupné rozhrania ako OLAP, dotazovacie nástroje, generátory správ a nástroje pre data mining.  
* **Zhrnutie požiadaviek na dátový sklad:**  
  * Schopnosť vykonávať **agregácie** (súčty, priemery a pod.).  
  * Databázový model navrhnutý pre **analytické dotazy**.  
  * Možnosť integrovať dáta z viacerých heterogénnych aplikácií.  
  * Prevaha operácie čítania nad zápisom.  
  * Pravidelné, periodické dopĺňanie nových dát.  
  * Súčasné využitie aktuálnych aj historických údajov.

**1\. Multidimenzionálny model (Dimenzie a Fakty)**  
Základom modelu je **multidimenzionálna kocka**, ktorá je matematicky definovaná ako funkcia: gm​:(A1​×A2​×A3​×⋯×Am​)→F

* **Dimenzie (**Ai​**):** Usporiadané množiny hodnôt (napr. Čas, Produkt, Miesto), ktoré definujú súradnice v kocke.  
* **Fakty (**F**):** Agregovateľné číselné hodnoty (množina faktov) nachádzajúce sa na priesečníkoch dimenzií (napr. objem predaja, tržba).

![](../assets/images/prep-image33.png)

**2\. Agregácie a prvý krok výpočtu**  
V reálnom systéme existujú **detailné hodnoty** (napr. jednotlivé transakcie), ktorých môže byť pre rovnaké súradnice dimenzií viacero.

* **Prvý krok agregácie:** Prevedie tieto detaily na tzv. **základný kuboid** (n-rozmerná kostka so všetkými dimenziami), kde je pre každú kombináciu súradníc už len jeden agregovaný fakt.  
* **Matematicky (pre súčet):** soucˇetn​(d1​,…,dn​)=∑detail(d1​,d2​,…,dn​)

**3\. Podkocky (Kuboidy) a ich hierarchia**  
Z pôvodnej n-rozmernej kostky možno odvodzovať **podkocky (kuboidy)** s menším počtom dimenzií pomocou operácie **roll-up**.

* **Množina podkociek** tvorí čiastočne uspořádanú množinu – **zväz kuboidov** (lattice).  
* **Základný kuboid (n-D):** Obsahuje fakty pre všetky aktívne dimenzie.  
* **Vrcholový kuboid (0-D):** Predstavuje jediný agregovaný fakt cez úplne všetky dimenzie (celkový súčet za všetko).

**Príklad: Predaj pečiva**  
Predstavme si kocku s 3 dimenziami: **Čas** (d1​), **Produkt** (d2​) a **Miesto** (d3​).

1. **Detailné hodnoty (transakcie):**  
   * 22.6., rohlík, Brno → 12 ks  
   * 22.6., rohlík, Brno → 4 ks  
2. **Prvý krok (Základný 3D kuboid):** Sčítame detaily pre rovnaké súradnice: soucˇet3​(22.6.,rohlıˊk,Brno)=12+4=16.  
3. **Podkocka (2D kuboid bez dimenzie Miesto):** Agregujeme (sčítame) hodnoty cez všetky mestá pre daný čas a produkt: soucˇet2​(22.6.,rohlıˊk)=miesto∈{Brno,Praha}∑​soucˇet3​(22.6.,rohlıˊk,miesto) Ak sa v Prahe predalo 22 ks a v Brne 19 ks, výsledok v 2D podkocke bude **41**.  
4. **Vrcholový kuboid (0D):** Agregujeme úplne všetko. Ak celkový súčet všetkých predajov (všetky dni, produkty aj mestá) vyjde napr. **94**, vrcholový kuboid obsahuje len túto jednu hodnotu.

![](../assets/images/prep-image34.png)![](../assets/images/prep-image35.png)![](../assets/images/prep-image36.png)

### Architektúry OLAP serverov

Existujú tri základné prístupy k ukladaniu a spracovaniu analytických dát:

* **MOLAP (Multidimensional OLAP):**  
  * Využíva vlastné **multidimenzionálne dátové štruktúry** (polia, riedke matice).  
  * Dáta sú predzpracované a agregované, čo zabezpečuje **maximálny výkon** pri indexovaní.  
  * **Nevýhody:** Vysoká redundancia a veľké nároky na úložný priestor.  
  * **Príklady:** Oracle Essbase, Jedox.  
* **ROLAP (Relational OLAP):**  
  * Dáta ostávajú v **relačných tabuľkách**, ale navonok sú prezentované ako multidimenzionálny pohľad.  
  * **Výhody:** Žiadna redundancia a výborná možnosť škálovania.  
  * **Príklady:** ClickHouse, Apache Kylin, cloudové riešenia ako Google BigQuery alebo Amazon Redshift.  
* **HOLAP (Hybrid OLAP):**  
  * Kombinuje oba prístupy: **detailné dáta** sú v relačných tabuľkách (ROLAP) a **predagregáty** v multidimenzionálnych štruktúrach (MOLAP).  
  * **Príklady:** Microsoft SSAS, SAP BW.

**Konceptuálne modelovanie (Schémy)**

Pri návrhu štruktúry dátového skladu sa využívajú tri základné typy schém:

* **Schéma hviezdy (Star schema):**  
  * Pozostáva z jednej **centrálnej tabuľky faktov**, ku ktorej sú pripojené tabuľky dimenzií.  
  * Relácie dimenzií **nie sú normalizované**, čo model zjednodušuje, ale môže spomaliť spracovanie.  
  * Neposkytuje priamu podporu pre hierarchie (rieši sa organizačne).![](../assets/images/prep-image37.png)  
* **Schéma snehovej vločky (Snowflake schema):**  
  * Ide o zjemnenie hviezdy, kde je **hierarchia dimenzií normalizovaná** do viacerých naviazaných tabuliek.  
  * **Výhody:** Lepšia konzistencia dát a jednoduchšia údržba dimenzií.  
  * **Nevýhody:** Zložitejšie analytické dotazy.![](../assets/images/prep-image38.png)  
* **Konstelácia faktov (Fact constellation / Galaxy schema):**  
  * Obsahuje **viacero tabuliek faktov**, ktoré navzájom zdieľajú spoločné tabuľky dimenzií.![](../assets/images/prep-image39.png)

**Charakteristika tabuliek**

* **Tabuľka faktov:** Zvyčajne najväčšia a často jediná tabuľka v databáze. Obsahuje numerické miery (napr. tržba, cena, počet) a cudzie kľúče do tabuliek dimenzií.  
* **Tabuľky dimenzií (číselníky):** Obsahujú popisné údaje usporiadané logicky alebo hierarchicky. Sú menšie, menia sa menej často a najčastejšie reprezentujú čas, geografiu alebo produkty.

### OLAP operácie nad kockou

Umožňujú používateľom interaktívne skúmať a analyzovať multidimenzionálne dáta uložené v dátovom sklade. Medzi základné operácie nad dátovou kockou patria:

* **Roll-up (Vyrolovanie):** Predstavuje posun o úroveň vyššie v hierarchii kuboidov, čím dochádza k **zvýšeniu úrovne agregácie**. V praxi to znamená napríklad prechod od zobrazenia dát po mesiacoch k zobrazeniu po kvartáloch alebo rokoch.  
* **Drill-down (Zavŕtanie):** Je opačnou operáciou k roll-up. Znamená posun o úroveň nižšie, čo vedie k **zvýšeniu detailu** pridaním ďalšej dimenzie. Príkladom je rozpad ročných predajov na jednotlivé mesiace.  
* **Pivoting (Pretočenie):** Táto operácia mení usporiadanie (poradie) dimenzií v rámci aktuálneho pohľadu bez toho, aby sa menila ich množina. Ide v podstate o otočenie niektorej zo stien kocky smerom k používateľovi (napr. zmena z `čas × produkt` na `produkt × čas`).  
* **Slicing (Seříznutí / Rez):** Výber konkrétnej projekcie zafixovaním hodnoty v jednej dimenzii pomocou filtra. Príkladom je obmedzenie zobrazenia dát len na konkrétny región (napr. `región = Praha`).  
* **Dicing (Kockovanie):** Ide o zložitejšiu formu filtrovania, kde sa nastavujú obmedzujúce podmienky (predikáty) cez **viacero dimenzií súčasne**. Príkladom môže byť výber dát pre kombináciu: `Praha + Q1 2024 + kategória elektro`.

![](../assets/images/prep-image40.png)

