import type { VoiceCommandResult } from '../types/zentry';

export type AgeCohort = 'toddler' | 'explorer';

export interface TTSVoiceConfig {
  languageCode: string;
  name: string;
  ssmlGender: 'FEMALE' | 'MALE' | 'NEUTRAL';
  pitch: number;
  speakingRate: number;
}

export interface SpeakOptions {
  pitch?: number;
  speakingRate?: number;
  voiceName?: string;
  languageCode?: string;
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

export const AGE_VOICE_PROFILES: Record<AgeCohort, TTSVoiceConfig> = {
  toddler: {
    languageCode: 'es-US',
    name: 'es-US-Neural2-A',
    ssmlGender: 'FEMALE',
    pitch: 1.5, // Dulce y cálido para infantes
    speakingRate: 1.08 // Ritmo vivaz y comprensible
  },
  explorer: {
    languageCode: 'es-US',
    name: 'es-US-Journey-F',
    ssmlGender: 'FEMALE',
    pitch: 0.0, // Tono neutro, natural y socrático
    speakingRate: 1.02 // Reflexivo y articulado
  }
};

export const DEFAULT_PRELOAD_PHRASES = [
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

  // Audio playback state & cancellation
  private currentAudio: HTMLAudioElement | null = null;
  private currentAudioUrl: string | null = null;
  private abortController: AbortController | null = null;
  private audioContext: AudioContext | null = null;
  private isSpeakingActive: boolean = false;

  // IndexedDB instance cache
  private dbPromise: Promise<IDBDatabase | null> | null = null;

  constructor() {
    this.initSpeechRecognition();
    this.initDB();
    this.setupAutoplayUnlockListeners();
    this.scheduleDefaultPreload();
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

  // ==========================================
  // 1. INICIALIZACIÓN & RECONOCIMIENTO DE VOZ
  // ==========================================

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

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  // ==========================================
  // 2. CONFIGURACIÓN Y PERFILES POR EDAD
  // ==========================================

  public setAgeProfile(cohort: AgeCohort) {
    this.currentCohort = cohort;
  }

  public getAgeProfile(): AgeCohort {
    return this.currentCohort;
  }

  public getVoiceConfig(): TTSVoiceConfig {
    return { ...AGE_VOICE_PROFILES[this.currentCohort] };
  }

  private getEffectiveConfig(options?: SpeakOptions): TTSVoiceConfig {
    const base = AGE_VOICE_PROFILES[this.currentCohort];
    return {
      languageCode: options?.languageCode || base.languageCode,
      name: options?.voiceName || base.name,
      ssmlGender: base.ssmlGender,
      pitch: options?.pitch !== undefined ? options.pitch : base.pitch,
      speakingRate: options?.speakingRate !== undefined ? options.speakingRate : base.speakingRate
    };
  }

  private getCacheKey(text: string, config: TTSVoiceConfig): string {
    return `${config.languageCode}_${config.name}_${config.pitch}_${config.speakingRate}_${text.trim()}`;
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

    // 2. Obtener API Key de GCP
    const apiKey = (import.meta as any).env?.VITE_GOOGLE_TTS_API_KEY;

    if (!apiKey || apiKey.includes('YourGcpApiKeyHere')) {
      // Fallback offline directo si no hay API key configurada
      this.speakOfflineFallback(sanitizedText, options);
      return;
    }

    // 3. Petición HTTP a Google Cloud Text-to-Speech API
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    try {
      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: { text: sanitizedText },
          voice: {
            languageCode: config.languageCode,
            name: config.name,
            ssmlGender: config.ssmlGender
          },
          audioConfig: {
            audioEncoding: 'MP3',
            pitch: config.pitch,
            speakingRate: config.speakingRate
          }
        }),
        signal
      });

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
        // La reproducción fue cancelada por una nueva llamada
        return;
      }
      console.warn('[VoiceSpeechService] Error en Google Cloud TTS, activando fallback offline:', err);
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
      utterance.pitch = this.currentCohort === 'toddler' ? 1.25 : 1.0;
      utterance.rate = this.currentCohort === 'toddler' ? 1.08 : 1.02;

      // Buscar voz óptima en español si está disponible
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const preferred = voices.find((v) =>
          v.lang.startsWith('es') &&
          (this.currentCohort === 'toddler'
            ? v.name.toLowerCase().includes('sabina') ||
              v.name.toLowerCase().includes('monica') ||
              v.name.toLowerCase().includes('paulina') ||
              v.name.toLowerCase().includes('female') ||
              v.name.toLowerCase().includes('natural')
            : true)
        ) || voices.find((v) => v.lang.startsWith('es'));

        if (preferred) {
          utterance.voice = preferred;
        }
      }

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
  // 7. PRE-CARGA PROACTIVA DE FRASES (BACKGROUND)
  // ==========================================

  public async preloadPhrases(phrases: string[]): Promise<void> {
    const apiKey = (import.meta as any).env?.VITE_GOOGLE_TTS_API_KEY;
    if (!apiKey || apiKey.includes('YourGcpApiKeyHere') || !Array.isArray(phrases) || phrases.length === 0) {
      return;
    }

    const config = AGE_VOICE_PROFILES[this.currentCohort];

    for (const phrase of phrases) {
      if (!phrase || !phrase.trim()) continue;
      const text = phrase.trim();
      const cacheKey = this.getCacheKey(text, config);

      try {
        const cached = await this.getFromCache(cacheKey);
        if (cached) continue;

        const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text },
            voice: {
              languageCode: config.languageCode,
              name: config.name,
              ssmlGender: config.ssmlGender
            },
            audioConfig: {
              audioEncoding: 'MP3',
              pitch: config.pitch,
              speakingRate: config.speakingRate
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
  // 8. ESCUCHA ACTIVA & PARSING DE COMANDOS
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

