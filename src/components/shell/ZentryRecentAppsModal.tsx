import React, { useState } from 'react';
import { X, Play, Camera, Palette, Clock, Gamepad2, Sparkles, Trash2, CheckCircle2 } from 'lucide-react';
import type { ScreenId, AgeTier } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';

interface RecentAppItem {
  id: ScreenId;
  title: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  lastActive: string;
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
  isDark,
  ageTier = 'toddler'
}) => {
  const [apps, setApps] = useState<RecentAppItem[]>([
    {
      id: 'camera',
      title: 'Cámara',
      category: 'Visión Multimodal',
      icon: Camera,
      gradient: 'from-amber-400 to-orange-500',
      lastActive: 'Hace un momento'
    },
    {
      id: 'creation',
      title: 'Taller de Arte',
      category: 'Dibujo y Pintura',
      icon: Palette,
      gradient: 'from-purple-600 to-indigo-500',
      lastActive: 'En memoria'
    },
    {
      id: 'entertainment_hub',
      title: 'Entretenimiento',
      category: 'Videos & Cuentos',
      icon: Play,
      gradient: 'from-rose-500 to-pink-600',
      lastActive: 'En segundo plano'
    },
    {
      id: 'reloj',
      title: 'Reloj Circadiano',
      category: 'Tiempo & Alarmas',
      icon: Clock,
      gradient: 'from-yellow-400 to-amber-500',
      lastActive: 'Activo'
    },
    {
      id: 'world_generator',
      title: 'Mundos',
      category: 'Generador 3D',
      icon: Gamepad2,
      gradient: 'from-emerald-400 to-teal-600',
      lastActive: 'En pausa'
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
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-lg flex flex-col justify-end items-center p-3 animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sounds.playTap();
          onClose();
        }
      }}
    >
      <div
        className={
          (isDark ? 'zentry-glass-dark text-white ' : 'zentry-glass-light text-[#1E293B] ') +
          'w-full max-w-lg rounded-[36px] p-5 shadow-2xl border border-white/30 space-y-4 animate-in slide-in-from-bottom-6 duration-300 relative overflow-hidden'
        }
      >
        {/* Header with Title and Clear All */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">Procesos en Segundo Plano</h3>
              <p className="text-[10px] text-slate-400">Aplicaciones y tareas recientes en memoria</p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
            title="Cerrar recientes"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Horizontal Carousel of Recent App Cards */}
        {apps.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-pulse" />
            <p className="text-xs font-bold text-slate-300">No hay procesos en segundo plano</p>
            <p className="text-[11px] text-slate-400">Memoria RAM limpia y optimizada</p>
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
                      ? 'ring-2 ring-purple-400 bg-purple-500/20 '
                      : 'bg-white/10 hover:bg-white/15 ') +
                    'w-40 shrink-0 rounded-[28px] p-3.5 flex flex-col justify-between h-48 border border-white/20 shadow-lg cursor-pointer transition-all duration-200 zentry-press relative group snap-start'
                  }
                >
                  {/* Top Close Button on Card */}
                  <button
                    onClick={(e) => handleDismissApp(e, app.id)}
                    className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/40 hover:bg-red-500/80 text-white flex items-center justify-center cursor-pointer transition-colors z-10"
                    title="Cerrar proceso"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* App Icon Container */}
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${app.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* App Info */}
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-white truncate">{app.title}</div>
                    <div className="text-[10px] text-slate-300 font-medium truncate">
                      {app.category}
                    </div>
                    <div className="text-[9px] text-amber-300/90 font-mono pt-1">
                      ● {app.lastActive}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Actions: Clear All */}
        {apps.length > 0 && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-400 font-mono">
              {apps.length} {apps.length === 1 ? 'proceso activo' : 'procesos activos'}
            </span>
            <button
              onClick={handleClearAll}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer zentry-press transition-colors"
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
