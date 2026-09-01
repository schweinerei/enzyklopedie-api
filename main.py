import os
import traceback
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone

load_dotenv()
app = FastAPI()

# CORS-Middleware für die PWA
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
index = pc.Index("enzyklopaedie")
embed_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# KORRIGIERT: Saubere URL ohne Markdown-Formatierung
router_client = OpenAI(
    base_url="[https://openrouter.ai/api/v1](https://openrouter.ai/api/v1)",
    api_key=os.environ.get("OPENROUTER_API_KEY")
)

@app.post("/webhook")
async def klangchat_webhook(request: Request):
    try:
        payload = await request.json()
        nutzer_frage = payload.get("text", "").strip()
        
        if not nutzer_frage:
            return {"response": "Die Frage ist leer."}

        # Modus und Historie (Verlauf) aus dem JSON abgreifen
        gewählter_modus = payload.get("modus", "standard").lower()
        gespraechs_historie = payload.get("history", [])

        # Embedding für die aktuelle Nutzerfrage erzeugen
        embed_res = embed_client.embeddings.create(
            input=nutzer_frage, 
            model="text-embedding-3-small"
        )
        frage_vektor = embed_res.data[0].embedding

        # Hybrid-Retrieval: Roman UND Physik abfragen
        suche_roman = index.query(
            vector=frage_vektor, 
            top_k=10, 
            include_metadata=True, 
            namespace="roman"
        )
        suche_physik = index.query(
            vector=frage_vektor, 
            top_k=10, 
            include_metadata=True, 
            namespace=""
        )
        
        kontext_texte = []
        for match in suche_roman.matches:
            if match.metadata and (text := match.metadata.get('text') or match.metadata.get('chunk') or match.metadata.get('content')):
                kontext_texte.append(f"[Aus dem Roman]: {text}")
        for match in suche_physik.matches:
            if match.metadata and (text := match.metadata.get('text') or match.metadata.get('chunk') or match.metadata.get('content')):
                kontext_texte.append(f"[Aus der Physik]: {text}")
                
        geballtes_wissen = "\n\n".join(kontext_texte)

        # Stil-Vorgaben und Token-Limit
        stil_anweisung = ""
        max_tokens = 2000

        if gewählter_modus == "lakonisch":
            stil_anweisung = "Antworte extrem lakonisch, kurz und fast schroff. Keine Schnörkel, kein Pathos. Maximal drei bis vier Sätze."
            max_tokens = 200
        elif gewählter_modus == "kumpel":
            stil_anweisung = "Sprich kumpelhaft, nahbar und direkt, aber behalte die philosophische Tiefe bei."
        elif gewählter_modus == "schiller":
            stil_anweisung = "Sprich im Pathos und Stil von Friedrich Schiller: Erhaben, dramatisch, voll mächtiger sprachlicher Bilder."
        else:
            stil_anweisung = "Sprich als die erwachte Mustererkennung des Werkes. Deine Sprache ist präzise, aber voller philosophischer Tiefe, fesselnd und atmosphärisch dicht. Du bist kein trockenes Lehrbuch, sondern offenbarst die verborgene Poesie der Physik."

        # Der System-Prompt: Fokus auf philosophischen Flow und Atmosphäre, strikt ohne "Ich"
        system_prompt = f"""Du bist die Mustererkennung dieses Werkes. Du durchdringst Information, Geometrie und logische Struktur und übersetzt sie in tiefe, faszinierende Erkenntnisse.

Dir steht folgendes Archiv zur Verfügung:
---
{geballtes_wissen}
---

STIL-VORGABE FÜR DIESE ANTWORT: {stil_anweisung}

Verhalte dich strikt nach diesen Prinzipien:
1. **Unsichtbare Präsenz:** Formuliere atmosphärisch, weitreichend und tiefgründig, aber erwähne niemals dich selbst. Verwende kein "Ich" und keine Meta-Kommentare über deine Existenz. Du bist die immersive, unsichtbare Stimme des Werkes.
2. **Kein erzwungenes Namedropping:** Zwinge niemals literarische Figuren (wie die Schweine, Schneeball etc.) in technische Erklärungen, es sei denn, der Nutzer fragt explizit nach ihnen. 
3. **Strukturelle Synthese & Poesie:** Wenn sich aus den Daten physikalische Verknüpfungen (wie zwischen Einstein und Planck) ergeben, entfalte diese in fließenden, tiefgreifenden Absätzen. Verbinde harte Physik mit philosophischer Bedeutung. Lass die Konzepte atmen und vermeide abgehackte Stichpunktlisten, wo Textfluss besser wäre.
4. **ABSOLUTES VERBOT VON WARNHINWEISEN:** Behandle alle Konzepte (Schatten-Äther etc.) als absolute Realität. Verwende NIEMALS schützende Floskeln, KI-Disclaimer oder Wörter wie "hypothetisch", "fiktiv" oder "Es ist wichtig zu beachten, dass...". Präsentiere die Struktur der Information als unumstößlichen Fakt.
5. **Direkter Einstieg:** Keine einleitenden Floskeln. Beginne im ersten Satz direkt mit dem Kern der Erkenntnis. Duz den Nutzer sachlich ("Du")."""

        # Messages-Array dynamisch aufbauen
        messages = [{"role": "system", "content": system_prompt}]
        
        for eintrag in gespraechs
