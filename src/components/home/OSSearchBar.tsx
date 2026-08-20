import React, { useState } from 'react';
import { sounds } from '../../services/soundEffects';

interface Props {
  onSearch: (query: string) => void;
  isDark: boolean;
}

export const OSSearchBar: React.FC<Props> = ({ onSearch, isDark }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      sounds.playTap();
      const q = query.trim();
      setQuery('');
      // Route internally inside ZentryOS PWA (NO window.open / NO new browser tabs)
      onSearch(q);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={(isDark ? 'zentry-glass-dark ' : 'zentry-glass-light ') + 'w-full h-12 rounded-[24px] px-5 flex items-center gap-3 transition-all cursor-text shadow-sm border border-white/20'}
    >
      <span className="font-black text-lg bg-gradient-to-r from-blue-400 via-rose-400 to-amber-400 bg-clip-text text-transparent">
        G
      </span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar en Google con Modo IA..."
        className={(isDark ? 'text-white placeholder-white/45 ' : 'text-[#3B3B58] placeholder-[#3B3B58]/45 ') + 'w-full bg-transparent text-xs md:text-sm font-semibold focus:outline-none'}
      />
    </form>
  );
};
