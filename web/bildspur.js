// ===================================================================
// BILDSPUR — Bildfenster-Modul fuer PAB (Picturized Audio Book)
//
// Kein Framework, kein Build-Schritt. Haengt sich an ein bestehendes
// <audio>-Element (oder das globale `audioPlayer`-Objekt aus spieler.js)
// und rendert die Regiespur (regie.schema.json) synchron dazu.
//
// Oeffentliche API:
//   const bs = Bildspur.erstelle(audioElement, { container: '#bildspur-fenster' });
//   bs.ladeRegie('bildspur/traktat-de-k01.regie.json');   // spaeter: fetch-Endpunkt statt Datei
//   bs.setEnzyklopaedieModus('aktiv' | 'passiv');
//
// Events: das Modul feuert `bildspur:chat` auf `document` mit
//   { detail: { stichwort, satz, cueId } }, wenn ein chat-Cue im Modus
//   'aktiv' erreicht wird. Kein UI dafuer hier — die Enzyklopaedie-UI
//   hoert selbst darauf (siehe INTEGRATION.md).
//
// Blenden-Dramaturgie (Leitstand 21.09., Feld `blende`/`abblende` je Cue,
// Semantik in bildspur/regie-format.md): der Konverter traegt bereits
// einen Default je Typ ein, wenn das Feld in der .regie.md fehlt, hier
// wird nur noch das gelieferte Feld interpretiert.
// ===================================================================

(function (global) {
    'use strict';

    // Map: normalisierter Cue-Key (z.B. "cue02") -> Array von Label-Objekten {text, x, y}
    // Wird in ladeRegie() aus window.LABELS_INLINE oder labels_datei befuellt.
    let _labelsMap = {};

    // Schluessel fuer window.BILDSPUR_INLINE aus einem Regie-Dateinamen ableiten:
    // "bildspur/traktat-de-k01.regie.json" -> "traktat-de-k01".
    function _inlineSchluessel(quelle) {
        if (!quelle || typeof quelle !== 'string') return null;
        const m = /([^\/]+)\.regie\.json$/.exec(quelle);
        return m ? m[1] : null;
    }

    function _holeInlineEintrag(inlineKey) {
        if (!inlineKey || !global.BILDSPUR_INLINE) return null;
        return global.BILDSPUR_INLINE[inlineKey] || null;
    }

    function _istFileProtokoll() {
        return !!(global.location && global.location.protocol === 'file:');
    }

    function _ladeLabels(quelle, inlineKey) {
        if (global.LABELS_INLINE && typeof global.LABELS_INLINE === 'object') {
            return Promise.resolve(global.LABELS_INLINE);
        }
        const inline = _holeInlineEintrag(inlineKey);
        if (_istFileProtokoll()) {
            // fetch() ist unter file:// von Chrome/Brave blockiert (CORS) — direkt aus
            // BILDSPUR_INLINE bedienen statt einen aussichtslosen fetch zu versuchen.
            return Promise.resolve(inline && inline.labels ? inline.labels : null);
        }
        if (!quelle) return Promise.resolve(null);
        return fetch(quelle, { cache: 'no-store' })
            .then((r) => r.ok ? r.json() : null)
            .catch(() => (inline && inline.labels ? inline.labels : null));
    }

    function _normCueKey(id) {
        // "cue-2" -> "cue02", "cue-12" -> "cue12", "cue-7c" -> "cue07c" (Buchstaben-Suffix
        // bleibt erhalten — sonst gehen Labels fuer Serien-Cues wie cue-7c/cue-8c verloren,
        // JOB-46d-Befund). "cue-8b1"/"cue-8b2" -> "cue08b1"/"cue08b2": Suffix darf auf einen
        // Buchstaben zusaetzliche Ziffern haben, sonst wird die "1"/"2" verschluckt und
        // Cues wie 2b2/2b3/4b2/8b1/8b2 kollidieren auf denselben Labels-Schluessel (JOB-49e-Befund).
        const m = /cue-?(\d+)([a-z]\d*)?/i.exec(id);
        if (!m) return id;
        return 'cue' + m[1].padStart(2, '0') + (m[2] || '').toLowerCase();
    }

    function _baueLabelsMap(labelsData) {
        const map = {};
        if (!labelsData || !labelsData.cues) return map;
        for (const entry of labelsData.cues) {
            if (entry.labels && entry.labels.length) {
                map[entry.cue] = entry.labels;
            }
        }
        return map;
    }

    const RUHE_SVG = `
        <svg viewBox="0 0 100 100" class="bs-skizze-platzhalter" width="60%" height="60%">
            <rect x="5" y="5" width="90" height="90" fill="none" stroke="#333" stroke-width="1" stroke-dasharray="4 3"/>
            <text x="50" y="54" text-anchor="middle" fill="#333" font-size="8">ASSET FEHLT</text>
        </svg>`;

    const TIPP_ZEICHEN_PRO_SEKUNDE = 55; // Ricos Befund 22.09. ("so ist lahm"): zuegig, ca. 45-60 Zeichen/s

    // JOB-53a (Ricos Befund 22.09. 14:27, "schwarzblenden ... blitzt schwarz"): Standard-
    // Ueberblendung fuer 'hart'/'tippen'-Wechsel, damit kein Layer mehr schwarz aufblitzt.
    const STANDARD_UEBERGANG_S = 0.4;

    // JOB-53a (Ricos Befund "nach zehn sekunden wird alles langweilig"): maximale Standzeit
    // eines Cues, bevor die Buehne weich auf Schwarz abblendet. Pro Cue per Regie-Feld
    // `max_stand_s` ueberschreibbar.
    const MAX_STAND_S = 10;
    const SCHWARZ_AUS_S = 0.4;   // Regie `uebergang: "schwarz"`: altes Bild aus
    const SCHWARZ_PAUSE_S = 0.3; // ... dann so lange reines Schwarz
    const SPRUNG_S = 10;      // JOB-87: Transporttasten +/- Sekunden
    const BAR_AUS_MS = 3000;  // JOB-87: Vollbild-Bedienleiste blendet nach so langer Ruhe aus

    function parseDauerHinweis(dh) {
        if (!dh || dh === 'bleibt') return null;
        const m = /^(\d+(?:\.\d+)?)s$/.exec(dh);
        return m ? parseFloat(m[1]) : null;
    }

    // -----------------------------------------------------------------
    // Regie-Loader: heute ein fetch() auf eine statische JSON-Datei.
    // Kapselt den Zugriff, damit ein spaeterer Wechsel auf einen
    // Session-/Segment-Endpunkt (Backend liefert je Nutzer/Abschnitt
    // ein eigenes JSON statt einer statischen Datei) nur diese eine
    // Funktion betrifft, nicht den Rest des Moduls.
    // -----------------------------------------------------------------
    async function ladeRegieQuelle(quelle) {
        if (quelle && typeof quelle === 'object') return quelle; // Inline-Regie (Demo-Paket ueber file://)
        const inlineKey = _inlineSchluessel(quelle);
        const inline = _holeInlineEintrag(inlineKey);
        if (_istFileProtokoll()) {
            // fetch() auf lokale Dateien ist unter file:// von Chrome/Brave blockiert (CORS,
            // JOB-45b) — direkt aus BILDSPUR_INLINE bedienen, kein aussichtsloser fetch-Versuch.
            if (inline && inline.regie) return inline.regie;
            throw new Error(`Bildspur: keine Inline-Regie fuer ${quelle} unter file:// (BILDSPUR_INLINE fehlt)`);
        }
        try {
            const antwort = await fetch(quelle, { cache: 'no-store' });
            if (!antwort.ok) {
                throw new Error(`Bildspur: Regie-Quelle nicht ladbar (${antwort.status}) — ${quelle}`);
            }
            return await antwort.json();
        } catch (fehler) {
            // Echter Server, aber fetch schlug trotzdem fehl (z.B. Netzwerkfehler) — Inline-
            // Fallback nur nutzen, wenn vorhanden, sonst den urspruenglichen Fehler weiterreichen.
            if (inline && inline.regie) return inline.regie;
            throw fehler;
        }
    }

    function sortiereCues(cues) {
        return cues.slice().sort((a, b) => a.t_start - b.t_start);
    }

    // Binaere Suche: liefert Index des letzten Cues mit t_start <= t, oder -1.
    function findeCueIndex(cues, t) {
        let lo = 0, hi = cues.length - 1, ergebnis = -1;
        while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            if (cues[mid].t_start <= t) {
                ergebnis = mid;
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
        return ergebnis;
    }

    function findeAktivenSchritt(schritte, t) {
        let aktiv = null;
        for (const s of schritte) {
            if (s.t <= t) aktiv = s; else break;
        }
        return aktiv;
    }

    // Blende-String -> { typ: 'hart'|'weich'|'tippen', sekunden?, ueberblenden?, zeichenProSekunde? }
    function parseBlende(str) {
        if (!str) return { typ: 'hart' };
        const s = String(str).trim();
        if (s === 'hart') return { typ: 'hart' };
        if (s === 'tippen') return { typ: 'tippen' };
        // 'schnitt' (Rico 23.09. 10:10 "es blendet auch in die schrift, was mir nicht gefaellt"):
        // das alte Element verschwindet sofort, das neue blendet kurz aus Schwarz auf - KEINE
        // Kreuzblende, damit Bild und Schrift nie uebereinanderliegen.
        if (s === 'schnitt') return { typ: 'schnitt' };
        // 'tippen <zeichen/s>': optionale Tempo-Ueberschreibung je Cue (Vorgabe Leitstand JOB-49b).
        const mTipp = /^tippen\s+(\d+(?:\.\d+)?)$/.exec(s);
        if (mTipp) return { typ: 'tippen', zeichenProSekunde: parseFloat(mTipp[1]) };
        const m = /^weich\s+(\d+(?:\.\d+)?)(\s+ueberblenden)?$/.exec(s);
        if (m) return { typ: 'weich', sekunden: parseFloat(m[1]), ueberblenden: !!m[2] };
        return { typ: 'hart' };
    }

    class BildspurController {
        constructor(audioEl, opts) {
            this.audioEl = audioEl;
            this.opts = opts || {};
            this.regie = null;
            this.cues = [];
            this.enzyklopaedieModus = 'passiv';
            this.letzterCueIndex = -1;
            this.letzteSichtbarId = null; // Id des aktuell auf der Buehne gezeigten Cues (oder null=Ruhe)
            this.aktuelleCueObjekt = null; // Cue-Objekt der aktuell gezeigten Buehne, fuer abblende beim Ausblenden
            this.letzterChatIndex = -1; // getrennt, damit chat-Events nicht doppelt/verloren gehen
            this.letzterFormelSchritt = null;
            this.rafHandle = null;
            this._timeouts = [];
            this._tippenInterval = null;
            this._bildCache = new Map(); // asset-Pfad -> vorgeladenes Image()
            this._letzteZeit = null; // fuer Sprungerkennung beim Shuttle/Seek (JOB-51a)

            this._baueDom();
            this._bindeAudioEvents();
        }

        _baueDom() {
            const containerSel = this.opts.container || '#bildspur-fenster';
            let root = document.querySelector(containerSel);
            if (!root) {
                root = document.createElement('div');
                root.id = containerSel.replace(/^[#.]/, '');
                document.body.appendChild(root);
            }
            root.classList.add('bs-root-init');
            root.innerHTML = `
                <div class="bs-header">
                    <span>&gt;_ bildspur.sh</span>
                    <div class="bs-header-controls">
                        <button class="bs-maximize" type="button" aria-label="Bildfenster maximieren">&#9633;</button>
                        <button class="bs-toggle" type="button" aria-label="Bildfenster minimieren">–</button>
                    </div>
                </div>
                <div class="bs-kopf"></div>
                <div class="bs-buehne">
                    <svg class="bs-filter-defs" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute">
                    <defs>
                        <!-- JOB-103: Zeichnung deckend machen (Alpha aus Helligkeit, Farbe angehoben) + dunkler Saum; funktioniert unter file:// (kein Canvas/getImageData) -->
                        <filter id="bs-deckend" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
                            <feColorMatrix in="SourceGraphic" result="lin" type="matrix" values="2.4 0 0 0 0  0 2.4 0 0 0  0 0 2.4 0 0  5 5 5 0 0"/>
                            <feColorMatrix in="lin" result="sch" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/>
                            <feMorphology in="sch" operator="dilate" radius="1" result="dil"/>
                            <feGaussianBlur in="dil" stdDeviation="2.2" result="bl"/>
                            <feComponentTransfer in="bl" result="saum"><feFuncA type="linear" slope="3"/></feComponentTransfer>
                            <feMerge><feMergeNode in="saum"/><feMergeNode in="lin"/></feMerge>
                        </filter>
                    </defs>
                </svg>
                <canvas class="bs-shader" aria-hidden="true"></canvas>
                    <div class="bs-dunkel"></div>
                    <div class="bs-ruhe"></div>
                </div>
                <div class="bs-transport" role="group" aria-label="Wiedergabe">
                    <button type="button" class="bs-t-anfang" title="Zum Anfang (Pos1)" aria-label="Zum Kapitelanfang">|&#9664;</button>
                    <button type="button" class="bs-t-zurueck" title="10 s zur&uuml;ck (&larr;)" aria-label="10 Sekunden zur&uuml;ck">&minus;10</button>
                    <button type="button" class="bs-t-play" title="Wiedergabe / Pause (Leertaste)" aria-label="Wiedergabe">&#9654;</button>
                    <button type="button" class="bs-t-vor" title="10 s vor (&rarr;)" aria-label="10 Sekunden vor">+10</button>
                    <input type="range" class="bs-t-shuttle" min="0" max="1000" value="0" step="1" aria-label="Position im Kapitel" disabled>
                    <span class="bs-t-zeit">0:00 / 0:00</span>
                    <button type="button" class="bs-t-shader" title="Shader-Men&uuml;: dieselbe Steuerung wie im Fenster conf" aria-label="Shader-Men&uuml; ein- oder ausklappen" aria-expanded="false" hidden>SHADER &#9656;</button>
                    <button type="button" class="bs-t-vollbild" title="Vollbild (Esc beendet)" aria-label="Vollbild">&#9974;</button>
                    <div class="bs-shpanel" hidden></div>
                </div>
                <div class="bs-debug">
                    <span class="bs-debug-cue">cue: –</span>
                    <span class="bs-debug-blende">blende: –</span>
                    <span class="bs-debug-zeit">0:00</span>
                    <span class="bs-debug-naechster">naechster: –</span>
                </div>
                <div class="bs-chat-regler">
                    <span>enzyklopaedie:</span>
                    <button type="button" class="bs-passiv-btn bs-aktiv-btn" data-modus="passiv">PASSIV</button>
                    <button type="button" class="bs-aktiv-btn-toggle" data-modus="aktiv">AKTIV</button>
                </div>
            `;
            this.el = root;
            this.buehne = root.querySelector('.bs-buehne');
            this.kopf = root.querySelector('.bs-kopf');
            this.dunkel = root.querySelector('.bs-dunkel');
            this.debugCue = root.querySelector('.bs-debug-cue');
            this.debugBlende = root.querySelector('.bs-debug-blende');
            this.debugZeit = root.querySelector('.bs-debug-zeit');
            this.debugNaechster = root.querySelector('.bs-debug-naechster');

            root.querySelector('.bs-toggle').addEventListener('click', () => {
                this._beendeVollbild();
                root.classList.toggle('bs-minimiert');
                if (this._shPlan) this._shPlan();
            });
            root.querySelector('.bs-maximize').addEventListener('click', () => {
                root.classList.remove('bs-minimiert');
                this._toggleVollbild();
            });
            this._baueTransport(root);
            root.querySelectorAll('.bs-chat-regler button').forEach((btn) => {
                btn.addEventListener('click', () => this.setEnzyklopaedieModus(btn.dataset.modus));
            });
            this._aktualisiereReglerUI();
        }


        // ---------------------------------------------------------------
        // JOB-87: echtes Vollbild (Fullscreen API) + Transport/Shuttle.
        // Alle Spruenge laufen ueber audioEl.currentTime; das vorhandene
        // 'seeking'-Event bzw. die Sprungerkennung in _tick() holt den Cue.
        // ---------------------------------------------------------------
        _fsElement() {
            return document.fullscreenElement || document.webkitFullscreenElement || null;
        }

        _istVollbild() {
            return this.el.classList.contains('bs-vollbild');
        }

        _toggleVollbild() {
            if (this._istVollbild()) { this._beendeVollbild(); return; }
            const root = this.el;
            const anfordern = root.requestFullscreen || root.webkitRequestFullscreen;
            if (anfordern) {
                // Klassen setzt erst fullscreenchange (Zustand = was der Browser wirklich tut).
                let p;
                try { p = anfordern.call(root); } catch (e) { p = Promise.reject(e); }
                if (p && typeof p.catch === 'function') {
                    p.catch(() => this._setzeVollbildKlassen(true, false));
                }
            } else {
                // z.B. iPhone-Safari: kein Element-Vollbild -> Seiten-Vollbild per CSS.
                this._setzeVollbildKlassen(true, false);
            }
        }

        _beendeVollbild() {
            if (this._fsElement() === this.el) {
                const raus = document.exitFullscreen || document.webkitExitFullscreen;
                if (raus) { try { const p = raus.call(document); if (p && p.catch) p.catch(() => {}); } catch (e) { /* schon draussen */ } }
            }
            this._setzeVollbildKlassen(false, false);
        }

        _setzeVollbildKlassen(an, nativ) {
            const root = this.el;
            if (root.classList.contains('bs-vollbild') === an) { this._nativ = an && nativ; return; }
            root.classList.toggle('bs-vollbild', an);
            root.classList.toggle('bs-maximiert', an);
            root.classList.remove('bs-bar-aus');
            this._nativ = an && nativ;
            this._barTimerStop();
            if (an) this._barZeigen();
            const btn = root.querySelector('.bs-t-vollbild');
            btn.setAttribute('aria-label', an ? 'Vollbild beenden' : 'Vollbild');
            if (this._shUi) { this._shUi(); this._shPlan(); }
        }

        _onFullscreenChange() {
            const drin = this._fsElement() === this.el;
            if (drin) this._setzeVollbildKlassen(true, true);
            else if (this._nativ) this._setzeVollbildKlassen(false, false); // Esc / Browser-Ausstieg
        }

        _barZeigen() {
            if (!this._istVollbild()) return;
            if (this.el.classList.contains('bs-bar-aus')) this.el.classList.remove('bs-bar-aus');
            this._barTimerStop();
            this._barTimer = setTimeout(() => {
                this._barTimer = null;
                if (this._istVollbild() && !this._barGehalten && !this.el.classList.contains('bs-bar-aus')) {
                    this.el.classList.add('bs-bar-aus');
                }
            }, BAR_AUS_MS);
        }

        _barTimerStop() {
            if (this._barTimer) { clearTimeout(this._barTimer); this._barTimer = null; }
        }

        _springe(t) {
            const a = this.audioEl;
            if (!isFinite(a.duration)) return;
            a.currentTime = Math.max(0, Math.min(a.duration, t));
        }

        _toggleWiedergabe() {
            const a = this.audioEl;
            if (a.paused) { const p = a.play(); if (p && p.catch) p.catch(() => {}); }
            else a.pause();
        }

        // Shader hinter den Bildern: spiegelt das Shader-Canvas der Seite (#shader-bg, Quelle
        // bleibt der Seiten-Code) in die Buehne. Dort liegt es unter den Bildern, die per
        // mix-blend-mode "screen" darueberliegen (Schwarz wird durchlaessig). Laeuft nur, wenn
        // AN, Fenster sichtbar (nicht minimiert) und Tab nicht verborgen.
        _baueShader(root) {
            this._shBtn = root.querySelector('.bs-t-shader');
            this._shPanel = root.querySelector('.bs-shpanel');
            this._shCanvas = root.querySelector('.bs-shader');
            this._shCtx = this._shCanvas.getContext('2d');
            this._shLast = 0;
            this._shTimer = null;
            this._shRafH = null;
            this._shSync = null;
            let gespeichert = null;
            try { gespeichert = localStorage.getItem('bs_shader'); } catch (e) { /* Default */ }
            this._shAn = gespeichert !== '0';
            this._shInit = false;
            this._shbereit = () => {
                const api = global.bsShaderApi;
                if (this._shInit || !api) return;
                this._shInit = true;
                this._shBtn.hidden = false;
                this._baueShaderFeld(api);
                this._shBtn.addEventListener('click', () => this._shFeld(this._shPanel.hidden));
                // Seiten-Shader nur beim allerersten Besuch (nichts gespeichert) anwerfen; sonst gilt der gemerkte Zustand.
                let frisch = false;
                try { frisch = localStorage.getItem('active_shader') === null && localStorage.getItem('adv_mode') === null; } catch (e) { /* ignorieren */ }
                this._shSetze(this._shAn, !frisch);
            };
            this._shUi = () => {
                // JOB-118: Fenstermodus = transparent zum Desktop, Bilder/Texte wie im Shader-Look (Klasse bs-shader-an),
                // aber ohne eigenen Canvas; der Canvas (und Knopf/Feld) gilt nur im Vollbild (CSS .bs-vollbild.bs-shader-an).
                const voll = this._istVollbild();
                this.el.classList.toggle('bs-shader-an', !voll || !!(this._shAn && this._shInit));
                if (!voll && this._shPanel && !this._shPanel.hidden) this._shFeld(false);
                if (this._shPanel && !this._shPanel.hidden) this._shFeldAktualisieren();
            };
            document.addEventListener('visibilitychange', () => this._shPlan());
            this._shUi();
            this._shbereit();
            if (!this._shInit) {
                window.addEventListener('load', () => this._shbereit());
                setTimeout(() => this._shbereit(), 1500);
            }
        }

        // Shader-Menue-Feld (JOB-105): keine eigene Shader-Logik. Lesen ueber bsShaderApi.zustand(),
        // Schreiben ueber die Original-Regler/-Knoepfe der Seite (regler/klick) - dadurch identisch mit
        // dem Fenster "conf" und im selben localStorage gemerkt.
        _baueShaderFeld(api) {
            const P = this._shPanel;
            const reg = (klasse, sel, min, max, step, beschr) =>
                `<label class="bs-shr"><span>${beschr}</span><input type="range" class="${klasse}" data-sel="${sel}" min="${min}" max="${max}" step="${step}" aria-label="${beschr}"></label>`;
            let adv = '';
            [[1, 'SH 1: PLASMA'], [2, 'SH 2: GRID'], [3, 'SH 3: ASTRO'], [4, 'SH 4: SWINE']].forEach(([n, t]) => {
                adv += `<div class="bs-shblock"><div class="bs-shtitel">${t}</div><div class="bs-shzeile">`
                    + reg('bs-shi', `.adv-intensity[data-target='${n}']`, 0, 1.5, 0.05, 'INT')
                    + reg('bs-shi', `.adv-speed[data-target='${n}']`, 0, 5, 0.05, 'SPD')
                    + reg('bs-shi', `.adv-hue[data-target='${n}']`, 0, 1, 0.01, 'HUE') + '</div></div>';
            });
            P.innerHTML = `
                <div class="bs-shzeile bs-shkopf">
                    <button type="button" class="bs-shb bs-sh-imbild" title="Shader hinter den Bildern im Player zeigen (der Seitenhintergrund bleibt wie eingestellt)">IM PLAYER: AN</button>
                    <span class="bs-shhinweis">wirkt auch als Desktop-Hintergrund</span>
                </div>
                <div class="bs-shzeile bs-shmodus">
                    <button type="button" class="bs-shb" data-m="0">OFF</button>
                    <button type="button" class="bs-shb" data-m="1">SH 1</button>
                    <button type="button" class="bs-shb" data-m="2">SH 2</button>
                    <button type="button" class="bs-shb" data-m="3">SH 3</button>
                    <button type="button" class="bs-shb" data-m="4">SH 4</button>
                    <button type="button" class="bs-shb" data-m="adv">ADVANCED</button>
                </div>
                <div class="bs-shstd bs-shzeile">
                    ${reg('bs-shi', '#shader-brightness', 0, 1.5, 0.05, 'INTENSITY')}
                    ${reg('bs-shi', '#shader-speed', 0, 5, 0.05, 'SPEED')}
                </div>
                <div class="bs-shadv">
                    <div class="bs-shrow">
                        <div class="bs-shblocks">${adv}</div>
                        <div class="bs-shtrace">
                            <span class="bs-shtracelabel">TRACE</span>
                            <input type="range" class="bs-shi bs-shtraceinput" data-sel="#adv-trace" min="0" max="0.99" step="0.01" aria-label="TRACE" aria-orientation="vertical">
                            <output class="bs-shtraceval">0.00</output>
                        </div>
                    </div>
                    <div class="bs-shzeile bs-shauto">
                        <span>AUTO MODULATION</span>
                        <button type="button" class="bs-shb bs-sh-auto">OFF</button>
                        <button type="button" class="bs-shb bs-sh-am" data-a="standard">STANDARD</button>
                        <button type="button" class="bs-shb bs-sh-am" data-a="hardcore">HARDCORE</button>
                        <button type="button" class="bs-shb bs-sh-am" data-a="simple">SIMPLE</button>
                    </div>
                </div>`;
            P.querySelectorAll('.bs-shi').forEach((el) => {
                el.addEventListener('input', () => {
                    api.regler(el.dataset.sel, el.value);
                    if (el.dataset.sel === '#adv-trace') P.querySelector('.bs-shtraceval').textContent = (+el.value).toFixed(2);
                    this._shPlan();
                });
            });
            P.querySelectorAll('.bs-shmodus button').forEach((b) => b.addEventListener('click', () => {
                const z = api.zustand(), m = b.dataset.m;
                if (m === 'adv') { if (!z.adv) api.klick('#advanced-shader-btn'); }
                else {
                    if (z.adv) api.klick('#advanced-shader-btn');
                    api.klick('.shader-btn[data-shader="' + m + '"]');
                    if (m !== '0') try { localStorage.setItem('bs_letzter_shader', m); } catch (e) { /* ignorieren */ }
                }
                this._shFeldAktualisieren(); this._shPlan();
            }));
            P.querySelector('.bs-sh-imbild').addEventListener('click', () => this._shSetze(!this._shAn));
            P.querySelector('.bs-sh-auto').addEventListener('click', () => { api.klick('#adv-auto-toggle'); this._shFeldAktualisieren(); });
            P.querySelectorAll('.bs-sh-am').forEach((b) => b.addEventListener('click', () => {
                api.klick('.auto-btn[data-auto="' + b.dataset.a + '"]'); this._shFeldAktualisieren();
            }));
            // Bidirektional: Aenderungen im Fenster "conf" (Klick/Regler) spiegeln, solange das Feld offen ist.
            const spiegeln = (e) => { if (!P.hidden && !P.contains(e.target)) setTimeout(() => this._shFeldAktualisieren(), 0); };
            document.addEventListener('input', spiegeln, true);
            document.addEventListener('click', spiegeln, true);
        }

        _shFeld(auf) {
            this._shPanel.hidden = !auf;
            this._shBtn.setAttribute('aria-expanded', auf ? 'true' : 'false');
            this._shBtn.innerHTML = auf ? 'SHADER &#9662;' : 'SHADER &#9656;';
            this.el.classList.toggle('bs-shfeld-auf', auf);
            if (this._shSync) { clearInterval(this._shSync); this._shSync = null; }
            if (auf) {
                this._shFeldAktualisieren();
                this._shSync = setInterval(() => this._shFeldAktualisieren(), 500);
            }
        }

        _shFeldAktualisieren() {
            const api = global.bsShaderApi, P = this._shPanel;
            if (!api || !P || P.hidden) return;
            const z = api.zustand();
            const setze = (el, v) => { if (document.activeElement !== el && String(el.value) !== String(v)) el.value = v; };
            P.classList.toggle('bs-sh-advmodus', !!z.adv);
            P.querySelectorAll('.bs-shmodus button').forEach((b) => {
                const m = b.dataset.m;
                b.classList.toggle('bs-an', m === 'adv' ? !!z.adv : (!z.adv && String(z.aktiv) === m));
            });
            const bild = P.querySelector('.bs-sh-imbild');
            bild.textContent = this._shAn ? 'IM PLAYER: AN' : 'IM PLAYER: AUS';
            bild.classList.toggle('bs-an', this._shAn);
            P.querySelectorAll('.bs-shi').forEach((el) => {
                const sel = el.dataset.sel;
                let v;
                if (sel === '#shader-brightness') v = z.hell;
                else if (sel === '#shader-speed') v = z.tempo;
                else if (sel === '#adv-trace') v = z.trace;
                else {
                    const n = +sel.match(/data-target='(\d)'/)[1];
                    v = sel.indexOf('intensity') > 0 ? z.intens[n] : sel.indexOf('adv-speed') > 0 ? z.spd[n] : z.hue[n];
                }
                setze(el, v);
                if (sel === '#adv-trace') {
                    const out = P.querySelector('.bs-shtraceval');
                    if (out) out.textContent = (+v).toFixed(2);
                }
            });
            const aus = z.auto === 'off';
            const ab = P.querySelector('.bs-sh-auto');
            ab.textContent = aus ? 'OFF' : 'ON'; ab.classList.toggle('bs-an', !aus);
            P.querySelectorAll('.bs-sh-am').forEach((b) => {
                b.hidden = aus; b.classList.toggle('bs-an', b.dataset.a === z.auto);
            });
        }

        _shSetze(an, initial) {
            this._shAn = !!an;
            if (!initial) { try { localStorage.setItem('bs_shader', this._shAn ? '1' : '0'); } catch (e) { /* ignorieren */ } }
            if (this._shAn && !initial) global.bsShaderApi.sicherstellen();
            this._shUi();
            this._shPlan();
        }

        _shSoll() {
            return this._shAn && this._shInit && !document.hidden && this.buehne.clientWidth > 0
                && !this.el.classList.contains('bs-minimiert');
        }

        _shPlan() {
            if (this._shRafH) { cancelAnimationFrame(this._shRafH); this._shRafH = null; }
            if (this._shTimer) { clearTimeout(this._shTimer); this._shTimer = null; }
            if (!this._shAn || !this._shInit || !this._istVollbild()) return; // JOB-118: Fenstermodus = keine Schleife
            if (this._shSoll()) this._shRafH = requestAnimationFrame((n) => this._shFrame(n));
            else this._shTimer = setTimeout(() => this._shPlan(), 500);
        }

        _shFrame(now) {
            this._shRafH = null;
            if (!this._shSoll()) { this._shPlan(); return; }
            if (now - this._shLast >= 33) {
                this._shLast = now;
                const src = global.bsShaderApi.canvas();
                const cv = this._shCanvas;
                const w = Math.max(1, Math.floor(this.buehne.clientWidth * 0.6));
                const h = Math.max(1, Math.floor(this.buehne.clientHeight * 0.6));
                if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
                if (src && src.width > 1 && src.height > 1) {
                    const sk = Math.max(w / src.width, h / src.height);
                    const dw = src.width * sk, dh = src.height * sk;
                    this._shCtx.clearRect(0, 0, w, h);
                    this._shCtx.drawImage(src, (w - dw) / 2, (h - dh) / 2, dw, dh);
                }
            }
            this._shRafH = requestAnimationFrame((n) => this._shFrame(n));
        }

        _baueTransport(root) {
            const $ = (sel) => root.querySelector(sel);
            const a = this.audioEl;
            this._tZeit = $('.bs-t-zeit');
            this._tShuttle = $('.bs-t-shuttle');
            this._tPlay = $('.bs-t-play');
            this._tZeitText = null;   // zuletzt geschriebene Werte: DOM nur bei Aenderung anfassen
            this._tShuttleWert = null;
            this._tPlayZustand = null;
            this._tAktiv = null;
            this._ziehen = false;
            this._nativ = false;
            this._barGehalten = false;

            $('.bs-t-anfang').addEventListener('click', () => this._springe(0));
            $('.bs-t-zurueck').addEventListener('click', () => this._springe((a.currentTime || 0) - SPRUNG_S));
            $('.bs-t-vor').addEventListener('click', () => this._springe((a.currentTime || 0) + SPRUNG_S));
            this._tPlay.addEventListener('click', () => this._toggleWiedergabe());
            $('.bs-t-vollbild').addEventListener('click', () => this._toggleVollbild());

            // Shuttle: Ziehen/Klicken springt live (input), Anzeige folgt dem Finger, nicht dem Ton.
            const sh = this._tShuttle;
            sh.addEventListener('pointerdown', () => { this._ziehen = true; });
            const ende = () => { this._ziehen = false; };
            sh.addEventListener('pointerup', ende);
            sh.addEventListener('pointercancel', ende);
            sh.addEventListener('change', ende);
            sh.addEventListener('input', () => {
                if (!isFinite(a.duration)) return;
                this._springe((sh.value / 1000) * a.duration);
                this._aktualisiereTransport();
            });

            a.addEventListener('timeupdate', () => this._aktualisiereTransport());
            ['play', 'pause', 'ended', 'loadedmetadata', 'durationchange', 'emptied', 'seeked']
                .forEach((ev) => a.addEventListener(ev, () => this._aktualisiereTransport()));

            // Vollbild-Bar: einblenden bei Bewegung/Tippen/Taste, ausblenden nach BAR_AUS_MS.
            ['pointermove', 'pointerdown', 'touchstart'].forEach((ev) =>
                root.addEventListener(ev, () => this._barZeigen(), { passive: true }));
            const bar = $('.bs-transport');
            bar.addEventListener('pointerenter', () => { this._barGehalten = true; });
            bar.addEventListener('pointerleave', () => { this._barGehalten = false; this._barZeigen(); });

            this._baueShader(root);
            document.addEventListener('fullscreenchange', () => this._onFullscreenChange());
            document.addEventListener('webkitfullscreenchange', () => this._onFullscreenChange());
            document.addEventListener('keydown', (e) => this._onTaste(e));
            this._aktualisiereTransport();
        }

        _onTaste(e) {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            const ziel = e.target;
            const imFenster = this.el.contains(ziel);
            if (ziel && ziel.closest && ziel.closest('.bs-shpanel')) return; // Shader-Feld: eigene Regler
            if (!this._istVollbild() && !imFenster) return;
            const tag = ziel && ziel.tagName;
            if (tag === 'TEXTAREA' || tag === 'SELECT' || (ziel && ziel.isContentEditable)) return;
            if (tag === 'INPUT' && ziel.type !== 'range') return;
            const a = this.audioEl;
            const leer = e.key === ' ' || e.key === 'Spacebar';
            if (tag === 'BUTTON' && (leer || e.key === 'Enter')) return; // Button bleibt per Tastatur bedienbar
            if (leer) this._toggleWiedergabe();
            else if (e.key === 'ArrowLeft') this._springe((a.currentTime || 0) - SPRUNG_S);
            else if (e.key === 'ArrowRight') this._springe((a.currentTime || 0) + SPRUNG_S);
            else if (e.key === 'Home') this._springe(0);
            else { this._barZeigen(); return; }
            e.preventDefault();
            this._barZeigen();
        }

        // Schreibt nur, was sich gegenueber dem letzten Stand wirklich geaendert hat.
        _aktualisiereTransport() {
            const a = this.audioEl;
            const dauer = a.duration;
            const hatDauer = isFinite(dauer) && dauer > 0;
            const t = a.currentTime || 0;
            const fmt = (x) => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`;
            const text = hatDauer ? `${fmt(t)} / ${fmt(dauer)}` : (a.src ? 'LIVE' : '0:00 / 0:00');
            if (text !== this._tZeitText) { this._tZeitText = text; this._tZeit.textContent = text; }
            const wert = hatDauer ? Math.round((t / dauer) * 1000) : 0;
            if (!this._ziehen && wert !== this._tShuttleWert) { this._tShuttleWert = wert; this._tShuttle.value = wert; }
            if (hatDauer !== this._tAktiv) { this._tAktiv = hatDauer; this._tShuttle.disabled = !hatDauer; }
            const zustand = a.paused ? 'pause' : 'play';
            if (zustand !== this._tPlayZustand) {
                this._tPlayZustand = zustand;
                this._tPlay.innerHTML = a.paused ? '&#9654;' : '&#10074;&#10074;';
                this._tPlay.setAttribute('aria-label', a.paused ? 'Wiedergabe' : 'Pause');
            }
        }

        _aktualisiereReglerUI() {
            this.el.querySelectorAll('.bs-chat-regler button').forEach((btn) => {
                btn.classList.toggle('bs-aktiv-btn', btn.dataset.modus === this.enzyklopaedieModus);
            });
        }

        setEnzyklopaedieModus(modus) {
            this.enzyklopaedieModus = modus === 'aktiv' ? 'aktiv' : 'passiv';
            this._aktualisiereReglerUI();
        }

        // headerFallback: Text fuer die persistente Kopfzeile im Bildfeld, falls die Regie
        // selbst kein Feld `header` mitbringt (z.B. Stuecktitel aus audioDateien[...].titel).
        async ladeRegie(quelle, headerFallback) {
            const inlineKey = _inlineSchluessel(quelle);
            const regie = await ladeRegieQuelle(quelle);
            this.regie = regie;
            this.cues = sortiereCues(regie.cues || []);
            this._markiereUebersprungeneCues(this.cues);
            this.letzterCueIndex = -1;
            this.letzteSichtbarId = null;
            this.aktuelleCueObjekt = null;
            this.letzterChatIndex = -1;
            this.letzterFormelSchritt = null;
            this._raeumeUebergaenge();
            this._preloadAssets(this.cues); // Promise-Sammlung laeuft im Hintergrund, Cue-Wechsel wartet nicht
            const headerText = (regie.header && typeof regie.header === 'object') ? (regie.header.text || '') : (regie.header || headerFallback || '');
            this._aktualisiereKopf(headerText);
            // Labels laden (inline oder per labels_datei)
            const labelsData = await _ladeLabels(regie.labels_datei || null, inlineKey);
            _labelsMap = _baueLabelsMap(labelsData);
            this._zeigeRuhe();
            return regie;
        }

        // Persistente Kopfzeile: bleibt ueber alle Cues/Blenden stehen (Ricos Befund 22:55),
        // liegt daher direkt im Bildfeld, nicht im .bs-element-Layer (der pro Cue ausgetauscht wird).
        _aktualisiereKopf(text) {
            this.kopf.textContent = text || '';
            this.kopf.classList.toggle('bs-kopf-leer', !text);
        }

        _bindeAudioEvents() {
            this.audioEl.addEventListener('timeupdate', () => this._tick());
            this.audioEl.addEventListener('play', () => this._starteRaf());
            this.audioEl.addEventListener('pause', () => this._stoppeRaf());
            this.audioEl.addEventListener('ended', () => this._stoppeRaf());
            this.audioEl.addEventListener('seeking', () => {
                // Bei Seek (vor/zurueck) sofort neu bewerten statt auf naechsten timeupdate/raf-Tick warten.
                this._tick(true);
            });
        }

        _starteRaf() {
            if (this.rafHandle) return;
            const loop = () => {
                this._tick();
                this.rafHandle = requestAnimationFrame(loop);
            };
            this.rafHandle = requestAnimationFrame(loop);
        }

        _stoppeRaf() {
            if (this.rafHandle) {
                cancelAnimationFrame(this.rafHandle);
                this.rafHandle = null;
            }
        }

        _schwarzModus() {
            return !!(this.regie && this.regie.uebergang === 'schwarz');
        }

        _reducedMotion() {
            return !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
        }

        _timeout(fn, ms) {
            const id = setTimeout(fn, ms);
            this._timeouts.push(id);
            return id;
        }

        _raeumeUebergaenge() {
            if (this._tippenInterval) {
                clearInterval(this._tippenInterval);
                this._tippenInterval = null;
            }
            this._timeouts.forEach((id) => clearTimeout(id));
            this._timeouts = [];
        }

        _tick(erzwungenDurchSeek) {
            if (!this.cues.length) return;
            const t = this.audioEl.currentTime || 0;
            // Sprungerkennung (JOB-51a, Ricos Befund "beim shutteln werden Bilder nicht gezeigt"):
            // ein currentTime-Sprung > 1s (Scrubben/Shuttle, auch ohne natives 'seeking'-Event)
            // zeigt das Bild sofort voll, ohne Blende.
            const vorherigeZeit = this._letzteZeit == null ? t : this._letzteZeit;
            const grosserSprung = Math.abs(t - vorherigeZeit) > 1;
            this._letzteZeit = t;
            const idx = findeCueIndex(this.cues, t);
            const sichtbar = this._aktuelleSichtbareCue(idx, t);
            // JOB-53a: Standzeit-Phase ('normal'/'ausblenden'/'schwarz') fliesst in den
            // Vergleichsschluessel ein — sonst wuerde der spaetere Phasenwechsel innerhalb
            // desselben Cues (Standzeit > MAX_STAND_S) nie erkannt, weil sichtbar.id gleich bleibt.
            const phase = sichtbar ? this._standPhase(sichtbar, t) : null;
            const schluessel = sichtbar ? (sichtbar.id + (phase !== 'normal' ? ':' + phase : '')) : null;
            const sofort = !!erzwungenDurchSeek || grosserSprung;

            if (schluessel !== this.letzteSichtbarId || sofort) {
                this._wechsleZuPhase(sichtbar, phase, sofort);
                this.letzteSichtbarId = schluessel;
            } else if (sichtbar && phase === 'normal') {
                this._aktualisiereSchritt(sichtbar, t);
            }
            if (idx !== this.letzterCueIndex) this._vorbauen(idx);
            this.letzterCueIndex = idx;
            this._aktualisiereDebug(idx, sichtbar, t);
            this._pruefeChat(idx);
        }

        // JOB-53a: liefert die Standzeit-Phase eines gerade sichtbaren Cues. 'normal' solange
        // die Standzeit bis zum naechsten sichtbaren Cue (oder Audioende) im ueblichen Rahmen
        // liegt (<= maxStand + 1.5s, sonst wuerde die neue Schwarzphase mit der normalen
        // Ueberblendung des naechsten Cues kollidieren). Sonst: 'ausblenden' waehrend der
        // 1.0s-Abblende nach maxStand Sekunden, danach 'schwarz' bis zum naechsten Cue.
        _standPhase(cue, t) {
            const maxStand = (typeof cue.max_stand_s === 'number' && cue.max_stand_s > 0) ? cue.max_stand_s : MAX_STAND_S;
            const idx = this.cues.findIndex((c) => c.id === cue.id);
            const naechster = idx >= 0 ? this._naechsterSichtbarerCue(this.cues, idx) : null;
            let naechsterStart;
            if (naechster) {
                naechsterStart = naechster.t_start;
            } else {
                const dauer = this.audioEl.duration;
                naechsterStart = isFinite(dauer) ? dauer : Infinity;
            }
            const standzeit = naechsterStart - cue.t_start;
            if (standzeit <= maxStand + 1.5) return 'normal';
            const schwarzStart = cue.t_start + maxStand;
            const schwarzVoll = schwarzStart + 1.0;
            if (t < schwarzStart) return 'normal';
            if (t < schwarzVoll) return 'ausblenden';
            return 'schwarz';
        }

        // Dispatcht auf den regulaeren Cue-Wechsel oder auf die JOB-53a-Standzeit-Phasen.
        _wechsleZuPhase(cue, phase, sofort) {
            if (phase === 'ausblenden') {
                this._starteAutoAbblende(sofort);
                return;
            }
            if (phase === 'schwarz') {
                this._zeigeAutoSchwarz();
                return;
            }
            this._wechsleZu(cue, sofort);
        }

        // JOB-53a: weiche 1.0s-Abblende des stehenden Bilds/Elements auf Schwarz. Ohne
        // vorhandenes Element, bei hartem Sprung (Seek in die Ausblendphase) oder reduced-
        // motion springt die Buehne direkt in die Schwarzphase statt auszublenden.
        _starteAutoAbblende(sofort) {
            this._raeumeUebergaenge();
            const altesEl = this._obersteEbene();
            if (!altesEl || sofort || this._reducedMotion()) {
                this._zeigeAutoSchwarz();
                return;
            }
            altesEl.style.transitionDuration = '1s';
            altesEl.classList.remove('bs-sichtbar');
            this._timeout(() => {
                altesEl.remove();
                this._zeigeRuhe();
            }, 1020);
        }

        // JOB-53a: Buehne schwarz (nur #000, kein Text/Platzhalter) — Sprungziele innerhalb
        // der Schwarzphase landen direkt hier, ohne das alte Bild zu zeigen.
        _zeigeAutoSchwarz() {
            this._raeumeUebergaenge();
            this._zeigeRuhe();
        }

        // JOB-51a: Cues, deren Standzeit bis zum naechsten Cue unter 1.2s liegt, wuerden nie
        // sichtbar ausblenden koennen (Blende laenger als Standzeit -> Flackern/leerer Eindruck).
        // Solche Cues werden markiert und beim Rendern uebersprungen, nicht geloescht.
        _markiereUebersprungeneCues(cues) {
            for (let i = 0; i < cues.length; i++) {
                const cue = cues[i];
                if (cue.typ === 'chat') {
                    // chat-Cues rendern nie (nur Event-Marker) — Standzeit-Pruefung entfaellt.
                    cue._uebersprungen = false;
                    continue;
                }
                const naechster = this._naechsterSichtbarerCue(cues, i);
                if (!naechster) {
                    cue._uebersprungen = false;
                    continue;
                }
                const standzeit = naechster.t_start - cue.t_start;
                cue._uebersprungen = standzeit < 1.2;
                if (cue._uebersprungen) {
                    console.info(`Bildspur: Cue ${cue.id} uebersprungen (Standzeit ${standzeit.toFixed(2)}s < 1.2s)`);
                }
            }
        }

        // Naechster Cue ab Index i (exklusiv), der eine sichtbare Buehne stellen kann — chat-Cues
        // (reine Event-Marker, oft mit identischem t_start wie der vorhergehende Sicht-Cue) werden
        // uebersprungen, sonst wuerde z.B. cue-4/cue-4b (gleicher t_start) cue-4 faelschlich als
        // "Standzeit 0" markieren bzw. dessen Blende auf die Untergrenze zwingen.
        _naechsterSichtbarerCue(cues, i) {
            for (let j = i + 1; j < cues.length; j++) {
                if (cues[j].typ !== 'chat') return cues[j];
            }
            return null;
        }

        _pruefeChat(idx) {
            if (idx < 0 || idx === this.letzterChatIndex) return;
            const cue = this.cues[idx];
            if (cue.typ === 'chat') {
                this.letzterChatIndex = idx;
                if (this.enzyklopaedieModus === 'aktiv') {
                    document.dispatchEvent(new CustomEvent('bildspur:chat', {
                        detail: {
                            cueId: cue.id,
                            stichwort: (cue.inhalt || '').split('—')[0].replace(/Stichwort\s*/i, '').trim(),
                            satz: cue.inhalt,
                        },
                    }));
                }
            } else {
                this.letzterChatIndex = idx;
            }
        }

        // Laedt alle skizze-Assets einer Regie im Hintergrund vor (Browser-HTTP-Cache), damit
        // das spaeter gerenderte <img> beim Cue-Wechsel meist schon bereit ist. Blockiert nichts
        // (JOB-50b, Ricos Befund "fehlende assets"): der zurueckgegebene Promise wird nirgends
        // abgewartet, nur fuer Debug-Zwecke gehalten.
        _preloadAssets(cues) {
            const promises = [];
            for (const cue of cues) {
                if (cue.typ !== 'skizze' || !cue.asset || this._bildCache.has(cue.asset)) continue;
                const img = new Image();
                const fertig = new Promise((resolve) => {
                    img.addEventListener('load', () => resolve(true), { once: true });
                    img.addEventListener('error', () => {
                        img._bsFehlt = true;
                        if (!this._schwarzModus()) console.error(`Bildspur: Asset nicht ladbar (Preload, ${cue.id}): ${cue.asset}`);
                        resolve(false);
                    }, { once: true });
                });
                img.src = cue.asset;
                this._bildCache.set(cue.asset, img);
                promises.push(fertig);
            }
            this._preloadFertig = Promise.all(promises);
        }

        // Ruft weiter() sofort auf, wenn el kein Bild hat oder das Bild schon geladen ist,
        // sonst erst nach load/error des Bildes. Verhindert einen leeren (aber schon
        // "sichtbaren") Layer — die Buehne bleibt bis dahin schwarz (JOB-50b).
        _wartefallsBild(el, weiter) {
            const img = el._bsBild;
            if (!img || (img.complete && img.naturalWidth > 0)) {
                weiter();
                return;
            }
            const fertig = () => weiter();
            img.addEventListener('load', fertig, { once: true });
            img.addEventListener('error', fertig, { once: true });
        }

        _aktuelleSichtbareCue(idx, t) {
            // Cue mit fester dauer_hinweis kann bereits abgelaufen sein -> Ruhezustand,
            // ausser der naechste Cue hat noch nicht begonnen (dann bleibt das letzte
            // "bleibt"-Element stehen, s. Regie-Format: Stille ist erlaubt).
            if (idx < 0) return null;
            const cue = this.cues[idx];
            if (cue.typ === 'chat' || cue._uebersprungen) {
                // Kein visuelles Element (chat) bzw. Standzeit zu knapp fuer eine Blende
                // (_uebersprungen, JOB-51a): die Buehne zeigt weiterhin den letzten gueltigen Cue.
                for (let i = idx - 1; i >= 0; i--) {
                    if (this.cues[i].typ !== 'chat' && !this.cues[i]._uebersprungen) return this._aktuelleSichtbareCue(i, t);
                }
                return null;
            }
            const feste = parseDauerHinweis(cue.dauer_hinweis);
            if (feste == null) return cue; // bleibt bis naechster Cue
            const naechster = this.cues[idx + 1];
            const endeZeit = cue.t_start + feste;
            if (t < endeZeit) return cue;
            // abgelaufen: wenn noch kein neuer Cue begonnen hat, faellt Fenster in Ruhe zurueck
            if (naechster && t >= naechster.t_start) return this._aktuelleSichtbareCue(idx + 1, t);
            return null;
        }

        _wechsleZu(neueCue, sofort) {
            this._raeumeUebergaenge();
            const altesEl = this._obersteEbene();
            const alteCue = this.aktuelleCueObjekt;
            const reduziert = this._reducedMotion();
            this.letzterFormelSchritt = null;

            if (!neueCue) {
                this.aktuelleCueObjekt = null;
                if (sofort || reduziert || !altesEl) {
                    this._zeigeRuhe();
                } else {
                    this._blendeAusUndZeigeRuhe(altesEl, parseBlende(alteCue && alteCue.abblende));
                }
                return;
            }

            this.aktuelleCueObjekt = neueCue;
            const ruheEl = this.buehne.querySelector('.bs-ruhe');
            if (ruheEl) ruheEl.remove();

            // JOB-88: Formel-Cues werden vorab (waehrend der Standzeit des Vorgaengers) gebaut,
            // damit der KaTeX-Render nicht mit einer laufenden Blende um den Frame konkurriert.
            const vorgebaut = this._vorgebaut;
            this._vorgebaut = null;
            const neuesEl = (!sofort && vorgebaut && vorgebaut.id === neueCue.id)
                ? vorgebaut.el
                : this._baueElement(neueCue, this.audioEl.currentTime || 0);
            let blende = (sofort || reduziert) ? { typ: 'hart' } : parseBlende(neueCue.blende);

            // JOB-53a (kein Schwarzblitz mehr): jeder reguläre Wechsel überblendet, auch
            // 'hart'/'tippen' bekommen dafür eine kurze Standard-Dauer statt eines Sofort-
            // Wechsels. 'weich' behält seine Regie-Dauer. Beides bleibt an JOB-51a gebunden
            // (nie laenger als die halbe Standzeit). Seek/Shuttle (sofort) bleibt hart/sofort.
            if (!sofort && !reduziert) {
                const basisSekunden = blende.typ === 'weich' ? blende.sekunden : STANDARD_UEBERGANG_S;
                blende = Object.assign({}, blende, { sekunden: this._effektiveDauer(neueCue, basisSekunden) });
            }

            // Bildbruch-Dunkelmoment nur noch bei echten Sofort-Wechseln (Seek/Shuttle) —
            // bei regulaeren Wechseln wuerde der Flash selbst wieder wie ein Schwarzblitz wirken.
            if (neueCue.typ === 'ueberschrift' && sofort) {
                this.dunkel.classList.add('bs-aktiv');
                this._timeout(() => this.dunkel.classList.remove('bs-aktiv'), 220);
            }

            if (!sofort && !reduziert && altesEl) {
                this._kreuzblende(neuesEl, neueCue, blende);
                return;
            }

            // Sofort/reduced-motion oder keine alte Buehne (z.B. aus der JOB-53a-Schwarzphase
            // heraus): kein Kreuzblende-Partner vorhanden, das neue Element blendet direkt aus
            // Schwarz auf (nicht instant, ausser bei sofort/reduziert — sonst wuerde der
            // Uebergang aus der Schwarzphase wieder hart aufpoppen statt weich aufzublenden).
            // Die Buehne hat #000-Hintergrund, bleibt also schwarz, bis das Bild bereit ist
            // (_wartefallsBild), statt kurz einen leeren Layer zu zeigen (JOB-50b).
            this.buehne.querySelectorAll('.bs-element').forEach((n) => n.remove());
            this.buehne.appendChild(neuesEl);
            this._positioniereLabels(neuesEl);
            this._starteTippenFallsNoetig(neuesEl, neueCue, blende, sofort);

            this._wartefallsBild(neuesEl, () => {
                if (sofort || reduziert) {
                    neuesEl.style.transitionDuration = '0s';
                    neuesEl.classList.add('bs-sichtbar');
                } else {
                    this._fade(neuesEl, blende.sekunden, true);
                }
            });
        }

        // JOB-88 (Ricos Befund "holprige Ueberblendungen, wo viel los ist"): zentrale Regeln fuer
        // Ueberblendungen. (1) Nie mehr als 2 Ebenen gleichzeitig: laeuft noch eine Blende, wartet
        // die naechste, bis sie durch ist; tiefere Ebenen werden erst entfernt, wenn die obere
        // voll deckt (eigener Timer, der von _raeumeUebergaenge nicht abgeraeumt wird).
        // (2) Bild zu Bild kreuzblenden; ist Text/Formel (ohne Bild) beteiligt, blendet erst das Alte
        // aus und dann das Neue ein, statt Schrift und Bild uebereinander zu legen. (3) Ein Kurvenverlauf
        // fuer alle Blenden (CSS), keine Opazitaetsspruenge.
        _obersteEbene() {
            const liste = this.buehne.querySelectorAll('.bs-element');
            return liste.length ? liste[liste.length - 1] : null;
        }

        _deckkraft(el) {
            return parseFloat(getComputedStyle(el).opacity) || 0;
        }

        _restBlendeMs() {
            const jetzt = performance.now();
            let rest = 0;
            this.buehne.querySelectorAll('.bs-element').forEach((e) => {
                if (e._bsFadeEnde) rest = Math.max(rest, e._bsFadeEnde - jetzt);
            });
            return rest;
        }

        _fade(el, sekunden, sichtbar) {
            el.style.transitionDuration = sekunden + 's';
            void el.offsetWidth; // Startzustand festschreiben, sonst springt ein frisch eingehaengtes Element
            el._bsFadeEnde = performance.now() + sekunden * 1000 + 20;
            requestAnimationFrame(() => el.classList.toggle('bs-sichtbar', sichtbar));
        }

        _entferneSobaldVerdeckt(el) {
            const pruefe = () => {
                if (!el.isConnected) return;
                const oben = this._obersteEbene();
                if (oben === el) return;
                if (this._deckkraft(oben) >= 0.99) el.remove();
                else setTimeout(pruefe, 60);
            };
            setTimeout(pruefe, (el._bsAbloeseMs || 0) + 20);
        }

        _kreuzblende(neuesEl, neueCue, blende) {
            const los = () => {
                const alle = Array.from(this.buehne.querySelectorAll('.bs-element'));
                const alt = alle.pop();
                alle.forEach((e) => e.remove());
                const einhaengen = () => {
                    neuesEl.style.zIndex = '2';
                    this.buehne.appendChild(neuesEl);
                    this._positioniereLabels(neuesEl);
                    this._starteTippenFallsNoetig(neuesEl, neueCue, blende, false);
                };
                if (!alt || this._deckkraft(alt) < 0.02) {
                    if (alt) alt.remove();
                    einhaengen();
                    this._wartefallsBild(neuesEl, () => this._fade(neuesEl, blende.sekunden, true));
                    return;
                }
                if (this._schwarzModus()) {
                    // Regie-Feld `uebergang: "schwarz"` (Kap. 2): Bild aus (~0.4 s), Schwarz (~0.3 s),
                    // naechstes ein - nie Direkt-Ueberblendung (Bildgeometrien nicht pixelgleich).
                    this._fade(alt, SCHWARZ_AUS_S, false);
                    this._timeout(() => {
                        alt.remove();
                        this._timeout(() => {
                            einhaengen();
                            this._wartefallsBild(neuesEl, () => this._fade(neuesEl, blende.sekunden, true));
                        }, SCHWARZ_PAUSE_S * 1000);
                    }, SCHWARZ_AUS_S * 1000 + 30);
                    return;
                }
                if (!neuesEl._bsBild || !alt._bsBild) {
                    // Text/Formel beteiligt: erst aus, dann ein (je mind. 0.4s, sonst zu steile Kurve)
                    const aus = Math.max(0.4, blende.sekunden * 0.4);
                    const ein = Math.max(0.4, blende.sekunden * 0.6);
                    this._fade(alt, aus, false);
                    this._timeout(() => {
                        alt.remove();
                        einhaengen();
                        this._fade(neuesEl, ein, true);
                    }, aus * 1000 + 30);
                    return;
                }
                einhaengen();
                this._wartefallsBild(neuesEl, () => {
                    this._fade(neuesEl, blende.sekunden, true);
                    alt._bsAbloeseMs = blende.sekunden * 1000;
                    this._entferneSobaldVerdeckt(alt);
                });
            };
            const rest = this._restBlendeMs();
            if (rest > 30) this._timeout(los, rest + 20);
            else los();
        }

        // JOB-88: naechsten Formel-Cue in der Standzeit des aktuellen vorab rendern.
        _vorbauen(idx) {
            const n = idx >= 0 ? this._naechsterSichtbarerCue(this.cues, idx) : null;
            if (!n || (n.typ !== 'formel' && n.typ !== 'rechnung') || (this._vorgebaut && this._vorgebaut.id === n.id)) return;
            setTimeout(() => {
                if (this._vorgebaut && this._vorgebaut.id === n.id) return;
                this._vorgebaut = { id: n.id, el: this._baueElement(n, n.t_start) };
            }, 400);
        }

        // JOB-51a (Ricos Befund "bilder werden nicht gezeigt"): eine Blende, die laenger ist
        // als die Standzeit bis zum naechsten Cue, erreicht nie volle Deckkraft -> wirkt leer/
        // hektisch. Effektive Dauer = min(Wunschdauer, halbe Standzeit), Untergrenze 0.3s.
        // Beim letzten Cue zaehlt die Restlaufzeit des Audios statt eines naechsten Cues.
        // JOB-53a: gilt jetzt fuer jede Uebergangsdauer, nicht nur fuer 'weich'-Blenden.
        _effektiveDauer(cue, sekunden) {
            const idx = this.cues.findIndex((c) => c.id === cue.id);
            const naechster = idx >= 0 ? this._naechsterSichtbarerCue(this.cues, idx) : null;
            let standzeit;
            if (naechster) {
                standzeit = naechster.t_start - cue.t_start;
            } else {
                const dauer = this.audioEl.duration;
                standzeit = (isFinite(dauer) && dauer > cue.t_start) ? (dauer - cue.t_start) : sekunden * 2;
            }
            return Math.max(0.3, Math.min(sekunden, standzeit * 0.5));
        }

        _blendeAusUndZeigeRuhe(altesEl, abblende) {
            if (abblende.typ === 'weich') {
                altesEl.style.transitionDuration = abblende.sekunden + 's';
                altesEl.classList.remove('bs-sichtbar');
                this._timeout(() => {
                    altesEl.remove();
                    this._zeigeRuhe();
                }, abblende.sekunden * 1000 + 20);
            } else {
                altesEl.remove();
                this._zeigeRuhe();
            }
        }

        // Ruhezustand = schwarze Buehne, kein Text, kein Platzhalter (Ricos Befund 22.09.,
        // "lieber schwarz lassen zwischen tafeln"). .bs-buehne hat #000-Hintergrund, das
        // .bs-ruhe-Element bleibt nur als leerer Marker fuer die bestehende Entfernungslogik.
        _zeigeRuhe() {
            this.buehne.querySelectorAll('.bs-element').forEach((n) => n.remove());
            this.dunkel.classList.remove('bs-aktiv');
            if (!this.buehne.querySelector('.bs-ruhe')) {
                const ruhe = document.createElement('div');
                ruhe.className = 'bs-ruhe';
                this.buehne.appendChild(ruhe);
            }
        }

        _baueElement(cue, t) {
            const el = document.createElement('div');
            el.className = `bs-element bs-typ-${cue.typ}`;
            // Optionales Regie-Feld `klasse`: zusaetzliche CSS-Klasse fuer EINEN Cue, ohne den
            // ganzen Typ umzudefinieren (Rico 23.09.: die Schlusstafel darf nicht aussehen wie
            // eine Ueberbrueckungszeile; die uebrigen Tafeln bleiben unveraendert).
            if (cue.klasse) el.className += ' ' + String(cue.klasse).replace(/[^a-zA-Z0-9 _-]/g, '');
            el.dataset.cueId = cue.id;

            switch (cue.typ) {
                case 'ueberschrift':
                case 'verortung':
                case 'zitat':
                case 'tafel':
                    el.textContent = cue.inhalt || ''; // ggf. per _starteTippenFallsNoetig ueberschrieben
                    break;
                case 'skizze':
                    const vorgeladen = cue.asset ? this._bildCache.get(cue.asset) : null;
                    if (cue.asset && this._schwarzModus() && vorgeladen && vorgeladen._bsFehlt) {
                        // Kap. 2: Bilddatei fehlt -> leere Ebene, die Buehne bleibt schwarz
                        // (kein Platzhalter, kein Fehlertext, kein zweiter fehlschlagender Abruf).
                        el.classList.add('bs-fehlt');
                    } else if (cue.asset) {
                        const img = document.createElement('img');
                        img.alt = cue.inhalt || '';
                        img.addEventListener('error', () => {
                            if (!this._schwarzModus()) console.error(`Bildspur: Asset nicht ladbar (${cue.id}): ${cue.asset}`);
                            else img.remove();
                        });
                        img.src = cue.asset;
                        el._bsBild = img; // fuer _wartefallsBild(): Layer erst sichtbar wenn complete/onload
                        el.appendChild(img);
                        // Labels-Overlay: Positionen (data-x/-y in Prozent) werden hier nur
                        // gesetzt, die tatsaechliche links/oben-Platzierung inkl. Versatz und
                        // Clamping macht _positioniereLabels() NACH dem Einhaengen ins DOM
                        // (Breite/Hoehe des Labels ist vorher unbekannt).
                        const cueKey = _normCueKey(cue.id);
                        const labelList = _labelsMap[cueKey] || [];
                        if (labelList.length) {
                            const layer = document.createElement('div');
                            layer.className = 'bs-labels-layer';
                            for (const lbl of labelList) {
                                const span = document.createElement('span');
                                span.className = 'bs-label';
                                span.textContent = lbl.text;
                                // x/y sind in 1920x1080; da Bild 16:9 = Container 16:9 gilt direkte %
                                span.dataset.ankerX = (lbl.x / 1920 * 100).toFixed(3);
                                span.dataset.ankerY = (lbl.y / 1080 * 100).toFixed(3);
                                layer.appendChild(span);
                            }
                            el.appendChild(layer);
                        }
                    } else if (this._schwarzModus()) {
                        el.classList.add('bs-fehlt');
                    } else {
                        el.innerHTML = RUHE_SVG;
                        const titel = document.createElement('div');
                        titel.style.cssText = 'position:absolute;bottom:10px;left:10px;right:10px;font-size:10px;color:#555;text-align:left;max-height:40%;overflow:auto;';
                        titel.textContent = cue.inhalt;
                        el.appendChild(titel);
                    }
                    break;
                case 'formel':
                case 'rechnung':
                    this._renderFormel(el, cue, t == null ? cue.t_start : t);
                    break;
                default:
                    el.textContent = cue.inhalt || '';
            }
            return el;
        }

        // Label-Platzierung (Befund 21:17, JOB-45): Label liegt nicht mehr zentriert auf
        // dem Anker (das verdeckte z.B. "Eisen" auf dem Goldpfeil), sondern daneben, und
        // wird an den Buehnenrand geklemmt, statt abgeschnitten zu werden.
        // - Anker rechts der Bildmitte -> Label links vom Anker (Textende am Anker).
        // - Anker links der Bildmitte  -> Label rechts vom Anker (Textanfang am Anker).
        // - Vertikal 12-16px Versatz weg von der Bildmitte (weg von der Pfeilspitze).
        // - Danach Clamp: Label bleibt vollstaendig innerhalb der Buehne (4px Rand).
        _positioniereLabels(el) {
            const layer = el.querySelector('.bs-labels-layer');
            if (!layer) return;
            const buehneW = this.buehne.clientWidth;
            const buehneH = this.buehne.clientHeight;
            if (!buehneW || !buehneH) return;
            const GAP = 14;
            const RAND = 4;
            layer.querySelectorAll('.bs-label').forEach((span) => {
                const xPct = parseFloat(span.dataset.ankerX);
                const yPct = parseFloat(span.dataset.ankerY);
                const ankerX = xPct / 100 * buehneW;
                const ankerY = yPct / 100 * buehneH;
                const w = span.offsetWidth;
                const h = span.offsetHeight;

                let left = xPct >= 50 ? (ankerX - GAP - w) : (ankerX + GAP);
                let top = yPct >= 50 ? (ankerY + GAP) : (ankerY - GAP - h);

                left = Math.max(RAND, Math.min(left, buehneW - w - RAND));
                top = Math.max(RAND, Math.min(top, buehneH - h - RAND));

                span.style.left = left + 'px';
                span.style.top = top + 'px';
            });
        }

        // Tippeffekt fuer typ='tippen': Text erscheint zeichenweise (~30-40 Zeichen/s) mit Cursor.
        // Bei Seek (sofort=true) oder reduced-motion steht der Text sofort komplett da.
        _starteTippenFallsNoetig(el, cue, blende, sofort) {
            if (blende.typ !== 'tippen') return;
            const text = cue.inhalt || '';
            if (sofort || this._reducedMotion()) {
                el.textContent = text;
                return;
            }
            el.textContent = '';
            const textSpan = document.createElement('span');
            textSpan.className = 'bs-tipp-text';
            const cursor = document.createElement('span');
            cursor.className = 'bs-tipp-cursor';
            el.appendChild(textSpan);
            el.appendChild(cursor);

            let i = 0;
            const zeichenProSekunde = blende.zeichenProSekunde > 0 ? blende.zeichenProSekunde : TIPP_ZEICHEN_PRO_SEKUNDE;
            const intervallMs = 1000 / zeichenProSekunde;
            this._tippenInterval = setInterval(() => {
                i++;
                textSpan.textContent = text.slice(0, i);
                if (i >= text.length) {
                    clearInterval(this._tippenInterval);
                    this._tippenInterval = null;
                }
            }, intervallMs);
        }

        // JOB-57 (Formel-Marker, Ricos USP "Formeln wirklich erklaeren"): ein Schritt mit
        // Feld `teil` (statt eigenem `katex`) schaltet nur um, WELCHER Teil der EINEN, immer
        // gleich gesetzten Formel (cue.inhalt) hervorgehoben ist — die Formel selbst wird nur
        // einmal gerendert, pro Schritt aendert sich nur ein data-Attribut. Dadurch bricht die
        // Formel zwischen Schritten nie um (identisches KaTeX-Layout) und der Uebergang kann
        // weich per CSS-transition laufen statt hart per Neu-Rendern. Die Formel-LaTeX markiert
        // ihre Bestandteile dafuer selbst mit \htmlClass{bs-formel-teil bs-gN}{...} (trust:true
        // noetig, s. _katexRender), regie-format.md Abschnitt 'Formel-Marker' erklaert die
        // Schreibweise. Alte Cues ohne `teil` (z.B. cue-9) behalten das bisherige Verhalten:
        // pro Schritt ein eigenes `katex` und kompletter Neu-Render.
        _istMarkerModus(cue) {
            return !!(cue.schritte && cue.schritte.length && cue.schritte[0].teil !== undefined);
        }

        _renderFormel(el, cue, t) {
            const schritt = cue.schritte && cue.schritte.length ? findeAktivenSchritt(cue.schritte, t) : null;
            if (this._istMarkerModus(cue)) {
                const zielSpan = document.createElement('div');
                el.appendChild(zielSpan);
                this._katexRender(zielSpan, cue.inhalt || '');
                el.dataset.aktiverTeil = schritt ? (Array.isArray(schritt.teil) ? schritt.teil.join(' ') : String(schritt.teil)) : '';
                const notiz = document.createElement('div');
                notiz.className = 'bs-formel-notiz';
                notiz.textContent = schritt ? (schritt.zeigt || '') : '';
                el.appendChild(notiz);
                el._bsNotizEl = notiz;
                return;
            }
            const katexStr = schritt ? schritt.katex : (cue.inhalt || '');
            const zielSpan = document.createElement('div');
            el.appendChild(zielSpan);
            this._katexRender(zielSpan, katexStr);
            if (schritt && schritt.zeigt) {
                const notiz = document.createElement('div');
                notiz.style.cssText = 'font-size:11px;color:#666;margin-top:14px;';
                notiz.textContent = schritt.zeigt;
                el.appendChild(notiz);
            }
        }

        _katexRender(target, latex) {
            if (global.katex && typeof global.katex.render === 'function') {
                try {
                    global.katex.render(latex, target, { throwOnError: false, trust: true, strict: false, displayMode: true });
                    return;
                } catch (e) {
                    console.warn('Bildspur: KaTeX-Renderfehler', e);
                }
            }
            target.textContent = latex;
        }

        // Formel-/Rechnung-Schritte wechseln IMMER hart (Vorgabe Leitstand 21.09.), unabhaengig
        // von der Cue-eigenen 'blende' (die nur den Einstieg des ganzen Cues betrifft).
        _aktualisiereSchritt(cue, t) {
            if (cue.typ !== 'formel' && cue.typ !== 'rechnung') return;
            if (!cue.schritte || !cue.schritte.length) return;
            const schritt = findeAktivenSchritt(cue.schritte, t);
            if (schritt === this.letzterFormelSchritt) return;
            this.letzterFormelSchritt = schritt;
            const el = this.buehne.querySelector(`.bs-element[data-cue-id="${cue.id}"]`);
            if (!el) return;
            if (this._istMarkerModus(cue)) {
                // Kein Neu-Render: nur das data-Attribut wechseln, KaTeX-DOM bleibt stehen.
                // CSS (transition: color) macht daraus den weichen Uebergang zwischen den
                // Bestandteilen, ohne dass die Formel neu umbricht.
                el.dataset.aktiverTeil = schritt ? (Array.isArray(schritt.teil) ? schritt.teil.join(' ') : String(schritt.teil)) : '';
                if (el._bsNotizEl) el._bsNotizEl.textContent = schritt ? (schritt.zeigt || '') : '';
                return;
            }
            this._renderFormel(Object.assign(el, { innerHTML: '' }), cue, t);
        }

        _aktualisiereDebug(idx, sichtbar, t) {
            const min = Math.floor(t / 60);
            const sek = Math.floor(t % 60).toString().padStart(2, '0');
            const naechster = this.cues[idx + 1];
            // Nur schreiben, wenn sich der Text geaendert hat (Tick laeuft je Frame).
            const setze = (knoten, text) => { if (knoten._bsText !== text) { knoten._bsText = text; knoten.textContent = text; } };
            setze(this.debugZeit, `${min}:${sek}`);
            setze(this.debugCue, 'cue: ' + (sichtbar ? `${sichtbar.id} (${sichtbar.typ})` : '–'));
            setze(this.debugBlende, 'blende: ' + (sichtbar ? (sichtbar.blende || '–') : '–'));
            setze(this.debugNaechster, 'naechster: ' + (naechster ? `${naechster.id} @${naechster.t_start.toFixed(1)}s` : '–'));
        }
    }

    global.Bildspur = {
        erstelle(audioEl, opts) {
            return new BildspurController(audioEl, opts);
        },
    };
})(window);
