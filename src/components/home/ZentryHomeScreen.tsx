import React, { useState } from 'react';
import type { ScreenId, WallpaperConfig, CircadianPhase } from '../../types/zentry';
import { ZentryLiquidButton } from './ZentryLiquidButton';
import { OSSearchBar } from './OSSearchBar';
import { LiveClockWidget } from './LiveClockWidget';
import { CalendarWidget } from './CalendarWidget';
import { OSAppGrid } from './OSAppGrid';
import { OSSecondaryCards } from './OSSecondaryCards';
import { WorkspacePage } from './WorkspacePage';
import { OSDock } from './OSDock';

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

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 md:p-6 overflow-hidden z-10">
      {/* Top Main Scrollable Area */}
      <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto flex flex-col justify-between gap-4">
        {/* Landscape Grid vs Portrait Stack (CSS Pure Responsive) */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-8 w-full items-start">
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
          </div>
        </div>

        {/* Portrait Layout (Smartphone / Tablet Portrait) */}
        <div className="flex md:hidden flex-col items-center gap-4 w-full">
          {/* Pager Pages */}
          {page === 0 ? (
            <div className="w-full space-y-4 flex flex-col items-center">
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
          ) : (
            <div className="w-full">
              <WorkspacePage isDark={wallpaper.isDark} />
            </div>
          )}

          {/* Pager Dots */}
          <div className="flex items-center gap-2 py-1">
            <button
              onClick={() => setPage(0)}
              className={(page === 0 ? 'w-2.5 h-2.5 bg-white/90 ' : 'w-1.5 h-1.5 bg-white/30 ') + 'rounded-full transition-all cursor-pointer'}
            />
            <button
              onClick={() => setPage(1)}
              className={(page === 1 ? 'w-2.5 h-2.5 bg-white/90 ' : 'w-1.5 h-1.5 bg-white/30 ') + 'rounded-full transition-all cursor-pointer'}
            />
          </div>

          {/* Bottom Dock */}
          <div className="w-full flex justify-center pb-2">
            <OSDock isDark={wallpaper.isDark} onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    </div>
  );
};
