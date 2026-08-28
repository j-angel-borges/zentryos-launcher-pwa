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
    voiceService.speakFeedback('¡Vamos a crear!');
    onNavigate('creation');
  };

  // 2. Cajón de Entretenimiento
  const handleOpenEntretenimiento = () => {
    sounds.playAppOpen();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }
    voiceService.speakFeedback('¡Hora de videos!');
    onNavigate('entertainment_hub');
  };

  // 3. Aplicación Cámara
  const handleOpenCamara = () => {
    sounds.playAppOpen();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
    voiceService.speakFeedback('¡Cámara!');
    onNavigate('camera');
  };

  // 4. Aplicación Reloj
  const handleOpenReloj = () => {
    sounds.playAppOpen();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
    voiceService.speakFeedback('¡Reloj!');
    onNavigate('reloj');
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center px-4 py-2 max-w-sm mx-auto select-none gap-6">
      {/* BLOQUE 1: LOS 2 CAJONES DE APLICACIONES EN 2 COLUMNAS (ALTO CONTRASTE Y 1 PALABRA) */}
      <div className="grid grid-cols-2 gap-3.5 w-full">
        {/* Cajón 1: CREAR */}
        <div
          onClick={handleOpenCreacion}
          className="h-38 rounded-[30px] p-4 flex flex-col items-center justify-center gap-3 cursor-pointer backdrop-blur-2xl bg-[#120E24]/85 hover:bg-[#120E24]/95 border border-purple-400/50 shadow-2xl transition-all duration-300 zentry-spring-press group text-center"
        >
          <div className="w-15 h-15 rounded-[24px] bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-xl group-hover:scale-108 transition-transform">
            <Palette className="w-8 h-8" />
          </div>

          <span className="text-base font-black tracking-tight text-white drop-shadow-md">
            Crear
          </span>
        </div>

        {/* Cajón 2: VIDEOS / DIVERSIÓN */}
        <div
          onClick={handleOpenEntretenimiento}
          className="h-38 rounded-[30px] p-4 flex flex-col items-center justify-center gap-3 cursor-pointer backdrop-blur-2xl bg-[#1E0E1C]/85 hover:bg-[#1E0E1C]/95 border border-pink-400/50 shadow-2xl transition-all duration-300 zentry-spring-press group text-center"
        >
          <div className="w-15 h-15 rounded-[24px] bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-xl relative group-hover:scale-108 transition-transform">
            <Play className="w-8 h-8 fill-white" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 absolute -top-0.5 -right-0.5 animate-ping" />
          </div>

          <span className="text-base font-black tracking-tight text-white drop-shadow-md">
            Videos
          </span>
        </div>
      </div>

      {/* BLOQUE 2: LAS 2 APLICACIONES INDIVIDUALES (CÁMARA Y RELOJ) */}
      <div className="grid grid-cols-2 gap-6 w-full justify-items-center px-4">
        {/* App 1: Cámara */}
        <div
          onClick={handleOpenCamara}
          className="flex flex-col items-center gap-2 cursor-pointer zentry-spring-press group"
        >
          <div className="w-18 h-18 rounded-[26px] bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-xl group-hover:scale-108 active:scale-95 transition-all">
            <Camera className="w-9 h-9" />
          </div>
          <span className="text-xs font-black tracking-tight text-white drop-shadow-md text-center">
            Cámara
          </span>
        </div>

        {/* App 2: Reloj */}
        <div
          onClick={handleOpenReloj}
          className="flex flex-col items-center gap-2 cursor-pointer zentry-spring-press group"
        >
          <div className="w-18 h-18 rounded-[26px] bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center text-white shadow-xl group-hover:scale-108 active:scale-95 transition-all">
            <Clock className="w-9 h-9" />
          </div>
          <span className="text-xs font-black tracking-tight text-white drop-shadow-md text-center">
            Reloj
          </span>
        </div>
      </div>
    </div>
  );
};
