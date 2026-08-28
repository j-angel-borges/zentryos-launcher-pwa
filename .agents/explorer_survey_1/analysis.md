# Creative Microapps, Drawing Engines & Physical Movement Dynamics — Architectural Benchmark & Research Report

**Document Status:** Final Technical Benchmark & Engineering Specification  
**Worktree:** `feat/ui-shell-age-tiering` (`D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\ui-shell`)  
**Target Milestone:** ZentryOS MVP Launcher PWA (React 19 + Tailwind CSS v4 + Vite SingleFile)  
**Date:** 2026-08-27  

---

## Executive Summary

This research benchmark provides the mathematical models, procedural audio algorithms, graphics pipelines, and data architectures required to evolve the creative and movement microapps of ZentryOS:
1. **Lienzo (`ZentryFreeCanvasScreen.tsx`)**: High-performance drawing engine utilizing Catmull-Rom / Quadratic Bézier midpoint smoothing, synthetic pressure estimation, sub-pixel pointer prediction, dynamic brush indicator overlays, star particle physics, and Web Audio FM/oscillator synthesis.
2. **Hero & Scene Simulator (`ZentrySimulatorScreen.tsx`)**: Modular avatar builder featuring multi-layered SVG/Canvas accessories compositing, dynamic CSS/Canvas luminous energy auras, atmospheric particle engines (Magical Weather, Day/Night, Spatial Nebulae, Oceanic Bubbles), and a seamless 3-Phase Narrative Flow (3D Hero $\to$ 3-Panel Comic Strip $\to$ Multimodal Real-World Room Camera Mission).
3. **Misiones Reales (`ZentryRealMissionsScreen.tsx`)**: High-energy physical movement engine for children (Ages 2–10) featuring a precision SVG circular countdown timer with animated `stroke-dashoffset`, procedural multi-voice victory fanfare synthesis, multi-burst confetti particles, and robust Firestore persistence under `devices/{deviceId}/completed_missions`.

---

## Pillar 1: Drawing Microapps & Stroke Geometry Algorithms

### 1.1 Comparative Benchmark: tldraw, Kleki & Perfect Freehand

| Feature / Metric | **tldraw (`perfect-freehand`)** | **Kleki** | **Traditional HTML5 Canvas `lineTo`** | **ZentryOS Target Engine** |
| :--- | :--- | :--- | :--- | :--- |
| **Core Geometry Model** | Outline polygon around spline points | Layered raster bitmap with pressure stamps | Connected straight line segments | Hybrid: Midpoint Bézier for solid pens + Outline polygon for dynamic calligraphic/magic brushes |
| **Curve Smoothing** | Spline-based point expansion with streamline filter | Gaussian blur interpolation & jitter reduction | None (sharp polyline angles) | Midpoint Quadratic Bézier with Chaikin corner refinement & speed dampening |
| **Pressure Sensitivity** | PointerEvent pressure with fallback velocity heuristic | Hardware tablet pressure (Wacom/Apple Pencil) | Static line width | Hardware `e.pressure` with non-linear velocity-to-thickness curve simulation |
| **Simplification** | None during live draw (avoids visual pops) | Bounding box spatial partitioning | Optional Ramer-Douglas-Peucker post-stroke | No live RDP to prevent stroke jump; instant sub-pixel cache |
| **Rendering Cost** | Low–Medium ($O(N)$ polygon tessellation) | Medium ($O(N)$ bitmap blits) | Extremely Low ($O(N)$ single path) | High 60fps budget with offscreen canvas stamp caching |

---

### 1.2 Mathematical Foundations of Stroke Smoothing

#### A. Quadratic Bézier Midpoint Smoothing Technique
When drawing freehand in real-time, the next point $P_{i+1}$ is unknown until the hardware fires the pointer event. To guarantee $C^1$ continuity (continuous tangents without sharp corners), the midpoint $M_i$ between consecutive points is used as the curve endpoint, with the previous point $P_i$ acting as the control point.

For points $P_0, P_1, P_2, \dots, P_n$:
$$M_i = \left( \frac{x_i + x_{i+1}}{2}, \frac{y_i + y_{i+1}}{2} \right)$$
The quadratic Bézier segment $B_i(t)$ for $t \in [0, 1]$ is:
$$B_i(t) = (1 - t)^2 M_{i-1} + 2(1 - t)t P_i + t^2 M_i$$

```typescript
export function renderSmoothQuadraticStroke(
  ctx: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number; size: number; color: string }>
) {
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    ctx.lineWidth = points[i].size;
    ctx.strokeStyle = points[i].color;
    ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
  }

  // Draw last segment to final point
  const last = points[points.length - 1];
  const secondLast = points[points.length - 2];
  ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y);
  ctx.stroke();
}
```

#### B. Chaikin's Corner-Cutting Algorithm (Post-Process or Refinement)
For smoothing closed shapes or completed paths, Chaikin's algorithm recursively replaces each segment with two new vertices at $1/4$ and $3/4$ along the line:
$$Q_i = \frac{3}{4} P_i + \frac{1}{4} P_{i+1}$$
$$R_i = \frac{1}{4} P_i + \frac{3}{4} P_{i+1}$$

#### C. Catmull-Rom Spline Interpolation
If every sampled point must be strictly intersected (such as keyframe guides or connect-the-dots games):
$$P(t) = 0.5 \cdot \begin{bmatrix} 1 & t & t^2 & t^3 \end{bmatrix} \begin{bmatrix} 0 & 2 & 0 & 0 \\ -1 & 0 & 1 & 0 \\ 2 & -5 & 4 & -1 \\ -1 & 3 & -3 & 1 \end{bmatrix} \begin{bmatrix} P_{i-1} \\ P_i \\ P_{i+1} \\ P_{i+2} \end{bmatrix}$$

---

### 1.3 Synthetic Pressure & Dynamic Thickness Simulation

On devices without active pressure hardware (mice or basic capacitive touchscreens), stroke thickness is simulated via inverse pointer velocity $v$:
$$v = \frac{\sqrt{(x_t - x_{t-1})^2 + (y_t - y_{t-1})^2}}{\Delta t + \epsilon}$$

To model real ink dynamics (slow movements deposit more ink and produce thicker lines, while fast strokes taper):
$$\text{pressure}_{\text{synth}} = 1.0 - \text{clamp}\left(\frac{v - v_{\min}}{v_{\max} - v_{\min}}, 0.0, 1.0\right)$$
$$\text{effectiveWidth} = \text{baseWidth} \cdot \left( \text{minScale} + (1.0 - \text{minScale}) \cdot \left( \text{hardwarePressure} || \text{pressure}_{\text{synth}} \right)^k \right)$$
where $k \approx 0.75$ provides a natural response curve.

---

### 1.4 Live Brush Indicator / Dynamic Circular Cursor

A key UI feature in modern creative apps (Procreate, Photoshop, tldraw) is the live cursor indicator showing the exact brush radius, color, and active tool boundary.

```tsx
export const LiveBrushCursor: React.FC<{
  position: { x: number; y: number } | null;
  size: number;
  color: string;
  toolMode: 'brush' | 'rainbow' | 'stamp' | 'eraser' | 'magic_stars';
  stampEmoji?: string;
}> = ({ position, size, color, toolMode, stampEmoji }) => {
  if (!position) return null;

  return (
    <div
      className="pointer-events-none fixed z-50 transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${Math.max(size, 24)}px`,
        height: `${Math.max(size, 24)}px`
      }}
    >
      {toolMode === 'stamp' ? (
        <div className="w-full h-full flex items-center justify-center text-2xl animate-bounce">
          {stampEmoji}
        </div>
      ) : toolMode === 'eraser' ? (
        <div className="w-full h-full rounded-full border-2 border-dashed border-white/80 bg-red-500/20 shadow-lg" />
      ) : (
        <div
          className="w-full h-full rounded-full border-2 border-white/90 shadow-md backdrop-blur-[1px]"
          style={{
            backgroundColor: `${color}33`,
            boxShadow: `0 0 10px ${color}88, inset 0 0 6px ${color}`
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}
    </div>
  );
};
```

---

## Pillar 2: Tux Paint & Magical Brushes (Particles, Procedural Audio & Haptics)

### 2.1 2D Particle Engine for Magic Star & Rainbow Trails

When the user moves the pointer with the "Magic Stars" or "Stardust Wand" tool, a high-performance particle emitter spawns 2D star sprites with velocity vectors, gravity, drag, angular rotation, and color shifting.

```typescript
export interface StarParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxSize: number;
  rotation: number;
  vRot: number;
  hue: number;
  alpha: number;
  decayRate: number;
  life: number;
  maxLife: number;
}

export class StarParticleSystem {
  private particles: StarParticle[] = [];
  private pool: StarParticle[] = [];

  public emit(x: number, y: number, baseHue: number, count: number = 3) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2.5;
      const p = this.pool.pop() || ({} as StarParticle);

      p.x = x + (Math.random() - 0.5) * 8;
      p.y = y + (Math.random() - 0.5) * 8;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 0.4; // slight upward buoyancy
      p.size = 8 + Math.random() * 14;
      p.maxSize = p.size;
      p.rotation = Math.random() * Math.PI * 2;
      p.vRot = (Math.random() - 0.5) * 0.15;
      p.hue = (baseHue + Math.random() * 40 - 20) % 360;
      p.alpha = 1.0;
      p.life = 0;
      p.maxLife = 30 + Math.random() * 20; // 30-50 frames life
      p.decayRate = 1.0 / p.maxLife;

      this.particles.push(p);
    }
  }

  public updateAndRender(ctx: CanvasRenderingContext2D) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96; // drag
      p.vy *= 0.96;
      p.rotation += p.vRot;
      p.life++;
      p.alpha = Math.max(0, 1.0 - p.life * p.decayRate);

      if (p.alpha <= 0 || p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        this.pool.push(p);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = `hsl(${p.hue}, 100%, 65%)`;
      ctx.shadowColor = `hsl(${p.hue}, 100%, 50%)`;
      ctx.shadowBlur = 8;

      // Draw 5-pointed star
      this.drawStar(ctx, 0, 0, 5, p.size, p.size * 0.45);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerR: number, innerR: number) {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
  }
}
```

---

### 2.2 Procedural Sound Synthesis (Web Audio API)

Zero external audio files are required. All sound effects are synthesized dynamically via Web Audio API oscillators, biquad filters, and gain envelopes:

```typescript
export class ProceduralAudioEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // 1. Magic Star Shimmer (Pentatonic chime arpeggio)
  public playMagicChime(baseFreq: number = 880) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [1, 1.25, 1.5, 1.875, 2.0]; // Major pentatonic intervals
    const freq = baseFreq * notes[Math.floor(Math.random() * notes.length)];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.15);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  // 2. Stamp Pop / Bubble Placement
  public playStampPop() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // 3. Eraser Sweep Whoosh
  public playEraserWhoosh() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // 4. Multi-Voice Victory Fanfare (Brass triad fanfare)
  public playVictoryFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Sequence: C4 (0.0s), E4 (0.12s), G4 (0.24s), C5 Chord (0.38s)
    const notes = [
      { f: 261.63, t: 0.0, d: 0.1 },
      { f: 329.63, t: 0.12, d: 0.1 },
      { f: 392.00, t: 0.24, d: 0.12 },
      { f: 523.25, t: 0.38, d: 0.55 }, // High C
      { f: 659.25, t: 0.38, d: 0.55 }, // High E
      { f: 783.99, t: 0.38, d: 0.55 }  // High G
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      // Lowpass filter for warm brass sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now + note.t);

      gain.gain.setValueAtTime(0.08, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.t + note.d);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.t);
      osc.stop(now + note.t + note.d);
    });
  }
}
```

---

### 2.3 Haptic Feedback API Matrix

```typescript
export const HapticFeedback = {
  lightTick: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(6); } catch {}
    }
  },
  stampPlaced: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([12, 20, 8]); } catch {}
    }
  },
  magicBrushPulse: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(8); } catch {}
    }
  },
  questCompleteFanfare: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([30, 40, 50, 40, 70]); } catch {}
    }
  }
};
```

---

## Pillar 3: Avatar & Hero Builders (Luminous Auras, Accessories & Particle Atmospheres)

### 3.1 Luminous Energy Auras & Shaders

To convey power tiers in the hero customizer (`ZentrySimulatorScreen.tsx`), four distinct aura archetypes are defined using high-performance CSS filter stacks and Canvas radial glows:

```css
/* 1. Neon Lightning Sparks Aura */
.aura-lightning {
  box-shadow: 0 0 25px #fbbf24, 0 0 50px rgba(251, 191, 36, 0.5), inset 0 0 15px #fef08a;
  animation: pulseLightning 1.2s infinite alternate ease-in-out;
}

/* 2. Solar Flame Aura */
.aura-solar {
  box-shadow: 0 0 30px #f87171, 0 0 60px rgba(248, 113, 113, 0.6), inset 0 0 20px #fca5a5;
  animation: pulseFlame 1.8s infinite alternate ease-in-out;
}

/* 3. Cosmic Frost Crystal Aura */
.aura-frost {
  box-shadow: 0 0 25px #38bdf8, 0 0 55px rgba(56, 189, 248, 0.5), inset 0 0 18px #bae6fd;
  animation: pulseFrost 2.2s infinite alternate ease-in-out;
}

/* 4. Galactic Star Nebula Aura */
.aura-nebula {
  box-shadow: 0 0 35px #c084fc, 0 0 70px rgba(192, 132, 252, 0.6), inset 0 0 22px #e9d5ff;
  animation: pulseNebula 2.5s infinite alternate ease-in-out;
}

@keyframes pulseLightning {
  0% { transform: scale(1.0); filter: drop-shadow(0 0 12px #fbbf24); }
  100% { transform: scale(1.04); filter: drop-shadow(0 0 28px #f59e0b); }
}
```

---

### 3.2 Hero Accessories Layering System

To ensure all visual assets composite cleanly without overlapping clipping errors, the rendering stack operates in a strict 8-layer ordering pipeline:

```
+-------------------------------------------------------------+
| Layer 7: Foreground Sparks & Cosmic Stardust Flakes        |  <- z-index: 40
+-------------------------------------------------------------+
| Layer 6: Handheld Gear (Magic Wand / Star Shield / Blaster) |  <- z-index: 35
+-------------------------------------------------------------+
| Layer 5: Headgear & Hair (Crown / Spiky Hair / Helmet)      |  <- z-index: 30
+-------------------------------------------------------------+
| Layer 4: Face Accessories (Hero Mask / Visor / Glasses)     |  <- z-index: 25
+-------------------------------------------------------------+
| Layer 3: Chest Badges & Energy Core (Star Crest / Belt)    |  <- z-index: 20
+-------------------------------------------------------------+
| Layer 2: Hero Base Avatar (Skin Tone & Hero Suit Body)      |  <- z-index: 15
+-------------------------------------------------------------+
| Layer 1: Back Items (Cosmic Wings / Hero Cape / Jetpack)   |  <- z-index: 10
+-------------------------------------------------------------+
| Layer 0: Background Aura & World Atmosphere Particles       |  <- z-index: 5
+-------------------------------------------------------------+
```

```typescript
export interface HeroCustomizationConfig {
  skinToneId: string;      // 'light' | 'tan' | 'dark' | 'star' | 'aqua'
  hairStyleId: string;     // 'spiky' | 'curly' | 'short' | 'helmet' | 'crown'
  powerAuraId: string;     // 'lightning' | 'solar' | 'frost' | 'nebula' | 'nature'
  suitColor: string;       // Hex color code
  accessoryId: string;     // 'shield' | 'wand' | 'wings' | 'cape' | 'glasses'
  environmentId: string;   // 'space' | 'ocean' | 'forest' | 'future' | 'dino'
}
```

---

### 3.3 Atmospheric Particle Systems

The Simulator includes 4 interactive environmental backgrounds rendered via HTML5 Canvas:

1. **Magical Weather (Falling Stars & Rainbow Dust)**:
   - Dynamic sinusoidal drift: $x(t) = x_0 + 18 \cdot \sin(1.8t + \phi)$
   - Alpha twinkle: $\alpha(t) = 0.4 + 0.6 \cdot |\sin(3.5t + \phi)|$
2. **Day / Night Cycle & Celestial Glow**:
   - Time-interpolated linear gradient background (Sun gold `#fde047` $\leftrightarrow$ Twilight violet `#312e81` $\leftrightarrow$ Midnight navy `#0f172a`).
3. **Spatial Nebulae**:
   - Multi-centered radial gradient blobs blended with `globalCompositeOperation = 'screen'`.
4. **Oceanic Bubbles**:
   - Buoyancy acceleration: $v_y = - (0.8 + 0.4 \cdot \text{size})$; wobble: $x(t) = x_0 + 6 \cdot \cos(2.2t)$; pops upon pointer click.

---

## Pillar 4: 3-Phase Narrative Flow Architecture

```
+-----------------------------------------------------------------------------------+
|                           3-PHASE NARRATIVE FLOW                                 |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ PHASE 1: 3D HERO GENESIS ]                                                     |
|  • Customizer inputs compiled into prompt                                         |
|  • Vertex AI / Gemini 2.5 Flash synthesis -> 3D Pixar Masterpiece Character      |
|                                                                                   |
|                                    │                                              |
|                                    ▼                                              |
|                                                                                   |
|  [ PHASE 2: 3-PANEL COMIC NARRATIVE ]                                             |
|  • Panel 1 (Setup): Introduction in the magical world                             |
|  • Panel 2 (Climax): A fun challenge / friend needing rescue                      |
|  • Panel 3 (Resolution): Triumphant celebration & fanfare                         |
|                                                                                   |
|                                    │                                              |
|                                    ▼                                              |
|                                                                                   |
|  [ PHASE 3: REAL-WORLD CAMERA AI MISSION ]                                        |
|  • Device camera captures physical room                                           |
|  • Gemini 2.5 Vision identifies room objects (pillows, floor, colors)             |
|  • Bridges digital superhero story into an active physical play mission           |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

### 4.1 Strict JSON Prompt Contract for Narrative Engine

```json
{
  "heroName": "Capitán Chispa Estelar",
  "heroPrompt": "3D cute toddler superhero character, wearing colorful cape, glowing power effects, cinematic lighting, cute cheerful expression, 8k resolution",
  "comicPanels": [
    {
      "caption": "¡Un día tranquilo en la ciudad mágica!",
      "prompt": "3D cute superhero toddler standing atop a fluffy cloud looking at a magical colorful city"
    },
    {
      "caption": "¡Un gatito espacial necesita ayuda en el árbol de caramelos!",
      "prompt": "3D cute superhero toddler using glowing powers to rescue a baby space kitten from a candy tree"
    },
    {
      "caption": "¡Misión cumplida con una gran sonrisa y fiesta de estrellas!",
      "prompt": "3D cute superhero toddler celebrating with floating stars and confetti, happy smiling"
    }
  ],
  "realWorldPlayPrompt": "¡Ponte una toalla como capa de superhéroe, da 3 saltos altos y rescata a tu juguete favorito!"
}
```

---

## Pillar 5: Physical Movement, Real Missions & Firestore Data Models

### 5.1 Circular SVG Countdown Timer with Precision Dashoffset

The circular timer uses vector circumference math to render a smooth, non-pixelated depletion ring at 60fps.

#### Geometric Formulation
Given a circle with radius $r = 52$ in a $120 \times 120$ SVG viewBox:
$$C = 2 \pi r = 2 \times 3.14159265 \times 52 \approx 326.7256$$
$$\text{progress} = \frac{t_{\text{remaining}}}{t_{\text{total}}}$$
$$\text{strokeDashoffset} = C \cdot (1 - \text{progress})$$

```tsx
export const CircularCountdownTimer: React.FC<{
  totalSeconds: number;
  secondsLeft: number;
  isRunning: boolean;
}> = ({ totalSeconds, secondsLeft, isRunning }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = secondsLeft / totalSeconds;
  const strokeDashoffset = circumference * (1 - progress);

  // Dynamic color transition based on remaining percentage
  const getColor = () => {
    if (progress > 0.5) return '#10B981'; // Green / Emerald
    if (progress > 0.2) return '#F59E0B'; // Amber
    return '#EF4444';                     // Red / Coral (final countdown)
  };

  return (
    <div className="relative w-32 h-32 flex items-center justify-center select-none">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        {/* Background Track */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="10"
        />
        {/* Animated Fill Ring */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300 ease-linear"
        />
      </svg>
      {/* Central Time Counter */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-black text-white ${secondsLeft <= 3 && isRunning ? 'animate-ping' : ''}`}>
          {secondsLeft}
        </span>
        <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">segundos</span>
      </div>
    </div>
  );
};
```

---

### 5.2 High-Energy Movement Challenges for Kids (Ages 2–10)

| Challenge ID | Name | Emoji | Target Duration | Motor Skill / Objective | Audio Cue & Action |
| :---: | :---: | :---: | :---: | :---: | :---: |
| `quest_frog` | Salto de Ranita | 🐸 | 15s | Squats & Lower Body Explosiveness | "¡Agáchate y da 5 saltos de ranita diciendo croac croac!" |
| `quest_flamingo` | Equilibrio Flamenco | 🦩 | 10s | Proprioception & Single-leg Balance | "¡Párate en 1 solo pie con los brazos abiertos como alas!" |
| `quest_bear` | Pasos de Oso | 🐻 | 20s | Bilateral Quadrupedal Locomotion | "¡Camina en 4 patas por la sala como un oso fuerte!" |
| `quest_plane` | Vuelo Supersónico | ✈️ | 15s | Vestibular & Spatial Orientation | "¡Abre los brazos y corre en círculos esquivando nubes!" |
| `quest_lion` | Rugido de León | 🦁 | 10s | Thoracic Expansion & Diaphragmatic Breath | "¡Abre la boca grande y da 3 rugidos valientes de león!" |
| `quest_color_hunt` | Cacería Amarilla | 🟡 | 25s | Visual Search & Indoor Navigation | "¡Busca rápido 2 objetos amarillos y tócalos con tu dedito!" |
| `quest_pillow_tower`| Torre de Cojines | 🛋️ | 30s | Fine & Gross Motor Planning | "¡Construye una montaña con 3 almohadas o cojines!" |
| `quest_crab` | Pasos de Cangrejo | 🦀 | 20s | Lateral Coordination | "¡Agáchate y camina de lado como un cangrejo en la playa!" |
| `quest_star_reach` | Estiramiento Estelar| ⭐ | 15s | Spine & Postural Elongation | "¡Ponte de puntitas y estira tus brazos al techo como tocando estrellas!" |
| `quest_dino` | Pisadas de T-Rex | 🦖 | 15s | Rhythm & High Impact Stomps | "¡Da 5 pasos pesados haciendo temblar el suelo como dinosaurio!" |

---

### 5.3 Firestore Persistence Architecture

To enable parental supervision, cross-device sync, and daily achievement medals, completed missions are persisted to Google Cloud Firestore under a hierarchical structure.

```
/devices/{deviceId}
    ├── batteryLevel: number
    ├── isCharging: boolean
    ├── networkStatus: 'online' | 'offline'
    ├── lastSeenAt: Timestamp
    └── /completed_missions/{missionDocId}
            ├── questId: string           // e.g. "quest_frog"
            ├── name: string              // "Ranita"
            ├── emoji: string             // "🐸"
            ├── action: string            // "Da 4 saltos de ranita"
            ├── durationSeconds: number   // 15
            ├── category: string          // "gross_motor" | "balance" | "sensory"
            ├── completedAt: Timestamp    // serverTimestamp()
            └── deviceId: string          // "dev_redmi9_mateo"
```

#### Firestore TypeScript Interface & Data Access Object (DAO)
```typescript
export interface CompletedMissionRecord {
  questId: string;
  name: string;
  emoji: string;
  action: string;
  durationSeconds: number;
  category: 'gross_motor' | 'balance' | 'sensory' | 'creative';
  completedAt: any; // Firestore FieldValue / Timestamp
  deviceId: string;
}

export async function recordCompletedMission(record: Omit<CompletedMissionRecord, 'completedAt'>): Promise<void> {
  const deviceId = record.deviceId || getStoredDeviceId();
  const missionsCol = collection(db, 'devices', deviceId, 'completed_missions');
  await addDoc(missionsCol, {
    ...record,
    deviceId,
    completedAt: serverTimestamp()
  });
}
```

---

## Actionable Integration Roadmap for Implementation Agents

| Component | Priority | Target File | Key Implementations |
| :--- | :---: | :--- | :--- |
| **Lienzo Pro Engine** | P0 | `src/components/screens/ZentryFreeCanvasScreen.tsx` | - Add brush thickness slider with live circular indicator.<br>- Implement quadratic Bézier midpoint smoothing.<br>- Integrate `StarParticleSystem` for magic sparkles.<br>- Add Web Audio synthesized taps & chimes. |
| **Hero Simulator 3-Phase** | P0 | `src/components/screens/ZentrySimulatorScreen.tsx` | - Add 4 luminous energy auras with pulsing glow CSS.<br>- Layer hero accessories (wands, shields, wings, crowns).<br>- Add atmospheric particle backgrounds (oceanic bubbles, space nebulae).<br>- Connect 3-phase narrative generator pipeline. |
| **Real Missions Gamification** | P0 | `src/components/screens/ZentryRealMissionsScreen.tsx` | - Integrate `CircularCountdownTimer` with animated dashoffset.<br>- Add Web Audio victory fanfare synthesizer.<br>- Persist full metadata to Firestore `completed_missions`. |
| **Audio Engine Extensions** | P1 | `src/services/soundEffects.ts` | - Add `playMagicChime()`, `playStampPop()`, `playEraserWhoosh()`, and `playVictoryFanfare()`. |
