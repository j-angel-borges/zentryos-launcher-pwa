import React, { useState } from 'react';
import { Sliders, Wallpaper, Lock, Shield, Check } from 'lucide-react';
import type { WallpaperId } from '../../types/zentry';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';

interface Props {
  onBack: () => void;
  currentWallpaper: WallpaperId;
  onSelectWallpaper: (id: WallpaperId) => void;
  isDark: boolean;
}

export const ZentrySettingsScreen: React.FC<Props> = ({
  onBack,
  currentWallpaper,
  onSelectWallpaper,
  isDark
}) => {
  const [brightness, setBrightness] = useState(80);
  const [pin, setPin] = useState('1234');

  const wallpapers: { id: WallpaperId; name: string; color: string }[] = [
    { id: 'Glacial', name: 'Glacial', color: '#F1F5F9' },
    { id: 'Lila', name: 'Lila', color: '#E9E3FF' },
    { id: 'Aura', name: 'Aura', color: '#FFE8E8' },
    { id: 'Brisa', name: 'Brisa', color: '#E3F2FD' },
    { id: 'Espacio', name: 'Espacio', color: '#26262B' }
  ];

  return (
    <ZentrySubPageScaffold title="Configuración" kicker="SISTEMA" onBack={onBack} isDark={isDark}>
      <div className="max-w-lg mx-auto w-full space-y-4 pb-4">
        <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[22px] p-4 space-y-2'}>
          <div className="flex items-center gap-2 text-xs font-bold">
            <Sliders className="w-4 h-4 text-[#8B5CF6]" />
            <span>Brillo de Pantalla</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full accent-[#8B5CF6] h-2 bg-white/20 rounded-lg cursor-pointer"
          />
        </div>

        <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[22px] p-4 space-y-3'}>
          <div className="flex items-center gap-2 text-xs font-bold">
            <Wallpaper className="w-4 h-4 text-[#8B5CF6]" />
            <span>Lienzo Vivo (Wallpaper Circadiano)</span>
          </div>
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
                  className={'w-9 h-9 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ' + (active ? 'border-[#8B5CF6] scale-110 shadow-lg' : 'border-white/40')}
                  title={wp.name}
                >
                  {active && <Check className="w-4 h-4 text-[#4A306D]" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[22px] p-4 space-y-2'}>
          <div className="flex items-center gap-2 text-xs font-bold">
            <Lock className="w-4 h-4 text-[#8B5CF6]" />
            <span>Seguridad y PIN de Acceso</span>
          </div>
          <div className="text-xs text-slate-400">Código PIN actual: {pin}</div>
        </div>

        <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[22px] p-4 space-y-1'}>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Shield className="w-4 h-4" />
            <span>Administrador de Dispositivo Kiosco</span>
          </div>
          <div className="text-[11px] text-slate-400">
            El dispositivo está bajo el control Kiosco de ZentryOS.
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-500 pt-2">
          ZentryOS 2026 • v1.2.0 - liquid
        </div>
      </div>
    </ZentrySubPageScaffold>
  );
};
