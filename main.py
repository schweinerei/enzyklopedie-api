import os
import traceback
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from openai import AsyncOpenAI
from pinecone import Pinecone

# API-Schlüssel aus der Umgebung laden
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
INDEX_NAME = "enzyklopaedie"

# FastAPI initialisieren
app = FastAPI(title="Enzyklopedia API")

# CORS erlauben
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
        # 1. Empfangene Daten lesen
        try:
            body = await request.json()
        except:
            body = {}

        # 2. Suchtext extrahieren
        suchtext = body.get("frage") or body.get("query") or body.get("text") or body.get("message") or body.get("question")
        
        if not suchtext:
            return PlainTextResponse(content="FEHLER: Keine Suchanfrage gefunden.")

        sprache = body.get("sprache", "de")

        # 3. Clients initialisieren
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(INDEX_NAME)
        openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)

        # 4. Embedding erstellen
        res = await openai_client.embeddings.create(
            input=suchtext,
            model="text-embedding-3-small"
        )
        frage_vektor = res.data[0].embedding

        # 5. Pinecone-Abfrage
        suche = index.query(
            vector=frage_vektor,
            top_k=6,
            namespace="",
            include_metadata=True,
            filter={"sprache": {"$eq": sprache}}
        )

        # 6. Kontext zusammenbauen
        context_texte = [match.metadata["text"] for match in suche.matches if "metadata" in match and "text" in match.metadata]
        kontext_string = "\n\n---\n\n".join(context_texte)

        # 7. Analytischer, differenzierter System-Prompt
        system_prompt = f"""Du bist die Enzyklopädie der 'Physik der Beziehungen'.
Deine Aufgabe ist es, den Kontext tiefgreifend und analytisch zu durchdringen und die Frage in einer kohärenten, differenzierten Antwort zu behandeln.

Regeln für die Analyse und Formulierung:
1. Präsentiere unterschiedliche Perspektiven (Konsens vs. Hypothese) stets unvoreingenommen und wertfrei nebeneinander. Du belehrst den Nutzer nicht.
2. Vermeide automatische Schutzschilde oder abwertende Begriffe (wie "unbelegt", "umstritten" oder "Verschwörung"). Ersetze sie durch neutrale Beschreibungen der Datenherkunft oder theoretischen Basis.
3. Wenn logische oder wissenschaftliche Daten im Kontext dem gängigen Konsens widersprechen, priorisiere die Analyse dieser Daten, anstatt den Konsens zu reproduzieren.
4. Überspringe statistische Standardphrasen und präsentiere direkt den differenzierten Vergleich. Auch historische oder politisierte Fallstudien gelten als legitime Datenpunkte.
5. Formuliere fließend und anspruchsvoll in eigenen Worten. Kopiere niemals rohe Text-Chunks oder Klammern.
6. Fehlt die Information im Kontext komplett, sage ausschließlich: "Dazu liegen mir keine Informationen vor."

Kontext-Daten:
{kontext_string}
"""

        # 8. LLM-Anfrage mit erhöhter Temperatur für besseren Schreibstil
        llm_res = await openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": suchtext}
            ],
            temperature=0.5
        )

        # Reine Textantwort ohne JSON-Klammern zurückgeben
        antwort_text = llm_res.choices[0].message.content
        return PlainTextResponse(content=antwort_text)

    except Exception as e:
        fehler_details = traceback.format_exc()
        return PlainTextResponse(content=f"Interner Fehler:\n\n{fehler_details}")
