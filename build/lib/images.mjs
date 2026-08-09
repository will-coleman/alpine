/**
 * The image pipeline.
 *
 * AVIF first, WebP second, JPEG last, every one with explicit width and
 * height so nothing on the page moves while it loads. Output is content
 * hashed and cached in .cache/img, so a rebuild that hasn't changed a photo
 * doesn't re-encode it.
 *
 * Photography on this site is full bleed and large. It is never put inside a
 * rounded card with a drop shadow.
 */

import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir, copyFile, access } from "node:fs/promises";
import { join, basename, extname } from "node:path";
import sharp from "sharp";
import { CACHE, DIST } from "./paths.mjs";
import { html, raw, esc, attrs } from "./html.mjs";

const IMG_CACHE = join(CACHE, "img");
const OUT_DIR = join(DIST, "img");

const exists = (p) => access(p).then(() => true, () => false);

const AVIF = { quality: 55, effort: 6 };
const WEBP = { quality: 76, effort: 5 };
const JPEG = { quality: 80, mozjpeg: true, progressive: true };

/**
 * Encodes one source into three formats at the widths asked for.
 * Returns the data a <picture> needs, not markup.
 */
export async function process(srcPath, { widths = [480, 960, 1600] } = {}) {
  const buf = await readFile(srcPath);
  const hash = createHash("sha1").update(buf).update(widths.join(",")).digest("hex").slice(0, 8);
  const stem = basename(srcPath, extname(srcPath)).replace(/[^a-z0-9-]+/gi, "-").toLowerCase();

  const meta = await sharp(buf).metadata();
  const usable = widths.filter((w) => w <= meta.width).concat(widths.some((w) => w <= meta.width) ? [] : [meta.width]);
  const sorted = [...new Set(usable)].sort((a, b) => a - b);

  await mkdir(IMG_CACHE, { recursive: true });
  await mkdir(OUT_DIR, { recursive: true });

  const out = { widths: [], avif: [], webp: [], jpg: [], width: 0, height: 0, base: "" };

  for (const w of sorted) {
    const h = Math.round((meta.height / meta.width) * w);
    for (const [ext, opts] of [["avif", AVIF], ["webp", WEBP], ["jpg", JPEG]]) {
      const name = `${stem}-${hash}-${w}.${ext}`;
      const cached = join(IMG_CACHE, name);
      if (!(await exists(cached))) {
        const pipe = sharp(buf).resize({ width: w, withoutEnlargement: true });
        const encoded =
          ext === "avif" ? pipe.avif(opts) : ext === "webp" ? pipe.webp(opts) : pipe.jpeg(opts);
        await writeFile(cached, await encoded.toBuffer());
      }
      await copyFile(cached, join(OUT_DIR, name));
      out[ext].push(`/img/${name} ${w}w`);
    }
    out.widths.push(w);
    out.width = w;
    out.height = h;
  }

  const largest = sorted[sorted.length - 1];
  out.base = `/img/${stem}-${hash}-${largest}.jpg`;
  out.width = largest;
  out.height = Math.round((meta.height / meta.width) * largest);
  out.intrinsic = { width: meta.width, height: meta.height };
  return out;
}

/** <picture> with the three sources, explicit dimensions and no wrapper chrome. */
export async function picture(srcPath, { alt, sizes = "100vw", widths, className = "", eager = false } = {}) {
  const img = await process(srcPath, widths ? { widths } : undefined);
  return html`<picture>
<source type="image/avif" srcset="${img.avif.join(", ")}" sizes="${sizes}">
<source type="image/webp" srcset="${img.webp.join(", ")}" sizes="${sizes}">
<img src="${img.base}" srcset="${img.jpg.join(", ")}" sizes="${sizes}" alt="${alt}" width="${img.width}" height="${img.height}"${attrs(
    {
      class: className || null,
      loading: eager ? "eager" : "lazy",
      decoding: eager ? "sync" : "async",
      fetchpriority: eager ? "high" : null,
    }
  )}>
</picture>`;
}

/** Credit line. Every photo on this site carries one. */
export function credit(c) {
  if (!c) return "";
  const who = c.url
    ? html`<a href="${c.url}" rel="nofollow noopener">${c.author}</a>`
    : html`${c.author}`;
  return html`<p class="credit">${who}${c.licence ? html` · ${c.licence}` : ""}${
    c.source ? html` · ${c.source}` : ""
  }</p>`;
}
