#!/usr/bin/env python3
"""
Subset and instance the three site faces to woff2.

Run this once, or whenever the character set grows (a new country or place name
with a diacritic we don't already carry). The output woff2 files are committed,
so a normal `npm run build` never needs Python.

    pip install "fonttools[woff]" brotli
    python3 build/subset-fonts.py path/to/source-ttfs

Sources, all SIL Open Font License 1.1:
  Archivo            github.com/google/fonts/tree/main/ofl/archivo
  Source Sans 3      github.com/google/fonts/tree/main/ofl/sourcesans3
  IBM Plex Mono      github.com/google/fonts/tree/main/ofl/ibmplexmono
"""

import io
import sys
import pathlib
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.subset import Subsetter, Options, parse_unicodes

OUT = pathlib.Path(__file__).resolve().parent.parent / "src" / "fonts"

# Everything the site can print. Latin-1 plus Latin Extended-A covers the
# country list; the explicit additions are the ones that bit us:
#   U+0218-021B  Romanian S/T-comma      Sighișoara, Bucegi
#   U+010C etc.  Czech/Croatian carons   Čigoć, Šibenik, Žumberak
#   U+0120-017C  Maltese dotted letters  Ġgantija, Ħaġar Qim, Żurrieq
#   U+00B0 U+00B7  degree and middot     coordinates, credit lines
UNICODES = (
    "U+0020-007E,"      # basic latin
    "U+00A0-00FF,"      # latin-1 supplement
    "U+0100-017F,"      # latin extended-A
    "U+0218-021B,"      # romanian comma-below
    "U+02C6,U+02DC,"
    "U+2013,U+2014,"    # en/em dash
    "U+2018,U+2019,"    # single quotes
    "U+201C,U+201D,"    # double quotes
    "U+2022,U+2026,"    # bullet, ellipsis
    "U+2192,U+00D7,"    # arrow, multiplication sign
    "U+00B0,U+00B7,"    # degree, middot
    "U+2212,U+FEFF"
)

FEATURES = ["kern", "liga", "calt", "ccmp", "locl", "tnum"]


def opts():
    o = Options()
    o.flavor = "woff2"
    o.layout_features = FEATURES
    o.hinting = False
    o.desubroutinize = False
    o.name_IDs = [1, 2, 3, 4, 5, 6, 13, 14]   # keep the licence in the binary
    o.name_legacy = False
    o.notdef_outline = False
    o.recalc_bounds = True
    o.drop_tables += ["DSIG"]
    return o


def emit(font, name, also_ttf=False):
    # A partially-instanced variable font hands the subsetter a lazy gvar table
    # that no longer lines up with its glyph order, which blows up on the first
    # composite glyph. Round-tripping through memory materialises it.
    if "gvar" in font:
        buf = io.BytesIO()
        font.save(buf)
        buf.seek(0)
        font = TTFont(buf, lazy=False)

    s = Subsetter(options=opts())
    s.populate(unicodes=parse_unicodes(UNICODES))
    s.subset(font)
    # satori, which draws the OG images, reads ttf/otf/woff but not woff2, so
    # the two faces that appear on an OG card get an uncompressed twin too.
    # These never reach the browser.
    if also_ttf:
        ttf_dir = OUT / "og"
        ttf_dir.mkdir(parents=True, exist_ok=True)
        font.flavor = None
        font.save(ttf_dir / name.replace(".woff2", ".ttf"))

    dest = OUT / name
    font.flavor = "woff2"
    font.save(dest)
    print(f"  {name:<28} {dest.stat().st_size / 1024:6.1f} KB")


def main(src_dir):
    src = pathlib.Path(src_dir)
    OUT.mkdir(parents=True, exist_ok=True)
    print("subsetting →", OUT)

    # Display: pin the width axis at 68 (condensed) and the weight at 800.
    # A pinned static is roughly a third the size of the variable font and the
    # site only ever sets display type one way.
    f = TTFont(src / "Archivo[wdth,wght].ttf")
    f = instantiateVariableFont(f, {"wdth": 68, "wght": 800}, updateFontNames=False)
    emit(f, "archivo-condensed-800.woff2", also_ttf=True)

    # Body: keep the weight axis, clipped to the range the CSS actually uses.
    f = TTFont(src / "SourceSans3[wght].ttf")
    f = instantiateVariableFont(f, {"wght": (400, 700)}, updateFontNames=False)
    emit(f, "source-sans-3-var.woff2")

    # Data: one weight, no axis.
    emit(TTFont(src / "IBMPlexMono-Regular.ttf"), "ibm-plex-mono-400.woff2", also_ttf=True)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
