import React, { useState, useRef } from 'react';
import type { ScreenId, WallpaperConfig, CircadianPhase, WorkspaceAppInfo } from '../../types/zentry';
import { ZentryLiquidButton } from './ZentryLiquidButton';
import { OSSearchBar } from './OSSearchBar';
import { LiveClockWidget } from './LiveClockWidget';
import { CalendarWidget } from './CalendarWidget';
import { OSAppGrid } from './OSAppGrid';
import { OSSecondaryCards } from './OSSecondaryCards';
import { WorkspacePage } from './WorkspacePage';
import { OSDock } from './OSDock';
import { sounds } from '../../services/soundEffects';

interface Props {
  wallpaper: WallpaperConfig;
  phase: CircadianPhase;
  focusActive: boolean;
  showClock: boolean;
  showCalendar: boolean;
  onNavigate: (screen: ScreenId) => void;
  onOpenWorkspaceApp?: (app: WorkspaceAppInfo) => void;
  onSearch: (query: string) => void;
  onOpenCommandSheet: () => void;
}

export const ZentryHomeScreen: React.FC<Props> = ({
  wallpaper,
  phase,
  focusActive,
  showClock,
  showCalendar,
  onNavigate,
  onOpenWorkspaceApp,
  onSearch,
  onOpenCommandSheet
}) => {
  const [page, setPage] = useState<0 | 1>(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Handle continuous horizontal scroll / swipe
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
    <div className="w-full h-full flex flex-col justify-between p-3 md:p-6 overflow-hidden z-10 select-none">
      {/* Top Main Viewport */}
      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col justify-between gap-3 overflow-hidden">
        {/* Landscape Grid (Split View for Tablets / Desktop) */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-8 w-full items-start overflow-y-auto pr-1">
          {/* Left Column (Landscape) */}
          <div className="space-y-4 flex flex-col items-center">
            <ZentryLiquidButton
              onTap={() => onNavigate('ai')}
              onDoubleTap={onOpenCommandSheet}
              isDark={wallpaper.isDark}
            />
            <OSSearchBar onSearch={onSearch} isDark={wallpaper.isDark} />
            <div className="w-full pt-4 flex justify-center">
              <OSDock isDark={wallpaper.isDark} onNavigate={onNavigate} />
            </div>
          </div>

          {/* Right Column (Landscape) */}
          <div className="space-y-4">
            {showClock && <LiveClockWidget isDark={wallpaper.isDark} onClick={() => onNavigate('reloj')} />}
            {showCalendar && <CalendarWidget isDark={wallpaper.isDark} onClick={() => onNavigate('calendar')} />}
            <OSAppGrid isDark={wallpaper.isDark} onNavigate={onNavigate} />
            <OSSecondaryCards isDark={wallpaper.isDark} onNavigate={onNavigate} />
            <WorkspacePage isDark={wallpaper.isDark} onNavigate={onNavigate} onOpenWorkspaceApp={onOpenWorkspaceApp} />
          </div>
        </div>

        {/* Portrait Layout with Native 120Hz Hardware Scroll Snap Pager */}
        <div className="flex md:hidden flex-col items-center justify-between h-full w-full overflow-hidden">
          {/* Snap Pager Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 w-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth no-scrollbar touch-pan-x"
          >
            {/* Page 0: Main Launcher & Widgets */}
            <div className="w-full shrink-0 h-full snap-center overflow-y-auto px-1 flex flex-col items-center gap-3">
              <ZentryLiquidButton
                onTap={() => onNavigate('ai')}
                onDoubleTap={onOpenCommandSheet}
                isDark={wallpaper.isDark}
              />
              {showClock && <LiveClockWidget isDark={wallpaper.isDark} onClick={() => onNavigate('reloj')} />}
              {showCalendar && <CalendarWidget isDark={wallpaper.isDark} onClick={() => onNavigate('calendar')} />}
              <OSSearchBar onSearch={onSearch} isDark={wallpaper.isDark} />
              <OSAppGrid isDark={wallpaper.isDark} onNavigate={onNavigate} />
              <OSSecondaryCards isDark={wallpaper.isDark} onNavigate={onNavigate} />
            </div>

            {/* Page 1: Google Workspace Apps */}
            <div className="w-full shrink-0 h-full snap-center overflow-y-auto px-1 flex flex-col items-center">
              <WorkspacePage isDark={wallpaper.isDark} onNavigate={onNavigate} onOpenWorkspaceApp={onOpenWorkspaceApp} />
            </div>
          </div>

          {/* Pager Indicator Dots */}
          <div className="flex items-center gap-2 py-1.5 z-20">
            <button
              onClick={() => scrollToPage(0)}
              className={(page === 0 ? 'w-5 h-2 bg-white/90 shadow-md ' : 'w-2 h-2 bg-white/30 ') + 'rounded-full transition-all cursor-pointer'}
            />
            <button
              onClick={() => scrollToPage(1)}
              className={(page === 1 ? 'w-5 h-2 bg-white/90 shadow-md ' : 'w-2 h-2 bg-white/30 ') + 'rounded-full transition-all cursor-pointer'}
            />
          </div>

          {/* Bottom Dock */}
          <div className="w-full flex justify-center pb-2 z-20">
            <OSDock isDark={wallpaper.isDark} onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    </div>
  );
};
