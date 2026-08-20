import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import type { ScreenId, WallpaperConfig, CircadianPhase } from '../../types/zentry';
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
  onSearch,
  onOpenCommandSheet
}) => {
  const [page, setPage] = useState<0 | 1>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Swipe gesture handler
  const handleDragEnd = (_e: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const swipeThreshold = 50;
    const swipeVelocity = 0.2;

    if (info.offset.x < -swipeThreshold || info.velocity.x < -swipeVelocity) {
      if (page === 0) {
        sounds.playTap();
        setPage(1);
      }
    } else if (info.offset.x > swipeThreshold || info.velocity.x > swipeVelocity) {
      if (page === 1) {
        sounds.playTap();
        setPage(0);
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 md:p-6 overflow-hidden z-10 select-none">
      {/* Top Main Area */}
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
            <WorkspacePage isDark={wallpaper.isDark} onNavigate={onNavigate} />
          </div>
        </div>

        {/* Portrait Layout with Full Native Touch Swipe Pager */}
        <div className="flex md:hidden flex-col items-center justify-between h-full w-full overflow-hidden">
          {/* Draggable Pager Container */}
          <div
            ref={containerRef}
            className="flex-1 w-full overflow-y-auto overflow-x-hidden touch-pan-y relative"
          >
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              animate={{ x: page === 0 ? '0%' : '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex w-[200%] h-full"
            >
              {/* Page 0: Main Launcher & Widgets */}
              <div className="w-1/2 h-full flex flex-col items-center gap-3 px-1">
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
              <div className="w-1/2 h-full flex flex-col items-center px-1">
                <WorkspacePage isDark={wallpaper.isDark} onNavigate={onNavigate} />
              </div>
            </motion.div>
          </div>

          {/* Swipe Indicator Dots */}
          <div className="flex items-center gap-2 py-1.5 z-20">
            <button
              onClick={() => {
                sounds.playTap();
                setPage(0);
              }}
              className={(page === 0 ? 'w-5 h-2 bg-white/90 shadow-md ' : 'w-2 h-2 bg-white/30 ') + 'rounded-full transition-all cursor-pointer'}
            />
            <button
              onClick={() => {
                sounds.playTap();
                setPage(1);
              }}
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
