# 🚀 Walkthrough de Código: Síntesis Vocal Neuronal GCP / Vertex AI & Caché IndexedDB

- **Fecha:** 2026-08-24
- **Vertical:** Voice TTS GCP
- **Rama:** feat/neural-tts-gcp
- **Worktree:** D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\voice-tts
- **Puerto de Prueba:** 5179

---

## 1. Resumen Ejecutivo
Se implementó la evolución completa del servicio `src/services/voiceSpeech.ts` para integrar Google Cloud Text-to-Speech (voces Neural2 y Journey) con latencia 0 ms mediante persistencia de audio en `IndexedDB` (`zentry_tts_db`). Se configuraron perfiles adaptativos de voz por cohortes de edad (`toddler` 2-5 años vs `explorer` 5-10+ años), cancelación y anti-solapamiento vía `AbortController`, desbloqueo proactivo de autoplay y fallback resiliente offline a `window.speechSynthesis`.

## 2. Archivos Modificados / Creados
- `src/services/voiceSpeech.ts`:
  - Integración con REST API de Google Cloud Text-to-Speech (`https://texttospeech.googleapis.com/v1/text:synthesize`).
  - Motor de caché local en `IndexedDB` (Base `zentry_tts_db`, Object Store `audio_cache`) con almacenamiento en Blob/MP3 para latencia 0 ms.
  - Perfiles de cohorte por edad:
    - **`toddler` (2-5 años):** Voz `es-US-Neural2-A`, tono/pitch `+1.5`, speakingRate `1.08`.
    - **`explorer` (5-10+ años):** Voz `es-US-Journey-F`, tono `0.0`, speakingRate `1.02`.
  - Mecanismo anti-solapamiento con `AbortController.abort()` para peticiones HTTP en curso y pausa/liberación inmediata de elementos de audio previos.
  - Métodos `unlockAudioContext()` para sortear restricciones de autoplay del navegador y `preloadPhrases()` para precarga proactiva en segundo plano.
  - Fallback offline automático a `window.speechSynthesis` sin arrojar excepciones ni degradar la experiencia de usuario.
- `src/components/screens/ZentrySettingsScreen.tsx`:
  - Panel interactivo de configuración y prueba de voz con selector de cohorte (`toddler` vs `explorer`), campo de texto personalizado, botón de reproducción en vivo y control de limpieza de caché `IndexedDB`.
- `docs/walkthroughs/2026-08-24-walkthrough-voice-tts-neural-gcp.md`: Documento de walkthrough para auditoría del Mezclador.

## 3. Estado de Compilación y Pruebas
- [x] `npm run build` ejecutado con éxito (código de salida 0, bundle SingleFile generado limpiamente sin errores de TypeScript).
- [x] Compatibilidad de firmas públicas preservada (`speakFeedback`, `startListening`, `stopListening`, `parseVoiceCommand`, `isSupported`).

## 4. Puntos de Atención para el Mezclador
- No se modificaron contratos compartidos destructivos en `src/types/zentry.ts` ni en `App.tsx`.
- Para activar la síntesis neuronal en vivo con GCP en producción o desarrollo local, definir la variable de entorno `VITE_GOOGLE_TTS_API_KEY` en `.env.local`. Si no se define, el sistema opera en modo fallback transparente usando la síntesis offline del navegador.
