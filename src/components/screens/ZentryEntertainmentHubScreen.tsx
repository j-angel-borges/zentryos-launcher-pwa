import React from 'react';
import { 
  Tv, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  Flame, 
  Image as ImageIcon,
  Radio
} from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import type { ScreenId } from '../../types/zentry';
import { YOUTUBE_VIDEOS, TIKTOK_SHORTS, INSTAGRAM_POSTS, TWITCH_STREAMS } from '../../services/entertainmentData';

interface Props {
  onBack: () => void;
  onNavigate: (screen: ScreenId) => void;
  isDark: boolean;
}

export const ZentryEntertainmentHubScreen: React.FC<Props> = ({ onBack, onNavigate, isDark }) => {
  const apps = [
    {
      id: 'zentry_tube' as ScreenId,
      name: 'ZentryTube',
      subtitle: 'Videos & Documentales HD',
      count: `${YOUTUBE_VIDEOS.length} videos curados`,
      color: 'from-red-600 to-rose-700',
      badge: 'YouTube Guard',
      icon: Tv,
      description: 'Canales de ciencia, física, historia, robótica y música sin anuncios invasivos ni recomendaciones tóxicas.'
    },
    {
      id: 'zentry_tok' as ScreenId,
      name: 'ZentryTok',
      subtitle: 'Shorts & Píldoras de Ciencia',
      count: `${TIKTOK_SHORTS.length} shorts verticales`,
      color: 'from-cyan-500 via-purple-600 to-pink-500',
      badge: 'TikTok Guard',
      icon: Flame,
      description: 'Formato vertical 9:16 con trucos matemáticos, experimentos rápidos y astrofísica en 60 segundos.'
    },
    {
      id: 'zentry_gram' as ScreenId,
      name: 'ZentryGram',
      subtitle: 'Infografías & Astrofotografía',
      count: `${INSTAGRAM_POSTS.length} publicaciones`,
      color: 'from-amber-500 via-rose-500 to-purple-600',
      badge: 'Instagram Guard',
      icon: ImageIcon,
      description: 'Feed visual con fotografías de la NASA, National Geographic, esquemas biológicos y mapas históricos.'
    },
    {
      id: 'zentry_stream' as ScreenId,
      name: 'ZentryStream',
      subtitle: 'Transmisiones en Directo',
      count: `${TWITCH_STREAMS.length} streams en vivo`,
      color: 'from-purple-600 to-indigo-700',
      badge: 'Twitch Guard',
      icon: Radio,
      description: 'Emisiones en tiempo real de programación, ajedrez, robótica y exploración espacial desde la ISS.'
    }
  ];

  return (
    <ZentrySubPageScaffold title="Entretenimiento Seguro" kicker="MEDIA & REDES EDUCATIVAS" onBack={onBack} isDark={isDark}>
      <div className="max-w-2xl mx-auto w-full h-full flex flex-col space-y-4 overflow-y-auto pr-1">
        {/* Parent Shield & Dopamine Interception Banner */}
        <div className="p-4 rounded-[24px] bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-purple-400/30 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs md:text-sm font-bold text-white">Escudo Zentry de Medios Activo</div>
              <div className="text-[11px] text-slate-300">
                4 Plataformas oficiales supervisadas con 200 contenidos curados en ciencias, arte y tecnología.
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-emerald-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Protegido</span>
          </div>
        </div>

        {/* 4 Main Curated Apps Grid */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 px-1">
            Aplicaciones de Entretenimiento Curado (50 Contenidos c/u)
          </div>

          <div className="grid grid-cols-1 gap-3">
            {apps.map((app) => {
              const Icon = app.icon;
              return (
                <div
                  key={app.id}
                  onClick={() => {
                    sounds.playAppOpen();
                    onNavigate(app.id);
                  }}
                  className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'p-4 rounded-[26px] border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer transition-all zentry-press shadow-md group hover:border-indigo-400/40'}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-7 h-7" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-white">{app.name}</h3>
                        <span className="px-2 py-0.2 rounded-full bg-white/10 text-[9px] font-bold text-purple-300 border border-white/10">
                          {app.badge}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-indigo-300">{app.subtitle}</div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {app.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2 shrink-0 border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
                    <span className="text-[10px] font-semibold text-slate-400 bg-white/10 px-2.5 py-1 rounded-full">
                      {app.count}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 group-hover:text-white group-hover:bg-indigo-600 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ZentrySubPageScaffold>
  );
};
