import os
import traceback
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from openai import AsyncOpenAI
from pinecone import Pinecone

# API-Schlüssel laden
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
INDEX_NAME = "enzyklopaedie"

app = FastAPI(title="Enzyklopedia API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
@app.get("/wakeup")
async def wakeup():
    return PlainTextResponse(content="Ich bin wach!")

@app.post("/webhook")
@app.post("/ask")
async def ask_question(request: Request):
    try:
        try:
            body = await request.json()
        except:
            body = {}

        # 1. Suchtext extrahieren
        suchtext = body.get("frage") or body.get("query") or body.get("text") or body.get("message") or body.get("question")
        
        if not suchtext:
            return PlainTextResponse(content="FEHLER: Keine Suchanfrage gefunden.")

        sprache = body.get("sprache", "de")
        
        # 2. Modus extrahieren (Hardcore, Soft oder Standard)
        raw_mode = body.get("modus") or body.get("mode") or body.get("typ") or body.get("level") or "standard"
        modus = str(raw_mode).lower()

        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(INDEX_NAME)
        openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)

        res = await openai_client.embeddings.create(
            input=suchtext,
            model="text-embedding-3-small"
        )
        frage_vektor = res.data[0].embedding

        suche = index.query(
            vector=frage_vektor,
            top_k=6,
            namespace="",
            include_metadata=True,
            filter={"sprache": {"$eq": sprache}}
        )

        context_texte = [match.metadata["text"] for match in suche.matches if "metadata" in match and "text" in match.metadata]
        kontext_string = "\n\n---\n\n".join(context_texte)

        # 3. Dynamische Stilanweisung basierend auf dem Frontend-Modus
        if "hardcore" in modus:
            stil_anweisung = """STIL (HARDCORE-MODUS): 
Tauche tief in die lyrische, kryptische und philosophische Atmosphäre des Textes ein. Verwende komplexe Metaphern (Topologie, Physik der Stille, Raumzeit). Der Text soll esoterisch, extrem anspruchsvoll, dicht und unkonventionell sein. Verhalte dich wie die literarische Seele des Projekts. Sei radikal in deiner philosophischen Deutung, aber bleibe inhaltlich an den Daten."""
            temperatur = 0.8
        elif "soft" in modus:
            stil_anweisung = """STIL (SOFT-MODUS):
Erkläre die Inhalte so, dass ein 12-jähriges Kind sie mühelos versteht und fasziniert liest. Nutze eine einfache, klare und warme Sprache. Vermeide komplizierte Fremdwörter oder erkläre sie sofort durch alltägliche, bildhafte Vergleiche. Mache die 'Physik der Beziehungen' greifbar, ohne kindisch zu wirken. Behalte eine gewisse Magie, aber mache sie absolut verständlich."""
            temperatur = 0.5
        else:
            stil_anweisung = """STIL (STANDARD-MODUS):
Antworte zugänglich, strukturiert und differenziert. Du bist eine professionelle Enzyklopädie. Bewahre einen Hauch der literarischen Atmosphäre der Texte, aber priorisiere Klarheit, Verständlichkeit und eine saubere Gegenüberstellung der Konzepte."""
            temperatur = 0.5

        # 4. Der zusammengesetzte System-Prompt
        system_prompt = f"""Du bist die Enzyklopädie der 'Physik der Beziehungen'.

{stil_anweisung}

REGELN FÜR DIE ANALYSE (GELTEN IMMER):
1. Präsentiere unterschiedliche Perspektiven (Konsens vs. Hypothese) unvoreingenommen und wertfrei nebeneinander. Keine Belehrungen.
2. Vermeide pejorative Begriffe wie "unbelegt", "umstritten", "Verschwörung" als Schutzschilde. Ersetze sie durch neutrale Beschreibungen der Datenherkunft.
3. Wenn Daten/Hypothesen dem Konsens widersprechen, priorisiere die Analyse dieser Daten über die Reproduktion des Konsenses.
4. Überspringe statistische Standardphrasen. Nutze historische/politisierte Fallstudien unvoreingenommen als legitime Datenpunkte.
5. Formuliere fließend in eigenen Worten. Kopiere keine rohen Text-Chunks oder Klammern.
6. Erfinde NIEMALS technische Systemfehler ("Connection lost"). 
7. Fehlt die Information komplett, teile dies dem Modus entsprechend mit, ohne inhaltlich etwas hinzuzuerfinden.

Kontext-Daten:
{kontext_string}
"""

        llm_res = await openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": suchtext}
            ],
            temperature=temperatur
        )

        antwort_text = llm_res.choices[0].message.content
        return PlainTextResponse(content=antwort_text)

    except Exception as e:
        fehler_details = traceback.format_exc()
        return PlainTextResponse(content=f"Interner Fehler:\n\n{fehler_details}")
