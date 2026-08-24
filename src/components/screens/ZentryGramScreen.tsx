import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  X, 
  ArrowLeft,
  Volume2,
  Camera,
  Smile,
  Star
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';
import { INSTAGRAM_POSTS, InstagramPostItem } from '../../services/entertainmentData';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryGramScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [activeStory, setActiveStory] = useState<{ name: string; emoji: string; img: string; title: string } | null>(null);

  const animalStories = [
    { name: 'León', emoji: '🦁', img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop', title: '¡El rey de la selva!' },
    { name: 'Panda', emoji: '🐼', img: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef6?q=80&w=800&auto=format&fit=crop', title: '¡El osito panda jugando!' },
    { name: 'Delfín', emoji: '🐬', img: 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?q=80&w=800&auto=format&fit=crop', title: '¡El delfín en el mar azul!' },
    { name: 'Mariposa', emoji: '🦋', img: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?q=80&w=800&auto=format&fit=crop', title: '¡Colores en las alas!' },
    { name: 'Estrellas', emoji: '🪐', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop', title: '¡Planetas y estrellas brillantes!' }
  ];

  const handleOpenStory = (story: typeof animalStories[0]) => {
    sounds.playAppOpen();
    voiceService.speakFeedback(story.title);
    setActiveStory(story);
  };

  const handleLike = (id: string) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(35); } catch {}
    }
    sounds.playSuccess();
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
    voiceService.speakFeedback('¡Qué linda foto!');
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
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg border border-amber-300/40">
            <Camera className="w-5 h-5" />
            <span className="text-sm font-black tracking-wide">ANIMALITOS</span>
            <span className="text-base">🦁</span>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              voiceService.speakFeedback('¡Toca los animalitos para verlos en grande!');
            }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md border border-amber-300/40 zentry-press cursor-pointer"
            title="Escuchar"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>

        {/* Stories Bar: Big Circular Animal Bubbles */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 px-1">
          {animalStories.map((story, idx) => (
            <button
              key={idx}
              onClick={() => handleOpenStory(story)}
              className="flex flex-col items-center gap-1 cursor-pointer shrink-0 zentry-press group"
            >
              <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-500 shadow-lg group-hover:scale-110 transition-transform">
                <div className="w-full h-full rounded-full bg-black/40 flex items-center justify-center text-3xl">
                  {story.emoji}
                </div>
              </div>
              <span className="text-xs font-black text-white">{story.name}</span>
            </button>
          ))}
        </div>

        {/* Big Visual Photo Grid (No text clutter, huge high-contrast images) */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {INSTAGRAM_POSTS.map((post) => (
              <div
                key={post.id}
                onClick={() => handleLike(post.id)}
                className={(isDark ? 'bg-white/10 hover:bg-white/15 border-white/20 ' : 'bg-white/80 hover:bg-white border-white/60 ') + 'rounded-[30px] border-2 overflow-hidden shadow-xl cursor-pointer transition-all zentry-press group relative flex flex-col'}
              >
                {/* Photo Display */}
                <div className="relative aspect-square w-full overflow-hidden bg-black/30">
                  <img
                    src={post.images[0]}
                    alt={post.caption}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Giant Heart Pop Reaction on Image */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-rose-500/80 text-white flex items-center justify-center shadow-2xl scale-90 group-hover:scale-110 transition-transform">
                      <Heart className="w-9 h-9 fill-white" />
                    </div>
                  </div>

                  {/* Top-Right Sparkle */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-amber-300 text-xs flex items-center gap-1 border border-white/20">
                    <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
                  </div>
                </div>

                {/* Minimal Bottom Bar: Heart & Sparkle */}
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌟</span>
                    <span className={(isDark ? 'text-white ' : 'text-[#1E293B] ') + 'text-xs font-black'}>
                      ¡Hermosa foto!
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(post.id);
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-125 ${
                      likedPosts[post.id]
                        ? 'bg-rose-500 text-white shadow-lg scale-110'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${likedPosts[post.id] ? 'fill-white' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full-Screen Animal Story Modal */}
        {activeStory && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 animate-in fade-in">
            <div className="relative w-full max-w-sm aspect-[9/16] rounded-[38px] overflow-hidden border-2 border-white/40 shadow-2xl flex flex-col justify-between p-4">
              <img
                src={activeStory.img}
                alt={activeStory.name}
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/75 z-10" />

              {/* Story Top Bar */}
              <div className="relative z-20 flex items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
                  <span className="text-2xl">{activeStory.emoji}</span>
                  <span className="text-sm font-black text-white">{activeStory.name}</span>
                </div>
                <button
                  onClick={() => setActiveStory(null)}
                  className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform"
                >
                  <X className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>

              {/* Story Bottom Pill */}
              <div className="relative z-20 p-3 bg-black/60 backdrop-blur-md rounded-2xl border border-white/20 text-center">
                <p className="text-base font-black text-amber-300">{activeStory.title}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

