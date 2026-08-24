import React from 'react';
import { Palette, Gamepad2 } from 'lucide-react';
import type { ScreenId } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';

interface Props {
  isDark: boolean;
  onNavigate: (screen: ScreenId) => void;
}

export const OSSecondaryCards: React.FC<Props> = ({ isDark, onNavigate }) => {
  return (
    <div className="flex items-center gap-4 w-full">
      {/* Card Crear */}
      <div
        onClick={() => {
          sounds.playAppOpen();
          onNavigate('creation');
        }}
        className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'flex-1 h-28 rounded-[20px] flex flex-col items-center justify-center gap-1.5 cursor-pointer zentry-press'}
      >
        <Palette className={(isDark ? 'text-white ' : 'text-[#3B3B58] ') + 'w-9 h-9'} />
        <span className={(isDark ? 'text-white ' : 'text-[#1E293B] ') + 'text-sm font-extrabold'}>
          Crear
        </span>
      </div>

      {/* Card Entretener */}
      <div
        onClick={() => {
          sounds.playTap();
          alert('Espacio Recreativo Escolar ZentryOS');
        }}
        className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'flex-1 h-28 rounded-[20px] flex flex-col items-center justify-center gap-1.5 cursor-pointer zentry-press'}
      >
        <Gamepad2 className={(isDark ? 'text-white ' : 'text-[#3B3B58] ') + 'w-9 h-9'} />
        <span className={(isDark ? 'text-white ' : 'text-[#1E293B] ') + 'text-sm font-extrabold'}>
          Entretener
        </span>
      </div>
    </div>
  );
};
