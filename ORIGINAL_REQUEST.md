# Original User Request

## 2026-08-28T18:35:46Z

Investigación en repositorios abiertos de síntesis vocal neuronal (GCP TTS, Coqui XTTS v2, Kokoro, Edge TTS, Piper, Bark, StyleTTS2) e implementación de la calibración acústica, modelos exactos y SSML de 5 personalidades vocales hiperrealistas diferenciadas para la Isla Dinámica de ZentryOS.

Working directory: D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\voice-tts
Integrity mode: development

## Requirements

### R1. Investigación y Selección de Modelos para 5 Arquetipos Vocales Humanos
Investigar en repositorios de vanguardia y catálogo de voces neuronales (Google Cloud Text-to-Speech Studio/Neural2, Coqui TTS / XTTS v2, Kokoro-82M, Edge Natural) para seleccionar los modelos y locutores exactos que representen con máximo realismo:
- **2 Voces Adultas (Parentales):**
  - **Femenina Adulta (Madre/Profesional - Elena Valdés):** Tono cálido, maternal, seguro, articulación pedagógica clara.
  - **Masculina Adulta (Padre/Institucional - Carlos Mendoza):** Tono barítono, sobrio, equilibrado, natural y protector.
- **2 Voces Juveniles / Infantiles (Amigos):**
  - **Femenina Juvenil (Amiga/Cercana - Sofía Urbana):** Tono brillante, fresco, alegre, ágil y cercano para niños y jóvenes.
  - **Masculina Juvenil (Amigo/Aventurero - Lucas Vega):** Tono dinámico, enérgico, entusiasta y espontáneo.
- **1 Voz de Mentor Sabio (Anciano Socrático - Maestro Aurelius):**
  - **Masculino Anciano/Filosófico:** Tono profundo, ritmo solemne, pausas socráticas marcadas y textura reflexiva/soplada.

### R2. Calibración Acústica de Prosodia, SSML y Efectos de Estudio
Definir y aplicar para cada una de las 5 voces la configuración exacta de:
- Pitch (semitonos), Speaking Rate (velocidad conversacional), Volume Gain y perfil de ecualización Hi-Fi.
- Marcado SSML con micro-pausas respiratorias (`<break time="..."/>`) orgánicas según el arquetipo (ágil para amigos, pausado para padres, reflexivo con silencios para el mentor).
- Supresión total de frecuencias graves infladas y artefactos metálicos.

### R3. Integración en el Motor de Voz PWA e Isla Dinámica
Implementar la matriz definitiva en el frontend TypeScript (`voiceSpeech.ts`, `ZentryDynamicIsland.tsx`, `ZentrySettingsScreen.tsx`), asegurando:
- Selección instantánea desde la pestaña `Audio / Voz` de la Isla Dinámica y desde Ajustes.
- Muestras habladas coherentes con la personalidad al seleccionar cada voz.
- Compatibilidad garantizada tanto con Google Cloud TTS HD (online) como con Edge/WebSpeech Natural (offline).

## Acceptance Criteria

### 1. Distinción Acústica Inequívoca
- [ ] Cada una de las 5 voces suena como una persona/actor biológico diferente (madre, padre, amiga joven, amigo joven, anciano sabio) y no como la misma voz modulada en tono.
- [ ] La voz del mentor cuenta con un ritmo reflexivo y pausas más largas que las voces juveniles.

### 2. Estabilidad de Género e Integridad Vocal
- [ ] Ninguna voz femenina cae en registros masculinos ni viceversa en ningún escenario (online u offline).
- [ ] No existen distorsiones robóticas ni filtros de altavoz de baja fidelidad.

### 3. Compilación y Rendimiento
- [ ] `npm run build` compila con código 0 y sin errores de TypeScript.
- [ ] La selección y reproducción de voces en la Isla Dinámica responde de forma fluida e inmediata.
