# AGENTS.md — ZentryOS Launcher PWA

## 🎯 Identidad y Misión del Proyecto
Este repositorio (`zentryos-launcher-pwa`) es el **núcleo primario de desarrollo de ZentryOS**.
* **Paradigma:** Web-First PWA (React 19 + Tailwind CSS v4 + Vite SingleFile).
* **Hito Innegociable:** **MVP presentable, fluido y demostrable para el martes 25 de agosto de 2026.**
* **Android Nativo:** El proyecto `zentryos-launcher-android` (Device Owner ~95%) está en segundo plano como puente MDM para fases posteriores.

---

## 🏛️ SSOT de Gobernanza (Verdad Absoluta)
Antes de planificar o ejecutar cambios estructurales, debes respetar las decisiones inmutables de:
* 📄 **SSOT Canon:** `D:\1_jose_angel\1_GitHub\Zentry\zentry-ssot\CANON.md`
* 📄 **Changelog SSOT:** `D:\1_jose_angel\1_GitHub\Zentry\zentry-ssot\CHANGELOG-SSOT.md`

---

## 🌿 Mapa de Git Worktrees y Puertos Activos
Para el desarrollo multi-agente en paralelo, cada operador trabaja en su directorio y puerto aislado:

| Vertical | Worktree Local | Rama Git | Puerto Dev | Comando |
| :--- | :--- | :--- | :---: | :--- |
| **Hub / Mezclador** | `D:\1_jose_angel\1_GitHub\Zentry\zentryos-launcher-pwa` | `master` | `5174` | `npm run dev` |
| **1. UI & Edades** | `D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\ui-shell` | `feat/ui-shell-age-tiering` | `5175` | `npm run dev:ui` |
| **2. IA & Microapps**| `D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\microapps-ai` | `feat/microapps-ai-core` | `5176` | `npm run dev:ai` |
| **3. Entertainment** | `D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\entertainment` | `feat/entertainment-hub` | `5177` | `npm run dev:entertainment` |
| **4. Parental Sync** | `D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\parental-sync` | `feat/parental-sync-bridge` | `5178` | `npm run dev:parental` |

---

## 🔄 Protocolo de Sesión Agéntica (Golden Loop)

### Al Iniciar una Sesión (Operador)
1. Confirma que tu terminal está dentro del worktree de tu vertical.
2. Inicia tu servidor local en tu puerto designado (ej. `npm run dev:ui`).

### Al Terminar una Sesión (Operador)
1. Ejecuta la skill `pwa-operator-wt`:
   * Verifica que `npm run build` pase con código 0.
   * Realiza `git commit` descriptivo en tu rama.
   * Genera el reporte en `docs/walkthroughs/YYYY-MM-DD-walkthrough-<vertical>-<tema>.md`.

### Al Realizar la Mezcla (Agente Mezclador)
1. Abre una sesión nueva y limpia en `D:\1_jose_angel\1_GitHub\Zentry\zentryos-launcher-pwa` sobre `master`.
2. Ejecuta la skill `pwa-merger-auditor` para fusionar, validar build y emitir la señal de sincronización (`git pull --rebase origin master`).