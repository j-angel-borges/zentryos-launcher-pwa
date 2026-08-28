# 📋 CHANGELOG — ZentryOS Launcher PWA

Historial de cambios, fusiones de worktrees y versiones del Launcher PWA.

## [2026-08-28] — Merge: Evolución de Suite Creativa (Lienzo, Simulador, Imagine, Build) & Curación Vocal Elena/Lucas en Isla Dinámica
- **1. Suite de Creación & UI (`feat/ui-shell-age-tiering` + `feat/microapps-ai-core`):**
  - **Lienzo (`ZentryFreeCanvasScreen.tsx`):** Trazo anti-pixelado con suavizado Bézier cuadrático, 4 grosores táctiles, dock de 8 formas vectoriales y selector maestro de 36 colores estilo Paint flotante (`z-50`).
  - **Simulador (`ZentrySimulatorScreen.tsx`):** Estandarización de iconos SVG nativos de `lucide-react`, sustituyendo emojis en accesorios, climas y auras mágicas.
  - **Imagine AI & Zentry Build (`ZentryImagineScreen.tsx`, `ZentryBuildScreen.tsx`):** Integración de generación visual y constructor de mini apps interactivo en tiempo real con Gemini/Vertex AI para el segmento Explorer (5-10+ años).
  - **Misiones Reales:** Estandarización visual de la ruleta de retos físicos y badges coleccionables con iconos vectoriales.
  - **Cajón de Crear & Burbujas:** Desbloqueo de eventos táctiles para apertura instantánea en `FisheyeBubbleGrid.tsx`.
- **2. Voice TTS GCP & Isla Dinámica (`feat/neural-tts-gcp`):**
  - **Curación Vocal:** Reducción a 2 voces humanas hiperrealistas de estudio: **Elena** (femenina pedagógica, GCP Studio-C) y **Lucas** (masculino dinámico, GCP Neural2-B) sin apellidos ni textos redundantes.
  - **Isla Dinámica (Tab Audio):** Selector de 2 columnas de alta fidelidad con muestra de voz inmediata y barra de preguntas socráticas por voz.
  - **Suite E2E:** 123 tests de síntesis vocal neuronal ejecutados con 100% de éxito.
- **Estado de Build:** ✓ Compilación exitosa verificada (`npm run build` SingleFile `dist/index.html` ~1.50 MB, código 0).
- **Estado de Tests:** ✓ 123/123 tests E2E pasando.

---

## [2026-08-24] — Merge General: Integración de Todas las Verticales (Ramas: feat/ui-shell-age-tiering, feat/microapps-ai-core, feat/entertainment-hub, feat/neural-tts-gcp)
- **1. UI & Shell (`feat/ui-shell-age-tiering`):**
  - Modularización de vistas por edad: Home Toddler (2-5 años) con cajones simétricos Bento Liquid Glass (`Crear`, `Entretenimiento`, `Cámara`, `Reloj`) y Home Explorer (5-10+ años) con App Grid completo.
  - Isla Dinámica Zentry interactiva con píldora flotante, estado de telemetría en tiempo real y asistencia contextual por voz.
  - Barra unificada de navegación inferior con micrófono Web Speech API integrado, atajos rápidos y resolución socrática.
- **2. IA & Microapps de Creación (`feat/microapps-ai-core`):**
  - Suite de 6 microapps sensoriales guiadas por voz TTS con física de ojo de pez tipo Apple Watch en cuadrícula de 160px: Art-Attack (NeuroArt con sellos táctiles y cámara phygital), Generador de Mundos (6 aventuras de rol), Creador de Personajes, Lienzo Libre, Misiones Reales (ruleta de retos físicos) y Monstruos Amigables.
- **3. Entertainment Hub (`feat/entertainment-hub`):**
  - Catálogo verificado de 200 contenidos infantiles curados sin algoritmos adictivos.
  - 4 Portales flotantes Liquid Glass con réplicas UI fieles: ZentryTube (YouTube Kids), ZentryTok (TikTok oficial con reproductor iframe seguro), ZentryGram (Instagram visual) y ZentryStream (YouTube Music con tocadiscos de vinilo giratorio).
- **4. Voice TTS GCP (`feat/neural-tts-gcp`):**
  - Síntesis vocal neuronal GCP con voces Neural2 y Journey, latencia 0 ms con caché IndexedDB (`zentry_tts_db`), perfiles adaptativos por edad (`toddler` vs `explorer`) y panel interactivo de pruebas en Configuración.
- **5. Parental Sync & Telemetría:**
  - Sincronización continua de telemetría, batería real y emparejamiento con el Dashboard de Padres en Firestore.
- **Estado de Build:** ✓ Compilación exitosa verificada (`npm run build` SingleFile `dist/index.html` ~1.31 MB, código 0).

---

## [2026-08-23] — Configuración Inicial de Arquitectura Multi-Agente
- **Estructura:** Configuración de 4 Git Worktrees (`ui-shell`, `microapps-ai`, `entertainment`, `parental-sync`) con puertos dedicados (5174 a 5178).
- **Habilidades Agénticas:** Creación de `pwa-operator-wt` (Walkthrough de operador) y `pwa-merger-auditor` (Mezclador stateless).
- **Build Status:** ✓ Compilación exitosa en Vite + React 19 SingleFile.