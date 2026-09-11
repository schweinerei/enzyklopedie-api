import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import AsyncOpenAI
from pinecone import Pinecone

# 1. API-Schlüssel aus der Umgebung laden
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
INDEX_NAME = "enzyklopaedie"

# 2. Clients initialisieren
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)
openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)

app = FastAPI(title="Enzyklopedia API")

# 3. Datenmodelle für Input und Output definieren
class QueryRequest(BaseModel):
    frage: str
    sprache: str = "de"  # Standardmäßig Deutsch, kann vom Frontend überschrieben werden

class QueryResponse(BaseModel):
    antwort: str

@app.post("/ask", response_model=QueryResponse)
async def ask_question(req: QueryRequest):
    try:
        # 4. Frage in einen Vektor umwandeln
        res = await openai_client.embeddings.create(
            input=req.frage,
            model="text-embedding-3-small"
        )
        frage_vektor = res.data[0].embedding

        # 5. Pinecone-Abfrage im Default-Namespace (inkl. Sprachfilter)
        suche = index.query(
            vector=frage_vektor,
            top_k=6,  # Holt die 6 relevantesten Chunks
            namespace="",
            include_metadata=True,
            filter={"sprache": {"$eq": req.sprache}}
        )

        # 6. Kontext aus den gefundenen Metadaten zusammenbauen
        context_texte = []
        for match in suche.matches:
            if "metadata" in match and "text" in match.metadata:
                context_texte.append(match.metadata["text"])
        
        kontext_string = "\n\n---\n\n".join(context_texte)

        # 7. Der eiserne System-Prompt (Schutz vor Halluzinationen & Smalltalk)
        system_prompt = f"""Du bist die Enzyklopädie der 'Physik der Beziehungen'.
Deine Aufgabe ist es, Fragen präzise und differenziert ausschließlich basierend auf dem bereitgestellten Kontext zu beantworten.

Regeln:
1. Fehlt die Information im Kontext, erfinde nichts. Sage klar: "Dazu liegen mir keine Informationen vor."
2. Verfalle niemals in einen literarischen, erzählerischen oder esoterischen Ton, auch wenn der Kontext literarisch formuliert ist. Beschreibe die Daten und theoretischen Grundlagen wertfrei.
3. Ignoriere standardisierte Floskeln.
4. Bei Smalltalk-Fragen (wie "Hallo" oder "Wie geht's") antworte extrem kurz und sachlich, dass du eine Enzyklopädie bist und nenne keine Kontextinhalte.

Kontext-Daten:
{kontext_string}
"""

        # 8. Anfrage an das LLM senden
        llm_res = await openai_client.chat.completions.create(
            model="gpt-4o",  # Oder gpt-4o-mini / dein LiteLLM-Modell
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": req.frage}
            ],
            temperature=0.2  # Niedrige Temperatur für sachlichere, präzisere Antworten
        )

        antwort_text = llm_res.choices[0].message.content

        return QueryResponse(antwort=antwort_text)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Startbefehl für lokales Testen (z.B. mit uvicorn):
# uvicorn main:app --reload
