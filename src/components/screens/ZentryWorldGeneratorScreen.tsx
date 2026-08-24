import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Sparkles,
  Camera,
  Volume2,
  CheckCircle2,
  Trophy,
  ArrowLeft,
  RefreshCw,
  Star,
  Flame,
  ShieldCheck,
  Smile
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { askZentryAi } from '../../services/aiService';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

interface AdventureTheme {
  id: string;
  emoji: string;
  name: string;
  gradient: string;
  prompt: string;
  defaultMissions: Array<{
    icon: string;
    action: string;
    speech: string;
  }>;
}

const ADVENTURE_THEMES: AdventureTheme[] = [
  {
    id: 'space',
    emoji: '🚀',
    name: 'Espacio',
    gradient: 'from-blue-600 via-indigo-600 to-purple-800',
    prompt: 'Astronauta viajando a la luna',
    defaultMissions: [
      { icon: '🛋️', action: 'Construye tu nave con 2 cojines', speech: '¡Misión 1: Construye tu nave espacial con 2 cojines en tu sala o cama!' },
      { icon: '🥄', action: 'Busca una cuchara (tu llave espacial)', speech: '¡Misión 2: Encuentra una cuchara en la cocina que será tu llave de propulsión!' },
      { icon: '⭐', action: 'Da 3 saltos flotando como astronauta', speech: '¡Misión 3: Da 3 saltos en cámara lenta como si estuvieras en la luna!' }
    ]
  },
  {
    id: 'pirate',
    emoji: '🏴‍☠️',
    name: 'Pirata',
    gradient: 'from-amber-500 via-orange-600 to-red-700',
    prompt: 'Pirata buscando el tesoro en la isla',
    defaultMissions: [
      { icon: '📦', action: 'Arma tu barco pirata en el suelo', speech: '¡Misión 1: Siéntate en una caja o almohada que será tu barco pirata!' },
      { icon: '🪙', action: 'Busca un objeto brillante (tu tesoro)', speech: '¡Misión 2: Encuentra un objeto brillante o amarillo en tu casa!' },
      { icon: '🦜', action: 'Imita el grito de un loro pirata', speech: '¡Misión 3: Haz el sonido de un loro pirata muy fuerte y alegre!' }
    ]
  },
  {
    id: 'dino',
    emoji: '🦖',
    name: 'Dino',
    gradient: 'from-emerald-500 via-green-600 to-teal-800',
    prompt: 'Explorador en la selva de dinosaurios',
    defaultMissions: [
      { icon: '🌿', action: 'Busca 2 hojitas verdes o ramitas', speech: '¡Misión 1: Busca dos hojitas verdes o una planta en casa!' },
      { icon: '👣', action: 'Camina dando pasos de dinosaurio', speech: '¡Misión 2: Da 5 pasos gigantes y pesados como un T-Rex!' },
      { icon: '🦕', action: 'Ruge como un dinosaurio amigable', speech: '¡Misión 3: Lanza un rugido de dinosaurio súper amigable!' }
    ]
  },
  {
    id: 'castle',
    emoji: '🏰',
    name: 'Castillo',
    gradient: 'from-purple-500 via-pink-500 to-rose-600',
    prompt: 'Rey, reina o dragón en el castillo mágico',
    defaultMissions: [
      { icon: '👑', action: 'Ponte una toalla como capa real', speech: '¡Misión 1: Colócate una pequeña toalla o prenda como capa mágica!' },
      { icon: '🪄', action: 'Busca un lápiz (tu varita mágica)', speech: '¡Misión 2: Encuentra un lápiz o plumón que será tu varita encantada!' },
      { icon: '✨', action: 'Gira 2 veces y lanza un hechizo', speech: '¡Misión 3: Da dos vueltitas en tu lugar y di una palabra mágica!' }
    ]
  },
  {
    id: 'animals',
    emoji: '🐾',
    name: 'Animales',
    gradient: 'from-yellow-400 via-amber-500 to-orange-600',
    prompt: 'Veterinario cuidando animalitos mágicos',
    defaultMissions: [
      { icon: '🧸', action: 'Trae a tu peluche o juguete favorito', speech: '¡Misión 1: Ve por tu peluche o muñeco favorito para curarlo!' },
      { icon: '🩹', action: 'Dale un abrazo curativo con cariño', speech: '¡Misión 2: Dale un abrazo fuerte y cariñoso a tu peluche!' },
      { icon: '🥛', action: 'Dale agüita mágica imaginaria', speech: '¡Misión 3: Ofrécele un vasito con agua imaginaria para que sane!' }
    ]
  },
  {
    id: 'cars',
    emoji: '🏎️',
    name: 'Carreras',
    gradient: 'from-red-500 via-rose-600 to-amber-500',
    prompt: 'Piloto de carreras en el circuito veloz',
    defaultMissions: [
      { icon: '⭕', action: 'Usa una tapa o plato como volante', speech: '¡Misión 1: Consigue una tapa o plato de plástico para que sea tu volante!' },
      { icon: '🏁', action: 'Haz el sonido del motor acelerando', speech: '¡Misión 2: Haz el sonido de un motor a toda velocidad: brrrrm!' },
      { icon: '🏆', action: 'Cruza la meta imaginaria corriendo', speech: '¡Misión 3: Corre hacia la puerta y cruza la meta de campeón!' }
    ]
  }
];

export const ZentryWorldGeneratorScreen: React.FC<Props> = ({ onBack, isDark }) => {
  // Estado: 'select_world' | 'active_missions' | 'camera_scan' | 'victory'
  const [stage, setStage] = useState<'select_world' | 'active_missions' | 'camera_scan' | 'victory'>('select_world');
  const [selectedTheme, setSelectedTheme] = useState<AdventureTheme | null>(null);

  // Misiones activas
  const [completedMissions, setCompletedMissions] = useState<boolean[]>([false, false, false]);
  const [activeScanIndex, setActiveScanIndex] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Cámara para escanear objetos del reto
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isScanningPhoto, setIsScanningPhoto] = useState(false);

  // Trofeos ganados
  const [trophies, setTrophies] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zentry_world_trophies');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ----------------------------------------------------
  // Síntesis de Voz
  // ----------------------------------------------------
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

  // ----------------------------------------------------
  // Cámara Phygital
  // ----------------------------------------------------
  const startCamera = async (missionIndex: number) => {
    setActiveScanIndex(missionIndex);
    setStage('camera_scan');
    try {
      if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
      speak('¡Apunta a tu objeto o construcción y toma la foto!');
    } catch (e) {
      console.warn('Camera scan error:', e);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
  };

  const handleCaptureValidation = () => {
    setIsScanningPhoto(true);
    sounds.playTap();

    setTimeout(() => {
      setIsScanningPhoto(false);
      stopCamera();
      toggleMission(activeScanIndex, true);
      setStage('active_missions');
      speak('¡Misión validada con éxito! ¡Eres genial!');
    }, 1200);
  };

  // ----------------------------------------------------
  // Flujo de Aventura
  // ----------------------------------------------------
  const handleSelectTheme = (theme: AdventureTheme) => {
    if (navigator.vibrate) navigator.vibrate(12);
    sounds.playAppOpen();
    setSelectedTheme(theme);
    setCompletedMissions([false, false, false]);
    setStage('active_missions');

    speak(`¡Genial! Vamos a jugar a ser ${theme.name}. Cumple tus 3 misiones mágicas en casa.`);
  };

  const toggleMission = (index: number, forceState?: boolean) => {
    if (navigator.vibrate) navigator.vibrate(10);
    sounds.playSuccess();

    setCompletedMissions((prev) => {
      const next = [...prev];
      next[index] = forceState !== undefined ? forceState : !next[index];

      // Verificar si completó las 3 misiones
      if (next.every((v) => v === true)) {
        setTimeout(() => {
          handleTriggerVictory();
        }, 600);
      }
      return next;
    });

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleTriggerVictory = () => {
    setStage('victory');
    sounds.playSuccess();

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 }
    });

    if (selectedTheme) {
      const nextTrophies = [selectedTheme.emoji, ...trophies.slice(0, 15)];
      setTrophies(nextTrophies);
      localStorage.setItem('zentry_world_trophies', JSON.stringify(nextTrophies));
      speak(`¡Felicitaciones! ¡Completaste todas las misiones de ${selectedTheme.name}! ¡Ganaste una medalla de oro!`);
    }
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
        if (stage !== 'select_world') {
          setStage('select_world');
        } else {
          onBack();
        }
      }}
      isDark={isDark}
    >
      {/* ---------------------------------------------------- */}
      {/* 1. SELECTOR VISUAL DE MUNDOS (6 TARJETAS GIGANTES) */}
      {/* ---------------------------------------------------- */}
      {stage === 'select_world' && (
        <div className="w-full h-full flex flex-col justify-between items-center p-2 md:p-4 overflow-y-auto no-scrollbar space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-5 w-full max-w-xl flex-1 items-center">
            {ADVENTURE_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleSelectTheme(theme)}
                className={`h-32 md:h-40 rounded-[32px] bg-gradient-to-br ${theme.gradient} flex flex-col items-center justify-center gap-2 p-3 shadow-xl border-3 border-white/60 active:scale-95 transition-transform cursor-pointer zentry-press`}
              >
                <span className="text-5xl md:text-6xl drop-shadow-md">{theme.emoji}</span>
              </button>
            ))}
          </div>

          {/* Cofre de Trofeos Ganados */}
          {trophies.length > 0 && (
            <div className="w-full max-w-xl flex items-center gap-3 overflow-x-auto no-scrollbar py-2 px-1">
              <span className="text-2xl flex-shrink-0">🏆</span>
              {trophies.map((tr, idx) => (
                <div
                  key={idx}
                  className="w-14 h-14 rounded-[20px] bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-md flex-shrink-0"
                >
                  {tr}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. MISIONES FÍSICAS ACTIVAS (3 TARJETAS GRANDES CON CHECK) */}
      {/* ---------------------------------------------------- */}
      {stage === 'active_missions' && selectedTheme && (
        <div className="w-full h-full flex flex-col justify-between items-center p-2 md:p-4 space-y-3 overflow-y-auto no-scrollbar">
          {/* Cabecera del Tema con Altavoz */}
          <div className="w-full max-w-lg flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{selectedTheme.emoji}</span>
            </div>

            <button
              onClick={() => speak(`¡Vamos a cumplir las 3 misiones de ${selectedTheme.name}!`)}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-lg border-2 border-white text-xl active:scale-90 cursor-pointer"
            >
              <Volume2 className={`w-6 h-6 ${isSpeaking ? 'animate-bounce text-yellow-300' : ''}`} />
            </button>
          </div>

          {/* 3 Misiones Físicas Phygital */}
          <div className="w-full max-w-lg flex-1 flex flex-col justify-around gap-3">
            {selectedTheme.defaultMissions.map((m, idx) => {
              const isDone = completedMissions[idx];
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-[28px] border-3 flex items-center justify-between gap-3 shadow-xl transition-all ${
                    isDone
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : isDark
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'bg-white border-black/10 text-slate-800'
                  }`}
                >
                  {/* Ícono de Misión */}
                  <span className="text-4xl md:text-5xl flex-shrink-0">{m.icon}</span>

                  {/* Botón Altavoz individual */}
                  <button
                    onClick={() => speak(m.speech)}
                    className="p-2 rounded-full bg-white/20 active:scale-90 cursor-pointer"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>

                  {/* Botón Escanear con Cámara */}
                  {!isDone && (
                    <button
                      onClick={() => startCamera(idx)}
                      className="p-3 rounded-[20px] bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md active:scale-90 cursor-pointer text-xl"
                      title="Escanear con cámara"
                    >
                      📸
                    </button>
                  )}

                  {/* Checkbox Gigante */}
                  <button
                    onClick={() => toggleMission(idx)}
                    className={`w-14 h-14 rounded-[22px] flex items-center justify-center text-2xl border-3 transition-transform cursor-pointer active:scale-90 ${
                      isDone
                        ? 'bg-emerald-500 text-white border-emerald-300 scale-105 shadow-lg'
                        : 'bg-white/30 border-white/60 text-transparent'
                    }`}
                  >
                    {isDone ? '✅' : '⚪'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Botón Volver a Elegir */}
          <button
            onClick={() => setStage('select_world')}
            className="px-6 py-2.5 rounded-full bg-white/20 text-xs font-black border border-white/30 active:scale-95 cursor-pointer"
          >
            🔄 Cambiar Aventura
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. CÁMARA PHYGITAL (VALIDAR RETO FÍSICO) */}
      {/* ---------------------------------------------------- */}
      {stage === 'camera_scan' && (
        <div className="w-full h-full flex flex-col justify-between overflow-hidden relative rounded-[32px] bg-black">
          <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

            {/* Escáner Láser de Misión */}
            <div className="absolute w-[85%] h-[80%] border-6 border-dashed border-emerald-400/90 rounded-[36px] pointer-events-none flex items-center justify-center">
              {isScanningPhoto ? (
                <div className="text-center space-y-2 animate-bounce">
                  <span className="text-6xl">🪄</span>
                </div>
              ) : (
                <span className="text-6xl opacity-40 animate-pulse">🎯</span>
              )}
            </div>
          </div>

          {/* Disparador de Validación */}
          <div className="p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-around">
            <button
              onClick={handleCaptureValidation}
              disabled={isScanningPhoto}
              className="w-22 h-22 rounded-full bg-white p-2 shadow-2xl flex items-center justify-center active:scale-90 cursor-pointer"
            >
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white text-4xl">
                📸
              </div>
            </button>

            <button
              onClick={() => {
                stopCamera();
                setStage('active_missions');
              }}
              className="w-14 h-14 rounded-full bg-white/25 text-3xl flex items-center justify-center active:scale-90"
            >
              ❌
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. PANTALLA DE VICTORIA & TROFEO 🏆 */}
      {/* ---------------------------------------------------- */}
      {stage === 'victory' && selectedTheme && (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 space-y-6 text-center animate-in zoom-in duration-300">
          <div className="relative">
            <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-500 flex items-center justify-center text-8xl shadow-2xl shadow-yellow-500/50 border-6 border-white animate-bounce">
              🏆
            </div>
            <span className="absolute -bottom-2 -right-2 text-5xl">⭐</span>
          </div>

          <div className="flex gap-3">
            <span className="text-6xl animate-pulse">{selectedTheme.emoji}</span>
          </div>

          {/* Botón Gran Regreso */}
          <button
            onClick={() => setStage('select_world')}
            className="w-full max-w-sm py-5 rounded-[32px] bg-gradient-to-r from-emerald-400 via-teal-500 to-green-600 text-white font-black text-2xl shadow-2xl border-4 border-white flex items-center justify-center gap-3 cursor-pointer zentry-press active:scale-95"
          >
            <span>⭐</span>
            <span className="text-3xl">¡Jugar de Nuevo!</span>
            <span>⭐</span>
          </button>
        </div>
      )}
    </ZentrySubPageScaffold>
  );
};

export default ZentryWorldGeneratorScreen;
