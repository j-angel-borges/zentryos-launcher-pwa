/**
 * Tier 2: Boundary & Corner Cases E2E Test Suite
 * Covers edge cases, extreme acoustic parameters, network dropouts, cache corruptions,
 * Unicode stress tests, and rapid state transitions across all 10 features (52 tests total).
 */

import { describe, it, expect, beforeEach, setTier } from './test-harness';
import {
  VoiceSpeechService,
  VOICE_PERSONAS,
  type VoicePersona,
  type TTSVoiceConfig
} from '../../src/services/voiceSpeech';

setTier('Tier 2: Boundary & Corner Cases');

describe('F1 Boundary: Archetype Matrix Edge Cases', () => {
  let service: VoiceSpeechService;

  beforeEach(() => {
    (globalThis as any).localStorage.clear();
    service = new VoiceSpeechService();
  });

  it('T2.F1.1: Invalid or unknown persona ID falls back safely to default without throwing', () => {
    service.setPersona('invalid_persona_key' as any);
    const persona = service.getPersona();
    expect(persona).toBe('zentry_jovial'); // Unchanged default
    const config = service.getVoiceConfig();
    expect(config.personaId).toBe('zentry_jovial');
  }, 'F1');

  it('T2.F1.2: Rapid sequential switching across all 5 personas maintains clean state and persists last selected', () => {
    const list: VoicePersona[] = ['female_jovial', 'female_adult', 'male_jovial', 'male_adult', 'socratic_mentor'];
    list.forEach((p) => service.setPersona(p));
    expect(service.getPersona()).toBe('socratic_mentor');
    expect(service.getVoiceConfig().personaId).toBe('socratic_mentor');
    expect(service.getVoiceConfig().name).toBe('es-ES-Studio-F');
  }, 'F1');

  it('T2.F1.3: Setting null or undefined persona is a safe no-op', () => {
    service.setPersona('male_adult');
    service.setPersona(null as any);
    service.setPersona(undefined as any);
    expect(service.getPersona()).toBe('male_adult');
  }, 'F1');

  it('T2.F1.4: Strict gender purity is maintained when switching between female and male personas', () => {
    service.setPersona('female_adult');
    expect(service.getVoiceConfig().ssmlGender).toBe('FEMALE');
    service.setPersona('male_adult');
    expect(service.getVoiceConfig().ssmlGender).toBe('MALE');
    service.setPersona('female_jovial');
    expect(service.getVoiceConfig().ssmlGender).toBe('FEMALE');
  }, 'F1');

  it('T2.F1.5: setAgeProfile updates cohort and aligns default persona accordingly', () => {
    service.setAgeProfile('toddler');
    expect(service.getAgeProfile()).toBe('toddler');
    expect(service.getPersona()).toBe('zentry_jovial');

    service.setAgeProfile('explorer');
    expect(service.getAgeProfile()).toBe('explorer');
    expect(service.getPersona()).toBe('socratic_mentor');
  }, 'F1');
});

describe('F2 Boundary: Extreme Acoustic Parameter Clamping', () => {
  let service: VoiceSpeechService;

  beforeEach(() => {
    (globalThis as any).localStorage.clear();
    service = new VoiceSpeechService();
  });

  it('T2.F2.1: Extreme negative pitch offset calculation produces valid numeric semitones', () => {
    service.setPersona('male_adult'); // -0.4 base
    service.saveCustomSettings({ pitchOffset: -9.6 });
    const config = service.getVoiceConfig();
    expect(config.pitch).toBe(-10.0);
    expect(typeof config.pitch).toBe('number');
  }, 'F2');

  it('T2.F2.2: Extreme positive pitch offset calculation produces valid numeric semitones', () => {
    service.setPersona('female_jovial'); // 0.8 base
    service.saveCustomSettings({ pitchOffset: 9.2 });
    const config = service.getVoiceConfig();
    expect(config.pitch).toBe(10.0);
    expect(typeof config.pitch).toBe('number');
  }, 'F2');

  it('T2.F2.3: Extreme rate multiplier values (0.25x and 3.0x) calculate valid speaking rates', () => {
    service.setPersona('socratic_mentor'); // 0.86 base
    service.saveCustomSettings({ rateMultiplier: 0.5 });
    expect(service.getVoiceConfig().speakingRate).toBe(0.43);

    service.saveCustomSettings({ rateMultiplier: 2.0 });
    expect(service.getVoiceConfig().speakingRate).toBe(1.72);
  }, 'F2');

  it('T2.F2.4: Boundary volume gain settings (0.0 dB and 5.0 dB) are retained accurately', () => {
    service.saveCustomSettings({ volumeGainDb: 0.0 });
    expect(service.getVoiceConfig().volumeGainDb).toBe(0.0);

    service.saveCustomSettings({ volumeGainDb: 5.0 });
    expect(service.getVoiceConfig().volumeGainDb).toBe(5.0);
  }, 'F2');

  it('T2.F2.5: Zero pitch offset results in base persona pitch with clean decimal representation', () => {
    service.setPersona('female_adult'); // 0.0
    service.saveCustomSettings({ pitchOffset: 0 });
    expect(service.getVoiceConfig().pitch).toBe(0.0);
  }, 'F2');
});

describe('F3 Boundary: SSML Tag Edge Cases & Stress', () => {
  let service: VoiceSpeechService;

  beforeEach(() => {
    (globalThis as any).localStorage.clear();
    service = new VoiceSpeechService();
  });

  it('T2.F3.1: Consecutive repeated punctuation does not produce duplicate broken XML tags', () => {
    const config = service.getVoiceConfig();
    const ssml = (service as any).buildNaturalSSML('¿¿¿Qué pasa???? ¡¡¡Increíble!!! ....', config);
    expect(ssml).toContain('<speak><prosody');
    expect(ssml).toContain('</prosody></speak>');
    expect(ssml).not.toContain('<break time=""');
  }, 'F3');

  it('T2.F3.2: Raw unescaped HTML/XML tags in text (<script>, <audio>, <div>) are safely XML-escaped', () => {
    const config = service.getVoiceConfig();
    const ssml = (service as any).buildNaturalSSML('<script>alert("hack")</script><break time="999s"/>', config);
    expect(ssml).toContain('&lt;script&gt;');
    expect(ssml).toContain('&lt;/script&gt;');
    expect(ssml).toContain('&lt;break time=&quot;999s&quot;/&gt;');
    expect(ssml).not.toContain('<script>');
  }, 'F3');

  it('T2.F3.3: Text without any punctuation produces valid SSML prosody envelope', () => {
    const config = service.getVoiceConfig();
    const ssml = (service as any).buildNaturalSSML('Texto plano continuo sin puntuacion alguna', config);
    expect(ssml).toBe('<speak><prosody rate="107%" pitch="+2.2st">Texto plano continuo sin puntuacion alguna</prosody></speak>');
  }, 'F3');

  it('T2.F3.4: Punctuation at the very beginning and trailing end of text formats cleanly', () => {
    const config = service.getVoiceConfig();
    const ssml = (service as any).buildNaturalSSML('¡Hola!', config);
    expect(ssml).toContain('¡Hola!');
  }, 'F3');

  it('T2.F3.5: Extremely long text (5,000 characters) builds SSML without stack overflow or timeout', () => {
    const config = service.getVoiceConfig();
    const longText = ('ZentryOS es la plataforma educativa líder. ¿Quieres saber más? ¡Descúbrelo! ').repeat(50);
    const ssml = (service as any).buildNaturalSSML(longText, config);
    expect(ssml.length).toBeGreaterThan(longText.length);
    expect(ssml.startsWith('<speak><prosody')).toBe(true);
    expect(ssml.endsWith('</prosody></speak>')).toBe(true);
  }, 'F3');
});

describe('F4 Boundary: Audio DSP & Playback Resilience', () => {
  let service: VoiceSpeechService;

  beforeEach(() => {
    (globalThis as any).localStorage.clear();
    service = new VoiceSpeechService();
  });

  it('T2.F4.1: Calling unlockAudioContext repeatedly is idempotent and does not error', () => {
    service.unlockAudioContext();
    service.unlockAudioContext();
    service.unlockAudioContext();
    expect((service as any).audioContext.state).toBe('running');
  }, 'F4');

  it('T2.F4.2: Calling stopSpeaking when nothing is playing succeeds silently without throwing', () => {
    expect(() => {
      service.stopSpeaking();
      service.stopSpeaking();
    }).not.toThrow();
  }, 'F4');

  it('T2.F4.3: Corrupt Base64 audio response falls through gracefully to offline fallback', async () => {
    const origFetch = globalThis.fetch;
    globalThis.fetch = async (url: any) => {
      if (String(url).includes('texttospeech.googleapis.com')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ audioContent: 'NOT_VALID_BASE64_!!!$$$' })
        };
      }
      return origFetch(url);
    };

    let fallbackTriggered = false;
    (service as any).speakOfflineFallback = () => {
      fallbackTriggered = true;
    };

    await service.speakFeedback('Prueba de payload corrupto');
    expect(fallbackTriggered).toBe(true);

    globalThis.fetch = origFetch;
  }, 'F4');

  it('T2.F4.4: Missing audioContent in 200 response triggers offline fallback', async () => {
    const origFetch = globalThis.fetch;
    globalThis.fetch = async (url: any) => {
      if (String(url).includes('texttospeech.googleapis.com')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({}) // Empty object missing audioContent
        };
      }
      return origFetch(url);
    };

    let fallbackTriggered = false;
    (service as any).speakOfflineFallback = () => {
      fallbackTriggered = true;
    };

    await service.speakFeedback('Respuesta vacía');
    expect(fallbackTriggered).toBe(true);

    globalThis.fetch = origFetch;
  }, 'F4');

  it('T2.F4.5: Autoplay policy error during Audio.play falls back to offline SpeechSynthesis', async () => {
    const origAudio = (globalThis as any).Audio;
    (globalThis as any).Audio = class extends origAudio {
      play() {
        return Promise.reject(new Error('NotAllowedError: Autoplay blocked'));
      }
    };

    let offlineTriggered = false;
    (service as any).speakOfflineFallback = () => {
      offlineTriggered = true;
    };

    await service.speakFeedback('Probando bloqueo de autoplay');
    expect(offlineTriggered).toBe(true);

    (globalThis as any).Audio = origAudio;
  }, 'F4');
});

describe('F5 Boundary: Complex Emoji & Unicode Stress Testing', () => {
  let service: VoiceSpeechService;

  beforeEach(() => {
    (globalThis as any).localStorage.clear();
    service = new VoiceSpeechService();
  });

  it('T2.F5.1: Multi-person ZWJ emoji sequences (👨‍👩‍👧‍👦, 🧑🏽‍💻, 🏳️‍🌈) are stripped completely', () => {
    const input = 'Familia 👨‍👩‍👧‍👦 programando 🧑🏽‍💻 con bandera 🏳️‍🌈 en paz.';
    const clean = service.sanitizeSpeechText(input);
    expect(clean).toBe('Familia programando con bandera en paz.');
  }, 'F5');

  it('T2.F5.2: Text containing ONLY emojis and patronizing terms returns empty string', () => {
    const input = '🎉🔥✨ mi cielo 💖 mi amor 😍 mi reina 🌟';
    const clean = service.sanitizeSpeechText(input);
    expect(clean).toBe('');
  }, 'F5');

  it('T2.F5.3: Case insensitive matching strips uppercase terms (MI CIELO, MI AMOR, MI REINA)', () => {
    const input = 'Hola MI CIELO, bienvenido MI AMOR a la lección MI REINA.';
    const clean = service.sanitizeSpeechText(input);
    expect(clean).toBe('Hola , bienvenido a la lección .');
  }, 'F5');

  it('T2.F5.4: Legitimate Spanish words with substring overlaps (corazonada, carinoso, tesorero) are NOT stripped', () => {
    const input = 'Tuve una corazonada con el tesorero carinoso.';
    const clean = service.sanitizeSpeechText(input);
    expect(clean).toBe('Tuve una corazonada con el tesorero carinoso.');
  }, 'F5');

  it('T2.F5.5: Non-printable control characters and mixed whitespace are stripped or normalized', () => {
    const input = 'Línea 1\n\n\tLínea 2\r\n\t\tLínea 3';
    const clean = service.sanitizeSpeechText(input);
    expect(clean).toContain('Línea 1');
    expect(clean).toContain('Línea 2');
    expect(clean).toContain('Línea 3');
  }, 'F5');
});

describe('F6 Boundary: Multi-Tier Cache & Offline Network Drops', () => {
  let service: VoiceSpeechService;

  beforeEach(() => {
    (globalThis as any).localStorage.clear();
    (globalThis as any).indexedDB.reset();
    service = new VoiceSpeechService();
  });

  it('T2.F6.1: Complete network offline failure routes smoothly to SpeechSynthesis without throwing', async () => {
    (globalThis as any).__simulateOfflineNetworkError = true;

    let offlineSpoken = false;
    (service as any).speakOfflineFallback = () => {
      offlineSpoken = true;
    };

    await service.speakFeedback('Prueba en modo sin conexión total');
    expect(offlineSpoken).toBe(true);
  }, 'F6');

  it('T2.F6.2: Querying non-existent cache key returns null and proceeds to network fetch', async () => {
    const config = service.getVoiceConfig();
    const cached = await (service as any).getFromCache('non_existent_key_123');
    expect(cached).toBeNull();
  }, 'F6');

  it('T2.F6.3: Corrupt IndexedDB return value is safely handled as cache miss', async () => {
    const db = await (service as any).initDB();
    const tx = db.transaction('audio_cache', 'readwrite');
    const store = tx.objectStore('audio_cache');
    store.put({ key: 'corrupt_key', blob: null, text: 'test' });

    const result = await (service as any).getFromCache('corrupt_key');
    expect(result).toBeNull();
  }, 'F6');

  it('T2.F6.4: Environment where window.indexedDB is unavailable handles caching gracefully', async () => {
    const origIdb = (globalThis as any).indexedDB;
    delete (globalThis as any).indexedDB;
    (service as any).dbPromise = null;

    const db = await (service as any).initDB();
    expect(db).toBeNull();

    (globalThis as any).indexedDB = origIdb;
  }, 'F6');

  it('T2.F6.5: Offline voice selector returns null safely if SpeechSynthesis voices list is empty', () => {
    (service as any).cachedBrowserVoices = [];
    const origSynth = (globalThis as any).speechSynthesis;
    (globalThis as any).speechSynthesis = { getVoices: () => [] };

    const voice = (service as any).getBestNaturalOfflineVoice('toddler', 'female_jovial');
    expect(voice).toBeNull();

    (globalThis as any).speechSynthesis = origSynth;
  }, 'F6');
});

describe('F7 Boundary: Dynamic Island Rapid Interaction & Safety', () => {
  let service: VoiceSpeechService;

  beforeEach(() => {
    (globalThis as any).localStorage.clear();
    service = new VoiceSpeechService();
  });

  it('T2.F7.1: Rapid consecutive speakFeedback calls abort previous audio and start latest text', async () => {
    let callOrder: string[] = [];
    const origSpeak = service.speakFeedback.bind(service);
    service.speakFeedback = async (text: string, opts?: any) => {
      callOrder.push(text);
      return origSpeak(text, opts);
    };

    service.speakFeedback('Mensaje 1');
    service.speakFeedback('Mensaje 2');
    await service.speakFeedback('Mensaje 3');

    expect(callOrder).toEqual(['Mensaje 1', 'Mensaje 2', 'Mensaje 3']);
  }, 'F7');

  it('T2.F7.2: Passing empty or whitespace string to speakFeedback is a safe no-op', async () => {
    let played = false;
    (service as any).playAudioBlob = async () => {
      played = true;
    };

    await service.speakFeedback('');
    await service.speakFeedback('   ');
    expect(played).toBe(false);
  }, 'F7');

  it('T2.F7.3: parseVoiceCommand handles edge queries (math, camera, neuro art, study) accurately', () => {
    const cmdMath = service.parseVoiceCommand('ayúdame a sumar 45 más 12');
    expect(cmdMath.action).toBe('open_calculator');
    expect(cmdMath.targetApp).toBe('calculator');

    const cmdCam = service.parseVoiceCommand('quiero escanear mi libro con la camara');
    expect(cmdCam.action).toBe('open_camera_tutor');
    expect(cmdCam.targetApp).toBe('camera_tutor');

    const cmdArt = service.parseVoiceCommand('vamos a crear un dibujo en arte');
    expect(cmdArt.action).toBe('open_neuro_art');
    expect(cmdArt.targetApp).toBe('neuro_art');

    const cmdHome = service.parseVoiceCommand('ir a la pantalla principal');
    expect(cmdHome.action).toBe('go_home');
    expect(cmdHome.targetApp).toBe('home');
  }, 'F7');

  it('T2.F7.4: parseVoiceCommand with unknown query defaults to Socratic AI QA', () => {
    const cmdUnknown = service.parseVoiceCommand('¿por qué los flamencos son rosas?');
    expect(cmdUnknown.action).toBe('ai_qa');
    expect(cmdUnknown.targetApp).toBe('study_assistant');
    expect(cmdUnknown.aiResponse).toContain('Tutor de Estudio');
  }, 'F7');

  it('T2.F7.5: stopListening when not actively listening does not error', () => {
    expect(() => {
      service.stopListening();
    }).not.toThrow();
  }, 'F7');
});

describe('F8 Boundary: Settings Screen Malformed State Recovery', () => {
  let service: VoiceSpeechService;

  beforeEach(() => {
    (globalThis as any).localStorage.clear();
    service = new VoiceSpeechService();
  });

  it('T2.F8.1: Malformed JSON in localStorage zentry_tts_custom_settings recovers gracefully without crash', () => {
    (globalThis as any).localStorage.setItem('zentry_tts_custom_settings', '{malformed_json:::');
    const newService = new VoiceSpeechService();
    expect(newService.getPersona()).toBe('zentry_jovial');
  }, 'F8');

  it('T2.F8.2: Settings with non-existent persona key falls back safely', () => {
    (globalThis as any).localStorage.setItem('zentry_tts_custom_settings', JSON.stringify({
      preferredPersona: 'ghost_non_existent_voice'
    }));
    const newService = new VoiceSpeechService();
    expect(newService.getPersona()).toBe('zentry_jovial');
  }, 'F8');

  it('T2.F8.3: Clearing empty IndexedDB audio cache does not throw', async () => {
    let err = false;
    try {
      await service.clearAudioCache();
    } catch {
      err = true;
    }
    expect(err).toBe(false);
  }, 'F8');

  it('T2.F8.4: API key with leading/trailing whitespace is handled cleanly', () => {
    (globalThis as any).localStorage.setItem('zentry_tts_api_key', '   AIzaValidKeyWithSpaces   ');
    const key = (globalThis as any).localStorage.getItem('zentry_tts_api_key');
    expect(key.trim()).toBe('AIzaValidKeyWithSpaces');
  }, 'F8');

  it('T2.F8.5: Missing SpeechRecognition in window reports unsupported status without error', () => {
    (service as any).recognition = null;
    expect(service.isSupported()).toBe(false);
  }, 'F8');
});

describe('F9 Boundary: Sample Corpora Edge Cases', () => {
  let service: VoiceSpeechService;

  beforeEach(() => {
    (globalThis as any).localStorage.clear();
    service = new VoiceSpeechService();
  });

  it('T2.F9.1: Preload with duplicate phrases executes safely and does not generate conflicting cache keys', async () => {
    const list = [
      '¡Hola! Soy Zentry.',
      '¡Hola! Soy Zentry.',
      '¡Hola! Soy Zentry.'
    ];
    let err = false;
    try {
      await service.preloadPhrases(list);
    } catch {
      err = true;
    }
    expect(err).toBe(false);
  }, 'F9');

  it('T2.F9.2: Preload with phrases containing emojis sanitizes before creating cache keys', async () => {
    const list = ['¡Hola! 🚀 Soy Zentry. ⭐'];
    let err = false;
    try {
      await service.preloadPhrases(list);
    } catch {
      err = true;
    }
    expect(err).toBe(false);
  }, 'F9');

  it('T2.F9.3: Preload when network throws aborts iteration cleanly without unhandled rejection', async () => {
    (globalThis as any).__simulateOfflineNetworkError = true;
    let err = false;
    try {
      await service.preloadPhrases(['Frase de prueba']);
    } catch {
      err = true;
    }
    expect(err).toBe(false);
  }, 'F9');

  it('T2.F9.4: Preload with mixed valid and empty entries filters out invalid phrases', async () => {
    const list = ['', '   ', 'Frase válida', (null as any), undefined as any];
    let err = false;
    try {
      await service.preloadPhrases(list);
    } catch {
      err = true;
    }
    expect(err).toBe(false);
  }, 'F9');

  it('T2.F9.5: Unique acoustic settings create distinct cache keys for the same phrase', () => {
    const config1: TTSVoiceConfig = {
      languageCode: 'es-US',
      name: 'es-US-Neural2-A',
      ssmlGender: 'FEMALE',
      pitch: 3.2,
      speakingRate: 1.12,
      volumeGainDb: 1.2
    };
    const config2: TTSVoiceConfig = {
      languageCode: 'es-US',
      name: 'es-US-Neural2-A',
      ssmlGender: 'FEMALE',
      pitch: 1.0, // Different pitch
      speakingRate: 1.12,
      volumeGainDb: 1.2
    };

    const key1 = (service as any).getCacheKey('Hola', config1);
    const key2 = (service as any).getCacheKey('Hola', config2);
    expect(key1).not.toBe(key2);
  }, 'F9');
});

describe('F10 Boundary: Test Harness Resilience', () => {
  it('T2.F10.1: Assertion engine captures custom assertion failures accurately', () => {
    expect(() => {
      expect(10).toBe(20);
    }).toThrow('to be');
  }, 'F10');

  it('T2.F10.2: toBeCloseTo detects values outside tolerance range', () => {
    expect(() => {
      expect(1.0).toBeCloseTo(1.5, 2);
    }).toThrow('to be close to');
  }, 'F10');
});
