import { html } from "../lib/html.mjs";
import { page } from "../lib/layout.mjs";
import { headline, assertMarked } from "../lib/headline.mjs";
import { site, youtube, instagram } from "../../site.config.js";

const H1 = "ONE PERSON, ONE *CAMERA*";

export default async function about(ctx) {
  assertMarked(H1, "about h1");

  const main = html`
<div class="wrap">
  <div class="page-head">
    ${headline(H1, { as: "h1", size: "d-xl" })}
  </div>

  <section class="prose">
    <p class="lede" style="max-width:52ch">
      I'm Will. I'm based in ${site.based}, I fly more than is sensible, and I film most of it.
    </p>
    <p>
      <a href="/videos/">Alpine Flyer</a> is the YouTube channel. It started as flight sim and
      aircraft explainers and it's turning into a travel channel — airlines I've actually flown,
      hotels I've actually stayed in, and what a place is like once you're standing in it.
    </p>
    <p>
      I also run <a href="/instagram/">the Visit Europe Project</a> on
      Instagram: short travel video working through the countries of Europe, one at a time. That
      one lives entirely on Instagram — it isn't mirrored here, and the account is the place to
      follow it.
    </p>
    <p>
      Alpine Media Group is the name over both of them. It's a studio name, the way a photographer
      has one — not a company, not a team, not an office. It's me, a camera, a laptop and an
      unhealthy number of boarding passes. If you email it, I'm the one who reads it.
    </p>
    <p>
      What it isn't: a production house, an agency, or a group with departments. There is nobody
      else here. That's usually the reason people get in touch, and it's the reason things take as
      long as they take.
    </p>
  </section>

  <section aria-labelledby="find">
    <h2 class="d d-m" id="find">Where I am</h2>
    <div style="margin-top:.9rem">
      <a class="linkrow" href="${youtube.channelUrl}" rel="me noopener">
        <span class="linkrow-t">Alpine Flyer</span>
        <span class="m">YouTube · ${youtube.handle}</span>
      </a>
      <a class="linkrow" href="${instagram.url}" rel="me noopener">
        <span class="linkrow-t">Visit Europe Project</span>
        <span class="m">Instagram · ${instagram.handle}</span>
      </a>
      <a class="linkrow" href="mailto:${site.email}">
        <span class="linkrow-t">Email</span>
        <span class="m">${site.email}</span>
      </a>
    </div>
  </section>

  <section>
    <p class="note">
      Working on something and want me involved? <a href="/partnerships/">That's over here</a> —
      I'm open to reviews, trips and product work.
    </p>
  </section>
</div>
`;

  return [
    {
      path: "/about/",
      html: page({
        title: "About",
        description: `Will makes Alpine Flyer on YouTube and the Visit Europe Project on Instagram, from ${site.based}. Alpine Media Group is the name over both.`,
        path: "/about/",
        ogImage: "/og/about.png",
        css: ctx.css,
        main,
      }),
    },
  ];
}
