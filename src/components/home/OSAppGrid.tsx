import React from 'react';
import { 
  Calculator, 
  Camera, 
  Clock, 
  Calendar as CalendarIcon, 
  Folder, 
  GraduationCap,
  Palette, 
  Play, 
  Gamepad2 
} from 'lucide-react';
import type { ScreenId, AgeTier } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';

interface Props {
  isDark: boolean;
  ageTier?: AgeTier;
  onNavigate: (screen: ScreenId) => void;
}

export const OSAppGrid: React.FC<Props> = ({ isDark, ageTier = 'toddler', onNavigate }) => {
  // Curated Toddler 2-5 Apps without redundant AI icons (AI is in Dynamic Island & Bottom Nav)
  const toddlerApps = [
    { 
      name: 'Cámara', 
      icon: Camera, 
      screen: 'camera' as ScreenId, 
      bg: 'bg-gradient-to-tr from-amber-400 to-orange-500 text-white',
      speech: '¡Sonríe a la cámara!' 
    },
    { 
      name: 'Dibujar', 
      icon: Palette, 
      screen: 'neuro_art' as ScreenId, 
      bg: 'bg-gradient-to-tr from-purple-500 to-pink-500 text-white',
      speech: '¡Vamos a pintar y crear!' 
    },
    { 
      name: 'Videos', 
      icon: Play, 
      screen: 'entertainment_hub' as ScreenId, 
      bg: 'bg-gradient-to-tr from-rose-500 to-red-500 text-white',
      speech: '¡Hora de ver videos educativos!' 
    },
    { 
      name: 'Reloj', 
      icon: Clock, 
      screen: 'reloj' as ScreenId, 
      bg: 'bg-gradient-to-tr from-yellow-400 to-amber-500 text-white',
      speech: '¡Mira qué hora es!' 
    },
    { 
      name: 'Mundos', 
      icon: Gamepad2, 
      screen: 'world_generator' as ScreenId, 
      bg: 'bg-gradient-to-tr from-emerald-400 to-teal-600 text-white',
      speech: '¡Vamos a crear un mundo mágico!' 
    }
  ];

  const explorerApps = [
    { name: 'Calculadora', icon: Calculator, screen: 'calculator' as ScreenId, bg: '', speech: '' },
    { name: 'Cámara', icon: Camera, screen: 'camera' as ScreenId, bg: '', speech: '' },
    { name: 'Reloj', icon: Clock, screen: 'reloj' as ScreenId, bg: '', speech: '' },
    { name: 'Calendario', icon: CalendarIcon, screen: 'calendar' as ScreenId, bg: '', speech: '' },
    { name: 'Archivos', icon: Folder, screen: 'files' as ScreenId, bg: '', speech: '' },
    { name: 'Tutor', icon: GraduationCap, screen: 'tutor_hub' as ScreenId, bg: '', speech: '' }
  ];

  const apps = ageTier === 'toddler' ? toddlerApps : explorerApps;

  const handleAppClick = (app: typeof toddlerApps[0]) => {
    sounds.playAppOpen();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
    if (ageTier === 'toddler' && app.speech) {
      voiceService.speakFeedback(app.speech);
    }
    onNavigate(app.screen);
  };

  return (
    <div className="grid grid-cols-3 gap-y-5 gap-x-4 w-full justify-items-center max-w-sm mx-auto">
      {apps.map((app) => {
        const Icon = app.icon;
        const isCustomBg = Boolean(app.bg);
        return (
          <div
            key={app.name}
            onClick={() => handleAppClick(app)}
            className="flex flex-col items-center gap-1.5 cursor-pointer zentry-press group"
          >
            <div
              className={
                (isCustomBg
                  ? `${app.bg} shadow-lg `
                  : isDark
                  ? 'zentry-veil-dark text-white '
                  : 'zentry-veil-light text-[#3B3B58] ') +
                'w-16 h-16 rounded-[24px] flex items-center justify-center transition-all group-hover:scale-108 active:scale-95 shadow-sm'
              }
            >
              <Icon className="w-8 h-8" />
            </div>
            <span
              className={
                (isDark
                  ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] '
                  : 'text-slate-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] ') +
                'text-xs font-black tracking-tight text-center truncate max-w-[80px]'
              }
            >
              {app.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};
