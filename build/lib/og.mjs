/**
 * Per-page share images, drawn at build in the site's own type treatment so a
 * link pasted into a chat looks like the channels do.
 *
 * Slate ground, condensed caps, the keyword knocked out in the section's
 * accent, and the sodium rule along the bottom — the same rule that closes
 * every page in the browser.
 *
 * satori lays it out and returns SVG with the glyphs already converted to
 * paths, sharp turns that into PNG. No headless browser.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import satori from "satori";
import sharp from "sharp";
import { SRC, DIST } from "./paths.mjs";
import { plain } from "./headline.mjs";

const W = 1200;
const H = 630;

const SLATE = "#161C1F";
const SNOW = "#EEF1F2";
const SODIUM = "#F0932B";
const SCREE = "#8A98A0";

// The dark-surface accent for each section. Verified against slate: sodium
// 6.5:1, red 5.2:1, blue 5.1:1.
const ACCENT = {
  default: SODIUM,
  videos: "#FF4A3D",
  europe: "#5B8AE8",
};

const div = (style, children) => ({ type: "div", props: { style, children } });

/** Splits "THE *PORTUGAL* NOBODY" into coloured and uncoloured runs. */
function runs(marked, accent) {
  const out = [];
  const source = String(marked ?? "").toUpperCase();
  let last = 0;
  for (const m of source.matchAll(/\*([^*]+)\*/g)) {
    if (m.index > last) out.push({ text: source.slice(last, m.index), colour: SNOW });
    out.push({ text: m[1], colour: accent });
    last = m.index + m[0].length;
  }
  if (last < source.length) out.push({ text: source.slice(last), colour: SNOW });
  return out.map((r) => div({ color: r.colour, whiteSpace: "pre-wrap" }, r.text));
}

function card({ eyebrow, title, meta, section = "default" }) {
  const accent = ACCENT[section] ?? SODIUM;
  const length = plain(title).length;
  const size = length > 46 ? 76 : length > 28 ? 94 : 112;

  return div(
    {
      width: W,
      height: H,
      display: "flex",
      flexDirection: "column",
      background: SLATE,
    },
    [
      div(
        {
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 72px 56px",
        },
        [
          div(
            {
              fontFamily: "Plex",
              fontSize: 22,
              letterSpacing: 3.5,
              color: SCREE,
              display: "flex",
            },
            String(eyebrow ?? "").toUpperCase()
          ),
          div(
            {
              display: "flex",
              flexWrap: "wrap",
              fontFamily: "Archivo",
              fontSize: size,
              lineHeight: 0.88,
              letterSpacing: -1,
              color: SNOW,
              maxWidth: 1000,
            },
            runs(title, accent)
          ),
          div(
            {
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "Plex",
              fontSize: 22,
              letterSpacing: 2.5,
              color: SCREE,
            },
            [
              div({ display: "flex" }, "ALPINEFLYER.COM"),
              div({ display: "flex", color: SNOW }, String(meta ?? "").toUpperCase()),
            ]
          ),
        ]
      ),
      div({ height: 10, background: SODIUM, display: "flex" }, []),
    ]
  );
}

export async function buildOgImages(ctx, pages) {
  const dir = join(DIST, "og");
  await mkdir(dir, { recursive: true });

  const fonts = [
    { name: "Archivo", data: await readFile(join(SRC, "fonts", "og", "archivo-condensed-800.ttf")), weight: 800, style: "normal" },
    { name: "Plex", data: await readFile(join(SRC, "fonts", "og", "ibm-plex-mono-400.ttf")), weight: 400, style: "normal" },
  ];

  const cards = [
    { file: "default", eyebrow: "Alpine Media Group", title: "EVERYTHING I *MAKE*", meta: "" },
    { file: "home", eyebrow: "Travel films and airline reviews", section: "videos", title: "I'M TRAVELLING EUROPE, ONE *COUNTRY* AT A TIME", meta: `${ctx.videos.length} videos` },
    { file: "videos", eyebrow: "Alpine Flyer · YouTube", title: "TRAVEL, AIRLINES, AND THE *AEROPLANES* THEMSELVES", section: "videos", meta: `${ctx.videos.length} videos` },
    { file: "about", eyebrow: "Alpine Media Group", title: "ONE PERSON, ONE *CAMERA*", meta: "About" },
    { file: "instagram", eyebrow: "Instagram · @visiteuropeproject", title: "THE VISIT EUROPE *PROJECT*", meta: "44 countries" },
    { file: "partnerships", eyebrow: "Get in touch", title: "OPEN FOR *PARTNERSHIPS*", section: "videos", meta: "" },
    { file: "links", eyebrow: "Alpine Media Group", title: "EVERYTHING IN ONE *PLACE*", meta: "Links" },
  ];

  for (const c of cards) {
    const svg = await satori(card(c), { width: W, height: H, fonts });
    const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toBuffer();
    await writeFile(join(dir, `${c.file}.png`), png);
  }

  console.log(`   og:     ${cards.length} cards`);
}
