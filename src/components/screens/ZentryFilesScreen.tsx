import React from 'react';
import { Folder, Image as ImageIcon, FileText, Download } from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryFilesScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const folders = [
    { name: 'Tareas MINEDU', count: '12 archivos', icon: FileText, color: 'text-blue-400' },
    { name: 'Obras de NeuroArt', count: '8 imágenes', icon: ImageIcon, color: 'text-pink-400' },
    { name: 'Descargas Seguras', count: '5 archivos', icon: Download, color: 'text-emerald-400' }
  ];

  return (
    <ZentrySubPageScaffold title="Archivos & Galería" kicker="ALMACENAMIENTO" onBack={onBack} isDark={isDark}>
      <div className="max-w-lg mx-auto w-full space-y-3">
        {folders.map((f, idx) => {
          const Icon = f.icon;
          return (
            <div
              key={idx}
              className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[20px] p-4 flex items-center justify-between cursor-pointer zentry-press'}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/10">
                  <Icon className={'w-5 h-5 ' + f.color} />
                </div>
                <div>
                  <div className="text-xs font-bold">{f.name}</div>
                  <div className="text-[10px] text-slate-400">{f.count}</div>
                </div>
              </div>
              <Folder className="w-4 h-4 text-slate-400" />
            </div>
          );
        })}
      </div>
    </ZentrySubPageScaffold>
  );
};
