---
title: "CDI a Java Backend"
description: "CDI a Java Backend: exam-first answer, historical questions, source notes and image diagrams."
tags:
  - pis
  - java
---

# CDI a Java Backend

**ROI:** 2 bodov = 2 historická frekvencia + 0 recent boost.

**Minimum:** DI, CDI kontajner, scopes.



## Skúšková odpoveď

Dependency Injection znižuje priame závislosti medzi triedami. Objekt si nevytvára konkrétnu implementáciu ručne, ale dostane ju zvonka, čo zlepšuje výmenu implementácie a testovanie.

CDI je štandardný mechanizmus DI v Jakarta EE. Objekty vytvára a spravuje CDI kontajner, injektovanie sa robí cez @Inject. Scope definuje životný cyklus objektu.

@Dependent vzniká pre vlastníka a zaniká s ním. @RequestScoped žije počas jedného HTTP requestu, @SessionScoped počas používateľskej session a @ApplicationScoped je jedna inštancia pre aplikáciu.

## Čo musíš vedieť

- Definovať DI a prečo sa používa.
- Povedať, kto vytvára CDI objekty.
- Napísať krátky príklad @Inject.
- Vysvetliť @Dependent, @RequestScoped, @SessionScoped a @ApplicationScoped.

## Recent signály

- V súbore `PIS-zbytok.md` nie je priama zmienka.

## Staré otázky a odpovede

### 2x CDI \- Popiste CDI, ako sa definuju CDI objekty, kto ich vytvara. Popiste pojem scope v tomto kontexte, vysvetlite request, session, application scope.
Frekvencia v zdroji: **2x**.
Contexts and Dependency Injection (CDI) - obmedzuje závislosti medzi triedami priamo v kóde  
vytváranie objektov zaisťuje CDI kontajner  
scope - poskytuje objektu dobre definovaný životný model

- @Dependent - vzniká pre konkrétny prípad, zaniká s vlastníkom (defaultne)  
* @RequestScoped – inštancia trvá po dobu HTTP požadavku  
* @SessionScoped – inštancia trvá po dobu HTTP session  
* @ApplicationScoped – jedna inštancia pre aplikáciu

**@Named("myBean")**  
**@RequestScoped**  
**public class MyBean {**

    **@Inject**  
    **private MyDependency myDependency;**

    **public void doSomething() {**  
        **// use myDependency**  
    **}**  
**}**

## Poznámky z prípravy

### P2 Java Backend

**Dependency Injection (DI)**

* **Princíp:** Ide o mechanizmus na **voľné prepojenie** (loose coupling) komponentov v aplikácii.  
* **Účel:** DI obmedzuje priame závislosti medzi triedami v kóde, čo zvyšuje **flexibilitu** (umožňuje jednoduchú výmenu implementácie) a uľahčuje **testovanie**.

**Contexts and Dependency Injection (CDI):**

* Moderný a obecný mechanizmus pre **Dependency Injection (DI)**.  
* Umožňuje voľné prepojenie tried, čo uľahčuje testovanie a údržbu.  
* Používa anotáciu `@Inject` na získanie inštancií objektov.  
* Definuje **životný cyklus (Scope)** objektov:  
  * `@Dependent`: (default) Objekt vzniká špecificky pre daný prípad (pre konkrétneho vlastníka, do ktorého je injektovaný). Jeho životný cyklus je pevne spätý s jeho vlastníkom – to znamená, že zaniká v rovnakom okamihu ako objekt, do ktorého bol vložený.  
  * `@RequestScoped`: Objekt žije počas jedného HTTP požiadavku.  
  * `@SessionScoped`: Objekt žije počas celej relácie používateľa.  
  * `@ApplicationScoped`: Jedna inštancia pre celú aplikáciu.

