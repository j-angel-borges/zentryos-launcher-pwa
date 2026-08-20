import React, { useState } from 'react';
import { Search, Sparkles, X, Compass, Shield } from 'lucide-react';
import type { ScreenId } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: ScreenId) => void;
  onSearch: (query: string) => void;
}

export const ZentryCommandSheet: React.FC<Props> = ({
  isOpen,
  onClose,
  onNavigate,
  onSearch
}) => {
  const [cmd, setCmd] = useState('');

  if (!isOpen) return null;

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmd.trim()) return;
    sounds.playTap();
    const q = cmd.trim().toLowerCase();
    setCmd('');
    onClose();

    if (q.includes('calculadora')) onNavigate('calculator');
    else if (q.includes('camara') || q.includes('cámara')) onNavigate('camera');
    else if (q.includes('arte') || q.includes('dibujo')) onNavigate('neuro_art');
    else if (q.includes('mundo')) onNavigate('world_generator');
    else if (q.includes('tutor') || q.includes('estudio')) onNavigate('study_assistant');
    else if (q.includes('ajustes') || q.includes('config')) onNavigate('settings');
    else {
      onSearch(cmd.trim());
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-start pt-20 p-4 animate-in fade-in duration-200">
      <div className="bg-[#1E1E24]/95 border border-white/20 rounded-[32px] p-6 max-w-lg w-full shadow-2xl text-white space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C8B6FF]" />
            <span className="font-bold text-sm">Hoja de Comandos del Sistema</span>
          </div>
          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleExecute} className="relative">
          <input
            type="text"
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            placeholder="Escribe un comando o busca en Google..."
            className="w-full pl-4 pr-10 py-3 rounded-2xl bg-white/10 border border-white/20 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#C8B6FF]"
            autoFocus
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
            <Search className="w-4 h-4" />
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-1 text-xs">
          <button
            onClick={() => {
              onClose();
              onNavigate('ai');
            }}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 cursor-pointer"
          >
            💬 Abrir Zentry AI
          </button>
          <button
            onClick={() => {
              onClose();
              onNavigate('study_assistant');
            }}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 cursor-pointer"
          >
            🎓 Tutor Socrático
          </button>
          <button
            onClick={() => {
              onClose();
              onNavigate('safe_search');
            }}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 cursor-pointer"
          >
            🛡️ Escudo YouTube
          </button>
        </div>
      </div>
    </div>
  );
};
