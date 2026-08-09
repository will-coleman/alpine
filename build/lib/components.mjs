import { html, attrs } from "./html.mjs";
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



/** The outlet's name, for the small line under a card. */
export function propertyTag(id) {
  return propertyById(id)?.tag ?? "";
}
