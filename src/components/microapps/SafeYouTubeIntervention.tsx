import React from 'react';
import { Sparkles, CheckCircle2, Play, Clock, Brain, TrendingDown, Tv } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

export const SafeYouTubeIntervention: React.FC = () => {
  const educationalFeeds = [
    {
      id: '1',
      title: '¿Por qué no podemos superar la velocidad de la luz?',
      channel: 'Kurzgesagt — En Pocas Palabras',
      duration: '10:45',
      category: 'Física & Cosmos',
      skill: 'Pensamiento Científico',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: '2',
      title: 'Construyendo un robot con Arduino desde cero',
      channel: 'Robotics Academy Latam',
      duration: '14:20',
      category: 'Tecnología & Código',
      skill: 'Ingeniería',
      thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: '3',
      title: 'El Imperio Inca y su asombrosa ingeniería hidráulica',
      channel: 'Historia del Perú Ilustrada',
      duration: '12:15',
      category: 'Historia & Cultura',
      skill: 'Cultura General',
      thumbnail: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: '4',
      title: 'Cómo dibujar anatomía humana con proporciones perfectas',
      channel: 'Art Masters',
      duration: '15:00',
      category: 'Arte & Diseño',
      skill: 'Expresión Artística',
      thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-6 text-white animate-in fade-in duration-300">
      <div className="liquid-glass rounded-3xl p-6 border border-rose-500/30 shadow-2xl bg-gradient-to-r from-rose-950/40 via-slate-900/60 to-indigo-950/40 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-500/20">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase tracking-wider border border-rose-500/30">
                  Gobernanza Algorítmica Activa
                </span>
                <span className="text-xs text-slate-400">Filtro ZentryOS</span>
              </div>
              <h2 className="text-lg font-extrabold text-white tracking-tight">
                Algoritmo de Shorts & Dopamina Rápida Interceptado
              </h2>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Soberanía Familiar 100%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
            <div className="font-bold text-rose-300 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4" />
              <span>Algoritmo Nativo de Redes (Bloqueado)</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Scroll infinito, dopamina rápida, pérdida de concentración y retención forzada con videos de 15 segundos.
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 space-y-1">
            <div className="font-bold text-sky-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Algoritmo Zentry de Pasiones (Activo)</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Contenido estructurado, habilidades STEM, ciencia, arte y desarrollo de talentos reales según los intereses del menor.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm tracking-wide text-slate-200">
            <Brain className="w-4 h-4 text-sky-400" />
            <span>Feed Educativo Calibrado para Mateo (11 años)</span>
          </div>
          <span className="text-xs text-sky-400 font-semibold">4 contenidos de alto valor</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {educationalFeeds.map((item) => (
            <div
              key={item.id}
              onClick={() => sounds.playSuccess()}
              className="liquid-glass-card liquid-glass-interactive rounded-3xl overflow-hidden border border-white/15 shadow-xl cursor-pointer group flex flex-col justify-between"
            >
              <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-sky-300 border border-white/10">
                  {item.category}
                </div>
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-mono text-white flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{item.duration}</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <div className="w-12 h-12 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/50 scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span className="truncate font-medium">{item.channel}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-semibold border border-emerald-500/20">
                    ✨ {item.skill}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
