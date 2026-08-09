import { join } from "node:path";
import { html, attrs } from "../lib/html.mjs";
import { page } from "../lib/layout.mjs";
import { headline, assertMarked } from "../lib/headline.mjs";
import { shortDate, propertyTag } from "../lib/components.mjs";
import { picture } from "../lib/images.mjs";
import { CACHE, SRC } from "../lib/paths.mjs";
import { youtube, site } from "../../site.config.js";

const H1 = "TRAVEL VIDEOS, AND THE *44* COUNTRIES OF EUROPE";

export default async function home(ctx) {
  assertMarked(H1, "home h1");

  // Every published thing becomes a card. A video brings its cached YouTube
  // still; a country guide brings its hero.
  const cards = [];
  for (const [i, item] of ctx.index.entries()) {
    const lead = i === 0;
    const widths = lead ? [640, 1280] : [480, 960];
    const sizes = lead
      ? "(min-width: 60em) 42rem, (min-width: 34em) 100vw, 100vw"
      : "(min-width: 60em) 20rem, (min-width: 34em) 50vw, 100vw";

    let img = null;
    if (item.thumb) {
      img = await picture(join(CACHE, "thumbs", item.thumb), { alt: "", sizes, widths });
    } else if (item.hero) {
      img = await picture(join(SRC, "assets", "heroes", item.hero), { alt: "", sizes, widths });
    }
    cards.push({ ...item, img, lead });
  }

  const main = html`
<div class="wrap">

  <div class="mast">
    ${headline(H1, { as: "h1", size: "d-xl" })}
    <div class="mast-copy">
      <p>
        I'm Will. I'm making the channel a travel channel — airlines I've actually flown, places
        worth the detour, and what a trip is really like once you're standing in it. There's a back
        catalogue of flight sim on there too, and less of it from here on.
      </p>
      <p>
        Alongside it I'm working through the 44 countries of Europe, one guide at a time. One
        person, one camera, based in ${site.based}.
      </p>
    </div>
  </div>

  <section aria-labelledby="everything">
    <div class="rule-head">
      <h2 class="d d-m" id="everything">Everything, newest first</h2>
      <p class="count">${ctx.index.length} published</p>
    </div>

    <div class="cards">
      ${cards.map(
        (c) => html`<a class="card${c.lead ? " card--lead" : ""}" data-p="${c.property}" href="${c.href}"${attrs({
          rel: c.external ? "noopener" : null,
        })}>
        ${c.img}
        <span class="card-meta">${propertyTag(c.property)} · ${shortDate(c.date)}</span>
        <span class="card-t">${c.titlePlain}</span>
      </a>`
      )}
    </div>

    <a class="more" href="/videos/">All videos on the channel →</a>
  </section>

  <section aria-labelledby="europe-block">
    <div class="rule-head">
      <h2 class="d d-m" id="europe-block">Countries travelled</h2>
      <p class="count"><b>${ctx.counts.travelled}</b> of ${ctx.counts.total}</p>
    </div>
    <p style="max-width:52ch;margin:0">
      Every country in Europe gets a guide eventually — the corner people drive past, the nearest
      town to it, and what it costs you in time to get there.
    </p>
    <div class="covered">
      ${ctx.travelled.map((c) =>
        c.published
          ? html`<a href="/europe/countries/${c.slug}/">${c.name}</a>`
          : html`<span>${c.name}</span>`
      )}
    </div>
    <a class="more" href="/europe/">The Europe project →</a>
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
          "Travel and aviation on YouTube, and guides to all 44 countries in Europe. Everything I make, newest first.",
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
            jobTitle: "Travel video maker",
            worksFor: { "@type": "Organization", name: "Alpine Media Group" },
            sameAs: [youtube.channelUrl, "https://www.instagram.com/visiteuropeproject/"],
          },
        },
      }),
    },
  ];
}
