import React from 'react';
import { BookOpen, Search, Edit3, Calendar } from 'lucide-react';
import type { ScreenId } from '../../types/zentry';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';

interface Props {
  onBack: () => void;
  onNavigate: (screen: ScreenId) => void;
  isDark: boolean;
}

export const ZentryTutorHubScreen: React.FC<Props> = ({ onBack, onNavigate, isDark }) => {
  const modules = [
    {
      title: 'Asistente de Estudio',
      subtitle: 'Currículo MINEDU y Mapas',
      icon: BookOpen,
      screen: 'study_assistant' as ScreenId,
      color: 'from-sky-500 to-blue-600'
    },
    {
      title: 'Investigador AI',
      subtitle: 'Búsqueda Profunda y Ciencia',
      icon: Search,
      screen: 'deep_research' as ScreenId,
      color: 'from-indigo-500 to-purple-600'
    },
    {
      title: 'Redactor',
      subtitle: 'Trabajos y Ensayos Escolares',
      icon: Edit3,
      screen: 'redactor' as ScreenId,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Calendario',
      subtitle: 'Agenda y Notas Académicas',
      icon: Calendar,
      screen: 'calendar' as ScreenId,
      color: 'from-amber-500 to-orange-600'
    }
  ];

  return (
    <ZentrySubPageScaffold title="Tutor Hub" kicker="ZENTRYOS" onBack={onBack} isDark={isDark}>
      <div className="grid grid-cols-2 gap-4 h-full items-center max-w-2xl mx-auto w-full">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.title}
              onClick={() => {
                sounds.playAppOpen();
                onNavigate(m.screen);
              }}
              className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[24px] p-5 flex flex-col items-center text-center gap-2 cursor-pointer zentry-press group aspect-[0.95] justify-center'}
            >
              <div className={'w-14 h-14 rounded-[20px] bg-gradient-to-br ' + m.color + ' flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform'}>
                <Icon className="w-7 h-7" />
              </div>
              <h3 className={(isDark ? 'text-white ' : 'text-[#1E293B] ') + 'text-sm font-extrabold'}>
                {m.title}
              </h3>
              <p className={(isDark ? 'text-slate-400 ' : 'text-[#64748B] ') + 'text-[10px] leading-tight'}>
                {m.subtitle}
              </p>
            </div>
          );
        })}
      </div>
    </ZentrySubPageScaffold>
  );
};
