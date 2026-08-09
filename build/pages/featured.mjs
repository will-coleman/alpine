import { html, raw, attrs } from "../lib/html.mjs";
import { page } from "../lib/layout.mjs";
import { headline, assertMarked } from "../lib/headline.mjs";
import { site, instagram, formspree } from "../../site.config.js";

const H1 = "GET YOUR *CLIP* ON THE GRID";

export default async function featured(ctx) {
  assertMarked(H1, "featured h1");

  const main = html`
<div class="wrap">
  <div class="page-head">
    <p class="eyebrow">Visit Europe Project</p>
    ${headline(H1, { as: "h1", size: "d-xl" })}
    <p class="lede">
      Tag <a href="${instagram.url}" rel="me noopener">${instagram.handle}</a> in a post and I might
      repost it. Here's what actually gets picked, and what happens to your credit when it does.
    </p>
  </div>

  <section class="gut" aria-labelledby="looking">
    <p class="m">What works</p>
    <div class="prose">
      <h2 class="d d-m" id="looking" style="margin-bottom:.6rem">What I'm looking for</h2>
      <p>
        One place, shot properly. A village, a stretch of coast, a road, a view you had to walk to.
        Horizontal or vertical both fine. Shot on a phone is fine — half of what goes up is.
      </p>
      <p>
        It helps enormously if you tell me where it is. "Somewhere in Croatia" is not a location.
        "Rastoke, twenty minutes from Plitvice" is, and that post will go up over a better-looking
        one without a name on it.
      </p>
      <p>
        Countries with no guide yet get priority. If you've shot something in Moldova, Armenia or
        North Macedonia, you're near the front of the queue.
      </p>
    </div>
  </section>

  <section class="gut" aria-labelledby="wont">
    <p class="m">What doesn't</p>
    <div class="prose">
      <h2 class="d d-m" id="wont" style="margin-bottom:.6rem">What I won't post</h2>
      <p>
        Anything you didn't shoot. Stock. Heavy AI generation or a sky replaced with someone else's
        sky. Drone footage from somewhere drones are banned — national parks, city centres, most of
        Norway's fjord viewpoints.
      </p>
      <p>
        Anything with a person in it who clearly didn't agree to be in it. Anything pinning an exact
        location on a place that is already being wrecked by having its exact location pinned.
      </p>
    </div>
  </section>

  <section class="gut" aria-labelledby="credit">
    <p class="m">Credit</p>
    <div class="prose">
      <h2 class="d d-m" id="credit" style="margin-bottom:.6rem">How credit and takedowns work</h2>
      <p>
        Every reposted clip is credited to the person who shot it, in the caption and on the post
        itself. If you want a different handle used, or your real name, say so when you send it.
      </p>
      <p>
        If you want it taken down, email
        <a href="mailto:${site.email}">${site.email}</a> and it comes down the same day. You don't
        have to explain why, and you don't have to fill in a form to ask — that address is a real
        inbox and it's the fastest route.
      </p>
      <p>
        Reposting doesn't transfer anything. It stays your work. I'm not licensing it on, selling it,
        or putting it in a client deliverable without asking you first and agreeing a fee.
      </p>
    </div>
  </section>

  <section aria-labelledby="send">
    <h2 class="d d-m" id="send">Send me something</h2>
    ${
      formspree
        ? html`<form class="submit-form" action="${formspree}" method="POST">
      <div class="field">
        <label for="name">Your name</label>
        <input id="name" name="name" type="text" autocomplete="name" required>
      </div>
      <div class="field">
        <label for="handle">Instagram handle</label>
        <input id="handle" name="handle" type="text" placeholder="@yourhandle" required>
      </div>
      <div class="field">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" autocomplete="email" required>
      </div>
      <div class="field">
        <label for="place">Where was it shot?</label>
        <input id="place" name="place" type="text" placeholder="Town or area, and the country" required>
      </div>
      <div class="field">
        <label for="link">Link to the post or the file</label>
        <input id="link" name="link" type="url" placeholder="https://" required>
      </div>
      <div class="field">
        <label for="message">Anything I should know</label>
        <textarea id="message" name="message" rows="4"></textarea>
      </div>
      <button class="btn" type="submit">Send it</button>
    </form>`
        : html`<div class="note">
      <p>
        The form on this page isn't wired up yet — set <code>PUBLIC_FORMSPREE_ENDPOINT</code> and
        rebuild. Until then, email <a href="mailto:${site.email}">${site.email}</a> with a link and
        where it was shot. That works just as well and gets to the same place.
      </p>
    </div>`
    }
    <p class="m" style="margin-top:1rem">
      Or skip all of this and email <a href="mailto:${site.email}">${site.email}</a> directly.
    </p>
  </section>
</div>
`;

  return [
    {
      path: "/europe/featured/",
      html: page({
        title: "Get featured",
        description:
          "How to get your travel clip reposted by the Visit Europe Project — what gets picked, what doesn't, and how credit and takedowns work.",
        path: "/europe/featured/",
        section: "europe",
        ogImage: "/og/featured.png",
        css: ctx.css,
        main,
      }),
    },
  ];
}
