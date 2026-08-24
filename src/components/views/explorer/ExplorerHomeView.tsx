import React, { useState, useRef } from 'react';
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

  return (
    <div className="w-full h-full flex flex-col justify-between py-2 px-3 max-w-md mx-auto overflow-hidden select-none">
      {/* Pager Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 w-full flex overflow-x-auto overflow-y-hidden no-scrollbar snap-x snap-mandatory scroll-smooth touch-pan-x"
      >
        {/* Page 0: Core Education Apps */}
        <div className="w-full shrink-0 h-full snap-center flex flex-col justify-around items-center px-2 py-3">
          <div className="w-full pt-1">
            <OSSearchBar 
              onSearch={onSearch} 
              onVoiceTrigger={() => onNavigate('ai')}
              isDark={isDark} 
              ageTier="explorer" 
            />
          </div>

          <div className="w-full py-4 flex items-center justify-center flex-1">
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
