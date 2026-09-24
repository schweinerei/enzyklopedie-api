#!/usr/bin/env python3
"""Eintrag(e) aus dem oeffentlichen Log loeschen (JOB-120). Kein oeffentlicher Delete-Endpunkt: nur mit DATABASE_URL.

  DATABASE_URL=postgres://... python3 scripts/log_loeschen.py 12          # Eintrag 12 loeschen
  DATABASE_URL=postgres://... python3 scripts/log_loeschen.py 12 15 20    # mehrere
  DATABASE_URL=postgres://... python3 scripts/log_loeschen.py --liste     # letzte 50 anzeigen (id, zeit, text)
"""
import os
import sys


def main(argv):
    url = os.environ.get("DATABASE_URL")
    if not url or "postgres" not in url:
        print("DATABASE_URL (postgres) fehlt.", file=sys.stderr)
        return 2
    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__)
        return 0
    import psycopg2
    conn = psycopg2.connect(url.replace("postgres://", "postgresql://", 1), connect_timeout=10)
    try:
        cur = conn.cursor()
        if argv[0] == "--liste":
            cur.execute("SELECT id, zeit, text FROM public_log ORDER BY id DESC LIMIT 50;")
            for r in reversed(cur.fetchall()):
                print(f"{r[0]}\t{r[1]:%Y-%m-%d %H:%M}\t{r[2]}")
            return 0
        try:
            ids = [int(a) for a in argv]
        except ValueError:
            print("IDs muessen ganze Zahlen sein.", file=sys.stderr)
            return 2
        for i in ids:
            cur.execute("DELETE FROM public_log WHERE id = %s;", (i,))
            print(f"id {i}: {'geloescht' if cur.rowcount else 'nicht gefunden'}")
        conn.commit()
        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
