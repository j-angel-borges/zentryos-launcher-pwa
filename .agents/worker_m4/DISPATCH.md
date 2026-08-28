## 2026-08-27T23:03:00Z
<USER_REQUEST>
Read D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\ui-shell\.agents\ORIGINAL_REQUEST.md, D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\ui-shell\PROJECT.md, and D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\ui-shell\.agents\explorer_survey_1\analysis.md.

Your Working Directory is: D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\ui-shell\.agents\worker_m4
File Ownership: You exclusively own and modify `src/components/screens/ZentryRealMissionsScreen.tsx`.

Task (Milestone M4: Gamification & Dynamics in Real Missions):
1. Animated Circular SVG Countdown Movement Timer:
   - Implement a circular countdown timer with animated `stroke-dashoffset` ($C = 2\pi r$, $r=70$ or suitable size), smooth ticking transition, and color gradient (Cyan $\to$ Amber $\to$ Crimson when urgent).
   - Support Active Challenge State with Play, Pause/Resume, and Cancel controls.
2. Developmental Movement Quests:
   - Provide 12 engaging kid-friendly movement challenges across developmental motor skills (Frog Jumps, Superhero Flight Pose, Balance Flamingo, Speed Run in place, Reach for the Stars, Ninja Stealth Crawl, Robot Dance, Star Jumps, etc.).
   - Include dynamic duration per quest (15s, 30s, 45s, 60s) and step-by-step kid action prompts.
3. Procedural Audio & Celebration:
   - Integrate `sounds.playTimerTick(isUrgent)` on countdown ticks (switching to urgent high-pitch on last 5 seconds).
   - Trigger `sounds.playVictoryFanfare()` and `confetti()` when the timer completes or mission is validated.
4. Dual Persistence & Firestore Sync:
   - Sync completed quest stats to `localStorage` (medals, streak, XP).
   - Sync to Firestore collection `devices/{deviceId}/completed_missions` using `saveCompletedMissionToFirestore` from `src/services/firebase.ts`.
5. Run `npm run build` from `D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\ui-shell` to verify clean compilation (Code 0).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write your changes and verification report to D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\ui-shell\.agents\worker_m4\handoff.md and report completion via send_message to your caller (parent).
</USER_REQUEST>
