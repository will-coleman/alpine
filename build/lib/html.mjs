/**
 * A templating primitive, not a framework. Thirty lines, no dependencies.
 *
 * Values interpolated into html`` are escaped unless they came out of html``
 * themselves or were wrapped in raw(). Arrays are joined. null, undefined and
 * false render as nothing, so `cond && html`…`` works.
 */

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

class Raw {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return this.value;
  }
}

export const raw = (value) => new Raw(value);
export const isRaw = (value) => value instanceof Raw;

function render(value) {
  if (value == null || value === false || value === true) return "";
  if (value instanceof Raw) return value.value;
  if (Array.isArray(value)) return value.map(render).join("");
  return esc(value);
}

export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i += 1) out += render(values[i]) + strings[i + 1];
  return new Raw(out);
}

/** `attrs({class: "x", hidden: false, "data-y": 2})` → ` class="x" data-y="2"` */
export function attrs(map) {
  const parts = [];
  for (const [key, value] of Object.entries(map)) {
    if (value == null || value === false) continue;
    if (value === true) parts.push(esc(key));
    else parts.push(`${esc(key)}="${esc(value)}"`);
  }
  return raw(parts.length ? " " + parts.join(" ") : "");
}

export const json = (data) => raw(JSON.stringify(data).replace(/</g, "\\u003c"));
