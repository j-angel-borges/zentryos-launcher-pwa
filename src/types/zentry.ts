// ZentryOS Type Definitions
export type DeviceOrientation = 'portrait' | 'landscape';
export type DeviceFrameType = 'tablet' | 'phone' | 'fullscreen';
export type ActiveAppId = 'home' | 'youtube_guard' | 'study_assistant' | 'camera_tutor' | 'neuro_art' | 'world_generator' | 'calculator' | 'passport' | 'app_drawer' | 'settings';

export interface CircadianRhythm {
  period: 'morning' | 'day' | 'evening' | 'night';
  name: string;
  focusMinutesRemaining: number;
  totalDailyBudgetMinutes: number;
  circadianRatio: number; // 0 to 1
  energyLevel: 'high' | 'peak' | 'winding_down' | 'sleep_prep';
}

export interface QuickSettingsState {
  wifi: boolean;
  bluetooth: boolean;
  cellularData: boolean;
  flashlight: boolean;
  focusShield: boolean;
  monkMode: boolean;
  brightness: number; // 0 - 100
  volume: number; // 0 - 100
}

export interface MicroAppInfo {
  id: ActiveAppId;
  name: string;
  category: 'core' | 'ai' | 'creativity' | 'study' | 'tools';
  icon: string;
  color: string;
  badge?: string;
  description: string;
  isKioskProtected: boolean;
}

export interface YouTubeInterventionState {
  status: 'intercepted' | 'analyzing' | 'redirected' | 'watching_educational';
  blockedQuery?: string;
  educationalAlternative?: {
    title: string;
    category: string;
    channel: string;
    duration: string;
    dopamineScore: 'low' | 'balanced' | 'enriching';
    skillGained: string;
    videoUrl?: string;
  };
}

export interface SocraticMessage {
  id: string;
  sender: 'tutor' | 'student' | 'system';
  text: string;
  timestamp: string;
  subject?: 'math' | 'science' | 'history' | 'language' | 'logic';
  interactiveChoices?: string[];
  solved?: boolean;
}

export interface VoiceCommandResult {
  transcript: string;
  action: string;
  targetApp?: ActiveAppId;
  aiResponse: string;
  executedSuccessfully: boolean;
}

export interface DeviceFirestoreState {
  deviceId: string;
  isLocked: boolean;
  lockReason: string | null;
  batteryLevel: number;
  networkStatus: string;
  lastSeenAt: string;
}
