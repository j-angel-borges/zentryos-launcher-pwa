import React, { useState, useEffect, useRef } from 'react';
import { Wifi, Battery, ShieldCheck, Sunrise, Sun, Moon } from 'lucide-react';
import type { CircadianPhase, DeviceFirestoreState } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';

interface Props {
  phase: CircadianPhase;
  deviceState: DeviceFirestoreState;
  onOpenQuickPanel: (tab?: 'quick' | 'notices') => void;
  isDark: boolean;
}

export const ZentryStatusBar: React.FC<Props> = ({
  phase,
  deviceState,
  onOpenQuickPanel,
  isDark
}) => {
  const [timeStr, setTimeStr] = useState('');
  const startY = useRef<number | null>(null);

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
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  const getPhaseIcon = () => {
    switch (phase.name) {
      case 'MORNING':
        return <Sunrise className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />;
      case 'AFTERNOON':
        return <Sun className="w-3.5 h-3.5 text-amber-600 dark:text-sky-400" />;
      case 'NIGHT':
      default:
        return <Moon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startY.current = clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (startY.current === null) return;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const deltaY = clientY - startY.current;
    startY.current = null;

    // If dragged down or tapped
    if (deltaY > 15 || deltaY >= 0) {
      sounds.playTap();
      const isLeft = clientX < window.innerWidth / 2;
      onOpenQuickPanel(isLeft ? 'quick' : 'notices');
    }
  };

  return (
    <header
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      className={`w-full px-5 pt-3 pb-2 flex items-center justify-between text-xs select-none z-30 cursor-pointer transition-all active:opacity-90 bg-transparent border-0 shadow-none ${
        isDark ? 'text-white/90' : 'text-[#2D2D44]'
      }`}
      title="Desliza hacia abajo para abrir los Controles Rápidos y Notificaciones"
    >
      {/* Left: Time and Circadian Phase */}
      <div className="flex items-center gap-2.5 font-semibold">
        <span className="text-sm font-bold tracking-tight">{timeStr}</span>
        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] backdrop-blur-xs ${
          isDark ? 'bg-white/10 text-white/90' : 'bg-black/5 text-[#2D2D44]'
        }`}>
          {getPhaseIcon()}
          <span className="font-medium">{phase.title}</span>
        </div>
      </div>

      {/* Center: Clean Pull Indicator (unified with wallpaper) */}
      <div className="w-10 h-1 rounded-full bg-current opacity-20 transition-opacity hover:opacity-40" />

      {/* Right: Protection & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Protegido</span>
        </div>
        <Wifi className="w-3.5 h-3.5 opacity-80" />
        <div className="flex items-center gap-1 font-mono text-[11px]">
          <span>{deviceState.batteryLevel}%</span>
          <Battery className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>
    </header>
  );
};
