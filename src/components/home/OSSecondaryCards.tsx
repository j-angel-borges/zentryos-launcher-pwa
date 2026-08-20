import React from 'react';
import { Palette, Gamepad2, Sparkles } from 'lucide-react';
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
        className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'flex-1 h-28 rounded-[24px] flex flex-col items-center justify-center gap-1.5 cursor-pointer zentry-press transition-all border border-white/10 hover:border-purple-400/30'}
      >
        <Palette className={(isDark ? 'text-purple-300 ' : 'text-[#3B3B58] ') + 'w-8 h-8'} />
        <span className={(isDark ? 'text-white ' : 'text-[#1E293B] ') + 'text-xs font-extrabold'}>
          Crear
        </span>
      </div>

      {/* Card Entretener (Opens Curated Entertainment Hub: Tube, Tok, Gram) */}
      <div
        onClick={() => {
          sounds.playAppOpen();
          onNavigate('entertainment_hub');
        }}
        className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'flex-1 h-28 rounded-[24px] flex flex-col items-center justify-center gap-1.5 cursor-pointer zentry-press transition-all border border-white/10 hover:border-pink-400/30 group'}
      >
        <div className="relative">
          <Gamepad2 className={(isDark ? 'text-rose-300 ' : 'text-[#3B3B58] ') + 'w-8 h-8'} />
          <span className="w-2 h-2 rounded-full bg-rose-400 absolute -top-0.5 -right-0.5 animate-pulse" />
        </div>
        <span className={(isDark ? 'text-white ' : 'text-[#1E293B] ') + 'text-xs font-extrabold'}>
          Entretener
        </span>
      </div>
    </div>
  );
};
