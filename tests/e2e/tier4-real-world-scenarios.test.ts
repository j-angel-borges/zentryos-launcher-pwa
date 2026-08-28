/**
 * Tier 4: Real-World Application Scenarios E2E Test Suite
 * Simulates complete end-to-end user workflows, interactive tutoring dialogues,
 * parental security alerts, offline transitions, and cold boot preload lifecycles (6 scenarios).
 */

import { describe, it, expect, beforeEach, setTier } from './test-harness';
import {
  VoiceSpeechService,
  VOICE_PERSONAS,
  DEFAULT_PRELOAD_PHRASES,
  type VoicePersona
} from '../../src/services/voiceSpeech';

setTier('Tier 4: Real-World Workload Scenarios');

describe('Tier 4: Real-World Application Workloads', () => {
  let service: VoiceSpeechService;

  beforeEach(() => {
    (globalThis as any).localStorage.clear();
    (globalThis as any).indexedDB.reset();
    service = new VoiceSpeechService();
  });

  it('Scenario 1: Socratic Philosophical Tutoring Session with Maestro Aurelius', async () => {
    // 1. User selects Maestro Aurelius in Dynamic Island
    service.setPersona('socratic_mentor');
    expect(service.getPersona()).toBe('socratic_mentor');

    // 2. Maestro introduces himself with solemn contemplative greeting
    const greeting = 'Bienvenido. Soy el Maestro Aurelius. ¿Qué reto exploraremos paso a paso?';
    await service.speakFeedback(greeting, { personaId: 'socratic_mentor' });

    // 3. Student asks: "¿Por qué existen las estrellas?"
    const studentQuery = '¿Por qué existen las estrellas?';
    const parsed = service.parseVoiceCommand(studentQuery);
    expect(parsed.action).toBe('ai_qa');

    // 4. Socratic AI generates response with question and speaks it
    const aiResponse = 'Las estrellas nacen por el colapso gravitatorio de nubes de gas. ¿Qué crees que pasaría si la gravedad no existiera? Reflexionemos juntos.';
    const ssml = (service as any).buildNaturalSSML(aiResponse, service.getVoiceConfig());
    await service.speakFeedback(aiResponse);

    // 5. Verify contemplative pacing
    expect(ssml).toContain('<break time="260ms"/>'); // Question break
    expect(ssml).toContain('<break time="220ms"/>'); // Period break
    expect(ssml).toContain('pitch="-0.8st"');
    expect(ssml).toContain('rate="86%"');

    // 6. Student repeats the explanation -> 0ms cache replay
    let networkFetchTriggered = false;
    const origFetch = globalThis.fetch;
    globalThis.fetch = async (url: any, init: any) => {
      if (String(url).includes('texttospeech.googleapis.com') && init?.body?.includes('Las estrellas nacen')) {
        networkFetchTriggered = true;
      }
      return origFetch(url, init);
    };

    await service.speakFeedback(aiResponse);
    expect(networkFetchTriggered).toBe(false); // Served directly from IndexedDB!

    globalThis.fetch = origFetch;
  });

  it('Scenario 2: Rapid Interactive Youth Banter & Creative Challenge with Sofía and Lucas', async () => {
    // 1. Start with Sofía (Female Jovial) for art inspiration
    service.setPersona('female_jovial');
    const sofiaPrompt = '¡Hola! 🎨 Vamos a dibujar un dragón cósmico 🐉 en NeuroArt.';
    const cleanSofia = service.sanitizeSpeechText(sofiaPrompt);
    expect(cleanSofia).toBe('¡Hola! Vamos a dibujar un dragón cósmico en NeuroArt.');

    await service.speakFeedback(cleanSofia);
    const configSofia = service.getVoiceConfig();
    expect(configSofia.pitch).toBe(0.8); // +0.8st bright natural
    expect(configSofia.speakingRate).toBe(1.08); // 1.08x fast

    // 2. User transitions to Lucas (Male Jovial) for active physical mission
    service.setPersona('male_jovial');
    const lucasChallenge = '¡Ey! Soy Lucas. ¿Preparado para dar 5 saltos y encontrar un objeto circular? 🚀';
    const cleanLucas = service.sanitizeSpeechText(lucasChallenge);
    expect(cleanLucas).toBe('¡Ey! Soy Lucas. ¿Preparado para dar 5 saltos y encontrar un objeto circular?');

    await service.speakFeedback(cleanLucas);
    const configLucas = service.getVoiceConfig();
    expect(configLucas.pitch).toBe(0.4); // +0.4st dynamic natural
    expect(configLucas.speakingRate).toBe(1.06); // 1.06x energetic
    expect(configLucas.ssmlGender).toBe('MALE');
  });

  it('Scenario 3: Pedagogical Math & Science Lesson with Elena Valdés', async () => {
    // 1. User sets Elena Valdés
    service.setPersona('female_adult');
    expect(service.getPersona()).toBe('female_adult');

    // 2. Student scans math homework with camera
    const mathExplanation = 'Hola mi cielo. Observo una ecuación cuadrática: x^2 - 5x + 6 = 0. Resolvamos factorizando, cariño. ¿Cuáles dos números multiplicados dan 6 y sumados dan -5?';
    const cleanMath = service.sanitizeSpeechText(mathExplanation);

    // Verify complete removal of condescending vocatives
    expect(cleanMath).not.toContain('mi cielo');
    expect(cleanMath).not.toContain('cariño');
    expect(cleanMath).toContain('Observo una ecuación cuadrática');

    // 3. Synthesize pedagogical explanation
    const ssml = (service as any).buildNaturalSSML(cleanMath, service.getVoiceConfig());
    expect(ssml).toContain('<break time="160ms"/>'); // Adult period
    expect(ssml).toContain('<break time="80ms"/>'); // Adult comma
    expect(ssml).toContain('pitch="+0st"');
    expect(ssml).toContain('rate="96%"');
  });

  it('Scenario 4: Emergency Parental Notification & Security Alert with Carlos Mendoza', async () => {
    // 1. Carlos Mendoza active for parental security supervision
    service.setPersona('male_adult');
    expect(service.getPersona()).toBe('male_adult');

    // 2. Adjust volume gain in noisy environment via Settings
    service.saveCustomSettings({ volumeGainDb: 2.8, pitchOffset: -0.2 });

    const alertMessage = 'Atención parental. Se ha establecido el límite de tiempo diario para juegos. Guardando progreso.';
    const config = service.getVoiceConfig();
    expect(config.volumeGainDb).toBe(2.8);
    expect(config.pitch).toBe(-0.6); // -0.4 + (-0.2)

    let capturedAudioConfig: any = null;
    const origFetch = globalThis.fetch;
    globalThis.fetch = async (url: any, init: any) => {
      if (String(url).includes('texttospeech.googleapis.com')) {
        capturedAudioConfig = JSON.parse(init.body).audioConfig;
      }
      return origFetch(url, init);
    };

    await service.speakFeedback(alertMessage);
    expect(capturedAudioConfig.volumeGainDb).toBe(2.8);
    expect(capturedAudioConfig.effectsProfileId).toEqual(['high-fidelity-headphone-class-device']);

    globalThis.fetch = origFetch;
  });

  it('Scenario 5: Multi-Turn Bilingual Greeting, Offline Fallback Transition & 0ms Cache Replay', async () => {
    // 1. Online session: Speak greetings for all 5 personas
    const personas: VoicePersona[] = ['female_jovial', 'female_adult', 'male_jovial', 'male_adult', 'socratic_mentor'];
    for (const p of personas) {
      service.setPersona(p);
      await service.speakFeedback(`Hola, activando perfil de voz para ${p}`);
    }

    // 2. Network goes completely offline
    (globalThis as any).__simulateOfflineNetworkError = true;

    // 3. User speaks new offline prompt
    let offlineSpokenVoice: any = null;
    const origSpeak = (globalThis as any).speechSynthesis.speak;
    (globalThis as any).speechSynthesis.speak = (u: any) => {
      offlineSpokenVoice = u.voice;
      origSpeak.call((globalThis as any).speechSynthesis, u);
    };

    service.setPersona('female_adult');
    await service.speakFeedback('Continuando en modo fuera de línea con Elena.');
    expect(offlineSpokenVoice.name).toContain('Elvira'); // Pure female offline voice

    // 4. Network comes back online
    (globalThis as any).__simulateOfflineNetworkError = false;

    // 5. Replaying first greeting is served with 0ms latency from IndexedDB
    let fetchAttempted = false;
    const origFetch = globalThis.fetch;
    globalThis.fetch = async (url: any, init: any) => {
      fetchAttempted = true;
      return origFetch(url, init);
    };

    service.setPersona('female_jovial');
    await service.speakFeedback(`Hola, activando perfil de voz para female_jovial`);
    expect(fetchAttempted).toBe(false); // 0ms cached hit!

    globalThis.fetch = origFetch;
  });

  it('Scenario 6: Cold Boot, Autoplay Unlock & Proactive Background Preload Lifecycle', async () => {
    // 1. Cold boot initialization
    const coldService = new VoiceSpeechService();
    expect(coldService.getPersona()).toBe('zentry_jovial');

    // 2. First user interaction unlocks Web Audio & HTML5 Audio
    coldService.unlockAudioContext();
    expect((coldService as any).audioContext.state).toBe('running');

    // 3. Background preloading of 13 certified educational phrases
    await coldService.preloadPhrases(DEFAULT_PRELOAD_PHRASES);

    // 4. User navigates to Study Assistant and opens tool
    const studyPhrase = 'Activando tu Tutora Socrática de Estudio.';
    const config = coldService.getVoiceConfig();
    const cacheKey = (coldService as any).getCacheKey(studyPhrase, config);
    const cachedBlob = await (coldService as any).getFromCache(cacheKey);

    // Verify phrase is instantly ready in IndexedDB cache for 0ms delay
    expect(cachedBlob).toBeDefined();
    expect(cachedBlob).not.toBeNull();
  });
});
