import React from 'react';
import { ArrowLeft, Home, Sparkles } from 'lucide-react';
import type { ScreenId } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';

interface Props {
  currentScreen: ScreenId;
  onBack: () => void;
  onHome: () => void;
  onOpenCommand: () => void;
  isDark: boolean;
}

export const ZentryNavBar: React.FC<Props> = ({
  currentScreen,
  onBack,
  onHome,
  onOpenCommand,
  isDark
}) => {
  const canGoBack = currentScreen !== 'launcher';

  return (
    <nav className="w-full py-2 px-6 flex items-center justify-center z-40 select-none">
      <div
        className={(isDark ? 'zentry-glass-dark ' : 'zentry-glass-light ') + 'flex items-center gap-8 px-6 py-1.5 rounded-full shadow-lg'}
      >
        <button
          onClick={() => {
            if (canGoBack) {
              sounds.playTap();
              onBack();
            }
          }}
          disabled={!canGoBack}
          className={(canGoBack ? (isDark ? 'text-white hover:bg-white/10 ' : 'text-[#3B3B58] hover:bg-black/5 ') : 'opacity-30 cursor-not-allowed ') + 'p-2 rounded-full transition-all zentry-press cursor-pointer'}
          title="Atrás"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            onHome();
          }}
          className={(isDark ? 'text-white hover:bg-white/10 ' : 'text-[#3B3B58] hover:bg-black/5 ') + 'p-2.5 rounded-full transition-all zentry-press cursor-pointer'}
          title="Inicio"
        >
          <Home className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            onOpenCommand();
          }}
          className={(isDark ? 'text-white hover:bg-white/10 ' : 'text-[#3B3B58] hover:bg-black/5 ') + 'p-2 rounded-full transition-all zentry-press cursor-pointer'}
          title="Comandos Zentry"
        >
          <Sparkles className="w-5 h-5 text-indigo-500" />
        </button>
      </div>
    </nav>
  );
};
