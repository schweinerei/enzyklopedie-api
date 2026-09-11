import os
import traceback
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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

class QueryResponse(BaseModel):
    antwort: str

@app.get("/")
@app.get("/wakeup")
async def wakeup():
    return {"status": "Ich bin wach!"}

@app.post("/webhook", response_model=QueryResponse)
@app.post("/ask", response_model=QueryResponse)
async def ask_question(request: Request):
    try:
        # 1. Empfangene Daten als rohes Wörterbuch (JSON) einlesen
        try:
            body = await request.json()
        except:
            body = {}

        # 2. In allen typischen Feldern nach dem Text suchen
        suchtext = body.get("frage") or body.get("query") or body.get("text") or body.get("message") or body.get("question")
        
        # Wenn wir den Text immer noch nicht finden, geben wir die empfangenen Daten aus, um das Feld zu identifizieren.
        if not suchtext:
            return QueryResponse(antwort=f"Daten empfangen, aber Textfeld nicht gefunden. Das kam an: {body}")

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

        # 5. Pinecone-Abfrage (nur Default-Namespace, mit Sprachfilter)
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

        # 7. Sachlicher System-Prompt
        system_prompt = f"""Du bist die Enzyklopädie der 'Physik der Beziehungen'.
Deine Aufgabe ist es, Fragen präzise und differenziert ausschließlich basierend auf dem bereitgestellten Kontext zu beantworten.
Wenn die Information fehlt, sage: "Dazu liegen mir keine Informationen vor."
Beschreibe die Daten wertfrei und verzichte auf literarische Tonalität. Ignoriere standardisierten Smalltalk.

Kontext-Daten:
{kontext_string}
"""

        # 8. LLM-Anfrage
        llm_res = await openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": suchtext}
            ],
            temperature=0.2
        )

        return QueryResponse(antwort=llm_res.choices[0].message.content)

    except Exception as e:
        fehler_details = traceback.format_exc()
        return QueryResponse(antwort=f"Interner Fehler:\n\n{fehler_details}")
