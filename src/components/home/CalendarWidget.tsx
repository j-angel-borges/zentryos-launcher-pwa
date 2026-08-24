import React from 'react';
import { GraduationCap, Sparkles } from 'lucide-react';
import type { AgeTier } from '../../types/zentry';

interface Props {
  isDark: boolean;
  ageTier?: AgeTier;
  onClick: () => void;
}

export const CalendarWidget: React.FC<Props> = ({ isDark, ageTier = 'toddler', onClick }) => {
  if (ageTier === 'toddler') {
    return (
      <div
        onClick={onClick}
        className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'w-full rounded-[22px] p-3 flex items-center justify-between cursor-pointer zentry-press transition-all'}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className={(isDark ? 'text-white ' : 'text-[#1E293B] ') + 'text-xs font-bold'}>
              ¡Momento Mágico!
            </div>
            <div className={(isDark ? 'text-white/60 ' : 'text-[#64748B] ') + 'text-[11px]'}>
              Toca para explorar
            </div>
          </div>
        </div>
        <span className="text-lg">🎨</span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'w-full rounded-[20px] p-3.5 space-y-1 cursor-pointer zentry-press'}
    >
      <div className={(isDark ? 'text-white/60 ' : 'text-[#3B3B58]/60 ') + 'text-[11px] font-bold'}>
        Calendario Escolar
      </div>
      <div className="flex items-center gap-1.5">
        <GraduationCap className={(isDark ? 'text-[#C8B6FF] ' : 'text-[#4A306D] ') + 'w-4 h-4'} />
        <span className={(isDark ? 'text-white ' : 'text-[#1E293B] ') + 'text-xs font-semibold'}>
          Próximo Reto: Matemáticas (4:00 PM)
        </span>
      </div>
      <div className={(isDark ? 'text-white/70 ' : 'text-[#64748B] ') + 'text-[11px]'}>
        2 tareas escolares pendientes para hoy
      </div>
    </div>
  );
};
