import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Share2, 
  Bookmark, 
  Music, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Flame
} from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { TIKTOK_SHORTS, UniversalMediaItem } from '../../services/entertainmentData';
import { askZentryAi } from '../../services/aiService';
import { mediaPlaybackService } from '../../services/mediaPlaybackService';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryTokScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedShorts, setLikedShorts] = useState<Record<string, boolean>>({});
  const [bookmarkedShorts, setBookmarkedShorts] = useState<Record<string, boolean>>({});
  const [isAiInsightOpen, setIsAiInsightOpen] = useState(false);
  const [aiInsightText, setAiInsightText] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const currentShort = TIKTOK_SHORTS[currentIndex] || TIKTOK_SHORTS[0];

  useEffect(() => {
    if (currentShort) {
      mediaPlaybackService.playMedia({
        id: currentShort.id,
        mediaId: currentShort.mediaId,
        title: currentShort.title,
        creator: currentShort.creator,
        creatorAvatar: currentShort.creatorAvatar,
        category: currentShort.category,
        type: 'tiktok',
        sourceScreen: 'zentry_tok'
      });
    }
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < TIKTOK_SHORTS.length - 1) {
      sounds.playTap();
      setCurrentIndex((prev) => prev + 1);
      setIsAiInsightOpen(false);
      setAiInsightText(null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      sounds.playTap();
      setCurrentIndex((prev) => prev - 1);
      setIsAiInsightOpen(false);
      setAiInsightText(null);
    }
  };

  const handleFetchAiInsight = async (short: UniversalMediaItem) => {
    sounds.playTap();
    setIsLoadingInsight(true);
    setIsAiInsightOpen(true);

    try {
      const prompt = `Explica en 2 párrafos concisos y fascinantes la ciencia o matemática detrás de este Short: "${short.title}".
Tópico: ${short.category}. Explícaselo a un estudiante con asombro y claridad.`;

      const res = await askZentryAi('general_ai', prompt);
      sounds.playSuccess();
      setAiInsightText(res);
    } catch {
      setAiInsightText(`Este short demuestra conceptos clave de ${short.category}. ¡Observa los patrones y aplícalos en tus experimentos escolares!`);
    } finally {
      setIsLoadingInsight(false);
    }
  };

  return (
    <ZentrySubPageScaffold title="ZentryTok" kicker="TIKTOK GUARD" onBack={onBack} isDark={isDark}>
      <div className="max-w-md mx-auto w-full h-full flex flex-col items-center justify-center relative overflow-hidden pb-2">
        {/* Main 9:16 Vertical Video Container */}
        <div className="relative w-full h-full max-h-[78vh] rounded-[32px] overflow-hidden bg-black shadow-2xl border border-white/20 flex flex-col justify-between">
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

          {/* Subtle top & bottom shadow gradient for UI readability */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/50 via-transparent to-black/85 z-10" />

          {/* Top Pill: Category & Index */}
          <div className="relative z-20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold">
              <Flame className="w-3 h-3 text-cyan-400" />
              <span>{currentShort.category}</span>
            </div>

            <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-slate-300 text-[10px] font-mono">
              {currentIndex + 1} / {TIKTOK_SHORTS.length}
            </div>
          </div>

          {/* Bottom Info & Creator Description */}
          <div className="relative z-20 p-4 space-y-2 text-white">
            <div className="flex items-center gap-2">
              <img
                src={currentShort.creatorAvatar}
                alt={currentShort.creator}
                className="w-8 h-8 rounded-full object-cover border-2 border-cyan-400"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold truncate">{currentShort.creator}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                </div>
                <span className="text-[10px] text-slate-300 font-mono">{currentShort.handle}</span>
              </div>
            </div>

            <p className="text-xs font-medium leading-snug drop-shadow-md">
              {currentShort.title}
            </p>

            <div className="flex flex-wrap gap-1 text-[10px] font-bold text-cyan-300">
              {currentShort.tags.map((t, idx) => (
                <span key={idx}>{t}</span>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-300 bg-black/40 px-2.5 py-1 rounded-full w-fit">
              <Music className="w-3 h-3 animate-spin" />
              <span className="truncate max-w-[200px]">Cápsula Educativa ZentryOS</span>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-3.5 text-white">
            {/* Socratic AI Insight Button */}
            <button
              onClick={() => handleFetchAiInsight(currentShort)}
              className="p-2.5 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 text-white shadow-lg cursor-pointer zentry-press animate-bounce"
              title="Explicación del Tutor IA"
            >
              <Sparkles className="w-5 h-5" />
            </button>

            {/* Like Button */}
            <button
              onClick={() => {
                sounds.playSuccess();
                setLikedShorts((prev) => ({ ...prev, [currentShort.id]: !prev[currentShort.id] }));
              }}
              className="flex flex-col items-center gap-0.5 cursor-pointer zentry-press"
            >
              <div className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${likedShorts[currentShort.id] ? 'bg-pink-600 text-white' : 'bg-black/50 text-white hover:bg-black/70'}`}>
                <Heart className={`w-5 h-5 ${likedShorts[currentShort.id] ? 'fill-white' : ''}`} />
              </div>
              <span className="text-[10px] font-bold drop-shadow">{currentShort.viewsOrLikes}</span>
            </button>

            {/* Bookmark Button */}
            <button
              onClick={() => {
                sounds.playTap();
                setBookmarkedShorts((prev) => ({ ...prev, [currentShort.id]: !prev[currentShort.id] }));
              }}
              className="flex flex-col items-center gap-0.5 cursor-pointer zentry-press"
            >
              <div className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${bookmarkedShorts[currentShort.id] ? 'bg-amber-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'}`}>
                <Bookmark className={`w-5 h-5 ${bookmarkedShorts[currentShort.id] ? 'fill-white' : ''}`} />
              </div>
              <span className="text-[10px] font-bold drop-shadow">Guardar</span>
            </button>
          </div>

          {/* Swipe / Navigation Arrows */}
          <div className="absolute right-3 top-20 z-20 flex flex-col gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 disabled:opacity-30 cursor-pointer"
              title="Short anterior"
            >
              <ChevronUp className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === TIKTOK_SHORTS.length - 1}
              className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 disabled:opacity-30 cursor-pointer"
              title="Siguiente short"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI Insight Bottom Sheet */}
        {isAiInsightOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end justify-center p-4 animate-in fade-in">
            <div className={(isDark ? 'zentry-glass-dark text-white ' : 'zentry-glass-light text-[#1E293B] ') + 'w-full max-w-md rounded-t-[32px] p-5 shadow-2xl space-y-3 border-t border-cyan-400/40'}>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <Sparkles className="w-4 h-4" />
                  <span>Ciencia Detrás del Short • Tutor IA</span>
                </div>
                <button
                  onClick={() => setIsAiInsightOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-200 leading-relaxed max-h-60 overflow-y-auto">
                {isLoadingInsight ? (
                  <div className="p-4 text-center space-y-2 animate-pulse">
                    <Sparkles className="w-5 h-5 text-cyan-400 mx-auto animate-spin" />
                    <div className="text-xs font-bold">Consultando la base de conocimientos...</div>
                  </div>
                ) : (
                  aiInsightText
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ZentrySubPageScaffold>
  );
};
