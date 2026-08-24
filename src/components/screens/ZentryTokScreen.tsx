import React, { useState } from 'react';
import { 
  Heart, 
  Music, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  ArrowLeft,
  Volume2,
  Smile,
  Star
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';
import { TIKTOK_SHORTS } from '../../services/entertainmentData';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryTokScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedShorts, setLikedShorts] = useState<Record<string, boolean>>({});

  const currentShort = TIKTOK_SHORTS[currentIndex] || TIKTOK_SHORTS[0];

  const handleNext = () => {
    if (currentIndex < TIKTOK_SHORTS.length - 1) {
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
      try { navigator.vibrate(40); } catch {}
    }
    sounds.playSuccess();
    setLikedShorts((prev) => ({ ...prev, [currentShort.id]: !prev[currentShort.id] }));
    voiceService.speakFeedback('¡Qué divertido!');
  };

  return (
    <div className="w-full h-full flex flex-col p-3 md:p-6 overflow-hidden z-10 select-none relative">
      {/* Outer Glass Card */}
      <div className={(isDark ? 'zentry-glass-dark ' : 'zentry-glass-light ') + 'flex-1 rounded-[36px] p-4 md:p-6 flex flex-col items-center justify-between overflow-hidden shadow-2xl relative'}>
        
        {/* Top Header: Big Back Button, Brand Icon & Voice Trigger */}
        <div className="w-full flex items-center justify-between z-30 pb-1">
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

          {/* Graphic Pill */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white shadow-lg border border-pink-300/40">
            <Music className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-sm font-black tracking-wide">MÚSICA</span>
            <span className="text-base">💃</span>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              voiceService.speakFeedback('¡Toca las flechas para ver más videos musicales!');
            }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-md border border-cyan-300/40 zentry-press cursor-pointer"
            title="Escuchar"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>

        {/* Center: Vertical Video Stage with Giant Floating Buttons */}
        <div className="relative w-full max-w-sm h-full max-h-[72vh] rounded-[34px] overflow-hidden bg-black shadow-2xl border-2 border-white/30 flex flex-col justify-between my-auto">
          {/* Embedded Vertical Player */}
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

          {/* Gentle Gradient Shadows */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/70 z-10" />

          {/* Top Emoji Indicator */}
          <div className="relative z-20 p-3 flex items-center justify-between">
            <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-black flex items-center gap-1.5 border border-white/20">
              <span className="text-base">✨</span>
              <span>{currentIndex + 1} / {TIKTOK_SHORTS.length}</span>
            </div>
          </div>

          {/* Right Giant Floating Touch Bubbles */}
          <div className="absolute right-3 bottom-14 z-20 flex flex-col items-center gap-3">
            {/* Giant Heart Button */}
            <button
              onClick={handleHeartTap}
              className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer zentry-press shadow-2xl transition-all border-2 border-white/60 ${
                likedShorts[currentShort.id]
                  ? 'bg-gradient-to-tr from-pink-500 to-rose-600 text-white scale-110 shadow-[0_0_20px_rgba(244,63,94,0.8)]'
                  : 'bg-black/60 backdrop-blur-md text-white hover:bg-black/80'
              }`}
            >
              <Heart className={`w-8 h-8 ${likedShorts[currentShort.id] ? 'fill-white' : ''}`} />
            </button>

            {/* Sparkle Cheer Button */}
            <button
              onClick={() => {
                sounds.playSuccess();
                voiceService.speakFeedback('¡A bailar!');
              }}
              className="w-13 h-13 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 text-white flex items-center justify-center shadow-lg border-2 border-white/50 zentry-press cursor-pointer"
            >
              <Sparkles className="w-7 h-7" />
            </button>
          </div>

          {/* Left/Right Floating Navigation Arrows */}
          <div className="absolute left-3 bottom-14 z-20 flex flex-col gap-2.5">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="w-13 h-13 rounded-full bg-white/25 backdrop-blur-md border-2 border-white/60 text-white flex items-center justify-center hover:bg-white/40 disabled:opacity-20 cursor-pointer shadow-lg zentry-press"
              title="Anterior"
            >
              <ChevronUp className="w-8 h-8 stroke-[3]" />
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === TIKTOK_SHORTS.length - 1}
              className="w-13 h-13 rounded-full bg-white/25 backdrop-blur-md border-2 border-white/60 text-white flex items-center justify-center hover:bg-white/40 disabled:opacity-20 cursor-pointer shadow-lg zentry-press"
              title="Siguiente"
            >
              <ChevronDown className="w-8 h-8 stroke-[3]" />
            </button>
          </div>

          {/* Minimalist Bottom Bar */}
          <div className="relative z-20 p-3 flex items-center justify-center">
            <div className="px-4 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-black truncate max-w-[220px]">
              {currentShort.title}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

