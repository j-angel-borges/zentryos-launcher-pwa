import React from 'react';
import { 
  Calculator, 
  Camera, 
  Clock, 
  Calendar as CalendarIcon, 
  Folder, 
  GraduationCap 
} from 'lucide-react';
import type { ScreenId } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';

interface Props {
  isDark: boolean;
  onNavigate: (screen: ScreenId) => void;
}

export const OSAppGrid: React.FC<Props> = ({ isDark, onNavigate }) => {
  const apps = [
    { name: 'Calculadora', icon: Calculator, screen: 'calculator' as ScreenId },
    { name: 'Cámara', icon: Camera, screen: 'camera' as ScreenId },
    { name: 'Reloj', icon: Clock, screen: 'reloj' as ScreenId },
    { name: 'Calendario', icon: CalendarIcon, screen: 'calendar' as ScreenId },
    { name: 'Archivos', icon: Folder, screen: 'files' as ScreenId },
    { name: 'Tutor', icon: GraduationCap, screen: 'tutor_hub' as ScreenId }
  ];

  return (
    <div className="grid grid-cols-3 gap-y-4 gap-x-2 w-full justify-items-center">
      {apps.map((app) => {
        const Icon = app.icon;
        return (
          <div
            key={app.name}
            onClick={() => {
              sounds.playAppOpen();
              onNavigate(app.screen);
            }}
            className="flex flex-col items-center gap-1.5 cursor-pointer zentry-press group"
          >
            <div
              className={(isDark ? 'zentry-veil-dark text-white ' : 'zentry-veil-light text-[#3B3B58] ') + 'w-14 h-14 rounded-[18px] flex items-center justify-center transition-all group-hover:scale-105'}
            >
              <Icon className="w-7 h-7" />
            </div>
            <span
              className={(isDark ? 'text-white ' : 'text-[#3B3B58] ') + 'text-[11px] font-bold tracking-tight text-center truncate max-w-[70px]'}
            >
              {app.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};
