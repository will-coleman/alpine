import { html, attrs } from "../lib/html.mjs";
import { page } from "../lib/layout.mjs";
import { headline, assertMarked, plain } from "../lib/headline.mjs";
import { shortDate } from "../lib/components.mjs";
import { site, youtube } from "../../site.config.js";

const H1 = "TRAVEL, AIRLINES, AND THE *AEROPLANES* THEMSELVES";

/** Sits under the airline review, because that video is the best answer to
    "what is this channel" that I've got. */
const ABOUT = html`<div class="prose" style="margin-top:1.5rem">
  <p>
    That's the one that says most about how I work. I booked it myself, flew it as a normal
    passenger and said what it was actually like — which is the only version worth anyone's
    fifteen minutes.
  </p>
  <p>
    I'm Will. I'm based in England and I'm working my way across Europe one country at a time —
    trains where I can, flights where I can't, filming it as I go. There's a back catalogue of
    flight sim below and there'll be less of it from here on.
  </p>
</div>`;

function card(video, thumb, lead = false) {
  return html`<a class="card${lead ? " card--lead" : ""}" data-p="alpine-flyer" href="${video.url}" rel="noopener">
  ${thumb
    ? html`<img src="${thumb.src}" srcset="${thumb.srcset}" sizes="${lead ? "(min-width: 60em) 42rem, 100vw" : "(min-width: 60em) 20rem, (min-width: 34em) 50vw, 100vw"}" alt="" width="${thumb.width}" height="${thumb.height}" loading="lazy" decoding="async">`
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
      ${group.id === "airline-reviews" ? "" : html`<p class="count">${group.videos.length}</p>`}
    </div>
    ${group.blurb ? html`<p class="lede" style="margin:0 0 .9rem">${group.blurb}</p>` : ""}
    <div class="cards">
      ${group.videos.map((v, i) => card(v, ctx.thumbs.get(v.id), group.id === "airline-reviews" && i === 0))}
    </div>
    ${group.id === "airline-reviews" ? ABOUT : ""}
  </section>`
  )}


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
