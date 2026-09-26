#!/usr/bin/env python3
"""Erzeugt web/bildspur/regie-inline.js aus den *.regie.json-Dateien in web/bildspur/.

Fallback fuer den Doppelklick-Fall (index.html per file:// geoeffnet): dort
blockiert Chrome/Brave fetch() auf lokale Dateien (CORS), bildspur.js kann
also weder Regie noch Labels per fetch nachladen. Dieses Skript spiegelt
Regie- und Labels-JSON als window.BILDSPUR_INLINE['<schluessel>'] = {regie,
labels} in eine reine JS-Datei, die index.html zusaetzlich per <script>
einbindet. Keine Handpflege: bei Aenderungen an *.regie.json/labels.json
dieses Skript erneut laufen lassen.

    python3 scripts/regie_inline_build.py
"""

import json
import pathlib

HIER = pathlib.Path(__file__).resolve().parent
BILDSPUR_DIR = HIER.parent / "web" / "bildspur"
ZIEL = BILDSPUR_DIR / "regie-inline.js"


def main():
    eintraege = {}
    for pfad in sorted(BILDSPUR_DIR.glob("*.regie.json")):
        schluessel = pfad.name[: -len(".regie.json")]
        regie = json.loads(pfad.read_text(encoding="utf-8"))

        labels = None
        labels_datei = regie.get("labels_datei")
        if labels_datei:
            labels_pfad = BILDSPUR_DIR.parent / labels_datei
            if labels_pfad.exists():
                labels = json.loads(labels_pfad.read_text(encoding="utf-8"))
            else:
                print(f"  WARNUNG   {labels_datei} fehlt, Labels-Fallback bleibt leer fuer {schluessel}")

        eintraege[schluessel] = {"regie": regie, "labels": labels}
        print(f"  eingebettet  {schluessel}   ({len(regie.get('cues', []))} Cues, Labels: {'ja' if labels else 'nein'})")

    header = (
        "// AUTOGENERIERT von scripts/regie_inline_build.py — nicht von Hand pflegen.\n"
        "// Fallback fuer index.html per file:// (Doppelklick): bildspur.js liest\n"
        "// hieraus, wenn fetch() auf bildspur/*.regie.json unter file:// blockiert\n"
        "// wird oder fehlschlaegt. Auf einem echten Server bleibt fetch() der Weg.\n"
        "window.BILDSPUR_INLINE = window.BILDSPUR_INLINE || {};\n"
    )
    with open(ZIEL, "w", encoding="utf-8") as f:
        f.write(header)
        for schluessel, daten in eintraege.items():
            f.write(f"window.BILDSPUR_INLINE[{json.dumps(schluessel)}] = ")
            f.write(json.dumps(daten, ensure_ascii=False, indent=2))
            f.write(";\n")

    print()
    print(f"  {ZIEL} geschrieben, {len(eintraege)} Schluessel.")


if __name__ == "__main__":
    main()
