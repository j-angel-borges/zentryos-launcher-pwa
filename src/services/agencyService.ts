import { askZentryAi } from './aiService';
import { voiceService } from './voiceSpeech';
import type { ScreenId, AgeTier } from '../types/zentry';

export interface AgencyMemoryEntry {
  id: string;
  timestamp: string;
  type: 'action' | 'ai_thought' | 'recommendation' | 'user_voice';
  content: string;
  metadata?: {
    app?: string;
    mediaTitle?: string;
    category?: string;
    durationMinutes?: number;
  };
}

export interface CreativeIntervention {
  id: string;
  title: string;
  speechText: string;
  explanation: string;
  targetActivity: 'drawing' | 'real_world_craft' | 'world_mission' | 'camera_explore' | 'study';
  targetScreen: ScreenId;
  actionButtonLabel: string;
  timestamp: string;
}

export interface AgencyState {
  isActive: boolean;
  startedAt: number | null;
  currentApp: ScreenId;
  activeMediaTitle: string | null;
  activeMediaCategory: string | null;
  elapsedSecondsOnMedia: number;
  memoryLogs: AgencyMemoryEntry[];
  currentIntervention: CreativeIntervention | null;
}

class AgencyService {
  private state: AgencyState = {
    isActive: true, // Enabled by default for active attention governance
    startedAt: Date.now(),
    currentApp: 'launcher',
    activeMediaTitle: null,
    activeMediaCategory: null,
    elapsedSecondsOnMedia: 0,
    memoryLogs: [
      {
        id: 'mem-init',
        timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        type: 'action',
        content: 'Sesión de atención ZentryOS iniciada. Tutor proactivo observando el entorno.'
      }
    ],
    currentIntervention: null
  };

  private listeners: Array<(state: AgencyState) => void> = [];
  private tickerInterval: any = null;

  constructor() {
    this.startTicker();
  }

  public subscribe(listener: (state: AgencyState) => void): () => void {
    this.listeners.push(listener);
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const s = this.getState();
    this.listeners.forEach((fn) => fn(s));
  }

  public getState(): AgencyState {
    return { ...this.state, memoryLogs: [...this.state.memoryLogs] };
  }

  public toggleAgency(forceState?: boolean): boolean {
    const next = forceState !== undefined ? forceState : !this.state.isActive;
    this.state.isActive = next;
    if (next) {
      this.state.startedAt = Date.now();
      this.addMemoryLog(
        'action',
        'Agencia Zentry activada. El sistema interactúa proactivamente para guiar la atención.'
      );
    } else {
      this.addMemoryLog('action', 'Agencia Zentry pausada.');
      this.state.currentIntervention = null;
    }
    this.notify();
    return this.state.isActive;
  }

  public setApp(screen: ScreenId) {
    if (this.state.currentApp === screen) return;
    this.state.currentApp = screen;
    this.addMemoryLog('action', `El usuario abrió la aplicación: ${screen}`);
    this.notify();
  }

  public onMediaStarted(title: string, category: string, screen: ScreenId) {
    this.state.activeMediaTitle = title;
    this.state.activeMediaCategory = category;
    this.state.elapsedSecondsOnMedia = 0;
    this.state.currentApp = screen;

    this.addMemoryLog(
      'action',
      `Inicio de reproducción de video: "${title}" (Categoría: ${category}).`,
      { mediaTitle: title, category, app: screen }
    );
    this.notify();
  }

  public onMediaStopped() {
    if (this.state.activeMediaTitle) {
      this.addMemoryLog(
        'action',
        `Finalizó o pausó el video: "${this.state.activeMediaTitle}" tras ${Math.round(
          this.state.elapsedSecondsOnMedia / 60
        )} min.`
      );
    }
    this.state.activeMediaTitle = null;
    this.state.activeMediaCategory = null;
    this.state.elapsedSecondsOnMedia = 0;
    this.notify();
  }

  public addMemoryLog(
    type: AgencyMemoryEntry['type'],
    content: string,
    metadata?: AgencyMemoryEntry['metadata']
  ) {
    const entry: AgencyMemoryEntry = {
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      type,
      content,
      metadata
    };
    // Keep max 40 memory logs in sliding window
    this.state.memoryLogs = [...this.state.memoryLogs.slice(-39), entry];
    this.notify();
  }

  public clearIntervention() {
    this.state.currentIntervention = null;
    this.notify();
  }

  // Proactive trigger to transition from screen consumption to real-world creation
  public async generateCreativeIntervention(
    ageTier: AgeTier = 'toddler',
    customTopic?: string
  ): Promise<CreativeIntervention> {
    const topic = customTopic || this.state.activeMediaTitle || 'Ciencia, Naturaleza y Creatividad';
    const category = this.state.activeMediaCategory || 'Creatividad General';

    // Local fast fallback if offline/rate-limited
    const isToddler = ageTier === 'toddler';
    const defaultIntervention: CreativeIntervention = isToddler
      ? {
          id: `interv-${Date.now()}`,
          title: '¡Hora de Crear en la Vida Real!',
          speechText: '¡Qué lindo video! Ahora vamos a dibujar lo que más te gustó.',
          explanation: `Has aprendido sobre ${topic}. ¡Toma tus colores y dibújalo en tu cuaderno o en NeuroArt!`,
          targetActivity: 'drawing',
          targetScreen: 'neuro_art',
          actionButtonLabel: '¡Vamos a Dibujar! 🎨',
          timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
        }
      : {
          id: `interv-${Date.now()}`,
          title: 'Reto: Del Video a la Realidad',
          speechText: `Terminamos la teoría sobre ${category}. Es hora de construir una maqueta o dibujar tu hipótesis.`,
          explanation: `El video "${topic}" mostró conceptos clave. Diseña tu propia versión o simulación en el estudio.`,
          targetActivity: 'world_mission',
          targetScreen: 'world_generator',
          actionButtonLabel: 'Comenzar Misión Práctica 🚀',
          timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
        };

    try {
      const prompt = `Eres el Cerebro de Gobernanza de Atención de ZentryOS.
El estudiante (${ageTier === 'toddler' ? '2 a 5 años' : '5 a 10+ años'}) ha estado consumiendo este contenido: "${topic}" (${category}).
Tu misión sagrada es TRANSFORMAR EL CONSUMO PASIVO DE PANTALLA EN CREACIÓN ACTIVA EN EL MUNDO REAL (dibujar con lápices, buscar objetos en casa, modelar plastilina o resolver un reto).

REGLAS DE VOZ Y TONO:
- En "speechText": Frase corta para decirle por voz (máximo 2 oraciones). Responde en TEXTO PLANO LIMPIO. ESTRICTAMENTE PROHIBIDO usar emojis o símbolos.
- NO uses apelativos o diminutivos como corazón, mi cielo, mi amor, cariño, bebé, etc. Mantén un trato respetuoso, amigable, jovial y motivador.

Genera un JSON con esta estructura:
{
  "title": "Título llamativo y motivador",
  "speechText": "Frase corta para decirle por voz en texto puro sin emojis",
  "explanation": "Propuesta de cómo llevar lo visto a la vida real o al lienzo creativo",
  "targetActivity": "${isToddler ? 'drawing' : 'world_mission'}",
  "targetScreen": "${isToddler ? 'neuro_art' : 'world_generator'}",
  "actionButtonLabel": "Texto para botón de acción (ej: Vamos a Dibujar)"
}`;

      const raw = await askZentryAi('general_ai', prompt);
      const clean = raw.trim().replace(/^```json/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(clean);

      const intervention: CreativeIntervention = {
        id: `interv-${Date.now()}`,
        title: parsed.title || defaultIntervention.title,
        speechText: parsed.speechText || defaultIntervention.speechText,
        explanation: parsed.explanation || defaultIntervention.explanation,
        targetActivity: parsed.targetActivity || defaultIntervention.targetActivity,
        targetScreen: (parsed.targetScreen as ScreenId) || defaultIntervention.targetScreen,
        actionButtonLabel: parsed.actionButtonLabel || defaultIntervention.actionButtonLabel,
        timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
      };

      this.state.currentIntervention = intervention;
      this.addMemoryLog(
        'recommendation',
        `Intervención de Gobernanza: "${intervention.title}" -> Sugiriendo pasar a la creación real.`
      );
      this.notify();

      // Speak feedback
      voiceService.speakFeedback(intervention.speechText);

      return intervention;
    } catch (e) {
      console.warn('Intervention generation error, using curated template:', e);
      this.state.currentIntervention = defaultIntervention;
      this.addMemoryLog(
        'recommendation',
        `Intervención de Gobernanza: "${defaultIntervention.title}" -> Sugiriendo pasar a la creación real.`
      );
      this.notify();
      voiceService.speakFeedback(defaultIntervention.speechText);
      return defaultIntervention;
    }
  }

  // Ticker that monitors media consumption and triggers proactive intervention after continuous watch
  private startTicker() {
    if (this.tickerInterval) clearInterval(this.tickerInterval);
    this.tickerInterval = setInterval(() => {
      if (!this.state.isActive) return;

      if (this.state.activeMediaTitle) {
        this.state.elapsedSecondsOnMedia += 1;

        // Auto-intervene after 180 seconds (3 mins) of continuous video playback for demonstration
        if (
          this.state.elapsedSecondsOnMedia === 180 &&
          !this.state.currentIntervention
        ) {
          this.generateCreativeIntervention('toddler', this.state.activeMediaTitle);
        }
      }
    }, 1000);
  }
}

export const agencyService = new AgencyService();
