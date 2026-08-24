import React from 'react';
import { Palette, Play } from 'lucide-react';
import type { ScreenId, AgeTier } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';

interface Props {
  isDark: boolean;
  ageTier?: AgeTier;
  onNavigate: (screen: ScreenId) => void;
}

export const OSSecondaryCards: React.FC<Props> = ({ isDark, ageTier = 'toddler', onNavigate }) => {
  const handleCrear = () => {
    sounds.playAppOpen();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
    if (ageTier === 'toddler') {
      voiceService.speakFeedback('¡Vamos al taller de arte!');
    }
    onNavigate('creation');
  };

  const handleEntretener = () => {
    sounds.playAppOpen();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
    if (ageTier === 'toddler') {
      voiceService.speakFeedback('¡Disfruta tus videos y música favorita!');
    }
    onNavigate('entertainment_hub');
  };

  return (
    <div className="flex items-center gap-3.5 w-full">
      {/* Card Crear */}
      <div
        onClick={handleCrear}
        className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'flex-1 h-24 rounded-[26px] flex flex-col items-center justify-center gap-1 cursor-pointer zentry-press transition-all border border-white/20 hover:border-purple-400/50 shadow-sm'}
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
          <Palette className="w-5 h-5" />
        </div>
        <span className={(isDark ? 'text-white ' : 'text-[#1E293B] ') + 'text-xs font-black tracking-tight'}>
          {ageTier === 'toddler' ? 'Taller de Arte' : 'Crear'}
        </span>
      </div>

      {/* Card Entretener */}
      <div
        onClick={handleEntretener}
        className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'flex-1 h-24 rounded-[26px] flex flex-col items-center justify-center gap-1 cursor-pointer zentry-press transition-all border border-white/20 hover:border-pink-400/50 shadow-sm group'}
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-sm relative">
          <Play className="w-5 h-5 fill-white" />
          <span className="w-2 h-2 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5 animate-ping" />
        </div>
        <span className={(isDark ? 'text-white ' : 'text-[#1E293B] ') + 'text-xs font-black tracking-tight'}>
          {ageTier === 'toddler' ? 'Cuentos & Show' : 'Entretener'}
        </span>
      </div>
    </div>
  );
};

