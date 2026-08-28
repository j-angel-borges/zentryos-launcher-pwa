import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Sparkles,
  Trophy,
  CheckCircle2,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Camera,
  Heart,
  Award,
  Volume2,
  Calendar,
  Flame,
  ArrowRight,
  ShieldCheck,
  Star,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

interface RealQuest {
  id: string;
  category: 'movement' | 'curiosity' | 'habits' | 'crafts';
  categoryLabel: string;
  title: string;
  description: string;
  durationSeconds: number;
  icon: string;
  gradient: string;
  audioSpeech: string;
  badgeReward: string;
}

const REAL_QUESTS_CATALOG: RealQuest[] = [
  {
    id: 'm1_obstacle',
    category: 'movement',
    categoryLabel: 'Motricidad & Ejercicio',
    title: 'Circuito de Obstáculos en Casa',
    description: 'Coloca 3 cojines en el suelo en línea recta y salta sobre ellos como un canguro sin tocarlos.',
    durationSeconds: 120,
    icon: '🦘',
    gradient: 'from-blue-500 to-indigo-600',
    audioSpeech: '¡Misión de movimiento! Coloca tres cojines en el suelo y da saltos de canguro esquivando cada uno.',
    badgeReward: '🏅 Maestro del Salto'
  },
  {
    id: 'm2_flamingos',
    category: 'movement',
    categoryLabel: 'Motricidad & Ejercicio',
    title: 'Equilibrio del Flamenco Real',
    description: 'Párate en un solo pie con los brazos abiertos durante 10 segundos. ¡Luego cambia al otro pie!',
    durationSeconds: 60,
    icon: '🦩',
    gradient: 'from-pink-500 to-rose-600',
    audioSpeech: '¡Misión de equilibrio! Mantente en un solo pie como un flamenco elegante durante diez segundos.',
    badgeReward: '🧘 Equilibrio de Cristal'
  },
  {
    id: 'm3_yellow_hunt',
    category: 'curiosity',
    categoryLabel: 'Curiosidad & Exploración',
    title: 'Cacería del Tesoro Amarillo',
    description: 'Explora tu casa y encuentra 3 objetos que sean de color amarillo brillante o dorado.',
    durationSeconds: 180,
    icon: '🟡',
    gradient: 'from-amber-400 to-yellow-600',
    audioSpeech: '¡Misión de exploración! Busca en tu casa tres objetos de color amarillo o dorado brillante.',
    badgeReward: '🔍 Ojo de Águila'
  },
  {
    id: 'm4_textures',
    category: 'curiosity',
    categoryLabel: 'Curiosidad & Exploración',
    title: 'El Detective de Texturas',
    description: 'Toca y compara 3 superficies diferentes: algo suave, algo rugoso y algo frío.',
    durationSeconds: 120,
    icon: '🧶',
    gradient: 'from-purple-500 to-indigo-600',
    audioSpeech: '¡Misión de sentidos! Encuentra algo muy suave como un peluche, algo rugoso y algo frío.',
    badgeReward: '🖐️ Sentido Mágico'
  },
  {
    id: 'm5_tidy_room',
    category: 'habits',
    categoryLabel: 'Hábitos & Amor en Casa',
    title: 'La Misión del Súper Orden',
    description: 'Guarda 5 juguetes o libros en su lugar correcto para dejar tu habitación brillante.',
    durationSeconds: 180,
    icon: '🧸',
    gradient: 'from-emerald-500 to-teal-600',
    audioSpeech: '¡Misión de súper héroe! Guarda cinco juguetes o libros en su lugar para dejar tu cuarto impecable.',
    badgeReward: '⭐ Guardián del Hogar'
  },
  {
    id: 'm6_big_hug',
    category: 'habits',
    categoryLabel: 'Hábitos & Amor en Casa',
    title: 'El Abrazo Secreto de Energía',
    description: 'Acércate a un familiar o a tu mascota y dale un abrazo fuerte y calientito de 5 segundos.',
    durationSeconds: 60,
    icon: '🤗',
    gradient: 'from-rose-500 to-pink-600',
    audioSpeech: '¡Misión del corazón! Dale un abrazo cálido y lleno de energía a alguien de tu familia.',
    badgeReward: '💖 Corazón Radiante'
  },
  {
    id: 'm7_tower_build',
    category: 'crafts',
    categoryLabel: 'Arte & Creación Phygital',
    title: 'La Gran Torre de Cojines',
    description: 'Construye una torre alta con 4 cojines o almohadas sin que se caiga durante 10 segundos.',
    durationSeconds: 180,
    icon: '🏰',
    gradient: 'from-fuchsia-500 to-purple-700',
    audioSpeech: '¡Misión de construcción física! Apila cuatro cojines para formar una gran torre de fortaleza.',
    badgeReward: '🧱 Gran Arquitecto'
  }
];

export const ZentryRealMissionsScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeQuest, setActiveQuest] = useState<RealQuest | null>(null);

  // Temporizador Circadiano
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // Cámara Phygital para foto de logro
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [questPhotos, setQuestPhotos] = useState<Record<string, string>>({});

  // Historial de Misiones completadas
  const [completedQuestIds, setCompletedQuestIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zentry_completed_real_quests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.94;
      utterance.pitch = 1.15;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Iniciar Misión
  const handleSelectQuest = (quest: RealQuest) => {
    if (navigator.vibrate) navigator.vibrate(10);
    sounds.playAppOpen();
    setActiveQuest(quest);
    setTimeLeft(quest.durationSeconds);
    setTimerRunning(false);
    speak(`${quest.title}. ${quest.audioSpeech}`);
  };

  // Control del Temporizador
  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setTimerRunning(false);
            sounds.playSuccess();
            speak('¡Tiempo cumplido! ¡Excelente trabajo en tu misión física!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, timeLeft]);

  // Completar Misión
  const handleCompleteQuest = () => {
    if (!activeQuest) return;
    if (navigator.vibrate) navigator.vibrate(15);
    sounds.playSuccess();

    const updated = Array.from(new Set([...completedQuestIds, activeQuest.id]));
    setCompletedQuestIds(updated);
    localStorage.setItem('zentry_completed_real_quests', JSON.stringify(updated));

    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.55 }
    });

    speak(`¡Misión completada con éxito! Has ganado la insignia: ${activeQuest.badgeReward}`);
  };

  // Cámara Phygital
  const handleStartCamera = async () => {
    setIsCameraActive(true);
    try {
      if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      speak('Toma una foto de tu misión para guardarla en tu diario de aventuras.');
    } catch (e) {
      console.warn('Camera quest error:', e);
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current || !activeQuest) return;
    sounds.playTap();
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setQuestPhotos((prev) => ({ ...prev, [activeQuest.id]: dataUrl }));
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
    handleCompleteQuest();
  };

  const filteredQuests = REAL_QUESTS_CATALOG.filter(
    (q) => selectedCategory === 'all' || q.category === selectedCategory
  );

  return (
    <ZentrySubPageScaffold
      title="Misiones Reales"
      kicker="RETOS PHYGITAL FUERA DE PANTALLA"
      onBack={() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        if (activeQuest) {
          setActiveQuest(null);
        } else {
          onBack();
        }
      }}
      isDark={isDark}
    >
      <div className="w-full h-full flex flex-col justify-between p-2 md:p-4 space-y-4 overflow-y-auto no-scrollbar max-w-3xl mx-auto">
        {/* ========================================================= */}
        {/* VISTA 1: CATÁLOGO DE MISIONES POR CATEGORÍAS              */}
        {/* ========================================================= */}
        {!activeQuest && (
          <>
            {/* Filtros de Categoría */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {[
                { id: 'all', label: 'Todas las Misiones', icon: '🌟' },
                { id: 'movement', label: 'Movimiento', icon: '🏃' },
                { id: 'curiosity', label: 'Curiosidad', icon: '🔍' },
                { id: 'habits', label: 'Hábitos en Casa', icon: '🤝' },
                { id: 'crafts', label: 'Creación Física', icon: '🧱' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(5);
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3.5 py-2 rounded-full text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer flex-shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md scale-105'
                      : 'bg-white/60 dark:bg-white/10 text-slate-700 dark:text-white border-black/5'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Grid de Tarjetas de Misiones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
              {filteredQuests.map((quest) => {
                const isCompleted = completedQuestIds.includes(quest.id);

                return (
                  <div
                    key={quest.id}
                    onClick={() => handleSelectQuest(quest)}
                    className={`p-4.5 rounded-[32px] border transition-all cursor-pointer active:scale-98 shadow-lg flex flex-col justify-between group ${
                      isCompleted
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-950 dark:text-emerald-200'
                        : 'bg-white/50 dark:bg-white/10 border-white/60 dark:border-white/15 text-slate-800 dark:text-white hover:bg-white/70'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-[18px] bg-gradient-to-br ${quest.gradient} text-white flex items-center justify-center text-2xl shadow-md`}>
                          {quest.icon}
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-300">
                            {quest.categoryLabel}
                          </span>
                          <h4 className="text-xs md:text-sm font-black">{quest.title}</h4>
                        </div>
                      </div>

                      {isCompleted && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      )}
                    </div>

                    <p className="text-xs opacity-80 line-clamp-2 my-2.5 leading-relaxed">
                      {quest.description}
                    </p>

                    <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px] font-bold">
                      <span className="flex items-center gap-1 opacity-70">
                        <Timer className="w-3.5 h-3.5" />
                        {Math.floor(quest.durationSeconds / 60)} min
                      </span>
                      <span className="text-purple-600 dark:text-purple-300 group-hover:translate-x-1 transition-transform">
                        Iniciar Reto →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vitrina de Insignias y Logros */}
            <div className="p-4 rounded-[28px] bg-white/40 dark:bg-white/10 backdrop-blur-md border border-white/60 dark:border-white/10 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-amber-500" />
                <div>
                  <span className="text-[10px] font-bold uppercase opacity-60 block">Insignias Ganadas</span>
                  <span className="text-xs font-black">
                    {completedQuestIds.length} de {REAL_QUESTS_CATALOG.length} Retos Completados
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-amber-500 font-black text-xs">
                <Flame className="w-4 h-4" />
                <span>Racha Activa</span>
              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* VISTA 2: MISIÓN ACTIVA + TEMPORIZADOR CIRCADIANO           */}
        {/* ========================================================= */}
        {activeQuest && (
          <div className="space-y-4 max-w-xl mx-auto w-full animate-in zoom-in-95 duration-200">
            {/* Tarjeta del Reto */}
            <div className={`p-6 rounded-[36px] bg-gradient-to-br ${activeQuest.gradient} text-white shadow-2xl space-y-4 text-center relative overflow-hidden border border-white/30`}>
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl mx-auto shadow-inner">
                {activeQuest.icon}
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-white/80">
                  {activeQuest.categoryLabel}
                </span>
                <h3 className="text-lg md:text-xl font-black">{activeQuest.title}</h3>
                <p className="text-xs text-white/90 leading-relaxed pt-1">
                  {activeQuest.description}
                </p>
              </div>

              <button
                onClick={() => speak(activeQuest.audioSpeech)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-xs font-bold cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>Escuchar Instrucción</span>
              </button>
            </div>

            {/* Temporizador Circadiano Visual */}
            <div className="p-5 rounded-[32px] bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-white/60 dark:border-white/15 shadow-xl flex flex-col items-center justify-center space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-slate-700 dark:text-white uppercase tracking-wider">
                <Timer className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                <span>Tiempo para cumplir el reto</span>
              </div>

              <div className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tight font-mono">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTimerRunning((prev) => !prev)}
                  className="px-6 py-2.5 rounded-full bg-purple-600 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{timerRunning ? 'Pausar' : 'Iniciar Tiempo'}</span>
                </button>

                <button
                  onClick={() => {
                    setTimerRunning(false);
                    setTimeLeft(activeQuest.durationSeconds);
                  }}
                  className="p-2.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white cursor-pointer active:scale-95"
                  title="Reiniciar"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Acciones de Validación */}
            <div className="flex items-center gap-3">
              {/* Foto de Validación */}
              <button
                onClick={handleStartCamera}
                className="flex-1 py-4 rounded-[28px] bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Foto de Misión</span>
              </button>

              {/* Botón Misión Cumplida */}
              <button
                onClick={handleCompleteQuest}
                className="flex-1 py-4 rounded-[28px] bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Ya lo Hice!</span>
              </button>
            </div>

            {/* Foto Guardada */}
            {questPhotos[activeQuest.id] && (
              <div className="p-3 rounded-[24px] bg-emerald-500/10 border border-emerald-400 flex items-center gap-3">
                <img src={questPhotos[activeQuest.id]} alt="Logro" className="w-16 h-12 object-cover rounded-[14px]" />
                <div>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-300 block">
                    ¡Foto de Logro Guardada!
                  </span>
                  <span className="text-[10px] opacity-70">Se ha guardado en tu bitácora familiar.</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL CÁMARA PHYGITAL DE VALIDACIÓN                       */}
        {/* ========================================================= */}
        {isCameraActive && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 animate-in fade-in">
            <div className="flex items-center justify-between text-white px-2 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">📸</span>
                <h3 className="text-sm font-black">Foto del Reto Cumplido</h3>
              </div>
              <button
                onClick={() => {
                  if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
                  setIsCameraActive(false);
                }}
                className="px-4 py-1.5 rounded-full bg-white/20 text-xs font-bold cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <div className="relative flex-1 rounded-[32px] overflow-hidden my-3 border-2 border-emerald-400/60 shadow-2xl flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>

            <div className="flex items-center justify-center pb-4">
              <button
                onClick={handleCapturePhoto}
                className="w-20 h-20 rounded-full bg-white p-1.5 shadow-2xl flex items-center justify-center cursor-pointer active:scale-90"
              >
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                  <Camera className="w-8 h-8" />
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </ZentrySubPageScaffold>
  );
};

export default ZentryRealMissionsScreen;
