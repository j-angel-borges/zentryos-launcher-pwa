import React from 'react';
import { 
  GraduationCap, 
  Tv, 
  Camera, 
  Palette, 
  Calculator,
  Compass
} from 'lucide-react';
import type { ActiveAppId } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';

interface Props {
  activeApp: ActiveAppId;
  onOpenApp: (appId: ActiveAppId) => void;
}

export const MicroAppDock: React.FC<Props> = ({ activeApp, onOpenApp }) => {
  const dockApps = [
    {
      id: 'study_assistant' as ActiveAppId,
      name: 'Tutor Socrático',
      icon: GraduationCap,
      color: 'from-sky-500 to-blue-600',
      badge: 'MINEDU'
    },
    {
      id: 'youtube_guard' as ActiveAppId,
      name: 'Escudo YouTube',
      icon: Tv,
      color: 'from-rose-500 to-red-600',
      badge: 'Anti-Doom'
    },
    {
      id: 'camera_tutor' as ActiveAppId,
      name: 'Cámara IA',
      icon: Camera,
      color: 'from-purple-500 to-indigo-600',
      badge: 'Vision'
    },
    {
      id: 'neuro_art' as ActiveAppId,
      name: 'NeuroArt',
      icon: Palette,
      color: 'from-pink-500 to-rose-600',
      badge: 'Creatividad'
    },
    {
      id: 'world_generator' as ActiveAppId,
      name: 'Generador',
      icon: Compass,
      color: 'from-amber-500 to-orange-600',
      badge: '3D Sim'
    },
    {
      id: 'calculator' as ActiveAppId,
      name: 'Calculadora',
      icon: Calculator,
      color: 'from-emerald-500 to-teal-600'
    }
  ];

  return (
    <div className="relative z-30 pb-3 px-4 max-w-2xl mx-auto w-full">
      <div className="liquid-glass rounded-3xl p-3 border border-white/20 shadow-2xl flex items-center justify-around gap-2">
        {dockApps.map((app) => {
          const Icon = app.icon;
          const isActive = activeApp === app.id;

          return (
            <button
              key={app.id}
              onClick={() => {
                sounds.playAppOpen();
                onOpenApp(app.id);
              }}
              className={'group relative flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-300 cursor-pointer active:scale-90 ' + (isActive ? 'bg-white/20 scale-105 shadow-lg' : 'hover:bg-white/10 hover:-translate-y-1')}
            >
              <div className={'relative w-12 h-12 rounded-2xl bg-gradient-to-br ' + app.color + ' p-0.5 shadow-lg flex items-center justify-center text-white transition-transform group-hover:scale-105'}>
                <Icon className="w-6 h-6" />
                {app.badge && (
                  <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full bg-slate-900/90 border border-white/20 text-[9px] font-bold text-sky-300 shadow-sm">
                    {app.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium text-slate-200 group-hover:text-white tracking-tight text-center truncate max-w-[64px]">
                {app.name}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
