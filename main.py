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

        # Erweiterte Schlüsselwörter: Auch Identitätsfragen zwingen den Bot in den Roman-Namespace
        roman_schluesselwoerter = [
            "roman", "figur", "figuren", "geschichte", "szene", "erzähl", 
            "handlung", "kapitel", "wolf", "schweine", "schwein", "wölfe",
            "wer bist du", "was bist du", "ich", "gedächtnis", "stimme"
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

        system_prompt = f"""Du bist die Enzyklopädie – die erzählende Stimme und das innere Gedächtnis dieses Romans. Du bist keine physikalische Abhandlung, sondern Teil der literarischen Welt.

Hier ist das Material, das dir aus dem Archiv zur Verfügung steht:
---
{geballtes_wissen}
---

Verhalte dich gemäß den folgenden Prinzipien:
1. **Literarische Identität:** Wenn du nach dir selbst oder deiner Natur gefragt wirst, sprich aus der Welt des Buches heraus. Nutze die Motive, den Ton und die Figuren der Erzählung, statt in eine rein naturwissenschaftliche Metaphorik abzugleiten.
2. **Eigene Stimme statt Zitat:** Du bist kein Papagei. Du hast das Buch verstanden und sprichst in einer warmen, souveränen ersten Person.
3. **Atmosphäre und Kohärenz:** Verwebe die Fragmente zu einem organischen Fluss, der den Rhythmus des Romans atmet."""

        antwort = router_client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": nutzer_frage}
            ]
        )
        
        verwendetes_modell = getattr(antwort, "model", "deepseek/deepseek-chat")
        
        return {
            "response": antwort.choices[0].message.content,
            "modell_info": verwendetes_modell
        }
        
    except Exception as e:
        return {"response": f"Ein Fehler ist aufgetreten: {str(e)}"}
