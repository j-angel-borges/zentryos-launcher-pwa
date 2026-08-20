import React, { useState } from 'react';
import { 
  Radio, 
  Search, 
  Eye, 
  Sparkles, 
  X, 
  CheckCircle2, 
  Flame,
  Gamepad2,
  Code,
  Globe
} from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { TWITCH_STREAMS, TwitchStreamItem } from '../../services/entertainmentData';
import { askZentryAi } from '../../services/aiService';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryStreamScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStream, setActiveStream] = useState<TwitchStreamItem | null>(null);

  const categories = [
    'Todos',
    'Software & Código',
    'Ciencia & Astronomía',
    'Ajedrez & Lógica',
    'Robótica',
    'Desarrollo de Videojuegos'
  ];

  const filteredStreams = TWITCH_STREAMS.filter((s) => {
    if (selectedCategory !== 'Todos' && s.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return s.title.toLowerCase().includes(q) || s.channel.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <ZentrySubPageScaffold title="ZentryStream" kicker="TWITCH GUARD" onBack={onBack} isDark={isDark}>
      <div className="max-w-3xl mx-auto w-full h-full flex flex-col space-y-3 overflow-hidden">
        {/* Top Twitch Header Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md">
              <Radio className="w-4 h-4" />
            </div>
            <div className="font-black text-sm tracking-tight text-white flex items-center gap-1">
              <span>Zentry</span>
              <span className="text-purple-400 font-extrabold">Stream</span>
            </div>
          </div>

          <div className="flex-1 max-w-sm relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar entre 50 transmisiones en vivo..."
              className={(isDark ? 'bg-white/10 text-white placeholder-slate-400 border-white/20 ' : 'bg-white/80 text-[#1E293B] placeholder-slate-400 border-white/60 ') + 'w-full pl-9 pr-3 py-1.5 rounded-full border text-xs font-medium focus:outline-none'}
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sounds.playTap();
                setSelectedCategory(cat);
              }}
              className={(selectedCategory === cat ? 'bg-purple-600 text-white font-bold shadow-md ' : (isDark ? 'bg-white/10 text-slate-300 ' : 'bg-white/80 text-slate-700 ')) + 'px-3 py-1 rounded-full text-[11px] whitespace-nowrap cursor-pointer zentry-press transition-all border border-white/10'}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Streams Grid */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredStreams.map((stream) => (
              <div
                key={stream.id}
                onClick={() => {
                  sounds.playTap();
                  setActiveStream(stream);
                }}
                className={(isDark ? 'bg-white/10 hover:bg-white/15 border-white/15 ' : 'bg-white/85 hover:bg-white border-white/40 ') + 'rounded-[22px] overflow-hidden border cursor-pointer transition-all zentry-press shadow-md group flex flex-col justify-between'}
              >
                {/* Stream Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                  <img
                    src={stream.thumbnail}
                    alt={stream.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* LIVE Badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-red-600 text-[10px] font-black text-white flex items-center gap-1 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span>EN VIVO</span>
                  </div>

                  {/* Viewer Count */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-white flex items-center gap-1 font-bold">
                    <Eye className="w-3 h-3 text-purple-400" />
                    <span>{stream.viewerCount}</span>
                  </div>
                </div>

                {/* Stream Details */}
                <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div className="flex items-start gap-2.5">
                    <img
                      src={stream.streamerAvatar}
                      alt={stream.channel}
                      className="w-7 h-7 rounded-full object-cover shrink-0 border border-purple-400 mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className={(isDark ? 'text-white ' : 'text-[#1E293B] ') + 'text-xs font-bold line-clamp-2 leading-snug group-hover:text-purple-300 transition-colors'}>
                        {stream.title}
                      </h4>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
                        <span className="font-semibold text-purple-300">@{stream.channel}</span>
                        <span>•</span>
                        <span>{stream.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Twitch Live Stream Modal Player */}
        {activeStream && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
            <div className={(isDark ? 'zentry-glass-dark text-white ' : 'zentry-glass-light text-[#1E293B] ') + 'w-full max-w-3xl max-h-[92vh] rounded-[28px] p-4 shadow-2xl flex flex-col space-y-3 overflow-hidden border border-white/30'}>
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-bold truncate">{activeStream.title}</span>
                </div>
                <button
                  onClick={() => {
                    sounds.playTap();
                    setActiveStream(null);
                  }}
                  className="p-1.5 rounded-full hover:bg-white/20 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Official Twitch IFrame Player */}
              <div className="relative aspect-video w-full rounded-[20px] overflow-hidden bg-black shadow-lg border border-white/10">
                <iframe
                  src={`https://player.twitch.tv/?channel=${activeStream.channel}&parent=zentryos.web.app&parent=localhost&muted=false&autoplay=true`}
                  title={activeStream.title}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={activeStream.streamerAvatar}
                    alt={activeStream.channel}
                    className="w-8 h-8 rounded-full object-cover border border-purple-400"
                  />
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1">
                      <span>{activeStream.channel}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <div className="text-[10px] text-slate-400">{activeStream.category}</div>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-purple-600/30 text-purple-300 text-xs font-bold border border-purple-400/30">
                  {activeStream.viewerCount}
                </span>
              </div>

              {/* Stream Description */}
              <div className="text-xs text-slate-300 bg-white/5 p-3 rounded-[18px]">
                <p className="leading-relaxed text-[11px]">{activeStream.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ZentrySubPageScaffold>
  );
};
