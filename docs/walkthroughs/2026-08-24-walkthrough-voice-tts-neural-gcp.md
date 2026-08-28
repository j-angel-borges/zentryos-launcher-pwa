# 🚀 Walkthrough de Código: Síntesis Vocal Neuronal GCP / Vertex AI, Calibración Acústica & Sanitización de Voz

- **Fecha:** 2026-08-28
- **Vertical:** Voice TTS GCP
- **Rama:** feat/neural-tts-gcp
- **Worktree:** D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\voice-tts
- **Puerto de Prueba:** 5179

---

## 1. Resumen Ejecutivo
Se implementó una arquitectura de audio neuronal de ultra-alta fidelidad para `src/services/voiceSpeech.ts`, `src/services/aiService.ts`, `src/services/voiceAgentService.ts`, `src/services/agencyService.ts` y `src/components/screens/ZentrySettingsScreen.tsx`. Se integraron personas vocales femeninas, joviales y cálidas (`zentry_jovial`, `toddler_sweet`, `socratic_mentor`, `companion_spark`), un motor de sanitización regex estricto contra emojis y apelativos condescendientes o excesivamente íntimos ("corazón", "mi cielo", "mi amor", "bebé", etc.), prosodia SSML natural con micro-pausas respiratorias en puntuación, y un selector inteligente de voces naturales offline.

## 2. Archivos Modificados / Creados
- `src/services/voiceSpeech.ts`:
  - 4 Personas Vocales Femeninas y Joviales calibradas:
    - **`zentry_jovial` (Predeterminada):** `es-US-Neural2-A` (Femenina alegre, optimista, luminosa, pitch `+1.2st`, rate `1.03x`, gain `+1.6 dB`).
    - **`toddler_sweet`:** `es-US-Neural2-A` (Femenina tierna, cariñosa y protectora, pitch `+1.5st`, rate `1.01x`).
    - **`socratic_mentor`:** `es-ES-Studio-C` (Femenina inspiradora, sabia y motivadora para estudio, pitch `+0.7st`, rate `1.00x`).
    - **`companion_spark`:** `es-ES-Neural2-C` (Femenina enérgica y chispeante para retos STEM y misiones, pitch `+1.0st`, rate `1.05x`).
  - Método `sanitizeSpeechText()`: Filtra todos los rangos Unicode de emojis, pictogramas y símbolos gráficos, además de depurar vocativos/diminutivos inadecuados antes de la síntesis.
  - Peticiones GCP con SSML dinámico (`<prosody>`, `<break time="..."/>`), sample rate 24kHz y perfiles de ecualización.
  - Selector inteligente de voces offline que prioriza voces neuronales de navegador (`Microsoft Dalia Online Natural`, `Microsoft Paloma Online Natural`, `Google español`).
- `src/services/aiService.ts`:
  - Directiva global `GLOBAL_SPEECH_RULES` en todos los prompts de sistema de Vertex AI/Gemini, prohibiendo estrictamente el uso de emojis en respuestas habladas y garantizando un trato pedagógico y respetuoso sin términos condescendientes.
- `src/services/voiceAgentService.ts` & `src/services/agencyService.ts`:
  - Limpieza de emojis en respuestas de navegación y restricciones estrictas de texto plano en los prompts de intención y gobernanza de atención.
- `src/components/screens/ZentrySettingsScreen.tsx`:
  - Selector interactivo de las 4 Personas Vocales con frases limpias y amigables.
  - Calibradores deslizantes en tiempo real para Tono / Pitch (`-2.0` a `+2.0` semitonos), Velocidad (`0.85x` a `1.20x`) y Ganancia de Volumen (`0.5` a `3.0` dB).
- `docs/walkthroughs/2026-08-24-walkthrough-voice-tts-neural-gcp.md`: Documento de walkthrough actualizado.

## 3. Estado de Compilación y Pruebas
- [x] `npm run build` ejecutado con éxito (código de salida 0, SingleFile bundle generado sin errores de TypeScript).
- [x] Servidor activo en puerto 5179 (`npm run dev:tts`).
- [x] Compatibilidad de firmas públicas preservada (`speakFeedback`, `startListening`, `stopListening`, `parseVoiceCommand`, `isSupported`).

## 4. Puntos de Atención para el Mezclador
- No se modificaron contratos compartidos destructivos en `src/types/zentry.ts` ni en `App.tsx`.
- Toda síntesis vocal pasa automáticamente por el filtro de pureza de texto y respeta las calibraciones del usuario persistidas en `localStorage`.

