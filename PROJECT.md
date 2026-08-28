# Project: ZentryOS Voice Neural TTS & 5-Archetype Acoustic Architecture

## Architecture
- **Core Engine:** `src/services/voiceSpeech.ts` — Voice service singleton, IndexedDB 0ms audio cache (`zentry_tts_db`), Google Cloud Text-to-Speech REST v1 integration with Neural2/Studio profiles, adaptive SSML micro-pause builder, Web Audio DSP cleanup chain, and Microsoft Edge Natural / WebSpeech offline fallback with anti-gender inversion heuristic scoring.
- **AI Integration:** `src/services/aiService.ts` — Gemini 2.5 Flash prompt orchestration with `GLOBAL_SPEECH_RULES` enforcing anti-emoji protocols and dignity-compliant language.
- **UI Shell Integrations:**
  - `src/components/shell/ZentryDynamicIsland.tsx` (Tab 3: Audio / Voz) — Interactive 5-voice archetype grid, instant spoken personality greetings on selection, audio replay, and voice QA.
  - `src/components/screens/ZentrySettingsScreen.tsx` — Acoustic calibration sliders (Pitch, Rate, Volume Gain), test phrase trigger, custom GCP API Key input, and audio cache management.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | 5 Neural Voice Archetypes Matrix | Explicit biological distinction for Elena Valdés, Carlos Mendoza, Sofía Urbana, Lucas Vega, Maestro Aurelius mapped to GCP Studio/Neural2 and Edge Natural models | M1 | ORIGINAL_REQUEST §R1 |
| F2 | Acoustic Prosody Calibration | Calibrated Pitch (-3.8st to +3.2st), Speaking Rate (0.84x to 1.12x), Volume Gain (+0.8 to +1.4 dB) per archetype | M1 | ORIGINAL_REQUEST §R2 |
| F3 | Dynamic SSML Micro-Pause Injection | Punctuation-based adaptive `<break time="..."/>` generation (Socratic contemplative 220-480ms, adult pedagogical 160-220ms, youth agile 100-120ms) | M1 | ORIGINAL_REQUEST §R2 |
| F4 | Audio DSP Filtering & Cleansing | 80Hz high-pass filter, 320Hz low-boxiness notch, 5.5kHz de-esser, and dynamics compressor suppressing vocoder artifacts & rumble | M1 | ORIGINAL_REQUEST §R2 |
| F5 | Anti-Emoji & Text Sanitization | Unicode regex stripping 14 emoji/symbol blocks and patronizing vocatives | M2 | ORIGINAL_REQUEST §R2 |
| F6 | Multi-Tier Cache & Fallback Engine | IndexedDB 0ms cache -> GCP TTS HD (Studio -> Neural2) -> Edge Natural Offline WebSpeech with anti-gender-inversion scoring | M2 | ORIGINAL_REQUEST §R3 |
| F7 | Dynamic Island Audio/Voice Tab | Interactive 5-persona grid with instant spoken personality greetings and voice QA | M3 | ORIGINAL_REQUEST §R3 |
| F8 | Settings Calibration UI | Real-time acoustic pitch/rate/gain sliders, test phrase synthesizer, cache clearer | M3 | ORIGINAL_REQUEST §R3 |
| F9 | Certified Spanish Sample Corpora | Dedicated personality-coherent sample phrases in Spanish for greetings, guidance, tutoring, and contemplation | M1 | ORIGINAL_REQUEST §R3 |
| F10 | E2E Testing Suite & Dual Track | Comprehensive Tier 1-4 test suite verifying acoustic properties, gender stability, fallback transitions, and UI responsiveness | E2E Track | ORIGINAL_REQUEST §Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Voice Archetype Matrix & Acoustic Calibration | Voice personas record, pitch/rate/gain tuning, SSML builder, DSP cleanup specifications, Spanish sample corpus | None | DONE |
| M2 | PWA Voice Engine & Multi-Tier Fallback | voiceSpeech.ts multi-tier synthesis, IndexedDB cache, text sanitizer, Edge Natural fallback scoring | M1 | DONE |
| M3 | Dynamic Island & Settings Integration | ZentryDynamicIsland.tsx Tab 3 voice grid & greeting execution, ZentrySettingsScreen.tsx sliders | M2 | DONE |
| M4 | Final Milestone (E2E Verification & Adversarial Hardening) | 100% E2E test execution (Tiers 1-4) + adversarial testing (Tier 5) + Forensic Audit | M3, E2E Track | IN_PROGRESS |
| E2E | E2E Test Suite Creation | Test infrastructure runner, Tier 1-4 test suites covering all 10 features, publish TEST_READY.md | None | IN_PROGRESS |

## Interface Contracts
### `voiceSpeech.ts` ↔ `ZentryDynamicIsland.tsx` & `ZentrySettingsScreen.tsx`
- `voiceService.getPersona(): VoicePersonaId` — returns current active persona ID (`female_jovial`, `female_adult`, `male_jovial`, `male_adult`, `socratic_mentor`).
- `voiceService.setPersona(id: VoicePersonaId): void` — updates active persona and persists in localStorage.
- `voiceService.speak(text: string, options?: SpeakOptions): Promise<void>` — synthesizes text with SSML prosody, caching, and fallback.
- `voiceService.speakFeedback(text?: string): Promise<void>` — speaks greeting sample phrase for current persona.
- `voiceService.getPersonas(): Record<VoicePersonaId, VoicePersona>` — retrieves complete persona registry.
- `voiceService.getAcousticCalibration(): AcousticCalibration` — returns active pitch, rate, and gain offsets.
- `voiceService.setAcousticCalibration(config: Partial<AcousticCalibration>): void` — updates real-time calibration.

## Code Layout
- `src/services/voiceSpeech.ts` — Core Voice Synthesis Engine, Types, Cache, and Fallbacks
- `src/services/aiService.ts` — AI Prompting & Speech Rules
- `src/components/shell/ZentryDynamicIsland.tsx` — Dynamic Island Shell & Audio Tab
- `src/components/screens/ZentrySettingsScreen.tsx` — System Settings & Acoustic Calibration
- `tests/e2e/` — E2E Test Suite and Test Runner
