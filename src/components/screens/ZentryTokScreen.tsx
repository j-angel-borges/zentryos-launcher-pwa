import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Music2, 
  ChevronUp, 
  ChevronDown, 
  ArrowLeft,
  Volume2,
  CheckCircle,
  Plus
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';
import { TIKTOK_SHORTS, UniversalMediaItem } from '../../services/entertainmentData';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryTokScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [selectedFilter, setSelectedFilter] = useState<'Todos' | 'Entretenimiento para Niños' | 'Curiosidades y Naturaleza'>('Todos');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedShorts, setLikedShorts] = useState<Record<string, boolean>>({});
  const [savedShorts, setSavedShorts] = useState<Record<string, boolean>>({});

  const filteredShorts = TIKTOK_SHORTS.filter((s) => {
    if (selectedFilter === 'Todos') return true;
    return s.category === selectedFilter;
  });

  const currentShort: UniversalMediaItem = filteredShorts[currentIndex] || filteredShorts[0] || TIKTOK_SHORTS[0];

  const handleNext = () => {
    if (currentIndex < filteredShorts.length - 1) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(30); } catch {}
      }
      sounds.playTap();
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(30); } catch {}
      }
      sounds.playTap();
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleHeartTap = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(45); } catch {}
    }
    sounds.playSuccess();
    setLikedShorts((prev) => ({ ...prev, [currentShort.id]: !prev[currentShort.id] }));
    voiceService.speakFeedback('¡Me encanta!');
  };

  const handleBookmarkTap = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(25); } catch {}
    }
    sounds.playTap();
    setSavedShorts((prev) => ({ ...prev, [currentShort.id]: !prev[currentShort.id] }));
  };

  return (
    <div className="w-full h-full flex flex-col p-2 sm:p-4 overflow-hidden z-10 select-none relative bg-black">
      {/* Outer TikTok Enclosure */}
      <div className="flex-1 rounded-[32px] sm:rounded-[40px] overflow-hidden flex flex-col items-center justify-between relative shadow-2xl border border-white/10 bg-[#020202]">
        
        {/* Top Header Overlay: Back, TikTok Category Tabs, Voice Assistant */}
        <div className="w-full flex items-center justify-between p-3 sm:p-4 z-30 relative bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {/* Back Button */}
          <button
            onClick={() => {
              sounds.playTap();
              onBack();
            }}
            className="w-11 h-11 rounded-2xl bg-black/50 backdrop-blur-md text-white flex items-center justify-center transition-all zentry-press cursor-pointer border border-white/20 shadow-md"
            title="Volver"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Authentic TikTok Tab Switcher */}
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/20">
            <button
              onClick={() => {
                sounds.playTap();
                setSelectedFilter('Entretenimiento para Niños');
                setCurrentIndex(0);
              }}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
                selectedFilter === 'Entretenimiento para Niños' ? 'bg-white text-black shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              🎭 Juegos
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                setSelectedFilter('Curiosidades y Naturaleza');
                setCurrentIndex(0);
              }}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
                selectedFilter === 'Curiosidades y Naturaleza' ? 'bg-white text-black shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              🌿 Naturaleza
            </button>
          </div>

          {/* Voice Prompt Trigger */}
          <button
            onClick={() => {
              sounds.playTap();
              voiceService.speakFeedback('¡Toca las flechas o desliza para ver más videos!');
            }}
            className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#00F2FE] to-[#FE2C55] flex items-center justify-center text-white shadow-md border border-white/30 zentry-press cursor-pointer"
            title="Escuchar"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>

        {/* 9:16 Vertical Video Player Stage */}
        <div className="relative w-full max-w-sm h-full max-h-[78vh] rounded-[28px] sm:rounded-[36px] overflow-hidden bg-black flex flex-col justify-between my-auto border border-white/15 shadow-2xl">
          {/* Real Embedded Player */}
          <div className="absolute inset-0 z-0 bg-black">
            <iframe
              key={currentShort.id}
              src={`https://www.youtube.com/embed/${currentShort.mediaId}?autoplay=1&controls=1&rel=0&loop=1&enablejsapi=1`}
              title={currentShort.title}
              className="w-full h-full object-cover border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Ambient Video Vignette */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/50 via-transparent to-black/80 z-10" />

          {/* Counter Badge */}
          <div className="relative z-20 p-3 flex justify-start">
            <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-black border border-white/20">
              {currentIndex + 1} / {filteredShorts.length}
            </div>
          </div>

          {/* Left Navigation Buttons (Large Toddler-Friendly Chevrons) */}
          <div className="absolute left-3 bottom-24 z-20 flex flex-col gap-3">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-black/80 disabled:opacity-20 cursor-pointer shadow-xl zentry-press"
              title="Anterior"
            >
              <ChevronUp className="w-7 h-7 stroke-[3]" />
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === filteredShorts.length - 1}
              className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-black/80 disabled:opacity-20 cursor-pointer shadow-xl zentry-press"
              title="Siguiente"
            >
              <ChevronDown className="w-7 h-7 stroke-[3]" />
            </button>
          </div>

          {/* Right Action Rail: Authentic TikTok Icons */}
          <div className="absolute right-3 bottom-8 z-20 flex flex-col items-center gap-4">
            {/* Creator Avatar with Follow Plus Badge */}
            <div className="relative">
              <img
                src={currentShort.creatorAvatar}
                alt={currentShort.creator}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
              />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#FE2C55] text-white flex items-center justify-center shadow-md">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>

            {/* Heart Like Button */}
            <div className="flex flex-col items-center">
              <button
                onClick={handleHeartTap}
                className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer zentry-press shadow-2xl transition-all ${
                  likedShorts[currentShort.id]
                    ? 'bg-[#FE2C55] text-white scale-110 shadow-[0_0_20px_rgba(254,44,85,0.8)]'
                    : 'bg-black/50 backdrop-blur-md text-white hover:bg-black/70'
                }`}
              >
                <Heart className={`w-7 h-7 ${likedShorts[currentShort.id] ? 'fill-white' : ''}`} />
              </button>
              <span className="text-[11px] font-black text-white mt-1 shadow-sm">{currentShort.viewsOrLikes}</span>
            </div>

            {/* Comment Button */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => {
                  sounds.playTap();
                  voiceService.speakFeedback('¡Comentarios amigables!');
                }}
                className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 shadow-lg cursor-pointer zentry-press"
              >
                <MessageCircle className="w-6 h-6 fill-white/20" />
              </button>
              <span className="text-[11px] font-black text-white mt-1">4.2K</span>
            </div>

            {/* Bookmark Button */}
            <button
              onClick={handleBookmarkTap}
              className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer zentry-press shadow-lg transition-all ${
                savedShorts[currentShort.id]
                  ? 'bg-amber-400 text-black scale-110 shadow-[0_0_15px_rgba(251,191,36,0.8)]'
                  : 'bg-black/50 backdrop-blur-md text-white hover:bg-black/70'
              }`}
            >
              <Bookmark className={`w-6 h-6 ${savedShorts[currentShort.id] ? 'fill-black' : ''}`} />
            </button>

            {/* Share Arrow */}
            <button
              onClick={() => {
                sounds.playSuccess();
                voiceService.speakFeedback('¡Compartir con papá y mamá!');
              }}
              className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 shadow-lg cursor-pointer zentry-press"
            >
              <Share2 className="w-6 h-6" />
            </button>

            {/* Spinning Vinyl Record with Music Disc */}
            <div className="w-11 h-11 rounded-full p-1.5 bg-gradient-to-tr from-[#050505] to-[#252525] border border-white/40 shadow-xl flex items-center justify-center animate-spin" style={{ animationDuration: '4s' }}>
              <div className="w-5 h-5 rounded-full bg-[#FE2C55] flex items-center justify-center text-white shadow-inner">
                <Music2 className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Bottom Info Overlay: Handle, Title & Music Marquee */}
          <div className="relative z-20 p-4 flex flex-col gap-1 text-white max-w-[240px]">
            <div className="flex items-center gap-1.5 font-black text-sm">
              <span>{currentShort.handle}</span>
              <CheckCircle className="w-3.5 h-3.5 text-[#00F2FE]" />
            </div>
            <p className="text-xs font-bold text-slate-200 line-clamp-2 leading-tight">
              {currentShort.title}
            </p>
            {/* Music Sound Ticker */}
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-300 font-semibold truncate">
              <Music2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Sonido Original - {currentShort.creator}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
