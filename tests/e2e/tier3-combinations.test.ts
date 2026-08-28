/**
 * Tier 3: Cross-Feature Combinations E2E Test Suite
 * Tests multi-feature interactions, pipeline handoffs, and synchronized state transitions (12 tests).
 */

import { describe, it, expect, beforeEach, setTier } from './test-harness';
import {
  VoiceSpeechService,
  VOICE_PERSONAS,
  type VoicePersona,
  type TTSVoiceConfig
} from '../../src/services/voiceSpeech';

setTier('Tier 3: Cross-Feature Combinations');

describe('Tier 3: Multi-Feature Combinations & State Pipelines', () => {
  let service: VoiceSpeechService;

  beforeEach(() => {
    (globalThis as any).localStorage.clear();
    (globalThis as any).indexedDB.reset();
    service = new VoiceSpeechService();
  });

  it('T3.1 [F5 + F3]: Text sanitization strips emojis and vocatives before SSML prosody generation and XML escaping', () => {
    const raw = '¡Hola mi cielo! 🚀 Mira esto: A < B & C > D. ¿Listo para aprender? ✨ ¡Vamos!';
    const sanitized = service.sanitizeSpeechText(raw);
    const config = service.getVoiceConfig();
    const ssml = (service as any).buildNaturalSSML(sanitized, config);

    expect(ssml).not.toContain('mi cielo');
    expect(ssml).not.toContain('🚀');
    expect(ssml).not.toContain('✨');
    expect(ssml).toContain('&lt;');
    expect(ssml).toContain('&amp;');
    expect(ssml).toContain('&gt;');
    expect(ssml).toContain('<break time="120ms"/>'); // Question break for toddler/jovial
  });

  it('T3.2 [F2 + F3 + F6]: Custom acoustic calibration modifies SSML prosody tags and generates distinct cache keys', () => {
    service.setPersona('female_adult');
    service.saveCustomSettings({ pitchOffset: -0.4, rateMultiplier: 1.1, volumeGainDb: 1.5 });

    const config = service.getVoiceConfig();
    expect(config.pitch).toBe(-0.4); // 0.0 + (-0.4)
    expect(config.speakingRate).toBe(1.06); // 0.96 * 1.1 = 1.056 -> 1.06

    const ssml = (service as any).buildNaturalSSML('Lección de física cuántica.', config);
    expect(ssml).toContain('pitch="-0.4st"');
    expect(ssml).toContain('rate="106%"');

    const cacheKey = (service as any).getCacheKey('Lección de física cuántica.', config);
    expect(cacheKey).toContain('-0.4_1.06_1.5');
  });

  it('T3.3 [F1 + F6]: Rapid switching across genders enforces anti-gender inversion in offline fallback scoring', () => {
    // Elena (Female Adult) -> must select Female offline voice
    service.setPersona('female_adult');
    const femaleVoice = (service as any).getBestNaturalOfflineVoice('explorer', 'female_adult');
    expect(femaleVoice.name.toLowerCase()).toContain('elvira');

    // Carlos (Male Adult) -> must select Male offline voice
    service.setPersona('male_adult');
    const maleVoice = (service as any).getBestNaturalOfflineVoice('explorer', 'male_adult');
    expect(maleVoice.name.toLowerCase()).toContain('dario');

    // Sofía (Female Jovial) -> must select Female LatAm offline voice
    service.setPersona('female_jovial');
    const sofiaVoice = (service as any).getBestNaturalOfflineVoice('toddler', 'female_jovial');
    expect(sofiaVoice.name.toLowerCase()).toContain('dalia');
  });

  it('T3.4 [F7 + F8 + F6]: Dynamic Island greeting with custom calibration benefits from 0ms cache playback', async () => {
    service.setPersona('male_jovial');
    service.saveCustomSettings({ pitchOffset: 0.2 });

    let fetchCount = 0;
    const origFetch = globalThis.fetch;
    globalThis.fetch = async (url: any, init: any) => {
      if (String(url).includes('texttospeech.googleapis.com') && init?.body?.includes('Soy Lucas')) {
        fetchCount++;
      }
      return origFetch(url, init);
    };

    const greeting = '¡Ey! Soy Lucas. ¿Preparado para crear y superar retos geniales hoy?';
    await service.speakFeedback(greeting, { personaId: 'male_jovial' });
    expect(fetchCount).toBe(1);

    // Replay greeting from Dynamic Island -> 0ms cache hit
    await service.speakFeedback(greeting, { personaId: 'male_jovial' });
    expect(fetchCount).toBe(1); // Cached!

    globalThis.fetch = origFetch;
  });

  it('T3.5 [F1 + F6]: Offline network dropout during Socratic Mentor session applies deep contemplative offline pitch & rate', () => {
    service.setPersona('socratic_mentor');
    let capturedUtterance: any = null;

    const origSpeak = (globalThis as any).speechSynthesis.speak;
    (globalThis as any).speechSynthesis.speak = (utt: any) => {
      capturedUtterance = utt;
      origSpeak.call((globalThis as any).speechSynthesis, utt);
    };

    (service as any).speakOfflineFallback('¿Qué es la virtud según Sócrates?', { personaId: 'socratic_mentor' });

    expect(capturedUtterance).toBeDefined();
    expect(capturedUtterance.rate).toBeLessThan(0.80); // Socratic slow cadence (0.74)
    expect(capturedUtterance.pitch).toBeLessThan(0.70); // Deep voice (0.50 or 0.42)
  });

  it('T3.6 [F9 + F2 + F6]: Preload phrases under custom volume gain populate cache with calibrated keys', async () => {
    service.setPersona('socratic_mentor');
    service.saveCustomSettings({ volumeGainDb: 2.0 });

    await service.preloadPhrases(['Activando tu Tutora Socrática de Estudio.']);

    const config = service.getVoiceConfig();
    const key = (service as any).getCacheKey('Activando tu Tutora Socrática de Estudio.', config);
    const cachedBlob = await (service as any).getFromCache(key);

    expect(cachedBlob).toBeDefined();
    expect(cachedBlob).not.toBeNull();
  });

  it('T3.7 [F7 + F5 + F6]: Voice command parsing triggers sanitized AI QA response with high-fidelity synthesis', async () => {
    const cmd = service.parseVoiceCommand('abre la camara para escanear mi dibujo');
    expect(cmd.action).toBe('open_camera_tutor');
    expect(cmd.targetApp).toBe('camera_tutor');

    // Synthesis of AI response
    let played = false;
    (service as any).playAudioBlob = async () => {
      played = true;
    };

    await service.speakFeedback(cmd.aiResponse);
    expect(played).toBe(true);
  });

  it('T3.8 [F8 + F7 + F3]: Resetting acoustic defaults updates Dynamic Island voice playback and SSML prosody rate', () => {
    service.saveCustomSettings({ pitchOffset: 2.0, rateMultiplier: 1.5 });
    expect(service.getVoiceConfig().speakingRate).toBeGreaterThan(1.5);

    // Reset
    service.saveCustomSettings({ pitchOffset: 0, rateMultiplier: 1.0, volumeGainDb: 1.2 });
    service.setPersona('female_jovial');

    const config = service.getVoiceConfig();
    expect(config.pitch).toBe(0.8);
    expect(config.speakingRate).toBe(1.08);

    const ssml = (service as any).buildNaturalSSML('Hola Sofía.', config);
    expect(ssml).toContain('rate="108%"');
    expect(ssml).toContain('pitch="+0.8st"');
  });

  it('T3.9 [F1 + F4 + F3]: Cohort transition (toddler -> explorer) updates DSP profile, persona, and micro-pause intervals', () => {
    // Toddler
    service.setAgeProfile('toddler');
    expect(service.getPersona()).toBe('zentry_jovial');
    let ssml = (service as any).buildNaturalSSML('Uno, dos, tres.', service.getVoiceConfig());
    expect(ssml).toContain('<break time="60ms"/>'); // Toddler comma

    // Explorer
    service.setAgeProfile('explorer');
    expect(service.getPersona()).toBe('socratic_mentor');
    ssml = (service as any).buildNaturalSSML('Uno, dos, tres.', service.getVoiceConfig());
    expect(ssml).toContain('<break time="130ms"/>'); // Mentor comma
  });

  it('T3.10 [F6 + F1 + F4]: GCP Studio failure fallback maintains persona gender integrity and DSP effects profile', async () => {
    (globalThis as any).__simulateStudioQuotaError = true;
    let fallbackPayload: any = null;

    const origFetch = globalThis.fetch;
    globalThis.fetch = async (url: any, init: any) => {
      if (String(url).includes('texttospeech.googleapis.com')) {
        const body = JSON.parse(init.body);
        if (body.voice.name.includes('Studio')) {
          return {
            ok: false,
            status: 403,
            statusText: 'Studio voice restricted',
            json: async () => ({ error: { message: 'Quota error' } })
          };
        } else {
          fallbackPayload = body;
          return {
            ok: true,
            status: 200,
            json: async () => ({ audioContent: Buffer.from('RIFF_FALLBACK_AUDIO').toString('base64') })
          };
        }
      }
      return origFetch(url, init);
    };

    service.setPersona('female_adult'); // es-ES-Studio-C
    await service.speakFeedback('Prueba de fallback con DSP');

    expect(fallbackPayload).toBeDefined();
    expect(fallbackPayload.voice.name).toBe('es-US-Neural2-A');
    expect(fallbackPayload.voice.ssmlGender).toBe('FEMALE');
    expect(fallbackPayload.audioConfig.effectsProfileId).toEqual(['high-fidelity-headphone-class-device']);
    expect(fallbackPayload.audioConfig.sampleRateHertz).toBe(24000);

    globalThis.fetch = origFetch;
  });

  it('T3.11 [F3 + F2]: Multi-sentence Socratic dialogue with mixed punctuation preserves pause hierarchy under custom rate', () => {
    service.setPersona('socratic_mentor');
    service.saveCustomSettings({ rateMultiplier: 0.9 });

    const dialogue = 'Reflexiona sobre esto: ¿De dónde surge la curiosidad? ¡Es fascinante! Todo comienza con una pregunta, simple pero profunda. Continuemos.';
    const config = service.getVoiceConfig();
    const ssml = (service as any).buildNaturalSSML(dialogue, config);

    expect(ssml).toContain('rate="77%"'); // 0.86 * 0.9 = 0.774 -> 77%
    expect(ssml).toContain('<break time="260ms"/>'); // Question
    expect(ssml).toContain('<break time="180ms"/>'); // Exclamation
    expect(ssml).toContain('<break time="220ms"/>'); // Period
    expect(ssml).toContain('<break time="130ms"/>'); // Colon / Comma
  });

  it('T3.12 [F8 + F6]: Offline SpeechSynthesis fallback respects custom slider calibration offsets', () => {
    service.setPersona('female_adult');
    service.saveCustomSettings({ pitchOffset: 0.5, rateMultiplier: 1.2 });

    let utt: any = null;
    const origSpeak = (globalThis as any).speechSynthesis.speak;
    (globalThis as any).speechSynthesis.speak = (u: any) => {
      utt = u;
      origSpeak.call((globalThis as any).speechSynthesis, u);
    };

    (service as any).speakOfflineFallback('Prueba offline calibrada', { personaId: 'female_adult' });

    expect(utt).toBeDefined();
    expect(utt.pitch).toBeGreaterThan(0.96); // 0.96 + 0.05
    expect(utt.rate).toBeGreaterThan(1.0); // 0.94 * 1.2 = 1.128
  });
});
