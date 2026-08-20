import type { VoiceCommandResult } from '../types/zentry';

export class VoiceSpeechService {
  private recognition: any = null;
  private isListening: boolean = false;

  constructor() {
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

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public startListening(
    onResult: (result: VoiceCommandResult) => void,
    onError: (error: string) => void
  ) {
    if (!this.recognition) {
      onError('Reconocimiento de voz no soportado');
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

  public speakFeedback(text: string) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-PE';
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  }
}

export const voiceService = new VoiceSpeechService();
