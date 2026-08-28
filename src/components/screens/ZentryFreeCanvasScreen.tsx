import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Undo2,
  Redo2,
  Trash2,
  Volume2,
  Sparkles,
  Eraser,
  Download,
  X,
  RefreshCw,
  Sliders,
  Paintbrush,
  Wand2,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';
import { askZentryAi } from '../../services/aiService';
import { ZentryLogoIcon } from '../ui/ZentryLogoIcon';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

// ==========================================
// CONFIGURACIÓN DE SELLOS, FONDOS Y TAMAÑOS
// ==========================================

const SHAPES_AND_EMOJIS = [
  { id: 'star', icon: '⭐', label: 'Estrella' },
  { id: 'heart', icon: '❤️', label: 'Corazón' },
  { id: 'flower', icon: '🌸', label: 'Flor' },
  { id: 'sun', icon: '☀️', label: 'Sol' },
  { id: 'rocket', icon: '🚀', label: 'Cohete' },
  { id: 'crown', icon: '👑', label: 'Corona' },
  { id: 'dino', icon: '🦖', label: 'Dinosaurio' },
  { id: 'rainbow', icon: '🌈', label: 'Arcoíris' },
  { id: 'sparkles', icon: '✨', label: 'Destellos' },
  { id: 'unicorn', icon: '🦄', label: 'Unicornio' },
  { id: 'planet', icon: '🪐', label: 'Planeta' },
  { id: 'butterfly', icon: '🦋', label: 'Mariposa' }
];

const BACKGROUNDS = [
  { id: 'white', bg: '#FFFFFF', label: 'Blanco', textColor: '#1E293B' },
  { id: 'night', bg: '#0F172A', label: 'Noche Estelar', textColor: '#F8FAFC' },
  { id: 'cosmic', bg: '#1E1B4B', label: 'Cosmos Violeta', textColor: '#F8FAFC' },
  { id: 'jungle', bg: '#064E3B', label: 'Selva Esmeralda', textColor: '#F8FAFC' },
  { id: 'sky', bg: '#0284C7', label: 'Cielo Azul', textColor: '#F8FAFC' },
  { id: 'candy', bg: '#831843', label: 'Dulce Fucsia', textColor: '#F8FAFC' }
];

const BRUSH_PRESETS = [
  { label: 'Fino', size: 6, icon: '✏️' },
  { label: 'Normal', size: 14, icon: '🖌️' },
  { label: 'Grueso', size: 26, icon: '🖍️' },
  { label: 'Cósmico', size: 48, icon: '🌌' }
];

const COLOR_PALETTE = [
  '#EC4899', // Rosa
  '#A855F7', // Violeta
  '#6366F1', // Indigo
  '#3B82F6', // Azul
  '#06B6D4', // Cyan
  '#10B981', // Verde
  '#EAB308', // Amarillo
  '#F97316', // Naranja
  '#EF4444', // Rojo
  '#FFFFFF', // Blanco
  '#1E293B'  // Carbón
];

type ToolMode = 'brush' | 'rainbow' | 'magic_stars' | 'stamp' | 'eraser';

interface AiLifeResult {
  title: string;
  category: string;
  strokesDescription?: string;
  detectedSubject: string;
  compositionMapping?: string;
  enhancedImageUrl: string;
  speechFeedback: string;
}

// ==========================================
// SISTEMA DE PARTÍCULAS (OBJECT-POOLED 2D)
// ==========================================

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  hue: number;
  alpha: number;
  decayRate: number;
  life: number;
  maxLife: number;
  shape: 'star' | 'sparkle' | 'circle';
}

class CanvasParticleSystem {
  private particles: Particle[] = [];
  private pool: Particle[] = [];

  public emit(
    x: number,
    y: number,
    baseHue: number,
    count: number = 3,
    shape: 'star' | 'sparkle' | 'circle' = 'star',
    speedMultiplier: number = 1.0
  ) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.6 + Math.random() * 2.8) * speedMultiplier;
      const p: Particle = this.pool.pop() || {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 0,
        rotation: 0,
        vRot: 0,
        hue: 0,
        alpha: 1,
        decayRate: 0.03,
        life: 0,
        maxLife: 40,
        shape: 'star'
      };

      p.x = x + (Math.random() - 0.5) * 12;
      p.y = y + (Math.random() - 0.5) * 12;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 0.5; // Ligera flotabilidad
      p.size = 8 + Math.random() * 12;
      p.rotation = Math.random() * Math.PI * 2;
      p.vRot = (Math.random() - 0.5) * 0.2;
      p.hue = (baseHue + Math.random() * 40 - 20 + 360) % 360;
      p.alpha = 1.0;
      p.life = 0;
      p.maxLife = 25 + Math.random() * 25;
      p.decayRate = 1.0 / p.maxLife;
      p.shape = shape;

      this.particles.push(p);
    }
  }

  public emitBurst(x: number, y: number, baseHue: number, count: number = 24) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 2.0 + Math.random() * 4.5;
      const p: Particle = this.pool.pop() || {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 0,
        rotation: 0,
        vRot: 0,
        hue: 0,
        alpha: 1,
        decayRate: 0.02,
        life: 0,
        maxLife: 50,
        shape: 'star'
      };

      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.size = 10 + Math.random() * 14;
      p.rotation = Math.random() * Math.PI * 2;
      p.vRot = (Math.random() - 0.5) * 0.3;
      p.hue = (baseHue + (i * 360) / count) % 360;
      p.alpha = 1.0;
      p.life = 0;
      p.maxLife = 35 + Math.random() * 25;
      p.decayRate = 1.0 / p.maxLife;
      p.shape = Math.random() > 0.4 ? 'star' : 'sparkle';

      this.particles.push(p);
    }
  }

  public emitClearDissolve(width: number, height: number) {
    const total = 50;
    for (let i = 0; i < total; i++) {
      const px = Math.random() * width;
      const py = Math.random() * height;
      this.emit(px, py, Math.random() * 360, 2, 'sparkle', 1.5);
    }
  }

  public updateAndRender(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.clearRect(0, 0, width, height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95; // Fricción
      p.vy *= 0.95;
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
      ctx.shadowColor = `hsl(${p.hue}, 100%, 55%)`;
      ctx.shadowBlur = 10;

      if (p.shape === 'star') {
        this.drawStar(ctx, 0, 0, 5, p.size, p.size * 0.45);
      } else if (p.shape === 'sparkle') {
        this.drawSparkle(ctx, 0, 0, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerR: number,
    innerR: number
  ) {
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
    ctx.fill();
  }

  private drawSparkle(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.quadraticCurveTo(cx, cy, cx + size, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy + size);
    ctx.quadraticCurveTo(cx, cy, cx - size, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy - size);
    ctx.closePath();
    ctx.fill();
  }
}

// ==========================================
// COMPONENTE PRINCIPAL ZENTRY FREE CANVAS
// ==========================================

export const ZentryFreeCanvasScreen: React.FC<Props> = ({ onBack, isDark = false }) => {
  // Canvas refs
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Particle Engine
  const particleSystemRef = useRef<CanvasParticleSystem>(new CanvasParticleSystem());
  const animFrameIdRef = useRef<number | null>(null);

  // States
  const [selectedColor, setSelectedColor] = useState('#EC4899');
  const [currentBackground, setCurrentBackground] = useState(BACKGROUNDS[0]);
  const [toolMode, setToolMode] = useState<ToolMode>('brush');
  const [selectedStamp, setSelectedStamp] = useState(SHAPES_AND_EMOJIS[0].icon);
  const [brushSize, setBrushSize] = useState(16);

  // UI Popovers
  const [isStampMenuOpen, setIsStampMenuOpen] = useState(false);
  const [isSizeMenuOpen, setIsSizeMenuOpen] = useState(false);
  const [isBgMenuOpen, setIsBgMenuOpen] = useState(false);

  // Cursor Live Tracker
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [isHoveringCanvas, setIsHoveringCanvas] = useState(false);

  // Dual-Stack Undo / Redo
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);

  // AI Magic Life State
  const [isTransformingAi, setIsTransformingAi] = useState(false);
  const [aiResult, setAiResult] = useState<AiLifeResult | null>(null);

  // Stroke Smoothing Bézier Refs
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastMidPointRef = useRef<{ x: number; y: number } | null>(null);
  const rainbowHueRef = useRef(0);
  const lastAudioBrushRef = useRef(0);

  // --------------------------------------------------
  // INICIALIZACIÓN DEL CANVAS Y LOOP DE PARTÍCULAS
  // --------------------------------------------------
  const initCanvases = useCallback(() => {
    const drawCanvas = drawCanvasRef.current;
    const particleCanvas = particleCanvasRef.current;
    const container = containerRef.current;
    if (!drawCanvas || !particleCanvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = Math.max(window.devicePixelRatio || 1, 2);

    // Ajustar dimensiones internas
    drawCanvas.width = rect.width * dpr;
    drawCanvas.height = rect.height * dpr;
    particleCanvas.width = rect.width * dpr;
    particleCanvas.height = rect.height * dpr;

    // Configurar contexto de dibujo
    const ctx = drawCanvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.fillStyle = currentBackground.bg;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Snapshot inicial
      const initialSnapshot = ctx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
      setUndoStack([initialSnapshot]);
      setRedoStack([]);
    }

    const pCtx = particleCanvas.getContext('2d');
    if (pCtx) {
      pCtx.scale(dpr, dpr);
    }
  }, [currentBackground]);

  useEffect(() => {
    initCanvases();

    // Animación de partículas en 60fps
    const renderParticles = () => {
      const pCanvas = particleCanvasRef.current;
      const container = containerRef.current;
      if (pCanvas && container) {
        const pCtx = pCanvas.getContext('2d');
        if (pCtx) {
          const rect = container.getBoundingClientRect();
          particleSystemRef.current.updateAndRender(pCtx, rect.width, rect.height);
        }
      }
      animFrameIdRef.current = requestAnimationFrame(renderParticles);
    };

    animFrameIdRef.current = requestAnimationFrame(renderParticles);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [initCanvases]);

  // Redimensionamiento responsivo
  useEffect(() => {
    const handleResize = () => {
      initCanvases();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvases]);

  // --------------------------------------------------
  // GESTIÓN DE INSTANTÁNEAS (DUAL-STACK UNDO/REDO)
  // --------------------------------------------------
  const pushUndoSnapshot = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack((prev) => [...prev.slice(-20), snapshot]);
    setRedoStack([]); // Al crear nuevo trazo se invalida redo
  };

  const handleUndo = () => {
    if (undoStack.length <= 1) return;
    sounds.playTap();
    sounds.vibrate(8);

    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentSnapshot = undoStack[undoStack.length - 1];
    const previousSnapshot = undoStack[undoStack.length - 2];

    ctx.putImageData(previousSnapshot, 0, 0);
    setRedoStack((prev) => [...prev, currentSnapshot]);
    setUndoStack((prev) => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    sounds.playTap();
    sounds.vibrate(8);

    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetSnapshot = redoStack[redoStack.length - 1];
    ctx.putImageData(targetSnapshot, 0, 0);

    setUndoStack((prev) => [...prev, targetSnapshot]);
    setRedoStack((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    sounds.playStarBurst();
    sounds.vibrate([15, 30, 15]);

    const canvas = drawCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    ctx.fillStyle = currentBackground.bg;
    ctx.fillRect(0, 0, rect.width, rect.height);

    particleSystemRef.current.emitClearDissolve(rect.width, rect.height);
    pushUndoSnapshot();
  };

  // --------------------------------------------------
  // EXPORTACIÓN LIMPIA DE PNG CON DESCARGA
  // --------------------------------------------------
  const handleExportPng = () => {
    sounds.playSuccess();
    sounds.playStarBurst();
    sounds.vibrate([20, 40, 20]);
    confetti({ particleCount: 100, spread: 90, origin: { y: 0.6 } });

    const canvas = drawCanvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `zentry-obra-magica-${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --------------------------------------------------
  // COORDENADAS Y DIBUJO CON CURVAS BÉZIER CUADRÁTICAS
  // --------------------------------------------------
  const getCanvasPos = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsStampMenuOpen(false);
    setIsSizeMenuOpen(false);
    setIsBgMenuOpen(false);

    const pos = getCanvasPos(e);
    setCursorPos(pos);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Herramienta Sello
    if (toolMode === 'stamp') {
      sounds.playTap();
      sounds.playStarBurst();
      sounds.vibrate([15, 25]);

      const stampSize = brushSize * 2.8;
      ctx.font = `${stampSize}px system-ui, Apple Color Emoji, Segoe UI Emoji`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedStamp, pos.x, pos.y);

      // Partículas explosivas alrededor del sello
      particleSystemRef.current.emitBurst(pos.x, pos.y, Math.random() * 360, 18);
      pushUndoSnapshot();
      return;
    }

    isDrawingRef.current = true;
    const now = performance.now();
    lastPointRef.current = { x: pos.x, y: pos.y, time: now };
    lastMidPointRef.current = { x: pos.x, y: pos.y };

    // Punto inicial redondo
    const startColor =
      toolMode === 'eraser'
        ? currentBackground.bg
        : toolMode === 'rainbow'
        ? `hsl(${rainbowHueRef.current}, 95%, 55%)`
        : toolMode === 'magic_stars'
        ? '#FDE047'
        : selectedColor;

    const initialRadius = (toolMode === 'eraser' ? brushSize * 1.8 : brushSize) / 2;

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, initialRadius, 0, Math.PI * 2);
    ctx.fillStyle = startColor;
    ctx.fill();

    if (toolMode === 'magic_stars') {
      sounds.playSparkle(1.2);
      particleSystemRef.current.emit(pos.x, pos.y, 45, 6, 'star', 1.2);
    } else {
      sounds.playBrushStroke(0.5);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const currentPos = getCanvasPos(e);
    setCursorPos(currentPos);

    if (!isDrawingRef.current || !lastPointRef.current || !lastMidPointRef.current || toolMode === 'stamp') {
      return;
    }

    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const now = performance.now();
    const prev = lastPointRef.current;
    const dx = currentPos.x - prev.x;
    const dy = currentPos.y - prev.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const dt = Math.max(1, now - prev.time);
    const speed = dist / dt; // pixels per ms

    // Frecuencia de audio para pincel
    if (now - lastAudioBrushRef.current > 60) {
      if (toolMode === 'magic_stars') {
        sounds.playSparkle(0.8 + Math.random() * 0.8);
      } else {
        sounds.playBrushStroke(Math.min(speed * 0.8, 1.8));
      }
      lastAudioBrushRef.current = now;
    }

    // Cálculo del punto medio M_i = (P_prev + P_curr) / 2
    const midX = (prev.x + currentPos.x) / 2;
    const midY = (prev.y + currentPos.y) / 2;

    // Presión sintética basada en velocidad inversa para naturalidad
    const synthPressure = Math.max(0.4, Math.min(1.2, 1.1 - speed * 0.15));
    const effectiveLineWidth =
      toolMode === 'eraser'
        ? brushSize * 1.8
        : brushSize * synthPressure;

    // Color del trazo
    let strokeStyle = selectedColor;
    if (toolMode === 'eraser') {
      strokeStyle = currentBackground.bg;
    } else if (toolMode === 'rainbow') {
      rainbowHueRef.current = (rainbowHueRef.current + 5) % 360;
      strokeStyle = `hsl(${rainbowHueRef.current}, 95%, 55%)`;
    } else if (toolMode === 'magic_stars') {
      strokeStyle = `hsl(${(rainbowHueRef.current + 40) % 360}, 100%, 70%)`;
      rainbowHueRef.current = (rainbowHueRef.current + 8) % 360;
    }

    // Curva Cuadrática Bézier con tangentes continuas C1
    ctx.lineWidth = effectiveLineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.beginPath();
    ctx.moveTo(lastMidPointRef.current.x, lastMidPointRef.current.y);
    ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
    ctx.stroke();

    // Emisión de partículas mágicas en el trazo
    if (toolMode === 'magic_stars') {
      particleSystemRef.current.emit(currentPos.x, currentPos.y, rainbowHueRef.current, 3, 'star', 1.0);
    } else if (toolMode === 'rainbow') {
      if (Math.random() > 0.4) {
        particleSystemRef.current.emit(currentPos.x, currentPos.y, rainbowHueRef.current, 1, 'sparkle', 0.8);
      }
    } else if (toolMode === 'brush') {
      if (Math.random() > 0.7) {
        particleSystemRef.current.emit(currentPos.x, currentPos.y, 45, 1, 'sparkle', 0.5);
      }
    }

    lastMidPointRef.current = { x: midX, y: midY };
    lastPointRef.current = { x: currentPos.x, y: currentPos.y, time: now };
  };

  const handlePointerUp = () => {
    if (isDrawingRef.current) {
      const canvas = drawCanvasRef.current;
      if (canvas && lastPointRef.current && lastMidPointRef.current) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Último segmento hasta el punto final
          ctx.beginPath();
          ctx.moveTo(lastMidPointRef.current.x, lastMidPointRef.current.y);
          ctx.lineTo(lastPointRef.current.x, lastPointRef.current.y);
          ctx.stroke();
        }
      }
      isDrawingRef.current = false;
      lastPointRef.current = null;
      lastMidPointRef.current = null;
      pushUndoSnapshot();
    }
  };

  // --------------------------------------------------
  // 🤖 DAR VIDA CON INTELIGENCIA ARTIFICIAL ZENTRY
  // --------------------------------------------------
  const handleAiGiveLife = async () => {
    if (!drawCanvasRef.current || isTransformingAi) return;
    sounds.playTap();
    sounds.playStarBurst();
    sounds.vibrate([15, 30]);
    setIsTransformingAi(true);

    try {
      const canvas = drawCanvasRef.current;
      const base64Img = canvas.toDataURL('image/png');

      const response = await askZentryAi(
        'free_canvas_life',
        'Analiza minuciosamente los trazos, formas, colores y composición espacial de este dibujo infantil y transfórmalo en una obra 3D Pixar de altísima calidad.',
        base64Img
      );

      let parsed: any = {};
      try {
        parsed = JSON.parse(response.trim().replace(/^```json/, '').replace(/```$/, ''));
      } catch {
        parsed = {
          title: 'Tu Creación Asombrosa',
          category: 'magic',
          strokesDescription: 'Trazos alegres llenos de luz, color y energía',
          detectedSubject: 'Creación Mágica',
          compositionMapping: 'Trazos convertidos en formas brillantes y vivas',
          enhancedPrompt: '3D cute Pixar style whimsical character and environment, volumetric lighting, ray tracing, cute, vibrant, 8k resolution',
          speechFeedback: '¡Mira cómo brilla y cobra vida tu dibujo en 3D!'
        };
      }

      const encodedPrompt = encodeURIComponent(
        `${parsed.enhancedPrompt || '3D Pixar whimsical character, cute vibrant 8k'}, 3D pixar style, masterpiece, cute, vibrant, volumetric lighting, 8k resolution, ray tracing`
      );
      const seed = Math.floor(Math.random() * 1000000);
      const generatedUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=768&seed=${seed}&nologo=true`;

      // Pre-cargar imagen
      const img = new Image();
      img.src = generatedUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });

      sounds.playSuccess();
      sounds.playVictoryFanfare();
      confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });

      const resultData: AiLifeResult = {
        title: parsed.title || 'Tu Creación',
        category: parsed.category || 'magic',
        strokesDescription: parsed.strokesDescription,
        detectedSubject: parsed.detectedSubject || 'Obra Mágica',
        compositionMapping: parsed.compositionMapping,
        enhancedImageUrl: generatedUrl,
        speechFeedback: parsed.speechFeedback || '¡Tu dibujo ha cobrado vida mágica!'
      };

      setAiResult(resultData);
      voiceService.speakFeedback(resultData.speechFeedback);
    } catch (err) {
      console.warn('Free canvas AI life error:', err);
      const fallbackResult: AiLifeResult = {
        title: 'Tu Dibujo Mágico',
        category: 'magic',
        strokesDescription: 'Trazos mágicos de colores vibrantes',
        detectedSubject: 'Amigo Mágico Zentry',
        enhancedImageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
        speechFeedback: '¡Tu dibujo se llenó de colores y magia!'
      };
      setAiResult(fallbackResult);
      voiceService.speakFeedback(fallbackResult.speechFeedback);
    } finally {
      setIsTransformingAi(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'landscape':
        return { label: '🏞️ Paisaje', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'character':
        return { label: '🦸 Personaje', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'object':
        return { label: '🚀 Objeto', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      default:
        return { label: '✨ Magia', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    }
  };

  return (
    <ZentrySubPageScaffold title="" kicker="" onBack={onBack} isDark={isDark}>
      <div className="w-full h-full flex flex-col justify-between overflow-hidden gap-2 select-none relative">
        
        {/* ========================================================= */}
        {/* BARRA SUPERIOR: HERRAMIENTAS, GROSOR, SELLOS Y ACCIONES   */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between gap-1.5 px-3 py-2 bg-white/25 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[30px] border border-white/40 dark:border-white/15 shadow-xl">
          
          {/* GRUPO 1: PINCELES PRINCIPALES */}
          <div className="flex items-center gap-1.5">
            {/* 1. Pincel Normal */}
            <button
              onClick={() => {
                sounds.playTap();
                sounds.vibrate(6);
                setToolMode('brush');
                setIsStampMenuOpen(false);
              }}
              className={`p-2.5 rounded-[22px] text-xl border-2 transition-all cursor-pointer zentry-spring-press ${
                toolMode === 'brush'
                  ? 'bg-gradient-to-tr from-pink-500 to-rose-500 text-white scale-105 shadow-lg border-white ring-2 ring-pink-300'
                  : 'bg-white/80 dark:bg-white/10 border-transparent text-slate-700 dark:text-white hover:bg-white'
              }`}
              title="Pincel Clásico"
            >
              <Paintbrush className="w-5 h-5" />
            </button>

            {/* 2. Pincel Arcoíris */}
            <button
              onClick={() => {
                sounds.playTap();
                sounds.vibrate(6);
                setToolMode('rainbow');
                setIsStampMenuOpen(false);
              }}
              className={`p-2.5 rounded-[22px] text-xl border-2 transition-all cursor-pointer zentry-spring-press ${
                toolMode === 'rainbow'
                  ? 'bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400 text-white scale-105 shadow-lg border-white ring-2 ring-yellow-300'
                  : 'bg-white/80 dark:bg-white/10 border-transparent text-slate-700 dark:text-white hover:bg-white'
              }`}
              title="Pincel Arcoíris"
            >
              🌈
            </button>

            {/* 3. Varita Mágica de Estrellas */}
            <button
              onClick={() => {
                sounds.playSparkle(1.3);
                sounds.vibrate(8);
                setToolMode('magic_stars');
                setIsStampMenuOpen(false);
              }}
              className={`p-2.5 rounded-[22px] text-xl border-2 transition-all cursor-pointer zentry-spring-press ${
                toolMode === 'magic_stars'
                  ? 'bg-gradient-to-tr from-amber-400 via-orange-400 to-yellow-300 text-slate-950 scale-105 shadow-lg border-white ring-2 ring-amber-300'
                  : 'bg-white/80 dark:bg-white/10 border-transparent text-slate-700 dark:text-white hover:bg-white'
              }`}
              title="Varita Mágica de Estrellas"
            >
              <Wand2 className="w-5 h-5" />
            </button>
          </div>

          {/* GRUPO 2: GROSOR DE PINCEL & SELLOS */}
          <div className="flex items-center gap-1.5">
            {/* Selector de Grosor con Menú Desplegable */}
            <div className="relative">
              <button
                onClick={() => {
                  sounds.playTap();
                  setIsSizeMenuOpen((prev) => !prev);
                  setIsStampMenuOpen(false);
                  setIsBgMenuOpen(false);
                }}
                className={`p-2.5 rounded-[22px] border-2 flex items-center justify-center gap-1 transition-all cursor-pointer zentry-spring-press ${
                  isSizeMenuOpen
                    ? 'bg-indigo-600 text-white border-white ring-2 ring-indigo-300'
                    : 'bg-white/80 dark:bg-white/10 border-transparent text-slate-700 dark:text-white'
                }`}
                title="Grosor del Pincel"
              >
                <Sliders className="w-5 h-5" />
                <span className="text-xs font-black">{brushSize}px</span>
              </button>

              {isSizeMenuOpen && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-[#120E24]/95 border-2 border-indigo-400/60 p-3.5 rounded-[28px] shadow-2xl backdrop-blur-2xl z-50 animate-spring-unfold min-w-[220px] flex flex-col gap-3">
                  <div className="text-xs font-bold text-indigo-200 text-center uppercase tracking-wider">
                    Grosor de Trazo
                  </div>

                  {/* Botones Predefinidos */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {BRUSH_PRESETS.map((preset) => (
                      <button
                        key={preset.size}
                        onClick={() => {
                          sounds.playTap();
                          sounds.vibrate(5);
                          setBrushSize(preset.size);
                          setIsSizeMenuOpen(false);
                        }}
                        className={`p-2 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          brushSize === preset.size
                            ? 'bg-indigo-500 text-white font-bold ring-2 ring-indigo-300'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        <span className="text-lg">{preset.icon}</span>
                        <span className="text-[10px]">{preset.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Slider Deslizante */}
                  <div className="flex flex-col gap-1 pt-1 border-t border-white/10">
                    <div className="flex items-center justify-between text-[11px] text-indigo-300">
                      <span>4px</span>
                      <span className="font-bold text-white">{brushSize}px</span>
                      <span>64px</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="64"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-full accent-indigo-400 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Selector de Sellos & Emojis */}
            <div className="relative">
              <button
                onClick={() => {
                  sounds.playTap();
                  setIsStampMenuOpen((prev) => !prev);
                  setIsSizeMenuOpen(false);
                  setIsBgMenuOpen(false);
                }}
                className={`p-2.5 rounded-[22px] text-2xl border-2 flex items-center justify-center transition-all cursor-pointer zentry-spring-press ${
                  toolMode === 'stamp'
                    ? 'bg-amber-400 text-white scale-105 shadow-lg border-white ring-2 ring-amber-300'
                    : 'bg-white/80 dark:bg-white/10 border-transparent'
                }`}
                title="Sellos y Emojis"
              >
                <span>{selectedStamp}</span>
              </button>

              {isStampMenuOpen && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-[#120E24]/95 border-2 border-purple-400/60 p-3 rounded-[28px] shadow-2xl backdrop-blur-2xl grid grid-cols-4 gap-2 z-50 animate-spring-unfold min-w-[220px]">
                  {SHAPES_AND_EMOJIS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        sounds.playTap();
                        sounds.vibrate(5);
                        setSelectedStamp(s.icon);
                        setToolMode('stamp');
                        setIsStampMenuOpen(false);
                      }}
                      className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-2xl flex items-center justify-center transition-transform hover:scale-115 active:scale-90 cursor-pointer"
                    >
                      {s.icon}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* GRUPO 3: GOMA, DESHACER, REHACER Y LIMPIAR */}
          <div className="flex items-center gap-1.5">
            {/* Goma de Borrar */}
            <button
              onClick={() => {
                sounds.playTap();
                sounds.vibrate(5);
                setToolMode('eraser');
                setIsStampMenuOpen(false);
                setIsSizeMenuOpen(false);
              }}
              className={`p-2.5 rounded-[22px] border-2 transition-all cursor-pointer zentry-spring-press ${
                toolMode === 'eraser'
                  ? 'bg-purple-600 text-white scale-105 shadow-lg border-white ring-2 ring-purple-300'
                  : 'bg-white/80 dark:bg-white/10 border-transparent text-slate-700 dark:text-white hover:bg-white'
              }`}
              title="Goma de Borrar"
            >
              <Eraser className="w-5 h-5" />
            </button>

            {/* Deshacer (Undo) */}
            <button
              onClick={handleUndo}
              disabled={undoStack.length <= 1}
              className="p-2.5 rounded-[22px] bg-white/80 dark:bg-white/10 text-slate-700 dark:text-white disabled:opacity-35 active:scale-90 cursor-pointer zentry-spring-press border border-transparent hover:bg-white"
              title="Deshacer"
            >
              <Undo2 className="w-5 h-5" />
            </button>

            {/* Rehacer (Redo) */}
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-2.5 rounded-[22px] bg-white/80 dark:bg-white/10 text-slate-700 dark:text-white disabled:opacity-35 active:scale-90 cursor-pointer zentry-spring-press border border-transparent hover:bg-white"
              title="Rehacer"
            >
              <Redo2 className="w-5 h-5" />
            </button>

            {/* Limpiar */}
            <button
              onClick={handleClear}
              className="p-2.5 rounded-[22px] bg-white/80 dark:bg-white/10 text-slate-700 dark:text-white active:scale-90 cursor-pointer zentry-spring-press border border-transparent hover:bg-white"
              title="Limpiar Lienzo"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* LIENZO PRINCIPAL + OVERLAY DE PARTÍCULAS + CURSOR FLOTANTE */}
        {/* ========================================================= */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerEnter={() => setIsHoveringCanvas(true)}
          onPointerLeave={() => {
            setIsHoveringCanvas(false);
            handlePointerUp();
          }}
          className="flex-1 w-full relative rounded-[34px] overflow-hidden shadow-2xl border-4 border-white/80 dark:border-white/20 touch-none cursor-crosshair"
          style={{ backgroundColor: currentBackground.bg }}
        >
          {/* Canvas de Dibujo Base */}
          <canvas ref={drawCanvasRef} className="w-full h-full block" />

          {/* Canvas de Partículas 2D Overlay */}
          <canvas ref={particleCanvasRef} className="w-full h-full block absolute inset-0 pointer-events-none" />

          {/* CURSOR FLOTANTE INTERACTIVO */}
          {isHoveringCanvas && cursorPos && (
            <div
              className="pointer-events-none fixed z-40 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out"
              style={{
                left: `${cursorPos.x + (containerRef.current?.getBoundingClientRect().left || 0)}px`,
                top: `${cursorPos.y + (containerRef.current?.getBoundingClientRect().top || 0)}px`,
                width: `${toolMode === 'eraser' ? brushSize * 1.8 : Math.max(brushSize, 20)}px`,
                height: `${toolMode === 'eraser' ? brushSize * 1.8 : Math.max(brushSize, 20)}px`
              }}
            >
              {toolMode === 'stamp' ? (
                <div className="w-full h-full flex items-center justify-center text-3xl animate-bounce drop-shadow-lg">
                  {selectedStamp}
                </div>
              ) : toolMode === 'eraser' ? (
                <div className="w-full h-full rounded-full border-2 border-dashed border-white/90 bg-red-500/25 shadow-lg backdrop-blur-[1px]" />
              ) : toolMode === 'magic_stars' ? (
                <div className="w-full h-full rounded-full border-2 border-amber-300 bg-amber-400/20 shadow-[0_0_15px_#fde047] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                </div>
              ) : toolMode === 'rainbow' ? (
                <div
                  className="w-full h-full rounded-full border-2 border-white shadow-lg animate-pulse"
                  style={{
                    backgroundColor: `hsl(${rainbowHueRef.current}, 95%, 55%, 0.35)`,
                    boxShadow: `0 0 12px hsl(${rainbowHueRef.current}, 95%, 55%)`
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
              ) : (
                <div
                  className="w-full h-full rounded-full border-2 border-white/90 shadow-md backdrop-blur-[1px]"
                  style={{
                    backgroundColor: `${selectedColor}33`,
                    boxShadow: `0 0 10px ${selectedColor}88, inset 0 0 6px ${selectedColor}`
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* BARRA INFERIOR: FONDOS, PALETA, BOTÓN ROMBO IA Y EXPORTAR */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between gap-3 px-3 py-1.5 bg-white/25 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[30px] border border-white/40 dark:border-white/15 shadow-xl">
          
          {/* Selector de Fondo de Lienzo */}
          <div className="relative shrink-0">
            <button
              onClick={() => {
                sounds.playTap();
                setIsBgMenuOpen((prev) => !prev);
                setIsStampMenuOpen(false);
                setIsSizeMenuOpen(false);
              }}
              className="p-2.5 rounded-[22px] bg-white/80 dark:bg-white/10 border border-white/40 dark:border-white/10 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white cursor-pointer zentry-spring-press"
              title="Cambiar Fondo"
            >
              <span
                className="w-4 h-4 rounded-full border border-white/60 shadow-sm"
                style={{ backgroundColor: currentBackground.bg }}
              />
              <span className="hidden sm:inline">{currentBackground.label}</span>
            </button>

            {isBgMenuOpen && (
              <div className="absolute bottom-14 left-0 bg-[#120E24]/95 border-2 border-pink-400/60 p-3 rounded-[28px] shadow-2xl backdrop-blur-2xl z-50 animate-spring-unfold min-w-[200px] flex flex-col gap-2">
                <div className="text-xs font-bold text-pink-200 text-center uppercase tracking-wider">
                  Fondo del Lienzo
                </div>
                {BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => {
                      sounds.playTap();
                      sounds.vibrate(6);
                      setCurrentBackground(bg);
                      setIsBgMenuOpen(false);
                    }}
                    className={`px-3 py-2 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                      currentBackground.id === bg.id
                        ? 'bg-pink-500 text-white font-bold'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border border-white"
                        style={{ backgroundColor: bg.bg }}
                      />
                      <span className="text-xs">{bg.label}</span>
                    </div>
                    {currentBackground.id === bg.id && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Paleta de Colores Brillantes */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {COLOR_PALETTE.map((colorHex) => (
              <button
                key={colorHex}
                onClick={() => {
                  sounds.playTap();
                  sounds.vibrate(5);
                  setSelectedColor(colorHex);
                  if (toolMode === 'eraser') setToolMode('brush');
                }}
                style={{ backgroundColor: colorHex }}
                className={`w-9 h-9 md:w-11 md:h-11 rounded-full border-2 transition-transform cursor-pointer shrink-0 ${
                  (toolMode === 'brush' || toolMode === 'magic_stars') && selectedColor === colorHex
                    ? 'scale-115 border-white ring-4 ring-pink-400 shadow-xl'
                    : 'border-white/80 hover:scale-105'
                }`}
              />
            ))}
          </div>

          {/* Botonera de Acción: Rombo IA Zentry + Guardar PNG */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* BOTÓN INTELIGENCIA ARTIFICIAL (ROMBO ZENTRY) */}
            <button
              onClick={handleAiGiveLife}
              disabled={isTransformingAi}
              className="w-13 h-13 md:w-15 md:h-15 rounded-[22px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-xl border-3 border-white active:scale-90 cursor-pointer zentry-spring-press relative group disabled:opacity-50"
              title="¡Dar Vida Mágica con Zentry AI!"
            >
              {isTransformingAi ? (
                <RefreshCw className="w-6 h-6 animate-spin text-amber-300" />
              ) : (
                <>
                  <ZentryLogoIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-300 absolute -top-1 -right-1 animate-ping" />
                </>
              )}
            </button>

            {/* BOTÓN EXPORTAR / GUARDAR PNG */}
            <button
              onClick={handleExportPng}
              className="w-13 h-13 md:w-15 md:h-15 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-xl border-3 border-white active:scale-90 cursor-pointer zentry-spring-press"
              title="Descargar Obra en PNG"
            >
              <Download className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODAL: DIBUJO CON VIDA MÁGICA AI (VISIÓN & TRANSFORMACIÓN) */}
        {/* ========================================================= */}
        {aiResult && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in select-none"
            onClick={() => setAiResult(null)}
          >
            <div
              className="relative max-w-sm w-full rounded-[36px] p-4 bg-[#120E24]/95 border-2 border-purple-400/60 shadow-2xl flex flex-col items-center gap-3 animate-spring-in text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header con Título y Badge de Categoría */}
              <div className="flex items-center justify-between w-full border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <ZentryLogoIcon className="w-5 h-5 text-amber-300 shrink-0" />
                  <span className="text-sm font-black text-white truncate">{aiResult.title}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {(() => {
                    const badge = getCategoryBadge(aiResult.category);
                    return (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                        {badge.label}
                      </span>
                    );
                  })()}
                  <button
                    onClick={() => setAiResult(null)}
                    className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Enhanced 3D Pixar Image */}
              <div className="relative w-full aspect-square rounded-[26px] overflow-hidden border-2 border-purple-400/40 shadow-inner bg-black">
                <img
                  src={aiResult.enhancedImageUrl}
                  alt={aiResult.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Trazos e Interpretación */}
              {aiResult.strokesDescription && (
                <div className="text-[11px] text-purple-200 font-bold px-2 line-clamp-2">
                  🎨 {aiResult.strokesDescription}
                </div>
              )}

              {/* Voice Feedback Text */}
              <p className="text-xs font-bold text-white leading-relaxed px-1">
                {aiResult.speechFeedback}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2.5 w-full pt-1">
                <button
                  onClick={() => {
                    sounds.playTap();
                    voiceService.speakFeedback(aiResult.speechFeedback);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer zentry-spring-press border border-white/20"
                >
                  <Volume2 className="w-4 h-4 text-purple-300" />
                  <span>Escuchar</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playSuccess();
                    sounds.playStarBurst();
                    confetti({ particleCount: 90, spread: 80 });
                    setAiResult(null);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer zentry-spring-press shadow-lg"
                >
                  <span>¡Me Encanta! ⭐</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ZentrySubPageScaffold>
  );
};

export default ZentryFreeCanvasScreen;
