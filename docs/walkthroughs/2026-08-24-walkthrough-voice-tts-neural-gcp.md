# 🚀 Walkthrough de Código: Síntesis Vocal Neuronal GCP / Vertex AI, Calibración Acústica & Caché IndexedDB

- **Fecha:** 2026-08-27
- **Vertical:** Voice TTS GCP
- **Rama:** feat/neural-tts-gcp
- **Worktree:** D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\voice-tts
- **Puerto de Prueba:** 5179

---

## 1. Resumen Ejecutivo
Se implementó una arquitectura de audio neuronal de ultra-alta fidelidad para `src/services/voiceSpeech.ts` y `src/components/screens/ZentrySettingsScreen.tsx`. Se integraron los modelos de estudio GCP (`es-US-Studio-B` 24kHz HD, `es-US-Neural2-A`, `es-ES-Studio-C`, `es-US-Neural2-C`), prosodia SSML natural con micro-pausas respiratorias en signos de puntuación, un selector inteligente de voces naturales offline (scoring de voces `Online Natural` y `Google` para evitar voces robóticas legacy de Windows), y un panel de calibración acústica en tiempo real (Pitch semitonal, Rate, Gain dB) persistido globalmente en `localStorage`.

## 2. Archivos Modificados / Creados
- `src/services/voiceSpeech.ts`:
  - 4 Personas de Voz hiperrealistas configuradas:
    - **`toddler_sweet`:** `es-US-Neural2-A` (Femenina cálida y afectuosa para niños 2-5 años).
    - **`socratic_studio`:** `es-US-Studio-B` (Masculina reflexiva, madura, estudio HD 24kHz).
    - **`academic_female`:** `es-ES-Studio-C` (Femenina motivadora y articulada para estudio).
    - **`explorer_adventurer`:** `es-US-Neural2-C` (Juvenil enérgica para retos STEM y misiones).
  - Peticiones GCP con SSML dinámico (`<prosody>`, `<break time="..."/>`), sample rate 24kHz y perfiles de ecualización para altavoz/auricular.
  - Selector inteligente de voces offline que prioriza voces neuronales de navegador (`Microsoft Dalia Online Natural`, `Microsoft Jorge Online Natural`, `Google español`) descartando voces sintéticas antiguas.
  - Persistencia de calibración acústica personalizada en `localStorage` (`zentry_tts_custom_settings`) aplicable a todas las llamadas de voz en todo el sistema.
- `src/components/screens/ZentrySettingsScreen.tsx`:
  - Selector interactivo de las 4 Personas de Voz con tarjetas visuales.
  - Calibradores deslizantes en tiempo real para Tono / Pitch (`-2.0` a `+2.0` semitonos), Velocidad (`0.85x` a `1.20x`) y Ganancia de Volumen (`0.5` a `3.0` dB) con botón de restauración a valores recomendados.
  - Campo de API Key de Google Cloud con toggle de visibilidad y prueba de voz con latencia 0 ms vía IndexedDB.
- `docs/walkthroughs/2026-08-24-walkthrough-voice-tts-neural-gcp.md`: Documento de walkthrough actualizado para auditoría del Mezclador.

## 3. Estado de Compilación y Pruebas
- [x] `npm run build` ejecutado con éxito (código de salida 0, SingleFile bundle generado sin errores de TypeScript).
- [x] Compatibilidad de firmas públicas preservada (`speakFeedback`, `startListening`, `stopListening`, `parseVoiceCommand`, `isSupported`).

## 4. Puntos de Atención para el Mezclador
- No se modificaron contratos compartidos destructivos en `src/types/zentry.ts` ni en `App.tsx`.
- Si el usuario cuenta con `VITE_GOOGLE_TTS_API_KEY`, el sistema sintetiza directamente con las redes neuronales Studio HD / Neural2 de Google Cloud. Si no cuenta con clave, el motor offline inteligente selecciona automáticamente las voces neuronales más humanas instaladas en el navegador/sistema.

