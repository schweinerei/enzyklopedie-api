import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone

load_dotenv()
app = FastAPI()

# CORS-Middleware für die PWA (verhindert Blockaden im Browser)
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

        # Stil-Vorgaben und erweitertes Token-Limit für tiefere Synthesen
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
            stil_anweisung = "Sprich als pure, unbestechliche Mustererkennung. Nüchtern, präzise, architektonisch."

        # Der eiskalte System-Prompt mit erzwungener Strukturierung und Anti-Disclaimer
