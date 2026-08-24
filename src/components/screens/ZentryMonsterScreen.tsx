import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Sparkles,
  Heart,
  Smile
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

const EYES = [
  { id: '1', count: '👁️', label: '1 Ojo' },
  { id: '2', count: '👀', label: '2 Ojos' },
  { id: '3', count: '👁️👀', label: '3 Ojos' },
  { id: '4', count: '👀👀', label: '4 Ojos' }
];

const MOUTHS = [
  { id: 'smile', emoji: '😄', sound: '¡Hola! ¡Qué cosquillas!' },
  { id: 'tongue', emoji: '😛', sound: '¡Blep! ¡Soy un monstruo travieso!' },
  { id: 'teeth', emoji: '😁', sound: '¡Mira mis dientes mágicos de algodón!' },
  { id: 'kiss', emoji: '😚', sound: '¡Te mando un beso de monstruo cariñoso!' }
];

const EMOTIONS = [
  { id: 'happy', emoji: '🥰', speech: '¡Hoy me siento muy feliz y lleno de alegría!' },
  { id: 'brave', emoji: '🦁', speech: '¡Hoy soy un monstruo súper valiente y fuerte!' },
  { id: 'sleepy', emoji: '🥱', speech: '¡Tengo un poquito de sueño y quiero descansar!' },
  { id: 'hug', emoji: '🤗', speech: '¡Quiero un abrazo gigante y calientito!' }
];

const FUR_COLORS = [
  '#A855F7', // Morado monstruo
  '#EC4899', // Rosa dulce
  '#10B981', // Verde alien
  '#F59E0B', // Amarillo sol
  '#3B82F6', // Azul peludo
  '#EF4444'  // Rojo chispitas
];

export const ZentryMonsterScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [selectedEyes, setSelectedEyes] = useState(EYES[1]);
  const [selectedMouth, setSelectedMouth] = useState(MOUTHS[0]);
  const [selectedEmotion, setSelectedEmotion] = useState(EMOTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(FUR_COLORS[0]);
  const [isJumping, setIsJumping] = useState(false);

  const speakMonster = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.05;
      utterance.pitch = 1.6; // Voz aguda y graciosa de monstruito
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePokeMonster = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    sounds.playTap();
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 400);

    const funnyLines = [
      '¡Jijiji, me haces cosquillas!',
      '¡Soy tu amigo monstruo!',
      selectedMouth.sound,
      selectedEmotion.speech
    ];
    const randomLine = funnyLines[Math.floor(Math.random() * funnyLines.length)];
    speakMonster(randomLine);
  };

  useEffect(() => {
    speakMonster('¡Hola! ¡Crea tu monstruito divertido y tócame para reír!');
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <ZentrySubPageScaffold title="" kicker="" onBack={onBack} isDark={isDark}>
      <div className="w-full h-full flex flex-col items-center justify-between p-2 md:p-4 space-y-3 overflow-y-auto no-scrollbar">
        {/* Monstruo Interactivo Central */}
        <div className="relative flex flex-col items-center justify-center pt-2">
          <div
            onClick={handlePokeMonster}
            style={{ backgroundColor: selectedColor }}
            className={`w-40 h-40 md:w-48 md:h-48 rounded-[48px] p-4 flex flex-col items-center justify-center shadow-2xl border-4 border-white cursor-pointer active:scale-95 transition-transform zentry-press relative overflow-hidden ${
              isJumping ? 'scale-110 -translate-y-2' : ''
            }`}
          >
            {/* Ojos del Monstruo */}
            <span className="text-4xl md:text-5xl -mb-1 select-none">{selectedEyes.count}</span>

            {/* Boca del Monstruo */}
            <span className="text-4xl md:text-5xl select-none">{selectedMouth.emoji}</span>

            {/* Emoción flotante */}
            <span className="absolute bottom-2 right-2 text-2xl bg-white/40 rounded-full p-1 shadow-md">
              {selectedEmotion.emoji}
            </span>
          </div>

          {/* Botón Altavoz */}
          <button
            onClick={handlePokeMonster}
            className="absolute -top-2 -right-3 w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-lg border-2 border-white text-xl active:scale-90 cursor-pointer"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>

        {/* 1. Selector de Ojos */}
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-around gap-2 py-1">
            {EYES.map((eye) => (
              <button
                key={eye.id}
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(6);
                  sounds.playTap();
                  setSelectedEyes(eye);
                }}
                className={`p-3 rounded-[20px] text-2xl flex items-center justify-center border-2 transition-transform cursor-pointer ${
                  selectedEyes.id === eye.id
                    ? 'bg-purple-600 text-white border-white scale-110 shadow-lg'
                    : isDark
                    ? 'bg-white/10 border-white/20'
                    : 'bg-white border-black/10'
                }`}
              >
                {eye.count}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Selector de Bocas / Risas */}
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-around gap-2 py-1">
            {MOUTHS.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(6);
                  sounds.playTap();
                  setSelectedMouth(m);
                  speakMonster(m.sound);
                }}
                className={`p-3 rounded-[20px] text-3xl flex items-center justify-center border-2 transition-transform cursor-pointer ${
                  selectedMouth.id === m.id
                    ? 'bg-pink-500 text-white border-white scale-110 shadow-lg'
                    : isDark
                    ? 'bg-white/10 border-white/20'
                    : 'bg-white border-black/10'
                }`}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Selector de Emociones */}
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-around gap-2 py-1">
            {EMOTIONS.map((em) => (
              <button
                key={em.id}
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(6);
                  sounds.playTap();
                  setSelectedEmotion(em);
                  speakMonster(em.speech);
                }}
                className={`p-3 rounded-[20px] text-3xl flex items-center justify-center border-2 transition-transform cursor-pointer ${
                  selectedEmotion.id === em.id
                    ? 'bg-amber-400 text-white border-white scale-110 shadow-lg'
                    : isDark
                    ? 'bg-white/10 border-white/20'
                    : 'bg-white border-black/10'
                }`}
              >
                {em.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Colores del Pelaje */}
        <div className="w-full max-w-lg flex items-center justify-center gap-3 pt-1">
          {FUR_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(5);
                setSelectedColor(c);
              }}
              style={{ backgroundColor: c }}
              className={`w-9 h-9 md:w-11 md:h-11 rounded-full border-3 transition-transform cursor-pointer ${
                selectedColor === c ? 'scale-125 border-white ring-4 ring-pink-400 shadow-xl' : 'border-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </ZentrySubPageScaffold>
  );
};

export default ZentryMonsterScreen;
