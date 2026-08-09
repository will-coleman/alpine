/**
 * The build.
 *
 *   npm run build              fetch the feed, rebuild everything
 *   npm run build -- --offline use the committed videos.json, touch no network
 *
 * Output is plain HTML in dist/. There is no framework and no client-side
 * router; the only JavaScript that ships is on the two filter pages.
 */

import { readFile, writeFile, mkdir, rm, cp, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { performance } from "node:perf_hooks";

import { ROOT, SRC, DIST, CACHE } from "./lib/paths.mjs";
import { site } from "../site.config.js";
import { loadVideos } from "./lib/feed.mjs";
import { loadContent } from "./lib/content.mjs";
import { process as processImage } from "./lib/images.mjs";
import { unmarkedHeadlines } from "./lib/headline.mjs";
import { buildOgImages } from "./lib/og.mjs";

import home from "./pages/home.mjs";
import videos from "./pages/videos.mjs";
import europe from "./pages/europe.mjs";
import countries from "./pages/countries.mjs";
import country from "./pages/country.mjs";
import gems from "./pages/gems.mjs";
import featured from "./pages/featured.mjs";
import about from "./pages/about.mjs";
import work from "./pages/work.mjs";
import links from "./pages/links.mjs";
import notFound from "./pages/404.mjs";

const offline = process.argv.includes("--offline");
const t0 = performance.now();

/** Conservative: strips comments and squeezes whitespace, touches nothing else. */
function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{};,])\s*/g, "$1")
    .replace(/;\}/g, "}")
    .trim();
}

async function writePage(path, contents) {
  const file = path === "/404.html" ? join(DIST, "404.html") : join(DIST, path, "index.html");
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, contents);
  return Buffer.byteLength(contents);
}

async function main() {
  console.log("\n  alpineflyer.com\n");

  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  const videoData = await loadVideos({ offline });
  const content = await loadContent(videoData);

  // Thumbnails for the running index and the video rows. Cached locally at
  // build so no page ever hotlinks to Google and nothing shifts on load.
  const thumbDir = join(CACHE, "thumbs");
  const cachedThumbs = new Set(await readdir(thumbDir).catch(() => []));
  const thumbs = new Map();
  for (const v of content.videos) {
    if (!v.thumb || !cachedThumbs.has(v.thumb)) continue;
    const img = await processImage(join(thumbDir, v.thumb), { widths: [320, 640] });
    thumbs.set(v.id, {
      src: img.webp[0].split(" ")[0],
      srcset: img.webp.join(", "),
      width: 320,
      height: Math.round((img.intrinsic.height / img.intrinsic.width) * 320),
    });
  }
  for (const item of content.index) {
    const t = item.thumb && thumbs.get(item.thumb.replace(/\.jpg$/, ""));
    if (t) Object.assign(item, { thumbSrc: t.src, thumbW: t.width, thumbH: t.height });
  }
  content.thumbs = thumbs;

  const css = minifyCss(await readFile(join(SRC, "styles", "site.css"), "utf8"));
  const ctx = { ...content, css };

  const pages = [
    ...(await home(ctx)),
    ...(await videos(ctx)),
    ...(await europe(ctx)),
    ...(await countries(ctx)),
    ...(await country(ctx)),
    ...(await gems(ctx)),
    ...(await featured(ctx)),
    ...(await about(ctx)),
    ...(await work(ctx)),
    ...(await links(ctx)),
    ...(await notFound(ctx)),
  ];

  let bytes = 0;
  const sizes = new Map();
  for (const p of pages) {
    const n = await writePage(p.path, p.html);
    sizes.set(p.path, n);
    bytes += n;
  }

  await cp(join(SRC, "fonts"), join(DIST, "fonts"), { recursive: true });
  await cp(join(ROOT, "public"), DIST, { recursive: true }).catch(() => {});

  await buildOgImages(ctx, pages);
  await writeSitemap(pages);
  await writeRobots();

  report({ ctx, pages, sizes, bytes });
}

async function writeSitemap(pages) {
  const urls = pages
    .filter((p) => p.path !== "/404.html" && !p.noindex)
    .map(
      (p) =>
        `  <url><loc>${new URL(p.path, site.url).href}</loc>` +
        (p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : "") +
        `</url>`
    )
    .join("\n");
  await writeFile(
    join(DIST, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );
}

async function writeRobots() {
  await writeFile(
    join(DIST, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${new URL("/sitemap.xml", site.url).href}\n`
  );
}

function report({ ctx, pages, sizes, bytes }) {
  const kb = (n) => `${(n / 1024).toFixed(1)}KB`;
  console.log(`   pages:  ${pages.length}  (${kb(bytes)} of HTML)`);
  console.log(`   board:  ${ctx.counts.covered} / ${ctx.counts.total} covered`);
  console.log(`   gems:   ${ctx.gems.length} across ${new Set(ctx.gems.map((g) => g.country)).size} countries`);
  console.log(`   index:  ${ctx.index.length} rows`);
  console.log(`   links:  ${kb(sizes.get("/links/") ?? 0)}`);

  if (ctx.problems.length) {
    console.log("\n   Content problems:");
    for (const p of ctx.problems) console.log(`     - ${p}`);
  }

  const unmarked = unmarkedHeadlines();
  if (unmarked.length) {
    console.log("\n   Headlines with no keyword marked (wrap the load-bearing word in *asterisks*):");
    for (const u of unmarked) console.log(`     - ${u}`);
  }

  if (ctx.unsorted.length) {
    console.log("\n   Videos that didn't match a series — tell me where these go and I'll add");
    console.log("   an entry to `overrides` in build/lib/feed.mjs:");
    for (const v of ctx.unsorted) console.log(`     - ${v.id}  "${v.title}"`);
  }

  console.log(`\n   done in ${((performance.now() - t0) / 1000).toFixed(1)}s\n`);
}

main().catch((err) => {
  console.error(`\n  BUILD FAILED\n\n  ${err.message}\n`);
  process.exitCode = 1;
});
