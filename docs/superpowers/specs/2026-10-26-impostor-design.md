# Impostor – Design-Spezifikation

**Datum:** 2026-10-26
**Status:** Entwurf zur Freigabe

## 1. Ziel

Eine Handy-App für das Partyspiel „Impostor“, die eine Freundesgruppe vor Ort spielt
(nicht online). Ein einziges Handy wird reihum weitergegeben. Alle Spieler bekommen
denselben Fußballer als geheimes Wort, die Impostor bekommen keins (später optional
ein Hilfswort). Diskussion und Abstimmung passieren mündlich.

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
| Wortpool | Fußballer mit Stufen 1–3, Schwierigkeit wirkt kumulativ |
| Hilfswort | Nicht in v1.0, kommt in v1.1 als Einstellung |
| App-Name | Impostor |

## 3. Architektur

```
src/
├─ data/players.json   Spielerpool
├─ game/
│   ├─ engine.ts       reine Logik: Runde auslosen (keine UI, kein Storage)
│   └─ state.ts        Spielablauf als Zustandsautomat
├─ storage.ts          localStorage: Einstellungen, laufende Runde, benutzte Spieler
└─ screens/            ein Bildschirm pro Datei
```

**Abhängigkeiten:** `screens` → `state` → `engine`; `state` ↔ `storage`.
`engine.ts` hängt von nichts ab und bekommt den Zufallsgenerator als Parameter,
damit Tests reproduzierbar sind.

### 3.1 engine.ts

```ts
type Settings = { names: string[]; impostorCount: number; difficulty: 1 | 2 | 3 };
type Footballer = { name: string; tier: 1 | 2 | 3; hint: string | null };
type Round = {
  word: Footballer;
  impostors: string[];     // Namen der Impostor
  revealOrder: string[];   // zufällige Reihenfolge des Anschauens
  starter: string;         // zufälliger Starter aus allen Spielern
};

function drawRound(settings, pool: Footballer[], used: string[], rng: () => number): Round
```

- Kandidaten = alle Fußballer mit `tier <= difficulty`, die nicht in `used` stehen.
  Ist diese Menge leer, wird `used` für diese Schwierigkeit zurückgesetzt.
- Impostor, Reihenfolge und Starter werden unabhängig voneinander zufällig gezogen.

### 3.2 state.ts – Phasen

```
setup → handoff(i) → reveal(i) → … (für jeden Spieler in revealOrder)
      → discussion → resolution → (neue Runde: handoff(0) | setup)
```

### 3.3 storage.ts

- `settings`: Namen, Impostor-Anzahl, Schwierigkeit (bleiben über Sitzungen erhalten).
- `currentRound` + aktuelle Phase: Damit überlebt eine Runde Bildschirmsperre und Neuladen.
- `usedFootballers`: bereits gespielte Namen (für „keine Wiederholung“).

## 4. Bildschirme

1. **Einrichtung:** Namen hinzufügen und entfernen, Anzahl der Impostor, Schwierigkeit
   (Leicht / Mittel / Schwer). Die letzten Einstellungen sind vorausgefüllt. Button „Start“.
2. **Übergabe:** Groß „**Luca ist dran**“, Button „Ich bin Luca“.
3. **Aufdecken:** Eine verdeckte Karte in der Bildschirmmitte. Zieht man sie nach oben,
   erscheint das Wort darunter. Beim Loslassen rutscht sie zurück und das Wort ist wieder verdeckt.
   - Crew sieht: den Fußballernamen.
   - Impostor sieht: „🕵️ Du bist der Impostor“ (ab v1.1 optional zusätzlich „Tipp: …“).
   - Man darf beliebig oft nachschauen. „Fertig – weitergeben“ wird erst aktiv,
     wenn mindestens einmal aufgedeckt wurde.
4. **Diskussion:** „**Jonas beginnt**“. Button „Auflösen“.
5. **Auflösung:** Den Button gedrückt halten (ca. 1 s), dann erscheinen die Impostor
   und das Wort. Buttons „Neue Runde“ (gleiche Spieler) und „Einstellungen“.

## 5. Regeln und Sonderfälle

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

## 6. Spielerpool

- Datei `src/data/players.json`, Einträge `{ "name", "tier", "hint" }`.
- **Stufe 1:** Stars von 2010 bis heute (ca. 80).
  **Stufe 2:** bekannte Bundesliga-Spieler (ca. 150).
  **Stufe 3:** alle übrigen, also Legenden und Nischen-Spieler (ca. 200).
- Schwierigkeit: Leicht = Stufe 1, Mittel = Stufe 1–2, Schwer = Stufe 1–3.
- Namen in der Form, die man im Alltag sagt („Messi“, „Thomas Müller“).
- Der erste Entwurf wird KI-generiert, danach prüft der Nutzer die Liste.
- `hint` bleibt in v1.0 überall `null`.

## 7. Tests

**Automatisch (Vitest)**

- `drawRound`: richtige Anzahl Impostor; Impostor, Starter und Reihenfolge stammen nur
  aus den Spielernamen; die Reihenfolge enthält jeden Spieler genau einmal;
  das Wort entspricht der Schwierigkeit; benutzte Spieler werden ausgelassen;
  der Pool wird zurückgesetzt, wenn er erschöpft ist.
- Zustandsautomat: korrekte Phasenwechsel und Wiederherstellung beim Übergabe-Bildschirm.
- Validierung der Einstellungen (Mindestspielerzahl, Impostor-Grenze, doppelte Namen).
- Datenprüfung von `players.json`: keine Duplikate, gültige Stufen, keine leeren Namen.

**Manuell (iPhone und Android)**

- Die App lässt sich installieren, startet im Vollbild und zeigt ein Icon.
- Eine komplette Runde funktioniert im Flugmodus.
- Das Hochziehen der Karte funktioniert und kollidiert nicht mit System-Gesten.
- Sperrbildschirm und Neuladen mitten in der Runde führen zum richtigen Übergabe-Bildschirm.

## 8. Ausbaustufen

- **v1.0:** alles oben, ohne Hilfswort.
- **v1.1:** Hilfswort: `hint` in `players.json` befüllen und eine Einstellung „Hilfswort für Impostor“ (an/aus) einbauen.
- **Später, nur auf Wunsch:** eigene Spieler hinzufügen, Abstimmung übers Handy.

## 9. Außerhalb des Umfangs

Online-Mehrspieler, Konten, Punktestand, App-Store-Veröffentlichung, Abstimmung in der App (v1).
