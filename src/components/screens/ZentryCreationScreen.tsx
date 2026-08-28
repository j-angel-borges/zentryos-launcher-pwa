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
      id: 'free_canvas',
      name: 'Lienzo',
      category: 'arte',
      icon: Brush,
      screen: 'free_canvas',
      gradient: 'from-pink-500 via-rose-500 to-purple-600'
    },
    {
      id: 'characters',
      name: 'Personajes',
      category: 'personajes',
      icon: UserCheck,
      screen: 'characters',
      gradient: 'from-purple-500 via-fuchsia-600 to-indigo-600'
    },
    {
      id: 'real_missions',
      name: 'Misiones',
      category: 'mundos',
      icon: Compass,
      screen: 'real_missions',
      gradient: 'from-emerald-500 via-teal-600 to-green-600'
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
