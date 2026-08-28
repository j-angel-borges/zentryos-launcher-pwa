import React, { useState } from 'react';
import { X, Play, Camera, Palette, Clock, Gamepad2, Trash2, CheckCircle2 } from 'lucide-react';
import type { ScreenId, AgeTier } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';
import { ZentryLogoIcon } from '../ui/ZentryLogoIcon';

interface RecentAppItem {
  id: ScreenId;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: ScreenId) => void;
  currentScreen: ScreenId;
  isDark: boolean;
  ageTier?: AgeTier;
}

export const ZentryRecentAppsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onNavigate,
  currentScreen,
  isDark
}) => {
  const [apps, setApps] = useState<RecentAppItem[]>([
    {
      id: 'camera',
      title: 'Cámara',
      icon: Camera,
      gradient: 'from-amber-400 to-orange-500'
    },
    {
      id: 'creation',
      title: 'Arte',
      icon: Palette,
      gradient: 'from-purple-600 to-indigo-500'
    },
    {
      id: 'entertainment_hub',
      title: 'Videos',
      icon: Play,
      gradient: 'from-rose-500 to-pink-600'
    },
    {
      id: 'reloj',
      title: 'Reloj',
      icon: Clock,
      gradient: 'from-yellow-400 to-amber-500'
    },
    {
      id: 'world_generator',
      title: 'Mundos',
      icon: Gamepad2,
      gradient: 'from-emerald-400 to-teal-600'
    }
  ]);

  if (!isOpen) return null;

  const handleDismissApp = (e: React.MouseEvent, id: ScreenId) => {
    e.stopPropagation();
    sounds.playTap();
    setApps((prev) => prev.filter((a) => a.id !== id));
  };

  const handleClearAll = () => {
    sounds.playTap();
    setApps([]);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  const handleSelectApp = (id: ScreenId) => {
    sounds.playAppOpen();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
    onNavigate(id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex flex-col justify-end items-center p-3 animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sounds.playTap();
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-lg rounded-[36px] p-5 shadow-2xl border border-purple-400/40 bg-[#120E24]/95 text-white space-y-4 animate-in slide-in-from-bottom-6 duration-300 relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <ZentryLogoIcon className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black tracking-tight text-white drop-shadow-sm">
              Recientes
            </h3>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Carousel of Cards */}
        {apps.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center gap-2 text-center text-slate-300">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-pulse" />
            <p className="text-sm font-black text-white">Limpio</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto py-2 px-1 no-scrollbar snap-x snap-mandatory">
            {apps.map((app) => {
              const Icon = app.icon;
              const isCurrent = currentScreen === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => handleSelectApp(app.id)}
                  className={
                    (isCurrent
                      ? 'ring-2 ring-purple-400 bg-purple-500/30 '
                      : 'bg-white/10 hover:bg-white/20 ') +
                    'w-36 shrink-0 rounded-[26px] p-3 flex flex-col items-center justify-between h-42 border border-white/20 shadow-lg cursor-pointer transition-all duration-200 zentry-spring-press relative group snap-start text-center'
                  }
                >
                  {/* Close Button on Card */}
                  <button
                    onClick={(e) => handleDismissApp(e, app.id)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 hover:bg-red-500 text-white flex items-center justify-center cursor-pointer transition-colors z-10"
                    title="Cerrar"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* App Icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${app.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-108 transition-transform mt-2`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* App Title */}
                  <div className="text-sm font-black text-white drop-shadow-sm truncate mb-1">
                    {app.title}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Actions */}
        {apps.length > 0 && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleClearAll}
              className="px-4 py-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-black flex items-center gap-1.5 cursor-pointer zentry-spring-press border border-red-500/30"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Cerrar todo</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
