import React, { useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';
import type { AgeTier } from '../../types/zentry';

interface Props {
  onTap: () => void;
  onDoubleTap: () => void;
  isDark: boolean;
  ageTier?: AgeTier;
}

export const ZentryLiquidButton: React.FC<Props> = ({ 
  onTap, 
  onDoubleTap,
  ageTier = 'toddler' 
}) => {
  const timerRef = useRef<any>(null);
  const clickCount = useRef(0);

  const handleClick = () => {
    clickCount.current += 1;
    if (clickCount.current === 1) {
      timerRef.current = setTimeout(() => {
        clickCount.current = 0;
        sounds.playAppOpen();
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(20);
        }
        if (ageTier === 'toddler') {
          voiceService.speakFeedback('¡Hola! Soy Zentry. ¿Qué quieres explorar hoy?');
        }
        onTap();
      }, 250);
    } else if (clickCount.current === 2) {
      clearTimeout(timerRef.current);
      clickCount.current = 0;
      sounds.playTap();
      onDoubleTap();
    }
  };

  return (
    <div
      onClick={handleClick}
      className="zentry-liquid-surface w-full h-22 md:h-20 rounded-[32px] md:rounded-[24px] flex items-center justify-center gap-3 cursor-pointer zentry-press transition-all duration-300 shadow-lg relative overflow-hidden group"
    >
      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
        <Sparkles className="w-6 h-6 animate-pulse" />
      </div>
      <div className="flex flex-col items-start z-10">
        <span className="text-white text-xl md:text-2xl font-black tracking-wider drop-shadow-md">
          {ageTier === 'toddler' ? 'Zentry Amigo' : 'Zentry AI'}
        </span>
        {ageTier === 'toddler' && (
          <span className="text-white/80 text-[11px] font-bold">
            Toca para conversar
          </span>
        )}
      </div>
    </div>
  );
};
