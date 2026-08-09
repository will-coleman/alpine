/**
 * Seeds src/content/countries/ with all 44.
 *
 *   node build/seed-countries.mjs
 *
 * It never overwrites a file that already exists, so running it again after
 * you've written a guide is safe — it only fills gaps.
 *
 * The list: sovereign states of Europe with an official ISO 3166-1 alpha-2
 * code, plus the Caucasus three and Türkiye, minus the five micro-states
 * (Andorra, Liechtenstein, Monaco, San Marino, Vatican City). That lands on
 * exactly 44 and it's the list the Instagram bio has always meant.
 *
 * Disagree with a call? Region is one field. Adding a country is one file and
 * a bump to the number in this comment. The board counts what it finds.
 */

import { writeFile, mkdir, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "content", "countries");

// [name, ISO 3166-1 alpha-2, region]
export const COUNTRIES = [
  ["United Kingdom", "GB", "British Isles"],
  ["Ireland", "IE", "British Isles"],

  ["Iceland", "IS", "Nordics"],
  ["Norway", "NO", "Nordics"],
  ["Sweden", "SE", "Nordics"],
  ["Finland", "FI", "Nordics"],
  ["Denmark", "DK", "Nordics"],

  ["Estonia", "EE", "Baltics"],
  ["Latvia", "LV", "Baltics"],
  ["Lithuania", "LT", "Baltics"],

  ["Netherlands", "NL", "Central Europe"],
  ["Belgium", "BE", "Central Europe"],
  ["Luxembourg", "LU", "Central Europe"],
  ["Germany", "DE", "Central Europe"],
  ["Poland", "PL", "Central Europe"],
  ["Czechia", "CZ", "Central Europe"],
  ["Slovakia", "SK", "Central Europe"],
  ["Austria", "AT", "Central Europe"],
  ["Switzerland", "CH", "Central Europe"],
  ["Hungary", "HU", "Central Europe"],

  ["Slovenia", "SI", "Balkans"],
  ["Croatia", "HR", "Balkans"],
  ["Bosnia and Herzegovina", "BA", "Balkans"],
  ["Serbia", "RS", "Balkans"],
  ["Montenegro", "ME", "Balkans"],
  ["North Macedonia", "MK", "Balkans"],
  ["Albania", "AL", "Balkans"],
  ["Bulgaria", "BG", "Balkans"],

  ["Portugal", "PT", "Iberia"],
  ["Spain", "ES", "Iberia"],

  ["France", "FR", "Mediterranean"],
  ["Italy", "IT", "Mediterranean"],
  ["Malta", "MT", "Mediterranean"],
  ["Greece", "GR", "Mediterranean"],
  ["Cyprus", "CY", "Mediterranean"],

  ["Romania", "RO", "Eastern Europe"],
  ["Moldova", "MD", "Eastern Europe"],
  ["Ukraine", "UA", "Eastern Europe"],
  ["Belarus", "BY", "Eastern Europe"],
  ["Russia", "RU", "Eastern Europe"],

  ["Georgia", "GE", "Caucasus and edges"],
  ["Armenia", "AM", "Caucasus and edges"],
  ["Azerbaijan", "AZ", "Caucasus and edges"],
  ["Türkiye", "TR", "Caucasus and edges"],
];

export const slugify = (name) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const stub = (name, iso, region) => ({
  name,
  slug: slugify(name),
  iso,
  region,
  published: false,
  headline: "",
  intro: "",
  hero: null,
  mustSee: [],
  seasons: { spring: "", summer: "", autumn: "", winter: "" },
  transport: "",
  instagram: [],
  updated: null,
});

const exists = (p) => access(p).then(() => true, () => false);

async function main() {
  await mkdir(DIR, { recursive: true });

  if (COUNTRIES.length !== 44) {
    throw new Error(`The list is ${COUNTRIES.length} long. It has to be 44.`);
  }
  const isos = new Set(COUNTRIES.map((c) => c[1]));
  if (isos.size !== 44) throw new Error("Duplicate ISO code in the list.");

  let written = 0;
  for (const [name, iso, region] of COUNTRIES) {
    const file = join(DIR, `${slugify(name)}.json`);
    if (await exists(file)) continue;
    await writeFile(file, JSON.stringify(stub(name, iso, region), null, 2) + "\n");
    written += 1;
  }
  console.log(`seeded ${written} new, ${COUNTRIES.length - written} already present`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
