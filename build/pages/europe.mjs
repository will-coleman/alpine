import { join } from "node:path";
import { html } from "../lib/html.mjs";
import { page } from "../lib/layout.mjs";
import { headline, assertMarked } from "../lib/headline.mjs";
import { picture } from "../lib/images.mjs";
import { SRC } from "../lib/paths.mjs";
import { instagram } from "../../site.config.js";

const H1 = "*44* COUNTRIES, ONE AT A TIME";

export default async function europe(ctx) {
  assertMarked(H1, "europe h1");

  const guides = [];
  for (const c of ctx.published) {
    const shot = c.hero
      ? await picture(join(SRC, "assets", "heroes", c.hero.file), {
          alt: "",
          sizes: "(min-width: 40em) 30rem, 100vw",
          widths: [480, 960],
        })
      : null;
    guides.push({ country: c, shot });
  }

  const remaining = ctx.countries.filter((c) => !c.published);

  const main = html`
<div class="wrap">
  <div class="page-head">
    ${headline(H1, { as: "h1", size: "d-xl" })}
    <p class="lede">
      Every country in Europe gets a guide eventually. Not a top ten — the corner people drive
      past, the nearest town to it, and what it costs you in time to get there.
    </p>
  </div>

  <section aria-labelledby="written">
    <div class="rule-head">
      <h2 class="d d-m" id="written">Written so far</h2>
      <p class="count">${ctx.counts.covered} of ${ctx.counts.total}</p>
    </div>
    <div class="guides">
      ${guides.map(
        ({ country: c, shot }) => html`<a class="guide" href="/europe/countries/${c.slug}/">
        ${shot}
        <span class="guide-t">${c.name}</span>
        <p>${c.intro}</p>
      </a>`
      )}
    </div>
  </section>

  <section aria-labelledby="rest">
    <div class="rule-head">
      <h2 class="d d-m" id="rest">Not yet</h2>
      <p class="count">${remaining.length} to go</p>
    </div>
    <p style="max-width:46ch">
      ${remaining.map((c) => c.name).join(", ")}.
    </p>
    <a class="more" href="/europe/countries/">The full list, filterable →</a>
  </section>

  <section aria-labelledby="more-europe">
    <h2 class="vh" id="more-europe">More</h2>
    <a class="linkrow" href="/europe/hidden-gems/">
      <span class="linkrow-t">Every place in one list</span>
      <span class="m">${ctx.gems.length} of them, filter by country or type</span>
    </a>
    <a class="linkrow" href="/europe/featured/">
      <span class="linkrow-t">Get featured</span>
      <span class="m">Tag ${instagram.handle} and it might go up</span>
    </a>
  </section>
</div>
`;

  return [
    {
      path: "/europe/",
      lastmod: ctx.published.map((c) => c.updated).sort().pop(),
      html: page({
        title: "Visit Europe Project",
        description:
          "Guides to all 44 countries in Europe, one at a time. Hidden gems with the nearest town, rough coordinates and how to get there.",
        path: "/europe/",
        section: "europe",
        ogImage: "/og/europe.png",
        css: ctx.css,
        main,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Visit Europe Project",
          description: `Travel guides to the 44 countries of Europe. ${ctx.counts.covered} published so far.`,
        },
      }),
    },
  ];
}
