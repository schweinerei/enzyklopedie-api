#!/usr/bin/env python3
"""Erzeugt web/bildspur/katalog-inline.js aus web/bildspur/katalog.json.

Fallback fuer index.html per file:// (Doppelklick), wo fetch() auf katalog.json
blockiert ist. Nach jeder Aenderung an katalog.json ausfuehren.
"""
import json, pathlib
w = pathlib.Path(__file__).resolve().parent.parent / "web" / "bildspur"
d = json.loads((w / "katalog.json").read_text(encoding="utf-8"))
(w / "katalog-inline.js").write_text(
    "// AUTOGENERIERT von scripts/katalog_inline_build.py - nicht von Hand pflegen.\n"
    "window.KATALOG_INLINE = " + json.dumps(d, ensure_ascii=False, indent=1) + ";\n",
    encoding="utf-8")
print("ok", len(d["eintraege"]), "Eintraege")
