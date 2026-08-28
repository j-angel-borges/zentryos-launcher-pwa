import React from 'react';
import {
  Brush,
  Wand2,
  Zap,
  Compass,
  BookOpen,
  Sparkles
} from 'lucide-react';
import type { ScreenId, AgeTier } from '../../types/zentry';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { FisheyeBubbleGrid, type FisheyeItemData } from './FisheyeBubbleGrid';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';

interface Props {
  onBack: () => void;
  onNavigate: (screen: ScreenId) => void;
  ageTier?: AgeTier;
  isDark: boolean;
}

export const ZentryCreationScreen: React.FC<Props> = ({ 
  onBack, 
  onNavigate, 
  ageTier = 'toddler', 
  isDark 
}) => {
  // 1. Aplicaciones Sensoriales para Primera Infancia (2 a 5 años): Lienzo, Misiones y Simulador
  const toddlerCreationApps: FisheyeItemData[] = [
    {
      id: 'free_canvas',
      name: 'Lienzo',
      category: 'arte',
      icon: Brush,
      screen: 'free_canvas',
      gradient: 'from-pink-500 via-rose-500 to-red-500'
    },
    {
      id: 'real_missions',
      name: 'Misiones',
      category: 'juegos',
      icon: Compass,
      screen: 'real_missions',
      gradient: 'from-amber-400 via-orange-500 to-yellow-500'
    },
    {
      id: 'simulator',
      name: 'Simulador',
      category: 'personajes',
      icon: Sparkles,
      screen: 'simulator',
      gradient: 'from-purple-500 via-indigo-500 to-blue-600'
    }
  ];

  // 2. Herramientas Avanzadas de IA Exclusivas para Exploradores Escolares (5 a 10+ años)
  // Reemplazado Art-Attack por Lienzo
  const explorerCreationApps: FisheyeItemData[] = [
    {
      id: 'imagine_studio',
      name: 'Imagine AI',
      category: 'arte',
      icon: Wand2,
      screen: 'image_generator',
      gradient: 'from-amber-400 via-orange-500 to-pink-500'
    },
    {
      id: 'app_builder',
      name: 'Zentry Build',
      category: 'apps',
      icon: Zap,
      screen: 'app_builder',
      gradient: 'from-indigo-500 via-purple-500 to-pink-500'
    },
    {
      id: 'simulator',
      name: 'Simulador',
      category: 'simulacion',
      icon: Sparkles,
      screen: 'simulator',
      gradient: 'from-emerald-400 via-teal-500 to-cyan-600'
    },
    {
      id: 'redactor',
      name: 'Redactor',
      category: 'estudio',
      icon: BookOpen,
      screen: 'redactor',
      gradient: 'from-yellow-400 via-amber-500 to-orange-500'
    },
    {
      id: 'free_canvas',
      name: 'Lienzo',
      category: 'arte',
      icon: Brush,
      screen: 'free_canvas',
      gradient: 'from-pink-500 via-rose-500 to-red-500'
    }
  ];

  const handleOpenToddlerApp = (app: FisheyeItemData) => {
    sounds.playAppOpen();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
    voiceService.speakFeedback(`¡${app.name}!`);
    onNavigate(app.screen);
  };

  return (
    <ZentrySubPageScaffold
      title="Crear"
      kicker={ageTier === 'toddler' ? 'ESPACIO CREATIVO' : 'ESTUDIO DE CREACIÓN AI'}
      onBack={onBack}
      isDark={isDark}
    >
      <div className="w-full h-full relative overflow-hidden rounded-[28px] flex flex-col justify-center items-center">
        {ageTier === 'toddler' ? (
          /* Vista Táctil de Alto Impacto para 2-5 Años: 3 Grandes Tarjetas Squircles */
          <div className="w-full max-w-sm flex flex-col items-center justify-center gap-4 py-2">
            {toddlerCreationApps.map((app) => {
              const Icon = app.icon;
              return (
                <button
                  key={app.id}
                  onClick={() => handleOpenToddlerApp(app)}
                  className={`w-full py-4 px-5 rounded-[28px] flex items-center gap-4 cursor-pointer transition-all duration-200 zentry-spring-press border shadow-xl group ${
                    isDark
                      ? 'bg-[#120E24]/90 hover:bg-[#120E24] border-purple-400/40 text-white'
                      : 'bg-white/85 hover:bg-white border-pink-300/60 text-[#1E293B]'
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-[22px] bg-gradient-to-br ${app.gradient} flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-8 h-8 drop-shadow-md" />
                  </div>

                  <div className="flex-1 text-left min-w-0">
                    <span className="text-lg font-black tracking-tight block drop-shadow-sm">
                      {app.name}
                    </span>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isDark ? 'text-purple-300' : 'text-pink-600'
                      }`}
                    >
                      {app.category}
                    </span>
                  </div>

                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      isDark ? 'bg-white/10 text-purple-200' : 'bg-pink-100 text-pink-700'
                    }`}
                  >
                    ✨
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Vista Esférica Fisheye para 5-10 Años */
          <FisheyeBubbleGrid
            items={explorerCreationApps}
            onSelectApp={(app) => {
              onNavigate(app.screen);
            }}
            isDark={isDark}
          />
        )}
      </div>
    </ZentrySubPageScaffold>
  );
};

export default ZentryCreationScreen;
