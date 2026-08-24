import React, { useState, useEffect } from 'react';
import { Sun, Sparkles } from 'lucide-react';
import type { AgeTier } from '../../types/zentry';

interface Props {
  isDark: boolean;
  ageTier?: AgeTier;
  onClick?: () => void;
}

export const LiveClockWidget: React.FC<Props> = ({ isDark, ageTier = 'toddler', onClick }) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      onClick={onClick}
      className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'w-full rounded-[22px] p-3.5 flex items-center justify-between cursor-pointer zentry-press transition-all'}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white shadow-sm">
          <Sun className="w-5 h-5 text-amber-300" />
        </div>
        <div>
          <div className={(isDark ? 'text-white ' : 'text-[#1E293B] ') + 'text-xs font-bold'}>
            {ageTier === 'toddler' ? '¡Hola, Amiguito!' : 'Buenos días'}
          </div>
          <div className={(isDark ? 'text-white/60 ' : 'text-[#64748B] ') + 'text-[11px]'}>
            {ageTier === 'toddler' ? 'Toca para jugar' : 'Tu día en Zentry'}
          </div>
        </div>
      </div>
      <div className={(isDark ? 'text-[#C8B6FF] ' : 'text-[#4A306D] ') + 'text-2xl font-black tracking-tight'}>
        {timeStr}
      </div>
    </div>
  );
};
