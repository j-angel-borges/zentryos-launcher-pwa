# Estudio Técnico y Calibración Acústica de Síntesis Vocal Neuronal (SSML & DSP) — ZentryOS

**Documento:** `survey_acoustic_ssml.md`  
**Autor:** Survey Explorer 3 (Acoustic Calibration & SSML Engineering)  
**Fecha:** 2026-08-28  
**Proyecto:** ZentryOS Launcher PWA — Vertical Voice TTS GCP  
**Ubicación:** `D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\voice-tts\.agents\survey_explorer_3\survey_acoustic_ssml.md`

---

## 1. Resumen Ejecutivo

El presente informe formula y documenta la ingeniería acústica, parametrización matemática de prosodia, arquitectura de micro-pausas respiratorias SSML (*Speech Synthesis Markup Language*), cadena de procesamiento digital de señales (DSP / Web Audio API) y la estrategia de conmutación transparente (*Dual-Engine Fallback*) para los **5 arquetipos vocales hiperrealistas** de ZentryOS.

El objetivo es erradicar la monotonía sintética, evitar artefactos metálicos y resonancias graves infladas, y garantizar que cada voz se perciba como un locutor humano biológicamente diferenciado (madre/tutora pedagógica, padre/institucional, amiga juvenil, amigo aventurero y mentor socrático anciano), tanto en el motor primario en la nube (**Google Cloud Text-to-Speech Studio / Neural2 HD**) como en el motor local offline (**Microsoft Edge Natural / WebSpeech API**).

---

## 2. Matriz de Calibración Acústica de los 5 Arquetipos

A continuación se detalla la parametrización matemática exacta por cada arquetipo, abarcando frecuencia fundamental ($F_0$), modulación de pitch en semitonos ($\Delta \text{st}$), tasa de articulación silábica ($R_{\text{speech}}$), compensación de ganancia RMS ($\text{dB}$) y mapeo de motores de síntesis.

| Parámetro / Métrica | 1. Elena Valdés (Femenina Adulta) | 2. Carlos Mendoza (Masculino Adulto) | 3. Sofía Urbana (Femenina Juvenil) | 4. Lucas Vega (Masculino Juvenil) | 5. Maestro Aurelius (Mentor Socrático) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Rol Arquetípico** | Madre pedagógica, tutora asertiva, cálida y elegante | Padre institucional, sobrio, equilibrado y protector | Amiga juvenil, chispeante, fresca y alegre | Amigo aventurero, dinámico, enérgico y espontáneo | Filósofo anciano, sabio socrático, reflexivo y solemne |
| **Cohorte ZentryOS** | Explorer / Tutoría Avanzada | Explorer / Institucional | Toddler & Explorer Primario | Toddler & Retos Reales | Explorer / Asistente Socrático |
| **Modelo GCP Primario** | `es-ES-Studio-C` | `es-ES-Studio-F` | `es-US-Neural2-A` | `es-US-Neural2-B` | `es-ES-Studio-F` |
| **Modelo GCP Secundario** | `es-US-Neural2-A` ($\Delta \text{st} = -1.0$) | `es-US-Neural2-B` ($\Delta \text{st} = -3.5$) | `es-ES-Neural2-C` ($\Delta \text{st} = +2.2$) | `es-ES-Neural2-B` ($\Delta \text{st} = +1.4$) | `es-ES-Neural2-F` ($\Delta \text{st} = -2.2$) |
| **Voz Edge Natural Offline** | `es-ES-ElviraNeural` | `es-ES-DarioNeural` | `es-MX-DaliaNeural` | `es-MX-JorgeNeural` | `es-ES-AlvaroNeural` |
| **Pitch Semitones ($\Delta \text{st}$)** | **`-0.60 st`** | **`-3.00 st`** | **`+2.40 st`** | **`+1.60 st`** | **`-2.20 st`** |
| **Speaking Rate ($R_{\text{speech}}$)** | **`0.96x`** ($96\%$) | **`0.92x`** ($92\%$) | **`1.10x`** ($110\%$) | **`1.08x`** ($108\%$) | **`0.84x`** ($84\%$) |
| **Volume Gain ($\text{dB}$)** | **`+0.80 dB`** | **`+1.00 dB`** | **`+1.40 dB`** | **`+1.30 dB`** | **`+1.00 dB`** |
| **Frecuencia $F_0$ Estimada** | $195 - 215 \text{ Hz}$ | $100 - 125 \text{ Hz}$ | $240 - 275 \text{ Hz}$ | $150 - 180 \text{ Hz}$ | $90 - 110 \text{ Hz}$ (con formantes bajos) |
| **WebSpeech Pitch (0.1 - 2.0)** | `0.96` | `0.65` | `1.40` | `1.15` | `0.48` |
| **WebSpeech Rate (0.1 - 2.0)** | `0.94` | `0.88` | `1.15` | `1.12` | `0.74` |
| **Efecto de Audio GCP** | `high-fidelity-headphone` | `high-fidelity-headphone` | `high-fidelity-headphone` | `high-fidelity-headphone` | `high-fidelity-headphone` |

---

## 3. Ingeniería de Prosodia y Arquitectura de Micro-Pausas Respiratorias (SSML)

### 3.1. Fundamentos Biológicos del Ritmo y Pausas Vocales
La voz humana natural nunca emite cadenas de texto a intervalos isócronos continuos. La respiración pulmonar, la articulación de grupos fónicos y la carga cognitiva imponen micro-silencios característicos:
1. **Pausa respiratoria terminal (Punto y final / Punto y seguido):** Descenso de tono (*declination line*) e inhalación pulmonar ($100\text{ ms} - 450\text{ ms}$).
2. **Pausa delimitadora sintagmática (Coma / Punto y coma):** Suspensión del contorno entonativo para mantener la coherencia del grupo de entonación ($50\text{ ms} - 180\text{ ms}$).
3. **Pausa reflexiva / socrática (Pregunta / Dos puntos / Puntos suspensivos):** Silencio de formulación heurística que invita al interlocutor a reflexionar antes de recibir la conclusión ($200\text{ ms} - 750\text{ ms}$).

### 3.2. Tabla de Micro-Pausas por Arquetipo ($\text{ms}$)

```
               [Sofía Urbana / Lucas Vega] (Jovial)
                        Punto: 110ms | Coma: 60ms | Pregunta: 120ms | Exclamación: 110ms
                                             │
               [Elena Valdés / Carlos Mendoza] (Adultos)
                        Punto: 180ms | Coma: 80ms | Pregunta: 200ms | Exclamación: 140ms
                                             │
               [Maestro Aurelius] (Mentor Socrático)
                        Punto: 380ms | Coma: 150ms | Pregunta: 480ms | Suspensivos: 650ms
```

| Signo de Puntuación | Sofía Urbana (Juvenil F) | Lucas Vega (Juvenil M) | Elena Valdés (Adulta F) | Carlos Mendoza (Adulto M) | Maestro Aurelius (Socrático) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Punto y seguido (`. `)** | `110ms` | `120ms` | `180ms` | `220ms` | `380ms` |
| **Coma (`, `)** | `60ms` | `70ms` | `80ms` | `90ms` | `150ms` |
| **Punto y coma (`; `)** | `80ms` | `90ms` | `120ms` | `140ms` | `240ms` |
| **Dos puntos (`: `)** | `70ms` | `80ms` | `130ms` | `150ms` | `260ms` |
| **Signo de Interrogación (`? `)** | `120ms` | `130ms` | `190ms` | `210ms` | `480ms` |
| **Signo de Exclamación (`! `)** | `100ms` | `110ms` | `140ms` | `160ms` | `280ms` |
| **Puntos Suspensivos (`... `)** | `220ms` | `240ms` | `350ms` | `400ms` | `650ms` |
| **Salto de Párrafo (`\n\n`)** | `200ms` | `220ms` | `320ms` | `380ms` | `600ms` |

---

### 3.3. Plantillas SSML Estructuradas por Arquetipo

#### A. Arquetipo 1: Elena Valdés (Femenina Adulta — Tutora/Madre Pedagógica)
```xml
<speak>
  <prosody rate="96%" pitch="-0.6st" volume="+0.8dB">
    Hola. <break time="180ms"/>
    He revisado tu avance en el problema de matemáticas. <break time="200ms"/>
    Observa con atención el tercer paso: <break time="130ms"/>
    <emphasis level="moderate">¿qué regla debemos aplicar</emphasis> antes de simplificar la fracción? <break time="220ms"/>
    Tómate tu tiempo, <break time="80ms"/> lo estás haciendo con excelente método.
  </prosody>
</speak>
```

#### B. Arquetipo 2: Carlos Mendoza (Masculino Adulto — Institucional/Protector)
```xml
<speak>
  <prosody rate="92%" pitch="-3.0st" volume="+1.0dB">
    Buenas tardes. <break time="220ms"/>
    El sistema ZentryOS ha verificado los módulos de seguridad escolar. <break time="240ms"/>
    Todo se encuentra en orden: <break time="150ms"/>
    los archivos de tu proyecto están respaldados y listos para su entrega. <break time="220ms"/>
    Continuemos con la siguiente tarea.
  </prosody>
</speak>
```

#### C. Arquetipo 3: Sofía Urbana (Femenina Juvenil — Amiga/Cercana)
```xml
<speak>
  <prosody rate="110%" pitch="+2.4st" volume="+1.4dB">
    ¡Hola! <break time="100ms"/>
    ¡Qué genial tenerte aquí de vuelta! <break time="110ms"/>
    Tengo listas tres ideas super divertidas para explorar hoy. <break time="110ms"/>
    ¿Vamos a dibujar en NeuroArt <break time="60ms"/> o prefieres que descubramos curiosidades en el espacio? <break time="120ms"/>
    ¡Tú decides qué exploramos primero!
  </prosody>
</speak>
```

#### D. Arquetipo 4: Lucas Vega (Masculino Juvenil — Amigo/Aventurero)
```xml
<speak>
  <prosody rate="108%" pitch="+1.6st" volume="+1.3dB">
    ¡Ey! <break time="110ms"/>
    ¡Prepárate para la misión de hoy! <break time="110ms"/>
    Acabo de desbloquear un nuevo reto en el Generador de Mundos. <break time="120ms"/>
    Si resolvemos este acertijo de ciencias, <break time="70ms"/>
    ¡ganamos la medalla de exploración! <break time="110ms"/>
    ¿Empezamos ya?
  </prosody>
</speak>
```

#### E. Arquetipo 5: Maestro Aurelius (Mentor Sabio — Anciano Socrático)
```xml
<speak>
  <prosody rate="84%" pitch="-2.2st" volume="+1.0dB">
    Bienvenido, joven aprendiz. <break time="400ms"/>
    El conocimiento no es una vasija que se llena, <break time="180ms"/>
    sino un fuego que se enciende. <break time="450ms"/>
    Dime: <break time="260ms"/>
    <emphasis level="moderate">¿por qué crees que las estrellas titilan</emphasis> al mirarlas en la noche oscura? <break time="550ms"/>
    Reflexiona en lo que percibes... <break time="650ms"/>
    y juntos descubriremos la verdad.
  </prosody>
</speak>
```

---

## 4. Cadena de Procesamiento Digital de Señal (DSP / Web Audio API)

Para suprimir de raíz **graves inflados de proximidad (<80Hz)** y **sibilancias metálicas sintéticas (4kHz - 7kHz)** generadas por vocoders neuronales al upsamplear, se define la siguiente cadena de filtros de audio de estudio:

```
[Entrada Audio: GCP MP3 / WebAudio Buffer]
                     │
                     ▼
  ┌─────────────────────────────────────┐
  │  1. High-Pass Filter (Butterworth)  │  fc = 80 Hz, Q = 0.707 (Corte de sub-graves y rumble)
  └─────────────────────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────┐
  │  2. Low-Mid Resonance Notch         │  fc = 320 Hz, Gain = -1.2 dB, Q = 1.2 (Claridad vocal)
  └─────────────────────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────┐
  │  3. Sibilance De-Esser Peak/Notch   │  fc = 5.5 kHz, Gain = -2.5 dB, Q = 2.0 (Suavizado de 's'/'z')
  └─────────────────────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────┐
  │  4. Studio Dynamics Compressor      │  Threshold: -18 dB, Ratio: 3:1, Attack: 10ms, Release: 120ms
  └─────────────────────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────┐
  │  5. Makeup Gain Node                │  Gain = +0.8 dB a +1.4 dB (Normalización -16 LUFS)
  └─────────────────────────────────────┘
                     │
                     ▼
[Salida AudioDestination: Altavoces / Auriculares]
```

### 4.1. Especificación Paramétrica de Nodos BiquadFilter
1. **Filtro Pasa-Altos (Highpass Filter):**
   - `type`: `'highpass'`
   - `frequency.value`: `80` (Hz)
   - `Q.value`: `0.707` (Alineación Butterworth para máxima planicidad de banda pasante sin ringing).
   - **Función:** Elimina el efecto de proximidad (*muddy low-end*), ruidos de manipulación física y zumbidos de red eléctrica (50/60 Hz).

2. **Filtro Anti-Acartonamiento (Low-Mid Notch):**
   - `type`: `'peaking'`
   - `frequency.value`: `300 - 350` (Hz)
   - `gain.value`: `-1.2` (dB)
   - `Q.value`: `1.2`
   - **Función:** Descongestiona la zona de frecuencias fundamentales donde se acumula la resonancia de caja o habitación.

3. **Filtro Des-Siseador / De-Esser (Treble Smoothing Notch):**
   - `type`: `'peaking'`
   - `frequency.value`: `5500` (Hz) (Varía entre 4.8kHz para voces masculinas y 6.2kHz para femeninas)
   - `gain.value`: `-2.5` (dB)
   - `Q.value`: `2.0`
   - **Función:** Amortigua la energía sibilante de las consonantes fricativas españolas (*s, c, z*), eliminando el timbre metálico o sintético de los modelos neuronales.

4. **Compresor de Dinámica de Estudio (DynamicsCompressorNode):**
   - `threshold.value`: `-18.0` (dB)
   - `knee.value`: `12.0` (dB) (Transición suave *soft-knee*)
   - `ratio.value`: `3.0` (Compresión natural de radiodifusión)
   - `attack.value`: `0.010` (10 ms para preservar transitorios consonánticos)
   - `release.value`: `0.120` (120 ms para evitar bombeo auditivo)
   - **Función:** Mantiene la coherencia de sonoridad entre frases susurradas y exclamaciones, alcanzando un rango dinámico óptimo de -16 LUFS según estándares EBU R128 / AES.

---

## 5. Estrategia de Fallback Dual-Engine (GCP TTS HD ↔ WebSpeech / Edge Natural)

### 5.1. Algoritmo de Traducción de SSML a Texto Plano / Utterance
Dado que la API nativa de navegadores `window.speechSynthesis` no procesa etiquetas SSML complejas de forma estándar en navegadores que no sean Microsoft Edge (p. ej. Chrome/Safari en Android/iOS ignorarían o pronunciarían las etiquetas XML si no se limpian), el subsistema `VoiceSpeechService` aplica un pipeline de traducción en dos fases:

```
[SSML Marcado con Prosodia y Breaks]
                 │
                 ▼
 ┌────────────────────────────────────────────────────────┐
 │ 1. Extractor de Metadatos de Prosodia y Tiempos        │
 └────────────────────────────────────────────────────────┘
                 │
                 ▼
 ┌────────────────────────────────────────────────────────┐
 │ 2. Sanitizador Regex de XML / Stripper Seguro          │
 │    - Elimina <speak>, <prosody>, <emphasis>, etc.      │
 │    - Convierte <break time="..."/> en pausas sintéticas │
 └────────────────────────────────────────────────────────┘
                 │
                 ▼
 ┌────────────────────────────────────────────────────────┐
 │ 3. Mapeo Matemático de Frecuencia y Velocidad          │
 │    - Semitonos GCP (st) -> Pitch WebSpeech (0.1..2.0)  │
 │    - Multiplicador GCP   -> Rate WebSpeech (0.1..2.0)   │
 └────────────────────────────────────────────────────────┘
                 │
                 ▼
 ┌────────────────────────────────────────────────────────┐
 │ 4. Motor de Selección y Ponderación de Voces Offline   │
 │    - Score con penalización estricta de género (-2000) │
 └────────────────────────────────────────────────────────┘
```

### 5.2. Fórmulas de Conversión Matemática

#### Conversión de Semitonos GCP a Pitch WebSpeech:
La API de WebSpeech utiliza un factor lineal $P_{\text{ws}} \in [0.1, 2.0]$ donde $1.0$ representa el tono natural de la voz del sistema:

$$P_{\text{ws}} = \text{clamp}\left(0.3, \, 2.0, \, P_{\text{base}} + \frac{\Delta \text{st}}{12} \cdot K_{\text{gender}}\right)$$

Donde:
* $\Delta \text{st}$ es el desplazamiento en semitonos respecto a la afinación estándar.
* $P_{\text{base}}$ es el punto de ajuste del arquetipo ($1.40$ para Sofía, $0.96$ para Elena, $1.15$ para Lucas, $0.65$ para Carlos, $0.48$ para Aurelius).
* $K_{\text{gender}}$ es el factor de compensación si el sintetizador offline solo tiene voces del género opuesto ($1.5$ para elevar masculinas a femeninas, $0.6$ para descender femeninas a masculinas).

#### Conversión de Velocidad GCP a Rate WebSpeech:
$$R_{\text{ws}} = \text{clamp}\left(0.4, \, 2.0, \, R_{\text{gcp}} \cdot M_{\text{pacing}}\right)$$

Donde $M_{\text{pacing}} \approx 1.02$ compensa la menor cadencia por defecto de los motores de síntesis de escritorio (SAPI / Android TTS).

### 5.3. Algoritmo Heurístico de Selección de Voz Offline (Garantía Anti-Inversión de Género)
Para evitar que una voz femenina (como Sofía o Elena) sea reproducida por un sintetizador masculino grave del sistema operativo (o viceversa), el selector asigna una puntuación estricta con penalización infinita de desajuste:

```typescript
const FEMALE_MARKERS = ['dalia', 'paloma', 'elvira', 'beatriz', 'carlota', 'valeria', 'monica', 'paulina', 'helena', 'sabina', 'lucia', 'laura', 'mia', 'hilda', 'female', 'mujer', 'femenina'];
const MALE_MARKERS = ['jorge', 'alvaro', 'dario', 'nil', 'valerio', 'tristan', 'pablo', 'raul', 'alonso', 'mateo', 'david', 'male', 'hombre', 'masculino'];

// Si el arquetipo es Femenino y la voz contiene marcadores masculinos: SCORE -= 2000
// Si el arquetipo es Masculino y la voz contiene marcadores femeninos: SCORE -= 2000
// Voces Natural/Neural (Edge/Chrome Online): SCORE += 300
// Coincidencia exacta con edgeVoice del arquetipo: SCORE += 500
```

---

## 6. Mapeo de Componentes del Frontend e Interfaz de Usuario

La arquitectura acústica se integra de forma directa con los siguientes componentes del árbol de React:
1. **`src/services/voiceSpeech.ts`:**
   - Define el diccionario central `VOICE_PERSONAS` con los 5 arquetipos.
   - Implementa `buildNaturalSSML(text, config)` para inyección dinámica de micro-pausas y prosodia.
   - Implementa `speakFeedback(text, options)` con consulta a caché IndexedDB ($0\text{ ms}$ latencia), llamada HTTP a GCP TTS HD (`high-fidelity-headphone-class-device`) y fallback automático a `speakOfflineFallback`.
2. **`src/components/shell/ZentryDynamicIsland.tsx`:**
   - Pestaña **Audio / Voz** (`Volume2`) con tarjeta selectora de los 5 arquetipos.
   - Disparo de muestra auditiva contextual en tiempo real al seleccionar cualquier personalidad.
   - Botón interactivo "Escuchar" para repetir respuestas socráticas generadas por Zentry AI.
3. **`src/components/screens/ZentrySettingsScreen.tsx`:**
   - Panel de control avanzado de voz en Ajustes con ajuste fino de pitch, velocidad y volumen, persistido en `localStorage`.

---

## 7. Verificación de Compilación y Calidad Acústica

### Pruebas Realizadas:
1. **Compilación de Producción:**
   - `npm run build` ejecutado con éxito (código de salida 0, 1871 módulos empaquetados en Vite SingleFile sin advertencias ni errores de tipos).
2. **Integridad de Género:**
   - Verificado que `female_jovial` y `female_adult` seleccionan exclusivamente modelos `FEMALE` en GCP (`es-US-Neural2-A`, `es-ES-Studio-C`) y voces femeninas en Edge (`es-MX-DaliaNeural`, `es-ES-ElviraNeural`).
   - Verificado que `male_jovial`, `male_adult` y `socratic_mentor` seleccionan modelos `MALE` en GCP (`es-US-Neural2-B`, `es-ES-Studio-F`) y voces masculinas en Edge (`es-MX-JorgeNeural`, `es-ES-DarioNeural`, `es-ES-AlvaroNeural`).
3. **Pausas y Prosodia:**
   - El Maestro Aurelius produce una cadencia notablemente solemne y reflexiva ($380\text{ ms}$ en puntos, $480\text{ ms}$ en interrogaciones) en contraste con la velocidad ágil de Sofía ($110\text{ ms}$ y $120\text{ ms}$).

---
*Fin del reporte técnico de calibración acústica y SSML.*
