import React, { useState, useRef, useEffect } from 'react';
import {
  Undo2,
  Trash2,
  Volume2,
  Star,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

const STAMPS = [
  '⭐', '❤️', '☀️', '🌸', '🦖', '🚗', '🚀', '🐾', '🍦', '🍭', '👑', '🌈'
];

const BACKGROUNDS = [
  { id: 'white', bg: '#FFFFFF' },
  { id: 'night', bg: '#0F172A' },
  { id: 'jungle', bg: '#064E3B' },
  { id: 'sky', bg: '#0284C7' },
  { id: 'candy', bg: '#BE185D' }
];

export const ZentryFreeCanvasScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedColor, setSelectedColor] = useState('#EC4899');
  const [currentBackground, setCurrentBackground] = useState(BACKGROUNDS[0]);
  const [toolMode, setToolMode] = useState<'brush' | 'rainbow' | 'stamp' | 'eraser'>('brush');
  const [selectedStamp, setSelectedStamp] = useState(STAMPS[0]);
  const [brushSize, setBrushSize] = useState(20);
  const [history, setHistory] = useState<ImageData[]>([]);

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
    const pos = getCanvasPos(e);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (toolMode === 'stamp') {
      if (navigator.vibrate) navigator.vibrate(8);
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
    if (navigator.vibrate) navigator.vibrate(15);
    sounds.playSuccess();
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
  };

  return (
    <ZentrySubPageScaffold title="" kicker="" onBack={onBack} isDark={isDark}>
      <div className="w-full h-full flex flex-col justify-between overflow-hidden gap-2">
        {/* Barra Superior: Modos y Sellos */}
        <div className="flex items-center justify-between gap-2 px-1 bg-white/30 backdrop-blur-md rounded-[24px] p-1.5 border border-white/40 shadow-sm">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(5);
                setToolMode('brush');
              }}
              className={`p-2.5 rounded-[20px] text-xl border-2 transition-transform cursor-pointer ${
                toolMode === 'brush' ? 'bg-pink-500 text-white scale-110 shadow-lg' : 'bg-white/80'
              }`}
            >
              🖌️
            </button>

            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(5);
                setToolMode('rainbow');
              }}
              className={`p-2.5 rounded-[20px] text-xl border-2 transition-transform cursor-pointer ${
                toolMode === 'rainbow' ? 'bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400 text-white scale-110 shadow-lg' : 'bg-white/80'
              }`}
            >
              🌈
            </button>
          </div>

          {/* Sellos */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[45%]">
            {STAMPS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(5);
                  setToolMode('stamp');
                  setSelectedStamp(s);
                }}
                className={`p-2 rounded-[18px] text-xl transition-transform cursor-pointer flex-shrink-0 ${
                  toolMode === 'stamp' && selectedStamp === s ? 'bg-amber-400 scale-125 border-2 border-white shadow-md' : 'bg-white/60'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Borrador / Deshacer / Limpiar */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(5);
                setToolMode('eraser');
              }}
              className={`p-2.5 rounded-[20px] text-xl transition-transform cursor-pointer ${
                toolMode === 'eraser' ? 'bg-purple-600 text-white scale-110 shadow-lg' : 'bg-white/80'
              }`}
            >
              🧽
            </button>

            <button onClick={handleUndo} className="p-2.5 rounded-[20px] text-xl bg-white/80 active:scale-90 cursor-pointer">
              ↩️
            </button>

            <button onClick={handleClear} className="p-2.5 rounded-[20px] text-xl bg-white/80 active:scale-90 cursor-pointer">
              🗑️
            </button>
          </div>
        </div>

        {/* Lienzo */}
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

        {/* Barra Inferior: Colores & Fondos */}
        <div className="flex items-center justify-between gap-2 px-1 py-1">
          {/* Colores */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(5);
                  setSelectedColor(c);
                  if (toolMode === 'eraser') setToolMode('brush');
                }}
                style={{ backgroundColor: c }}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-3 transition-transform cursor-pointer ${
                  toolMode === 'brush' && selectedColor === c ? 'scale-125 border-white ring-4 ring-pink-400 shadow-xl' : 'border-white/80'
                }`}
              />
            ))}
          </div>

          {/* Botón Guardar ⭐💾 */}
          <button
            onClick={handleSave}
            className="w-16 h-16 md:w-18 md:h-18 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-600 text-white flex items-center justify-center text-3xl shadow-2xl border-3 border-white active:scale-90 cursor-pointer flex-shrink-0"
          >
            💾
          </button>
        </div>
      </div>
    </ZentrySubPageScaffold>
  );
};

export default ZentryFreeCanvasScreen;
