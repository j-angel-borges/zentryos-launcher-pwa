import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Star,
  Wand2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

const BASES = [
  { id: 'hero_boy', emoji: '🦸‍♂️', name: 'Héroe' },
  { id: 'hero_girl', emoji: '🦸‍♀️', name: 'Heroína' },
  { id: 'robot', emoji: '🤖', name: 'Robot' },
  { id: 'cat', emoji: '🐱', name: 'Gatito' },
  { id: 'alien', emoji: '👾', name: 'Monstruito' },
  { id: 'astro', emoji: '🧑‍🚀', name: 'Astronauta' }
];

const HATS = [
  { id: 'none', emoji: '✨' },
  { id: 'crown', emoji: '👑' },
  { id: 'pirate', emoji: '🏴‍☠️' },
  { id: 'cap', emoji: '🧢' },
  { id: 'flower', emoji: '🌸' },
  { id: 'bunny', emoji: '🐰' }
];

const POWERS = [
  { id: 'lightning', emoji: '⚡', speech: '¡Tengo el superpoder de los rayos mágicos!' },
  { id: 'fire', emoji: '🔥', speech: '¡Tengo el poder del fuego y la energía!' },
  { id: 'heart', emoji: '❤️', speech: '¡Tengo el poder del amor y los abrazos gigantes!' },
  { id: 'rainbow', emoji: '🌈', speech: '¡Tengo el poder de pintar arcoíris en el cielo!' },
  { id: 'wings', emoji: '🪽', speech: '¡Tengo alas mágicas para volar por las estrellas!' },
  { id: 'shield', emoji: '🛡️', speech: '¡Tengo el escudo invencible de los amigos!' }
];

const SUIT_COLORS = [
  '#EC4899', // Rosa
  '#8B5CF6', // Violeta
  '#3B82F6', // Azul
  '#10B981', // Verde
  '#F59E0B', // Amarillo
  '#EF4444'  // Rojo
];

export const ZentryCharacterScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [selectedBase, setSelectedBase] = useState(BASES[0]);
  const [selectedHat, setSelectedHat] = useState(HATS[0]);
  const [selectedPower, setSelectedPower] = useState(POWERS[0]);
  const [selectedColor, setSelectedColor] = useState(SUIT_COLORS[0]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.94;
      utterance.pitch = 1.3;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const playVoiceIntroduction = () => {
    sounds.playSuccess();
    const intro = `¡Hola amigo! Soy tu personaje ${selectedBase.name}. ${selectedPower.speech} ¡Vamos a jugar juntos!`;
    speak(intro);
  };

  useEffect(() => {
    speak('¡Elige tu personaje, su sombrerito y su superpoder!');
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSaveCharacter = () => {
    if (navigator.vibrate) navigator.vibrate(15);
    sounds.playSuccess();
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    playVoiceIntroduction();
  };

  return (
    <ZentrySubPageScaffold title="" kicker="" onBack={onBack} isDark={isDark}>
      <div className="w-full h-full flex flex-col items-center justify-between p-2 md:p-4 space-y-3 overflow-y-auto no-scrollbar">
        {/* Avatar Central en Vivo (Squircle Mágico) */}
        <div className="relative flex flex-col items-center justify-center">
          <div
            onClick={playVoiceIntroduction}
            style={{ backgroundColor: selectedColor }}
            className="w-36 h-36 md:w-44 md:h-44 rounded-[40px] flex flex-col items-center justify-center shadow-2xl border-4 border-white cursor-pointer active:scale-95 transition-transform zentry-press relative overflow-hidden"
          >
            {/* Sombrero Flotante */}
            {selectedHat.id !== 'none' && (
              <span className="text-4xl md:text-5xl -mb-3 z-10 animate-bounce">{selectedHat.emoji}</span>
            )}

            {/* Base / Cuerpo */}
            <span className="text-6xl md:text-7xl drop-shadow-md">{selectedBase.emoji}</span>

            {/* Superpoder en la esquina */}
            <span className="absolute bottom-2 right-2 text-3xl animate-pulse bg-white/40 rounded-full p-1 shadow-md">
              {selectedPower.emoji}
            </span>
          </div>

          {/* Botón Altavoz */}
          <button
            onClick={playVoiceIntroduction}
            className="absolute -top-2 -right-3 w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-lg border-2 border-white text-xl active:scale-90 cursor-pointer"
          >
            <Volume2 className={`w-6 h-6 ${isSpeaking ? 'animate-bounce text-yellow-300' : ''}`} />
          </button>
        </div>

        {/* 1. Selector de Base (Personajes) */}
        <div className="w-full max-w-lg space-y-1">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {BASES.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(6);
                  sounds.playTap();
                  setSelectedBase(b);
                }}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-[24px] text-3xl flex items-center justify-center border-3 transition-transform cursor-pointer flex-shrink-0 ${
                  selectedBase.id === b.id
                    ? 'bg-pink-500 border-white scale-110 shadow-lg'
                    : isDark
                    ? 'bg-white/10 border-white/20'
                    : 'bg-white border-black/10'
                }`}
              >
                {b.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Selector de Sombreros */}
        <div className="w-full max-w-lg space-y-1">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {HATS.map((h) => (
              <button
                key={h.id}
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(6);
                  sounds.playTap();
                  setSelectedHat(h);
                }}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-[20px] text-2xl flex items-center justify-center border-2 transition-transform cursor-pointer flex-shrink-0 ${
                  selectedHat.id === h.id
                    ? 'bg-purple-600 border-white scale-110 shadow-lg'
                    : isDark
                    ? 'bg-white/10 border-white/20'
                    : 'bg-white border-black/10'
                }`}
              >
                {h.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Selector de Superpoderes */}
        <div className="w-full max-w-lg space-y-1">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {POWERS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(6);
                  sounds.playTap();
                  setSelectedPower(p);
                  speak(p.speech);
                }}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-[20px] text-2xl flex items-center justify-center border-2 transition-transform cursor-pointer flex-shrink-0 ${
                  selectedPower.id === p.id
                    ? 'bg-amber-400 border-white scale-110 shadow-lg'
                    : isDark
                    ? 'bg-white/10 border-white/20'
                    : 'bg-white border-black/10'
                }`}
              >
                {p.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Colores del Traje & Botón Guardar */}
        <div className="w-full max-w-lg flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {SUIT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(5);
                  setSelectedColor(c);
                }}
                style={{ backgroundColor: c }}
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-3 transition-transform cursor-pointer ${
                  selectedColor === c ? 'scale-125 border-white ring-4 ring-pink-400 shadow-xl' : 'border-white/80'
                }`}
              />
            ))}
          </div>

          {/* Botón Guardar Héroe */}
          <button
            onClick={handleSaveCharacter}
            className="px-6 py-3.5 rounded-[24px] bg-gradient-to-r from-emerald-400 via-teal-500 to-green-600 text-white font-black text-xl shadow-xl border-3 border-white active:scale-95 transition-transform cursor-pointer flex-shrink-0"
          >
            ⭐ 💾 ⭐
          </button>
        </div>
      </div>
    </ZentrySubPageScaffold>
  );
};

export default ZentryCharacterScreen;
