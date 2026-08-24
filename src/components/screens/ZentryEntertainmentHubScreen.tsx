import React, { useState } from 'react';
import { 
  Tv, 
  Play, 
  Music, 
  Sparkles, 
  Camera, 
  Heart, 
  Rocket, 
  Radio, 
  Star, 
  Smile, 
  ArrowLeft,
  Volume2
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';
import type { ScreenId } from '../../types/zentry';

interface Props {
  onBack: () => void;
  onNavigate: (screen: ScreenId) => void;
  isDark: boolean;
}

interface FloatingBubble {
  id: number;
  x: number;
  y: number;
  size: number;
  icon: 'star' | 'heart' | 'music' | 'sparkle' | 'smile';
  color: string;
  delay: string;
}

export const ZentryEntertainmentHubScreen: React.FC<Props> = ({ onBack, onNavigate, isDark }) => {
  const [poppedBubbles, setPoppedBubbles] = useState<Record<number, boolean>>({});
  const [activeTapId, setActiveTapId] = useState<string | null>(null);

  // 4 Main Magical Floating Worlds (Zero text clutter, pure graphic playful immersion)
  const portals = [
    {
      id: 'zentry_tube' as ScreenId,
      label: 'Videos',
      emoji: '🎬',
      voiceText: '¡Videos y dibujitos!',
      gradient: 'from-red-500 via-rose-500 to-amber-500',
      glow: 'shadow-[0_12px_40px_-8px_rgba(239,68,68,0.6)]',
      border: 'border-red-300/60',
      floatAnim: 'animate-float-1',
      iconMain: Tv,
      iconSub: Play,
      subBadge: '▶'
    },
    {
      id: 'zentry_tok' as ScreenId,
      label: 'Música',
      emoji: '🎵',
      voiceText: '¡Canciones y baile!',
      gradient: 'from-cyan-400 via-purple-500 to-pink-500',
      glow: 'shadow-[0_12px_40px_-8px_rgba(168,85,247,0.6)]',
      border: 'border-cyan-200/60',
      floatAnim: 'animate-float-2',
      iconMain: Music,
      iconSub: Sparkles,
      subBadge: '♫'
    },
    {
      id: 'zentry_gram' as ScreenId,
      label: 'Animales',
      emoji: '🦁',
      voiceText: '¡Animalitos y fotos mágicas!',
      gradient: 'from-amber-400 via-orange-500 to-rose-500',
      glow: 'shadow-[0_12px_40px_-8px_rgba(245,158,11,0.6)]',
      border: 'border-amber-200/60',
      floatAnim: 'animate-float-3',
      iconMain: Camera,
      iconSub: Heart,
      subBadge: '♥'
    },
    {
      id: 'zentry_stream' as ScreenId,
      label: 'Estrellas',
      emoji: '🚀',
      voiceText: '¡Estrellas y mundos!',
      gradient: 'from-purple-500 via-indigo-600 to-blue-500',
      glow: 'shadow-[0_12px_40px_-8px_rgba(99,102,241,0.6)]',
      border: 'border-indigo-200/60',
      floatAnim: 'animate-float-4',
      iconMain: Rocket,
      iconSub: Star,
      subBadge: '★'
    }
  ];

  // Ambient interactive popping bubbles
  const ambientBubbles: FloatingBubble[] = [
    { id: 1, x: 8, y: 12, size: 44, icon: 'star', color: 'bg-yellow-400/30 text-yellow-300 border-yellow-300/40', delay: '0s' },
    { id: 2, x: 88, y: 14, size: 48, icon: 'heart', color: 'bg-pink-400/30 text-pink-300 border-pink-300/40', delay: '0.6s' },
    { id: 3, x: 6, y: 78, size: 52, icon: 'music', color: 'bg-cyan-400/30 text-cyan-300 border-cyan-300/40', delay: '1.2s' },
    { id: 4, x: 90, y: 76, size: 46, icon: 'sparkle', color: 'bg-purple-400/30 text-purple-300 border-purple-300/40', delay: '0.3s' },
    { id: 5, x: 48, y: 6, size: 40, icon: 'smile', color: 'bg-emerald-400/30 text-emerald-300 border-emerald-300/40', delay: '0.9s' }
  ];

  const handleSelectPortal = (portal: typeof portals[0]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(40);
      } catch {}
    }
    sounds.playAppOpen();
    setActiveTapId(portal.id);
    voiceService.speakFeedback(portal.voiceText);

    setTimeout(() => {
      onNavigate(portal.id);
    }, 280);
  };

  const handlePopBubble = (id: number) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(25);
      } catch {}
    }
    sounds.playTap();
    setPoppedBubbles((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setPoppedBubbles((prev) => ({ ...prev, [id]: false }));
    }, 2500);
  };

  const renderBubbleIcon = (type: FloatingBubble['icon']) => {
    switch (type) {
      case 'star': return <Star className="w-5 h-5 fill-yellow-300" />;
      case 'heart': return <Heart className="w-5 h-5 fill-pink-300" />;
      case 'music': return <Music className="w-5 h-5" />;
      case 'sparkle': return <Sparkles className="w-5 h-5 fill-purple-300" />;
      case 'smile': return <Smile className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-3 md:p-6 overflow-hidden z-10 select-none relative">
      {/* Outer Glass Card */}
      <div className={(isDark ? 'zentry-glass-dark ' : 'zentry-glass-light ') + 'flex-1 rounded-[36px] p-4 md:p-6 flex flex-col justify-between overflow-hidden shadow-2xl relative'}>
        
        {/* Ambient Floating Pop Bubbles */}
        {ambientBubbles.map((bubble) => {
          if (poppedBubbles[bubble.id]) return null;
          return (
            <button
              key={bubble.id}
              onClick={() => handlePopBubble(bubble.id)}
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                animationDelay: bubble.delay
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full backdrop-blur-md border flex items-center justify-center cursor-pointer animate-mini-bubble shadow-lg z-20 zentry-press transition-all hover:scale-125 ${bubble.color}`}
            >
              {renderBubbleIcon(bubble.icon)}
            </button>
          );
        })}

        {/* Top Header: Simple Big Back Button & Sound Voice Assistant Sparkle */}
        <div className="flex items-center justify-between z-30 pb-2">
          <button
            onClick={() => {
              sounds.playTap();
              onBack();
            }}
            className={(isDark ? 'bg-white/15 hover:bg-white/25 text-white ' : 'bg-white/70 hover:bg-white/90 text-[#3B3B58] ') + 'w-13 h-13 rounded-2xl flex items-center justify-center transition-all zentry-press cursor-pointer shadow-md border border-white/30'}
            title="Volver"
          >
            <ArrowLeft className="w-7 h-7 stroke-[2.5]" />
          </button>

          {/* Big Graphic Visual Title (Only pure icons and emoji) */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm">
            <span className="text-2xl animate-bounce">🎈</span>
            <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</span>
            <span className="text-2xl animate-bounce" style={{ animationDelay: '0.4s' }}>🌟</span>
          </div>

          {/* Voice Prompt Play Trigger */}
          <button
            onClick={() => {
              sounds.playTap();
              voiceService.speakFeedback('¡Toca un botón mágico para jugar!');
            }}
            className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg border border-purple-300/40 zentry-press cursor-pointer"
            title="Escuchar"
          >
            <Volume2 className="w-7 h-7" />
          </button>
        </div>

        {/* Center: 4 Floating Graphical Portals Grid (2x2) */}
        <div className="flex-1 w-full max-w-xl mx-auto flex items-center justify-center py-2 z-30">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full h-full max-h-[520px] items-center justify-items-center">
            {portals.map((portal) => {
              const IconMain = portal.iconMain;
              const IconSub = portal.iconSub;
              const isTapped = activeTapId === portal.id;

              return (
                <div
                  key={portal.id}
                  onClick={() => handleSelectPortal(portal)}
                  className={`w-full max-w-[240px] aspect-square rounded-[32px] sm:rounded-[38px] bg-gradient-to-br ${portal.gradient} p-4 sm:p-5 flex flex-col items-center justify-between cursor-pointer border-2 ${portal.border} ${portal.glow} ${portal.floatAnim} ${isTapped ? 'animate-pop-scale' : ''} zentry-press transition-all duration-300 group hover:scale-105 active:scale-95 relative overflow-hidden`}
                >
                  {/* Glossy top-left highlight */}
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent rounded-t-[32px] pointer-events-none" />
                  
                  {/* Floating Top Emoji & Sparkle Pill */}
                  <div className="w-full flex items-center justify-between relative z-10">
                    <span className="text-3xl sm:text-4xl filter drop-shadow-md">
                      {portal.emoji}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                      <IconSub className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Giant Central Graphic Icon */}
                  <div className="relative z-10 my-auto flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[24px] bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                      <IconMain className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.2] drop-shadow" />
                    </div>
                  </div>

                  {/* Bottom Minimalist Friendly Visual Pill */}
                  <div className="relative z-10 w-full flex items-center justify-center">
                    <div className="px-4 py-1.5 rounded-full bg-white/25 backdrop-blur-md border border-white/40 shadow-sm flex items-center gap-1.5 text-white font-black text-sm sm:text-base tracking-wide">
                      <span>{portal.label}</span>
                      <span className="text-xs opacity-90">{portal.subBadge}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Floating Interactive Floor (No text, just cheerful visual hints) */}
        <div className="flex items-center justify-center gap-3 z-30 pt-1">
          <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2 text-white text-xs font-bold">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span>¡Toca y diviértete!</span>
            <Smile className="w-4 h-4 text-pink-300" />
          </div>
        </div>

      </div>
    </div>
  );
};

