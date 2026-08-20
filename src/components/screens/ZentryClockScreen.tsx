import React from 'react';
import { Clock, Timer, AlarmClock } from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryClockScreen: React.FC<Props> = ({ onBack, isDark }) => {
  return (
    <ZentrySubPageScaffold title="Reloj Mágico" kicker="TIEMPO CIRCADIANO" onBack={onBack} isDark={isDark}>
      <div className="max-w-md mx-auto w-full space-y-4 text-center">
        <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[28px] p-6 space-y-2'}>
          <Clock className="w-12 h-12 text-[#8B5CF6] mx-auto animate-pulse" />
          <div className="text-3xl font-black font-mono tracking-tight">10:30 AM</div>
          <div className="text-xs text-slate-400">Ciclo de Estudio Activo</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[20px] p-4 space-y-1'}>
            <Timer className="w-6 h-6 text-sky-400 mx-auto" />
            <div className="text-xs font-bold">Cronómetro</div>
            <div className="text-[10px] text-slate-400">00:00:00</div>
          </div>
          <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[20px] p-4 space-y-1'}>
            <AlarmClock className="w-6 h-6 text-amber-400 mx-auto" />
            <div className="text-xs font-bold">Alarma Escolar</div>
            <div className="text-[10px] text-slate-400">07:00 AM</div>
          </div>
        </div>
      </div>
    </ZentrySubPageScaffold>
  );
};
