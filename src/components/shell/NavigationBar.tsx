import React from 'react';
import { ArrowLeft, Home, Grid, Mic } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface Props {
  onBack: () => void;
  onHome: () => void;
  onToggleDrawer: () => void;
  onTriggerVoice: () => void;
  canGoBack: boolean;
  isVoiceActive: boolean;
}

export const NavigationBar: React.FC<Props> = ({
  onBack,
  onHome,
  onToggleDrawer,
  onTriggerVoice,
  canGoBack,
  isVoiceActive
}) => {
  return (
    <nav className="relative z-40 w-full py-2.5 px-6 flex items-center justify-center liquid-glass border-t border-white/10">
      <div className="flex items-center gap-8 px-6 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-lg">
        <button
          onClick={() => {
            if (canGoBack) {
              sounds.playTap();
              onBack();
            }
          }}
          disabled={!canGoBack}
          className={`p-2 rounded-full transition-all cursor-pointer ${
            canGoBack 
              ? 'text-slate-200 hover:text-white hover:bg-white/15 active:scale-90' 
              : 'text-slate-600 cursor-not-allowed opacity-40'
          }`}
          title="Atrás"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            onHome();
          }}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer active:scale-90 shadow-sm border border-white/15"
          title="Inicio"
        >
          <Home className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            onTriggerVoice();
          }}
          className={`p-2.5 rounded-full transition-all cursor-pointer active:scale-90 border ${
            isVoiceActive
              ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/40 animate-pulse'
              : 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border-indigo-500/30'
          }`}
          title="Comando de Voz Zentry AI"
        >
          <Mic className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            onToggleDrawer();
          }}
          className="p-2 rounded-full text-slate-200 hover:text-white hover:bg-white/15 transition-all cursor-pointer active:scale-90"
          title="Todas las Micro-Apps"
        >
          <Grid className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};
