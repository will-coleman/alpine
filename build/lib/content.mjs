/**
 * Content is files. This reads them.
 *
 * Everything downstream — the board count, the running index, the filters,
 * the sitemap — is derived from what's on disk. Nothing is hardcoded, so
 * adding a country is adding a file.
 */

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { CONTENT } from "./paths.mjs";
import { properties, REGIONS, GEM_TYPES } from "../../site.config.js";
import { SERIES } from "./feed.mjs";

const readJsonDir = async (dir) => {
  const files = (await readdir(join(CONTENT, dir))).filter((f) => f.endsWith(".json"));
  return Promise.all(files.map(async (f) => JSON.parse(await readFile(join(CONTENT, dir, f), "utf8"))));
};

export async function loadContent(videoData) {
  const countries = (await readJsonDir("countries")).sort((a, b) => a.name.localeCompare(b.name, "en"));
  const gems = (await readJsonDir("gems")).sort((a, b) => a.name.localeCompare(b.name, "en"));
  const posts = JSON.parse(await readFile(join(CONTENT, "posts.json"), "utf8"));

  const problems = [];

  if (countries.length !== 44) problems.push(`countries: found ${countries.length}, expected 44`);
  for (const c of countries) {
    if (!REGIONS.includes(c.region)) problems.push(`${c.slug}: region "${c.region}" is not in REGIONS`);
    if (!/^[A-Z]{2}$/.test(c.iso)) problems.push(`${c.slug}: iso "${c.iso}" is not two capitals`);
    if (c.published && !c.headline) problems.push(`${c.slug}: published with no headline`);
    if (c.published && !c.updated) problems.push(`${c.slug}: published with no updated date`);
  }

  const bySlug = new Map(countries.map((c) => [c.slug, c]));
  for (const g of gems) {
    if (!bySlug.has(g.country)) problems.push(`gem ${g.slug}: country "${g.country}" doesn't exist`);
    if (!GEM_TYPES.includes(g.type)) problems.push(`gem ${g.slug}: type "${g.type}" is not one of ${GEM_TYPES.join(", ")}`);
    if (typeof g.lat !== "number" || typeof g.lng !== "number") problems.push(`gem ${g.slug}: needs numeric lat and lng`);
  }

  const published = countries.filter((c) => c.published);
  const gemsByCountry = new Map();
  for (const g of gems) {
    if (!gemsByCountry.has(g.country)) gemsByCountry.set(g.country, []);
    gemsByCountry.get(g.country).push(g);
  }

  const postsByCountry = new Map();
  for (const p of posts.posts ?? []) {
    if (!postsByCountry.has(p.country)) postsByCountry.set(p.country, []);
    postsByCountry.get(p.country).push(p);
  }

  const videos = videoData.videos ?? [];
  const videosBySeries = SERIES.map((s) => ({ ...s, videos: videos.filter((v) => v.series === s.id) }));
  const unsorted = videos.filter((v) => !v.series);

  return {
    countries,
    published,
    gems,
    gemsByCountry,
    posts: posts.posts ?? [],
    postsByCountry,
    videos,
    videosBySeries,
    unsorted,
    counts: { covered: published.length, total: countries.length },
    problems,
    index: runningIndex({ videos, countries: published, posts: posts.posts ?? [] }),
  };
}

/**
 * The running index.
 *
 * One output stream, two outlets. Everything published, newest first, in one
 * column — videos from the feed and country guides from the content files,
 * plus any Instagram post that has a real permalink on it.
 *
 * A post with no permalink is not dropped and not faked — it just isn't a
 * link, so it stays off a list whose entire job is going somewhere.
 */
function runningIndex({ videos, countries, posts }) {
  const items = [];

  for (const v of videos) {
    items.push({
      date: v.published,
      property: "alpine-flyer",
      title: v.marked,
      href: v.url,
      external: true,
      thumb: v.thumb,
      kind: v.short ? "Short" : "Video",
    });
  }

  for (const c of countries) {
    items.push({
      date: c.updated,
      property: "visit-europe",
      title: c.headline,
      href: `/europe/countries/${c.slug}/`,
      external: false,
      thumb: null,
      kind: "Guide",
    });
  }

  for (const p of posts) {
    if (!p.permalink) continue;
    items.push({
      date: p.date,
      property: "visit-europe",
      title: p.caption,
      href: p.permalink,
      external: true,
      thumb: p.thumb ?? null,
      kind: "Post",
    });
  }

  const known = new Set(properties.filter((p) => p.enabled).map((p) => p.id));
  return items
    .filter((i) => i.date && known.has(i.property))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export const propertyById = (id) => properties.find((p) => p.id === id);
