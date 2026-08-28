import React, { useState, useEffect } from 'react';
import type { 
  ScreenId, 
  WallpaperId, 
  WallpaperConfig, 
  CircadianPhase, 
  DeviceFirestoreState,
  WorkspaceAppInfo,
  AgeTier
} from './types/zentry';
import { ZentryWallpaper } from './components/wallpaper/ZentryWallpaper';
import { ZentryStatusBar } from './components/shell/ZentryStatusBar';
import { ZentryNavBar } from './components/shell/ZentryNavBar';
import { ZentryTopPanels } from './components/shell/ZentryTopPanels';
import { ZentryCommandSheet } from './components/shell/ZentryCommandSheet';
import { ZentryLockModal } from './components/shell/ZentryLockModal';
import { ZentryHomeScreen } from './components/home/ZentryHomeScreen';
import { CustomizationPanel } from './components/home/CustomizationPanel';

// Screen Imports
import { ZentryAiScreen } from './components/screens/ZentryAiScreen';
import { ZentryCreationScreen } from './components/screens/ZentryCreationScreen';
import { ZentryEntertainmentHubScreen } from './components/screens/ZentryEntertainmentHubScreen';
import { ZentryTubeScreen } from './components/screens/ZentryTubeScreen';
import { ZentryTokScreen } from './components/screens/ZentryTokScreen';
import { ZentryGramScreen } from './components/screens/ZentryGramScreen';
import { ZentryStreamScreen } from './components/screens/ZentryStreamScreen';
import { ZentryTutorHubScreen } from './components/screens/ZentryTutorHubScreen';
import { ZentrySafeBrowserScreen } from './components/screens/ZentrySafeBrowserScreen';
import { ZentryCalculatorScreen } from './components/screens/ZentryCalculatorScreen';
import { ZentryCameraScreen } from './components/screens/ZentryCameraScreen';
import { ZentryClockScreen } from './components/screens/ZentryClockScreen';
import { ZentryCalendarScreen } from './components/screens/ZentryCalendarScreen';
import { ZentryFilesScreen } from './components/screens/ZentryFilesScreen';
import { ZentryPhoneScreen } from './components/screens/ZentryPhoneScreen';
import { ZentrySettingsScreen } from './components/screens/ZentrySettingsScreen';
import { ZentryNeuroArtScreen } from './components/screens/ZentryNeuroArtScreen';
import { ZentryWorldGeneratorScreen } from './components/screens/ZentryWorldGeneratorScreen';
import { ZentryCharacterScreen } from './components/screens/ZentryCharacterScreen';
import { ZentryFreeCanvasScreen } from './components/screens/ZentryFreeCanvasScreen';
import { ZentryRealMissionsScreen } from './components/screens/ZentryRealMissionsScreen';
import { ZentryMonsterScreen } from './components/screens/ZentryMonsterScreen';
import { ZentryStudyAssistantScreen } from './components/screens/ZentryStudyAssistantScreen';
import { ZentryResearchScreen } from './components/screens/ZentryResearchScreen';
import { ZentryRedactorScreen } from './components/screens/ZentryRedactorScreen';
import { ZentryImagineScreen } from './components/screens/ZentryImagineScreen';
import { ZentryBuildScreen } from './components/screens/ZentryBuildScreen';
import { ZentryEmbeddedAppScreen } from './components/screens/ZentryEmbeddedAppScreen';

import { subscribeToDeviceState, simulateDeviceState } from './services/firebase';
import { sounds } from './services/soundEffects';

const WALLPAPERS: Record<WallpaperId, WallpaperConfig> = {
  Glacial: {
    id: 'Glacial',
    name: 'Glacial',
    hex: '#F1F5F9',
    base: '#F1F5F9',
    orbs: ['#D4E8FF', '#C2F4E7', '#E0C3FC'],
    isDark: false
  },
  Lila: {
    id: 'Lila',
    name: 'Lila',
    hex: '#E9E3FF',
    base: '#E9E3FF',
    orbs: ['#C8B6FF', '#E0C3FC', '#FFD6EC'],
    isDark: false
  },
  Aura: {
    id: 'Aura',
    name: 'Aura',
    hex: '#FFE8E8',
    base: '#FFE8E8',
    orbs: ['#FFC2D1', '#FFDFC2', '#E0C3FC'],
    isDark: false
  },
  Brisa: {
    id: 'Brisa',
    name: 'Brisa',
    hex: '#E3F2FD',
    base: '#E3F2FD',
    orbs: ['#B3E5FC', '#C2F4E7', '#D6C8FA'],
    isDark: false
  },
  Espacio: {
    id: 'Espacio',
    name: 'Espacio',
    hex: '#26262B',
    base: '#1E1E28',
    orbs: ['#4A306D', '#2E4057', '#533B87'],
    isDark: true
  }
};

export const App: React.FC = () => {
  // Navigation & History State
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('launcher');
  const [history, setHistory] = useState<ScreenId[]>([]);
  const [selectedWorkspaceApp, setSelectedWorkspaceApp] = useState<WorkspaceAppInfo | null>(null);

  // Wallpaper & Preferences
  const [wallpaperId, setWallpaperId] = useState<WallpaperId>(() => {
    return (localStorage.getItem('zentry_wallpaper') as WallpaperId) || 'Glacial';
  });
  const [showClock, setShowClock] = useState<boolean>(() => {
    return localStorage.getItem('zentry_show_clock') !== 'false';
  });
  const [showCalendar, setShowCalendar] = useState<boolean>(() => {
    return localStorage.getItem('zentry_show_calendar') !== 'false';
  });
  const [ageTier, setAgeTier] = useState<AgeTier>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTier = params.get('tier') || params.get('age');
      if (urlTier === 'explorer' || urlTier === 'toddler') {
        return urlTier;
      }
    }
    return (localStorage.getItem('zentry_age_tier') as AgeTier) || 'toddler';
  });

  const [brightness, setBrightness] = useState(80);
  const [volume, setVolume] = useState(75);

  const handleSelectAgeTier = (tier: AgeTier) => {
    sounds.playTap();
    setAgeTier(tier);
    localStorage.setItem('zentry_age_tier', tier);
  };

  // Circadian Phase State
  const [circadianPhase, setCircadianPhase] = useState<CircadianPhase>(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      return {
        name: 'MORNING',
        title: 'Fase Matutina',
        description: 'Ventana de Máxima Concentración y Claridad',
        startColor: '#C2F4E7',
        endColor: '#D4E8FF',
        textColor: '#333333'
      };
    } else if (hour >= 12 && hour < 18) {
      return {
        name: 'AFTERNOON',
        title: 'Fase Vespertina',
        description: 'Ventana Creativa y Retos de Aprendizaje',
        startColor: '#FCE38A',
        endColor: '#D6C8FA',
        textColor: '#4A306D'
      };
    } else {
      return {
        name: 'NIGHT',
        title: 'Fase Nocturna',
        description: 'Filtro de Luz Azul y Preparación para el Descanso',
        startColor: '#FF9E9E',
        endColor: '#533B87',
        textColor: '#FFFFFF'
      };
    }
  });

  // Shell modals state
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [isQuickPanelOpen, setIsQuickPanelOpen] = useState(false);
  const [quickPanelTab, setQuickPanelTab] = useState<'quick' | 'notices'>('quick');
  const [isCommandSheetOpen, setIsCommandSheetOpen] = useState(false);

  // Firestore C&C State
  const [deviceState, setDeviceState] = useState<DeviceFirestoreState>(simulateDeviceState);

  useEffect(() => {
    const unsub = subscribeToDeviceState((state) => {
      setDeviceState(state);
    });
    return () => unsub();
  }, []);

  const navigateTo = (screen: ScreenId) => {
    setHistory((prev) => [...prev, currentScreen]);
    setCurrentScreen(screen);
  };

  const handleOpenWorkspaceApp = (app: WorkspaceAppInfo) => {
    setSelectedWorkspaceApp(app);
    navigateTo('workspace_app');
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((old) => old.slice(0, -1));
      setCurrentScreen(prev);
    } else {
      setCurrentScreen('launcher');
    }
  };

  const handleHome = () => {
    setHistory([]);
    setCurrentScreen('launcher');
  };

  const handleSelectWallpaper = (id: WallpaperId) => {
    setWallpaperId(id);
    localStorage.setItem('zentry_wallpaper', id);
  };

  const handleToggleClock = () => {
    setShowClock((v) => {
      const next = !v;
      localStorage.setItem('zentry_show_clock', String(next));
      return next;
    });
  };

  const handleToggleCalendar = () => {
    setShowCalendar((v) => {
      const next = !v;
      localStorage.setItem('zentry_show_calendar', String(next));
      return next;
    });
  };

  const currentWallpaper = WALLPAPERS[wallpaperId] || WALLPAPERS.Glacial;

  return (
    <main className="w-screen h-screen min-h-screen overflow-hidden select-none relative flex flex-col justify-between">
      {/* 1. Live Circadian Organic Mesh Wallpaper */}
      <ZentryWallpaper
        wallpaper={currentWallpaper}
        phase={circadianPhase}
        focusActive={false}
      />

      {/* 2. Top System Status Bar with Dynamic Island */}
      <ZentryStatusBar
        phase={circadianPhase}
        deviceState={deviceState}
        onOpenQuickPanel={(tab) => {
          setQuickPanelTab(tab || 'quick');
          setIsQuickPanelOpen(true);
        }}
        isDark={currentWallpaper.isDark}
        currentScreen={currentScreen}
        ageTier={ageTier}
        onNavigate={navigateTo}
      />

      {/* 3. Screen Viewport with Spring Zoom Transition */}
      <div key={currentScreen} className="flex-1 w-full h-full relative overflow-hidden flex flex-col items-center justify-center animate-app-open">
        {currentScreen === 'launcher' && (
          <ZentryHomeScreen
            wallpaper={currentWallpaper}
            phase={circadianPhase}
            focusActive={false}
            showClock={showClock}
            showCalendar={showCalendar}
            ageTier={ageTier}
            onNavigate={navigateTo}
            onOpenWorkspaceApp={handleOpenWorkspaceApp}
            onSearch={(query) => {
              navigateTo('safe_search');
            }}
            onOpenCommandSheet={() => setIsCommandSheetOpen(true)}
          />
        )}

        {currentScreen === 'ai' && (
          <ZentryAiScreen onBack={handleBack} isDark={currentWallpaper.isDark} />
        )}

        {currentScreen === 'creation' && (
          <ZentryCreationScreen
            onBack={handleBack}
            onNavigate={navigateTo}
            isDark={currentWallpaper.isDark}
          />
        )}

        {currentScreen === 'entertainment_hub' && (
          <ZentryEntertainmentHubScreen
            onBack={handleBack}
            onNavigate={navigateTo}
            isDark={currentWallpaper.isDark}
          />
        )}

        {currentScreen === 'zentry_tube' && (
          <ZentryTubeScreen onBack={handleBack} isDark={currentWallpaper.isDark} />
        )}

        {currentScreen === 'zentry_tok' && (
          <ZentryTokScreen onBack={handleBack} isDark={currentWallpaper.isDark} />
        )}

        {currentScreen === 'zentry_gram' && (
          <ZentryGramScreen onBack={handleBack} isDark={currentWallpaper.isDark} />
        )}

        {currentScreen === 'zentry_stream' && (
          <ZentryStreamScreen onBack={handleBack} isDark={currentWallpaper.isDark} />
        )}

        {currentScreen === 'tutor_hub' && (
          <ZentryTutorHubScreen
            onBack={handleBack}
            onNavigate={navigateTo}
            isDark={currentWallpaper.isDark}
          />
        )}

        {currentScreen === 'safe_search' && (
          <ZentrySafeBrowserScreen onBack={handleBack} isDark={currentWallpaper.isDark} />
        )}

        {currentScreen === 'calculator' && (
          <ZentryCalculatorScreen onBack={handleBack} isDark={currentWallpaper.isDark} />
        )}

        {currentScreen === 'camera' && (
          <ZentryCameraScreen onBack={handleBack} isDark={currentWallpaper.isDark} />
        )}

        {currentScreen === 'reloj' && (
          <ZentryClockScreen onBack={handleBack} isDark={currentWallpaper.isDark} />
        )}

        {currentScreen === 'calendar' && (
          <ZentryCalendarScreen onBack={handleBack} isDark={currentWallpaper.isDark} />
        )}

        {currentScreen === 'files' && (
          <ZentryFilesScreen onBack={handleBack} isDark={currentWallpaper.isDark} />
        )}

        {currentScreen === 'phone' && (
          <ZentryPhoneScreen onBack={handleBack} isDark={currentWallpaper.isDark} />
        )}

        {currentScreen === 'settings' && (
          <ZentrySettingsScreen
            onBack={handleBack}
            currentWallpaper={wallpaperId}
            onSelectWallpaper={handleSelectWallpaper}
            ageTier={ageTier}
            onSelectAgeTier={handleSelectAgeTier}
            isDark={currentWallpaper.isDark}
          />
        )}

        {currentScreen === 'neuro_art' && (
          <ZentryNeuroArtScreen onBack={handleBack} isDark={currentWallpaper.isDark} />
        )}

        {currentScreen === 'world_generator' && (
          <ZentryWorldGeneratorScreen onBack={handleBack} isDark={currentWallpaper.isDark} />
        )}

        {currentScreen === 'characters' && (
          <ZentryCharacterScreen onBack={handleBack} isDark={currentWallpaper.isDark} />
        )}

        {currentScreen === 'free_canvas' && (
          <ZentryFreeCanvasScreen onBack={handleBack} isDark={currentWallpaper.isDark} />
        )}

        {currentScreen === 'real_missions' && (
          <ZentryRealMissionsScreen onBack={handleBack} isDark={currentWallpaper.isDark} />
        )}

        {currentScreen === 'monsters' && (
          <ZentryMonsterScreen onBack={handleBack} isDark={currentWallpaper.isDark} />
        )}

        {currentScreen === 'study_assistant' && (
          <ZentryStudyAssistantScreen onBack={handleBack} isDark={currentWallpaper.isDark} />
        )}

        {currentScreen === 'deep_research' && (
          <ZentryResearchScreen onBack={handleBack} isDark={currentWallpaper.isDark} />
        )}

        {currentScreen === 'redactor' && (
          <ZentryRedactorScreen onBack={handleBack} isDark={currentWallpaper.isDark} />
        )}

        {currentScreen === 'image_generator' && (
          <ZentryImagineScreen
            onBack={handleBack}
            onNavigate={navigateTo}
            isDark={currentWallpaper.isDark}
          />
        )}

        {currentScreen === 'app_builder' && (
          <ZentryBuildScreen
            onBack={handleBack}
            isDark={currentWallpaper.isDark}
          />
        )}

        {currentScreen === 'workspace_app' && selectedWorkspaceApp && (
          <ZentryEmbeddedAppScreen
            appInfo={selectedWorkspaceApp}
            onBack={handleBack}
            isDark={currentWallpaper.isDark}
          />
        )}
      </div>

      {/* 4. Bottom System Navigation Gesture Bar */}
      <ZentryNavBar
        currentScreen={currentScreen}
        onBack={handleBack}
        onHome={handleHome}
        onNavigate={navigateTo}
        isDark={currentWallpaper.isDark}
        ageTier={ageTier}
      />

      {/* 5. Modals and Overlays */}
      <ZentryTopPanels
        isOpen={isQuickPanelOpen}
        initialTab={quickPanelTab}
        brightness={brightness}
        onBrightnessChange={setBrightness}
        volume={volume}
        onVolumeChange={setVolume}
        onClose={() => setIsQuickPanelOpen(false)}
        isDark={currentWallpaper.isDark}
      />

      <ZentryCommandSheet
        isOpen={isCommandSheetOpen}
        onClose={() => setIsCommandSheetOpen(false)}
        onNavigate={navigateTo}
        onSearch={(query) => {
          navigateTo('safe_search');
        }}
      />

      <CustomizationPanel
        isOpen={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
        currentWallpaper={wallpaperId}
        onSelectWallpaper={handleSelectWallpaper}
        showClock={showClock}
        onToggleClock={handleToggleClock}
        showCalendar={showCalendar}
        onToggleCalendar={handleToggleCalendar}
      />

      <ZentryLockModal
        deviceState={deviceState}
        onSimulateUnlock={() => {
          setDeviceState((prev) => ({ ...prev, isLocked: false }));
        }}
      />
    </main>
  );
};

export default App;
