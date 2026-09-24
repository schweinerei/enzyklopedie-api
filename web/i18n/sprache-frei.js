/*
 * sprache-frei.js  -  JOB-20260924-106 Stufe 1  (Stufe 2: in index.html eingebunden, Fenster window-lang)
 *
 * Freie Sprachwahl: Nutzer tippt seine Sprache/Schrift in ein Feld -> Server (POST /v1/i18n) normalisiert sie
 * zu einem Sprachcode und liefert ALLE UI-Strings in EINEM Request -> Anwendung auf data-i18n / data-i18n-placeholder,
 * <html lang>, dir="rtl", Font-Fallback, sichtbare Kennzeichnung "maschinell uebersetzt". DE/EN/RU bleiben handgemacht.
 *
 * EINBAU (Stufe 2, drei Stellen in index.html):
 *   1) <script src="i18n/sprache-frei.js"></script> nach dem Woerterbuch/`changeLanguage`-Definition, dann:
 *        SpracheFrei.init({
 *          apiBase: () => API_BASE_URL,                  // bestehender Wrapper, kein neuer Host
 *          i18n: i18n,                                   // Objekt {en,de,ru}; freie Sprache wird als i18n[code] eingehaengt
 *          builtin: ['en','de','ru'],
 *          getBuiltinLang: () => localStorage.getItem('lang') || 'en',
 *          setActiveLang: (c) => { aktuelleSprache = c; },  // damit t('key') im JS die freie Sprache nutzt
 *          changeLanguage: changeLanguage,               // Rueckweg
 *          onApplied: (c) => {}                          // optional: dynamische Texte (Audio-Taste, Status) nachziehen
 *        });
 *        SpracheFrei.mount(document.getElementById('sf-host'));   // Tipp-Fenster neben den drei .lang-btn
 *   2) Rueckweg zu DE/EN/RU: `.lang-btn`-Klicks erkennt das Modul selbst (delegierter Listener), kein Eingriff noetig.
 *   3) localStorage: 'lang' bleibt immer en/de/ru (Fallback); die freie Sprache steht separat in 'sf_active'.
 *
 * Offline/Fehler: bleibt bei der letzten Sprache, genau EIN Versuch je Eingabe, danach 4 s Sperre, keine Kaskade.
 * Keine externen Fonts/Requests ausser dem einen Aufruf an die eigene API.
 */
(function (global) {
  'use strict';

  var SF_VERSION = 1;                       // hochzaehlen, wenn sich Logik/Format des Caches aendert
  var LS_ACTIVE = 'sf_active';              // {code,name,rtl,ver}
  var LS_MAP = 'sf_map';                    // { normalisierterFreitext: {code,name,rtl} }
  var LS_IDX = 'sf_idx';                    // LRU der gecachten Sprachen
  var LS_PREFIX = 'sf_tr:';                 // sf_tr:<code>:<ver>  -> strings
  var MAX_LANGS = 5;
  var REQUEST_TIMEOUT_MS = 100000;          // Server-LLM darf bis ~90 s brauchen
  var COOLDOWN_MS = 4000;
  var MAX_INPUT = 60;

  // Eigene Texte des Moduls. EN = Quelle fuer die Maschine, DE/RU handgemacht (vorlaeufig, Texter pruefen).
  var OWN = {
    en: {
      sf_label: '> other language? type it here',
      sf_placeholder: 'e.g. 日本語, Türkçe, العربية...',
      sf_go: 'OK',
      sf_badge: 'machine translated',
      sf_back: 'back to EN / DE / RU',
      sf_busy: '> translating...',
      sf_ok: '> language set.',
      sf_err_lang: '> Language not recognised. Try its name or a sample word.',
      sf_err_net: '> Translation unavailable. Staying with the current language.',
      sf_err_rate: '> Too many requests. Please wait a moment.'
    },
    de: {
      sf_label: '> andere Sprache? hier eintippen',
      sf_placeholder: 'z. B. 日本語, Türkçe, العربية...',
      sf_go: 'OK',
      sf_badge: 'maschinell übersetzt',
      sf_back: 'zurück zu EN / DE / RU',
      sf_busy: '> übersetze...',
      sf_ok: '> Sprache gesetzt.',
      sf_err_lang: '> Sprache nicht erkannt. Versuche ihren Namen oder ein Beispielwort.',
      sf_err_net: '> Übersetzung nicht verfügbar. Es bleibt bei der aktuellen Sprache.',
      sf_err_rate: '> Zu viele Anfragen. Bitte kurz warten.'
    },
    ru: {
      sf_label: '> другой язык? введите здесь',
      sf_placeholder: 'напр. 日本語, Türkçe, العربية...',
      sf_go: 'OK',
      sf_badge: 'машинный перевод',
      sf_back: 'назад к EN / DE / RU',
      sf_busy: '> перевожу...',
      sf_ok: '> язык установлен.',
      sf_err_lang: '> Язык не распознан. Введите его название или слово на нём.',
      sf_err_net: '> Перевод недоступен. Остаёмся на текущем языке.',
      sf_err_rate: '> Слишком много запросов. Подождите немного.'
    }
  };

  // Font-Fallback-Ketten: nur System-/Noto-Fonts, die auf dem Geraet vorhanden sind (keine Downloads, kein Tracker).
  var FONTS = {
    ja: '"Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo","Noto Sans JP","Noto Sans CJK JP"',
    'zh-Hans': '"PingFang SC","Microsoft YaHei","Noto Sans SC","Noto Sans CJK SC"',
    'zh-Hant': '"PingFang TC","Microsoft JhengHei","Noto Sans TC","Noto Sans CJK TC"',
    ko: '"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR","Noto Sans CJK KR"',
    arab: '"Geeza Pro","Segoe UI","Noto Sans Arabic","Noto Naskh Arabic","Tahoma"',
    hebr: '"Arial Hebrew","Segoe UI","Noto Sans Hebrew","Arial"',
    deva: '"Kohinoor Devanagari","Devanagari Sangam MN","Nirmala UI","Noto Sans Devanagari","Mangal"',
    thai: '"Thonburi","Leelawadee UI","Noto Sans Thai","Tahoma"',
    beng: '"Kohinoor Bangla","Bangla Sangam MN","Nirmala UI","Noto Sans Bengali"',
    taml: '"Tamil Sangam MN","Nirmala UI","Noto Sans Tamil"',
    telu: '"Kohinoor Telugu","Telugu Sangam MN","Nirmala UI","Noto Sans Telugu"',
    geor: '"Noto Sans Georgian","Sylfaen","Menlo"',
    armn: '"Noto Sans Armenian","Sylfaen","Menlo"',
    other: ''
  };
  var SCRIPT_OF = {
    ar: 'arab', fa: 'arab', ur: 'arab', ps: 'arab', sd: 'arab', ug: 'arab', ckb: 'arab',
    he: 'hebr', yi: 'hebr',
    hi: 'deva', mr: 'deva', ne: 'deva', sa: 'deva',
    th: 'thai', bn: 'beng', ta: 'taml', te: 'telu', ka: 'geor', hy: 'armn'
  };
  var GENERIC = ',"Noto Sans","Segoe UI",sans-serif';

  var cfg = null, state = { busy: false, blockedUntil: 0 }, ui = null, styleEl = null, prevMonoFont = null;

  // ---------- kleine Helfer ----------
  function ls(fn, fallback) { try { return fn(); } catch (e) { return fallback; } }
  function jget(k) { return ls(function () { return JSON.parse(localStorage.getItem(k)); }, null); }
  function jset(k, v) { ls(function () { localStorage.setItem(k, JSON.stringify(v)); }); }
  function norm(t) { return String(t || '').trim().replace(/\s+/g, ' ').toLowerCase(); }
  function hash(str) {                     // FNV-1a 32 bit -> Stringversion (Client-Seite)
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0; }
    return h.toString(36);
  }
  function apiBase() { return typeof cfg.apiBase === 'function' ? cfg.apiBase() : cfg.apiBase; }
  function isBuiltin(c) { return cfg.builtin.indexOf(c) !== -1; }

  function sourceStrings() {               // EN-Quelle: Seitenwoerterbuch + eigene Modul-Texte
    var out = {}, en = cfg.i18n.en || {}, k;
    for (k in en) if (Object.prototype.hasOwnProperty.call(en, k)) out[k] = en[k];
    for (k in OWN.en) out[k] = OWN.en[k];
    return out;
  }
  function versionOf(src) {
    var keys = Object.keys(src).sort(), s = keys.map(function (k) { return k + '\u0001' + src[k]; }).join('\u0002');
    return 'v' + SF_VERSION + '-' + hash(s);
  }

  // ---------- Cache ----------
  function cacheGet(code, ver) { return jget(LS_PREFIX + code + ':' + ver); }
  function cachePut(code, ver, strings) {
    var idx = jget(LS_IDX) || [], key = code + ':' + ver;
    idx = idx.filter(function (x) { return x !== key; }); idx.push(key);
    while (idx.length > MAX_LANGS) ls(function () { localStorage.removeItem(LS_PREFIX + idx.shift()); });
    jset(LS_PREFIX + key, strings); jset(LS_IDX, idx);
  }

  // ---------- Anwenden ----------
  function scriptFor(code) {
    if (FONTS[code]) return code;
    var base = code.split('-')[0];
    if (/-Arab$/.test(code)) return 'arab';
    if (/-Hebr$/.test(code)) return 'hebr';
    if (/-Deva$/.test(code)) return 'deva';
    if (base === 'zh') return /-Hant$|-TW$|-HK$/.test(code) ? 'zh-Hant' : 'zh-Hans';
    return SCRIPT_OF[base] || (FONTS[base] ? base : 'other');
  }
  function applyFont(code) {
    if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'sf-style'; document.head.appendChild(styleEl); }
    var chain = FONTS[scriptFor(code)];
    styleEl.textContent = STYLE + (chain
      ? 'html[data-sf] body, html[data-sf] input, html[data-sf] button, html[data-sf] textarea{font-family: var(--font-mono, monospace),' + chain + GENERIC + ' !important;}' +
        'html[data-sf] .window-content, html[data-sf] .script-window{font-family: var(--font-mono, monospace),' + chain + GENERIC + ';}'
      : 'html[data-sf] body, html[data-sf] input, html[data-sf] button{font-family: var(--font-mono, monospace)' + GENERIC + ' !important;}');
  }

  function applyStrings(code, name, rtl, strings) {
    var dict = {}, k, en = cfg.i18n.en || {};
    for (k in en) dict[k] = en[k];                      // fehlende Schluessel -> Englisch (kein leerer Text)
    for (k in strings) dict[k] = strings[k];
    cfg.i18n[code] = dict;                              // t('key') / i18n[aktuelleSprache][key] funktionieren unveraendert
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n'); if (dict[key]) el.innerHTML = dict[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder'); if (dict[key]) el.placeholder = dict[key];
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria'); if (dict[key]) el.setAttribute('aria-label', dict[key]);
    });
    var root = document.documentElement;
    root.lang = code;
    root.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    root.setAttribute('data-sf', code);
    applyFont(code);
    document.querySelectorAll('.lang-btn').forEach(function (b) { b.classList.remove('active'); });
    if (cfg.setActiveLang) cfg.setActiveLang(code);
    if (cfg.onApplied) ls(function () { cfg.onApplied(code); });
    renderOwn(code, name);
  }

  function ownText(code, key) {
    var d = (code && cfg.i18n[code]) || null;
    return (d && d[key]) || (OWN[code] && OWN[code][key]) || OWN.en[key];
  }
  function activeCode() { var a = jget(LS_ACTIVE); return a && document.documentElement.getAttribute('data-sf') ? a.code : null; }
  function currentUiLang() {
    return activeCode() || (cfg.getBuiltinLang ? cfg.getBuiltinLang() : 'en');
  }
  function renderOwn(code, name) {
    if (!ui) return;
    var l = code || currentUiLang();
    ui.label.textContent = ownText(l, 'sf_label');
    ui.input.placeholder = ownText(l, 'sf_placeholder');
    ui.go.textContent = ownText(l, 'sf_go');
    ui.go.setAttribute('aria-label', ownText(l, 'sf_go'));
    ui.back.textContent = ownText(l, 'sf_back');
    var free = !!activeCode() || !!(code && !isBuiltin(code));
    ui.badge.hidden = !free; ui.back.hidden = !free;
    ui.badge.textContent = free ? '[' + (name ? name + ' · ' : '') + ownText(l, 'sf_badge') + ']' : '';
  }
  function status(key, isErr) {
    if (!ui) return;
    ui.status.textContent = key ? ownText(currentUiLang(), key) : '';
    ui.status.style.color = isErr ? '#dc3545' : '';
  }

  // ---------- Serverkommunikation ----------
  function post(freitext, strings) {
    var ctl = new AbortController(), t = setTimeout(function () { ctl.abort(); }, REQUEST_TIMEOUT_MS);
    return fetch(apiBase() + '/v1/i18n', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctl.signal,
      body: JSON.stringify({ sprache_freitext: freitext, strings: strings })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { j._status = r.status; return j; });
    }).finally(function () { clearTimeout(t); });
  }

  // Oeffentlich: Freitext -> Sprache setzen. Resolve {ok, code?, error?}; wirft nie.
  function setFree(freitext) {
    freitext = String(freitext || '').trim().slice(0, MAX_INPUT);
    if (!freitext) return Promise.resolve({ ok: false, error: 'empty' });
    if (state.busy) return Promise.resolve({ ok: false, error: 'busy' });
    if (Date.now() < state.blockedUntil) return Promise.resolve({ ok: false, error: 'cooldown' });
    var src = sourceStrings(), ver = versionOf(src), key = norm(freitext);

    var mapped = (jget(LS_MAP) || {})[key];              // 1) komplett offline aus dem Cache
    if (mapped) {
      if (isBuiltin(mapped.code)) return Promise.resolve(finishBuiltin(mapped));
      var hit = cacheGet(mapped.code, ver);
      if (hit) return Promise.resolve(finishFree(mapped, ver, hit, true));
    }
    state.busy = true; setBusy(true); status('sf_busy', false);
    return post(freitext, src).then(function (r) {
      if (r._status === 200 && r.code) {
        var meta = { code: r.code, name: r.name || r.code, rtl: !!r.rtl };
        var map = jget(LS_MAP) || {}; map[key] = meta;
        var ks = Object.keys(map); if (ks.length > 60) delete map[ks[0]];
        jset(LS_MAP, map);
        if (r.builtin || isBuiltin(r.code)) return finishBuiltin(meta);
        if (!r.strings || !Object.keys(r.strings).length) throw new Error('empty');
        cachePut(r.code, ver, r.strings);
        return finishFree(meta, ver, r.strings, false);
      }
      if (r._status === 422) { status('sf_err_lang', true); return { ok: false, error: 'unknown_language' }; }
      if (r._status === 429) { fail('sf_err_rate'); return { ok: false, error: 'rate_limited' }; }
      throw new Error('http ' + r._status);
    }).catch(function () {
      fail('sf_err_net'); return { ok: false, error: 'network' };   // bleibt bei der letzten Sprache
    }).then(function (res) { state.busy = false; setBusy(false); return res; });
  }
  function fail(key) { status(key, true); state.blockedUntil = Date.now() + COOLDOWN_MS; }

  function finishBuiltin(meta) {            // Eingabe bedeutete DE/EN/RU -> normaler Weg der Seite
    leave(meta.code);
    status('sf_ok', false);
    return { ok: true, code: meta.code, builtin: true };
  }
  function finishFree(meta, ver, strings, fromCache) {
    jset(LS_ACTIVE, { code: meta.code, name: meta.name, rtl: meta.rtl, ver: ver });
    applyStrings(meta.code, meta.name, meta.rtl, strings);
    status('sf_ok', false);
    return { ok: true, code: meta.code, cached: fromCache };
  }

  // Rueckweg: freie Sprache verlassen. to = 'en'|'de'|'ru' (Default: letzte handgemachte Sprache)
  function leave(to) {
    ls(function () { localStorage.removeItem(LS_ACTIVE); });
    var root = document.documentElement;
    root.removeAttribute('data-sf'); root.setAttribute('dir', 'ltr');
    if (styleEl) styleEl.textContent = STYLE;
    var target = (to && isBuiltin(to)) ? to : (cfg.getBuiltinLang ? cfg.getBuiltinLang() : 'en');
    if (cfg.changeLanguage) cfg.changeLanguage(target);   // setzt lang, Texte, localStorage.lang, aktive Taste
    renderOwn(target);
  }

  // Beim Start: gemerkte freie Sprache wieder anwenden (nur aus dem Cache; sonst bleibt die handgemachte Sprache).
  function restoreSaved() {
    var a = jget(LS_ACTIVE); if (!a || !a.code) return false;
    var hit = cacheGet(a.code, versionOf(sourceStrings()));
    if (!hit) { ls(function () { localStorage.removeItem(LS_ACTIVE); }); return false; }   // Stringversion geaendert -> neu tippen
    applyStrings(a.code, a.name, !!a.rtl, hit);
    return true;
  }

  // ---------- Tipp-Fenster ----------
  var STYLE =
    '.sf-box{display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center;margin-top:8px}' +
    '.sf-label{flex:1 1 100%;font-size:13px;color:var(--term-accent,#0f0)}' +
    '.sf-input{flex:1 1 140px;min-width:0;padding:6px 10px;background:rgba(0,0,0,.5);border:1px solid var(--term-accent,#0f0);color:#fff;border-radius:4px;outline:none;font-size:15px}' +
    '.sf-input:focus-visible,.sf-go:focus-visible,.sf-back:focus-visible{outline:2px solid #fff;outline-offset:2px}' +
    '.sf-go,.sf-back{cursor:pointer}' +
    '.sf-status{flex:1 1 100%;font-size:12px;min-height:1.2em;color:#bbb}' +
    '.sf-badge{flex:1 1 100%;font-size:12px;color:#d4af37}' +
    '.sf-back{flex:1 1 100%;font-size:12px;text-align:start;background:none;border:0;color:var(--term-accent,#0f0);text-decoration:underline;padding:2px 0}' +
    '.sf-busy{opacity:.6;pointer-events:none}';

  function setBusy(b) { if (ui) { ui.box.classList.toggle('sf-busy', b); ui.input.disabled = b; ui.go.disabled = b; ui.box.setAttribute('aria-busy', b ? 'true' : 'false'); } }

  function mount(host) {
    if (!host || ui) return ui && ui.box;
    if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'sf-style'; styleEl.textContent = STYLE; document.head.appendChild(styleEl); }
    var box = document.createElement('div'); box.className = 'sf-box';
    var id = 'sf-input-' + Math.random().toString(36).slice(2, 7);
    var label = document.createElement('label'); label.className = 'sf-label'; label.htmlFor = id;
    var input = document.createElement('input'); input.type = 'text'; input.id = id; input.className = 'sf-input';
    input.maxLength = MAX_INPUT; input.autocomplete = 'off'; input.spellcheck = false; input.setAttribute('dir', 'auto');
    input.setAttribute('autocapitalize', 'off'); input.setAttribute('autocorrect', 'off');
    var go = document.createElement('button'); go.type = 'button'; go.className = 'action-btn sf-go';
    var status_ = document.createElement('span'); status_.className = 'sf-status'; status_.setAttribute('role', 'status'); status_.setAttribute('aria-live', 'polite');
    var badge = document.createElement('span'); badge.className = 'sf-badge'; badge.hidden = true;
    var back = document.createElement('button'); back.type = 'button'; back.className = 'sf-back'; back.hidden = true;
    box.appendChild(label); box.appendChild(input); box.appendChild(go); box.appendChild(badge); box.appendChild(back); box.appendChild(status_);
    host.appendChild(box);
    ui = { box: box, label: label, input: input, go: go, status: status_, badge: badge, back: back };
    var composing = false;
    input.addEventListener('compositionstart', function () { composing = true; });
    input.addEventListener('compositionend', function () { composing = false; });
    function submit() { setFree(input.value); }
    go.addEventListener('click', submit);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.isComposing && !composing && e.keyCode !== 229) { e.preventDefault(); submit(); }   // IME-Enter (Japanisch/Chinesisch) nicht abfangen
    });
    back.addEventListener('click', function () { leave(); });
    renderOwn(activeCode() || null, (jget(LS_ACTIVE) || {}).name);
    return box;
  }

  function init(opts) {
    cfg = opts || {};
    cfg.builtin = cfg.builtin || ['en', 'de', 'ru'];
    if (!cfg.i18n) throw new Error('SpracheFrei.init: i18n fehlt');
    cfg.builtin.forEach(function (c) {           // eigene Modul-Texte in die handgemachten Sprachen einhaengen
      if (cfg.i18n[c] && OWN[c]) for (var k in OWN[c]) if (!(k in cfg.i18n[c])) cfg.i18n[c][k] = OWN[c][k];
    });
    // Klick auf eine der drei Stammsprachen beendet den freien Modus (der Seiten-Handler laeuft zuerst)
    document.addEventListener('click', function (e) {
      var b = e.target && e.target.closest && e.target.closest('.lang-btn');
      if (!b) return;
      if (!document.documentElement.hasAttribute('data-sf')) { renderOwn(b.getAttribute('data-lang')); return; }   // Leitstand 24.09.: Tippfeld-Texte folgen auch DE/EN/RU-Wechsel
      ls(function () { localStorage.removeItem(LS_ACTIVE); });
      document.documentElement.removeAttribute('data-sf'); document.documentElement.setAttribute('dir', 'ltr');
      if (styleEl) styleEl.textContent = STYLE;
      renderOwn(b.getAttribute('data-lang'));
    });
    return restoreSaved();
  }

  global.SpracheFrei = { init: init, mount: mount, setFree: setFree, leave: leave, restoreSaved: restoreSaved,
                         _fonts: FONTS, _scriptFor: scriptFor, _versionOf: versionOf };
})(window);
