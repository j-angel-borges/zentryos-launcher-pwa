import React, { useState } from 'react';
import { Compass, Orbit, Sun, Trees } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

export const WorldGenerator: React.FC = () => {
  const [gravity, setGravity] = useState<number>(9.8);
  const [oxygen, setOxygen] = useState<number>(21);
  const [temperature, setTemperature] = useState<number>(15);

  const handleSimulate = () => {
    sounds.playSuccess();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-4xl mx-auto w-full space-y-5 text-white animate-in fade-in duration-300">
      <div className="liquid-glass rounded-3xl p-4 border border-amber-400/30 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-md">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Generador de Mundos & Simulador Planetario</h3>
            <p className="text-xs text-slate-300">Modela las leyes físicas de exoplanetas y observa cómo evoluciona su atmósfera.</p>
          </div>
        </div>
      </div>

      <div className="relative w-full h-72 rounded-3xl overflow-hidden liquid-glass border border-white/20 shadow-2xl flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-950 to-amber-950/40 p-6 text-center space-y-4">
        <div className="relative">
          <div 
            className="w-32 h-32 rounded-full bg-gradient-to-br from-sky-400 via-indigo-500 to-amber-400 shadow-[0_0_50px_rgba(56,189,248,0.4)] flex items-center justify-center animate-spin-slow"
          />
        </div>

        <div className="space-y-1 z-10">
          <h4 className="text-sm font-bold text-white tracking-wide">Exoplaneta Zentry-4B</h4>
          <p className="text-xs text-slate-300 font-mono">
            Gravedad: {gravity} m/s² | Oxígeno: {oxygen}% | Temp: {temperature}°C
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="liquid-glass-card rounded-2xl p-4 space-y-2 border border-white/10">
          <div className="flex justify-between text-xs font-semibold text-sky-300">
            <span className="flex items-center gap-1"><Orbit className="w-4 h-4" /> Gravedad</span>
            <span className="font-mono">{gravity} m/s²</span>
          </div>
          <input
            type="range"
            min="1.6"
            max="24.8"
            step="0.2"
            value={gravity}
            onChange={(e) => {
              setGravity(Number(e.target.value));
              handleSimulate();
            }}
            className="w-full accent-sky-400 bg-white/10 rounded-lg h-2 cursor-pointer"
          />
        </div>

        <div className="liquid-glass-card rounded-2xl p-4 space-y-2 border border-white/10">
          <div className="flex justify-between text-xs font-semibold text-emerald-300">
            <span className="flex items-center gap-1"><Trees className="w-4 h-4" /> Oxígeno</span>
            <span className="font-mono">{oxygen}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            value={oxygen}
            onChange={(e) => {
              setOxygen(Number(e.target.value));
              handleSimulate();
            }}
            className="w-full accent-emerald-400 bg-white/10 rounded-lg h-2 cursor-pointer"
          />
        </div>

        <div className="liquid-glass-card rounded-2xl p-4 space-y-2 border border-white/10">
          <div className="flex justify-between text-xs font-semibold text-amber-300">
            <span className="flex items-center gap-1"><Sun className="w-4 h-4" /> Temperatura</span>
            <span className="font-mono">{temperature}°C</span>
          </div>
          <input
            type="range"
            min="-50"
            max="60"
            value={temperature}
            onChange={(e) => {
              setTemperature(Number(e.target.value));
              handleSimulate();
            }}
            className="w-full accent-amber-400 bg-white/10 rounded-lg h-2 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
