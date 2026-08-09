import { join } from "node:path";
import { access } from "node:fs/promises";
import { html } from "../lib/html.mjs";
import { page } from "../lib/layout.mjs";
import { headline, assertMarked } from "../lib/headline.mjs";
import { picture } from "../lib/images.mjs";
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
    const file = join(SRC, "assets", "upcoming", upcoming.still);
    if (await access(file).then(() => true, () => false)) {
      still = await picture(file, {
        alt: "",
        sizes: "100vw",
        widths: [640, 1280, 1920],
        className: "hero-img",
        eager: true,
      });
    } else {
      ctx.problems.push(`instagram: src/assets/upcoming/${upcoming.still} not found — page rendered without the still`);
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
      A running project covering every country in Europe — short video and carousels, one place at
      a time. The brief has always been the same: skip the queue at the obvious sight and go twenty
      minutes down the road to the thing nobody photographs.
    </p>
    <p>
      People tag the account, and the good ones get reposted with credit on them. That's how a lot
      of it has been made so far.
    </p>
  </section>

  <section class="prose">
    <h2 class="d d-m">From edits to documenting it myself</h2>
    <p style="margin-top:.7rem">
      Up to now it's mostly been editing — other people's footage, cut and captioned, credit on the
      post. It worked, and it's how the account found an audience.
    </p>
    <p>
      The goal now is to stop editing other people's trips and start documenting my own. Same
      countries, same brief, but shot on the ground: me in the place, with a camera, saying what
      it's actually like to get there. Slower, fewer posts, worth more.
    </p>
    <p>
      That's the same direction the <a href="/videos/">YouTube channel</a> is going, which is the
      point — one person travelling and filming it, rather than two accounts doing different jobs.
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
