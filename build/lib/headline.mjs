/**
 * The keyword rule.
 *
 * Both channels knock one word out of every headline in a colour — white
 * condensed caps with the load-bearing word in red on YouTube, in yellow on
 * Instagram. This site does the same thing, but the marked word is written
 * into the content files rather than hand-wrapped in a span at the template:
 *
 *     "THE *PORTUGAL* NOBODY TELLS YOU ABOUT"
 *     → THE <b class="kw">PORTUGAL</b> NOBODY TELLS YOU ABOUT
 *
 * `.kw` takes its colour from `--accent`, which each section sets on its own
 * wrapper. So the same string comes out red on /videos and EU blue on
 * /europe with no template knowing anything about it.
 *
 * <b> is the correct element: stylistically offset, no added importance. The
 * word carries information, not emphasis, so <strong> and <em> would both be
 * lying to a screen reader.
 *
 * Pick the word that carries the information — the country, the aircraft, the
 * airline. `assertMarked` shouts during the build if a headline forgot one.
 */

import { html, raw, esc } from "./html.mjs";

const MARK = /\*([^*]+)\*/g;

/** Inline markup only — for use inside an element you're already opening. */
export function kw(text) {
  const source = String(text ?? "");
  let out = "";
  let last = 0;
  for (const match of source.matchAll(MARK)) {
    out += esc(source.slice(last, match.index));
    out += `<b class="kw">${esc(match[1])}</b>`;
    last = match.index + match[0].length;
  }
  return raw(out + esc(source.slice(last)));
}

/** The plain text, marks removed — for <title>, meta and OG images. */
export function plain(text) {
  return String(text ?? "").replace(MARK, "$1");
}

/** A whole heading element. */
export function headline(text, { as = "h2", size = "d-l", id, className = "" } = {}) {
  const tag = as;
  const cls = ["d", size, className].filter(Boolean).join(" ");
  const idAttr = id ? ` id="${esc(id)}"` : "";
  return html`${raw(`<${tag} class="${esc(cls)}"${idAttr}>`)}${kw(text)}${raw(`</${tag}>`)}`;
}

const unmarked = [];

/** Collected and reported at the end of the build rather than thrown one by one. */
export function assertMarked(text, where) {
  if (!MARK.test(String(text ?? ""))) unmarked.push(`${where}: ${plain(text)}`);
  MARK.lastIndex = 0;
  return text;
}

export const unmarkedHeadlines = () => unmarked;
