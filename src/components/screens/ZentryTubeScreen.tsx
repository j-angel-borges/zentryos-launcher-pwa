import React, { useState } from 'react';
import { 
  Play, 
  Heart, 
  Sparkles, 
  X, 
  ArrowLeft,
  Volume2,
  CheckCircle,
  Share2,
  ThumbsUp,
  Flame,
  Tv
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';
import { YOUTUBE_VIDEOS, UniversalMediaItem } from '../../services/entertainmentData';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryTubeScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [selectedFilter, setSelectedFilter] = useState<'Todos' | 'Entretenimiento para Niños' | 'Curiosidades y Descubrimientos'>('Todos');
  const [activeVideo, setActiveVideo] = useState<UniversalMediaItem | null>(null);
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});

  const filterTabs = [
    { id: 'Todos', label: 'Todos', emoji: '🔴', count: YOUTUBE_VIDEOS.length },
    { id: 'Entretenimiento para Niños', label: 'Entretenimiento', emoji: '🎭', count: 25 },
    { id: 'Curiosidades y Descubrimientos', label: 'Curiosidades', emoji: '🔬', count: 25 }
  ];

  const filteredVideos = YOUTUBE_VIDEOS.filter((v) => {
    if (selectedFilter === 'Todos') return true;
    return v.category === selectedFilter;
  });

  const handleSelectFilter = (tabId: typeof selectedFilter, label: string) => {
    sounds.playTap();
    setSelectedFilter(tabId);
    voiceService.speakFeedback(`¡Videos de ${label}!`);
  };

  const handleOpenVideo = (video: UniversalMediaItem) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(35); } catch {}
    }
    sounds.playAppOpen();
    voiceService.speakFeedback(video.title);
    setActiveVideo(video);
  };

  return (
    <div className="w-full h-full flex flex-col p-2 sm:p-4 md:p-6 overflow-hidden z-10 select-none relative">
      {/* Outer Main YouTube Container */}
      <div className={(isDark ? 'bg-[#0f0f0f] text-white ' : 'bg-[#f9f9f9] text-[#0f0f0f] ') + 'flex-1 rounded-[32px] sm:rounded-[40px] p-3 sm:p-5 md:p-6 flex flex-col space-y-3 overflow-hidden shadow-2xl border border-white/10 relative'}>
        
        {/* Top YouTube Header Bar */}
        <div className="flex items-center justify-between z-20 pb-1 shrink-0">
          {/* Back Button */}
          <button
            onClick={() => {
              sounds.playTap();
              onBack();
            }}
            className={(isDark ? 'bg-white/10 hover:bg-white/20 text-white ' : 'bg-black/5 hover:bg-black/10 text-slate-800 ') + 'w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all zentry-press cursor-pointer shadow-sm border border-white/10'}
            title="Volver"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Authentic YouTube Kids Logo Mark */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 text-white shadow-lg border border-red-400/40">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
              <path fill="#FFFFFF" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
              <path fill="#FF0000" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span className="font-black text-sm tracking-tighter">YouTube</span>
          </div>

          {/* Voice Prompt Trigger */}
          <button
            onClick={() => {
              sounds.playTap();
              voiceService.speakFeedback('¡Toca un video para verlo en pantalla completa!');
            }}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white shadow-md border border-rose-300/40 zentry-press cursor-pointer"
            title="Escuchar"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>

        {/* YouTube Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5 shrink-0">
          {filterTabs.map((tab) => {
            const isSelected = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectFilter(tab.id as any, tab.label)}
                className={`px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-black whitespace-nowrap cursor-pointer zentry-press transition-all border ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-lg border-red-400 scale-105'
                    : isDark
                    ? 'bg-white/10 text-slate-200 border-white/10 hover:bg-white/20'
                    : 'bg-black/5 text-slate-700 border-black/10 hover:bg-black/10'
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-75 px-1.5 py-0.5 rounded-full bg-black/20">{tab.count}</span>
              </button>
            );
          })}
        </div>

        {/* YouTube Feed: Authentic 16:9 Video Cards Grid */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => handleOpenVideo(video)}
                className={(isDark ? 'bg-[#181818] hover:bg-[#222222] border-white/10 ' : 'bg-white hover:bg-slate-50 border-black/5 ') + 'rounded-[24px] overflow-hidden border cursor-pointer transition-all zentry-press shadow-md hover:shadow-xl group relative flex flex-col'}
              >
                {/* 16:9 Thumbnail Stage */}
                <div className="relative aspect-video w-full overflow-hidden bg-black/80">
                  <img
                    src={`https://img.youtube.com/vi/${video.mediaId}/hqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  
                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[11px] font-bold">
                    {video.duration || 'HD'}
                  </div>

                  {/* Giant Central Red Play Bubble */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.8)] border-2 border-white group-hover:scale-115 transition-transform">
                      <Play className="w-7 h-7 fill-white ml-1" />
                    </div>
                  </div>
                </div>

                {/* Video Info Row */}
                <div className="p-3.5 flex items-start gap-3">
                  <img
                    src={video.creatorAvatar}
                    alt={video.creator}
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/20 shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className={(isDark ? 'text-white ' : 'text-slate-900 ') + 'text-xs font-bold line-clamp-2 leading-snug'}>
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400 font-semibold">
                      <span className="truncate max-w-[140px]">{video.creator}</span>
                      <CheckCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </div>
                  </div>

                  {/* Heart Like Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playSuccess();
                      setLikedVideos((prev) => ({ ...prev, [video.id]: !prev[video.id] }));
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-transform active:scale-125 ${
                      likedVideos[video.id]
                        ? 'bg-red-600 text-white shadow-md'
                        : isDark ? 'bg-white/10 text-slate-400 hover:text-red-400' : 'bg-black/5 text-slate-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${likedVideos[video.id] ? 'fill-white' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* In-App YouTube Theater Player Modal */}
        {activeVideo && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in">
            <div className={(isDark ? 'bg-[#0f0f0f] text-white ' : 'bg-white text-slate-900 ') + 'w-full max-w-4xl rounded-[32px] sm:rounded-[40px] p-4 sm:p-6 shadow-2xl flex flex-col space-y-4 overflow-hidden border border-white/20'}>
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-1 shrink-0">
                <div className="flex items-center gap-2 min-w-0 pr-3">
                  <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-black truncate">{activeVideo.title}</h3>
                </div>

                <button
                  onClick={() => {
                    sounds.playTap();
                    setActiveVideo(null);
                  }}
                  className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all shrink-0"
                  title="Cerrar"
                >
                  <X className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>

              {/* YouTube IFrame Embed Player */}
              <div className="relative aspect-video w-full rounded-[24px] overflow-hidden bg-black shadow-2xl border border-white/20">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.mediaId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Channel Info & Action Buttons */}
              <div className="flex items-center justify-between pt-1 shrink-0">
                <div className="flex items-center gap-3">
                  <img
                    src={activeVideo.creatorAvatar}
                    alt={activeVideo.creator}
                    className="w-10 h-10 rounded-full object-cover border border-white/30"
                  />
                  <div>
                    <h4 className="text-xs font-black">{activeVideo.creator}</h4>
                    <span className="text-[10px] text-slate-400">{activeVideo.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sounds.playSuccess();
                      setLikedVideos((prev) => ({ ...prev, [activeVideo.id]: !prev[activeVideo.id] }));
                    }}
                    className={`px-4 py-2 rounded-full font-black text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all ${
                      likedVideos[activeVideo.id]
                        ? 'bg-red-600 text-white scale-105'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${likedVideos[activeVideo.id] ? 'fill-white' : ''}`} />
                    <span>¡Me gusta!</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
