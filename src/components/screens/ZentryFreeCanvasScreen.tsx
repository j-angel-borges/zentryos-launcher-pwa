import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Undo2,
  Trash2,
  Volume2,
  Eraser,
  RefreshCw,
  Paintbrush,
  X,
  Sparkles,
  Check,
  Shapes,
  Circle,
  Square,
  Star,
  Triangle,
  Heart,
  Diamond,
  Flower2,
  Rocket,
  Download,
  Palette,
  Mountain,
  User,
  Box,
  CheckCircle2,
  LucideIcon
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

export type ShapeType =
  | 'circle'
  | 'rectangle'
  | 'star'
  | 'triangle'
  | 'heart'
  | 'diamond'
  | 'flower'
  | 'rocket';

const GEOMETRIC_SHAPES: Array<{ id: ShapeType; label: string; Icon: LucideIcon }> = [
  { id: 'circle', label: 'Círculo', Icon: Circle },
  { id: 'rectangle', label: 'Rectángulo', Icon: Square },
  { id: 'star', label: 'Estrella', Icon: Star },
  { id: 'triangle', label: 'Triángulo', Icon: Triangle },
  { id: 'heart', label: 'Corazón', Icon: Heart },
  { id: 'diamond', label: 'Rombo', Icon: Diamond },
  { id: 'flower', label: 'Flor', Icon: Flower2 },
  { id: 'rocket', label: 'Cohete', Icon: Rocket }
];

const BRUSH_SIZES = [
  { id: 'fine', size: 6, dotSize: 8, label: 'Fino' },
  { id: 'medium', size: 14, dotSize: 14, label: 'Medio' },
  { id: 'thick', size: 26, dotSize: 22, label: 'Grueso' },
  { id: 'jumbo', size: 44, dotSize: 30, label: 'Jumbo' }
];

// 36 Colores Estilo Paint (Matriz Ordenada por Familias)
const PAINT_PALETTE_MATRIX = [
  // Fila 1: Neutros y Escala de Grises
  ['#000000', '#334155', '#64748B', '#94A3B8', '#E2E8F0', '#FFFFFF'],
  // Fila 2: Rojos y Rosas
  ['#881337', '#DC2626', '#EF4444', '#F87171', '#EC4899', '#F472B6'],
  // Fila 3: Naranjas y Amarillos
  ['#7C2D12', '#EA580C', '#F97316', '#FB923C', '#EAB308', '#FDE047'],
  // Fila 4: Verdes y Lima
  ['#14532D', '#16A34A', '#22C55E', '#4ADE80', '#84CC16', '#A3E635'],
  // Fila 5: Cyan y Azules
  ['#164E63', '#0891B2', '#06B6D4', '#38BDF8', '#2563EB', '#60A5FA'],
  // Fila 6: Violeta, Púrpura y Tonos Piel
  ['#4C1D95', '#7C3AED', '#8B5CF6', '#C084FC', '#92400E', '#FDDFD0']
];

const QUICK_COLORS = ['#EC4899', '#3B82F6', '#10B981', '#EAB308', '#000000'];

type ToolMode = 'brush' | 'rainbow' | 'shape' | 'eraser';

interface AiLifeResult {
  title: string;
  category: string;
  strokesDescription?: string;
  detectedSubject: string;
  compositionMapping?: string;
  enhancedImageUrl: string;
  speechFeedback: string;
}

export const ZentryFreeCanvasScreen: React.FC<Props> = ({ onBack, isDark }) => {
  // Referencias Canvas y Contenedor
  const containerRef = useRef<HTMLDivElement | null>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Estados de Herramientas
  const [toolMode, setToolMode] = useState<ToolMode>('brush');
  const [selectedColor, setSelectedColor] = useState<string>('#EC4899');
  const [brushSize, setBrushSize] = useState<number>(14);
  const [selectedShape, setSelectedShape] = useState<ShapeType>('circle');
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

  // Puntos de trazo para suavizado Bézier continuo
  const isDrawingRef = useRef(false);
  const strokePointsRef = useRef<Array<{ x: number; y: number }>>([]);
  const rainbowHueRef = useRef(0);

  // Historial Deshacer (snapshots ImageData)
  const [history, setHistory] = useState<ImageData[]>([]);

  // Estado IA Mágica
  const [isTransformingAi, setIsTransformingAi] = useState(false);
  const [aiResult, setAiResult] = useState<AiLifeResult | null>(null);

  // --------------------------------------------------
  // INICIALIZACIÓN Y CONFIGURACIÓN HIGH-DPI DE CANVAS
  // --------------------------------------------------
  const initCanvases = useCallback(() => {
    const container = containerRef.current;
    const drawCanvas = drawCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!container || !drawCanvas || !overlayCanvas) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const prevCtx = drawCanvas.getContext('2d');
    let prevData: ImageData | null = null;
    if (prevCtx && drawCanvas.width > 0 && drawCanvas.height > 0) {
      try {
        prevData = prevCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
      } catch {}
    }

    drawCanvas.width = Math.round(rect.width * dpr);
    drawCanvas.height = Math.round(rect.height * dpr);
    overlayCanvas.width = Math.round(rect.width * dpr);
    overlayCanvas.height = Math.round(rect.height * dpr);

    const drawCtx = drawCanvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');

    if (drawCtx) {
      drawCtx.lineCap = 'round';
      drawCtx.lineJoin = 'round';

      if (prevData) {
        drawCtx.putImageData(prevData, 0, 0);
      } else {
        drawCtx.fillStyle = '#FFFFFF';
        drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
        const initialSnap = drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
        setHistory([initialSnap]);
      }
    }

    if (overlayCtx) {
      overlayCtx.lineCap = 'round';
      overlayCtx.lineJoin = 'round';
    }
  }, []);

  useEffect(() => {
    initCanvases();
    window.addEventListener('resize', initCanvases);
    return () => window.removeEventListener('resize', initCanvases);
  }, [initCanvases]);

  const pushSnapshot = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), snap]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    sounds.playTap();
    sounds.vibrate(8);

    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const next = history.slice(0, -1);
    const prev = next[next.length - 1];
    ctx.putImageData(prev, 0, 0);
    setHistory(next);
  };

  const handleClear = () => {
    sounds.playTap();
    sounds.vibrate([15, 30]);

    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    pushSnapshot();
  };

  // --------------------------------------------------
  // CONVERSIÓN DE COORDENADAS HIGH-DPI
  // --------------------------------------------------
  const getCanvasPos = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const canvas = drawCanvasRef.current;
    if (!container || !canvas) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  // --------------------------------------------------
  // RENDERIZADO VECTORIAL DE FORMAS GEOMÉTRICAS
  // --------------------------------------------------
  const drawVectorShape = (
    ctx: CanvasRenderingContext2D,
    shape: ShapeType,
    startX: number,
    startY: number,
    currentX: number,
    currentY: number,
    color: string,
    strokeWidthScaled: number
  ) => {
    const minX = Math.min(startX, currentX);
    const minY = Math.min(startY, currentY);
    const width = Math.max(Math.abs(currentX - startX), 24);
    const height = Math.max(Math.abs(currentY - startY), 24);
    const centerX = minX + width / 2;
    const centerY = minY + height / 2;
    const radius = Math.max(width, height) / 2;

    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidthScaled;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();

    switch (shape) {
      case 'circle': {
        ctx.ellipse(centerX, centerY, width / 2, height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'rectangle': {
        const r = Math.min(20, width / 4, height / 4);
        ctx.roundRect(minX, minY, width, height, r);
        ctx.fill();
        break;
      }
      case 'triangle': {
        ctx.moveTo(centerX, minY);
        ctx.lineTo(minX + width, minY + height);
        ctx.lineTo(minX, minY + height);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'star': {
        const spikes = 5;
        const outer = radius;
        const inner = radius * 0.45;
        let rot = (Math.PI / 2) * 3;
        const step = Math.PI / spikes;

        ctx.moveTo(centerX, centerY - outer);
        for (let i = 0; i < spikes; i++) {
          let x = centerX + Math.cos(rot) * outer;
          let y = centerY + Math.sin(rot) * outer;
          ctx.lineTo(x, y);
          rot += step;

          x = centerX + Math.cos(rot) * inner;
          y = centerY + Math.sin(rot) * inner;
          ctx.lineTo(x, y);
          rot += step;
        }
        ctx.lineTo(centerX, centerY - outer);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'heart': {
        const s = radius / 18;
        ctx.moveTo(centerX, centerY - 6 * s);
        ctx.bezierCurveTo(
          centerX + 12 * s,
          centerY - 20 * s,
          centerX + 26 * s,
          centerY + 2 * s,
          centerX,
          centerY + 22 * s
        );
        ctx.bezierCurveTo(
          centerX - 26 * s,
          centerY + 2 * s,
          centerX - 12 * s,
          centerY - 20 * s,
          centerX,
          centerY - 6 * s
        );
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'diamond': {
        ctx.moveTo(centerX, minY);
        ctx.lineTo(minX + width, centerY);
        ctx.lineTo(centerX, minY + height);
        ctx.lineTo(minX, centerY);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'flower': {
        const petals = 6;
        for (let i = 0; i < petals; i++) {
          const angle = (i * 2 * Math.PI) / petals;
          const px = centerX + Math.cos(angle) * (radius * 0.55);
          const py = centerY + Math.sin(angle) * (radius * 0.55);
          ctx.beginPath();
          ctx.arc(px, py, radius * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.fillStyle = '#FEF08A';
        ctx.arc(centerX, centerY, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'rocket': {
        ctx.moveTo(centerX, minY);
        ctx.quadraticCurveTo(
          minX + width,
          centerY,
          centerX + width * 0.3,
          minY + height * 0.85
        );
        ctx.lineTo(centerX - width * 0.3, minY + height * 0.85);
        ctx.quadraticCurveTo(minX, centerY, centerX, minY);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = '#F97316';
        ctx.moveTo(centerX - width * 0.2, minY + height * 0.85);
        ctx.lineTo(centerX, minY + height);
        ctx.lineTo(centerX + width * 0.2, minY + height * 0.85);
        ctx.closePath();
        ctx.fill();
        break;
      }
    }

    ctx.restore();
  };

  // --------------------------------------------------
  // GESTIÓN DE PUNTERO: TRAZO ULTRA-SUAVE BÉZIER
  // --------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const pos = getCanvasPos(e);
    isDrawingRef.current = true;
    strokePointsRef.current = [pos];

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    const dpr = window.devicePixelRatio || 1;
    const strokeWidthScaled = (toolMode === 'eraser' ? brushSize * 2 : brushSize) * dpr;

    if (toolMode === 'shape') {
      const overlay = overlayCanvasRef.current;
      if (overlay) {
        const oCtx = overlay.getContext('2d');
        if (oCtx) {
          oCtx.clearRect(0, 0, overlay.width, overlay.height);
          drawVectorShape(
            oCtx,
            selectedShape,
            pos.x,
            pos.y,
            pos.x + 80 * dpr,
            pos.y + 80 * dpr,
            selectedColor,
            strokeWidthScaled
          );
        }
      }
      return;
    }

    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    sounds.playTap();
    sounds.vibrate(5);

    const drawColor =
      toolMode === 'eraser'
        ? '#FFFFFF'
        : toolMode === 'rainbow'
        ? `hsl(${rainbowHueRef.current}, 95%, 55%)`
        : selectedColor;

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, strokeWidthScaled / 2, 0, Math.PI * 2);
    ctx.fillStyle = drawColor;
    ctx.fill();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawingRef.current || strokePointsRef.current.length === 0) return;
    const currentPos = getCanvasPos(e);
    const startPos = strokePointsRef.current[0];
    const dpr = window.devicePixelRatio || 1;
    const strokeWidthScaled = (toolMode === 'eraser' ? brushSize * 2 : brushSize) * dpr;

    if (toolMode === 'shape') {
      const overlay = overlayCanvasRef.current;
      if (!overlay) return;
      const oCtx = overlay.getContext('2d');
      if (!oCtx) return;

      oCtx.clearRect(0, 0, overlay.width, overlay.height);
      drawVectorShape(
        oCtx,
        selectedShape,
        startPos.x,
        startPos.y,
        currentPos.x,
        currentPos.y,
        selectedColor,
        strokeWidthScaled
      );
      return;
    }

    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    strokePointsRef.current.push(currentPos);
    const pts = strokePointsRef.current;

    if (toolMode === 'rainbow') {
      rainbowHueRef.current = (rainbowHueRef.current + 5) % 360;
      ctx.strokeStyle = `hsl(${rainbowHueRef.current}, 95%, 55%)`;
    } else {
      ctx.strokeStyle = toolMode === 'eraser' ? '#FFFFFF' : selectedColor;
    }

    ctx.lineWidth = strokeWidthScaled;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (pts.length === 2) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      ctx.lineTo(pts[1].x, pts[1].y);
      ctx.stroke();
    } else if (pts.length > 2) {
      const p1 = pts[pts.length - 2];
      const p2 = pts[pts.length - 1];
      const prevP = pts[pts.length - 3] || p1;

      const mid1X = (prevP.x + p1.x) / 2;
      const mid1Y = (prevP.y + p1.y) / 2;
      const mid2X = (p1.x + p2.x) / 2;
      const mid2Y = (p1.y + p2.y) / 2;

      ctx.beginPath();
      ctx.moveTo(mid1X, mid1Y);
      ctx.quadraticCurveTo(p1.x, p1.y, mid2X, mid2Y);
      ctx.stroke();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const endPos = getCanvasPos(e);
    const startPos = strokePointsRef.current[0];
    const dpr = window.devicePixelRatio || 1;
    const strokeWidthScaled = (toolMode === 'eraser' ? brushSize * 2 : brushSize) * dpr;

    if (toolMode === 'shape' && startPos) {
      const canvas = drawCanvasRef.current;
      const overlay = overlayCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawVectorShape(
            ctx,
            selectedShape,
            startPos.x,
            startPos.y,
            endPos.x,
            endPos.y,
            selectedColor,
            strokeWidthScaled
          );
        }
      }
      if (overlay) {
        const oCtx = overlay.getContext('2d');
        if (oCtx) oCtx.clearRect(0, 0, overlay.width, overlay.height);
      }
      sounds.playSuccess();
      sounds.vibrate(10);
    }

    strokePointsRef.current = [];
    pushSnapshot();
  };

  // --------------------------------------------------
  // GUARDAR / DESCARGAR PNG
  // --------------------------------------------------
  const handleSave = () => {
    sounds.playSuccess();
    sounds.vibrate([15, 30, 15]);
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });

    const canvas = drawCanvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `zentry-lienzo-${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --------------------------------------------------
  // DAR VIDA MÁGICA CON IA ZENTRY
  // --------------------------------------------------
  const handleAiGiveLife = async () => {
    if (!drawCanvasRef.current || isTransformingAi) return;
    sounds.playTap();
    setIsTransformingAi(true);

    try {
      const canvas = drawCanvasRef.current;
      const base64Img = canvas.toDataURL('image/png');

      const response = await askZentryAi(
        'free_canvas_life',
        'Analiza minuciosamente los trazos, formas, colores y composición espacial de este dibujo infantil y transfórmalo en una ilustración 3D Pixar de alta resolución fiel a los trazos.',
        base64Img
      );

      let parsed: any = {};
      try {
        parsed = JSON.parse(response.trim().replace(/^```json/, '').replace(/```$/, ''));
      } catch {
        parsed = {
          title: 'Tu Obra Mágica',
          category: 'magic',
          strokesDescription: 'Trazos alegres llenos de color y luz',
          detectedSubject: 'Creación mágica',
          enhancedPrompt: '3D cute Pixar style character in a glowing wonderland, magical lighting, colorful, 8k resolution',
          speechFeedback: '¡Mira cómo brilla y cobra vida tu dibujo!'
        };
      }

      const encodedPrompt = encodeURIComponent(
        `${parsed.enhancedPrompt}, 3D pixar style, masterpiece, cute, vibrant, 8k resolution, ray tracing`
      );
      const seed = Math.floor(Math.random() * 1000000);
      const generatedUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=768&seed=${seed}&nologo=true`;

      const img = new Image();
      img.src = generatedUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });

      sounds.playSuccess();
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
        strokesDescription: 'Trazos mágicos de colores brillantes',
        detectedSubject: 'Amigo Mágico',
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
        return {
          label: 'Paisaje',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          Icon: Mountain
        };
      case 'character':
        return {
          label: 'Personaje',
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          Icon: User
        };
      case 'object':
        return {
          label: 'Objeto',
          color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          Icon: Box
        };
      default:
        return {
          label: 'Magia',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          Icon: Sparkles
        };
    }
  };

  const ActiveShapeIcon = GEOMETRIC_SHAPES.find((s) => s.id === selectedShape)?.Icon || Shapes;

  return (
    <ZentrySubPageScaffold title="" kicker="" onBack={onBack} isDark={isDark}>
      <div className="w-full h-full max-w-5xl mx-auto flex flex-col justify-between overflow-hidden gap-2 select-none relative">
        
        {/* ========================================================= */}
        {/* 1. BARRA SUPERIOR MINIMALISTA: CERO TEXTO INNECESARIO     */}
        {/* ========================================================= */}
        <div className="flex flex-col gap-1.5 p-2 bg-white/40 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[28px] border border-white/50 dark:border-white/15 shadow-xl">
          <div className="flex items-center justify-between gap-1 w-full">
            {/* GRUPO HERRAMIENTAS (Iconos SVG Nítidos sin texto) */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Pincel Normal */}
              <button
                onClick={() => {
                  sounds.playTap();
                  sounds.vibrate(6);
                  setToolMode('brush');
                }}
                className={`p-2 sm:p-2.5 rounded-2xl flex items-center justify-center border-2 transition-all cursor-pointer zentry-spring-press ${
                  toolMode === 'brush'
                    ? 'bg-pink-500 text-white scale-105 shadow-md border-white ring-2 ring-pink-300'
                    : 'bg-white/80 dark:bg-white/10 border-transparent text-slate-700 dark:text-white hover:bg-white'
                }`}
                title="Pincel"
              >
                <Paintbrush className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Pincel Arcoíris */}
              <button
                onClick={() => {
                  sounds.playTap();
                  sounds.vibrate(6);
                  setToolMode('rainbow');
                }}
                className={`p-2 sm:p-2.5 rounded-2xl flex items-center justify-center border-2 transition-all cursor-pointer zentry-spring-press ${
                  toolMode === 'rainbow'
                    ? 'bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400 text-slate-950 scale-105 shadow-md border-white ring-2 ring-yellow-300'
                    : 'bg-white/80 dark:bg-white/10 border-transparent text-slate-700 dark:text-white hover:bg-white'
                }`}
                title="Pincel Arcoíris"
              >
                <Sparkles className="w-5 h-5" />
              </button>

              {/* Formas Geométricas */}
              <button
                onClick={() => {
                  sounds.playTap();
                  sounds.vibrate(6);
                  setToolMode('shape');
                }}
                className={`p-2 sm:p-2.5 rounded-2xl flex items-center justify-center border-2 transition-all cursor-pointer zentry-spring-press ${
                  toolMode === 'shape'
                    ? 'bg-amber-400 text-slate-950 scale-105 shadow-md border-white ring-2 ring-amber-300'
                    : 'bg-white/80 dark:bg-white/10 border-transparent text-slate-700 dark:text-white hover:bg-white'
                }`}
                title="Formas Geométricas"
              >
                <ActiveShapeIcon className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Goma de Borrar */}
              <button
                onClick={() => {
                  sounds.playTap();
                  sounds.vibrate(6);
                  setToolMode('eraser');
                }}
                className={`p-2 sm:p-2.5 rounded-2xl flex items-center justify-center border-2 transition-all cursor-pointer zentry-spring-press ${
                  toolMode === 'eraser'
                    ? 'bg-purple-600 text-white scale-105 shadow-md border-white ring-2 ring-purple-300'
                    : 'bg-white/80 dark:bg-white/10 border-transparent text-slate-700 dark:text-white hover:bg-white'
                }`}
                title="Borrador"
              >
                <Eraser className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Separador */}
            <div className="h-6 w-px bg-slate-300 dark:bg-white/20" />

            {/* SELECTOR DE 4 TAMAÑOS DE PINCEL (Circulitos Directos) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {BRUSH_SIZES.map((b) => {
                const isSelected = brushSize === b.size;
                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      sounds.playTap();
                      sounds.vibrate(6);
                      setBrushSize(b.size);
                    }}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer zentry-spring-press ${
                      isSelected
                        ? 'bg-indigo-600 border-2 border-white ring-2 ring-indigo-400 shadow-md scale-110'
                        : 'bg-white/60 dark:bg-white/15 hover:bg-white/90'
                    }`}
                    title={`Tamaño ${b.label}`}
                  >
                    <span
                      style={{
                        width: `${b.dotSize}px`,
                        height: `${b.dotSize}px`
                      }}
                      className={`rounded-full block transition-colors ${
                        isSelected ? 'bg-white' : 'bg-slate-700 dark:bg-slate-200'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Separador */}
            <div className="h-6 w-px bg-slate-300 dark:bg-white/20" />

            {/* ACCIONES: Deshacer y Limpiar */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleUndo}
                className="p-2 sm:p-2.5 rounded-2xl bg-white/80 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-white active:scale-90 cursor-pointer zentry-spring-press border border-transparent shadow-sm"
                title="Deshacer"
              >
                <Undo2 className="w-5 h-5" />
              </button>

              <button
                onClick={handleClear}
                className="p-2 sm:p-2.5 rounded-2xl bg-white/80 dark:bg-white/10 text-rose-500 hover:bg-rose-50 active:scale-90 cursor-pointer zentry-spring-press border border-transparent shadow-sm"
                title="Limpiar Lienzo"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sub-barra de Formas cuando el modo Forma está activo */}
          {toolMode === 'shape' && (
            <div className="w-full pt-1.5 border-t border-white/20 flex items-center justify-around overflow-x-auto no-scrollbar gap-1 animate-spring-in">
              {GEOMETRIC_SHAPES.map((s) => {
                const isSelected = selectedShape === s.id;
                const ShapeIcon = s.Icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      sounds.playTap();
                      sounds.vibrate(6);
                      setSelectedShape(s.id);
                    }}
                    className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 zentry-spring-press ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 scale-110 shadow-md ring-2 ring-white'
                        : 'bg-white/50 dark:bg-white/10 hover:bg-white text-slate-800 dark:text-slate-200'
                    }`}
                    title={s.label}
                  >
                    <ShapeIcon className="w-5 h-5 stroke-[2.5]" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 2. ÁREA DE DIBUJO DUAL FLUIDA Y TOTALMENTE RESPONSIVE     */}
        {/* ========================================================= */}
        <div
          ref={containerRef}
          onPointerDown={(e) => {
            if (showColorPicker) setShowColorPicker(false);
            handlePointerDown(e);
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex-1 min-h-[300px] w-full relative rounded-[32px] overflow-hidden shadow-2xl border-4 border-white/80 dark:border-slate-800 touch-none bg-white cursor-crosshair"
        >
          {/* Canvas Principal */}
          <canvas ref={drawCanvasRef} className="w-full h-full block absolute inset-0 z-10" />

          {/* Canvas Overlay de Previsualización */}
          <canvas
            ref={overlayCanvasRef}
            className="w-full h-full block absolute inset-0 z-20 pointer-events-none"
          />
        </div>

        {/* ========================================================= */}
        {/* 3. BARRA INFERIOR: BOTÓN DE COLOR, QUICK COLORS, IA Y SAVE */}
        {/* ========================================================= */}
        <div className="relative flex items-center justify-between gap-2 p-2 sm:p-2.5 bg-white/40 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[28px] border border-white/50 dark:border-white/15 shadow-xl">
          {/* LADO IZQUIERDO: Botón Maestro de Color + Colores Rápidos */}
          <div className="flex items-center gap-2">
            {/* BOTÓN MAESTRO DE PALETA / COLOR ACTUAL */}
            <button
              onClick={() => {
                sounds.playTap();
                sounds.vibrate(6);
                setShowColorPicker(!showColorPicker);
              }}
              className="px-3 py-2 rounded-2xl bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border-2 border-white/80 shadow-md flex items-center gap-2 cursor-pointer zentry-spring-press"
              title="Abrir Gama Completa de Colores"
            >
              {/* Swatch de Color Activo */}
              <div
                style={{ backgroundColor: selectedColor }}
                className="w-7 h-7 rounded-full border-2 border-white shadow-[0_0_10px_rgba(0,0,0,0.2)] flex items-center justify-center shrink-0"
              />
              <Palette className="w-5 h-5 text-slate-700 dark:text-white" />
            </button>

            {/* ACCESOS DIRECTOS DE COLORES POPULARES (5 puntos) */}
            <div className="hidden xs:flex items-center gap-1.5 pl-1 border-l border-slate-300 dark:border-white/20">
              {QUICK_COLORS.map((hex) => {
                const isSelected = selectedColor.toLowerCase() === hex.toLowerCase() && toolMode !== 'eraser';
                return (
                  <button
                    key={hex}
                    onClick={() => {
                      sounds.playTap();
                      sounds.vibrate(5);
                      setSelectedColor(hex);
                      if (toolMode === 'eraser') setToolMode('brush');
                    }}
                    style={{ backgroundColor: hex }}
                    className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                      isSelected
                        ? 'scale-120 border-white ring-2 ring-pink-500 shadow-md'
                        : 'border-white/80 hover:scale-110'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* LADO DERECHO: Rombo IA Zentry + Guardar */}
          <div className="flex items-center gap-2 shrink-0">
            {/* BOTÓN IA ZENTRY */}
            <button
              onClick={handleAiGiveLife}
              disabled={isTransformingAi}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-xl border-2 border-white active:scale-90 cursor-pointer zentry-spring-press relative group disabled:opacity-50"
              title="Dar Vida con IA"
            >
              {isTransformingAi ? (
                <RefreshCw className="w-5 h-5 animate-spin text-amber-300" />
              ) : (
                <>
                  <ZentryLogoIcon className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-112 transition-transform" />
                  <span className="w-2 h-2 rounded-full bg-amber-300 absolute -top-0.5 -right-0.5 animate-ping" />
                </>
              )}
            </button>

            {/* BOTÓN DESCARGAR */}
            <button
              onClick={handleSave}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-xl border-2 border-white active:scale-90 cursor-pointer zentry-spring-press"
              title="Guardar Dibujo"
            >
              <Download className="w-5 h-5 text-white stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODAL OVERLAY: GAMA COMPLETA DE COLORES ESTILO PAINT      */}
        {/* ========================================================= */}
        {showColorPicker && (
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in select-none"
            onClick={() => setShowColorPicker(false)}
          >
            <div
              className="relative max-w-sm w-full rounded-[32px] p-4 bg-[#120E24]/98 backdrop-blur-2xl border-2 border-purple-400/70 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-white animate-spring-in space-y-3.5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Encabezado del Selector */}
              <div className="flex items-center justify-between pb-2 border-b border-white/15">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-pink-400" />
                  <span className="text-sm font-black uppercase tracking-wider text-white">
                    Gama de Colores
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div
                    style={{ backgroundColor: selectedColor }}
                    className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                  />
                  <button
                    onClick={() => setShowColorPicker(false)}
                    className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 1. Matriz de 36 Colores Estilo Paint (6x6) */}
              <div className="space-y-1.5">
                {PAINT_PALETTE_MATRIX.map((row, rIdx) => (
                  <div key={rIdx} className="grid grid-cols-6 gap-1.5">
                    {row.map((hex) => {
                      const isSelected = selectedColor.toLowerCase() === hex.toLowerCase();
                      return (
                        <button
                          key={hex}
                          onClick={() => {
                            sounds.playTap();
                            sounds.vibrate(5);
                            setSelectedColor(hex);
                            if (toolMode === 'eraser') setToolMode('brush');
                          }}
                          style={{ backgroundColor: hex }}
                          className={`w-full aspect-square rounded-xl border transition-transform cursor-pointer flex items-center justify-center ${
                            isSelected
                              ? 'scale-115 border-white ring-2 ring-pink-400 shadow-lg'
                              : 'border-white/20 hover:scale-110'
                          }`}
                        >
                          {isSelected && (
                            <Check
                              className={`w-4 h-4 ${
                                hex === '#FFFFFF' || hex === '#E2E8F0' || hex === '#FDE047'
                                  ? 'text-slate-950'
                                  : 'text-white'
                              } stroke-[3]`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* 2. Selector Personalizado / Espectro Libre */}
              <div className="pt-2 border-t border-white/15 flex items-center justify-between gap-2">
                <label
                  htmlFor="customColorPicker"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-slate-200 cursor-pointer zentry-spring-press"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Personalizado</span>
                  <input
                    id="customColorPicker"
                    type="color"
                    value={selectedColor}
                    onChange={(e) => {
                      setSelectedColor(e.target.value);
                      if (toolMode === 'eraser') setToolMode('brush');
                    }}
                    className="sr-only"
                  />
                </label>

                <button
                  onClick={() => setShowColorPicker(false)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white text-xs font-black shadow-md cursor-pointer zentry-spring-press"
                >
                  Listo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: DIBUJO CON VIDA MÁGICA AI                          */}
        {/* ========================================================= */}
        {aiResult && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in select-none"
            onClick={() => setAiResult(null)}
          >
            <div
              className="relative max-w-sm w-full rounded-[36px] p-4 bg-[#120E24]/95 border border-purple-400/60 shadow-2xl flex flex-col items-center gap-2.5 animate-spring-in text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header con Título y Badge de Categoría con Icono SVG */}
              <div className="flex items-center justify-between w-full border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <ZentryLogoIcon className="w-5 h-5 text-amber-300 shrink-0" />
                  <span className="text-sm font-black text-white truncate">{aiResult.title}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {(() => {
                    const badge = getCategoryBadge(aiResult.category);
                    const BadgeIcon = badge.Icon;
                    return (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${badge.color}`}>
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
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
                <div className="text-[11px] text-purple-200 font-bold px-2 line-clamp-2 flex items-center justify-center gap-1.5">
                  <Paintbrush className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span>{aiResult.strokesDescription}</span>
                </div>
              )}

              {/* Voice Feedback Text */}
              <p className="text-xs font-bold text-white leading-relaxed px-1">
                {aiResult.speechFeedback}
              </p>

              {/* Actions con Iconos SVG */}
              <div className="flex items-center gap-3 w-full pt-1">
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
                    confetti({ particleCount: 90, spread: 80 });
                    setAiResult(null);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer zentry-spring-press shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>¡Me Encanta!</span>
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
