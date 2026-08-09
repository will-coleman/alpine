/**
 * A static server for dist/, for looking at the site locally.
 * Not used in production — Cloudflare Pages serves dist/ directly.
 */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { DIST } from "./lib/paths.mjs";

const PORT = Number(process.env.PORT ?? 4321);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  let path = join(DIST, normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, ""));

  try {
    if ((await stat(path)).isDirectory()) path = join(path, "index.html");
  } catch {
    /* fall through to the 404 below */
  }

  try {
    const body = await readFile(path);
    res.writeHead(200, {
      "content-type": TYPES[extname(path)] ?? "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(body);
  } catch {
    const body = await readFile(join(DIST, "404.html")).catch(() => "404");
    res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
    res.end(body);
  }
}).listen(PORT, () => console.log(`\n  http://localhost:${PORT}\n`));
