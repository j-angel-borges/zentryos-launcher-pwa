import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Sparkles,
  Trophy,
  CheckCircle2,
  RotateCw,
  Award
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

const QUESTS = [
  { id: '1', emoji: '🐸', name: 'Ranita', shortAction: 'Salta como ranita', action: 'Da 4 saltos de ranita diciendo croac', speech: '¡Reto 1: Agáchate y da cuatro saltos de ranita diciendo croac croac!' },
  { id: '2', emoji: '🟡', name: 'Amarillo', shortAction: 'Busca 2 cosas amarillas', action: 'Encuentra 2 objetos amarillos en casa', speech: '¡Reto 2: Busca rápido dos cosas de color amarillo en tu casa!' },
  { id: '3', emoji: '🦩', name: 'Flamenco', shortAction: 'Equilibrio en 1 pie', action: 'Párate en 1 solo pie por 5 segundos', speech: '¡Reto 3: Haz equilibrio en un solo pie como un flamenco por cinco segundos!' },
  { id: '4', emoji: '🛋️', name: 'Torre', shortAction: 'Construye una torre', action: 'Apila 3 cojines o almohadas', speech: '¡Reto 4: Construye una torre alta con tres cojines o almohadas!' },
  { id: '5', emoji: '🐻', name: 'Oso', shortAction: 'Camina como oso', action: 'Camina en 4 patas por 10 pasos', speech: '¡Reto 5: Camina en cuatro patas como un oso gigante y fuerte!' },
  { id: '6', emoji: '🧸', name: 'Abrazo', shortAction: 'Abrazo cariñoso', action: 'Dale un abrazo a un peluche o familiar', speech: '¡Reto 6: Dale un súper abrazo cariñoso a tu peluche o a tu familia!' },
  { id: '7', emoji: '✈️', name: 'Avión', shortAction: 'Vuela con los brazos', action: 'Abre tus brazos y vuela en círculos', speech: '¡Reto 7: Abre tus brazos como alas y vuela en círculos como un avión!' },
  { id: '8', emoji: '🦁', name: 'León', shortAction: 'Rugido de león', action: 'Abre la boca y ruge fuerte', speech: '¡Reto 8: Abre la boca y da un rugido de león muy fuerte y valiente!' },
  { id: '9', emoji: '🍎', name: 'Manzana', shortAction: 'Estírate alto', action: 'Estírate en puntillas para alcanzar el techo', speech: '¡Reto 9: Ponte en puntillas y estírate muy alto para alcanzar una fruta mágica!' },
  { id: '10', emoji: '🦀', name: 'Cangrejo', shortAction: 'Pasos de cangrejo', action: 'Camina de lado como un cangrejito', speech: '¡Reto 10: Agáchate y camina de lado como un cangrejo de playa!' },
  { id: '11', emoji: '🧼', name: 'Manitas', shortAction: 'Lava tus manitas', action: 'Frota tus manos cantando una canción', speech: '¡Reto 11: Frota tus manitas con agua y jabón cantando una linda canción!' },
  { id: '12', emoji: '🦖', name: 'Dinosaurio', shortAction: 'Pisadas gigantes', action: 'Da 5 pasos pesados de dinosaurio', speech: '¡Reto 12: Da cinco pasos gigantes pisando fuerte como un Tiranosaurio!' }
];

export const ZentryRealMissionsScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [activeQuest, setActiveQuest] = useState<typeof QUESTS[0] | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [medals, setMedals] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zentry_real_medals');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const speakQuest = (text: string) => {
    sounds.playTap();
    voiceService.speakFeedback(text);
  };

  const handleSpin = () => {
    if (isSpinning) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(10);
    sounds.playTap();
    setIsSpinning(true);
    setIsDone(false);

    const randomIndex = Math.floor(Math.random() * QUESTS.length);
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const anglePerItem = 360 / QUESTS.length;
    const targetAngle = rotation + extraSpins * 360 + (randomIndex * anglePerItem);

    setRotation(targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      const chosen = QUESTS[randomIndex];
      setActiveQuest(chosen);
      sounds.playSuccess();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      voiceService.speakFeedback(chosen.speech);
    }, 2400);
  };

  const handleCompleteQuest = async () => {
    if (!activeQuest || isDone) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(20);
    sounds.playSuccess();
    setIsDone(true);

    const nextMedals = [activeQuest.emoji, ...medals.slice(0, 15)];
    setMedals(nextMedals);
    try {
      localStorage.setItem('zentry_real_medals', JSON.stringify(nextMedals));
    } catch {}

    // Persist real accomplishment to Google Cloud Firestore
    saveCompletedMissionToFirestore({
      id: activeQuest.id,
      name: activeQuest.name,
      emoji: activeQuest.emoji,
      action: activeQuest.action
    });

    confetti({ particleCount: 110, spread: 100, origin: { y: 0.5 } });
    voiceService.speakFeedback('¡Excelente trabajo! ¡Cumpliste el reto en casa y ganaste una medalla!');
  };

  useEffect(() => {
    voiceService.speakFeedback('¡Toca la ruleta y empieza el reto!');
  }, []);

  return (
    <ZentrySubPageScaffold title="Misiones" kicker="RETOS EN CASA" onBack={onBack} isDark={isDark}>
      <div className="w-full h-full flex flex-col items-center justify-between p-2 md:p-4 space-y-3 overflow-y-auto no-scrollbar select-none pb-8">
        {/* Ruleta Central Giratoria Táctil de 12 Retos */}
        <div className="relative flex flex-col items-center justify-center pt-1">
          {/* Marcador Superior de la Ruleta */}
          <div className="text-3xl -mb-3 z-20 animate-bounce">🔻</div>

          <div
            onClick={handleSpin}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 2.4s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none'
            }}
            className="w-56 h-56 md:w-64 md:h-64 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-indigo-600 p-2 shadow-2xl border-4 border-white flex items-center justify-center cursor-pointer active:scale-95 zentry-spring-press relative overflow-hidden"
          >
            {/* 12 Íconos de Retos en Círculo */}
            {QUESTS.map((q, idx) => {
              const angle = (idx * 360) / QUESTS.length;
              return (
                <div
                  key={q.id}
                  style={{
                    transform: `rotate(${angle}deg) translate(0, -84px) rotate(-${angle}deg)`
                  }}
                  className="absolute text-2xl md:text-3xl"
                >
                  {q.emoji}
                </div>
              );
            })}

            {/* Centro Táctil de la Ruleta */}
            <div className="w-16 h-16 rounded-full bg-[#120E24] shadow-xl flex items-center justify-center text-2xl z-10 border-3 border-amber-300 text-amber-300">
              <RotateCw className={`w-7 h-7 ${isSpinning ? 'animate-spin' : ''}`} />
            </div>
          </div>
        </div>

        {/* Tarjeta del Reto Activo (Poco texto, alto contraste y botón de volumen táctil) */}
        {activeQuest ? (
          <div className="w-full max-w-md flex flex-col items-center gap-2.5 p-4 rounded-[32px] bg-[#120E24]/95 border-2 border-purple-400/50 shadow-2xl animate-spring-in text-center">
            <span className="text-5xl animate-bounce">{activeQuest.emoji}</span>

            {/* Texto Corto de la Misión */}
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-white drop-shadow-md">
                {activeQuest.shortAction}
              </h3>
              <p className="text-xs font-bold text-amber-300">
                {activeQuest.action}
              </p>
            </div>

            {/* Botón de Volumen Táctil */}
            <button
              onClick={() => speakQuest(activeQuest.speech)}
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-purple-200 hover:text-white flex items-center justify-center cursor-pointer shadow-md zentry-spring-press border border-white/20"
              title="Escuchar instrucción"
            >
              <Volume2 className="w-5 h-5" />
            </button>

            {/* Botón de Misión Cumplida */}
            <button
              onClick={handleCompleteQuest}
              className={`w-full py-3 rounded-[24px] font-black text-base flex items-center justify-center gap-2 shadow-xl border-2 border-white cursor-pointer active:scale-95 transition-all zentry-spring-press ${
                isDone
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-slate-950'
              }`}
            >
              <span>{isDone ? '⭐ ¡LOGRADO! ⭐' : '✅ ¡YA LO HICE!'}</span>
            </button>
          </div>
        ) : (
          <div className="text-center p-3 rounded-2xl bg-white/10 border border-white/15">
            <span className="text-xs font-black text-white">¡Toca la ruleta para empezar! 🎯</span>
          </div>
        )}

        {/* Medallas Ganadas */}
        {medals.length > 0 && (
          <div className="w-full max-w-md flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1">
            <Award className="w-6 h-6 text-amber-300 shrink-0" />
            {medals.map((m, idx) => (
              <div
                key={idx}
                className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/60 flex items-center justify-center text-xl shadow-md shrink-0 animate-spring-in"
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
