    // F5: Seite muss auch ohne CDN-Libs bedienbar bleiben
    const LIBS_OK = !!(window.marked && window.DOMPurify);
    if (window.marked) marked.setOptions({ breaks: false, gfm: true });

    // ==========================================
    // SPRACH-WÖRTERBUCH (i18n)
    // ==========================================
    const i18n = {
        en: {
            chat_header: ">_ run Enzyklopedia.sh",
            api_lamp_online: "Encyclopedia reachable", api_lamp_offline: "currently unreachable", api_lamp_check: "checking connection",
            chat_welcome: "Connection established. I am the Enzyklopedia. What is your inquiry?",
            chat_subtext_1: "> Your dialogue expands the system as an anonymous node within the knowledge graph.",
            chat_subtext_2: "> Please use your native language – the Enzyklopedia strives for universal multilingualism.",
            chat_placeholder: "Enter inquiry...",
            
            store_header: ">_ access store.dir",
            store_title: "OFFICIAL STORE",
            store_desc: "Procure complete editions of our publications.",
            store_item_1: "[ITEM] Schweinerei 1: The Invitation",
            store_item_2: "[ITEM] Physik der Beziehungen",
            store_format: "> Format: Print / Digital / Audio",
            store_purchase: "[PURCHASE MODULE]",
            store_dir_1: "[DIR] Schweinerei 1: The Invitation",
            store_dir_2: "[DIR] Physik der Beziehungen",
            chat_boot_1: "> THE OPEN BOOK · Schweinerei 1: The Invitation · Physik der Beziehungen",
            chat_boot_2: "> Samples and audio in the Store. Questions to the Enzyklopedia below.",
            status_offline: "> Backend unreachable. Audio, visuals and samples keep working.",
            status_warming: "> Contacting backend...",
            status_error: "> Transmission failed. Please try again.",
            status_http: "> Backend answered with an error.",
            log_offline: "> Public log unreachable. Retrying automatically...",
            log_empty: "> No entries yet. Be the first node.",
            log_sent: "> Entry saved.",
            log_limit: "> Too fast. Please wait a few minutes before the next entry.",
            log_hint: "> Entries are public. Please do not share personal data.",
            log_err_empty: "> Rejected: the entry is empty.",
            log_err_too_long: "> Rejected: too long (max. 280 characters).",
            log_err_link: "> Rejected: links and addresses are not allowed.",
            log_err_blocked: "> Rejected: the entry contains blocked words.",
            log_err_duplicate: "> Rejected: this entry was just posted already.",
            log_err_server: "> Could not save the entry. Please try again later.",
            votes_local: "local",
            sample_missing: "> Sample not yet uploaded.",
            purchase_routing: "> Routing to vendor...",
            purchase_open: "[OPEN VENDOR PAGE]",
            purchase_error: "> Purchase routing failed.",
            mic_denied: "> Microphone access denied or unsupported.",
            mic_recording: "> Recording... click ⏹ to stop and send (max 60 s)",
            mic_transcribing: "> Transcribing audio input...",
            stage_stt: "> transcribing...",
            stage_embed: "> encoding query...",
            stage_retrieve: "> retrieving context...",
            stage_generate: "> generating...",
            stage_reasoning: "> reasoning...",
            stage_retry: "> retrying with fallback model...",
            throne_header: ">_ throne.exe",
            throne_hint: "> Keep the throne empty. Click whoever approaches.",
            throne_empty_for: "empty for", throne_dismissed: "dismissed", throne_occupied: "occupations", throne_record: "record",
            throne_state_empty: "[EMPTY]", throne_state_occupied: "[OCCUPIED]",
            arch_king: "the king", arch_priest: "the priest", arch_merchant: "the merchant", arch_algorithm: "the algorithm",
            arch_author: "the author", arch_prophet: "the prophet", arch_clerk: "the bureaucrat", arch_star: "the influencer",
            timing_cached: "cached",
            
            settings_header: ">_ conf vis", mode_standard: "Standard", mode_hardcore: "Hardcore", mode_simple: "Simple", fmt_print: "[PRINT]", fmt_digital: "[DIGITAL]", fmt_audio: "[AUDIO]", fmt_pdf: "[PDF]", audio_next: "NEXT", audio_bild: "IMAGE", baum_sprache_aria: "Audio language", baum_sprache_folgt: "coming", settings_fs_enter: "[ ENTER FULLSCREEN ]", settings_fs_exit: "[ EXIT FULLSCREEN ]", backlog_pending: "[PENDING]", backlog_paid: "[PAID TIER]", aria_maximize: "Maximize window", aria_minimize: "Minimize or restore window", aria_send: "Send", aria_mic: "Record voice input", aria_send_public: "Send public message", aria_upvote: "Upvote", audio_err_blocked: "Error: Stream blocked / offline", audio_err_cors: "Error: Stream unavailable / CORS", audio_err_file: "Error: File unavailable", audio_err_any: "Error: Stream/File unavailable", friends_auth: "> Authenticating token...", friends_download_secure: "[DOWNLOAD SECURE PAYLOAD]", friends_download: "[DOWNLOAD]", legal_contact: "Contact:", lang_header: ">_ lang.sh", vis_cmd_aria: "Command line", vis_cmd_on: "root@schweinerei:~# mixer, trace, flash, auto mod unlocked — type 'exit' to lock again", vis_cmd_off: "root@schweinerei:~# locked", vis_cmd_unknown: "command not found",
            settings_lang: "> system language",
            settings_intensity: "INTENSITY",
            flash_auto_short: "AUTO", flash_mode_inv_short: "INV", flash_mode_reset_short: "INV+R", flash_btn: "FLASH", flash_btn_1: "FLASH 1", flash_btn_2: "FLASH 2", flash_auto_on: "AUTO: ON", flash_auto_off: "AUTO: OFF", flash_mode_inv: "INVERT", flash_mode_reset: "INVERT + RESET", trace_hold_btn: "TRACE",
            flash_reduced: "Flash off: reduced motion is set", flash_wait: "Flash: max. 3 per second",
            flash_hint: "Keys F / G: F = short inverted flash, G = slow afterglow fade — both over the shader picture (max. 3 per second combined). Key T: holds TRACE burn-in at maximum while pressed, eases back to the slider value on release. AUTO fires the short flash when the TRACE burn-in is saturated or the music peaks, at random pauses. Off when reduced motion is set.",
            settings_speed: "SPEED",
            settings_battery: "> battery impact",
            
            audio_header: ">_ play audio.sh",
            audio_loaded: "> loaded: ",
            audio_play: "PLAY",
            audio_pause: "PAUSE",
            baum_aria: "Audio catalog", baum_st_bebildert: "illustrated", baum_st_audio: "audio only", baum_st_folgt: "coming", baum_weiter: "continue", baum_gesperrt: "Locked – not part of your access yet.", baum_folgt: "Coming soon.", baum_err: "Catalog unavailable.",
            
            guestbook_header: ">_ tail -f public_log.txt",
            guestbook_placeholder: "Enter public message...",
            guestbook_send: "SEND",
            guestbook_loading: "Loading logs...",
            
            friends_open_title: "OPEN ACCESS: PROMO SAMPLES",
            friends_open_desc: "Click a format: PDF downloads, AUDIO plays in the audio window.",
            friends_restricted_title: "RESTRICTED ACCESS: FULL COPIES",
            friends_restricted_desc: "Enter access code to decrypt and retrieve full editions.",
            friends_placeholder: "Enter key...",
            friends_unlock: "UNLOCK",
            
            about_header: ">_ cat about.txt",
            about_p1: "This interface is strictly designed for the readers of our publications. For a detailed explanation of the system's mechanics and underlying architecture, please refer to our books. Knowledge drops and free samples can be found in the Store alongside complete editions.",
            about_p2: "Otherwise: feel free to roam around, have a chat with the Enzyklopedia. We recommend to alter the difficulty button while in chat. Start reading or listening in English, Deutsch, or Русский, and come back whenever you are ready.",
            about_disclaimer: "> Note: This page may consume system resources under heavy load and is optimized for larger screens.",
            about_radio: "> Note: The integrated web radio streams SomaFM (somafm.com), a listener-supported, ad-free station. We are not affiliated with the broadcaster.",
            
            backlog_header: ">_ cat backlog.txt",
            backlog_title: "SYSTEM BACKLOG & DEPLOYMENT QUEUE",
            backlog_t1: "Voice-Chat Integration",
            backlog_d1: "> Enabling audio protocol for inter-user node interaction.",
            backlog_t2: "Document Publication Pipeline",
            backlog_t3: "Volume Two Deployment",
            backlog_d3: "> Scheduling release of Volume Two.",
            backlog_t4: "Global Localization",
            backlog_d4: "> Execution of further translations for all compiled works.",
            backlog_t5: "Voice of the Enzyklopedia",
            backlog_d5: "> Voice output for chat interface.",
            backlog_waiting: "waiting for execution...",
            
            legal_dp_t: "1. Data Processing",
            legal_dp_d: "<strong>Anonymized Storage:</strong> Your interactions (text and voice transcripts) are stored completely anonymously without IP tracking to expand the systemic Knowledge Graph.<br><br><strong>External Routing:</strong> Audio processing and text generation are routed through external APIs (OpenAI, OpenRouter, Pinecone).<br><br><strong>Server Infrastructure:</strong> Hosted securely via Render cloud architecture.",
            legal_ap_t: "2. Affiliate Protocol",
            legal_ap_d: "Certain external outgoing nodes (links) provided by this system are classified as affiliate links. If a transaction is completed through these routing channels, the system operator receives a commission. This does not alter the underlying transaction cost for the user.",
            legal_op_t: "3. System Operator"
        },
        de: {
            chat_header: ">_ run Enzyklopedia.sh",
            api_lamp_online: "Enzyklopädie erreichbar", api_lamp_offline: "gerade nicht erreichbar", api_lamp_check: "Verbindung wird geprüft",
            chat_welcome: "Verbindung hergestellt. Ich bin die Enzyklopedia. Was ist Ihr Anliegen?",
            chat_subtext_1: "> Ihr Dialog erweitert das System als anonymer Knoten innerhalb des Wissensgraphen.",
            chat_subtext_2: "> Bitte verwenden Sie Ihre Muttersprache – die Enzyklopedia strebt nach universeller Mehrsprachigkeit.",
            chat_placeholder: "Anfrage eingeben...",
            
            store_header: ">_ access store.dir",
            store_title: "OFFIZIELLER STORE",
            store_desc: "Erwerben Sie vollständige Ausgaben unserer Publikationen.",
            store_item_1: "[ARTIKEL] Schweinerei 1: The Invitation",
            store_item_2: "[ARTIKEL] Physik der Beziehungen",
            store_format: "> Format: Druck / Digital / Audio",
            store_purchase: "[KAUFMODUL]",
            store_dir_1: "[DIR] Schweinerei 1: The Invitation",
            store_dir_2: "[DIR] Physik der Beziehungen",
            chat_boot_1: "> THE OPEN BOOK · Schweinerei 1: The Invitation · Physik der Beziehungen",
            chat_boot_2: "> Leseproben und Audio im Store. Fragen an die Enzyklopedia unten.",
            status_offline: "> Backend nicht erreichbar. Audio, Visuals und Leseproben laufen weiter.",
            status_warming: "> Verbinde mit Backend...",
            status_error: "> Übertragung fehlgeschlagen. Bitte erneut versuchen.",
            status_http: "> Backend hat mit einem Fehler geantwortet.",
            log_offline: "> Öffentliches Log nicht erreichbar. Neuer Versuch läuft automatisch...",
            log_empty: "> Noch keine Einträge. Sei der erste Knoten.",
            log_sent: "> Eintrag gespeichert.",
            log_limit: "> Zu schnell. Bitte ein paar Minuten bis zum nächsten Eintrag warten.",
            log_hint: "> Einträge sind öffentlich. Bitte keine persönlichen Daten angeben.",
            log_err_empty: "> Abgelehnt: der Eintrag ist leer.",
            log_err_too_long: "> Abgelehnt: zu lang (max. 280 Zeichen).",
            log_err_link: "> Abgelehnt: Links und Adressen sind nicht erlaubt.",
            log_err_blocked: "> Abgelehnt: der Eintrag enthält gesperrte Wörter.",
            log_err_duplicate: "> Abgelehnt: dieser Eintrag wurde gerade schon gesendet.",
            log_err_server: "> Eintrag konnte nicht gespeichert werden. Bitte später erneut versuchen.",
            votes_local: "lokal",
            sample_missing: "> Leseprobe noch nicht hochgeladen.",
            purchase_routing: "> Weiterleitung zum Anbieter...",
            purchase_open: "[ANBIETERSEITE ÖFFNEN]",
            purchase_error: "> Weiterleitung fehlgeschlagen.",
            mic_denied: "> Mikrofonzugriff verweigert oder nicht unterstützt.",
            mic_recording: "> Aufnahme... ⏹ klicken zum Stoppen und Senden (max. 60 s)",
            mic_transcribing: "> Transkribiere Audioeingabe...",
            stage_stt: "> transkribiere...",
            stage_embed: "> kodiere Anfrage...",
            stage_retrieve: "> lade Kontext...",
            stage_generate: "> generiere...",
            stage_reasoning: "> denke nach...",
            stage_retry: "> wiederhole mit Ersatzmodell...",
            throne_header: ">_ throne.exe",
            throne_hint: "> Halte den Thron leer. Klick, wer sich nähert.",
            throne_empty_for: "leer seit", throne_dismissed: "abgewiesen", throne_occupied: "Besetzungen", throne_record: "Rekord",
            throne_state_empty: "[LEER]", throne_state_occupied: "[BESETZT]",
            arch_king: "der König", arch_priest: "der Priester", arch_merchant: "der Händler", arch_algorithm: "der Algorithmus",
            arch_author: "der Autor", arch_prophet: "der Prophet", arch_clerk: "der Bürokrat", arch_star: "der Influencer",
            timing_cached: "aus Cache",
            
            settings_header: ">_ conf vis", mode_standard: "Standard", mode_hardcore: "Hardcore", mode_simple: "Einfach", fmt_print: "[DRUCK]", fmt_digital: "[DIGITAL]", fmt_audio: "[AUDIO]", fmt_pdf: "[PDF]", audio_next: "WEITER", audio_bild: "BILD", baum_sprache_aria: "Hörsprache", baum_sprache_folgt: "folgt", settings_fs_enter: "[ VOLLBILD ]", settings_fs_exit: "[ VOLLBILD BEENDEN ]", backlog_pending: "[OFFEN]", backlog_paid: "[BEZAHLSTUFE]", aria_maximize: "Fenster maximieren", aria_minimize: "Fenster minimieren oder wiederherstellen", aria_send: "Senden", aria_mic: "Spracheingabe aufnehmen", aria_send_public: "Öffentliche Nachricht senden", aria_upvote: "Hochstimmen", audio_err_blocked: "Fehler: Stream blockiert / offline", audio_err_cors: "Fehler: Stream nicht verfügbar / CORS", audio_err_file: "Fehler: Datei nicht verfügbar", audio_err_any: "Fehler: Stream/Datei nicht verfügbar", friends_auth: "> Token wird geprüft...", friends_download_secure: "[SICHEREN DOWNLOAD LADEN]", friends_download: "[DOWNLOAD]", legal_contact: "Kontakt:", lang_header: ">_ lang.sh", vis_cmd_aria: "Befehlszeile", vis_cmd_on: "root@schweinerei:~# mischpult, trace, flash, auto mod frei — 'exit' schliesst wieder ab", vis_cmd_off: "root@schweinerei:~# abgeschlossen", vis_cmd_unknown: "command not found",
            settings_lang: "> systemsprache",
            settings_intensity: "INTENSITÄT",
            flash_auto_short: "AUTO", flash_mode_inv_short: "INV", flash_mode_reset_short: "INV+R", flash_btn: "FLASH", flash_btn_1: "FLASH 1", flash_btn_2: "FLASH 2", flash_auto_on: "AUTO: AN", flash_auto_off: "AUTO: AUS", flash_mode_inv: "INVERS", flash_mode_reset: "INVERS + RESET", trace_hold_btn: "TRACE",
            flash_reduced: "Flash aus: reduzierte Bewegung ist eingestellt", flash_wait: "Flash: höchstens 3 pro Sekunde",
            flash_hint: "Tasten F / G: F = kurzer Invers-Blitz, G = langsames Nachglühen — beide über dem Shaderbild (zusammen höchstens 3 pro Sekunde). Taste T: haelt die TRACE-Ausbrennung auf Maximum, solange gedrueckt, und laeuft beim Loslassen weich zum Sliderwert zurueck. AUTO löst den kurzen Blitz aus, wenn die TRACE-Ausbrennung gesättigt ist oder die Musik Spitzen hat, in zufälligen Pausen. Aus, wenn reduzierte Bewegung eingestellt ist.",
            settings_speed: "TEMPO",
            settings_battery: "> akkuverbrauch",
            
            audio_header: ">_ play audio.sh",
            audio_loaded: "> geladen: ",
            audio_play: "PLAY",
            audio_pause: "PAUSE",
            baum_aria: "Audio-Katalog", baum_st_bebildert: "bebildert", baum_st_audio: "nur Audio", baum_st_folgt: "folgt", baum_weiter: "weiter hören", baum_gesperrt: "Gesperrt – noch nicht in deinem Zugang.", baum_folgt: "Folgt bald.", baum_err: "Katalog nicht verfügbar.",
            
            guestbook_header: ">_ tail -f public_log.txt",
            guestbook_placeholder: "Öffentliche Nachricht eingeben...",
            guestbook_send: "SENDEN",
            guestbook_loading: "Lade Logfiles...",
            
            friends_open_title: "OFFENER ZUGANG: PROBEEXEMPLARE",
            friends_open_desc: "Format anklicken: PDF wird geladen, AUDIO läuft im Audio-Fenster.",
            friends_restricted_title: "EINGESCHRÄNKTER ZUGANG: VOLLVERSIONEN",
            friends_restricted_desc: "Geben Sie den Zugangscode ein, um vollständige Ausgaben zu entschlüsseln.",
            friends_placeholder: "Schlüssel eingeben...",
            friends_unlock: "ENTSPERREN",
            
            about_header: ">_ cat about.txt",
            about_p1: "Dieses Interface wurde strikt für die Leser unserer Publikationen entwickelt. Für eine detaillierte Erklärung der Systemmechanik und der zugrunde liegenden Architektur verweisen wir auf unsere Bücher. 'Knowledge Drops' und kostenlose Leseproben finden Sie im Store neben den Vollversionen.",
            about_p2: "Ansonsten: Bewegen Sie sich frei, unterhalten Sie sich mit der Enzyklopedia. Wir empfehlen, die Schwierigkeitsgrade (Difficulty Buttons) während des Chats anzupassen. Beginnen Sie zu lesen oder zu hören auf Englisch, Deutsch oder Russisch und kehren Sie zurück, wann immer Sie bereit sind.",
            about_disclaimer: "> Hinweis: Diese Seite kann unter Vollast Ressourcen verbrauchen und ist für größere Screens optimiert.",
            about_radio: "> Hinweis: Das integrierte Webradio streamt SomaFM (somafm.com), einen hörerfinanzierten, werbefreien Sender. Wir stehen in keiner Verbindung zum Sender.",
            
            backlog_header: ">_ cat backlog.txt",
            backlog_title: "SYSTEM-BACKLOG & DEPLOYMENT-WARTESCHLANGE",
            backlog_t1: "Voice-Chat Integration",
            backlog_d1: "> Aktivierung des Audioprotokolls für die Interaktion zwischen den Benutzerknoten.",
            backlog_t2: "Dokumenten-Publikations-Pipeline",
            backlog_t3: "Deployment von Band Zwei",
            backlog_d3: "> Planung der Veröffentlichung von Band Zwei.",
            backlog_t4: "Globale Lokalisierung",
            backlog_d4: "> Ausführung weiterer Übersetzungen für alle kompilierten Werke.",
            backlog_t5: "Stimme der Enzyklopedia",
            backlog_d5: "> Sprachausgabe für Chat.",
            backlog_waiting: "warte auf ausführung...",
            
            legal_dp_t: "1. Datenverarbeitung",
            legal_dp_d: "<strong>Anonymisierte Speicherung:</strong> Ihre Interaktionen (Text- und Sprachtranskripte) werden komplett anonymisiert und ohne IP-Tracking gespeichert, um den systemischen Wissensgraphen zu erweitern.<br><br><strong>Externes Routing:</strong> Die Audioverarbeitung und Textgenerierung werden über externe APIs (OpenAI, OpenRouter, Pinecone) geroutet.<br><br><strong>Server-Infrastruktur:</strong> Sicher gehostet über die Render Cloud-Architektur.",
            legal_ap_t: "2. Affiliate-Protokoll",
            legal_ap_d: "Bestimmte externe ausgehende Knoten (Links), die von diesem System bereitgestellt werden, sind als Affiliate-Links klassifiziert. Wenn eine Transaktion über diese Routing-Kanäle abgeschlossen wird, erhält der Systembetreiber eine Provision. Dies ändert nichts an den zugrunde liegenden Transaktionskosten für den Benutzer.",
            legal_op_t: "3. Systembetreiber"
        },
        ru: {
            chat_header: ">_ run Enzyklopedia.sh",
            api_lamp_online: "Энциклопедия доступна", api_lamp_offline: "сейчас недоступна", api_lamp_check: "проверка соединения",
            chat_welcome: "Соединение установлено. Я Энциклопедия. В чем заключается ваш запрос?",
            chat_subtext_1: "> Ваш диалог расширяет систему как анонимный узел в графе знаний.",
            chat_subtext_2: "> Пожалуйста, используйте ваш родной язык – Энциклопедия стремится к универсальному многоязычию.",
            chat_placeholder: "Введите запрос...",
            
            store_header: ">_ access store.dir",
            store_title: "ОФИЦИАЛЬНЫЙ МАГАЗИН",
            store_desc: "Приобретите полные издания наших публикаций.",
            store_item_1: "[ПРЕДМЕТ] Schweinerei 1: The Invitation",
            store_item_2: "[ПРЕДМЕТ] Physik der Beziehungen",
            store_format: "> Формат: Печать / Цифровой / Аудио",
            store_purchase: "[МОДУЛЬ ПОКУПКИ]",
            store_dir_1: "[DIR] Schweinerei 1: The Invitation",
            store_dir_2: "[DIR] Physik der Beziehungen",
            chat_boot_1: "> THE OPEN BOOK · Schweinerei 1: The Invitation · Physik der Beziehungen",
            chat_boot_2: "> Фрагменты и аудио в Магазине. Вопросы Энциклопедии ниже.",
            status_offline: "> Сервер недоступен. Аудио, визуализация и фрагменты работают.",
            status_warming: "> Соединение с сервером...",
            status_error: "> Ошибка передачи. Попробуйте ещё раз.",
            status_http: "> Сервер ответил ошибкой.",
            log_offline: "> Публичный журнал недоступен. Повторная попытка выполняется автоматически...",
            log_empty: "> Записей пока нет. Станьте первым узлом.",
            log_sent: "> Запись сохранена.",
            log_limit: "> Слишком быстро. Подождите несколько минут до следующей записи.",
            log_hint: "> Записи публичны. Пожалуйста, не указывайте личные данные.",
            log_err_empty: "> Отклонено: запись пуста.",
            log_err_too_long: "> Отклонено: слишком длинная (макс. 280 символов).",
            log_err_link: "> Отклонено: ссылки и адреса запрещены.",
            log_err_blocked: "> Отклонено: запись содержит запрещённые слова.",
            log_err_duplicate: "> Отклонено: такая запись только что уже отправлена.",
            log_err_server: "> Не удалось сохранить запись. Попробуйте позже.",
            votes_local: "локально",
            sample_missing: "> Фрагмент ещё не загружен.",
            purchase_routing: "> Переход к продавцу...",
            purchase_open: "[ОТКРЫТЬ СТРАНИЦУ ПРОДАВЦА]",
            purchase_error: "> Ошибка перенаправления.",
            mic_denied: "> Доступ к микрофону запрещён или не поддерживается.",
            mic_recording: "> Запись... нажмите ⏹, чтобы остановить и отправить (макс. 60 с)",
            mic_transcribing: "> Транскрипция аудио...",
            stage_stt: "> транскрипция...",
            stage_embed: "> кодирую запрос...",
            stage_retrieve: "> загружаю контекст...",
            stage_generate: "> генерирую...",
            stage_reasoning: "> размышляю...",
            stage_retry: "> повтор с резервной моделью...",
            throne_header: ">_ throne.exe",
            throne_hint: "> Держи трон пустым. Кликни по тому, кто приближается.",
            throne_empty_for: "пуст уже", throne_dismissed: "отогнано", throne_occupied: "захватов", throne_record: "рекорд",
            throne_state_empty: "[ПУСТ]", throne_state_occupied: "[ЗАНЯТ]",
            arch_king: "король", arch_priest: "жрец", arch_merchant: "торговец", arch_algorithm: "алгоритм",
            arch_author: "автор", arch_prophet: "пророк", arch_clerk: "чиновник", arch_star: "инфлюенсер",
            timing_cached: "из кэша",
            
            settings_header: ">_ conf vis", mode_standard: "Стандарт", mode_hardcore: "Хардкор", mode_simple: "Просто", fmt_print: "[ПЕЧАТЬ]", fmt_digital: "[ЦИФРА]", fmt_audio: "[АУДИО]", fmt_pdf: "[PDF]", audio_next: "ДАЛЕЕ", audio_bild: "КАДР", baum_sprache_aria: "Язык аудио", baum_sprache_folgt: "скоро", settings_fs_enter: "[ НА ВЕСЬ ЭКРАН ]", settings_fs_exit: "[ ВЫЙТИ ИЗ ПОЛНОЭКРАННОГО ]", backlog_pending: "[В ОЖИДАНИИ]", backlog_paid: "[ПЛАТНЫЙ УРОВЕНЬ]", aria_maximize: "Развернуть окно", aria_minimize: "Свернуть или восстановить окно", aria_send: "Отправить", aria_mic: "Записать голосовой ввод", aria_send_public: "Отправить публичное сообщение", aria_upvote: "Проголосовать", audio_err_blocked: "Ошибка: поток заблокирован / офлайн", audio_err_cors: "Ошибка: поток недоступен / CORS", audio_err_file: "Ошибка: файл недоступен", audio_err_any: "Ошибка: поток/файл недоступен", friends_auth: "> Проверка токена...", friends_download_secure: "[СКАЧАТЬ ЗАЩИЩЁННЫЙ ФАЙЛ]", friends_download: "[СКАЧАТЬ]", legal_contact: "Контакт:", lang_header: ">_ lang.sh", vis_cmd_aria: "Командная строка", vis_cmd_on: "root@schweinerei:~# микшер, trace, flash, auto mod открыты — 'exit' снова закрывает", vis_cmd_off: "root@schweinerei:~# заблокировано", vis_cmd_unknown: "command not found",
            settings_lang: "> системный язык",
            settings_intensity: "ИНТЕНСИВНОСТЬ",
            flash_auto_short: "АВТО", flash_mode_inv_short: "ИНВ", flash_mode_reset_short: "ИНВ+С", flash_btn: "ВСПЫШКА", flash_btn_1: "ВСПЫШКА 1", flash_btn_2: "ВСПЫШКА 2", flash_auto_on: "АВТО: ВКЛ", flash_auto_off: "АВТО: ВЫКЛ", flash_mode_inv: "ИНВЕРС", flash_mode_reset: "ИНВЕРС + СБРОС", trace_hold_btn: "TRACE",
            flash_reduced: "Вспышка выключена: включено уменьшение анимации", flash_wait: "Вспышка: не чаще 3 раз в секунду",
            flash_hint: "Клавиши F / G: F = короткая инверсия, G = медленное угасание — обе поверх картинки шейдера (вместе не чаще 3 раз в секунду). Клавиша T: удерживает выгорание TRACE на максимуме, пока нажата, и плавно возвращается к значению слайдера при отпускании. АВТО запускает короткую вспышку при насыщении следа TRACE или пиках музыки, с случайными паузами. Отключено при уменьшении анимации.",
            settings_speed: "СКОРОСТЬ",
            settings_battery: "> расход батареи",
            
            audio_header: ">_ play audio.sh",
            audio_loaded: "> загружено: ",
            audio_play: "PLAY",
            audio_pause: "PAUSE",
            baum_aria: "Каталог аудио", baum_st_bebildert: "с картинками", baum_st_audio: "только аудио", baum_st_folgt: "скоро", baum_weiter: "слушать дальше", baum_gesperrt: "Закрыто – пока не входит в ваш доступ.", baum_folgt: "Скоро.", baum_err: "Каталог недоступен.",
            
            guestbook_header: ">_ tail -f public_log.txt",
            guestbook_placeholder: "Введите публичное сообщение...",
            guestbook_send: "ОТПРАВИТЬ",
            guestbook_loading: "Загрузка журналов...",
            
            friends_open_title: "ОТКРЫТЫЙ ДОСТУП: ПРОМО-ОБРАЗЦЫ",
            friends_open_desc: "Нажмите формат: PDF загружается, AUDIO играет в аудио-окне.",
            friends_restricted_title: "ОГРАНИЧЕННЫЙ ДОСТУП: ПОЛНЫЕ КОПИИ",
            friends_restricted_desc: "Введите код доступа для расшифровки и получения полных изданий.",
            friends_placeholder: "Введите ключ...",
            friends_unlock: "РАЗБЛОКИРОВАТЬ",
            
            about_header: ">_ cat about.txt",
            about_p1: "Этот интерфейс разработан строго для читателей наших публикаций. Для подробного объяснения механики системы и базовой архитектуры обратитесь к нашим книгам. Вы найдете фрагменты знаний («Knowledge drops») и бесплатные образцы в Магазине вместе с полными версиями.",
            about_p2: "В остальном: чувствуйте себя свободно, пообщайтесь с Энциклопедией. Рекомендуем менять уровень сложности во время чата. Начинайте читать или слушать на английском, немецком или русском языках и возвращайтесь, когда будете готовы.",
            about_disclaimer: "> Примечание: Эта страница может потреблять много ресурсов при высокой нагрузке и оптимизирована для больших экранов.",
            about_radio: "> Примечание: Встроенное веб-радио транслирует SomaFM (somafm.com) — станцию без рекламы, существующую на пожертвования слушателей. Мы не связаны с вещателем.",
            
            backlog_header: ">_ cat backlog.txt",
            backlog_title: "СИСТЕМНЫЙ ЖУРНАЛ И ОЧЕРЕДЬ РАЗВЕРТЫВАНИЯ",
            backlog_t1: "Интеграция Голосового Чата",
            backlog_d1: "> Активация аудиопротокола для взаимодействия узлов.",
            backlog_t2: "Конвейер Публикации Документов",
            backlog_t3: "Развертывание Второго Тома",
            backlog_d3: "> Планирование выпуска Второго Тома.",
            backlog_t4: "Глобальная Локализация",
            backlog_d4: "> Выполнение дальнейших переводов всех собранных трудов.",
            backlog_t5: "Голос Энциклопедии",
            backlog_d5: "> Голосовой вывод для чата.",
            backlog_waiting: "ожидание выполнения...",
            
            legal_dp_t: "1. Обработка данных",
            legal_dp_d: "<strong>Анонимное хранение:</strong> Ваши взаимодействия (текстовые и голосовые транскрипты) хранятся полностью анонимно, без отслеживания IP, для расширения системного Графа Знаний.<br><br><strong>Внешняя маршрутизация:</strong> Обработка аудио и генерация текста выполняются через внешние API (OpenAI, OpenRouter, Pinecone).<br><br><strong>Серверная инфраструктура:</strong> Безопасный хостинг в облачной архитектуре Render.",
            legal_ap_t: "2. Партнерский протокол",
            legal_ap_d: "Некоторые исходящие узлы (ссылки), предоставленные этой системой, классифицируются как партнерские. При совершении транзакции оператор системы получает комиссию. Это не меняет базовую стоимость для пользователя.",
            legal_op_t: "3. Системный оператор"
        }
    };

    // ==========================================
    // INITIALISIERUNG (DOM READY)
    // ==========================================
    // JOB-145: Nicht-Sofort-Teile (Shader-Start, Thron, Backend-Ping) erst nach dem Laden und im Leerlauf starten.
    function nachDemLaden(fn) {
        const los = () => { if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 2500 }); else setTimeout(fn, 200); };
        if (document.readyState === 'complete') los(); else window.addEventListener('load', los, { once: true });
    }
    document.addEventListener("DOMContentLoaded", () => {
        let aktuelleSprache = localStorage.getItem('lang') || "en";   // F8
        const t = (k) => (i18n[aktuelleSprache] && i18n[aktuelleSprache][k]) || i18n.en[k] || k;

        // ==========================================
        // NOTFIX: API-SCHICHT (Failover-Hook, Offline-Erkennung)
        // ==========================================
        // Reihenfolge = Priorität. HOOK AP8/AP9: CAX als ersten, Cloud als zweiten Eintrag.
        const API_NODES = [
            { name: "cloud", url: "https://enzyklopedie-api.onrender.com" }
            // { name: "cax", url: "https://api.<domain>" }
        ];
        // Pfade relativ zur Node-URL. null = Endpoint existiert noch nicht -> Feature läuft lokal / zeigt OFFLINE.
        const ENDPOINTS = {
            ask: "/ask", askVoice: "/ask-voice", purchase: "/purchase", unlock: "/unlock",   // vorhanden (Render)
            askStream: "/ask/stream", askVoiceStream: "/ask-voice/stream",                  // SSE; bei 404 (altes Backend) Fallback auf ask/askVoice
            health: "/health",        // HOOK AP8: darf 404 liefern, es zählt nur Erreichbarkeit
            log: "/v1/log",          // JOB-120: öffentliches Log; [OFFLINE] nur bei echtem Fehler/Timeout
            votes: null,              // HOOK AP5: "/v1/votes"
            samples: null,            // HOOK AP6: "/v1/store/samples"
            session: null             // HOOK AP2: "/v1/session"
        };
        // Systemmeldungen (Offline-Badge, Stages, Timing) sind standardmäßig aus.
        // Zum Messen im Browser: localStorage.setItem('show_diagnostics','1') und neu laden.
        const SHOW_DIAGNOSTICS = localStorage.getItem('show_diagnostics') === '1';
        let API_BASE_URL = API_NODES[0].url;
        let apiOnline = null;   // null = unbekannt
        let apiEverOk = false;  // true, sobald ein echter Request durchging -> Health-Ping kann das nicht mehr überschreiben

        // JOB-177: kein Text/Badge mehr, nur das kleine Laempchen (gruen/grau). Gaestebuch-OFFLINE-WEG (Rico 26.09.):
        // dieselbe Lampe sitzt auch im Gaestebuchkopf, beide folgen demselben Zustand.
        function setOffline(off) {
            apiOnline = !off;
            for (const lamp of document.querySelectorAll('.api-lamp')) {
                lamp.classList.toggle('is-online', !off);
                lamp.classList.toggle('is-offline', off);   // grau erst nach Probe mit Retry, vorher nur Ring
                const key = off ? 'api_lamp_offline' : 'api_lamp_online';
                lamp.setAttribute('data-i18n-aria', key);
                lamp.setAttribute('aria-label', t(key));
                lamp.title = t(key);
            }
        }

        // Alle Backend-Aufrufe laufen hier durch. HOOK AP2: credentials:'include' ergänzen, sobald das Backend
        // Access-Control-Allow-Credentials setzt (Session-Cookie). Vorher würde CORS mit '*' brechen.
        async function api(path, opts = {}, timeoutMs = 60000) {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), timeoutMs);
            try {
                const res = await fetch(API_BASE_URL + path, { ...opts, signal: ctrl.signal });
                apiEverOk = true;
                if (apiOnline !== true) setOffline(false);
                return res;
            } catch (e) {
                if (e.name !== 'AbortError') pruefeErreichbarkeit();   // Rico 24.09.: ein einzelner Netzhaenger (Ruhezustand, WLAN) ist kein OFFLINE
                throw e;
            } finally { clearTimeout(timer); }
        }

        // Nach einem gescheiterten Request: erst nachpruefen (zwei Health-Pings), dann ggf. OFFLINE.
        // Beim Zurueckkommen (Tab sichtbar, Netz wieder da) wird OFFLINE erneut geprueft und aufgehoben.
        let pruefLaeuft = null;
        function pruefeErreichbarkeit() {
            if (pruefLaeuft) return pruefLaeuft;
            pruefLaeuft = (async () => {
                const node = API_NODES.find(n => n.url === API_BASE_URL) || API_NODES[0];
                const ok = await attemptNode(node);
                setOffline(!ok);
                pruefLaeuft = null;
                return ok;
            })();
            return pruefLaeuft;
        }
        document.addEventListener('visibilitychange', () => { if (!document.hidden && apiOnline === false) pruefeErreichbarkeit(); });
        window.addEventListener('online', () => { if (apiOnline === false) pruefeErreichbarkeit(); });
        setInterval(() => { if (!document.hidden && apiOnline === false) pruefeErreichbarkeit(); }, 60000);

        // Weckruf + weiche Erreichbarkeitsprüfung.
        // NACHBESSERUNG (Rico-Freigabe 2026-09-20): kein AbortController mehr auf dem Weckruf selbst -
        // der Fetch darf die vollen 30-60s eines Render-Kaltstarts durchlaufen, statt künstlich
        // abzubrechen. no-cors: jede HTTP-Antwort (auch 404) zählt als Erfolg, nur ein echter
        // Netzfehler (DNS/Verbindung) gilt als Fehlschlag.
        async function pingHealth(node) {
            await fetch(node.url + ENDPOINTS.health, { mode: 'no-cors', cache: 'no-store' });
            return node;
        }

        // Pro Node zwei Versuche im Abstand von ~9s, bevor wir den Node als tot werten. So übersteht
        // ein einzelner verlorener Weckruf (z. B. Netzhänger) den Start, ohne sofort OFFLINE zu zeigen.
        // Kommt währenddessen ein echter Nutzer-Request durch (apiEverOk), brechen wir früh ab.
        async function attemptNode(node) {
            try {
                await pingHealth(node);
                return true;
            } catch (e1) {
                await new Promise(r => setTimeout(r, 9000));
                if (apiEverOk) return true;
                try {
                    await pingHealth(node);
                    return true;
                } catch (e2) {
                    return false;
                }
            }
        }

        // Offline-Badge erscheint erst, wenn beide Versuche auf allen Nodes scheitern (oder ein echter
        // api()-Request fehlschlägt, siehe api()). Währenddessen zeigt #status-text einen neutralen
        // "Verbinde..."-Hinweis statt "offline".
        async function checkApiHealth() {
            zeigeStatus(t('status_warming'), 'ui');
            for (const node of API_NODES) {
                const ok = await attemptNode(node);
                if (ok) {
                    if (!apiEverOk) API_BASE_URL = node.url;
                    setOffline(false);
                    zeigeStatus('');
                    return node;
                }
            }
            if (!apiEverOk) setOffline(true);
            zeigeStatus('');
            return null;
        }
        
        let activeBg = localStorage.getItem('active_bg') || '1';
        
        // STANDARD SHADER SETTINGS
        let activeShader = parseInt(localStorage.getItem('active_shader')) || 0;
        if(activeShader > 3) { activeShader = 0; localStorage.setItem('active_shader', 0); }
        let currentBrightness = parseFloat(localStorage.getItem('shader_brightness')) || 0.45;
        let storedSpeed = localStorage.getItem('shader_speed');
        let currentSpeed = storedSpeed !== null ? parseFloat(storedSpeed) : 0.2;
        let shaderTime = 0; 
        
        // ADVANCED SHADER SETTINGS
        let isAdvancedMode = localStorage.getItem('adv_mode') === 'true';
        let currentAutoMode = localStorage.getItem('adv_auto_mode') || 'off'; // LFO State
        let advIntensity = [0.0, 0.3, 0.3, 0.3];
        let advSpeed = [0.0, 1.5, 0.2, 0.2];
        let advHue = [0.0, 0.0, 0.0, 0.0];
        let advTime = [0.0, 0.0, 0.0, 0.0];
        let advTrace = parseFloat(localStorage.getItem('adv_trace')) || 0.0;
        
        for(let i=1; i<=3; i++) {
            let sI = localStorage.getItem(`adv_intensity_${i}`);
            let sS = localStorage.getItem(`adv_speed_${i}`);
            let sH = localStorage.getItem(`adv_hue_${i}`);
            if(sI !== null) advIntensity[i] = parseFloat(sI);
            if(sS !== null) advSpeed[i] = parseFloat(sS);
            if(sH !== null) advHue[i] = parseFloat(sH);
        }

        let lastRenderTime = 0;
        let animationFrameId = null;
        
        // Caching slider nodes for fast visual LFO updates
        const sliderNodes = { int: [], spd: [], hue: [] };
        for(let i=1; i<=3; i++) {
            sliderNodes.int[i] = document.querySelector(`.adv-intensity[data-target="${i}"]`);
            sliderNodes.spd[i] = document.querySelector(`.adv-speed[data-target="${i}"]`);
            sliderNodes.hue[i] = document.querySelector(`.adv-hue[data-target="${i}"]`);
        }

        // ----------------------------------------------------
        // 0. AUDIO PLAYER LOGIC
        // ----------------------------------------------------
        // Katalog (bildspur/katalog.json, Fallback bildspur/katalog-inline.js fuer file://) speist Player und Baum.
        // audioDateien[lang] = abspielbare Eintraege (Audio-Pfad vorhanden) in Katalogreihenfolge.
        let katalog = { buecher: [], eintraege: [] };
        const audioDateien = { en: [], de: [], ru: [] };
        const BAUM_SPRACHEN = ['de', 'en', 'ru'];
        const eintragsId = e => `${e.buch}/${e.sprache}/${e.teil}/${e.nr || e.label || '0'}`;
        const buchDef = id => katalog.buecher.find(b => b.id === id) || { id, titel: {}, teile: [] };
        const teilDef = (buch, id) => (buchDef(buch).teile || []).find(x => x.id === id) || { id, titel: {} };
        function anzeigeTitel(e) {
            const l = e.sprache, tl = teilDef(e.buch, e.teil), pre = tl.nr_prefix && tl.nr_prefix[l];
            const kopf = e.label ? e.label : (e.nr ? ((pre || '') + e.nr) : ((tl.titel || {})[l] || ''));
            return `${(buchDef(e.buch).titel || {})[l] || e.buch} · ${kopf}${e.titel ? '. ' + e.titel : ''}`;
        }
        function setzeKatalog(k) {
            katalog = { ...k, eintraege: (k.eintraege || []).map(e => ({ ...e, id: eintragsId(e) })) };
            BAUM_SPRACHEN.forEach(l => { audioDateien[l] = []; });
            katalog.eintraege.forEach(e => {
                if (!e.audio || !audioDateien[e.sprache]) return;
                audioDateien[e.sprache].push({ id: e.id, datei: e.audio, titel: anzeigeTitel(e), regie: e.regie || null, eintrag: e });
            });
        }
        function stueckZuDatei(datei) {
            const name = String(datei || '').split('/').pop();
            for (const lang of BAUM_SPRACHEN) {
                const st = audioDateien[lang].find(x => x.datei.split('/').pop() === name);
                if (st) return { lang, st };
            }
            return null;
        }
        if (window.KATALOG_INLINE) setzeKatalog(window.KATALOG_INLINE);

        // Merkt sich je Sprache, wo man stehengeblieben ist.
        const audioStelle = { en: 0, de: 0, ru: 0 };
        let audioFehlversuche = 0;
        let audioWollteSpielen = false;

        const radioStreamUrl = "https://ice1.somafm.com/defcon-128-mp3";
        const audioPlayer = new Audio();
        audioPlayer.crossOrigin = null;
        const bildspur = Bildspur.erstelle(audioPlayer, { container: '#bildspur-fenster' });
        // JOB-142: BILD-Schalter im Player oeffnet/schliesst das Bildspur-Fenster (Audio laeuft unberuehrt weiter)
        const audioBildBtn = document.getElementById('audio-bild-btn');
        // JOB-147: EINE Transportleiste - fuehrt die Bildspur (Inhalt vorhanden + Fenster offen), blendet
        // audio.sh seine eigene Leiste (PLAY/NEXT/Zeit/Suche) aus; sie fuehrt dann selbst per bs-transport.
        function syncBildFuehrt() {
            const win = document.getElementById('window-audio');
            if (!win) return;
            const fuehrt = !!(bildspur && typeof bildspur.hatInhalt === 'function' && bildspur.hatInhalt() && !bildspur.istZu());
            win.classList.toggle('bild-fuehrt', fuehrt);
        }
        if (audioBildBtn) {
            const bildZeige = () => { const an = !bildspur.istZu(); audioBildBtn.classList.toggle('active', an); audioBildBtn.setAttribute('aria-pressed', an ? 'true' : 'false'); syncBildFuehrt(); };
            audioBildBtn.addEventListener('click', () => { if (bildspur.istZu()) bildspur.oeffne(); else bildspur.schliesse(); });
            document.getElementById('bildspur-fenster').addEventListener('bildspur-zu', bildZeige);
            bildZeige();
        }
        // Regie zu einer Audio-Datei laden (auch fuer Wiederaufnahme aus localStorage / Hoerproben)
        function bildspurFuerDatei(datei) {
            const f = stueckZuDatei(datei);
            if (f && f.st.regie) bildspur.ladeRegie(f.st.regie, f.st.titel).catch(() => {}).finally(syncBildFuehrt);
            else bildspur.ladeRegie({ cues: [] }).finally(syncBildFuehrt);
            return f ? f.st : null;
        }
        
        let aktuelleAudioSprache = BAUM_SPRACHEN.includes(aktuelleSprache) ? aktuelleSprache : "en";   // Vorauswahl = Seitensprache
        let isRadioActive = false;

        const audioBtn = document.getElementById('audio-play-btn');
        const audioSkipBtn = document.getElementById('audio-skip-btn');
        const audioStatusText = document.getElementById('audio-status-text');
        const audioFilename = document.getElementById('audio-filename');
        const audioProgress = document.getElementById('audio-progress');
        const audioTimeText = document.getElementById('audio-time');
        const radioToggleBtn = document.getElementById('radio-toggle-btn');

        // ----------------------------------------------------
        // KATALOG-BAUM (JOB-132): Buch > Sprache > Teil > Eintrag. Datenquelle: setzeKatalog().
        // Zustand (offene Ordner, letzte Stelle) in localStorage 'baum_state'.
        // ----------------------------------------------------
        const baumEl = document.getElementById('baum');
        const baumWeiterBtn = document.getElementById('baum-weiter');
        const baumMeldungEl = document.getElementById('baum-meldung');
        const BAUM_KEY = 'baum_state';
        let bz = {};
        try { bz = JSON.parse(localStorage.getItem(BAUM_KEY) || '{}') || {}; } catch (e) { bz = {}; }
        const baumOffen = new Set(Array.isArray(bz.offen) ? bz.offen : []);
        let baumManuell = !!bz.manuell;          // true, sobald der Nutzer selbst Ordner auf-/zuklappt
        let baumWeiter = bz.weiter || null;      // { id, pos } = letzte Hoerstelle
        let baumAktuellId = null, baumFokusId = null, baumZeilenCache = [], baumMeldungTimer = null;
        const BAUM_MARKE = { bebildert: '◉', audio: '♪', folgt: '…' };
        // Vorbereitung Kaufstatus: heute ist alles 'frei'. Spaeter: window.BS_ZUGANG(eintrag) -> true, wenn freigeschaltet.
        const zugangErlaubt = e => (e.zugang || 'frei') === 'frei' || (typeof window.BS_ZUGANG === 'function' && !!window.BS_ZUGANG(e));

        function baumSpeichern() {
            try { localStorage.setItem(BAUM_KEY, JSON.stringify({ offen: [...baumOffen], manuell: baumManuell, weiter: baumWeiter })); } catch (e) {}
        }
        function baumMeldung(text) {
            baumMeldungEl.textContent = text;
            clearTimeout(baumMeldungTimer);
            if (text) baumMeldungTimer = setTimeout(() => { baumMeldungEl.textContent = ''; }, 4000);
        }
        function eintragText(e) {
            return (e.nr ? e.nr + ' ' : '') + (e.label ? e.label + (e.titel ? '. ' : '') : '') + (e.titel || '');
        }
        function baumZaehle(es) { return `${es.filter(e => e.audio).length}/${es.length}`; }
        function baumStandardOffen() {
            const sp = BAUM_SPRACHEN.includes(aktuelleSprache) ? aktuelleSprache : 'en';
            baumOffen.clear();
            baumOffen.add('b:physik'); baumOffen.add('b:physik/' + sp);
        }
        function baumOeffneBis(e) {
            const b = 'b:' + e.buch, s = `${b}/${e.sprache}`;
            if (!baumManuell) baumOffen.clear();
            baumOffen.add(b); baumOffen.add(s); baumOffen.add(`${s}/${e.teil}`);
        }

        // JOB-173 (Rico 26.09. 14:32): der Baum zeigt nur die aktuelle Hoersprache (laufendes Stueck,
        // sonst die gewaehlte Audiosprache), keine ausgegrauten Baeume der anderen Sprachen mehr.
        function baumAnzeigeSprache() {
            const f = isRadioActive ? null : stueckZuDatei(audioPlayer.getAttribute('data-last-played'));
            const sp = f && f.st && f.st.eintrag && f.st.eintrag.sprache;
            return BAUM_SPRACHEN.includes(sp) ? sp : aktuelleAudioSprache;
        }
        function baumZeilen() {
            const z = [], ui = aktuelleSprache, nurSp = baumAnzeigeSprache();
            katalog.buecher.forEach(b => {
                const es = katalog.eintraege.filter(e => e.buch === b.id && e.sprache === nurSp);
                if (!es.length) return;
                const bid = 'b:' + b.id;
                // JOB-174: Buchtitel in der Hoersprache, nicht in der Seitensprache.
                z.push({ id: bid, art: 'buch', ebene: 1, text: (b.titel || {})[nurSp] || (b.titel || {})[ui] || (b.titel || {}).en || b.id, ordner: true, info: baumZaehle(es) });
                if (!baumOffen.has(bid)) return;
                [nurSp].forEach(sp => {
                    const se = es.filter(e => e.sprache === sp);
                    if (!se.length) return;
                    // JOB-174 (Rico 26.09. 14:38): keine eigene Sprach-Ebene mehr, die Sprache ist ueber
                    // DE | EN | RU schon gewaehlt. Die IDs behalten den Sprachteil (offene Ordner bleiben gueltig).
                    const sid = `${bid}/${sp}`;
                    // JOB-175 (Rico 26.09. 14:42): keine Teil-Ordner (Vorwort/Kapitel) mehr, nur die
                    // Kapitelliste direkt unter dem Buch, in der Reihenfolge der Teile.
                    (b.teile || []).forEach(tl => {
                        se.filter(e => e.teil === tl.id).forEach(e => z.push({ id: e.id, art: 'eintrag', ebene: 2, text: eintragText(e), eintrag: e }));
                    });
                });
            });
            return z;
        }

        function baumRender() {
            baumZeilenCache = baumZeilen();
            baumEl.textContent = '';
            if (!baumZeilenCache.length) { baumEl.textContent = t('baum_err'); return; }
            if (!baumZeilenCache.some(z => z.id === baumFokusId)) baumFokusId = (baumZeilenCache.find(z => z.id === baumAktuellId) || baumZeilenCache[0]).id;
            const frag = document.createDocumentFragment();
            baumZeilenCache.forEach(z => {
                const e = z.eintrag, d = document.createElement('div');
                d.className = 'baum-zeile';
                d.setAttribute('role', 'treeitem');
                d.setAttribute('aria-level', z.ebene);
                d.dataset.id = z.id; d.dataset.art = z.art;
                d.style.paddingLeft = (6 + (z.ebene - 1) * 13) + 'px';
                d.tabIndex = z.id === baumFokusId ? 0 : -1;
                const g = document.createElement('span'); g.className = 'baum-glyph'; g.setAttribute('aria-hidden', 'true');
                const tx = document.createElement('span'); tx.className = 'baum-text'; tx.textContent = z.text; tx.title = z.text;
                if (z.ordner) {
                    const offen = baumOffen.has(z.id);
                    d.setAttribute('aria-expanded', offen ? 'true' : 'false');
                    g.textContent = offen ? '▾' : '▸';
                    d.append(g, tx);
                    const info = document.createElement('span'); info.className = 'baum-info'; info.textContent = z.info; d.append(info);
                } else {
                    const gesperrt = !zugangErlaubt(e), frei = e.audio && !gesperrt;
                    const aktiv = z.id === baumAktuellId;
                    d.classList.toggle('aktiv', aktiv);
                    d.classList.toggle('folgt', !frei);
                    d.setAttribute('aria-selected', aktiv ? 'true' : 'false');
                    if (!frei) d.setAttribute('aria-disabled', 'true');
                    g.textContent = aktiv ? '>' : '·';
                    const m = document.createElement('span'); m.className = 'baum-marke';
                    const st = gesperrt ? '$' : (BAUM_MARKE[e.status] || BAUM_MARKE.audio);
                    m.textContent = st;
                    const stName = gesperrt ? t('baum_gesperrt') : t('baum_st_' + (e.status || 'audio'));
                    m.title = stName;
                    d.setAttribute('aria-label', `${z.text}, ${stName}`);
                    d.append(g, tx, m);
                }
                frag.appendChild(d);
            });
            baumEl.appendChild(frag);
            baumSpracheRender();
        }
        // JOB-142: Sprachschalter DE | EN | RU im Kopf der Baum-Zeile. Gleiches Kapitel in der anderen Sprache; fehlend = ausgegraut "folgt".
        const baumSpracheEl = document.getElementById('baum-sprache');
        const LABEL_GRUPPEN = { prolog: 'prolog', prologue: 'prolog', 'пролог': 'prolog', vorwort: 'vorwort', foreword: 'vorwort', 'предисловие': 'vorwort' };
        const labelKey = l => l ? (LABEL_GRUPPEN[String(l).toLowerCase()] || String(l).toLowerCase()) : '';
        function eintragInSprache(e, l) {
            if (!e) return null;
            return katalog.eintraege.find(x => x.sprache === l && x.buch === e.buch && x.teil === e.teil
                && String(x.nr || '') === String(e.nr || '') && labelKey(x.label) === labelKey(e.label)) || null;
        }
        function baumSpracheRender() {
            if (!baumSpracheEl) return;
            const f = stueckZuDatei(audioPlayer.getAttribute('data-last-played'));
            const cur = isRadioActive ? null : (f && f.st.eintrag);
            baumSpracheEl.textContent = '';
            BAUM_SPRACHEN.forEach((l, i) => {
                if (i) { const sp = document.createElement('span'); sp.className = 'trenner'; sp.setAttribute('aria-hidden', 'true'); sp.textContent = '|'; baumSpracheEl.appendChild(sp); }
                const b = document.createElement('button'); b.type = 'button'; b.dataset.l = l; b.textContent = l.toUpperCase();
                const ziel = cur ? eintragInSprache(cur, l) : null;
                // Rico 26.09.: fehlt das laufende Kapitel in Sprache l, bleibt der Knopf trotzdem klickbar, sofern es
                // in l ueberhaupt Audio gibt (z. B. RU: Roman ja, Physik noch nicht) - sonst kaeme man nie zum RU-Baum.
                const ok = (cur && !!(ziel && ziel.audio && zugangErlaubt(ziel))) || (audioDateien[l].length > 0 && !isRadioActive);
                const aktiv = cur ? cur.sprache === l : (!isRadioActive && l === aktuelleAudioSprache);
                b.classList.toggle('aktiv', aktiv);
                b.classList.toggle('aus', !ok);
                b.setAttribute('aria-pressed', aktiv ? 'true' : 'false');
                if (!ok) { b.setAttribute('aria-disabled', 'true'); b.title = l.toUpperCase() + ' · ' + t('baum_sprache_folgt'); }
                baumSpracheEl.appendChild(b);
            });
        }
        if (baumSpracheEl) baumSpracheEl.addEventListener('click', ev => {
            const b = ev.target.closest('button[data-l]');
            if (!b) return;
            const l = b.dataset.l;
            if (b.classList.contains('aus')) { baumMeldung(t('baum_folgt')); return; }
            if (b.classList.contains('aktiv')) return;
            baumMeldung('');
            const f = stueckZuDatei(audioPlayer.getAttribute('data-last-played'));
            const laeuft = !audioPlayer.paused && !audioPlayer.ended;
            const kand = f ? eintragInSprache(f.st.eintrag, l) : null;
            const ziel = kand && kand.audio && zugangErlaubt(kand) ? kand : null;
            if (ziel) baumSpiele(ziel, 0, laeuft);
            else { aktuelleAudioSprache = l; loadAudioForLanguage(l, false); }
        });
        function baumZeileEl(id) { return Array.from(baumEl.children).find(c => c.dataset.id === id); }
        function baumFokus(id, scroll) {
            baumFokusId = id;
            baumEl.querySelectorAll('.baum-zeile').forEach(c => { c.tabIndex = c.dataset.id === id ? 0 : -1; });
            const el = baumZeileEl(id);
            if (el) { el.focus({ preventScroll: true }); if (scroll !== false) el.scrollIntoView({ block: 'nearest' }); }
        }
        function baumUmschalten(z, an) {
            const offen = an === undefined ? !baumOffen.has(z.id) : an;
            if (offen === baumOffen.has(z.id)) return;
            offen ? baumOffen.add(z.id) : baumOffen.delete(z.id);
            baumManuell = true;
            baumSpeichern(); baumRender(); baumFokus(z.id);
        }
        function baumSpiele(e, pos, autoPlay = true) {
            if (isRadioActive) { isRadioActive = false; radioToggleBtn.classList.remove('active'); }
            const l = e.sprache, i = audioDateien[l].findIndex(x => x.id === e.id);
            if (i < 0) return;
            aktuelleAudioSprache = l;
            audioStelle[l] = i;
            loadAudioForLanguage(l, autoPlay);
            if (pos > 0) audioPlayer.addEventListener('loadedmetadata', () => { if (pos < audioPlayer.duration) audioPlayer.currentTime = pos; }, { once: true });
        }
        function baumAktivieren(z) {
            if (z.ordner) return baumUmschalten(z);
            const e = z.eintrag;
            if (!e.audio) { baumMeldung(t('baum_folgt')); return; }
            if (!zugangErlaubt(e)) { baumMeldung(t('baum_gesperrt')); return; }
            baumMeldung('');
            baumSpiele(e);
        }

        // Aktives Stueck im Baum markieren und (beim Wechsel) seine Ordner oeffnen.
        function aktualisiereKapitelWahl(datei) {
            const f = stueckZuDatei(datei);
            baumAktuellId = f ? f.st.id : null;
            if (f) {
                baumOeffneBis(f.st.eintrag);
                audioStelle[f.lang] = audioDateien[f.lang].indexOf(f.st);
                baumFokusId = f.st.id;
                baumSpeichern();
            }
            baumRender();
            const el = baumAktuellId && baumZeileEl(baumAktuellId);
            if (el) el.scrollIntoView({ block: 'nearest' });
            baumWeiterZeigen();
        }

        baumEl.addEventListener('click', ev => {
            const el = ev.target.closest('.baum-zeile');
            if (!el) return;
            const z = baumZeilenCache.find(x => x.id === el.dataset.id);
            if (!z) return;
            baumFokusId = z.id;
            baumAktivieren(z);
            const neu = baumZeileEl(z.id);
            if (neu) baumFokus(z.id, false);
        });
        baumEl.addEventListener('keydown', ev => {
            const el = ev.target.closest('.baum-zeile');
            if (!el || ev.altKey || ev.ctrlKey || ev.metaKey) return;
            const i = baumZeilenCache.findIndex(x => x.id === el.dataset.id);
            if (i < 0) return;
            const z = baumZeilenCache[i];
            let ziel = null;
            switch (ev.key) {
                case 'ArrowDown': ziel = baumZeilenCache[Math.min(i + 1, baumZeilenCache.length - 1)]; break;
                case 'ArrowUp': ziel = baumZeilenCache[Math.max(i - 1, 0)]; break;
                case 'Home': ziel = baumZeilenCache[0]; break;
                case 'End': ziel = baumZeilenCache[baumZeilenCache.length - 1]; break;
                case 'ArrowRight':
                    if (z.ordner && !baumOffen.has(z.id)) { baumUmschalten(z, true); ev.preventDefault(); return; }
                    if (z.ordner) ziel = baumZeilenCache[i + 1]; break;
                case 'ArrowLeft':
                    if (z.ordner && baumOffen.has(z.id)) { baumUmschalten(z, false); ev.preventDefault(); return; }
                    for (let k = i - 1; k >= 0; k--) if (baumZeilenCache[k].ebene < z.ebene) { ziel = baumZeilenCache[k]; break; }
                    break;
                case 'Enter': case ' ': ev.preventDefault(); baumAktivieren(z); return;
                default: return;
            }
            ev.preventDefault();
            if (ziel) baumFokus(ziel.id);
        });

        // "weiter hoeren": letzte Stelle merken (alle ~5 s beim Hoeren, sicher bei Pause/Verlassen).
        function baumWeiterMerken(erzwingen) {
            if (isRadioActive) return;
            const f = stueckZuDatei(audioPlayer.getAttribute('data-last-played'));
            const pos = audioPlayer.currentTime;
            if (!f || !isFinite(pos)) return;
            if (!erzwingen && baumWeiter && baumWeiter.id === f.st.id && Math.abs(pos - baumWeiter.pos) < 5) return;
            baumWeiter = { id: f.st.id, pos: Math.floor(pos) };
            baumSpeichern(); baumWeiterZeigen();
        }
        function baumWeiterZeigen() {
            const f = baumWeiter && katalog.eintraege.find(x => x.id === baumWeiter.id && x.audio);
            const laeuft = !audioPlayer.paused && !isRadioActive;
            baumWeiterBtn.hidden = !f || laeuft;
            if (!f) return;
            baumWeiterBtn.textContent = `▶ ${t('baum_weiter')} · ${f.sprache.toUpperCase()} ${eintragText(f)} · ${formatTime(baumWeiter.pos)}`;
        }
        baumWeiterBtn.addEventListener('click', () => {
            const e = baumWeiter && katalog.eintraege.find(x => x.id === baumWeiter.id && x.audio);
            if (e && zugangErlaubt(e)) baumSpiele(e, baumWeiter.pos);
        });
        audioPlayer.addEventListener('timeupdate', () => { if (!audioPlayer.paused) baumWeiterMerken(false); });
        audioPlayer.addEventListener('pause', () => { baumWeiterMerken(true); baumWeiterZeigen(); });
        audioPlayer.addEventListener('play', baumWeiterZeigen);
        window.addEventListener('beforeunload', () => { if (!audioPlayer.paused) baumWeiterMerken(true); });

        // Seitensprache wechselt: Beschriftungen neu, ungewaehlt folgt der Baum der Sprache (Vorauswahl).
        function baumNachSprachwechsel() {
            if (!baumManuell && katalog.eintraege.length) {
                baumStandardOffen();
                const f = stueckZuDatei(audioPlayer.getAttribute('data-last-played'));
                if (f) baumOeffneBis(f.st.eintrag);
                baumSpeichern();
            }
            baumRender(); baumWeiterZeigen();
        }
        function baumNachKatalog() {
            if (!bz.offen && !baumOffen.size && katalog.eintraege.length) baumStandardOffen();
            const letzte = audioPlayer.getAttribute('data-last-played');
            if (letzte) aktualisiereKapitelWahl(letzte); else { baumRender(); baumWeiterZeigen(); }
        }
        async function katalogVomServer() {
            if (location.protocol === 'file:') return;   // dort blockiert der Browser fetch(): Inline-Katalog gilt
            try {
                const r = await fetch('bildspur/katalog.json', { cache: 'no-cache' });
                if (!r.ok) return;
                const k = await r.json();
                if (window.KATALOG_INLINE && JSON.stringify(k) === JSON.stringify(window.KATALOG_INLINE)) return;
                setzeKatalog(k);
                baumNachKatalog();
            } catch (e) { /* file:// oder offline: Inline-Katalog bleibt */ }
        }
        // Boot: Inline-Katalog steht synchron bereit (file://); ein Server-Katalog ersetzt ihn, wenn er abweicht.
        const katalogBereit = window.KATALOG_INLINE ? (katalogVomServer(), Promise.resolve()) : katalogVomServer();
        baumNachKatalog();
        katalogBereit.then(() => baumNachKatalog());

        function formatTime(seconds) {
            if(isNaN(seconds) || !isFinite(seconds)) return "LIVE";
            const m = Math.floor(seconds / 60);
            const s = Math.floor(seconds % 60);
            return `${m}:${s < 10 ? '0' : ''}${s}`;
        }

        function loadAudioForLanguage(lang, autoPlay = false, schritt = 0) {
            if (isRadioActive) return;
            audioPlayer.pause();

            const stuecke = audioDateien[lang];
            if (!stuecke || stuecke.length === 0) return;

            const n = stuecke.length;
            audioStelle[lang] = (((audioStelle[lang] + schritt) % n) + n) % n;
            const stueck = stuecke[audioStelle[lang]];

            audioWollteSpielen = autoPlay;
            audioPlayer.src = stueck.datei;
            audioPlayer.setAttribute('data-last-played', stueck.datei);
            if (stueck.regie) {
                bildspur.ladeRegie(stueck.regie, stueck.titel)
                    .catch(() => { /* Buch ohne Bildspur (noch) — Fenster bleibt leer, kein Fehler sichtbar */ })
                    .finally(syncBildFuehrt);
            } else {
                bildspur.ladeRegie({ cues: [] }).finally(syncBildFuehrt); // kein Regie-Buch: Fenster auf Ruhezustand, kein Fetch noetig
            }
            audioFilename.innerText = stueck.titel;
            audioFilename.setAttribute('title', stueck.titel);
            aktualisiereKapitelWahl(stueck.datei);
            audioPlayer.currentTime = 0;
            audioProgress.value = 0;

            if (autoPlay) {
                audioPlayer.play().then(() => {
                    audioBtn.innerText = i18n[aktuelleSprache]['audio_pause'] || 'PAUSE';
                    audioBtn.classList.add('active');
                }).catch(e => console.log(e));
            } else {
                audioBtn.innerText = i18n[aktuelleSprache]['audio_play'] || 'PLAY';
                audioBtn.classList.remove('active');
            }
        }

        radioToggleBtn.addEventListener('click', () => {
            isRadioActive = !isRadioActive;
            audioPlayer.pause();

            if (isRadioActive) {
                radioToggleBtn.classList.add('active');
                audioPlayer.src = radioStreamUrl;
                audioPlayer.load();
                audioFilename.innerText = "DEFCON_TECHNO_STREAM.live";
                audioProgress.value = 100;
                audioTimeText.innerText = "LIVE";
                
                audioPlayer.play().then(() => {
                    audioBtn.innerText = i18n[aktuelleSprache]['audio_pause'] || 'PAUSE';
                    audioBtn.classList.add('active');
                }).catch(e => {
                    audioFilename.innerText = t("audio_err_blocked");
                });
            } else {
                radioToggleBtn.classList.remove('active');
                loadAudioForLanguage(aktuelleAudioSprache, false);
            }
            baumSpracheRender();
        });


        // Laedt ein Stueck nicht, geht der Spieler still zum naechsten weiter.
        // Erst wenn keines der vier laedt, erscheint eine Meldung.
        audioPlayer.addEventListener('loadeddata', () => { audioFehlversuche = 0; });

        audioPlayer.addEventListener('error', () => {
            if (isRadioActive) {
                audioFilename.innerText = t("audio_err_cors");
                audioBtn.innerText = i18n[aktuelleSprache]['audio_play'] || 'PLAY';
                audioBtn.classList.remove('active');
                return;
            }
            const n = (audioDateien[aktuelleAudioSprache] || []).length;
            if (audioFehlversuche < n - 1) {
                audioFehlversuche++;
                loadAudioForLanguage(aktuelleAudioSprache, audioWollteSpielen, 1);
                return;
            }
            audioFehlversuche = 0;
            audioFilename.innerText = t("audio_err_file");
            audioBtn.innerText = i18n[aktuelleSprache]['audio_play'] || 'PLAY';
            audioBtn.classList.remove('active');
        });

        // NEXT geht einen Schritt weiter statt zu wuerfeln.
        audioSkipBtn.addEventListener('click', () => {
            if (isRadioActive) return;
            loadAudioForLanguage(aktuelleAudioSprache, true, 1);
        });

        // Am Ende eines Stuecks von selbst zum naechsten.
        audioPlayer.addEventListener('ended', () => {
            if (isRadioActive) return;
            audioProgress.value = 0;
            // Endet ein Kapitel mit einer Schlusstafel, bleibt sie mindestens 8 s ruhig stehen,
            // bevor das naechste Stueck startet (Rico 24.09. "schluss2 b": Kap. 2 endet 2,8 s nach der Tafel).
            let halteSek = 0;
            const fl = stueckZuDatei(audioPlayer.getAttribute('data-last-played'));
            const rk = fl && fl.st.regie ? (/([^\/]+)\.regie\.json$/.exec(fl.st.regie) || [])[1] : null;
            const inl = rk && window.BILDSPUR_INLINE ? window.BILDSPUR_INLINE[rk] : null;
            const cues = inl && inl.regie && inl.regie.cues;
            const letzter = cues && cues.length ? cues[cues.length - 1] : null;
            if (letzter && letzter.typ === 'tafel' && isFinite(audioPlayer.duration)) {
                halteSek = Math.max(0, 8 - (audioPlayer.duration - letzter.t_start));
            }
            setTimeout(() => {
                if (!audioPlayer.ended) return; // Nutzer hat inzwischen selbst weitergeschaltet
                loadAudioForLanguage(aktuelleAudioSprache, true, 1);
            }, halteSek * 1000);
        });

        audioBtn.addEventListener('click', () => {
            if (audioPlayer.paused) {
                if (!audioPlayer.src && !isRadioActive) loadAudioForLanguage(aktuelleAudioSprache);
                
                audioPlayer.play().then(() => {
                    audioBtn.innerText = i18n[aktuelleSprache]['audio_pause'] || 'PAUSE';
                    audioBtn.classList.add('active');
                }).catch(e => {
                    console.log("Playback failed:", e);
                    audioFilename.innerText = t("audio_err_any");
                });
            } else {
                audioPlayer.pause();
                audioBtn.innerText = i18n[aktuelleSprache]['audio_play'] || 'PLAY';
                audioBtn.classList.remove('active');
            }
        });


        // JOB-87: Play/Pause auch von der Bildspur-Leiste aus -> Beschriftung der Audio-Taste nachziehen (nur bei Zustandswechsel)
        audioPlayer.addEventListener('play', () => {
            if (!audioBtn.classList.contains('active')) { audioBtn.innerText = i18n[aktuelleSprache]['audio_pause'] || 'PAUSE'; audioBtn.classList.add('active'); }
        });
        audioPlayer.addEventListener('pause', () => {
            if (audioBtn.classList.contains('active')) { audioBtn.innerText = i18n[aktuelleSprache]['audio_play'] || 'PLAY'; audioBtn.classList.remove('active'); }
        });

        audioPlayer.addEventListener('timeupdate', () => {
            if (!isRadioActive && audioPlayer.duration) {
                const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
                audioProgress.value = percent;
                audioTimeText.innerText = `${formatTime(audioPlayer.currentTime)} / ${formatTime(audioPlayer.duration)}`;
            } else if (isRadioActive) {
                audioTimeText.innerText = "LIVE";
            }
        });


        audioProgress.addEventListener('input', (e) => {
            if (!isRadioActive && audioPlayer.duration) {
                const seekTime = (e.target.value / 100) * audioPlayer.duration;
                audioPlayer.currentTime = seekTime;
            }
        });

        // ----------------------------------------------------
        // 1. SPRACHE INIT (GLOBAL UI)
        // ----------------------------------------------------
        // JOB-106: Texte, die per JS gesetzt werden (Vollbild-Taste), nach Sprachwechsel nachziehen
        function refreshDynamicTexts() {
            const fs = document.getElementById('os-fullscreen-btn');
            if (fs) fs.innerText = document.fullscreenElement ? t('settings_fs_exit') : t('settings_fs_enter');
            if (window.bsFlashUi) window.bsFlashUi();   // JOB-129b: FLASH-Beschriftungen
        }
        function changeLanguage(lang) {
            aktuelleSprache = lang;
            localStorage.setItem('lang', lang);            // F8
            document.documentElement.lang = lang;           // F8
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (i18n[lang] && i18n[lang][key]) el.innerHTML = i18n[lang][key];
            });
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                if (i18n[lang] && i18n[lang][key]) el.placeholder = i18n[lang][key];
            });
            document.querySelectorAll('[data-i18n-aria]').forEach(el => {
                const key = el.getAttribute('data-i18n-aria');
                if (i18n[lang] && i18n[lang][key]) {
                    el.setAttribute('aria-label', i18n[lang][key]);
                    if (el.classList.contains('api-lamp')) el.title = i18n[lang][key];   // JOB-177: Tooltip fuer die Lampe
                }
            });
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
            });
            refreshDynamicTexts();
            if (window.bsChatBegruessung) window.bsChatBegruessung();   // Rico 24.09. "chat a"
            try { baumNachSprachwechsel(); } catch (e) {}   // JOB-132: Baum-Beschriftung + Sprach-Vorauswahl
            
            if(!audioPlayer.paused && audioPlayer.currentTime > 0) {
                audioBtn.innerText = i18n[lang]['audio_pause'] || 'PAUSE';
            } else {
                audioBtn.innerText = i18n[lang]['audio_play'] || 'PLAY';
            }
        }

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => changeLanguage(btn.getAttribute('data-lang')));
        });
        changeLanguage(aktuelleSprache);

        // JOB-106 Stufe 2: freie Sprachwahl (Tippfeld im Fenster lang.sh, DE/EN/RU-Tasten daneben bleiben fest)
        if (window.SpracheFrei) {
            SpracheFrei.init({
                apiBase: () => API_BASE_URL,
                i18n: i18n,
                builtin: ['en', 'de', 'ru'],
                getBuiltinLang: () => localStorage.getItem('lang') || 'en',
                setActiveLang: (c) => { aktuelleSprache = c; },
                changeLanguage: changeLanguage,
                onApplied: () => { refreshDynamicTexts(); if (window.bsChatBegruessung) window.bsChatBegruessung(); try { audioBtn.innerText = (!audioPlayer.paused && audioPlayer.currentTime > 0) ? t('audio_pause') : t('audio_play'); } catch (e) {} }
            });
            SpracheFrei.mount(document.getElementById('sf-host'));
        }

        // ----------------------------------------------------
        // 2. BACKGROUND IMAGE INIT
        // ----------------------------------------------------
        function setBackground(id) {
            activeBg = id;
            localStorage.setItem('active_bg', id);
            
            if (id === '0') {
                document.getElementById('desktop-bg').style.backgroundImage = 'none';
            } else if (id === '1') {
                document.getElementById('desktop-bg').style.backgroundImage = "url('background.webp')";
            } else if (id === '2') {
                document.getElementById('desktop-bg').style.backgroundImage = "url('background1.webp')";
            } else if (id === '3') {
                document.getElementById('desktop-bg').style.backgroundImage = "url('background2.webp')";
            }
            
            document.querySelectorAll('.bg-btn').forEach(b => {
                b.classList.toggle('active', b.getAttribute('data-bg') === id);
            });
        }

        document.querySelectorAll('.bg-btn').forEach(btn => {
            btn.addEventListener('click', () => setBackground(btn.getAttribute('data-bg')));
        });
        setBackground(activeBg); 

        // ----------------------------------------------------
        // 3. SHADER ENGINE (LONG EXPOSURE BLEND & HUE SHIFT & AUTO LFO)
        // ----------------------------------------------------
        const canvas = document.getElementById("shader-bg");
        const gl = canvas ? canvas.getContext("webgl", { alpha: true, preserveDrawingBuffer: true }) : null;
        const extMinMax = gl ? gl.getExtension('EXT_blend_minmax') : null;
        
        const programs = {};
        const locations = {};

        // UI BINDINGS: STANDARD
        const brightnessSlider = document.getElementById('shader-brightness');
        if (brightnessSlider) {
            brightnessSlider.value = currentBrightness;
            brightnessSlider.addEventListener('input', (e) => {
                currentBrightness = parseFloat(e.target.value);
                localStorage.setItem('shader_brightness', currentBrightness);
            });
        }

        const speedSlider = document.getElementById('shader-speed');
        if (speedSlider) {
            speedSlider.value = currentSpeed;
            speedSlider.addEventListener('input', (e) => {
                currentSpeed = parseFloat(e.target.value);
                localStorage.setItem('shader_speed', currentSpeed);
            });
        }
        
        // UI BINDINGS: ADVANCED
        const advBtn = document.getElementById('advanced-shader-btn');
        const stdControls = document.getElementById('standard-shader-controls');
        const advControls = document.getElementById('advanced-shader-controls');
        
        const autoToggleBtn = document.getElementById('adv-auto-toggle');
        const autoControlsDiv = document.getElementById('adv-auto-controls');

        const traceSlider = document.getElementById('adv-trace');
        if (traceSlider) {
            traceSlider.value = advTrace;
            traceSlider.addEventListener('input', (e) => {
                advTrace = parseFloat(e.target.value);
                localStorage.setItem('adv_trace', advTrace);
            });
        }
        
        function updateAutoUI() {
            if(currentAutoMode === 'off') {
                autoToggleBtn.innerText = 'OFF';
                autoToggleBtn.classList.remove('active');
                autoControlsDiv.style.display = 'none';
            } else {
                autoToggleBtn.innerText = 'ON';
                autoToggleBtn.classList.add('active');
                autoControlsDiv.style.display = 'flex';
                document.querySelectorAll('.auto-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.getAttribute('data-auto') === currentAutoMode);
                });
            }
        }
        
        if(autoToggleBtn) {
            autoToggleBtn.addEventListener('click', () => {
                if(currentAutoMode === 'off') {
                    currentAutoMode = localStorage.getItem('last_auto_mode') || 'standard';
                } else {
                    localStorage.setItem('last_auto_mode', currentAutoMode);
                    currentAutoMode = 'off';
                }
                localStorage.setItem('adv_auto_mode', currentAutoMode);
                updateAutoUI();
            });
        }

        document.querySelectorAll('.auto-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentAutoMode = btn.getAttribute('data-auto');
                localStorage.setItem('adv_auto_mode', currentAutoMode);
                updateAutoUI();
            });
        });
        updateAutoUI();

        function toggleAdvancedUI() {
            if(isAdvancedMode) {
                advBtn.classList.add('active');
                stdControls.style.display = 'none';
                advControls.style.display = 'flex';
                canvas.style.opacity = '1';
                
                if(!animationFrameId) {
                    lastRenderTime = performance.now();
                    animationFrameId = requestAnimationFrame(render);
                }
            } else {
                advBtn.classList.remove('active');
                stdControls.style.display = 'block';
                advControls.style.display = 'none';
                
                if(activeShader === 0) {
                    canvas.style.opacity = '0';
                    if(animationFrameId) {
                        cancelAnimationFrame(animationFrameId);
                        animationFrameId = null;
                    }
                    if(gl) {
                        gl.clearColor(0.0, 0.0, 0.0, 0.0);
                        gl.clear(gl.COLOR_BUFFER_BIT); 
                    }
                } else {
                    canvas.style.opacity = '1';
                }
            }
        }

        if(advBtn) {
            advBtn.addEventListener('click', () => {
                isAdvancedMode = !isAdvancedMode;
                localStorage.setItem('adv_mode', isAdvancedMode);
                toggleAdvancedUI();
            });
        }

        // JOB-147: "sudo vis" statt sichtbarem ADVANCED-Knopf - Mischpult/TRACE/FLASH/AUTO MOD (+ Player-
        // Shaderfeld, das denselben advBtn anklickt) fuer alle da, nur nicht beworben (Rico-Entscheid root a).
        // "exit" nimmt es zurueck. Zustand bleibt der bestehende 'adv_mode' (ueberlebt Reload wie gehabt).
        const visInput = document.getElementById('vis-cmd-input');
        const visEcho = document.getElementById('vis-cmd-echo');
        if (visInput) {
            visInput.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter') return;
                const cmd = visInput.value.trim().toLowerCase();
                visInput.value = '';
                if (cmd === 'sudo vis') {
                    if (!isAdvancedMode && advBtn) advBtn.click();
                    visEcho.textContent = t('vis_cmd_on');
                } else if (cmd === 'exit') {
                    if (isAdvancedMode && advBtn) advBtn.click();
                    visEcho.textContent = t('vis_cmd_off');
                } else if (cmd) {
                    visEcho.textContent = t('vis_cmd_unknown');
                }
            });
        }

        document.querySelectorAll('.adv-intensity').forEach(sl => {
            sl.addEventListener('input', (e) => {
                let target = parseInt(sl.getAttribute('data-target'));
                advIntensity[target] = parseFloat(e.target.value);
                localStorage.setItem(`adv_intensity_${target}`, advIntensity[target]);
            });
        });

        document.querySelectorAll('.adv-speed').forEach(sl => {
            sl.addEventListener('input', (e) => {
                let target = parseInt(sl.getAttribute('data-target'));
                advSpeed[target] = parseFloat(e.target.value);
                localStorage.setItem(`adv_speed_${target}`, advSpeed[target]);
            });
        });

        document.querySelectorAll('.adv-hue').forEach(sl => {
            sl.addEventListener('input', (e) => {
                let target = parseInt(sl.getAttribute('data-target'));
                advHue[target] = parseFloat(e.target.value);
                localStorage.setItem(`adv_hue_${target}`, advHue[target]);
            });
        });

        function updateShaderUI() {
            document.querySelectorAll('.shader-btn').forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.getAttribute('data-shader')) === activeShader);
            });
            if(!isAdvancedMode) {
                if(activeShader === 0) canvas.style.opacity = '0';
                else canvas.style.opacity = '1';
            }
        }

        if (gl) {
            const vertexShaderSrc = `attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }`;
            
            // FADE SHADER FÜR TRACE EFFEKT
            const fragShaderFade = `
                precision mediump float;
                uniform float u_fade;
                void main() {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, u_fade);
                }
            `;

            // VOLUMETRISCHER 3D NEBEL (PLASMA V2)
            const fragShader1 = `
                precision highp float;
                uniform vec2 u_resolution; uniform float u_time; uniform float u_brightness; uniform float u_min_brightness; uniform float u_hue;
                
                vec3 hueShift(vec3 color, float hueOffset) {
                    const vec3 k = vec3(0.57735, 0.57735, 0.57735);
                    float cosAngle = cos(hueOffset * 6.2831853);
                    return color * cosAngle + cross(k, color) * sin(hueOffset * 6.2831853) + k * dot(k, color) * (1.0 - cosAngle);
                }
                
                mat2 rot(float a) {
                    float s = sin(a), c = cos(a);
                    return mat2(c, -s, s, c);
                }

                void main() {
                    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
                    float time = u_time * 0.15; 
                    
                    vec3 ro = vec3(0.0, 0.0, -2.5);
                    vec3 rd = normalize(vec3(uv, 1.0));
                    
                    ro.xz *= rot(time * 0.2);
                    rd.xz *= rot(time * 0.2);
                    ro.yz *= rot(time * 0.15);
                    rd.yz *= rot(time * 0.15);
                    
                    float density = 0.0;
                    vec3 colorAcc = vec3(0.0);
                    
                    float t = 0.0;
                    for(int i = 0; i < 45; i++) {
                        vec3 p = ro + rd * t;
                        
                        vec3 q = p * 1.5; 
                        q.z -= time * 0.5; 
                        
                        float c = 0.0;
                        for (float j = 1.0; j < 4.0; j++) {
                            q.x += 0.6 / j * cos(j * 1.5 * q.y + time);
                            q.y += 0.6 / j * cos(j * 1.5 * q.z + time);
                            q.z += 0.6 / j * cos(j * 1.5 * q.x + time);
                            c += sin(q.x + q.y + q.z);
                        }
                        
                        float v = sin(c * 1.5); 
                        float vDensity = max(0.0, v)*0.4 + pow(max(0.0, 1.0 - abs(v)), 5.0)*0.8; 
                        
                        float mask = smoothstep(3.5, 0.5, length(p)); 
                        vDensity *= mask;
                        
                        density += vDensity * 0.08;
                        
                        vec3 stepCol = mix(vec3(0.0, 0.4, 1.0), vec3(1.0, 0.0, 0.4), sin(c * 0.8 + time)*0.5 + 0.5);
                        colorAcc += stepCol * vDensity * 0.08;
                        
                        t += 0.12; 
                    }
                    
                    float intensity = u_brightness * 2.0 + u_min_brightness;
                    colorAcc = hueShift(colorAcc, u_hue) * intensity;
                    float alpha = clamp(density * intensity * 0.8, 0.0, 0.9);
                    
                    gl_FragColor = vec4(clamp(colorAcc, 0.0, 1.0) * alpha, alpha);
                }
            `;

            // GRID
            const fragShader2 = `
                precision highp float;
                uniform vec2 u_resolution; uniform float u_time; uniform float u_brightness; uniform float u_hue;
                
                vec3 hueShift(vec3 color, float hueOffset) {
                    const vec3 k = vec3(0.57735, 0.57735, 0.57735);
                    float cosAngle = cos(hueOffset * 6.2831853);
                    return color * cosAngle + cross(k, color) * sin(hueOffset * 6.2831853) + k * dot(k, color) * (1.0 - cosAngle);
                }

                float get_height(vec2 p) {
                    float time = u_time * 0.2; 
                    vec2 p2 = p * 0.15; 
                    float z1 = 1.0 - abs(sin(p2.x) * cos(p2.y)); 
                    float z2 = 1.0 - abs(sin(p2.x * 1.31 + time) * cos(p2.y * 1.73 - time));
                    float z3 = 1.0 - abs(sin(p2.x * 2.17) * cos(p2.y * 2.9)); 
                    return pow(z1 * z2 * z3, 1.5) * 14.0; 
                }

                void main() {
                    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
                    float time = u_time * 0.5;
                    
                    float camZ = time * 8.0;
                    float camX = sin(time * 0.4) * 10.0;
                    float camY = 14.5; 
                    
                    vec3 ro = vec3(camX, camY, camZ); 
                    float lookY = camY - 2.0 + sin(time * 0.8) * 3.0; 
                    vec3 ta = vec3(camX + cos(time * 0.3) * 5.0, lookY, camZ + 15.0); 
                    
                    vec3 cw = normalize(ta - ro);
                    vec3 cp = vec3(0.0, 1.0, 0.0);
                    vec3 cu = normalize(cross(cw, cp));
                    vec3 cv = normalize(cross(cu, cw));
                    
                    float pitch = -0.15 + sin(time * 0.5) * 0.1;
                    vec3 rd = normalize(uv.x * cu + (uv.y + pitch) * cv + 1.0 * cw); 

                    float t = 0.0;
                    float h = 0.0;
                    vec3 p;
                    
                    for(int i = 0; i < 200; i++) {
                        p = ro + rd * t;
                        h = get_height(p.xz);
                        float d = p.y - h; 
                        
                        if(d < 0.02 || t > 80.0) break;
                        t += max(0.01, d * 0.2); 
                    }

                    if (t > 80.0) {
                        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
                        return;
                    }

                    vec2 grid_p = p.xz * 3.0; 
                    vec2 grid = abs(fract(grid_p) - 0.5);
                    
                    float thickness = max(0.007, 0.017 / (1.0 + t * 0.1)); 
                    float blur = 0.008; 
                    float fadeX = exp(-t * t * 0.0003); 
                    
                    float lineX = smoothstep(thickness + blur + t*0.002, thickness, grid.x) * fadeX;
                    float lineY = smoothstep(thickness + blur + t*0.002, thickness, grid.y);
                    float line = max(lineX, lineY);
                    
                    vec3 baseCol = hueShift(vec3(0.0, 1.0, 0.3), u_hue);
                    vec3 color = baseCol * (0.2 + h * 0.25);
                    float fog = exp(-t * t * 0.0006);
                    
                    float intensity = clamp(line * fog * u_brightness * 3.0, 0.0, 1.0);
                    // Pre-multiplied Alpha
                    gl_FragColor = vec4(color * intensity, intensity);
                }
            `;

            // ASTRO (TRUE 3D VOLUMETRIC RAYMARCHER)
            const fragShader3 = `
                precision highp float;
                uniform vec2 u_resolution; uniform float u_time; uniform float u_brightness; uniform float u_hue;
                
                vec3 hueShift(vec3 color, float hueOffset) {
                    const vec3 k = vec3(0.57735, 0.57735, 0.57735);
                    float cosAngle = cos(hueOffset * 6.2831853);
                    return color * cosAngle + cross(k, color) * sin(hueOffset * 6.2831853) + k * dot(k, color) * (1.0 - cosAngle);
                }

                mat2 rot(float a) {
                    float s = sin(a), c = cos(a);
                    return mat2(c, -s, s, c);
                }

                void main() {
                    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
                    float time = u_time * 0.25; 
                    
                    float camDist = 2.0; 
                    vec3 ro = vec3(sin(time * 0.4) * camDist, sin(time * 0.3) * 0.5, cos(time * 0.4) * camDist);
                    vec3 ta = vec3(0.0, 0.0, 0.0); 
                    
                    vec3 cw = normalize(ta - ro);
                    vec3 cp = vec3(0.0, 1.0, 0.0);
                    vec3 cu = normalize(cross(cw, cp));
                    vec3 cv = normalize(cross(cu, cw));
                    
                    float roll = time * 0.5;
                    vec3 cu_r = cos(roll)*cu + sin(roll)*cv;
                    vec3 cv_r = -sin(roll)*cu + cos(roll)*cv;
                    
                    vec3 rd = normalize(uv.x * cu_r + uv.y * cv_r + 0.9 * cw); 
                    
                    vec3 col = vec3(0.0);
                    vec3 glow = vec3(0.0);
                    bool hit = false;
                    vec3 hitColor = vec3(0.0);
                    
                    float t = 0.0;
                    for(int j = 0; j < 120; j++) {
                        vec3 p = ro + rd * t;
                        
                        p.xz *= rot(time * 0.5);
                        p.yz *= rot(time * 0.3);
                        
                        float minD = 100.0;
                        float hitI = 0.0;
                        
                        for(int i = 0; i < 4; i++) {
                            float fi = float(i);
                            vec3 rp = p;
                            
                            rp.xz *= rot(time * (2.5 + fi * 1.5) + sin(time * 1.5) * 3.0);
                            rp.yz *= rot(time * (2.0 - fi * 1.0) + cos(time * 1.2));
                            rp.xy *= rot(time * (3.0 + fi * 0.8));
                            
                            float angle = atan(rp.y, rp.x);
                            float deformation = sin(angle * (2.0 + fi) + time * (4.0 + fi * 1.5)) * (0.2 + fi * 0.08);
                            
                            float radius = 0.5 + fi * 0.7 + deformation;
                            
                            vec2 q = vec2(length(rp.xy) - radius, rp.z);
                            float d = length(q) - 0.006; 
                            
                            if (d < minD) {
                                minD = d;
                                hitI = fi;
                            }
                            
                            vec3 ringCol = hueShift(mix(vec3(0.0, 0.6, 1.0), vec3(1.0, 0.0, 0.4), fi / 3.0), u_hue);
                            vec3 fogCol = hueShift(ringCol, 0.5);
                            
                            glow += fogCol * (0.0012 / (abs(d) * abs(d) + 0.0015));
                        }
                        
                        if (minD < 0.0015) {
                            hit = true;
                            hitColor = hueShift(mix(vec3(0.0, 0.6, 1.0), vec3(1.0, 0.0, 0.4), hitI / 3.0), u_hue);
                            break;
                        }
                        
                        t += max(0.004, minD * 0.5); 
                        if(t > 10.0) break;
                    }
                    
                    if (hit) {
                        col = hitColor * 1.2 + glow * 0.08;
                    } else {
                        col = glow * 0.08; 
                    }
                    
                    float vignette = 1.0 - length(uv) * 0.6;
                    col *= vignette;
                    
                    col = clamp(col * u_brightness, 0.0, 1.0);
                    
                    float maxCol = max(col.r, max(col.g, col.b));
                    // Pre-multiplied Alpha return
                    gl_FragColor = vec4(col, maxCol > 0.05 ? maxCol : 0.0);
                }
            `;

            function compile(id, fragSrc) {
                const sFrag = gl.createShader(gl.FRAGMENT_SHADER);
                gl.shaderSource(sFrag, fragSrc); gl.compileShader(sFrag);
                const sVert = gl.createShader(gl.VERTEX_SHADER);
                gl.shaderSource(sVert, vertexShaderSrc); gl.compileShader(sVert);
                const p = gl.createProgram();
                gl.attachShader(p, sVert); gl.attachShader(p, sFrag); gl.linkProgram(p);
                programs[id] = p;
                locations[id] = {
                    pos: gl.getAttribLocation(p, "position"),
                    res: gl.getUniformLocation(p, "u_resolution"),
                    time: gl.getUniformLocation(p, "u_time"),
                    bright: gl.getUniformLocation(p, "u_brightness"),
                    min_b: gl.getUniformLocation(p, "u_min_brightness"),
                    hue: gl.getUniformLocation(p, "u_hue"),
                    fade: gl.getUniformLocation(p, "u_fade")
                };
            }

            compile(1, fragShader1); compile(2, fragShader2); compile(3, fragShader3);
            compile('fade', fragShaderFade);

            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), gl.STATIC_DRAW);


            // ------------------------------------------------------------------
            // FLASH (JOB-129b): kurzer Invers-Flash ueber dem Shaderbild (nur diese Flaeche, nie Texte/Fenster).
            // Ablauf: Bild des Trace-Puffers in eine Textur sichern, Negativ darueber zeichnen, im naechsten Frame das
            // gesicherte Bild exakt zurueckschreiben (bei "Invers + Reset" stattdessen leeren -> Ausbrennung baut neu auf).
            // SH1-3 bleiben unberuehrt: ohne aktiven Flash laeuft kein einziger zusaetzlicher GL-Aufruf.
            // ------------------------------------------------------------------
            const FLASH_MAX_PER_SEC = 3;         // harte Grenze (auch manuell, gilt fuer F+G zusammen)
            const FLASH_MIN_GAP_MS = 334;        // > 1000/3 ms: nie mehr als 3 in einer Sekunde
            // JOB-189b: Taste F = harter Strobe-Hit. Sofort voll, nach FLASH_F_HOLD_MS schlagartig aus (Snap,
            // kein Fade) - soll blind von G (Nachgluehen) unterscheidbar sein.
            const FLASH_F_HOLD_MS = 75;          // Taste F: 60-90 ms sichtbar, danach Snap auf 0
            const FLASH_LEVEL_F = 1.0;           // Taste F: volle Invertierung (Strobe-Kontrast)
            // JOB-176: Taste G = langes Nachgluehen. Kurzer Hold, danach quadratischer Ease-out ueber 1500 ms
            // (Bereich 1,2-1,8 s laut Briefing; 1500 ms als Mitte, Ease-out statt linear macht den Ausklang weich/organisch).
            const FLASH_G_HOLD_MS = 60;
            const FLASH_G_FADE_MS = 1500;
            const FLASH_LEVEL_G = 0.85;          // Negativ nie ganz weiss (unveraendert wie vor JOB-189b)
            const FLASH_AUTO_PAUSE_MS = [2000, 5500];   // zufaellige Pause zwischen AUTO-Flashes (Mittel ~3,75 s)
            const FLASH_SAT_THR = 0.16;          // mittlere Helligkeit des Trace-Puffers, ab der AUTO ausloest
            const flash = { active: false, t0: 0, kind: 'f', reset: false, restore: false, log: [], count: 0, autoCount: 0,
                            auto: localStorage.getItem('adv_flash_auto') === '1',
                            mode: localStorage.getItem('adv_flash_mode') === 'inv' ? 'inv' : 'reset',
                            notBefore: 0, nextCheck: 0, sat: 0, lvlAvg: 0, hintUntil: 0, tex: null, tw: 0, th: 0 };
            // JOB-189: Taste T = TRACE-Flash wie eine Flash-Taste am Lichtpult. Solange gehalten -> TRACE
            // (advTrace) auf Maximum (Burn-in voll); beim Loslassen weicher Ruecklauf zum Sliderwert statt
            // hartem Sprung. Der Slider-DOM-Wert und localStorage 'adv_trace' bleiben unberuehrt - nur der
            // Laufzeitwert im Render-Loop wird ueberlagert (kein State-Leck in Slider/Speicher).
            const TRACE_HOLD_MAX = 0.99;   // Slider-Maximum (siehe #adv-trace)
            const TRACE_RELEASE_MS = 250;  // weicher Ruecklauf 200-300 ms laut Briefing
            let traceHeld = false;
            let traceReleaseT0 = 0;
            function traceRuntimeValue(now) {
                if (traceHeld) return TRACE_HOLD_MAX;
                if (traceReleaseT0) {
                    const f = (now - traceReleaseT0) / TRACE_RELEASE_MS;
                    if (f < 1) return TRACE_HOLD_MAX + (advTrace - TRACE_HOLD_MAX) * f;
                    traceReleaseT0 = 0;
                }
                return advTrace;
            }
            // Ausloesen: gleiche Freischaltung wie F/G (nur wirksam, wenn der Render-Loop laeuft) und
            // gleiche reduced-motion-Sperre (kein zusaetzlicher Burn-in-Effekt bei reduzierter Bewegung).
            function traceHoldSet(down) {
                if (down && flashReduced()) return false;
                if (!animationFrameId) return false;
                if (down) { traceHeld = true; traceReleaseT0 = 0; }
                else if (traceHeld) { traceHeld = false; traceReleaseT0 = performance.now(); }
                return true;
            }
            const fragShaderFlash = `
                precision mediump float;
                uniform sampler2D u_tex; uniform vec2 u_res; uniform float u_s; uniform float u_level;
                void main() {
                    vec4 c = texture2D(u_tex, gl_FragCoord.xy / u_res);
                    vec3 neg = u_level * (1.0 - c.rgb);
                    gl_FragColor = vec4(mix(c.rgb, neg, u_s), mix(c.a, 1.0, u_s));
                }
            `;
            compile('flash', fragShaderFlash);
            locations['flash'].tex = gl.getUniformLocation(programs['flash'], 'u_tex');
            locations['flash'].ures = gl.getUniformLocation(programs['flash'], 'u_res');
            locations['flash'].s = gl.getUniformLocation(programs['flash'], 'u_s');
            locations['flash'].level = gl.getUniformLocation(programs['flash'], 'u_level');
            const flashMini = document.createElement('canvas'); flashMini.width = 16; flashMini.height = 9;
            const flashMiniCtx = flashMini.getContext('2d', { willReadFrequently: true });
            function flashReduced() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
            function flashEnv(ms, kind) {
                if (ms < 0) return 0;
                if (kind === 'g') {
                    if (ms < FLASH_G_HOLD_MS) return Math.max(0.5, Math.min(1, ms / 30));
                    const t = (ms - FLASH_G_HOLD_MS) / FLASH_G_FADE_MS;
                    const f = 1 - t;
                    return f > 0 ? f * f : 0; // Ease-out: weicher, laenger sichtbarer Ausklang statt linear
                }
                // Strobe-Hit: kein Ramp, kein Fade - voller Pegel bis HOLD_MS, danach schlagartig 0.
                return ms < FLASH_F_HOLD_MS ? 1 : 0;
            }
            function flashSaveFrame() {
                const w = canvas.width, h = canvas.height;
                if (!flash.tex) {
                    flash.tex = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, flash.tex);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                }
                gl.bindTexture(gl.TEXTURE_2D, flash.tex);
                if (flash.tw !== w || flash.th !== h) {
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                    flash.tw = w; flash.th = h;
                }
                gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, w, h);
            }
            // Zeichnet die gesicherte Textur, s = 0: Originalbild (Rueckschreiben), s > 0: Richtung Negativ.
            // level: Invertierungsstaerke (F = FLASH_LEVEL_F, G = FLASH_LEVEL_G); bei s = 0 ohne Wirkung.
            function flashDrawTex(s, level) {
                const p = programs['flash'], loc = locations['flash'];
                gl.disable(gl.BLEND);
                gl.useProgram(p);
                gl.enableVertexAttribArray(loc.pos);
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.vertexAttribPointer(loc.pos, 2, gl.FLOAT, false, 0, 0);
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, flash.tex);
                gl.uniform1i(loc.tex, 0);
                gl.uniform2f(loc.ures, canvas.width, canvas.height);
                gl.uniform1f(loc.s, s);
                gl.uniform1f(loc.level, level === undefined ? FLASH_LEVEL_G : level);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
            }
            function flashSaturation() {
                // Mittlere Helligkeit des Trace-Puffers: Canvas auf 16x9 herunterrechnen, Mittel aus max(r,g,b) * alpha
                try {
                    flashMiniCtx.clearRect(0, 0, 16, 9);
                    flashMiniCtx.drawImage(canvas, 0, 0, 16, 9);
                    const d = flashMiniCtx.getImageData(0, 0, 16, 9).data;
                    let sum = 0;
                    for (let i = 0; i < d.length; i += 4) sum += Math.max(d[i], d[i + 1], d[i + 2]) * d[i + 3];
                    return sum / (144 * 255 * 255);
                } catch (e) { return 0; }
            }
            function flashLevelNow() {
                try { if (typeof window.bsAudioLevel === 'function') return Math.max(0, Math.min(1, +window.bsAudioLevel() || 0)); } catch (e) { /* kein Pegel */ }
                return -1;
            }
            function flashUi() {
                const b1 = document.getElementById('adv-flash-btn-1'), b2 = document.getElementById('adv-flash-btn-2'),
                      a = document.getElementById('adv-flash-auto'), m = document.getElementById('adv-flash-mode');
                if (!b1) return;
                const hint = performance.now() < flash.hintUntil;
                const hintTxt = hint ? t(flashReduced() ? 'flash_reduced' : 'flash_wait') : null;
                b1.textContent = hintTxt !== null ? hintTxt : t('flash_btn_1');
                if (b2) b2.textContent = hintTxt !== null ? hintTxt : t('flash_btn_2');
                a.textContent = t(flash.auto ? 'flash_auto_on' : 'flash_auto_off');
                a.classList.toggle('active', flash.auto); a.setAttribute('aria-pressed', flash.auto ? 'true' : 'false');
                m.textContent = t(flash.mode === 'inv' ? 'flash_mode_inv' : 'flash_mode_reset');
            }
            window.bsFlashUi = flashUi;
            function flashMsg() {
                flash.hintUntil = performance.now() + 2500;
                flashUi();
                setTimeout(flashUi, 2600);
            }
            // Ausloesen (manuell oder AUTO). kind: 'f' = kurzer harter Blitz (Taste F), 'g' = Nachgluehen (Taste G).
            // Ratenbegrenzung (max. 3/s) gilt fuer F+G gemeinsam (ein log-Array). false = nicht ausgeloest.
            function flashTrigger(quelle, kind) {
                kind = kind === 'g' ? 'g' : 'f';
                if (flashReduced()) { if (quelle !== 'auto') flashMsg(); return false; }
                if (!animationFrameId) return false;
                const now = performance.now();
                flash.log = flash.log.filter(x => now - x < 1000);
                if (flash.log.length >= FLASH_MAX_PER_SEC || (flash.log.length && now - flash.log[flash.log.length - 1] < FLASH_MIN_GAP_MS)) {
                    if (quelle !== 'auto') flashMsg();
                    return false;
                }
                flash.log.push(now);
                flash.count++; if (quelle === 'auto') flash.autoCount++;
                flash.active = true; flash.t0 = now; flash.kind = kind; flash.reset = flash.mode === 'reset';
                return true;
            }
            // Vor dem Fade/Clear des Frames: Flash-Bild des Vorframes zuruecknehmen. true = Puffer leeren statt Fade.
            function flashBeforeFrame(currentTrace) {
                if (!flash.restore) return false;
                flash.restore = false;
                if (flash.reset || currentTrace <= 0.0) return true;
                flashDrawTex(0.0);
                return false;
            }
            // Nach dem Zeichnen des Frames: Flash-Bild darueberlegen.
            function flashAfterFrame() {
                if (flash.active) {
                    const s = flashEnv(performance.now() - flash.t0, flash.kind);
                    if (s > 0) { flashSaveFrame(); flashDrawTex(s, flash.kind === 'g' ? FLASH_LEVEL_G : FLASH_LEVEL_F); flash.restore = true; }
                    else flash.active = false;
                    return;
                }
                if (!flash.auto || flashReduced()) return;
                const now = performance.now();
                if (now < flash.nextCheck) return;
                flash.nextCheck = now + 250;
                flash.sat = flashSaturation();
                const lvl = flashLevelNow();
                let peak = false;
                if (lvl >= 0) { peak = lvl > 0.7 && lvl - flash.lvlAvg > 0.25; flash.lvlAvg += (lvl - flash.lvlAvg) * 0.2; }
                if (now < flash.notBefore) return;
                if (flash.sat > FLASH_SAT_THR || peak) {
                    if (flashTrigger('auto')) flash.notBefore = now + FLASH_AUTO_PAUSE_MS[0] + Math.random() * (FLASH_AUTO_PAUSE_MS[1] - FLASH_AUTO_PAUSE_MS[0]);
                }
            }
            const flashBtn1El = document.getElementById('adv-flash-btn-1');
            if (flashBtn1El) flashBtn1El.addEventListener('click', () => flashTrigger('hand', 'f'));
            const flashBtn2El = document.getElementById('adv-flash-btn-2');
            if (flashBtn2El) flashBtn2El.addEventListener('click', () => flashTrigger('hand', 'g'));
            // JOB-176: Tasten F (kurz) / G (Nachgluehen) loesen FLASH aus, sofern der Fokus nicht in einem
            // Eingabefeld liegt (Chat, sudo-vis-Zeile, Suche) und kein Modifier gedrueckt ist. Kein Key-Repeat.
            document.addEventListener('keydown', (e) => {
                if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
                const k = e.key;
                if (k !== 'f' && k !== 'F' && k !== 'g' && k !== 'G') return;
                const ae = document.activeElement, tag = ae && ae.tagName;
                if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (ae && ae.isContentEditable)) return;
                if (flashTrigger('hand', (k === 'g' || k === 'G') ? 'g' : 'f')) e.preventDefault();
            });
            const flashAutoEl = document.getElementById('adv-flash-auto');
            if (flashAutoEl) flashAutoEl.addEventListener('click', () => {
                flash.auto = !flash.auto; localStorage.setItem('adv_flash_auto', flash.auto ? '1' : '0');
                if (flash.auto) flash.notBefore = performance.now() + FLASH_AUTO_PAUSE_MS[0];
                flashUi();
            });
            const flashModeEl = document.getElementById('adv-flash-mode');
            if (flashModeEl) flashModeEl.addEventListener('click', () => {
                flash.mode = flash.mode === 'inv' ? 'reset' : 'inv'; localStorage.setItem('adv_flash_mode', flash.mode);
                flashUi();
            });
            flashUi();

            // JOB-189: Taste T haelt TRACE auf Maximum, solange gedrueckt (kein Key-Repeat, kein Feld-Fokus,
            // gleiche Ausnahmen wie F/G). keyup, window-blur und Tab-Wechsel (hidden) loesen zuverlaessig aus,
            // damit nichts haengen bleibt, wenn z.B. beim Halten der Tab verlassen wird.
            const traceBtnEls = document.querySelectorAll('#adv-trace-btn');
            traceBtnEls.forEach((btn) => {
                btn.addEventListener('pointerdown', (e) => {
                    try { btn.setPointerCapture(e.pointerId); } catch (err) { /* kein Capture noetig */ }
                    traceHoldSet(true);
                    e.preventDefault();
                });
                const loslassen = () => traceHoldSet(false);
                btn.addEventListener('pointerup', loslassen);
                btn.addEventListener('pointercancel', loslassen);
                btn.addEventListener('pointerleave', loslassen);
                btn.addEventListener('contextmenu', (e) => e.preventDefault());
            });
            document.addEventListener('keydown', (e) => {
                if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
                if (e.key !== 't' && e.key !== 'T') return;
                const ae = document.activeElement, tag = ae && ae.tagName;
                if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (ae && ae.isContentEditable)) return;
                if (traceHoldSet(true)) e.preventDefault();
            });
            document.addEventListener('keyup', (e) => {
                if (e.key !== 't' && e.key !== 'T') return;
                traceHoldSet(false);
            });
            window.addEventListener('blur', () => traceHoldSet(false));
            document.addEventListener('visibilitychange', () => { if (document.hidden) traceHoldSet(false); });

            // F15: Canvas nur bei Resize dimensionieren, nicht pro Frame
            const RENDER_SCALE = 0.75;
            let resizeTimer = null;
            function sizeCanvas() {
                canvas.width = Math.max(1, Math.floor(window.innerWidth * RENDER_SCALE));
                canvas.height = Math.max(1, Math.floor(window.innerHeight * RENDER_SCALE));
            }
            sizeCanvas();
            window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(sizeCanvas, 150); });

            function render(now) {
                if(!isAdvancedMode && activeShader === 0) return; 
                
                if (!lastRenderTime) lastRenderTime = now;
                let elapsed = now - lastRenderTime;
                
                if (elapsed < 33) {
                    animationFrameId = requestAnimationFrame(render);
                    return;
                }

                let deltaTime = elapsed;
                lastRenderTime = now;
                if(deltaTime > 100) deltaTime = 33; 

                const BASE_SPEED_MULT = 1.5;

                gl.viewport(0, 0, canvas.width, canvas.height);
                
                const currentTrace = isAdvancedMode ? traceRuntimeValue(now) : 0.0;

                const flashClear = flashBeforeFrame(currentTrace);   // JOB-129b: Vor-Flash-Bild zurueckschreiben

                // 1. FADE PASS FÜR TRACE/MOTION BLUR
                if (currentTrace > 0.0 && !flashClear) {
                    gl.enable(gl.BLEND);
                    gl.blendEquation(gl.FUNC_ADD);
                    gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_ALPHA);
                    
                    const pFade = programs['fade'];
                    gl.useProgram(pFade);
                    gl.enableVertexAttribArray(locations['fade'].pos);
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                    gl.vertexAttribPointer(locations['fade'].pos, 2, gl.FLOAT, false, 0, 0);
                    
                    gl.uniform1f(locations['fade'].fade, 1.0 - currentTrace);
                    gl.drawArrays(gl.TRIANGLES, 0, 6);
                } else {
                    gl.clearColor(0.0, 0.0, 0.0, 0.0);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                }

                // 2. DRAW PASS (EIGENTLICHE SHADER)
                gl.enable(gl.BLEND);
                
                if (extMinMax) {
                    gl.blendEquation(extMinMax.MAX_EXT);
                    gl.blendFunc(gl.ONE, gl.ONE);
                } else {
                    gl.blendEquation(gl.FUNC_ADD);
                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                }

                if(isAdvancedMode) {
                    
                    // LFO AUTO MODULATION CALCULATION
                    if(currentAutoMode !== 'off') {
                        const t = now * 0.001; // absolute time in sec
                        const lfo = {
                            'standard': { ib: 0.4, ia: 0.25, sb: [1.0, 0.5, 0.3], sa: [0.5, 0.3, 0.2], fi: [0.3, 0.41, 0.23], fs: [0.2, 0.27, 0.15], hs: 0.05 },
                            'hardcore': { ib: 0.8, ia: 0.7,  sb: [2.5, 1.5, 2.0], sa: [2.0, 1.5, 1.5], fi: [2.5, 3.1, 1.9],  fs: [1.5, 1.8, 1.2], hs: 0.4 },
                            'simple':   { ib: 0.2, ia: 0.1,  sb: [0.3, 0.1, 0.1], sa: [0.1, 0.05, 0.05], fi: [0.1, 0.13, 0.07], fs: [0.05, 0.07, 0.03], hs: 0.005 }
                        };
                        const c = lfo[currentAutoMode];
                        
                        for(let i=1; i<=3; i++) {
                            const k = (i-1) % 3;
                            let phase = i * 2.3;
                            let nInt = c.ib + c.ia * Math.sin(t * c.fi[k] + phase);
                            let nSpd = c.sb[k] + c.sa[k] * Math.sin(t * c.fs[k] + phase);
                            let nHue = (advHue[i] + c.hs * deltaTime * 0.001) % 1.0; 
                            
                            nInt = Math.max(0, Math.min(1.5, nInt));
                            nSpd = Math.max(0, Math.min(5.0, nSpd));
                            
                            advIntensity[i] = nInt;
                            advSpeed[i] = nSpd;
                            advHue[i] = nHue;
                            
                            // Visual Update on DOM (throttled by rAF)
                            if(sliderNodes.int[i]) sliderNodes.int[i].value = nInt;
                            if(sliderNodes.spd[i]) sliderNodes.spd[i].value = nSpd;
                            if(sliderNodes.hue[i] && currentAutoMode !== 'simple') sliderNodes.hue[i].value = nHue;
                        }
                    }

                    for(let i = 1; i <= 3; i++) {
                        advTime[i] += deltaTime * advSpeed[i] * BASE_SPEED_MULT;

                        if(advIntensity[i] > 0.0) {
                            const p = programs[i];
                            const loc = locations[i];
                            gl.useProgram(p);

                            gl.enableVertexAttribArray(loc.pos);
                            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                            gl.vertexAttribPointer(loc.pos, 2, gl.FLOAT, false, 0, 0);

                            gl.uniform2f(loc.res, canvas.width, canvas.height);
                            gl.uniform1f(loc.time, advTime[i] * 0.001);
                            gl.uniform1f(loc.bright, advIntensity[i]);
                            if(loc.min_b) gl.uniform1f(loc.min_b, 0.0);
                            if(loc.hue) gl.uniform1f(loc.hue, advHue[i]);

                            gl.drawArrays(gl.TRIANGLES, 0, 6);
                        }
                    }
                } else {
                    shaderTime += deltaTime * currentSpeed * BASE_SPEED_MULT;

                    const p = programs[activeShader];
                    const loc = locations[activeShader];
                    gl.useProgram(p);
                    
                    gl.enableVertexAttribArray(loc.pos);
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                    gl.vertexAttribPointer(loc.pos, 2, gl.FLOAT, false, 0, 0);
                    
                    gl.uniform2f(loc.res, canvas.width, canvas.height);
                    
                    let finalTime = shaderTime * 0.001;
                    if(activeShader === 1) finalTime *= 1.6;
                    if(activeShader === 2) finalTime *= 0.75;
                    if(activeShader === 3) finalTime *= 0.35;

                    gl.uniform1f(loc.time, finalTime);
                    gl.uniform1f(loc.bright, Math.max(0.1, currentBrightness * (window.throneDim || 1)));
                    if(loc.min_b) gl.uniform1f(loc.min_b, 0.1);
                    if(loc.hue) gl.uniform1f(loc.hue, 0.0);

                    gl.drawArrays(gl.TRIANGLES, 0, 6);
                }
                
                gl.disable(gl.BLEND);
                gl.blendEquation(gl.FUNC_ADD);

                flashAfterFrame();   // JOB-129b: FLASH (nur bei aktivem Flash bzw. AUTO-Pruefung alle 250 ms)

                animationFrameId = requestAnimationFrame(render);
            }

            function setShader(id) {
                activeShader = parseInt(id);
                if(activeShader > 3 || activeShader < 0) activeShader = 0;
                localStorage.setItem('active_shader', activeShader);
                updateShaderUI();
                
                if (gl) {
                    gl.clearColor(0.0, 0.0, 0.0, 0.0);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                }
                
                if(activeShader !== 0) {
                    lastRenderTime = performance.now(); 
                    if(!animationFrameId) animationFrameId = requestAnimationFrame(render);
                } else {
                    if(!isAdvancedMode) {
                        if(animationFrameId) {
                            cancelAnimationFrame(animationFrameId);
                            animationFrameId = null;
                        }
                    }
                }
            }

            document.querySelectorAll('.shader-btn').forEach(btn => {
                btn.addEventListener('click', () => setShader(btn.getAttribute('data-shader')));
            });

            toggleAdvancedUI();
            updateShaderUI();
            
            if(isAdvancedMode || activeShader !== 0) {
                nachDemLaden(() => {   // JOB-145: Shader erst nach dem Laden starten
                    if (!animationFrameId && (isAdvancedMode || activeShader !== 0)) {
                        lastRenderTime = performance.now();
                        animationFrameId = requestAnimationFrame(render);
                    }
                });
            }

            // Schnittstelle fuer die Bildspur: gleiche Shader-Quelle, kein zweiter Shader-Code.
            // Die Bildspur spiegelt dieses Canvas in ihre Buehne (auch im Vollbild sichtbar).
            window.bsShaderApi = {
                canvas: () => canvas,
                t: (k) => t(k),
                flash: () => flashTrigger('hand', 'f'),
                flash2: () => flashTrigger('hand', 'g'),
                traceHold: (down) => traceHoldSet(!!down),
                flashZustand: () => ({ auto: flash.auto, mode: flash.mode, reduced: flashReduced(), hinweis: performance.now() < flash.hintUntil, zaehler: flash.count, autoZaehler: flash.autoCount, saettigung: flash.sat, aktiv: flash.active }),
                laeuft: () => !!animationFrameId,
                wahl: () => isAdvancedMode ? 'mix' : String(activeShader),
                sicherstellen() {
                    if(!isAdvancedMode && activeShader === 0) setShader(parseInt(localStorage.getItem('bs_letzter_shader')) || 1);
                    else if(!animationFrameId) { lastRenderTime = performance.now(); animationFrameId = requestAnimationFrame(render); }
                },
                // JOB-105: komplette Steuerung fuer das Shader-Feld der Bildspur. Lesen aus denselben
                // Variablen, Schreiben ueber die Original-Regler der Seite (gleiche Handler, gleicher Speicher).
                zustand: () => ({
                    adv: isAdvancedMode, aktiv: activeShader, hell: currentBrightness, tempo: currentSpeed,
                    intens: advIntensity.slice(), spd: advSpeed.slice(), hue: advHue.slice(), trace: advTrace, auto: currentAutoMode
                }),
                regler(sel, wert) {
                    const el = document.querySelector(sel); if(!el) return;
                    el.value = wert; el.dispatchEvent(new Event('input', { bubbles: true }));
                },
                klick(sel) { const el = document.querySelector(sel); if(el) el.click(); },
                waehle(w) {
                    if(w === 'mix') {
                        if(!isAdvancedMode) { isAdvancedMode = true; localStorage.setItem('adv_mode', isAdvancedMode); toggleAdvancedUI(); }
                        if(!animationFrameId) { lastRenderTime = performance.now(); animationFrameId = requestAnimationFrame(render); }
                    } else {
                        const n = parseInt(w) || 1;
                        localStorage.setItem('bs_letzter_shader', n);
                        if(isAdvancedMode) { isAdvancedMode = false; localStorage.setItem('adv_mode', isAdvancedMode); toggleAdvancedUI(); }
                        setShader(n);
                    }
                }
            };
        }

        // ----------------------------------------------------
        // 4. LEGAL ANTI-SCRAPING
        // ----------------------------------------------------
        const slot = document.getElementById("protected-operator");
        if (slot) {
            const n = "Porcine Hosting Solution LLC";
            const s = "St. Petersburg Street 1";
            const c = "0102 Tbilisi, Georgia";
            const p1 = "le"; const p2 = "gal"; const p3 = "schweinerei.xyz";
            slot.innerHTML = `${n}<br>${s}<br>${c}<br><br>${t('legal_contact')} <a href="mailto:${p1}${p2}@${p3}">${p1}${p2}@${p3}</a>`;
        }

        // ----------------------------------------------------
        // 5. UPVOTE LOGIK
        // ----------------------------------------------------
        // F7: keine erfundenen Startwerte. Ohne Backend: lokaler Zähler ab 0, als "lokal" markiert.
        // HOOK AP5: ENDPOINTS.votes setzen -> GET /votes {bl_1:{count,mine}}, POST /votes/<item>
        const voteState = {};
        function renderVote(id) {
            const btn = document.querySelector(`.upvote-btn[data-id="${id}"]`);
            const span = document.getElementById('count_' + id);
            const v = voteState[id]; if (!btn || !span || !v) return;
            span.textContent = v.remote ? String(v.count) : `${v.count} · ${t('votes_local')}`;
            btn.classList.toggle('voted', v.mine);
        }
        function initVotesLocal() {
            document.querySelectorAll('.upvote-btn').forEach(btn => {
                const id = btn.getAttribute('data-id');
                const mine = localStorage.getItem('has_voted_' + id) === 'true';
                voteState[id] = { count: mine ? 1 : 0, mine, remote: false };
                renderVote(id);
            });
        }
        async function loadVotesRemote() {
            if (!ENDPOINTS.votes) return;
            try {
                const res = await api(ENDPOINTS.votes, {}, 10000);
                if (!res.ok) return;
                const data = await res.json();
                Object.keys(data).forEach(id => {
                    if (voteState[id]) { voteState[id] = { count: data[id].count | 0, mine: !!data[id].mine, remote: true }; renderVote(id); }
                });
            } catch (e) { /* bleibt lokal */ }
        }
        document.querySelectorAll('.upvote-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id'); const v = voteState[id]; if (!v) return;
                if (v.remote) {
                    try {
                        const res = await api(`${ENDPOINTS.votes}/${encodeURIComponent(id)}`, { method: 'POST' }, 10000);
                        if (res.ok) { const d = await res.json(); v.count = d.count | 0; v.mine = !!d.mine; renderVote(id); }
                    } catch (e) {}
                    return;
                }
                v.mine = !v.mine; v.count += v.mine ? 1 : -1; if (v.count < 0) v.count = 0;
                localStorage.setItem('has_voted_' + id, v.mine);
                renderVote(id);
            });
        });
        initVotesLocal();

        // ----------------------------------------------------
        // 6. WINDOW MANAGEMENT
        // ----------------------------------------------------
        let highestZ = 10;
        let draggedWin = null;
        let isDragging = false, startX, startY, initialX, initialY;

        const bottomWindows = ['window-settings', 'window-audio', 'window-lang', 'window-about'];   // Backlog geparkt

        // Initial setup for docks on mobile
        if (window.innerWidth <= 768) {
            bottomWindows.forEach(id => {
                const el = document.getElementById(id);
                if(el) el.classList.add('minimized');
            });
        }

        const topWindows = ['window-chat', 'window-store', 'window-guestbook'];
        // F3 Desktop: minimierte Top-Fenster stapeln oben, offene darunter kaskadiert (Offset 40px lt. Briefing)
        // -> kein Header wird verdeckt. Fenster, die der Nutzer selbst gezogen hat (data-dragged), werden nicht angefasst.
        function layoutTopWindows() {
            if (window.innerWidth <= 768) return;
            let y = 20;
            const els = topWindows.map(id => document.getElementById(id)).filter(Boolean);
            const place = (w) => { if (w.dataset.dragged) return; w.style.top = y + 'px'; w.style.left = '20px'; w.style.bottom = 'auto'; w.style.right = 'auto'; y += 40; };   // F3
            els.filter(w => w.classList.contains('minimized')).forEach(place);
            els.filter(w => !w.classList.contains('minimized') && !w.classList.contains('fullscreen')).forEach(place);
        }

        document.querySelectorAll('.script-window').forEach(win => {
            const header = win.querySelector('.window-header');
            const toggleBtn = win.querySelector('.toggle-btn');
            const maximizeBtn = win.querySelector('.maximize-btn');
            
            const focusWindow = () => { highestZ += 1; win.style.zIndex = highestZ; };
            win.addEventListener('mousedown', focusWindow);
            win.addEventListener('touchstart', focusWindow, {passive: true});

            if (toggleBtn) {
                toggleBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation(); 
                    const isMinimizing = !win.classList.contains('minimized');
                    win.classList.toggle('minimized');
                    if (isMinimizing) win.classList.remove('fullscreen');
                    const anchor = win.getAttribute('data-anchor') || 'top';
                    
                    if (window.innerWidth <= 768 && !isMinimizing) {
                        // F3 Mobile: pro Anker nur ein offenes Fenster
                        (anchor === 'bottom' ? bottomWindows : topWindows).forEach(id => {
                            if (id !== win.id) {
                                let otherEl = document.getElementById(id);
                                if(otherEl) otherEl.classList.add('minimized');
                            }
                        });
                    }
                    if (anchor === 'top') layoutTopWindows();
                    focusWindow(); 
                    persistState();
                };
            }

            if (maximizeBtn) {
                maximizeBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (win.classList.contains('minimized')) win.classList.remove('minimized');
                    win.classList.toggle('fullscreen');
                    if ((win.getAttribute('data-anchor') || 'top') === 'top') layoutTopWindows();
                    focusWindow();
                    persistState();
                };
            }

            const startDrag = (e) => {
                if (e.target.closest && e.target.closest('.window-controls')) return;
                if (win.classList.contains('fullscreen')) return; 
                if (window.innerWidth <= 768 && win.classList.contains('minimized') && win.getAttribute('data-anchor') === 'bottom') {
                    win.classList.remove('minimized');
                    bottomWindows.forEach(id => {
                        if (id !== win.id) {
                            let otherEl = document.getElementById(id);
                            if(otherEl) otherEl.classList.add('minimized');
                        }
                    });
                    focusWindow();
                    return; 
                }

                const isTouch = e.type.startsWith('touch');
                const clientX = isTouch ? e.touches[0].clientX : e.clientX;
                const clientY = isTouch ? e.touches[0].clientY : e.clientY;

                const rect = win.getBoundingClientRect();
                const anchor = win.getAttribute('data-anchor') || 'top';
                
                startX = clientX; startY = clientY; initialX = rect.left;
                
                if (anchor === 'bottom') {
                    initialY = window.innerHeight - rect.bottom;
                    win.style.bottom = initialY + 'px';
                    win.style.top = 'auto';
                } else {
                    initialY = rect.top;
                    win.style.top = initialY + 'px';
                    win.style.bottom = 'auto';
                }
                
                win.style.left = initialX + 'px';
                win.style.right = 'auto';
                isDragging = true; draggedWin = win;
                document.body.style.userSelect = "none"; 
            };

            header.onmousedown = startDrag;
            header.ontouchstart = startDrag;
        });

        const moveDrag = (e) => {
            if (!isDragging || !draggedWin) return;
            if (e.cancelable) e.preventDefault(); 

            const isTouch = e.type.startsWith('touch');
            const clientX = isTouch ? e.touches[0].clientX : e.clientX;
            const clientY = isTouch ? e.touches[0].clientY : e.clientY;
            
            let newLeft = initialX + (clientX - startX);
            const anchor = draggedWin.getAttribute('data-anchor') || 'top';

            const maxLeft = window.innerWidth - 40;
            const minLeft = -draggedWin.offsetWidth + 40;
            if (newLeft > maxLeft) newLeft = maxLeft;
            if (newLeft < minLeft) newLeft = minLeft;

            draggedWin.style.left = `${newLeft}px`;
            draggedWin.dataset.dragged = '1';

            if (anchor === 'bottom') {
                let newBottom = initialY - (clientY - startY);
                const maxBottom = window.innerHeight - 40;
                if (newBottom > maxBottom) newBottom = maxBottom;
                if (newBottom < 0) newBottom = 0;
                draggedWin.style.bottom = `${newBottom}px`;
            } else {
                let newTop = initialY + (clientY - startY);
                const maxTop = window.innerHeight - 40;
                if (newTop > maxTop) newTop = maxTop;
                if (newTop < 0) newTop = 0;
                draggedWin.style.top = `${newTop}px`;
            }
        };

        const stopDrag = () => {
            isDragging = false; draggedWin = null; document.body.style.userSelect = "";
        };

        // JOB-105: Bildspur-Fenster wie die Terminal-Fenster: verschiebbar am Kopf, nach vorn nur bei Klick.
        (function() {
            const bs = document.getElementById('bildspur-fenster');
            if (!bs) return;
            const vorn = () => {
                if (bs.classList.contains('bs-maximiert') || bs.classList.contains('bs-vollbild')) return;
                highestZ += 1; bs.style.zIndex = highestZ;
            };
            bs.addEventListener('mousedown', vorn);
            bs.addEventListener('touchstart', vorn, {passive: true});
            const start = (e) => {
                if (e.target.closest && e.target.closest('.bs-header-controls')) return;
                if (!e.target.closest || !e.target.closest('.bs-header')) return;
                if (bs.classList.contains('bs-maximiert') || bs.classList.contains('bs-vollbild')) return;
                const touch = e.type.startsWith('touch');
                const cx = touch ? e.touches[0].clientX : e.clientX, cy = touch ? e.touches[0].clientY : e.clientY;
                const r = bs.getBoundingClientRect();
                const x0 = r.left, y0 = window.innerHeight - r.bottom;
                bs.style.left = x0 + 'px'; bs.style.bottom = y0 + 'px'; bs.style.top = 'auto'; bs.style.right = 'auto';
                bs.dataset.dragged = '1';
                document.body.style.userSelect = 'none';
                const move = (ev) => {
                    if (ev.cancelable) ev.preventDefault();
                    const mx = touch ? ev.touches[0].clientX : ev.clientX, my = touch ? ev.touches[0].clientY : ev.clientY;
                    const nl = Math.min(window.innerWidth - 40, Math.max(-bs.offsetWidth + 40, x0 + mx - cx));
                    const nb = Math.min(Math.max(0, window.innerHeight - bs.offsetHeight), Math.max(0, y0 - (my - cy)));   // Kopf bleibt sichtbar
                    bs.style.left = nl + 'px'; bs.style.bottom = nb + 'px';
                };
                const ende = () => {
                    document.removeEventListener(touch ? 'touchmove' : 'mousemove', move);
                    document.removeEventListener(touch ? 'touchend' : 'mouseup', ende);
                    document.body.style.userSelect = '';
                };
                document.addEventListener(touch ? 'touchmove' : 'mousemove', move, {passive: false});
                document.addEventListener(touch ? 'touchend' : 'mouseup', ende);
            };
            bs.addEventListener('mousedown', start);
            bs.addEventListener('touchstart', start, {passive: true});

            // JOB-116: Bildspur-Fenster nur sichtbar, solange Audio laeuft; bei Pause/Stopp verschwindet es ganz (display:none).
            // Ausnahme: Vollbild/maximiert bleibt stehen. Kurze Verzoegerung, damit Kapitel-/Sprachwechsel (pause->play) nicht flackert.
            // Leitstand 24.09.: nur mobil (Ricos Befund war die Handy-Fassung); Desktop behaelt das Fenster wie bisher.
            const nurMobil = () => window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
            let versteckTimer = null;
            // JOB-147: Hoer-Schirm mobil - bildspur nie ueber dem Audiofenster. Solange sie fuehrt
            // (Inhalt vorhanden, sichtbar), klappt audio.sh selbst zu (SND-Dock); sonst kein zweites
            // Fenster im gleichen Bereich. Nur automatisch, was wir selbst zugeklappt haben (autoZu).
            const audioWin = document.getElementById('window-audio');
            let audioAutoZu = false;
            const audioZuKlappen = () => {
                if (!audioWin || !nurMobil() || !(bildspur && bildspur.hatInhalt && bildspur.hatInhalt())) return;
                if (!audioWin.classList.contains('minimized')) { audioWin.classList.add('minimized'); audioAutoZu = true; }
            };
            const audioWiederOeffnen = () => {
                if (audioWin && audioAutoZu) { audioWin.classList.remove('minimized'); audioAutoZu = false; }
            };
            const zeigen = () => {
                clearTimeout(versteckTimer);
                if (bs.classList.contains('bs-versteckt')) { bs.classList.remove('bs-versteckt'); vorn(); if (bildspur && bildspur._shPlan) bildspur._shPlan(); }
                audioZuKlappen();
            };
            const verstecken = () => {
                clearTimeout(versteckTimer);
                versteckTimer = setTimeout(() => {
                    audioWiederOeffnen();
                    if (!nurMobil() || (!audioPlayer.paused && !audioPlayer.ended)) return;
                    if (bs.classList.contains('bs-maximiert') || bs.classList.contains('bs-vollbild')) return;
                    bs.classList.add('bs-versteckt');
                }, 350);
            };
            audioPlayer.addEventListener('play', zeigen);
            audioPlayer.addEventListener('playing', zeigen);
            audioPlayer.addEventListener('pause', verstecken);
            audioPlayer.addEventListener('ended', verstecken);
            if (audioPlayer.paused && nurMobil()) bs.classList.add('bs-versteckt');
            window.addEventListener('resize', () => { if (!nurMobil()) { bs.classList.remove('bs-versteckt'); audioWiederOeffnen(); } else if (audioPlayer.paused) verstecken(); });
        })();

        document.addEventListener('mousemove', moveDrag);
        document.addEventListener('touchmove', moveDrag, {passive: false});
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);

        // ----------------------------------------------------
        // 7. STORE PURCHASE ROUTING
        // ----------------------------------------------------
        function safeHttpsUrl(u) {
            try { const x = new URL(String(u)); return x.protocol === 'https:' ? x.href : null; } catch (e) { return null; }
        }
        function setItemStatus(itemId, text, linkUrl, linkLabel, isError) {
            const slot = document.getElementById('status-' + itemId); if (!slot) return;
            slot.textContent = text || '';
            slot.style.color = isError ? '#dc3545' : '#bbbbbb';
            if (linkUrl) {
                slot.appendChild(document.createTextNode(' '));
                const a = document.createElement('a'); a.href = linkUrl; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = linkLabel;
                slot.appendChild(a);
            }
        }
        // F11/F13: Status direkt am Item; Redirect nur https; kein location.href (Audio läuft weiter); Link statt Popup.
        document.querySelectorAll('.purchase-action').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const itemId = btn.getAttribute('data-item-id');
                const format = btn.getAttribute('data-format') || 'digital';
                setItemStatus(itemId, t('purchase_routing'));
                try {
                    const res = await api(ENDPOINTS.purchase, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ item_id: itemId, format })      // HOOK AP6: format wird vom Backend noch ignoriert
                    }, 20000);
                    if (!res.ok) { setItemStatus(itemId, t('status_http') + ' (' + res.status + ')', null, null, true); return; }
                    const data = await res.json();
                    const url = (data && data.status === 'success') ? safeHttpsUrl(data.redirect_url || data.redirect) : null;
                    if (url) setItemStatus(itemId, '>', url, t('purchase_open'));
                    else setItemStatus(itemId, (data && typeof data.message === 'string') ? data.message : t('purchase_error'), null, null, true);
                } catch (err) { setItemStatus(itemId, t('purchase_error'), null, null, true); }
            });
        });

        // Unlock (F13: kein innerHTML aus API-Daten)
        const promoStatus = document.getElementById('promo-status');
        const promoInput = document.getElementById('promo-code');
        async function checkPromoCode() {
            const code = promoInput.value.trim(); if (!code) return;
            promoStatus.textContent = t('friends_auth'); promoStatus.style.color = '#fff';
            try {
                const res = await api(ENDPOINTS.unlock, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) }, 20000);
                const data = res.ok ? await res.json() : null;
                if (data && data.status === 'success') {
                    promoStatus.textContent = typeof data.message === 'string' ? data.message : '';
                    promoStatus.style.color = '#28a745';
                    // HOOK AP6: künftig data.downloads = [{label, url, expires}]; heute data.download_url
                    const list = Array.isArray(data.downloads) ? data.downloads
                               : (data.download_url ? [{ label: t('friends_download_secure'), url: data.download_url }] : []);
                    list.forEach(d => {
                        const u = safeHttpsUrl(d.url); if (!u) return;
                        promoStatus.appendChild(document.createElement('br'));
                        const a = document.createElement('a'); a.href = u; a.target = '_blank'; a.rel = 'noopener noreferrer';
                        a.textContent = d.label || t('friends_download');
                        a.style.cssText = 'color:#fff;border:1px solid #28a745;padding:5px 10px;text-decoration:none;display:inline-block;margin-top:8px;';
                        promoStatus.appendChild(a);
                    });
                } else {
                    promoStatus.textContent = (data && typeof data.message === 'string') ? data.message : t('status_http');
                    promoStatus.style.color = '#dc3545';
                }
            } catch (e) { promoStatus.textContent = t('status_error'); promoStatus.style.color = '#dc3545'; }
            promoInput.value = '';
        }
        document.getElementById('promo-unlock-btn').addEventListener('click', checkPromoCode);
        promoInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); checkPromoCode(); } });

        // ----------------------------------------------------
        // 8. OS FULLSCREEN TOGGLE
        // ----------------------------------------------------
        const fsBtn = document.getElementById('os-fullscreen-btn');
        if (fsBtn) {
            fsBtn.addEventListener('click', () => {
                if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().catch(err => {
                        console.warn(`Fullscreen error: ${err.message}`);
                    });
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    }
                }
            });

            document.addEventListener('fullscreenchange', () => {
                if (!document.fullscreenElement) {
                    fsBtn.innerText = t("settings_fs_enter");
                    fsBtn.classList.remove('active');
                } else {
                    fsBtn.innerText = t("settings_fs_exit");
                    fsBtn.classList.add('active');
                }
            });
        }

        // ==========================================
        // ENZYKLOPEDIA CHAT LOGIK
        // ==========================================
        let chatHistory = [];
        let aktuellerModus = "standard";

        const modeButtons = document.querySelectorAll("#mode-switches .mode-btn");
        modeButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                modeButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                aktuellerModus = btn.getAttribute("data-mode");
            });
        });

        const chatVerlauf = document.getElementById("chat-verlauf");
        const chatEingabe = document.getElementById("chat-eingabe");
        const textSendenBtn = document.getElementById("text-senden-btn");
        const micBtn = document.getElementById("mic-btn");
        const statusText = document.getElementById("status-text");

        // Markdown-Pipeline (Math-Platzhalter -> marked -> DOMPurify), für fertige und für laufende Nachrichten
        let mathDiagShown = false;
        function mathDiag(reason, detail) {
            console.warn('MathJax-Diagnose:', reason, detail || '');
            if (!mathDiagShown) { mathDiagShown = true; zeigeStatus('> MathJax: ' + reason, 'ui'); setTimeout(() => zeigeStatus(''), 12000); }
        }
        // JOB-145: MathJax lazy nachladen (gleiche URL + SRI wie zuvor im <head>); die Warteschlange wird in MathJax.startup.ready abgearbeitet.
        function ladeMathJax() {
            if (document.getElementById('MathJax-script')) return;
            const sc = document.createElement('script');
            sc.id = 'MathJax-script';
            sc.async = true;
            sc.src = 'https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-mml-svg.js';
            sc.integrity = 'sha384-msWocAZtTDh+149KSxjbRTGVfGbDjiff/j0JX1iu/A/GxxTWSu6ozNemlfkag/8d';
            sc.crossOrigin = 'anonymous';
            document.head.appendChild(sc);
        }
        function typesetMath(target) {
            const els = Array.isArray(target) ? target : [target];
            const mj = window.MathJax;
            const hasMath = els.some(el => /\\\(|\\\[|\$/.test(el.textContent));
            if (mj && typeof mj.typesetPromise === 'function') {
                // Direkt aufrufen wie in der Ursprungsversion; MathJax reiht intern selbst ein.
                mj.typesetPromise(els).then(() => {
                    if (hasMath && !els.some(el => el.querySelector('mjx-container'))) mathDiag('lief, fand aber keine Formel', els[0].textContent.slice(0, 120));
                }).catch(err => mathDiag('Fehler beim Setzen', err.message));
            } else {
                if (!hasMath) return;   // JOB-145: ohne Formel MathJax nicht laden
                (window.__mathQueue = window.__mathQueue || []).push(...els);   // MathJax noch nicht geladen
                ladeMathJax();
                setTimeout(() => {
                    const m = window.MathJax;
                    if (!m || typeof m.typesetPromise !== 'function') mathDiag('Bibliothek nicht geladen (CDN/Adblocker?)', 'script: ' + (document.getElementById('MathJax-script') || {}).src);
                }, 8000);
            }
        }

        function markdownToHtml(text) {
            const mathBlocks = [];
            // Display-Math, \( \), und einzeiliges $…$ vor marked in Sicherheit bringen (sonst frisst marked \[ und _ )
            const mathRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$(?!\$)(?:[^$\n\\]|\\.)+?\$)/g;
            const processedText = text.replace(mathRegex, (match) => { mathBlocks.push(match); return `@@MATH_BLOCK_${mathBlocks.length - 1}@@`; });
            let html = marked.parse(processedText);
            mathBlocks.forEach((block, index) => {
                const safe = block.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                html = html.replace(`@@MATH_BLOCK_${index}@@`, () => safe);
            });
            return DOMPurify.sanitize(html);
        }

        function renderMarkdownInto(div, text, typeset) {
            if (!LIBS_OK) { div.textContent = text; return; }   // F5
            div.innerHTML = markdownToHtml(text);
            if (typeset) typesetMath(div);
        }

        // Streaming: fertige Blöcke bleiben stehen und werden sofort gesetzt, nur der letzte (wachsende) Block wird neu gerendert.
        function renderStreamingInto(div, text, isFinal) {
            if (!LIBS_OK) { div.textContent = text; return; }
            const tpl = document.createElement('template');
            tpl.innerHTML = markdownToHtml(text);
            const fresh = [];
            tpl.content.childNodes.forEach(n => {
                if (n.nodeType === 1) fresh.push(n);
                else if (n.nodeType === 3 && n.textContent.trim()) { const w = document.createElement('div'); w.textContent = n.textContent; fresh.push(w); }
            });
            const old = Array.from(div.children);
            let i = 0;
            while (i < fresh.length && i < old.length && old[i].__src === fresh[i].outerHTML) i++;
            for (let j = old.length - 1; j >= i; j--) old[j].remove();
            for (let j = i; j < fresh.length; j++) { fresh[j].__src = fresh[j].outerHTML; div.appendChild(fresh[j]); }
            const blocks = Array.from(div.children);
            const stableEnd = isFinal ? blocks.length : blocks.length - 1;
            const toSet = blocks.slice(0, stableEnd).filter(el => !el.__typeset && /\\\(|\\\[|\$/.test(el.textContent));
            toSet.forEach(el => { el.__typeset = true; });
            if (toSet.length) typesetMath(toSet);
        }

        // Neue Frage nach oben scrollen, Antwort läuft darunter ein; nichts klebt am unteren Rand.
        function scrollToTop(div) {
            chatVerlauf.scrollTo({ top: Math.max(0, div.offsetTop - chatVerlauf.offsetTop - 8), behavior: 'smooth' });
        }
        let lastUserDiv = null;

        function zeigeNachricht(text, absender, opts = {}) {
            const div = document.createElement("div");
            div.classList.add("nachricht", absender);
            if (absender === "enzyklopedia") renderMarkdownInto(div, text, true);
            else div.textContent = text;
            chatVerlauf.appendChild(div);
            if (absender === "nutzer") { lastUserDiv = div; if (!opts.silent) scrollToTop(div); }
            else if (!opts.silent && lastUserDiv) scrollToTop(lastUserDiv);
            return div;
        }

        // Laufende Antwort: Tokens sammeln, alle 120 ms rendern, am Ende MathJax
        function beginStream() {
            const div = document.createElement("div");
            div.classList.add("nachricht", "enzyklopedia", "streaming");
            chatVerlauf.appendChild(div);
            let text = "", timer = null;
            const flush = () => { timer = null; renderStreamingInto(div, text, false); };
            if (lastUserDiv) scrollToTop(lastUserDiv);
            return {
                append(t) { text += t; if (!timer) timer = setTimeout(flush, 120); },
                finish() { clearTimeout(timer); timer = null; div.classList.remove("streaming"); renderStreamingInto(div, text, true); return text; },
                fail() { clearTimeout(timer); if (!text) div.remove(); else this.finish(); },
                get text() { return text; },
                div
            };
        }

        // SSE über fetch (POST), Events: stage, reasoning, token, transcript, done, error
        async function readSSE(response, onEvent) {
            const reader = response.body.getReader();
            const dec = new TextDecoder();
            let buf = "";
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buf += dec.decode(value, { stream: true });
                let idx;
                while ((idx = buf.indexOf("\n\n")) >= 0) {
                    const block = buf.slice(0, idx); buf = buf.slice(idx + 2);
                    let ev = "message", data = "";
                    block.split("\n").forEach(line => {
                        if (line.startsWith("event:")) ev = line.slice(6).trim();
                        else if (line.startsWith("data:")) data += line.slice(5).trim();
                    });
                    if (ev === "message" && !data) continue;   // Kommentar/Ping
                    let parsed = null;
                    try { parsed = data ? JSON.parse(data) : null; } catch (e) { parsed = { raw: data }; }
                    onEvent(ev, parsed);
                }
            }
        }

        function formatTiming(d) {
            if (!d || !d.timing) return "";
            const tm = d.timing; const parts = [];
            if (tm.ttft) parts.push("ttft " + tm.ttft + "ms");
            if (tm.total) parts.push("total " + (tm.total / 1000).toFixed(1) + "s");
            if (d.cached) parts.push(t('timing_cached'));
            if (d.node) parts.push("node " + d.node);
            return parts.length ? "> " + parts.join(" · ") : "";
        }

        // Ein Stream-Durchlauf: nimmt eine fertige Response, rendert, gibt {answer, transcript} zurück oder wirft
        async function consumeChatStream(response, stream) {
            stream = stream || beginStream();
            let gotDone = null, firstToken = false, transcript = null;
            // Fortschritt bis zum ersten Zeichen ist immer sichtbar (Rückmeldung auf die Eingabe, keine Systemmeldung)
            const t0 = Date.now(); let stageKey = 'stage_generate', reasoningN = 0;
            const showWait = () => {
                if (firstToken) return;
                const secs = Math.round((Date.now() - t0) / 1000);
                zeigeStatus(t(stageKey) + (reasoningN ? ' ' + reasoningN : '') + (secs >= 3 ? ' · ' + secs + 's' : ''), 'ui');
            };
            const waitTimer = setInterval(showWait, 1000);
            try {
                await readSSE(response, (ev, d) => {
                    if (ev === "stage") { stageKey = 'stage_' + (d && d.stage); showWait(); }
                    else if (ev === "reasoning") { stageKey = 'stage_reasoning'; reasoningN = (d && d.n) || 0; showWait(); }
                    else if (ev === "transcript") { transcript = d && d.text; if (transcript) { const u = zeigeNachricht(transcript, "nutzer"); chatVerlauf.insertBefore(u, stream.div); } }
                    else if (ev === "token") { if (!firstToken) { firstToken = true; clearInterval(waitTimer); zeigeStatus(""); } stream.append((d && d.t) || ""); }
                    else if (ev === "done") { gotDone = d; }
                    else if (ev === "error") { const err = new Error((d && d.message) || "stream_error"); err.code = (d && d.code) || "stream_error"; throw err; }
                });
            } catch (e) { clearInterval(waitTimer); stream.fail(); throw e; }
            clearInterval(waitTimer);
            const answer = stream.finish();
            if (!answer) { stream.fail(); zeigeStatus(t('status_error') + ' (empty_answer)', 'error'); return { answer: "", transcript }; }
            zeigeStatus(gotDone ? formatTiming(gotDone) : "");
            return { answer, transcript };
        }

        // kind: 'diag' (nur mit SHOW_DIAGNOSTICS), 'error' (bleibt bis zur nächsten Anfrage stehen), 'ui' (Fortschritt, Mikro-Countdown)
        function zeigeStatus(text, kind = 'diag') {
            if (!text) { statusText.textContent = ''; statusText.style.color = ''; return; }
            if (kind === 'diag' && !SHOW_DIAGNOSTICS) { statusText.textContent = ''; return; }
            statusText.textContent = text;
            statusText.style.color = kind === 'error' ? '#dc3545' : '';
        }

        // AP11: zufällige Gesprächs-ID, nicht aus der Session ableitbar; neu, sobald der Verlauf leer ist
        function conversationId() {
            let id = localStorage.getItem('conv_id');
            if (!id || chatHistory.length === 0 && !localStorage.getItem('chat_history')) {
                id = 'c_' + (crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '').slice(0, 24) : Date.now().toString(36) + Math.random().toString(36).slice(2, 12));
                localStorage.setItem('conv_id', id);
            }
            return id;
        }
        // HOOK AP2: Chatverlauf lokal (max. 40 Nachrichten). Später kommt er aus GET /v1/session.chat.
        function saveChat() { try { localStorage.setItem('chat_history', JSON.stringify(chatHistory.slice(-40))); } catch (e) {} }
        // Rico 24.09. "chat a": Beim Sprachwechsel neue Begruessung unten im Chat, wenn schon ein Verlauf da ist
        // (ohne Verlauf wechselt die feste Begruessung oben ohnehin mit). Nicht im Verlauf gespeichert;
        // mehrere Wechsel hintereinander ersetzen die letzte Wechsel-Begruessung statt zu stapeln.
        window.bsChatBegruessung = function () {
            if (!window.bsChatBereit || chatHistory.length === 0) return;
            const letzte = chatVerlauf.lastElementChild;
            if (letzte && letzte.classList.contains('sprachwechsel')) letzte.remove();
            const div = zeigeNachricht(t('chat_welcome'), 'enzyklopedia', { silent: true });
            div.classList.add('sprachwechsel');
            chatVerlauf.scrollTop = chatVerlauf.scrollHeight;
        };
        function restoreChat() {
            try {
                const h = JSON.parse(localStorage.getItem('chat_history') || '[]');
                if (!Array.isArray(h)) return;
                h.forEach(m => {
                    if (!m || typeof m.content !== 'string') return;
                    const role = m.role === 'user' ? 'user' : 'assistant';
                    zeigeNachricht(m.content, role === 'user' ? 'nutzer' : 'enzyklopedia', { silent: true });
                    chatHistory.push({ role, content: m.content });
                });
                chatVerlauf.scrollTop = chatVerlauf.scrollHeight;
            } catch (e) {}
        }

        async function sendeTextLegacy(text, body, stream) {
            const response = await api(ENDPOINTS.ask, { method: "POST", headers: { "Content-Type": "application/json" }, body }, 600000);   // R1 ohne Streaming braucht Minuten
            if (!response.ok) { stream.fail(); zeigeStatus(t('status_http') + ' (' + response.status + ')', 'error'); return null; }   // F9
            const antwortText = await response.text();
            stream.append(antwortText); stream.finish();
            zeigeStatus("");
            return antwortText;
        }

        async function sendeText() {
            const text = chatEingabe.value.trim();
            if (!text) return;
            chatEingabe.value = "";
            zeigeNachricht(text, "nutzer");
            zeigeStatus(t('status_warming'));
            // F10: nur die letzten 12 Nachrichten. HOOK AP2: entfällt, sobald die History serverseitig liegt.
            const body = JSON.stringify({ text, modus: aktuellerModus, sprache: aktuelleSprache, history: chatHistory.slice(-12), conversation_id: conversationId() });
            const stream = beginStream();   // Antwort-Box mit Caret sofort: sichtbare Aktivität ohne Statustext
            let antwort = null;
            try {
                const response = await api(ENDPOINTS.askStream, {
                    method: "POST", headers: { "Content-Type": "application/json", "Accept": "text/event-stream" }, body
                }, 180000);
                if (response.status === 404 || response.status === 405) {
                    antwort = await sendeTextLegacy(text, body, stream);             // altes Backend ohne /ask/stream
                } else if (!response.ok) {
                    stream.fail(); zeigeStatus(t('status_http') + ' (' + response.status + ')', 'error'); return;
                } else {
                    antwort = (await consumeChatStream(response, stream)).answer;
                }
            } catch (error) {
                stream.fail();
                console.error('chat:', error);
                zeigeStatus(t('status_error') + ' (' + (error.code || error.name || 'network') + ')', 'error');   // Fehler nie als Enzyklopedia-Antwort anzeigen
                return;
            }
            if (antwort) {
                chatHistory.push({ role: "user", content: text });
                chatHistory.push({ role: "assistant", content: antwort });
                saveChat();
            }
        }

        textSendenBtn.addEventListener("click", sendeText);
        chatEingabe.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); sendeText(); } });

        let mediaRecorder; let audioChunks = []; let recTimer = null; let recSeconds = 0;
        const REC_MAX_SECONDS = 60;
        function stopRecording() {
            if (mediaRecorder && mediaRecorder.state === "recording") mediaRecorder.stop();
            if (mediaRecorder && mediaRecorder.stream) mediaRecorder.stream.getTracks().forEach(track => track.stop());
            clearInterval(recTimer); recTimer = null;
            micBtn.classList.remove("aufnahme"); micBtn.innerText = "🎤";
        }

        micBtn.addEventListener("click", async () => {
            if (mediaRecorder && mediaRecorder.state === "recording") { stopRecording(); return; }
            if (!navigator.mediaDevices || !window.MediaRecorder) { zeigeStatus(t('mic_denied'), 'error'); return; }
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                // F12: MIME vom Browser übernehmen (Chrome/Firefox: webm/opus, Safari: mp4)
                const preferred = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
                const mime = preferred.find(m => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) || '';
                mediaRecorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
                audioChunks = [];
                mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunks.push(event.data); };
                mediaRecorder.onstop = async () => {
                    zeigeStatus(t('mic_transcribing'), 'ui');
                    const type = mediaRecorder.mimeType || mime || 'audio/webm';
                    const ext = type.includes('mp4') ? 'mp4' : type.includes('ogg') ? 'ogg' : 'webm';
                    const audioBlob = new Blob(audioChunks, { type });
                    const formData = new FormData();
                    formData.append("audio", audioBlob, "aufnahme." + ext);
                    formData.append("mime", type);                       // HOOK AP4: Backend wandelt per ffmpeg nach WAV
                    formData.append("modus", aktuellerModus);
                    formData.append("sprache", aktuelleSprache);
                    formData.append("history", JSON.stringify(chatHistory.slice(-12)));
                    formData.append("conversation_id", conversationId());
                    try {
                        let response = await api(ENDPOINTS.askVoiceStream, { method: "POST", body: formData, headers: { "Accept": "text/event-stream" } }, 180000);
                        if (response.status === 404 || response.status === 405) {
                            // altes Backend: JSON-Antwort
                            response = await api(ENDPOINTS.askVoice, { method: "POST", body: formData }, 600000);
                            if (!response.ok) { zeigeStatus(t('status_http') + ' (' + response.status + ')', 'error'); return; }
                            const daten = await response.json();
                            if (typeof daten.transcription === 'string') { zeigeNachricht(daten.transcription, "nutzer"); chatHistory.push({ role: "user", content: daten.transcription }); }
                            if (typeof daten.antwort === 'string') { zeigeNachricht(daten.antwort, "enzyklopedia"); chatHistory.push({ role: "assistant", content: daten.antwort }); }
                            saveChat(); zeigeStatus(""); return;
                        }
                        if (!response.ok) { zeigeStatus(t('status_http') + ' (' + response.status + ')', 'error'); return; }
                        const r = await consumeChatStream(response);
                        if (r.transcript) chatHistory.push({ role: "user", content: r.transcript });
                        if (r.answer) chatHistory.push({ role: "assistant", content: r.answer });
                        saveChat();
                    } catch (error) { console.error('voice:', error); zeigeStatus(t('status_error') + ' (' + (error.code || error.name || 'network') + ')', 'error'); }
                };
                mediaRecorder.start(); micBtn.classList.add("aufnahme"); micBtn.innerText = "⏹";
                recSeconds = 0; zeigeStatus(t('mic_recording'), 'ui');
                recTimer = setInterval(() => {
                    recSeconds++;
                    zeigeStatus(t('mic_recording') + ' · ' + (REC_MAX_SECONDS - recSeconds) + 's', 'ui');
                    if (recSeconds >= REC_MAX_SECONDS) stopRecording();
                }, 1000);
            } catch (error) { zeigeStatus(t('mic_denied'), 'error'); }
        });

        // ==========================================
        // NOTFIX: GÄSTEBUCH (F1)
        // JOB-120: GET /v1/log?after=<id>&limit=50 {entries:[{id,ts,lang,text,mine}]}, POST /v1/log {text,lang}; Fehlercodes empty|too_long|link|blocked|duplicate|rate_limited|storage
        // ==========================================
        const gbList = document.getElementById('guestbook-list');
        const gbInput = document.getElementById('guestbook-eingabe');
        const gbSend = document.getElementById('guestbook-senden-btn');
        const gbWin = document.getElementById('window-guestbook');
        let gbLastId = 0; let gbTimer = null; let gbHasEntries = false;

        function gbNotice(text) {
            gbList.textContent = '';
            const d = document.createElement('div');
            d.style.cssText = 'color:#bbbbbb;font-style:italic;font-size:14px;text-align:center;';
            d.textContent = text; gbList.appendChild(d);
        }
        function gbRender(entry) {
            const wrap = document.createElement('div'); wrap.className = 'log-entry' + (entry.mine ? ' mine' : ''); wrap.dataset.id = String(entry.id);
            const meta = document.createElement('div'); meta.className = 'log-meta';
            const ts = entry.ts ? new Date(entry.ts) : null;
            meta.textContent = '> #' + entry.id
                + (ts && !isNaN(ts) ? ' · ' + ts.toISOString().slice(0, 16).replace('T', ' ') : '')
                + (entry.lang ? ' · ' + String(entry.lang).toUpperCase() : '');
            const body = document.createElement('div'); body.className = 'log-text';
            body.textContent = String(entry.text || '');   // nie innerHTML
            wrap.appendChild(meta); wrap.appendChild(body); gbList.appendChild(wrap);
            if ((entry.id | 0) > gbLastId) gbLastId = entry.id | 0;
        }
        const gbStatus = document.getElementById('guestbook-status');
        let gbStatusTimer = null; let gbLoading = false; let gbEverOk = false;
        function zeigeGbStatus(text, isError) {
            gbStatus.textContent = text; gbStatus.style.color = isError ? '#ff8a8a' : 'var(--term-accent)';
            clearTimeout(gbStatusTimer); gbStatusTimer = setTimeout(() => { gbStatus.textContent = ''; }, 7000);
        }
        // Gaestebuch-OFFLINE-WEG: kein eigenes Badge mehr; ein Fehler loest dieselbe Probe wie im Chat aus (2 Pings, 9 s), die Lampe folgt setOffline().
        function gbSetOffline(off) { if (off) pruefeErreichbarkeit(); }
        function gbVisible() { return !gbWin.classList.contains('minimized') && !document.hidden; }
        async function gbLoad() {
            if (!ENDPOINTS.log || gbLoading) return;
            gbLoading = true;
            try {
                // erster Abruf darf einen Render-Kaltstart (30-60 s) abwarten, danach 10 s
                const res = await api(`${ENDPOINTS.log}?after=${gbLastId}&limit=50`, {}, gbEverOk ? 10000 : 60000);
                if (!res.ok) throw new Error('http ' + res.status);
                const data = await res.json();
                const entries = Array.isArray(data.entries) ? data.entries : [];
                gbEverOk = true; gbSetOffline(false);
                if (!gbHasEntries && entries.length === 0) { gbNotice(t('log_empty')); return; }
                if (!gbHasEntries) gbList.textContent = '';
                const known = new Set([...gbList.querySelectorAll('[data-id]')].map(n => n.dataset.id));
                const fresh = entries.filter(e => !known.has(String(e.id)));
                fresh.forEach(gbRender);
                if (entries.length) { gbHasEntries = true; if (fresh.length) gbList.scrollTop = gbList.scrollHeight; }
            } catch (e) {
                gbSetOffline(true);
                if (!gbHasEntries) gbNotice(t('log_offline'));
            } finally { gbLoading = false; }
        }
        const GB_ERRORS = { empty: 'log_err_empty', too_long: 'log_err_too_long', link: 'log_err_link', blocked: 'log_err_blocked', duplicate: 'log_err_duplicate' };
        async function gbSendEntry() {
            const text = gbInput.value.trim(); if (!text || gbSend.disabled) return;
            gbSend.disabled = true;
            try {
                const res = await api(ENDPOINTS.log, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, lang: aktuelleSprache }) }, 60000);
                if (res.status === 429) zeigeGbStatus(t('log_limit'), true);
                else if (res.ok) {
                    gbInput.value = ''; gbSetOffline(false);
                    const entry = await res.json();
                    if (!gbHasEntries) gbList.textContent = '';
                    gbHasEntries = true; gbRender({ ...entry, mine: true }); gbList.scrollTop = gbList.scrollHeight;
                    zeigeGbStatus(t('log_sent'), false);
                } else {
                    let code = ''; try { code = (await res.json()).error.code; } catch (e) {}
                    if (GB_ERRORS[code]) zeigeGbStatus(t(GB_ERRORS[code]), true);
                    else { zeigeGbStatus(t('log_err_server'), true); if (res.status >= 500) gbSetOffline(true); }
                }
            } catch (e) { zeigeGbStatus(t('log_err_server'), true); gbSetOffline(true); }
            gbSend.disabled = false;
        }
        gbSend.addEventListener('click', gbSendEntry);
        gbInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); gbSendEntry(); } });
        // Laden beim Öffnen des Fensters, danach alle 30 s - nur solange das Fenster offen und der Tab sichtbar ist.
        let gbWasMin = gbWin.classList.contains('minimized');
        new MutationObserver(() => { const m = gbWin.classList.contains('minimized'); if (gbWasMin && !m && gbVisible()) gbLoad(); gbWasMin = m; }).observe(gbWin, { attributes: true, attributeFilter: ['class'] });
        document.addEventListener('visibilitychange', () => { if (gbVisible()) gbLoad(); });
        gbTimer = setInterval(() => { if (gbVisible()) gbLoad(); }, 30000);

        // ==========================================
        // NOTFIX: LESEPROBEN (F2)
        // Lokal: Pfade hier eintragen (relativ zur index.html), z. B. pdf: 'samples/book_1_en.pdf', audio: 'audio/en_chap1.mp3'.
        // HOOK AP6: ENDPOINTS.samples liefert dieselbe Struktur und überschreibt diese Tabelle.
        // ==========================================
        const SAMPLE_FILES = {
            book_1: { en: { pdf: null, audio: null }, de: { pdf: null, audio: null }, ru: { pdf: null, audio: null } },
            book_2: { en: { pdf: null, audio: null }, de: { pdf: null, audio: null }, ru: { pdf: null, audio: null } }
        };
        const samplesStatus = document.getElementById('samples-status');
        function applySamples(map) {
            document.querySelectorAll('.sample-link').forEach(a => {
                const b = a.dataset.book, l = a.dataset.lang, k = a.dataset.kind;
                const url = (map && map[b] && map[b][l]) ? map[b][l][k] : null;
                if (url) {
                    a.href = url; a.removeAttribute('aria-disabled');
                    if (k === 'pdf') { a.setAttribute('download', ''); a.target = '_blank'; a.rel = 'noopener'; }
                } else { a.href = '#'; a.setAttribute('aria-disabled', 'true'); a.removeAttribute('download'); }
            });
        }
        document.querySelectorAll('.sample-link').forEach(a => a.addEventListener('click', (e) => {
            if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); samplesStatus.textContent = t('sample_missing'); return; }
            if (a.dataset.kind === 'audio') {
                // Hörprobe im Player abspielen statt Download – Nutzer bleibt auf der Seite
                e.preventDefault();
                if (isRadioActive) { isRadioActive = false; radioToggleBtn.classList.remove('active'); }
                audioPlayer.src = a.href; audioPlayer.setAttribute('data-last-played', a.href);
                const probeStueck = bildspurFuerDatei(a.href);
                aktualisiereKapitelWahl(a.href);
                audioFilename.innerText = probeStueck ? probeStueck.titel : a.href.split('/').pop();
                audioPlayer.play().then(() => { audioBtn.innerText = t('audio_pause'); audioBtn.classList.add('active'); }).catch(() => {});
                const aw = document.getElementById('window-audio');
                if (aw && aw.classList.contains('minimized')) aw.querySelector('.toggle-btn').click();
                samplesStatus.textContent = '';
            }
        }));
        applySamples(SAMPLE_FILES);

        // ==========================================
        // THRONE.EXE – der leere Thron als Nebenbei-Spiel
        // Archetypen nähern sich langsam; ein Klick schickt sie zurück. Besetzt = Shader dunkler.
        // Zustand im Session-State (throne), läuft auch bei minimiertem Fenster, dann langsamer.
        // ==========================================
        const throneCanvas = document.getElementById('throne-canvas');
        const throneWin = document.getElementById('window-throne');
        const ARCHETYPES = [
            { id: 'king', glyph: '♛' }, { id: 'priest', glyph: '✚' }, { id: 'merchant', glyph: '$' }, { id: 'algorithm', glyph: '01' },
            { id: 'author', glyph: '✎' }, { id: 'prophet', glyph: '☽' }, { id: 'clerk', glyph: '§' }, { id: 'star', glyph: '★' }
        ];
        const throneAktiv = !!(throneCanvas && throneWin);   // JOB-106: Fenster kann aus dem Dock genommen sein
        const throne = (() => {
            let st = { emptySince: Date.now(), dismissed: 0, occupied: 0, record: 0, occupant: null, occupiedSince: 0 };
            try { const saved = JSON.parse(localStorage.getItem('throne_state') || 'null'); if (saved && typeof saved === 'object') st = Object.assign(st, saved); } catch (e) {}
            window.throneDim = (throneAktiv && st.occupant) ? 0.7 : 1;
            return st;
        })();
        let intruders = [];         // {a, x, y, tx, ty, speed, repelled, alpha}
        let nextSpawn = Date.now() + 8000 + Math.random() * 6000;
        let throneLast = performance.now();
        const W = () => throneCanvas.width, H = () => throneCanvas.height;
        const CX = () => W() / 2, CY = () => H() / 2 + 10;

        function fmtDur(ms) {
            const s = Math.max(0, Math.floor(ms / 1000));
            const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
            const hh = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
            return d ? d + 'd ' + hh : hh;
        }
        function throneSave() { try { localStorage.setItem('throne_state', JSON.stringify(throne)); } catch (e) {} }
        function throneStats() {
            const now = Date.now();
            document.getElementById('throne-timer').textContent = throne.occupant ? '—' : fmtDur(now - throne.emptySince);
            document.getElementById('throne-dismissed').textContent = throne.dismissed;
            document.getElementById('throne-occupied').textContent = throne.occupied;
            const rec = Math.max(throne.record, throne.occupant ? 0 : now - throne.emptySince);
            document.getElementById('throne-record').textContent = fmtDur(rec);
            const stateEl = document.getElementById('throne-state');
            stateEl.textContent = throne.occupant ? t('throne_state_occupied') : t('throne_state_empty');
            stateEl.style.color = throne.occupant ? '#dc3545' : '#bbbbbb';
        }
        function spawnIntruder() {
            const a = ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)];
            const side = Math.floor(Math.random() * 4);
            const x = side === 0 ? -20 : side === 1 ? W() + 20 : Math.random() * W();
            const y = side === 2 ? -20 : side === 3 ? H() + 20 : Math.random() * H();
            // 15–25 s bis zum Thron: nebenbei spielbar
            intruders.push({ a, x, y, speed: 1 / (22000 + Math.random() * 18000), repelled: false, alpha: 1, t0: performance.now() });
        }
        function occupy(a) {
            if (!throne.occupant) {
                const streak = Date.now() - throne.emptySince;
                if (streak > throne.record) throne.record = streak;
            }
            throne.occupant = a.id; throne.occupiedSince = Date.now(); throne.occupied += 1;
            window.throneDim = 0.7; throneSave();
        }
        function vacate() {
            throne.occupant = null; throne.emptySince = Date.now(); throne.dismissed += 1;
            window.throneDim = 1; throneSave();
        }
        function drawThrone(ctx, occupantGlyph) {
            const cx = CX(), cy = CY();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(cx - 22, cy + 30); ctx.lineTo(cx - 22, cy - 40); ctx.lineTo(cx - 12, cy - 52); ctx.lineTo(cx, cy - 44);
            ctx.lineTo(cx + 12, cy - 52); ctx.lineTo(cx + 22, cy - 40); ctx.lineTo(cx + 22, cy + 30);          // Lehne
            ctx.moveTo(cx - 30, cy + 2); ctx.lineTo(cx + 30, cy + 2); ctx.lineTo(cx + 30, cy + 34); ctx.lineTo(cx - 30, cy + 34); ctx.closePath(); // Sitz
            ctx.moveTo(cx - 28, cy + 34); ctx.lineTo(cx - 28, cy + 48); ctx.moveTo(cx + 28, cy + 34); ctx.lineTo(cx + 28, cy + 48);   // Beine
            ctx.stroke();
            if (occupantGlyph) {
                ctx.fillStyle = '#dc3545'; ctx.font = '28px ' + getComputedStyle(document.body).fontFamily; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(occupantGlyph, cx, cy - 12);
            }
        }
        function throneFrame(now) {
            const dt = now - throneLast; throneLast = now;
            const minimized = throneWin.classList.contains('minimized');
            const wall = Date.now();
            if (wall >= nextSpawn && intruders.length < 4) {
                spawnIntruder();
                nextSpawn = wall + (minimized ? 30000 : 9000) + Math.random() * (minimized ? 30000 : 8000);
            }
            const cx = CX(), cy = CY();
            for (const it of intruders) {
                const dx = cx - it.x, dy = cy - 10 - it.y; const dist = Math.hypot(dx, dy);
                if (it.repelled) {
                    it.x -= dx / (dist || 1) * dt * 0.35; it.y -= dy / (dist || 1) * dt * 0.35; it.alpha -= dt / 900;
                } else {
                    const step = Math.max(dist, 1) * it.speed * dt * 6;   // langsamer je näher
                    it.x += dx / (dist || 1) * Math.min(step, dist); it.y += dy / (dist || 1) * Math.min(step, dist);
                    if (dist < 6 && !throne.occupant) { occupy(it.a); it.alpha = 0; }
                    else if (dist < 6) { it.alpha = 0; }
                }
            }
            intruders = intruders.filter(it => it.alpha > 0);
            if (!minimized) {
                const ctx = throneCanvas.getContext('2d');
                ctx.clearRect(0, 0, W(), H());
                const occ = throne.occupant ? ARCHETYPES.find(a => a.id === throne.occupant) : null;
                drawThrone(ctx, occ && occ.glyph);
                ctx.font = '22px ' + getComputedStyle(document.body).fontFamily; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                for (const it of intruders) {
                    ctx.globalAlpha = Math.max(0, Math.min(1, it.alpha));
                    ctx.fillStyle = it.repelled ? '#666666' : '#ffffff';
                    ctx.fillText(it.a.glyph, it.x, it.y);
                    ctx.font = '10px ' + getComputedStyle(document.body).fontFamily; ctx.fillStyle = '#999999';
                    ctx.fillText(t('arch_' + it.a.id), it.x, it.y + 18);
                    ctx.font = '22px ' + getComputedStyle(document.body).fontFamily;
                }
                ctx.globalAlpha = 1;
                throneStats();
            }
            requestAnimationFrame(throneFrame);
        }
        function throneHit(ev) {
            const r = throneCanvas.getBoundingClientRect();
            const p = ev.touches ? ev.touches[0] : ev;
            const x = (p.clientX - r.left) * (W() / r.width), y = (p.clientY - r.top) * (H() / r.height);
            let best = null, bd = 30;
            for (const it of intruders) { if (it.repelled) continue; const d = Math.hypot(it.x - x, it.y - y); if (d < bd) { bd = d; best = it; } }
            if (best) { best.repelled = true; throne.dismissed += 1; throneSave(); return; }
            if (throne.occupant && Math.hypot(CX() - x, CY() - 12 - y) < 40) vacate();
        }
        if (throneAktiv) {
            throneCanvas.addEventListener('click', throneHit);
            throneCanvas.addEventListener('touchstart', (e) => { throneHit(e); e.preventDefault(); }, { passive: false });
            throneStats();
            nachDemLaden(() => requestAnimationFrame(throneFrame));   // JOB-145
        }

        // ==========================================
        // NOTFIX: ZUSTAND (HOOK AP2)
        // State-Blob nach Schnittstellenvertrag (Abschnitt 4). Heute localStorage, später PUT /v1/session/state.
        // ==========================================
        let persistTimer = null;
        function collectState() {
            const win = {};
            document.querySelectorAll('.script-window').forEach(w => { win[w.id.replace('window-', '')] = w.classList.contains('minimized') ? 'min' : 'open'; });
            return {
                lang: aktuelleSprache,
                bg: activeBg,
                shader: { mode: isAdvancedMode ? 'advanced' : 'standard', active: activeShader, brightness: currentBrightness, speed: currentSpeed,
                          adv: { intensity: advIntensity.slice(), speed: advSpeed.slice(), hue: advHue.slice(), trace: advTrace, auto: currentAutoMode } },
                audio: { lang: aktuelleAudioSprache, file: audioPlayer.getAttribute('data-last-played') || null,
                         pos: (!isRadioActive && isFinite(audioPlayer.currentTime)) ? audioPlayer.currentTime : 0, radio: isRadioActive },
                windows: win,
                chat_mode: aktuellerModus,
                throne: throne
            };
        }
        function persistState() {
            clearTimeout(persistTimer);
            persistTimer = setTimeout(async () => {
                let state; try { state = collectState(); } catch (e) { return; }
                try { localStorage.setItem('obs_state', JSON.stringify(state)); } catch (e) {}
                if (!ENDPOINTS.session || apiOnline === false) return;
                try { await api(ENDPOINTS.session + '/state', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ state }) }, 10000); } catch (e) {}
            }, 2000);
        }
        function loadState() { try { return JSON.parse(localStorage.getItem('obs_state') || 'null'); } catch (e) { return null; } }
        function applyState(st) {
            if (!st) return;
            if (st.lang && i18n[st.lang]) changeLanguage(st.lang);
            if (st.bg !== undefined && st.bg !== null) setBackground(String(st.bg));
            if (st.chat_mode) { const b = document.querySelector(`.mode-btn[data-mode="${st.chat_mode}"]`); if (b) b.click(); }
            if (window.innerWidth > 768 && st.windows) {
                Object.entries(st.windows).forEach(([k, v]) => { const w = document.getElementById('window-' + k); if (w) w.classList.toggle('minimized', v !== 'open'); });
            }
            // HOOK AP2/AP7b: st.shader und st.audio vom Server in die lokalen Variablen übernehmen.
            // Lokal werden Shader-Werte bereits über die bestehenden localStorage-Keys wiederhergestellt.
        }

        // ==========================================
        // NOTFIX: BOOT
        // ==========================================
        const saved = loadState();
        if (saved) applyState({ windows: saved.windows, chat_mode: saved.chat_mode });

        // F4: Erstbesuch -> Chat offen
        if (!localStorage.getItem('first_visit_done')) {
            document.getElementById('window-chat').classList.remove('minimized');
            localStorage.setItem('first_visit_done', '1');
        }
        layoutTopWindows();
        restoreChat();
        window.bsChatBereit = true;

        // Audio dort weiter, wo aufgehört wurde (kein Autoplay, Browser-Policy)
        katalogBereit.then(() => {
        if (saved && saved.audio && saved.audio.file && !saved.audio.radio) {
            aktuelleAudioSprache = BAUM_SPRACHEN.includes(saved.audio.lang) ? saved.audio.lang : aktuelleAudioSprache;
            const file = String(saved.audio.file); const pos = Number(saved.audio.pos) || 0;
            audioPlayer.src = file; audioPlayer.setAttribute('data-last-played', file);
            const wiederStueck = bildspurFuerDatei(file);
            aktualisiereKapitelWahl(file);
            audioFilename.innerText = wiederStueck ? wiederStueck.titel : file.split('/').pop();
            audioPlayer.addEventListener('loadedmetadata', () => {
                if (pos > 0 && pos < audioPlayer.duration) { audioPlayer.currentTime = pos; }
                audioProgress.value = audioPlayer.duration ? (audioPlayer.currentTime / audioPlayer.duration) * 100 : 0;
                audioTimeText.innerText = `${formatTime(audioPlayer.currentTime)} / ${formatTime(audioPlayer.duration)}`;
            }, { once: true });
        }
        });

        // Zustand sichern: Regler, Buttons, Audio
        document.addEventListener('input', (e) => { if (e.target && e.target.matches('input[type=range]')) persistState(); });
        document.addEventListener('click', (e) => {
            if (e.target && e.target.closest && e.target.closest('.mode-btn, .bg-btn, .shader-btn, .auto-btn, .lang-btn, .audio-lang-btn, .audio-kap-btn, #adv-auto-toggle, #advanced-shader-btn, #audio-skip-btn, #radio-toggle-btn')) persistState();
        });
        audioPlayer.addEventListener('pause', persistState);
        setInterval(() => { if (!audioPlayer.paused) persistState(); }, 10000);
        window.addEventListener('beforeunload', () => { try { localStorage.setItem('obs_state', JSON.stringify(collectState())); } catch (e) {} });
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) topWindows.forEach(id => { const w = document.getElementById(id); if (w) { w.style.top = ''; w.style.left = ''; } });
            else layoutTopWindows();
        });

        // Backend erreichen, dann Remote-Daten laden
        (async () => {
            const node = await checkApiHealth();
            if (!node && !apiEverOk) { zeigeStatus(t('status_offline')); }   // nur mit SHOW_DIAGNOSTICS sichtbar
            loadVotesRemote();
            if (ENDPOINTS.samples) { try { const r = await api(ENDPOINTS.samples, {}, 10000); if (r.ok) applySamples(await r.json()); } catch (e) {} }
            // HOOK AP2: GET /v1/session -> State vom Server anwenden
            if (ENDPOINTS.session) { try { const r = await api(ENDPOINTS.session, {}, 10000); if (r.ok) { const sess = await r.json(); if (sess && sess.state) applyState(sess.state); } } catch (e) {} }
        })();
        setInterval(() => { if (apiOnline === false) checkApiHealth().then(n => { if (n) zeigeStatus(''); }); }, 300000);
    });
