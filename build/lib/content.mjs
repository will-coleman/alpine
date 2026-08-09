/**
 * Content is files. There is one file: the videos pulled from the channel.
 *
 * Everything on the site derives from it — the cards on the home page, the
 * series on /videos, the latest link on /links, the sitemap. Nothing is
 * hardcoded, so a new upload appears everywhere on the next build.
 */

import { properties } from "../../site.config.js";
import { SERIES } from "./feed.mjs";

export async function loadContent(videoData) {
  const videos = videoData.videos ?? [];
  const problems = [];

  if (!videos.length) problems.push("no videos — the feed returned nothing usable");

  const videosBySeries = SERIES.map((s) => ({ ...s, videos: videos.filter((v) => v.series === s.id) }));
  const unsorted = videos.filter((v) => !v.series);

  // One stream, newest first. Everything is a card.
  const index = videos
    .map((v) => ({
      date: v.published,
      title: v.title,
      href: v.url,
      thumb: v.thumb,
      short: v.short,
      series: v.series,
    }))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return {
    videos,
    videosBySeries,
    unsorted,
    index,
    reviews: videosBySeries.find((s) => s.id === "airline-reviews")?.videos ?? [],
    problems,
  };
}

export const propertyById = (id) => properties.find((p) => p.id === id);
