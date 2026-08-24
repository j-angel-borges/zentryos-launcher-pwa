import React, { useState } from 'react';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';
import type { ScreenId } from '../../types/zentry';

interface Props {
  onBack: () => void;
  onNavigate: (screen: ScreenId) => void;
  isDark: boolean;
}

export const ZentryEntertainmentHubScreen: React.FC<Props> = ({ onBack, onNavigate, isDark }) => {
  const [activeTapId, setActiveTapId] = useState<string | null>(null);

  // 3 Official Floating Liquid Glass Portals (YouTube, TikTok, Instagram) - ZERO TEXT
  const apps = [
    {
      id: 'zentry_tube' as ScreenId,
      voiceText: '¡YouTube!',
      glowColor: 'shadow-[0_20px_50px_-10px_rgba(239,68,68,0.55)] hover:shadow-[0_25px_60px_-10px_rgba(239,68,68,0.75)]',
      borderColor: 'border-red-400/40 hover:border-red-300/80',
      floatAnim: 'animate-float-1',
      renderLogo: () => (
        <svg viewBox="0 0 24 24" className="w-20 h-20 sm:w-26 sm:h-26 drop-shadow-xl" fill="currentColor">
          <path
            fill="#FF0000"
            d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
          />
          <path fill="#FFFFFF" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
    },
    {
      id: 'zentry_tok' as ScreenId,
      voiceText: '¡TikTok!',
      glowColor: 'shadow-[0_20px_50px_-10px_rgba(0,242,254,0.45)] hover:shadow-[0_25px_60px_-10px_rgba(254,44,85,0.7)]',
      borderColor: 'border-cyan-400/40 hover:border-pink-400/80',
      floatAnim: 'animate-float-2',
      renderLogo: () => (
        <svg viewBox="0 0 48 48" className="w-20 h-20 sm:w-26 sm:h-26 drop-shadow-2xl">
          <rect width="48" height="48" rx="14" fill="#050508" />
          <path
            fill="#00F2FE"
            d="M33.5 15.2a8.8 8.8 0 0 0-5.8-5.3V27a5.5 5.5 0 1 1-5.5-5.5c.5 0 1 .07 1.5.2v-5.2a10.6 10.6 0 0 0-1.5-.1 10.7 10.7 0 1 0 10.7 10.7v-9.2a14.2 14.2 0 0 0 7.8 2.4v-5.1h-.2a8.8 8.8 0 0 1-7-0.5z"
            transform="translate(-1.2, -1.2)"
          />
          <path
            fill="#FE2C55"
            d="M33.5 15.2a8.8 8.8 0 0 0-5.8-5.3V27a5.5 5.5 0 1 1-5.5-5.5c.5 0 1 .07 1.5.2v-5.2a10.6 10.6 0 0 0-1.5-.1 10.7 10.7 0 1 0 10.7 10.7v-9.2a14.2 14.2 0 0 0 7.8 2.4v-5.1h-.2a8.8 8.8 0 0 1-7-0.5z"
            transform="translate(1.2, 1.2)"
          />
          <path
            fill="#FFFFFF"
            d="M33.5 15.2a8.8 8.8 0 0 0-5.8-5.3V27a5.5 5.5 0 1 1-5.5-5.5c.5 0 1 .07 1.5.2v-5.2a10.6 10.6 0 0 0-1.5-.1 10.7 10.7 0 1 0 10.7 10.7v-9.2a14.2 14.2 0 0 0 7.8 2.4v-5.1h-.2a8.8 8.8 0 0 1-7-0.5z"
          />
        </svg>
      )
    },
    {
      id: 'zentry_gram' as ScreenId,
      voiceText: '¡Instagram!',
      glowColor: 'shadow-[0_20px_50px_-10px_rgba(225,48,108,0.55)] hover:shadow-[0_25px_60px_-10px_rgba(245,96,64,0.75)]',
      borderColor: 'border-pink-400/40 hover:border-amber-300/80',
      floatAnim: 'animate-float-3',
      renderLogo: () => (
        <svg viewBox="0 0 48 48" className="w-20 h-20 sm:w-26 sm:h-26 drop-shadow-2xl">
          <defs>
            <radialGradient id="ig-lens-grad" cx="20%" cy="110%" r="140%">
              <stop offset="0%" stopColor="#FFD521" />
              <stop offset="10%" stopColor="#FFD521" />
              <stop offset="50%" stopColor="#F50000" />
              <stop offset="70%" stopColor="#B900B4" />
              <stop offset="100%" stopColor="#4000C8" />
            </radialGradient>
          </defs>
          <rect width="48" height="48" rx="14" fill="url(#ig-lens-grad)" />
          <rect x="8" y="8" width="32" height="32" rx="9" fill="none" stroke="#FFFFFF" strokeWidth="3.2" />
          <circle cx="24" cy="24" r="7.5" fill="none" stroke="#FFFFFF" strokeWidth="3.2" />
          <circle cx="33" cy="15" r="2.2" fill="#FFFFFF" />
        </svg>
      )
    }
  ];

  const handleSelectApp = (app: typeof apps[0]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(40);
      } catch {}
    }
    sounds.playAppOpen();
    setActiveTapId(app.id);
    voiceService.speakFeedback(app.voiceText);

    setTimeout(() => {
      onNavigate(app.id);
    }, 280);
  };

  return (
    <div className="w-full h-full flex flex-col p-3 md:p-6 overflow-hidden z-10 select-none relative">
      {/* Outer Main Liquid Glass Enclosure */}
      <div className={(isDark ? 'zentry-glass-dark ' : 'zentry-glass-light ') + 'flex-1 rounded-[36px] p-4 md:p-6 flex flex-col justify-between overflow-hidden shadow-2xl relative'}>
        
        {/* Top Minimal Liquid Glass Header: Back button & Voice Audio Trigger */}
        <div className="w-full flex items-center justify-between z-30 pb-2">
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

          {/* Voice Prompt Play Trigger */}
          <button
            onClick={() => {
              sounds.playTap();
              voiceService.speakFeedback('¡Toca YouTube, TikTok o Instagram!');
            }}
            className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-500/80 to-purple-500/80 backdrop-blur-md flex items-center justify-center text-white shadow-lg border border-purple-300/40 zentry-press cursor-pointer"
            title="Escuchar"
          >
            <Volume2 className="w-7 h-7" />
          </button>
        </div>

        {/* Center: 3 Floating Liquid Glass Brand Logo Cards (ZERO TEXT) */}
        <div className="flex-1 w-full max-w-4xl mx-auto flex items-center justify-center py-4 z-30">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-10 w-full">
            {apps.map((app) => {
              const isTapped = activeTapId === app.id;

              return (
                <div
                  key={app.id}
                  onClick={() => handleSelectApp(app)}
                  className={`w-40 sm:w-48 md:w-56 aspect-square rounded-[38px] sm:rounded-[48px] backdrop-blur-2xl border-2 ${app.borderColor} ${app.glowColor} ${app.floatAnim} ${isTapped ? 'animate-pop-scale' : ''} flex items-center justify-center cursor-pointer zentry-press transition-all duration-300 group hover:scale-110 active:scale-95 relative overflow-hidden`}
                  style={{
                    background: isDark 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.05) 100%)' 
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.35) 100%)',
                    boxShadow: isDark
                      ? 'inset 0 1px 2px rgba(255, 255, 255, 0.4), inset 0 -2px 6px rgba(0, 0, 0, 0.3)'
                      : 'inset 0 1px 2px rgba(255, 255, 255, 0.9), inset 0 -2px 6px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {/* Top-Half Specular Liquid Glass Refraction Highlight */}
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none rounded-t-[38px] sm:rounded-t-[48px]" />
                  
                  {/* Subtle Inner Refraction Rim */}
                  <div className="absolute inset-0 rounded-[38px] sm:rounded-[48px] border border-white/25 pointer-events-none" />

                  {/* Centered Official Logo */}
                  <div className="relative z-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {app.renderLogo()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Empty bottom spacer for perfect vertical balance */}
        <div className="h-6 w-full" />

      </div>
    </div>
  );
};


