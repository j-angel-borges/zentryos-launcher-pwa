import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Brush,
  Sparkles,
  Palette,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Layers,
  ZoomIn,
  Volume2,
  Wand2,
  Sun,
  Moon,
  Grid,
  FileText,
  RotateCcw,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

type BrushType = 'ink' | 'neon' | 'rainbow' | 'watercolor' | 'stamp' | 'eraser';

interface StampItem {
  id: string;
  emoji: string;
  name: string;
}

const STAMPS_CATALOG: StampItem[] = [
  { id: 'star', emoji: '⭐', name: 'Estrella' },
  { id: 'heart', emoji: '💖', name: 'Corazón' },
  { id: 'sun', emoji: '☀️', name: 'Sol' },
  { id: 'rocket', emoji: '🚀', name: 'Cohete' },
  { id: 'dino', emoji: '🦖', name: 'Dino' },
  { id: 'rainbow', emoji: '🌈', name: 'Arcoíris' },
  { id: 'crown', emoji: '👑', name: 'Corona' },
  { id: 'paw', emoji: '🐾', name: 'Huella' },
  { id: 'flower', emoji: '🌸', name: 'Flor' },
  { id: 'sparkle', emoji: '✨', name: 'Brillo' }
];

const CANVAS_PAPERS = [
  { id: 'glacial', name: 'Blanco Glacial', bg: '#F8FAFC', icon: FileText, border: 'border-slate-200' },
  { id: 'night', name: 'Pizarra Estelar', bg: '#0F172A', icon: Moon, border: 'border-indigo-900' },
  { id: 'grid', name: 'Cuaderno Guía', bg: '#F1F5F9', icon: Grid, border: 'border-blue-200' },
  { id: 'parchment', name: 'Papiro Mágico', bg: '#FEF3C7', icon: Sun, border: 'border-amber-200' }
];

const ZENTRY_PALETTE = [
  '#EC4899', // Rosa Zentry
  '#8B5CF6', // Violeta Lavanda
  '#3B82F6', // Azul Glacial
  '#10B981', // Verde Menta
  '#F59E0B', // Amarillo Aurora
  '#EF4444', // Rojo Fuego
  '#06B6D4', // Cian Océano
  '#84CC16', // Lima Viva
  '#1E293B', // Tinta Oscura
  '#FFFFFF'  // Blanco Nube
];

interface GalleryItem {
  id: string;
  dataUrl: string;
  date: string;
}

export const ZentryFreeCanvasScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Estados de Herramientas
  const [brushType, setBrushType] = useState<BrushType>('ink');
  const [selectedColor, setSelectedColor] = useState<string>('#8B5CF6');
  const [brushSize, setBrushSize] = useState<number>(14);
  const [selectedStamp, setSelectedStamp] = useState<StampItem>(STAMPS_CATALOG[0]);
  const [currentPaper, setCurrentPaper] = useState(CANVAS_PAPERS[0]);

  // Historial de Estados (Undo / Redo)
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);

  // Galería de Obras
  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    try {
      const saved = localStorage.getItem('zentry_freecanvas_gallery');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);

  // Cámara Phygital para fondo
  const [showCameraBg, setShowCameraBg] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Control de trazado
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const rainbowHueRef = useRef(0);

  // ----------------------------------------------------------------
  // Inicialización del Lienzo (DPR escalado para nitidez Retina)
  // ----------------------------------------------------------------
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = currentPaper.bg;
    ctx.fillRect(0, 0, rect.width, rect.height);

    if (currentPaper.id === 'grid') {
      drawGridPattern(ctx, rect.width, rect.height);
    }

    const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack([initialData]);
    setRedoStack([]);
  }, [currentPaper]);

  const drawGridPattern = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.12)';
    ctx.lineWidth = 1;
    const step = 28;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();
  };

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  // Guardar estado en Undo Stack
  const pushUndoState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack((prev) => [...prev.slice(-20), state]);
    setRedoStack([]);
  };

  const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  // ----------------------------------------------------------------
  // Handlers de Dibujo Interactivo
  // ----------------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPointerPos(e);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    if (brushType === 'stamp') {
      if (navigator.vibrate) navigator.vibrate(8);
      sounds.playTap();

      ctx.save();
      ctx.font = `${brushSize * 2.8}px system-ui, Apple Color Emoji, Segoe UI Emoji`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedStamp.emoji, pos.x, pos.y);
      ctx.restore();

      pushUndoState();
      return;
    }

    isDrawingRef.current = true;
    lastPointRef.current = pos;

    ctx.save();
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);

    if (brushType === 'eraser') {
      ctx.fillStyle = currentPaper.bg;
      ctx.fill();
    } else if (brushType === 'neon') {
      ctx.shadowColor = selectedColor;
      ctx.shadowBlur = 18;
      ctx.fillStyle = selectedColor;
      ctx.fill();
    } else if (brushType === 'rainbow') {
      ctx.fillStyle = `hsl(${rainbowHueRef.current}, 95%, 55%)`;
      ctx.fill();
    } else if (brushType === 'watercolor') {
      ctx.fillStyle = selectedColor;
      ctx.globalAlpha = 0.35;
      ctx.fill();
    } else {
      ctx.fillStyle = selectedColor;
      ctx.fill();
    }
    ctx.restore();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !lastPointRef.current || brushType === 'stamp') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPos = getPointerPos(e);

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (brushType === 'eraser') {
      ctx.strokeStyle = currentPaper.bg;
      ctx.lineWidth = brushSize * 1.8;
    } else if (brushType === 'neon') {
      ctx.strokeStyle = selectedColor;
      ctx.shadowColor = selectedColor;
      ctx.shadowBlur = 16;
      ctx.lineWidth = brushSize;
    } else if (brushType === 'rainbow') {
      rainbowHueRef.current = (rainbowHueRef.current + 5) % 360;
      ctx.strokeStyle = `hsl(${rainbowHueRef.current}, 95%, 55%)`;
      ctx.shadowColor = `hsl(${rainbowHueRef.current}, 95%, 55%)`;
      ctx.shadowBlur = 8;
      ctx.lineWidth = brushSize;
    } else if (brushType === 'watercolor') {
      ctx.strokeStyle = selectedColor;
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = brushSize * 1.4;
    } else {
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
    }

    // Trazo suavizado Bézier
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    const midX = (lastPointRef.current.x + currentPos.x) / 2;
    const midY = (lastPointRef.current.y + currentPos.y) / 2;
    ctx.quadraticCurveTo(lastPointRef.current.x, lastPointRef.current.y, midX, midY);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();
    ctx.restore();

    lastPointRef.current = currentPos;
  };

  const handlePointerUp = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      lastPointRef.current = null;
      pushUndoState();
    }
  };

  const handleUndo = () => {
    if (undoStack.length <= 1) return;
    sounds.playTap();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentTop = undoStack[undoStack.length - 1];
    const nextUndo = undoStack.slice(0, -1);
    const previousState = nextUndo[nextUndo.length - 1];

    setRedoStack((prev) => [...prev, currentTop]);
    setUndoStack(nextUndo);

    ctx.putImageData(previousState, 0, 0);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    sounds.playTap();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nextState = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, nextState]);

    ctx.putImageData(nextState, 0, 0);
  };

  const handleClearAll = () => {
    sounds.playTap();
    initCanvas();
  };

  // ----------------------------------------------------------------
  // Guardar y Exportar
  // ----------------------------------------------------------------
  const handleSaveToGallery = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (navigator.vibrate) navigator.vibrate(15);
    sounds.playSuccess();

    const dataUrl = canvas.toDataURL('image/png', 0.95);
    const newItem: GalleryItem = {
      id: String(Date.now()),
      dataUrl,
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    };

    const updated = [newItem, ...gallery.slice(0, 19)];
    setGallery(updated);
    localStorage.setItem('zentry_freecanvas_gallery', JSON.stringify(updated));

    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    sounds.playTap();
    const link = document.createElement('a');
    link.download = `zentry-arte-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // ----------------------------------------------------------------
  // Cámara Phygital para capturar fondo físico
  // ----------------------------------------------------------------
  const handleStartCameraBg = async () => {
    setShowCameraBg(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (e) {
      console.warn('Camera bg error:', e);
    }
  };

  const handleCaptureBgPhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    sounds.playTap();
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const rect = canvas.getBoundingClientRect();
      ctx.drawImage(video, 0, 0, rect.width, rect.height);
      pushUndoState();
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setShowCameraBg(false);
  };

  return (
    <ZentrySubPageScaffold
      title="Lienzo Libre"
      kicker="ESTUDIO DE DIBUJO Y CREACIÓN"
      onBack={onBack}
      isDark={isDark}
    >
      <div className="w-full h-full flex flex-col justify-between gap-2 relative overflow-hidden">
        {/* ========================================================= */}
        {/* BARRA SUPERIOR: HERRAMIENTAS DE DIBUJO Y SELLOS           */}
        {/* ========================================================= */}
        <div className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-[24px] bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-white/60 dark:border-white/15 shadow-sm">
          {/* Pinceles Principales */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(5);
                setBrushType('ink');
              }}
              className={`p-2.5 rounded-[18px] flex items-center gap-1.5 text-xs font-black transition-all cursor-pointer ${
                brushType === 'ink'
                  ? 'bg-purple-600 text-white shadow-md scale-105'
                  : 'bg-white/60 dark:bg-white/10 text-slate-700 dark:text-white/80'
              }`}
              title="Pluma Tinta"
            >
              <Brush className="w-4 h-4" />
              <span className="hidden sm:inline">Pluma</span>
            </button>

            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(5);
                setBrushType('neon');
              }}
              className={`p-2.5 rounded-[18px] flex items-center gap-1.5 text-xs font-black transition-all cursor-pointer ${
                brushType === 'neon'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md scale-105'
                  : 'bg-white/60 dark:bg-white/10 text-slate-700 dark:text-white/80'
              }`}
              title="Pincel Neón"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Neón</span>
            </button>

            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(5);
                setBrushType('rainbow');
              }}
              className={`p-2.5 rounded-[18px] flex items-center gap-1.5 text-xs font-black transition-all cursor-pointer ${
                brushType === 'rainbow'
                  ? 'bg-gradient-to-r from-pink-500 via-amber-400 to-cyan-400 text-white shadow-md scale-105'
                  : 'bg-white/60 dark:bg-white/10 text-slate-700 dark:text-white/80'
              }`}
              title="Arcoíris"
            >
              <span>🌈</span>
              <span className="hidden sm:inline">Arcoíris</span>
            </button>

            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(5);
                setBrushType('watercolor');
              }}
              className={`p-2.5 rounded-[18px] flex items-center gap-1.5 text-xs font-black transition-all cursor-pointer ${
                brushType === 'watercolor'
                  ? 'bg-blue-500 text-white shadow-md scale-105'
                  : 'bg-white/60 dark:bg-white/10 text-slate-700 dark:text-white/80'
              }`}
              title="Acuarela"
            >
              <span>💧</span>
              <span className="hidden sm:inline">Acuarela</span>
            </button>
          </div>

          {/* Catálogo de Sellos */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[35%] py-0.5">
            {STAMPS_CATALOG.map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(5);
                  setBrushType('stamp');
                  setSelectedStamp(st);
                }}
                className={`p-1.5 rounded-[16px] text-lg transition-transform cursor-pointer flex-shrink-0 ${
                  brushType === 'stamp' && selectedStamp.id === st.id
                    ? 'bg-amber-400 scale-125 border-2 border-white shadow-md'
                    : 'bg-white/50 dark:bg-white/10 hover:bg-white'
                }`}
                title={st.name}
              >
                {st.emoji}
              </button>
            ))}
          </div>

          {/* Acciones Rápidas (Undo, Redo, Borrador, Limpiar) */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(5);
                setBrushType('eraser');
              }}
              className={`p-2 rounded-[16px] border transition-all cursor-pointer ${
                brushType === 'eraser'
                  ? 'bg-pink-500 text-white border-pink-400 shadow-md'
                  : 'bg-white/60 dark:bg-white/10 text-slate-700 dark:text-white/80 border-black/5 dark:border-white/10'
              }`}
              title="Borrador"
            >
              <span>🧽</span>
            </button>

            <button
              onClick={handleUndo}
              disabled={undoStack.length <= 1}
              className="p-2 rounded-[16px] bg-white/60 dark:bg-white/10 text-slate-700 dark:text-white/80 border border-black/5 dark:border-white/10 disabled:opacity-30 cursor-pointer active:scale-95"
              title="Deshacer"
            >
              <Undo2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-2 rounded-[16px] bg-white/60 dark:bg-white/10 text-slate-700 dark:text-white/80 border border-black/5 dark:border-white/10 disabled:opacity-30 cursor-pointer active:scale-95"
              title="Rehacer"
            >
              <Redo2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleClearAll}
              className="p-2 rounded-[16px] bg-white/60 dark:bg-white/10 text-red-500 border border-black/5 dark:border-white/10 cursor-pointer active:scale-95"
              title="Limpiar Lienzo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* LIENZO DE DIBUJO CENTRAL INTERACTIVO                     */}
        {/* ========================================================= */}
        <div
          ref={containerRef}
          className={`flex-1 w-full relative rounded-[32px] overflow-hidden shadow-2xl border-4 ${currentPaper.border} touch-none bg-white`}
        >
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="w-full h-full block cursor-crosshair"
          />

          {/* Visor de Cámara de Fondo (Phygital) */}
          {showCameraBg && (
            <div className="absolute inset-0 z-30 bg-black flex flex-col justify-between p-4 animate-in fade-in">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-[24px]" />
              <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-6">
                <button
                  onClick={handleCaptureBgPhoto}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs shadow-xl flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Camera className="w-5 h-5" />
                  <span>Usar Fondo de Papel</span>
                </button>
                <button
                  onClick={() => {
                    if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
                    setShowCameraBg(false);
                  }}
                  className="px-4 py-3 rounded-full bg-white/20 text-white font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* BARRA INFERIOR: PALETA, GROSORES, FONDOS Y GUARDADO       */}
        {/* ========================================================= */}
        <div className="w-full flex items-center justify-between gap-3 px-2 py-1.5 rounded-[24px] bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-white/60 dark:border-white/15 shadow-sm">
          {/* Paleta de Colores Zentry */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {ZENTRY_PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(5);
                  setSelectedColor(c);
                  if (brushType === 'eraser') setBrushType('ink');
                }}
                style={{ backgroundColor: c }}
                className={`w-8 h-8 md:w-9 md:h-9 rounded-full border-2 transition-all cursor-pointer ${
                  brushType !== 'eraser' && selectedColor === c
                    ? 'scale-125 border-white ring-4 ring-purple-500/40 shadow-xl'
                    : 'border-white/80 shadow-sm'
                }`}
              />
            ))}
          </div>

          {/* Selector de Grosores */}
          <div className="flex items-center gap-1.5 flex-shrink-0 bg-white/50 dark:bg-white/10 p-1 rounded-full">
            {[6, 14, 26, 42].map((size) => (
              <button
                key={size}
                onClick={() => setBrushSize(size)}
                className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-transform ${
                  brushSize === size ? 'bg-purple-600 text-white shadow-md scale-110' : 'text-slate-600 dark:text-white/60'
                }`}
              >
                <div
                  className="rounded-full bg-current"
                  style={{ width: `${Math.min(18, size * 0.4 + 4)}px`, height: `${Math.min(18, size * 0.4 + 4)}px` }}
                />
              </button>
            ))}
          </div>

          {/* Selector de Papel de Fondo */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {CANVAS_PAPERS.map((paper) => {
              const IconComponent = paper.icon;
              return (
                <button
                  key={paper.id}
                  onClick={() => setCurrentPaper(paper)}
                  className={`p-2 rounded-[14px] border transition-all cursor-pointer ${
                    currentPaper.id === paper.id
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                      : 'bg-white/60 dark:bg-white/10 text-slate-700 dark:text-white/80 border-black/5'
                  }`}
                  title={paper.name}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                </button>
              );
            })}

            {/* Escáner de Papel Físico por Cámara */}
            <button
              onClick={handleStartCameraBg}
              className="p-2 rounded-[14px] bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-sm cursor-pointer active:scale-95"
              title="Escanear Hoja con Cámara"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Botones de Acción: Guardar y Galería */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setShowGalleryModal(true)}
              className="p-2.5 rounded-full bg-white/70 dark:bg-white/15 text-slate-800 dark:text-white border border-black/5 font-black text-xs flex items-center gap-1 cursor-pointer active:scale-95"
              title="Mis Obras"
            >
              <ImageIcon className="w-4 h-4 text-pink-500" />
              <span className="hidden md:inline font-bold">({gallery.length})</span>
            </button>

            <button
              onClick={handleDownload}
              className="p-2.5 rounded-full bg-white/70 dark:bg-white/15 text-slate-800 dark:text-white border border-black/5 font-black text-xs cursor-pointer active:scale-95"
              title="Descargar PNG"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={handleSaveToGallery}
              className="px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: GALERÍA DE OBRAS GUARDADAS                         */}
      {/* ========================================================= */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div
            className={`w-full max-w-xl max-h-[85vh] rounded-[32px] p-6 flex flex-col space-y-4 border shadow-2xl ${
              isDark ? 'bg-slate-900 border-white/20 text-white' : 'bg-white border-black/10 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xl">🖼️</span>
                <h3 className="text-base font-black">Mis Creaciones ({gallery.length})</h3>
              </div>
              <button
                onClick={() => setShowGalleryModal(false)}
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {gallery.length === 0 ? (
              <div className="flex-1 py-12 flex flex-col items-center justify-center text-center opacity-60 space-y-2">
                <Sparkles className="w-8 h-8 text-pink-400" />
                <p className="text-xs font-bold">Aún no tienes dibujos guardados.</p>
                <p className="text-[11px]">¡Dibuja tu primera obra y toca el botón Guardar!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto no-scrollbar max-h-96 p-1">
                {gallery.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedGalleryItem(item)}
                    className="rounded-[20px] p-2 border border-black/5 dark:border-white/10 bg-slate-50 dark:bg-white/5 cursor-pointer shadow-md hover:scale-102 transition-transform flex flex-col gap-1.5"
                  >
                    <img
                      src={item.dataUrl}
                      alt="Obra"
                      className="w-full h-28 object-contain rounded-[14px] bg-white"
                    />
                    <span className="text-[10px] opacity-60 text-right font-semibold">{item.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visor de Obra Individual */}
      {selectedGalleryItem && (
        <div
          onClick={() => setSelectedGalleryItem(null)}
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full rounded-[32px] p-5 bg-white dark:bg-slate-900 border border-white/20 space-y-4 shadow-2xl"
          >
            <img
              src={selectedGalleryItem.dataUrl}
              alt="Detalle"
              className="w-full h-64 object-contain rounded-[20px] bg-slate-950/20"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = `zentry-obra-${selectedGalleryItem.id}.png`;
                  link.href = selectedGalleryItem.dataUrl;
                  link.click();
                }}
                className="flex-1 py-3 rounded-full bg-purple-600 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Descargar</span>
              </button>
              <button
                onClick={() => setSelectedGalleryItem(null)}
                className="px-6 py-3 rounded-full bg-slate-200 dark:bg-white/20 text-xs font-black cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </ZentrySubPageScaffold>
  );
};

export default ZentryFreeCanvasScreen;
