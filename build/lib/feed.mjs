/**
 * The YouTube feed.
 *
 * Pulled at build time from the channel's public RSS. No API key, no quota,
 * no client-side fetch. The result is written to src/content/videos.json and
 * committed, so a build with no network still produces the same site.
 *
 * If the feed is unreachable and there's no committed videos.json to fall
 * back on, the build stops. An empty videos page is worse than a red build.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { youtube } from "../../site.config.js";
import { ROOT } from "./paths.mjs";

const VIDEOS_JSON = join(ROOT, "src", "content", "videos.json");
const THUMB_CACHE = join(ROOT, ".cache", "thumbs");

/**
 * The three series that actually exist on the channel. Order is the order
 * they appear on /videos.
 *
 * A title that matches nothing lands in `null` and gets listed at the end of
 * the build so it can be sorted by hand — see `overrides` below.
 */
export const SERIES = [
  {
    id: "airline-reviews",
    name: "Airline reviews",
    blurb: "Booked it, flew it, told you what it was actually like.",
    test: /\bairlines?\b|\bflew it\b|\breview|\bstar airline\b|trip report|ryanair|wizz|easyjet|emirates|winair/i,
  },
  {
    id: "flight-sim",
    name: "Flight sim",
    blurb: "MSFS, mostly the Fenix A320, mostly going wrong.",
    test: /\bmsfs|flight ?sim|\bfenix\b|shared cockpit|speed ?run|\bsim\b|\bfs20\d\d\b|racing a jet/i,
  },
  {
    id: "explainers",
    name: "Aircraft explainers",
    blurb: "What the thing does, and what's wrong with it.",
    test: /\bfacts?\b|problem|\bwhy\b|\bhow\b|explained|\binside\b|what happens/i,
  },
];

/**
 * Titles the rules get wrong. Keyed by video id, value is a series id.
 * Add an entry here rather than loosening a regex — the regexes are shared by
 * every future upload and a loose one mis-sorts everything after it.
 */
export const overrides = {
  // "lDQ2VsCG1Rg": "flight-sim",
};

/** Words that carry the information in an aviation title, longest first. */
const KEYWORDS = [
  "737 MAX", "737MAX", "A320", "A321", "A319", "A350", "A380", "747", "757", "767", "777", "787",
  "737", "MSFS", "AIRBUS", "BOEING", "FENIX", "ATC", "COCKPIT", "RUDDER", "AIRLINE", "AIRPORT",
];

// Pictographs and the red dot on the live streams. The arrow block is
// deliberately not in here — "Innsbruck → Salzburg" is a route, not decoration.
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu;

/** "Landing the #a320 at #düsseldorf airport #msfs2024" → "Landing the A320 at Düsseldorf airport" */
export function cleanTitle(raw) {
  const source = String(raw).replace(EMOJI, "");

  // Hashtags inside the sentence are words — "#a320" is the aircraft. Keep the
  // word, drop the hash, and give it back its capital.
  const dehashed = source
    .replace(/#([\p{L}\p{N}_]+)/gu, (_, word) => word.charAt(0).toUpperCase() + word.slice(1))
    .replace(/\s+/g, " ")
    .trim();

  // Hashtags trailing the end are tagging, not title. Cut the whole run.
  const trailing = source.match(/((?:\s*#[\p{L}\p{N}_]+)+)\s*$/u);
  let t = dehashed;
  if (trailing) {
    const dropped = trailing[1].trim().split(/\s+/).length;
    const words = dehashed.split(" ");
    t = words
      .slice(0, Math.max(0, words.length - dropped))
      .join(" ")
      .replace(/[…\-–—|,\s]+$/, "")
      .trim();
  }

  // Some uploads are nothing but hashtags. Cutting them leaves no title at
  // all, so keep his actual words rather than inventing a better ones.
  return t.split(" ").filter(Boolean).length < 2 ? dehashed : t;
}

/** Marks the load-bearing word so the site's keyword rule can colour it. */
export function markTitle(title) {
  const upper = title.toUpperCase();
  for (const key of KEYWORDS) {
    const at = upper.indexOf(key);
    if (at === -1) continue;
    // Don't mark a fragment of a longer word.
    const before = upper[at - 1];
    const after = upper[at + key.length];
    if ((before && /[A-Z0-9]/.test(before)) || (after && /[A-Z0-9]/.test(after))) continue;
    return title.slice(0, at) + "*" + title.slice(at, at + key.length) + "*" + title.slice(at + key.length);
  }
  return title;
}

export function classify(id, title) {
  if (overrides[id]) return overrides[id];
  for (const s of SERIES) if (s.test.test(title)) return s.id;
  return null;
}

const pick = (block, tag) => {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? m[1] : "";
};

const unescapeXml = (s) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, "&");

export function parseFeed(xml) {
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, block]) => {
    const id = pick(block, "yt:videoId");
    const rawTitle = unescapeXml(pick(block, "media:title") || pick(block, "title"));
    const title = cleanTitle(rawTitle);
    const thumb = (block.match(/<media:thumbnail[^>]*url="([^"]+)"/) || [])[1] || "";
    return {
      id,
      title,
      marked: markTitle(title),
      rawTitle,
      published: pick(block, "published").slice(0, 10),
      url: `https://www.youtube.com/watch?v=${id}`,
      series: classify(id, rawTitle),
      thumbUrl: thumb,
      // A vertical upload with a hashtag that says so, or a title short enough
      // to be one. Only used for a small tag in the row.
      short: /#shorts\b/i.test(rawTitle),
    };
  });
  if (!entries.length) throw new Error("The feed parsed to zero entries — the format has changed.");
  return entries;
}

async function fetchWithTimeout(url, ms = 15000) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), ms);
  try {
    return await fetch(url, { signal: ac.signal, headers: { "user-agent": "alpineflyer.com build" } });
  } finally {
    clearTimeout(timer);
  }
}

/** Downloads each thumbnail once into .cache/thumbs so the page never hotlinks. */
async function cacheThumb(video) {
  await mkdir(THUMB_CACHE, { recursive: true });
  const file = join(THUMB_CACHE, `${video.id}.jpg`);
  try {
    await readFile(file);
    return file;
  } catch {
    /* not cached yet */
  }
  // maxres exists for most real uploads; hq always does.
  for (const url of [
    `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
    video.thumbUrl,
  ].filter(Boolean)) {
    const res = await fetchWithTimeout(url).catch(() => null);
    if (res?.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 2000) {
        await writeFile(file, buf);
        return file;
      }
    }
  }
  return null;
}

export async function loadVideos({ offline = false } = {}) {
  const committed = await readFile(VIDEOS_JSON, "utf8").then(JSON.parse, () => null);

  if (offline) {
    if (!committed) throw new Error("--offline was passed but src/content/videos.json does not exist.");
    console.log(`   videos: ${committed.videos.length} from committed videos.json (offline)`);
    return committed;
  }

  let xml;
  try {
    const res = await fetchWithTimeout(youtube.feedUrl());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    xml = await res.text();
  } catch (err) {
    if (committed) {
      console.warn(`\n   ! YouTube feed unreachable (${err.message}). Using the committed videos.json.`);
      console.warn(`   ! /videos is as fresh as ${committed.fetched.slice(0, 10)}.\n`);
      return committed;
    }
    throw new Error(
      `Could not reach the YouTube feed and there is no committed src/content/videos.json to fall back on.\n` +
        `  ${youtube.feedUrl()}\n  ${err.message}\n` +
        `  Refusing to build a videos page with nothing on it.`
    );
  }

  const videos = parseFeed(xml);
  for (const v of videos) {
    v.thumb = (await cacheThumb(v)) ? `${v.id}.jpg` : null;
    delete v.thumbUrl;
  }

  const data = { channelId: youtube.channelId, fetched: new Date().toISOString(), videos };
  await writeFile(VIDEOS_JSON, JSON.stringify(data, null, 2) + "\n");
  console.log(`   videos: ${videos.length} from the feed, ${videos.filter((v) => v.thumb).length} thumbnails cached`);
  return data;
}
