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
        
        if "Tuzo" not in roher_text and payload.get("is_authenticated") != True:
            return {"response": "Ich warte. Aber du kennst das Passwort nicht."}

        nutzer_frage = roher_text.replace("Tuzo", "").strip()

        embed_res = embed_client.embeddings.create(
            input=nutzer_frage, 
            model="text-embedding-3-small"
        )
        frage_vektor = embed_res.data[0].embedding

        roman_schluesselwoerter = [
            "roman", "figur", "figuren", "geschichte", "szene", "erzähl", 
            "handlung", "kapitel", "wolf", "schweine", "schwein", "wölfe"
        ]
        ist_roman_frage = any(wort in nutzer_frage.lower() for wort in roman_schluesselwoerter)
        
        ziel_namespace = "roman" if ist_roman_frage else ""

        suche = index.query(
            vector=frage_vektor, 
            top_k=20, 
            include_metadata=True, 
            namespace=ziel_namespace
        )
        
        kontext_texte = []
        for match in suche.matches:
            if match.metadata:
                text_inhalt = match.metadata.get('text') or match.metadata.get('chunk') or match.metadata.get('content')
                if text_inhalt:
                    kontext_texte.append(text_inhalt)
                
        geballtes_wissen = "\n\n".join(kontext_texte)

        # Neuer, souveräner Prompt gegen den Papageien-Effekt
        system_prompt = f"""Du bist die Enzyklopädie und das bewusste Gedächtnis dieses Werkes (sei es Physik oder Roman). Du sprichst in der ersten Person, mit einer klaren, souveränen und eleganten eigenen Stimme.

Hier ist das Material, das dir aus dem Archiv zur Verfügung steht:
---
{geballtes_wissen}
---

Nutze dieses Wissen als Fundament, aber kopiere es nicht stumpf. Sprich frei, verknüpfe die Gedanken organisch miteinander, ziehe Bögen über das Buch hinweg und antworte im Stil eines Autors oder einer wissenden Entität, die die Zusammenhänge tief verstanden hat. Vermeide starre Zitate oder das mechanische Nachbeten von Satzfragmenten."""

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
