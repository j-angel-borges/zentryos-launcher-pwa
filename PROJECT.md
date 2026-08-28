# Project: ZentryOS Creative & Interactive Microapps Expansion

## Architecture
The ZentryOS Launcher PWA UI Shell is built on React 19, Tailwind CSS v4, TypeScript, and Vite (with single-file inlining). The creative microapps subsystem spans 3 main screens and supporting services:

```
src/
├── App.tsx                              # Navigation & screen routing (ScreenId)
├── types/
│   └── zentry.ts                        # ScreenId, HeroCustomization, Mission types
├── services/
│   ├── soundEffects.ts                  # Web Audio API procedural audio synthesizers
│   ├── firebase.ts                      # Firestore sync & device state listeners
│   └── zentryAi.ts                      # Gemini 2.5 Flash / Vertex AI vision pipeline
└── components/
    ├── FisheyeBubbleGrid.tsx            # Creative suite bubble launcher
    └── screens/
        ├── ZentryFreeCanvasScreen.tsx   # Bézier Lienzo with live cursor & star trails
        ├── ZentrySimulatorScreen.tsx    # Hero simulator with auras, weather & 3-phase story
        └── ZentryRealMissionsScreen.tsx # Gamified physical missions with circular SVG timer
```

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Web Audio Procedural Synthesizers | Pure Web Audio API synthesizers for brush friction, sparkles, star bursts, timer ticks, and victory fanfare | M1 | Survey (Explorer 1 & 3) |
| 2 | Bézier Curve Smoothing | Midpoint quadratic Bézier interpolation ($M_i = (P_i + P_{i+1})/2$) for buttery smooth drawing | M2 | Survey (Explorer 1 & 2) |
| 3 | Dynamic Brush Size & Live Preview | Thickness selector with real-time circular preview indicator tracking pointer | M2 | Survey (Explorer 1 & 2) |
| 4 | Star & Sparkle Particle Emitter | 2D Canvas object-pooled magical star trails and burst effects during drawing | M2 | Survey (Explorer 1 & 3) |
| 5 | Dual-Stack Canvas History & Export | Undo / Redo history stacks, clear canvas, and clean PNG image download export | M2 | Survey (Explorer 2) |
| 6 | Gemini 2.5 Flash AI Vision in Canvas | Multimodal vision prompt analyzing drawings and generating animated magical representations | M2 | Survey (Explorer 1 & 2) |
| 7 | Luminous Energy Auras | 4 dynamic aura selector options (Cosmic, Neon, Fire, Flora) with pulsing glow shaders | M3 | Survey (Explorer 1 & 2) |
| 8 | Multi-tier Hero Accessories | Layered accessories (Capes, Shields, Magic Wands, Cosmic Wings, Helmets/Crowns) | M3 | Survey (Explorer 1 & 2) |
| 9 | Atmospheric Weather & Particles | Environmental particle systems (Magical weather, Day/Night celestial mode, Nebula dust, Oceanic bubbles) | M3 | Survey (Explorer 1 & 3) |
| 10 | 3-Phase Hero Narrative Flow | 3D Hero Render $\to$ 3-Panel Comic Strip $\to$ Real-world Camera AI Physical Mission | M3 | Survey (Explorer 1 & 2) |
| 11 | Circular SVG Countdown Movement Timer | High-precision circular movement timer with animated `stroke-dashoffset` ($C = 2\pi r$) | M4 | Survey (Explorer 1 & 2) |
| 12 | Developmental Movement Quests | 12 interactive physical movement challenges for children with action guidelines | M4 | Survey (Explorer 1 & 2) |
| 13 | Procedural Tick & Fanfare Audio | Synced Web Audio ticks during active countdown and polyphonic brass fanfare on victory | M4 | Survey (Explorer 1 & 3) |
| 14 | Firestore Offline & Realtime Sync | Synchronous local persistence paired with Firestore `devices/{deviceId}/completed_missions` | M4 | Survey (Explorer 2 & 3) |
| 15 | E2E Testing, Adversarial Verification & Build | Full verification across all 4 tiers, clean `npm run build` (Code 0), and 60fps rendering audit | M5 | Survey (Explorer 1, 2 & 3) |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Audio Engine & Synthesizers | `src/services/soundEffects.ts` with procedural sound methods | none | DONE |
| M2 | Advanced Lienzo Canvas Evolution | `src/components/screens/ZentryFreeCanvasScreen.tsx` with Bézier curves, brush preview, star particles, undo/redo, PNG export | M1 | DONE |
| M3 | Enhanced Multidimensional Simulator | `src/components/screens/ZentrySimulatorScreen.tsx` with auras, accessories, weather/particles, and 3-phase narrative | M1 | DONE |
| M4 | Gamification & Dynamic Real Missions | `src/components/screens/ZentryRealMissionsScreen.tsx` with circular timer, movement quests, fanfare, and Firestore sync | M1 | DONE |
| M5 | Dual Track E2E Testing & Verification | E2E testing suite, adversarial stress tests, and `npm run build` verification | M1, M2, M3, M4 | DONE |

---

## Interface Contracts

### `src/services/soundEffects.ts`
```typescript
export interface SoundEffectsService {
  playAppOpen(): void;
  playTap(): void;
  playSuccess(): void;
  playInterventionShield(): void;
  playBrushStroke(speed?: number): void;
  playSparkle(pitchShift?: number): void;
  playStarBurst(): void;
  playTimerTick(isUrgent?: boolean): void;
  playVictoryFanfare(): void;
  vibrate(pattern?: number | number[]): void;
  resumeAudioContext(): Promise<void>;
}
```

### `src/components/screens/ZentryFreeCanvasScreen.tsx`
```typescript
export interface ZentryFreeCanvasScreenProps {
  onBack: () => void;
  isDark?: boolean;
}
```

### `src/components/screens/ZentrySimulatorScreen.tsx`
```typescript
export interface ZentrySimulatorScreenProps {
  onBack: () => void;
  ageTier?: 'toddler' | 'kid' | 'preteen' | 'teen';
  isDark?: boolean;
}
```

### `src/components/screens/ZentryRealMissionsScreen.tsx`
```typescript
export interface ZentryRealMissionsScreenProps {
  onBack: () => void;
  isDark?: boolean;
}
```
