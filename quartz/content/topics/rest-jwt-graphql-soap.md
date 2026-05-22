---
title: "REST, JWT, GraphQL, SOAP a WSDL"
description: "REST, JWT, GraphQL, SOAP a WSDL: exam-first answer, historical questions, source notes and image diagrams."
tags:
  - pis
  - api
  - high-roi
---

# REST, JWT, GraphQL, SOAP a WSDL

**ROI:** 11 bodov = 6 historická frekvencia + 5 recent boost.

**Minimum:** GraphQL vs REST, JWT časti, SOAP/WSDL/UDDI.

## Must Know subpages

- [GraphQL, REST a JWT](../must-know/graphql-rest-jwt) - 4x GraphQL, 2x REST/JWT, plus recent GraphQL signál
- [SOAP, WSDL a UDDI](../must-know/soap-wsdl-uddi) - Recent riadny termín


## Skúšková odpoveď

REST je bezstavový štýl API, preto každá požiadavka nesie potrebné údaje. Serverová session je problém, lebo stav by ostával na serveri. Pri autentizácii sa používa napríklad Basic cez HTTPS alebo tokeny, najmä JWT.

JWT má header, payload a signature. Payload nesie claims ako používateľ, roly/skupiny a expiráciu. Klient posiela token v hlavičke Authorization: Bearer. Server podpis overí bez nutnosti držať session.

GraphQL má jeden endpoint a klient určuje tvar odpovede. Server definuje schému v SDL, typy, Query a Mutation. SOAP je protokol s XML obálkou; WSDL formálne popisuje služby, operácie, parametre a endpointy. UDDI je register/katalóg webových služieb.

## Čo musíš vedieť

- Porovnať REST a GraphQL v endpointoch a tvare odpovede.
- Vysvetliť, prečo session nejde dokopy s bezstavovým REST.
- Nakresliť alebo popísať tri časti JWT.
- Povedať, čo sa definuje na serveri a klientovi pri GraphQL.
- Vysvetliť SOAP, WSDL a UDDI jednou až dvoma vetami.

## Recent signály

- Opravný 2024/25: GraphQL, porovnanie s REST a uloženie.
- Riadny 2024/25: Web services podľa SOAP, WSDL a UDDI.
- Finálny zoznam: GraphQL.

## Staré otázky a odpovede

### 4x GraphQL Co to je? V com sa lisi od REST? Popisat vlastnosti a datovy model (datove typy). Co treba definovat na klientskej a serverovej strane aby sme ho mohli pouzit?
Frekvencia v zdroji: **4x**.
K čemu to je:  
V DB mám informace o osobě (jméno, příjmení, email, adresa, …). Přijdu na nějakou stránku, která má zobrazovat informace o osobě, ale jen některé. A tady přichází na řadu GraphQL, které umožní v dotazu specifikovat, které informace chci vrátit (např. pouze jméno a příjmení).  
GrapqQL je dotazovací jazyk umožňující efektivnější přístup při tvorbě API. Pracuje na úrovni aplikační vrstvy, je silně typované. Dotaz na API specifikuje požadovaný tvar odpovědi. Oproti REST snižuje počet dotazů, objem přenášených dat a jejich redundanci. Také není třeba používat složitější logiku na klientovi (ve stylu mám 4 dotazy, 3 projdou v pohodě a poslední selže – co teď? ; GraphQL prostě jeden dotaz a ok/not ok).

| GraphQL | REST |
| :---- | :---- |
| Jeden endpoint | Mnoho endpointů |
| Vrací jen klientem specifikovaná data | Vrací “všechna” data |
| Nezávislé na protokolu | HTTP protokol |

Datový model:  
Jazyk pro popis: GraphQL SDL (schema definition language)  
Jednoduché typy: int, string, boolean, …  
Uživatelské typy (struktury): osoba, auto, …  
Speciální typy reprezentující volání API:

*  Query – pro čtení dat  
*  Mutations – pro změnu dat

Ukázka (Závorky -\> kolekce, \! -\> not null):  
type Person {  
        	name: String\!,  
        	age: Int\!,  
        	cars: \[car\!\]\!  
}  
type Query {  
        	findPerson(name: String\!): Person\!  
}  
type Mutations {  
        	CreatePerson(name: String\!, age: Int\!): Person\!  
}  
Cca takový popis je potřeba připravit na serveru, když chci publikovat GraphQL API.  
Klient zas musí specifikovat jaká data chce.  
findPerson (name: „James“) {  
        	age  
}  
Ukázka s HTTP:  
GET: [http://myapi.com/graphql?query={me{name](http://myapi/graphql?query=%7Bme%7Bname)}}  
POST: Specifikovat Data application/graphql a pak jen {me{name}}

---

### 2x Autentizacia v RESTe. Preco nie je mozne pouzit sessions? Uvedte mechanizmy autentizacie pre REST. Popiste JSON Web Token, co to je, z coho sa sklada a ako prebieha autentizacia pomocou JWT.
Frekvencia v zdroji: **2x**.
REST - bezstavový protokol  
Požadavek musí obsahovat vše, žádné ukládání stavu na serveru

**Proč nejde použít session:**  
Sessions se ukládají na serveru, což však vylučují předchozí body

**Mechanismy:**   
HTTP Basics autentizace  
JWT token  
OAuth

**Popis JWT:**  
Představuje způsob pro bezpečnou výměnu informací mezi dvěma stranami.  
Cílem JWT je možnost ověření autenticity dat.  
Má omezenou platnost, ve finále je to hodně dlouhý string.

**Z čeho se skládá:**   
Hlavička - účel, použité algoritmy  
Payload - JSON data obsahující ID uživatele, jeho práva, expiraci, ...  
Podpis - pro ověření, že token nebyl podvržen nebo změněn cestou

Tyto tři části se zakódují pomocí base64 a spojí do jednoho celku xxxx.yyyy.zzzz (odděleny tečkami)

**Průběh:**  
Klient kontaktuje autentizační server a dodá autentizační údaje. Server je ověří,  
vygeneruje podepsaný JWT token a vrátí jej klientovi. Klient při každém API requestu zašle v hlavičce  
Authorization: Bearer xxxx.yyyy.zzzz  
API ověří token (platnost, roli, ...) a buď provede nebo zamítne operaci

- HTTP Basics by muselo pri kazdom poziadavku pozerat do DB, teda kazdy endpoint by musel mat pristup k DB… u JWT staci aby mala pristup ta jedna mikrosluzba generujuca tokeny

@App.Path(“resources”)  
@LoginConfig(AuthMethod=”MP-JWT”)  
@DeclareRoles({‘admin’,’registered’,...})  
public clas ……

u kokretneho endpointu  
@Path(“reservations/”)  
@RolesAllowed(“admin”)

## Poznámky z prípravy

## P4

### Popis služieb v REST

Keďže architektúra REST môže byť pri voľnom pridávaní endpointov chaotická, je dôležitý ich formálny popis:

### Spôsoby autentizácie v REST

REST je podľa definície **bezstavový**, čo znamená, že každá požiadavka musí obsahovať všetky údaje potrebné na spracovanie (teoreticky to vylučuje sessions na serveri).

* **HTTP Basic autentizácia:**  
  * Meno a heslo sa posielajú v hlavičke `Authorization`.  
  * Údaje sú len kódované (base64), preto je **nevyhnutné použiť HTTPS**.  
  * Ak chýba autentizácia, server vráti kód **401 Unauthorized**.  
* **Tokeny (napr. JWT):** Token je validovateľný priamo na serveri bez nutnosti držať session.  

### JSON Web Token (JWT)

JWT je kompaktný řetězec, ktorý slúži na bezpečný prenos informácií medzi stranami ako objekt JSON.

* **Štruktúra (tri časti spojené bodkou):**  
  * **Header (hlavička):** Obsahuje typ tokenu a použitý algoritmus podpisu.  
  * **Payload (obsah):** Dáta vo forme "claims" (napr. ID používateľa, jeho roly/skupiny, čas expirácie). Claims:  
    * **iss (Issuer):** **vydavateľ tokenu**  
    * **upn (User Principal Name):** **jednoznačné meno používateľa** (identifikátor)  
    * **groups:** **zoznam rolí alebo skupín**, do ktorých je používateľ zaradený  
  * **Signature (podpis):** Slúži na overenie, že token nebol cestou zmenený (integrita).  
  * ![](../assets/images/prep-image14.png)  
* **Proces použitia:**  
  * Klient pošle prihlasovacie údaje na autentizačný server.  
  * Server vygeneruje a **podpíše JWT** (privátnym kľúčom), ktorý vráti klientovi.  
  * Klient ukladá token a posiela ho v každej požiadavke v hlavičke: `Authorization: Bearer <token>`.  
* **JWT v Jave (MicroProfile):**  
  * Nie je priamo v jadre Jakarta EE, ale je súčasťou **MicroProfile**, čo moderné servery (Payara, Liberty) podporujú.  
  * **Autorizácia v kóde:** Zapína sa anotáciou `@LoginConfig(authMethod = "MP-JWT")` v konfigurácii JAX-RS.  
  * Prístup k endpointom sa riadi anotáciou **@RolesAllowed**, ktorá kontroluje roly definované priamo v tokene.

### GraphQL

* **Problém RESTu:** REST endpointy vracajú vždy fixnú štruktúru dát, čo vedie k redundancii (klient dostane viac dát, než potrebuje) alebo k potrebe viacerých dotazov na získanie súvisiacich informácií.  
* **Riešenie GraphQL:** Klient si v dotaze sám špecifikuje **presný tvar odpovede**, ktorú potrebuje.  
* **Výhody:** Predvídateľný výsledok, eliminácia nadbytočných dát a vyššia efektivita pri získavaní dát, ktoré sú "drahé" na spracovanie.

**Dátový model (Schéma)**

* **Typy dát:** Využíva jednoduché typy (Int, Float, String, Boolean, ID, enum) a užívateľské štruktúry.  
* **Root types (Koreňové typy):** Špeciálne typy reprezentujúce samotné volanie API:  
  * **Query:** Slúži výhradne na čítanie dát.  
  * **Mutation:** Slúži na zmenu dát (zápis, aktualizácia, mazanie).  
* **SDL (Schema Definition Language):** Jazyk na formálnu definíciu typov a operácií.

**Operácie a komunikácia**

* **Dotazy (Queries):** Umožňujú vyžiadať si konkrétne polia (vlastnosti) objektov, a to aj zanorených (napr. osoba a jej autá).  
* **Modifikácie (Mutations):** Definujú parametre pre zmenu dát a návratovú hodnotu (napr. ID vytvoreného objektu).  
* **GraphQL cez HTTP:**  
  * Využíva sa **jediné endpoint URL** pre všetky operácie.  
  * Dáta sa posielajú cez **POST** (ako JSON s kľúčom "query") alebo cez **GET** priamo v URL.

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

