import { join } from "node:path";
import { html } from "../lib/html.mjs";
import { page } from "../lib/layout.mjs";
import { headline, kw, assertMarked } from "../lib/headline.mjs";
import { runningIndex, shortDate } from "../lib/components.mjs";
import { picture } from "../lib/images.mjs";
import { CACHE } from "../lib/paths.mjs";
import { youtube, site } from "../../site.config.js";

const H1 = "I MAKE AVIATION VIDEOS AND EUROPE *GUIDES*";

export default async function home(ctx) {
  assertMarked(H1, "home h1");

  // The masthead still comes from the newest full upload, not the newest
  // Short. A Short's thumbnail is a vertical frame pillarboxed into a 16:9
  // file, so it arrives with black bars down both sides and looks broken at
  // this size. Shorts still appear in the index below.
  const latest = ctx.videos.find((v) => !v.short) ?? ctx.videos[0];
  const still =
    latest?.thumb &&
    (await picture(join(CACHE, "thumbs", latest.thumb), {
      alt: "",
      sizes: "(min-width: 56.25em) 28rem, 100vw",
      widths: [640, 1280],
      eager: true,
    }));

  const main = html`
<div class="wrap">

  <div class="mast">
    <div class="mast-copy">
      ${headline(H1, { as: "h1", size: "d-l" })}
      <p>
        Airline reviews from the seat, the Fenix A320 in the simulator until something breaks, and a
        slow project to write a proper guide for all 44 countries in Europe. One person, one camera,
        based in ${site.based}.
      </p>
      <p>
        Everything below is everything I've put out — both accounts in one list, newest at the top.
        That list is more or less the whole site; the rest is detail.
      </p>
    </div>

    ${latest
      ? html`<a class="mast-latest" href="${latest.url}" rel="noopener">
      ${still}
      <span class="m">Latest video · ${shortDate(latest.published)}</span>
      <span class="mast-latest-t">${kw(latest.marked)}</span>
    </a>`
      : ""}
  </div>

  <section aria-labelledby="everything">
    <div class="rule-head">
      <h2 class="d d-m" id="everything">Everything, newest first</h2>
      <p class="count">${ctx.index.length} published</p>
    </div>
    ${runningIndex(ctx.index)}
    <a class="more" href="/videos/">All videos on the channel →</a>
  </section>

  <section aria-labelledby="europe-block">
    <div class="rule-head">
      <h2 class="d d-m" id="europe-block">The Europe project</h2>
      <p class="count"><b>${ctx.counts.covered}</b> / ${ctx.counts.total} covered</p>
    </div>
    <p style="max-width:52ch;margin:0">
      Every country in Europe gets a guide eventually. Not a top ten — the corner people drive past,
      the nearest town to it, and what it costs you in time to get there. These are the ones that
      are written so far.
    </p>
    <div class="covered">
      ${ctx.published.map((c) => html`<a href="/europe/countries/${c.slug}/">${c.name}</a>`)}
    </div>
    <a class="more" href="/europe/">All 44, covered or not →</a>
  </section>

</div>
`;

  return [
    {
      path: "/",
      lastmod: ctx.index[0]?.date,
      html: page({
        title: "Alpine Flyer",
        description:
          "Airline reviews, flight sim and aircraft explainers on YouTube, and guides to all 44 countries in Europe. Everything I make, newest first.",
        path: "/",
        ogImage: "/og/home.png",
        css: ctx.css,
        main,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          mainEntity: {
            "@type": "Person",
            name: "Will",
            jobTitle: "Video maker",
            worksFor: { "@type": "Organization", name: "Alpine Media Group" },
            sameAs: [youtube.channelUrl, "https://www.instagram.com/visiteuropeproject/"],
          },
        },
      }),
    },
  ];
}
