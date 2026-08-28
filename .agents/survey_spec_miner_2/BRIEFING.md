# BRIEFING — 2026-08-28T18:37:30Z

## Mission
Discover, probe, catalog, and specify state-of-the-art open neural voice synthesis models (GCP TTS, Coqui XTTS v2, Kokoro-82M, Edge Natural, Piper, Bark, StyleTTS2, WebSpeech) and map exact locutor IDs, parameters, and sample phrases for 5 distinct hyperrealistic human voice archetypes.

## 🔒 My Identity
- Archetype: Specification Miner
- Roles: Survey Spec Miner 2 (Neural Models & Voice Catalog Specification)
- Working directory: D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\voice-tts\.agents\survey_spec_miner_2
- Original parent: 3f11a36b-e3d7-45ce-ba13-9b4b570ee1c2
- Milestone: MVP ZentryOS Neural Voice Synthesis & Dynamic Island Catalog

## 🔒 Key Constraints
- Pure discovery and specification (read-only / documentation role). Do NOT alter production application code.
- Exhaustively probe all engines: Google Cloud TTS (Studio, Neural2, Journey, Wavenet, Polyglot, Chirp v2), Coqui XTTS v2, Kokoro-82M / Kokoro-ONNX, Edge Natural TTS, Piper TTS (VITS), Bark (Suno), StyleTTS2.
- Map exact model IDs, language codes (es-ES, es-US, es-MX, etc.), gender, and locutor identifiers for all 5 archetypes:
  1. Elena Valdés (Adult Female / Mother / Professional)
  2. Carlos Mendoza (Adult Male / Father / Institutional)
  3. Sofía Urbana (Juvenile Female / Close Friend)
  4. Lucas Vega (Juvenile Male / Adventurous Friend)
  5. Maestro Aurelius (Wise Mentor / Socratic Elder)
- Document exact locutors for GCP TTS, Edge Natural, and WebSpeech API.
- Author rich, personality-coherent sample phrases in Spanish for all 5 archetypes.
- Deliver findings in structured markdown report `survey_neural_models.md` and complete `handoff.md`.

## Current Parent
- Conversation ID: 3f11a36b-e3d7-45ce-ba13-9b4b570ee1c2
- Updated: 2026-08-28T18:37:30Z

## Task Summary
- **What to build**: Comprehensive Neural Model & Voice Catalog Specification report (`survey_neural_models.md`) and 5-component handoff (`handoff.md`).
- **Success criteria**: Full matrix coverage of all 5 archetypes across GCP, Edge Natural, WebSpeech, and Open Source Neural engines; edge cases; rich sample phrases; complete interface schemas.
- **Interface contracts**: `src/services/voiceSpeech.ts` (`VOICE_PERSONAS`, `TTSVoiceConfig`, `VoicePersonaInfo`).
- **Code layout**: Agent metadata in `.agents/survey_spec_miner_2/`.

## Key Decisions Made
- Prioritize native Spanish locutors and dialectal alignments (es-ES Castilian for adult/formal/mentor archetypes, es-US / es-MX for vibrant juvenile peer archetypes).
- Document both cloud API specifications (GCP REST v1, Edge TTS msedge WebSocket) and local on-device neural engines (Kokoro-82M ONNX WebAssembly, Piper VITS, Coqui XTTS v2).

## Artifact Index
- `.agents/survey_spec_miner_2/DISPATCH.md` — Dispatch prompt and assignments.
- `.agents/survey_spec_miner_2/BRIEFING.md` — Persistent operational state.
- `.agents/survey_spec_miner_2/progress.md` — Liveness and step tracking.
- `.agents/survey_spec_miner_2/survey_neural_models.md` — Complete Neural Models & Voice Catalog Specification.
- `.agents/survey_spec_miner_2/handoff.md` — 5-Component handoff report.
