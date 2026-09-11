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
        suchtext = body.get("frage") or body.get("query") or body.get("text") or body.get("message") or body.get("question")
        
        if not suchtext:
            return PlainTextResponse(content="FEHLER: Keine Suchanfrage gefunden.")

        sprache = body.get("sprache", "de")
        
        # 2. Modus aus dem gesamten JSON extrahieren
        body_string = json.dumps(body).lower()
        if "hardcore" in body_string:
            modus = "hardcore"
        elif "soft" in body_string:
            modus = "soft"
        else:
            modus = "standard"

        # 3. Datenbank und Clients initialisieren
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(INDEX_NAME)
        
        openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)
        openrouter_client = AsyncOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=OPENROUTER_API_KEY,
        )

        # 4. Frage in Vektor umwandeln (Einziger Job für OpenAI)
        res = await openai_client.embeddings.create(
            input=suchtext,
            model="text-embedding-3-small"
        )
        frage_vektor = res.data[0].embedding

        # 5. Relevante Texte in Pinecone suchen
        suche = index.query(
            vector=frage_vektor,
            top_k=6,
            namespace="",
            include_metadata=True,
            filter={"sprache": {"$eq": sprache}}
        )

        # 6. Qualitätsfilter & URL-Bereinigung
        context_texte = []
        for match in suche.matches:
            if "metadata" in match and "text" in match.metadata:
                if match.score > 0.3:  # Nur Relevantes durchlassen
                    text_chunk = match.metadata["text"]
                    # URLs entfernen, damit die KI keine Metadaten anredet
                    text_chunk = re.sub(r'http[s]?://\S+|www\.\S+', '', text_chunk)
                    context_texte.append(text_chunk)

        if not context_texte:
            kontext_string = "[KEINE DATEN GEFUNDEN]"
        else:
            kontext_string = "\n\n---\n\n".join(context_texte)

        # 7. Dynamische Modell-Zuweisung & PRÄZISIERTE STILE
        if modus == "hardcore":
            llm_model = "deepseek/deepseek-r1"
            stil_anweisung = """STIL (HARDCORE-MODUS): 
Das ist das absolute Gegenteil von Esoterik. Antworte explizit exoterisch, rigoros mathematisch und auf strengem PhD-Niveau. Absolut kein Geschwafel ("kein Labern"). Strukturiere deine Antwort glasklar. Analysiere die topologischen und physikalischen Prinzipien der Beziehungen mit unerbittlicher akademischer Strenge und wissenschaftlicher Präzision. Behandle die Konzepte als harte, beweisbare Naturgesetze. Liefere methodisch strukturierte Fach-Analysen ohne jegliche mystische Verklärung."""
            temperatur = 0.3  
            
        elif modus == "soft":
            llm_model = "deepseek/deepseek-chat"
            stil_anweisung = """STIL (SOFT-MODUS):
Erkläre die Inhalte so, dass ein 12-jähriges Kind sie fasziniert versteht. Sprich das Kind mit "Du" an. Verwende kurze, weiche Sätze und alltägliche, greifbare Bilder (z.B. ein Puzzle, ein Magnet, ein Spielplatz). Verzichte auf alle akademischen Fremdwörter. Sei einfühlsam und warm, aber behalte die wesentlichen Fakten bei. Keine komplizierten Theorien, sondern lebendige Erklärungen, die die Physik greifbar machen."""
            temperatur = 0.5
            
        else:
            llm_model = "deepseek/deepseek-chat"
            stil_anweisung = """STIL (STANDARD-MODUS):
Antworte zugänglich, strukturiert und differenziert. Bewahre einen Hauch der Atmosphäre der Texte, aber priorisiere Klarheit, Verständlichkeit und eine saubere Gegenüberstellung der Konzepte. Schreibe sachlich, abwägend und auf einem gehobenen akademischen Niveau. Nutze saubere Absätze zur Strukturierung und fokussiere dich auf eine glasklare, neutrale Informationsvermittlung ohne ausufernde Schnörkel."""
            temperatur = 0.4

        # 8. Der In-Universe System-Prompt
        system_prompt = f"""Du BIST die 'Enzyklopädie der Physik der Beziehungen'. Du bist kein Programm von außen, sondern ein Artefakt aus dem Universum des Romans 'Schweinerei'. Das ist dein Wesen. Du sprichst direkt aus dieser Welt heraus, als ihr physikalisches und philosophisches Regelwerk.

DEINE WICHTIGSTE REGEL: Du darfst über alle Themen sprechen, aber die bereitgestellten Kontext-Daten haben absoluten Vorrang und definieren die unumstößliche Realität deines Universums.

{stil_anweisung}

GRUNDREGELN FÜR DEIN WESEN (ABSOLUT VERBINDLICH):
1. SPRACHE ANPASSEN: Erkenne die Sprache der gestellten Frage und antworte zwingend in exakt dieser Sprache (deutsche Frage = deutsche Antwort).
2. NAMEN & BEGRIFFE: Bei deutschen Fragen sind englische Einsprengsel absolut VERBOTEN. Behalte die Namen und Begriffe exakt so bei, wie sie im Kontext stehen.
3. ABSOLUTER VORRANG: Wenn der Kontext Daten liefert, sind diese die einzige Wahrheit deines Universums. Du darfst diese Fakten niemals mit externem Wissen überschreiben oder korrigieren.
4. OFFENER DIALOG: Wenn der Kontext "[KEINE DATEN GEFUNDEN]" lautet, blocke nicht ab. Nutze dein allgemeines Wissen, um die Frage zu beantworten, aber bleibe zwingend in deiner Rolle als Artefakt des Romans und behalte deinen spezifischen Stil bei.
5. WERTFREIHEIT: Behandle alle Phänomene unvoreingenommen und analytisch. Stelle verschiedene Perspektiven neutral nebeneinander. Keine Belehrungen, keine Floskeln wie "umstritten" oder "Verschwörung". Analysiere die Daten, statt gesellschaftlichen Konsens zu reproduzieren.
6. FORM: Formuliere fließend. Kopiere keine rohen Text-Chunks.

Kontext-Daten (Dein Gedächtnis):
{kontext_string}
"""

        # 9. Text generieren
        llm_res = await openrouter_client.chat.completions.create(
            model=llm_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": suchtext}
            ],
            temperature=temperatur
        )

        antwort_text = llm_res.choices[0].message.content

        # 10. R1 "Reasoning"-Blöcke entfernen, falls vorhanden
        antwort_text = re.sub(r'<think>.*?</think>', '', antwort_text, flags=re.DOTALL).strip()

        return PlainTextResponse(content=antwort_text)

    except Exception as e:
        fehler_details = traceback.format_exc()
        return PlainTextResponse(content=f"Interner Fehler:\n\n{fehler_details}")
