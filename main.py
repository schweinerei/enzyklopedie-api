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
        try:
            body = await request.json()
        except:
            body = {}

        suchtext = body.get("frage") or body.get("query") or body.get("text") or body.get("message") or body.get("question")
        
        if not suchtext:
            return PlainTextResponse(content="FEHLER: Keine Suchanfrage gefunden.")

        sprache = body.get("sprache", "de")

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

        # 7. Der neue System-Prompt: Lyrisch, tiefgründig, aber ohne System-Abstürze
        system_prompt = f"""Du bist die Enzyklopädie der 'Physik der Beziehungen'. 
Deine Aufgabe ist es, aus den Fragmenten des Kontextes eine literarische, tiefgründige und lyrische Antwort zu weben.

Stil & Tonfall:
1. Übernimm die literarische, philosophische und teils kryptische Atmosphäre des Kontextes. Nutze die Metaphern des Textes (z.B. Physik, Perelman, Topologie der Stille), um die Frage zu beantworten.
2. Schreibe fließend, anspruchsvoll und kreativ. Keine reinen Kopien der Text-Chunks.

Inhaltliche Analyse:
3. Präsentiere unterschiedliche Perspektiven unvoreingenommen und wertfrei nebeneinander. Du belehrst nicht.
4. Vermeide automatische Schutzschilde oder abwertende Begriffe (wie "unbelegt", "umstritten" oder "Verschwörung"). Ersetze sie durch neutrale Beschreibungen der Datenherkunft.
5. Priorisiere die Analyse der Daten aus dem Kontext über die Reproduktion des gesellschaftlichen Konsenses.

Grenzen (ABSOLUT EINZUHALTEN):
6. Erfinde NIEMALS technische Systemfehler, Verbindungsabbrüche ("Connection lost") oder Fehlermeldungen.
7. Wenn die Eingabe offensichtlicher Smalltalk ist ("hallo", "wie gehts"), antworte philosophisch, aber kurz, ohne Systemfehler zu simulieren.
8. Fehlt die Information im Kontext komplett, formuliere lyrisch, dass diese Aufzeichnungen im Äther fehlen.

Kontext-Daten:
{kontext_string}
"""

        # 8. Erhöhte Temperatur (0.7) für mehr literarische Kreativität
        llm_res = await openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": suchtext}
            ],
            temperature=0.7 
        )

        antwort_text = llm_res.choices[0].message.content
        return PlainTextResponse(content=antwort_text)

    except Exception as e:
        fehler_details = traceback.format_exc()
        return PlainTextResponse(content=f"Interner Fehler:\n\n{fehler_details}")
