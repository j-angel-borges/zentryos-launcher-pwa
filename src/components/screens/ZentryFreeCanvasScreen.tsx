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
  Volume2,
  Wand2,
  Sun,
  Moon,
  Grid,
  FileText,
  RotateCcw,
  X,
  Eraser,
  Shapes,
  Heart,
  Star,
  Flame,
  Gem,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { askZentryAi } from '../../services/aiService';
import { saveArtworkToFirestore } from '../../services/firebase';

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
  { id: 'heart', emoji: '❤️', name: 'Corazón' },
  { id: 'sun', emoji: '☀️', name: 'Sol' },
  { id: 'rocket', emoji: '🚀', name: 'Cohete' },
  { id: 'rainbow', emoji: '🌈', name: 'Arcoíris' },
  { id: 'crown', emoji: '👑', name: 'Corona' },
  { id: 'flower', emoji: '🌸', name: 'Flor' },
  { id: 'paw', emoji: '🐾', name: 'Huellita' }
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
  reimaginedTitle?: string;
  reimaginedStory?: string;
  date: string;
}

interface ReimaginedAiResult {
  detectedTitle: string;
  praiseSpeech: string;
  visualDescription: string;
  story: string;
  magicDetail: string;
}

export const ZentryFreeCanvasScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Estados de Herramientas
  const [brushType, setBrushType] = useState<BrushType>('ink');
  const [selectedColor, setSelectedColor] = useState<string>('#8B5CF6');
  const [brushSize, setBrushSize] = useState<number>(14);
  const [currentPaper, setCurrentPaper] = useState(CANVAS_PAPERS[0]);

  // Popover de Sellos & Formas
  const [showStampsMenu, setShowStampsMenu] = useState(false);
  const [selectedStamp, setSelectedStamp] = useState<StampItem>(STAMPS_CATALOG[0]);

  // Historial de Estados (Undo / Redo)
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);

  // Inteligencia Artificial (Reimaginación Mágica)
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiReimaginedResult, setAiReimaginedResult] = useState<ReimaginedAiResult | null>(null);
  const [capturedAiDrawingUrl, setCapturedAiDrawingUrl] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

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

  // Control de trazado
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const rainbowHueRef = useRef(0);

  // ----------------------------------------------------------------
  // Audio Speech (TTS)
  // ----------------------------------------------------------------
  const speak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.94;
      utterance.pitch = 1.2;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopVoice = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

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
  // BOTÓN DE INTELIGENCIA ARTIFICIAL (DAR VIDA AL DIBUJO) ✨/💎
  // ----------------------------------------------------------------
  const handleAiReimagineDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (navigator.vibrate) navigator.vibrate(12);
    sounds.playTap();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedAiDrawingUrl(dataUrl);
    setIsAiThinking(true);
    setAiReimaginedResult(null);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 }
    });

    try {
      const raw = await askZentryAi(
        'canvas_reimagine',
        'Analiza este dibujo infantil de trazos libres. Genera la versión mágica viva para niños de 2 a 5 años.',
        dataUrl
      );

      const parsed: ReimaginedAiResult = JSON.parse(raw.trim().replace(/^```json/, '').replace(/```$/, ''));
      setAiReimaginedResult(parsed);
      sounds.playSuccess();

      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.55 }
      });

      speak(`${parsed.praiseSpeech} ${parsed.story}`);
    } catch (error) {
      console.warn('Fallback AI Canvas Reimagine:', error);
      const fallback: ReimaginedAiResult = {
        detectedTitle: 'Aventura Mágica de Luz',
        praiseSpeech: '¡Guau, qué obra de arte tan hermosa! Tus trazos tienen colores llenos de vida y magia.',
        visualDescription: 'Una hermosa criatura de cristal flotando sobre un arcoíris brillante con pequeñas estrellas doradas alrededor.',
        story: '¡Tu dibujo ha cobrado vida y ahora ilumina el cielo con una sonrisa gigante!',
        magicDetail: '¡Tiene destellos mágicos que brillan en la oscuridad!'
      };
      setAiReimaginedResult(fallback);
      sounds.playSuccess();
      speak(`${fallback.praiseSpeech} ${fallback.story}`);
    } finally {
      setIsAiThinking(false);
    }
  };

  // ----------------------------------------------------------------
  // Guardar y Exportar
  // ----------------------------------------------------------------
  const handleSaveToGallery = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (navigator.vibrate) navigator.vibrate(15);
    sounds.playSuccess();

    const dataUrl = canvas.toDataURL('image/png', 0.95);
    const newItem: GalleryItem = {
      id: String(Date.now()),
      dataUrl,
      reimaginedTitle: aiReimaginedResult?.detectedTitle,
      reimaginedStory: aiReimaginedResult?.story,
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    };

    const updated = [newItem, ...gallery.slice(0, 19)];
    setGallery(updated);
    localStorage.setItem('zentry_freecanvas_gallery', JSON.stringify(updated));

    // Guardado en Firestore
    await saveArtworkToFirestore({
      id: newItem.id,
      title: newItem.reimaginedTitle || 'Obra Libre',
      originalDrawingUrl: dataUrl,
      storyPrompt: newItem.reimaginedStory
    });

    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 }
    });

    speak('¡Tu dibujo se guardó en tu Galería de Arte!');
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

  useEffect(() => {
    return () => {
      stopVoice();
    };
  }, []);

  return (
    <ZentrySubPageScaffold
      title="Lienzo"
      kicker="ESTUDIO DE DIBUJO Y CREACIÓN"
      onBack={onBack}
      isDark={isDark}
    >
      <div className="w-full h-full flex flex-col justify-between gap-2 relative overflow-hidden">
        {/* ========================================================= */}
        {/* BARRA SUPERIOR: PINCELES, FORMAS Y GOMA DE BORRAR         */}
        {/* ========================================================= */}
        <div className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-[24px] bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-white/60 dark:border-white/15 shadow-sm">
          {/* Pinceles Principales */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(5);
                setBrushType('ink');
                setShowStampsMenu(false);
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
                setShowStampsMenu(false);
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
                setShowStampsMenu(false);
              }}
              className={`p-2.5 rounded-[18px] flex items-center gap-1.5 text-xs font-black transition-all cursor-pointer ${
                brushType === 'rainbow'
                  ? 'bg-gradient-to-r from-pink-500 via-amber-400 to-cyan-400 text-white shadow-md scale-105'
                  : 'bg-white/60 dark:bg-white/10 text-slate-700 dark:text-white/80'
              }`}
              title="Pincel Arcoíris"
            >
              <span>🌈</span>
              <span className="hidden sm:inline">Arcoíris</span>
            </button>

            {/* UN SOLO BOTÓN DESPLEGABLE PARA FORMAS Y EMOJIS */}
            <div className="relative">
              <button
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(5);
                  setShowStampsMenu((prev) => !prev);
                  setBrushType('stamp');
                }}
                className={`p-2.5 rounded-[18px] flex items-center gap-1.5 text-xs font-black transition-all cursor-pointer ${
                  brushType === 'stamp'
                    ? 'bg-amber-500 text-white shadow-md scale-105'
                    : 'bg-white/60 dark:bg-white/10 text-slate-700 dark:text-white/80'
                }`}
                title="Formas y Stickers"
              >
                <span className="text-base">{selectedStamp.emoji}</span>
                <span className="hidden sm:inline">Formas</span>
              </button>

              {/* Menú Desplegable con 8 Formas y Emojis */}
              {showStampsMenu && (
                <div className="absolute top-12 left-0 z-50 p-2 rounded-[24px] bg-white dark:bg-slate-900 border border-white/60 dark:border-white/20 shadow-2xl flex items-center gap-1.5 animate-in zoom-in-95">
                  {STAMPS_CATALOG.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        if (navigator.vibrate) navigator.vibrate(5);
                        setSelectedStamp(st);
                        setBrushType('stamp');
                        setShowStampsMenu(false);
                      }}
                      className={`p-2 rounded-[16px] text-xl transition-transform cursor-pointer hover:scale-120 ${
                        selectedStamp.id === st.id ? 'bg-amber-400 text-white scale-110 shadow-md' : 'bg-slate-100 dark:bg-white/10'
                      }`}
                      title={st.name}
                    >
                      {st.emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* GOMA DE BORRAR AUTÉNTICA (Goma blanca/rosa, no esponja) */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(5);
                setBrushType('eraser');
                setShowStampsMenu(false);
              }}
              className={`p-2.5 rounded-[18px] border transition-all cursor-pointer flex items-center gap-1.5 ${
                brushType === 'eraser'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white border-pink-400 shadow-md scale-105'
                  : 'bg-white/60 dark:bg-white/10 text-slate-700 dark:text-white/80 border-black/5 dark:border-white/10'
              }`}
              title="Goma de Borrar"
            >
              <Eraser className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-black">Goma</span>
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
              title="Limpiar Todo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* LIENZO DE DIBUJO CENTRAL                                  */}
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
        </div>

        {/* ========================================================= */}
        {/* BARRA INFERIOR: PALETA, GROSOR, BOTÓN IA ✨ Y GUARDADO    */}
        {/* ========================================================= */}
        <div className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-[24px] bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-white/60 dark:border-white/15 shadow-sm">
          {/* Paleta de Colores */}
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
                className={`w-7 h-7 md:w-8 md:h-8 rounded-full border-2 transition-all cursor-pointer ${
                  brushType !== 'eraser' && selectedColor === c
                    ? 'scale-125 border-white ring-4 ring-purple-500/40 shadow-xl'
                    : 'border-white/80 shadow-sm'
                }`}
              />
            ))}
          </div>

          {/* Selector de Grosor */}
          <div className="flex items-center gap-1 flex-shrink-0 bg-white/50 dark:bg-white/10 p-1 rounded-full">
            {[6, 14, 26, 42].map((size) => (
              <button
                key={size}
                onClick={() => setBrushSize(size)}
                className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-transform ${
                  brushSize === size ? 'bg-purple-600 text-white shadow-md scale-110' : 'text-slate-600 dark:text-white/60'
                }`}
              >
                <div
                  className="rounded-full bg-current"
                  style={{ width: `${Math.min(16, size * 0.35 + 4)}px`, height: `${Math.min(16, size * 0.35 + 4)}px` }}
                />
              </button>
            ))}
          </div>

          {/* Botones de Acción (Mis Obras, BOTÓN IA ✨ al lado de GUARDAR) */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setShowGalleryModal(true)}
              className="p-2.5 rounded-full bg-white/70 dark:bg-white/15 text-slate-800 dark:text-white border border-black/5 font-black text-xs flex items-center gap-1 cursor-pointer active:scale-95"
              title="Mis Obras"
            >
              <ImageIcon className="w-4 h-4 text-pink-500" />
              <span className="hidden md:inline font-bold">({gallery.length})</span>
            </button>

            {/* BOTÓN DE INTELIGENCIA ARTIFICIAL ✨/💎 (Justo al lado de Guardar) */}
            <button
              onClick={handleAiReimagineDrawing}
              className="px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 text-white font-black text-xs shadow-lg shadow-purple-500/30 flex items-center gap-1.5 cursor-pointer active:scale-95 animate-pulse"
              title="Dar Vida Mágica al Dibujo"
            >
              <Gem className="w-4 h-4 text-yellow-300" />
              <span>Magia IA</span>
            </button>

            {/* BOTÓN CIRCULAR / REDONDO DE GUARDAR */}
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
      {/* MODAL: ESTUDIO DE REIMAGINACIÓN MÁGICA CON IA (GCP)       */}
      {/* ========================================================= */}
      {(isAiThinking || aiReimaginedResult) && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div
            className={`w-full max-w-lg rounded-[36px] p-6 space-y-4 border shadow-2xl flex flex-col items-center text-center ${
              isDark ? 'bg-slate-900 border-purple-500/30 text-white' : 'bg-white border-purple-200 text-slate-900'
            }`}
          >
            {isAiThinking ? (
              <div className="py-12 space-y-4 flex flex-col items-center animate-pulse">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400 flex items-center justify-center text-white text-3xl shadow-2xl animate-spin">
                  <Gem className="w-10 h-10" />
                </div>
                <h3 className="text-base font-black">¡Despertando la magia de tus trazos! 🪄</h3>
                <p className="text-xs text-purple-500 dark:text-purple-300">
                  Zentry está analizando tus colores para darle vida en alta definición...
                </p>
              </div>
            ) : (
              aiReimaginedResult && (
                <>
                  <div className="flex items-center justify-between w-full pb-2 border-b border-black/10 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <h3 className="text-sm font-black">{aiReimaginedResult.detectedTitle}</h3>
                    </div>
                    <button
                      onClick={() => setAiReimaginedResult(null)}
                      className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Imagen del Dibujo Original con Aura Mágica */}
                  <div className="w-full flex items-center justify-center gap-3">
                    {capturedAiDrawingUrl && (
                      <div className="relative w-44 h-44 rounded-[28px] overflow-hidden border-4 border-purple-400 shadow-2xl bg-white">
                        <img src={capturedAiDrawingUrl} alt="Dibujo Original" className="w-full h-full object-contain p-2" />
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-transparent to-transparent pointer-events-none" />
                        <span className="absolute bottom-2 left-2 right-2 text-[10px] font-black text-white bg-black/60 backdrop-blur-md rounded-full py-0.5 text-center">
                          Tu Creación
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Narración e Historia */}
                  <div className="p-4 rounded-[24px] bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 space-y-2 text-left w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-300">
                        ✨ Historia Mágica
                      </span>
                      <button
                        onClick={() => speak(`${aiReimaginedResult.praiseSpeech} ${aiReimaginedResult.story}`)}
                        className="text-purple-600 dark:text-purple-300 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-bounce text-pink-400' : ''}`} />
                        <span>Escuchar</span>
                      </button>
                    </div>

                    <p className="text-xs font-bold leading-relaxed text-slate-800 dark:text-purple-100">
                      {aiReimaginedResult.story}
                    </p>

                    <p className="text-[11px] text-slate-600 dark:text-purple-200/80 italic">
                      "{aiReimaginedResult.visualDescription}"
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 w-full pt-1">
                    <button
                      onClick={() => {
                        handleSaveToGallery();
                        setAiReimaginedResult(null);
                      }}
                      className="flex-1 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Guardar Obra Mágica</span>
                    </button>

                    <button
                      onClick={() => setAiReimaginedResult(null)}
                      className="px-5 py-3 rounded-full bg-slate-200 dark:bg-white/15 text-xs font-black cursor-pointer"
                    >
                      Volver a Pintar
                    </button>
                  </div>
                </>
              )
            )}
          </div>
        </div>
      )}

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
                <p className="text-[11px]">¡Dibuja tu primera obra y toca el botón Guardar o Magia IA!</p>
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
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold truncate max-w-[70%]">{item.reimaginedTitle || 'Dibujo'}</span>
                      <span className="opacity-60 font-semibold">{item.date}</span>
                    </div>
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
            {selectedGalleryItem.reimaginedStory && (
              <p className="text-xs text-slate-700 dark:text-purple-200 leading-relaxed font-bold">
                {selectedGalleryItem.reimaginedStory}
              </p>
            )}
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
