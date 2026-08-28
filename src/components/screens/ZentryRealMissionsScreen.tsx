import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Volume2,
  Sparkles,
  Trophy,
  CheckCircle2,
  RotateCw,
  Award,
  Play,
  Pause,
  X,
  Flame,
  Zap,
  Star,
  RefreshCw,
  Footprints,
  Compass,
  Check,
  VolumeX,
  Timer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';
import { saveCompletedMissionToFirestore } from '../../services/firebase';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export type QuestCategory =
  | 'gross_motor'
  | 'balance'
  | 'speed_agility'
  | 'coordination'
  | 'flexibility'
  | 'sensory';

export interface MovementQuest {
  id: string;
  emoji: string;
  name: string;
  category: QuestCategory;
  categoryLabel: string;
  shortAction: string;
  action: string;
  steps: string[];
  durationSeconds: number; // 15, 30, 45, 60
  xp: number;
  speech: string;
  bgGradient: string;
  accentColor: string;
}

export interface CompletedMissionHistory {
  questId: string;
  name: string;
  emoji: string;
  action: string;
  durationSeconds: number;
  category: QuestCategory;
  xpEarned: number;
  completedAt: string;
}

export const QUESTS: MovementQuest[] = [
  {
    id: 'quest_frog',
    emoji: '🐸',
    name: 'Salto de Ranita',
    category: 'gross_motor',
    categoryLabel: 'Fuerza y Salto',
    shortAction: '¡Salta alto como ranita!',
    action: 'Agáchate en cuclillas y salta impulsándote con las piernas diciendo CROAC.',
    steps: [
      '1. Ponte en cuclillas tocando el suelo',
      '2. Salta alto con los brazos arriba',
      '3. ¡Di CROAC CROAC al aterrizar!'
    ],
    durationSeconds: 15,
    xp: 50,
    speech: '¡Reto de Ranita! ¡Agáchate y da saltos de ranita diciendo croac croac!',
    bgGradient: 'from-emerald-500 to-green-600',
    accentColor: '#10B981'
  },
  {
    id: 'quest_hero',
    emoji: '🦸‍♂️',
    name: 'Pose de Superhéroe',
    category: 'balance',
    categoryLabel: 'Equilibrio y Core',
    shortAction: '¡Vuela firme como superhéroe!',
    action: 'Párate en un pie, estira la otra pierna atrás y extiende un puño al frente.',
    steps: [
      '1. Levanta un pie hacia atrás',
      '2. Estira un puño al frente con fuerza',
      '3. ¡Mantén el vuelo espacial sin tambalear!'
    ],
    durationSeconds: 30,
    xp: 75,
    speech: '¡Reto de Superhéroe! ¡Estira tu pierna atrás, tu puño al frente y vuela por el cielo!',
    bgGradient: 'from-blue-500 to-indigo-600',
    accentColor: '#3B82F6'
  },
  {
    id: 'quest_flamingo',
    emoji: '🦩',
    name: 'Equilibrio Flamenco',
    category: 'balance',
    categoryLabel: 'Propiocepción en 1 Pie',
    shortAction: '¡Equilibrio en 1 pie sin caer!',
    action: 'Párate en un solo pie y abre tus brazos como hermosas alas rosadas.',
    steps: [
      '1. Levanta una rodilla al aire',
      '2. Abre los brazos como alas de flamenco',
      '3. ¡Cuenta mentalmente sin bajar el pie!'
    ],
    durationSeconds: 15,
    xp: 50,
    speech: '¡Reto Flamenco! ¡Haz equilibrio en un solo pie con los brazos abiertos como alas!',
    bgGradient: 'from-pink-500 to-rose-600',
    accentColor: '#EC4899'
  },
  {
    id: 'quest_speed',
    emoji: '🏃‍♂️',
    name: 'Carrera Relámpago',
    category: 'speed_agility',
    categoryLabel: 'Velocidad y Cardio',
    shortAction: '¡Corre ultra rápido en tu lugar!',
    action: 'Mueve los pies lo más rápido posible sin moverte de tu lugar como Flash.',
    steps: [
      '1. Mueve los pies rápido en el piso',
      '2. Bracea con energía a los lados',
      '3. ¡Activa la máxima velocidad turbo!'
    ],
    durationSeconds: 30,
    xp: 75,
    speech: '¡Reto Carrera Relámpago! ¡Corre en tu lugar tan rápido como puedas!',
    bgGradient: 'from-amber-500 to-orange-600',
    accentColor: '#F59E0B'
  },
  {
    id: 'quest_stars',
    emoji: '⭐',
    name: 'Alcanza las Estrellas',
    category: 'flexibility',
    categoryLabel: 'Elongación y Espalda',
    shortAction: '¡Estírate alto en puntitas!',
    action: 'Sube en puntitas de pie y estira los dos brazos hacia el techo atrapando estrellas.',
    steps: [
      '1. Levanta los talones arriba',
      '2. Estira los brazos al cielo',
      '3. ¡Abre y cierra las manos atrapando estrellitas!'
    ],
    durationSeconds: 15,
    xp: 50,
    speech: '¡Reto Estelar! ¡Ponte en puntitas y estira tus brazos al techo tocando las estrellas!',
    bgGradient: 'from-yellow-400 to-amber-500',
    accentColor: '#EAB308'
  },
  {
    id: 'quest_ninja',
    emoji: '🥷',
    name: 'Paso Ninja Sigiloso',
    category: 'coordination',
    categoryLabel: 'Control Motor y Sigilo',
    shortAction: '¡Camina agachado en silencio!',
    action: 'Camina agachado y en puntitas por la habitación sin hacer ningún ruido.',
    steps: [
      '1. Agáchate bien bajito',
      '2. Da pasos suaves como una pluma',
      '3. ¡Cero ruido, que nadie te descubra!'
    ],
    durationSeconds: 45,
    xp: 100,
    speech: '¡Reto Ninja! ¡Camina agachado de puntitas en absoluto silencio como un ninja secreto!',
    bgGradient: 'from-purple-600 to-slate-900',
    accentColor: '#9333EA'
  },
  {
    id: 'quest_robot',
    emoji: '🤖',
    name: 'Baile del Robot',
    category: 'coordination',
    categoryLabel: 'Segmentación Corporal',
    shortAction: '¡Baila con movimientos robóticos!',
    action: 'Muévete con líneas rectas, giros y pausas rígidas diciendo bip-bup.',
    steps: [
      '1. Mueve los brazos en ángulos rectos',
      '2. Gira la cabeza con pausas mecánicas',
      '3. ¡Haz poses robóticas al ritmo de bip-bup!'
    ],
    durationSeconds: 30,
    xp: 75,
    speech: '¡Reto del Robot! ¡Baila haciendo movimientos mecánicos y sonidos de robot!',
    bgGradient: 'from-cyan-500 to-blue-600',
    accentColor: '#06B6D4'
  },
  {
    id: 'quest_starjumps',
    emoji: '✨',
    name: 'Saltos Estrella',
    category: 'gross_motor',
    categoryLabel: 'Sincronización Bilateral',
    shortAction: '¡Salta abriendo brazos y piernas!',
    action: 'Salta y abre brazos y piernas formando una gran estrella brillante.',
    steps: [
      '1. Empieza con pies juntos y brazos abajo',
      '2. Salta abriendo todo el cuerpo como estrella',
      '3. ¡Vuelve al centro y repite sin parar!'
    ],
    durationSeconds: 30,
    xp: 75,
    speech: '¡Reto Saltos Estrella! ¡Abre tus brazos y piernas al saltar brillando como una estrella!',
    bgGradient: 'from-violet-500 to-fuchsia-600',
    accentColor: '#8B5CF6'
  },
  {
    id: 'quest_bear',
    emoji: '🐻',
    name: 'Pasos de Oso Fuerte',
    category: 'gross_motor',
    categoryLabel: 'Locomoción Cuadrúpeda',
    shortAction: '¡Camina en 4 patas con fuerza!',
    action: 'Apoya manos y pies en el suelo y camina con pasos fuertes de oso.',
    steps: [
      '1. Manos y pies firmes en el suelo',
      '2. Avanza levantando las rodillas del piso',
      '3. ¡Camina por la sala con fuerza de oso!'
    ],
    durationSeconds: 45,
    xp: 100,
    speech: '¡Reto del Oso! ¡Camina en cuatro patas firme y fuerte como un gran oso grizzly!',
    bgGradient: 'from-amber-700 to-stone-800',
    accentColor: '#D97706'
  },
  {
    id: 'quest_crab',
    emoji: '🦀',
    name: 'Cangrejo Veloz',
    category: 'coordination',
    categoryLabel: 'Cadena Posterior y Lateral',
    shortAction: '¡Camina hacia atrás y de lado!',
    action: 'Apoya manos y pies mirando al techo, levanta la cadera y camina de lado.',
    steps: [
      '1. Siéntate y apoya manos y pies',
      '2. Levanta la pancita del suelo',
      '3. ¡Desplázate hacia los lados como cangrejito!'
    ],
    durationSeconds: 30,
    xp: 75,
    speech: '¡Reto del Cangrejo! ¡Levanta tu cuerpo apoyando manos y pies y camina de lado!',
    bgGradient: 'from-orange-500 to-red-600',
    accentColor: '#F97316'
  },
  {
    id: 'quest_lion',
    emoji: '🦁',
    name: 'Rugido del León',
    category: 'sensory',
    categoryLabel: 'Expansión Torácica y Voz',
    shortAction: '¡Estírate y ruge con valentía!',
    action: 'Ponte en 4 patas, arquea la espalda, abre la boca y da 3 rugidos valientes.',
    steps: [
      '1. Manos y rodillas en el piso',
      '2. Inhala aire inflando tu pecho de león',
      '3. ¡Abre la boca y suelta un rugido poderoso!'
    ],
    durationSeconds: 15,
    xp: 50,
    speech: '¡Reto del León! ¡Abre grande la boca y da tres rugidos valientes y fuertes!',
    bgGradient: 'from-yellow-500 to-orange-600',
    accentColor: '#EAB308'
  },
  {
    id: 'quest_trex',
    emoji: '🦖',
    name: 'Pisadas de T-Rex',
    category: 'gross_motor',
    categoryLabel: 'Impacto y Resistencia',
    shortAction: '¡Pisadas gigantes que hagan temblar!',
    action: 'Brazos cortos pegados al pecho y da pasos pesados haciendo temblar el suelo.',
    steps: [
      '1. Dobla tus bracitos como mini garras de dinosaurio',
      '2. Levanta alto las rodillas',
      '3. ¡Pisa fuerte el piso marcando el ritmo!'
    ],
    durationSeconds: 60,
    xp: 120,
    speech: '¡Reto Dinosaurio! ¡Da pisadas gigantes y pesadas haciendo temblar el suelo como un T-Rex!',
    bgGradient: 'from-emerald-600 to-teal-800',
    accentColor: '#059669'
  }
];

type ChallengeState = 'idle' | 'ready' | 'running' | 'paused' | 'completed';

export const ZentryRealMissionsScreen: React.FC<Props> = ({ onBack, isDark }) => {
  // Navigation & View Mode
  const [viewTab, setViewTab] = useState<'wheel' | 'catalog' | 'history'>('wheel');

  // Active Quest & Challenge State
  const [activeQuest, setActiveQuest] = useState<MovementQuest | null>(null);
  const [challengeState, setChallengeState] = useState<ChallengeState>('idle');
  const [secondsLeft, setSecondsLeft] = useState<number>(15);
  const [totalSeconds, setTotalSeconds] = useState<number>(15);

  // Wheel Spin State
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);

  // Gamification Stats State (Dual Persistence: localStorage + Firestore)
  const [medals, setMedals] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zentry_real_medals');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [totalXp, setTotalXp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('zentry_real_xp');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [streak, setStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('zentry_real_streak');
      return saved ? parseInt(saved, 10) || 1 : 1;
    } catch {
      return 1;
    }
  });

  const [history, setHistory] = useState<CompletedMissionHistory[]>(() => {
    try {
      const saved = localStorage.getItem('zentry_real_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // Circumference calculation for animated circular SVG countdown timer
  // Radius r = 70 -> C = 2 * PI * 70 = 439.8229715
  const TIMER_RADIUS = 70;
  const CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS; // ~439.82

  const progressRatio = totalSeconds > 0 ? Math.max(0, Math.min(1, secondsLeft / totalSeconds)) : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progressRatio);

  const isUrgent = secondsLeft <= 5 && challengeState === 'running';

  // Speak helper
  const speakText = useCallback(
    (text: string) => {
      if (isMuted) return;
      sounds.playTap();
      voiceService.speakFeedback(text);
    },
    [isMuted]
  );

  // Select Quest handler
  const handleSelectQuest = (quest: MovementQuest) => {
    sounds.playTap();
    setActiveQuest(quest);
    setTotalSeconds(quest.durationSeconds);
    setSecondsLeft(quest.durationSeconds);
    setChallengeState('ready');
    speakText(quest.speech);
  };

  // Wheel Spin handler
  const handleSpin = () => {
    if (isSpinning || challengeState === 'running') return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(12);
    }
    sounds.playTap();
    setIsSpinning(true);
    setChallengeState('idle');

    const randomIndex = Math.floor(Math.random() * QUESTS.length);
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const anglePerItem = 360 / QUESTS.length;
    const targetAngle = rotation + extraSpins * 360 + randomIndex * anglePerItem;

    setRotation(targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      const chosen = QUESTS[randomIndex];
      setActiveQuest(chosen);
      setTotalSeconds(chosen.durationSeconds);
      setSecondsLeft(chosen.durationSeconds);
      setChallengeState('ready');
      sounds.playSuccess();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      speakText(chosen.speech);
    }, 2400);
  };

  // Start Challenge Timer
  const handleStartChallenge = () => {
    if (!activeQuest) return;
    sounds.playTap();
    setChallengeState('running');
    speakText('¡En sus marcas, listos, muévete!');
  };

  // Pause / Resume Challenge Timer
  const handleTogglePause = () => {
    if (challengeState === 'running') {
      sounds.playTap();
      setChallengeState('paused');
    } else if (challengeState === 'paused') {
      sounds.playTap();
      setChallengeState('running');
    }
  };

  // Cancel Challenge
  const handleCancelChallenge = () => {
    sounds.playTap();
    if (timerRef.current) clearInterval(timerRef.current);
    if (activeQuest) {
      setSecondsLeft(activeQuest.durationSeconds);
    }
    setChallengeState('ready');
  };

  // Full Reset to Wheel
  const handleResetToWheel = () => {
    sounds.playTap();
    if (timerRef.current) clearInterval(timerRef.current);
    setActiveQuest(null);
    setChallengeState('idle');
  };

  // Complete Challenge logic
  const handleCompleteChallenge = useCallback(
    (quest: MovementQuest) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setChallengeState('completed');
      setSecondsLeft(0);

      // Procedural Audio Fanfare & Haptics
      sounds.playVictoryFanfare();
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([20, 50, 20, 50, 40]);
      }

      // Celebratory Confetti particle bursts
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 120,
          spread: 110,
          origin: { y: 0.45 },
          colors: ['#06B6D4', '#F59E0B', '#EC4899', '#10B981', '#8B5CF6']
        });
      }, 250);

      // Update Medals
      const nextMedals = [quest.emoji, ...medals.slice(0, 19)];
      setMedals(nextMedals);
      try {
        localStorage.setItem('zentry_real_medals', JSON.stringify(nextMedals));
      } catch {}

      // Update XP
      const nextXp = totalXp + quest.xp;
      setTotalXp(nextXp);
      try {
        localStorage.setItem('zentry_real_xp', nextXp.toString());
      } catch {}

      // Update Streak
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      try {
        localStorage.setItem('zentry_real_streak', nextStreak.toString());
      } catch {}

      // Update History
      const newRecord: CompletedMissionHistory = {
        questId: quest.id,
        name: quest.name,
        emoji: quest.emoji,
        action: quest.action,
        durationSeconds: quest.durationSeconds,
        category: quest.category,
        xpEarned: quest.xp,
        completedAt: new Date().toISOString()
      };
      const nextHistory = [newRecord, ...history.slice(0, 29)];
      setHistory(nextHistory);
      try {
        localStorage.setItem('zentry_real_history', JSON.stringify(nextHistory));
      } catch {}

      // Google Cloud Firestore Dual Sync
      saveCompletedMissionToFirestore({
        id: quest.id,
        name: quest.name,
        emoji: quest.emoji,
        action: quest.action
      });

      // Voice Feedback
      if (!isMuted) {
        voiceService.speakFeedback(
          `¡Increíble trabajo! ¡Cumpliste el reto ${quest.name}, ganaste ${quest.xp} puntos de experiencia y una nueva medalla!`
        );
      }
    },
    [medals, totalXp, streak, history, isMuted]
  );

  // Active Timer Effect
  useEffect(() => {
    if (challengeState === 'running') {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          const nextSec = prev - 1;
          const urgentTick = nextSec <= 5;
          sounds.playTimerTick(urgentTick);

          if (nextSec <= 0) {
            if (activeQuest) {
              handleCompleteChallenge(activeQuest);
            }
            return 0;
          }
          return nextSec;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [challengeState, activeQuest, handleCompleteChallenge]);

  // Initial welcome greeting
  useEffect(() => {
    voiceService.speakFeedback('¡Toca la ruleta de retos físicos o elige una misión para moverte!');
  }, []);

  // Determine Timer Stroke Gradient / Color
  const getTimerStroke = () => {
    if (isUrgent || progressRatio <= 0.2) return 'url(#timerGradCrimson)';
    if (progressRatio <= 0.5) return 'url(#timerGradAmber)';
    return 'url(#timerGradCyan)';
  };

  const getTimerGlowClass = () => {
    if (isUrgent || progressRatio <= 0.2) return 'drop-shadow-[0_0_16px_rgba(239,68,68,0.85)]';
    if (progressRatio <= 0.5) return 'drop-shadow-[0_0_14px_rgba(245,158,11,0.75)]';
    return 'drop-shadow-[0_0_14px_rgba(6,182,212,0.75)]';
  };

  return (
    <ZentrySubPageScaffold title="Misiones Reales" kicker="MOVIMIENTO Y RETOS" onBack={onBack} isDark={isDark}>
      <div className="w-full h-full flex flex-col items-center justify-between p-2 md:p-4 space-y-3 overflow-y-auto no-scrollbar select-none pb-12">
        {/* Top Gamification Bar: XP, Streak & Medals */}
        <div className="w-full max-w-lg flex items-center justify-between px-3 py-2 rounded-2xl bg-[#120E24]/90 border border-white/15 backdrop-blur-md shadow-lg">
          {/* Streak Counter */}
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-orange-400 shadow-inner">
              <Flame className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-white/50 block leading-tight">RACHA</span>
              <span className="text-xs font-black text-orange-300">{streak} Retos</span>
            </div>
          </div>

          {/* Total XP Counter */}
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 shadow-inner">
              <Star className="w-4 h-4 fill-amber-300" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-white/50 block leading-tight">EXP TOTAL</span>
              <span className="text-xs font-black text-amber-300">{totalXp} XP</span>
            </div>
          </div>

          {/* Medals Count */}
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-inner">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-white/50 block leading-tight">MEDALLAS</span>
              <span className="text-xs font-black text-purple-300">{medals.length} Ganadas</span>
            </div>
          </div>

          {/* Audio Mute Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isMuted ? 'bg-red-500/20 border-red-500/50 text-red-300' : 'bg-white/10 border-white/20 text-white/80'
            }`}
            title={isMuted ? 'Activar voz' : 'Silenciar voz'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* View Switcher Tabs (Ruleta / Catálogo / Historial) */}
        {challengeState === 'idle' && (
          <div className="w-full max-w-lg flex items-center gap-2 p-1 rounded-2xl bg-white/5 border border-white/10">
            <button
              onClick={() => setViewTab('wheel')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                viewTab === 'wheel'
                  ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-slate-950 shadow-md scale-102'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Ruleta Mágica</span>
            </button>
            <button
              onClick={() => setViewTab('catalog')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                viewTab === 'catalog'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md scale-102'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>12 Retos</span>
            </button>
            <button
              onClick={() => setViewTab('history')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                viewTab === 'history'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md scale-102'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Medallas ({medals.length})</span>
            </button>
          </div>
        )}

        {/* MAIN DISPLAY: ACTIVE CHALLENGE OR NAVIGATION */}
        {challengeState !== 'idle' && activeQuest ? (
          /* ACTIVE / READY / RUNNING / PAUSED / COMPLETED CHALLENGE CARD */
          <div className="w-full max-w-md flex flex-col items-center gap-3 p-5 rounded-[32px] bg-[#120E24]/95 border-2 border-purple-400/50 shadow-2xl animate-spring-in text-center relative overflow-hidden">
            {/* Background Glow Mesh */}
            <div
              className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ backgroundColor: activeQuest.accentColor }}
            />
            <div
              className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: activeQuest.accentColor }}
            />

            {/* Header: Category Badge & XP */}
            <div className="w-full flex items-center justify-between z-10">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/10 text-white/90 border border-white/15">
                {activeQuest.categoryLabel}
              </span>
              <div className="flex items-center gap-1 text-amber-300 font-black text-xs bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30">
                <Zap className="w-3.5 h-3.5 fill-amber-300" />
                <span>+{activeQuest.xp} XP</span>
              </div>
            </div>

            {/* ANIMATED CIRCULAR SVG COUNTDOWN MOVEMENT TIMER */}
            <div className="relative w-44 h-44 flex items-center justify-center my-1 z-10 select-none">
              <svg className={`w-full h-full -rotate-90 ${getTimerGlowClass()}`} viewBox="0 0 180 180">
                <defs>
                  {/* Cyan to Emerald Gradient */}
                  <linearGradient id="timerGradCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                  {/* Amber to Gold Gradient */}
                  <linearGradient id="timerGradAmber" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#FBBF24" />
                  </linearGradient>
                  {/* Crimson to Coral Gradient */}
                  <linearGradient id="timerGradCrimson" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="100%" stopColor="#F43F5E" />
                  </linearGradient>
                </defs>

                {/* Outer Glass Track */}
                <circle
                  cx="90"
                  cy="90"
                  r={TIMER_RADIUS}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="12"
                />

                {/* Animated Fill Countdown Arc */}
                <circle
                  cx="90"
                  cy="90"
                  r={TIMER_RADIUS}
                  fill="none"
                  stroke={getTimerStroke()}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  style={{
                    strokeDashoffset: challengeState === 'ready' ? 0 : strokeDashoffset,
                    transition: challengeState === 'running' ? 'stroke-dashoffset 0.95s linear, stroke 0.4s ease' : 'all 0.3s ease'
                  }}
                />
              </svg>

              {/* Central Time & Emoji Counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl filter drop-shadow-md mb-0.5 animate-bounce">
                  {activeQuest.emoji}
                </span>
                <span
                  className={`text-4xl font-black text-white tracking-tight tabular-nums transition-transform ${
                    isUrgent ? 'animate-ping text-rose-400 scale-110' : ''
                  }`}
                >
                  {secondsLeft}
                </span>
                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest mt-0.5">
                  {challengeState === 'paused'
                    ? 'EN PAUSA'
                    : isUrgent
                    ? '¡FINAL!'
                    : challengeState === 'completed'
                    ? '¡LOGRADO!'
                    : 'SEGUNDOS'}
                </span>
              </div>
            </div>

            {/* Mission Name & Action Prompt */}
            <div className="space-y-1 z-10">
              <h3 className="text-lg font-black text-white drop-shadow-md flex items-center justify-center gap-1.5">
                {activeQuest.name}
              </h3>
              <p className="text-xs font-bold text-amber-300 max-w-xs">
                {activeQuest.action}
              </p>
            </div>

            {/* Step-by-Step Kid Action Prompts (Collapsible / Visual Cards) */}
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-2.5 space-y-1.5 text-left z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-white/50 uppercase tracking-wider">
                  Pasos del Reto
                </span>
                <button
                  onClick={() => speakText(activeQuest.speech)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-purple-200 flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Escuchar</span>
                </button>
              </div>
              <div className="space-y-1">
                {activeQuest.steps.map((st, idx) => (
                  <div
                    key={idx}
                    className="text-xs font-medium text-white/90 bg-white/5 px-2.5 py-1 rounded-xl flex items-center gap-1.5"
                  >
                    <span className="text-amber-400 font-black">•</span>
                    <span>{st}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CHALLENGE CONTROLS STATE MACHINE */}
            <div className="w-full flex flex-col gap-2 pt-1 z-10">
              {challengeState === 'ready' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetToWheel}
                    className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center cursor-pointer border border-white/15"
                    title="Elegir otro reto"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleStartChallenge}
                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-xl border-2 border-white cursor-pointer active:scale-95 zentry-spring-press"
                  >
                    <Play className="w-5 h-5 fill-slate-950" />
                    <span>¡EMPEZAR RETO ({activeQuest.durationSeconds}s)!</span>
                  </button>
                </div>
              )}

              {challengeState === 'running' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTogglePause}
                    className="p-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center cursor-pointer border border-amber-500/40"
                    title="Pausar"
                  >
                    <Pause className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleCompleteChallenge(activeQuest)}
                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-xl border-2 border-white cursor-pointer active:scale-95 zentry-spring-press animate-pulse"
                  >
                    <Check className="w-5 h-5 stroke-[3]" />
                    <span>✅ ¡YA LO HICE!</span>
                  </button>
                  <button
                    onClick={handleCancelChallenge}
                    className="p-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center cursor-pointer border border-rose-500/40"
                    title="Reiniciar reto"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {challengeState === 'paused' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancelChallenge}
                    className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white/80 font-bold text-xs cursor-pointer border border-white/15"
                  >
                    Reiniciar
                  </button>
                  <button
                    onClick={handleTogglePause}
                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-xl border-2 border-white cursor-pointer active:scale-95 zentry-spring-press"
                  >
                    <Play className="w-5 h-5 fill-slate-950" />
                    <span>Continuar</span>
                  </button>
                  <button
                    onClick={handleResetToWheel}
                    className="py-3 px-4 rounded-2xl bg-rose-500/20 text-rose-300 font-bold text-xs cursor-pointer border border-rose-500/40"
                  >
                    Salir
                  </button>
                </div>
              )}

              {challengeState === 'completed' && (
                <div className="space-y-2">
                  <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-black text-sm flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>⭐ ¡MISIÓN CUMPLIDA CON ÉXITO! ⭐</span>
                  </div>
                  <button
                    onClick={handleResetToWheel}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white font-black text-base flex items-center justify-center gap-2 shadow-xl border-2 border-white cursor-pointer active:scale-95 zentry-spring-press"
                  >
                    <RotateCw className="w-5 h-5" />
                    <span>Jugar Otro Reto 🎯</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : viewTab === 'wheel' ? (
          /* TAB 1: INTERACTIVE 12-QUEST SPINNING WHEEL */
          <div className="w-full max-w-md flex flex-col items-center justify-center pt-2 space-y-4">
            <div className="relative flex flex-col items-center justify-center">
              {/* Top Pointer Indicator */}
              <div className="text-3xl -mb-4 z-20 animate-bounce filter drop-shadow-[0_2px_8px_rgba(244,63,94,0.8)]">
                🔻
              </div>

              {/* Spinning Circular 12-segment Wheel */}
              <div
                onClick={handleSpin}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? 'transform 2.4s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none'
                }}
                className="w-60 h-60 md:w-68 md:h-68 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-indigo-600 p-2 shadow-2xl border-4 border-white flex items-center justify-center cursor-pointer active:scale-95 zentry-spring-press relative overflow-hidden"
              >
                {/* 12 Quest Emojis evenly distributed at 30 degree intervals */}
                {QUESTS.map((q, idx) => {
                  const angle = (idx * 360) / QUESTS.length;
                  return (
                    <div
                      key={q.id}
                      style={{
                        transform: `rotate(${angle}deg) translate(0, -96px) rotate(-${angle}deg)`
                      }}
                      className="absolute text-2xl md:text-3xl filter drop-shadow-md"
                    >
                      {q.emoji}
                    </div>
                  );
                })}

                {/* Touch Center Hub of the Wheel */}
                <div className="w-20 h-20 rounded-full bg-[#120E24] shadow-2xl flex flex-col items-center justify-center z-10 border-3 border-amber-300 text-amber-300">
                  <RotateCw className={`w-7 h-7 ${isSpinning ? 'animate-spin' : ''}`} />
                  <span className="text-[9px] font-black text-amber-300 tracking-wider uppercase mt-0.5">
                    GIRAR
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Helper Button */}
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className="w-full max-w-xs py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-xl border-2 border-white cursor-pointer active:scale-95 zentry-spring-press"
            >
              <Sparkles className="w-5 h-5" />
              <span>{isSpinning ? '¡Girando la Ruleta...!' : '¡GIRAR RULETA!'}</span>
            </button>
          </div>
        ) : viewTab === 'catalog' ? (
          /* TAB 2: FULL 12-QUEST DEVELOPMENTAL CATALOG */
          <div className="w-full max-w-lg space-y-2">
            <div className="text-center pb-1">
              <h3 className="text-sm font-black text-white">Elige tu reto motriz favorito</h3>
              <p className="text-[11px] font-medium text-white/60">
                12 desafíos diseñados para desarrollar fuerza, equilibrio y coordinación
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[340px] overflow-y-auto no-scrollbar p-1">
              {QUESTS.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleSelectQuest(q)}
                  className="p-3 rounded-2xl bg-[#120E24]/90 hover:bg-[#1C1636] border border-white/15 hover:border-amber-400/60 shadow-lg flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer active:scale-95 group"
                >
                  <span className="text-3xl group-hover:scale-115 transition-transform">{q.emoji}</span>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-white group-hover:text-amber-300 leading-tight">
                      {q.name}
                    </h4>
                    <span className="text-[10px] font-bold text-white/50 block">
                      ⏱️ {q.durationSeconds}s • +{q.xp} XP
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* TAB 3: MEDALS & HISTORY */
          <div className="w-full max-w-lg space-y-3">
            {/* Medals Gallery */}
            <div className="p-4 rounded-2xl bg-[#120E24]/90 border border-white/15 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>Vitrina de Medallas Ganadas</span>
                </span>
                <span className="text-[10px] font-bold text-amber-300">{medals.length} Medallas</span>
              </div>

              {medals.length > 0 ? (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
                  {medals.map((m, idx) => (
                    <div
                      key={idx}
                      className="w-12 h-12 rounded-2xl bg-amber-400/20 border-2 border-amber-400/60 flex items-center justify-center text-2xl shadow-md shrink-0 animate-spring-in"
                    >
                      {m}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-white/50 text-xs">
                  Aún no tienes medallas. ¡Completa tu primer reto hoy! 🎯
                </div>
              )}
            </div>

            {/* Recent Completed Quests History */}
            <div className="p-4 rounded-2xl bg-[#120E24]/90 border border-white/15 shadow-xl space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
              <span className="text-xs font-black text-white block">Historial de Retos Cumplidos</span>
              {history.length > 0 ? (
                <div className="space-y-1.5">
                  {history.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.emoji}</span>
                        <div>
                          <span className="font-bold text-white block leading-tight">{item.name}</span>
                          <span className="text-[10px] text-white/50">{item.durationSeconds}s de movimiento</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-amber-300">+{item.xpEarned} XP</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 text-white/50 text-xs">
                  Sin actividad registrada aún.
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOTTOM BADGE STRIP (WHEN IDLE) */}
        {challengeState === 'idle' && medals.length > 0 && viewTab !== 'history' && (
          <div className="w-full max-w-lg flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1">
            <Award className="w-5 h-5 text-amber-300 shrink-0" />
            {medals.slice(0, 10).map((m, idx) => (
              <div
                key={idx}
                className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/60 flex items-center justify-center text-lg shadow-md shrink-0 animate-spring-in"
              >
                {m}
              </div>
            ))}
          </div>
        )}
      </div>
    </ZentrySubPageScaffold>
  );
};

export default ZentryRealMissionsScreen;

