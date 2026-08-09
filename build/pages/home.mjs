import { join } from "node:path";
import { html } from "../lib/html.mjs";
import { page } from "../lib/layout.mjs";
import { headline, assertMarked } from "../lib/headline.mjs";
import { shortDate } from "../lib/components.mjs";
import { picture, resolveAsset } from "../lib/images.mjs";
import { CACHE, SRC } from "../lib/paths.mjs";
import { youtube, site, upcoming } from "../../site.config.js";

const H1 = "I'M TRAVELLING EUROPE, ONE *COUNTRY* AT A TIME";

export default async function home(ctx) {
  assertMarked(H1, "home h1");

  // The next video, if there is one. Artwork is optional — the block renders
  // without it and the build says what it couldn't find.
  let soonImg = null;
  if (upcoming?.live && upcoming.thumb) {
    const file = await resolveAsset(join(SRC, "assets", "upcoming"), upcoming.thumb);
    if (file) {
      soonImg = await picture(file, {
        alt: "",
        sizes: "(min-width: 56.25em) 36rem, 100vw",
        widths: [480, 960, 1440],
        className: "soon-img",
        eager: true,
      });
    } else {
      const stem = upcoming.thumb.replace(/\.[^.]+$/, "");
      ctx.problems.push(
        `upcoming: nothing named "${stem}" in src/assets/upcoming/ — block rendered without artwork`
      );
    }
  }

  // The lead card is the newest full upload. A Short leading the page means a
  // vertical frame stretched across a wide card, and it looks broken.
  const ordered = [...ctx.index];
  const firstFull = ordered.findIndex((v) => !v.short);
  if (firstFull > 0) ordered.unshift(...ordered.splice(firstFull, 1));

  const cards = [];
  for (const [i, item] of ordered.entries()) {
    const lead = i === 0;
    const widths = lead ? [640, 1280] : [480, 960];
    const sizes = lead
      ? "(min-width: 60em) 42rem, 100vw"
      : "(min-width: 60em) 20rem, (min-width: 34em) 50vw, 100vw";
    const img = item.thumb
      ? await picture(join(CACHE, "thumbs", item.thumb), {
          alt: "",
          sizes,
          widths,
          eager: lead && !soonImg,
        })
      : null;
    cards.push({ ...item, img, lead });
  }

  const main = html`
<div class="wrap">

  <div class="mast">
    ${headline(H1, { as: "h1", size: "d-xl" })}
    <div class="mast-copy">
      <p>
        I'm Will, a travel filmmaker based in ${site.based}. I make long-form travel films and
        airline reviews, mostly about crossing Europe overland.
      </p>
      <p>Everything I've published is below, newest first.</p>
    </div>
  </div>

  ${upcoming?.live
    ? html`<section class="soon" aria-labelledby="soon">
    ${soonImg}
    <div class="soon-copy">
      <p class="soon-flag">Coming soon</p>
      ${headline(upcoming.title, { as: "h2", size: "d-m", id: "soon" })}
      <p class="soon-note">${upcoming.note}</p>
    </div>
  </section>`
    : ""}

  <section aria-labelledby="latest">
    <div class="rule-head">
      <h2 class="d d-m" id="latest">Latest on the channel</h2>
      <p class="count">${ctx.videos.length} up now</p>
    </div>

    <div class="cards">
      ${cards.map(
        (c) => html`<a class="card${c.lead ? " card--lead" : ""}" href="${c.href}" rel="noopener">
        ${c.img}
        <span class="card-meta">${c.short ? "Short" : "Video"} · ${shortDate(c.date)}</span>
        <span class="card-t">${c.title}</span>
      </a>`
      )}
    </div>

    <a class="more" href="${youtube.subscribeUrl}" rel="noopener">Subscribe on YouTube →</a>
  </section>

  <section>
    <p class="note">
      Available for partnership work with airlines, hotels, tourist boards and travel brands.
      <a href="/partnerships/">Details and contact</a>.
    </p>
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
          "Will is travelling Europe one country at a time — trains, airlines, and what a place is actually like. Travel films and airline reviews on YouTube.",
        path: "/",
        section: "videos",
        ogImage: "/og/home.png",
        css: ctx.css,
        main,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          mainEntity: {
            "@type": "Person",
            name: "Will",
            jobTitle: "Travel video maker",
            worksFor: { "@type": "Organization", name: "Alpine Media Group" },
            sameAs: [youtube.channelUrl, "https://www.instagram.com/visiteuropeproject/"],
          },
        },
      }),
    },
  ];
}
