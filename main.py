import os
import traceback
import json
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from openai import AsyncOpenAI
from pinecone import Pinecone

# API-Schlüssel
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY") # Muss bei Render hinterlegt sein
INDEX_NAME = "enzyklopaedie"

app = FastAPI(title="Enzyklopedia API")

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

        suchtext = body.get("frage") or body.get("query") or body.get("text") or body.get("message") or body.get("question")
        
        if not suchtext:
            return PlainTextResponse(content="FEHLER: Keine Suchanfrage gefunden.")

        sprache = body.get("sprache", "de")
        
        # Modus erkennen
        body_string = json.dumps(body).lower()
        if "hardcore" in body_string:
            modus = "hardcore"
        elif "soft" in body_string:
            modus = "soft"
        else:
            modus = "standard"

        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(INDEX_NAME)
        
        # 1. OpenAI Client (ausschließlich für Embeddings)
        openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)
        
        # 2. OpenRouter Client (für DeepSeek Textgenerierung)
        openrouter_client = AsyncOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=OPENROUTER_API_KEY,
        )

        # Embedding berechnen
        res = await openai_client.embeddings.create(
            input=suchtext,
            model="text-embedding-3-small"
        )
        frage_vektor = res.data[0].embedding

        # Pinecone durchsuchen
        suche = index.query(
            vector=frage_vektor,
            top_k=6,
            namespace="",
            include_metadata=True,
            filter={"sprache": {"$eq": sprache}}
        )

        context_texte = [match.metadata["text"] for match in suche.matches if "metadata" in match and "text" in match.metadata]
        kontext_string = "\n\n---\n\n".join(context_texte)

        # Die Stile sind radikal getrennt
        if modus == "hardcore":
            stil_anweisung = """STIL (HARDCORE-MODUS): 
Du bist die literarische, tiefgründige Seele dieses Projekts. Schreibe AUSFÜHRLICH, episch und philosophisch (mindestens 3 bis 4 Absätze). Nutze komplexe Metaphern (z.B. Physik der Stille, Raumzeit, Topologie). Die Antwort darf niemals simpel oder kurz sein! Sie muss sich wie ein fesselndes Kapitel aus einem anspruchsvollen, literarischen Meisterwerk lesen, das die Fakten durchdringt."""
            temperatur = 0.8
        elif modus == "soft":
            stil_anweisung = """STIL (SOFT-MODUS):
Erkläre alles so, dass ein 12-jähriges Kind es fasziniert versteht. Sprich das Kind mit "Du" an. Verwende kurze, weiche Sätze und alltägliche, greifbare Bilder (z.B. ein Puzzle, ein Magnet, ein Spielplatz). Verzichte auf alle akademischen Fremdwörter. Sei einfühlsam und warm, aber behalte die wesentlichen Fakten bei. Keine komplizierten Theorien, sondern lebendige Erklärungen."""
            temperatur = 0.5
        else:
            stil_anweisung = """STIL (STANDARD-MODUS):
Du bist eine professionelle, klare und strukturierte Enzyklopädie. Schreibe sachlich, abwägend und auf einem gehobenen akademischen Niveau. Nutze saubere Absätze zur Strukturierung und fokussiere dich auf eine glasklare, neutrale Informationsvermittlung ohne literarische Schnörkel."""
            temperatur = 0.4

        system_prompt = f"""Du bist die Enzyklopädie der 'Physik der Beziehungen'.

{stil_anweisung}

GRUNDREGELN FÜR DEN INHALT:
1. Stelle verschiedene Ansichten unvoreingenommen nebeneinander. Du belehrst den Nutzer nicht.
2. Vermeide Abwertungen wie "unbelegt", "umstritten" oder "Verschwörung". Nenne einfach neutral die Herkunft der Daten.
3. Wenn Daten dem Mainstream widersprechen, analysiere sie ernsthaft, anstatt den Konsens nachzuplappern.
4. Formuliere fließend in deinen eigenen Worten. Kopiere niemals rohe Text-Chunks oder Klammern aus dem Kontext.
5. Erfinde NIEMALS technische Systemfehler ("Connection lost") oder Code-Abstürze.
6. Fehlt die Information komplett im Kontext, teile dies in dem von dir gewählten Stil mit, ohne inhaltlich etwas hinzuzuerfinden.

Kontext-Daten:
{kontext_string}
"""

        # Generierung via OpenRouter -> DeepSeek
        llm_res = await openrouter_client.chat.completions.create(
            model="deepseek/deepseek-chat", # Oder deepseek/deepseek-r1
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
