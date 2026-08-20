import React from 'react';
import { 
  Sparkles, 
  Compass, 
  ArrowRight,
  Bot
} from 'lucide-react';
import type { CircadianRhythm, ActiveAppId } from '../../types/zentry';
import { CircadianRingWidget } from './CircadianRingWidget';
import { MicroAppDock } from './MicroAppDock';
import { sounds } from '../../services/soundEffects';

interface Props {
  circadian: CircadianRhythm;
  activeApp: ActiveAppId;
  onOpenApp: (appId: ActiveAppId) => void;
  onTriggerVoice: () => void;
}

export const HomeScreen: React.FC<Props> = ({
  circadian,
  activeApp,
  onOpenApp,
  onTriggerVoice
}) => {
  const passionMissions = [
    {
      title: '¿Por qué no podemos viajar más rápido que la luz?',
      tag: 'Astrofísica',
      duration: '8 min',
      app: 'study_assistant' as ActiveAppId,
      color: 'from-indigo-500/20 to-sky-500/20 border-sky-400/30'
    },
    {
      title: 'Diseña tu primera nave espacial con IA',
      tag: 'Creatividad 3D',
      duration: '12 min',
      app: 'neuro_art' as ActiveAppId,
      color: 'from-pink-500/20 to-purple-500/20 border-pink-400/30'
    },
    {
      title: 'Reto de Ecuaciones y Geometría',
      tag: 'Matemáticas MINEDU',
      duration: '10 min',
      app: 'calculator' as ActiveAppId,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-400/30'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col justify-between max-w-4xl mx-auto w-full z-20 space-y-6">
      <CircadianRingWidget
        circadian={circadian}
        onOpenStudy={() => onOpenApp('study_assistant')}
      />

      <div 
        onClick={() => {
          sounds.playTap();
          onTriggerVoice();
        }}
        className="liquid-glass-card liquid-glass-interactive rounded-3xl p-4 border border-indigo-400/30 flex items-center justify-between gap-4 cursor-pointer"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shadow-md">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Tutor Inteligente Zentry</span>
            </div>
            <div className="text-sm font-bold text-white">
              "¿En qué reto o tarea quieres que trabajemos hoy?"
            </div>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1">
          <span>Hablar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-200 tracking-wide">
            <Compass className="w-4 h-4 text-sky-400" />
            <span>Misiones de Curiosidad Seleccionadas</span>
          </div>
          <span className="text-slate-400 text-[11px]">Algoritmo de Pasiones Zentry</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {passionMissions.map((mission, idx) => (
            <div
              key={idx}
              onClick={() => {
                sounds.playAppOpen();
                onOpenApp(mission.app);
              }}
              className={'p-4 rounded-2xl bg-gradient-to-br ' + mission.color + ' border backdrop-blur-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-lg'}
            >
              <div className="space-y-1.5">
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-sky-200">
                  {mission.tag}
                </span>
                <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                  {mission.title}
                </h4>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium">
                <span>⏱️ {mission.duration}</span>
                <span className="text-sky-300 font-semibold flex items-center gap-0.5">
                  Comenzar <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MicroAppDock activeApp={activeApp} onOpenApp={onOpenApp} />
    </div>
  );
};
