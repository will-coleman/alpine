# alpineflyer.com

Static HTML. The finished site is committed in `docs/` — GitHub Pages and
Cloudflare Pages both serve that folder directly with **no build command and
nothing installed on the server**.

Node runs on your laptop only, to regenerate `docs/` when you change content.

---

## Add a country guide

Two minutes, two files.

**1. Fill in the country.** Every one of the 44 already exists as a stub in
`src/content/countries/`. Open the one you want:

```bash
open src/content/countries/albania.json
```

Set `published` to `true` and fill in the rest:

```json
{
  "name": "Albania",
  "slug": "albania",
  "iso": "AL",
  "region": "Balkans",
  "published": true,
  "headline": "THE *ALBANIA* NOBODY BOOKED",
  "intro": "One line, house voice. Name the place.",
  "hero": {
    "file": "albania.jpg",
    "alt": "What's in the photo",
    "credit": { "author": "Who shot it", "licence": "CC BY-SA 4.0", "source": "Wikimedia Commons", "url": "https://..." }
  },
  "mustSee": [{ "name": "Berat", "note": "One sentence." }],
  "seasons": { "spring": "", "summer": "", "autumn": "", "winter": "" },
  "transport": "Trains, buses, whether you need a car.",
  "instagram": [],
  "updated": "2026-08-09"
}
```

The `*asterisks*` in `headline` mark the word that gets knocked out in colour.
Pick the word carrying the information — the country, the place, the number.
The build shouts at you if a headline has no marked word.

Drop the hero photo in `src/assets/heroes/` with the filename you put in
`hero.file`. Any size — the build makes AVIF, WebP and JPEG at three widths.

**2. Add its places.** One file per place in `src/content/gems/`:

```json
{
  "name": "Theth",
  "slug": "theth",
  "country": "albania",
  "type": "mountain",
  "description": "A short paragraph. What it actually is.",
  "nearestTown": "Shkodër",
  "lat": 42.39,
  "lng": 19.77,
  "getting": "How you actually get there.",
  "image": null,
  "credit": null
}
```

`type` must be one of: `coast`, `mountain`, `town`, `ruin`, `food`,
`viewpoint`.

**3. Build and commit.**

```bash
npm run build && npm run check
```

Then commit — including `docs/`, which is the site.

The country appears on `/europe`, in the country index, in the running index on
the home page, in the hidden-gems list, in the sitemap, and gets its own share
image. Nothing else needs touching.

---

## The other commands

```bash
npm run build            # fetch the YouTube feed, regenerate docs/
npm run build -- --offline   # skip the network, use the committed videos.json
npm run check            # contrast, shell colours, ISO codes, JS budget, headings
npm run serve            # look at docs/ locally on :4321
```

`npm run check` is the one that matters before you push. It proves the things
that are easy to break by accident: every colour pair against WCAG AA, that no
property colour has leaked into the header or footer, that there are still 44
countries with valid ISO codes, that only the two filter pages ship JavaScript,
and that every page has exactly one `h1` with no skipped levels.

---

## Videos

Pulled from the channel's public RSS at build time — no API key, no quota.
The channel ID lives in `site.config.js`. Results are written to
`src/content/videos.json` and committed, so an offline build produces the same
site.

If the feed is unreachable and there's no committed `videos.json`, the build
**fails** rather than shipping an empty videos page.

Videos are sorted into series by matching the title. Anything that doesn't
match is listed at the end of the build:

```
Videos that didn't match a series:
  - lDQ2VsCG1Rg  "The rudder gets stuck mid flight"
```

Put it where it belongs by adding one line to `overrides` in
`build/lib/feed.mjs` — don't loosen the regexes, they sort every future upload.

---

## Instagram posts

`src/content/posts.json`. A post needs a real permalink (Share → Copy link) to
appear in the running index. Without one it still shows on its country page,
but it stays out of a list whose only job is going somewhere.

---

## Fonts

Three faces, self-hosted, subset, 51KB total. Archivo Condensed for display,
Source Sans 3 for body, IBM Plex Mono for coordinates and dates. All SIL Open
Font License — see `src/fonts/OFL.txt`.

You only need to regenerate them if you add a language with characters the
subset doesn't carry:

```bash
pip install "fonttools[woff]" brotli
python3 build/subset-fonts.py /path/to/source-ttfs
```

Sources are listed in that script's docstring. The `.woff2` files are
committed, so a normal build never needs Python.

---

## Deploying

**GitHub Pages** — Settings → Pages → Deploy from a branch → `main` / `/docs`.

**Cloudflare Pages** — connect the repo, leave the build command empty, set the
output directory to `docs`.

Either way there is no build step on the server.

`PUBLIC_FORMSPREE_ENDPOINT` in `.env` turns the form on `/europe/featured/` on.
Without it the page tells people to email instead, which works just as well.

Analytics are off. There's a commented-out Plausible tag in the `<head>` of
every page — uncomment it in `build/lib/layout.mjs` if you ever want it.

---

## The 44

Sovereign states of Europe with an official ISO 3166-1 alpha-2 code, plus the
Caucasus three and Türkiye, minus the five micro-states (Andorra,
Liechtenstein, Monaco, San Marino, Vatican City). That's exactly 44.

It's a judgment call and it's one file — `build/seed-countries.mjs`. Change the
list, delete the JSON for anything you dropped, rerun it. The count on the site
is computed from what's on disk, so it follows automatically.
