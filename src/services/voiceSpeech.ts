import type { VoiceCommandResult } from '../types/zentry';

export type AgeCohort = 'toddler' | 'explorer';

export type VoicePersona = 
  | 'female_jovial' 
  | 'female_adult' 
  | 'male_jovial' 
  | 'male_adult' 
  | 'socratic_mentor'
  | 'zentry_jovial' 
  | 'toddler_sweet' 
  | 'companion_spark';

export interface TTSVoiceConfig {
  languageCode: string;
  name: string;
  ssmlGender: 'FEMALE' | 'MALE' | 'NEUTRAL';
  pitch: number; // Pitch en semitonos (-2.5 a +2.5)
  speakingRate: number; // 0.85 a 1.20
  volumeGainDb?: number; // 0.0 a 3.0
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
  edgeVoice?: string;
  gender: 'FEMALE' | 'MALE';
  defaultPitch: number;
  defaultRate: number;
  defaultGain: number;
}

export const VOICE_PERSONAS: Record<VoicePersona, VoicePersonaInfo> = {
  // 1. Femenina Juvenil / Amiga (Sofía)
  female_jovial: {
    id: 'female_jovial',
    name: 'Sofía Urbana (Amiga Juvenil)',
    description: 'Voz de amiga joven, alegre, dinámica, cercana y luminosa',
    cohort: 'toddler',
    gcpModel: 'es-US-Neural2-A',
    edgeVoice: 'es-MX-DaliaNeural',
    gender: 'FEMALE',
    defaultPitch: 0.8, // +0.8st juvenil y fresca natural (sin distorsión)
    defaultRate: 1.08, // 1.08x cadencia ágil y cercana
    defaultGain: 1.0
  },

  // 2. Femenina Adulta / Madre (Elena)
  female_adult: {
    id: 'female_adult',
    name: 'Elena Valdés (Madre / Adulta)',
    description: 'Voz adulta maternal, protectora, cálida, pedagógica y serena',
    cohort: 'explorer',
    gcpModel: 'es-ES-Studio-C',
    edgeVoice: 'es-ES-ElviraNeural',
    gender: 'FEMALE',
    defaultPitch: 0.0, // 0.0st tono natural humano de locutora de estudio
    defaultRate: 0.96, // 0.96x cadencia maternal, clara y pausada
    defaultGain: 0.9
  },

  // 3. Masculina Juvenil / Amigo (Lucas)
  male_jovial: {
    id: 'male_jovial',
    name: 'Lucas Vega (Amigo Juvenil)',
    description: 'Voz de amigo joven, aventurero, dinámico, entusiasta y espontáneo',
    cohort: 'toddler',
    gcpModel: 'es-US-Neural2-B',
    edgeVoice: 'es-MX-JorgeNeural',
    gender: 'MALE',
    defaultPitch: 0.4, // +0.4st tono natural de joven alegre
    defaultRate: 1.06, // 1.06x ritmo dinámico de juego
    defaultGain: 1.0
  },

  // 4. Masculina Adulta / Padre (Carlos)
  male_adult: {
    id: 'male_adult',
    name: 'Carlos Mendoza (Padre / Adulto)',
    description: 'Voz adulta paternal, barítono sobrio, protector, formal y seguro',
    cohort: 'explorer',
    gcpModel: 'es-ES-Studio-F',
    edgeVoice: 'es-ES-DarioNeural',
    gender: 'MALE',
    defaultPitch: -0.4, // -0.4st barítono natural maduro sin forzar pitch
    defaultRate: 0.94, // 0.94x ritmo templado, formal y seguro
    defaultGain: 1.0
  },

  // 5. Mentor Sabio / Anciano Socrático (Maestro Aurelius)
  socratic_mentor: {
    id: 'socratic_mentor',
    name: 'Maestro Aurelius (Mentor Sabio)',
    description: 'Voz de hombre sabio de edad avanzada, reflexivo, socrático y pausado',
    cohort: 'explorer',
    gcpModel: 'es-ES-Studio-F',
    edgeVoice: 'es-ES-AlvaroNeural',
    gender: 'MALE',
    defaultPitch: -0.8, // -0.8st solemne y reposado
    defaultRate: 0.86, // 0.86x cadencia filosófica con silencios meditativos
    defaultGain: 1.0
  },

  // Aliases retrocompatibles
  zentry_jovial: {
    id: 'zentry_jovial',
    name: 'Sofía Urbana (Femenina Jovial)',
    description: 'Voz femenina juvenil, fresca, luminosa y muy ágil sin fondo grave',
    cohort: 'toddler',
    gcpModel: 'es-US-Neural2-A',
    edgeVoice: 'es-MX-DaliaNeural',
    gender: 'FEMALE',
    defaultPitch: 2.2,
    defaultRate: 1.07,
    defaultGain: 1.2
  },
  toddler_sweet: {
    id: 'toddler_sweet',
    name: 'Sofía Dulce (Femenina Jovial)',
    description: 'Voz femenina suave, alegre y cariñosa para los más pequeños',
    cohort: 'toddler',
    gcpModel: 'es-US-Neural2-A',
    edgeVoice: 'es-MX-DaliaNeural',
    gender: 'FEMALE',
    defaultPitch: 2.6,
    defaultRate: 1.04,
    defaultGain: 1.2
  },
  companion_spark: {
    id: 'companion_spark',
    name: 'Lucas Vega (Masculino Jovial)',
    description: 'Voz masculina joven, enérgica y chispeante para retos y misiones',
    cohort: 'explorer',
    gcpModel: 'es-US-Neural2-B',
    edgeVoice: 'es-MX-JorgeNeural',
    gender: 'MALE',
    defaultPitch: 1.6,
    defaultRate: 1.06,
    defaultGain: 1.4
  }
};

export const AGE_VOICE_PROFILES: Record<AgeCohort, TTSVoiceConfig> = {
  toddler: {
    languageCode: 'es-US',
    name: 'es-US-Neural2-A',
    ssmlGender: 'FEMALE',
    pitch: 2.2,
    speakingRate: 1.07,
    volumeGainDb: 1.2,
    personaId: 'female_jovial'
  },
  explorer: {
    languageCode: 'es-ES',
    name: 'es-ES-Studio-F',
    ssmlGender: 'MALE',
    pitch: -1.2,
    speakingRate: 0.92,
    volumeGainDb: 1.0,
    personaId: 'socratic_mentor'
  }
};

export const DEFAULT_PRELOAD_PHRASES = [
  '¡Hola! Soy Zentry. ¡Vamos a descubrir algo genial hoy!',
  '¡Vamos a crear y dibujar cosas hermosas!',
  '¡Hora de videos divertidos, cuentos y música!',
  '¡Sonríe a la cámara, qué linda foto!',
  '¡Mira qué hora es!',
  'Abriendo el Escudo de Contenido y Algoritmo de Pasiones.',
  'Activando tu Tutora Socrática de Estudio.',
  'Iniciando Visión Artificial Multimodal para ver tu ejercicio.',
  'Abriendo NeuroArt Studio para plasmar tus ideas.',
  'Generando simulación de mundo interactivo.',
  'Abriendo Calculadora Científica Inteligente.',
  'Regresando a la pantalla principal.',
  'He procesado tu consulta. Vamos a resolverlo paso a paso juntas.'
];

const DB_NAME = 'zentry_tts_db';
const DB_VERSION = 1;
const STORE_NAME = 'audio_cache';

export class VoiceSpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentCohort: AgeCohort = 'toddler';
  private selectedPersona: VoicePersona = 'zentry_jovial';

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
  // SANITIZADOR DE TEXTO (0 EMOJIS & RESPETO)
  // ==========================================

  public sanitizeSpeechText(text: string): string {
    if (!text) return '';

    // 1. Filtrar todos los rangos Unicode de emojis, símbolos gráficos y emoticones
    let clean = text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticones
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Símbolos y pictogramas varios
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transporte y mapas
      .replace(/[\u{1F700}-\u{1F77F}]/gu, '') // Símbolos alquímicos
      .replace(/[\u{1F780}-\u{1F7FF}]/gu, '') // Formas geométricas extendidas
      .replace(/[\u{1F800}-\u{1F8FF}]/gu, '') // Flechas suplementarias
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Símbolos suplementarios
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Símbolos de ajedrez
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Pictogramas extendidos-A
      .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Símbolos varios (estrellas, destellos)
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
      .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Selectores de variación
      .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, '') // Banderas e indicadores regionales
      .replace(/[\u{200D}\u{200C}]/gu, '');   // Zero width joiners

    // 2. Eliminar apelativos condescendientes o excesivamente íntimos
    clean = clean
      .replace(/\b(mi cielo|mi amor|mi vida|mi corazón|mi reina|mi rey|mi princesa|mi príncipe|corazón|corazon|cariño|carino|bebé|bebe|tesoro|chiquito|chiquita)\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    return clean;
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
    this.selectedPersona = cohort === 'toddler' ? 'zentry_jovial' : 'socratic_mentor';
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
    const persona = VOICE_PERSONAS[this.selectedPersona] || VOICE_PERSONAS.zentry_jovial;
    const pitchOffset = this.customSettings.pitchOffset ?? 0;
    const rateMultiplier = this.customSettings.rateMultiplier ?? 1.0;
    const volumeGain = this.customSettings.volumeGainDb ?? persona.defaultGain;

    return {
      languageCode: persona.cohort === 'explorer' && persona.gcpModel.startsWith('es-ES') ? 'es-ES' : 'es-US',
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

    const persona = VOICE_PERSONAS[targetPersona || 'zentry_jovial'];

    return {
      languageCode: options?.languageCode || (persona.cohort === 'explorer' && persona.gcpModel.startsWith('es-ES') ? 'es-ES' : base.languageCode),
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

    const personaId = config.personaId || 'female_jovial';
    const isMentor = personaId === 'socratic_mentor';
    const isAdult = personaId === 'female_adult' || personaId === 'male_adult';

    // Delimiters adaptados acústicamente por persona
    const periodMs = isMentor ? '220ms' : isAdult ? '160ms' : '110ms';
    const commaMs = isMentor ? '130ms' : isAdult ? '80ms' : '60ms';
    const questionMs = isMentor ? '260ms' : isAdult ? '160ms' : '120ms';
    const exclamationMs = isMentor ? '180ms' : isAdult ? '130ms' : '110ms';

    // Insert natural conversational micro-pauses at punctuation marks
    const pacedText = escaped
      .replace(/\.\s+/g, `. <break time="${periodMs}"/> `)
      .replace(/!\s+/g, `! <break time="${exclamationMs}"/> `)
      .replace(/\?\s+/g, `? <break time="${questionMs}"/> `)
      .replace(/,\s+/g, `, <break time="${commaMs}"/> `)
      .replace(/:\s+/g, `: <break time="${commaMs}"/> `);

    const pitchStr = config.pitch >= 0 ? `+${config.pitch}st` : `${config.pitch}st`;
    const rateStr = `${Math.round(config.speakingRate * 100)}%`;

    return `<speak><prosody rate="${rateStr}" pitch="${pitchStr}">${pacedText}</prosody></speak>`;
  }

  public async speakFeedback(text: string, options?: SpeakOptions): Promise<void> {
    const sanitizedText = this.sanitizeSpeechText(text);
    if (!sanitizedText) return;

    this.stopSpeaking();

    const config = this.getEffectiveConfig(options);
    const cacheKey = this.getCacheKey(sanitizedText, config);

    // 1. Comprobar Caché IndexedDB (Latencia 0 ms)
    const cachedBlob = await this.getFromCache(cacheKey);
    if (cachedBlob) {
      await this.playAudioBlob(cachedBlob, options);
      return;
    }

    // 2. Obtener API Key de GCP (desde .env.local, localStorage o fallback corporativo activo)
    const envKey = (import.meta as any).env?.VITE_GOOGLE_TTS_API_KEY;
    const localKey = typeof window !== 'undefined' ? localStorage.getItem('zentry_tts_api_key') : null;
    const activeGcpKey = 'AIzaSyCXF0uagkcGmLkeAddmxSAKQ9SFHsWhDB4';
    const apiKey = (envKey && !envKey.includes('YourGcpApiKeyHere')) ? envKey : (localKey || activeGcpKey);

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
            volumeGainDb: config.volumeGainDb ?? 1.2,
            sampleRateHertz: 24000,
            effectsProfileId: ['high-fidelity-headphone-class-device']
          }
        }),
        signal
      });

      // If Studio voice is restricted or unavailable on some GCP quotas, gracefully try Neural2 with exact gender match
      if (!response.ok && config.name.includes('Studio')) {
        const isFem = config.ssmlGender === 'FEMALE';
        const fallbackVoice = isFem ? 'es-US-Neural2-A' : 'es-US-Neural2-B';
        const fallbackLang = 'es-US';
        response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { ssml },
            voice: {
              languageCode: fallbackLang,
              name: fallbackVoice,
              ssmlGender: isFem ? 'FEMALE' : 'MALE'
            },
            audioConfig: {
              audioEncoding: 'MP3',
              pitch: config.pitch,
              speakingRate: config.speakingRate,
              volumeGainDb: config.volumeGainDb ?? 1.2,
              sampleRateHertz: 24000,
              effectsProfileId: ['high-fidelity-headphone-class-device']
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
    const targetEdgeVoice = persona?.edgeVoice?.toLowerCase();

    // Filter Spanish voices
    const spanishVoices = voices.filter(
      (v) => v.lang.startsWith('es') || v.lang.startsWith('ES') || v.lang.includes('es-')
    );

    if (spanishVoices.length === 0) {
      return voices[0] || null;
    }

    const FEMALE_NAMES = ['dalia', 'paloma', 'elvira', 'beatriz', 'carlota', 'valeria', 'monica', 'paulina', 'helena', 'sabina', 'lucia', 'laura', 'mia', 'hilda', 'female', 'mujer', 'femenina'];
    const MALE_NAMES = ['jorge', 'alvaro', 'dario', 'nil', 'valerio', 'tristan', 'pablo', 'raul', 'alonso', 'mateo', 'david', 'male', 'hombre', 'masculino'];

    // Strict gender filtering to prevent gender inversion
    const genderPureVoices = spanishVoices.filter((v) => {
      const name = v.name.toLowerCase();
      if (isFemale) {
        return !MALE_NAMES.some((m) => name.includes(m));
      } else {
        return !FEMALE_NAMES.some((f) => name.includes(f));
      }
    });

    const candidateVoices = genderPureVoices.length > 0 ? genderPureVoices : spanishVoices;

    // Score voices according to neural/natural quality and persona alignment
    const scored = candidateVoices.map((voice) => {
      let score = 0;
      const name = voice.name.toLowerCase();

      // Direct match with persona target Edge / Natural Voice
      if (targetEdgeVoice && name.includes(targetEdgeVoice)) score += 500;

      // Top priority: Modern Edge/Chrome Natural Neural Voices
      if (name.includes('natural') || name.includes('online')) score += 300;
      if (name.includes('neural')) score += 250;
      if (name.includes('google') && name.includes('español')) score += 180;

      // Gender affinity reinforcement
      if (isFemale) {
        if (FEMALE_NAMES.some((f) => name.includes(f))) score += 150;
        if (MALE_NAMES.some((m) => name.includes(m))) score -= 2000;
      } else {
        if (MALE_NAMES.some((m) => name.includes(m))) score += 150;
        if (FEMALE_NAMES.some((f) => name.includes(f))) score -= 2000;
      }

      // Latin American preference for dynamic cadence
      if (voice.lang.includes('MX') || voice.lang.includes('US') || voice.lang.includes('PE') || voice.lang.includes('CO')) {
        score += 40;
      }

      // Penalize legacy robotic Desktop voices
      if (name.includes('desktop') || name.includes('mobile') || name.includes('sabina') || name.includes('helena')) {
        score -= 300;
      }

      return { voice, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.voice || candidateVoices[0] || spanishVoices[0] || null;
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

      // Calibrate distinct pitch & rate per persona
      const pId = config.personaId || this.selectedPersona || 'female_jovial';
      const MALE_INDICATORS = ['jorge', 'alvaro', 'dario', 'nil', 'valerio', 'tristan', 'pablo', 'raul', 'alonso', 'mateo', 'david', 'male', 'hombre'];
      const voiceIsActuallyMale = naturalVoice ? MALE_INDICATORS.some((m) => naturalVoice.name.toLowerCase().includes(m)) : false;

      let basePitch = 1.0;
      let baseRate = 1.0;

      if (pId === 'female_jovial' || pId === 'zentry_jovial' || pId === 'toddler_sweet') {
        // Sofía: Aguda, juvenil, chispeante y rápida
        basePitch = voiceIsActuallyMale ? 1.65 : 1.40;
        baseRate = 1.15;
      } else if (pId === 'female_adult') {
        // Elena: Femenina madura, tono medio cálido, dicción pausada y profesional
        basePitch = voiceIsActuallyMale ? 1.25 : 0.96;
        baseRate = 0.94;
      } else if (pId === 'male_jovial' || pId === 'companion_spark') {
        // Lucas: Masculino joven, dinámico, enérgico y vivaz
        basePitch = voiceIsActuallyMale ? 1.15 : 0.78;
        baseRate = 1.12;
      } else if (pId === 'male_adult') {
        // Carlos: Masculino maduro, barítono profundo, sobrio y firme
        basePitch = voiceIsActuallyMale ? 0.65 : 0.52;
        baseRate = 0.88;
      } else if (pId === 'socratic_mentor') {
        // Maestro Aurelius: Anciano, ultra grave, lento y reflexivo
        basePitch = voiceIsActuallyMale ? 0.50 : 0.42;
        baseRate = 0.74;
      }

      utterance.pitch = Math.min(2.0, Math.max(0.3, basePitch + (this.customSettings.pitchOffset ?? 0) * 0.1));
      utterance.rate = Math.min(2.0, Math.max(0.4, baseRate * (this.customSettings.rateMultiplier ?? 1.0)));

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
    const activeGcpKey = 'AIzaSyCXF0uagkcGmLkeAddmxSAKQ9SFHsWhDB4';
    const apiKey = (envKey && !envKey.includes('YourGcpApiKeyHere')) ? envKey : (localKey || activeGcpKey);

    if (!apiKey || apiKey.trim() === '' || !Array.isArray(phrases) || phrases.length === 0) {
      return;
    }

    const config = this.getVoiceConfig();

    for (const phrase of phrases) {
      if (!phrase) continue;
      const text = this.sanitizeSpeechText(phrase);
      if (!text) continue;
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
              volumeGainDb: config.volumeGainDb ?? 1.2,
              sampleRateHertz: 24000,
              effectsProfileId: ['high-fidelity-headphone-class-device']
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

