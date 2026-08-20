import React, { useState, useEffect } from 'react';

interface Props {
  isDark: boolean;
  onClick?: () => void;
}

export const LiveClockWidget: React.FC<Props> = ({ isDark, onClick }) => {
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
      className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'w-full rounded-[20px] p-3.5 flex items-center justify-between cursor-pointer zentry-press'}
    >
      <div>
        <div className={(isDark ? 'text-white/60 ' : 'text-[#3B3B58]/60 ') + 'text-[11px] font-bold'}>
          Reloj Mágico
        </div>
        <div className={(isDark ? 'text-white ' : 'text-[#1E293B] ') + 'text-sm font-bold'}>
          ¡Hola! Disfruta tu día
        </div>
      </div>
      <div className={(isDark ? 'text-[#C8B6FF] ' : 'text-[#4A306D] ') + 'text-2xl font-black tracking-tight'}>
        {timeStr}
      </div>
    </div>
  );
};
