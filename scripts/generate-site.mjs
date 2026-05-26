import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const quartzDir = path.join(root, "quartz")
const contentDir = path.join(quartzDir, "content")
const assetsDir = path.join(contentDir, "assets", "images")

const prepFile = "PIS_priprava_speedrun(1).md"
const pastFile = "PIS-najčastejšie otázky.md"
const recentFile = "PIS-zbytok.md"

const prepRaw = fs.readFileSync(path.join(root, prepFile), "utf8")
const pastRaw = fs.readFileSync(path.join(root, pastFile), "utf8")
const recentRaw = fs.readFileSync(path.join(root, recentFile), "utf8")

const imageRegistry = new Map()
const expectedOutputs = new Set()

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function markExpected(target) {
  expectedOutputs.add(target)
}

function writeBufferIfChanged(target, nextBuffer) {
  markExpected(target)
  ensureDir(path.dirname(target))

  if (fs.existsSync(target)) {
    const prevBuffer = fs.readFileSync(target)
    if (Buffer.compare(prevBuffer, nextBuffer) === 0) return
  }

  fs.writeFileSync(target, nextBuffer)
}

function writeTextIfChanged(target, nextText) {
  markExpected(target)
  ensureDir(path.dirname(target))

  if (fs.existsSync(target)) {
    const prevText = fs.readFileSync(target, "utf8")
    if (prevText === nextText) return
  }

  fs.writeFileSync(target, nextText)
}

function pruneUnexpectedFiles(dir) {
  if (!fs.existsSync(dir)) return

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      pruneUnexpectedFiles(target)
      if (fs.readdirSync(target).length === 0) {
        fs.rmdirSync(target)
      }
      continue
    }

    if (!expectedOutputs.has(target)) {
      fs.unlinkSync(target)
    }
  }
}

function slugify(input) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function yamlString(input) {
  return JSON.stringify(input)
}

function extractImages(sourceName, raw, prefix) {
  const map = new Map()
  const imageRe = /^\[image(\d+)\]:\s*<data:image\/([a-zA-Z0-9+.-]+);base64,([^>]+)>\s*$/gm
  let match

  while ((match = imageRe.exec(raw)) !== null) {
    const [, id, extRaw, base64] = match
    const ext = extRaw === "jpeg" ? "jpg" : extRaw
    const filename = `${prefix}-image${id}.${ext}`
    const target = path.join(assetsDir, filename)
    writeBufferIfChanged(target, Buffer.from(base64, "base64"))
    map.set(`image${id}`, filename)
  }

  imageRegistry.set(sourceName, map)
}

function stripImageDefinitions(markdown) {
  return markdown
    .replace(/^\[image\d+\]:\s*<data:image\/[^;]+;base64,[^>]+>\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function relativeAssetPath(pageDir, filename) {
  const from = path.join(contentDir, pageDir)
  const to = path.join(assetsDir, filename)
  return path.relative(from, to).replaceAll(path.sep, "/")
}

function transformMarkdown(markdown, sourceName, pageDir) {
  const sourceImages = imageRegistry.get(sourceName) ?? new Map()
  return stripImageDefinitions(markdown)
    .replace(/\{#[^}]+}/g, "")
    .replace(/\\-/g, "-")
    .replace(/\\=/g, "=")
    .replace(/\\\+/g, "+")
    .replace(/\\&/g, "&")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/!?\[\]\[image(\d+)\]/g, (full, id) => {
      const filename = sourceImages.get(`image${id}`)
      if (!filename) return full
      return `![](${relativeAssetPath(pageDir, filename)})`
    })
    .replace(/^\s*#{3,6}\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function demoteHeadings(markdown, by = 1) {
  return markdown.replace(/^(#{1,5})\s+/gm, (hashes) => `${"#".repeat(by)}${hashes}`)
}

function headingLevel(line) {
  const match = /^(#{1,6})\s+/.exec(line)
  return match ? match[1].length : null
}

function extractHeadingSection(raw, headingText) {
  const lines = raw.split(/\r?\n/)
  const start = lines.findIndex((line) => line.replace(/\{#[^}]+}/g, "").trim() === headingText)
  if (start === -1) return ""
  const level = headingLevel(lines[start]) ?? 1
  let end = lines.length
  for (let i = start + 1; i < lines.length; i++) {
    const nextLevel = headingLevel(lines[i])
    if (nextLevel !== null && nextLevel <= level) {
      end = i
      break
    }
  }
  return lines.slice(start, end).join("\n").trim()
}

function parsePastQuestions(raw) {
  const text = stripImageDefinitions(raw)
  const lines = text.split(/\r?\n/)
  const sections = []
  let current = null

  for (const line of lines) {
    const match = /^######\s*(.*?)\s*(?:\{#[^}]+})?\s*$/.exec(line)
    if (match) {
      if (current && current.title.trim()) sections.push(current)
      const title = match[1].trim()
      current = { title, lines: [] }
    } else if (current) {
      current.lines.push(line)
    }
  }

  if (current && current.title.trim()) sections.push(current)

  return sections.map((section) => {
    const counts = [...section.title.matchAll(/(\d+)x/g)].map((m) => Number(m[1]))
    const count = counts.length > 1 && section.title.startsWith("15x WF") ? counts[1] : counts[0] || 1
    return {
      ...section,
      count,
      body: section.lines.join("\n").trim(),
    }
  })
}

function findQuestions(patterns) {
  return pastQuestions.filter((question) =>
    patterns.some((pattern) => pattern.test(question.title)),
  )
}

function questionBlock(questions, pageDir) {
  if (questions.length === 0) return "_V starých otázkach nebola nájdená samostatná otázka._"

  return questions
    .map((question) => {
      const body = transformMarkdown(question.body, pastFile, pageDir)
      return [
        `### ${question.title}`,
        "",
        `Frekvencia v zdroji: **${question.count}x**.`,
        "",
        body,
      ]
        .filter(Boolean)
        .join("\n")
    })
    .join("\n\n---\n\n")
}

function recentBlock(lines) {
  return lines.length
    ? lines.map((line) => `- ${line}`).join("\n")
    : "- V súbore `PIS-zbytok.md` nie je priama zmienka."
}

function sourceExcerpt(sourceName, pageDir, headingNames) {
  return headingNames
    .map((headingName) => extractHeadingSection(sourceName === prepFile ? prepRaw : pastRaw, headingName))
    .filter(Boolean)
    .map((section) => demoteHeadings(transformMarkdown(section, sourceName, pageDir), 1))
    .join("\n\n")
}

function frontmatter(title, description, tags = []) {
  const tagText = tags.length ? `\ntags:\n${tags.map((tag) => `  - ${tag}`).join("\n")}` : ""
  return `---\ntitle: ${yamlString(title)}\ndescription: ${yamlString(description)}${tagText}\n---\n\n`
}

function writeContent(relativePath, body) {
  const target = path.join(contentDir, relativePath)
  const nextText = body.endsWith("\n") ? body : `${body}\n`
  writeTextIfChanged(target, nextText)
}

function table(rows) {
  const header = "| Poradie | Téma | Base | Recent boost | ROI | Minimum |\n|---:|---|---:|---:|---:|---|\n"
  return (
    header +
    rows
      .map(
        (row, index) =>
          `| ${index + 1} | [${row.title}](${row.link}) | ${row.base} | ${row.recentBoost} | **${row.score}** | ${row.minimum} |`,
      )
      .join("\n")
  )
}

const pastQuestions = parsePastQuestions(pastRaw)

const recentLines = {
  workflow: [
    "Opravný 2024/25: Workflow ako riadny termín, ale OR-split.",
    "Riadny 2024/25: Workflow, definícia návrhárom, zobrazenie, AND-split nakresliť a popísať.",
    "Finálny zoznam: Workflow - riadne procesu.",
    "Riadny 2025/2026: Workflow - čo to je, ako sa popisuje a AND split/join.",
  ],
  olap: [
    "Opravný 2024/25: Definovať dátový sklad a porovnať s OLTP.",
    "Riadny 2024/25: Všeobecne definovať kocku, súčet v OLAP, roll-up, drill-down, pivot, dice & slice.",
    "Finálny zoznam: Kocka - dimenzie, aktívne dimenzie, OLAP operácie s kockou.",
    "Riadny 2025/2026: Dátový sklad, schéma, OLAP vs OLTP a dátový model skladu.",
  ],
  transactions: [
    "Opravný 2024/25: Porovnanie zreťazených transakcií s commit() a chain(), atomicita a izolácia.",
    "Riadny 2024/25: Zotaviteľná fronta, operácie, vlastnosti a jednoduchý príklad.",
    "Finálny zoznam: zotaviteľná fronta.",
    "Riadny 2025/2026: Vrstva riadenia, vrstva stavu a commit() vs chain() pri zreťazených transakciách.",
  ],
  microservices: [
    "Opravný 2024/25: Mikroslužby, rozdiel od monolitu a komunikácia.",
    "Riadny 2024/25: Mikroslužby a asynchrónna komunikácia, technológie a príklady.",
    "Finálny zoznam: Mikroslužby.",
    "Riadny 2025/2026: Mikroslužby, synchrónne API rozhrania a asynchrónna komunikácia s implementáciou.",
  ],
  api: [
    "Opravný 2024/25: GraphQL, porovnanie s REST a uloženie.",
    "Riadny 2024/25: Web services podľa SOAP, WSDL a UDDI.",
    "Finálny zoznam: GraphQL.",
  ],
  java: [],
  webviz: [
    "Opravný 2024/25: SVG, krátky kód, výhody/nevýhody a Canvas.",
    "Riadny 2024/25: Canvas, rozdiel od SVG, jeden context prvok a kód.",
    "Riadny 2024/25: D3, selekcia podľa id, nahradenie v <p> a dogenerovanie zo zoznamu.",
    "Finálny zoznam: Canvas, D3js.",
    "Riadny 2025/2026: GeoJSON - čo to je, typy/štruktúry, použitie a JS knižnice.",
  ],
  vizTheory: [],
  objectModel: [],
}

const topics = [
  {
    key: "workflow",
    title: "Workflow a WfMC",
    file: "topics/workflow-a-wfmc.md",
    base: 15,
    recentBoost: 5,
    minimum: "Definície, WfMC model, AND/XOR/OR brány.",
    tags: ["pis", "workflow", "high-roi"],
    prepHeadings: ["# P7 Workflow"],
    questionPatterns: [/WF/i, /workflow/i],
    answer: `Workflow je technická automatizácia business procesu: riadi poradie aktivít, priraďuje ich zdrojom a vytvára pracovné položky pre konkrétne prípady. Na skúške treba vedieť najmä 3D pohľad: prípad, proces/úloha a zdroj/aktivita.

WfMC referenčný model má v strede WES, ktorý obsahuje jeden alebo viac workflow enginov. Okolo neho je päť rozhraní: nástroje definície procesu, workflow klienti, vyvolané aplikácie, iné WES systémy a administrácia/monitoring.

Pri bránach kresli jednoduchý tok: AND-split spustí všetky vetvy, AND-join čaká na všetky, XOR-split vyberie jednu vetvu, XOR-merge pokračuje po prvej prichádzajúcej vetve. OR-split aktivuje jednu alebo viac vetiev a OR-join čaká len na tie, ktoré sa skutočne spustili.`,
    checklist: [
      "Definovať proces, prípad, úlohu, zdroj, pracovnú položku a aktivitu.",
      "Nakresliť WfMC referenčný model a pomenovať 5 rozhraní.",
      "Rozlíšiť klientske a vyvolané aplikácie.",
      "Rozlíšiť riadiace, vecné a aplikačné dáta.",
      "Nakresliť AND, XOR a OR vetvenie/spájanie.",
    ],
  },
  {
    key: "olap",
    title: "OLAP, Kocky a Dátový Sklad",
    file: "topics/olap-kocky-datovy-sklad.md",
    base: 13,
    recentBoost: 5,
    minimum: "Kocka, agregácie, DWH vs OLTP, star/snowflake.",
    tags: ["pis", "olap", "high-roi"],
    prepHeadings: ["# P8 Business intelligence a OLAP"],
    questionPatterns: [/Multidimenzionalna|OLAP|Datový sklad|Dátový sklad|kocku|kostku/i],
    answer: `Dátový sklad je oddelené analytické úložisko pre rozhodovanie. Oproti OLTP je orientované na čítanie, historické dáta, integráciu zdrojov a agregácie. OLTP rieši aktuálne operačné transakcie.

Multidimenzionálna kocka je funkcia z kombinácie dimenzií do faktov. Najprv sa detailné záznamy zoskupia podľa rovnakých súradníc do základného kuboidu. Pri súčte sa fakty sčítajú, pri priemere treba niesť aj počet prvkov alebo súčet a count, inak priemer podkociek nemusí byť správny.

Operácie: roll-up zvyšuje agregáciu, drill-down zvyšuje detail, pivot mení usporiadanie dimenzií, slicing fixuje jednu dimenziu a dicing filtruje viac dimenzií. ROLAP drží dáta relačne, typicky v hviezde alebo vločke.`,
    checklist: [
      "Definovať DWH a povedať rozdiel oproti OLTP.",
      "Definovať dimenzie, fakty, základný kuboid a vrcholový kuboid.",
      "Vysvetliť súčet a priemer v kocke.",
      "Nakresliť hviezdu a vločku.",
      "Bez zaváhania vysvetliť roll-up, drill-down, pivot, slice a dice.",
    ],
  },
  {
    key: "transactions",
    title: "Zotaviteľné Fronty a Transakcie",
    file: "topics/zotavitelne-fronty-transakcie.md",
    base: 8,
    recentBoost: 5,
    minimum: "Fronta, riadiaca/stavová vrstva, commit vs chain.",
    tags: ["pis", "transactions", "high-roi"],
    prepHeadings: ["# P6 Procesy"],
    questionPatterns: [/Zotavitelna|Zretazene|Savepointy/i],
    answer: `Zotaviteľná fronta plánuje prácu na neskoršie vykonanie tak, aby požiadavka prežila haváriu a bola spracovaná práve raz v rámci očakávanej transakčnej logiky. Záznam obsahuje akciu a parametre, napríklad ID objednávky.

Operácie musia byť koordinované s transakciou: vložený záznam sa stane viditeľným až po commit; pri rollbacku sa odstráni. Vybraný záznam sa pri rollbacku musí vrátiť do fronty. Tým sa spája atomičnosť databázy a fronty.

Pri dlhších procesoch sa oplatí oddeliť riadiacu vrstvu od stavovej. Riadiaca vrstva určuje poradie krokov, vetvenie a spúšťacie podmienky; stavová vrstva nesie perzistentný stav prípadu alebo objektov medzi krokmi.

Savepointy sú v jednej transakcii a zachovávajú lokálne premenné. Zreťazené transakcie rozkladajú dlhý proces na samostatné podtransakcie; po commit() už nemožno vrátiť predchádzajúci efekt, atomicita celej transakcie padá a izolácia závisí od uvoľnenia kontextu. chain() drží kontext dlhšie a zlepšuje izoláciu za cenu výkonu.`,
    checklist: [
      "Definovať zotaviteľnú frontu a jej účel.",
      "Popísať vlož, vyber a obsah záznamu.",
      "Vysvetliť rollback pravidlá pre vložený/vybraný záznam.",
      "Dať príklad objednávka -> expedícia -> fakturácia.",
      "Rozlíšiť riadiacu a stavovú vrstvu procesu.",
      "Porovnať savepoint, commit() a chain().",
    ],
  },
  {
    key: "webviz",
    title: "Canvas, SVG, D3 a GeoJSON",
    file: "topics/canvas-svg-d3-geojson.md",
    base: 6,
    recentBoost: 8,
    minimum: "Rozdiel Canvas/SVG, D3 selekcie, GeoJSON typy a knižnice.",
    tags: ["pis", "visualization", "high-roi"],
    prepHeadings: ["# P9 Vizualizácia dát"],
    questionPatterns: [/Canvas|SVG|D3|GeoJSON|geograf/i],
    answer: `Canvas je rastrové plátno. Prvky po vykreslení nie sú samostatné DOM uzly, preto je vhodný na veľa objektov, hry a animácie, ale horšie sa s ním viažu udalosti na konkrétne tvary.

SVG je XML vektorová grafika. Prvky ako rect, circle, line a path sú v DOM, dajú sa štýlovať cez CSS a obsluhovať cez event handlery. Na diagramy a dátové vizualizácie je zvyčajne vhodnejšie SVG.

D3 transformuje dáta na DOM/SVG elementy. Treba vedieť select/selectAll, data(), enter(), text(), attr() a jednoduché dogenerovanie podľa poľa. GeoJSON je JSON formát pre geografické objekty ako Point, LineString a Polygon; v praxi sa používa s knižnicami ako d3-geo, Leaflet alebo Google Maps API.`,
    checklist: [
      "Povedať jednu vetu o Canvas a jednu o SVG.",
      "Napísať krátky Canvas kód s getContext('2d').",
      "Napísať krátke SVG s rect alebo circle.",
      "Napísať D3 selekciu podľa id a doplnenie položiek z poľa.",
      "Vymenovať rastrové, vektorové a kombinované mapy, GeoJSON typy a aspoň 2 knižnice.",
    ],
  },
  {
    key: "api",
    title: "REST, JWT, GraphQL, SOAP a WSDL",
    file: "topics/rest-jwt-graphql-soap.md",
    base: 6,
    recentBoost: 5,
    minimum: "GraphQL vs REST, JWT časti, SOAP/WSDL/UDDI.",
    tags: ["pis", "api", "high-roi"],
    prepHeadings: ["# P4", "# P5"],
    questionPatterns: [/GraphQL|Autentizacia|RESTe/i],
    answer: `REST je bezstavový štýl API, preto každá požiadavka nesie potrebné údaje. Serverová session je problém, lebo stav by ostával na serveri. Pri autentizácii sa používa napríklad Basic cez HTTPS alebo tokeny, najmä JWT.

JWT má header, payload a signature. Payload nesie claims ako používateľ, roly/skupiny a expiráciu. Klient posiela token v hlavičke Authorization: Bearer. Server podpis overí bez nutnosti držať session.

GraphQL má jeden endpoint a klient určuje tvar odpovede. Server definuje schému v SDL, typy, Query a Mutation. SOAP je protokol s XML obálkou; WSDL formálne popisuje služby, operácie, parametre a endpointy. UDDI je register/katalóg webových služieb.`,
    checklist: [
      "Porovnať REST a GraphQL v endpointoch a tvare odpovede.",
      "Vysvetliť, prečo session nejde dokopy s bezstavovým REST.",
      "Nakresliť alebo popísať tri časti JWT.",
      "Povedať, čo sa definuje na serveri a klientovi pri GraphQL.",
      "Vysvetliť SOAP, WSDL a UDDI jednou až dvoma vetami.",
    ],
  },
  {
    key: "microservices",
    title: "Mikroslužby a Komunikácia",
    file: "topics/mikrosluzby-komunikacia.md",
    base: 4,
    recentBoost: 5,
    minimum: "Monolit vs mikroslužby, 3 sync API, async broker.",
    tags: ["pis", "architecture", "high-roi"],
    prepHeadings: ["## Architektúry IS", "# P5"],
    questionPatterns: [/mikrosluž|mikrosluz/i],
    answer: `Mikroslužby delia systém na malé samostatné služby s vlastnou business logikou, API a často vlastnou databázou. Monolit sa vyvíja a nasadzuje ako jeden celok so zdieľanou databázou.

Výhody mikroslužieb sú nezávislé nasadzovanie, technologická voľnosť a kontinuálny vývoj. Nevýhody sú sieťová réžia, zložitejšie testovanie, distribuované zlyhania a kompatibilita API.

Synchrónna komunikácia znamená request/response a čakanie na odpoveď. Typické rozhrania sú REST/HTTP JSON, gRPC a SOAP; podľa stacku sa môže objaviť aj GraphQL. Asynchrónna komunikácia ide cez message broker: queue doručuje jednému konzumentovi, publish/subscribe doručuje všetkým odberateľom témy. Príklady: RabbitMQ, ActiveMQ, SQS, Kafka, Pulsar, SNS.`,
    checklist: [
      "Nakresliť web UI, API gateway, viac služieb a ich databázy.",
      "Porovnať monolit a mikroslužby.",
      "Vymenovať vlastnosti mikroslužby: API, konfigurácia, logovanie, health check.",
      "Rozlíšiť synchrónnu a asynchrónnu komunikáciu.",
      "Vedieť povedať aspoň 3 príklady synchrónnych API rozhraní.",
      "Povedať queue vs publish/subscribe a príklady technológií.",
    ],
  },
  {
    key: "vizTheory",
    title: "Gestalt, Vnímanie a Dashboardy",
    file: "topics/gestalt-vnimanie-dashboardy.md",
    base: 8,
    recentBoost: 0,
    minimum: "Gestalt, podvedomé atribúty, bullet graf.",
    tags: ["pis", "visualization"],
    prepHeadings: [],
    questionPatterns: [/Gestalt|Vedome|podvedome|Bullet/i],
    answer: `Podvedomé vnímanie predspracúva obraz rýchlo a bez vedomého úsilia. Vo vizualizácii sa využíva cez preattentive atribúty: poloha, dĺžka, veľkosť, tvar, orientácia, farba, intenzita a ohraničenie.

Gestalt princípy vysvetľujú, ako človek zoskupuje prvky: blízkosť, podobnosť, uzavretosť, kontinuita, spoločný osud a figura/pozadie. V dashboardoch pomáhajú znížiť kognitívnu záťaž.

Bullet graf je kompaktná jednorozmerná náhrada tachometra. Ukazuje aktuálnu hodnotu, cieľ a kvalitatívne pásma, takže sa z neho dá rýchlo čítať výkon voči cieľu.`,
    checklist: [
      "Vymenovať aspoň hlavné Gestalt princípy a nakresliť príklad.",
      "Rozlíšiť vedomé a podvedomé vnímanie.",
      "Vymenovať preattentive atribúty.",
      "Povedať, ako tieto princípy zlepšujú dashboard.",
      "Nakresliť bullet graf s hodnotou, cieľom a pásmami.",
    ],
  },
  {
    key: "objectModel",
    title: "Objektový Model, Dedičnosť a Vícetypovosť",
    file: "topics/objektovy-model-dedicnost-vicetypovost.md",
    base: 2,
    recentBoost: 0,
    minimum: "Jednoduchá/vícenásobná dedičnosť, extent, roly.",
    tags: ["pis", "object-model"],
    prepHeadings: ["# P3 Objektový model dát"],
    questionPatterns: [/dedicnost|Vícetypovost/i],
    answer: `Dedičnosť definuje nový typ ako rozdiel oproti predkovi. Následník je kompatibilný s predkom, ale nie opačne. Extent typu je množina jeho inštancií a extent predka zahŕňa aj inštancie následníkov.

Jednoduchá dedičnosť má jedného priameho predka a tvorí strom. Vícenásobná dedičnosť môže mať viac predkov a tvorí acyklický graf. Cyklus v grafe dedičnosti nesmie vzniknúť.

Vícetypovosť rieši, že persistentný objekt môže v čase niesť rôzne kombinácie rolí, napríklad osoba môže byť študent, čitateľ aj zamestnanec. Problémom sú nedovolené kombinácie rolí, ktoré sa riešia pravidlami súčasnej alebo výlučnej existencie.`,
    checklist: [
      "Definovať jednoduchú a vícenásobnú dedičnosť.",
      "Nakresliť strom a acyklický graf.",
      "Vysvetliť typovú kompatibilitu následník -> predok.",
      "Definovať extent.",
      "Vysvetliť vícetypovosť na osobe s rolami.",
    ],
  },
  {
    key: "java",
    title: "CDI a Java Backend",
    file: "topics/cdi-java-backend.md",
    base: 2,
    recentBoost: 0,
    minimum: "DI, CDI kontajner, scopes.",
    tags: ["pis", "java"],
    prepHeadings: ["## P2 Java Backend"],
    questionPatterns: [/CDI/i],
    answer: `Dependency Injection znižuje priame závislosti medzi triedami. Objekt si nevytvára konkrétnu implementáciu ručne, ale dostane ju zvonka, čo zlepšuje výmenu implementácie a testovanie.

CDI je štandardný mechanizmus DI v Jakarta EE. Objekty vytvára a spravuje CDI kontajner, injektovanie sa robí cez @Inject. Scope definuje životný cyklus objektu.

@Dependent vzniká pre vlastníka a zaniká s ním. @RequestScoped žije počas jedného HTTP requestu, @SessionScoped počas používateľskej session a @ApplicationScoped je jedna inštancia pre aplikáciu.`,
    checklist: [
      "Definovať DI a prečo sa používa.",
      "Povedať, kto vytvára CDI objekty.",
      "Napísať krátky príklad @Inject.",
      "Vysvetliť @Dependent, @RequestScoped, @SessionScoped a @ApplicationScoped.",
    ],
  },
]

const rows = topics
  .map((topic) => ({
    ...topic,
    score: topic.base + topic.recentBoost,
    link: topic.file.replace(/\.md$/, ""),
  }))
  .sort((a, b) => b.score - a.score)

const mustKnowPages = [
  {
    topicKey: "workflow",
    title: "Workflow pojmy a súvislosti",
    file: "must-know/workflow-pojmy.md",
    frequency: "8x historicky, plus recent workflow signál",
    source: "topics/workflow-a-wfmc",
    examItems: [
      {
        question:
          "Definujte proces, úloha, prípad, zdroj, pracovná položka, aktivita. Uveďte, ako spolu súvisia.",
        answer:
          "Workflow sa dá vysvetliť cez tri osi: proces definuje postup, prípad je konkrétne riešenie problému a zdroje vykonávajú prácu. Úloha je krok procesu, pracovná položka je úloha pre konkrétny prípad a aktivita je pracovná položka priradená konkrétnemu zdroju.",
        points: [
          "Proces: koordinačný mechanizmus naprieč organizáciou.",
          "Prípad: konkrétna inštancia riešeného problému.",
          "Úloha: krok procesu so vstupnými/výstupnými podmienkami.",
          "Zdroj: osoba alebo zariadenie, ktoré vie vykonať prácu.",
          "Pracovná položka: úloha pre konkrétny prípad.",
          "Aktivita: pracovná položka vykonávaná konkrétnym zdrojom; vytvára worklist.",
        ],
        media: {
          images: [
            { file: "past-image1.png", alt: "Workflow pojmy a súvislosti" },
            { file: "prep-image25.png", alt: "3D pohľad na workflow" },
          ],
        },
        traps: [
          "Proces nie je konkrétny beh; konkrétny beh je prípad.",
          "Pracovná položka ešte nemusí mať konkrétny zdroj; aktivita už áno.",
        ],
      },
    ],
  },
  {
    topicKey: "workflow",
    title: "WfMC referenčný model",
    file: "must-know/wfmc-referencny-model.md",
    frequency: "4x historicky, plus recent workflow otázky",
    source: "topics/workflow-a-wfmc",
    examItems: [
      {
        question: "Nakreslite schému referenčného modelu. Popíšte prvky a rozhrania stručne.",
        answer:
          "V strede modelu je WES, teda Workflow Enactment Service. WES obsahuje jeden alebo viac workflow enginov, ktoré interpretujú definíciu procesu, vytvárajú inštancie a riadia prechody medzi aktivitami.",
        points: [
          "Rozhranie 1: nástroje pre definíciu procesov.",
          "Rozhranie 2: workflow klienti.",
          "Rozhranie 3: vyvolané aplikácie.",
          "Rozhranie 4: iné WES/WFM systémy.",
          "Rozhranie 5: administrácia a monitoring.",
          "Workflow engine vytvára pracovné položky a riadi stav inštancií.",
        ],
        media: {
          images: [
            { file: "past-image2.png", alt: "WfMC referenčný model zo starých otázok" },
            { file: "prep-image24.png", alt: "WfMC referenčný model z prípravy" },
          ],
        },
        traps: [
          "Nestačí napísať len WES; body sú za prvky a rozhrania.",
          "Klientská aplikácia nie je vyvolaná aplikácia.",
        ],
      },
    ],
  },
  {
    topicKey: "workflow",
    title: "Workflow dáta, aplikácie a brány",
    file: "must-know/workflow-data-brany.md",
    frequency: "2x dáta/aplikácie, 1x AND/XOR, recent AND/OR split/join",
    source: "topics/workflow-a-wfmc",
    examItems: [
      {
        question: "Popíšte klientske a vyvolané aplikácie vo workflow.",
        answer:
          "Klientske aplikácie sú rozhrania, cez ktoré používatelia vykonávajú úlohy. Vyvolané aplikácie sú programy alebo služby, ktoré workflow systém spustí pri začatí alebo vykonávaní úlohy.",
        points: [
          "Klient workflow = interakcia používateľa s worklistom a úlohami.",
          "Vyvolaná aplikácia = automaticky alebo poloautomaticky spustený nástroj.",
          "Príklady vyvolaných aplikácií: účtovnícky systém, Word, interná služba, externé API.",
        ],
        media: {
          mermaid: `flowchart LR
  U["Používateľ"] --> C["Workflow klient"]
  C --> W["WES / workflow engine"]
  W --> A["Vyvolaná aplikácia"]
  W --> L["Worklist"]`,
        },
        traps: ["Klient je používateľské rozhranie; vyvolaná aplikácia robí podporujúcu prácu."],
      },
      {
        question: "Popíšte aplikačné, vecné a riadiace dáta vo workflow.",
        answer:
          "Riadiace dáta sú interné dáta workflow systému. Vecné dáta používa workflow jadro na rozhodovanie o ďalšom postupe. Aplikačné dáta patria konkrétnym podporným aplikáciám a workflow systém ich nemusí priamo čítať.",
        points: [
          "Riadiace dáta: stav procesu, interné údaje enginu, obnova po havárii.",
          "Vecné dáta: hodnoty používané v rozhodovacích pravidlách a smerovaní.",
          "Aplikačné dáta: špecifické dáta aplikácií mimo priamej kontroly workflow jadra.",
        ],
        media: {
          mermaid: `flowchart TB
  W["Workflow engine"]
  W --> R["Riadiace dáta: interný stav"]
  W --> V["Vecné dáta: rozhodovanie"]
  A["Podporná aplikácia"] --> D["Aplikačné dáta"]
  W -. "nemusí mať priamy prístup" .-> D`,
        },
        traps: [
          "Vecné dáta nie sú to isté ako aplikačné dáta.",
          "Riadiace dáta sú interné a bežné aplikácie ich nemajú používať.",
        ],
      },
      {
        question:
          "Nakreslite a popíšte AND-split, AND-join, XOR-split, XOR-merge, prípadne OR-split.",
        answer:
          "AND znamená paralelné spustenie alebo synchronizáciu všetkých vetiev. XOR znamená výber práve jednej vetvy alebo jednoduché spojenie alternatív. OR aktivuje jednu alebo viac vetiev podľa podmienok.",
        points: [
          "AND-split: rozdelí tok na viac paralelných vetiev.",
          "AND-join: čaká, kým skončia všetky predchádzajúce vetvy.",
          "XOR-split: podľa podmienky pustí práve jednu vetvu.",
          "XOR-merge: spojí alternatívne vetvy; nečaká na neaktívne vetvy.",
          "OR-split: aktivuje jednu alebo viac vetiev.",
          "OR-join: čaká len na tie vetvy, ktoré boli reálne aktivované.",
        ],
        media: {
          images: [
            { file: "past-image3.png", alt: "AND split" },
            { file: "past-image4.png", alt: "AND join" },
            { file: "past-image5.png", alt: "XOR split" },
            { file: "past-image6.png", alt: "XOR merge" },
          ],
          mermaid: `flowchart LR
  A["A"] --> G{"OR split"}
  G -->|podmienka 1| B["B"]
  G -->|podmienka 2| C["C"]
  G -->|môžu ísť obe| D["D"]
  B --> J{"OR join"}
  C --> J
  D --> J
  J --> E["pokračuj"]`,
        },
        traps: [
          "AND-join čaká na všetky vetvy.",
          "XOR-split vyberá práve jednu vetvu.",
          "OR-split nie je XOR; môže aktivovať viac vetiev.",
        ],
      },
    ],
  },
  {
    topicKey: "olap",
    title: "OLAP kocka a operácie",
    file: "must-know/olap-kocka-operacie.md",
    frequency: "8x historicky, plus recent OLAP/kocka signál",
    source: "topics/olap-kocky-datovy-sklad",
    examItems: [
      {
        question: "Definujte multidimenzionálnu kocku, dimenzie a aktívne dimenzie.",
        answer:
          "Multidimenzionálna kocka mapuje kombináciu hodnôt dimenzií na fakty. Dimenzie určujú súradnice, napríklad čas, produkt a miesto. Aktívne dimenzie sú tie dimenzie, ktoré sú v aktuálnom pohľade ponechané a podľa ktorých sa výsledok ešte člení.",
        points: [
          "Dimenzia: usporiadaná množina diskrétnych hodnôt alebo hierarchií.",
          "Fakt: číselná meraná hodnota v priesečníku dimenzií.",
          "Základný kuboid obsahuje všetky dimenzie.",
          "Vrcholový kuboid agreguje cez všetky dimenzie do jedného faktu.",
        ],
        media: {
          images: [
            { file: "past-image7.png", alt: "Multidimenzionálna kocka" },
            { file: "prep-image33.png", alt: "Model dimenzií a faktov" },
          ],
        },
        traps: ["Kocka nie je len obrázok; je to funkcia z dimenzií do faktov."],
      },
      {
        question: "Vysvetlite súčet a aritmetický priemer v OLAP kocke.",
        answer:
          "Pri súčte sa fakty za rovnaké ponechané súradnice sčítajú cez agregovanú dimenziu. Pri priemere nestačí priemerovať už vypočítané priemery; treba niesť súčet aj počet a výsledok počítať ako súčet / počet.",
        points: [
          "Detailné záznamy sa najprv spoja do základného kuboidu.",
          "Súčet je aditívna agregácia.",
          "Priemer je neaditívny bez počtu; správne je držať sum a count.",
          "Pri otázke na počet sa najprv zlučujú rovnaké súradnice a potom sa počíta počet podľa definície faktu.",
        ],
        media: {
          mermaid: `flowchart LR
  D["detailné riadky"] --> B["základný kuboid"]
  B --> S["sum = súčet hodnôt"]
  B --> C["count = počet hodnôt"]
  S --> A["average = sum / count"]
  C --> A`,
        },
        traps: ["Najčastejšia chyba je priemer z priemerov bez váh."],
      },
      {
        question: "Definujte roll-up, drill-down, pivot, slice a dice.",
        answer:
          "Tieto operácie menia pohľad na kocku. Roll-up zvyšuje agregáciu, drill-down zvyšuje detail, pivot mení usporiadanie dimenzií, slice fixuje jednu hodnotu dimenzie a dice filtruje viac dimenzií naraz.",
        points: [
          "Roll-up: napríklad deň -> mesiac -> rok.",
          "Drill-down: napríklad rok -> mesiac -> deň.",
          "Pivot: otočenie poradia dimenzií v pohľade.",
          "Slice: región = Praha.",
          "Dice: región = Praha, čas = Q1, kategória = elektro.",
        ],
        media: {
          images: [
            { file: "past-image8.png", alt: "OLAP operácie nad kockou" },
            { file: "past-image9.png", alt: "OLAP operácie vizuálne" },
            { file: "prep-image40.png", alt: "OLAP operácie z prípravy" },
          ],
        },
        traps: ["Slice je jeden rez; dice je viacrozmerný výber."],
      },
    ],
  },
  {
    topicKey: "olap",
    title: "Dátový sklad, OLTP a ROLAP",
    file: "must-know/datovy-sklad-rolap.md",
    frequency: "3x ROLAP/star/snowflake, 1x DWH, plus recent DWH",
    source: "topics/olap-kocky-datovy-sklad",
    examItems: [
      {
        question: "Definujte dátový sklad a porovnajte ho s OLTP.",
        answer:
          "Dátový sklad je oddelené analytické úložisko na podporu rozhodovania. Oproti OLTP neoptimalizuje operatívne transakcie, ale historické čítanie, integráciu zdrojov a agregované analytické dotazy.",
        points: [
          "DWH je subjektovo orientovaný, integrovaný, historický a nemenný/read-only.",
          "OLTP rieši aktuálne operácie, zápisy, zmeny a konzistenciu prevádzky.",
          "DWH sa periodicky dopĺňa cez ETL.",
          "DWH typicky obsahuje aktuálne aj historické údaje.",
        ],
        media: {
          images: [{ file: "past-image21.png", alt: "Architektúra dátového skladu" }],
        },
        traps: ["DWH nie je obyčajná produkčná databáza; pointa je analytika a história."],
      },
      {
        question: "Charakterizujte OLAP a ROLAP. Ako sa ukladá do relačnej DB?",
        answer:
          "OLAP slúži na analytické spracovanie a podporu rozhodovania. ROLAP necháva dáta v relačných tabuľkách, ale používateľovi ich prezentuje ako multidimenzionálny pohľad.",
        points: [
          "ROLAP používa relačné alebo rozšírené relačné SŘBD.",
          "Dáta sú uložené ako tabuľky faktov a tabuľky dimenzií.",
          "Výhoda ROLAP: menšia redundancia a dobrá škálovateľnosť.",
          "Nevýhoda: zložitejšie dotazy a potreba agregačnej logiky.",
        ],
        media: {
          images: [{ file: "past-image22.png", alt: "Dátový model skladu" }],
        },
        traps: ["ROLAP nie je vlastná multidimenzionálna štruktúra v pamäti; to je skôr MOLAP."],
      },
      {
        question: "Popíšte schému hviezdy a vločky.",
        answer:
          "Hviezda má jednu centrálnu tabuľku faktov a okolo nej tabuľky dimenzií. Vločka je zjemnenie hviezdy, kde sú hierarchie dimenzií normalizované do viacerých tabuliek.",
        points: [
          "Tabuľka faktov obsahuje numerické miery a cudzie kľúče do dimenzií.",
          "Dimenzie obsahujú popisné údaje, napríklad čas, produkt, miesto.",
          "Hviezda je jednoduchšia a menej normalizovaná.",
          "Vločka lepšie reprezentuje hierarchie, ale komplikuje dotazy.",
        ],
        media: {
          images: [
            { file: "prep-image37.png", alt: "Star schema" },
            { file: "prep-image38.png", alt: "Snowflake schema" },
            { file: "prep-image39.png", alt: "Fact constellation" },
          ],
        },
        traps: ["Nezameniť vločku s konšteláciou faktov; konštelácia má viac tabuliek faktov."],
      },
    ],
  },
  {
    topicKey: "transactions",
    title: "Zotaviteľná fronta",
    file: "must-know/zotavitelna-fronta.md",
    frequency: "6x historicky, plus recent fronta otázka",
    source: "topics/zotavitelne-fronty-transakcie",
    examItems: [
      {
        question: "Definujte zotaviteľnú frontu, princíp a súvislosť s transakciami.",
        answer:
          "Zotaviteľná fronta je trvanlivý mechanizmus na naplánovanie práce do budúcnosti. Je koordinovaná s transakciami tak, aby naplánovaná práca nezmizla pri havárii a aby rollback správne vrátil stav fronty.",
        points: [
          "Fronta musí prežiť haváriu systému.",
          "Vloženie a výber z fronty sú súčasťou transakčnej logiky.",
          "Používa sa, keď sa práca má vykonať až po úspešnom dokončení inej transakcie.",
        ],
        media: {
          mermaid: `flowchart LR
  T1["Transakcia objednávky"] -->|commit| Q["Zotaviteľná fronta"]
  Q --> W["Worker / server"]
  W --> T2["Transakcia expedície"]
  W --> T3["Transakcia fakturácie"]`,
        },
        traps: ["Hlavná vlastnosť nie je FIFO, ale trvanlivosť a transakčná koordinácia."],
      },
      {
        question: "Popíšte operácie, vlastnosti a rollback pravidlá zotaviteľnej fronty.",
        answer:
          "Základné operácie sú vlož a vyber. Vlož naplánuje záznam o práci spolu s parametrami. Vyber záznam odoberie pre transakciu, ktorá prácu vykoná. Pri rollbacku sa musí obnoviť aj stav fronty.",
        points: [
          "Vložený záznam sa stane dostupný až po commite vkladajúcej transakcie.",
          "Ak sa vkladajúca transakcia zruší, záznam z fronty zmizne.",
          "Ak transakcia záznam vyberie a potom rollbackne, záznam sa musí vrátiť.",
          "Záznam obsahuje akciu a dáta, napríklad ID objednávky.",
        ],
        media: {
          mermaid: `flowchart TB
  A["vložiť záznam"] --> B{"commit?"}
  B -->|áno| C["záznam je viditeľný"]
  B -->|rollback| D["záznam sa odstráni"]
  C --> E["vybrať záznam"]
  E --> F{"spracovanie commit?"}
  F -->|áno| G["záznam hotový"]
  F -->|rollback| C`,
        },
        traps: ["Necommitnuté záznamy nesmie vyberať iná transakcia."],
      },
      {
        question: "Ukážte použitie zotaviteľnej fronty na jednoduchom príklade.",
        answer:
          "Pri objednávke sa po úspešnom commite vložia do fronty požiadavky na expedíciu a fakturáciu. Aj keď systém spadne hneď po objednávke, fronta prežije a worker neskôr požiadavky spracuje.",
        points: [
          "Objednávka je prvá transakcia.",
          "Expedícia a fakturácia môžu byť samostatné neskoršie transakcie.",
          "Požiadavka sa nesmie stratiť ani vykonať nekonzistentne.",
        ],
        media: {
          mermaid: `sequenceDiagram
  participant O as Objednávka
  participant Q as Fronta
  participant E as Expedícia
  participant F as Fakturácia
  O->>Q: vlož požiadavky po commit
  Q->>E: vyber expedíciu
  Q->>F: vyber fakturáciu`,
        },
        traps: ["Neopisovať to ako jeden dlhý rollback; po commite sa ide dopredu cez ďalšie transakcie."],
      },
    ],
  },
  {
    topicKey: "transactions",
    title: "Zreťazené transakcie vs savepointy",
    file: "must-know/zretazene-transakcie-savepointy.md",
    frequency: "2x historicky, plus recent commit()/chain() otázka",
    source: "topics/zotavitelne-fronty-transakcie",
    examItems: [
      {
        question: "Porovnajte zreťazené transakcie so savepointmi.",
        answer:
          "Savepointy sú body návratu v jednej transakcii. Zreťazené transakcie delia dlhý proces na viac samostatných podtransakcií, ktoré sa postupne commitujú.",
        points: [
          "Savepoint rollback vracia DB do uloženého bodu, ale lokálne premenné môžu zostať.",
          "Pri zreťazení po commite už danú podtransakciu bežným rollbackom nevrátime.",
          "Zreťazenie zlepšuje výkon a skracuje zámky, ale oslabuje atomicitu celku.",
        ],
        media: {
          images: [{ file: "prep-image22.png", alt: "Zreťazené transakcie" }],
          mermaid: `flowchart TB
  subgraph Savepointy["Jedna transakcia"]
    A["start"] --> S1["savepoint 1"] --> S2["savepoint 2"] --> C["commit"]
  end
  subgraph Chain["Zreťazené transakcie"]
    T1["T1 commit"] --> T2["T2 commit"] --> T3["T3 commit"]
  end`,
        },
        traps: ["Zreťazený proces ako celok nie je jedna plne atomická ACID transakcia."],
      },
      {
        question: "Commit() vs chain(): sú dielčie transakcie a celá transakcia atomické a izolované?",
        answer:
          "Jednotlivé podtransakcie sú transakcie, takže lokálne môžu byť atomické a izolované. Celý zreťazený proces však pri commit() nie je atomický a izolácia celku sa zhorší, ak sa medzi krokmi uvoľní DB kontext. chain() drží kontext dlhšie a tým zlepšuje izoláciu, ale znižuje výkon.",
        points: [
          "commit(): zmeny sú potvrdené a môžu byť viditeľné iným transakciám.",
          "chain(): pokračuje sa ďalšou transakciou bez plného uvoľnenia kontextu.",
          "Atomicita celku: nie, po čiastočnom commite treba roll-forward alebo kompenzáciu.",
          "Izolácia celku: pri commit() oslabená, pri chain() lepšia, ale drahšia.",
        ],
        media: {
          mermaid: `flowchart LR
  A["S1"] -->|commit: uvoľní zmeny| B["S2"]
  B --> C["S3"]
  A2["S1"] -->|chain: drží kontext| B2["S2"]
  B2 --> C2["S3"]`,
        },
        traps: ["Ak sa stane fyzická akcia bez rollbacku, rieši sa dopredne alebo kompenzačne."],
      },
    ],
  },
  {
    topicKey: "webviz",
    title: "Canvas, SVG, D3 a GeoJSON",
    file: "must-know/canvas-svg-d3.md",
    frequency: "3x Canvas/SVG, 2x D3, 1x GeoJSON, plus recent webviz signál",
    source: "topics/canvas-svg-d3-geojson",
    examItems: [
      {
        question: "Canvas a SVG: popíšte ich a uveďte vzťah k DOM a diagramom.",
        answer:
          "Canvas je rastrové plátno kreslené cez API; jednotlivé nakreslené tvary nie sú DOM prvky. SVG je vektorové XML; tvary ako rect, circle a path sú DOM prvky. Pre diagramy je typicky lepšie SVG, lebo prvky možno selektovať, štýlovať a obsluhovať udalosťami.",
        points: [
          "Canvas: raster, getContext(), dobré pre veľa objektov a animácie.",
          "SVG: vektor, ostré pri zväčšení, prvky sú v DOM.",
          "Diagramy: SVG je výhodné pre klikateľné a meniteľné prvky.",
        ],
        media: {
          codeBlocks: [
            {
              lang: "html",
              code: `<canvas id="c" width="120" height="80"></canvas>
<script>
const ctx = document.getElementById("c").getContext("2d")
ctx.fillRect(10, 10, 80, 40)
</script>`,
            },
            {
              lang: "html",
              code: `<svg width="120" height="80">
  <rect x="10" y="10" width="80" height="40" />
</svg>`,
            },
          ],
        },
        traps: ["Nezabudnúť povedať DOM rozdiel; to je jadro otázky."],
      },
      {
        question: "Canvas: čo je context a napíšte krátky kód jedného prvku.",
        answer:
          "Context je objekt získaný z canvasu, cez ktorý sa kreslí. Pre 2D kreslenie sa používa getContext('2d'), ktorý poskytuje metódy ako fillRect, stroke, beginPath alebo arc.",
        points: ["Uviesť getContext('2d').", "Ukázať aspoň jeden konkrétny príkaz kreslenia."],
        media: {
          codeBlocks: [
            {
              lang: "js",
              code: `const canvas = document.querySelector("#canvas")
const ctx = canvas.getContext("2d")
ctx.fillStyle = "steelblue"
ctx.fillRect(10, 10, 80, 40)`,
            },
          ],
        },
        traps: ["Canvas element sám o sebe nekreslí; kreslí sa cez context."],
      },
      {
        question: "D3: selekcia podľa id, nahradenie textu v <p> a dogenerovanie podľa zoznamu.",
        answer:
          "D3 manipuluje dokument na základe dát. Vyberie existujúce DOM prvky cez select/selectAll, naviaže dáta cez data() a pre nové dáta vytvorí elementy cez enter().append().",
        points: [
          "Vstup D3 sú dáta, napríklad pole, CSV alebo JSON.",
          "Výstup sú DOM/SVG elementy alebo zmeny existujúcich elementov.",
          "Použiť select pre jeden prvok a selectAll + data + enter pre zoznam.",
        ],
        media: {
          images: [
            { file: "past-image13.png", alt: "D3 príklad zo starých otázok" },
            { file: "past-image14.png", alt: "D3 rozšírenie" },
            { file: "past-image15.png", alt: "D3 enter/update ukážka" },
          ],
          codeBlocks: [
            {
              lang: "js",
              code: `const items = [15, 312, 24124]

d3.select("#answer").text("hotovo")

d3.select("#list")
  .selectAll("p")
  .data(items)
  .enter()
  .append("p")
  .text(d => d)`,
            },
          ],
        },
        traps: ["Pri D3 nestačí povedať, že je to knižnica; často chcú konkrétny príkaz."],
      },
      {
        question: "GeoJSON: čo to je, aké má typy a na čo sa používa?",
        answer:
          "GeoJSON je štandardizovaný JSON formát pre geografické objekty. Základné typy sú Point, LineString a Polygon; často sa používajú aj MultiPoint, MultiLineString, MultiPolygon, Feature a FeatureCollection. Hodí sa na body, cesty, hranice a vrstvy na mapách.",
        points: [
          "Point = bod, LineString = lomená čiara, Polygon = plocha.",
          "Praktické použitie: polohy miest, trasy, hranice štátov, mapové overlaye.",
          "Knižnice: d3-geo, Leaflet, Google Maps API.",
        ],
        media: {
          codeBlocks: [
            {
              lang: "json",
              code: `{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [17.1077, 48.1486]
  },
  "properties": {
    "name": "Bratislava"
  }
}`,
            },
          ],
        },
        traps: ["GeoJSON nie je obrázok mapy; je to dátový formát s geometriou a vlastnosťami."],
      },
    ],
  },
  {
    topicKey: "api",
    title: "GraphQL, REST a JWT",
    file: "must-know/graphql-rest-jwt.md",
    frequency: "4x GraphQL, 2x REST/JWT, plus recent GraphQL signál",
    source: "topics/rest-jwt-graphql-soap",
    examItems: [
      {
        question: "GraphQL: čo to je, v čom sa líši od REST a aký má dátový model?",
        answer:
          "GraphQL je dotazovací jazyk a runtime pre API, kde klient určuje presný tvar odpovede. Oproti RESTu typicky používa jeden endpoint a nevracia fixnú štruktúru pre každý endpoint.",
        points: [
          "REST: veľa endpointov, fixný tvar odpovede.",
          "GraphQL: jeden endpoint, klient pýta konkrétne polia.",
          "Dátový model: skalárne typy, používateľské typy, Query a Mutation.",
          "Schéma sa definuje v SDL.",
        ],
        media: {
          codeBlocks: [
            {
              lang: "graphql",
              code: `type Person {
  name: String!
  age: Int!
}

type Query {
  person(id: ID!): Person
}`,
            },
          ],
        },
        traps: ["GraphQL nie je databáza; je to vrstva API."],
      },
      {
        question: "Čo treba definovať na klientovi a serveri, aby sme GraphQL mohli použiť?",
        answer:
          "Server musí mať schému a resolvery, ktoré vedia naplniť polia v schéme. Klient musí poslať query alebo mutation s konkrétnym výberom polí, ktoré chce dostať.",
        points: [
          "Server: typy, Query, Mutation, resolvery.",
          "Klient: query/mutation a výber polí.",
          "Cez HTTP sa často posiela POST s JSON telom obsahujúcim query.",
        ],
        media: {
          codeBlocks: [
            {
              lang: "graphql",
              code: `query {
  person(id: 1) {
    name
    age
  }
}`,
            },
          ],
        },
        traps: ["Klient nepýta 'všetko'; pointa je presný výber polí."],
      },
      {
        question: "Autentizácia v RESTe: prečo nie sessions, mechanizmy a JWT.",
        answer:
          "REST je bezstavový, preto by server nemal držať stav klienta v session. Každá požiadavka má niesť všetko potrebné na spracovanie. JWT je kompaktný podpísaný token, ktorý klient posiela v hlavičke Authorization.",
        points: [
          "Mechanizmy: HTTP Basic cez HTTPS, tokeny/JWT, OAuth.",
          "JWT časti: header, payload, signature.",
          "Payload nesie claims, napríklad používateľa, roly a expiráciu.",
          "Podpis overuje integritu tokenu.",
          "Použitie: Authorization: Bearer <token>.",
        ],
        media: {
          images: [{ file: "prep-image14.png", alt: "JWT štruktúra" }],
          codeBlocks: [
            {
              lang: "http",
              code: `Authorization: Bearer header.payload.signature`,
            },
          ],
        },
        traps: ["JWT payload nie je automaticky tajný; podpis rieši integritu, nie šifrovanie."],
      },
    ],
  },
  {
    topicKey: "api",
    title: "SOAP, WSDL a UDDI",
    file: "must-know/soap-wsdl-uddi.md",
    frequency: "Recent riadny termín",
    source: "topics/rest-jwt-graphql-soap",
    examItems: [
      {
        question: "Web services podľa SOAP. K čomu sú štandardy WSDL a UDDI?",
        answer:
          "SOAP je štandardizovaný protokol webových služieb založený na XML správach. WSDL je formálny opis služby a jej operácií. UDDI je register, v ktorom sa služby dajú publikovať a vyhľadávať.",
        points: [
          "SOAP správa má Envelope, voliteľný Header a Body.",
          "WSDL opisuje operácie, vstupy, výstupy, dátové typy a endpoint.",
          "Z WSDL sa dajú generovať stuby alebo serverové rozhrania.",
          "UDDI slúži ako katalóg/register služieb.",
        ],
        media: {
          mermaid: `flowchart LR
  Provider["Provider služby"] -->|publikuje| UDDI["UDDI register"]
  Client["Klient"] -->|nájde službu| UDDI
  Client -->|stiahne kontrakt| WSDL["WSDL opis"]
  Client -->|SOAP XML request| Service["SOAP služba"]
  Service -->|SOAP XML response| Client`,
          codeBlocks: [
            {
              lang: "xml",
              code: `<env:Envelope>
  <env:Header />
  <env:Body>
    <!-- volanie operácie -->
  </env:Body>
</env:Envelope>`,
            },
          ],
        },
        traps: [
          "WSDL nie je samotné volanie; je to kontrakt služby.",
          "SOAP je striktnejší a XML-heavy oproti RESTu.",
        ],
      },
    ],
  },
  {
    topicKey: "microservices",
    title: "Mikroslužby a komunikácia",
    file: "must-know/mikrosluzby-komunikacia.md",
    frequency: "4x historicky, plus recent mikroslužby signály",
    source: "topics/mikrosluzby-komunikacia",
    examItems: [
      {
        question: "Čo je mikroslužba, aké má vlastnosti a ako sa líši od monolitu?",
        answer:
          "Mikroslužba je malá samostatná služba s vlastnou business logikou, API, konfiguráciou a často vlastnou databázou. Monolit je jeden nasadzovaný celok so zdieľanou databázou a modulmi v jednej aplikácii.",
        points: [
          "Mikroslužba má vonkajšie API, logovanie, health check a externú konfiguráciu.",
          "Výhody: nezávislé nasadenie, technologická voľnosť, kontinuálny vývoj.",
          "Nevýhody: sieťová réžia, zložitejšie testovanie, distribuované zlyhania.",
          "Monolit je jednoduchší na začiatku, ale horšie sa mení po narastení.",
        ],
        media: {
          images: [
            { file: "past-image10.png", alt: "Príklad mikroslužbovej architektúry" },
            { file: "prep-image4.png", alt: "Monolit vs mikroslužby" },
          ],
        },
        traps: ["Neuvádzať jednu zdieľanú databázu ako hlavný princíp mikroslužieb."],
      },
      {
        question: "Nakreslite príklad IS s webovým rozhraním a mikroslužbami.",
        answer:
          "Typická kresba má webové UI, API gateway a za ním samostatné služby. Každá služba spravuje vlastnú doménu a ideálne vlastné úložisko.",
        points: [
          "Web UI volá API gateway.",
          "Gateway smeruje požiadavky na konkrétne služby.",
          "Služby môžu byť napríklad objednávky, sklad, fakturácia a používatelia.",
          "Každá služba môže mať vlastnú databázu.",
        ],
        media: {
          mermaid: `flowchart LR
  UI["Web UI"] --> GW["API gateway"]
  GW --> O["Orders service"]
  GW --> S["Stock service"]
  GW --> F["Billing service"]
  O --> ODB[("Orders DB")]
  S --> SDB[("Stock DB")]
  F --> FDB[("Billing DB")]`,
        },
        traps: ["Kresba má ukázať oddelenie služieb, nie len jednu veľkú aplikáciu."],
      },
      {
        question: "Ako mikroslužby komunikujú synchrónne a aké sú 3 príklady rozhraní?",
        answer:
          "Synchrónna komunikácia je request/response: volajúca služba pošle požiadavku a čaká na odpoveď. Typické aplikačné rozhrania sú REST/HTTP JSON, gRPC a SOAP; v niektorých stackoch aj GraphQL.",
        points: [
          "Synchrónne = volajúca služba čaká, kým druhá služba odpovie alebo timeoutne.",
          "Príklady: REST/HTTP JSON, gRPC, SOAP.",
          "Nevýhoda sync: časové aj výkonové previazanosti medzi službami.",
        ],
        media: {
          mermaid: `sequenceDiagram
  participant A as Service A
  participant B as Service B
  A->>B: sync request
  B-->>A: response`,
        },
        traps: ["Pri sync otázke nestačí povedať len REST; chcú viac príkladov a pointu request/response."],
      },
      {
        question: "Aké sú spôsoby asynchrónnej komunikácie a cez čo sú uskutočnené?",
        answer:
          "Asynchrónna komunikácia prebieha cez message broker. Pri message queue sa správa doručí jednému konzumentovi. Pri publish/subscribe producent publikuje do témy a správu dostanú všetci odberatelia.",
        points: [
          "Queue: RabbitMQ, ActiveMQ, Amazon SQS.",
          "Publish/subscribe: Kafka, Pulsar, Amazon SNS.",
          "Výhoda async: služba nemusí čakať na okamžitú odpoveď.",
          "Nevýhoda async: ťažšie sledovanie, konzistencia a ladenie.",
        ],
        media: {
          mermaid: `flowchart TB
  P["Producent"] --> B["Message broker"]
  B -->|queue| C1["jeden konzument"]
  B -->|topic pub/sub| C2["konzument A"]
  B -->|topic pub/sub| C3["konzument B"]`,
        },
        traps: ["Pri async otázke treba uviesť broker aj konkrétne technológie."],
      },
    ],
  },
  {
    topicKey: "vizTheory",
    title: "Gestalt, vnímanie a bullet graf",
    file: "must-know/gestalt-vnimanie-bullet.md",
    frequency: "4x Gestalt, 3x vnímanie, 1x bullet graf",
    source: "topics/gestalt-vnimanie-dashboardy",
    examItems: [
      {
        question: "Gestalt princípy vymenujte, nakreslite a popíšte.",
        answer:
          "Gestalt princípy opisujú, ako človek automaticky zoskupuje vizuálne prvky do väčších celkov. Na skúške treba pomenovať viac princípov a aspoň niektoré jednoducho nakresliť.",
        points: [
          "Blízkosť: blízke prvky vnímame ako skupinu.",
          "Podobnosť: podobné prvky vnímame spolu.",
          "Uzavretosť: dopĺňame neúplné tvary.",
          "Kontinuita: sledujeme plynulé línie.",
          "Figura/pozadie: oddeľujeme objekt od pozadia.",
          "Spoločný osud: prvky s rovnakým pohybom patria spolu.",
        ],
        media: {
          images: [
            { file: "past-image11.png", alt: "Gestalt princípy 1" },
            { file: "past-image12.png", alt: "Gestalt princípy 2" },
          ],
        },
        traps: ["Nestačí len zoznam; otázka často výslovne chce kresbu."],
      },
      {
        question:
          "Vedomé vs podvedomé vnímanie. Atribúty podvedomého vnímania a uplatnenie vo vizualizácii/dashboardoch.",
        answer:
          "Podvedomé vnímanie rýchlo predspracúva obraz bez vedomej námahy. Vizualizácia ho využíva cez preattentive atribúty, aby používateľ okamžite videl rozdiely, skupiny a výnimky.",
        points: [
          "Vedomé: krátkodobá pamäť, rozpoznanie a interpretácia objektov.",
          "Podvedomé: rýchle obrazové predspracovanie.",
          "Atribúty: poloha, dĺžka, veľkosť, tvar, orientácia, farba, intenzita, ohraničenie.",
          "Dashboard: zvýrazniť dôležité hodnoty, zoskupiť súvisiace prvky, nepoužiť zbytočný šum.",
        ],
        media: {
          mermaid: `flowchart LR
  V["Vizuálny vstup"] --> P["Podvedomé spracovanie"]
  P --> A["farba, veľkosť, poloha, tvar"]
  A --> C["vedomá interpretácia"]`,
        },
        traps: ["Nepísať len psychológiu; treba povedať dopad na vizualizáciu a dashboard."],
      },
      {
        question: "Ako vyzerá bullet graf a čo sa z neho dá vyčítať?",
        answer:
          "Bullet graf je kompaktný jednorozmerný graf, ktorý nahrádza gauge. Ukazuje aktuálnu hodnotu, cieľovú značku a kvalitatívne pásma, napríklad zlé, dobré a výborné.",
        points: [
          "Dá sa z neho vyčítať aktuálna hodnota voči cieľu.",
          "Pásma ukazujú kvalitu výkonu.",
          "Je úspornejší a čitateľnejší než tachometer.",
          "Viac bullet grafov sa dá dobre skladať vedľa seba.",
        ],
        media: {
          images: [{ file: "past-image23.png", alt: "Bullet graf" }],
        },
        traps: ["Bullet graf nie je koláčový graf ani tachometer; je lineárny a kompaktný."],
      },
    ],
  },
]

const intuitionByQuestion = new Map([
  [
    "Definujte proces, úloha, prípad, zdroj, pracovná položka, aktivita. Uveďte, ako spolu súvisia.",
    [
      "Predstav si workflow ako recept, ktorý sa opakuje pre veľa konkrétnych prípadov.",
      "Proces je šablóna, prípad je jeden beh tej šablóny.",
      "Pracovná položka je práca pripravená na vykonanie; aktivita je už reálne priradená niekomu/niečomu.",
    ],
  ],
  [
    "Nakreslite schému referenčného modelu. Popíšte prvky a rozhrania stručne.",
    [
      "Zapamätaj si stred: WES + workflow engine.",
      "Okolo stredu je päť typov napojenia: definícia, klient, vyvolaná aplikácia, iný WES, admin.",
      "Kresba má ukázať, čo engine riadi a s čím komunikuje.",
    ],
  ],
  [
    "Popíšte klientske a vyvolané aplikácie vo workflow.",
    [
      "Klient je miesto, kde človek vidí a rieši svoju prácu.",
      "Vyvolaná aplikácia je nástroj, ktorý workflow spustí, aby sa práca dala dokončiť.",
      "Rozdiel je používateľské rozhranie vs podporný vykonávací nástroj.",
    ],
  ],
  [
    "Popíšte aplikačné, vecné a riadiace dáta vo workflow.",
    [
      "Riadiace dáta patria enginu a hovoria, kde sa proces nachádza.",
      "Vecné dáta ovplyvňujú rozhodnutia v procese.",
      "Aplikačné dáta patria konkrétnym aplikáciám a workflow ich nemusí priamo spravovať.",
    ],
  ],
  [
    "Nakreslite a popíšte AND-split, AND-join, XOR-split, XOR-merge, prípadne OR-split.",
    [
      "AND = všetko naraz alebo čakanie na všetko.",
      "XOR = práve jedna alternatíva.",
      "OR = jedna alebo viac aktívnych vetiev; join čaká len na tie spustené.",
    ],
  ],
  [
    "Definujte multidimenzionálnu kocku, dimenzie a aktívne dimenzie.",
    [
      "Kocka je tabuľka faktov pozeraná cez viac osí naraz.",
      "Dimenzie sú osi pohľadu, fakty sú čísla v bunkách.",
      "Aktívne dimenzie sú tie, podľa ktorých výsledok stále rozlišuješ.",
    ],
  ],
  [
    "Vysvetlite súčet a aritmetický priemer v OLAP kocke.",
    [
      "Súčet sa agreguje priamo, preto je jednoduchý.",
      "Priemer potrebuje váhu: počet hodnôt v každej skupine.",
      "Keď priemeruješ priemery bez počtov, výsledok môže byť zlý.",
    ],
  ],
  [
    "Definujte roll-up, drill-down, pivot, slice a dice.",
    [
      "Tieto operácie nemenia zdrojové dáta, len pohľad na ne.",
      "Roll-up ide nahor k súhrnu; drill-down ide nadol k detailu.",
      "Slice/dice filtrujú, pivot otáča zobrazenie dimenzií.",
    ],
  ],
  [
    "Definujte dátový sklad a porovnajte ho s OLTP.",
    [
      "OLTP je každodenná prevádzka systému.",
      "Dátový sklad je oddelený priestor na analýzu a históriu.",
      "DWH je optimalizovaný na čítanie a rozhodovanie, nie na rýchle transakčné zápisy.",
    ],
  ],
  [
    "Charakterizujte OLAP a ROLAP. Ako sa ukladá do relačnej DB?",
    [
      "OLAP je analytický pohľad nad dátami.",
      "ROLAP tento pohľad skladá z relačných tabuliek.",
      "Hľadaj faktovú tabuľku v strede a dimenzie okolo nej.",
    ],
  ],
  [
    "Popíšte schému hviezdy a vločky.",
    [
      "Hviezda je jednoduchá: fakty v strede, dimenzie okolo.",
      "Vločka normalizuje dimenzie do ďalších tabuliek.",
      "Hviezda sa ľahšie dotazuje, vločka lepšie modeluje hierarchie.",
    ],
  ],
  [
    "Definujte zotaviteľnú frontu, princíp a súvislosť s transakciami.",
    [
      "Je to fronta práce, ktorá nesmie zmiznúť po páde systému.",
      "Práca sa má spustiť až vtedy, keď predchádzajúca transakcia naozaj prešla.",
      "Pointa je trvanlivosť a prepojenie s commit/rollback.",
    ],
  ],
  [
    "Popíšte operácie, vlastnosti a rollback pravidlá zotaviteľnej fronty.",
    [
      "Vloženie do fronty je len návrh, kým transakcia necommitne.",
      "Vybraná položka nie je definitívne preč, kým spracovanie necommitne.",
      "Rollback musí vrátiť frontu do konzistentného stavu.",
    ],
  ],
  [
    "Ukážte použitie zotaviteľnej fronty na jednoduchom príklade.",
    [
      "Objednávka je dobrý príklad: po commite sa má spustiť ďalšia práca.",
      "Expedícia a fakturácia môžu bežať neskôr a oddelene.",
      "Fronta drží záväzok, že sa tá práca nestratí.",
    ],
  ],
  [
    "Porovnajte zreťazené transakcie so savepointmi.",
    [
      "Savepoint je bod návratu v jednej transakcii.",
      "Zreťazenie je séria menších transakcií s vlastnými commitmi.",
      "Zreťazenie pomáha výkonu, ale oslabuje atomicitu celého dlhého procesu.",
    ],
  ],
  [
    "Commit() vs chain(): sú dielčie transakcie a celá transakcia atomické a izolované?",
    [
      "Dielčie kroky môžu byť samostatne ACID.",
      "Celok po priebežných commitoch už nie je jedna vratná transakcia.",
      "chain() drží kontext dlhšie, takže izolácia je lepšia, ale systém platí výkonom.",
    ],
  ],
  [
    "Canvas a SVG: popíšte ich a uveďte vzťah k DOM a diagramom.",
    [
      "Canvas je kreslenie pixelov na plátno.",
      "SVG je strom vektorových DOM prvkov.",
      "Pre diagramy je SVG často lepšie, lebo každý tvar môžeš meniť a klikať samostatne.",
    ],
  ],
  [
    "Canvas: čo je context a napíšte krátky kód jedného prvku.",
    [
      "Canvas je len plocha; context je pero, ktorým na ňu kreslíš.",
      "Pre 2D odpoveď stačí getContext('2d') a jeden príkaz kreslenia.",
      "Po nakreslení už tvar nie je samostatný DOM element.",
    ],
  ],
  [
    "D3: selekcia podľa id, nahradenie textu v <p> a dogenerovanie podľa zoznamu.",
    [
      "D3 je hlavne prepojenie dát s DOM/SVG prvkami.",
      "select mení existujúci prvok, selectAll + data + enter vytvára chýbajúce prvky.",
      "Na skúške často stačí malý konkrétny kód, nie dlhá teória.",
    ],
  ],
  [
    "GeoJSON: čo to je, aké má typy a na čo sa používa?",
    [
      "Je to JSON, ktorý namiesto biznis objektov nesie geometriu na mape.",
      "Zapamätaj si Point, LineString a Polygon ako základ.",
      "Používa sa ako vrstva nad mapovým podkladom v knižniciach ako Leaflet alebo d3-geo.",
    ],
  ],
  [
    "GraphQL: čo to je, v čom sa líši od REST a aký má dátový model?",
    [
      "REST rozmýšľa cez zdroje a endpointy.",
      "GraphQL rozmýšľa cez typy a dotaz, ktorý si vyberie presné polia.",
      "Nie je to databáza; je to API kontrakt a runtime.",
    ],
  ],
  [
    "Čo treba definovať na klientovi a serveri, aby sme GraphQL mohli použiť?",
    [
      "Server definuje, čo existuje a ako sa to vypočíta.",
      "Klient definuje, čo presne chce dostať.",
      "Schéma je dohoda medzi oboma stranami.",
    ],
  ],
  [
    "Autentizácia v RESTe: prečo nie sessions, mechanizmy a JWT.",
    [
      "REST chce, aby každá požiadavka niesla vlastný kontext.",
      "JWT je podpísaná kartička, ktorú klient posiela pri každom volaní.",
      "Podpis overuje, že obsah nikto nezmenil; payload sám o sebe netají dáta.",
    ],
  ],
  [
    "Web services podľa SOAP. K čomu sú štandardy WSDL a UDDI?",
    [
      "SOAP je formálne XML volanie služby.",
      "WSDL je zmluva, ktorá povie, aké operácie služba ponúka.",
      "UDDI je katalóg, kde sa služby dajú nájsť.",
    ],
  ],
  [
    "Čo je mikroslužba, aké má vlastnosti a ako sa líši od monolitu?",
    [
      "Monolit je jedna veľká nasadzovaná aplikácia.",
      "Mikroslužba je menší samostatný kus systému s jasným API.",
      "Výmena jednoduchosti za nezávislé nasadzovanie prináša distribuovanú zložitosť.",
    ],
  ],
  [
    "Nakreslite príklad IS s webovým rozhraním a mikroslužbami.",
    [
      "Kresli tok: Web UI -> API gateway -> samostatné služby.",
      "Každá služba má vlastnú doménu, často aj vlastnú databázu.",
      "Cieľ kresby je ukázať oddelenie zodpovedností.",
    ],
  ],
  [
    "Ako mikroslužby komunikujú synchrónne a aké sú 3 príklady rozhraní?",
    [
      "Synchrónne volanie je ako obyčajné API: zavoláš a čakáš na odpoveď.",
      "Na skúške vymenuj aspoň tri rozhrania: REST, gRPC, SOAP.",
      "Nevýhoda je časová previazanosť a timeouty medzi službami.",
    ],
  ],
  [
    "Aké sú spôsoby asynchrónnej komunikácie a cez čo sú uskutočnené?",
    [
      "Asynchrónne znamená, že odosielateľ nečaká na okamžitú odpoveď služby.",
      "Broker je prostredník, ktorý správy drží alebo distribuuje.",
      "Queue ide jednému konzumentovi; pub/sub ide viacerým odberateľom.",
    ],
  ],
  [
    "Gestalt princípy vymenujte, nakreslite a popíšte.",
    [
      "Mozog zoskupuje prvky skôr, než nad nimi vedome rozmýšľaš.",
      "Gestalt pravidlá vysvetľujú, prečo niektoré vizualizácie pôsobia prehľadne.",
      "Na skúške si priprav malé náčrty: bodky, línie, uzavreté/neúplné tvary.",
    ],
  ],
  [
    "Vedomé vs podvedomé vnímanie. Atribúty podvedomého vnímania a uplatnenie vo vizualizácii/dashboardoch.",
    [
      "Podvedomé vnímanie zachytí farbu, polohu alebo veľkosť veľmi rýchlo.",
      "Dashboard má túto rýchlosť využiť na upozornenie na dôležité veci.",
      "Čím menej šumu, tým ľahšie si človek všimne výnimku.",
    ],
  ],
  [
    "Ako vyzerá bullet graf a čo sa z neho dá vyčítať?",
    [
      "Bullet graf je úsporný ukazovateľ výkonu voči cieľu.",
      "Hlavný pruh je aktuálna hodnota, značka je cieľ.",
      "Pozadie s pásmami hovorí, či je výsledok slabý, dobrý alebo výborný.",
    ],
  ],
])

function mustKnowForTopic(topicKey) {
  return mustKnowPages.filter((page) => page.topicKey === topicKey)
}

function mustKnowLinksForTopic(topicKey) {
  const pages = mustKnowForTopic(topicKey)
  if (pages.length === 0) return ""

  return `## Must Know subpages

${pages
  .map((page) => `- [${page.title}](../${page.file.replace(/\.md$/, "")}) - ${page.frequency}`)
  .join("\n")}
`
}

function mustKnowIndexTable(pages, pagePrefix = "", sourcePrefix = "") {
  return `| Téma | Frekvencia | Zdroj |
|---|---|---|
${pages
  .map(
    (page) =>
      `| [${page.title}](${pagePrefix}${page.file.replace(/^must-know\//, "").replace(/\.md$/, "")}) | ${page.frequency} | [topic](${sourcePrefix}${page.source}) |`,
  )
  .join("\n")}`
}

function detailList(title, items) {
  return `## ${title}

${items.map((item) => `- ${item}`).join("\n")}`
}

function bulletList(items = []) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- --"
}

function renderCodeBlock(block) {
  return [`\`\`\`${block.lang ?? ""}`, block.code.trim(), "```"].join("\n")
}

function renderImage(pageDir, image) {
  const caption = image.caption ? `\n\n_${image.caption}_` : ""
  return `![${image.alt ?? "diagram"}](${relativeAssetPath(pageDir, image.file)})${caption}`
}

function renderMedia(page, item) {
  const pageDir = path.dirname(page.file)
  const parts = []

  for (const image of item.media?.images ?? []) {
    parts.push(renderImage(pageDir, image))
  }

  if (item.media?.mermaid) {
    parts.push(["```mermaid", item.media.mermaid.trim(), "```"].join("\n"))
  }

  for (const block of item.media?.codeBlocks ?? []) {
    parts.push(renderCodeBlock(block))
  }

  return parts.length ? parts.join("\n\n") : "_Bez samostatného obrázka; stačí textová odpoveď._"
}

function renderExamItem(page, item, index) {
  const titlePrefix = page.examItems.length > 1 ? `Otázka ${index + 1}` : "Otázka"
  const intuition = item.intuition ?? intuitionByQuestion.get(item.question) ?? []

  return `## ${titlePrefix}: ${item.question}

### Intuícia

${bulletList(intuition)}

### Krátka odpoveď

${item.answer}

### Čo napísať na skúške

${bulletList(item.points)}

### Diagram / obrázok / kód

${renderMedia(page, item)}

### Pozor na pasce

${bulletList(item.traps)}
`
}

function generateMustKnowIndex() {
  return `${frontmatter(
    "Must Know",
    "Distilled exam answers for the most repeated PIS topics.",
    ["pis", "must-know"],
  )}# Must Know

Tieto stránky sú zámerne krátke. Sú to veci, ktoré sa reálne pýtali: definície, porovnania, kresby, operácie a mini kód.

${mustKnowIndexTable(mustKnowPages, "", "../")}

## Ako sa to učiť

1. Prejdi túto sekciu pred dlhými poznámkami.
2. Každú stránku si povedz nahlas za 60-120 sekúnd.
3. Pri stránkach s kresbou ju nakresli bez pozerania.
4. Až potom choď do plnej topic stránky pre širší kontext.
`
}

function generateMustKnowPage(page) {
  return `${frontmatter(
    page.title,
    `${page.title}: distilled must-know exam answer.`,
    ["pis", "must-know"],
  )}# ${page.title}

**Frekvencia/signál:** ${page.frequency}

**Plná téma:** [${page.source.replace("topics/", "").replaceAll("-", " ")}](../${page.source})

${page.examItems.map((item, index) => renderExamItem(page, item, index)).join("\n\n---\n\n")}
`
}

function topicPage(topic) {
  const pageDir = path.dirname(topic.file)
  const questions = findQuestions(topic.questionPatterns)
  const prep = sourceExcerpt(prepFile, pageDir, topic.prepHeadings)
  return `${frontmatter(
    topic.title,
    `${topic.title}: exam-first answer, historical questions, source notes and image diagrams.`,
    topic.tags,
  )}# ${topic.title}

**ROI:** ${topic.base + topic.recentBoost} bodov = ${topic.base} historická frekvencia + ${topic.recentBoost} recent boost.

**Minimum:** ${topic.minimum}

${mustKnowLinksForTopic(topic.key)}

## Skúšková odpoveď

${topic.answer}

## Čo musíš vedieť

${topic.checklist.map((item) => `- ${item}`).join("\n")}

## Recent signály

${recentBlock(recentLines[topic.key] ?? [])}

## Staré otázky a odpovede

${questionBlock(questions, pageDir)}

${prep ? `## Poznámky z prípravy\n\n${prep}\n` : ""}
`
}

function generateIndex() {
  return `${frontmatter(
    "PIS Exam Speedrun",
    "Exam-first Quartz study site for PIS with ROI plan, bare minimum and frequency analysis.",
    ["pis", "dashboard"],
  )}# PIS Exam Speedrun

Toto je skúškový web pre PIS. Je postavený frekvenčne: najprv témy, ktoré sa historicky opakujú a zároveň sa objavili v posledných termínoch zo súboru PIS-zbytok.md.

Ak cieliš na prvý opravný termín, pozri aj [Prvý opravný prediction](analysis/prvy-opravny-prediction).

## Najvyšší ROI

${table(rows)}

## Rýchly štart

1. Prejdi [Must Know](must-know) - krátke odpovede na to, čo sa reálne pýta.
2. Prejdi [bare minimum](analysis/bare-minimum) a nauč sa kresliť požadované schémy.
3. Choď podľa [ROI plánu](analysis/roi-plan), zhora nadol.
4. Pri každej téme si najprv prečítaj Must Know, potom "Skúšková odpoveď", potom "Staré otázky".
5. Ak nevieš nakresliť diagram bez pozerania, téma ešte nie je hotová.

## Must Know subcategory

${mustKnowIndexTable(mustKnowPages, "must-know/")}

## Zdroje

- [Must Know](must-know)
- [Frekvenčná analýza](analysis/frequency-analysis)
- [ROI plán](analysis/roi-plan)
- [Bare minimum](analysis/bare-minimum)
- [Prvý opravný prediction](analysis/prvy-opravny-prediction)
- [PIS_priprava_speedrun(1).md — transformovaný zdroj](sources/preparation-speedrun)
- [PIS-najčastejšie otázky.md — transformovaný zdroj](sources/past-questions)
- [PIS-zbytok.md — recent otázky](sources/recent-2024-25)
`
}

function generateFrequencyAnalysis() {
  const individualRows = pastQuestions
    .filter((q) => q.title.trim())
    .sort((a, b) => b.count - a.count)
    .map((q) => `| ${q.count} | ${q.title} |`)
    .join("\n")

  return `${frontmatter(
    "Frekvenčná Analýza",
    "Historical frequency and recent signal analysis for PIS exam topics.",
    ["pis", "analysis"],
  )}# Frekvenčná Analýza

Skóre používa historické výskyty zo súboru \`${pastFile}\` a recent boost zo súboru \`${recentFile}\`.

## Topic ROI tabuľka

${table(rows)}

## Interpretácia

- **Workflow** je najvyšší signál: historicky 15x a znovu v oboch 2024/25 termínoch aj v riadnom 2025/2026.
- **OLAP/DWH** je druhý veľký blok: kocka, dátový sklad, OLAP operácie a DWH model sa opakujú aj v riadnom 2025/2026.
- **Canvas/SVG/D3/GeoJSON** má síce nižší historický základ, ale silný recent boost; GeoJSON sa objavil aj v riadnom 2025/2026.
- **Zotaviteľná fronta a transakcie** sú menší rozsah, ale opakovane sa vracia aspoň commit()/chain() a transakčná logika.
- **Mikroslužby** sú potvrdené aj v riadnom 2025/2026: sync rozhrania + async broker komunikácia.
- **API** ostáva pravdepodobné podľa 2024/25, najmä GraphQL a SOAP/WSDL/UDDI.

## Jednotlivé staré otázky

| Count | Otázka |
|---:|---|
${individualRows}

## Recent zdroj

\`\`\`text
${recentRaw.trim()}
\`\`\`
`
}

function generateRoiPlan() {
  return `${frontmatter(
    "ROI Plán",
    "Frequency-weighted study order for the PIS exam.",
    ["pis", "analysis", "roi"],
  )}# ROI Plán

Postupuj v tomto poradí. Nejde o najkrajšie poradie v prednáškach, ale o pomer pravdepodobnosti, bodov a času.

${rows
  .map(
    (row, index) => `## ${index + 1}. ${row.title}

**ROI:** ${row.score}. **Minimum:** ${row.minimum}

Prejdi stránku: [${row.title}](../${row.link})

Must Know:
${mustKnowForTopic(row.key)
  .map((page) => `- [${page.title}](../${page.file.replace(/\.md$/, "")})`)
  .join("\n") || "- Bez samostatnej Must Know stránky."}
`,
  )
  .join("\n")}

## Cram stratégia

- Ak máš 2 hodiny: Workflow, OLAP/DWH, Canvas/SVG/D3 a zotaviteľná fronta.
- Ak máš 4 hodiny: pridaj GraphQL/REST/SOAP a mikroslužby.
- Ak máš deň: doplň vizualizačnú teóriu, objektový model a CDI.
- Posledných 30 minút venuj kresleniu schém: WfMC, workflow brány, OLAP kocka, star/snowflake, mikroservisná architektúra, Canvas/SVG/D3 kód.
`
}

function generateBareMinimum() {
  return `${frontmatter(
    "Bare Minimum",
    "Shortest pass-focused checklist for PIS.",
    ["pis", "analysis", "minimum"],
  )}# Bare Minimum

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
`
}

function generatePrvyOpravnyPrediction() {
  return `${frontmatter(
    "Prvý opravný prediction",
    "Pattern-based prediction for the first retake term, derived from 2025/2026 riadny, 2024/25 riadny/opravný differences and topic swaps.",
    ["pis", "analysis", "prediction"],
  )}# Prvý opravný prediction

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

Z nového riadneho termínu v \`PIS-zbytok.md\` vychádza tento košík:

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
- dogenerovanie prvkov zo zoznamu cez \`data()\` + \`enter()\`.

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
`
}

function generateSourcePage(title, description, sourceName, raw) {
  const pageDir = "sources"
  const body = demoteHeadings(transformMarkdown(raw, sourceName, pageDir), 1)
  return `${frontmatter(title, description, ["pis", "source"])}# ${title}

Pôvodný súbor: \`${sourceName}\`.

Táto stránka je transformovaný zdrojový súbor. Base64 obrázky boli vyextrahované do \`assets/images\`, aby ich Quartz normálne renderoval.

${body}
`
}

function generateRecentPage() {
  return `${frontmatter(
    "Recent otázky z PIS-zbytok",
    "Recent exam questions from PIS-zbytok.md.",
    ["pis", "source", "recent"],
  )}# Recent otázky z PIS-zbytok

Pôvodný súbor: \`${recentFile}\`.

\`\`\`text
${recentRaw.trim()}
\`\`\`
`
}

ensureDir(contentDir)
ensureDir(assetsDir)
extractImages(prepFile, prepRaw, "prep")
extractImages(pastFile, pastRaw, "past")

writeContent("index.md", generateIndex())
writeContent("analysis/frequency-analysis.md", generateFrequencyAnalysis())
writeContent("analysis/roi-plan.md", generateRoiPlan())
writeContent("analysis/bare-minimum.md", generateBareMinimum())
writeContent("analysis/prvy-opravny-prediction.md", generatePrvyOpravnyPrediction())
writeContent("must-know/index.md", generateMustKnowIndex())
writeContent(
  "sources/preparation-speedrun.md",
  generateSourcePage("Preparation Speedrun", "Transformed PIS_priprava_speedrun(1).md source.", prepFile, prepRaw),
)
writeContent(
  "sources/past-questions.md",
  generateSourcePage("Past Questions", "Transformed PIS-najčastejšie otázky.md source.", pastFile, pastRaw),
)
writeContent("sources/recent-2024-25.md", generateRecentPage())

for (const topic of topics) {
  writeContent(topic.file, topicPage(topic))
}

for (const page of mustKnowPages) {
  writeContent(page.file, generateMustKnowPage(page))
}

pruneUnexpectedFiles(contentDir)

console.log(
  `Generated ${topics.length} topic pages, ${mustKnowPages.length} must-know pages, 4 analysis pages and extracted images.`, 
)
