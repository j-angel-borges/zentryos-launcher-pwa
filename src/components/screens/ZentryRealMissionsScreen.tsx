import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Sparkles,
  Trophy,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

const QUESTS = [
  { id: '1', emoji: '🐻', name: 'Oso', action: 'Camina como un oso grande por 10 pasos', speech: '¡Reto 1: Camina en 4 patas como un oso gigante y amigable!' },
  { id: '2', emoji: '🟡', name: 'Amarillo', action: 'Encuentra 2 objetos amarillos en tu casa', speech: '¡Reto 2: Busca rápido 2 cosas de color amarillo en tu casa!' },
  { id: '3', emoji: '🦩', name: 'Flamenco', action: 'Párate en 1 solo pie por 5 segundos', speech: '¡Reto 3: Haz equilibrio en un solo pie como un flamenco!' },
  { id: '4', emoji: '🛋️', name: 'Torre', action: 'Apila 3 cojines o almohadas', speech: '¡Reto 4: Construye una torre alta con 3 cojines o almohadas!' },
  { id: '5', emoji: '🐸', name: 'Ranita', action: 'Da 4 saltos de ranita diciendo croac', speech: '¡Reto 5: Agáchate y da 4 saltos de ranita diciendo croac croac!' },
  { id: '6', emoji: '🧸', name: 'Abrazo', action: 'Dale un abrazo a un peluche o familiar', speech: '¡Reto 6: Dale un súper abrazo cariñoso a tu peluche o a mamá o papá!' }
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

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.94;
      utterance.pitch = 1.25;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSpin = () => {
    if (isSpinning) return;
    if (navigator.vibrate) navigator.vibrate(10);
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
      speak(chosen.speech);
    }, 2400);
  };

  const handleCompleteQuest = () => {
    if (!activeQuest || isDone) return;
    if (navigator.vibrate) navigator.vibrate(15);
    sounds.playSuccess();
    setIsDone(true);

    const nextMedals = [activeQuest.emoji, ...medals.slice(0, 15)];
    setMedals(nextMedals);
    localStorage.setItem('zentry_real_medals', JSON.stringify(nextMedals));

    confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
    speak('¡Excelente trabajo! ¡Cumpliste el reto físico y ganaste una medalla!');
  };

  useEffect(() => {
    speak('¡Toca la ruleta para descubrir tu reto de movimiento en casa!');
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <ZentrySubPageScaffold title="" kicker="" onBack={onBack} isDark={isDark}>
      <div className="w-full h-full flex flex-col items-center justify-between p-2 md:p-4 space-y-4 overflow-y-auto no-scrollbar">
        {/* Ruleta Central Giratoria Táctil */}
        <div className="relative flex flex-col items-center justify-center pt-2">
          {/* Marcador Superior de la Ruleta */}
          <div className="text-4xl -mb-3 z-20 animate-bounce">🔻</div>

          <div
            onClick={handleSpin}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 2.4s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none'
            }}
            className="w-56 h-56 md:w-64 md:h-64 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-indigo-600 p-2 shadow-2xl border-6 border-white flex items-center justify-center cursor-pointer active:scale-95 zentry-press relative overflow-hidden"
          >
            {/* Íconos en Círculo */}
            {QUESTS.map((q, idx) => {
              const angle = (idx * 360) / QUESTS.length;
              return (
                <div
                  key={q.id}
                  style={{
                    transform: `rotate(${angle}deg) translate(0, -78px) rotate(-${angle}deg)`
                  }}
                  className="absolute text-3xl md:text-4xl"
                >
                  {q.emoji}
                </div>
              );
            })}

            {/* Centro de la Ruleta */}
            <div className="w-18 h-18 rounded-full bg-white shadow-xl flex items-center justify-center text-3xl z-10 border-4 border-amber-300">
              🎡
            </div>
          </div>
        </div>

        {/* Tarjeta del Reto Activo */}
        {activeQuest && (
          <div className="w-full max-w-md flex flex-col items-center gap-3 p-4 rounded-[32px] bg-white/20 backdrop-blur-md border-3 border-white shadow-2xl animate-in zoom-in duration-300 text-center">
            <span className="text-6xl animate-bounce">{activeQuest.emoji}</span>

            <button
              onClick={() => speak(activeQuest.speech)}
              className="p-3 rounded-full bg-pink-500 text-white shadow-md active:scale-90 cursor-pointer"
            >
              <Volume2 className="w-6 h-6" />
            </button>

            {/* Botón de Misión Cumplida ✅ */}
            <button
              onClick={handleCompleteQuest}
              className={`w-full py-4 rounded-[28px] font-black text-2xl flex items-center justify-center gap-3 shadow-xl border-3 border-white cursor-pointer active:scale-95 transition-all ${
                isDone
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-white'
              }`}
            >
              <span>{isDone ? '⭐ ¡LOGRADO! ⭐' : '✅ ¡YA LO HICE!'}</span>
            </button>
          </div>
        )}

        {/* Medallas Ganadas */}
        {medals.length > 0 && (
          <div className="w-full max-w-md flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1">
            <span className="text-2xl flex-shrink-0">🏅</span>
            {medals.map((m, idx) => (
              <div
                key={idx}
                className="w-12 h-12 rounded-[18px] bg-amber-400/25 border-2 border-amber-400 flex items-center justify-center text-2xl shadow-md flex-shrink-0"
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
