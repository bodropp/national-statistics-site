// DataNusa charts: hand-rolled SVG line and bar charts, no library.
// Every chart is built from the data in data.js and rendered as inline SVG.
import { SERIES } from "./data.js";

export const COLORS = {
  teal: "#0e4f4a",
  amber: "#d97706",
  soft: "#7fb3ac",
  red: "#b3402a",
  grid: "#e3ddcb",
  axis: "#8a9a96",
};

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function niceTicks(min, max, count) {
  if (min === max) { min -= 1; max += 1; }
  const span = max - min;
  const step0 = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const norm = step0 / mag;
  const step = (norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10) * mag;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = lo; v <= hi + step * 0.001; v += step) ticks.push(v);
  return ticks;
}

// Points of a series inside [fromYear, toYear]; skips null values.
export function sliceSeries(code, fromYear, toYear) {
  const s = SERIES[code];
  const pts = [];
  for (let i = 0; i < s.values.length; i++) {
    const y = s.start + i;
    const v = s.values[i];
    if (y >= fromYear && y <= toYear && v !== null && v !== undefined) pts.push({ year: y, value: v });
  }
  return pts;
}

// Line chart. format(value) -> axis/tooltip label. Returns an SVG string.
export function lineChart(pts, { width = 960, height = 360, format = (v) => String(v), color = COLORS.teal, label = "" } = {}) {
  const padL = 78, padR = 18, padT = 14, padB = 34;
  const w = width - padL - padR, h = height - padT - padB;
  const xs = pts.map((p) => p.year), ys = pts.map((p) => p.value);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  let y0 = Math.min(...ys), y1 = Math.max(...ys);
  const pad = (y1 - y0) * 0.08 || 1;
  y0 -= pad; y1 += pad;
  const X = (y) => padL + ((y - x0) / Math.max(1, x1 - x0)) * w;
  const Y = (v) => padT + (1 - (v - y0) / (y1 - y0)) * h;
  const ticks = niceTicks(y0, y1, 4);
  let out = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label)}">`;
  for (const t of ticks) {
    out += `<line x1="${padL}" y1="${Y(t)}" x2="${padL + w}" y2="${Y(t)}" stroke="${COLORS.grid}" stroke-width="1"/>`;
    if (Y(t) < height - padB - 8) {
      out += `<text x="${padL - 8}" y="${Y(t) + 4}" text-anchor="end" font-size="12" fill="${COLORS.axis}">${esc(format(t))}</text>`;
    }
  }
  const yearStep = Math.max(1, Math.round((x1 - x0) / 8));
  for (let y = x0; y <= x1; y += yearStep) {
    out += `<text x="${X(y)}" y="${height - 10}" text-anchor="middle" font-size="12" fill="${COLORS.axis}">${y}</text>`;
  }
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${X(p.year).toFixed(1)},${Y(p.value).toFixed(1)}`).join(" ");
  out += `<path d="${path} L${X(pts[pts.length - 1].year).toFixed(1)},${padT + h} L${X(pts[0].year).toFixed(1)},${padT + h} Z" fill="${color}" fill-opacity="0.07"/>`;
  out += `<path d="${path}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  for (const p of pts) {
    if ((p.year - x0) % Math.max(1, Math.round((x1 - x0) / 12)) === 0 || p.year === x1) {
      out += `<circle cx="${X(p.year).toFixed(1)}" cy="${Y(p.value).toFixed(1)}" r="3.2" fill="#fff" stroke="${color}" stroke-width="2"><title>${p.year}: ${esc(format(p.value))}</title></circle>`;
    }
  }
  const last = pts[pts.length - 1];
  out += `<text x="${X(last.year)}" y="${Y(last.value) - 10}" text-anchor="end" font-size="13" font-weight="700" fill="${color}">${esc(format(last.value))} (${last.year})</text>`;
  return out + "</svg>";
}

// Vertical bar chart for a series (one bar per year, sampled to <= 30 bars).
export function barChart(pts, { width = 960, height = 360, format = (v) => String(v), color = COLORS.teal, label = "" } = {}) {
  const padL = 78, padR = 18, padT = 14, padB = 34;
  const w = width - padL - padR, h = height - padT - padB;
  const step = Math.max(1, Math.ceil(pts.length / 30));
  const shown = pts.filter((_, i) => i % step === 0 || i === pts.length - 1);
  const ys = shown.map((p) => p.value);
  let y0 = Math.min(0, ...ys), y1 = Math.max(...ys);
  const pad = (y1 - y0) * 0.06 || 1;
  y1 += pad;
  const bw = w / shown.length;
  const Y = (v) => padT + (1 - (v - y0) / (y1 - y0)) * h;
  const ticks = niceTicks(y0, y1, 4);
  let out = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label)}">`;
  for (const t of ticks) {
    out += `<line x1="${padL}" y1="${Y(t)}" x2="${padL + w}" y2="${Y(t)}" stroke="${COLORS.grid}" stroke-width="1"/>`;
    if (Y(t) < height - padB - 8) {
      out += `<text x="${padL - 8}" y="${Y(t) + 4}" text-anchor="end" font-size="12" fill="${COLORS.axis}">${esc(format(t))}</text>`;
    }
  }
  shown.forEach((p, i) => {
    const x = padL + i * bw + bw * 0.15;
    const barW = Math.max(2, bw * 0.7);
    out += `<rect x="${x.toFixed(1)}" y="${Y(p.value).toFixed(1)}" width="${barW.toFixed(1)}" height="${(padT + h - Y(p.value)).toFixed(1)}" fill="${color}" rx="2"><title>${p.year}: ${esc(format(p.value))}</title></rect>`;
    if (shown.length <= 16 || i % 2 === 0) {
      out += `<text x="${(x + barW / 2).toFixed(1)}" y="${height - 10}" text-anchor="middle" font-size="11" fill="${COLORS.axis}">${p.year}</text>`;
    }
  });
  return out + "</svg>";
}

// Horizontal bars: [{name, value, note}] — for rankings and shares.
export function hbarChart(rows, { width = 960, format = (v) => String(v), color = COLORS.teal, maxLabel = 34 } = {}) {
  const padL = 170, padR = 90, rowH = 30, padT = 8;
  const height = padT + rows.length * rowH + 8;
  const max = Math.max(...rows.map((r) => r.value));
  const w = width - padL - padR;
  let out = `<svg viewBox="0 0 ${width} ${height}" role="img">`;
  rows.forEach((r, i) => {
    const y = padT + i * rowH;
    const bw = Math.max(2, (r.value / max) * w);
    const name = r.name.length > maxLabel ? r.name.slice(0, maxLabel - 1) + "…" : r.name;
    out += `<text x="${padL - 10}" y="${y + 19}" text-anchor="end" font-size="13" fill="${COLORS.axis}">${esc(name)}</text>`;
    out += `<rect x="${padL}" y="${y + 6}" width="${bw.toFixed(1)}" height="18" fill="${color}" rx="3"><title>${esc(r.name)}: ${esc(format(r.value))}${r.note ? " — " + esc(r.note) : ""}</title></rect>`;
    out += `<text x="${padL + bw + 8}" y="${y + 19}" font-size="13" font-weight="600" fill="${COLORS.teal}">${esc(format(r.value))}</text>`;
  });
  return out + "</svg>";
}
