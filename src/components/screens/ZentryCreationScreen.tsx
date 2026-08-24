import React from 'react';
import {
  Palette,
  Globe,
  UserCheck,
  Brush,
  Compass,
  Smile
} from 'lucide-react';
import type { ScreenId } from '../../types/zentry';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { FisheyeBubbleGrid, type FisheyeItemData } from './FisheyeBubbleGrid';

interface Props {
  onBack: () => void;
  onNavigate: (screen: ScreenId) => void;
  isDark: boolean;
}

export const ZentryCreationScreen: React.FC<Props> = ({ onBack, onNavigate, isDark }) => {
  // Aplicaciones de creación sensorial para la sección de 2 a 5 años (sin exceso de texto ni tutores académicos)
  const creationApps: FisheyeItemData[] = [
    {
      id: 'neuro_art',
      name: 'Art-Attack',
      category: 'arte',
      icon: Palette,
      screen: 'neuro_art',
      gradient: 'from-pink-500 via-rose-500 to-red-500'
    },
    {
      id: 'world_generator',
      name: 'Generador de Mundos',
      category: 'mundos',
      icon: Globe,
      screen: 'world_generator',
      gradient: 'from-amber-400 via-orange-500 to-red-500'
    },
    {
      id: 'characters',
      name: 'Personajes',
      category: 'personajes',
      icon: UserCheck,
      screen: 'neuro_art',
      gradient: 'from-purple-500 via-indigo-500 to-blue-600'
    },
    {
      id: 'free_canvas',
      name: 'Lienzo Libre',
      category: 'arte',
      icon: Brush,
      screen: 'neuro_art',
      gradient: 'from-fuchsia-500 via-pink-600 to-rose-600'
    },
    {
      id: 'real_missions',
      name: 'Misiones Reales',
      category: 'mundos',
      icon: Compass,
      screen: 'world_generator',
      gradient: 'from-lime-400 via-emerald-500 to-green-600'
    },
    {
      id: 'friendly_monsters',
      name: 'Monstruos',
      category: 'personajes',
      icon: Smile,
      screen: 'neuro_art',
      gradient: 'from-yellow-400 via-amber-500 to-orange-500'
    }
  ];

  return (
    <ZentrySubPageScaffold
      title="Crear"
      kicker="ESPACIO CREATIVO"
      onBack={onBack}
      isDark={isDark}
    >
      <div className="w-full h-full relative overflow-hidden rounded-[28px]">
        <FisheyeBubbleGrid
          items={creationApps}
          onSelectApp={(app) => {
            onNavigate(app.screen);
          }}
          isDark={isDark}
        />
      </div>
    </ZentrySubPageScaffold>
  );
};

export default ZentryCreationScreen;
