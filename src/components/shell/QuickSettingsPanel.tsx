import React from 'react';
import { 
  Wifi, 
  Bluetooth, 
  Radio, 
  Flashlight, 
  Shield, 
  EyeOff, 
  SunMedium, 
  Volume2, 
  X,
  Sparkles,
  Lock
} from 'lucide-react';
import type { QuickSettingsState, CircadianRhythm } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  quickState: QuickSettingsState;
  onUpdateState: (newState: Partial<QuickSettingsState>) => void;
  circadian: CircadianRhythm;
}

export const QuickSettingsPanel: React.FC<Props> = ({
  isOpen,
  onClose,
  quickState,
  onUpdateState,
  circadian
}) => {
  if (!isOpen) return null;

  const toggle = (key: keyof QuickSettingsState) => {
    sounds.playTap();
    onUpdateState({ [key]: !quickState[key] });
  };

  return (
    <div className="absolute inset-x-0 top-12 z-50 p-4 max-w-xl mx-auto animate-in fade-in duration-200">
      <div className="liquid-glass rounded-3xl p-5 border border-white/20 shadow-2xl space-y-5 text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <h3 className="font-semibold text-sm tracking-wide">Centro de Control ZentryOS</h3>
          </div>
          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => toggle('wifi')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all cursor-pointer ${
              quickState.wifi 
                ? 'bg-sky-500/20 border-sky-400/40 text-sky-300' 
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            <Wifi className="w-5 h-5" />
            <span className="text-[11px] font-medium">Wi-Fi</span>
          </button>

          <button
            onClick={() => toggle('bluetooth')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all cursor-pointer ${
              quickState.bluetooth 
                ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300' 
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            <Bluetooth className="w-5 h-5" />
            <span className="text-[11px] font-medium">Bluetooth</span>
          </button>

          <button
            onClick={() => toggle('cellularData')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all cursor-pointer ${
              quickState.cellularData 
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300' 
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            <Radio className="w-5 h-5" />
            <span className="text-[11px] font-medium">Datos</span>
          </button>

          <button
            onClick={() => toggle('flashlight')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all cursor-pointer ${
              quickState.flashlight 
                ? 'bg-amber-500/20 border-amber-400/40 text-amber-300' 
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            <Flashlight className="w-5 h-5" />
            <span className="text-[11px] font-medium">Linterna</span>
          </button>

          <button
            onClick={() => toggle('focusShield')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all cursor-pointer ${
              quickState.focusShield 
                ? 'bg-purple-500/20 border-purple-400/40 text-purple-300' 
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span className="text-[11px] font-medium">Escudo IA</span>
          </button>

          <button
            onClick={() => toggle('monkMode')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all cursor-pointer ${
              quickState.monkMode 
                ? 'bg-rose-500/20 border-rose-400/40 text-rose-300' 
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            <EyeOff className="w-5 h-5" />
            <span className="text-[11px] font-medium">Modo Monje</span>
          </button>
        </div>

        <div className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5"><SunMedium className="w-3.5 h-3.5 text-amber-400" /> Brillo</span>
              <span>{quickState.brightness}%</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={quickState.brightness}
              onChange={(e) => onUpdateState({ brightness: Number(e.target.value) })}
              className="w-full accent-amber-400 bg-white/10 rounded-lg h-2 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5"><Volume2 className="w-3.5 h-3.5 text-sky-400" /> Volumen</span>
              <span>{quickState.volume}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={quickState.volume}
              onChange={(e) => onUpdateState({ volume: Number(e.target.value) })}
              className="w-full accent-sky-400 bg-white/10 rounded-lg h-2 cursor-pointer"
            />
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
          <div>
            <div className="text-slate-400 text-[11px]">Presupuesto Circadiano Restante</div>
            <div className="font-semibold text-white text-sm">{circadian.focusMinutesRemaining} minutos de estudio</div>
          </div>
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300">
            <Lock className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
