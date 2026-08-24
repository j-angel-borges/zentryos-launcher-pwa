import React, { useState } from 'react';
import { Mic, Sparkles } from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import type { AgeTier } from '../../types/zentry';

interface Props {
  onSearch: (query: string) => void;
  onVoiceTrigger?: () => void;
  isDark: boolean;
  ageTier?: AgeTier;
}

export const OSSearchBar: React.FC<Props> = ({ 
  onSearch, 
  onVoiceTrigger, 
  isDark, 
  ageTier = 'toddler' 
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      sounds.playTap();
      const q = query.trim();
      setQuery('');
      onSearch(q);
    }
  };

  const handleToddlerVoiceClick = () => {
    sounds.playTap();
    if (onVoiceTrigger) {
      onVoiceTrigger();
    } else {
      onSearch('tutor_voice');
    }
  };

  // Toddler 2-5 years: Voice-first tactile button without typing inputs
  if (ageTier === 'toddler') {
    return (
      <div
        onClick={handleToddlerVoiceClick}
        className="w-full h-13 rounded-[24px] px-5 flex items-center justify-between bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 hover:from-indigo-500/30 hover:to-pink-500/30 border border-white/30 backdrop-blur-md cursor-pointer zentry-press transition-all shadow-sm group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
            <Mic className="w-4 h-4" />
          </div>
          <span className={(isDark ? 'text-white ' : 'text-[#1E293B] ') + 'text-xs md:text-sm font-extrabold tracking-tight'}>
            ¡Toca para hablar con Zentry!
          </span>
        </div>
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
      </div>
    );
  }

  // Explorer 5-10+ years: Search input
  return (
    <form
      onSubmit={handleSubmit}
      className={(isDark ? 'zentry-glass-dark ' : 'zentry-glass-light ') + 'w-full h-12 rounded-[24px] px-5 flex items-center gap-3 transition-all'}
    >
      <span className={(isDark ? 'text-white/70 ' : 'text-[#3B3B58]/70 ') + 'font-black text-lg'}>
        G
      </span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar o investigar..."
        className={(isDark ? 'text-white placeholder-white/45 ' : 'text-[#3B3B58] placeholder-[#3B3B58]/45 ') + 'w-full bg-transparent text-xs md:text-sm font-semibold focus:outline-none'}
      />
    </form>
  );
};
