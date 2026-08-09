import { html } from "../lib/html.mjs";
import { page } from "../lib/layout.mjs";
import { headline, assertMarked } from "../lib/headline.mjs";
import { site, youtube, instagram } from "../../site.config.js";

const H1 = "OPEN FOR *PARTNERSHIPS*";

/**
 * A contact page, not a media kit. No rates, no rate card, no deliverables
 * matrix — those are a conversation, and putting them on a public page just
 * gives people a reason to decide without talking to you.
 */
export default async function partnerships(ctx) {
  assertMarked(H1, "partnerships h1");

  const main = html`
<div class="wrap">
  <div class="page-head">
    <p class="eyebrow">Available for work</p>
    ${headline(H1, { as: "h1", size: "d-xl" })}
    <p class="lede">
      Holiday and hotel reviews, travel films for YouTube, and product reviews on Instagram.
      Airlines, hotels, tourist boards and travel brands.
    </p>
  </div>

  <section aria-labelledby="get-in-touch">
    <h2 class="vh" id="get-in-touch">Get in touch</h2>
    <div class="contact">
      <a class="contact-main" href="mailto:${site.email}?subject=${encodeURIComponent("Partnership")}">
        <span class="m">Email me</span>
        <span class="contact-addr">${site.email}</span>
        <span class="m">Tell me the route or the region, roughly when, and what you're after. A few lines is enough to start.</span>
      </a>

      <div class="contact-side">
        <a class="contact-row" href="${youtube.channelUrl}" rel="noopener">
          <span class="contact-row-t">YouTube</span>
          <span class="m">${youtube.handle}</span>
        </a>
        <a class="contact-row" href="${instagram.url}" rel="me noopener">
          <span class="contact-row-t">Instagram</span>
          <span class="m">${instagram.handle}</span>
        </a>
        <a class="contact-row" href="/videos/">
          <span class="contact-row-t">See the work</span>
          <span class="m">The channel</span>
        </a>
      </div>
    </div>
  </section>

  <section class="prose">
    <p>
      I take one project at a time. Reviews are honest, including when the verdict is
      unflattering.
    </p>
    <p class="m">Paid work is disclosed on the video and in the caption, every time.</p>
  </section>
</div>
`;

  return [
    {
      path: "/partnerships/",
      html: page({
        title: "Partnerships",
        description:
          "Holiday and hotel reviews, travel films for YouTube and product reviews on Instagram, for airlines, hotels, tourist boards and travel brands. Get in touch.",
        path: "/partnerships/",
        section: "videos",
        ogImage: "/og/partnerships.png",
        css: ctx.css,
        main,
      }),
    },
  ];
}
