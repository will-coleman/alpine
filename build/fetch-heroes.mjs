/**
 * Fetches one landscape hero per published country from Wikimedia Commons and
 * writes the real attribution into the country's JSON file.
 *
 *   node build/fetch-heroes.mjs
 *
 * These are placeholders in the sense that they aren't Will's photographs —
 * they are not placeholders in the sense of being fake. Author, licence and
 * source URL come straight off the Commons record, so every credit line on
 * the site is verifiable. Replace a hero by dropping a file into
 * src/assets/heroes/ and pointing the country's `hero.file` at it.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { ROOT } from "./lib/paths.mjs";

const HEROES = join(ROOT, "src", "assets", "heroes");
const COUNTRIES = join(ROOT, "src", "content", "countries");
const API = "https://commons.wikimedia.org/w/api.php";
const UA = "alpineflyer.com build (milo@coleman-clan.co.uk)";

// A place from the guide, not a generic view of the country.
const SUBJECTS = {
  portugal: { query: "Peneda-Gerês National Park landscape", place: "Peneda-Gerês" },
  malta: { query: "Dingli Cliffs Malta", place: "Dingli Cliffs" },
  estonia: { query: "Lahemaa National Park coast", place: "Lahemaa" },
  romania: { query: "Transfăgărășan road mountains", place: "the Transfăgărășan" },
  cyprus: { query: "Troodos mountains Cyprus landscape", place: "the Troodos mountains" },
  croatia: { query: "Rastoke Slunj waterfalls", place: "Rastoke" },
};

const FREE = /^(cc[ -]|public domain|pd|no restrictions)/i;

// Commons stores some old uploads as "No machine-readable author provided.
// Neoneo13 assumed (based on copyright claims)." The credit line wants the
// name, and the name is still the one Commons stands behind.
const tidyAuthor = (s) =>
  String(s ?? "").replace(/^No machine-readable author provided\.\s*(.+?)\s+assumed.*$/i, "$1");

const stripHtml = (s) =>
  String(s ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", origin: "*", ...params })}`;
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`Commons API ${res.status}`);
  return res.json();
}

async function findImage(query) {
  const search = await api({
    action: "query",
    generator: "search",
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: "20",
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: "2000",
  });

  const pages = Object.values(search?.query?.pages ?? {});
  const candidates = pages
    .map((p) => ({ title: p.title, info: p.imageinfo?.[0] }))
    .filter((c) => c.info && c.info.width >= 1600 && c.info.width > c.info.height);

  for (const c of candidates) {
    const meta = c.info.extmetadata ?? {};
    const licence = stripHtml(meta.LicenseShortName?.value);
    if (!FREE.test(licence)) continue;
    const author = tidyAuthor(stripHtml(meta.Artist?.value));
    if (!author) continue;
    return {
      title: c.title,
      url: c.info.thumburl || c.info.url,
      descriptionUrl: c.info.descriptionurl,
      author,
      licence,
      width: c.info.width,
      height: c.info.height,
    };
  }
  return null;
}

async function main() {
  await mkdir(HEROES, { recursive: true });
  for (const [slug, subject] of Object.entries(SUBJECTS)) {
    const file = join(COUNTRIES, `${slug}.json`);
    const country = JSON.parse(await readFile(file, "utf8"));

    const found = await findImage(subject.query);
    if (!found) {
      console.warn(`  ${slug}: nothing usable found — leaving hero null`);
      continue;
    }

    const ext = found.url.match(/\.(jpe?g|png)$/i)?.[1]?.toLowerCase() ?? "jpg";
    const name = `${slug}.${ext === "jpeg" ? "jpg" : ext}`;
    const bytes = Buffer.from(await (await fetch(found.url, { headers: { "user-agent": UA } })).arrayBuffer());
    await writeFile(join(HEROES, name), bytes);

    country.hero = {
      file: name,
      alt: `${subject.place}, ${country.name}`,
      credit: {
        author: found.author,
        licence: found.licence,
        source: "Wikimedia Commons",
        url: found.descriptionUrl,
      },
    };
    await writeFile(file, JSON.stringify(country, null, 2) + "\n");
    console.log(`  ${slug.padEnd(9)} ${(bytes.length / 1024).toFixed(0).padStart(5)} KB  ${found.author} · ${found.licence}`);
  }
}

main();
