import { html } from "../lib/html.mjs";
import { page } from "../lib/layout.mjs";
import { plain } from "../lib/headline.mjs";
import { shortDate } from "../lib/components.mjs";
import { site, youtube, instagram } from "../../site.config.js";

/**
 * The bio-link page.
 *
 * Reached from a phone, from a profile, one-handed. No nav, no footer, no
 * JavaScript, no images. The top two entries are generated from the same data
 * as the rest of the site, so they can never go stale by being forgotten.
 */
export default async function links(ctx) {
  const latestVideo = ctx.videos[0];

  const stack = [
    latestVideo && {
      href: latestVideo.url,
      label: "Latest video",
      title: latestVideo.marked,
      meta: shortDate(latestVideo.published),
      external: true,
    },
    {
      href: "/partnerships/",
      label: "Brands and agencies",
      title: "OPEN FOR *PARTNERSHIPS*",
      meta: "What I deliver",
    },
    { href: youtube.channelUrl, label: "YouTube", title: "*ALPINE FLYER*", meta: youtube.handle, external: true },
    { href: "/instagram/", label: "The Instagram project", title: "*VISIT EUROPE* PROJECT", meta: "What it is, and where it's going" },
    { href: instagram.url, label: "Instagram", title: "FOLLOW THE *ACCOUNT*", meta: instagram.handle, external: true },
    { href: `mailto:${site.email}`, label: "Email", title: "GET IN *TOUCH*", meta: site.email },
  ].filter(Boolean);

  const main = html`
<div class="wrap links-wrap">
  <h1 class="links-mark d d-s"><a href="/">Alpine Media Group</a></h1>
  <p class="links-note">Travel and airline reviews. Open for partnerships.</p>

  <ul class="stack-links">
    ${stack.map(
      (s) => html`<li>
      <a class="stack-link" href="${s.href}"${s.external ? html` rel="noopener"` : ""}>
        <span class="m stack-label">${s.label}</span>
        <span class="stack-title d d-s">${plain(s.title)}</span>
        <span class="m stack-meta">${s.meta}</span>
      </a>
    </li>`
    )}
  </ul>

  <p class="links-note links-foot">
    <a href="/">alpineflyer.com</a>
  </p>
</div>
`;

  return [
    {
      path: "/links/",
      html: page({
        title: "Links",
        description: "Latest video, partnerships, and both accounts.",
        path: "/links/",
        ogImage: "/og/links.png",
        css: ctx.css,
        main,
        bare: true,
      }),
    },
  ];
}
