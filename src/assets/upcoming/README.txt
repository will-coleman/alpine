Artwork for the "coming soon" block on the home page.

Drop two files in here with exactly these names:

  europe-by-train.jpg   the 16:9 title card (the one with EUROPE BY TRAIN,
                        London and Helsinki pinned on it). Any size — the
                        build makes AVIF, WebP and JPEG at three widths.

  train-window.jpg      a frame from the video. Used across the top of the
                        Instagram page.

Then run `npm run build`. If a file is missing the block still renders, and
the build prints a line telling you which one it couldn't find.

Change the names, the title or the caption in site.config.js under `upcoming`.
