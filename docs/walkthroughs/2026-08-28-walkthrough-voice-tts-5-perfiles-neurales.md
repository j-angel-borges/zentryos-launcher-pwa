# 🚀 Walkthrough de Código: 5 Perfiles de Voz Hiperrealistas & Selector en Isla Dinámica
- **Fecha:** 2026-08-28
- **Vertical:** Voice TTS GCP
- **Rama:** feat/neural-tts-gcp
- **Worktree:** D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\voice-tts
- **Puerto de Prueba:** 5179

---

## 1. Resumen Ejecutivo
Se integró el selector de **5 personalidades vocales hiperrealistas** (2 femeninas, 2 masculinas y 1 mentor socrático) tanto en los Ajustes del Sistema como en el centro de control rápido de la **Isla Dinámica** (pestaña `Audio / Voz`). Cada voz cuenta con saludo auditivo instantáneo al ser pulsada, ecualización Hi-Fi libre de resonancias graves, prosodia SSML dinámica y compatibilidad total online (GCP Neural2 / Studio) y offline (Microsoft Edge Natural).

---

## 2. Matriz de las 5 Personalidades Vocales

| Arquetipo | ID Persona | Nombre Visible | Modelo GCP | Voz Natural Edge / WebSpeech | Pitch / Rate / Gain | Estilo & Prosodia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Femenina Jovial** | `female_jovial` | 👩 **Sofía Urbana** | `es-US-Neural2-A` | `es-MX-DaliaNeural` | `+2.2st` / `1.07x` / `+1.2dB` | Fresca, joven de ciudad, ágil, sin fondo grave ni emojis. |
| **Femenina Adulta** | `female_adult` | 👩‍💼 **Elena Valdés** | `es-ES-Studio-C` | `es-ES-ElviraNeural` | `-0.8st` / `0.98x` / `+0.8dB` | Profesional, cálida, reflexiva y de dicción impecable. |
| **Masculina Jovial** | `male_jovial` | 👦 **Lucas Vega** | `es-US-Neural2-B` | `es-MX-JorgeNeural` | `+1.6st` / `1.06x` / `+1.4dB` | Dinámico, enérgico, espontáneo y motivador para retos. |
| **Masculina Adulta** | `male_adult` | 👨‍💼 **Carlos Mendoza** | `es-ES-Studio-F` | `es-ES-DarioNeural` | `-2.0st` / `0.96x` / `+1.0dB` | Sobrio, seguro, analítico y con presencia ejecutiva. |
| **Mentor Socrático** | `socratic_mentor` | 🧙‍♂️ **Maestro Aurelius** | `es-ES-Studio-F` | `es-ES-AlvaroNeural` | `-1.2st` / `0.92x` / `+1.0dB` | Sabio, pausado (micro-pausas 220-260ms), inspirador. |

---

## 3. Archivos Modificados / Creados
- [`src/components/shell/ZentryDynamicIsland.tsx`](file:///D:/1_jose_angel/1_GitHub/Zentry/zentryos-worktrees/voice-tts/src/components/shell/ZentryDynamicIsland.tsx):
  - Actualizada la pestaña 3 a **Audio / Voz** (`Volume2`).
  - Añadido el panel selector de las 5 personalidades vocales con badges de género, descripción e indicación visual de voz activa.
  - Implementada la función `handleSelectVoicePersona` con saludo de prueba en tiempo real al conmutar entre voces.
  - Integrado el botón de repetición de audio ("Escuchar") en las respuestas socráticas generadas por Zentry AI.
- [`src/services/voiceSpeech.ts`](file:///D:/1_jose_angel/1_GitHub/Zentry/zentryos-worktrees/voice-tts/src/services/voiceSpeech.ts):
  - Definidos los 5 tipos de `VoicePersona` y diccionario `VOICE_PERSONAS`.
  - Prosodia SSML dinámica (`buildNaturalSSML`) con micro-pausas adaptativas.
  - Ecualización `high-fidelity-headphone-class-device` con ganancia limpia de 1.2 dB.
  - Ponderación inteligente offline (`getBestNaturalOfflineVoice`).
- [`src/components/screens/ZentrySettingsScreen.tsx`](file:///D:/1_jose_angel/1_GitHub/Zentry/zentryos-worktrees/voice-tts/src/components/screens/ZentrySettingsScreen.tsx):
  - Selector completo en la sección de Ajustes con calibración acústica y frases de demostración.
- [`src/services/aiService.ts`](file:///D:/1_jose_angel/1_GitHub/Zentry/zentryos-worktrees/voice-tts/src/services/aiService.ts), [`src/services/voiceAgentService.ts`](file:///D:/1_jose_angel/1_GitHub/Zentry/zentryos-worktrees/voice-tts/src/services/voiceAgentService.ts), [`src/services/agencyService.ts`](file:///D:/1_jose_angel/1_GitHub/Zentry/zentryos-worktrees/voice-tts/src/services/agencyService.ts):
  - Inyectada la directiva `GLOBAL_SPEECH_RULES` con sanitización estricta de emojis y vocablos no deseados.

---

## 4. Estado de Compilación y Pruebas
- [x] `npm run build` ejecutado con éxito (código de salida 0, 1871 módulos transformados, SingleFile empaquetado limpiamente).
- [x] Servidor de desarrollo activo en `http://localhost:5179/` (`npm run dev:tts`).
- [x] Probada la alternancia y reproducción de voces en la Isla Dinámica.

---

## 5. Puntos de Atención para el Mezclador
- `src/components/shell/ZentryDynamicIsland.tsx` y `src/services/voiceSpeech.ts` están completamente sincronizados. Se mantienen los alias legacy para retrocompatibilidad total con los demás worktrees.
