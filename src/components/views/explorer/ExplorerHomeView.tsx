import React from 'react';
import { Palette, Play } from 'lucide-react';
import type { ScreenId } from '../../../types/zentry';
import { OSSearchBar } from '../../home/OSSearchBar';
import { OSAppGrid } from '../../home/OSAppGrid';
import { sounds } from '../../../services/soundEffects';

interface Props {
  isDark: boolean;
  onNavigate: (screen: ScreenId) => void;
  onOpenWorkspaceApp?: (app: any) => void;
  onSearch: (query: string) => void;
}

export const ExplorerHomeView: React.FC<Props> = ({
  isDark,
  onNavigate,
  onSearch
}) => {
  const handleOpenCrear = () => {
    sounds.playAppOpen();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
    onNavigate('creation');
  };

  const handleOpenDivertirse = () => {
    sounds.playAppOpen();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
    onNavigate('entertainment_hub');
  };

  return (
    <div className="w-full h-full flex flex-col justify-between py-2 px-3.5 max-w-md mx-auto select-none space-y-3">
      {/* Top Search Bar */}
      <div className="w-full pt-0.5">
        <OSSearchBar 
          onSearch={onSearch} 
          onVoiceTrigger={() => onNavigate('ai')}
          isDark={isDark} 
          ageTier="explorer" 
        />
      </div>

      {/* Bento Drawers: CREAR & DIVERTIRSE */}
      <div className="grid grid-cols-2 gap-3.5 w-full">
        {/* Drawer 1: CREAR (Imagine AI, Zentry Build, Mundos) */}
        <div
          onClick={handleOpenCrear}
          className="h-26 rounded-[26px] p-3.5 flex items-center gap-3 cursor-pointer backdrop-blur-2xl bg-[#120E24]/90 hover:bg-[#120E24]/98 border border-purple-400/50 shadow-xl transition-all duration-300 zentry-spring-press group"
        >
          <div className="w-13 h-13 rounded-[20px] bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-lg group-hover:scale-108 transition-transform shrink-0">
            <Palette className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-base font-black tracking-tight text-white drop-shadow-md block">
              Crear
            </span>
          </div>
        </div>

        {/* Drawer 2: DIVERTIRSE (Videos & Medios) */}
        <div
          onClick={handleOpenDivertirse}
          className="h-26 rounded-[26px] p-3.5 flex items-center gap-3 cursor-pointer backdrop-blur-2xl bg-[#1E0E1C]/90 hover:bg-[#1E0E1C]/98 border border-pink-400/50 shadow-xl transition-all duration-300 zentry-spring-press group"
        >
          <div className="w-13 h-13 rounded-[20px] bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg relative group-hover:scale-108 transition-transform shrink-0">
            <Play className="w-6 h-6 fill-white" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 absolute -top-0.5 -right-0.5 animate-ping" />
          </div>
          <div className="min-w-0">
            <span className="text-base font-black tracking-tight text-white drop-shadow-md block">
              Divertirse
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Core Explorer Apps (Calculadora, Cámara, Reloj, Calendario, Archivos, Tutor) */}
      <div className="w-full py-1 flex items-center justify-center flex-1">
        <OSAppGrid isDark={isDark} ageTier="explorer" onNavigate={onNavigate} />
      </div>
    </div>
  );
};
