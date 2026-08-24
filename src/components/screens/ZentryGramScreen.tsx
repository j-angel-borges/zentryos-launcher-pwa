import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal, 
  ArrowLeft,
  Volume2,
  CheckCircle,
  X,
  Sparkles,
  Camera
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';
import { INSTAGRAM_POSTS, InstagramPostItem } from '../../services/entertainmentData';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryGramScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [selectedFilter, setSelectedFilter] = useState<'Todos' | 'Entretenimiento para Niños' | 'Curiosidades'>('Todos');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [activeStory, setActiveStory] = useState<{ name: string; avatar: string; img: string; title: string } | null>(null);

  const stories = [
    { name: 'cocomelon', avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?q=80&w=150&auto=format&fit=crop', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop', title: '¡Dibujando con Crayones!' },
    { name: 'natgeo', avatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=150&auto=format&fit=crop', img: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef6?q=80&w=800&auto=format&fit=crop', title: '¡Osito Panda en la Selva!' },
    { name: 'nasa', avatar: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=150&auto=format&fit=crop', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop', title: '¡Planetas y Estrellas Brillantes!' },
    { name: 'bluey', avatar: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=150&auto=format&fit=crop', img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop', title: '¡Juegos de Hermanas!' },
    { name: 'bbcearth', avatar: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef6?q=80&w=150&auto=format&fit=crop', img: 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?q=80&w=800&auto=format&fit=crop', title: '¡Delfines en el Océano!' }
  ];

  const filteredPosts = INSTAGRAM_POSTS.filter((p) => {
    if (selectedFilter === 'Todos') return true;
    return p.category === selectedFilter;
  });

  const handleLike = (id: string) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(35); } catch {}
    }
    sounds.playSuccess();
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
    voiceService.speakFeedback('¡Qué linda foto!');
  };

  const handleBookmark = (id: string) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(25); } catch {}
    }
    sounds.playTap();
    setSavedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-full h-full flex flex-col p-2 sm:p-4 md:p-6 overflow-hidden z-10 select-none relative">
      {/* Outer Instagram Container */}
      <div className={(isDark ? 'bg-[#000000] text-white ' : 'bg-white text-slate-900 ') + 'flex-1 rounded-[32px] sm:rounded-[40px] p-3 sm:p-5 md:p-6 flex flex-col space-y-3 overflow-hidden shadow-2xl border border-white/10 relative'}>
        
        {/* Top Header Bar: Back, Instagram Wordmark / Logo, Voice Trigger */}
        <div className="flex items-center justify-between z-20 pb-1 shrink-0">
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

          {/* Authentic Instagram Glyph Pill */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white shadow-lg">
            <Camera className="w-5 h-5" />
            <span className="font-black text-sm tracking-tight">Instagram</span>
          </div>

          {/* Voice Prompt Trigger */}
          <button
            onClick={() => {
              sounds.playTap();
              voiceService.speakFeedback('¡Toca dos veces una foto para darle corazón!');
            }}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#fd1d1d] to-[#833ab4] flex items-center justify-center text-white shadow-md border border-white/30 zentry-press cursor-pointer"
            title="Escuchar"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>

        {/* Stories Bar: Authentic Instagram Multi-Color Gradient Rings */}
        <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-2 px-1 shrink-0">
          {stories.map((story, idx) => (
            <button
              key={idx}
              onClick={() => {
                sounds.playAppOpen();
                voiceService.speakFeedback(story.title);
                setActiveStory(story);
              }}
              className="flex flex-col items-center gap-1 cursor-pointer shrink-0 zentry-press group"
            >
              <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-md group-hover:scale-110 transition-transform">
                <div className="w-full h-full rounded-full p-0.5 bg-black">
                  <img
                    src={story.avatar}
                    alt={story.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-300 max-w-[65px] truncate">
                {story.name}
              </span>
            </button>
          ))}
        </div>

        {/* Category Tabs: Arte & Juegos / Curiosidades */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 shrink-0">
          <button
            onClick={() => {
              sounds.playTap();
              setSelectedFilter('Todos');
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${
              selectedFilter === 'Todos'
                ? 'bg-gradient-to-r from-[#fd1d1d] to-[#833ab4] text-white shadow'
                : isDark ? 'bg-white/10 text-slate-300' : 'bg-black/5 text-slate-700'
            }`}
          >
            ✨ Todo (50)
          </button>
          <button
            onClick={() => {
              sounds.playTap();
              setSelectedFilter('Entretenimiento para Niños');
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${
              selectedFilter === 'Entretenimiento para Niños'
                ? 'bg-gradient-to-r from-[#fd1d1d] to-[#833ab4] text-white shadow'
                : isDark ? 'bg-white/10 text-slate-300' : 'bg-black/5 text-slate-700'
            }`}
          >
            🎨 Arte & Juegos (25)
          </button>
          <button
            onClick={() => {
              sounds.playTap();
              setSelectedFilter('Curiosidades');
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${
              selectedFilter === 'Curiosidades'
                ? 'bg-gradient-to-r from-[#fd1d1d] to-[#833ab4] text-white shadow'
                : isDark ? 'bg-white/10 text-slate-300' : 'bg-black/5 text-slate-700'
            }`}
          >
            🌌 Curiosidades (25)
          </button>
        </div>

        {/* Instagram Feed of Photo Cards */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          <div className="max-w-lg mx-auto space-y-6">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className={(isDark ? 'bg-[#121212] border-white/10 ' : 'bg-white border-black/10 ') + 'rounded-[28px] border overflow-hidden shadow-lg flex flex-col'}
              >
                {/* Post Header: Avatar, Username, Verified Badge */}
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={post.userAvatar}
                      alt={post.username}
                      className="w-9 h-9 rounded-full object-cover border border-white/20"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black">{post.username}</span>
                        {post.isVerified && <CheckCircle className="w-3.5 h-3.5 text-sky-500 fill-sky-500 text-white" />}
                      </div>
                      <span className="text-[10px] text-slate-400">{post.location}</span>
                    </div>
                  </div>

                  <button className="text-slate-400 p-1">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Post Image with Double-Tap Heart Reaction */}
                <div
                  onDoubleClick={() => handleLike(post.id)}
                  className="relative aspect-square w-full overflow-hidden bg-black/40 cursor-pointer group"
                >
                  <img
                    src={post.images[0]}
                    alt={post.caption}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Centered Pop Heart on Liked State */}
                  {likedPosts[post.id] && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in zoom-in duration-300">
                      <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-2xl opacity-90" />
                    </div>
                  )}
                </div>

                {/* Post Action Rail */}
                <div className="p-3.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`transition-transform active:scale-125 cursor-pointer ${
                          likedPosts[post.id] ? 'text-rose-500' : 'text-slate-300 hover:text-rose-400'
                        }`}
                      >
                        <Heart className={`w-7 h-7 ${likedPosts[post.id] ? 'fill-rose-500' : ''}`} />
                      </button>

                      <button
                        onClick={() => {
                          sounds.playTap();
                          voiceService.speakFeedback('¡Qué bonita manualidad!');
                        }}
                        className="text-slate-300 hover:text-white cursor-pointer"
                      >
                        <MessageCircle className="w-7 h-7" />
                      </button>

                      <button
                        onClick={() => {
                          sounds.playSuccess();
                          voiceService.speakFeedback('¡Compartir imagen!');
                        }}
                        className="text-slate-300 hover:text-white cursor-pointer"
                      >
                        <Send className="w-7 h-7" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleBookmark(post.id)}
                      className={`cursor-pointer transition-all ${
                        savedPosts[post.id] ? 'text-amber-400' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <Bookmark className={`w-7 h-7 ${savedPosts[post.id] ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>

                  {/* Likes Count */}
                  <div className="text-xs font-black">
                    {post.likes + (likedPosts[post.id] ? 1 : 0)} Me gusta
                  </div>

                  {/* Caption */}
                  <p className="text-xs text-slate-200 leading-relaxed">
                    <span className="font-black mr-1.5">{post.username}</span>
                    {post.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full-Screen Story Viewer Modal */}
        {activeStory && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
            <div className="relative w-full max-w-sm aspect-[9/16] rounded-[38px] overflow-hidden border border-white/30 shadow-2xl flex flex-col justify-between p-4">
              <img
                src={activeStory.img}
                alt={activeStory.name}
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-10" />

              {/* Story Top Progress Bar & User Row */}
              <div className="relative z-20 space-y-2">
                <div className="w-full h-1 rounded-full bg-white/30 overflow-hidden">
                  <div className="h-full bg-white animate-pulse w-3/4" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={activeStory.avatar}
                      alt={activeStory.name}
                      className="w-8 h-8 rounded-full border border-white"
                    />
                    <span className="text-xs font-black text-white">{activeStory.name}</span>
                  </div>

                  <button
                    onClick={() => setActiveStory(null)}
                    className="w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black/80"
                  >
                    <X className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Story Bottom Reaction Bar */}
              <div className="relative z-20 p-3 bg-black/60 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-between">
                <p className="text-xs font-bold text-white truncate max-w-[200px]">{activeStory.title}</p>
                <button
                  onClick={() => {
                    sounds.playSuccess();
                    voiceService.speakFeedback('¡Corazón a la historia!');
                  }}
                  className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg"
                >
                  <Heart className="w-6 h-6 fill-white" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
