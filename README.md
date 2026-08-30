# Französisch Vokabeltrainer

Mobiler Vokabeltrainer für Französisch in der 7. Klasse.

## Struktur

- `app/` – Next.js-Oberfläche und Lernlogik
- `components/ui/` – tatsächlich verwendete UI-Komponenten
- `lib/` – gemeinsame Hilfsfunktionen
- `data/vokabeln.json` – Vokabeldaten, nach Lektionen gegliedert
- `docs/index.html` – eigenständige statische Version für GitHub Pages

## Aktueller Lernstoff

Derzeit enthält der Trainer **Unité 1 – Volet 1**.

## Lokal starten

Voraussetzung: Node.js 22 oder neuer.

```bash
npm install
npm run dev
```

## GitHub Pages

Die veröffentlichte Version liegt bewusst getrennt vom Quellcode in `docs/index.html`. GitHub Pages kann auf `main` und `/docs` eingestellt werden.
