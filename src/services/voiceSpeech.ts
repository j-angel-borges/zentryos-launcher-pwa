import type { VoiceCommandResult } from '../types/zentry';

export type AgeCohort = 'toddler' | 'explorer';

export type VoicePersona = 'toddler_sweet' | 'socratic_studio' | 'academic_female' | 'explorer_adventurer';

export interface TTSVoiceConfig {
  languageCode: string;
  name: string;
  ssmlGender: 'FEMALE' | 'MALE' | 'NEUTRAL';
  pitch: number; // Pitch en semitonos (-2.0 a +2.0)
  speakingRate: number; // 0.85 a 1.20 (óptimo 0.98 a 1.04)
  volumeGainDb?: number; // 0.0 a 3.0 (óptimo 1.2 a 1.8)
  personaId?: VoicePersona;
}

export interface SpeakOptions {
  pitch?: number;
  speakingRate?: number;
  voiceName?: string;
  languageCode?: string;
  volumeGainDb?: number;
  personaId?: VoicePersona;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

export interface CachedAudioRecord {
  key: string;
  blob: Blob;
  text: string;
  voice: string;
  pitch: number;
  speakingRate: number;
  createdAt: number;
}

export interface VoicePersonaInfo {
  id: VoicePersona;
  name: string;
  description: string;
  cohort: AgeCohort;
  gcpModel: string;
  gender: 'FEMALE' | 'MALE';
  defaultPitch: number;
  defaultRate: number;
  defaultGain: number;
}

export const VOICE_PERSONAS: Record<VoicePersona, VoicePersonaInfo> = {
  toddler_sweet: {
    id: 'toddler_sweet',
    name: 'Zentry Amigo (Dulce)',
    description: 'Voz femenina cálida, afectuosa y expresiva para infantes',
    cohort: 'toddler',
    gcpModel: 'es-US-Neural2-A',
    gender: 'FEMALE',
    defaultPitch: 0.8,
    defaultRate: 1.02,
    defaultGain: 1.5
  },
  socratic_studio: {
    id: 'socratic_studio',
    name: 'Tutor Socrático (Studio HD)',
    description: 'Voz masculina reflexiva, madura y de fidelidad estudio 24kHz',
    cohort: 'explorer',
    gcpModel: 'es-US-Studio-B',
    gender: 'MALE',
    defaultPitch: 0.0,
    defaultRate: 0.98,
    defaultGain: 1.2
  },
  academic_female: {
    id: 'academic_female',
    name: 'Guía Académica (Studio)',
    description: 'Voz femenina articulada, clara y motivadora para estudio',
    cohort: 'explorer',
    gcpModel: 'es-ES-Studio-C',
    gender: 'FEMALE',
    defaultPitch: 0.2,
    defaultRate: 1.0,
    defaultGain: 1.3
  },
  explorer_adventurer: {
    id: 'explorer_adventurer',
    name: 'Amigo Aventurero (Neural2)',
    description: 'Voz juvenil enérgica y curiosa para retos STEM y misiones',
    cohort: 'explorer',
    gcpModel: 'es-US-Neural2-C',
    gender: 'MALE',
    defaultPitch: 0.4,
    defaultRate: 1.04,
    defaultGain: 1.4
  }
};

export const AGE_VOICE_PROFILES: Record<AgeCohort, TTSVoiceConfig> = {
  toddler: {
    languageCode: 'es-US',
    name: 'es-US-Neural2-A',
    ssmlGender: 'FEMALE',
    pitch: 0.8, // Tono dulce y cálido natural (no chillón ni robótico)
    speakingRate: 1.02, // Cadencia animada y fluida
    volumeGainDb: 1.5,
    personaId: 'toddler_sweet'
  },
  explorer: {
    languageCode: 'es-US',
    name: 'es-US-Studio-B', // Modelo de ultra-alta fidelidad Studio HD
    ssmlGender: 'MALE',
    pitch: 0.0, // Tono neutro, acústica profunda y socrática
    speakingRate: 0.98, // Ritmo reflexivo y articulado
    volumeGainDb: 1.2,
    personaId: 'socratic_studio'
  }
};

export const DEFAULT_PRELOAD_PHRASES = [
  '¡Vamos a crear y dibujar!',
  '¡Hora de videos, cuentos y música!',
  '¡Sonríe a la cámara!',
  '¡Mira qué hora es!',
  'Abriendo el Escudo de Contenido y Algoritmo de Pasiones.',
  'Activando tu Tutor Socrático de Estudio.',
  'Iniciando Visión Artificial Multimodal para escanear tu ejercicio.',
  'Abriendo NeuroArt Studio para plasmar tus ideas.',
  'Generando simulación de mundo interactivo.',
  'Abriendo Calculadora Científica Inteligente.',
  'Regresando a la pantalla principal.',
  '¡Hola! Soy Zentry. ¿Qué te gustaría descubrir o resolver hoy?',
  'He procesado tu consulta. Vamos a resolverlo paso a paso en tu Tutor de Estudio.'
];

const DB_NAME = 'zentry_tts_db';
const DB_VERSION = 1;
const STORE_NAME = 'audio_cache';

export class VoiceSpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentCohort: AgeCohort = 'toddler';
  private selectedPersona: VoicePersona = 'toddler_sweet';

  // Custom persistent overrides
  private customSettings: {
    pitchOffset?: number;
    rateMultiplier?: number;
    volumeGainDb?: number;
    preferredPersona?: VoicePersona;
  } = {};

  // Audio playback state & cancellation
  private currentAudio: HTMLAudioElement | null = null;
  private currentAudioUrl: string | null = null;
  private abortController: AbortController | null = null;
  private audioContext: AudioContext | null = null;
  private isSpeakingActive: boolean = false;

  // Cached system voices for natural offline speech
  private cachedBrowserVoices: SpeechSynthesisVoice[] = [];

  // IndexedDB instance cache
  private dbPromise: Promise<IDBDatabase | null> | null = null;

  constructor() {
    this.loadCustomSettings();
    this.initSpeechRecognition();
    this.initDB();
    this.setupAutoplayUnlockListeners();
    this.initBrowserVoices();
    this.scheduleDefaultPreload();
  }

  // ==========================================
  // 1. INICIALIZACIÓN & CARGA DE CONFIGURACIÓN
  // ==========================================

  private loadCustomSettings() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('zentry_tts_custom_settings');
      if (raw) {
        this.customSettings = JSON.parse(raw);
        if (this.customSettings.preferredPersona && VOICE_PERSONAS[this.customSettings.preferredPersona]) {
          this.selectedPersona = this.customSettings.preferredPersona;
          this.currentCohort = VOICE_PERSONAS[this.selectedPersona].cohort;
        }
      }
    } catch {}
  }

  public saveCustomSettings(settings: {
    pitchOffset?: number;
    rateMultiplier?: number;
    volumeGainDb?: number;
    preferredPersona?: VoicePersona;
  }) {
    this.customSettings = { ...this.customSettings, ...settings };
    if (settings.preferredPersona && VOICE_PERSONAS[settings.preferredPersona]) {
      this.selectedPersona = settings.preferredPersona;
      this.currentCohort = VOICE_PERSONAS[settings.preferredPersona].cohort;
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('zentry_tts_custom_settings', JSON.stringify(this.customSettings));
      } catch {}
    }
  }

  public getCustomSettings() {
    return { ...this.customSettings, selectedPersona: this.selectedPersona, currentCohort: this.currentCohort };
  }

  private initBrowserVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const update = () => {
      this.cachedBrowserVoices = window.speechSynthesis.getVoices();
    };

    update();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = update;
    }
  }

  private initSpeechRecognition() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'es-PE';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
      }
    }
  }

  private setupAutoplayUnlockListeners() {
    if (typeof window === 'undefined') return;

    const unlockHandler = () => {
      this.unlockAudioContext();
      window.removeEventListener('click', unlockHandler);
      window.removeEventListener('touchstart', unlockHandler);
      window.removeEventListener('keydown', unlockHandler);
    };

    window.addEventListener('click', unlockHandler, { passive: true, once: true });
    window.addEventListener('touchstart', unlockHandler, { passive: true, once: true });
    window.addEventListener('keydown', unlockHandler, { passive: true, once: true });
  }

  private scheduleDefaultPreload() {
    if (typeof window === 'undefined') return;
    const run = () => {
      this.preloadPhrases(DEFAULT_PRELOAD_PHRASES).catch(() => {});
    };
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(run);
    } else {
      setTimeout(run, 3000);
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  // ==========================================
  // 2. CONFIGURACIÓN Y PERFILES POR EDAD / PERSONA
  // ==========================================

  public setAgeProfile(cohort: AgeCohort) {
    this.currentCohort = cohort;
    this.selectedPersona = cohort === 'toddler' ? 'toddler_sweet' : 'socratic_studio';
  }

  public getAgeProfile(): AgeCohort {
    return this.currentCohort;
  }

  public setPersona(persona: VoicePersona) {
    if (VOICE_PERSONAS[persona]) {
      this.selectedPersona = persona;
      this.currentCohort = VOICE_PERSONAS[persona].cohort;
      this.saveCustomSettings({ preferredPersona: persona });
    }
  }

  public getPersona(): VoicePersona {
    return this.selectedPersona;
  }

  public getVoiceConfig(): TTSVoiceConfig {
    const persona = VOICE_PERSONAS[this.selectedPersona] || VOICE_PERSONAS.toddler_sweet;
    const pitchOffset = this.customSettings.pitchOffset ?? 0;
    const rateMultiplier = this.customSettings.rateMultiplier ?? 1.0;
    const volumeGain = this.customSettings.volumeGainDb ?? persona.defaultGain;

    return {
      languageCode: 'es-US',
      name: persona.gcpModel,
      ssmlGender: persona.gender,
      pitch: Number((persona.defaultPitch + pitchOffset).toFixed(2)),
      speakingRate: Number((persona.defaultRate * rateMultiplier).toFixed(2)),
      volumeGainDb: volumeGain,
      personaId: this.selectedPersona
    };
  }

  private getEffectiveConfig(options?: SpeakOptions): TTSVoiceConfig {
    const base = this.getVoiceConfig();

    let targetPersona = base.personaId;
    if (options?.personaId && VOICE_PERSONAS[options.personaId]) {
      targetPersona = options.personaId;
    }

    const persona = VOICE_PERSONAS[targetPersona || 'toddler_sweet'];

    return {
      languageCode: options?.languageCode || base.languageCode,
      name: options?.voiceName || persona.gcpModel || base.name,
      ssmlGender: persona.gender || base.ssmlGender,
      pitch: options?.pitch !== undefined ? options.pitch : base.pitch,
      speakingRate: options?.speakingRate !== undefined ? options.speakingRate : base.speakingRate,
      volumeGainDb: options?.volumeGainDb !== undefined ? options.volumeGainDb : base.volumeGainDb,
      personaId: targetPersona
    };
  }

  private getCacheKey(text: string, config: TTSVoiceConfig): string {
    return `${config.languageCode}_${config.name}_${config.pitch}_${config.speakingRate}_${config.volumeGainDb}_${text.trim()}`;
  }

  // ==========================================
  // 3. PERSISTENCIA EN INDEXEDDB (0 ms Latency)
  // ==========================================

  private initDB(): Promise<IDBDatabase | null> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.resolve(null);
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve) => {
        try {
          const request = window.indexedDB.open(DB_NAME, DB_VERSION);

          request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              db.createObjectStore(STORE_NAME, { keyPath: 'key' });
            }
          };

          request.onsuccess = () => {
            resolve(request.result);
          };

          request.onerror = () => {
            console.warn('[VoiceSpeechService] IndexedDB open error, continuing with fallback.');
            resolve(null);
          };
        } catch {
          resolve(null);
        }
      });
    }

    return this.dbPromise;
  }

  private async getFromCache(key: string): Promise<Blob | null> {
    try {
      const db = await this.initDB();
      if (!db) return null;

      return new Promise<Blob | null>((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const request = store.get(key);

          request.onsuccess = () => {
            const record = request.result as CachedAudioRecord | undefined;
            resolve(record ? record.blob : null);
          };

          request.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      });
    } catch {
      return null;
    }
  }

  private async saveToCache(key: string, blob: Blob, text: string, config: TTSVoiceConfig): Promise<void> {
    try {
      const db = await this.initDB();
      if (!db) return;

      const record: CachedAudioRecord = {
        key,
        blob,
        text,
        voice: config.name,
        pitch: config.pitch,
        speakingRate: config.speakingRate,
        createdAt: Date.now()
      };

      await new Promise<void>((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.put(record);
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    } catch {
      // Cache saving failures should not affect UX
    }
  }

  public async clearAudioCache(): Promise<void> {
    try {
      const db = await this.initDB();
      if (!db) return;

      await new Promise<void>((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.clear();
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    } catch {
      // Ignore
    }
  }

  // ==========================================
  // 4. AUTOPLAY & AUDIO CONTEXT UNLOCK
  // ==========================================

  public unlockAudioContext(): void {
    if (typeof window === 'undefined') return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!this.audioContext) {
          this.audioContext = new AudioCtx();
        }
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume().catch(() => {});
        }
      }
    } catch {}

    try {
      const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
      silentAudio.volume = 0.001;
      silentAudio.play().then(() => {
        silentAudio.pause();
      }).catch(() => {});
    } catch {}
  }

  // ==========================================
  // 5. CANCELACIÓN Y ANTI-SOLAPAMIENTO
  // ==========================================

  public stopSpeaking(): void {
    // 1. Cancel active HTTP fetch in flight
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    // 2. Stop and release active HTML Audio element
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio.onended = null;
      this.currentAudio.onerror = null;
      this.currentAudio = null;
    }

    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl);
      this.currentAudioUrl = null;
    }

    // 3. Cancel native SpeechSynthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    this.isSpeakingActive = false;
  }

  // ==========================================
  // 6. SÍNTESIS DE VOZ NEURONAL GCP / FALLBACK
  // ==========================================

  private buildNaturalSSML(text: string, config: TTSVoiceConfig): string {
    // Escape XML characters
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    // Insert natural conversational micro-pauses at punctuation marks
    const pacedText = escaped
      .replace(/\.\s+/g, '. <break time="200ms"/> ')
      .replace(/!\s+/g, '! <break time="220ms"/> ')
      .replace(/\?\s+/g, '? <break time="220ms"/> ')
      .replace(/,\s+/g, ', <break time="120ms"/> ')
      .replace(/:\s+/g, ': <break time="140ms"/> ');

    const pitchStr = config.pitch >= 0 ? `+${config.pitch}st` : `${config.pitch}st`;
    const rateStr = `${Math.round(config.speakingRate * 100)}%`;

    return `<speak><prosody rate="${rateStr}" pitch="${pitchStr}">${pacedText}</prosody></speak>`;
  }

  public async speakFeedback(text: string, options?: SpeakOptions): Promise<void> {
    if (!text || !text.trim()) return;

    const sanitizedText = text.trim();
    this.stopSpeaking();

    const config = this.getEffectiveConfig(options);
    const cacheKey = this.getCacheKey(sanitizedText, config);

    // 1. Comprobar Caché IndexedDB (Latencia 0 ms)
    const cachedBlob = await this.getFromCache(cacheKey);
    if (cachedBlob) {
      await this.playAudioBlob(cachedBlob, options);
      return;
    }

    // 2. Obtener API Key de GCP (desde .env.local o localStorage)
    const envKey = (import.meta as any).env?.VITE_GOOGLE_TTS_API_KEY;
    const localKey = typeof window !== 'undefined' ? localStorage.getItem('zentry_tts_api_key') : null;
    const apiKey = (envKey && !envKey.includes('YourGcpApiKeyHere')) ? envKey : localKey;

    if (!apiKey || apiKey.trim() === '') {
      // Fallback offline directo de alta fidelidad si no hay API key configurada
      this.speakOfflineFallback(sanitizedText, options);
      return;
    }

    // 3. Petición HTTP a Google Cloud Text-to-Speech API con SSML natural
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    try {
      const ssml = this.buildNaturalSSML(sanitizedText, config);

      // Attempt primary synthesis
      let response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: { ssml },
          voice: {
            languageCode: config.languageCode,
            name: config.name,
            ssmlGender: config.ssmlGender
          },
          audioConfig: {
            audioEncoding: 'MP3',
            pitch: config.pitch,
            speakingRate: config.speakingRate,
            volumeGainDb: config.volumeGainDb ?? 1.5,
            sampleRateHertz: 24000,
            effectsProfileId: ['headphone-class-device', 'small-bluetooth-speaker-class-device']
          }
        }),
        signal
      });

      // If Studio voice is restricted or unavailable on some GCP quotas, gracefully try Neural2
      if (!response.ok && config.name.includes('Studio')) {
        const fallbackVoice = config.ssmlGender === 'FEMALE' ? 'es-US-Neural2-A' : 'es-US-Neural2-C';
        response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { ssml },
            voice: {
              languageCode: config.languageCode,
              name: fallbackVoice,
              ssmlGender: config.ssmlGender
            },
            audioConfig: {
              audioEncoding: 'MP3',
              pitch: config.pitch,
              speakingRate: config.speakingRate,
              volumeGainDb: config.volumeGainDb ?? 1.5,
              sampleRateHertz: 24000,
              effectsProfileId: ['headphone-class-device', 'small-bluetooth-speaker-class-device']
            }
          }),
          signal
        });
      }

      if (!response.ok) {
        throw new Error(`GCP TTS Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.audioContent) {
        throw new Error('No audio content received from GCP TTS');
      }

      // Convertir Base64 a Blob
      const blob = this.base64ToBlob(data.audioContent, 'audio/mp3');

      // Guardar en caché IndexedDB en segundo plano
      this.saveToCache(cacheKey, blob, sanitizedText, config);

      // Reproducir si no fue cancelado
      if (!signal.aborted) {
        await this.playAudioBlob(blob, options);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError' || signal.aborted) {
        return;
      }
      console.warn('[VoiceSpeechService] Error en Google Cloud TTS, activando fallback natural offline:', err);
      this.speakOfflineFallback(sanitizedText, options);
    } finally {
      this.abortController = null;
    }
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteArray = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }
    return new Blob([byteArray.buffer], { type: mimeType });
  }

  private playAudioBlob(blob: Blob, options?: SpeakOptions): Promise<void> {
    return new Promise((resolve) => {
      try {
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);

        this.currentAudio = audio;
        this.currentAudioUrl = audioUrl;
        this.isSpeakingActive = true;

        audio.onplay = () => {
          options?.onStart?.();
        };

        audio.onended = () => {
          this.isSpeakingActive = false;
          if (this.currentAudioUrl) {
            URL.revokeObjectURL(this.currentAudioUrl);
            this.currentAudioUrl = null;
          }
          this.currentAudio = null;
          options?.onEnd?.();
          resolve();
        };

        audio.onerror = (e) => {
          this.isSpeakingActive = false;
          if (this.currentAudioUrl) {
            URL.revokeObjectURL(this.currentAudioUrl);
            this.currentAudioUrl = null;
          }
          this.currentAudio = null;
          options?.onError?.(e);
          resolve();
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('[VoiceSpeechService] Autoplay blocked, falling back to offline utterance:', err);
            this.speakOfflineFallback(options?.voiceName || '', options);
            resolve();
          });
        }
      } catch (err) {
        options?.onError?.(err);
        resolve();
      }
    });
  }

  // ==========================================
  // 7. SELECCIÓN INTELIGENTE DE VOZ NATURAL OFFLINE
  // ==========================================

  private getBestNaturalOfflineVoice(cohort: AgeCohort, personaId?: VoicePersona): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

    let voices = this.cachedBrowserVoices;
    if (!voices || voices.length === 0) {
      voices = window.speechSynthesis.getVoices();
      this.cachedBrowserVoices = voices;
    }

    if (!voices || voices.length === 0) return null;

    const persona = personaId ? VOICE_PERSONAS[personaId] : null;
    const isFemale = persona ? persona.gender === 'FEMALE' : cohort === 'toddler';

    // Filter Spanish voices
    const spanishVoices = voices.filter(
      (v) => v.lang.startsWith('es') || v.lang.startsWith('ES') || v.lang.includes('es-')
    );

    if (spanishVoices.length === 0) {
      return voices[0] || null;
    }

    // Score voices according to neural/natural quality and persona alignment
    const scored = spanishVoices.map((voice) => {
      let score = 0;
      const name = voice.name.toLowerCase();

      // Top priority: Modern Edge/Chrome Natural Neural Voices
      if (name.includes('natural') || name.includes('online')) score += 100;
      if (name.includes('neural')) score += 90;
      if (name.includes('google') || name.includes('español')) score += 75;

      if (isFemale) {
        // High quality female voices
        if (name.includes('dalia') || name.includes('paloma') || name.includes('monica') || name.includes('paulina') || name.includes('valerie') || name.includes('sabina')) {
          score += 40;
        }
        if (name.includes('female') || name.includes('mujer') || name.includes('femenina')) score += 25;
      } else {
        // High quality male voices
        if (name.includes('jorge') || name.includes('alvaro') || name.includes('alonso') || name.includes('carlos') || name.includes('diego') || name.includes('gonzalo')) {
          score += 40;
        }
        if (name.includes('male') || name.includes('hombre') || name.includes('masculino')) score += 25;
      }

      // Latin American preference
      if (voice.lang.includes('MX') || voice.lang.includes('US') || voice.lang.includes('PE') || voice.lang.includes('CO')) {
        score += 15;
      }

      // Penalize legacy robotic Desktop voices when Natural voices are available
      if (name.includes('desktop')) {
        score -= 40;
      }

      return { voice, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.voice || spanishVoices[0] || null;
  }

  private speakOfflineFallback(text: string, options?: SpeakOptions): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      options?.onError?.(new Error('SpeechSynthesis not supported'));
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const config = this.getEffectiveConfig(options);

      utterance.lang = config.languageCode || 'es-US';

      // Select absolute best natural offline voice
      const naturalVoice = this.getBestNaturalOfflineVoice(this.currentCohort, config.personaId);
      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      // Calibrate human pitch & rate (avoiding screechy pitch shifts)
      if (this.currentCohort === 'toddler') {
        utterance.pitch = Math.min(1.15, Math.max(0.9, 1.04 + (this.customSettings.pitchOffset ?? 0) * 0.05));
        utterance.rate = Math.min(1.2, Math.max(0.85, 1.0 * (this.customSettings.rateMultiplier ?? 1.0)));
      } else {
        utterance.pitch = Math.min(1.1, Math.max(0.85, 0.96 + (this.customSettings.pitchOffset ?? 0) * 0.05));
        utterance.rate = Math.min(1.15, Math.max(0.85, 0.98 * (this.customSettings.rateMultiplier ?? 1.0)));
      }

      utterance.volume = 1.0;

      utterance.onstart = () => {
        this.isSpeakingActive = true;
        options?.onStart?.();
      };

      utterance.onend = () => {
        this.isSpeakingActive = false;
        options?.onEnd?.();
      };

      utterance.onerror = (e) => {
        this.isSpeakingActive = false;
        options?.onError?.(e);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[VoiceSpeechService] Native SpeechSynthesis error:', err);
      this.isSpeakingActive = false;
    }
  }

  // ==========================================
  // 8. PRE-CARGA PROACTIVA DE FRASES (BACKGROUND)
  // ==========================================

  public async preloadPhrases(phrases: string[]): Promise<void> {
    const envKey = (import.meta as any).env?.VITE_GOOGLE_TTS_API_KEY;
    const localKey = typeof window !== 'undefined' ? localStorage.getItem('zentry_tts_api_key') : null;
    const apiKey = (envKey && !envKey.includes('YourGcpApiKeyHere')) ? envKey : localKey;

    if (!apiKey || apiKey.trim() === '' || !Array.isArray(phrases) || phrases.length === 0) {
      return;
    }

    const config = this.getVoiceConfig();

    for (const phrase of phrases) {
      if (!phrase || !phrase.trim()) continue;
      const text = phrase.trim();
      const cacheKey = this.getCacheKey(text, config);

      try {
        const cached = await this.getFromCache(cacheKey);
        if (cached) continue;

        const ssml = this.buildNaturalSSML(text, config);

        const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { ssml },
            voice: {
              languageCode: config.languageCode,
              name: config.name,
              ssmlGender: config.ssmlGender
            },
            audioConfig: {
              audioEncoding: 'MP3',
              pitch: config.pitch,
              speakingRate: config.speakingRate,
              volumeGainDb: config.volumeGainDb ?? 1.5,
              sampleRateHertz: 24000,
              effectsProfileId: ['headphone-class-device', 'small-bluetooth-speaker-class-device']
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.audioContent) {
            const blob = this.base64ToBlob(data.audioContent, 'audio/mp3');
            await this.saveToCache(cacheKey, blob, text, config);
          }
        }
      } catch {
        // La precarga en background no debe interrumpir
      }
    }
  }

  // ==========================================
  // 9. ESCUCHA ACTIVA & PARSING DE COMANDOS
  // ==========================================

  public startListening(
    onResult: (result: VoiceCommandResult) => void,
    onError: (error: string) => void
  ) {
    if (!this.recognition) {
      onError('Reconocimiento de voz no soportado en este dispositivo.');
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
    }

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      this.isListening = false;
      const transcript = event.results[0][0].transcript.trim();
      const parsed = this.parseVoiceCommand(transcript);
      onResult(parsed);
      this.speakFeedback(parsed.aiResponse);
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(event.error || 'Error al capturar voz');
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Speech recognition start error:', e);
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public parseVoiceCommand(text: string): VoiceCommandResult {
    const lower = text.toLowerCase();

    if (lower.includes('youtube') || lower.includes('video') || lower.includes('shorts') || lower.includes('redes')) {
      return {
        transcript: text,
        action: 'open_youtube_guard',
        targetApp: 'youtube_guard',
        aiResponse: 'Abriendo el Escudo de Contenido y Algoritmo de Pasiones.',
        executedSuccessfully: true
      };
    }

    if (lower.includes('tarea') || lower.includes('estudio') || lower.includes('tutor') || lower.includes('minedu') || lower.includes('aprender') || lower.includes('mate') || lower.includes('ciencias')) {
      return {
        transcript: text,
        action: 'open_study_assistant',
        targetApp: 'study_assistant',
        aiResponse: 'Activando tu Tutor Socrático de Estudio.',
        executedSuccessfully: true
      };
    }

    if (lower.includes('cámara') || lower.includes('camara') || lower.includes('escanear') || lower.includes('foto') || lower.includes('ver')) {
      return {
        transcript: text,
        action: 'open_camera_tutor',
        targetApp: 'camera_tutor',
        aiResponse: 'Iniciando Visión Artificial Multimodal para escanear tu ejercicio.',
        executedSuccessfully: true
      };
    }

    if (lower.includes('arte') || lower.includes('dibujar') || lower.includes('crear') || lower.includes('neuro') || lower.includes('imagen')) {
      return {
        transcript: text,
        action: 'open_neuro_art',
        targetApp: 'neuro_art',
        aiResponse: 'Abriendo NeuroArt Studio para plasmar tus ideas.',
        executedSuccessfully: true
      };
    }

    if (lower.includes('mundo') || lower.includes('generador') || lower.includes('simulacion') || lower.includes('universo')) {
      return {
        transcript: text,
        action: 'open_world_generator',
        targetApp: 'world_generator',
        aiResponse: 'Generando simulación de mundo interactivo.',
        executedSuccessfully: true
      };
    }

    if (lower.includes('calculadora') || lower.includes('cuenta') || lower.includes('sumar') || lower.includes('restar')) {
      return {
        transcript: text,
        action: 'open_calculator',
        targetApp: 'calculator',
        aiResponse: 'Abriendo Calculadora Científica Inteligente.',
        executedSuccessfully: true
      };
    }

    if (lower.includes('inicio') || lower.includes('home') || lower.includes('pantalla principal') || lower.includes('cerrar')) {
      return {
        transcript: text,
        action: 'go_home',
        targetApp: 'home',
        aiResponse: 'Regresando a la pantalla principal.',
        executedSuccessfully: true
      };
    }

    return {
      transcript: text,
      action: 'ai_qa',
      targetApp: 'study_assistant',
      aiResponse: 'He procesado tu consulta. Vamos a resolverlo paso a paso en tu Tutor de Estudio.',
      executedSuccessfully: true
    };
  }
}

export const voiceService = new VoiceSpeechService();

if (typeof window !== 'undefined') {
  (window as any).voiceService = voiceService;
}

