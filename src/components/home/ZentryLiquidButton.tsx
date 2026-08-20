import React, { useRef } from 'react';
import { sounds } from '../../services/soundEffects';

interface Props {
  onTap: () => void;
  onDoubleTap: () => void;
  isDark: boolean;
}

export const ZentryLiquidButton: React.FC<Props> = ({ onTap, onDoubleTap }) => {
  const timerRef = useRef<any>(null);
  const clickCount = useRef(0);

  const handleClick = () => {
    clickCount.current += 1;
    if (clickCount.current === 1) {
      timerRef.current = setTimeout(() => {
        clickCount.current = 0;
        sounds.playAppOpen();
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
      className="zentry-liquid-surface w-full h-24 md:h-20 rounded-[32px] md:rounded-[24px] flex items-center justify-center cursor-pointer zentry-press transition-all duration-300"
    >
      <span className="text-white text-2xl md:text-2xl font-black tracking-wider drop-shadow-md z-10">
        Zentry AI
      </span>
    </div>
  );
};
