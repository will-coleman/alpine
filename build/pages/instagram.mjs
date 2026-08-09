import { join } from "node:path";
import { html } from "../lib/html.mjs";
import { page } from "../lib/layout.mjs";
import { headline, assertMarked } from "../lib/headline.mjs";
import { picture, resolveAsset } from "../lib/images.mjs";
import { SRC } from "../lib/paths.mjs";
import { instagram, site, upcoming } from "../../site.config.js";

const H1 = "THE VISIT EUROPE *PROJECT*";

/**
 * The Instagram side, described rather than mirrored. No posts, no grid, no
 * embeds — the account is where the work lives, and an embedded copy of it
 * goes stale the moment something new goes up.
 */
export default async function instagramPage(ctx) {
  assertMarked(H1, "instagram h1");

  let still = null;
  if (upcoming?.still) {
    const file = await resolveAsset(join(SRC, "assets", "upcoming"), upcoming.still);
    if (file) {
      still = await picture(file, {
        alt: "",
        sizes: "100vw",
        widths: [640, 1280, 1920],
        className: "hero-img",
        eager: true,
      });
    } else {
      ctx.problems.push(`instagram: nothing named "${upcoming.still.replace(/\.[^.]+$/, "")}" in src/assets/upcoming/ — page rendered without the still`);
    }
  }

  const main = html`
${still ? html`<div class="bleed">${still}</div>` : ""}

<div class="wrap">
  <div class="page-head">
    <p class="eyebrow">Instagram · ${instagram.handle}</p>
    ${headline(H1, { as: "h1", size: "d-xl" })}
    <p class="lede">
      Forty-four countries, one account. The places that don't make the top ten, and where to
      actually go when you get there.
    </p>
  </div>

  <section class="prose">
    <h2 class="d d-m">What it is</h2>
    <p style="margin-top:.7rem">
      Short video and carousels, one place at a time, working towards every country in Europe. The
      brief hasn't changed: skip the queue at the famous thing and drive twenty minutes to the one
      nobody photographs.
    </p>
    <p>
      People tag the account. The good ones get reposted, credited.
    </p>
  </section>

  <section class="prose">
    <h2 class="d d-m">From edits to documenting it myself</h2>
    <p style="margin-top:.7rem">
      So far it's mostly been editing. Other people's footage, cut and captioned, credited on the
      post. That's how the account found an audience and I'm not embarrassed by it.
    </p>
    <p>
      What I want now is to shoot it myself. Same countries, same brief, but me actually in the
      place with a camera. That means fewer posts. I think they'll be better ones.
    </p>
    <p>
      The <a href="/videos/">YouTube channel</a> is heading the same way.
    </p>
  </section>

  <section>
    <p class="note">
      The account is <a href="${instagram.url}" rel="me noopener">${instagram.handle}</a>. Tag it in
      something you've shot and it might go up, with your credit on it — and it comes down the same
      day if you email <a href="mailto:${site.email}">${site.email}</a> and ask.
    </p>
  </section>
</div>
`;

  return [
    {
      path: "/instagram/",
      html: page({
        title: "The Visit Europe Project",
        description:
          "The Visit Europe Project on Instagram — 44 countries, one at a time, moving from edits to travel I document myself.",
        path: "/instagram/",
        ogImage: "/og/instagram.png",
        css: ctx.css,
        main,
      }),
    },
  ];
}
