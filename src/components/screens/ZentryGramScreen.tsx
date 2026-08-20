import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  CheckCircle2, 
  MoreHorizontal, 
  Sparkles, 
  X, 
  Share2, 
  Image as ImageIcon,
  Compass
} from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { INSTAGRAM_POSTS, InstagramPostItem } from '../../services/entertainmentData';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryGramScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [activeStory, setActiveStory] = useState<{ name: string; avatar: string; img: string; topic: string } | null>(null);

  const educationalStories = [
    { name: 'NASA', avatar: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=150&auto=format&fit=crop', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop', topic: 'James Webb: Galaxias Primigenias' },
    { name: 'NatGeo', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&auto=format&fit=crop', img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop', topic: 'Especies de la Selva Amazónica' },
    { name: 'CERN', avatar: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=150&auto=format&fit=crop', img: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=800&auto=format&fit=crop', topic: 'Colisionador de Hadrones LHC' },
    { name: 'Kurzgesagt', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop', topic: 'Inmunología y Células T' },
    { name: 'MIT Lab', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop', img: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop', topic: 'Robots Cuadrúpedos Autónomos' }
  ];

  return (
    <ZentrySubPageScaffold title="ZentryGram" kicker="INSTAGRAM GUARD" onBack={onBack} isDark={isDark}>
      <div className="max-w-xl mx-auto w-full h-full flex flex-col space-y-3 overflow-hidden">
        {/* Top Header Logo */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <ImageIcon className="w-4 h-4" />
            </div>
            <span className="font-black text-sm tracking-tight text-white font-serif italic">
              ZentryGram
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-purple-300 font-semibold px-2.5 py-1 rounded-full bg-white/10">
            <Sparkles className="w-3 h-3" />
            <span>Feed Visual Curado (50 Posts)</span>
          </div>
        </div>

        {/* Stories Horizontal Bar */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 px-1 border-b border-white/10">
          {educationalStories.map((story, idx) => (
            <div
              key={idx}
              onClick={() => {
                sounds.playTap();
                setActiveStory(story);
              }}
              className="flex flex-col items-center gap-1 cursor-pointer shrink-0 zentry-press group"
            >
              <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 group-hover:scale-105 transition-transform shadow-md">
                <img
                  src={story.avatar}
                  alt={story.name}
                  className="w-full h-full rounded-full object-cover border-2 border-slate-900"
                />
              </div>
              <span className="text-[10px] text-slate-300 font-medium truncate max-w-[60px]">
                {story.name}
              </span>
            </div>
          ))}
        </div>

        {/* Main Visual Feed */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {INSTAGRAM_POSTS.map((post) => (
            <div
              key={post.id}
              className={(isDark ? 'bg-white/10 border-white/15 ' : 'bg-white/85 border-white/40 ') + 'rounded-[26px] border overflow-hidden shadow-md space-y-2.5'}
            >
              {/* Post Header */}
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={post.userAvatar}
                    alt={post.username}
                    className="w-8 h-8 rounded-full object-cover border border-purple-400"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white">{post.username}</span>
                      {post.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
                    </div>
                    <div className="text-[10px] text-slate-400">{post.location}</div>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-bold text-purple-300">
                  {post.category}
                </span>
              </div>

              {/* Post Image Container */}
              <div className="relative aspect-square w-full overflow-hidden bg-black/30">
                <img
                  src={post.images[0]}
                  alt={post.caption}
                  className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Action Toolbar */}
              <div className="px-4 pt-1 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      sounds.playSuccess();
                      setLikedPosts((prev) => ({ ...prev, [post.id]: !prev[post.id] }));
                    }}
                    className="cursor-pointer zentry-press"
                  >
                    <Heart className={`w-5 h-5 transition-colors ${likedPosts[post.id] ? 'text-rose-500 fill-rose-500' : 'text-slate-300 hover:text-white'}`} />
                  </button>

                  <button className="cursor-pointer text-slate-300 hover:text-white">
                    <MessageCircle className="w-5 h-5" />
                  </button>

                  <button className="cursor-pointer text-slate-300 hover:text-white">
                    <Send className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    sounds.playTap();
                    setSavedPosts((prev) => ({ ...prev, [post.id]: !prev[post.id] }));
                  }}
                  className="cursor-pointer zentry-press"
                >
                  <Bookmark className={`w-5 h-5 transition-colors ${savedPosts[post.id] ? 'text-amber-400 fill-amber-400' : 'text-slate-300 hover:text-white'}`} />
                </button>
              </div>

              {/* Likes & Caption */}
              <div className="px-4 pb-3.5 space-y-1">
                <div className="text-xs font-bold text-white">
                  {(post.likes + (likedPosts[post.id] ? 1 : 0)).toLocaleString('es-ES')} Me gusta
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-white mr-1.5">{post.username}</span>
                  {post.caption}
                </p>

                <div className="flex flex-wrap gap-1 text-[11px] text-purple-300 font-semibold pt-0.5">
                  {post.tags.map((t, idx) => (
                    <span key={idx}>{t}</span>
                  ))}
                </div>

                <div className="text-[10px] text-slate-500 pt-1">{post.timeAgo}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Story Modal Viewer */}
        {activeStory && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="relative w-full max-w-sm aspect-[9/16] rounded-[32px] overflow-hidden border border-white/20 shadow-2xl flex flex-col justify-between p-4">
              <img
                src={activeStory.img}
                alt={activeStory.name}
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70 z-10" />

              {/* Story Top Bar */}
              <div className="relative z-20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={activeStory.avatar}
                    alt={activeStory.name}
                    className="w-8 h-8 rounded-full border border-white"
                  />
                  <span className="text-xs font-bold text-white">{activeStory.name}</span>
                </div>
                <button
                  onClick={() => setActiveStory(null)}
                  className="p-1 rounded-full bg-black/40 text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Story Bottom Caption */}
              <div className="relative z-20 p-2 text-white space-y-1">
                <div className="text-xs font-bold text-amber-300">Historia Educativa:</div>
                <p className="text-sm font-semibold leading-snug">{activeStory.topic}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ZentrySubPageScaffold>
  );
};
