import { join } from "node:path";
import { html } from "../lib/html.mjs";
import { page } from "../lib/layout.mjs";
import { headline, assertMarked } from "../lib/headline.mjs";
import { shortDate } from "../lib/components.mjs";
import { picture } from "../lib/images.mjs";
import { CACHE } from "../lib/paths.mjs";
import { youtube, site, upcoming } from "../../site.config.js";
import { SRC } from "../lib/paths.mjs";
import { access } from "node:fs/promises";

const H1 = "I FLY IT, I FILM IT, I TELL YOU IF IT WAS ANY *GOOD*";

export default async function home(ctx) {
  assertMarked(H1, "home h1");

  // The lead is the newest full upload. A Short leading the page means a
  // vertical frame stretched across a wide card, and it looks broken.
  const ordered = [...ctx.index];
  const firstFull = ordered.findIndex((v) => !v.short);
  if (firstFull > 0) ordered.unshift(...ordered.splice(firstFull, 1));

  const cards = [];
  for (const [i, item] of ordered.entries()) {
    const lead = i === 0;
    const widths = lead ? [640, 1280] : [480, 960];
    const sizes = lead
      ? "(min-width: 60em) 42rem, 100vw"
      : "(min-width: 60em) 20rem, (min-width: 34em) 50vw, 100vw";
    const img = item.thumb
      ? await picture(join(CACHE, "thumbs", item.thumb), { alt: "", sizes, widths, eager: lead })
      : null;
    cards.push({ ...item, img, lead });
  }

  // The next video, if there is one. Artwork is optional — the block renders
  // without it and the build says which file it couldn't find.
  let soonImg = null;
  if (upcoming?.live && upcoming.thumb) {
    const file = join(SRC, "assets", "upcoming", upcoming.thumb);
    if (await access(file).then(() => true, () => false)) {
      soonImg = await picture(file, {
        alt: "",
        sizes: "(min-width: 64em) 62rem, 100vw",
        widths: [640, 1280, 1920],
        className: "soon-img",
      });
    } else {
      ctx.problems.push(`upcoming: src/assets/upcoming/${upcoming.thumb} not found — block rendered without artwork`);
    }
  }

  const main = html`
<div class="wrap">

  <div class="mast">
    ${headline(H1, { as: "h1", size: "d-xl" })}
    <div class="mast-copy">
      <p>
        I'm Will. I book the flight, take the trip and put the whole thing on camera — airline
        reviews from the seat, hotels I actually stayed in, and places worth the detour once you
        get there. Based in ${site.based}.
      </p>
      <p>
        <a href="/partnerships/">I'm open to partnerships</a> — airlines, hotels, tourist boards
        and travel brands. Reviews, trips and product on camera.
      </p>
    </div>
  </div>

  ${upcoming?.live
    ? html`<section class="soon" aria-labelledby="soon">
    ${soonImg}
    <p class="soon-flag" style="margin-top:${soonImg ? ".9rem" : "0"}">Coming soon</p>
    ${headline(upcoming.title, { as: "h2", size: "d-l", id: "soon", className: "soon-t" })}
    <p class="soon-note">${upcoming.note}</p>
  </section>`
    : ""}
</div>

<section class="pitch">
  <div class="wrap pitch-grid">
    <div>
      <p class="eyebrow">Available for work</p>
      ${headline("SEND ME SOMEWHERE, I'LL REVIEW IT *HONESTLY*", { as: "h2", size: "d-l" })}
    </div>
    <div>
      <p>
        Holiday and hotel reviews, travel films for YouTube, and product reviews on Instagram.
        Paid work is disclosed every time, and if it's not good I'll say so — which is the only
        reason anyone believes the ones that are.
      </p>
      <p class="pitch-cta">
        <a class="btn" href="mailto:${site.email}?subject=${encodeURIComponent("Partnership")}">Email me</a>
        <a class="more" href="/partnerships/">Get in touch →</a>
      </p>
    </div>
  </div>
</section>

<div class="wrap">
  <section aria-labelledby="latest">
    <div class="rule-head">
      <h2 class="d d-m" id="latest">Latest on the channel</h2>
      <p class="count">${ctx.videos.length} up now</p>
    </div>

    <div class="cards">
      ${cards.map(
        (c) => html`<a class="card${c.lead ? " card--lead" : ""}" href="${c.href}" rel="noopener">
        ${c.img}
        <span class="card-meta">${c.short ? "Short" : "Video"} · ${shortDate(c.date)}</span>
        <span class="card-t">${c.title}</span>
      </a>`
      )}
    </div>

    <a class="more" href="${youtube.subscribeUrl}" rel="noopener">Subscribe on YouTube →</a>
  </section>
</div>
`;

  return [
    {
      path: "/",
      lastmod: ctx.index[0]?.date,
      html: page({
        title: "Alpine Flyer",
        description:
          "Travel and airline reviews on YouTube by Will. Open to partnerships with airlines, hotels, tourist boards and travel brands.",
        path: "/",
        section: "videos",
        ogImage: "/og/home.png",
        css: ctx.css,
        main,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          mainEntity: {
            "@type": "Person",
            name: "Will",
            jobTitle: "Travel video maker",
            worksFor: { "@type": "Organization", name: "Alpine Media Group" },
            sameAs: [youtube.channelUrl, "https://www.instagram.com/visiteuropeproject/"],
          },
        },
      }),
    },
  ];
}
