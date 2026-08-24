import React, { useState } from 'react';
import { 
  Tv, 
  Play, 
  Heart, 
  Sparkles, 
  X, 
  ArrowLeft,
  Volume2,
  Smile,
  Star
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';
import { YOUTUBE_VIDEOS, UniversalMediaItem } from '../../services/entertainmentData';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryTubeScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [activeVideo, setActiveVideo] = useState<UniversalMediaItem | null>(null);
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});

  const kidCategories = [
    { label: 'Todos', emoji: '✨', voice: '¡Todos los videos!' },
    { label: 'Animales', emoji: '🦁', voice: '¡Videos de animalitos!' },
    { label: 'Canciones', emoji: '🎵', voice: '¡Canciones divertidas!' },
    { label: 'Dibujitos', emoji: '🎨', voice: '¡Dibujitos animados!' },
    { label: 'Espacio', emoji: '🚀', voice: '¡Viajes al espacio!' },
    { label: 'Carritos', emoji: '🚗', voice: '¡Carritos y camiones!' }
  ];

  const handleSelectCategory = (cat: typeof kidCategories[0]) => {
    sounds.playTap();
    setSelectedCategory(cat.label);
    voiceService.speakFeedback(cat.voice);
  };

  const handleOpenVideo = (video: UniversalMediaItem) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(35);
      } catch {}
    }
    sounds.playAppOpen();
    voiceService.speakFeedback('¡A ver el video!');
    setActiveVideo(video);
  };

  return (
    <div className="w-full h-full flex flex-col p-3 md:p-6 overflow-hidden z-10 select-none relative">
      {/* Outer Glass Card */}
      <div className={(isDark ? 'zentry-glass-dark ' : 'zentry-glass-light ') + 'flex-1 rounded-[36px] p-4 md:p-6 flex flex-col space-y-3 overflow-hidden shadow-2xl relative'}>
        
        {/* Top Header: Big Back Button & Pure Visual Brand */}
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
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/90 text-white shadow-lg border border-red-400/50">
            <Tv className="w-5 h-5" />
            <span className="text-sm font-black tracking-wide">VIDEOS</span>
            <span className="text-base">🎬</span>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              voiceService.speakFeedback('¡Toca un video para verlo en grande!');
            }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md border border-rose-300/40 zentry-press cursor-pointer"
            title="Escuchar"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>

        {/* Categories Bar: Big Floating Emoji Bubbles */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
          {kidCategories.map((cat) => {
            const isSelected = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => handleSelectCategory(cat)}
                className={`px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-black whitespace-nowrap cursor-pointer zentry-press transition-all border ${
                  isSelected
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg border-red-300 scale-105'
                    : isDark
                    ? 'bg-white/10 text-slate-200 border-white/10 hover:bg-white/20'
                    : 'bg-white/80 text-slate-700 border-white/50 hover:bg-white'
                }`}
              >
                <span className="text-lg">{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Videos Visual Grid (Large Thumbnails, Giant Play Buttons, 0 Text Clutter) */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {YOUTUBE_VIDEOS.map((video) => (
              <div
                key={video.id}
                onClick={() => handleOpenVideo(video)}
                className={(isDark ? 'bg-white/10 hover:bg-white/15 border-white/20 ' : 'bg-white/80 hover:bg-white border-white/60 ') + 'rounded-[28px] overflow-hidden border-2 cursor-pointer transition-all zentry-press shadow-lg group relative flex flex-col'}
              >
                {/* Visual Thumbnail with Giant Bouncy Play Icon */}
                <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                  <img
                    src={`https://img.youtube.com/vi/${video.mediaId}/hqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  
                  {/* Big Glowing Play Bubble Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.8)] border-2 border-white/80 group-hover:scale-115 transition-transform">
                      <Play className="w-7 h-7 fill-white ml-1" />
                    </div>
                  </div>

                  {/* Top-Right Playful Sparkle */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-full bg-black/50 backdrop-blur-md text-yellow-300 text-xs flex items-center gap-1 border border-white/20">
                    <Star className="w-3.5 h-3.5 fill-yellow-300" />
                  </div>
                </div>

                {/* Minimalist Visual Card Bottom: Big Friendly Title & Creator Avatar */}
                <div className="p-3 flex items-center gap-3">
                  <img
                    src={video.creatorAvatar}
                    alt={video.creator}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border-2 border-white/40 shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className={(isDark ? 'text-white ' : 'text-[#1E293B] ') + 'text-xs font-black line-clamp-1'}>
                      {video.title}
                    </h4>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playSuccess();
                      setLikedVideos((prev) => ({ ...prev, [video.id]: !prev[video.id] }));
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-125 ${
                      likedVideos[video.id]
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'bg-white/20 text-slate-300 hover:text-rose-400'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${likedVideos[video.id] ? 'fill-white' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kid Video Player Modal */}
        {activeVideo && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
            <div className={(isDark ? 'zentry-glass-dark text-white ' : 'zentry-glass-light text-[#1E293B] ') + 'w-full max-w-3xl rounded-[36px] p-4 shadow-2xl flex flex-col space-y-3 overflow-hidden border-2 border-white/40'}>
              
              {/* Modal Top Bar with Big Close Button */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl">🎬</span>
                  <span className="text-xs font-black truncate">{activeVideo.title}</span>
                </div>
                <button
                  onClick={() => {
                    sounds.playTap();
                    setActiveVideo(null);
                  }}
                  className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform"
                  title="Cerrar"
                >
                  <X className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>

              {/* In-App YouTube IFrame Player */}
              <div className="relative aspect-video w-full rounded-[24px] overflow-hidden bg-black shadow-2xl border-2 border-white/20">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.mediaId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Cheerful Bottom Bar */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <img
                    src={activeVideo.creatorAvatar}
                    alt={activeVideo.creator}
                    className="w-9 h-9 rounded-full object-cover border border-white/40"
                  />
                  <span className="text-xs font-bold text-slate-300">{activeVideo.creator}</span>
                </div>

                <button
                  onClick={() => {
                    sounds.playSuccess();
                    setLikedVideos((prev) => ({ ...prev, [activeVideo.id]: !prev[activeVideo.id] }));
                  }}
                  className={`px-4 py-2 rounded-full font-black text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all ${
                    likedVideos[activeVideo.id]
                      ? 'bg-rose-500 text-white scale-105'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${likedVideos[activeVideo.id] ? 'fill-white' : ''}`} />
                  <span>¡Me encanta!</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
