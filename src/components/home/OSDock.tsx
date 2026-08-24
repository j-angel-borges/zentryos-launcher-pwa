import React from 'react';
import { Compass, Settings } from 'lucide-react';
import type { ScreenId, AgeTier } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';

interface Props {
  isDark: boolean;
  ageTier?: AgeTier;
  onNavigate: (screen: ScreenId) => void;
}

export const OSDock: React.FC<Props> = ({ isDark, ageTier = 'toddler', onNavigate }) => {
  const handleExplore = () => {
    sounds.playAppOpen();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
    if (ageTier === 'toddler') {
      voiceService.speakFeedback('¡Vamos a explorar videos y cuentos!');
      onNavigate('entertainment_hub');
    } else {
      onNavigate('safe_search');
    }
  };

  const handleSettings = () => {
    sounds.playAppOpen();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
    onNavigate('settings');
  };

  return (
    <div
      className={
        (isDark ? 'zentry-glass-dark ' : 'zentry-glass-light ') +
        'w-full max-w-xs rounded-[30px] py-2 px-8 flex items-center justify-around shadow-xl border border-white/30'
      }
    >
      {/* Explorar Medios */}
      <button
        onClick={handleExplore}
        className={
          (isDark ? 'text-white hover:bg-white/10 ' : 'text-[#3B3B58] hover:bg-black/5 ') +
          'w-12 h-12 rounded-full flex items-center justify-center transition-all zentry-press cursor-pointer active:scale-95'
        }
        title="Explorar"
      >
        <Compass className="w-6 h-6 text-sky-400" />
      </button>

      {/* Ajustes */}
      <button
        onClick={handleSettings}
        className={
          (isDark ? 'text-white hover:bg-white/10 ' : 'text-[#3B3B58] hover:bg-black/5 ') +
          'w-12 h-12 rounded-full flex items-center justify-center transition-all zentry-press cursor-pointer active:scale-95'
        }
        title="Configuración"
      >
        <Settings className="w-6 h-6 text-purple-400" />
      </button>
    </div>
  );
};
