import React, { useState } from 'react';
import { 
  Search, 
  GraduationCap, 
  Tv, 
  Camera, 
  Palette, 
  Compass, 
  Calculator, 
  Award,
  X
} from 'lucide-react';
import type { ActiveAppId } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (appId: ActiveAppId) => void;
}

export const AppDrawer: React.FC<Props> = ({ isOpen, onClose, onOpenApp }) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const allApps = [
    {
      id: 'study_assistant' as ActiveAppId,
      name: 'Tutor Socrático MINEDU',
      category: 'Educación & IA',
      icon: GraduationCap,
      color: 'from-sky-500 to-blue-600',
      description: 'Asistente de razonamiento paso a paso para tareas y exámenes.'
    },
    {
      id: 'youtube_guard' as ActiveAppId,
      name: 'Escudo YouTube & Redes',
      category: 'Gobernanza',
      icon: Tv,
      color: 'from-rose-500 to-red-600',
      description: 'Reemplaza el algoritmo adictivo por el algoritmo de pasiones.'
    },
    {
      id: 'camera_tutor' as ActiveAppId,
      name: 'Cámara Multimodal IA',
      category: 'Educación & IA',
      icon: Camera,
      color: 'from-purple-500 to-indigo-600',
      description: 'Escanea problemas impresos y diagramas para resolverlos.'
    },
    {
      id: 'neuro_art' as ActiveAppId,
      name: 'NeuroArt Studio',
      category: 'Creatividad',
      icon: Palette,
      color: 'from-pink-500 to-rose-600',
      description: 'Generación artística guiada y lienzo de dibujo digital.'
    },
    {
      id: 'world_generator' as ActiveAppId,
      name: 'Generador de Mundos 3D',
      category: 'Creatividad',
      icon: Compass,
      color: 'from-amber-500 to-orange-600',
      description: 'Simulaciones interactivas de ciencias y civilizaciones.'
    },
    {
      id: 'calculator' as ActiveAppId,
      name: 'Calculadora Científica IA',
      category: 'Herramientas',
      icon: Calculator,
      color: 'from-emerald-500 to-teal-600',
      description: 'Cálculos matemáticos con desglose didáctico.'
    },
    {
      id: 'passport' as ActiveAppId,
      name: 'Pasaporte Digital del Menor',
      category: 'Perfil Vivo',
      icon: Award,
      color: 'from-violet-500 to-purple-600',
      description: 'Radar de curiosidad, rachas de aprendizaje y talentos detectados.'
    }
  ];

  const filtered = allApps.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="absolute inset-0 z-50 bg-[#070b14]/90 backdrop-blur-2xl flex flex-col p-6 animate-in fade-in duration-200 text-white overflow-hidden">
      <div className="flex items-center justify-between gap-4 pb-6 border-b border-white/10 max-w-3xl mx-auto w-full">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar micro-aplicaciones, materias o herramientas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/10 border border-white/15 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 transition-colors"
            autoFocus
          />
        </div>
        <button
          onClick={() => {
            sounds.playTap();
            onClose();
          }}
          className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-300 hover:text-white transition-all cursor-pointer active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 max-w-3xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.id}
                onClick={() => {
                  sounds.playAppOpen();
                  onOpenApp(app.id);
                  onClose();
                }}
                className="liquid-glass-card liquid-glass-interactive rounded-2xl p-4 flex items-start gap-4 cursor-pointer group"
              >
                <div className={'w-12 h-12 rounded-2xl bg-gradient-to-br ' + app.color + ' flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-105 transition-transform'}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-sky-300 transition-colors">
                      {app.name}
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-white/5">
                      {app.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {app.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
