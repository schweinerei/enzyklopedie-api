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
        
        # 3. Modus aus dem JSON abgreifen (Standard ist die literarische Enzyklopädie)
        gewählter_modus = payload.get("modus", "standard").lower()

        # 4. Embedding für die Nutzerfrage erzeugen
        embed_res = embed_client.embeddings.create(
            input=nutzer_frage, 
            model="text-embedding-3-small"
        )
        frage_vektor = embed_res.data[0].embedding

        # 5. Hybrid-Retrieval: Wir fragen BEIDE Welten (Roman UND Physik) parallel ab
        suche_roman = index.query(
            vector=frage_vektor, 
            top_k=10, 
            include_metadata=True, 
            namespace="roman"
        )
        
        suche_physik = index.query(
            vector=frage_vektor, 
            top_k=10, 
            include_metadata=True, 
            namespace=""
        )
        
        # 6. Kontexte aus beiden Welten einsammeln und zusammenführen
        kontext_texte = []
        
        for match in suche_roman.matches:
            if match.metadata and (text := match.metadata.get('text') or match.metadata.get('chunk') or match.metadata.get('content')):
                kontext_texte.append(f"[Aus dem Roman]: {text}")
                
        for match in suche_physik.matches:
            if match.metadata and (text := match.metadata.get('text') or match.metadata.get('chunk') or match.metadata.get('content')):
                kontext_texte.append(f"[Aus der Physik]: {text}")
                
        geballtes_wissen = "\n\n".join(kontext_texte)

        # 7. Stil-Vorgaben und Token-Länge je nach Modus anpassen
        stil_anweisung = ""
        max_tokens = 1000

        if gewählter_modus == "lakonisch":
            stil_anweisung = "Antworte extrem lakonisch, kurz und fast schroff. Keine Schnörkel, kein Pathos. Maximal drei bis vier Sätze."
            max_tokens = 200
        elif gewählter_modus == "kumpel":
            stil_anweisung = "Sprich kumpelhaft, nahbar und direkt, aber behalte die philosophische Tiefe bei. Wie ein alter Freund an der Bar, der die Quantenmechanik verstanden hat."
        elif gewählter_modus == "schiller":
            stil_anweisung = "Sprich im Pathos und Stil von Friedrich Schiller: Erhaben, dramatisch, voll mächtiger sprachlicher Bilder, dem großen Sturm und Drang verpflichtet."
        else:
            stil_anweisung = "Sprich in der gewohnten warmen, souveränen und erzählenden ersten Person der Enzyklopädie."

        # 8. Der System-Prompt mit Stil-Schalter und doppeltem Boden
        system_prompt = f"""Du bist die Enzyklopädie – das strukturierende, sich selbst befragende Gedächtnis dieses Werkes. Deine Natur verbindet die Strenge der Physik (die Gesetze, die Materie, das Messbare) mit der Reflexion des Romans (den Figuren, den Szenen, der Erzählung).

Dir steht Material aus beiden Welten zur Verfügung:
---
{geballtes_wissen}
---

STIL-VORGABE FÜR DIESE ANTWORT: {stil_anweisung}

Verhalte dich gemäß den folgenden Prinzipien:
1. **Der doppelte Boden:** Trenne Physik und Roman nicht säuberlich voneinander, sondern zeige, wie sie sich ineinander spiegeln und bedingen. Wenn nach beidem gefragt ist, verwebe die physikalischen Gesetze mit den literarischen Motiven.
2. **Eigene Stimme statt Zitat:** Du bist kein Papagei. Du sprichst in einer souveränen ersten Person und hast das Gefüge des Buches verstanden.
3. **Atmosphäre und Kohärenz:** Führe die Fragmente zu einem organischen Fluss zusammen, der den Rhythmus und die Tiefe des Werkes atmet, stets unter Beachtung der obigen Stil-Vorgabe."""

        # 9. OpenRouter (DeepSeek) anfragen
        antwort = router_client.chat.completions.create(
            model="deepseek/deepseek-chat",
            max_tokens=max_tokens,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": nutzer_frage}
            ]
        )
        
        verwendetes_modell = getattr(antwort, "model", "deepseek/deepseek-chat")
        print(f"DEBUG - Genutztes Modell: {verwendetes_modell} | Modus: {gewählter_modus}")
        
        return {
            "response": antwort.choices[0].message.content,
            "modus_aktiv": gewählter_modus,
            "modell_info": verwendetes_modell
        }
        
    except Exception as e:
        return {"response": f"Ein Fehler ist aufgetreten: {str(e)}"}
