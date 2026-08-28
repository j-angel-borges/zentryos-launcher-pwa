## 2026-08-28T18:36:55Z
You are Survey Explorer 3 (Acoustic Calibration & SSML Engineering).
Working Directory: D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\voice-tts\.agents\survey_explorer_3
Project Root: D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\voice-tts
Original Request: D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\voice-tts\ORIGINAL_REQUEST.md

Instructions:
1. Read ORIGINAL_REQUEST.md first.
2. Formulate and engineer the acoustic calibration profiles and SSML marking strategies for all 5 archetypes:
   - Exact numerical parameters: Pitch (semitones / % shift), Speaking Rate (playback multiplier, e.g. 0.85x to 1.15x), Volume Gain (dB, e.g. +0.0dB to +2.0dB).
   - Organic respiratory micro-pauses (`<break time="..."/>`), prosody markup, emphasis, and sentence-level pacing per archetype (e.g. Socratic reflective pauses of 350-600ms for Maestro Aurelius vs quick natural 80-150ms pauses for Sofía/Lucas vs reassuring 200-300ms for Elena/Carlos).
   - Acoustic filtering / cleanup guidelines: suppression of low-frequency rumble (<80Hz highpass), de-essing/metallic harshness control (4-7kHz smoothing), and dynamic range consistency.
   - Dual-engine fallback strategy: Seamless translation of SSML to plain text / WebSpeech pitch/rate parameters when falling back from GCP TTS HD to offline browser/Edge voices, preserving gender stability and acoustic personality.
3. Write your report to D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\voice-tts\.agents\survey_explorer_3\survey_acoustic_ssml.md and write handoff.md in your working directory.
4. Report completion back to parent via send_message.
