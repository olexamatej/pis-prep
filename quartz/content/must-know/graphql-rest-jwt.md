---
title: "GraphQL, REST a JWT"
description: "GraphQL, REST a JWT: distilled must-know exam answer."
tags:
  - pis
  - must-know
---

# GraphQL, REST a JWT

**Frekvencia/signál:** 4x GraphQL, 2x REST/JWT, plus recent GraphQL signál

**Plná téma:** [rest jwt graphql soap](../topics/rest-jwt-graphql-soap)

## Otázka 1: GraphQL: čo to je, v čom sa líši od REST a aký má dátový model?

### Intuícia

- REST rozmýšľa cez zdroje a endpointy.
- GraphQL rozmýšľa cez typy a dotaz, ktorý si vyberie presné polia.
- Nie je to databáza; je to API kontrakt a runtime.

### Krátka odpoveď

GraphQL je dotazovací jazyk a runtime pre API, kde klient určuje presný tvar odpovede. Oproti RESTu typicky používa jeden endpoint a nevracia fixnú štruktúru pre každý endpoint.

### Čo napísať na skúške

- REST: veľa endpointov, fixný tvar odpovede.
- GraphQL: jeden endpoint, klient pýta konkrétne polia.
- Dátový model: skalárne typy, používateľské typy, Query a Mutation.
- Schéma sa definuje v SDL.

### Diagram / obrázok / kód

```graphql
type Person {
  name: String!
  age: Int!
}

type Query {
  person(id: ID!): Person
}
```

### Pozor na pasce

- GraphQL nie je databáza; je to vrstva API.


---

## Otázka 2: Čo treba definovať na klientovi a serveri, aby sme GraphQL mohli použiť?

### Intuícia

- Server definuje, čo existuje a ako sa to vypočíta.
- Klient definuje, čo presne chce dostať.
- Schéma je dohoda medzi oboma stranami.

### Krátka odpoveď

Server musí mať schému a resolvery, ktoré vedia naplniť polia v schéme. Klient musí poslať query alebo mutation s konkrétnym výberom polí, ktoré chce dostať.

### Čo napísať na skúške

- Server: typy, Query, Mutation, resolvery.
- Klient: query/mutation a výber polí.
- Cez HTTP sa často posiela POST s JSON telom obsahujúcim query.

### Diagram / obrázok / kód

```graphql
query {
  person(id: 1) {
    name
    age
  }
}
```

### Pozor na pasce

- Klient nepýta 'všetko'; pointa je presný výber polí.


---

## Otázka 3: Autentizácia v RESTe: prečo nie sessions, mechanizmy a JWT.

### Intuícia

- REST chce, aby každá požiadavka niesla vlastný kontext.
- JWT je podpísaná kartička, ktorú klient posiela pri každom volaní.
- Podpis overuje, že obsah nikto nezmenil; payload sám o sebe netají dáta.

### Krátka odpoveď

REST je bezstavový, preto by server nemal držať stav klienta v session. Každá požiadavka má niesť všetko potrebné na spracovanie. JWT je kompaktný podpísaný token, ktorý klient posiela v hlavičke Authorization.

### Čo napísať na skúške

- Mechanizmy: HTTP Basic cez HTTPS, tokeny/JWT, OAuth.
- JWT časti: header, payload, signature.
- Payload nesie claims, napríklad používateľa, roly a expiráciu.
- Podpis overuje integritu tokenu.
- Použitie: Authorization: Bearer <token>.

### Diagram / obrázok / kód

![JWT štruktúra](../assets/images/prep-image14.png)

```http
Authorization: Bearer header.payload.signature
```

### Pozor na pasce

- JWT payload nie je automaticky tajný; podpis rieši integritu, nie šifrovanie.

