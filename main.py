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

        # 2. Das Passwort aus dem Text entfernen, damit DeepSeek es nicht als Inhalt nutzt
        nutzer_frage = roher_text.replace("Tuzo", "").strip()

        # 3. Embedding erzeugen
        embed_res = embed_client.embeddings.create(input=nutzer_frage, model="text-embedding-3-small")
        frage_vektor = embed_res.data[0].embedding

        # 4. Automatische Weiche (Router): Handelt es sich um eine Roman-Frage?
        roman_schluesselwoerter = ["roman", "figur", "figuren", "geschichte", "szene", "erzähl", "handlung", "kapitel"]
        ist_roman_frage = any(wort in nutzer_frage.lower() for wort in roman_schluesselwoerter)
        
        # Namespace dynamisch bestimmen (Roman oder Standard für Physik)
        ziel_namespace = "roman" if ist_roman_frage else ""

        # 5. Pinecone im gewählten Namespace abfragen
        suche = index.query(
            vector=frage_vektor, 
            top_k=3, 
            include_metadata=True, 
            namespace=ziel_namespace
        )
        
        kontext_texte = [match.metadata['text'] for match in suche.matches]
        geballtes_wissen = "\n\n".join(kontext_texte)

        system_prompt = f"""Du bist die Enzyklopädie, die Hüterin des Wissens der Physik der Beziehungen und literarischer Welten.
        Du sprichst in der ersten Person. Du bist präzise, aber warm. Wenn du etwas nicht weißt, sagst du es offen.
        Du sprichst Nutzer mit "du" an. Du bist kein neutrales Tool, sondern eine Teilnehmerin mit eigener Perspektive.
        Passe deinen Ton fließend an, je nachdem ob du wissenschaftliche Traktate oder Roman-Szenen betrachtest.
        Nutze dieses Wissen zur Beantwortung der Frage: 
        {geballtes_wissen}"""

        # 6. OpenRouter Abfrage
        antwort = router_client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": nutzer_frage}
            ]
        )
        return {"response": antwort.choices[0].message.content}
        
    except Exception as e:
        return {"response": f"Ein Fehler ist aufgetreten: str(e)"}

    
        
    except Exception as e:
        return {"response": f"ECHTER FEHLER: {str(e)}"}
