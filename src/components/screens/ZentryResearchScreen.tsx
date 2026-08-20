import React from 'react';
import { Search, Compass, BookMarked, Globe } from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryResearchScreen: React.FC<Props> = ({ onBack, isDark }) => {
  return (
    <ZentrySubPageScaffold title="Investigador AI & Ciencia Profunda" kicker="EXPLORACIÓN" onBack={onBack} isDark={isDark}>
      <div className="max-w-xl mx-auto w-full space-y-4 text-center">
        <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[28px] p-6 space-y-3'}>
          <Search className="w-12 h-12 text-indigo-400 mx-auto animate-pulse" />
          <h3 className="text-base font-extrabold">Búsqueda Científica Filtrada</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Explora fuentes académicas verificadas, enciclopedias y experimentos científicos interactivos sin anuncios ni distracciones.
          </p>
        </div>
      </div>
    </ZentrySubPageScaffold>
  );
};
