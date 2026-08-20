import React, { useState, useEffect } from 'react';
import type { 
  CircadianRhythm, 
  ActiveAppId, 
  QuickSettingsState, 
  DeviceFirestoreState, 
  DeviceFrameType,
  VoiceCommandResult 
} from './types/zentry';
import { launcherSync, DEFAULT_DEVICE_ID } from './services/firebase';
import { voiceService } from './services/voiceSpeech';
import { sounds } from './services/soundEffects';

import { DeviceFrame } from './components/shell/DeviceFrame';
import { CircadianWallpaper } from './components/shell/CircadianWallpaper';
import { StatusBar } from './components/shell/StatusBar';
import { QuickSettingsPanel } from './components/shell/QuickSettingsPanel';
import { NavigationBar } from './components/shell/NavigationBar';
import { VoiceCommandBar } from './components/shell/VoiceCommandBar';
import { LockScreenModal } from './components/shell/LockScreenModal';

import { HomeScreen } from './components/home/HomeScreen';
import { AppDrawer } from './components/home/AppDrawer';

import { SafeYouTubeIntervention } from './components/microapps/SafeYouTubeIntervention';
import { StudyAssistantMinedu } from './components/microapps/StudyAssistantMinedu';
import { MultimodalCameraTutor } from './components/microapps/MultimodalCameraTutor';
import { NeuroArtStudio } from './components/microapps/NeuroArtStudio';
import { WorldGenerator } from './components/microapps/WorldGenerator';
import { SmartCalculator } from './components/microapps/SmartCalculator';
import { DigitalPassport } from './components/microapps/DigitalPassport';

export const App: React.FC = () => {
  // Device Frame Mode (Tablet / Phone / Fullscreen)
  const [frameType, setFrameType] = useState<DeviceFrameType>('tablet');

  // App Navigation Stack
  const [activeApp, setActiveApp] = useState<ActiveAppId>('home');
  const [navHistory, setNavHistory] = useState<ActiveAppId[]>([]);
  const [isAppDrawerOpen, setIsAppDrawerOpen] = useState<boolean>(false);
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState<boolean>(false);

  // Circadian Rhythm state
  const [circadian, setCircadian] = useState<CircadianRhythm>({
    period: 'day',
    name: 'Ventana de Máximo Enfoque',
    focusMinutesRemaining: 45,
    totalDailyBudgetMinutes: 90,
    circadianRatio: 0.5,
    energyLevel: 'peak'
  });

  // Quick Settings Toggles
  const [quickState, setQuickState] = useState<QuickSettingsState>({
    wifi: true,
    bluetooth: true,
    cellularData: true,
    flashlight: false,
    focusShield: true,
    monkMode: false,
    brightness: 85,
    volume: 70
  });

  // Live Firestore Device Sync
  const [deviceState, setDeviceState] = useState<DeviceFirestoreState>({
    deviceId: DEFAULT_DEVICE_ID,
    isLocked: false,
    lockReason: null,
    batteryLevel: 88,
    networkStatus: 'online',
    lastSeenAt: new Date().toISOString()
  });

  // Voice Assistant state
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceResult, setVoiceResult] = useState<VoiceCommandResult | null>(null);
  const [voiceStatusText, setVoiceStatusText] = useState('Escuchando tu comando...');

  // Initialize Real-time Firestore Sync
  useEffect(() => {
    launcherSync.init(DEFAULT_DEVICE_ID, (updatedState) => {
      setDeviceState(updatedState);
      if (updatedState.isLocked) {
        sounds.playInterventionShield();
      }
    });

    return () => launcherSync.cleanup();
  }, []);

  // Circadian Rhythm Calculator based on hour of day
  useEffect(() => {
    const calcCircadian = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 12) {
        setCircadian(prev => ({
          ...prev,
          period: 'morning',
          name: 'Despertar & Concentración Matutina',
          energyLevel: 'high'
        }));
      } else if (hour >= 12 && hour < 18) {
        setCircadian(prev => ({
          ...prev,
          period: 'day',
          name: 'Ventana de Alto Enfoque Cognitivo',
          energyLevel: 'peak'
        }));
      } else if (hour >= 18 && hour < 21) {
        setCircadian(prev => ({
          ...prev,
          period: 'evening',
          name: 'Consolidación de Aprendizaje & Creatividad',
          energyLevel: 'winding_down'
        }));
      } else {
        setCircadian(prev => ({
          ...prev,
          period: 'night',
          name: 'Modo Sueño & Cierre Circadiano',
          energyLevel: 'sleep_prep'
        }));
      }
    };
    calcCircadian();
  }, []);

  // Navigation Handlers
  const handleOpenApp = (appId: ActiveAppId) => {
    if (appId === activeApp) return;
    setNavHistory(prev => [...prev, activeApp]);
    setActiveApp(appId);
    setIsAppDrawerOpen(false);
    setIsQuickSettingsOpen(false);
  };

  const handleBack = () => {
    if (isAppDrawerOpen) {
      setIsAppDrawerOpen(false);
      return;
    }
    if (isQuickSettingsOpen) {
      setIsQuickSettingsOpen(false);
      return;
    }
    if (navHistory.length > 0) {
      const prev = navHistory[navHistory.length - 1];
      setNavHistory(h => h.slice(0, -1));
      setActiveApp(prev);
    } else {
      setActiveApp('home');
    }
  };

  const handleHome = () => {
    setIsAppDrawerOpen(false);
    setIsQuickSettingsOpen(false);
    if (activeApp !== 'home') {
      setNavHistory(prev => [...prev, activeApp]);
      setActiveApp('home');
    }
  };

  // Voice Assistant Trigger
  const handleTriggerVoice = () => {
    if (isVoiceActive) {
      voiceService.stopListening();
      setIsVoiceActive(false);
      return;
    }

    setIsVoiceActive(true);
    setVoiceResult(null);
    setVoiceStatusText('Te escucho... Pídeme abrir una materia o tarea');

    if (!voiceService.isSupported()) {
      // Mock voice response for browsers without Web Speech API
      setTimeout(() => {
        const mockRes = voiceService.parseVoiceCommand('Abre mi tutor de ciencias para la tarea');
        setVoiceResult(mockRes);
        setIsVoiceActive(false);
        if (mockRes.targetApp) {
          handleOpenApp(mockRes.targetApp);
        }
      }, 1500);
      return;
    }

    voiceService.startListening(
      (result) => {
        setIsVoiceActive(false);
        setVoiceResult(result);
        if (result.targetApp && result.targetApp !== activeApp) {
          setTimeout(() => handleOpenApp(result.targetApp!), 700);
        }
      },
      (err) => {
        setIsVoiceActive(false);
        setVoiceStatusText(`Audio: ${err}`);
      }
    );
  };

  return (
    <DeviceFrame frameType={frameType} onChangeFrame={setFrameType}>
      <div className="relative w-full h-full flex flex-col bg-[#080d1a] overflow-hidden select-none">
        {/* Dynamic Circadian Background Wallpaper */}
        <CircadianWallpaper circadian={circadian} />

        {/* Top Status Bar */}
        <StatusBar
          circadian={circadian}
          deviceState={deviceState}
          onOpenQuickSettings={() => setIsQuickSettingsOpen(prev => !prev)}
          isQuickSettingsOpen={isQuickSettingsOpen}
        />

        {/* Top Pull-Down Quick Settings Panel */}
        <QuickSettingsPanel
          isOpen={isQuickSettingsOpen}
          onClose={() => setIsQuickSettingsOpen(false)}
          quickState={quickState}
          onUpdateState={(patch) => setQuickState(prev => ({ ...prev, ...patch }))}
          circadian={circadian}
        />

        {/* Main Content Router */}
        <main className="relative flex-1 flex flex-col overflow-hidden z-10">
          {activeApp === 'home' && (
            <HomeScreen
              circadian={circadian}
              activeApp={activeApp}
              onOpenApp={handleOpenApp}
              onTriggerVoice={handleTriggerVoice}
            />
          )}

          {activeApp === 'youtube_guard' && <SafeYouTubeIntervention />}
          {activeApp === 'study_assistant' && <StudyAssistantMinedu />}
          {activeApp === 'camera_tutor' && <MultimodalCameraTutor />}
          {activeApp === 'neuro_art' && <NeuroArtStudio />}
          {activeApp === 'world_generator' && <WorldGenerator />}
          {activeApp === 'calculator' && <SmartCalculator />}
          {activeApp === 'passport' && <DigitalPassport />}
        </main>

        {/* Full App Drawer Modal */}
        <AppDrawer
          isOpen={isAppDrawerOpen}
          onClose={() => setIsAppDrawerOpen(false)}
          onOpenApp={handleOpenApp}
        />

        {/* Floating Voice Assistant Bar */}
        <VoiceCommandBar
          isActive={isVoiceActive}
          onClose={() => {
            setIsVoiceActive(false);
            setVoiceResult(null);
          }}
          lastResult={voiceResult}
          statusText={voiceStatusText}
        />

        {/* Bottom Navigation Gesture Bar */}
        <NavigationBar
          onBack={handleBack}
          onHome={handleHome}
          onToggleDrawer={() => setIsAppDrawerOpen(prev => !prev)}
          onTriggerVoice={handleTriggerVoice}
          canGoBack={activeApp !== 'home' || isAppDrawerOpen || isQuickSettingsOpen}
          isVoiceActive={isVoiceActive}
        />

        {/* Remote Lock Modal (Triggered in real-time from Parent Dashboard) */}
        <LockScreenModal
          deviceState={deviceState}
          onSimulateUnlock={() => setDeviceState(prev => ({ ...prev, isLocked: false }))}
        />
      </div>
    </DeviceFrame>
  );
};

export default App;
