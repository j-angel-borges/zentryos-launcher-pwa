import React, { useState } from 'react';
import {
  Palette,
  Brush,
  Globe,
  Orbit,
  UserCheck,
  Wand2,
  BookOpen,
  Feather,
  Music,
  Bot,
  Sparkles,
  Camera,
  Calculator,
  Atom,
  Layers,
  Film,
  Compass,
  Smile,
  Flame,
  Box
} from 'lucide-react';
import type { ScreenId } from '../../types/zentry';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { FisheyeBubbleGrid, type FisheyeItemData } from './FisheyeBubbleGrid';
import { sounds } from '../../services/soundEffects';

interface Props {
  onBack: () => void;
  onNavigate: (screen: ScreenId) => void;
  isDark: boolean;
}

export const ZentryCreationScreen: React.FC<Props> = ({ onBack, onNavigate, isDark }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const categories = [
    { id: 'todos', label: '✨ Todas' },
    { id: 'arte', label: '🎨 Arte' },
    { id: 'mundos', label: '🪐 Mundos' },
    { id: 'personajes', label: '🎭 Personajes' },
    { id: 'historias', label: '📖 Historias' },
    { id: 'stem', label: '🔬 Lab STEM' }
  ];

  const creationApps: FisheyeItemData[] = [
    // 1. Centro / Ancla principal: Art Attack (NeuroArt)
    {
      id: 'neuro_art',
      name: 'Art-Attack',
      category: 'arte',
      desc: 'Lienzo creativo e IA de dibujo',
      icon: Palette,
      screen: 'neuro_art',
      gradient: 'from-pink-500 via-rose-500 to-red-500',
      badge: 'IA'
    },
    // 2. Generador de Mundos
    {
      id: 'world_generator',
      name: 'Mundos Vivos',
      category: 'mundos',
      desc: 'Simulaciones y físicas interactivas',
      icon: Globe,
      screen: 'world_generator',
      gradient: 'from-amber-400 via-orange-500 to-red-500',
      badge: '3D'
    },
    // 3. Generador de Personajes / Avatares
    {
      id: 'characters',
      name: 'Personajes',
      category: 'personajes',
      desc: 'Crea avatares y héroes fantásticos',
      icon: UserCheck,
      screen: 'neuro_art',
      gradient: 'from-purple-500 via-indigo-500 to-blue-600',
      badge: 'IA'
    },
    // 4. Estudio de Cuentos (Redactor)
    {
      id: 'redactor',
      name: 'Redactor',
      category: 'historias',
      desc: 'Co-autor de ensayos e historias',
      icon: Feather,
      screen: 'redactor',
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      badge: 'Socrático'
    },
    // 5. Tutor Creativo AI
    {
      id: 'creative_ai',
      name: 'Tutor Creativo',
      category: 'historias',
      desc: 'Preguntas y lluvia de ideas mágicas',
      icon: Bot,
      screen: 'ai',
      gradient: 'from-violet-500 via-purple-600 to-fuchsia-600',
      badge: 'Vertex'
    },
    // 6. Investigador de Curiosidades
    {
      id: 'deep_research',
      name: 'Investigador',
      category: 'historias',
      desc: 'Descubrimientos y hechos asombrosos',
      icon: Sparkles,
      screen: 'deep_research',
      gradient: 'from-emerald-400 via-teal-500 to-cyan-600'
    },
    // 7. Misiones Reales y Físicas
    {
      id: 'real_missions',
      name: 'Misiones Reales',
      category: 'mundos',
      desc: 'Retos creativos en casa y patio',
      icon: Compass,
      screen: 'world_generator',
      gradient: 'from-lime-400 via-emerald-500 to-green-600'
    },
    // 8. Taller de Monstruos Amigables
    {
      id: 'friendly_monsters',
      name: 'Monstruos',
      category: 'personajes',
      desc: 'Diseña criaturas de cuentos',
      icon: Smile,
      screen: 'neuro_art',
      gradient: 'from-yellow-400 via-amber-500 to-orange-500'
    },
    // 9. Lienzo Libre
    {
      id: 'free_canvas',
      name: 'Lienzo Libre',
      category: 'arte',
      desc: 'Pinceles de colores y texturas',
      icon: Brush,
      screen: 'neuro_art',
      gradient: 'from-fuchsia-500 via-pink-600 to-rose-600'
    },
    // 10. Estudio de Animación
    {
      id: 'animation_studio',
      name: 'Animación',
      category: 'arte',
      desc: 'Fotogramas en movimiento',
      icon: Film,
      screen: 'neuro_art',
      gradient: 'from-rose-500 via-red-600 to-amber-600'
    },
    // 11. Pixel Art
    {
      id: 'pixel_art',
      name: 'Pixel Studio',
      category: 'arte',
      desc: 'Mosaicos y sprites retro',
      icon: Layers,
      screen: 'neuro_art',
      gradient: 'from-teal-400 via-cyan-500 to-blue-500'
    },
    // 12. Simulador Planetario
    {
      id: 'planet_sim',
      name: 'Planetas',
      category: 'mundos',
      desc: 'Gravedad, órbitas y eclipses',
      icon: Orbit,
      screen: 'world_generator',
      gradient: 'from-indigo-600 via-blue-600 to-cyan-500'
    },
    // 13. Taller 3D
    {
      id: 'box_3d',
      name: 'Constructor 3D',
      category: 'mundos',
      desc: 'Bloques y estructuras físicas',
      icon: Box,
      screen: 'world_generator',
      gradient: 'from-sky-500 via-indigo-500 to-purple-600'
    },
    // 14. Avatares Mágicos
    {
      id: 'magic_avatars',
      name: 'Magia Visual',
      category: 'personajes',
      desc: 'Transformaciones y disfraces',
      icon: Wand2,
      screen: 'neuro_art',
      gradient: 'from-purple-600 via-violet-600 to-pink-600'
    },
    // 15. Estudio de Cómics
    {
      id: 'comic_studio',
      name: 'Cómics',
      category: 'historias',
      desc: 'Viñetas y diálogos ilustrados',
      icon: BookOpen,
      screen: 'redactor',
      gradient: 'from-pink-500 via-purple-500 to-indigo-600'
    },
    // 16. Laboratorio de Sonidos
    {
      id: 'sound_lab',
      name: 'Sonidos & Ritmo',
      category: 'stem',
      desc: 'Sintetizador y efectos musicales',
      icon: Music,
      screen: 'neuro_art',
      gradient: 'from-violet-500 via-fuchsia-500 to-rose-500'
    },
    // 17. Visión Multimodal (Cámara Tareas)
    {
      id: 'camera_vision',
      name: 'Cámara Tareas',
      category: 'stem',
      desc: 'Analiza tus proyectos y dibujos',
      icon: Camera,
      screen: 'camera',
      gradient: 'from-cyan-500 via-sky-600 to-blue-600'
    },
    // 18. Matemáticas Visuales
    {
      id: 'visual_math',
      name: 'Matemáticas',
      category: 'stem',
      desc: 'Geometría y fracciones interactivas',
      icon: Calculator,
      screen: 'calculator',
      gradient: 'from-teal-500 via-emerald-600 to-green-600'
    },
    // 19. Laboratorio STEM
    {
      id: 'stem_lab',
      name: 'Inventos STEM',
      category: 'stem',
      desc: 'Experimentos y ciencia en casa',
      icon: Atom,
      screen: 'deep_research',
      gradient: 'from-amber-500 via-rose-500 to-purple-600'
    }
  ];

  return (
    <ZentrySubPageScaffold
      title="Espacio Creativo"
      kicker="CAJÓN DE APLICACIONES"
      onBack={onBack}
      isDark={isDark}
    >
      <div className="w-full h-full flex flex-col overflow-hidden relative">
        {/* Category Pills Header */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 px-1 flex-shrink-0">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(8);
                  sounds.playTap();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer zentry-press ${
                  isSelected
                    ? isDark
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40 scale-105 border border-purple-400/40'
                      : 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105 border border-indigo-300'
                    : isDark
                    ? 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white border border-white/10'
                    : 'bg-white/60 text-[#3B3B58] hover:bg-white/90 border border-black/5'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Apple Watch Fisheye Spherical Bubble Grid */}
        <div className="flex-1 w-full h-full relative overflow-hidden rounded-[28px]">
          <FisheyeBubbleGrid
            items={creationApps}
            selectedCategory={selectedCategory}
            onSelectApp={(app) => {
              onNavigate(app.screen);
            }}
            isDark={isDark}
          />
        </div>
      </div>
    </ZentrySubPageScaffold>
  );
};

export default ZentryCreationScreen;
