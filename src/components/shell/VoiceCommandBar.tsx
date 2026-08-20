import React from 'react';
import { Sparkles, X } from 'lucide-react';
import type { VoiceCommandResult } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';

interface Props {
  isActive: boolean;
  onClose: () => void;
  lastResult: VoiceCommandResult | null;
  statusText: string;
}

export const VoiceCommandBar: React.FC<Props> = ({
  isActive,
  onClose,
  lastResult,
  statusText
}) => {
  if (!isActive && !lastResult) return null;

  return (
    <div className="absolute bottom-20 inset-x-4 max-w-lg mx-auto z-50 animate-in fade-in duration-300">
      <div className="liquid-glass rounded-3xl p-5 border border-indigo-400/40 shadow-2xl shadow-indigo-500/20 text-white space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-indigo-500/30 text-indigo-300 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm">Asistente de Voz ZentryOS</span>
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

        {isActive && (
          <div className="flex items-center justify-center gap-1.5 py-3">
            {[40, 70, 100, 60, 90, 45, 80, 55, 95, 50].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-gradient-to-t from-indigo-500 to-sky-400 rounded-full animate-bounce"
                style={{
                  height: `${h * 0.3}px`,
                  animationDelay: `${i * 0.08}s`
                }}
              />
            ))}
          </div>
        )}

        <div className="text-center space-y-1.5">
          <p className="text-xs text-indigo-300 font-medium">
            {isActive ? statusText : lastResult?.transcript ? `"${lastResult.transcript}"` : statusText}
          </p>
          {lastResult && (
            <p className="text-xs text-slate-200 bg-white/5 p-2.5 rounded-xl border border-white/10">
              {lastResult.aiResponse}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
