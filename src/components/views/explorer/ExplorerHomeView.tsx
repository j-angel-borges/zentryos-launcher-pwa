import React, { useState, useRef } from 'react';
import { Palette, Play } from 'lucide-react';
import type { ScreenId, WorkspaceAppInfo } from '../../../types/zentry';
import { OSSearchBar } from '../../home/OSSearchBar';
import { OSAppGrid } from '../../home/OSAppGrid';
import { WorkspacePage } from '../../home/WorkspacePage';
import { sounds } from '../../../services/soundEffects';

interface Props {
  isDark: boolean;
  onNavigate: (screen: ScreenId) => void;
  onOpenWorkspaceApp?: (app: WorkspaceAppInfo) => void;
  onSearch: (query: string) => void;
}

export const ExplorerHomeView: React.FC<Props> = ({
  isDark,
  onNavigate,
  onOpenWorkspaceApp,
  onSearch
}) => {
  const [page, setPage] = useState<0 | 1>(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth } = scrollContainerRef.current;
    const currentPage = Math.round(scrollLeft / clientWidth) as 0 | 1;
    if (currentPage !== page && (currentPage === 0 || currentPage === 1)) {
      setPage(currentPage);
    }
  };

  const scrollToPage = (targetPage: 0 | 1) => {
    sounds.playTap();
    setPage(targetPage);
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: targetPage * width,
        behavior: 'smooth'
      });
    }
  };

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
    <div className="w-full h-full flex flex-col justify-between py-1.5 px-3 max-w-md mx-auto overflow-hidden select-none">
      {/* Pager Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 w-full flex overflow-x-auto overflow-y-hidden no-scrollbar snap-x snap-mandatory scroll-smooth touch-pan-x"
      >
        {/* Page 0: Search, Bento Drawers (Crear & Divertirse) and Core Explorer Apps */}
        <div className="w-full shrink-0 h-full snap-center flex flex-col justify-between items-center px-2 py-1 space-y-2.5">
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
          <div className="grid grid-cols-2 gap-3 w-full">
            {/* Drawer 1: CREAR */}
            <div
              onClick={handleOpenCrear}
              className="h-24 rounded-[24px] p-3 flex items-center gap-3 cursor-pointer backdrop-blur-2xl bg-[#120E24]/85 hover:bg-[#120E24]/95 border border-purple-400/50 shadow-xl transition-all duration-300 zentry-spring-press group"
            >
              <div className="w-12 h-12 rounded-[18px] bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg group-hover:scale-108 transition-transform shrink-0">
                <Palette className="w-6 h-6" />
              </div>
              <span className="text-sm font-black tracking-tight text-white drop-shadow-md">
                Crear
              </span>
            </div>

            {/* Drawer 2: DIVERTIRSE */}
            <div
              onClick={handleOpenDivertirse}
              className="h-24 rounded-[24px] p-3 flex items-center gap-3 cursor-pointer backdrop-blur-2xl bg-[#1E0E1C]/85 hover:bg-[#1E0E1C]/95 border border-pink-400/50 shadow-xl transition-all duration-300 zentry-spring-press group"
            >
              <div className="w-12 h-12 rounded-[18px] bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg relative group-hover:scale-108 transition-transform shrink-0">
                <Play className="w-6 h-6 fill-white" />
                <span className="w-2 h-2 rounded-full bg-amber-300 absolute -top-0.5 -right-0.5 animate-ping" />
              </div>
              <span className="text-sm font-black tracking-tight text-white drop-shadow-md">
                Divertirse
              </span>
            </div>
          </div>

          {/* Bottom Grid of Core Explorer Apps */}
          <div className="w-full py-1 flex items-center justify-center flex-1">
            <OSAppGrid isDark={isDark} ageTier="explorer" onNavigate={onNavigate} />
          </div>
        </div>

        {/* Page 1: Google Workspace Apps */}
        <div className="w-full shrink-0 h-full snap-center overflow-y-auto px-2 flex flex-col items-center justify-between py-2">
          <WorkspacePage isDark={isDark} onNavigate={onNavigate} onOpenWorkspaceApp={onOpenWorkspaceApp} />
        </div>
      </div>

      {/* Pager Indicator Dots */}
      <div className="flex items-center justify-center gap-2 py-1 z-20">
        <button
          onClick={() => scrollToPage(0)}
          className={(page === 0 ? 'w-5 h-1.5 bg-white/90 shadow-md ' : 'w-1.5 h-1.5 bg-white/30 ') + 'rounded-full transition-all cursor-pointer'}
        />
        <button
          onClick={() => scrollToPage(1)}
          className={(page === 1 ? 'w-5 h-1.5 bg-white/90 shadow-md ' : 'w-1.5 h-1.5 bg-white/30 ') + 'rounded-full transition-all cursor-pointer'}
        />
      </div>
    </div>
  );
};
