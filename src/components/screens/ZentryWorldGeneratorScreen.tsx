import React, { useState } from 'react';
import { Globe, Orbit, Sun, Moon, Compass } from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryWorldGeneratorScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [gravity, setGravity] = useState(9.8);
  const [atmosphere, setAtmosphere] = useState('Oxígeno & Nitrógeno');
  const [temp, setTemp] = useState(15);

  return (
    <ZentrySubPageScaffold title="Generador de Mundos 3D" kicker="SIMULACIÓN FÍSICA" onBack={onBack} isDark={isDark}>
      <div className="max-w-2xl mx-auto w-full space-y-4">
        {/* Planet Viewport */}
        <div className="relative w-full h-64 rounded-[28px] bg-gradient-to-b from-[#0B0C1A] to-[#1E1233] border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 shadow-[0_0_50px_rgba(56,189,248,0.4)] animate-pulse flex items-center justify-center">
            <Orbit className="w-16 h-16 text-white/40 animate-spin" />
          </div>
          <div className="absolute top-4 left-4 text-xs font-mono text-sky-400">
            Mundo: Keplaria-Prime • Gravedad: {gravity} m/s² • Temp: {temp}°C
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[20px] p-3.5 space-y-2'}>
            <span className="text-xs font-bold">Gravedad</span>
            <input
              type="range"
              min="1"
              max="25"
              step="0.1"
              value={gravity}
              onChange={(e) => setGravity(Number(e.target.value))}
              className="w-full accent-[#8B5CF6] h-1.5 bg-white/20 rounded-lg cursor-pointer"
            />
            <div className="text-[10px] text-slate-400 text-right">{gravity} m/s²</div>
          </div>

          <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[20px] p-3.5 space-y-2'}>
            <span className="text-xs font-bold">Temperatura</span>
            <input
              type="range"
              min="-50"
              max="60"
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
              className="w-full accent-[#8B5CF6] h-1.5 bg-white/20 rounded-lg cursor-pointer"
            />
            <div className="text-[10px] text-slate-400 text-right">{temp} °C</div>
          </div>

          <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[20px] p-3.5 space-y-1'}>
            <span className="text-xs font-bold">Atmósfera</span>
            <div className="text-xs text-sky-400 font-semibold pt-1">{atmosphere}</div>
            <div className="text-[10px] text-slate-400">Presión: 1.02 atm</div>
          </div>
        </div>
      </div>
    </ZentrySubPageScaffold>
  );
};
