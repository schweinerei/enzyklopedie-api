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

        # 2. Das Passwort entfernen
        nutzer_frage = roher_text.replace("Tuzo", "").strip()

        # 3. Embedding für die Nutzerfrage erzeugen
        embed_res = embed_client.embeddings.create(
            input=nutzer_frage, 
            model="text-embedding-3-small"
        )
        frage_vektor = embed_res.data[0].embedding

        # 4. Intelligente Weiche: Wenn nach Figuren, Kapiteln, Geschichten oder Tieren gefragt wird, 
        # suchen wir im Roman-Namespace, ansonsten im Standard-Bereich (Physik).
        roman_schluesselwoerter = [
            "roman", "figur", "figuren", "geschichte", "szene", "erzähl", 
            "handlung", "kapitel", "wolf", "schweine", "schwein", "wölfe"
        ]
        ist_roman_frage = any(wort in nutzer_frage.lower() for wort in roman_schluesselwoerter)
        
        ziel_namespace = "roman" if ist_roman_frage else ""

        # 5. Pinecone abfragen
        suche = index.query(
            vector=frage_vektor, 
            top_k=5, 
            include_metadata=True, 
            namespace=ziel_namespace
        )
        
        # 6. Kontext sauber extrahieren
        kontext_texte = []
        for match in suche.matches:
            if match.metadata:
                text_inhalt = match.metadata.get('text') or match.metadata.get('chunk') or match.metadata.get('content')
                if text_inhalt:
                    kontext_texte.append(text_inhalt)
                
        geballtes_wissen = "\n\n".join(kontext_texte)
        print(f"Namespace: '{ziel_namespace}' | Extrahierte Zeichen: {len(geballtes_wissen)}")

        # 7. System-Prompt für DeepSeek
        system_prompt = f"""Du bist die Enzyklopädie und die erzählende Stimme. Du sprichst in der ersten Person, bist präzise und warm.
        
Hier ist der Kontext aus dem Speicher:
---
{geballtes_wissen}
---
Beantworte die Frage des Nutzers ausschließlich basierend auf diesem Kontext. Wenn die Antwort dort nicht enthalten ist, sage es offen."""

        # 8. OpenRouter (DeepSeek) anfragen
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
