/**
 * ZentryOS Voice Neural TTS — E2E Test Harness & Execution Engine
 * Provides assertions, browser environment mocks (IndexedDB, SpeechSynthesis, WebAudio, Fetch, LocalStorage),
 * and deterministic test lifecycle runner.
 */

import type { TestCase, TestCaseResult, TestTier, TestSuiteSummary } from './types';

// =========================================================================
// 1. ASSERTION ENGINE
// =========================================================================

export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssertionError';
  }
}

export interface Matchers<T> {
  toBe(expected: any): void;
  toEqual(expected: any): void;
  toContain(expected: any): void;
  toMatch(pattern: RegExp | string): void;
  toBeGreaterThan(n: number): void;
  toBeLessThan(n: number): void;
  toBeGreaterThanOrEqual(n: number): void;
  toBeLessThanOrEqual(n: number): void;
  toBeCloseTo(expected: number, precision?: number): void;
  toBeDefined(): void;
  toBeUndefined(): void;
  toBeNull(): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toThrow(expectedError?: string | RegExp): void;
  not: Matchers<T>;
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null || typeof a !== 'object') return false;

  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

export function expect<T = any>(actual: T): Matchers<T> {
  const createMatchers = (isNot: boolean): Matchers<T> => ({
    toBe(expected: any) {
      const pass = Object.is(actual, expected);
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} ${isNot ? 'NOT to be' : 'to be'} ${JSON.stringify(expected)}`);
      }
    },
    toEqual(expected: any) {
      const pass = deepEqual(actual, expected);
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} ${isNot ? 'NOT to deeply equal' : 'to deeply equal'} ${JSON.stringify(expected)}`);
      }
    },
    toContain(expected: any) {
      let pass = false;
      if (typeof actual === 'string') {
        pass = actual.includes(String(expected));
      } else if (Array.isArray(actual)) {
        pass = actual.includes(expected);
      } else if (actual instanceof Set || actual instanceof Map) {
        pass = actual.has(expected);
      }
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} ${isNot ? 'NOT to contain' : 'to contain'} ${JSON.stringify(expected)}`);
      }
    },
    toMatch(pattern: RegExp | string) {
      const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
      const pass = typeof actual === 'string' && regex.test(actual);
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected "${actual}" ${isNot ? 'NOT to match' : 'to match'} pattern ${pattern}`);
      }
    },
    toBeGreaterThan(n: number) {
      const pass = typeof actual === 'number' && actual > n;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${actual} ${isNot ? 'NOT to be >' : 'to be >'} ${n}`);
      }
    },
    toBeLessThan(n: number) {
      const pass = typeof actual === 'number' && actual < n;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${actual} ${isNot ? 'NOT to be <' : 'to be <'} ${n}`);
      }
    },
    toBeGreaterThanOrEqual(n: number) {
      const pass = typeof actual === 'number' && actual >= n;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${actual} ${isNot ? 'NOT to be >=' : 'to be >='} ${n}`);
      }
    },
    toBeLessThanOrEqual(n: number) {
      const pass = typeof actual === 'number' && actual <= n;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${actual} ${isNot ? 'NOT to be <=' : 'to be <='} ${n}`);
      }
    },
    toBeCloseTo(expected: number, precision: number = 2) {
      if (typeof actual !== 'number') {
        throw new AssertionError(`Expected number, got ${typeof actual}`);
      }
      const diff = Math.abs(actual - expected);
      const tolerance = Math.pow(10, -precision) / 2;
      const pass = diff < tolerance;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${actual} ${isNot ? 'NOT to be close to' : 'to be close to'} ${expected} (within ${tolerance})`);
      }
    },
    toBeDefined() {
      const pass = actual !== undefined;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected value ${isNot ? 'to be undefined' : 'to be defined'}`);
      }
    },
    toBeUndefined() {
      const pass = actual === undefined;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected value ${isNot ? 'NOT to be undefined' : 'to be undefined'}`);
      }
    },
    toBeNull() {
      const pass = actual === null;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${actual} ${isNot ? 'NOT to be null' : 'to be null'}`);
      }
    },
    toBeTruthy() {
      const pass = Boolean(actual);
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${actual} ${isNot ? 'NOT to be truthy' : 'to be truthy'}`);
      }
    },
    toBeFalsy() {
      const pass = !actual;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${actual} ${isNot ? 'NOT to be falsy' : 'to be falsy'}`);
      }
    },
    toThrow(expectedError?: string | RegExp) {
      if (typeof actual !== 'function') {
        throw new AssertionError('toThrow requires a function');
      }
      let didThrow = false;
      let thrownError: any = null;
      try {
        (actual as any)();
      } catch (err) {
        didThrow = true;
        thrownError = err;
      }

      if (!isNot && !didThrow) {
        throw new AssertionError('Expected function to throw an error, but it did not throw.');
      }
      if (isNot && didThrow) {
        throw new AssertionError(`Expected function NOT to throw, but it threw: ${thrownError?.message || thrownError}`);
      }

      if (didThrow && expectedError) {
        const message = thrownError?.message || String(thrownError);
        if (typeof expectedError === 'string') {
          if (!message.includes(expectedError)) {
            throw new AssertionError(`Expected error message to include "${expectedError}", but got "${message}"`);
          }
        } else if (expectedError instanceof RegExp) {
          if (!expectedError.test(message)) {
            throw new AssertionError(`Expected error message to match ${expectedError}, but got "${message}"`);
          }
        }
      }
    },
    get not(): Matchers<T> {
      return createMatchers(!isNot);
    }
  });

  return createMatchers(false);
}

// =========================================================================
// 2. BROWSER ENVIRONMENT MOCK SETUP (Node.js compatibility)
// =========================================================================

export class MockStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get length(): number {
    return this.store.size;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
}

export class MockIDBObjectStore {
  constructor(public name: string, private data: Map<string, any>) {}

  get(key: string) {
    const req: any = { result: undefined, error: null, onsuccess: null, onerror: null };
    queueMicrotask(() => {
      req.result = this.data.get(key);
      if (req.onsuccess) req.onsuccess({ target: req });
    });
    return req;
  }

  put(value: any) {
    const req: any = { result: value.key, error: null, onsuccess: null, onerror: null };
    queueMicrotask(() => {
      this.data.set(value.key, value);
      if (req.onsuccess) req.onsuccess({ target: req });
    });
    return req;
  }

  delete(key: string) {
    const req: any = { result: undefined, error: null, onsuccess: null, onerror: null };
    queueMicrotask(() => {
      this.data.delete(key);
      if (req.onsuccess) req.onsuccess({ target: req });
    });
    return req;
  }

  clear() {
    const req: any = { result: undefined, error: null, onsuccess: null, onerror: null };
    queueMicrotask(() => {
      this.data.clear();
      if (req.onsuccess) req.onsuccess({ target: req });
    });
    return req;
  }
}

export class MockIDBTransaction {
  constructor(private db: MockIDBDatabase, public mode: string) {}

  objectStore(name: string) {
    return this.db.getObjectStore(name);
  }
}

export class MockIDBDatabase {
  private stores: Map<string, Map<string, any>> = new Map();
  public objectStoreNames = {
    contains: (name: string) => this.stores.has(name)
  };

  createObjectStore(name: string, _options?: any) {
    if (!this.stores.has(name)) {
      this.stores.set(name, new Map());
    }
    return new MockIDBObjectStore(name, this.stores.get(name)!);
  }

  getObjectStore(name: string) {
    if (!this.stores.has(name)) {
      this.stores.set(name, new Map());
    }
    return new MockIDBObjectStore(name, this.stores.get(name)!);
  }

  transaction(names: string | string[], mode: string = 'readonly') {
    return new MockIDBTransaction(this, mode);
  }
}

export class MockIDBFactory {
  public dbInstance: MockIDBDatabase = new MockIDBDatabase();

  open(name: string, version?: number) {
    const req: any = {
      result: this.dbInstance,
      error: null,
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null
    };

    queueMicrotask(() => {
      if (req.onupgradeneeded) {
        req.onupgradeneeded({ target: req });
      }
      if (req.onsuccess) {
        req.onsuccess({ target: req });
      }
    });

    return req;
  }

  reset() {
    this.dbInstance = new MockIDBDatabase();
  }
}

export interface MockVoice {
  name: string;
  lang: string;
  default: boolean;
  localService: boolean;
  voiceURI: string;
}

export class MockSpeechSynthesisUtterance {
  public text: string = '';
  public lang: string = 'es-ES';
  public pitch: number = 1.0;
  public rate: number = 1.0;
  public volume: number = 1.0;
  public voice: MockVoice | null = null;
  public onstart: (() => void) | null = null;
  public onend: (() => void) | null = null;
  public onerror: ((error: any) => void) | null = null;

  constructor(text?: string) {
    if (text) this.text = text;
  }
}

export class MockSpeechSynthesis {
  public voices: MockVoice[] = [
    { name: 'Microsoft Dalia Online (Natural) - Spanish (Mexico) (es-MX-DaliaNeural)', lang: 'es-MX', default: true, localService: false, voiceURI: 'es-MX-DaliaNeural' },
    { name: 'Microsoft Elvira Online (Natural) - Spanish (Spain) (es-ES-ElviraNeural)', lang: 'es-ES', default: false, localService: false, voiceURI: 'es-ES-ElviraNeural' },
    { name: 'Microsoft Jorge Online (Natural) - Spanish (Mexico) (es-MX-JorgeNeural)', lang: 'es-MX', default: false, localService: false, voiceURI: 'es-MX-JorgeNeural' },
    { name: 'Microsoft Dario Online (Natural) - Spanish (Spain) (es-ES-DarioNeural)', lang: 'es-ES', default: false, localService: false, voiceURI: 'es-ES-DarioNeural' },
    { name: 'Microsoft Alvaro Online (Natural) - Spanish (Spain) (es-ES-AlvaroNeural)', lang: 'es-ES', default: false, localService: false, voiceURI: 'es-ES-AlvaroNeural' },
    { name: 'Google español', lang: 'es-ES', default: false, localService: false, voiceURI: 'Google español' },
    { name: 'Microsoft Helena Desktop - Spanish (Spain)', lang: 'es-ES', default: false, localService: true, voiceURI: 'Microsoft Helena Desktop' },
    { name: 'Microsoft Sabina Desktop - Spanish (Mexico)', lang: 'es-MX', default: false, localService: true, voiceURI: 'Microsoft Sabina Desktop' }
  ];

  public speaking: boolean = false;
  public paused: boolean = false;
  public pending: boolean = false;
  public onvoiceschanged: (() => void) | null = null;
  public lastUtterance: MockSpeechSynthesisUtterance | null = null;

  getVoices(): MockVoice[] {
    return [...this.voices];
  }

  speak(utterance: MockSpeechSynthesisUtterance): void {
    this.lastUtterance = utterance;
    this.speaking = true;
    if (utterance.onstart) {
      utterance.onstart();
    }
    setTimeout(() => {
      this.speaking = false;
      if (utterance.onend) {
        utterance.onend();
      }
    }, 10);
  }

  cancel(): void {
    this.speaking = false;
    this.paused = false;
    this.pending = false;
  }
}

export class MockAudio {
  public src: string = '';
  public volume: number = 1.0;
  public currentTime: number = 0;
  public onplay: (() => void) | null = null;
  public onended: (() => void) | null = null;
  public onerror: ((err: any) => void) | null = null;

  constructor(src?: string) {
    if (src) this.src = src;
  }

  play(): Promise<void> {
    if (this.onplay) this.onplay();
    setTimeout(() => {
      if (this.onended) this.onended();
    }, 10);
    return Promise.resolve();
  }

  pause(): void {}
}

export class MockAudioContext {
  public state: 'suspended' | 'running' | 'closed' = 'suspended';

  resume(): Promise<void> {
    this.state = 'running';
    return Promise.resolve();
  }

  createBufferSource() {
    return {
      connect: () => {},
      start: () => {},
      stop: () => {}
    };
  }

  createBiquadFilter() {
    return {
      type: 'highpass',
      frequency: { value: 80 },
      Q: { value: 0.7 },
      gain: { value: 0 },
      connect: () => {}
    };
  }

  createDynamicsCompressor() {
    return {
      threshold: { value: -24 },
      knee: { value: 30 },
      ratio: { value: 12 },
      attack: { value: 0.003 },
      release: { value: 0.25 },
      connect: () => {}
    };
  }

  get destination() {
    return {};
  }
}

function safeDefineGlobal(key: string, value: any) {
  try {
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true
    });
  } catch {
    (globalThis as any)[key] = value;
  }
}

// Global Environment Polyfill Setup
export function setupMockBrowserEnvironment() {
  const globalObj = globalThis as any;

  safeDefineGlobal('window', globalObj);
  safeDefineGlobal('addEventListener', (event: string, handler: any, opts?: any) => {});
  safeDefineGlobal('removeEventListener', (event: string, handler: any, opts?: any) => {});
  safeDefineGlobal('requestIdleCallback', (cb: any) => setTimeout(cb, 10));
  safeDefineGlobal('cancelIdleCallback', (id: any) => clearTimeout(id));
  globalObj.window.addEventListener = globalObj.addEventListener;
  globalObj.window.removeEventListener = globalObj.removeEventListener;
  globalObj.window.requestIdleCallback = globalObj.requestIdleCallback;
  globalObj.window.cancelIdleCallback = globalObj.cancelIdleCallback;

  const mockLocal = new MockStorage();
  const mockSession = new MockStorage();
  safeDefineGlobal('localStorage', mockLocal);
  safeDefineGlobal('sessionStorage', mockSession);
  globalObj.window.localStorage = mockLocal;
  globalObj.window.sessionStorage = mockSession;

  const idbFactory = new MockIDBFactory();
  safeDefineGlobal('indexedDB', idbFactory);
  globalObj.window.indexedDB = idbFactory;

  const synth = new MockSpeechSynthesis();
  safeDefineGlobal('speechSynthesis', synth);
  globalObj.window.speechSynthesis = synth;
  safeDefineGlobal('SpeechSynthesisUtterance', MockSpeechSynthesisUtterance);
  globalObj.window.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

  safeDefineGlobal('Audio', MockAudio);
  globalObj.window.Audio = MockAudio;

  safeDefineGlobal('AudioContext', MockAudioContext);
  globalObj.window.AudioContext = MockAudioContext;
  safeDefineGlobal('webkitAudioContext', MockAudioContext);
  globalObj.window.webkitAudioContext = MockAudioContext;

  const mockDoc = {
    createElement: (tag: string) => {
      if (tag === 'canvas') {
        return {
          getContext: () => ({
            drawImage: () => {},
            getImageData: () => ({ data: [] })
          }),
          toDataURL: () => 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='
        };
      }
      return {};
    },
    addEventListener: () => {},
    removeEventListener: () => {}
  };
  safeDefineGlobal('document', mockDoc);

  const mockNav = {
    userAgent: 'ZentryOS-Launcher-PWA-E2E',
    clipboard: {
      writeText: (_text: string) => Promise.resolve()
    },
    mediaDevices: {
      getUserMedia: () => Promise.resolve({ getTracks: () => [] })
    },
    vibrate: () => true
  };
  safeDefineGlobal('navigator', mockNav);
  globalObj.window.navigator = mockNav;

  // Blob URL mocks
  let urlCounter = 0;
  const mockUrl = {
    createObjectURL: (_blob: any) => `blob:http://localhost:5179/mock-audio-${++urlCounter}`,
    revokeObjectURL: (_url: string) => {}
  };
  safeDefineGlobal('URL', mockUrl);
  globalObj.window.URL = mockUrl;

  // Base64 polyfill
  if (!globalObj.atob) {
    safeDefineGlobal('atob', (b64: string) => Buffer.from(b64, 'base64').toString('binary'));
  }
  if (!globalObj.btoa) {
    safeDefineGlobal('btoa', (str: string) => Buffer.from(str, 'binary').toString('base64'));
  }

  // Intercept fetch for Google TTS
  const sampleAudioBase64 = Buffer.from('RIFF_MOCK_MP3_AUDIO_STREAM_ZENTRY_TTS_12345').toString('base64');

  globalObj.fetch = async (url: string, init?: any) => {
    const urlStr = String(url);
    if (urlStr.includes('texttospeech.googleapis.com')) {
      const body = init?.body ? JSON.parse(init.body) : {};
      
      // Simulate Studio quota restrictions if requested
      if (globalObj.__simulateStudioQuotaError && body?.voice?.name?.includes('Studio')) {
        return {
          ok: false,
          status: 403,
          statusText: 'Quota Exceeded / Studio Voice Restricted',
          json: async () => ({ error: { message: 'Quota exceeded for Studio voices' } })
        };
      }

      // Simulate offline / network failure
      if (globalObj.__simulateOfflineNetworkError) {
        throw new Error('NetworkError: Failed to fetch (Offline Mode)');
      }

      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          audioContent: sampleAudioBase64
        })
      };
    }

    return {
      ok: true,
      status: 200,
      json: async () => ({})
    };
  };
}

// =========================================================================
// 3. TEST SUITE REGISTRY & EXECUTION ENGINE
// =========================================================================

export const testRegistry: TestCase[] = [];
let currentTier: TestTier = 'Tier 1: Feature Coverage';
let currentSuite: string = 'General Suite';
let beforeEachFns: Array<() => void | Promise<void>> = [];

export function setTier(tier: TestTier) {
  currentTier = tier;
}

export function describe(suiteName: string, fn: () => void) {
  currentSuite = suiteName;
  beforeEachFns = [];
  fn();
}

export function beforeEach(fn: () => void | Promise<void>) {
  beforeEachFns.push(fn);
}

export function it(testName: string, fn: TestFn, featureRef?: string) {
  const suite = currentSuite;
  const tier = currentTier;
  const beHooks = [...beforeEachFns];

  const wrappedFn: TestFn = async () => {
    for (const hook of beHooks) {
      await hook();
    }
    await fn();
  };

  testRegistry.push({
    tier,
    suite,
    name: testName,
    fn: wrappedFn,
    featureRef
  });
}

export async function runAllTests(): Promise<TestSuiteSummary> {
  setupMockBrowserEnvironment();

  const results: TestCaseResult[] = [];
  const tierBreakdown: Record<TestTier, { total: number; passed: number; failed: number }> = {
    'Tier 1: Feature Coverage': { total: 0, passed: 0, failed: 0 },
    'Tier 2: Boundary & Corner Cases': { total: 0, passed: 0, failed: 0 },
    'Tier 3: Cross-Feature Combinations': { total: 0, passed: 0, failed: 0 },
    'Tier 4: Real-World Workload Scenarios': { total: 0, passed: 0, failed: 0 }
  };
  const featureCoverage: Record<string, { total: number; passed: number; failed: number }> = {};

  const startTime = Date.now();

  for (const testCase of testRegistry) {
    const testStart = Date.now();
    let passed = false;
    let errorMsg: string | undefined;

    // Reset environment flags before each test
    (globalThis as any).__simulateStudioQuotaError = false;
    (globalThis as any).__simulateOfflineNetworkError = false;

    try {
      await testCase.fn();
      passed = true;
    } catch (err: any) {
      passed = false;
      errorMsg = err?.stack || err?.message || String(err);
    }

    const durationMs = Date.now() - testStart;
    const tierStat = tierBreakdown[testCase.tier];
    tierStat.total++;
    if (passed) tierStat.passed++;
    else tierStat.failed++;

    if (testCase.featureRef) {
      if (!featureCoverage[testCase.featureRef]) {
        featureCoverage[testCase.featureRef] = { total: 0, passed: 0, failed: 0 };
      }
      featureCoverage[testCase.featureRef].total++;
      if (passed) featureCoverage[testCase.featureRef].passed++;
      else featureCoverage[testCase.featureRef].failed++;
    }

    results.push({
      tier: testCase.tier,
      suite: testCase.suite,
      name: testCase.name,
      passed,
      durationMs,
      error: errorMsg,
      featureRef: testCase.featureRef
    });
  }

  const durationMs = Date.now() - startTime;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return {
    totalTests: results.length,
    passed,
    failed,
    skipped: 0,
    durationMs,
    tierBreakdown,
    featureCoverage,
    results
  };
}

// Automatically initialize mock environment on module load
setupMockBrowserEnvironment();
