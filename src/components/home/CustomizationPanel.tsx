import React from 'react';
import { X, Check } from 'lucide-react';
import type { WallpaperId } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentWallpaper: WallpaperId;
  onSelectWallpaper: (id: WallpaperId) => void;
  showClock: boolean;
  onToggleClock: () => void;
  showCalendar: boolean;
  onToggleCalendar: () => void;
}

export const CustomizationPanel: React.FC<Props> = ({
  isOpen,
  onClose,
  currentWallpaper,
  onSelectWallpaper,
  showClock,
  onToggleClock,
  showCalendar,
  onToggleCalendar
}) => {
  if (!isOpen) return null;

  const wallpapers: { id: WallpaperId; name: string; color: string }[] = [
    { id: 'Glacial', name: 'Glacial', color: '#F1F5F9' },
    { id: 'Lila', name: 'Lila', color: '#E9E3FF' },
    { id: 'Aura', name: 'Aura', color: '#FFE8E8' },
    { id: 'Brisa', name: 'Brisa', color: '#E3F2FD' },
    { id: 'Espacio', name: 'Espacio', color: '#26262B' }
  ];

  return (
    <div className="absolute inset-x-0 bottom-0 z-50 p-4 max-w-lg mx-auto animate-in fade-in duration-200">
      <div className="bg-[#1E1E24]/95 backdrop-blur-2xl border border-white/15 rounded-[32px] p-5 shadow-2xl text-white space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-sm font-bold">Personalizar Espacio Zentry</span>
          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wallpaper Picker */}
        <div className="space-y-2">
          <div className="text-xs text-slate-300 font-semibold">Fondo de Pantalla</div>
          <div className="flex items-center gap-3">
            {wallpapers.map((wp) => {
              const active = currentWallpaper === wp.id;
              return (
                <button
                  key={wp.id}
                  onClick={() => {
                    sounds.playTap();
                    onSelectWallpaper(wp.id);
                  }}
                  style={{ backgroundColor: wp.color }}
                  className={'w-8 h-8 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ' + (active ? 'border-[#C8B6FF] scale-110 shadow-lg' : 'border-white/30')}
                  title={wp.name}
                >
                  {active && <Check className="w-4 h-4 text-[#4A306D]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Widget Toggles */}
        <div className="space-y-2 pt-1 border-t border-white/10">
          <div className="text-xs text-slate-300 font-semibold">Widgets Activos</div>
          <div className="flex items-center justify-between text-xs">
            <span>Reloj Mágico</span>
            <input
              type="checkbox"
              checked={showClock}
              onChange={() => {
                sounds.playTap();
                onToggleClock();
              }}
              className="accent-[#8B5CF6] w-4 h-4 cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Retos de Calendario</span>
            <input
              type="checkbox"
              checked={showCalendar}
              onChange={() => {
                sounds.playTap();
                onToggleCalendar();
              }}
              className="accent-[#8B5CF6] w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
