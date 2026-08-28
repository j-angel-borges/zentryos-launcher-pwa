import React, { useState, useRef, useEffect } from 'react';
import {
  Undo2,
  Trash2,
  Volume2,
  Star,
  Sparkles,
  Eraser,
  Download,
  X,
  Heart,
  Smile,
  Zap,
  RefreshCw
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

const SHAPES_AND_EMOJIS = [
  { id: 'star', icon: '⭐', label: 'Estrella' },
  { id: 'heart', icon: '❤️', label: 'Corazón' },
  { id: 'flower', icon: '🌸', label: 'Flor' },
  { id: 'sun', icon: '☀️', label: 'Sol' },
  { id: 'rocket', icon: '🚀', label: 'Cohete' },
  { id: 'crown', icon: '👑', label: 'Corona' },
  { id: 'dino', icon: '🦖', label: 'Dino' },
  { id: 'rainbow', icon: '🌈', label: 'Arcoíris' }
];

const BACKGROUNDS = [
  { id: 'white', bg: '#FFFFFF' },
  { id: 'night', bg: '#0F172A' },
  { id: 'jungle', bg: '#064E3B' },
  { id: 'sky', bg: '#0284C7' },
  { id: 'candy', bg: '#BE185D' }
];

interface AiLifeResult {
  title: string;
  detectedSubject: string;
  enhancedImageUrl: string;
  speechFeedback: string;
}

export const ZentryFreeCanvasScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedColor, setSelectedColor] = useState('#EC4899');
  const [currentBackground, setCurrentBackground] = useState(BACKGROUNDS[0]);
  const [toolMode, setToolMode] = useState<'brush' | 'rainbow' | 'stamp' | 'eraser'>('brush');
  const [selectedStamp, setSelectedStamp] = useState(SHAPES_AND_EMOJIS[0].icon);
  const [isStampMenuOpen, setIsStampMenuOpen] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [history, setHistory] = useState<ImageData[]>([]);

  // AI Magic Life State
  const [isTransformingAi, setIsTransformingAi] = useState(false);
  const [aiResult, setAiResult] = useState<AiLifeResult | null>(null);

  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const rainbowHueRef = useRef(0);

  const colors = [
    '#EC4899', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#FFFFFF', '#1E293B'
  ];

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = currentBackground.bg;
        ctx.fillRect(0, 0, rect.width, rect.height);

        const initial = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([initial]);
      }
    }
  }, [currentBackground]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory((prev) => [...prev.slice(-12), state]);
      }
    }
  };

  const getCanvasPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsStampMenuOpen(false);
    const pos = getCanvasPos(e);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (toolMode === 'stamp') {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(8);
      sounds.playTap();
      ctx.font = `${brushSize * 3}px system-ui, Apple Color Emoji, Segoe UI Emoji`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedStamp, pos.x, pos.y);
      saveState();
      return;
    }

    isDrawingRef.current = true;
    lastPosRef.current = pos;

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, (toolMode === 'eraser' ? brushSize * 1.8 : brushSize) / 2, 0, Math.PI * 2);
    ctx.fillStyle = toolMode === 'eraser' ? currentBackground.bg : toolMode === 'rainbow' ? `hsl(${rainbowHueRef.current}, 95%, 55%)` : selectedColor;
    ctx.fill();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !lastPosRef.current || toolMode === 'stamp') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPos = getCanvasPos(e);

    if (toolMode === 'rainbow') {
      rainbowHueRef.current = (rainbowHueRef.current + 8) % 360;
      ctx.strokeStyle = `hsl(${rainbowHueRef.current}, 95%, 55%)`;
    } else {
      ctx.strokeStyle = toolMode === 'eraser' ? currentBackground.bg : selectedColor;
    }

    ctx.lineWidth = toolMode === 'eraser' ? brushSize * 1.8 : brushSize;
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();

    lastPosRef.current = currentPos;
  };

  const handlePointerUp = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      lastPosRef.current = null;
      saveState();
    }
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    sounds.playTap();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const next = history.slice(0, -1);
        const prev = next[next.length - 1];
        ctx.putImageData(prev, 0, 0);
        setHistory(next);
      }
    }
  };

  const handleClear = () => {
    sounds.playTap();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        ctx.fillStyle = currentBackground.bg;
        ctx.fillRect(0, 0, rect.width, rect.height);
        saveState();
      }
    }
  };

  const handleSave = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(15);
    sounds.playSuccess();
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
  };

  // 🤖 DAR VIDA CON INTELIGENCIA ARTIFICIAL ZENTRY
  const handleAiGiveLife = async () => {
    if (!canvasRef.current || isTransformingAi) return;
    sounds.playTap();
    setIsTransformingAi(true);

    try {
      const canvas = canvasRef.current;
      const base64Img = canvas.toDataURL('image/png');

      const response = await askZentryAi(
        'free_canvas_life',
        'Analiza este dibujo infantil y transforma este trazo en una ilustración mágica 3D Pixar de alta resolución llena de vida y color.',
        base64Img
      );

      let parsed: any = {};
      try {
        parsed = JSON.parse(response.trim().replace(/^```json/, '').replace(/```$/, ''));
      } catch {
        parsed = {
          title: 'Tu Dibujo Mágico',
          detectedSubject: 'Creación mágica',
          enhancedPrompt: '3D cute Pixar style character, magical glowing wonderland, colorful, bright, cheerful',
          speechFeedback: '¡Mira cómo brilla y cobra vida tu dibujo! ¡Es hermoso!'
        };
      }

      const encodedPrompt = encodeURIComponent(`${parsed.enhancedPrompt}, 3D pixar style, masterpiece, cute, vibrant, 8k resolution`);
      const seed = Math.floor(Math.random() * 1000000);
      const generatedUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=768&seed=${seed}&nologo=true`;

      // Preload image
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
        detectedSubject: parsed.detectedSubject || 'Obra Mágica',
        enhancedImageUrl: generatedUrl,
        speechFeedback: parsed.speechFeedback || '¡Tu dibujo ha cobrado vida mágica!'
      };

      setAiResult(resultData);
      voiceService.speakFeedback(resultData.speechFeedback);
    } catch (err) {
      console.warn('Free canvas AI life error:', err);
      const fallbackResult: AiLifeResult = {
        title: 'Tu Dibujo Mágico',
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

  return (
    <ZentrySubPageScaffold title="" kicker="" onBack={onBack} isDark={isDark}>
      <div className="w-full h-full flex flex-col justify-between overflow-hidden gap-2 select-none relative">
        {/* Barra Superior: Herramientas, Menú Unificado de Formas y Goma */}
        <div className="flex items-center justify-between gap-2 px-2 bg-white/20 backdrop-blur-xl rounded-[28px] p-2 border border-white/30 shadow-lg">
          {/* Pinceles: Normal y Arcoíris */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(5);
                setToolMode('brush');
                setIsStampMenuOpen(false);
              }}
              className={`p-2.5 rounded-[20px] text-2xl border-2 transition-transform cursor-pointer zentry-spring-press ${
                toolMode === 'brush' ? 'bg-pink-500 text-white scale-110 shadow-lg border-white' : 'bg-white/80 border-transparent'
              }`}
              title="Pincel"
            >
              🖌️
            </button>

            <button
              onClick={() => {
                if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(5);
                setToolMode('rainbow');
                setIsStampMenuOpen(false);
              }}
              className={`p-2.5 rounded-[20px] text-2xl border-2 transition-transform cursor-pointer zentry-spring-press ${
                toolMode === 'rainbow' ? 'bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400 text-white scale-110 shadow-lg border-white' : 'bg-white/80 border-transparent'
              }`}
              title="Pincel Arcoíris"
            >
              🌈
            </button>
          </div>

          {/* Botón Unificado de Formas & Emojis */}
          <div className="relative">
            <button
              onClick={() => {
                sounds.playTap();
                setIsStampMenuOpen((prev) => !prev);
              }}
              className={`p-2.5 rounded-[20px] text-2xl border-2 flex items-center justify-center transition-all cursor-pointer zentry-spring-press ${
                toolMode === 'stamp' ? 'bg-amber-400 text-white scale-110 shadow-lg border-white ring-2 ring-amber-300' : 'bg-white/80 border-transparent'
              }`}
              title="Formas y Emojis"
            >
              <span>{selectedStamp}</span>
            </button>

            {/* Menú Desplegable Táctil de Formas */}
            {isStampMenuOpen && (
              <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-[#120E24]/95 border-2 border-purple-400/60 p-2.5 rounded-[26px] shadow-2xl backdrop-blur-2xl grid grid-cols-4 gap-2 z-50 animate-spring-unfold min-w-[190px]">
                {SHAPES_AND_EMOJIS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(5);
                      setSelectedStamp(s.icon);
                      setToolMode('stamp');
                      setIsStampMenuOpen(false);
                    }}
                    className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-2xl flex items-center justify-center transition-transform hover:scale-115 active:scale-90 cursor-pointer"
                  >
                    {s.icon}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Goma de Borrar, Deshacer y Limpiar */}
          <div className="flex items-center gap-1.5">
            {/* Goma de Borrar (Eraser) */}
            <button
              onClick={() => {
                if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(5);
                setToolMode('eraser');
                setIsStampMenuOpen(false);
              }}
              className={`p-2.5 rounded-[20px] border-2 transition-transform cursor-pointer zentry-spring-press ${
                toolMode === 'eraser' ? 'bg-purple-600 text-white scale-110 shadow-lg border-white' : 'bg-white/80 border-transparent text-slate-800'
              }`}
              title="Goma de Borrar"
            >
              <Eraser className="w-6 h-6" />
            </button>

            <button onClick={handleUndo} className="p-2.5 rounded-[20px] text-xl bg-white/80 active:scale-90 cursor-pointer zentry-spring-press" title="Deshacer">
              ↩️
            </button>

            <button onClick={handleClear} className="p-2.5 rounded-[20px] text-xl bg-white/80 active:scale-90 cursor-pointer zentry-spring-press" title="Limpiar">
              🗑️
            </button>
          </div>
        </div>

        {/* Lienzo Principal */}
        <div className="flex-1 w-full relative rounded-[32px] overflow-hidden shadow-2xl border-4 border-white/80 touch-none">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="w-full h-full block cursor-pointer"
          />
        </div>

        {/* Barra Inferior: Colores, Botón Rombo IA y Guardar */}
        <div className="flex items-center justify-between gap-3 px-2 py-1 bg-white/20 backdrop-blur-xl rounded-[28px] p-2 border border-white/30 shadow-lg">
          {/* Paleta de Colores */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(5);
                  setSelectedColor(c);
                  if (toolMode === 'eraser') setToolMode('brush');
                }}
                style={{ backgroundColor: c }}
                className={`w-9 h-9 md:w-11 md:h-11 rounded-full border-2 transition-transform cursor-pointer ${
                  toolMode === 'brush' && selectedColor === c ? 'scale-120 border-white ring-4 ring-pink-400 shadow-xl' : 'border-white/80'
                }`}
              />
            ))}
          </div>

          {/* Botonera de Acción: Rombo IA Zentry + Guardar */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* BOTÓN INTELIGENCIA ARTIFICIAL (ROMBO ZENTRY) */}
            <button
              onClick={handleAiGiveLife}
              disabled={isTransformingAi}
              className="w-14 h-14 md:w-16 md:h-16 rounded-[22px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-xl border-3 border-white active:scale-90 cursor-pointer zentry-spring-press relative group disabled:opacity-50"
              title="¡Dar Vida Mágica con Zentry AI!"
            >
              {isTransformingAi ? (
                <RefreshCw className="w-7 h-7 animate-spin text-amber-300" />
              ) : (
                <>
                  <ZentryLogoIcon className="w-7 h-7 group-hover:scale-115 transition-transform" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-300 absolute -top-1 -right-1 animate-ping" />
                </>
              )}
            </button>

            {/* BOTÓN GUARDAR */}
            <button
              onClick={handleSave}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-600 text-white flex items-center justify-center text-2xl shadow-xl border-3 border-white active:scale-90 cursor-pointer zentry-spring-press"
              title="Guardar Dibujo"
            >
              💾
            </button>
          </div>
        </div>

        {/* MODAL: DIBUJO CON VIDA MÁGICA AI */}
        {aiResult && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in select-none"
            onClick={() => setAiResult(null)}
          >
            <div
              className="relative max-w-sm w-full rounded-[36px] p-4 bg-[#120E24]/95 border border-purple-400/60 shadow-2xl flex flex-col items-center gap-3 animate-spring-in text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between w-full border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <ZentryLogoIcon className="w-5 h-5 text-amber-300" />
                  <span className="text-sm font-black text-white">{aiResult.title}</span>
                </div>
                <button
                  onClick={() => setAiResult(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Enhanced 3D Pixar Image */}
              <div className="relative w-full aspect-square rounded-[26px] overflow-hidden border-2 border-purple-400/40 shadow-inner bg-black">
                <img
                  src={aiResult.enhancedImageUrl}
                  alt={aiResult.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Voice Feedback Text */}
              <p className="text-xs font-bold text-white leading-relaxed px-1">
                {aiResult.speechFeedback}
              </p>

              {/* Actions */}
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
