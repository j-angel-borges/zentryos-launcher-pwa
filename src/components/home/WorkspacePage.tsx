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
import type { ScreenId, WorkspaceAppInfo } from '../../types/zentry';

interface Props {
  isDark: boolean;
  onNavigate?: (screen: ScreenId) => void;
  onOpenWorkspaceApp?: (app: WorkspaceAppInfo) => void;
}

export const WorkspacePage: React.FC<Props> = ({ isDark, onNavigate, onOpenWorkspaceApp }) => {
  const workspaceApps: WorkspaceAppInfo[] = [
    { 
      name: 'Docs', 
      iconName: 'docs', 
      type: 'docs',
      url: 'https://docs.google.com'
    },
    { 
      name: 'Sheets', 
      iconName: 'sheets', 
      type: 'sheets',
      url: 'https://sheets.google.com'
    },
    { 
      name: 'Drive', 
      iconName: 'drive', 
      type: 'drive',
      url: 'https://drive.google.com'
    },
    { 
      name: 'Gmail', 
      iconName: 'gmail', 
      type: 'gmail',
      url: 'https://mail.google.com'
    },
    { 
      name: 'Classroom', 
      iconName: 'classroom', 
      type: 'classroom',
      url: 'https://classroom.google.com'
    },
    { 
      name: 'Slides', 
      iconName: 'slides', 
      type: 'slides',
      url: 'https://slides.google.com'
    },
    { 
      name: 'Meet', 
      iconName: 'meet', 
      type: 'meet',
      url: 'https://meet.google.com'
    },
    { 
      name: 'NotebookLM', 
      iconName: 'notebooklm', 
      type: 'notebooklm',
      url: 'https://notebooklm.google.com'
    },
    { 
      name: 'Calendar', 
      iconName: 'calendar', 
      type: 'calendar',
      url: 'https://calendar.google.com'
    },
    { 
      name: 'Maps', 
      iconName: 'maps', 
      type: 'maps',
      url: 'https://maps.google.com'
    },
    { 
      name: 'YouTube', 
      iconName: 'youtube', 
      type: 'youtube',
      url: 'https://www.youtube.com'
    },
    { 
      name: 'Zentry AI', 
      iconName: 'ai', 
      type: 'docs',
      url: ''
    }
  ];

  const getIcon = (type: string, name: string) => {
    if (name === 'Zentry AI') return { Icon: Sparkles, color: 'text-purple-400' };
    switch (type) {
      case 'docs': return { Icon: FileText, color: 'text-blue-400' };
      case 'sheets': return { Icon: Table, color: 'text-emerald-400' };
      case 'slides': return { Icon: Presentation, color: 'text-yellow-400' };
      case 'drive': return { Icon: FolderLock, color: 'text-amber-400' };
      case 'gmail': return { Icon: Mail, color: 'text-rose-400' };
      case 'classroom': return { Icon: GraduationCap, color: 'text-emerald-500' };
      case 'meet': return { Icon: Video, color: 'text-teal-400' };
      case 'notebooklm': return { Icon: BookOpen, color: 'text-sky-400' };
      case 'calendar': return { Icon: Calendar, color: 'text-indigo-400' };
      case 'maps': return { Icon: MapPin, color: 'text-red-400' };
      case 'youtube': return { Icon: Play, color: 'text-red-500' };
      default: return { Icon: Sparkles, color: 'text-indigo-400' };
    }
  };

  const handleClick = (app: WorkspaceAppInfo) => {
    sounds.playTap();
    if (app.name === 'Zentry AI') {
      onNavigate?.('ai');
    } else if (onOpenWorkspaceApp) {
      onOpenWorkspaceApp(app);
    } else {
      onNavigate?.('workspace_app');
    }
  };

  return (
    <div className="w-full space-y-4 pt-2">
      <div className="flex items-center justify-between px-1">
        <span className={(isDark ? 'text-white ' : 'text-[#1E293B] ') + 'text-lg font-black tracking-tight'}>
          Google Workspace
        </span>
        <span className="text-[11px] font-semibold text-slate-400">Entorno Zentry</span>
      </div>

      <div className="grid grid-cols-4 gap-y-4 gap-x-2 w-full justify-items-center">
        {workspaceApps.map((app) => {
          const { Icon, color } = getIcon(app.type, app.name);
          return (
            <div
              key={app.name}
              onClick={() => handleClick(app)}
              className="flex flex-col items-center gap-1.5 cursor-pointer zentry-press group"
            >
              <div
                className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'w-14 h-14 rounded-[18px] flex items-center justify-center transition-all group-hover:scale-105 shadow-sm border border-white/20'}
              >
                <Icon className={'w-7 h-7 ' + color} />
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
