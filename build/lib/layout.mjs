import { html, raw, esc, attrs, json } from "./html.mjs";
import { site, nav, properties, youtube, instagram } from "../../site.config.js";

const live = properties.filter((p) => p.enabled);

/**
 * The document.
 *
 * CSS is inlined rather than linked. The whole stylesheet is ~4KB over the
 * wire once compressed, and one fewer render-blocking request is worth more
 * than cross-page caching on a site this size — most visits arrive cold from
 * a bio link on a phone and look at one page.
 */
export function page({
  title,
  description,
  path,
  section = null,
  ogImage = "/og/default.png",
  jsonLd = null,
  main,
  scripts = "",
  css = "",
  // /links is a bio-link page reached from a phone. It gets no nav and no
  // footer — the whole point of it is the stack and nothing else.
  bare = false,
}) {
  const canonical = new URL(path, site.url).href;
  const fullTitle = path === "/" ? `${title} — ${site.shortName}` : `${title} — Alpine Flyer`;
  const og = new URL(ogImage, site.url).href;

  return `<!doctype html>
<html lang="${esc(site.lang)}">
${String(html`<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${fullTitle}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">

<link rel="preload" href="/fonts/archivo-condensed-800.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/source-sans-3-var.woff2" as="font" type="font/woff2" crossorigin>

<meta property="og:type" content="website">
<meta property="og:site_name" content="${site.shortName}">
<meta property="og:locale" content="${site.locale}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${og}">

<meta name="theme-color" content="#161C1F">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="Alpine Flyer on YouTube" href="${youtube.feedUrl()}">

${jsonLd ? html`<script type="application/ld+json">${json(jsonLd)}</script>` : ""}

<style>${raw(css)}</style>

<!-- Analytics slot. Uncomment to turn Plausible on; nothing else is needed.
<script defer data-domain="alpineflyer.com" src="https://plausible.io/js/script.js"></script>
-->
</head>`)}
<body>
${
  bare
    ? ""
    : String(html`<a class="skip" href="#main">Skip to content</a>
<header>
  <div class="wrap">
    <div class="hdr">
      <a class="hdr-mark" href="/">Alpine <span>Media Group</span></a>
      <nav class="nav" aria-label="Primary">
        ${nav.map(
          (item) =>
            html`<a href="${item.href}"${attrs({
              "aria-current": path.startsWith(item.href) ? "page" : null,
            })}>${item.label}</a>`
        )}
      </nav>
    </div>
  </div>
</header>`)
}
${section ? `<div data-section="${esc(section)}">` : "<div>"}
<main id="main">
${String(main)}
</main>
</div>
${bare ? "" : String(footer())}
${scripts ? String(scripts) : ""}
</body>
</html>
`;
}

function footer() {
  return html`<footer class="ftr">
  <div class="wrap ftr-grid">
    <div>
      <p class="d d-s">Alpine Media Group</p>
      <p class="ftr-note">
        One person with a camera, based in ${site.based}. Travel and airline reviews on YouTube,
        and open to partnerships. If you email it, I'm the one who reads it —
        <a href="mailto:${site.email}">${site.email}</a>.
      </p>
    </div>
    <div class="ftr-links">
      <p class="m" style="margin:0 0 .25rem">Pages</p>
      <a href="/videos/">Videos</a>
      <a href="/instagram/">Instagram project</a>
      <a href="/partnerships/">Partnerships</a>
      <a href="/about/">About</a>
      <a href="/links/">Links</a>
    </div>
    <div class="ftr-links">
      <p class="m" style="margin:0 0 .25rem">Elsewhere</p>
      <a href="${youtube.channelUrl}" rel="me">YouTube ${youtube.handle}</a>
      <a href="${instagram.url}" rel="me">Instagram ${instagram.handle}</a>
      <a href="/links/">All links</a>
    </div>
    <p class="m ftr-end">© ${new Date().getFullYear()} ${site.shortName}</p>
  </div>
</footer>`;
}
