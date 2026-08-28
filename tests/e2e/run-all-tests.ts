/**
 * ZentryOS Voice Neural TTS — Master E2E Test Suite Runner
 * Executes Tiers 1-4, tracks coverage across all 10 features, and validates 100% pass rate.
 */

import { runAllTests } from './test-harness';

// Import all test suites to register test cases
import './tier1-feature-coverage.test';
import './tier2-boundary-cases.test';
import './tier3-combinations.test';
import './tier4-real-world-scenarios.test';

async function main() {
  console.log('\n======================================================================');
  console.log('  🎙️  ZENTRYOS VOICE NEURAL TTS — E2E TEST SUITE RUNNER (TIERS 1-4)');
  console.log('======================================================================\n');

  const summary = await runAllTests();

  console.log('----------------------------------------------------------------------');
  console.log('  📊 TEST RESULTS BREAKDOWN BY TIER');
  console.log('----------------------------------------------------------------------');
  for (const [tier, stats] of Object.entries(summary.tierBreakdown)) {
    const statusIcon = stats.failed === 0 ? '✅' : '❌';
    console.log(`  ${statusIcon} ${tier.padEnd(38)} : ${stats.passed}/${stats.total} passed`);
  }

  console.log('\n----------------------------------------------------------------------');
  console.log('  🎯 FEATURE COVERAGE MATRIX (PROJECT.md F1 - F10)');
  console.log('----------------------------------------------------------------------');
  const featureNames: Record<string, string> = {
    F1: '5 Neural Voice Archetypes Matrix',
    F2: 'Acoustic Prosody Calibration',
    F3: 'Dynamic SSML Micro-Pause Injection',
    F4: 'Audio DSP Filtering & Cleansing',
    F5: 'Anti-Emoji & Text Sanitization',
    F6: 'Multi-Tier Cache & Fallback Engine',
    F7: 'Dynamic Island Audio/Voice Tab',
    F8: 'Settings Calibration UI',
    F9: 'Certified Spanish Sample Corpora',
    F10: 'E2E Testing Suite & Dual Track'
  };

  for (let i = 1; i <= 10; i++) {
    const fKey = `F${i}`;
    const fStats = summary.featureCoverage[fKey] || { total: 0, passed: 0, failed: 0 };
    const fName = featureNames[fKey] || fKey;
    const statusIcon = fStats.failed === 0 && fStats.total > 0 ? '✅' : '❌';
    console.log(`  ${statusIcon} [${fKey}] ${fName.padEnd(38)} : ${fStats.passed}/${fStats.total} tests`);
  }

  console.log('\n----------------------------------------------------------------------');
  console.log('  ⏱️  EXECUTION SUMMARY');
  console.log('----------------------------------------------------------------------');
  console.log(`  Total Tests Executed : ${summary.totalTests}`);
  console.log(`  Passed               : ${summary.passed} ✅`);
  console.log(`  Failed               : ${summary.failed} ${summary.failed === 0 ? '🎉' : '❌'}`);
  console.log(`  Total Duration       : ${summary.durationMs} ms\n`);

  if (summary.failed > 0) {
    console.error('❌ FAILURES DETECTED:');
    summary.results.filter(r => !r.passed).forEach(r => {
      console.error(`\n  [${r.tier}] ${r.suite} > ${r.name}`);
      console.error(`  Error: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('✨ ALL TESTS PASSED SUCCESSFULLY WITH 100% COVERAGE!\n');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
