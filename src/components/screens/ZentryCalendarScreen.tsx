import React from 'react';
import { Calendar as CalendarIcon, CheckCircle2, Clock } from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryCalendarScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const events = [
    { time: '08:00 AM', title: 'Ventana de Concentración Matutina', done: true },
    { time: '02:00 PM', title: 'Reto de Matemáticas & Geometría', done: false },
    { time: '04:30 PM', title: 'Sesión de Lectura & Arte 3D', done: false },
    { time: '08:00 PM', title: 'Cierre Circadiano & Modo Sueño', done: false }
  ];

  return (
    <ZentrySubPageScaffold title="Calendario Escolar" kicker="AGENDA & RETOS" onBack={onBack} isDark={isDark}>
      <div className="max-w-lg mx-auto w-full space-y-3">
        {events.map((ev, idx) => (
          <div
            key={idx}
            className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[20px] p-3.5 flex items-center justify-between'}
          >
            <div className="flex items-center gap-3">
              {ev.done ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-indigo-400 shrink-0" />
              )}
              <div>
                <div className="text-xs font-bold">{ev.title}</div>
                <div className="text-[10px] text-slate-400">{ev.time}</div>
              </div>
            </div>
            <span className={'px-2 py-0.5 rounded-full text-[9px] font-bold ' + (ev.done ? 'bg-emerald-500/20 text-emerald-300' : 'bg-indigo-500/20 text-indigo-300')}>
              {ev.done ? 'Completado' : 'Pendiente'}
            </span>
          </div>
        ))}
      </div>
    </ZentrySubPageScaffold>
  );
};
