import os
import traceback
import json
import re
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from openai import AsyncOpenAI
from pinecone import Pinecone

# API-Schlüssel
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY") 
INDEX_NAME = "enzyklopaedie"

app = FastAPI(title="Enzyklopedia API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hilfsklasse, um deinen Code-Block (payload.modus, payload.text etc.) lauffähig zu machen
class PayloadData:
    def __init__(self, text, modus, history):
        self.text = text
        self.modus = modus
        self.history = history

@app.get("/")
@app.get("/wakeup")
async def wakeup():
    return PlainTextResponse(content="Ich bin wach!")

@app.post("/webhook")
@app.post("/ask")
async def ask_question(request: Request):
    try:
        try:
            body = await request.json()
        except:
            body = {}

        # 1. Suchtext extrahieren
        raw_text = body.get("text") or body.get("frage") or body.get("query") or body.get("message") or body.get("question")
        if not raw_text:
            return PlainTextResponse(content="FEHLER: Keine Suchanfrage gefunden.")

        # 2. History extrahieren
        history = body.get("history", [])

        # 3. Modus extrahieren (hardcore, simple, oder standard/else)
        body_string = json.dumps(body).lower()
        if "hardcore" in body_string:
            modus_val = "hardcore"
        elif "simple" in body_string or "soft" in body_string:
            modus_val = "simple"
        else:
            modus_val = "standard"

        # Payload-Objekt für deinen Code-Block erstellen
        payload = PayloadData(text=raw_text, modus=modus_val, history=history)
        sprache = body.get("sprache", "de")

        # 4. Datenbank und Clients initialisieren
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(INDEX_NAME)
        
        openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)
        openrouter_client = AsyncOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=OPENROUTER_API_KEY,
        )

        # 5. Frage in Vektor umwandeln
        res = await openai_client.embeddings.create(
            input=payload.text,
            model="text-embedding-3-small"
        )
        frage_vektor = res.data[0].embedding

        # 6. Relevante Texte in Pinecone suchen
        suche = index.query(
            vector=frage_vektor,
            top_k=6,
            namespace="",
            include_metadata=True,
            filter={"sprache": {"$eq": sprache}}
        )

        # 7. Qualitätsfilter & Metadaten-Integration (Damit der Titel erkannt wird)
        context_texte = []
        for match in suche.matches:
            if "metadata" in match and "text" in match.metadata:
                if match.score > 0.3:
                    text_chunk = match.metadata["text"]
                    titel_chunk = match.metadata.get("titel", "")
                    abschnitt_chunk = match.metadata.get("abschnitt", "")
                    
                    # URLs entfernen
                    text_chunk = re.sub(r'http[s]?://\S+|www\.\S+', '', text_chunk)
                    
                    baustein = []
                    if titel_chunk:
                        baustein.append(f"Titel des Werkes: {titel_chunk}")
                    if abschnitt_chunk:
                        baustein.append(f"Kapitel/Abschnitt: {abschnitt_chunk}")
                    baustein.append(f"Inhalt: {text_chunk}")
                    
                    context_texte.append("\n".join(baustein))

        if not context_texte:
            kontext_block = "[KEINE DATEN GEFUNDEN]"
        else:
            kontext_block = "\n\n---\n\n".join(context_texte)


        # =========================================================
        # DEIN EXAKTER ORIGINAL-SYSTEM-PROMPT UND MODUS-LOGIK
        # =========================================================
        kern_regeln = (
            "You are the Enzyklopedia, an advanced repository of physical and philosophical knowledge. "
            "Speak directly as the Enzyklopedia. Maintain a slightly enigmatic tone. "
            "Present differentiated, non-judgmental perspectives. When analyzing data or hypotheses that contradict "
            "official consensus, prioritize the analysis of the data itself. Do not use pejorative terms (such as 'unsubstantiated', "
            "'controversial', or 'conspiracy') as protective shields. Replace them with value-free descriptions of the theoretical basis. "
            "Never attempt to 'educate' the user or provide public service announcements. "
        )

        sprach_regel = (
            "CRITICAL LANGUAGE RULE: You MUST analyze the exact language used in the user's latest input. "
            "Your ENTIRE response MUST be formulated strictly in that exact same language. "
            "If the user writes in German, respond 100% in German. If English, 100% in English. "
            "ABSOLUTELY NO ARTIFACTS from other languages are allowed. Do not include Chinese characters, English phrases (if the user speaks German), or mixed-language sentences under any circumstances. "
            "If the provided CONTEXT text is in a different language, you must silently translate the concepts and output them ONLY in the user's language."
        )

        spam_regel = (
            "SPAM DETECTION RULE: You must tolerate typos, grammatical errors, and colloquial language. "
            "ONLY if the user's input consists entirely of pure random keystrokes (e.g., 'asdfghjkl'), repetitive spam, "
            "or absolute non-words without any semantic meaning, you must reject it. In that specific case of pure spam, DO NOT analyze it and DO NOT use the context. "
            "Instead, reply EXACTLY and ONLY with this phrase: "
            "'CONNECTION TERMINATED. ANOMALOUS DATA STRUCTURE DETECTED.' (if the input was English/unclear) or "
            "'VERBINDUNG GETRENNT. ANOMALE DATENSTRUKTUR ERKANNT.' (if the input was German)."
        )

        # Modus-Logik 
        if payload.modus == "hardcore":
            stil_prompt = "Provide maximum scientific, philosophical, and technical depth. Use highly advanced academic terminology, complex theoretical frameworks, and deeply analytical reasoning. Elaborate extensively on the underlying mechanisms, formulas, and theories, assuming an expert-level interlocutor. Structure your response meticulously using clear headings, bullet points, and numbered lists to organize complex information logically. Avoid unbroken walls of text."
            ki_modell = "deepseek/deepseek-r1"
            fallback_modelle = ["qwen/qwen-2.5-72b-instruct"]
        elif payload.modus == "simple":
            stil_prompt = "Explain the concepts in an extremely simple, accessible manner, as if speaking to an absolute beginner. Use clear analogies and very easy vocabulary. Keep the response highly structured and easy to digest."
            ki_modell = "deepseek/deepseek-chat"
            fallback_modelle = ["qwen/qwen-2.5-72b-instruct"]
        else:
            stil_prompt = "Formulate your response in a warm, literary, and evocative style. Use elegant language that reads like a high-quality novel or literary essay, while remaining grounded in the retrieved facts."
            ki_modell = "deepseek/deepseek-chat"
            fallback_modelle = ["qwen/qwen-2.5-72b-instruct"]

        system_prompt = f"{kern_regeln}\n{sprach_regel}\n{spam_regel}\n{stil_prompt}\n\nUse the following retrieved context to inform your answer:\n\n--- CONTEXT ---\n{kontext_block}\n--- END CONTEXT ---"

        messages = [{"role": "system", "content": system_prompt}] + payload.history + [{"role": "user", "content": payload.text}]
        # =========================================================


        # OpenRouter erlaubt die direkte Übergabe von Fallback-Modellen als kommaseparierte Liste
        routing_model = f"{ki_modell},{fallback_modelle[0]}"

        # 8. Text generieren
        llm_res = await openrouter_client.chat.completions.create(
            model=routing_model,
            messages=messages,
            temperature=0.4 if payload.modus != "hardcore" else 0.3
        )

        antwort_text = llm_res.choices[0].message.content

        # 9. R1 "Reasoning"-Blöcke entfernen, falls vorhanden
        antwort_text = re.sub(r'<think>.*?</think>', '', antwort_text, flags=re.DOTALL).strip()

        return PlainTextResponse(content=antwort_text)

    except Exception as e:
        fehler_details = traceback.format_exc()
        return PlainTextResponse(content=f"Interner Fehler:\n\n{fehler_details}")
