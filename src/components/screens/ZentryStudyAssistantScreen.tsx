import React from 'react';
import { BookOpen, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryStudyAssistantScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const topics = [
    { title: 'Matemática: Fracciones Equivalentes', level: 'Primaria / Secundaria', state: 'En Progreso' },
    { title: 'Ciencia & Tecnología: Fotosíntesis y Clorofila', level: 'MINEDU Competencia 20', state: 'Listo para Repaso' },
    { title: 'Comunicación: Estructura del Ensayo Argumentativo', level: 'MINEDU Competencia 14', state: 'Completado' }
  ];

  return (
    <ZentrySubPageScaffold title="Asistente de Estudio Socrático" kicker="MINEDU PERÚ" onBack={onBack} isDark={isDark}>
      <div className="max-w-2xl mx-auto w-full space-y-3">
        <div className="p-4 rounded-[22px] bg-sky-500/15 border border-sky-500/30 flex items-center gap-3 text-xs text-sky-300">
          <BookOpen className="w-5 h-5 shrink-0" />
          <span>Currículo Nacional alineado con el método de preguntas socráticas para un aprendizaje reflexivo.</span>
        </div>

        <div className="space-y-2.5">
          {topics.map((t, idx) => (
            <div
              key={idx}
              className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[20px] p-4 flex items-center justify-between cursor-pointer zentry-press'}
            >
              <div>
                <h4 className="text-xs font-bold">{t.title}</h4>
                <div className="text-[10px] text-slate-400">{t.level}</div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                {t.state}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ZentrySubPageScaffold>
  );
};
