import React from 'react';
import {
  Palette,
  Globe,
  UserCheck,
  Brush,
  Wand2,
  Zap,
  Smile,
  BookOpen
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
  // Aplicaciones de creación sensorial e inteligencia artificial avanzada
  const creationApps: FisheyeItemData[] = [
    {
      id: 'imagine_studio',
      name: 'Imagine AI',
      category: 'arte',
      icon: Wand2,
      screen: 'image_generator',
      gradient: 'from-amber-400 via-orange-500 to-pink-500'
    },
    {
      id: 'app_builder',
      name: 'Zentry Build',
      category: 'apps',
      icon: Zap,
      screen: 'app_builder',
      gradient: 'from-indigo-500 via-purple-500 to-pink-500'
    },
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
      name: 'Mundos 3D',
      category: 'mundos',
      icon: Globe,
      screen: 'world_generator',
      gradient: 'from-emerald-400 via-teal-500 to-cyan-600'
    },
    {
      id: 'characters',
      name: 'Personajes',
      category: 'personajes',
      icon: UserCheck,
      screen: 'characters',
      gradient: 'from-purple-500 via-indigo-500 to-blue-600'
    },
    {
      id: 'redactor',
      name: 'Redactor',
      category: 'estudio',
      icon: BookOpen,
      screen: 'redactor',
      gradient: 'from-yellow-400 via-amber-500 to-orange-500'
    }
  ];

  return (
    <ZentrySubPageScaffold
      title="Crear"
      kicker="ESTUDIO DE CREACIÓN AI"
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
