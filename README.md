# Französisch Vokabeltrainer

Mobiler Vokabeltrainer für Französisch in den Klassen 5 bis 7.

## Struktur

- `app/` – Next.js-Oberfläche und Lernlogik
- `components/ui/` – tatsächlich verwendete UI-Komponenten
- `lib/` – gemeinsame Hilfsfunktionen
- `data/vokabeln.json` – Vokabeldaten, nach Lektionen gegliedert
- `docs/index.html` – eigenständige statische Version für GitHub Pages
- `scripts/sync-docs-data.mjs` – überträgt die Vokabeldaten in die statische Version

## Aktueller Lernstoff

Der Trainer enthält einen thematisch am Lehrwerk **À plus!** ausgerichteten Kernwortschatz für die Klassen 5 und 6 sowie **Unité 1 – Volet 1** der Klasse 7.

Die ergänzten Kernwortschätze sind eigenständig zusammengestellt und ersetzen nicht das vollständige Lernvokabular des Schulbuchs.

## Lokal starten

Voraussetzung: Node.js 22 oder neuer.

```bash
npm install
npm run dev
```

Nach Änderungen an `data/vokabeln.json` muss die GitHub-Pages-Version synchronisiert werden:

```bash
npm run sync:docs-data
```

## GitHub Pages

Die veröffentlichte Version liegt bewusst getrennt vom Quellcode in `docs/index.html`. GitHub Pages kann auf `main` und `/docs` eingestellt werden.
