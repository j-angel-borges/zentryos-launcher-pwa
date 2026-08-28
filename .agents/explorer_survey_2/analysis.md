# Architectural Codebase Analysis: Canvas, Simulator & Real Missions

**Worktree**: `ui-shell` (`feat/ui-shell-age-tiering`)  
**Workspace Root**: `D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\ui-shell`  
**Date**: 2026-08-28  
**Investigator**: `explorer_survey_2`  
**Status**: Completed (Baseline Build: Exit Code 0, `dist/index.html` 1,390 kB)

---

## 1. Executive Summary & System Context

ZentryOS Launcher PWA is structured around a single-page React 19 architecture with Tailwind CSS v4 and Vite SingleFile bundling. The system employs age-based tiering (`toddler` for 2–5 years and `explorer` for 5–10+ years), circadian phase adaptations, offline-first Web Audio synthesizers, and Google Cloud Vertex AI (Gemini 2.5 Flash) multimodal pipelines.

This investigation provides an exhaustive architectural assessment of the three core creative and physical microapps:
1. **Lienzo Libre / Free Canvas (`ZentryFreeCanvasScreen.tsx`)**
2. **Simulador Multidimensional / Hero & World Simulator (`ZentrySimulatorScreen.tsx`)**
3. **Misiones Reales en Casa / Real-World Gamification (`ZentryRealMissionsScreen.tsx`)**

---

## 2. Shell Routing & Screen Integration

### 2.1 Navigation Call Chain
- **Type Declaration**: `src/types/zentry.ts` defines `ScreenId = ... | 'free_canvas' | 'simulator' | 'real_missions' | ...`
- **Shell Viewport**: `src/App.tsx` renders screens conditionally inside the animated viewport (`animate-app-open`):
  - Line 368: `<ZentryFreeCanvasScreen onBack={handleBack} isDark={currentWallpaper.isDark} />`
  - Line 372: `<ZentryRealMissionsScreen onBack={handleBack} isDark={currentWallpaper.isDark} />`
  - Line 407: `<ZentrySimulatorScreen onBack={handleBack} ageTier={ageTier} isDark={currentWallpaper.isDark} />`
- **Entry Points**:
  - `src/components/screens/ZentryCreationScreen.tsx`:
    - For `toddler`: Bubbles for `free_canvas` ("Lienzo", Pink/Red gradient), `real_missions` ("Misiones", Amber/Yellow gradient), `simulator` ("Simulador", Purple/Blue gradient).
    - For `explorer`: Bubbles for `image_generator`, `app_builder`, `simulator`, `redactor`, `neuro_art`.
  - `src/components/views/toddler/ToddlerHomeView.tsx`: Direct tap opens `creation` screen with voice prompt *"¡Vamos a crear!"*.

---

## 3. Module 1: Lienzo Libre (Drawing & Canvas Engine)

### 3.1 File Identification & Dependencies
- **Target File**: `src/components/screens/ZentryFreeCanvasScreen.tsx` (558 lines, 22.5 KB)
- **Services Used**:
  - `src/services/soundEffects.ts` (`sounds.playTap()`, `sounds.playSuccess()`)
  - `src/services/voiceSpeech.ts` (`voiceService.speakFeedback(...)`)
  - `src/services/aiService.ts` (`askZentryAi('free_canvas_life', ...)`)
  - `canvas-confetti` (for celebration effects)
  - `src/components/ui/ZentryLogoIcon.tsx` (Zentry diamond brand mark)

### 3.2 Current Implementation Details
1. **Canvas Lifecycle & DPI Scaling**:
   - `useEffect` monitors `currentBackground`. Sized via `getBoundingClientRect()` multiplied by `window.devicePixelRatio`.
   - Context settings: `ctx.lineCap = 'round'`, `ctx.lineJoin = 'round'`, background fill.
2. **Stroke Capture**:
   - `onPointerDown`: Sets pointer capture, draws initial circle (`ctx.arc`). If mode is `stamp`, renders emoji stamp centered at pointer.
   - `onPointerMove`: Linear segment stroke (`ctx.moveTo(last.x, last.y); ctx.lineTo(curr.x, curr.y); ctx.stroke();`).
   - If mode is `rainbow`: shifts `rainbowHueRef.current = (rainbowHueRef.current + 8) % 360` per event.
   - `onPointerUp`: Clears `isDrawingRef`, pushes `ctx.getImageData` into `history` (capped at 12 items).
3. **Toolbars & Controls**:
   - **Tools**: Normal Brush (`brush`), Rainbow Brush (`rainbow`), Stamp Menu (`stamp`), Eraser (`eraser`).
   - **Stamps**: 8 presets (Star ⭐, Heart ❤️, Flower 🌸, Sun ☀️, Rocket 🚀, Crown 👑, Dino 🦖, Rainbow 🌈).
   - **Colors**: 8 presets (`#EC4899`, `#8B5CF6`, `#3B82F6`, `#10B981`, `#F59E0B`, `#EF4444`, `#FFFFFF`, `#1E293B`).
   - **History**: Undo only (`handleUndo` pops `ImageData`). Clear (`handleClear`) clears canvas and pushes to history.
4. **Vertex AI Vision Pipeline**:
   - Converts canvas to Base64 PNG via `canvas.toDataURL('image/png')`.
   - Sends to `askZentryAi('free_canvas_life', prompt, base64Img)`.
   - System prompt in `aiService.ts` analyzes strokes (`strokesDescription`), composition (`compositionMapping`), generates English diffusion prompt (`enhancedPrompt`), category, and Spanish speech feedback (`speechFeedback`).
   - Synthesizes 3D Pixar rendering via `image.pollinations.ai` with seed randomization and image preloading.
   - Displays interactive modal with category badges, speech audio trigger, and confetti.

### 3.3 Identified Deficiencies & Required Upgrades
| Deficiency | Current State | Required Architecture / Upgrade |
| :--- | :--- | :--- |
| **Brush Size Selector** | State `brushSize = 20` hardcoded, no UI control | Add Brush Size Selector slider / preset pills (Fine: 8px, Medium: 18px, Thick: 32px, Jumbo: 48px) with live dynamic preview circle showing stroke diameter and selected color. |
| **Curve Smoothing** | Raw linear segments (`ctx.lineTo`) causing angular artifacts | Implement quadratic Bézier midpoint interpolation: `ctx.quadraticCurveTo(p1.x, p1.y, (p1.x + p2.x)/2, (p1.y + p2.y)/2)` for buttery-smooth 60fps curves. |
| **Star Particle Trails** | Only confetti on save | Dynamic star/sparkle particle emitter on pointer move that renders floating twinkling star particles along the brush path during active drawing. |
| **Redo History** | Only Undo supported; Redo missing | Implement dual-stack history: `undoStack: ImageData[]` and `redoStack: ImageData[]` with full Redo button in toolbar. |
| **Native Export / Save** | Only plays confetti and vibration | Implement genuine PNG export: generate data blob, trigger browser file download (`zentry-dibujo-<timestamp>.png`), and save thumbnail to `localStorage` gallery cache. |
| **Audio Feedback** | Tap sound on tool switch only | Add procedural synthesizer audio for stroke gliding and stamp placement in `soundEffects.ts`. |

---

## 4. Module 2: Simulador Multidimensional (Hero Studio & World Simulator)

### 4.1 File Identification & Dependencies
- **Target File**: `src/components/screens/ZentrySimulatorScreen.tsx` (858 lines, 40.3 KB)
- **Related Precursor**: `src/components/screens/ZentryCharacterScreen.tsx` (629 lines)
- **Services Used**:
  - `src/services/soundEffects.ts`
  - `src/services/voiceSpeech.ts`
  - `src/services/aiService.ts` (`character_hero_creator`, `character_world_generator`, `scene_simulator`)
  - WebRTC Camera (`navigator.mediaDevices.getUserMedia`)

### 4.2 Current Implementation Details
1. **Mode Architecture**:
   - `simulatorMode`: `'characters'` (Hero Customizer & Narrative) vs `'scenes'` (World Simulator).
2. **Character Customizer**:
   - 5 Skin Tones (Claro, Canela, Moreno, Galáctico, Mágico).
   - 5 Hair Styles (Picos ⚡, Rizos 🌀, Corto ✂️, Casco 🪖, Corona 👑).
   - 5 Powers (Rayos Mágicos, Fuego Solar, Hielo Cristal, Vuelo Estelar, Naturaleza).
   - 6 Suit Colors (`#6366F1`, `#EC4899`, `#10B981`, `#F59E0B`, `#EF4444`, `#8B5CF6`).
   - Live 2D preview box with emoji hair, face circle, and power badge.
3. **3-Phase Narrative Flow**:
   - **Step 0**: Avatar Customization -> Triggers `askZentryAi('character_hero_creator', ...)`.
   - **Step 1**: Main Hero 3D Pixar Image rendering (`pollinations.ai`).
   - **Step 2**: 3-Panel Comic strip with sequential illustrated panels, text captions, and TTS narration.
   - **Step 3**: Real-world play challenge & Room Camera Vision (`navigator.mediaDevices.getUserMedia`). Video frame captured onto canvas, sent to `character_world_generator` to transform physical furniture into obstacle course.
4. **Scenes Mode**:
   - Input textarea with 5 Preset Worlds (Galaxia Neón, Reino Marino, Bosque Mágico, Ciudad Flotante, Valle Jurásico).
   - AI generation via `scene_simulator` returning panoramic artwork, lore narrative, and clickable interactive points of interest (`interactiveElements`).

### 4.3 Identified Deficiencies & Required Upgrades
| Deficiency | Current State | Required Architecture / Upgrade |
| :--- | :--- | :--- |
| **Luminous Auras** | None (only power badge) | Add Aura Selector (Aura Celestial, Relámpago Neón, Fuego Solar, Cristal Cuántico, Polvo Cósmico, Escudo Plasma) with animated CSS glowing halos and pulsating energy ring layers. |
| **Hero Accessories** | None | Add Accessory Selector (Capa de Héroe, Gafas Holográficas, Escudo Guardián, Corona Cósmica, Varita Mágica, Cinturón de Poder). |
| **Atmosphere & Weather Controls** | Static background in preview | Add Environment Atmosphere Selector (Lluvia de Estrellas, Nieve Brillante, Luciérnagas Mágicas, Burbujas Marinas, Día/Noche Circadiano) with animated particle overlay. |
| **Avatar Visual Polish** | Basic 2D square | Layered 3D preview with dynamic spring motion, floating cape animation, and luminous energy aura glow. |
| **Prompt Enrichment** | Basic power prompt concatenation | Enriched prompt assembly incorporating selected aura, accessory, suit texture, and lighting atmosphere for ultra-high-fidelity 3D Pixar generation. |

---

## 5. Module 3: Misiones Reales en Casa (Physical Movement & Gamification)

### 5.1 File Identification & Dependencies
- **Target File**: `src/components/screens/ZentryRealMissionsScreen.tsx` (208 lines, 10.1 KB)
- **Services Used**:
  - `src/services/soundEffects.ts`
  - `src/services/voiceSpeech.ts`
  - `src/services/firebase.ts` (`saveCompletedMissionToFirestore`)

### 5.2 Current Implementation Details
1. **Roulette Mechanism**:
   - 12 static quests (`QUESTS`) arranged in circular CSS transform layout.
   - Spin animation uses random angle calculation with `cubic-bezier(0.15, 0.9, 0.2, 1)` over 2.4s.
   - On stop: sets `activeQuest`, triggers speech narration and confetti.
2. **Completion & Medals**:
   - `handleCompleteQuest`: Appends emoji to `medals` array, stores in `localStorage` (`zentry_real_medals`).
   - Calls `saveCompletedMissionToFirestore({ id, name, emoji, action })` which writes to Firestore collection `devices/{deviceId}/completed_missions`.

### 5.3 Identified Deficiencies & Required Upgrades
| Deficiency | Current State | Required Architecture / Upgrade |
| :--- | :--- | :--- |
| **Movement Countdown Timer** | None (instant completion button) | Implement Circular Countdown Movement Timer (15s, 30s, 45s, 60s presets) with animated SVG circular progress stroke, Play/Pause/Reset controls, and time-remaining readout. |
| **Procedural Audio Effects** | Only tap and success | Add procedural Web Audio API synthesizers for timer tick clicks (`playCountdownTick`), roulette peg clicks during spinning, and celebratory fanfare on completion. |
| **Mission Categorization** | 12 flat unorganized items | Group missions into 4 distinct developmental categories:<br>1. 🏃 **Psicomotricidad & Movimiento** (Ranita, Oso, Cangrejo, Avión)<br>2. 🔍 **Exploración & Color** (Buscar amarillos, Contar objetos)<br>3. 🏰 **Creatividad & Construcción** (Torre de cojines, Base secreta)<br>4. ❤️ **Conexión & Hábitos** (Abrazo familiar, Lavado de manos) with category filter pills. |
| **Gamification & Reward Feedback** | Simple emoji list | Add XP counter (+50 XP per mission), Level progression bar (Nivel Explorador), Streak counter (Días en racha), and celebratory medal unlock popup. |
| **Offline Resilience** | Firestore write might fail silently | Ensure local persistence and graceful queuing for offline play. |

---

## 6. Shared Infrastructure & Types Verification

### 6.1 `src/types/zentry.ts`
Currently declares basic types (`ScreenId`, `AgeTier`, `WallpaperId`, `CircadianPhase`, `DeviceFirestoreState`, `ChatMessage`, `VoiceCommandResult`, `WorkspaceAppInfo`).

**Recommended Type Extensions**:
```typescript
// Canvas
export type BrushMode = 'brush' | 'rainbow' | 'stamp' | 'eraser';
export type BrushThickness = 6 | 14 | 24 | 40;

// Simulator
export interface AuraOption {
  id: string;
  name: string;
  glowColor: string;
  cssClass: string;
  promptWord: string;
}

export interface AccessoryOption {
  id: string;
  name: string;
  icon: string;
  promptWord: string;
}

export interface AtmosphereOption {
  id: string;
  name: string;
  icon: string;
  effectType: 'stars' | 'snow' | 'fireflies' | 'bubbles' | 'clear';
}

// Real Missions
export type MissionCategory = 'movement' | 'exploration' | 'creativity' | 'habits';

export interface RealMission {
  id: string;
  category: MissionCategory;
  emoji: string;
  name: string;
  shortAction: string;
  action: string;
  speech: string;
  durationSeconds: number;
}
```

### 6.2 `src/services/soundEffects.ts`
Currently provides `playAppOpen`, `playTap`, `playInterventionShield`, and `playSuccess`.  
Can be extended with procedural audio synthesizers:
- `playCountdownTick(isUrgent?: boolean)`: Short sine click at 600Hz / 1200Hz.
- `playWheelClick()`: Rapid high-pass triangle click (900Hz, 15ms) for roulette spinning.
- `playBrushStroke()`: Soft filtered noise/sine whisper for drawing.
- `playFanfare()`: Multi-tone celebratory arpeggio for mission completion and level-up.

---

## 7. Synthesis & Architectural Road Map

### Implementation Phasing
1. **Phase 1: Lienzo Libre Evolution (`ZentryFreeCanvasScreen.tsx`)**
   - Integrate Bézier quadratic curve smoothing into pointer event handlers.
   - Implement dynamic star particle physics engine on drawing strokes.
   - Add Brush Size Selector with real-time preview bubble.
   - Add Redo stack alongside Undo stack.
   - Implement genuine PNG export and download.
2. **Phase 2: Simulator Super-Evolution (`ZentrySimulatorScreen.tsx`)**
   - Add Luminous Aura selector with pulsating animated CSS glows.
   - Add Hero Accessories selector and Atmosphere & Weather controls.
   - Enhance the live avatar preview with multi-layered 3D styling.
   - Refine the Gemini 2.5 Flash prompt construction for ultra-detailed 3D Pixar imagery and 3-panel comics.
3. **Phase 3: Real Missions Gamification (`ZentryRealMissionsScreen.tsx`)**
   - Integrate Circular SVG Countdown Movement Timer with play/pause/reset.
   - Add procedural audio effects (timer ticks, wheel clicks, celebration fanfare).
   - Categorize missions with tab/filter controls.
   - Add XP rewards, level progression, and streak tracking.
4. **Phase 4: Build & 60fps Verification**
   - Run `npm run build` to ensure 0 TypeScript errors and clean bundle output.
   - Verify smooth 60fps animation performance across all views.
