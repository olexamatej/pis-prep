---
title: "Canvas, SVG, D3 a GeoJSON"
description: "Canvas, SVG, D3 a GeoJSON: distilled must-know exam answer."
tags:
  - pis
  - must-know
---

# Canvas, SVG, D3 a GeoJSON

**Frekvencia/signál:** 3x Canvas/SVG, 2x D3, 1x GeoJSON, plus recent webviz signál

**Plná téma:** [canvas svg d3 geojson](../topics/canvas-svg-d3-geojson)

## Otázka 1: Canvas a SVG: popíšte ich a uveďte vzťah k DOM a diagramom.

### Intuícia

- Canvas je kreslenie pixelov na plátno.
- SVG je strom vektorových DOM prvkov.
- Pre diagramy je SVG často lepšie, lebo každý tvar môžeš meniť a klikať samostatne.

### Krátka odpoveď

Canvas je rastrové plátno kreslené cez API; jednotlivé nakreslené tvary nie sú DOM prvky. SVG je vektorové XML; tvary ako rect, circle a path sú DOM prvky. Pre diagramy je typicky lepšie SVG, lebo prvky možno selektovať, štýlovať a obsluhovať udalosťami.

### Čo napísať na skúške

- Canvas: raster, getContext(), dobré pre veľa objektov a animácie.
- SVG: vektor, ostré pri zväčšení, prvky sú v DOM.
- Diagramy: SVG je výhodné pre klikateľné a meniteľné prvky.

### Diagram / obrázok / kód

```html
<canvas id="c" width="120" height="80"></canvas>
<script>
const ctx = document.getElementById("c").getContext("2d")
ctx.fillRect(10, 10, 80, 40)
</script>
```

```html
<svg width="120" height="80">
  <rect x="10" y="10" width="80" height="40" />
</svg>
```

### Pozor na pasce

- Nezabudnúť povedať DOM rozdiel; to je jadro otázky.


---

## Otázka 2: Canvas: čo je context a napíšte krátky kód jedného prvku.

### Intuícia

- Canvas je len plocha; context je pero, ktorým na ňu kreslíš.
- Pre 2D odpoveď stačí getContext('2d') a jeden príkaz kreslenia.
- Po nakreslení už tvar nie je samostatný DOM element.

### Krátka odpoveď

Context je objekt získaný z canvasu, cez ktorý sa kreslí. Pre 2D kreslenie sa používa getContext('2d'), ktorý poskytuje metódy ako fillRect, stroke, beginPath alebo arc.

### Čo napísať na skúške

- Uviesť getContext('2d').
- Ukázať aspoň jeden konkrétny príkaz kreslenia.

### Diagram / obrázok / kód

```js
const canvas = document.querySelector("#canvas")
const ctx = canvas.getContext("2d")
ctx.fillStyle = "steelblue"
ctx.fillRect(10, 10, 80, 40)
```

### Pozor na pasce

- Canvas element sám o sebe nekreslí; kreslí sa cez context.


---

## Otázka 3: D3: selekcia podľa id, nahradenie textu v <p> a dogenerovanie podľa zoznamu.

### Intuícia

- D3 je hlavne prepojenie dát s DOM/SVG prvkami.
- select mení existujúci prvok, selectAll + data + enter vytvára chýbajúce prvky.
- Na skúške často stačí malý konkrétny kód, nie dlhá teória.

### Krátka odpoveď

D3 manipuluje dokument na základe dát. Vyberie existujúce DOM prvky cez select/selectAll, naviaže dáta cez data() a pre nové dáta vytvorí elementy cez enter().append().

### Čo napísať na skúške

- Vstup D3 sú dáta, napríklad pole, CSV alebo JSON.
- Výstup sú DOM/SVG elementy alebo zmeny existujúcich elementov.
- Použiť select pre jeden prvok a selectAll + data + enter pre zoznam.

### Diagram / obrázok / kód

![D3 príklad zo starých otázok](../assets/images/past-image13.png)

![D3 rozšírenie](../assets/images/past-image14.png)

![D3 enter/update ukážka](../assets/images/past-image15.png)

```js
const items = [15, 312, 24124]

d3.select("#answer").text("hotovo")

d3.select("#list")
  .selectAll("p")
  .data(items)
  .enter()
  .append("p")
  .text(d => d)
```

### Pozor na pasce

- Pri D3 nestačí povedať, že je to knižnica; často chcú konkrétny príkaz.


---

## Otázka 4: GeoJSON: čo to je, aké má typy a na čo sa používa?

### Intuícia

- Je to JSON, ktorý namiesto biznis objektov nesie geometriu na mape.
- Zapamätaj si Point, LineString a Polygon ako základ.
- Používa sa ako vrstva nad mapovým podkladom v knižniciach ako Leaflet alebo d3-geo.

### Krátka odpoveď

GeoJSON je štandardizovaný JSON formát pre geografické objekty. Základné typy sú Point, LineString a Polygon; často sa používajú aj MultiPoint, MultiLineString, MultiPolygon, Feature a FeatureCollection. Hodí sa na body, cesty, hranice a vrstvy na mapách.

### Čo napísať na skúške

- Point = bod, LineString = lomená čiara, Polygon = plocha.
- Praktické použitie: polohy miest, trasy, hranice štátov, mapové overlaye.
- Knižnice: d3-geo, Leaflet, Google Maps API.

### Diagram / obrázok / kód

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [17.1077, 48.1486]
  },
  "properties": {
    "name": "Bratislava"
  }
}
```

### Pozor na pasce

- GeoJSON nie je obrázok mapy; je to dátový formát s geometriou a vlastnosťami.

