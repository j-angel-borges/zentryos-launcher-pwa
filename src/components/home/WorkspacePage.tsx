import React from 'react';
import { 
  FolderLock, 
  FileText, 
  Table, 
  Presentation, 
  Sparkles, 
  BookOpen, 
  Mail, 
  Calendar,
  Video,
  GraduationCap,
  MapPin,
  Play
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import type { ScreenId } from '../../types/zentry';

interface Props {
  isDark: boolean;
  onNavigate?: (screen: ScreenId) => void;
}

export const WorkspacePage: React.FC<Props> = ({ isDark, onNavigate }) => {
  const workspaceApps = [
    { 
      name: 'Gmail', 
      icon: Mail, 
      color: 'text-rose-400', 
      url: 'https://mail.google.com',
      action: () => window.open('https://mail.google.com', '_blank')
    },
    { 
      name: 'Docs', 
      icon: FileText, 
      color: 'text-blue-400', 
      url: 'https://docs.google.com/document/create',
      action: () => {
        if (onNavigate) {
          onNavigate('redactor');
        } else {
          window.open('https://docs.google.com/document/create', '_blank');
        }
      }
    },
    { 
      name: 'Sheets', 
      icon: Table, 
      color: 'text-emerald-400', 
      url: 'https://sheets.google.com/create',
      action: () => window.open('https://sheets.google.com/create', '_blank')
    },
    { 
      name: 'Slides', 
      icon: Presentation, 
      color: 'text-yellow-400', 
      url: 'https://slides.google.com/create',
      action: () => window.open('https://slides.google.com/create', '_blank')
    },
    { 
      name: 'Drive', 
      icon: FolderLock, 
      color: 'text-amber-400', 
      url: 'https://drive.google.com',
      action: () => window.open('https://drive.google.com', '_blank')
    },
    { 
      name: 'Meet', 
      icon: Video, 
      color: 'text-teal-400', 
      url: 'https://meet.google.com/new',
      action: () => window.open('https://meet.google.com/new', '_blank')
    },
    { 
      name: 'Classroom', 
      icon: GraduationCap, 
      color: 'text-emerald-500', 
      url: 'https://classroom.google.com',
      action: () => window.open('https://classroom.google.com', '_blank')
    },
    { 
      name: 'NotebookLM', 
      icon: BookOpen, 
      color: 'text-sky-400', 
      url: 'https://notebooklm.google.com',
      action: () => window.open('https://notebooklm.google.com', '_blank')
    },
    { 
      name: 'Calendar', 
      icon: Calendar, 
      color: 'text-indigo-400', 
      url: 'https://calendar.google.com',
      action: () => window.open('https://calendar.google.com', '_blank')
    },
    { 
      name: 'Maps', 
      icon: MapPin, 
      color: 'text-red-400', 
      url: 'https://maps.google.com',
      action: () => window.open('https://maps.google.com', '_blank')
    },
    { 
      name: 'YouTube', 
      icon: Play, 
      color: 'text-red-500', 
      url: 'https://www.youtube.com',
      action: () => {
        if (onNavigate) {
          onNavigate('safe_search');
        } else {
          window.open('https://www.youtube.com', '_blank');
        }
      }
    },
    { 
      name: 'Zentry AI', 
      icon: Sparkles, 
      color: 'text-purple-400', 
      url: '',
      action: () => onNavigate?.('ai')
    }
  ];

  return (
    <div className="w-full space-y-4 pt-2">
      <div className="flex items-center justify-between px-1">
        <span className={(isDark ? 'text-white ' : 'text-[#1E293B] ') + 'text-lg font-black tracking-tight'}>
          Google Workspace
        </span>
        <span className="text-[11px] font-semibold text-slate-400">Herramientas Conectadas</span>
      </div>

      <div className="grid grid-cols-4 gap-y-4 gap-x-2 w-full justify-items-center">
        {workspaceApps.map((app) => {
          const Icon = app.icon;
          return (
            <div
              key={app.name}
              onClick={() => {
                sounds.playTap();
                app.action();
              }}
              className="flex flex-col items-center gap-1.5 cursor-pointer zentry-press group"
            >
              <div
                className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'w-14 h-14 rounded-[18px] flex items-center justify-center transition-all group-hover:scale-105 shadow-sm border border-white/20'}
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
