import React from 'react';
import { Palette, Play, Camera, Clock } from 'lucide-react';
import type { ScreenId } from '../../../types/zentry';
import { sounds } from '../../../services/soundEffects';
import { voiceService } from '../../../services/voiceSpeech';

interface Props {
  isDark: boolean;
  onNavigate: (screen: ScreenId) => void;
}

export const ToddlerHomeView: React.FC<Props> = ({ isDark, onNavigate }) => {
  // 1. Cajón de Creación
  const handleOpenCreacion = () => {
    sounds.playAppOpen();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }
    voiceService.speakFeedback('¡Vamos a crear y dibujar!');
    onNavigate('creation');
  };

  // 2. Cajón de Entretenimiento
  const handleOpenEntretenimiento = () => {
    sounds.playAppOpen();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }
    voiceService.speakFeedback('¡Hora de videos, cuentos y música!');
    onNavigate('entertainment_hub');
  };

  // 3. Aplicación Cámara
  const handleOpenCamara = () => {
    sounds.playAppOpen();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
    voiceService.speakFeedback('¡Sonríe a la cámara!');
    onNavigate('camera');
  };

  // 4. Aplicación Reloj
  const handleOpenReloj = () => {
    sounds.playAppOpen();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
    voiceService.speakFeedback('¡Mira qué hora es!');
    onNavigate('reloj');
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center px-4 py-2 max-w-sm mx-auto select-none gap-6">
      {/* BLOQUE 1: LOS 2 CAJONES DE APLICACIONES EN 2 COLUMNAS (PROPORCIONES WIDGET BENTO) */}
      <div className="grid grid-cols-2 gap-3.5 w-full">
        {/* Cajón 1: CREAR */}
        <div
          onClick={handleOpenCreacion}
          className={
            (isDark
              ? 'bg-gradient-to-br from-purple-900/60 via-indigo-900/50 to-slate-900/60 border-purple-400/40 hover:border-purple-300 '
              : 'bg-gradient-to-br from-purple-500/25 via-indigo-500/15 to-white/75 border-white/60 hover:border-purple-400/60 ') +
            'h-40 rounded-[30px] p-4 flex flex-col items-center justify-between cursor-pointer backdrop-blur-xl border shadow-xl transition-all duration-300 zentry-press group text-center'
          }
        >
          <div className="w-14 h-14 rounded-[22px] bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg group-hover:scale-108 transition-transform mt-1">
            <Palette className="w-7 h-7" />
          </div>

          <div className="space-y-0.5 mb-1">
            <div className="flex items-center justify-center">
              <span
                className={
                  (isDark
                    ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] '
                    : 'text-slate-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] ') +
                  'text-base font-black tracking-tight'
                }
              >
                Crear
              </span>
            </div>
            <p
              className={
                (isDark ? 'text-purple-200/90 ' : 'text-slate-600 ') +
                'text-[11px] font-bold leading-tight'
              }
            >
              Dibuja y crea
            </p>
          </div>
        </div>

        {/* Cajón 2: ENTRETENIMIENTO */}
        <div
          onClick={handleOpenEntretenimiento}
          className={
            (isDark
              ? 'bg-gradient-to-br from-rose-900/60 via-pink-900/50 to-slate-900/60 border-rose-400/40 hover:border-rose-300 '
              : 'bg-gradient-to-br from-rose-500/25 via-pink-500/15 to-white/75 border-white/60 hover:border-rose-400/60 ') +
            'h-40 rounded-[30px] p-4 flex flex-col items-center justify-between cursor-pointer backdrop-blur-xl border shadow-xl transition-all duration-300 zentry-press group text-center'
          }
        >
          <div className="w-14 h-14 rounded-[22px] bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg relative group-hover:scale-108 transition-transform mt-1">
            <Play className="w-7 h-7 fill-white" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 absolute -top-0.5 -right-0.5 animate-ping" />
          </div>

          <div className="space-y-0.5 mb-1">
            <div className="flex items-center justify-center gap-1">
              <span
                className={
                  (isDark
                    ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] '
                    : 'text-slate-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] ') +
                  'text-base font-black tracking-tight'
                }
              >
                Diversión
              </span>
            </div>
            <p
              className={
                (isDark ? 'text-rose-200/90 ' : 'text-slate-600 ') +
                'text-[11px] font-bold leading-tight'
              }
            >
              Videos y música
            </p>
          </div>
        </div>
      </div>

      {/* BLOQUE 2: LAS 2 APLICACIONES INDIVIDUALES EN 2 COLUMNAS SIMÉTRICAS (CÁMARA Y RELOJ) */}
      <div className="grid grid-cols-2 gap-6 w-full justify-items-center px-4">
        {/* App 1: Cámara */}
        <div
          onClick={handleOpenCamara}
          className="flex flex-col items-center gap-2 cursor-pointer zentry-press group"
        >
          <div className="w-18 h-18 rounded-[26px] bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-xl group-hover:scale-108 active:scale-95 transition-all">
            <Camera className="w-9 h-9" />
          </div>
          <span
            className={
              (isDark
                ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] '
                : 'text-slate-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] ') +
              'text-xs font-black tracking-tight text-center'
            }
          >
            Cámara
          </span>
        </div>

        {/* App 2: Reloj */}
        <div
          onClick={handleOpenReloj}
          className="flex flex-col items-center gap-2 cursor-pointer zentry-press group"
        >
          <div className="w-18 h-18 rounded-[26px] bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center text-white shadow-xl group-hover:scale-108 active:scale-95 transition-all">
            <Clock className="w-9 h-9" />
          </div>
          <span
            className={
              (isDark
                ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] '
                : 'text-slate-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] ') +
              'text-xs font-black tracking-tight text-center'
            }
          >
            Reloj
          </span>
        </div>
      </div>
    </div>
  );
};
