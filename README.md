# Burg Funkelstein

Eine Lern-App fürs iPad für Kinder von **drei bis vier Jahren**: Mit Fips, dem kleinen Drachen, hilft das Kind beim Vorbereiten des Burgfests – es zählt Edelsteine, fährt Wege nach und sammelt Geschenke für seine eigene Burg. Ohne Lesen, ohne Bewertung, ohne Werbung, ohne Konto; der Spielstand bleibt auf dem Gerät.

Das Konzept steht in [`docs/konzept.md`](docs/konzept.md). Technik und Aufbau sind von der Schatzinsel übernommen.

## Starten

Auf dem Mac `Burg Funkelstein starten.command` doppelklicken, oder:

```bash
python3 tools/serve.py
```

Dann im Browser <http://localhost:8140> öffnen. Auf dem iPad im gleichen WLAN: `http://<Name-des-Macs>.local:8140`, in Safari „Zum Home-Bildschirm" wählen.

## Sprache für Fips

Ohne Clips spricht die Sprachausgabe des Geräts. Schönere, gleichmäßige Clips entstehen auf dem Mac:

```bash
node tools/list-texts.mjs
```

```bash
python3 tools/gen-audio.py
```

## Vor dem Einchecken

```bash
node tools/check.mjs
```

prüft, ob die Satzliste aktuell ist, alle Dateien im Service Worker stehen und kein Satz länger als acht Wörter ist.

## Aufbau

- `js/content/` – Orte und Stationen, Geschenke, Wege zum Nachfahren, alle Sätze von Fips
- `js/games/` – die Spiele (Zählen, Nachfahren)
- `js/screens/` – die Bildschirme (Start, Figur, Karte, Ort, Runde, Burg, Eltern, Abschied)
- `js/art/` – alle Bilder als SVG (Fips, Figuren, Burg, Dinge)
- `js/engine/` – Ton, Speicher, Spielzeit, Stufen
