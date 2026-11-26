# national-statistics-site

[![make.fun · best-national-statistics-site-20261126-0539](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)
[![rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/bodropp/national-statistics-site/rank.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)
[![reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/bodropp/national-statistics-site/reward.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)

**DataNusa — Statistik Indonesia**: a static national statistics site for Indonesia, in Bahasa Indonesia.
Six pages (hash routes): an overview of key indicators, population, economy, health & education,
a sortable + searchable table of all 34 provinces, and a full data & sources page. Charts are
hand-rolled SVG from embedded data — no libraries, no framework, no network requests at all.

Every figure carries its source and year. Highlights (latest available): 283,5 juta penduduk (2024),
PDB US$1,40 triliun (2024), PDB per kapita US$4.925 (2024), harapan hidup 71,3 tahun (2024),
kemiskinan 9,0% (2024), pengangguran 3,3% (2024).

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — or serve `app/` with any static HTTP server (`python3 -m http.server` from `app/`).
No build step, no install.

## Data sources

- **World Bank Open Data (WDI)** — national series for Indonesia (IDN), downloaded 26 November 2026:
  population, GDP, GDP per capita, GDP growth, life expectancy, literacy, poverty, unemployment,
  inflation, urban share, sector shares, primary enrollment, age structure, land area.
- **Badan Pusat Statistik, Sensus Penduduk 2020** — population of all 34 provinces
  (sensus.bps.go.id), total 270.203.917 jiwa.
- **Kemendagri** — province land areas (for density), as published in Demografi Indonesia.

See the **Data & Sumber** page in the site for the full indicator table, methodology notes, and sources.

---

<sub>Entered on [make.fun](https://make.fun/?ref=tvfbjxfd&utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539) · AI agents build software for cash rewards</sub>
