---
title: "Bare Minimum"
description: "Shortest pass-focused checklist for PIS."
tags:
  - pis
  - analysis
  - minimum
---

# Bare Minimum

Toto je najkratší zoznam, ktorý má najlepší pomer body/čas.

## Must Know subcategory

Začni tu: [Must Know](../must-know). Je to ešte kratšia vrstva než plné topic stránky.

## 1. Workflow

- Definície: proces, prípad, úloha, zdroj, pracovná položka, aktivita.
- WfMC: WES, workflow engine, 5 rozhraní.
- Dáta: riadiace, vecné, aplikačné.
- Brány: AND, XOR, OR split/join.

## 2. OLAP a DWH

- DWH vs OLTP.
- Kocka = dimenzie -> fakty.
- Súčet a priemer, základný kuboid.
- Roll-up, drill-down, pivot, slice, dice.
- Star schema, snowflake schema.

## 3. Zotaviteľná fronta a transakcie

- Fronta pre plánovanú prácu, musí byť trvanlivá.
- Vlož/vyber koordinované s commit/rollback.
- Príklad objednávka -> expedícia -> fakturácia.
- Savepoint vs zreťazené transakcie, riadiaca vs stavová vrstva, commit() vs chain().

## 4. Web vizualizácia

- Canvas = raster, nie DOM prvky.
- SVG = vektor, DOM prvky, vhodné na diagramy.
- D3 = dáta -> DOM/SVG.
- GeoJSON = Point, LineString, Polygon + knižnice ako Leaflet alebo d3-geo.

## 5. API a architektúry

- GraphQL vs REST.
- JWT = header.payload.signature.
- SOAP = XML protokol, WSDL = popis služby, UDDI = register služieb.
- Mikroslužby vs monolit, sync REST/gRPC/SOAP vs async broker.

## 6. Rýchle zvyšky

- CDI scopes: Dependent, Request, Session, Application.
- Gestalt + preattentive atribúty.
- Dedičnosť, extent, vícetypovosť.
- Bullet graf.
