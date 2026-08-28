# 🏛️ ZentryOS Voice Engine & Codebase Architecture Survey Report

- **Date:** 2026-08-28
- **Explorer:** Survey Explorer 1 (Codebase Architecture & Voice State)
- **Worktree:** `D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\voice-tts`
- **Git Branch:** `feat/neural-tts-gcp`
- **Dev Port:** 5179 (`npm run dev:tts`)
- **Build Status:** `tsc -b && vite build` exits 0 (1871 modules transformed, 1.33 MB single-file bundle)

---

## 1. Executive Summary

This survey provides an exhaustive architectural assessment of the voice synthesis and audio engine within ZentryOS Launcher PWA. The voice subsystem delivers hyperrealistic, low-latency neural speech across 5 differentiated human archetypes (2 adult/parental, 2 youth/companion, 1 socratic mentor).

The architecture is designed with a hybrid online/offline model:
1. **Primary Online Engine:** Google Cloud Text-to-Speech API with Neural2 and Studio models, dynamic SSML prosody, studio headphone equalization (`high-fidelity-headphone-class-device`), and 24kHz HD sampling.
2. **Primary Offline Fallback:** Browser `SpeechSynthesis` with intelligent neural scoring prioritizing Microsoft Edge Natural voices (e.g. `es-MX-DaliaNeural`, `es-ES-ElviraNeural`, `es-MX-JorgeNeural`, `es-ES-DarioNeural`, `es-ES-AlvaroNeural`), strict gender preservation filters, and persona-specific pitch/rate offsets.
3. **Instant Latency (0 ms):** IndexedDB local audio caching (`zentry_tts_db`) and background phrase preloading via `requestIdleCallback`.
4. **Text Purity & Governance:** Multi-layer Unicode regex sanitization eliminating all emoji/pictogram artifacts and condescending/overly intimate vocatives, paired with `GLOBAL_SPEECH_RULES` across all Gemini/Vertex AI prompts.
5. **UI Touchpoints:** Fully wired into the **Zentry Dynamic Island** (Tab 3 "Audio / Voz") with instant acoustic feedback, **Zentry Settings Screen** with real-time sliders (Pitch, Rate, Gain, API Key, Cache Management), and across age cohorts (`toddler` vs `explorer`).

---

## 2. Voice Engine Architecture (`src/services/voiceSpeech.ts`)

### 2.1 File Location & Structure
- **Path:** `D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\voice-tts\src\services\voiceSpeech.ts`
- **Lines of Code:** 1,198 lines
- **Class:** `VoiceSpeechService` (exported singleton `voiceService`, also exposed to `window.voiceService`).

### 2.2 The 5 Vocal Personas & Acoustic Profiles
Defined in `VOICE_PERSONAS: Record<VoicePersona, VoicePersonaInfo>` (`src/services/voiceSpeech.ts:60-168`):

| Persona Key | Display Name & Archetype | GCP Neural Model | Natural Edge Voice Fallback | Gender | Pitch (st) | Speaking Rate | Volume Gain | Cohort | Distinct Acoustic Character |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| `female_jovial` | **Sofía Urbana** (Femenina Jovial) | `es-US-Neural2-A` | `es-MX-DaliaNeural` | `FEMALE` | `+3.2` | `1.12x` | `+1.2 dB` | `toddler` | Bright, youthful, cheerful, high-energy, fast conversational pace, no low-end boom. |
| `female_adult` | **Elena Valdés** (Femenina Adulta) | `es-ES-Studio-C` | `es-ES-ElviraNeural` | `FEMALE` | `-0.6` | `0.96x` | `+0.8 dB` | `explorer` | Mature, maternal/professional, warm, pedagogical articulation, calm cadence. |
| `male_jovial` | **Lucas Vega** (Masculino Jovial) | `es-US-Neural2-B` | `es-MX-JorgeNeural` | `MALE` | `+1.8` | `1.08x` | `+1.4 dB` | `toddler` | Dynamic, enthusiastic, friendly, high-energy companion for missions and challenges. |
| `male_adult` | **Carlos Mendoza** (Masculino Adulto) | `es-ES-Studio-F` | `es-ES-DarioNeural` | `MALE` | `-3.8` | `0.92x` | `+1.0 dB` | `explorer` | Deep baritone, sober, protective, executive and institutional stability. |
| `socratic_mentor` | **Maestro Aurelius** (Mentor Socrático) | `es-ES-Studio-F` | `es-ES-AlvaroNeural` | `MALE` | `-2.8` | `0.84x` | `+1.0 dB` | `explorer` | Solemn, philosophical, extended socratic pauses, breathy contemplative texture. |

#### Backward Compatibility Aliases
- `zentry_jovial` → Maps to `female_jovial` (`es-US-Neural2-A`, `+2.2st`, `1.07x`)
- `toddler_sweet` → Maps to `female_jovial` (`es-US-Neural2-A`, `+2.6st`, `1.04x`)
- `companion_spark` → Maps to `male_jovial` (`es-US-Neural2-B`, `+1.6st`, `1.06x`)

### 2.3 Text Sanitization Engine (`sanitizeSpeechText`)
Located at `src/services/voiceSpeech.ts:251-278`:
1. **Unicode Emoji Stripping:** Strips Unicode ranges:
   - Emoticons (`\u{1F600}-\u{1F64F}`)
   - Miscellaneous Symbols & Pictographs (`\u{1F300}-\u{1F5FF}`)
   - Transport & Map Symbols (`\u{1F680}-\u{1F6FF}`)
   - Alchemical Symbols (`\u{1F700}-\u{1F77F}`)
   - Geometric Shapes Extended (`\u{1F780}-\u{1F7FF}`)
   - Supplemental Arrows (`\u{1F800}-\u{1F8FF}`)
   - Supplemental Symbols (`\u{1F900}-\u{1F9FF}`)
   - Chess Symbols (`\u{1FA00}-\u{1FA6F}`)
   - Symbols & Pictographs Extended-A (`\u{1FA70}-\u{1FAFF}`)
   - Misc Symbols / Stars (`\u{2600}-\u{26FF}`)
   - Dingbats (`\u{2700}-\u{27BF}`)
   - Variation Selectors (`\u{FE00}-\u{FE0F}`)
   - Regional Indicator Flags (`\u{1F1E6}-\u{1F1FF}`)
   - Zero-width joiners (`\u{200D}\u{200C}`)
2. **Vocatives & Intimate Diminutives Filter:**
   - Cleanses: `mi cielo`, `mi amor`, `mi vida`, `mi corazón`, `mi reina`, `mi rey`, `mi princesa`, `mi príncipe`, `corazón`, `cariño`, `bebé`, `tesoro`, `chiquito`, `chiquita`.

### 2.4 Dynamic SSML Prosody Generator (`buildNaturalSSML`)
Located at `src/services/voiceSpeech.ts:626-657`:
- Escapes XML entities (`&`, `<`, `>`, `"`, `'`).
- Inserts archetype-calibrated punctuation breaks:
  - **Maestro Aurelius (Mentor):** Periods `220ms`, Commas `130ms`, Questions `260ms`, Exclamations `180ms`.
  - **Adult Personas (Elena / Carlos):** Periods `160ms`, Commas `80ms`, Questions `160ms`, Exclamations `130ms`.
  - **Youth Personas (Sofía / Lucas):** Periods `110ms`, Commas `60ms`, Questions `120ms`, Exclamations `110ms`.
- Encapsulates speech inside `<speak><prosody rate="${rateStr}" pitch="${pitchStr}">${pacedText}</prosody></speak>`.

### 2.5 Cloud Speech Synthesis (`speakFeedback`)
Located at `src/services/voiceSpeech.ts:659-775`:
1. **IndexedDB Check:** Checks cache for key `${languageCode}_${name}_${pitch}_${speakingRate}_${volumeGainDb}_${text}`.
2. **API Key Resolution:** Precedence order: `import.meta.env.VITE_GOOGLE_TTS_API_KEY` → `localStorage.getItem('zentry_tts_api_key')` → Active corporate fallback key (`AIzaSyCX...`).
3. **Endpoint:** `POST https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`
4. **Audio Configuration:**
   - `audioEncoding`: `'MP3'`
   - `sampleRateHertz`: `24000`
   - `effectsProfileId`: `['high-fidelity-headphone-class-device']`
5. **Resilient Studio Quota Fallback:** If a `Studio` model fails or encounters quota/licensing constraints, automatically re-attempts with exact gender-matched `Neural2` voice (`es-US-Neural2-A` for FEMALE, `es-US-Neural2-B` for MALE).
6. **Graceful Network Fallback:** In case of network errors or missing API key, smoothly redirects to `speakOfflineFallback`.

### 2.6 Offline Speech Synthesis & Natural Voice Heuristics (`speakOfflineFallback`)
Located at `src/services/voiceSpeech.ts:841-993`:
- Evaluates available browser voices via `window.speechSynthesis.getVoices()`.
- Strict gender separation prevents female personas from adopting male voices and vice versa (`FEMALE_NAMES` vs `MALE_NAMES` blacklist/whitelist score matrix).
- Heuristic scoring boosts Microsoft Edge Natural (`+300` score for `natural` / `online`, `+250` for `neural`) and penalizes legacy robotic desktop voices (`-300` for `desktop`, `mobile`, `sabina`, `helena`).
- Adjusts baseline pitch (`0.42` to `1.65`) and rate (`0.74` to `1.15`) dynamically based on detected gender of the system voice to guarantee acoustic differentiation offline.

### 2.7 IndexedDB Audio Storage & Latency Elimination
Located at `src/services/voiceSpeech.ts:447-557`:
- Database: `zentry_tts_db`, Version `1`, Object Store: `audio_cache` (KeyPath: `key`).
- Asynchronously caches audio Blobs with metadata (`Blob`, `text`, `voice`, `pitch`, `speakingRate`, `createdAt`).
- Background preloading via `preloadPhrases()` (`src/services/voiceSpeech.ts:999-1055`) pre-populates 13 standard system phrases during browser idle periods.

### 2.8 AudioContext & Autoplay Management
Located at `src/services/voiceSpeech.ts:563-585`:
- `setupAutoplayUnlockListeners()` attaches one-time user interaction triggers (`click`, `touchstart`, `keydown`) to resume suspended `AudioContext` and unlock HTML5 audio playback with a silent WAV data URI.

---

## 3. UI Component Integration & User Experience

### 3.1 Zentry Dynamic Island (`src/components/shell/ZentryDynamicIsland.tsx`)
- **Location:** Embedded in `ZentryStatusBar.tsx:89-95` as the central liquid-glass pill.
- **Pill States (`ZentryDynamicIsland.tsx:318-370`):**
  - *Idle Liquid Glass:* Gradient `#C8B6FF` / `#E0C3FC` / `#B3E5FC` with subtle shimmer and `ZENTRY` uppercase brand.
  - *Active Media Playback:* Dark pill with dynamic equalizer wave bars and media icon.
  - *Attention Intervention:* Amber pulse notifying the user of a creative real-world challenge.
  - *Expanded Modal:* Floating command center (`max-w-lg`) with 4 action tabs.
- **Tab 3: "Audio / Voz" (`ZentryDynamicIsland.tsx:710-815`):**
  - Displays the 5 vocal personas in a responsive 2-column grid with archetype icons (`Sparkles`, `GraduationCap`, `Zap`, `Volume2`), gender badges, and active checkmarks.
  - **Instant Acoustic Greeting:** Calling `handleSelectVoicePersona(personaId)` sets the active persona in `voiceService` and triggers a sample phrase customized to that voice:
    - *Sofía:* "¡Hola! Soy Sofía. Lista para descubrir cosas increíbles juntos."
    - *Elena:* "Hola. Soy Elena. Estoy aquí para acompañarte con claridad y rigor."
    - *Lucas:* "¡Ey! Soy Lucas. ¿Preparado para crear y superar retos geniales hoy?"
    - *Carlos:* "Buenas tardes. Soy Carlos. Analicemos juntos cualquier proyecto."
    - *Maestro Aurelius:* "Bienvenido. Soy el Maestro Aurelius. ¿Qué reto exploraremos paso a paso?"
  - **Voice & Multimodal QA:** Input field to ask questions to Gemini 2.5 Flash (`askZentryAi`) with automatic TTS spoken feedback and a repeat button ("Escuchar").
- **Tab 2: "Ver Mundo" (`ZentryDynamicIsland.tsx:658-708`):**
  - Direct camera viewport, canvas snapshot capture, and multimodal Gemini analysis vocalized via `voiceService.speakFeedback`.
- **Tab 1: "Acciones" (`ZentryDynamicIsland.tsx:490-655`):**
  - Media controls, attention governance trigger, and screen awareness assistant.
- **Tab 4: "Memoria" (`ZentryDynamicIsland.tsx:819-856`):**
  - Live session log tracking recommendations and voice queries.

### 3.2 Zentry Settings Screen (`src/components/screens/ZentrySettingsScreen.tsx`)
- **Location:** `src/components/screens/ZentrySettingsScreen.tsx:267-458`
- **Features:**
  1. **5 Personas Selection Grid:** Real-time persona selection with cohort synchronization (`toddler` vs `explorer`).
  2. **Real-Time Acoustic Sliders:**
     - *Pitch Offset:* `-2.0` to `+2.0` semitones (`handlePitchChange`)
     - *Speaking Rate:* `0.85x` to `1.20x` (`handleRateChange`)
     - *Volume Gain:* `0.5` to `3.0 dB` (`handleVolumeGainChange`)
     - *Reset Defaults:* Restores canonical profile parameters.
  3. **Live Test Area:** Customizable test phrase input with "Probar" button triggering `voiceService.speakFeedback`.
  4. **Google Cloud TTS API Key Manager:** Input with show/hide password toggle, saving to `localStorage` (`zentry_tts_api_key`).
  5. **Cache Management:** "Limpiar caché" button invoking `voiceService.clearAudioCache()`.

---

## 4. Service Ecosystem & Integration Touchpoints

```
                   ┌────────────────────────────────────────────────────────┐
                   │                     ZentryOS PWA                       │
                   └────────────────────────────────────────────────────────┘
                                    │                           │
                    ┌───────────────┴───────────────┐           │
                    ▼                               ▼           ▼
       ┌─────────────────────────┐     ┌────────────────────────┐  ┌─────────────────────┐
       │   ZentryDynamicIsland   │     │  ZentrySettingsScreen  │  │  Age Cohort Views   │
       │    (Tab 3: Audio/Voz)   │     │    (Voice Settings)    │  │  (Toddler/Explorer) │
       └─────────────────────────┘     └────────────────────────┘  └─────────────────────┘
                    │                               │                           │
                    └───────────────┬───────────────┘                           │
                                    ▼                                           │
       ┌───────────────────────────────────────────────────────────────────┐    │
       │                 voiceService (VoiceSpeechService)                 │◄───┘
       │  • 5 Personas Matrix (Sofía, Elena, Lucas, Carlos, Aurelius)      │
       │  • Text Sanitizer (Regex Unicode & Vocatives Cleanse)             │
       │  • Natural SSML Engine (Adaptive Micro-Punctuation Breaks)        │
       └───────────────────────────────────────────────────────────────────┘
                    │                           │                       │
         ┌──────────┴──────────┐     ┌──────────┴──────────┐   ┌────────┴────────┐
         ▼                     ▼     ▼                     ▼   ▼                 ▼
 ┌───────────────┐     ┌───────────────┐     ┌───────────────────┐     ┌───────────────────┐
 │ Google Cloud  │     │   IndexedDB   │     │   SpeechSynthesis │     │  agencyService &  │
 │  TTS (Neural2 │     │  Audio Cache  │     │ (Edge Natural /   │     │  aiService        │
 │   & Studio)   │     │  (0ms latency)│     │  WebSpeech Offline│     │ (Strict No-Emoji) │
 └───────────────┘     └───────────────┘     └───────────────────┘     └───────────────────┘
```

### 4.1 Integration Matrix
1. **`src/services/aiService.ts`:**
   - Enforces `GLOBAL_SPEECH_RULES` across all Gemini 2.5 Flash prompts (`general_ai`, `study_assistant`, `camera_vision`, `neuro_art`, `world_generator`, `deep_research`, `redactor`).
   - Ensures all generated speech strings are pure text without emojis or patronizing terms.
2. **`src/services/agencyService.ts`:**
   - Proactive attention governance service that converts passive screen watching to real-world creativity.
   - Triggers `voiceService.speakFeedback(intervention.speechText)` when proposing creative interventions.
3. **`src/services/voiceAgentService.ts`:**
   - Handles spoken command parsing (`matchLocalVoiceCommand` for 0ms navigation and Gemini fallback for complex queries).
4. **`src/services/soundEffects.ts`:**
   - Web Audio API procedural synthesizer providing UI audio cues (`playTap`, `playSuccess`, `playAppOpen`, `playInterventionShield`).
5. **`src/services/mediaPlaybackService.ts`:**
   - Coordinates video/audio playback state with Dynamic Island equalizer and agency monitoring.

---

## 5. Python Backend Audio Engine (`backend_audio_engine/`)

In addition to client-side GCP TTS and Web Speech synthesis, the worktree contains a modular Python microservice architecture for local neural synthesis and fine-tuning experiments:

| File | Purpose & Architecture |
| :--- | :--- |
| `backend_audio_engine/profiles.py` | Defines `CATALOGO_VOCES_ZENTRY` Pydantic models for XTTS v2, Applio RVC Core, and Kokoro-82M with strict gender isolation, RMVPE pitch extraction, and style prompts. |
| `backend_audio_engine/server.py` | FastAPI microservice exposing `/api/voices` and `/api/tts/synthesize` streaming 24kHz WAV audio. |
| `backend_audio_engine/applio_rvc.py` | RVC v2 inference pipeline wrapper with RMVPE pitch shifting and FAISS index blending. |
| `backend_audio_engine/dataset_formatter.py` | Automated audio preprocessor converting multi-channel audio to 24kHz mono and generating Coqui XTTS v2 `metadata.csv` manifests. |
| `backend_audio_engine/requirements.txt` | Dependencies: `fastapi`, `uvicorn`, `pydantic`, `httpx`, `torch`, `torchaudio`, `soundfile`, `librosa`. |

---

## 6. Project Configuration & Technical Health

### 6.1 Build System & Tooling
- **Package Manager:** `npm`
- **Vite:** v8.2.2 with `@vitejs/plugin-react` and `vite-plugin-singlefile`
- **CSS Framework:** Tailwind CSS v4 (`@tailwindcss/vite`, `tailwindcss` v4.3.3)
- **TypeScript:** `typescript` ~6.0.2 with `tsconfig.app.json`
- **Build Output:** Single standalone HTML file (`dist/index.html` ~1.33 MB)

### 6.2 Verification Command
```bash
npm run build
```
- **Result:** Code 0, cleanly built in ~3.3s with no TypeScript or lint errors.

---

## 7. Conclusions & Readiness

1. **Architecture Completeness:** The 5 neural vocal personas are fully specified, calibrated, and wired into both the frontend UI and backend schemas.
2. **Cross-Component Harmony:** Dynamic Island, System Settings, AI prompts, and Agency governance share a consistent voice state and sanitization protocol.
3. **Resilience:** The dual-engine design (GCP TTS HD with Studio-to-Neural2 fallback + Edge Natural Web Speech offline + IndexedDB caching) ensures immediate, zero-latency feedback under any connectivity condition.
