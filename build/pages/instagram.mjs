import { html } from "../lib/html.mjs";
import { page } from "../lib/layout.mjs";
import { headline, assertMarked } from "../lib/headline.mjs";
import { instagram, site } from "../../site.config.js";

const H1 = "THE VISIT EUROPE *PROJECT*";

/**
 * The Instagram side, described rather than mirrored. No posts, no grid, no
 * embeds — the account is the place to see the work, and an embedded copy of
 * it would go stale the moment something new goes up.
 */
export default async function instagramPage(ctx) {
  assertMarked(H1, "instagram h1");

  const main = html`
<div class="wrap">
  <div class="page-head">
    <p class="eyebrow">Instagram · ${instagram.handle}</p>
    ${headline(H1, { as: "h1", size: "d-xl" })}
    <p class="lede">
      Forty-four countries, one account. Travel guides, the places that don't make the top ten,
      and where to actually go when you get there.
    </p>
  </div>

  <section class="gut" aria-labelledby="what">
    <p class="m">What it is</p>
    <div class="prose">
      <h2 class="d d-m" id="what" style="margin-bottom:.6rem">What it is</h2>
      <p>
        A running project covering every country in Europe — short video and carousels, one place
        at a time. The brief has always been the same: skip the queue at the obvious sight and go
        twenty minutes down the road to the thing nobody photographs.
      </p>
      <p>
        People tag it, and the good ones get reposted with credit. That's how a lot of it has been
        made so far.
      </p>
    </div>
  </section>

  <section class="gut" aria-labelledby="goal">
    <p class="m">Where it's going</p>
    <div class="prose">
      <h2 class="d d-m" id="goal" style="margin-bottom:.6rem">From edits to documenting it myself</h2>
      <p>
        Up to now it's mostly been editing — other people's footage, cut and captioned, with the
        credit on the post. It worked, and it's how the account found an audience.
      </p>
      <p>
        The goal now is to stop editing other people's trips and start documenting my own. Same
        countries, same brief, but shot on the ground: me in the place, with a camera, saying what
        it's like to actually get there. Slower, fewer posts, and worth more.
      </p>
      <p>
        That's the same direction the YouTube channel is going, which is the point — one person
        travelling and filming it, instead of two accounts doing different jobs.
      </p>
    </div>
  </section>

  <section>
    <p class="note">
      The account is <a href="${instagram.url}" rel="me noopener">${instagram.handle}</a>. Tag it in
      something you've shot and it might go up — with your credit on it, and it comes down the same
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
