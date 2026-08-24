# 🚀 Walkthrough de Código: Refactorización Modular de Vistas por Edad y Home Toddler (2-5 Años)
- **Fecha:** 2026-08-24
- **Vertical:** UI & Shell (`ui-shell`)
- **Rama:** `feat/ui-shell-age-tiering`
- **Worktree:** `D:\1_jose_angel\1_GitHub\Zentry\zentryos-worktrees\ui-shell`
- **Puerto de Prueba:** 5175

---

## 1. Resumen Ejecutivo
En esta sesión se modularizó la arquitectura del Home Screen separando las vistas en subpáginas dedicadas por rango de edad (`src/components/views/toddler/` y `src/components/views/explorer/`). Se perfeccionó de forma completa la interfaz de usuario para la primera infancia (**2 a 5 años - Toddler**), incorporando los 2 grandes cajones de aplicaciones (**Crear** y **Entretenimiento**) en un bento grid simétrico de 2 columnas junto a los accesos directos de **Cámara** y **Reloj**, eliminando el botón de ajustes en este rango de edad. Asimismo, se unificó la barra superior haciéndola 100% transparente sobre el wallpaper orgánico con la Isla Dinámica `ZENTRY` Liquid Glass, y se trasladó el sistema de interacción de voz y texto a la barra de navegación inferior.

## 2. Archivos Modificados / Creados
- `src/components/views/toddler/ToddlerHomeView.tsx`: Subpágina exclusiva para 2 a 5 años con cajones Crear & Entretenimiento, Cámara, Reloj, sin ajustes y con microinteracciones vocales.
- `src/components/views/explorer/ExplorerHomeView.tsx`: Subpágina preparada para 5 a 10+ años con buscador, apps escolares y Google Workspace.
- `src/components/home/ZentryHomeScreen.tsx`: Orquestador limpio que carga la vista de edad correspondiente según criterio del sistema.
- `src/components/shell/ZentryStatusBar.tsx`: Barra de estado con fondo 100% transparente unificado con el wallpaper vivo y sin capas superpuestas.
- `src/components/shell/ZentryDynamicIsland.tsx`: Isla Dinámica flotante Liquid Glass con texto `ZENTRY`, reproductor de medios en background y panel multimodal.
- `src/components/shell/ZentryNavBar.tsx`: Barra inferior unificada con soporte permanente para dictado de audio por voz (micrófono) y transcripción/escritura por teclado.
- `src/components/screens/ZentrySettingsScreen.tsx`: Limpieza del selector de edad en ajustes (la edad es un criterio externo de gobernanza).
- `src/services/agencyService.ts`: Servicio de gobernanza de atención y bitácora de memoria viva de la sesión.
- `src/services/mediaPlaybackService.ts`: Bus global de estado de medios en segundo plano.

## 3. Estado de Compilación y Pruebas
- [x] `npm run build` ejecutado con éxito (código 0, bundle SingleFile `dist/index.html` de 1,042 kB).
- [x] Verificado visualmente en `http://localhost:5175/` (`npm run dev:ui`).

## 4. Puntos de Atención para el Mezclador
- `src/App.tsx`: Recibe la propiedad `ageTier` en `ZentryStatusBar`, `ZentryHomeScreen` y `ZentryNavBar`.
- `src/types/zentry.ts`: Define las pantallas de medios educativos (`zentry_tube`, `zentry_tok`, `zentry_gram`, `zentry_stream`).
- Nuevos directorios creados: `src/components/views/toddler/` y `src/components/views/explorer/`.
