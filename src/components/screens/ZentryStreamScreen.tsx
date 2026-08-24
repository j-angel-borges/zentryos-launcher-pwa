import React, { useState } from 'react';
import { 
  Rocket, 
  Play, 
  Sparkles, 
  X, 
  ArrowLeft,
  Volume2,
  Star,
  Radio,
  Eye
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';
import { TWITCH_STREAMS, TwitchStreamItem } from '../../services/entertainmentData';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryStreamScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [activeStream, setActiveStream] = useState<TwitchStreamItem | null>(null);

  const handleOpenStream = (stream: TwitchStreamItem) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(35); } catch {}
    }
    sounds.playAppOpen();
    voiceService.speakFeedback('¡Conectando al espacio en vivo!');
    setActiveStream(stream);
  };

  return (
    <div className="w-full h-full flex flex-col p-3 md:p-6 overflow-hidden z-10 select-none relative">
      {/* Outer Glass Card */}
      <div className={(isDark ? 'zentry-glass-dark ' : 'zentry-glass-light ') + 'flex-1 rounded-[36px] p-4 md:p-6 flex flex-col space-y-3 overflow-hidden shadow-2xl relative'}>
        
        {/* Top Header: Big Back Button & Visual Brand */}
        <div className="flex items-center justify-between z-20 pb-1">
          <button
            onClick={() => {
              sounds.playTap();
              onBack();
            }}
            className={(isDark ? 'bg-white/15 hover:bg-white/25 text-white ' : 'bg-white/70 hover:bg-white/90 text-[#3B3B58] ') + 'w-12 h-12 rounded-2xl flex items-center justify-center transition-all zentry-press cursor-pointer shadow-md border border-white/30'}
            title="Volver"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Big Graphic Header */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-lg border border-indigo-300/40">
            <Rocket className="w-5 h-5" />
            <span className="text-sm font-black tracking-wide">ESTRELLAS</span>
            <span className="text-base">🚀</span>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              voiceService.speakFeedback('¡Toca para ver el espacio en directo!');
            }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md border border-purple-300/40 zentry-press cursor-pointer"
            title="Escuchar"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>

        {/* Streams Grid: Big Visual Cosmic Cards */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {TWITCH_STREAMS.map((stream) => (
              <div
                key={stream.id}
                onClick={() => handleOpenStream(stream)}
                className={(isDark ? 'bg-white/10 hover:bg-white/15 border-white/20 ' : 'bg-white/80 hover:bg-white border-white/60 ') + 'rounded-[28px] border-2 overflow-hidden shadow-xl cursor-pointer transition-all zentry-press group relative flex flex-col'}
              >
                {/* Visual Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                  <img
                    src={stream.thumbnail}
                    alt={stream.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* Pulsing Live Cosmic Pill */}
                  <div className="absolute top-2.5 left-2.5 px-3 py-1 rounded-full bg-red-600/95 text-white text-xs font-black flex items-center gap-1.5 shadow-lg border border-red-300/50">
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                    <span>EN VIVO</span>
                  </div>

                  {/* Giant Glowing Play Bubble Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.8)] border-2 border-white/80 group-hover:scale-115 transition-transform">
                      <Play className="w-7 h-7 fill-white ml-1" />
                    </div>
                  </div>

                  {/* Top-Right Star */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-full bg-black/50 backdrop-blur-md text-yellow-300 text-xs flex items-center gap-1 border border-white/20">
                    <Star className="w-3.5 h-3.5 fill-yellow-300" />
                  </div>
                </div>

                {/* Minimalist Bottom Bar */}
                <div className="p-3 flex items-center gap-3">
                  <img
                    src={stream.streamerAvatar}
                    alt={stream.channel}
                    className="w-9 h-9 rounded-full object-cover border-2 border-purple-400 shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className={(isDark ? 'text-white ' : 'text-[#1E293B] ') + 'text-xs font-black line-clamp-1'}>
                      {stream.title}
                    </h4>
                  </div>
                  <span className="text-2xl">✨</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Stream Full Modal Player */}
        {activeStream && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
            <div className={(isDark ? 'zentry-glass-dark text-white ' : 'zentry-glass-light text-[#1E293B] ') + 'w-full max-w-3xl rounded-[36px] p-4 shadow-2xl flex flex-col space-y-3 overflow-hidden border-2 border-white/40'}>
              
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl">🚀</span>
                  <span className="text-xs font-black truncate">{activeStream.title}</span>
                </div>
                <button
                  onClick={() => {
                    sounds.playTap();
                    setActiveStream(null);
                  }}
                  className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform"
                  title="Cerrar"
                >
                  <X className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>

              {/* Twitch Stream IFrame Player */}
              <div className="relative aspect-video w-full rounded-[24px] overflow-hidden bg-black shadow-2xl border-2 border-white/20">
                <iframe
                  src={`https://player.twitch.tv/?channel=${activeStream.channel}&parent=zentryos.web.app&parent=localhost&muted=false&autoplay=true`}
                  title={activeStream.title}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>

              {/* Bottom Channel Bar */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <img
                    src={activeStream.streamerAvatar}
                    alt={activeStream.channel}
                    className="w-9 h-9 rounded-full object-cover border border-purple-400"
                  />
                  <span className="text-xs font-bold text-purple-300">@{activeStream.channel}</span>
                </div>

                <div className="px-3 py-1 rounded-full bg-purple-600/40 text-purple-200 text-xs font-bold border border-purple-400/40 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-purple-300" />
                  <span>En directo</span>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

