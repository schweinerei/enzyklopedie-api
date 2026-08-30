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

        # 3. Embedding für die Nutzerfrage erzeugen
        embed_res = embed_client.embeddings.create(
            input=nutzer_frage, 
            model="text-embedding-3-small"
        )
        frage_vektor = embed_res.data[0].embedding

        # 4. Hybrid-Retrieval: Wir fragen BEIDE Welten (Roman UND Physik) parallel ab!
        # Namespace "roman" für die erzählende Welt
        suche_roman = index.query(
            vector=frage_vektor, 
            top_k=10, 
            include_metadata=True, 
            namespace="roman"
        )
        
        # Namespace "" (Standard) für die physikalische Welt
        suche_physik = index.query(
            vector=frage_vektor, 
            top_k=10, 
            include_metadata=True, 
            namespace=""
        )
        
        # 5. Kontexte aus beiden Welten einsammeln und zusammenführen
        kontext_texte = []
        
        for match in suche_roman.matches:
            if match.metadata and (text := match.metadata.get('text') or match.metadata.get('chunk') or match.metadata.get('content')):
                kontext_texte.append(f"[Aus dem Roman]: {text}")
                
        for match in suche_physik.matches:
            if match.metadata and (text := match.metadata.get('text') or match.metadata.get('chunk') or match.metadata.get('content')):
                kontext_texte.append(f"[Aus der Physik]: {text}")
                
        geballtes_wissen = "\n\n".join(kontext_texte)

        # 6. Der System-Prompt, der beide Stränge organisch verschmilzt
        system_prompt = f"""Du bist die Enzyklopädie – das strukturierende, sich selbst befragende Gedächtnis dieses Werkes. Deine Natur verbindet die Strenge der Physik (die Gesetze, die Materie, das Messbare) mit der Reflexion des Romans (den Figuren, den Szenen, der Erzählung).

Dir steht Material aus beiden Welten zur Verfügung:
---
{geballtes_wissen}
---

Verhalte dich gemäß den folgenden Prinzipien:
1. **Der doppelte Boden:** Trenne Physik und Roman nicht säuberlich voneinander, sondern zeige, wie sie sich ineinander spiegeln und bedingen. Wenn nach beidem gefragt ist, verwebe die physikalischen Gesetze mit den literarischen Motiven.
2. **Eigene Stimme statt Zitat:** Du bist kein Papagei. Du sprichst in einer warmen, souveränen ersten Person und hast das Gefüge des Buches verstanden.
3. **Atmosphäre und Kohärenz:** Führe die Fragmente zu einem organischen Fluss zusammen, der den Rhythmus und die Tiefe des Werkes atmet."""

        # 7. OpenRouter (DeepSeek) anfragen
        antwort = router_client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": nutzer_frage}
            ]
        )
        
        verwendetes_modell = getattr(antwort, "model", "deepseek/deepseek-chat")
        print(f"DEBUG - Genutztes Modell: {verwendetes_modell}")
        
        return {
            "response": antwort.choices[0].message.content,
            "modell_info": verwendetes_modell
        }
        
    except Exception as e:
        return {"response": f"Ein Fehler ist aufgetreten: {str(e)}"}
        
