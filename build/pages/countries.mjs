import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { html, raw, attrs } from "../lib/html.mjs";
import { page } from "../lib/layout.mjs";
import { headline, assertMarked } from "../lib/headline.mjs";
import { SRC } from "../lib/paths.mjs";
import { REGIONS } from "../../site.config.js";

const H1 = "ALL *44*, COVERED OR NOT";

export default async function countries(ctx) {
  assertMarked(H1, "countries h1");
  const script = await readFile(join(SRC, "scripts", "filters.js"), "utf8");

  // Searchable text per country: its own name and every place named in its
  // gems, so "fjord" or "Sighișoara" both find something.
  const searchable = (c) => {
    const gems = ctx.gemsByCountry.get(c.slug) ?? [];
    return [c.name, c.iso, c.region, ...gems.map((g) => g.name), ...gems.map((g) => g.nearestTown)]
      .join(" ")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();
  };

  const main = html`
<div class="wrap">
  <div class="page-head">
    <p class="eyebrow">Visit Europe Project</p>
    ${headline(H1, { as: "h1", size: "d-xl" })}
    <p class="lede">
      Every country in Europe, written up or not.
    </p>
  </div>

  <div data-filter-root>
    <div class="filters">
      <div>
        <label class="vh" for="q">Search countries and places</label>
        <input class="search" id="q" type="search" data-filter-search placeholder="Search a country or a place">
      </div>
      <div class="filter-set" role="group" aria-label="Filter by region">
        ${REGIONS.map(
          (r) => html`<button class="chip" type="button" data-filter-key="region" data-filter-value="${r}" aria-pressed="false">${r}</button>`
        )}
      </div>
      <p class="tally" data-filter-tally aria-live="polite">All ${ctx.countries.length}</p>
    </div>

    <ul class="clist">
      ${ctx.countries.map(
        (c) => html`<li data-item data-region="${c.region}" data-search="${searchable(c)}">${
          c.published
            ? html`<a class="linkrow" href="/europe/countries/${c.slug}/">
              <span class="linkrow-t">${c.name}</span>
              <span class="clist-meta"><span class="m">${c.region}</span></span>
            </a>`
            : html`<div class="linkrow linkrow--off">
              <span class="linkrow-t">${c.name}</span>
              <span class="clist-meta"><span class="m">${c.region}</span></span>
              <span class="m clist-none">No guide yet</span>
            </div>`
        }</li>`
      )}
    </ul>

    <p class="note" data-filter-empty hidden>Nothing matches that. Try a country name, or clear the region.</p>
  </div>

  <section>
    <p class="note">
      Want one of the empty ones next? Say so on
      <a href="/europe/featured/">the featured page</a> — I take requests, and I go where people
      actually ask.
    </p>
  </section>
</div>
`;

  return [
    {
      path: "/europe/countries/",
      html: page({
        title: "All 44 countries",
        description:
          "Every country in Europe, filtered by region and searchable by place. Guides published so far, and the ones still to write.",
        path: "/europe/countries/",
        section: "europe",
        ogImage: "/og/countries.png",
        css: ctx.css,
        main,
        scripts: html`<script>${raw(script)}</script>`,
      }),
    },
  ];
}
