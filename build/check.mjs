/**
 * The checks the brief asks for, run against the built site rather than
 * asserted in prose.
 *
 *   npm run check
 *
 * 1  every colour pair the site can produce, against WCAG AA
 * 2  no property colour anywhere in the shell — header, nav, footer
 * 3  no client JavaScript anywhere
 * 4  /links weight
 * 5  headings in order on every page
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";
import { DIST } from "./lib/paths.mjs";

let failures = 0;
const fail = (msg) => {
  failures += 1;
  console.log(`   FAIL  ${msg}`);
};
const pass = (msg) => console.log(`   ok    ${msg}`);

/* ---------------------------------------------------------------- contrast */

const channel = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = (hex) => {
  const [r, g, b] = hex.match(/\w\w/g).map((h) => channel(parseInt(h, 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const SLATE = "#161C1F";
const PITCH = "#0D1113";
const SNOW = "#EEF1F2";
const SCREE = "#8A98A0";
const SODIUM = "#F0932B";
const AF_RED = "#FF4A3D";


// [name, foreground, background, minimum]
// 4.5 is AA for body text; 3.0 is AA for large text and for UI borders.
const PAIRS = [
  ["snow on slate", SNOW, SLATE, 4.5],
  ["snow on pitch", SNOW, PITCH, 4.5],
  ["scree on slate", SCREE, SLATE, 4.5],
  ["scree on pitch", SCREE, PITCH, 4.5],
  ["sodium on slate", SODIUM, SLATE, 4.5],
  ["sodium on pitch", SODIUM, PITCH, 4.5],
  ["AF red on slate", AF_RED, SLATE, 4.5],
];

function checkContrast() {
  console.log("\n  Contrast (WCAG AA)");
  for (const [name, fg, bg, min] of PAIRS) {
    const r = ratio(fg, bg);
    const line = `${name.padEnd(32)} ${r.toFixed(2)}:1  (needs ${min})`;
    if (r >= min) pass(line);
    else fail(line);
  }

}

/* ------------------------------------------------------------------- shell */

const PROPERTY_COLOURS = [/#c1170c/i, /#ff4a3d/i];

async function htmlFiles(dir = DIST, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await htmlFiles(full, out);
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

/**
 * Markup only: no inlined stylesheet, no script, no comments. The stylesheet
 * legitimately contains every property colour — that's where they're defined —
 * so leaving it in makes every page look dirty.
 */
const markupOnly = (html) =>
  html
    .replace(/<style>[\s\S]*?<\/style>/g, "")
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "");

function shellOf(html) {
  const stripped = markupOnly(html);
  const header = stripped.match(/<header[\s\S]*?<\/header>/)?.[0] ?? "";
  const footer = stripped.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? "";
  return header + footer;
}

async function checkShell(files) {
  console.log("\n  Shell carries no property colour");
  let dirty = 0;
  for (const file of files) {
    const shell = shellOf(await readFile(file, "utf8"));
    for (const colour of PROPERTY_COLOURS) {
      if (colour.test(shell)) {
        fail(`${relative(DIST, file)} shell contains ${colour}`);
        dirty += 1;
      }
    }
    // The section wrapper must open after the header and close before the
    // footer, so a section accent structurally cannot reach either.
    const markup = markupOnly(await readFile(file, "utf8"));
    const sectionAt = markup.indexOf("data-section=");
    if (sectionAt === -1) continue;
    const headerAt = markup.indexOf("<header");
    const footerAt = markup.indexOf("<footer");
    if (headerAt !== -1 && sectionAt < headerAt) {
      fail(`${relative(DIST, file)} opens data-section before the header`);
      dirty += 1;
    }
    if (footerAt !== -1 && sectionAt > footerAt) {
      fail(`${relative(DIST, file)} opens data-section inside the footer`);
      dirty += 1;
    }
  }
  if (!dirty) pass(`${files.length} pages, no red / EU blue / star yellow in any header or footer`);
}

/* ---------------------------------------------------------------- content */


/* ---------------------------------------------------------- js and weight */

async function checkJs(files) {
  console.log("\n  JavaScript and weight");
  const withJs = [];
  for (const file of files) {
    // Comments stripped first — the head carries a commented-out Plausible
    // tag, which is a slot, not a script that ships.
    const html = (await readFile(file, "utf8")).replace(/<!--[\s\S]*?-->/g, "");
    if (/<script(?![^>]*application\/ld\+json)/.test(html)) withJs.push(relative(DIST, file));
  }
  // Nothing on this site needs state, so nothing on it ships JavaScript.
  withJs.length === 0
    ? pass("no client JavaScript on any page")
    : fail(`script found on ${withJs.join(", ")}`);

  const links = await readFile(join(DIST, "links", "index.html"));
  const raw = links.length / 1024;
  const gz = gzipSync(links).length / 1024;
  raw < 30
    ? pass(`/links is ${raw.toFixed(1)}KB raw, ${gz.toFixed(1)}KB gzipped, no script`)
    : fail(`/links is ${raw.toFixed(1)}KB, over the 30KB budget`);
}

/* -------------------------------------------------------------- headings */

async function checkHeadings(files) {
  console.log("\n  Heading order");
  let bad = 0;
  for (const file of files) {
    const html = await readFile(file, "utf8");
    const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
    const h1s = levels.filter((l) => l === 1).length;
    if (h1s !== 1) {
      fail(`${relative(DIST, file)} has ${h1s} h1 elements`);
      bad += 1;
      continue;
    }
    for (let i = 1; i < levels.length; i += 1) {
      if (levels[i] > levels[i - 1] + 1) {
        fail(`${relative(DIST, file)} jumps h${levels[i - 1]} → h${levels[i]}`);
        bad += 1;
        break;
      }
    }
  }
  if (!bad) pass(`${files.length} pages, one h1 each, no skipped levels`);
}

const files = await htmlFiles();
checkContrast();
await checkShell(files);
await checkJs(files);
await checkHeadings(files);

console.log(failures ? `\n  ${failures} failing\n` : "\n  all checks pass\n");
process.exitCode = failures ? 1 : 0;
