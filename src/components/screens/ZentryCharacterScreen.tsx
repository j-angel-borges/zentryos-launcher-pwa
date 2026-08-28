import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  Trophy,
  Dices,
  Check,
  Star,
  Shield,
  Zap,
  Heart,
  Flame,
  Wand2,
  Smile,
  Crown,
  ChevronRight,
  Download,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

interface Archetype {
  id: string;
  name: string;
  avatarIcon: string;
  defaultPower: string;
  lore: string;
  stats: {
    bravery: number;
    magic: number;
    speed: number;
    creativity: number;
  };
}

const ARCHETYPES: Archetype[] = [
  {
    id: 'space_explorer',
    name: 'Explorador Estelar',
    avatarIcon: '🧑‍🚀',
    defaultPower: 'Propulsión de Cometas',
    lore: 'Viajero intrépido de la constelación Orión, capaz de saltar entre asteroides y encender constelaciones apagadas.',
    stats: { bravery: 90, magic: 65, speed: 95, creativity: 85 }
  },
  {
    id: 'forest_guardian',
    name: 'Guardián del Bosque',
    avatarIcon: '🧝‍♂️',
    defaultPower: 'Lenguaje de las Criaturas',
    lore: 'Protector de los árboles centenarios y amigo de los animales más sabios del gran valle verde.',
    stats: { bravery: 80, magic: 90, speed: 75, creativity: 95 }
  },
  {
    id: 'crystal_wizard',
    name: 'Hechicero de Cristal',
    avatarIcon: '🧙‍♂️',
    defaultPower: 'Rayo de Prisma',
    lore: 'Maestro de las gemas mágicas que transforma cualquier sombra en un festival de luces de colores.',
    stats: { bravery: 70, magic: 100, speed: 80, creativity: 90 }
  },
  {
    id: 'mech_robot',
    name: 'Robot Amigable',
    avatarIcon: '🤖',
    defaultPower: 'Escudo Electromagnético',
    lore: 'Construido con piezas de estrellas y circuitos de amistad, siempre listo para resolver cualquier desafío.',
    stats: { bravery: 95, magic: 50, speed: 85, creativity: 80 }
  },
  {
    id: 'winged_hero',
    name: 'Héroe de las Alturas',
    avatarIcon: '🦸',
    defaultPower: 'Vuelo Supersónico',
    lore: 'Defensor de los cielos y guardián de las nubes doradas al atardecer.',
    stats: { bravery: 85, magic: 80, speed: 100, creativity: 75 }
  }
];

const HEADGEARS = [
  { id: 'none', label: 'Sin Tocado', icon: '✨' },
  { id: 'crown', label: 'Corona Real', icon: '👑' },
  { id: 'space_helmet', label: 'Casco Visor', icon: '🪖' },
  { id: 'flowers', label: 'Diadema Mágica', icon: '🌸' },
  { id: 'bunny_ears', label: 'Orejas de Salto', icon: '🐰' },
  { id: 'pirate_hat', label: 'Sombrero Pirata', icon: '🏴‍☠️' }
];

const POWERS = [
  { id: 'lightning', name: 'Rayo de Luz', icon: '⚡', color: 'from-amber-400 to-yellow-500' },
  { id: 'shield', name: 'Escudo de Cristal', icon: '🛡️', color: 'from-blue-400 to-cyan-500' },
  { id: 'fire', name: 'Fuego Fénix', icon: '🔥', color: 'from-rose-500 to-orange-500' },
  { id: 'rainbow', name: 'Polvo de Arcoíris', icon: '🌈', color: 'from-pink-500 via-purple-500 to-cyan-400' },
  { id: 'wings', name: 'Alas Cósmicas', icon: '🪽', color: 'from-indigo-400 to-purple-600' },
  { id: 'heart', name: 'Abrazo de Energía', icon: '💖', color: 'from-pink-500 to-rose-600' }
];

const SUIT_GRADIENTS = [
  { id: 'lavender', name: 'Lavanda Zentry', class: 'from-[#8B5CF6] via-[#D6C8FA] to-[#533B87]' },
  { id: 'aurora', name: 'Aurora Menta', class: 'from-[#10B981] via-[#C2F4E7] to-[#047857]' },
  { id: 'sunset', name: 'Atardecer Cósmico', class: 'from-[#EC4899] via-[#F59E0B] to-[#EF4444]' },
  { id: 'ocean', name: 'Azul Océano', class: 'from-[#06B6D4] via-[#3B82F6] to-[#1E40AF]' },
  { id: 'emerald', name: 'Esmeralda Viva', class: 'from-[#84CC16] via-[#10B981] to-[#065F46]' }
];

const HERO_NAMES_PRESETS = [
  'Aura Spark', 'Cometa Ray', 'Capitán Cristal', 'Lúa Valiente', 'Nova Guardián', 'Zénit Estelar', 'Solarix'
];

interface SavedHero {
  id: string;
  name: string;
  archetype: string;
  icon: string;
  headgear: string;
  power: string;
  powerName: string;
  gradientClass: string;
  stats: Archetype['stats'];
  lore: string;
  date: string;
}

export const ZentryCharacterScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype>(ARCHETYPES[0]);
  const [selectedHeadgear, setSelectedHeadgear] = useState(HEADGEARS[0]);
  const [selectedPower, setSelectedPower] = useState(POWERS[0]);
  const [selectedGradient, setSelectedGradient] = useState(SUIT_GRADIENTS[0]);
  const [heroName, setHeroName] = useState<string>('Nova Guardián');

  const [isAnimating, setIsAnimating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Galería de Héroes Guardados
  const [savedHeroes, setSavedHeroes] = useState<SavedHero[]>(() => {
    try {
      const saved = localStorage.getItem('zentry_saved_heroes');
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
      utterance.pitch = 1.18;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRandomizeName = () => {
    sounds.playTap();
    const random = HERO_NAMES_PRESETS[Math.floor(Math.random() * HERO_NAMES_PRESETS.length)];
    setHeroName(random);
  };

  const handleInteractAvatar = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    sounds.playSuccess();
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);

    const speechText = `¡Saludos! Soy ${heroName}, ${selectedArchetype.name}. Mi poder especial es ${selectedPower.name}. ${selectedArchetype.lore}`;
    speak(speechText);
  };

  const handleSaveHero = () => {
    if (navigator.vibrate) navigator.vibrate(15);
    sounds.playSuccess();

    const newHero: SavedHero = {
      id: String(Date.now()),
      name: heroName,
      archetype: selectedArchetype.name,
      icon: selectedArchetype.avatarIcon,
      headgear: selectedHeadgear.icon,
      power: selectedPower.icon,
      powerName: selectedPower.name,
      gradientClass: selectedGradient.class,
      stats: selectedArchetype.stats,
      lore: selectedArchetype.lore,
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    };

    const updated = [newHero, ...savedHeroes.slice(0, 15)];
    setSavedHeroes(updated);
    localStorage.setItem('zentry_saved_heroes', JSON.stringify(updated));

    confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.55 }
    });

    speak(`¡Tu héroe ${heroName} ha sido guardado con honores en tu Salón de la Fama!`);
  };

  return (
    <ZentrySubPageScaffold
      title="Taller de Personajes"
      kicker="ESTUDIO DE AVATARES Y HÉROES"
      onBack={() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        onBack();
      }}
      isDark={isDark}
    >
      <div className="w-full h-full flex flex-col justify-between p-2 md:p-4 space-y-4 overflow-y-auto no-scrollbar max-w-3xl mx-auto">
        {/* ========================================================= */}
        {/* AVATAR INTERACTIVO CENTRAL + FICHA DE HÉROE              */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Avatar Squircle Interactivo */}
          <div className="flex flex-col items-center justify-center p-4 rounded-[32px] bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-white/60 dark:border-white/15 shadow-xl relative overflow-hidden">
            {/* Halo de Aura */}
            <div className="absolute inset-0 bg-radial from-purple-500/20 via-transparent to-transparent pointer-events-none" />

            <div
              onClick={handleInteractAvatar}
              className={`w-36 h-36 md:w-44 md:h-44 rounded-[40px] bg-gradient-to-tr ${selectedGradient.class} p-3 flex flex-col items-center justify-center shadow-2xl border-4 border-white dark:border-white/40 cursor-pointer active:scale-95 transition-transform zentry-press relative overflow-hidden ${
                isAnimating ? 'scale-110 -translate-y-2' : ''
              }`}
            >
              {/* Tocado / Sombrero */}
              {selectedHeadgear.id !== 'none' && (
                <span className="text-4xl md:text-5xl -mb-3 z-10 animate-bounce">
                  {selectedHeadgear.icon}
                </span>
              )}

              {/* Arquetipo */}
              <span className="text-6xl md:text-7xl drop-shadow-md select-none">
                {selectedArchetype.avatarIcon}
              </span>

              {/* Insignia de Poder */}
              <span className="absolute bottom-2 right-2 text-2xl md:text-3xl bg-white/40 backdrop-blur-md rounded-full p-1 shadow-md animate-pulse">
                {selectedPower.icon}
              </span>
            </div>

            {/* Nombre del Héroe + Botón Random */}
            <div className="pt-3 flex items-center gap-2">
              <input
                type="text"
                value={heroName}
                onChange={(e) => setHeroName(e.target.value)}
                className="text-center font-black text-sm md:text-base bg-transparent border-b border-purple-400 focus:outline-none text-slate-800 dark:text-white px-2 py-0.5"
              />
              <button
                onClick={handleRandomizeName}
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer text-purple-600 dark:text-purple-300"
                title="Nombre Aleatorio"
              >
                <Dices className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleInteractAvatar}
              className="mt-2 text-[11px] font-bold text-purple-600 dark:text-purple-300 flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-bounce text-pink-400' : ''}`} />
              <span>Tócame para hablar</span>
            </button>
          </div>

          {/* Ficha de Atributos y Estadísticas */}
          <div className="p-5 rounded-[32px] bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-white/60 dark:border-white/15 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-300">
                  Ficha de Rol
                </span>
                <h4 className="text-sm font-black text-slate-800 dark:text-white">{selectedArchetype.name}</h4>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 text-xs font-black">
                {selectedPower.name}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-white/80 leading-relaxed">
              {selectedArchetype.lore}
            </p>

            {/* Barras de Estadísticas */}
            <div className="space-y-2 pt-1">
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-600 dark:text-white/70 mb-0.5">
                  <span>Valentía</span>
                  <span>{selectedArchetype.stats.bravery}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full" style={{ width: `${selectedArchetype.stats.bravery}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-600 dark:text-white/70 mb-0.5">
                  <span>Magia & Sabiduría</span>
                  <span>{selectedArchetype.stats.magic}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${selectedArchetype.stats.magic}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-600 dark:text-white/70 mb-0.5">
                  <span>Velocidad</span>
                  <span>{selectedArchetype.stats.speed}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: `${selectedArchetype.stats.speed}%` }} />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveHero}
              className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Star className="w-4 h-4 text-amber-300" />
              <span>Guardar en Mi Salón de Héroes</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SELECTORES MODULARES POR CAPAS                            */}
        {/* ========================================================= */}
        <div className="space-y-3 bg-white/30 dark:bg-white/5 p-4 rounded-[32px] border border-white/40 dark:border-white/10">
          {/* 1. Selector de Arquetipo */}
          <div className="space-y-1">
            <span className="text-[11px] font-black text-slate-600 dark:text-white/70 uppercase">
              1. Elige tu Arquetipo
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {ARCHETYPES.map((arch) => (
                <button
                  key={arch.id}
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(5);
                    sounds.playTap();
                    setSelectedArchetype(arch);
                  }}
                  className={`px-3 py-2 rounded-[20px] flex items-center gap-2 text-xs font-black border transition-all cursor-pointer flex-shrink-0 ${
                    selectedArchetype.id === arch.id
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md scale-105'
                      : 'bg-white/60 dark:bg-white/10 text-slate-700 dark:text-white border-black/5'
                  }`}
                >
                  <span className="text-xl">{arch.avatarIcon}</span>
                  <span>{arch.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Selector de Tocados y Sombreros */}
          <div className="space-y-1">
            <span className="text-[11px] font-black text-slate-600 dark:text-white/70 uppercase">
              2. Sombrero o Tocado
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {HEADGEARS.map((hg) => (
                <button
                  key={hg.id}
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(5);
                    sounds.playTap();
                    setSelectedHeadgear(hg);
                  }}
                  className={`p-2.5 rounded-[18px] text-2xl border transition-all cursor-pointer flex-shrink-0 ${
                    selectedHeadgear.id === hg.id
                      ? 'bg-amber-400 border-white shadow-md scale-110'
                      : 'bg-white/60 dark:bg-white/10 border-black/5'
                  }`}
                  title={hg.label}
                >
                  {hg.icon}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Selector de Superpoder */}
          <div className="space-y-1">
            <span className="text-[11px] font-black text-slate-600 dark:text-white/70 uppercase">
              3. Emblema de Poder
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {POWERS.map((pow) => (
                <button
                  key={pow.id}
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(5);
                    sounds.playTap();
                    setSelectedPower(pow);
                  }}
                  className={`px-3 py-2 rounded-[20px] flex items-center gap-1.5 text-xs font-black border transition-all cursor-pointer flex-shrink-0 ${
                    selectedPower.id === pow.id
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-white shadow-md scale-105'
                      : 'bg-white/60 dark:bg-white/10 text-slate-700 dark:text-white border-black/5'
                  }`}
                >
                  <span className="text-lg">{pow.icon}</span>
                  <span>{pow.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Tintes y Colores de Aura */}
          <div className="space-y-1">
            <span className="text-[11px] font-black text-slate-600 dark:text-white/70 uppercase">
              4. Tinte de Aura Zentry
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {SUIT_GRADIENTS.map((grad) => (
                <button
                  key={grad.id}
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(5);
                    setSelectedGradient(grad);
                  }}
                  className={`w-9 h-9 rounded-full bg-gradient-to-tr ${grad.class} border-2 transition-transform cursor-pointer flex-shrink-0 ${
                    selectedGradient.id === grad.id ? 'scale-125 border-white ring-4 ring-purple-500/50 shadow-lg' : 'border-white/60'
                  }`}
                  title={grad.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SALÓN DE HÉROES GUARDADOS                                 */}
        {/* ========================================================= */}
        {savedHeroes.length > 0 && (
          <div className="p-3.5 rounded-[28px] bg-white/40 dark:bg-white/10 backdrop-blur-md border border-white/60 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-slate-800 dark:text-white">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Salón de Héroes ({savedHeroes.length})</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 overflow-x-auto no-scrollbar">
              {savedHeroes.map((hero) => (
                <div
                  key={hero.id}
                  onClick={() => speak(`Soy ${hero.name}, ${hero.archetype}. Tengo el poder de ${hero.powerName}.`)}
                  className="p-2.5 rounded-[20px] bg-white/70 dark:bg-white/10 border border-black/5 dark:border-white/10 flex items-center gap-2 cursor-pointer hover:scale-102 transition-transform shadow-sm"
                >
                  <div className={`w-10 h-10 rounded-[14px] bg-gradient-to-tr ${hero.gradientClass} flex items-center justify-center text-xl flex-shrink-0`}>
                    {hero.icon}
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-black block truncate">{hero.name}</span>
                    <span className="text-[10px] opacity-60 truncate block">{hero.archetype}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ZentrySubPageScaffold>
  );
};

export default ZentryCharacterScreen;
