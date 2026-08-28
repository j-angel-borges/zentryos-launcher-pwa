/**
 * E2E Test Suite Types and Interfaces for ZentryOS Voice Neural TTS
 */

export type TestTier = 'Tier 1: Feature Coverage' | 'Tier 2: Boundary & Corner Cases' | 'Tier 3: Cross-Feature Combinations' | 'Tier 4: Real-World Workload Scenarios';

export interface TestCaseResult {
  tier: TestTier;
  suite: string;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
  featureRef?: string;
}

export interface TestSuiteSummary {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
  tierBreakdown: Record<TestTier, { total: number; passed: number; failed: number }>;
  featureCoverage: Record<string, { total: number; passed: number; failed: number }>;
  results: TestCaseResult[];
}

export type TestFn = () => void | Promise<void>;

export interface TestCase {
  tier: TestTier;
  suite: string;
  name: string;
  fn: TestFn;
  featureRef?: string;
}
