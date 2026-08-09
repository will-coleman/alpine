import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const SRC = join(ROOT, "src");
export const CONTENT = join(SRC, "content");
/**
 * The finished site. This directory is committed.
 *
 * It's called docs/ because that's the folder GitHub Pages will serve straight
 * out of a repo with no build step configured, and Cloudflare Pages will take
 * it just as happily with the build command left empty. Nothing runs on the
 * server — these are finished HTML files.
 */
export const DIST = join(ROOT, "docs");
export const CACHE = join(ROOT, ".cache");
