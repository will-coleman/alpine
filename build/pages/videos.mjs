import { html, attrs } from "../lib/html.mjs";
import { page } from "../lib/layout.mjs";
import { headline, assertMarked, plain } from "../lib/headline.mjs";
import { shortDate } from "../lib/components.mjs";
import { site, youtube } from "../../site.config.js";

const H1 = "TRAVEL, AIRLINES, AND THE *AEROPLANES* THEMSELVES";

function card(video, thumb) {
  return html`<a class="card" data-p="alpine-flyer" href="${video.url}" rel="noopener">
  ${thumb
    ? html`<img src="${thumb.src}" srcset="${thumb.srcset}" sizes="(min-width: 60em) 20rem, (min-width: 34em) 50vw, 100vw" alt="" width="${thumb.width}" height="${thumb.height}" loading="lazy" decoding="async">`
    : ""}
  <span class="card-meta">${video.short ? "Short" : "Video"} · ${shortDate(video.published)}</span>
  <span class="card-t">${video.title}</span>
</a>`;
}

export default async function videos(ctx) {
  assertMarked(H1, "videos h1");

  const groups = ctx.videosBySeries.filter((s) => s.videos.length);

  const main = html`
<div class="wrap">
  <div class="page-head">
    <p class="eyebrow">Alpine Flyer · YouTube</p>
    ${headline(H1, { as: "h1", size: "d-xl" })}
    <p class="lede">
      Pulled straight from the channel when the site is built, so it's whatever is actually up
      there. The channel is turning into a travel channel — the flight sim back catalogue is still
      here, at the bottom, where it now belongs.
    </p>
  </div>

  ${groups.map(
    (group) => html`<section class="vid-group" aria-labelledby="s-${group.id}">
    <div class="rule-head">
      <h2 class="d d-m" id="s-${group.id}">${group.name}</h2>
      <p class="count">${group.videos.length}</p>
    </div>
    <p class="lede" style="margin:0 0 .9rem">${group.blurb}</p>
    <div class="cards">
      ${group.videos.map((v) => card(v, ctx.thumbs.get(v.id)))}
    </div>
  </section>`
  )}

  ${ctx.unsorted.length
    ? html`<section class="vid-group" aria-labelledby="s-rest">
    <div class="rule-head">
      <h2 class="d d-m" id="s-rest">Everything else</h2>
      <p class="count">${ctx.unsorted.length}</p>
    </div>
    <p class="lede" style="margin:0 0 .9rem">Clips that don't sit in a series yet.</p>
    <div class="cards">
      ${ctx.unsorted.map((v) => card(v, ctx.thumbs.get(v.id)))}
    </div>
  </section>`
    : ""}

  <section>
    <p class="note">
      New videos go up most weeks.
      <a href="${youtube.subscribeUrl}" rel="noopener">Subscribe on YouTube</a> and they turn up on
      their own.
    </p>
  </section>
</div>
`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Alpine Flyer videos",
    itemListElement: ctx.videos.slice(0, 15).map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "VideoObject",
        name: plain(v.title),
        description: plain(v.title),
        uploadDate: v.published,
        thumbnailUrl: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
        url: v.url,
        embedUrl: `https://www.youtube.com/embed/${v.id}`,
        publisher: { "@type": "Organization", name: "Alpine Flyer", url: youtube.channelUrl },
      },
    })),
  };

  return [
    {
      path: "/videos/",
      lastmod: ctx.videos[0]?.published,
      html: page({
        title: "Videos",
        description:
          "Airline reviews, Fenix A320 flight sim and aircraft explainers from the Alpine Flyer YouTube channel, pulled from the feed at build time.",
        path: "/videos/",
        section: "videos",
        ogImage: "/og/videos.png",
        css: ctx.css,
        main,
        jsonLd,
      }),
    },
  ];
}
