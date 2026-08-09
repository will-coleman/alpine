import { html } from "../lib/html.mjs";
import { page } from "../lib/layout.mjs";
import { headline, assertMarked } from "../lib/headline.mjs";

const H1 = "THIS ONE ISN'T *HERE*";

export default async function notFound(ctx) {
  assertMarked(H1, "404 h1");

  const main = html`
<div class="wrap">
  <div class="page-head">
    <p class="eyebrow">404</p>
    ${headline(H1, { as: "h1", size: "d-xl" })}
    <p class="lede">
      Either I moved it, or it was never written. ${ctx.counts.total - ctx.counts.covered} of the 44
      countries still don't have a guide, so the second one is quite likely.
    </p>
  </div>

  <section>
    <a class="linkrow" href="/europe/countries/">
      <span class="linkrow-t">All 44 countries</span>
      <span class="m">${ctx.counts.covered} live, ${ctx.counts.total - ctx.counts.covered} to go</span>
    </a>
    <a class="linkrow" href="/videos/">
      <span class="linkrow-t">Videos</span>
      <span class="m">${ctx.videos.length} on the channel</span>
    </a>
    <a class="linkrow" href="/">
      <span class="linkrow-t">Everything, newest first</span>
      <span class="m">Home</span>
    </a>
  </section>
</div>
`;

  return [
    {
      path: "/404.html",
      noindex: true,
      html: page({
        title: "Not found",
        description: "That page isn't here.",
        path: "/404.html",
        css: ctx.css,
        main,
      }),
    },
  ];
}
