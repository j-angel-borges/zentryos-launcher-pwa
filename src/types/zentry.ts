export type ScreenId = 
  | 'launcher'
  | 'ai'
  | 'creation'
  | 'tutor_hub'
  | 'safe_search'
  | 'calculator'
  | 'camera'
  | 'reloj'
  | 'calendar'
  | 'files'
  | 'phone'
  | 'settings'
  | 'neuro_art'
  | 'world_generator'
  | 'study_assistant'
  | 'deep_research'
  | 'redactor'
  | 'workspace_app'
  | 'entertainment_hub'
  | 'zentry_tube'
  | 'zentry_tok'
  | 'zentry_gram'
  | 'zentry_stream';

export type AgeTier = 'toddler' | 'explorer';

export type WallpaperId = 'Glacial' | 'Lila' | 'Aura' | 'Brisa' | 'Espacio';

export interface WallpaperConfig {
  id: WallpaperId;
  name: string;
  hex: string;
  base: string;
  orbs: string[];
  isDark: boolean;
}

export type CircadianPhaseName = 'MORNING' | 'AFTERNOON' | 'NIGHT';

export interface CircadianPhase {
  name: CircadianPhaseName;
  title: string;
  description: string;
  startColor: string;
  endColor: string;
  textColor: string;
}

export interface DeviceFirestoreState {
  deviceId: string;
  isLocked: boolean;
  lockReason: string | null;
  batteryLevel: number;
  networkStatus: 'online' | 'offline' | 'cellular';
  lastSeenAt: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

export interface VoiceCommandResult {
  transcript: string;
  action: string;
  targetApp: string;
  aiResponse: string;
  executedSuccessfully: boolean;
}

export interface WorkspaceAppInfo {
  name: string;
  url: string;
  iconName: string;
  type: 'docs' | 'sheets' | 'slides' | 'drive' | 'gmail' | 'meet' | 'classroom' | 'notebooklm' | 'calendar' | 'maps' | 'youtube';
}
