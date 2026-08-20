import React from 'react';
import { Flame, Brain, Sparkles } from 'lucide-react';
import type { CircadianRhythm } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';

interface Props {
  circadian: CircadianRhythm;
  onOpenStudy: () => void;
}

export const CircadianRingWidget: React.FC<Props> = ({ circadian, onOpenStudy }) => {
  const radius = 64;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - circadian.circadianRatio * circumference;

  return (
    <div className="liquid-glass rounded-3xl p-6 border border-white/15 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="-rotate-90 transform">
          <circle
            stroke="rgba(255, 255, 255, 0.08)"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="url(#circadianGradient)"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <defs>
            <linearGradient id="circadianGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center select-none">
          <span className="text-2xl font-extrabold text-white tracking-tight font-mono">
            {circadian.focusMinutesRemaining}
          </span>
          <span className="text-[10px] uppercase font-semibold text-sky-300 tracking-wider">
            min restantes
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-3 text-center md:text-left">
        <div className="space-y-1">
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-sky-400">
            <Brain className="w-4 h-4" />
            <span>Presupuesto de Atención y Enfoque</span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Ventana Óptima de Rendimiento
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Tienes <span className="text-white font-semibold">{circadian.focusMinutesRemaining} minutos</span> protegidos contra distracciones algorítmicas para avanzar en tus metas.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Racha de 5 días</span>
          </div>
          <button
            onClick={() => {
              sounds.playTap();
              onOpenStudy();
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-sky-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Iniciar Reto IA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
