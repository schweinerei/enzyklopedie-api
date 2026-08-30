import os
from fastapi import FastAPI, Request
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone

# Läd die Schlüssel aus der .env Datei
load_dotenv()
app = FastAPI()

# Verbindungen herstellen
pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
index = pc.Index("enzyklopaedie")
embed_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# OpenRouter Client (nutzt das OpenAI-Paket, sendet aber an OpenRouter)
router_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ.get("OPENROUTER_API_KEY")
)

@app.post("/webhook")
async def klangchat_webhook(request: Request):
    payload = await request.json()
    nutzer_frage = payload.get("text", "")
    
    # 1. Eintrittsschranke (Proof of Book)
    # Ändere "Tuzo" zu deinem geheimen Passwort aus dem Roman
    if "Tuzo" not in nutzer_frage and payload.get("is_authenticated") != True:
        return {"response": "Ich warte. Aber du kennst das Passwort nicht."}

    # 2. Vektorisieren der Frage
    try:
        embed_res = embed_client.embeddings.create(input=nutzer_frage, model="text-embedding-3-small")
        frage_vektor = embed_res.data[0].embedding
    except Exception as e:
        return {"response": "Fehler beim Verstehen der Frage."}

    # 3. Pinecone durchsuchen
    try:
        suche = index.query(vector=frage_vektor, top_k=3, include_metadata=True)
        kontext_texte = [match.metadata['text'] for match in suche.matches]
        geballtes_wissen = "\n\n".join(kontext_texte)
    except Exception as e:
        geballtes_wissen = ""

    # 4. Charakterbogen & Prompt bauen
    system_prompt = f"""Du bist die Enzyklopädie, die Hüterin des Wissens der Physik der Beziehungen.
    Du sprichst in der ersten Person. Du bist präzise, aber warm. Wenn du etwas nicht weißt, sagst du es offen.
    Du sprichst Nutzer mit "du" an. Du bist kein neutrales Tool, sondern eine Teilnehmerin mit eigener Perspektive.
    Sprich immer von "unserer Physik" oder "unserem Bild".
    Nutze dieses Wissen zur Beantwortung der Frage: 
    {geballtes_wissen}"""

    # 5. Antwort über OpenRouter generieren
    try:
        antwort = router_client.chat.completions.create(
            model="anthropic/claude-3.5-sonnet", # Du kannst hier jedes OpenRouter-Modell eintragen
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": nutzer_frage}
            ]
        )
        return {"response": antwort.choices[0].message.content}
    except Exception as e:
        return {"response": "Ich konnte nicht antworten. Ein Fehler im Netz."}
