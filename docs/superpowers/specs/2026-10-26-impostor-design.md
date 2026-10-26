# Impostor – Design-Spezifikation

**Datum:** 2026-10-26
**Status:** Entwurf zur Freigabe

## 1. Ziel

Eine Handy-App für das Partyspiel „Impostor“, die eine Freundesgruppe vor Ort spielt
(nicht online). Ein einziges Handy wird reihum weitergegeben. Alle Spieler bekommen
denselben Begriff (einen Fußballer oder Verein, je nach Spielmodus) als geheimes Wort.
Die Impostor bekommen keins (später optional ein Hilfswort). Diskussion und Abstimmung
passieren mündlich.

**Erfolgskriterien**

- Läuft auf iPhone und Android, ohne App Store, ohne Kosten.
- Läuft nach der Installation komplett offline (Flugmodus).
- Niemand sieht versehentlich das Wort eines anderen.
- Eine neue Runde mit derselben Gruppe startet mit einem Tipp.

## 2. Entscheidungen

| Thema | Entscheidung |
|---|---|
| App-Art | PWA (installierbare Web-App, „Zum Home-Bildschirm“) |
| Stack | Vite + React + TypeScript, `vite-plugin-pwa`, Tests mit Vitest |
| Hosting | Öffentliches GitHub-Repo, Deploy per GitHub Actions auf GitHub Pages |
| Spielende | Minimal: Starter anzeigen → mündlich diskutieren → Auflösung → neue Runde |
| Starter | Zufällig aus **allen** Spielern, Impostor eingeschlossen (sonst Info-Leck) |
| Redereihenfolge | Klärt die Gruppe selbst, die App zeigt nur den Starter |
| Spielmodi | 6 Modi (Abschnitt 4), technisch als Filter über den Datenbestand |
| Schwierigkeit | Nur im Modus „Alle Fußballer“, Stufen 1–3 kumulativ |
| Wiederholungen | Pro Topf keine Wiederholung, bis 50 % gespielt sind, dann Reset |
| Hilfswort | Nicht in v1.0, kommt in v1.1 als Einstellung |
| App-Name | Impostor |

## 3. Architektur

```
src/
├─ data/
│   ├─ players.json    Fußballer
│   └─ clubs.json      Vereine
├─ game/
│   ├─ modes.ts        Spielmodi: Modus (+ Schwierigkeit) → Topf an Begriffen
│   ├─ engine.ts       reine Logik: Runde auslosen (keine UI, kein Storage)
│   └─ state.ts        Spielablauf als Zustandsautomat
├─ storage.ts          localStorage: Einstellungen, laufende Runde, benutzte Begriffe
└─ screens/            ein Bildschirm pro Datei
```

**Abhängigkeiten:** `screens` → `state` → `modes` + `engine`; `state` ↔ `storage`.
`engine.ts` und `modes.ts` hängen von nichts außer den Daten-Typen ab. `engine.ts`
bekommt den Zufallsgenerator als Parameter, damit Tests reproduzierbar sind.

### 3.1 Datentypen

```ts
type Tag = "bundesliga" | "cl-legende" | "wm-legende";
type Footballer = { name: string; tier: 1 | 2 | 3; tags: Tag[]; hint: string | null };
type Club = { name: string; region: "de" | "int"; inAllClubs: boolean; hint: string | null };
type Entry = { name: string; hint: string | null };   // gemeinsamer Nenner für die Engine
```

### 3.2 modes.ts

```ts
type ModeId = "alle" | "bundesliga" | "cl-legenden" | "wm-legenden" | "vereine-de" | "vereine-int";
type Settings = { names: string[]; impostorCount: number; mode: ModeId; difficulty: 1 | 2 | 3 };

function poolFor(mode: ModeId, difficulty: 1 | 2 | 3, players: Footballer[], clubs: Club[]): Entry[]
function poolKey(mode: ModeId, difficulty: 1 | 2 | 3): string   // z. B. "alle-2", "vereine-de"
```

`difficulty` wird nur beim Modus `alle` ausgewertet, bei allen anderen ignoriert.

### 3.3 engine.ts

```ts
type Round = {
  word: Entry;
  impostors: string[];     // Namen der Impostor
  revealOrder: string[];   // zufällige Reihenfolge des Anschauens
  starter: string;         // zufälliger Starter aus allen Spielern
};

function drawRound(
  names: string[], impostorCount: number,
  pool: Entry[], used: string[], rng: () => number,
): { round: Round; used: string[] }   // used = aktualisierte Liste für diesen Topf
```

- Stehen bereits **mindestens 50 %** des Topfs in `used`, wird `used` vor dem Ziehen
  komplett geleert. So ist nie vorhersehbar, welche Begriffe „noch übrig“ sind.
- Kandidaten = Topf ohne die Einträge in `used`. Der gezogene Begriff wird an `used` angehängt.
- Impostor, Reihenfolge und Starter werden unabhängig voneinander zufällig gezogen.

### 3.4 state.ts – Phasen

```
setup → handoff(i) → reveal(i) → … (für jeden Spieler in revealOrder)
      → discussion → resolution → (neue Runde: handoff(0) | setup)
```

### 3.5 storage.ts

- `settings`: Namen, Impostor-Anzahl, Modus, Schwierigkeit (bleiben über Sitzungen erhalten).
- `currentRound` + aktuelle Phase: Damit überlebt eine Runde Bildschirmsperre und Neuladen.
- `used`: `Record<poolKey, string[]>`, also bereits gespielte Begriffe **pro Topf**.

## 4. Spielmodi

| Modus | Inhalt | Schwierigkeit |
|---|---|---|
| ⚽ Alle Fußballer | alle Fußballer mit `tier <= difficulty` | Leicht / Mittel / Schwer |
| 🇩🇪 Bundesliga | Fußballer mit Tag `bundesliga` (aktuell oder früher, alle Stufen) | – |
| 🏆 CL-Legenden | Fußballer mit Tag `cl-legende` | – |
| 🌍 WM-Legenden | Fußballer mit Tag `wm-legende` | – |
| 🏟️ Vereine Bundesliga | Vereine mit `region: "de"` | – |
| 🌐 Alle Vereine | Vereine mit `inAllClubs: true` (alle internationalen + die relevanten Bundesliga-Vereine) | – |

## 5. Bildschirme

1. **Einrichtung:** Namen hinzufügen und entfernen, Anzahl der Impostor, Spielmodus,
   Schwierigkeit (nur sichtbar bei „Alle Fußballer“). Die letzten Einstellungen sind
   vorausgefüllt. Button „Start“.
2. **Übergabe:** Groß „**Luca ist dran**“, Button „Ich bin Luca“.
3. **Aufdecken:** Eine verdeckte Karte in der Bildschirmmitte. Zieht man sie nach oben,
   erscheint das Wort darunter. Beim Loslassen rutscht sie zurück und das Wort ist wieder verdeckt.
   - Crew sieht: den Begriff (Fußballer oder Verein).
   - Impostor sieht: „🕵️ Du bist der Impostor“ (ab v1.1 optional zusätzlich „Tipp: …“).
   - Man darf beliebig oft nachschauen. „Fertig – weitergeben“ wird erst aktiv,
     wenn mindestens einmal aufgedeckt wurde.
4. **Diskussion:** „**Jonas beginnt**“. Button „Auflösen“.
5. **Auflösung:** Den Button gedrückt halten (ca. 1 s), dann erscheinen die Impostor
   und das Wort. Buttons „Neue Runde“ (gleiche Spieler, gleicher Modus) und „Einstellungen“.

## 6. Regeln und Sonderfälle

- Mindestens 3 Spieler, Namen nicht leer und eindeutig.
- Impostor: mindestens 1, höchstens `floor((Spieler − 1) / 2)`, damit die Crew in der Mehrheit bleibt.
- Mehrere Impostor wissen nichts voneinander und bekommen (ab v1.1) denselben Tipp.
- Zurück-Taste / Zurück-Wischgeste: wird abgefangen und fragt „Runde abbrechen?“.
  Ein Zurück zur Karte des Vorgängers gibt es nicht.
- Bildschirmsperre, App-Wechsel oder Neuladen: Die Runde wird wiederhergestellt,
  und zwar beim **Übergabe-Bildschirm** des aktuellen Spielers, mit verdeckter Karte.
- Textmarkierung, Kontextmenü bei langem Drücken und Pull-to-Refresh sind deaktiviert
  (`user-select: none`, `overscroll-behavior: none`).
- Die Karte liegt nicht am unteren Rand, damit sie nicht mit der Home-Geste des iPhones kollidiert.

## 7. Datenbestand

### 7.1 Fußballer (`players.json`)

- Einträge `{ "name", "tier", "tags", "hint" }`.
- **Stufe 1:** Stars von 2010 bis heute (ca. 80).
  **Stufe 2:** bekannte Bundesliga-Spieler (ca. 150).
  **Stufe 3:** alle übrigen, also Legenden und Nischen-Spieler (ca. 200).
- Schwierigkeit: Leicht = Stufe 1, Mittel = Stufe 1–2, Schwer = Stufe 1–3.
- Tags (mehrere möglich, z. B. Robben: `bundesliga` + `cl-legende`):
  - `bundesliga`: bekannt aus der Bundesliga, aktuell oder früher. Ziel: mind. 150 Einträge.
  - `cl-legende`: prägende Champions-League-Spieler aller Zeiten, auch aktive
    Ausnahmespieler (Messi, Ronaldo). Ziel: ca. 60.
  - `wm-legende`: prägende WM-Spieler aller Zeiten (Weltmeister, WM-Torschützenkönige,
    Turnierstars wie Pelé, Maradona, Klose, Götze, Mbappé). Ziel: ca. 60.
- Namen in der Form, die man im Alltag sagt („Messi“, „Thomas Müller“).

### 7.2 Vereine (`clubs.json`)

Einträge `{ "name", "region", "inAllClubs", "hint" }`. Startliste, vom Nutzer festgelegt:

**Bundesliga (`de`, 23):** Bayern München, Borussia Dortmund, Bayer Leverkusen, RB Leipzig,
Borussia Mönchengladbach, VfL Wolfsburg, Eintracht Frankfurt, TSG Hoffenheim, VfB Stuttgart,
SC Freiburg, Werder Bremen, Schalke 04, Mainz 05, FC Augsburg, 1. FC Köln, Hertha BSC,
Hamburger SV, Union Berlin, Hannover 96, Fortuna Düsseldorf, 1. FC Nürnberg, VfL Bochum,
1. FC Heidenheim.
Bewusst nicht dabei: Vereine mit nur kurzen Bundesliga-Gastspielen (Bielefeld, Paderborn,
Fürth, Darmstadt, Ingolstadt, Braunschweig, Kiel, St. Pauli).

Im Modus „Alle Vereine“ fehlen (`inAllClubs: false`): Heidenheim, Bochum, Nürnberg, Düsseldorf,
Augsburg, Hannover 96. Alle übrigen 17 Bundesliga-Vereine sind dort dabei.

**International (`int`, alle mit `inAllClubs: true`):**
- England: Manchester City, Manchester United, Liverpool, Chelsea, Arsenal, Tottenham,
  Newcastle, Aston Villa, West Ham, Everton, Leicester City
- Spanien: Real Madrid, FC Barcelona, Atlético Madrid, FC Sevilla, Valencia, Villarreal,
  Athletic Bilbao, Real Betis
- Italien: Juventus, Inter Mailand, AC Mailand, SSC Neapel, AS Rom, Lazio Rom, Atalanta,
  Fiorentina, Como
- Frankreich: Paris Saint-Germain, Olympique Marseille, Olympique Lyon, AS Monaco, OSC Lille
- Weitere bekannte Vereine: Benfica, FC Porto, Sporting Lissabon, Ajax Amsterdam,
  PSV Eindhoven, Feyenoord, Celtic, Rangers, Galatasaray, Fenerbahçe, RB Salzburg

### 7.3 Pflege

- Der erste Entwurf der Fußballerliste wird KI-generiert, danach prüft der Nutzer die Liste
  einschließlich Stufen und Tags.
- `hint` bleibt in v1.0 überall `null`.

## 8. Tests

**Automatisch (Vitest)**

- `poolFor`: Jeder Modus liefert genau die passenden Einträge. Die Schwierigkeit wirkt nur
  bei `alle` und dort kumulativ.
- `drawRound`: richtige Anzahl Impostor; Impostor, Starter und Reihenfolge stammen nur
  aus den Spielernamen; die Reihenfolge enthält jeden Spieler genau einmal; das Wort
  stammt aus dem Topf; benutzte Begriffe werden ausgelassen; `used` wird geleert, sobald
  50 % des Topfs erreicht sind (knapp darunter wird es noch nicht geleert).
- Zustandsautomat: korrekte Phasenwechsel und Wiederherstellung beim Übergabe-Bildschirm.
- Validierung der Einstellungen (Mindestspielerzahl, Impostor-Grenze, doppelte Namen).
- Datenprüfung: keine doppelten Namen (je Datei), gültige Stufen, Tags und Regionen,
  keine leeren Namen; jeder Modus hat mindestens 20 Einträge.

**Manuell (iPhone und Android)**

- Die App lässt sich installieren, startet im Vollbild und zeigt ein Icon.
- Eine komplette Runde funktioniert im Flugmodus.
- Das Hochziehen der Karte funktioniert und kollidiert nicht mit System-Gesten.
- Sperrbildschirm und Neuladen mitten in der Runde führen zum richtigen Übergabe-Bildschirm.

## 9. Ausbaustufen

- **v1.0:** alles oben, ohne Hilfswort.
- **v1.1:** Hilfswort: `hint` in beiden Datendateien befüllen und eine Einstellung
  „Hilfswort für Impostor“ (an/aus) einbauen.
- **Später, nur auf Wunsch:** eigene Begriffe hinzufügen, Abstimmung übers Handy.

## 10. Außerhalb des Umfangs

Online-Mehrspieler, Konten, Punktestand, App-Store-Veröffentlichung, Abstimmung in der App (v1).
