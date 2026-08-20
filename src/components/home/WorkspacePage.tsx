import React from 'react';
import { 
  FolderLock, 
  FileText, 
  Table, 
  Presentation, 
  Sparkles, 
  BookOpen, 
  Mail, 
  Calendar 
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface Props {
  isDark: boolean;
}

export const WorkspacePage: React.FC<Props> = ({ isDark }) => {
  const workspaceApps = [
    { name: 'Drive', icon: FolderLock, color: 'text-amber-400' },
    { name: 'Docs', icon: FileText, color: 'text-blue-400' },
    { name: 'Sheets', icon: Table, color: 'text-emerald-400' },
    { name: 'Slides', icon: Presentation, color: 'text-yellow-400' },
    { name: 'Gemini', icon: Sparkles, color: 'text-purple-400' },
    { name: 'NotebookLM', icon: BookOpen, color: 'text-sky-400' },
    { name: 'Gmail', icon: Mail, color: 'text-rose-400' },
    { name: 'Calendar', icon: Calendar, color: 'text-indigo-400' }
  ];

  return (
    <div className="w-full space-y-4 pt-2">
      <div className="flex items-center gap-2 px-1">
        <span className={(isDark ? 'text-white ' : 'text-[#1E293B] ') + 'text-lg font-black tracking-tight'}>
          Google Workspace
        </span>
      </div>

      <div className="grid grid-cols-4 gap-y-4 gap-x-2 w-full justify-items-center">
        {workspaceApps.map((app) => {
          const Icon = app.icon;
          return (
            <div
              key={app.name}
              onClick={() => {
                sounds.playTap();
                alert(`Abriendo ${app.name} en entorno protegido Zentry`);
              }}
              className="flex flex-col items-center gap-1.5 cursor-pointer zentry-press group"
            >
              <div
                className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'w-14 h-14 rounded-[18px] flex items-center justify-center transition-all group-hover:scale-105'}
              >
                <Icon className={'w-7 h-7 ' + app.color} />
              </div>
              <span
                className={(isDark ? 'text-white ' : 'text-[#3B3B58] ') + 'text-[11px] font-bold tracking-tight text-center truncate max-w-[64px]'}
              >
                {app.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
