# Impostor

Fußball-Impostor für eure Runde: Ein Handy wird reihum weitergegeben, alle sehen denselben
Fußballer oder Verein – nur der Impostor nicht. Läuft nach der Installation komplett offline.

## Auf dem Handy installieren

Einmal den Link öffnen (braucht beim ersten Mal Internet), danach:

- **iPhone (Safari):** Teilen-Symbol → „Zum Home-Bildschirm“
- **Android (Chrome):** Menü ⋮ → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“

Neue Versionen lädt die App automatisch, sobald sie wieder Internet hat.

## Entwicklung

```bash
npm install
npm run dev     # lokaler Server
npm test        # alle Tests
npm run build   # Produktions-Build nach dist/
```

Spieler und Vereine stehen in `src/data/players.json` und `src/data/clubs.json`.
Nach Änderungen prüft `npm test`, dass die Listen gültig sind.

## Aufbau: gemeinsamer Kern + Variante

Dieses Spiel hat ein Schwester-Repo (NBA: https://github.com/Dabvud/impostor-nba) mit demselben Kern. Spielspezifisch sind nur:

- `src/variant/` – App-Name, Texte, Speicher-Präfix, Modi, Datentypen, Farben (`theme.css`)
- `src/data/` – die Begriffe
- `public/` (Icons), `pwa-assets.config.ts`, `tests/variant/`, diese README

Alles andere ist in beiden Repos gleich. Neue Features deshalb im Kern neutral bauen (keine Spielbegriffe, Farben
nur als CSS-Variable) und Spielspezifisches nur in den Dateien oben.

### Feature ins andere Spiel übernehmen

```bash
git fetch nba                # Schwester-Repo ist als Remote eingetragen
git log nba/main --oneline   # gewünschten Commit suchen
git cherry-pick -x <commit>          # -x vermerkt die Herkunft in der Commit-Nachricht
npm test
```

Jeder Push auf `main` baut die App per GitHub Actions und veröffentlicht sie auf GitHub Pages
(Repository-Einstellungen → Pages → Source: „GitHub Actions“).
