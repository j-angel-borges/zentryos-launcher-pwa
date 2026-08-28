# 🚀 Walkthrough de Código: 5 Perfiles de Voz Hiperrealistas (VoiceStudio & Voice-Chat-AI)
- **Fecha:** 2026-08-28
- **Vertical:** Voice TTS GCP
- **Rama:** feat/neural-tts-gcp
- **Worktree:** D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\voice-tts
- **Puerto de Prueba:** 5179

---

## 1. Resumen Ejecutivo
Se realizó una investigación técnica en profundidad sobre los repositorios de síntesis vocal neuronal `debpalash/VoiceStudio` y `bigsk1/voice-chat-ai`. A partir de los hallazgos acústicos, se configuraron e integraron **5 perfiles de voz hiperrealistas** (2 femeninas, 2 masculinas y 1 mentor socrático), eliminando la resonancia grave/acartonada y dotando a ZentryOS de prosodia natural, pausas respiratorias dinámicas y soporte tanto en Cloud (GCP Neural2 / Studio HD) como Offline (Edge / Chrome Natural WebSpeech).

---

## 2. Matriz de las 5 Personalidades Vocales Implementadas

| Arquetipo | ID Persona | Nombre Visible | Modelo GCP | Voz Natural Edge / WebSpeech | Pitch / Rate / Gain | Estilo & Prosodia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Femenina Jovial** | `female_jovial` | 👩 **Sofía Urbana** | `es-US-Neural2-A` | `es-MX-DaliaNeural` | `+2.2st` / `1.07x` / `+1.2dB` | Fresca, joven de ciudad, ágil, sin fondo grave ni emojis. |
| **Femenina Adulta** | `female_adult` | 👩‍💼 **Elena Valdés** | `es-ES-Studio-C` | `es-ES-ElviraNeural` | `-0.8st` / `0.98x` / `+0.8dB` | Profesional, cálida, reflexiva y de dicción impecable. |
| **Masculina Jovial** | `male_jovial` | 👦 **Lucas Vega** | `es-US-Neural2-B` | `es-MX-JorgeNeural` | `+1.6st` / `1.06x` / `+1.4dB` | Dinámico, enérgico, espontáneo y motivador para retos. |
| **Masculina Adulta** | `male_adult` | 👨‍💼 **Carlos Mendoza** | `es-ES-Studio-F` | `es-ES-DarioNeural` | `-2.0st` / `0.96x` / `+1.0dB` | Sobrio, seguro, analítico y con presencia ejecutiva. |
| **Mentor Socrático** | `socratic_mentor` | 🧙‍♂️ **Maestro Aurelius** | `es-ES-Studio-F` | `es-ES-AlvaroNeural` | `-1.2st` / `0.92x` / `+1.0dB` | Sabio, pausado (micro-pausas 220-260ms), inspirador. |

---

## 3. Archivos Modificados / Creados
- `src/services/voiceSpeech.ts`:
  - Definidos los 5 tipos de `VoicePersona` (`female_jovial`, `female_adult`, `male_jovial`, `male_adult`, `socratic_mentor` y alias legacy).
  - Diccionario `VOICE_PERSONAS` enriquecido con asignación precisa de modelos GCP Studio/Neural2 y voces Edge-TTS Naturales.
  - Implementado `buildNaturalSSML()` con micro-pausas respiratorias adaptadas a la personalidad (110ms para jóvenes vs 220-260ms para mentores).
  - Eliminado el perfil de audio `small-bluetooth-speaker-class-device` que causaba el fondo grave artificial; sustituido por `high-fidelity-headphone-class-device` (+1.2 dB limpio).
  - Actualizado `getBestNaturalOfflineVoice()` y `speakOfflineFallback()` con ponderación inteligente por género y voz neural (`Dalia`, `Jorge`, `Elvira`, `Dario`, `Alvaro`).
- `src/components/screens/ZentrySettingsScreen.tsx`:
  - Actualizado el selector de voces con cuadrícula de las 5 personalidades vocales hiperrealistas e iconografía distintiva.
  - Frases de prueba y demostración dinámicas (`setTestPhrase`) adaptadas al tono único de cada personaje.
- `src/services/aiService.ts`, `src/services/voiceAgentService.ts`, `src/services/agencyService.ts`:
  - Inyectada la directiva `GLOBAL_SPEECH_RULES` con sanitización estricta de emojis y exclusión de modismos condescendientes.

---

## 4. Estado de Compilación y Pruebas
- [x] `npm run build` ejecutado con éxito (código de salida 0, 1871 módulos transformados, SingleFile empaquetado limpiamente).
- [x] Servidor de desarrollo activo en `http://localhost:5179/` (`npm run dev:tts`).

---

## 5. Puntos de Atención para el Mezclador
- `src/services/voiceSpeech.ts` y `src/components/screens/ZentrySettingsScreen.tsx` contienen la nueva arquitectura de 5 voces. Los alias legacy (`zentry_jovial`, `toddler_sweet`, `companion_spark`) se mantienen para compatibilidad total con los demás worktrees.
