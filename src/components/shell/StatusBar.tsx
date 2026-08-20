import React, { useState, useEffect } from 'react';
import { Wifi, Battery, ShieldCheck, Moon, Sun, Sunrise, Sunset, ChevronDown } from 'lucide-react';
import type { CircadianRhythm, DeviceFirestoreState } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';

interface Props {
  circadian: CircadianRhythm;
  deviceState: DeviceFirestoreState;
  onOpenQuickSettings: () => void;
  isQuickSettingsOpen: boolean;
}

export const StatusBar: React.FC<Props> = ({
  circadian,
  deviceState,
  onOpenQuickSettings,
  isQuickSettingsOpen
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const getPeriodIcon = () => {
    switch (circadian.period) {
      case 'morning':
        return <Sunrise className="w-3.5 h-3.5 text-amber-400" />;
      case 'day':
        return <Sun className="w-3.5 h-3.5 text-sky-400" />;
      case 'evening':
        return <Sunset className="w-3.5 h-3.5 text-pink-400" />;
      case 'night':
      default:
        return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <header className="relative z-40 w-full px-5 py-2.5 flex items-center justify-between text-xs text-slate-200 select-none liquid-glass border-b border-white/10">
      <div className="flex items-center gap-2.5 font-medium">
        <span className="text-sm font-semibold tracking-tight text-white">{timeStr}</span>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-[11px]">
          {getPeriodIcon()}
          <span className="capitalize text-slate-300">{circadian.name}</span>
        </div>
      </div>

      <button
        onClick={() => {
          sounds.playTap();
          onOpenQuickSettings();
        }}
        className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 transition-all text-[11px] text-slate-300 hover:text-white cursor-pointer active:scale-95"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-medium tracking-wide">ZentryOS Kiosk</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isQuickSettingsOpen ? 'rotate-180' : ''}`} />
      </button>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Blindado</span>
        </div>
        <Wifi className="w-3.5 h-3.5 text-slate-300" />
        <div className="flex items-center gap-1 font-mono text-[11px] text-slate-300">
          <span>{deviceState.batteryLevel}%</span>
          <Battery className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
    </header>
  );
};
