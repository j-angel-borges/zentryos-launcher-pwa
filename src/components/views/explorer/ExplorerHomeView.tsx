import React from 'react';
import { Palette, Play, Zap } from 'lucide-react';
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
        {/* Drawer 1: CREAR (Imagine AI, Zentry Build, Simulador, Redactor) */}
        <div
          onClick={handleOpenCrear}
          className="h-24 rounded-[26px] p-3 flex items-center gap-3 cursor-pointer backdrop-blur-2xl bg-[#120E24]/90 hover:bg-[#120E24]/98 border border-purple-400/50 shadow-xl transition-all duration-300 zentry-spring-press group"
        >
          <div className="w-12 h-12 rounded-[18px] bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-lg group-hover:scale-108 transition-transform shrink-0">
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
          className="h-24 rounded-[26px] p-3 flex items-center gap-3 cursor-pointer backdrop-blur-2xl bg-[#1E0E1C]/90 hover:bg-[#1E0E1C]/98 border border-pink-400/50 shadow-xl transition-all duration-300 zentry-spring-press group"
        >
          <div className="w-12 h-12 rounded-[18px] bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg relative group-hover:scale-108 transition-transform shrink-0">
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

      {/* Featured AI App Builder Direct Card */}
      <div
        onClick={() => {
          sounds.playAppOpen();
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(15);
          }
          onNavigate('app_builder');
        }}
        className="w-full rounded-[22px] p-2.5 px-3 flex items-center justify-between cursor-pointer backdrop-blur-2xl bg-gradient-to-r from-indigo-950/80 via-purple-950/80 to-slate-950/80 border border-purple-400/40 shadow-xl hover:border-purple-400 transition-all zentry-spring-press group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-[15px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg group-hover:scale-108 transition-transform shrink-0">
            <Zap className="w-5 h-5 text-amber-300" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white">Zentry Build</span>
              <span className="px-1.5 py-0.2 bg-purple-500/30 text-purple-300 rounded-full text-[9px] font-bold border border-purple-400/40">AI STUDIO</span>
            </div>
            <p className="text-[10px] text-slate-300 font-bold">Crea mini apps interactivas en vivo con IA</p>
          </div>
        </div>
        <span className="text-amber-300 text-sm font-black group-hover:translate-x-1 transition-transform">⚡ ➔</span>
      </div>

      {/* Grid of Core Explorer Apps */}
      <div className="w-full py-1 flex items-center justify-center flex-1">
        <OSAppGrid isDark={isDark} ageTier="explorer" onNavigate={onNavigate} />
      </div>
    </div>
  );
};
