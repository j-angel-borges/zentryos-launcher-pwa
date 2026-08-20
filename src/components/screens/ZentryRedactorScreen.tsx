import React, { useState } from 'react';
import { Edit3, FileDown, Check } from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryRedactorScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [text, setText] = useState('');

  return (
    <ZentrySubPageScaffold title="Redactor Escolar Zentry" kicker="DOCUMENTOS & ENSAYOS" onBack={onBack} isDark={isDark}>
      <div className="max-w-2xl mx-auto w-full space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Comienza a escribir tu ensayo o tarea escolar aquí..."
          className={(isDark ? 'bg-white/10 text-white placeholder-white/40 ' : 'bg-white/80 text-[#1E293B] placeholder-slate-400 ') + 'w-full h-64 p-4 rounded-[24px] text-xs font-medium focus:outline-none shadow-inner resize-none'}
        />

        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>Palabras: {text.trim() ? text.trim().split(/\s+/).length : 0}</span>
          <button
            onClick={() => alert('Documento guardado en Archivos Escolares Zentry')}
            className="px-4 py-2 rounded-full bg-emerald-600 text-white font-bold flex items-center gap-1.5 zentry-press cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Tarea</span>
          </button>
        </div>
      </div>
    </ZentrySubPageScaffold>
  );
};
