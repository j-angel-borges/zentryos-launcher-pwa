import React from 'react';
import type { ScreenId, WallpaperConfig, CircadianPhase, WorkspaceAppInfo, AgeTier } from '../../types/zentry';
import { ToddlerHomeView } from '../views/toddler/ToddlerHomeView';
import { ExplorerHomeView } from '../views/explorer/ExplorerHomeView';

interface Props {
  wallpaper: WallpaperConfig;
  phase: CircadianPhase;
  focusActive: boolean;
  showClock: boolean;
  showCalendar: boolean;
  ageTier?: AgeTier;
  onNavigate: (screen: ScreenId) => void;
  onOpenWorkspaceApp?: (app: WorkspaceAppInfo) => void;
  onSearch: (query: string) => void;
  onOpenCommandSheet: () => void;
}

export const ZentryHomeScreen: React.FC<Props> = ({
  wallpaper,
  ageTier = 'toddler',
  onNavigate,
  onOpenWorkspaceApp,
  onSearch
}) => {
  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden z-10 select-none">
      {/* Dynamic View by Age Tier */}
      {ageTier === 'toddler' ? (
        <ToddlerHomeView
          isDark={wallpaper.isDark}
          onNavigate={onNavigate}
        />
      ) : (
        <ExplorerHomeView
          isDark={wallpaper.isDark}
          onNavigate={onNavigate}
          onOpenWorkspaceApp={onOpenWorkspaceApp}
          onSearch={onSearch}
        />
      )}
    </div>
  );
};
