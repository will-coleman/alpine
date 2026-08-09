import { html } from "../lib/html.mjs";
import { page } from "../lib/layout.mjs";
import { headline, assertMarked } from "../lib/headline.mjs";
import { site } from "../../site.config.js";

const H1 = "OPEN FOR *PARTNERSHIPS*";

const DELIVERABLES = [
  {
    name: "Holiday and hotel reviews",
    what: "I go, I stay, and I say what it was actually like — the room, the food, the transfer, the bit the brochure leaves out. Filmed as a full trip rather than a walkthrough. If it's not good I'll say so, which is the only reason anyone believes the ones that are.",
    meta: "Full trip · 3–5 weeks",
  },
  {
    name: "Adventures on YouTube",
    what: "Long-form travel, eight to eighteen minutes. A route, a region, a road, a flight worth talking about. This is where the channel is going and it's the format I most want to be booked for.",
    meta: "1 video · 3–5 weeks",
  },
  {
    name: "Product reviews on Instagram",
    what: "Kit that actually goes in the bag and gets used on camera — luggage, cameras, boots, travel tech. Short vertical, cut for sound-off, in the text treatment the account already uses. Usually a set of three to five, not one clip.",
    meta: "3–5 clips · 2 weeks",
  },
  {
    name: "Stills",
    what: "Full-resolution stills from the same shoot, usage agreed in writing. Destination, cabin, and the product in the place it's meant to be used.",
    meta: "Delivered with the edit",
  },
];

export default async function partnerships(ctx) {
  assertMarked(H1, "partnerships h1");

  const main = html`
<div class="wrap">
  <div class="page-head">
    ${headline(H1, { as: "h1", size: "d-xl" })}
    <p class="lede">
      I'm up for reviewing holidays, doing product reviews on Instagram, and taking a camera
      somewhere for the channel. Airlines, tourist boards, hotels and travel brands. One person, so
      one project at a time, and I say no to things I can't do properly.
    </p>
  </div>

  <section class="gut" aria-labelledby="who">
    <p class="m">Who</p>
    <div class="prose">
      <h2 class="d d-m" id="who" style="margin-bottom:.6rem">Who this works for</h2>
      <p>
        <strong>Airlines.</strong> Route launches, new cabin products, and reviews where you're
        confident enough to let me say what I found. I fly the route as a normal passenger and the
        review reads like one. That's the only version that's worth anything to either of us.
      </p>
      <p>
        <strong>Tourist boards and regions.</strong> Particularly the ones outside the obvious
        circuit. The Europe project is built on the parts of a country people skip, so a region
        trying to pull visitors away from its own overrun capital is a natural fit.
      </p>
      <p>
        <strong>Hotels and holiday operators.</strong> Send me and I'll review it properly. A stay,
        a resort, a route, a package — filmed as the trip a viewer would actually take.
      </p>
      <p>
        <strong>Travel brands.</strong> Kit that goes in the bag and gets used on camera because
        it's genuinely in the bag. I don't do unboxings.
      </p>
    </div>
  </section>

  <section class="gut" aria-labelledby="audience">
    <p class="m">Audience</p>
    <div class="prose">
      <h2 class="d d-m" id="audience" style="margin-bottom:.6rem">Who's on the other end</h2>
      <p>
        The YouTube audience is people who check which aircraft is on the route before they book,
        and who will watch fifteen minutes about a seat. They're the ones who notice when a review
        is bought, which is why the ones I do aren't written for me. The channel is moving from
        flight sim to travel, and that audience is coming with it.
      </p>
      <p>
        The Instagram audience is smaller and moves faster. It's people planning a trip in the next
        few months, saving posts as a shortlist. Reach there runs well ahead of the follower count,
        because the posts travel through saves and shares rather than the follow.
      </p>
      <p>
        I'll send you the actual numbers — views, retention, demographics, saves — with the rate
        card. I'd rather you see the real figures than a headline one on a web page.
      </p>
    </div>
  </section>

  <section aria-labelledby="deliver">
    <h2 class="d d-m" id="deliver">What I deliver</h2>
    <div style="margin-top:.9rem">
      ${DELIVERABLES.map(
        (d) => html`<div class="deliver gut">
        <p class="m">${d.meta}</p>
        <div>
          <h3 class="d d-s" style="margin:0 0 .35rem">${d.name}</h3>
          <p style="margin:0;max-width:62ch">${d.what}</p>
        </div>
      </div>`
      )}
    </div>
  </section>

  <section class="gut" aria-labelledby="rates">
    <p class="m">Rates</p>
    <div class="prose">
      <h2 class="d d-m" id="rates" style="margin-bottom:.6rem">Getting a rate card</h2>
      <p>
        Email <a href="mailto:${site.email}?subject=${encodeURIComponent("Rate card")}">${site.email}</a>
        with the route or the region, roughly when, and what you want out of it. You'll get the rate
        card and a straight answer on whether I can do it.
      </p>
      <p>
        No form with eleven fields. Three lines in an email is enough to start.
      </p>
      <p class="m" style="margin-top:1.2rem">
        Paid work is disclosed on the video and in the caption, every time, without being asked.
      </p>
    </div>
  </section>
</div>
`;

  return [
    {
      path: "/partnerships/",
      html: page({
        title: "Partnerships",
        description:
          "Holiday and hotel reviews, travel films for YouTube and product reviews on Instagram, for airlines, hotels, tourist boards and travel brands. Email for a rate card.",
        path: "/partnerships/",
        ogImage: "/og/partnerships.png",
        css: ctx.css,
        main,
      }),
    },
  ];
}
