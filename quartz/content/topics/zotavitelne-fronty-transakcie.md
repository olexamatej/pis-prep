---
title: "Zotaviteľné Fronty a Transakcie"
description: "Zotaviteľné Fronty a Transakcie: exam-first answer, historical questions, source notes and image diagrams."
tags:
  - pis
  - transactions
  - high-roi
---

# Zotaviteľné Fronty a Transakcie

**ROI:** 13 bodov = 8 historická frekvencia + 5 recent boost.

**Minimum:** Fronta, riadiaca/stavová vrstva, commit vs chain.

## Must Know subpages

- [Zotaviteľná fronta](../must-know/zotavitelna-fronta) - 6x historicky, plus recent fronta otázka
- [Zreťazené transakcie vs savepointy](../must-know/zretazene-transakcie-savepointy) - 2x historicky, plus recent commit()/chain() otázka


## Skúšková odpoveď

Zotaviteľná fronta plánuje prácu na neskoršie vykonanie tak, aby požiadavka prežila haváriu a bola spracovaná práve raz v rámci očakávanej transakčnej logiky. Záznam obsahuje akciu a parametre, napríklad ID objednávky.

Operácie musia byť koordinované s transakciou: vložený záznam sa stane viditeľným až po commit; pri rollbacku sa odstráni. Vybraný záznam sa pri rollbacku musí vrátiť do fronty. Tým sa spája atomičnosť databázy a fronty.

Pri dlhších procesoch sa oplatí oddeliť riadiacu vrstvu od stavovej. Riadiaca vrstva určuje poradie krokov, vetvenie a spúšťacie podmienky; stavová vrstva nesie perzistentný stav prípadu alebo objektov medzi krokmi.

Savepointy sú v jednej transakcii a zachovávajú lokálne premenné. Zreťazené transakcie rozkladajú dlhý proces na samostatné podtransakcie; po commit() už nemožno vrátiť predchádzajúci efekt, atomicita celej transakcie padá a izolácia závisí od uvoľnenia kontextu. chain() drží kontext dlhšie a zlepšuje izoláciu za cenu výkonu.

## Čo musíš vedieť

- Definovať zotaviteľnú frontu a jej účel.
- Popísať vlož, vyber a obsah záznamu.
- Vysvetliť rollback pravidlá pre vložený/vybraný záznam.
- Dať príklad objednávka -> expedícia -> fakturácia.
- Rozlíšiť riadiacu a stavovú vrstvu procesu.
- Porovnať savepoint, commit() a chain().

## Recent signály

- Opravný 2024/25: Porovnanie zreťazených transakcií s commit() a chain(), atomicita a izolácia.
- Riadny 2024/25: Zotaviteľná fronta, operácie, vlastnosti a jednoduchý príklad.
- Finálny zoznam: zotaviteľná fronta.
- Riadny 2025/2026: Vrstva riadenia, vrstva stavu a commit() vs chain() pri zreťazených transakciách.

## Staré otázky a odpovede

### 6x Zotavitelna fronta. Definicia, princip, suvislost s transakciami. Popisat jej vlastnosti a operacie. Ukazat pouzitie na jednoduchom priklade.
Frekvencia v zdroji: **6x**.
Mechanismus na plánování transakcí pro budoucí vykonání a zajištění, že **vykonání bylo skutečně v aplikaci provedeno a jenom jednou**.

**Operace**  
**Vlož**: transakce vkládá do fronty záznam o práci naplánované k provedení i s jeji parametry, právě když je transakce potvrzena  
**Vyber**: Záznam je později vyzvednut jinou transakcí, která danou práci provede. Tato transakce bývá typicky spuštěna serverem, který periodicky kontroluje frontu a vybírá z ní pracovní požadavky  
**Vkládaný/vybíraný záznam**: obsahuje informaci o akci, která je plánována a o datech, která je potřeba mezi jednotlivými transakcemi v řetězu předávat (např. ID objednávky)

Zotavitelná fronta musí být **trvanlivá** - pro případ havárie systému.  
Realizováno např. prostřednictvím tabulky v DB ; lepší je však využití oddělený aplikační modul

Atomicita transakce vyžaduje od vložení/výběru z fronty tuto koordinaci s potvrzením transakce:

* Vloží-li transakce do fronty záznam a později je zrušena, tak musí být tento záznam z fronty odstraněn  
* Vybere-li transakce z fronty záznam a později je zrušena, tak musí být tento záznam do fronty vrácen  
* Dokud není transakce T potvrzena, tak nelze jinými transakcemi vybírat záznamy, které byly transakcí T vloženy, protože transakce T může být ještě zrušena 

**Příklad:**

Systém se skládá ze tří hlavních částí – objednávky, expedice, fakturace. Úkoly lze vykonat třemi oddělenými transakcemi. Jediný požadavek je, aby **fakturace a expedice byla provedena kdykoliv po úspěšném dokončení objednávky**, a to i v případě havárie systému ihned po objednání.

---

### 2x Zretazene procesy vs Savepointy
Frekvencia v zdroji: **2x**.
p6., slide 48 - Procesy, pokročilé modely procesů, cesta k workflow 

**Zreťazený Proces vs Savepoint**

**Samostatné transakcie z jednej väčšej vs jedna transakcia z dílčich častí**  
**návrat iba po posledný commit vs návrat vrámci savepointu v transakcii**  
**lokálne premenné stráca vs uchováva**  
**Nedodržiava ACID - Atomickosť nikdy a Izolovanosť sa dá ovplyvniť ( chain() ) vs Dodržiava** 

Sekvenčný model - savepoints: 

* Jedná sa o **jednu transakciu, ktorá v svojích podúlohach vytvára savepointy, na ktoré sa vracia v prípade výpadku.**  
* **Pomocou rollback(Savepoint) sa obnoví systém do stavu pri uložení Savepointu.** Savepoint **zachová lokálne premenné.** Potom sa pokračuje.  
* Pri zavolaní **abort(SavePoint) sa nepokračuje.**

Lokální proměnné se při rollbacku na poslední savepoint ponechávají - lze tak do nich např. uložit kudy jsme se pokoušeli rezervovat lety minule, když jsme pak museli rollbackovat protože tam bylo plno. Při dalším pokusu tak můžeme jít tou druhou cestou a realizovat tak backtracking**. Proč nevadí že se proměnné nerollbackují:** Transakce slouží především k přenosu dat z/do databáze. Pokud dojde k úspěšné transakci, uloží se milník typu STAV1\_DB. Na lokálních proměnných v tomto ohledu příliš nezáleží, důležité je, že databáze se nachází v požadovaném stavu a lze pokračovat v transakci od zvoleného milníku.

**Zretazene procesy:**  
**dlho trvajúce transakcie - objednávka, expedícia, fakturácia**  
**dekomponizujeme skrz:**

1. **Lepšiu výkonnosť =\> nemôže splňovať ACID**  
2. **Zabránenie straty celej práce. Nechceme rollbacknúť celý proces.**

**Transakcia sa rozloží na podtransakcie a oproti savopointom je každá podtransakcia samostatná transakcia, to znamená, že Chaining:**

1. **Po prevedení commit() sa už nedajú zmeny vrátiť.**   
2. **Nezachovávajú sa lokálne premenné: Pre koho sa robil nákup?**  
3. **Nie je atomická: V prípade výpadku nemusia byť vykonnané všetky podtransakcie**  
* **Alternatíva: Ukladanie do databáze**

  **Nevýhoda - súbežný prístup ostatných**

  	**Vyriešené pomocou locks**

**V okamžiku commitu podtransakcie sa môžu vykonať zmeny systému.**  
**Medzi S1 a S2 sa niečo stane a tým pádom S2 číta iné dáta ako S1 zapísala.**

**Data Context**

* **odomykanie z hľadiska efektu:**  
  * **Odomynie medzi S1 a S2, aby mohli bežať súbežné procesy to však spôsobí, že celá Transakcia izolovaná nie je, iba jej podtransakcie.**

**Alternatívna Sémantika pre získanie Izolovanosti**

* **miesto commit() sa použije chain()**  
  * **neuvoľní db context no zhorší výkonnosť**

**Roll Forward**

* **Aplikácia môže iba pokračovať, od tadiaľ kde bol prevedený posledný commit.**  
* **Pokračuje sa 2 spôsobmi:**  
  1. **dokončenie Transakcie**  
  2. **operácie, kt. zotavia do konzistentého stavu**  
     

**Kompenzujúce transakcie**

* **transakcie, ktoré nevytvoria rollback, ale snažia sa systém nejakou novou transakciou dostať do stavu predtým.**  
* **príklad: registrácia-deregistrácia uživateľa**

## Poznámky z prípravy

## P6 Procesy

**Procesy v IS:** Realizujú transformácie dát (často ako transakcie) a menia stav systému; mali by byť izomorfné s realitou.

### Transakčné spracovanie (ACID)

* **ACID:** Atomickosť (všetko alebo nič), Konzistencia (pravidlá DB), Izolovanosť (nerušenie sa), Trvanlivosť (prežitie havárie).  
* **Zodpovednosť:** Programátor zodpovedá za **konzistenciu**; TPS (systém) automaticky zaisťuje ostatné vlastnosti.  
### Pokročilé modely a distribuované transakcie

* **Zretězené transakcie (Chained):** Sekvencia podtransakcií, kde každá sa potvrdzuje samostatne; kratšie zámky, vyšší výkon.  
![](../assets/images/prep-image22.png)

**Zotaviteľné fronty a reálne udalosti**

* **Zotaviteľná fronta:** Mechanizmus pre plánovanie budúcich transakcií; musí prežiť haváriu.  
* **Vlastnosti:** Ak transakcia vykoná rollback, záznam musí zmiznúť z fronty (atomičnosť spojenia DB a fronty).  
* **Reálne udalosti:** Fyzické akcie (napr. vydanie peňazí), ktoré nemajú rollback; riešia sa cez dopredný návrat a zotaviteľné fronty.  
* **Technológie:**  
  * **Jakarta Messaging (JMS):** Štandard pre prácu s message brokermi; podporuje XA transakcie.

