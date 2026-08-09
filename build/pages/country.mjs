import { join } from "node:path";
import { html } from "../lib/html.mjs";
import { page } from "../lib/layout.mjs";
import { headline, plain, assertMarked } from "../lib/headline.mjs";
import { picture, credit } from "../lib/images.mjs";
import { coords, longDate } from "../lib/components.mjs";
import { SRC } from "../lib/paths.mjs";
import { instagram } from "../../site.config.js";

const SEASONS = [
  ["spring", "Spring"],
  ["summer", "Summer"],
  ["autumn", "Autumn"],
  ["winter", "Winter"],
];

export default async function country(ctx) {
  const pages = [];

  for (const c of ctx.published) {
    assertMarked(c.headline, `countries/${c.slug}.json`);

    const gems = ctx.gemsByCountry.get(c.slug) ?? [];
    const posts = ctx.postsByCountry.get(c.slug) ?? [];

    const hero = c.hero
      ? await picture(join(SRC, "assets", "heroes", c.hero.file), {
          alt: c.hero.alt,
          sizes: "100vw",
          widths: [640, 1280, 1920],
          className: "hero-img",
          eager: true,
        })
      : null;

    const main = html`
${hero ? html`<div class="bleed">${hero}</div>` : ""}

<div class="wrap">
  ${hero ? html`<div style="display:flex;justify-content:flex-end">${credit(c.hero.credit)}</div>` : ""}

  <div class="page-head">
    <p class="eyebrow">${c.region} · ${c.iso}</p>
    ${headline(c.headline, { as: "h1", size: "d-xl" })}
    <p class="lede">${c.intro}</p>
  </div>

  ${gems.length
    ? html`<section aria-labelledby="gems">
    <div class="rule-head">
      <h2 class="d d-m" id="gems">Hidden gems</h2>
      <p class="count">${gems.length} places</p>
    </div>
    <div class="gems">
      ${gems.map(
        (g) => html`<article class="gem">
        <div class="gem-h">
          <h3 class="d d-s" style="margin:0">${g.name}</h3>
          <span class="gem-type">${g.type}</span>
        </div>
        <p>${g.description}</p>
        <div class="gem-facts">
          <span class="m">Nearest town — ${g.nearestTown}</span>
          <span class="data">${coords(g.lat, g.lng)}</span>
        </div>
        <p style="margin-top:.6rem"><strong>Getting there.</strong> ${g.getting}</p>
      </article>`
      )}
    </div>
  </section>`
    : ""}

  <section aria-labelledby="must">
    <h2 class="d d-m" id="must">The obvious ones</h2>
    <dl class="mustsee">
      ${c.mustSee.map(
        (m) => html`<div class="mustsee-row">
        <dt class="d d-s">${m.name}</dt>
        <dd>${m.note}</dd>
      </div>`
      )}
    </dl>
  </section>

  <section aria-labelledby="when">
    <h2 class="d d-m" id="when">When to go</h2>
    <div class="seasons" style="margin-top:1rem">
      ${SEASONS.map(
        ([key, label]) => html`<div class="season">
        <h3>${label}</h3>
        <p>${c.seasons[key]}</p>
      </div>`
      )}
    </div>
  </section>

  <section aria-labelledby="around" class="gut">
    <p class="m">Getting around</p>
    <div>
      <h2 class="d d-m" id="around" style="margin-bottom:.6rem">Trains, boats, and whether you need a car</h2>
      <div class="prose"><p>${c.transport}</p></div>
    </div>
  </section>

  ${posts.length
    ? html`<section aria-labelledby="ig">
    <h2 class="d d-m" id="ig">On Instagram</h2>
    <ul style="margin-top:.75rem">
      ${posts.map((p) =>
        p.permalink
          ? html`<li><a class="linkrow" href="${p.permalink}" rel="noopener">
              <span class="linkrow-t">${plain(p.caption)}</span>
              <span class="m">View post</span>
            </a></li>`
          : html`<li><div class="linkrow linkrow--off">
              <span class="linkrow-t">${plain(p.caption)}</span>
              <span class="m">On the grid — <a href="${instagram.url}" rel="me noopener">${instagram.handle}</a></span>
            </div></li>`
      )}
    </ul>
  </section>`
    : ""}

  <section class="gut">
    <p class="m">Last updated</p>
    <p class="data"><time datetime="${c.updated}">${longDate(c.updated)}</time></p>
  </section>

  <section>
    <p class="note">
      Been recently and something has changed? <a href="mailto:milo@coleman-clan.co.uk?subject=${encodeURIComponent(
        c.name + " guide"
      )}">Tell me</a> and I'll fix the page.
      <a href="/europe/countries/">Back to all 44</a>.
    </p>
  </section>
</div>
`;

    pages.push({
      path: `/europe/countries/${c.slug}/`,
      lastmod: c.updated,
      html: page({
        title: c.name,
        description: c.intro,
        path: `/europe/countries/${c.slug}/`,
        section: "europe",
        ogImage: `/og/country-${c.slug}.png`,
        css: ctx.css,
        main,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "TouristDestination",
          name: c.name,
          description: c.intro,
          url: new URL(`/europe/countries/${c.slug}/`, "https://alpineflyer.com").href,
          touristType: "Independent travellers",
          includesAttraction: gems.map((g) => ({
            "@type": "TouristAttraction",
            name: g.name,
            description: g.description,
            geo: { "@type": "GeoCoordinates", latitude: g.lat, longitude: g.lng },
            containedInPlace: { "@type": "Place", name: g.nearestTown },
          })),
        },
      }),
    });
  }

  return pages;
}
