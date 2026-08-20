import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Home, Sparkles, Mic, Send, X } from 'lucide-react';
import type { ScreenId } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';
import { processVoiceAgentCommand, matchLocalVoiceCommand } from '../../services/voiceAgentService';

interface Props {
  currentScreen: ScreenId;
  onBack: () => void;
  onHome: () => void;
  onNavigate: (screen: ScreenId) => void;
  isDark: boolean;
}

export const ZentryNavBar: React.FC<Props> = ({
  currentScreen,
  onBack,
  onHome,
  onNavigate,
  isDark
}) => {
  const canGoBack = currentScreen !== 'launcher';

  // Agent Bar State
  const [isAgentActive, setIsAgentActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clarificationOptions, setClarificationOptions] = useState<{ label: string; screen: ScreenId }[] | null>(null);

  // Long press detection
  const pressTimerRef = useRef<any>(null);
  const recognitionRef = useRef<any | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'es-PE';

      rec.onresult = (event: any) => {
        const current = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setInputText(current);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (e: any) => {
        console.log('Speech recognition event:', e.error);
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Execute Agent Command
  const handleExecuteCommand = async (textToProcess?: string) => {
    const query = (textToProcess || inputText).trim();
    if (!query) return;

    setIsProcessing(true);
    setAgentStatus('Analizando...');

    // Fast-path instant local execution
    const fastDecision = matchLocalVoiceCommand(query);
    if (fastDecision && fastDecision.action === 'navigate' && fastDecision.targetScreen) {
      sounds.playSuccess();
      setAgentStatus(fastDecision.speechResponse);
      setTimeout(() => {
        onNavigate(fastDecision.targetScreen!);
        handleCloseAgent();
      }, 600);
      return;
    }

    // AI agent fallback
    try {
      const decision = await processVoiceAgentCommand(query);
      sounds.playSuccess();
      setAgentStatus(decision.speechResponse);

      if (decision.action === 'navigate' && decision.targetScreen) {
        setTimeout(() => {
          onNavigate(decision.targetScreen!);
          handleCloseAgent();
        }, 700);
      } else if (decision.action === 'clarify' && decision.clarificationOptions) {
        setClarificationOptions(decision.clarificationOptions);
        setIsProcessing(false);
      } else {
        setIsProcessing(false);
      }
    } catch (e) {
      setAgentStatus('No pude procesar el comando.');
      setIsProcessing(false);
    }
  };

  const startListening = () => {
    sounds.playTap();
    setIsAgentActive(true);
    setInputText('');
    setAgentStatus(null);
    setClarificationOptions(null);
    setIsListening(true);

    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.log('Mic already active or not permitted:', e);
    }
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch {}
    setIsListening(false);
    if (inputText.trim()) {
      handleExecuteCommand();
    }
  };

  const handleTouchStart = () => {
    pressTimerRef.current = setTimeout(() => {
      startListening();
    }, 280);
  };

  const handleTouchEnd = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (isListening) {
      stopListening();
    }
  };

  const handleCloseAgent = () => {
    sounds.playTap();
    setIsAgentActive(false);
    setIsListening(false);
    setInputText('');
    setAgentStatus(null);
    setClarificationOptions(null);
    setIsProcessing(false);
    try {
      recognitionRef.current?.stop();
    } catch {}
  };

  const handleActionButtonClick = () => {
    if (inputText.trim()) {
      handleExecuteCommand();
    } else if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const hasText = inputText.trim().length > 0;

  return (
    <nav className="w-full py-2 px-4 md:px-6 flex items-center justify-center z-40 select-none">
      {/* 1. ACTIVE UNIFIED SINGLE-LINE VOICE & TEXT BAR */}
      {isAgentActive ? (
        <div className="w-full max-w-lg flex flex-col gap-1.5 animate-in slide-in-from-bottom-2 duration-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExecuteCommand();
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 text-[#1E293B] shadow-2xl border border-white/80 transition-all backdrop-blur-md"
          >
            {/* Morphing Button: Mic (when speaking/empty) <-> Send (when typed) */}
            <button
              type="button"
              onClick={handleActionButtonClick}
              className={
                (hasText
                  ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white hover:scale-105 '
                  : isListening
                  ? 'bg-red-500 text-white animate-pulse '
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 ') +
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md cursor-pointer transition-all zentry-press'
              }
              title={hasText ? 'Enviar comando' : isListening ? 'Detener dictado' : 'Hablar'}
            >
              {hasText ? (
                <Send className="w-3.5 h-3.5" />
              ) : (
                <Mic className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Single Unified Input Line with Live Waves */}
            <div className="flex-1 flex items-center gap-2 relative min-w-0">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Habla..."
                className="w-full bg-transparent text-xs md:text-sm font-semibold text-[#1E293B] placeholder-slate-400 focus:outline-none"
              />

              {isListening && !hasText && (
                <div className="flex items-center gap-0.5 shrink-0 pr-1">
                  <div className="w-0.5 h-2.5 bg-red-400 rounded-full animate-bounce" />
                  <div className="w-0.5 h-4 bg-purple-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <div className="w-0.5 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              )}
            </div>

            {/* Subtle Status Text if present */}
            {agentStatus && (
              <span className="text-[10px] font-bold text-indigo-600 truncate max-w-[110px] animate-in fade-in">
                {agentStatus}
              </span>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseAgent}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </form>

          {/* Clarification Chips if ambiguous */}
          {clarificationOptions && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 px-2">
              <span className="text-[10px] font-medium text-white/80">¿A cuál te refieres?:</span>
              {clarificationOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    sounds.playSuccess();
                    onNavigate(opt.screen);
                    handleCloseAgent();
                  }}
                  className="px-3 py-1 rounded-full bg-white/90 text-[#1E293B] text-[11px] font-bold shadow-md hover:bg-white cursor-pointer zentry-press"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 2. REGULAR SLEEK SYSTEM NAVBAR */
        <div
          className={(isDark ? 'zentry-glass-dark ' : 'zentry-glass-light ') + 'flex items-center gap-8 px-6 py-1.5 rounded-full shadow-lg border border-white/20 transition-all'}
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

          {/* Voice Agent Hold / Tap Button */}
          <button
            onClick={startListening}
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className={(isDark ? 'text-white hover:bg-white/10 ' : 'text-[#3B3B58] hover:bg-black/5 ') + 'p-2 rounded-full transition-all zentry-press cursor-pointer relative group'}
            title="Mantén presionado para hablar con el Agente Zentry"
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            </div>
          </button>
        </div>
      )}
    </nav>
  );
};
