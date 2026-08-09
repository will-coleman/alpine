import { html, attrs } from "./html.mjs";
import { kw } from "./headline.mjs";
import { propertyById } from "./content.mjs";

/** 9 August 2026 → "9 AUG 26", which is what fits at 375px. */
export function shortDate(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  const month = d.toLocaleString("en-GB", { month: "short", timeZone: "UTC" }).toUpperCase();
  return `${d.getUTCDate()} ${month} ${String(d.getUTCFullYear()).slice(2)}`;
}

export function longDate(iso) {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** 41.73, -8.15 → "41.730 N · 8.150 W". Rough on purpose — it's a lay-by, not a doorstep. */
export function coords(lat, lng) {
  const f = (n, pos, neg) => `${Math.abs(n).toFixed(3)} ${n >= 0 ? pos : neg}`;
  return `${f(lat, "N", "S")} · ${f(lng, "E", "W")}`;
}

/**
 * The running index.
 *
 * One column, one item per row: date, channel tag, title in the display face.
 * No cards, no grid, no thumbnails fighting the type — the thumbnail only
 * appears on hover or keyboard focus, and only at widths where there is
 * already room reserved for it, so revealing it never moves the page.
 */
export function runningIndex(items, { limit = null, settle = true } = {}) {
  const rows = limit ? items.slice(0, limit) : items;
  return html`<ol class="index${settle ? " js-settle" : ""}">
${rows.map((item, i) => {
  const property = propertyById(item.property);
  return html`<li class="row" data-p="${item.property}"${attrs({ style: settle && i < 14 ? `--i:${i}` : null })}>
  <a class="row-a" href="${item.href}"${attrs({ rel: item.external ? "noopener" : null })}>
    <span class="row-date">${shortDate(item.date)}</span>
    <span class="row-tag">${property?.tag ?? ""}</span>
    <span class="row-t">${kw(item.title)}</span>
    ${item.thumbSrc
      ? html`<img class="row-thumb" src="${item.thumbSrc}" alt="" width="${item.thumbW}" height="${item.thumbH}" loading="lazy" decoding="async">`
      : html`<span class="row-thumb" aria-hidden="true"></span>`}
  </a>
</li>`;
})}
</ol>`;
}

