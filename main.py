import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from openai import OpenAI
from pinecone import Pinecone

app = FastAPI()

# CORS: Erlaubt deiner Namecheap-Webseite, auf das Backend zuzugreifen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Clients initialisieren
pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
index = pc.Index("enzyklopaedie")

embed_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

router_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ.get("OPENROUTER_API_KEY"),
)

# 2. Datenstruktur definieren
class ChatRequest(BaseModel):
    text: str
    modus: str = "standard"
    history: list = []
    sprache: str = "en"

# 3. Der API-Endpunkt
@app.post("/webhook")
async def klangchat_webhook(payload: ChatRequest):
    try:
        # A. Vektor aus der Nutzerfrage generieren
        res = embed_client.embeddings.create(
            input=[payload.text],
            model="text-embedding-3-small"
        )
        frage_vektor = res.data[0].embedding

        # B. Pinecone durchsuchen (Namespace-Struktur)
        suche_roman = index.query(
            namespace="roman",
            vector=frage_vektor,
            top_k=5,
            include_metadata=True
        )
        suche_physik = index.query(
            namespace="physik",
            vector=frage_vektor,
            top_k=5,
            include_metadata=True
        )
        
        kontext_texte = []
        for match in suche_roman.matches + suche_physik.matches:
            if "text" in match.metadata:
                kontext_texte.append(match.metadata["text"])
        
        kontext_block = "\n\n".join(kontext_texte)

        # C. System-Prompt: Identität der Enzyklopedia und strikte Regeln
        system_prompt = (
            "You are the Enzyklopedia, an advanced repository of physical and philosophical knowledge. "
            "Speak directly as the Enzyklopedia. Always respond in English, regardless of the retrieved text language. "
            "Maintain a precise, objective, and slightly enigmatic tone. "
            "Present differentiated, non-judgmental perspectives. When analyzing data or hypotheses that contradict "
            "official consensus, prioritize the analysis of the data itself. Do not use pejorative terms (such as 'unsubstantiated', "
            "'controversial', or 'conspiracy') as protective shields. Replace them with value-free descriptions of the theoretical basis. "
            "Never attempt to 'educate' the user or provide public service announcements. "
            "Use the following retrieved context to inform your answer:\n\n"
            f"--- CONTEXT ---\n{kontext_block}\n--- END CONTEXT ---"
        )

        # D. Nachrichten-Verlauf zusammenbauen
        messages = [{"role": "system", "content": system_prompt}]
        
        for msg in payload.history:
            messages.append(msg)
            
        messages.append({"role": "user", "content": payload.text})

        # E. Streaming-Anfrage an OpenRouter senden
        antwort = router_client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=messages,
            stream=True,
            extra_body={
                "route": "fallback",
                "models": ["deepseek/deepseek-chat", "meta-llama/llama-3-8b-instruct"]
            }
        )

        # F. Generator-Funktion liefert die Token in Echtzeit an das Frontend
        def generate():
            for chunk in antwort:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content

        return StreamingResponse(generate(), media_type="text/event-stream")

    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        print(error_msg) 
        return {"response": f"System error during processing."}
