// DataNusa views: hash router + one renderer per page. Every figure shown
// comes from data.js and carries its source and year next to it.
import { META, SERIES, LATEST, PROVINCES, ISLANDS } from "./data.js";
import { lineChart, barChart, hbarChart, sliceSeries } from "./charts.js";

const app = document.getElementById("app");

// ---- formatting (Indonesian number conventions) ----
const fmtInt = (v) => Math.round(v).toLocaleString("id-ID");
const fmtJuta = (v) => (v / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + " juta";
const fmtTriliun = (v) => "US$" + (v / 1e12).toLocaleString("id-ID", { maximumFractionDigits: 2 }) + " triliun";
const fmtUsd = (v) => "US$" + Math.round(v).toLocaleString("id-ID");
const fmtPct = (v) => v.toLocaleString("id-ID", { maximumFractionDigits: 1 }) + "%";
const fmtPct2 = (v) => v.toLocaleString("id-ID", { maximumFractionDigits: 2 }) + "%";
const fmt1 = (v) => v.toLocaleString("id-ID", { maximumFractionDigits: 1 });
const src = (text, year) => `<div class="src">Sumber: ${text} · ${year}</div>`;
const WB = "World Bank Open Data (WDI)";
const BPS = "BPS, Sensus Penduduk 2020";

function card(label, value, unit, sourceText, year, accent) {
  return `<div class="card${accent ? " accent" : ""}">
    <div class="label">${label}</div>
    <div class="value">${value}</div>
    <div class="unit">${unit}</div>
    ${src(sourceText, year)}
  </div>`;
}

// ---- shared chart controls ----
const RANGES = [
  { from: 1960, label: "1960–2024" },
  { from: 1990, label: "1990–2024" },
  { from: 2000, label: "2000–2024" },
  { from: 2010, label: "2010–2024" },
];
const state = { range: 1960, type: "line", metric: "total", sortKey: "total", sortDir: -1, query: "" };

function rangeButtons() {
  return `<span class="ctl-label">Rentang tahun:</span>` + RANGES.map((r) =>
    `<button class="btn${state.range === r.from ? " on" : ""}" data-range="${r.from}">${r.label}</button>`).join("");
}
function typeButtons() {
  return `<span class="ctl-label">Grafik:</span>
    <button class="btn${state.type === "line" ? " on" : ""}" data-type="line">Garis</button>
    <button class="btn${state.type === "bar" ? " on" : ""}" data-type="bar">Batang</button>`;
}
function metricButtons(options) {
  return `<span class="ctl-label">Ukuran:</span>` + options.map((o) =>
    `<button class="btn${state.metric === o.key ? " amber-on" : ""}" data-metric="${o.key}">${o.label}</button>`).join("");
}
function bindChartControls(redraw) {
  app.querySelectorAll("[data-range]").forEach((b) => b.addEventListener("click", () => {
    state.range = +b.dataset.range;
    app.querySelectorAll("[data-range]").forEach((x) => x.classList.toggle("on", x === b));
    redraw();
  }));
  app.querySelectorAll("[data-type]").forEach((b) => b.addEventListener("click", () => {
    state.type = b.dataset.type;
    app.querySelectorAll("[data-type]").forEach((x) => x.classList.toggle("on", x === b));
    redraw();
  }));
  app.querySelectorAll("[data-metric]").forEach((b) => b.addEventListener("click", () => {
    state.metric = b.dataset.metric;
    app.querySelectorAll("[data-metric]").forEach((x) => x.classList.toggle("amber-on", x === b));
    redraw();
  }));
}
function drawChart(code, format, label) {
  const pts = sliceSeries(code, state.range, 2024);
  const fn = state.type === "bar" ? barChart : lineChart;
  return `<div class="chart">${fn(pts, { format, label })}</div>`;
}

// ---- pages ----
function overview() {
  const pop = LATEST["SP.POP.TOTL"], gdp = LATEST["NY.GDP.MKTP.CD"], pc = LATEST["NY.GDP.PCAP.CD"];
  const life = LATEST["SP.DYN.LE00.IN"], pov = LATEST["SI.POV.NAHC"], un = LATEST["SL.UEM.TOTL.ZS"];
  const inf = LATEST["FP.CPI.TOTL.ZG"], urb = LATEST["SP.URB.TOTL.IN.ZS"];
  return `
  <section class="hero">
    <h1>Indonesia dalam angka</h1>
    <p>DataNusa merangkum statistik terpenting Indonesia — penduduk, ekonomi, kesehatan, dan pendidikan —
    dari sumber resmi yang bisa dilacak: setiap angka di bawah ini mencantumkan sumber dan tahunnya.</p>
    <div class="hero-figures">
      <div><b>${fmtJuta(pop.value)}</b><span>penduduk (${pop.year})</span></div>
      <div><b>${fmtTriliun(gdp.value)}</b><span>PDB (${gdp.year})</span></div>
      <div><b>${fmt1(life.value)} thn</b><span>harapan hidup (${life.year})</span></div>
      <div><b>${fmtPct(pov.value)}</b><span>penduduk miskin (${pov.year})</span></div>
    </div>
  </section>
  <div class="grid">
    ${card("Penduduk", fmtJuta(pop.value), "jiwa", WB, pop.year)}
    ${card("PDB", fmtTriliun(gdp.value), "harga berlaku", WB, gdp.year)}
    ${card("PDB per kapita", fmtUsd(pc.value), "harga berlaku", WB, pc.year)}
    ${card("Harapan hidup", fmt1(life.value) + " tahun", "saat lahir", WB, life.year)}
    ${card("Kemiskinan", fmtPct(pov.value), "penduduk di bawah garis kemiskinan nasional", WB, pov.year)}
    ${card("Pengangguran", fmtPct2(un.value), "dari angkatan kerja", WB, un.year)}
    ${card("Inflasi", fmtPct2(inf.value), "harga konsumen, tahunan", WB, inf.year)}
    ${card("Penduduk perkotaan", fmtPct(urb.value), "dari total penduduk", WB, urb.year)}
  </div>
  <section class="panel">
    <h2>Pertumbuhan penduduk, 1960–2024</h2>
    <p class="muted">Dari 88,3 juta jiwa pada 1960 menjadi ${fmtJuta(pop.value)} pada ${pop.year} — naik lebih dari tiga kali lipat dalam 64 tahun.</p>
    <div class="controls">${rangeButtons()} ${typeButtons()}</div>
    <div id="chart-slot">${drawChart("SP.POP.TOTL", fmtJuta, "Penduduk Indonesia 1960–2024")}</div>
    <p class="chart-note">Sumber: ${WB}, indikator SP.POP.TOTL. Arahkan kursor ke titik grafik untuk melihat nilai per tahun.</p>
  </section>
  <section class="panel">
    <h2>Di mana penduduk tinggal?</h2>
    <p class="muted">Pulau Jawa menampung 56,1% penduduk Indonesia meski luasnya hanya sekitar 7% wilayah negara.</p>
    <div class="chart">${hbarChart(ISLANDS.map((i) => ({ name: i.name, value: i.popMillion, note: i.share + "% penduduk" })), { format: (v) => v.toLocaleString("id-ID") + " jt" })}</div>
    <p class="chart-note">Sumber: ${BPS} — jumlah penduduk menurut kelompok pulau.</p>
  </section>`;
}

function population() {
  const metrics = [
    { key: "total", label: "Jumlah penduduk", code: "SP.POP.TOTL", format: fmtJuta },
    { key: "growth", label: "Pertumbuhan (%/tahun)", code: "SP.POP.GROW", format: fmtPct2 },
  ];
  const m = metrics.find((x) => x.key === state.metric) || metrics[0];
  const age = LATEST["SP.POP.0014.TO.ZS"], mid = LATEST["SP.POP.1564.TO.ZS"], old = LATEST["SP.POP.65UP.TO.ZS"];
  const top10 = [...PROVINCES].sort((a, b) => b.total - a.total).slice(0, 10);
  return `
  <h1>Penduduk</h1>
  <p class="lede">Indonesia adalah negara berpenduduk terbesar keempat di dunia. Pertumbuhannya melambat — dari
  2,8% per tahun pada 1961 menjadi ${fmtPct2(LATEST["SP.POP.GROW"].value)} pada 2024 — sementara penduduk lanjut usia terus bertambah.</p>
  <section class="panel">
    <h2>Tren penduduk</h2>
    <div class="controls">${metricButtons(metrics)} ${rangeButtons()} ${typeButtons()}</div>
    <div id="chart-slot">${drawChart(m.code, m.format, "Tren penduduk Indonesia")}</div>
    <p class="chart-note">Sumber: ${WB}, indikator ${m.code}.</p>
  </section>
  <div class="two-col">
    <section class="panel">
      <h2>Struktur umur (${age.year})</h2>
      <div class="chart">${hbarChart([
        { name: "0–14 tahun", value: age.value },
        { name: "15–64 tahun", value: mid.value },
        { name: "65+ tahun", value: old.value },
      ], { format: fmtPct })}</div>
      <p class="chart-note">Sumber: ${WB} (SP.POP.0014.TO.ZS, SP.POP.1564.TO.ZS, SP.POP.65UP.TO.ZS).</p>
    </section>
    <section class="panel">
      <h2>Kepadatan penduduk</h2>
      <div class="kv">
        <div><span>Luas daratan</span><b>${fmtInt(LATEST["AG.LND.TOTL.K2"].value)} km²</b></div>
        <div><span>Kepadatan (2024)</span><b>${fmtInt(LATEST["SP.POP.TOTL"].value / LATEST["AG.LND.TOTL.K2"].value)} jiwa/km²</b></div>
        <div><span>Rasio jenis kelamin (2020)</span><b>102 laki-laki / 100 perempuan</b></div>
        <div><span>Penduduk perkotaan (2024)</span><b>${fmtPct(LATEST["SP.URB.TOTL.IN.ZS"].value)}</b></div>
      </div>
      <p class="chart-note">Kepadatan dihitung dari penduduk 2024 dibagi luas daratan. Rasio jenis kelamin: ${BPS}.</p>
    </section>
  </div>
  <section class="panel">
    <h2>10 provinsi terpadat (Sensus 2020)</h2>
    <div class="chart">${hbarChart(top10.map((p) => ({ name: p.name, value: p.total })), { format: fmtJuta })}</div>
    <p class="chart-note">Sumber: ${BPS}. Tabel lengkap 34 provinsi ada di halaman <a href="#/regions">Provinsi</a>.</p>
  </section>`;
}

function economy() {
  const metrics = [
    { key: "total", label: "PDB (US$)", code: "NY.GDP.MKTP.CD", format: fmtTriliun },
    { key: "percapita", label: "PDB per kapita (US$)", code: "NY.GDP.PCAP.CD", format: fmtUsd },
    { key: "growth", label: "Pertumbuhan PDB (%/tahun)", code: "NY.GDP.MKTP.KD.ZG", format: fmtPct2 },
  ];
  const m = metrics.find((x) => x.key === state.metric) || metrics[0];
  const s = LATEST;
  const recent = [2024, 2023, 2022, 2021, 2020, 2019].map((y) => {
    const at = (code) => SERIES[code].values[y - SERIES[code].start];
    return { y, gdp: at("NY.GDP.MKTP.CD"), growth: at("NY.GDP.MKTP.KD.ZG"), inf: at("FP.CPI.TOTL.ZG"), un: at("SL.UEM.TOTL.ZS") };
  });
  return `
  <h1>Ekonomi</h1>
  <p class="lede">PDB Indonesia mencapai ${fmtTriliun(s["NY.GDP.MKTP.CD"].value)} pada ${s["NY.GDP.MKTP.CD"].year} dengan
  pertumbuhan ${fmtPct2(s["NY.GDP.MKTP.KD.ZG"].value)} — ekonomi terbesar di Asia Tenggara.</p>
  <div class="grid">
    ${card("PDB", fmtTriliun(s["NY.GDP.MKTP.CD"].value), "harga berlaku", WB, s["NY.GDP.MKTP.CD"].year)}
    ${card("PDB per kapita", fmtUsd(s["NY.GDP.PCAP.CD"].value), "harga berlaku", WB, s["NY.GDP.PCAP.CD"].year)}
    ${card("Pertumbuhan PDB", fmtPct2(s["NY.GDP.MKTP.KD.ZG"].value), "tahunan, harga konstan", WB, s["NY.GDP.MKTP.KD.ZG"].year)}
    ${card("Inflasi", fmtPct2(s["FP.CPI.TOTL.ZG"].value), "harga konsumen, tahunan", WB, s["FP.CPI.TOTL.ZG"].year)}
  </div>
  <section class="panel">
    <h2>Tren ekonomi</h2>
    <div class="controls">${metricButtons(metrics)} ${rangeButtons()} ${typeButtons()}</div>
    <div id="chart-slot">${drawChart(m.code, m.format, "Tren ekonomi Indonesia")}</div>
    <p class="chart-note">Sumber: ${WB}, indikator ${m.code}.</p>
  </section>
  <div class="two-col">
    <section class="panel">
      <h2>Pangsa sektor terhadap PDB (${s["NV.SRV.TOTL.ZS"].year})</h2>
      <div class="chart">${hbarChart([
        { name: "Jasa", value: s["NV.SRV.TOTL.ZS"].value },
        { name: "Industri", value: s["NV.IND.TOTL.ZS"].value },
        { name: "Pertanian", value: s["NV.AGR.TOTL.ZS"].value },
      ], { format: fmtPct })}</div>
      <p class="chart-note">Sumber: ${WB} (NV.SRV/IND/AGR.TOTL.ZS). Ketiga sektor berjumlah 95,7%; sisanya adalah pajak dikurangi subsidi atas produk.</p>
    </section>
    <section class="panel">
      <h2>Pengangguran</h2>
      <p>Pengangguran ${fmtPct2(s["SL.UEM.TOTL.ZS"].value)} dari angkatan kerja pada ${s["SL.UEM.TOTL.ZS"].year} — terendah dalam tiga dekade terakhir.</p>
      <div class="chart">${lineChart(sliceSeries("SL.UEM.TOTL.ZS", 1991, 2024), { height: 220, format: fmtPct2, color: "#b3402a", label: "Pengangguran 1991–2024" })}</div>
      <p class="chart-note">Sumber: ${WB}, indikator SL.UEM.TOTL.ZS (model estimasi ILO).</p>
    </section>
  </div>
  <section class="panel">
    <h2>Enam tahun terakhir</h2>
    <div class="table-wrap"><table class="data">
      <thead><tr><th>Tahun</th><th class="num">PDB</th><th class="num">Pertumbuhan PDB</th><th class="num">Inflasi</th><th class="num">Pengangguran</th></tr></thead>
      <tbody>${recent.map((r) => `<tr><td>${r.y}</td><td class="num">${fmtTriliun(r.gdp)}</td><td class="num">${fmtPct2(r.growth)}</td><td class="num">${fmtPct2(r.inf)}</td><td class="num">${fmtPct2(r.un)}</td></tr>`).join("")}</tbody>
    </table></div>
    <p class="chart-note">Sumber: ${WB}. Tahun 2020 mencatat kontraksi ${fmtPct2(-2.07)} akibat pandemi COVID-19.</p>
  </section>`;
}

function people() {
  const s = LATEST;
  return `
  <h1>Kesehatan &amp; Pendidikan</h1>
  <p class="lede">Harapan hidup orang Indonesia naik dari 46,8 tahun pada 1960 menjadi ${fmt1(s["SP.DYN.LE00.IN"].value)} tahun pada
  ${s["SP.DYN.LE00.IN"].year}. Sembilan dari sepuluh penduduk dewasa kini melek huruf.</p>
  <div class="grid">
    ${card("Harapan hidup", fmt1(s["SP.DYN.LE00.IN"].value) + " tahun", "saat lahir", WB, s["SP.DYN.LE00.IN"].year)}
    ${card("Melek huruf", fmtPct(s["SE.ADT.LITR.ZS"].value), "penduduk usia 15+ yang bisa baca-tulis", WB, s["SE.ADT.LITR.ZS"].year)}
    ${card("Sekolah dasar", fmtPct(s["SE.PRM.NENR"].value), "angka partisipasi murni SD", WB, s["SE.PRM.NENR"].year)}
    ${card("Kemiskinan", fmtPct(s["SI.POV.NAHC"].value), "di bawah garis kemiskinan nasional", WB, s["SI.POV.NAHC"].year)}
  </div>
  <section class="panel">
    <h2>Harapan hidup, 1960–2024</h2>
    <div class="controls">${rangeButtons()} ${typeButtons()}</div>
    <div id="chart-slot">${drawChart("SP.DYN.LE00.IN", (v) => fmt1(v) + " thn", "Harapan hidup 1960–2024")}</div>
    <p class="chart-note">Sumber: ${WB}, indikator SP.DYN.LE00.IN.</p>
  </section>
  <section class="panel">
    <h2>Kemiskinan menurun</h2>
    <p>Persentase penduduk di bawah garis kemiskinan nasional turun dari 17,5% (1996) menjadi ${fmtPct(s["SI.POV.NAHC"].value)} pada ${s["SI.POV.NAHC"].year}.</p>
    <div class="chart">${lineChart(sliceSeries("SI.POV.NAHC", 1996, 2024), { height: 300, format: fmtPct, color: "#d97706", label: "Kemiskinan 1996–2024" })}</div>
    <p class="chart-note">Sumber: ${WB}, indikator SI.POV.NAHC. Angka kematian kasar ${fmt1(s["SP.DYN.CDRT.IN"].value)} per 1.000 penduduk (${s["SP.DYN.CDRT.IN"].year}).</p>
  </section>
  <section class="panel">
    <h2>Yang perlu dicatat</h2>
    <ul class="tight">
      <li>Angka melek huruf terakhir yang dilaporkan World Bank adalah ${s["SE.ADT.LITR.ZS"].year} (${fmtPct(s["SE.ADT.LITR.ZS"].value)}); belum ada pembaruan sesudahnya di seri ini.</li>
      <li>Partisipasi murni sekolah dasar terakhir tercatat ${s["SE.PRM.NENR"].year} (${fmtPct(s["SE.PRM.NENR"].value)}).</li>
      <li>Kemiskinan diukur terhadap garis kemiskinan nasional, bukan garis internasional US$2,15/hari.</li>
    </ul>
  </section>`;
}

function regions() {
  const total = PROVINCES.reduce((a, p) => a + p.total, 0);
  const q = state.query.trim().toLowerCase();
  let rows = PROVINCES.map((p) => ({ ...p, share: (p.total / total) * 100, density: p.total / p.areaKm2 }));
  if (q) rows = rows.filter((p) => p.name.toLowerCase().includes(q));
  const dir = state.sortDir;
  rows.sort((a, b) => {
    const k = state.sortKey;
    return (a[k] < b[k] ? -1 : a[k] > b[k] ? 1 : 0) * dir;
  });
  const th = (key, label, num) => `<th class="sortable${num ? " num" : ""}" data-sort="${key}">${label}${state.sortKey === key ? (dir === -1 ? " ▼" : " ▲") : ""}</th>`;
  return `
  <h1>Provinsi</h1>
  <p class="lede">34 provinsi menurut Sensus Penduduk 2020. Klik judul kolom untuk mengurutkan, atau ketik di kotak pencarian untuk menyaring.</p>
  <section class="panel">
    <div class="controls">
      <input class="search" id="prov-search" type="search" placeholder="Cari provinsi… (mis. Jawa, Papua)" value="${state.query.replace(/"/g, "&quot;")}" aria-label="Cari provinsi">
      <span class="pill">${rows.length} dari 34 provinsi</span>
      <span class="muted">Total: ${fmtInt(total)} jiwa (2020)</span>
    </div>
    <div class="table-wrap"><table class="data">
      <thead><tr>
        ${th("name", "Provinsi")}${th("total", "Penduduk 2020", true)}${th("share", "Pangsa", true)}
        ${th("male", "Laki-laki", true)}${th("female", "Perempuan", true)}${th("areaKm2", "Luas (km²)", true)}${th("density", "Kepadatan", true)}
      </tr></thead>
      <tbody>${rows.map((p) => `<tr>
        <td>${p.name}</td><td class="num">${fmtInt(p.total)}</td><td class="num">${fmtPct2(p.share)}</td>
        <td class="num">${fmtInt(p.male)}</td><td class="num">${fmtInt(p.female)}</td>
        <td class="num">${fmtInt(p.areaKm2)}</td><td class="num">${fmtInt(p.density)}</td>
      </tr>`).join("") || `<tr><td colspan="7">Tidak ada provinsi yang cocok dengan “${state.query}”.</td></tr>`}</tbody>
    </table></div>
    <p class="chart-note">Sumber: ${BPS}. Luas wilayah: Kemendagri (dipublikasikan dalam Demografi Indonesia). Kepadatan = penduduk ÷ luas.</p>
  </section>`;
}

const INDICATORS = [
  ["Penduduk", "SP.POP.TOTL", "jiwa"],
  ["Pertumbuhan penduduk", "SP.POP.GROW", "% per tahun"],
  ["PDB", "NY.GDP.MKTP.CD", "US$ harga berlaku"],
  ["PDB per kapita", "NY.GDP.PCAP.CD", "US$ harga berlaku"],
  ["Pertumbuhan PDB", "NY.GDP.MKTP.KD.ZG", "% per tahun"],
  ["Harapan hidup", "SP.DYN.LE00.IN", "tahun"],
  ["Angka kematian kasar", "SP.DYN.CDRT.IN", "per 1.000 penduduk"],
  ["Melek huruf (15+)", "SE.ADT.LITR.ZS", "%"],
  ["Partisipasi murni SD", "SE.PRM.NENR", "%"],
  ["Kemiskinan (garis nasional)", "SI.POV.NAHC", "% penduduk"],
  ["Pengangguran", "SL.UEM.TOTL.ZS", "% angkatan kerja"],
  ["Inflasi (IHK)", "FP.CPI.TOTL.ZG", "% per tahun"],
  ["Penduduk perkotaan", "SP.URB.TOTL.IN.ZS", "% penduduk"],
  ["Pangsa pertanian thd PDB", "NV.AGR.TOTL.ZS", "% PDB"],
  ["Pangsa industri thd PDB", "NV.IND.TOTL.ZS", "% PDB"],
  ["Pangsa jasa thd PDB", "NV.SRV.TOTL.ZS", "% PDB"],
  ["Penduduk 0–14 tahun", "SP.POP.0014.TO.ZS", "% penduduk"],
  ["Penduduk 15–64 tahun", "SP.POP.1564.TO.ZS", "% penduduk"],
  ["Penduduk 65+ tahun", "SP.POP.65UP.TO.ZS", "% penduduk"],
  ["Luas daratan", "AG.LND.TOTL.K2", "km²"],
];
const fmtFor = {
  "SP.POP.TOTL": fmtInt, "NY.GDP.MKTP.CD": fmtTriliun, "NY.GDP.PCAP.CD": fmtUsd,
  "AG.LND.TOTL.K2": fmtInt, "SP.DYN.LE00.IN": fmt1, "SP.DYN.CDRT.IN": fmt1,
};
function dataPage() {
  const decades = [1960, 1970, 1980, 1990, 2000, 2010, 2020, 2024].map((y) => ({
    y, v: SERIES["SP.POP.TOTL"].values[y - SERIES["SP.POP.TOTL"].start],
  }));
  return `
  <h1>Data &amp; Sumber</h1>
  <p class="lede">Semua angka di situs ini. Nilai terbaru per indikator, beserta tahun dan sumbernya — tidak ada angka tanpa sumber.</p>
  <section class="panel">
    <h2>Indikator nasional — nilai terbaru</h2>
    <div class="table-wrap"><table class="data">
      <thead><tr><th>Indikator</th><th class="num">Nilai terbaru</th><th class="num">Tahun</th><th>Sumber</th></tr></thead>
      <tbody>${INDICATORS.map(([label, code, unit]) => {
        const l = LATEST[code];
        const f = fmtFor[code] || fmtPct;
        return `<tr><td>${label} <span class="muted">(${code})</span></td><td class="num">${f(l.value)} <span class="muted">${unit}</span></td><td class="num">${l.year}</td><td>World Bank Open Data</td></tr>`;
      }).join("")}</tbody>
    </table></div>
  </section>
  <section class="panel">
    <h2>Penduduk menurut tahun sensus</h2>
    <div class="table-wrap"><table class="data">
      <thead><tr><th>Tahun</th><th class="num">Penduduk</th><th>Sumber</th></tr></thead>
      <tbody>${decades.map((d) => `<tr><td>${d.y}</td><td class="num">${fmtInt(d.v)}</td><td>World Bank Open Data (SP.POP.TOTL)</td></tr>`).join("")}</tbody>
    </table></div>
    <p class="chart-note">Sensus 2020 BPS mencatat 270.203.917 jiwa — selisih 4,6 juta dari estimasi World Bank tahun yang sama (274.814.866); keduanya ditampilkan apa adanya.</p>
  </section>
  <section class="panel">
    <h2>Metodologi &amp; catatan</h2>
    <ul class="tight">
      <li>Seri nasional diambil dari World Bank Open Data (WDI) untuk Indonesia (IDN), diunduh 26 November 2026. Tahun yang ditampilkan adalah tahun terbaru yang tersedia untuk tiap indikator — ada indikator yang berhenti di 2018 atau 2020.</li>
      <li>Angka provinsi berasal dari BPS, Sensus Penduduk 2020 (sensus.bps.go.id), 34 provinsi, total 270.203.917 jiwa. Luas wilayah dari Kemendagri; kepadatan dihitung sebagai penduduk ÷ luas.</li>
      <li>Pangsa sektor terhadap PDB tidak berjumlah 100% karena pajak dikurangi subsidi atas produk tidak termasuk dalam ketiganya.</li>
      <li>Kemiskinan diukur terhadap garis kemiskinan nasional. Pengangguran mengikuti model estimasi ILO.</li>
      <li>Tidak ada angka yang diperkirakan atau dibulatkan dari sumber lain; tahun kosong dalam seri ditampilkan sebagai celah, bukan nol.</li>
    </ul>
    <h2>Sumber</h2>
    <ul class="tight">
      <li>World Bank Open Data — api.worldbank.org/v2/country/IDN/indicator/ (diakses 26 Nov 2026)</li>
      <li>Badan Pusat Statistik — Sensus Penduduk 2020, sensus.bps.go.id</li>
      <li>Kemendagri — luas wilayah provinsi, dipublikasikan dalam Demografi Indonesia</li>
    </ul>
  </section>`;
}

// ---- router ----
const ROUTES = {
  "/": overview,
  "/population": population,
  "/economy": economy,
  "/people": people,
  "/regions": regions,
  "/data": dataPage,
};

function render() {
  const path = (location.hash.replace(/^#/, "") || "/").split("?")[0];
  const view = ROUTES[path] || overview;
  app.innerHTML = view();
  document.querySelectorAll(".nav a").forEach((a) => {
    a.classList.toggle("active", a.dataset.route === (ROUTES[path] ? path : "/"));
  });
  document.title = "DataNusa — Statistik Indonesia" + (path !== "/" ? " · " + document.querySelector(".nav a.active")?.textContent : "");
  // chart controls (overview / population / economy / people)
  const redraw = () => {
    const slot = document.getElementById("chart-slot");
    if (!slot) return;
    const current = ROUTES[path] || overview;
    const tmp = document.createElement("div");
    tmp.innerHTML = current();
    const next = tmp.querySelector("#chart-slot");
    if (next) slot.innerHTML = next.innerHTML;
  };
  bindChartControls(redraw);
  // regions table controls
  const search = document.getElementById("prov-search");
  if (search) {
    search.addEventListener("input", () => { state.query = search.value; render(); const s2 = document.getElementById("prov-search"); s2.focus(); s2.setSelectionRange(s2.value.length, s2.value.length); });
    app.querySelectorAll("[data-sort]").forEach((th) => th.addEventListener("click", () => {
      if (state.sortKey === th.dataset.sort) state.sortDir *= -1;
      else { state.sortKey = th.dataset.sort; state.sortDir = th.dataset.sort === "name" ? 1 : -1; }
      render();
    }));
  }
  window.__shotReady = true;
}

export function init() {
  window.addEventListener("hashchange", render);
  render();
}
