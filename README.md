# alpineflyer.com

Travel and airline reviews. Seven pages of static HTML, committed in `docs/`.

GitHub Pages and Cloudflare Pages both serve that folder directly with **no
build command and nothing installed on the server**. Node runs on your laptop
only, to regenerate `docs/` when the channel has new videos.

```
/               home — who I am, partnerships, every video
/videos/        about me, the airline review, and the flight sim back catalogue
/instagram/     the Visit Europe Project — what it is and where it's going
/partnerships/  what I deliver and how to get a rate card
/about/         me, and where the Instagram project lives
/links/         bio-link page, no JavaScript, 14KB
404
```

---

## The one thing you'll do regularly

Publish a video on YouTube, then:

```bash
npm run build && npm run check
```

Commit, including `docs/`. That's it. The feed is read at build time, so the
new video appears on the home page and on `/videos/` on its own — nothing to
type twice.

---

## Sorting videos into series

Videos are sorted by matching the title. Anything that doesn't match gets
listed at the end of the build:

```
Videos that didn't match a series:
  - lDQ2VsCG1Rg  "The rudder gets stuck mid flight"
```

Put it where it belongs with one line in `overrides` at the top of
`build/lib/feed.mjs`:

```js
export const overrides = {
  lDQ2VsCG1Rg: "flight-sim",
};
```

Don't loosen the regexes to catch it — they sort every future upload too, and
a loose one mis-sorts everything after it.

Series live in the same file, in the order they appear on the page. Airline
reviews first, flight sim last, because that's the direction the channel is
going.

---

## Editing the words

| What | Where |
|---|---|
| Home headline and intro | `build/pages/home.mjs` |
| Partnership pitch on the home page | `build/pages/home.mjs`, the `.pitch` section |
| What you deliver, and rates | `build/pages/partnerships.mjs`, the `DELIVERABLES` array |
| About | `build/pages/about.mjs` |
| The links stack | `build/pages/links.mjs` |
| Email, handles, nav, channel ID | `site.config.js` |

Headlines mark the highlighted word with `*asterisks*`:

```js
const H1 = "OPEN FOR *PARTNERSHIPS*";
```

Pick the word carrying the information. The build tells you if a headline
forgot one.

---

## Commands

```bash
npm run build            # read the feed, regenerate docs/
npm run build -- --offline   # skip the network, use the committed videos.json
npm run check            # contrast, shell colours, JS budget, heading order
npm run serve            # look at docs/ locally on :4321
```

`npm run check` is the one to run before pushing. It proves every colour pair
against WCAG AA, that no property red has leaked into the header or footer,
that no page ships JavaScript, that `/links` is under 30KB, and that every
page has exactly one `h1` with no skipped levels.

---

## How it's put together

- **No framework.** `build/index.mjs` renders template literals to HTML.
  `build/lib/html.mjs` is a 30-line escaping primitive; that's the whole
  "templating engine".
- **Videos** come from the channel's public RSS — no API key, no quota.
  Results are written to `src/content/videos.json` and committed, so an
  offline build produces the same site. If the feed is unreachable and there's
  no committed copy, the build **fails** rather than shipping an empty page.
- **Thumbnails** are cached locally at build, so no page hotlinks to Google.
  Vertical uploads arrive pillarboxed into a 16:9 file; the pipeline detects
  the black bars from the pixels and crops them off.
- **Images** are AVIF, WebP and JPEG at three widths, with explicit dimensions
  so nothing moves as the page loads.
- **Fonts** are self-hosted, subset, 51KB for three faces. All SIL Open Font
  License — see `src/fonts/OFL.txt`. Regenerate with
  `python3 build/subset-fonts.py` only if you add characters the subset
  doesn't carry.
- **Share images** are drawn at build with satori, in the site's own type.
- **No client JavaScript at all**, and no analytics. There's a commented-out
  Plausible tag in the `<head>` — uncomment it in `build/lib/layout.mjs` if
  you want it.

---

## Deploying

**GitHub Pages** — Settings → Pages → Deploy from a branch → `main` / `/docs`.

**Cloudflare Pages** — connect the repo, leave the build command empty, output
directory `docs`.

`PUBLIC_FORMSPREE_ENDPOINT` in `.env` is unused right now; enquiries go to
email by design.

---

## Removed, and how to get it back

An earlier version had a Visit Europe section: 44 country stubs, six written
guides, 29 places with coordinates, filters, and a 44-tile board. It was cut so
the site is about you rather than about a second project.

It's all in commit `42c60ae` if you ever want it:

```bash
git checkout 42c60ae -- src/content/countries src/content/gems
```
