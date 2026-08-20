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
      onSearch(query.trim());
      setQuery('');
    }
  };

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
        placeholder="Google Safe Search..."
        className={(isDark ? 'text-white placeholder-white/45 ' : 'text-[#3B3B58] placeholder-[#3B3B58]/45 ') + 'w-full bg-transparent text-sm font-medium focus:outline-none'}
      />
    </form>
  );
};
