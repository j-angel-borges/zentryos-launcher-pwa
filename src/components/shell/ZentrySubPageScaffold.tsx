import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface Props {
  title: string;
  kicker?: string;
  onBack: () => void;
  isDark: boolean;
  children: React.ReactNode;
}

export const ZentrySubPageScaffold: React.FC<Props> = ({
  title,
  kicker,
  onBack,
  isDark,
  children
}) => {
  return (
    <div className="w-full h-full flex flex-col p-3 md:p-6 overflow-hidden z-10">
      <div
        className={(isDark ? 'zentry-glass-dark text-white ' : 'zentry-glass-light text-[#1E293B] ') + 'flex-1 rounded-[32px] p-4 md:p-6 flex flex-col overflow-hidden shadow-2xl'}
      >
        {/* Header matching Kotlin ZentrySubPageScaffold.kt */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          {/* Back Chip Button */}
          <button
            onClick={() => {
              sounds.playTap();
              onBack();
            }}
            className={(isDark ? 'bg-white/10 hover:bg-white/20 text-white ' : 'bg-white/60 hover:bg-white/80 text-[#3B3B58] ') + 'w-10 h-10 rounded-[14px] flex items-center justify-center transition-all zentry-press cursor-pointer shadow-sm'}
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Title and Kicker */}
          <div className="flex flex-col items-center">
            {kicker && (
              <span className={(isDark ? 'text-white/60 ' : 'text-[#64748B] ') + 'text-[10px] font-black tracking-widest uppercase'}>
                {kicker}
              </span>
            )}
            <h2 className="text-xl md:text-2xl font-black tracking-tight">{title}</h2>
          </div>

          <div className="w-10 h-10" />
        </div>

        {/* Inner Content */}
        <div className="flex-1 overflow-y-auto pt-4">
          {children}
        </div>
      </div>
    </div>
  );
};
