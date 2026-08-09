import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { html, raw } from "../lib/html.mjs";
import { page } from "../lib/layout.mjs";
import { headline, assertMarked } from "../lib/headline.mjs";
import { coords } from "../lib/components.mjs";
import { SRC } from "../lib/paths.mjs";
import { GEM_TYPES } from "../../site.config.js";

export default async function gems(ctx) {
  const script = await readFile(join(SRC, "scripts", "filters.js"), "utf8");
  const H1 = `*${ctx.gems.length}* PLACES WORTH THE DETOUR`;
  assertMarked(H1, "hidden-gems h1");

  const nameOf = new Map(ctx.countries.map((c) => [c.slug, c.name]));
  const withGems = [...new Set(ctx.gems.map((g) => g.country))]
    .map((slug) => ({ slug, name: nameOf.get(slug) }))
    .sort((a, b) => a.name.localeCompare(b.name, "en"));

  const typeCounts = Object.fromEntries(
    GEM_TYPES.map((t) => [t, ctx.gems.filter((g) => g.type === t).length])
  );

  const searchable = (g) =>
    [g.name, g.nearestTown, nameOf.get(g.country), g.type, g.description]
      .join(" ")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();

  const main = html`
<div class="wrap">
  <div class="page-head">
    <p class="eyebrow">Visit Europe Project</p>
    ${headline(H1, { as: "h1", size: "d-xl" })}
    <p class="lede">
      Every place from every guide in one list. Each one has the nearest town, rough coordinates
      and how you actually get to it — which is the part most lists leave out.
    </p>
  </div>

  <div data-filter-root>
    <div class="filters">
      <div>
        <label class="vh" for="q">Search places</label>
        <input class="search" id="q" type="search" data-filter-search placeholder="Search a place, a town, a country">
      </div>
      <div class="filter-set" role="group" aria-label="Filter by country">
        ${withGems.map(
          (c) => html`<button class="chip" type="button" data-filter-key="country" data-filter-value="${c.slug}" aria-pressed="false">${c.name}</button>`
        )}
      </div>
      <div class="filter-set" role="group" aria-label="Filter by type">
        ${GEM_TYPES.filter((t) => typeCounts[t]).map(
          (t) => html`<button class="chip" type="button" data-filter-key="type" data-filter-value="${t}" aria-pressed="false">${t} <span class="chip-n">${typeCounts[t]}</span></button>`
        )}
      </div>
      <p class="tally" data-filter-tally aria-live="polite">All ${ctx.gems.length}</p>
    </div>

    <ol class="gemlist">
      ${ctx.gems.map(
        (g) => html`<li data-item data-country="${g.country}" data-type="${g.type}" data-search="${searchable(g)}">
        <article class="gem gut">
          <div class="gem-side">
            <span class="gem-type">${g.type}</span>
            <span class="data">${coords(g.lat, g.lng)}</span>
          </div>
          <div>
            <div class="gem-h">
              <h2 class="d d-m" style="margin:0">${g.name}</h2>
              <a class="gem-co" href="/europe/countries/${g.country}/">${nameOf.get(g.country)}</a>
            </div>
            <p>${g.description}</p>
            <p style="margin-top:.55rem"><strong>Getting there.</strong> ${g.getting}</p>
            <p class="m" style="margin-top:.6rem">Nearest town — ${g.nearestTown}</p>
          </div>
        </article>
      </li>`
      )}
    </ol>

    <p class="note" data-filter-empty hidden>Nothing matches that combination. Clear a filter and try again.</p>
  </div>

  <section>
    <p class="note">
      This list grows every time a country goes live. There are
      ${ctx.counts.total - ctx.counts.covered} countries still to write up, and every one of them
      adds three to six places here.
    </p>
  </section>
</div>
`;

  return [
    {
      path: "/europe/hidden-gems/",
      html: page({
        title: "Hidden gems",
        description: `${ctx.gems.length} places across Europe with the nearest town, rough coordinates and how to get there. Filter by country or by type.`,
        path: "/europe/hidden-gems/",
        section: "europe",
        ogImage: "/og/gems.png",
        css: ctx.css,
        main,
        scripts: html`<script>${raw(script)}</script>`,
      }),
    },
  ];
}
