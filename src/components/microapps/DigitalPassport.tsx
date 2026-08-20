import React from 'react';
import { Award, Flame, Trophy } from 'lucide-react';

export const DigitalPassport: React.FC = () => {
  const talents = [
    { name: 'Curiosidad Científica', score: 94, level: 'Nivel 5 — Explorador Alfa' },
    { name: 'Razonamiento Lógico', score: 88, level: 'Nivel 4 — Estratega' },
    { name: 'Creatividad Visual', score: 91, level: 'Nivel 5 — Creador' },
    { name: 'Constancia Circadiana', score: 85, level: 'Nivel 4 — Guardián de Enfoque' }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-4xl mx-auto w-full space-y-5 text-white animate-in fade-in duration-300">
      <div className="liquid-glass rounded-3xl p-6 border border-violet-400/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl bg-gradient-to-r from-violet-950/40 to-slate-900/60">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-violet-500/30 ring-2 ring-white/20">
            M
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-xl font-extrabold text-white tracking-tight">Mateo Borges</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-bold border border-violet-500/30">
                Cohorte Zentry 2026
              </span>
            </div>
            <p className="text-xs text-slate-300">6to Grado Primaria • Perfil Vivo de Aprendizaje Activo</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-2 text-xs font-bold">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Racha: 5 Días</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Radar de Curiosidad y Talentos</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {talents.map((t, idx) => (
            <div key={idx} className="liquid-glass-card rounded-2xl p-4 border border-white/10 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">{t.name}</span>
                <span className="text-violet-300 font-mono">{t.score}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-sky-400 rounded-full transition-all duration-1000" 
                  style={{ width: `${t.score}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 font-medium">{t.level}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
