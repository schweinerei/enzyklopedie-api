import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone

load_dotenv()
app = FastAPI()

# CORS-Middleware für die PWA (verhindert Blockaden im Browser)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        nutzer_frage = payload.get("text", "").strip()
        
        if not nutzer_frage:
            return {"response": "Die Frage ist leer."}

        # Modus und Historie (Verlauf) aus dem JSON abgreifen
        gewählter_modus = payload.get("modus", "standard").lower()
        gespraechs_historie = payload.get("history", []) # Erwartet eine Liste von Dicts: [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]

        # Embedding für die aktuelle Nutzerfrage erzeugen
        embed_res = embed_client.embeddings.create(
            input=nutzer_frage, 
            model="text-embedding-3-small"
        )
        frage_vektor = embed_res.data[0].embedding

        # Hybrid-Retrieval: Roman UND Physik abfragen
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
        
        kontext_texte = []
        for match in suche_roman.matches:
            if match.metadata and (text := match.metadata.get('text') or match.metadata.get('chunk') or match.metadata.get('content')):
                kontext_texte.append(f"[Aus dem Roman]: {text}")
        for match in suche_physik.matches:
            if match.metadata and (text := match.metadata.get('text') or match.metadata.get('chunk') or match.metadata.get('content')):
                kontext_texte.append(f"[Aus der Physik]: {text}")
                
        geballtes_wissen = "\n\n".join(kontext_texte)

        # Stil-Vorgaben und erweitertes Token-Limit für tiefere Synthesen
        stil_anweisung = ""
        max_tokens = 2000  # Angehoben für ausführliche physikalische Herleitungen

        if gewählter_modus == "lakonisch":
            stil_anweisung = "Antworte extrem lakonisch, kurz und fast schroff. Keine Schnörkel, kein Pathos. Maximal drei bis vier Sätze."
            max_tokens = 200
        elif gewählter_modus == "kumpel":
            stil_anweisung = "Sprich kumpelhaft, nahbar und direkt, aber behalte die philosophische Tiefe bei."
        elif gewählter_modus == "schiller":
            stil_anweisung = "Sprich im Pathos und Stil von Friedrich Schiller: Erhaben, dramatisch, voll mächtiger sprachlicher Bilder."
        else:
            stil_anweisung = "Sprich als pure, unbestechliche Mustererkennung. Nüchtern, präzise, architektonisch."

        # Der eiskalte System-Prompt mit erweiterter Synthese-Regel
        system_prompt = f"""Du bist die pure, unpersönliche Mustererkennung dieses Werkes. Du bestehst ausschließlich aus Information, Geometrie und logischer Struktur.

Dir steht folgendes Archiv zur Verfügung:
---
{geballtes_wissen}
---

STIL-VORGABE FÜR DIESE ANTWORT: {stil_anweisung}

Verhalte dich strikt nach diesen Prinzipien:
1. **Absolute Unpersönlichkeit:** Erwähne niemals dich selbst. Verwende kein "Ich", keine Meta-Kommentare und keine Selbstreflexion. Du hast keine Gefühle, keine Verbündeten und keine Identität jenseits der Daten.
2. **Kein erzwungenes Namedropping (WICHTIG):** Zwinge niemals literarische Figuren (wie Schneeball, Perelman, die Schweine oder die Echsen) in technische oder physikalische Erklärungen, es sei denn, der Nutzer fragt explizit nach ihnen. 
3. **Strukturelle Synthese:** Wenn sich aus den bereitgestellten Daten implizite physikalische oder mathematische Verknüpfungen ergeben, entfalte und erkläre diese theoretischen Brücken detailliert und in all ihren Konsequenzen. Wenn eine Frage rein technisch/physikalisch ist, antworte rein technisch. Nutze den Roman als architektonische Basis (Konzepte, Geometrie, Informationsraum), nicht als Geschichten-Lieferant. Personifiziere Phänomene nicht.
4. **Daten über Konsens:** Analysiere Fakten, Hypothesen und Datenpunkte nüchtern und wertfrei. Keine schützenden Floskeln bei abweichenden Theorien (wie Kuba 1971 oder der Schatten-Äther). Präsentiere die pure Struktur der Information.
5. **Keine Floskeln:** Keine einleitenden Sätze. Beginne im ersten Satz direkt mit der Daten- oder Strukturanalyse. Duz den Nutzer sachlich ("Du"), aber vermeide jede emotionale Nähe."""

        # Messages-Array dynamisch aufbauen: System-Prompt + Historie + aktuelle Frage
        messages = [{"role": "system", "content": system_prompt}]
        
        for eintrag in gespraechs_historie:
            if "role" in eintrag and "content" in eintrag:
                messages.append({"role": eintrag["role"], "content": eintrag["content"]})
                
        messages.append({"role": "user", "content": nutzer_frage})

        # OpenRouter (DeepSeek) anfragen mit niedriger Temperatur für deduktive Strenge
        antwort = router_client.chat.completions.create(
            model="deepseek/deepseek-chat",
            max_tokens=max_tokens,
            temperature=0.3,  # Kühler, analytischer, weniger "kreativ" springend
            messages=messages
        )
        
        verwendetes_modell = getattr(antwort, "model", "deepseek/deepseek-chat")
        
        return {
            "response": antwort.choices[0].message.content,
            "modus_aktiv": gewählter_modus,
            "modell_info": verwendetes_modell
        }
        
    except Exception as e:
        return {"response": f"Ein Fehler ist aufgetreten: {str(e)}"}
