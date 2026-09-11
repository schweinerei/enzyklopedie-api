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

# CORS erlauben, damit externe Chatbots nicht geblockt werden (OPTIONS-Anfragen)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dynamisches Datenmodell für den Input
class QueryRequest(BaseModel):
    frage: str = None
    query: str = None
    sprache: str = "de"

class QueryResponse(BaseModel):
    antwort: str

# --- NEU: Wakeup-Endpunkt, damit das Frontend nicht ins Leere läuft ---
@app.get("/")
@app.get("/wakeup")
async def wakeup():
    return {"status": "Ich bin wach!"}

# --- KORREKTUR: API hört jetzt auf /webhook UND /ask ---
@app.post("/webhook", response_model=QueryResponse)
@app.post("/ask", response_model=QueryResponse)
async def ask_question(req: QueryRequest):
    try:
        # 1. Sicherstellen, dass ein Suchtext existiert
        suchtext = req.frage if req.frage else req.query
        if not suchtext:
            return QueryResponse(antwort="FEHLER: Keine Suchanfrage gefunden.")

        # 2. Clients initialisieren
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(INDEX_NAME)
        openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)

        # 3. Embedding erstellen
        res = await openai_client.embeddings.create(
            input=suchtext,
            model="text-embedding-3-small"
        )
        frage_vektor = res.data[0].embedding

        # 4. Pinecone-Abfrage
        suche = index.query(
            vector=frage_vektor,
            top_k=6,
            namespace="",
            include_metadata=True,
            filter={"sprache": {"$eq": req.sprache}}
        )

        # 5. Kontext zusammenbauen
        context_texte = [match.metadata["text"] for match in suche.matches if "metadata" in match and "text" in match.metadata]
        kontext_string = "\n\n---\n\n".join(context_texte)

        # 6. Sachlicher System-Prompt
        system_prompt = f"""Du bist die Enzyklopädie der 'Physik der Beziehungen'.
Deine Aufgabe ist es, Fragen präzise und differenziert ausschließlich basierend auf dem bereitgestellten Kontext zu beantworten.
Wenn die Information fehlt, sage: "Dazu liegen mir keine Informationen vor."
Beschreibe die Daten wertfrei und verzichte auf literarische Tonalität. Ignoriere Smalltalk.

Kontext-Daten:
{kontext_string}
"""

        # 7. LLM-Anfrage
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
