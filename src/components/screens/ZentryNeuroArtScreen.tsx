import React, { useState, useRef, useEffect } from 'react';
import {
  Palette,
  Camera,
  Sparkles,
  Volume2,
  Mic,
  MicOff,
  Undo2,
  Trash2,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  Heart,
  Star,
  Flame,
  Wand2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { askZentryAi } from '../../services/aiService';
import { voiceService } from '../../services/voiceSpeech';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

interface SavedDrawing {
  id: string;
  thumbnail: string;
  subject: string;
  story: string;
  date: string;
  source: 'canvas' | 'camera';
}

interface AiArtResponse {
  speechText: string;
  detectedSubject: string;
  quickPicks: string[];
  evolutionStory: string;
  physicalMission?: string;
}

export const ZentryNeuroArtScreen: React.FC<Props> = ({ onBack, isDark }) => {
  // Screen views: 'welcome' | 'canvas' | 'camera' | 'magic_mind'
  const [viewState, setViewState] = useState<'welcome' | 'canvas' | 'camera' | 'magic_mind'>('welcome');

  // Drawing Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#8B5CF6');
  const [brushSize, setBrushSize] = useState(14);
  const [isEraser, setIsEraser] = useState(false);
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Active Image (from canvas or camera)
  const [capturedImageBase64, setCapturedImageBase64] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<'canvas' | 'camera'>('canvas');

  // Camera State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // AI & Co-creation State
  const [isThinking, setIsThinking] = useState(false);
  const [aiResult, setAiResult] = useState<AiArtResponse | null>(null);
  const [selectedEvolution, setSelectedEvolution] = useState<string | null>(null);
  const [isDictating, setIsDictating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Saved Gallery State
  const [gallery, setGallery] = useState<SavedDrawing[]>(() => {
    try {
      const saved = localStorage.getItem('zentry_neuroart_gallery');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<SavedDrawing | null>(null);

  const colors = [
    '#FF477E', // Rosa Mágico
    '#8B5CF6', // Violeta Estelar
    '#3B82F6', // Azul Cielo
    '#10B981', // Verde Esmeralda
    '#F59E0B', // Amarillo Sol
    '#EF4444', // Rojo Fuego
    '#1E293B', // Tinta Oscura
    '#FFFFFF'  // Blanco Nube
  ];

  // ----------------------------------------------------
  // Audio Speech (TTS)
  // ----------------------------------------------------
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.95;
      utterance.pitch = 1.15;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // ----------------------------------------------------
  // Canvas Setup & Drawing Handlers
  // ----------------------------------------------------
  useEffect(() => {
    if (viewState === 'canvas' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Adjust for retina high-DPI
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, rect.width, rect.height);

        // Save blank initial state
        const initial = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setStrokeHistory([initial]);
      }
    }
  }, [viewState]);

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setStrokeHistory((prev) => [...prev.slice(-15), state]);
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
    setIsDrawing(true);
    lastPosRef.current = pos;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, (isEraser ? brushSize * 1.5 : brushSize) / 2, 0, Math.PI * 2);
        ctx.fillStyle = isEraser ? '#FFFFFF' : selectedColor;
        ctx.fill();
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPosRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPos = getCanvasPos(e);

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.strokeStyle = isEraser ? '#FFFFFF' : selectedColor;
    ctx.lineWidth = isEraser ? brushSize * 1.5 : brushSize;
    ctx.stroke();

    lastPosRef.current = currentPos;
  };

  const handlePointerUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      lastPosRef.current = null;
      saveCanvasState();
    }
  };

  const handleUndo = () => {
    if (strokeHistory.length <= 1) return;
    sounds.playTap();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const nextHistory = strokeHistory.slice(0, -1);
        const previousState = nextHistory[nextHistory.length - 1];
        ctx.putImageData(previousState, 0, 0);
        setStrokeHistory(nextHistory);
      }
    }
  };

  const handleClearCanvas = () => {
    sounds.playTap();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, rect.width, rect.height);
        saveCanvasState();
      }
    }
  };

  // ----------------------------------------------------
  // Camera Handlers
  // ----------------------------------------------------
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('No pudimos acceder a la cámara. Por favor permite los permisos.');
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
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth || 640;
    tempCanvas.height = video.videoHeight || 480;
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
      const base64 = tempCanvas.toDataURL('image/jpeg', 0.85);
      stopCamera();
      setCapturedImageBase64(base64);
      setImageSource('camera');
      processImageWithAI(base64, 'Foto de papel escaneado');
    }
  };

  // ----------------------------------------------------
  // AI Co-creation Pipeline
  // ----------------------------------------------------
  const handleMagicFromCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    sounds.playTap();
    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImageBase64(base64);
    setImageSource('canvas');
    processImageWithAI(base64, 'Dibujo en lienzo digital');
  };

  const processImageWithAI = async (base64: string, sourceLabel: string) => {
    setViewState('magic_mind');
    setIsThinking(true);
    setAiResult(null);
    setSelectedEvolution(null);

    try {
      const raw = await askZentryAi(
        'neuro_art',
        `El niño pequeño creó un dibujo (${sourceLabel}). Analízalo con emoción y genera la respuesta mágica para niños de 2 a 5 años.`,
        base64
      );

      const parsed: AiArtResponse = JSON.parse(raw.trim().replace(/^```json/, '').replace(/```$/, ''));
      setAiResult(parsed);
      sounds.playSuccess();
      speakText(parsed.speechText);
    } catch (error) {
      console.warn('Fallback NeuroArt AI response:', error);
      const fallback: AiArtResponse = {
        speechText: '¡Guau! ¡Qué dibujo tan hermoso! Veo un personaje súper alegre con colores mágicos. ¿Qué superpoder te gustaría que tenga?',
        detectedSubject: 'Personaje Mágico',
        quickPicks: ['⚡ Rayos de colores', '🚀 Volar al espacio', '🍪 Comer galletas', '🌟 Hacer estrellas'],
        evolutionStory: '¡Tu personaje aprendió a volar por encima de las nubes y ahora ilumina el cielo con su sonrisa!',
        physicalMission: '¡Busca un juguete en tu habitación para que sea el mejor amigo de tu personaje!'
      };
      setAiResult(fallback);
      sounds.playSuccess();
      speakText(fallback.speechText);
    } finally {
      setIsThinking(false);
    }
  };

  const handlePickEvolution = (choice: string) => {
    if (navigator.vibrate) navigator.vibrate(10);
    sounds.playTap();
    setSelectedEvolution(choice);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });

    if (aiResult) {
      const storyText = `¡Increíble! Elegiste ${choice}. ${aiResult.evolutionStory}`;
      speakText(storyText);
    }
  };

  const handleDictateResponse = () => {
    if (isDictating) {
      voiceService.stopListening();
      setIsDictating(false);
      return;
    }

    if (navigator.vibrate) navigator.vibrate(8);
    sounds.playTap();
    setIsDictating(true);

    voiceService.startListening(
      (result) => {
        setIsDictating(false);
        handlePickEvolution(result.transcript);
      },
      () => {
        setIsDictating(false);
      }
    );
  };

  const handleSaveToGallery = () => {
    if (!capturedImageBase64 || !aiResult) return;
    if (navigator.vibrate) navigator.vibrate(15);
    sounds.playSuccess();

    const newDrawing: SavedDrawing = {
      id: String(Date.now()),
      thumbnail: capturedImageBase64,
      subject: aiResult.detectedSubject || 'Aventura Creativa',
      story: selectedEvolution
        ? `Eligió: ${selectedEvolution}. ${aiResult.evolutionStory}`
        : aiResult.evolutionStory,
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      source: imageSource
    };

    const updated = [newDrawing, ...gallery.slice(0, 19)];
    setGallery(updated);
    localStorage.setItem('zentry_neuroart_gallery', JSON.stringify(updated));

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 }
    });

    setViewState('welcome');
  };

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopCamera();
    };
  }, []);

  return (
    <ZentrySubPageScaffold
      title="Art-Attack"
      kicker="CO-CREACIÓN MÁGICA"
      onBack={() => {
        stopSpeaking();
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
      {/* 1. MODO BIENVENIDA / SELECTOR */}
      {/* ---------------------------------------------------- */}
      {viewState === 'welcome' && (
        <div className="w-full h-full flex flex-col items-center justify-between p-2 md:p-4 space-y-4 overflow-y-auto no-scrollbar">
          {/* Main Action Cards (Grandes, táctiles para niños de 2 a 5 años) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
            {/* Tarjeta 1: Lienzo Mágico */}
            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10);
                sounds.playAppOpen();
                setViewState('canvas');
              }}
              className={`p-6 rounded-[32px] flex flex-col items-center justify-center gap-3 border shadow-xl transition-transform active:scale-95 cursor-pointer zentry-press ${
                isDark
                  ? 'bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-pink-900/40 border-purple-500/30'
                  : 'bg-gradient-to-br from-purple-100 via-pink-50 to-rose-100 border-purple-200 shadow-purple-100'
              }`}
            >
              <div className="w-20 h-20 rounded-[24px] bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
                <Palette className="w-10 h-10" />
              </div>
              <span className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-[#1E293B]'}`}>
                Lienzo Mágico
              </span>
              <span className={`text-xs font-semibold ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                Dibuja con tus dedos
              </span>
            </button>

            {/* Tarjeta 2: Escanear Papel */}
            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10);
                sounds.playAppOpen();
                setViewState('camera');
                startCamera();
              }}
              className={`p-6 rounded-[32px] flex flex-col items-center justify-center gap-3 border shadow-xl transition-transform active:scale-95 cursor-pointer zentry-press ${
                isDark
                  ? 'bg-gradient-to-br from-blue-900/40 via-indigo-800/30 to-cyan-900/40 border-blue-500/30'
                  : 'bg-gradient-to-br from-blue-100 via-sky-50 to-indigo-100 border-blue-200 shadow-blue-100'
              }`}
            >
              <div className="w-20 h-20 rounded-[24px] bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <Camera className="w-10 h-10" />
              </div>
              <span className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-[#1E293B]'}`}>
                Escanear Papel
              </span>
              <span className={`text-xs font-semibold ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                Toma foto a tu dibujo real
              </span>
            </button>
          </div>

          {/* Galería de Dibujos Guardados */}
          <div className="w-full max-w-xl flex-1 flex flex-col min-h-[140px]">
            <div className="flex items-center justify-between pb-2">
              <span className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
                🖼️ Mis Obras Mágicas ({gallery.length})
              </span>
            </div>

            {gallery.length === 0 ? (
              <div
                className={`flex-1 rounded-[24px] border border-dashed flex flex-col items-center justify-center p-6 text-center ${
                  isDark ? 'border-white/10 text-white/40' : 'border-black/10 text-slate-400'
                }`}
              >
                <Sparkles className="w-8 h-8 mb-2 opacity-50 text-pink-400" />
                <p className="text-xs font-bold">Aún no tienes dibujos guardados.</p>
                <p className="text-[11px] opacity-70">¡Crea tu primera obra en el Lienzo o con la Cámara!</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 overflow-y-auto no-scrollbar max-h-48 p-1">
                {gallery.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedGalleryItem(item);
                      speakText(item.story);
                    }}
                    className={`rounded-[20px] p-1.5 border flex flex-col items-center gap-1 cursor-pointer transition-transform active:scale-95 shadow-md ${
                      isDark ? 'bg-white/10 border-white/15' : 'bg-white border-black/5 shadow-slate-100'
                    }`}
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.subject}
                      className="w-full h-16 object-cover rounded-[14px] bg-white shadow-inner"
                    />
                    <span className={`text-[10px] font-black truncate w-full text-center ${isDark ? 'text-white' : 'text-[#1E293B]'}`}>
                      {item.subject}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. MODO LIENZO MÁGICO (HTML5 Canvas Real) */}
      {/* ---------------------------------------------------- */}
      {viewState === 'canvas' && (
        <div className="w-full h-full flex flex-col justify-between overflow-hidden gap-2">
          {/* Barra Superior de Herramientas */}
          <div className="flex items-center justify-between gap-2 px-1">
            {/* Paleta de Colores Táctiles */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(5);
                    setSelectedColor(c);
                    setIsEraser(false);
                  }}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 md:w-8 md:h-8 rounded-full border-2 transition-transform cursor-pointer zentry-press ${
                    !isEraser && selectedColor === c
                      ? 'scale-125 border-pink-400 shadow-md ring-2 ring-pink-300'
                      : 'border-white/60'
                  }`}
                />
              ))}
            </div>

            {/* Acciones Rápidas (Borrador, Deshacer, Limpiar) */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(5);
                  setIsEraser((prev) => !prev);
                }}
                className={`p-2 rounded-[14px] border font-bold text-xs flex items-center gap-1 cursor-pointer transition-all zentry-press ${
                  isEraser
                    ? 'bg-pink-500 text-white border-pink-400 shadow-md'
                    : isDark
                    ? 'bg-white/10 text-white/80 border-white/15'
                    : 'bg-white text-slate-700 border-black/10'
                }`}
                title="Borrador"
              >
                <span>🧹</span>
              </button>

              <button
                onClick={handleUndo}
                className={`p-2 rounded-[14px] border font-bold text-xs flex items-center cursor-pointer transition-all zentry-press ${
                  isDark ? 'bg-white/10 text-white/80 border-white/15' : 'bg-white text-slate-700 border-black/10'
                }`}
                title="Deshacer"
              >
                <Undo2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleClearCanvas}
                className={`p-2 rounded-[14px] border font-bold text-xs flex items-center cursor-pointer transition-all zentry-press ${
                  isDark ? 'bg-white/10 text-white/80 border-white/15' : 'bg-white text-slate-700 border-black/10'
                }`}
                title="Limpiar"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>

          {/* Lienzo Interactivo Touch */}
          <div className="flex-1 w-full relative rounded-[28px] overflow-hidden bg-white shadow-2xl border border-white/20 touch-none">
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="w-full h-full cursor-crosshair block"
            />
          </div>

          {/* Botón Principal: ¡Hacer Magia! */}
          <div className="flex items-center justify-between gap-3 pt-1">
            {/* Grosor de Pincel */}
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold ${isDark ? 'text-white/60' : 'text-slate-500'}`}>Grosor:</span>
              {[8, 16, 28].map((size) => (
                <button
                  key={size}
                  onClick={() => setBrushSize(size)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center border cursor-pointer ${
                    brushSize === size
                      ? 'bg-pink-500 text-white border-pink-300'
                      : isDark
                      ? 'bg-white/10 border-white/15 text-white/60'
                      : 'bg-white border-black/10 text-slate-600'
                  }`}
                >
                  <div
                    className="rounded-full bg-current"
                    style={{ width: `${size * 0.4 + 4}px`, height: `${size * 0.4 + 4}px` }}
                  />
                </button>
              ))}
            </div>

            <button
              onClick={handleMagicFromCanvas}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white font-black text-sm shadow-xl shadow-purple-500/30 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer zentry-press"
            >
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>¡Hacer Magia! ✨</span>
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. MODO CÁMARA (Escanear Papel Físico) */}
      {/* ---------------------------------------------------- */}
      {viewState === 'camera' && (
        <div className="w-full h-full flex flex-col justify-between overflow-hidden relative rounded-[28px] bg-black">
          {/* Visor de Video en Vivo */}
          <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Marco de Encuadre Punteado para Hoja de Papel */}
            <div className="absolute w-[80%] h-[75%] border-4 border-dashed border-pink-400/80 rounded-[28px] pointer-events-none flex flex-col items-center justify-between p-4 shadow-[0_0_50px_rgba(236,72,153,0.3)]">
              <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-[11px] font-bold">
                🎯 Encuadra tu dibujo de papel aquí
              </span>
              <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-pink-300 text-[10px] font-bold">
                Mantén la cámara firme
              </span>
            </div>

            {cameraError && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                <p className="text-xs">{cameraError}</p>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 rounded-full bg-pink-500 text-xs font-bold"
                >
                  Reintentar Cámara
                </button>
              </div>
            )}
          </div>

          {/* Controles de Disparo */}
          <div className="p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-around">
            <button
              onClick={() => {
                setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
                startCamera();
              }}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center cursor-pointer zentry-press"
              title="Cambiar Cámara"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            {/* Disparador Grande */}
            <button
              onClick={handleCapturePhoto}
              className="w-18 h-18 rounded-full bg-white p-1.5 shadow-2xl flex items-center justify-center cursor-pointer zentry-press active:scale-90"
            >
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white">
                <Camera className="w-7 h-7" />
              </div>
            </button>

            <button
              onClick={() => {
                stopCamera();
                setViewState('welcome');
              }}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center cursor-pointer zentry-press"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. MODO MENTE CO-CREATIVA (Voz, Diálogo y Transformación) */}
      {/* ---------------------------------------------------- */}
      {viewState === 'magic_mind' && (
        <div className="w-full h-full flex flex-col justify-between overflow-y-auto no-scrollbar p-2 md:p-4 space-y-4">
          {isThinking ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-purple-500/40">
                <Sparkles className="w-12 h-12 animate-spin" />
              </div>
              <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-[#1E293B]'}`}>
                ¡Despertando la magia de tu dibujo! 🪄
              </h3>
              <p className={`text-xs ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                Zentry está mirando tus colores y preparando su voz...
              </p>
            </div>
          ) : (
            aiResult && (
              <div className="flex-1 flex flex-col space-y-4 max-w-xl mx-auto w-full">
                {/* Cabecera con Miniatura y Voz */}
                <div
                  className={`p-4 rounded-[28px] border flex items-center gap-4 shadow-xl ${
                    isDark ? 'zentry-veil-dark border-purple-500/30' : 'zentry-veil-light border-purple-200 bg-purple-50/60'
                  }`}
                >
                  {capturedImageBase64 && (
                    <img
                      src={capturedImageBase64}
                      alt="Dibujo"
                      className="w-20 h-20 object-cover rounded-[20px] bg-white border border-white/40 shadow-md flex-shrink-0"
                    />
                  )}

                  <div className="flex-1 flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-wider text-pink-400`}>
                      ✨ {aiResult.detectedSubject || 'Personaje Mágico'}
                    </span>
                    <p className={`text-xs md:text-sm font-bold leading-snug mt-1 ${isDark ? 'text-white' : 'text-[#1E293B]'}`}>
                      "{aiResult.speechText}"
                    </p>

                    {/* Botón para volver a escuchar en voz alta */}
                    <button
                      onClick={() => speakText(aiResult.speechText)}
                      className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-black text-purple-400 hover:text-purple-300 w-fit cursor-pointer"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-bounce text-pink-400' : ''}`} />
                      <span>{isSpeaking ? 'Hablando...' : 'Escuchar de nuevo'}</span>
                    </button>
                  </div>
                </div>

                {/* Opciones Rápidas Táctiles (Para niños de 2 a 5 años sin necesidad de escribir) */}
                {!selectedEvolution && (
                  <div className="space-y-2">
                    <span className={`text-xs font-black px-1 ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
                      👇 Toca una idea para darle vida:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {aiResult.quickPicks?.map((pick, idx) => (
                        <button
                          key={idx}
                          onClick={() => handlePickEvolution(pick)}
                          className={`p-3.5 rounded-[22px] border text-left font-extrabold text-xs flex items-center gap-2.5 transition-transform active:scale-95 cursor-pointer zentry-press shadow-md ${
                            isDark
                              ? 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
                              : 'bg-white hover:bg-purple-50 border-purple-100 text-[#1E293B]'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-pink-400 flex-shrink-0" />
                          <span>{pick}</span>
                        </button>
                      ))}
                    </div>

                    {/* Dictado por Micrófono */}
                    <div className="pt-2 flex justify-center">
                      <button
                        onClick={handleDictateResponse}
                        className={`px-5 py-2.5 rounded-full border text-xs font-bold flex items-center gap-2 cursor-pointer zentry-press ${
                          isDictating
                            ? 'bg-red-500 text-white border-red-400 animate-pulse'
                            : isDark
                            ? 'bg-white/10 text-white border-white/15'
                            : 'bg-white text-slate-700 border-black/10'
                        }`}
                      >
                        {isDictating ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-pink-400" />}
                        <span>{isDictating ? 'Escuchando tu voz...' : 'O habla con tu voz 🎤'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Transformación Mágica Seleccionada */}
                {selectedEvolution && (
                  <div className="space-y-3 animate-in fade-in zoom-in duration-300">
                    <div
                      className={`p-4 rounded-[26px] border space-y-2 shadow-xl ${
                        isDark ? 'bg-purple-950/60 border-purple-500/40 text-white' : 'bg-purple-100/80 border-purple-300 text-[#1E293B]'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-black text-pink-400">
                        <Wand2 className="w-4 h-4" />
                        <span>¡Tu historia mágica!</span>
                      </div>
                      <p className="text-xs md:text-sm font-bold leading-relaxed">
                        {aiResult.evolutionStory}
                      </p>

                      {aiResult.physicalMission && (
                        <div className="pt-2 border-t border-purple-400/20">
                          <span className="text-[11px] font-black text-amber-400 block mb-1">
                            🏡 Reto en Casa (Mundo Real):
                          </span>
                          <p className="text-[11px] font-semibold text-slate-300">
                            {aiResult.physicalMission}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Botón Guardar en Galería */}
                    <button
                      onClick={handleSaveToGallery}
                      className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer zentry-press active:scale-95"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Guardar en Mi Galería 💾</span>
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* Dialog para Ver Obra del Historial */}
      {selectedGalleryItem && (
        <div
          onClick={() => {
            stopSpeaking();
            setSelectedGalleryItem(null);
          }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-sm rounded-[32px] p-5 space-y-4 border shadow-2xl ${
              isDark ? 'bg-slate-900 border-white/20 text-white' : 'bg-white border-black/10 text-[#1E293B]'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black">{selectedGalleryItem.subject}</h4>
              <span className="text-[10px] opacity-60 font-semibold">{selectedGalleryItem.date}</span>
            </div>

            <img
              src={selectedGalleryItem.thumbnail}
              alt={selectedGalleryItem.subject}
              className="w-full h-44 object-contain rounded-[20px] bg-slate-950/20 border border-white/10"
            />

            <p className="text-xs leading-relaxed font-medium opacity-90">
              {selectedGalleryItem.story}
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => speakText(selectedGalleryItem.story)}
                className="flex-1 py-2.5 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer zentry-press"
              >
                <Volume2 className="w-4 h-4" />
                <span>Escuchar</span>
              </button>

              <button
                onClick={() => {
                  stopSpeaking();
                  setSelectedGalleryItem(null);
                }}
                className="px-5 py-2.5 rounded-full bg-white/20 text-xs font-bold cursor-pointer zentry-press"
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

export default ZentryNeuroArtScreen;
