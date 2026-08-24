import React, { useState, useEffect, useRef } from 'react';
import { Wifi, Battery, ShieldCheck } from 'lucide-react';
import type { CircadianPhase, DeviceFirestoreState, ScreenId, AgeTier } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';
import { ZentryDynamicIsland } from './ZentryDynamicIsland';

interface Props {
  phase: CircadianPhase;
  deviceState: DeviceFirestoreState;
  onOpenQuickPanel: (tab?: 'quick' | 'notices') => void;
  isDark: boolean;
  currentScreen: ScreenId;
  ageTier?: AgeTier;
  onNavigate: (screen: ScreenId) => void;
}

export const ZentryStatusBar: React.FC<Props> = ({
  deviceState,
  onOpenQuickPanel,
  isDark,
  currentScreen,
  ageTier = 'toddler',
  onNavigate
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

    // If dragged down towards the screen (swipe down gesture)
    if (deltaY > 15) {
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
      className="w-full px-4 pt-2.5 pb-1 flex items-center justify-between text-xs select-none z-30 transition-all bg-transparent border-none shadow-none"
      title="Desliza hacia abajo para abrir los Controles Rápidos y Notificaciones"
    >
      {/* Left: Clean Time (Directo en el fondo unificado) */}
      <div className="flex items-center font-black tracking-tight shrink-0 min-w-[55px]">
        <span
          className={
            (isDark
              ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] '
              : 'text-slate-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] ') +
            'text-xs font-black'
          }
        >
          {timeStr}
        </span>
      </div>

      {/* Center: Live Interactive Dynamic Island (Liquid Glass ZENTRY Flotante) */}
      <div className="flex-1 flex justify-center px-1 max-w-sm">
        <ZentryDynamicIsland
          currentScreen={currentScreen}
          ageTier={ageTier}
          onNavigate={onNavigate}
          isDark={isDark}
        />
      </div>

      {/* Right: Clean Shield, Wifi & Battery Status (Directo en el fondo unificado) */}
      <div
        className={
          (isDark
            ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] '
            : 'text-slate-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] ') +
          'flex items-center gap-2 shrink-0 min-w-[55px] justify-end'
        }
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 drop-shadow-sm" />
        <Wifi className="w-3.5 h-3.5 opacity-90 drop-shadow-sm" />
        <div className="flex items-center gap-1 font-mono text-[11px] font-bold">
          <span>{deviceState.batteryLevel}%</span>
          <Battery className="w-3.5 h-3.5 text-emerald-400 drop-shadow-sm" />
        </div>
      </div>
    </header>
  );
};
