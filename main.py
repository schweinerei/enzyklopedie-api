import os
from fastapi import FastAPI, Request
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone

load_dotenv()
app = FastAPI()

pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
index = pc.Index("enzyklopaedie")
embed_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
router_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ.get("OPENROUTER_API_KEY")
)

@app.post("/webhook")
async def klangchat_webhook(request: Request):
    try:
        payload = await request.json()
        roher_text = payload.get("text", "")
        
        # 1. Eintrittsschranke prüfen
        if "Tuzo" not in roher_text and payload.get("is_authenticated") != True:
            return {"response": "Ich warte. Aber du kennst das Passwort nicht."}

        # 2. Das Passwort aus dem Text entfernen
        nutzer_frage = roher_text.replace("Tuzo", "").strip()

        # 3. Embedding erzeugen
        embed_res = embed_client.embeddings.create(input=nutzer_frage, model="text-embedding-3-small")
        frage_vektor = embed_res.data[0].embedding

        # 4. Automatische Weiche (Router)
        roman_schluesselwoerter = ["roman", "figur", "figuren", "geschichte", "szene", "erzähl", "handlung", "kapitel"]
        ist_roman_frage = any(wort in nutzer_frage.lower() for wort in roman_schluesselwoerter)
        
        ziel_namespace = "roman" if ist_roman_frage else ""

        # 5. Pinecone abfragen
        suche = index.query(
            vector=frage_vektor, 
            top_k=3, 
            include_metadata=True, 
            namespace=ziel_namespace
        )
        
        print(f"Namespace: '{ziel_namespace}' | Gefundene Treffer: {len(suche.matches)}")
        
        kontext_texte = [match.metadata.get('text', '') for match in suche.matches]
        geballtes_wissen = "\n\n".join(kontext_texte)

        # 6. System-Prompt mit explizitem Kontext-Block
        system_prompt = f"""Du bist die Enzyklopädie, die Hüterin des Wissens. Du sprichst in der ersten Person, bist präzise, aber warm und sprichst den Nutzer mit "du" an.
        
Hier ist der exakte Kontext aus unserem Roman, den du für deine Antwort verwenden musst:
---
{geballtes_wissen}
---
Beantworte die Frage des Nutzers ausschließlich basierend auf diesem Kontext."""

        # 7. OpenRouter Abfrage
        antwort = router_client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": nutzer_frage}
            ]
        )
        return {"response": antwort.choices[0].message.content}
        
    except Exception as e:
        return {"response": f"Ein Fehler ist aufgetreten: {str(e)}"}
