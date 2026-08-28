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
  Gamepad2,
  Zap,
  Wand2,
  Sparkles,
  BookOpen
} from 'lucide-react';
import type { ScreenId, AgeTier } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';

interface Props {
  isDark: boolean;
  ageTier?: AgeTier;
  onNavigate: (screen: ScreenId) => void;
}

export const OSAppGrid: React.FC<Props> = ({ isDark, ageTier = 'explorer', onNavigate }) => {
  const toddlerApps = [
    { 
      name: 'Cámara', 
      icon: Camera, 
      screen: 'camera' as ScreenId, 
      bg: 'bg-gradient-to-tr from-amber-400 to-orange-500 text-white',
      speech: '¡Sonríe a la cámara!' 
    },
    { 
      name: 'Crear', 
      icon: Palette, 
      screen: 'neuro_art' as ScreenId, 
      bg: 'bg-gradient-to-tr from-purple-500 to-pink-500 text-white',
      speech: '¡Vamos a pintar!' 
    },
    { 
      name: 'Videos', 
      icon: Play, 
      screen: 'entertainment_hub' as ScreenId, 
      bg: 'bg-gradient-to-tr from-rose-500 to-red-500 text-white',
      speech: '¡Hora de videos!' 
    },
    { 
      name: 'Reloj', 
      icon: Clock, 
      screen: 'reloj' as ScreenId, 
      bg: 'bg-gradient-to-tr from-yellow-400 to-amber-500 text-white',
      speech: '¡Reloj!' 
    },
    { 
      name: 'Simulador', 
      icon: Gamepad2, 
      screen: 'simulator' as ScreenId, 
      bg: 'bg-gradient-to-tr from-emerald-400 to-teal-600 text-white',
      speech: '¡Simulador!' 
    }
  ];

  const explorerApps = [
    { 
      name: 'Zentry Build', 
      icon: Zap, 
      screen: 'app_builder' as ScreenId, 
      bg: 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white', 
      speech: '' 
    },
    { 
      name: 'Imagine AI', 
      icon: Wand2, 
      screen: 'image_generator' as ScreenId, 
      bg: 'bg-gradient-to-tr from-amber-400 via-orange-500 to-pink-500 text-white', 
      speech: '' 
    },
    { 
      name: 'Simulador', 
      icon: Sparkles, 
      screen: 'simulator' as ScreenId, 
      bg: 'bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-600 text-white', 
      speech: '' 
    },
    { 
      name: 'Redactor', 
      icon: BookOpen, 
      screen: 'redactor' as ScreenId, 
      bg: 'bg-gradient-to-tr from-yellow-400 via-amber-500 to-orange-500 text-white', 
      speech: '' 
    },
    { 
      name: 'Tutor AI', 
      icon: GraduationCap, 
      screen: 'tutor_hub' as ScreenId, 
      bg: 'bg-gradient-to-tr from-purple-500 to-indigo-600 text-white', 
      speech: '' 
    },
    { 
      name: 'Cámara', 
      icon: Camera, 
      screen: 'camera' as ScreenId, 
      bg: 'bg-gradient-to-tr from-rose-500 to-pink-600 text-white', 
      speech: '' 
    },
    { 
      name: 'Calculadora', 
      icon: Calculator, 
      screen: 'calculator' as ScreenId, 
      bg: 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white', 
      speech: '' 
    },
    { 
      name: 'Archivos', 
      icon: Folder, 
      screen: 'files' as ScreenId, 
      bg: 'bg-gradient-to-tr from-slate-700 to-slate-900 text-white', 
      speech: '' 
    }
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
    <div className="grid grid-cols-3 gap-y-4 gap-x-3 w-full justify-items-center max-w-sm mx-auto">
      {apps.map((app) => {
        const Icon = app.icon;
        return (
          <div
            key={app.name}
            onClick={() => handleAppClick(app)}
            className="flex flex-col items-center gap-1.5 cursor-pointer zentry-spring-press group"
          >
            <div
              className={`${app.bg} w-15 h-15 rounded-[22px] flex items-center justify-center transition-all group-hover:scale-108 active:scale-95 shadow-lg`}
            >
              <Icon className="w-7 h-7" />
            </div>
            <span
              className="text-xs font-black tracking-tight text-white drop-shadow-md text-center truncate max-w-[85px]"
            >
              {app.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};
