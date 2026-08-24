import React, { useState } from 'react';
import { Search, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentrySafeBrowserScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [search, setSearch] = useState('');

  const feeds = [
    {
      title: '¿Por qué no podemos superar la velocidad de la luz?',
      channel: 'Kurzgesagt — En Pocas Palabras',
      duration: '10:45',
      category: 'Física & Cosmos',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop'
    },
    {
      title: 'Construyendo un robot con Arduino desde cero',
      channel: 'Robotics Academy Latam',
      duration: '14:20',
      category: 'Tecnología & Código',
      thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=600&auto=format&fit=crop'
    },
    {
      title: 'El Imperio Inca y su asombrosa ingeniería hidráulica',
      channel: 'Historia del Perú Ilustrada',
      duration: '12:15',
      category: 'Historia & Cultura',
      thumbnail: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=600&auto=format&fit=crop'
    },
    {
      title: 'Cómo dibujar anatomía humana con proporciones perfectas',
      channel: 'Art Masters',
      duration: '15:00',
      category: 'Arte & Diseño',
      thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop'
    }
  ];

  return (
    <ZentrySubPageScaffold title="Explorador Seguro & YouTube Guard" kicker="GOBERNANZA" onBack={onBack} isDark={isDark}>
      <div className="space-y-4">
        <div className="p-4 rounded-[22px] bg-rose-500/15 border border-rose-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-500 shrink-0" />
            <div>
              <div className="text-xs font-bold text-rose-400">Algoritmo de Shorts & Dopamina Rápida Interceptado</div>
              <div className="text-[11px] text-slate-300">Reemplazado por el Algoritmo Zentry de Pasiones y Ciencia.</div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>100% Protegido</span>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar videos educativos o contenido seguro..."
            className={(isDark ? 'bg-white/10 text-white placeholder-white/40 ' : 'bg-white/80 text-[#1E293B] placeholder-slate-400 ') + 'w-full pl-10 pr-4 py-2.5 rounded-[20px] text-xs font-medium focus:outline-none'}
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {feeds.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                sounds.playSuccess();
                alert('Reproduciendo: ' + item.title);
              }}
              className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[20px] overflow-hidden cursor-pointer zentry-press group'}
            >
              <div className="relative h-32 w-full overflow-hidden">
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-white flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{item.duration}</span>
                </div>
              </div>
              <div className="p-3 space-y-1">
                <h4 className={(isDark ? 'text-white ' : 'text-[#1E293B] ') + 'text-xs font-bold truncate'}>
                  {item.title}
                </h4>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>{item.channel}</span>
                  <span className="text-sky-400">{item.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ZentrySubPageScaffold>
  );
};
