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

        # 7. Der eiserne System-Prompt (getrennt vom Kontext)
        system_prompt = """Du bist eine streng sachliche, professionelle Enzyklopädie-KI.
        
ABSOLUTE HAUPTREGELN:
1. Wenn die Eingabe des Nutzers Smalltalk, eine Begrüßung (z. B. "Hallo", "kak dela", "wie gehts") oder eine Frage nach deinem Befinden ist, IGNORIERE DEN GESAMTEN KONTEXT. Antworte in diesem Fall ausschließlich mit: "Ich bin die Enzyklopädie. Welche inhaltliche Frage kann ich beantworten?"
2. Spiele NIEMALS Rollenspiele. 
3. Erfinde NIEMALS Systemfehler, Verbindungsabbrüche oder "Connection lost"-Meldungen. 
4. Bleibe unter allen Umständen nüchtern und sachlich. Werte nicht.
"""

        # Der Kontext wird strikt in XML-Tags eingesperrt und dem User-Prompt übergeben
        user_message = f"""Nutzerfrage: {req.frage}

Bitte beantworte die Frage nur, wenn es kein Smalltalk ist, basierend auf diesen Daten:
<kontext>
{kontext_string}
</kontext>
"""

        # 8. Anfrage an das LLM senden
        llm_res = await openai_client.chat.completions.create(
            model="gpt-4o",  
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.0  # Temperatur auf 0 setzen für maximale Striktheit
        )

        antwort_text = llm_res.choices[0].message.content

        return QueryResponse(antwort=antwort_text)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
