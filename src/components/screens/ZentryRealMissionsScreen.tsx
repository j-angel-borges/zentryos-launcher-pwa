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
  Check,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { saveMissionToFirestore } from '../../services/firebase';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

interface RealQuest {
  id: string;
  category: 'movement' | 'curiosity' | 'habits' | 'crafts';
  categoryLabel: string;
  title: string;
  shortAction: string;
  description: string;
  durationSeconds: number;
  icon: string;
  gradient: string;
  audioSpeech: string;
  badgeReward: string;
}

const REAL_QUESTS_12_CATALOG: RealQuest[] = [
  {
    id: 'm1_canguro',
    category: 'movement',
    categoryLabel: 'Movimiento',
    title: 'El Salto del Canguro',
    shortAction: 'Salta sobre 3 cojines en fila',
    description: 'Coloca 3 cojines en el suelo y salta sobre ellos con pies juntos sin tocarlos.',
    durationSeconds: 90,
    icon: '🦘',
    gradient: 'from-blue-500 to-indigo-600',
    audioSpeech: '¡Misión del Canguro! Coloca tres cojines en fila y da saltos con ambos pies juntos.',
    badgeReward: '🏅 Salto de Campeón'
  },
  {
    id: 'm2_flamenco',
    category: 'movement',
    categoryLabel: 'Movimiento',
    title: 'El Flamenco Real',
    shortAction: 'Equilibrio en 1 pie por 10 seg',
    description: 'Párate en un solo pie con los brazos abiertos como alas durante 10 segundos.',
    durationSeconds: 60,
    icon: '🦩',
    gradient: 'from-pink-500 to-rose-600',
    audioSpeech: '¡Misión del Flamenco! Párate en un solo pie con los brazos abiertos durante diez segundos.',
    badgeReward: '🧘 Equilibrio de Cristal'
  },
  {
    id: 'm3_amarillo',
    category: 'curiosity',
    categoryLabel: 'Curiosidad',
    title: 'El Detective Amarillo',
    shortAction: 'Busca 3 cosas amarillas en casa',
    description: 'Explora tu casa y encuentra 3 objetos que sean de color amarillo o dorado brillante.',
    durationSeconds: 120,
    icon: '🟡',
    gradient: 'from-amber-400 to-yellow-600',
    audioSpeech: '¡Misión Detective! Busca y reúne tres objetos amarillos o dorados en tu casa.',
    badgeReward: '🔍 Ojo de Águila'
  },
  {
    id: 'm4_texturas',
    category: 'curiosity',
    categoryLabel: 'Curiosidad',
    title: 'Explorador de Texturas',
    shortAction: 'Toca algo suave, rugoso y frío',
    description: 'Toca y compara 3 superficies diferentes: un peluche suave, algo rugoso y algo frío.',
    durationSeconds: 90,
    icon: '🧶',
    gradient: 'from-purple-500 to-indigo-600',
    audioSpeech: '¡Misión de Sentidos! Toca un peluche suave, algo rugoso y algo frío.',
    badgeReward: '🖐️ Sentido Mágico'
  },
  {
    id: 'm5_orden',
    category: 'habits',
    categoryLabel: 'Hábitos',
    title: 'El Súper Orden',
    shortAction: 'Guarda 5 juguetes en su lugar',
    description: 'Recoge y guarda 5 juguetes o libros en su sitio para dejar tu espacio impecable.',
    durationSeconds: 120,
    icon: '🧸',
    gradient: 'from-emerald-500 to-teal-600',
    audioSpeech: '¡Misión del Súper Orden! Guarda cinco juguetes o libros en su lugar.',
    badgeReward: '⭐ Guardián del Hogar'
  },
  {
    id: 'm6_abrazo',
    category: 'habits',
    categoryLabel: 'Hábitos',
    title: 'El Abrazo Mágico',
    shortAction: 'Da un abrazo cariñoso de 5 seg',
    description: 'Acércate a un familiar o a tu mascota y dale un abrazo fuerte y calientito.',
    durationSeconds: 45,
    icon: '🤗',
    gradient: 'from-rose-500 to-pink-600',
    audioSpeech: '¡Misión del Corazón! Dale un abrazo cálido y cariñoso a alguien de tu familia.',
    badgeReward: '💖 Corazón Radiante'
  },
  {
    id: 'm7_torre',
    category: 'crafts',
    categoryLabel: 'Creación',
    title: 'La Gran Torre',
    shortAction: 'Apila 4 cojines sin que caigan',
    description: 'Construye una torre alta con 4 cojines o almohadas y cuéntale 5 segundos de pie.',
    durationSeconds: 120,
    icon: '🏰',
    gradient: 'from-fuchsia-500 to-purple-700',
    audioSpeech: '¡Misión de Construcción! Apila cuatro cojines para formar una gran torre resistente.',
    badgeReward: '🧱 Gran Arquitecto'
  },
  {
    id: 'm8_ranita',
    category: 'movement',
    categoryLabel: 'Movimiento',
    title: 'El Salto de la Ranita',
    shortAction: 'Da 5 saltos en cuclillas con croac',
    description: 'Ponte en cuclillas y da 5 saltos hacia adelante diciendo ¡croac croac!',
    durationSeconds: 60,
    icon: '🐸',
    gradient: 'from-green-500 to-emerald-700',
    audioSpeech: '¡Misión de la Ranita! Agáchate y da cinco saltos de rana diciendo croac croac.',
    badgeReward: '🍃 Ranita Veloz'
  },
  {
    id: 'm9_plantas',
    category: 'curiosity',
    categoryLabel: 'Curiosidad',
    title: 'El Amigo de las Plantas',
    shortAction: 'Encuentra una planta y dale cariño',
    description: 'Busca una planta o flor en casa, mírala de cerca y dale un soplido de aire fresco.',
    durationSeconds: 60,
    icon: '🌿',
    gradient: 'from-teal-500 to-green-600',
    audioSpeech: '¡Misión de la Naturaleza! Busca una plantita en casa y dale un soplido mágico de cariño.',
    badgeReward: '🌱 Guardián Verde'
  },
  {
    id: 'm10_oso',
    category: 'movement',
    categoryLabel: 'Movimiento',
    title: 'La Caminata del Oso',
    shortAction: 'Camina en 4 patas por 15 pasos',
    description: 'Apoya manos y pies en el suelo y camina con pasos gigantes y pesados como un oso.',
    durationSeconds: 90,
    icon: '🐻',
    gradient: 'from-amber-600 to-orange-800',
    audioSpeech: '¡Misión del Oso! Camina en cuatro patas por tu sala dando quince pasos pesados.',
    badgeReward: '🐾 Fuerza de Oso'
  },
  {
    id: 'm11_rojo',
    category: 'curiosity',
    categoryLabel: 'Curiosidad',
    title: 'La Búsqueda Roja',
    shortAction: 'Encuentra 2 cosas de color rojo',
    description: 'Busca con atención y encuentra 2 objetos de color rojo vivo en tu habitación o cocina.',
    durationSeconds: 90,
    icon: '🔴',
    gradient: 'from-red-500 to-rose-700',
    audioSpeech: '¡Misión Roja! Busca rápido dos objetos de color rojo brillante en tu casa.',
    badgeReward: '🔥 Chispa Veloz'
  },
  {
    id: 'm12_estatua',
    category: 'movement',
    categoryLabel: 'Movimiento',
    title: 'El Baile de la Estatua',
    shortAction: 'Baila y congélata 5 segundos',
    description: 'Baila alocadamente y cuando cuentes 3, quédate totalmente inmóvil como una estatua.',
    durationSeconds: 60,
    icon: '🎶',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    audioSpeech: '¡Misión de la Estatua! Mueve tu cuerpo bailando y luego quédate quieto como estatua cinco segundos.',
    badgeReward: '🗿 Estatua de Oro'
  }
];

export const ZentryRealMissionsScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeQuest, setActiveQuest] = useState<RealQuest | null>(null);

  // Temporizador Circadiano
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // Cámara Phygital
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [questPhotos, setQuestPhotos] = useState<Record<string, string>>({});

  // Firestore Sync & Local Storage
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
      utterance.pitch = 1.18;
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

  // Bienvenida guiada por el asistente de voz al entrar
  useEffect(() => {
    speak('¡Haz clic y empieza el reto!');
    return () => {
      stopVoice();
    };
  }, []);

  // Seleccionar Misión
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
            speak('¡Tiempo cumplido! ¡Excelente trabajo en tu reto!');
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

  // Completar Misión (Guardado Local + Firestore GCP)
  const handleCompleteQuest = async () => {
    if (!activeQuest) return;
    if (navigator.vibrate) navigator.vibrate(15);
    sounds.playSuccess();

    const updated = Array.from(new Set([...completedQuestIds, activeQuest.id]));
    setCompletedQuestIds(updated);
    localStorage.setItem('zentry_completed_real_quests', JSON.stringify(updated));

    // Persistencia en Firestore (GCP)
    await saveMissionToFirestore({
      id: activeQuest.id,
      title: activeQuest.title,
      category: activeQuest.category,
      badgeReward: activeQuest.badgeReward,
      photoUrl: questPhotos[activeQuest.id]
    });

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
      speak('Toma una foto de tu misión para guardarla en tu diario de logros.');
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

  const filteredQuests = REAL_QUESTS_12_CATALOG.filter(
    (q) => selectedCategory === 'all' || q.category === selectedCategory
  );

  return (
    <ZentrySubPageScaffold
      title="Misiones"
      kicker="RETOS REALES FUERA DE PANTALLA"
      onBack={() => {
        stopVoice();
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
        {/* VISTA 1: CATÁLOGO DE LAS 12 MISIONES REALES              */}
        {/* ========================================================= */}
        {!activeQuest && (
          <>
            {/* Cabecera con Botón de Voz Principal */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-purple-600 dark:text-purple-300">
                  🎯 12 Retos Activos
                </span>
              </div>
              <button
                onClick={() => speak('¡Elige un reto, haz clic y empieza a moverte en casa!')}
                className="p-2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce text-pink-400' : ''}`} />
                <span>¿Cómo jugar?</span>
              </button>
            </div>

            {/* Filtros de Categoría */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {[
                { id: 'all', label: 'Todos (12)', icon: '🌟' },
                { id: 'movement', label: 'Movimiento', icon: '🏃' },
                { id: 'curiosity', label: 'Curiosidad', icon: '🔍' },
                { id: 'habits', label: 'Hábitos en Casa', icon: '🤝' },
                { id: 'crafts', label: 'Creación', icon: '🧱' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(5);
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer flex-shrink-0 ${
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

            {/* Grid de las 12 Misiones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
              {filteredQuests.map((quest) => {
                const isCompleted = completedQuestIds.includes(quest.id);

                return (
                  <div
                    key={quest.id}
                    onClick={() => handleSelectQuest(quest)}
                    className={`p-4 rounded-[28px] border transition-all cursor-pointer active:scale-98 shadow-md flex flex-col justify-between group ${
                      isCompleted
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-950 dark:text-emerald-200'
                        : 'bg-white/50 dark:bg-white/10 border-white/60 dark:border-white/15 text-slate-800 dark:text-white hover:bg-white/70'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-[16px] bg-gradient-to-br ${quest.gradient} text-white flex items-center justify-center text-xl shadow-md flex-shrink-0`}>
                          {quest.icon}
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-300 block">
                            {quest.categoryLabel}
                          </span>
                          <h4 className="text-xs md:text-sm font-black">{quest.title}</h4>
                        </div>
                      </div>

                      {/* BOTÓN DE VOLUMEN 🔊 (Habla al hacer clic) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speak(`${quest.title}. ${quest.audioSpeech}`);
                        }}
                        className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-purple-600 dark:text-purple-300 cursor-pointer"
                        title="Escuchar Reto"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-[11px] font-bold opacity-85 line-clamp-1 my-2">
                      👉 {quest.shortAction}
                    </p>

                    <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px] font-bold">
                      <span className="flex items-center gap-1 opacity-70">
                        <Timer className="w-3.5 h-3.5" />
                        {Math.floor(quest.durationSeconds / 60)} min
                      </span>
                      <span className="text-purple-600 dark:text-purple-300 group-hover:translate-x-1 transition-transform">
                        {isCompleted ? '⭐ Cumplido' : 'Empezar →'}
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
                  <span className="text-[10px] font-bold uppercase opacity-60 block">Insignias Guardadas en Firestore</span>
                  <span className="text-xs font-black">
                    {completedQuestIds.length} de 12 Retos Completados
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-amber-500 font-black text-xs">
                <Flame className="w-4 h-4" />
                <span>Racha Zentry</span>
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
            <div className={`p-6 rounded-[36px] bg-gradient-to-br ${activeQuest.gradient} text-white shadow-2xl space-y-3 text-center relative overflow-hidden border border-white/30`}>
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl mx-auto shadow-inner">
                {activeQuest.icon}
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-white/80">
                  {activeQuest.categoryLabel}
                </span>
                <h3 className="text-lg md:text-xl font-black">{activeQuest.title}</h3>
                <p className="text-xs text-white/90 leading-relaxed pt-1 font-bold">
                  {activeQuest.description}
                </p>
              </div>

              {/* BOTÓN DE VOLUMEN EN LA MISIÓN ACTIVA */}
              <button
                onClick={() => speak(activeQuest.audioSpeech)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/25 hover:bg-white/35 text-xs font-black cursor-pointer shadow-md"
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce text-yellow-300' : ''}`} />
                <span>Escuchar Instrucción en Voz Alta</span>
              </button>
            </div>

            {/* Temporizador Circadiano Visual */}
            <div className="p-5 rounded-[32px] bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-white/60 dark:border-white/15 shadow-xl flex flex-col items-center justify-center space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-slate-700 dark:text-white uppercase tracking-wider">
                <Timer className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                <span>Tiempo del Reto</span>
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
                  title="Reiniciar Tiempo"
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
                <span>Tomar Foto</span>
              </button>

              {/* Botón ¡LOGRADO! (Guarda en Firestore) */}
              <button
                onClick={handleCompleteQuest}
                className="flex-1 py-4 rounded-[28px] bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Logrado!</span>
              </button>
            </div>

            {/* Foto Guardada */}
            {questPhotos[activeQuest.id] && (
              <div className="p-3 rounded-[24px] bg-emerald-500/10 border border-emerald-400 flex items-center gap-3">
                <img src={questPhotos[activeQuest.id]} alt="Logro" className="w-16 h-12 object-cover rounded-[14px]" />
                <div>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-300 block">
                    ¡Foto Guardada y Sincronizada!
                  </span>
                  <span className="text-[10px] opacity-70">Guardado en Firestore de GCP.</span>
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
