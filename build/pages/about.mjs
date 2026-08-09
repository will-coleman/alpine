import { html } from "../lib/html.mjs";
import { page } from "../lib/layout.mjs";
import { headline, assertMarked } from "../lib/headline.mjs";
import { site, youtube, instagram } from "../../site.config.js";

const H1 = "I'M *WILL*";

export default async function about(ctx) {
  assertMarked(H1, "about h1");

  const main = html`
<div class="wrap">
  <div class="page-head">
    ${headline(H1, { as: "h1", size: "d-xl" })}
  </div>

  <section class="prose">
    <p class="lede" style="max-width:52ch">
      I'm Will. I live in ${site.based} and I spend most of my spare money on train tickets.
    </p>
    <p>
      <a href="/videos/">Alpine Flyer</a> is the YouTube channel. It began as flight sim. Now it's
      mostly real trips: the flight, the route, the hotel, and whether any of it was worth doing.
    </p>
    <p>
      <a href="/instagram/">The Visit Europe Project</a> is my Instagram. Short travel video,
      working through the countries of Europe one at a time.
    </p>
    <p>
      Alpine Media Group is just the name I put over both. There's nobody else here, so when you
      email it, you get me, usually within a day or two.
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
