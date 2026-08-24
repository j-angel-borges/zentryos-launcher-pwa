import React, { useState, useRef, useEffect } from 'react';
import {
  Palette,
  Camera,
  Sparkles,
  Volume2,
  Undo2,
  Trash2,
  ArrowLeft,
  RefreshCw,
  Wand2,
  Star,
  Heart,
  Sun,
  Smile,
  Brush,
  Eraser,
  Stamp,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { askZentryAi } from '../../services/aiService';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

interface SavedDrawing {
  id: string;
  thumbnail: string;
  emoji: string;
  story: string;
}

const STAMPS = [
  { id: 'star', emoji: '⭐', label: 'Estrella' },
  { id: 'heart', emoji: '❤️', label: 'Corazón' },
  { id: 'sun', emoji: '☀️', label: 'Sol' },
  { id: 'dino', emoji: '🦖', label: 'Dino' },
  { id: 'rocket', emoji: '🚀', label: 'Cohete' },
  { id: 'rainbow', emoji: '🌈', label: 'Arcoíris' },
  { id: 'crown', emoji: '👑', label: 'Corona' },
  { id: 'paw', emoji: '🐾', label: 'Huellita' }
];

const MAGIC_CHOICES = [
  { id: 'rocket', emoji: '🚀', color: 'from-blue-500 to-indigo-600', story: '¡Tu personaje viaja en cohete a las estrellas y juega con la luna!' },
  { id: 'lightning', emoji: '⚡', color: 'from-amber-400 to-yellow-500', story: '¡Tu personaje tiene superpoderes mágicos y lanza chispitas de luz!' },
  { id: 'cookie', emoji: '🍪', color: 'from-amber-600 to-orange-700', story: '¡Tu personaje come ricas galletas y comparte con todos sus amigos!' },
  { id: 'rainbow', emoji: '🌈', color: 'from-pink-500 via-purple-500 to-cyan-500', story: '¡Tu personaje pinta un arcoíris en el cielo y salta sobre las nubes!' }
];

export const ZentryNeuroArtScreen: React.FC<Props> = ({ onBack, isDark }) => {
  // Estados de pantalla: 'welcome' | 'canvas' | 'camera' | 'magic'
  const [viewState, setViewState] = useState<'welcome' | 'canvas' | 'camera' | 'magic'>('welcome');

  // Herramientas del Lienzo
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [toolMode, setToolMode] = useState<'brush' | 'stamp' | 'eraser'>('brush');
  const [selectedStamp, setSelectedStamp] = useState(STAMPS[0]);
  const [selectedColor, setSelectedColor] = useState('#EC4899');
  const [brushSize, setBrushSize] = useState(18);
  const [isRainbowBrush, setIsRainbowBrush] = useState(false);
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const rainbowHueRef = useRef(0);

  // Captura & IA
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [spokenPrompt, setSpokenPrompt] = useState<string>('¡Qué dibujo tan lindo! ¿Qué aventura quiere vivir tu amigo?');
  const [selectedChoice, setSelectedChoice] = useState<typeof MAGIC_CHOICES[0] | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Cámara
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Historial Guardado
  const [gallery, setGallery] = useState<SavedDrawing[]>(() => {
    try {
      const saved = localStorage.getItem('zentry_toddler_art');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const colors = [
    '#EC4899', // Rosa
    '#8B5CF6', // Violeta
    '#3B82F6', // Azul
    '#10B981', // Verde
    '#F59E0B', // Amarillo
    '#EF4444', // Rojo
    '#1E293B'  // Negro
  ];

  // ----------------------------------------------------
  // Síntesis de Voz Amigable para Niños
  // ----------------------------------------------------
  const speak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.92;
      utterance.pitch = 1.25;
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

  // ----------------------------------------------------
  // Inicialización del Lienzo
  // ----------------------------------------------------
  useEffect(() => {
    if (viewState === 'canvas' && canvasRef.current) {
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
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, rect.width, rect.height);

        const initial = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setStrokeHistory([initial]);
      }
      speak('¡Toca los colores y dibuja con tu dedito!');
    }
  }, [viewState]);

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setStrokeHistory((prev) => [...prev.slice(-12), state]);
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
      // Estampar figura
      if (navigator.vibrate) navigator.vibrate(8);
      sounds.playTap();
      ctx.font = `${brushSize * 2.8}px system-ui, Apple Color Emoji, Segoe UI Emoji`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedStamp.emoji, pos.x, pos.y);
      saveHistoryState();
      return;
    }

    // Modo dibujo
    isDrawingRef.current = true;
    lastPosRef.current = pos;

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, (toolMode === 'eraser' ? brushSize * 1.8 : brushSize) / 2, 0, Math.PI * 2);
    ctx.fillStyle = toolMode === 'eraser' ? '#FFFFFF' : isRainbowBrush ? `hsl(${rainbowHueRef.current}, 90%, 55%)` : selectedColor;
    ctx.fill();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !lastPosRef.current || toolMode === 'stamp') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPos = getCanvasPos(e);

    if (isRainbowBrush && toolMode !== 'eraser') {
      rainbowHueRef.current = (rainbowHueRef.current + 8) % 360;
      ctx.strokeStyle = `hsl(${rainbowHueRef.current}, 95%, 55%)`;
    } else {
      ctx.strokeStyle = toolMode === 'eraser' ? '#FFFFFF' : selectedColor;
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
      saveHistoryState();
    }
  };

  const handleUndo = () => {
    if (strokeHistory.length <= 1) return;
    sounds.playTap();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const next = strokeHistory.slice(0, -1);
        const prev = next[next.length - 1];
        ctx.putImageData(prev, 0, 0);
        setStrokeHistory(next);
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
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, rect.width, rect.height);
        saveHistoryState();
      }
    }
  };

  // ----------------------------------------------------
  // Cámara en Vivo
  // ----------------------------------------------------
  const startCamera = async () => {
    try {
      if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
      speak('¡Apunta a tu dibujo y toca el botón brillante!');
    } catch (e) {
      console.warn('Camera error:', e);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    sounds.playTap();
    const video = videoRef.current;
    const temp = document.createElement('canvas');
    temp.width = video.videoWidth || 640;
    temp.height = video.videoHeight || 480;
    const ctx = temp.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, temp.width, temp.height);
      const base64 = temp.toDataURL('image/jpeg', 0.85);
      stopCamera();
      setCapturedImage(base64);
      triggerMagicWithAi(base64);
    }
  };

  // ----------------------------------------------------
  // Magia de IA y Transformación
  // ----------------------------------------------------
  const handleMagicFromCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    sounds.playTap();
    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(base64);
    triggerMagicWithAi(base64);
  };

  const triggerMagicWithAi = async (base64: string) => {
    setViewState('magic');
    setIsThinking(true);
    setSelectedChoice(null);

    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });

    try {
      const raw = await askZentryAi(
        'neuro_art',
        'Analiza este dibujo de un niño de 2 a 5 años. Salúdalo alegremente y pregúntale qué aventura quiere vivir con su dibujo.',
        base64
      );
      const parsed = JSON.parse(raw.trim().replace(/^```json/, '').replace(/```$/, ''));
      const text = parsed.speechText || '¡Qué dibujo tan hermoso! ¿Qué aventura mágica quiere vivir tu amigo?';
      setSpokenPrompt(text);
      speak(text);
    } catch {
      const fallbackText = '¡Qué dibujo tan hermoso! ¿Qué aventura mágica quiere vivir tu amigo?';
      setSpokenPrompt(fallbackText);
      speak(fallbackText);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSelectMagicChoice = (choice: typeof MAGIC_CHOICES[0]) => {
    if (navigator.vibrate) navigator.vibrate(15);
    sounds.playSuccess();
    setSelectedChoice(choice);

    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.5 }
    });

    speak(choice.story);
  };

  const handleSaveDrawing = () => {
    if (!capturedImage) return;
    if (navigator.vibrate) navigator.vibrate(15);
    sounds.playSuccess();

    const newSaved: SavedDrawing = {
      id: String(Date.now()),
      thumbnail: capturedImage,
      emoji: selectedChoice ? selectedChoice.emoji : '🎨',
      story: selectedChoice ? selectedChoice.story : '¡Una hermosa obra de arte!'
    };

    const nextGallery = [newSaved, ...gallery.slice(0, 15)];
    setGallery(nextGallery);
    localStorage.setItem('zentry_toddler_art', JSON.stringify(nextGallery));

    confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
    setViewState('welcome');
    speak('¡Tu dibujo se guardó en tu cofre mágico!');
  };

  useEffect(() => {
    return () => {
      stopVoice();
      stopCamera();
    };
  }, []);

  return (
    <ZentrySubPageScaffold
      title=""
      kicker=""
      onBack={() => {
        stopVoice();
        stopCamera();
        if (viewState !== 'welcome') {
          setViewState('welcome');
        } else {
          onBack();
        }
      }}
      isDark={isDark}
    >
      {/* ---------------------------------------------------- */}
      {/* 1. MODO BIENVENIDA (2 BOTONES GIGANTES ILUSTRADOS) */}
      {/* ---------------------------------------------------- */}
      {viewState === 'welcome' && (
        <div className="w-full h-full flex flex-col items-center justify-between p-2 md:p-6 space-y-4">
          {/* Tarjetas Gigantes de Inicio */}
          <div className="grid grid-cols-2 gap-4 md:gap-8 w-full max-w-lg flex-1 items-center">
            {/* Botón 1: DIBUJAR (Pincel & Lienzo) */}
            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(12);
                sounds.playAppOpen();
                setViewState('canvas');
              }}
              className="h-56 md:h-64 rounded-[36px] bg-gradient-to-br from-pink-400 via-rose-500 to-purple-600 flex flex-col items-center justify-center gap-3 p-4 shadow-2xl shadow-pink-500/40 cursor-pointer zentry-press border-4 border-white/60 active:scale-95"
            >
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                <Palette className="w-14 h-14 md:w-16 md:h-16" />
              </div>
              <span className="text-4xl md:text-5xl">🎨</span>
            </button>

            {/* Botón 2: FOTO (Cámara Escáner) */}
            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(12);
                sounds.playAppOpen();
                setViewState('camera');
                startCamera();
              }}
              className="h-56 md:h-64 rounded-[36px] bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex flex-col items-center justify-center gap-3 p-4 shadow-2xl shadow-cyan-500/40 cursor-pointer zentry-press border-4 border-white/60 active:scale-95"
            >
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                <Camera className="w-14 h-14 md:w-16 md:h-16" />
              </div>
              <span className="text-4xl md:text-5xl">📸</span>
            </button>
          </div>

          {/* Galería Visual Inferior (Cofre de Dibujos) */}
          {gallery.length > 0 && (
            <div className="w-full max-w-lg flex items-center gap-3 overflow-x-auto no-scrollbar py-2 px-1">
              <span className="text-2xl flex-shrink-0">⭐</span>
              {gallery.map((item) => (
                <button
                  key={item.id}
                  onClick={() => speak(item.story)}
                  className="w-18 h-18 rounded-[22px] overflow-hidden border-3 border-pink-400/60 shadow-lg flex-shrink-0 relative zentry-press active:scale-90 bg-white"
                >
                  <img src={item.thumbnail} alt="Obra" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 text-sm bg-black/60 rounded-full px-1">
                    {item.emoji}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. MODO LIENZO (100% VISUAL: PINCEL, SELLOS, COLORES) */}
      {/* ---------------------------------------------------- */}
      {viewState === 'canvas' && (
        <div className="w-full h-full flex flex-col justify-between overflow-hidden gap-2 relative">
          {/* Barra Superior: Figuras / Sellos Táctiles */}
          <div className="flex items-center justify-between gap-1 px-1 bg-white/30 backdrop-blur-md rounded-[24px] p-1.5 border border-white/40 shadow-sm">
            {/* Modo Pincel Normal */}
            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(5);
                setToolMode('brush');
                setIsRainbowBrush(false);
              }}
              className={`p-2.5 rounded-[20px] text-xl border-2 transition-transform cursor-pointer ${
                toolMode === 'brush' && !isRainbowBrush
                  ? 'bg-pink-500 text-white border-pink-300 scale-110 shadow-lg'
                  : 'bg-white/80 border-transparent text-slate-700'
              }`}
            >
              🖌️
            </button>

            {/* Pincel Arcoíris */}
            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(5);
                setToolMode('brush');
                setIsRainbowBrush(true);
              }}
              className={`p-2.5 rounded-[20px] text-xl border-2 transition-transform cursor-pointer ${
                toolMode === 'brush' && isRainbowBrush
                  ? 'bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400 text-white border-white scale-110 shadow-lg'
                  : 'bg-white/80 border-transparent'
              }`}
            >
              🌈
            </button>

            {/* Sellos de Figuras (⭐, ❤️, ☀️, 🦖, 🚀) */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[45%]">
              {STAMPS.map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(5);
                    setToolMode('stamp');
                    setSelectedStamp(st);
                  }}
                  className={`p-2 rounded-[18px] text-xl transition-transform cursor-pointer flex-shrink-0 ${
                    toolMode === 'stamp' && selectedStamp.id === st.id
                      ? 'bg-amber-400 scale-125 border-2 border-white shadow-md'
                      : 'bg-white/60 hover:bg-white'
                  }`}
                >
                  {st.emoji}
                </button>
              ))}
            </div>

            {/* Borrador & Deshacer */}
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

              <button
                onClick={handleUndo}
                className="p-2.5 rounded-[20px] text-xl bg-white/80 active:scale-90 cursor-pointer"
              >
                ↩️
              </button>

              <button
                onClick={handleClear}
                className="p-2.5 rounded-[20px] text-xl bg-white/80 active:scale-90 cursor-pointer"
              >
                🗑️
              </button>
            </div>
          </div>

          {/* Lienzo Táctil */}
          <div className="flex-1 w-full relative rounded-[32px] overflow-hidden bg-white shadow-2xl border-4 border-white/80 touch-none">
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="w-full h-full block cursor-pointer"
            />
          </div>

          {/* Barra Inferior: Colores Gigantes & Botón Varita Mágica 🪄 */}
          <div className="flex items-center justify-between gap-2 px-1 py-1">
            {/* Círculos de Colores Gigantes */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(5);
                    setSelectedColor(c);
                    setToolMode('brush');
                    setIsRainbowBrush(false);
                  }}
                  style={{ backgroundColor: c }}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-3 transition-transform cursor-pointer ${
                    toolMode === 'brush' && !isRainbowBrush && selectedColor === c
                      ? 'scale-125 border-white ring-4 ring-pink-400 shadow-xl'
                      : 'border-white/80 shadow-md'
                  }`}
                />
              ))}
            </div>

            {/* BOTÓN GIGANTE: VARITA MÁGICA 🪄 */}
            <button
              onClick={handleMagicFromCanvas}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-purple-500/50 border-4 border-white active:scale-90 transition-transform cursor-pointer animate-bounce flex-shrink-0"
            >
              <Wand2 className="w-9 h-9 md:w-11 md:h-11" />
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. MODO CÁMARA (ESCANEAR CON BOTONES VISUALES) */}
      {/* ---------------------------------------------------- */}
      {viewState === 'camera' && (
        <div className="w-full h-full flex flex-col justify-between overflow-hidden relative rounded-[32px] bg-black">
          <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

            {/* Marco de Figuras Punteado */}
            <div className="absolute w-[85%] h-[80%] border-6 border-dashed border-pink-400/90 rounded-[36px] pointer-events-none flex items-center justify-center">
              <span className="text-6xl animate-pulse opacity-40">✨</span>
            </div>
          </div>

          {/* Controles de Cámara */}
          <div className="p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-around">
            <button
              onClick={() => {
                setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
                startCamera();
              }}
              className="w-14 h-14 rounded-full bg-white/25 text-3xl flex items-center justify-center active:scale-90"
            >
              🔄
            </button>

            {/* Disparador Gigante */}
            <button
              onClick={handleCapturePhoto}
              className="w-22 h-22 rounded-full bg-white p-2 shadow-2xl flex items-center justify-center active:scale-90 cursor-pointer"
            >
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white text-4xl">
                📸
              </div>
            </button>

            <button
              onClick={() => {
                stopCamera();
                setViewState('welcome');
              }}
              className="w-14 h-14 rounded-full bg-white/25 text-3xl flex items-center justify-center active:scale-90"
            >
              ❌
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. MODO MENTE MÁGICA (FIGURAS GIGANTES & VOZ HABLADA) */}
      {/* ---------------------------------------------------- */}
      {viewState === 'magic' && (
        <div className="w-full h-full flex flex-col items-center justify-between p-2 md:p-6 space-y-4">
          {isThinking ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 flex items-center justify-center text-6xl shadow-2xl animate-spin">
                🪄
              </div>
              <span className="text-4xl animate-bounce">✨ 🌟 ✨</span>
            </div>
          ) : (
            <div className="w-full max-w-lg flex-1 flex flex-col items-center justify-between space-y-4">
              {/* Dibujo & Altavoz */}
              <div className="relative w-full flex items-center justify-center">
                {capturedImage && (
                  <div className="w-40 h-40 md:w-48 md:h-48 rounded-[32px] overflow-hidden border-4 border-pink-400 shadow-2xl bg-white relative">
                    <img src={capturedImage} alt="Obra" className="w-full h-full object-cover" />
                    {selectedChoice && (
                      <span className="absolute inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center text-6xl animate-in zoom-in duration-300">
                        {selectedChoice.emoji}
                      </span>
                    )}
                  </div>
                )}

                {/* Botón Altavoz para repetir audio */}
                <button
                  onClick={() => speak(selectedChoice ? selectedChoice.story : spokenPrompt)}
                  className="absolute -top-2 right-4 w-14 h-14 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-xl border-3 border-white text-2xl active:scale-90 cursor-pointer"
                >
                  <Volume2 className={`w-7 h-7 ${isSpeaking ? 'animate-bounce text-yellow-300' : ''}`} />
                </button>
              </div>

              {/* 4 FIGURAS GIGANTES DE ELECCIÓN (🚀, ⚡, 🍪, 🌈) */}
              {!selectedChoice ? (
                <div className="grid grid-cols-2 gap-4 w-full flex-1 items-center">
                  {MAGIC_CHOICES.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => handleSelectMagicChoice(choice)}
                      className={`h-28 md:h-32 rounded-[32px] bg-gradient-to-br ${choice.color} flex items-center justify-center text-6xl md:text-7xl shadow-xl border-4 border-white/80 active:scale-90 transition-transform cursor-pointer zentry-press`}
                    >
                      {choice.emoji}
                    </button>
                  ))}
                </div>
              ) : (
                /* Celebración & Botón Guardar */
                <div className="w-full flex flex-col items-center gap-4 animate-in zoom-in duration-300">
                  <div className="text-center">
                    <span className="text-7xl animate-bounce block mb-2">{selectedChoice.emoji}</span>
                  </div>

                  <button
                    onClick={handleSaveDrawing}
                    className="w-full py-5 rounded-[32px] bg-gradient-to-r from-emerald-400 via-teal-500 to-green-600 text-white font-black text-2xl shadow-2xl border-4 border-white flex items-center justify-center gap-3 cursor-pointer zentry-press active:scale-95"
                  >
                    <span>⭐</span>
                    <span className="text-4xl">💾</span>
                    <span>⭐</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </ZentrySubPageScaffold>
  );
};

export default ZentryNeuroArtScreen;
