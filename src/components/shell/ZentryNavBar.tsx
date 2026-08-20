import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Home, Sparkles, Mic, X, Send, Keyboard, Check } from 'lucide-react';
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
  const [transcript, setTranscript] = useState('');
  const [agentReply, setAgentReply] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInputMode, setTextInputMode] = useState(false);
  const [clarificationOptions, setClarificationOptions] = useState<{ label: string; screen: ScreenId }[] | null>(null);

  // Long press detection
  const pressTimerRef = useRef<any>(null);
  const recognitionRef = useRef<any | null>(null);

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
        setTranscript(current);
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
    const query = (textToProcess || transcript).trim();
    if (!query) return;

    setIsProcessing(true);
    setAgentReply('Analizando...');

    // Fast-path instant local execution
    const fastDecision = matchLocalVoiceCommand(query);
    if (fastDecision && fastDecision.action === 'navigate' && fastDecision.targetScreen) {
      sounds.playSuccess();
      setAgentReply(fastDecision.speechResponse);
      setTimeout(() => {
        onNavigate(fastDecision.targetScreen!);
        handleCloseAgent();
      }, 700);
      return;
    }

    // AI agent fallback
    try {
      const decision = await processVoiceAgentCommand(query);
      sounds.playSuccess();
      setAgentReply(decision.speechResponse);

      if (decision.action === 'navigate' && decision.targetScreen) {
        setTimeout(() => {
          onNavigate(decision.targetScreen!);
          handleCloseAgent();
        }, 800);
      } else if (decision.action === 'clarify' && decision.clarificationOptions) {
        setClarificationOptions(decision.clarificationOptions);
        setIsProcessing(false);
      } else {
        setIsProcessing(false);
      }
    } catch (e) {
      setAgentReply('No pude procesar el comando. Intenta de nuevo.');
      setIsProcessing(false);
    }
  };

  const startListening = () => {
    sounds.playTap();
    setIsAgentActive(true);
    setTranscript('');
    setAgentReply(null);
    setClarificationOptions(null);
    setTextInputMode(false);
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
    if (transcript.trim()) {
      handleExecuteCommand();
    }
  };

  const handleTouchStart = () => {
    pressTimerRef.current = setTimeout(() => {
      startListening();
    }, 300);
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
    setTranscript('');
    setAgentReply(null);
    setClarificationOptions(null);
    setIsProcessing(false);
    try {
      recognitionRef.current?.stop();
    } catch {}
  };

  return (
    <nav className="w-full py-2 px-4 md:px-6 flex items-center justify-center z-40 select-none">
      {/* 1. ACTIVE VOICE / TEXT AGENT DYNAMIC BAR */}
      {isAgentActive ? (
        <div
          className={(isDark ? 'zentry-glass-dark ' : 'zentry-glass-light ') + 'w-full max-w-xl flex flex-col gap-2 p-2.5 rounded-[28px] shadow-2xl border border-indigo-400/40 animate-in slide-in-from-bottom-3 duration-200'}
        >
          <div className="flex items-center justify-between gap-2 px-2">
            {/* Waveform / Mic status indicator */}
            <div className="flex items-center gap-2">
              <button
                onClick={isListening ? stopListening : startListening}
                className={(isListening ? 'bg-red-500 animate-pulse text-white ' : 'bg-gradient-to-tr from-purple-500 to-indigo-600 text-white ') + 'w-9 h-9 rounded-full flex items-center justify-center shadow-md cursor-pointer transition-all zentry-press'}
              >
                <Mic className="w-4 h-4" />
              </button>

              {isListening && (
                <div className="flex items-center gap-1">
                  <div className="w-1 h-3 bg-red-400 rounded-full animate-bounce" />
                  <div className="w-1 h-5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <div className="w-1 h-4 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="text-[11px] font-semibold text-red-400 ml-1">Escuchando...</span>
                </div>
              )}
            </div>

            {/* Middle Transcript or Agent Reply */}
            <div className="flex-1 px-2 min-w-0">
              {agentReply ? (
                <div className="text-xs font-bold text-indigo-400 truncate animate-in fade-in">
                  {agentReply}
                </div>
              ) : transcript ? (
                <div className="text-xs font-medium text-white truncate italic">
                  "{transcript}"
                </div>
              ) : (
                <div className="text-xs text-slate-400 truncate">
                  {isListening ? 'Habla ahora (ej: "Abre los archivos")...' : 'Di tu comando o escribe abajo...'}
                </div>
              )}
            </div>

            {/* Right Controls: Keyboard Toggle, Send, Cancel */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTextInputMode(!textInputMode)}
                title="Escribir comando"
                className="p-2 rounded-full hover:bg-white/10 text-slate-300 cursor-pointer"
              >
                <Keyboard className="w-4 h-4" />
              </button>

              {transcript.trim() && !isProcessing && (
                <button
                  onClick={() => handleExecuteCommand()}
                  className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm cursor-pointer zentry-press"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={handleCloseAgent}
                className="p-2 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Text Input Row (if toggled) */}
          {textInputMode && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExecuteCommand();
              }}
              className="flex gap-2 pt-1 px-1"
            >
              <input
                type="text"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Escribe: 'Abre el asistente de estudio' o 'Abre los archivos'..."
                autoFocus
                className="flex-1 px-3 py-1.5 rounded-full bg-white/10 text-xs text-white placeholder-slate-400 border border-white/20 focus:outline-none focus:border-indigo-400"
              />
              <button
                type="submit"
                disabled={!transcript.trim() || isProcessing}
                className="px-4 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-bold disabled:opacity-40 cursor-pointer zentry-press"
              >
                Ejecutar
              </button>
            </form>
          )}

          {/* Clarification Chips (if ambiguous) */}
          {clarificationOptions && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 px-1 border-t border-white/10">
              <span className="text-[10px] text-slate-400 mr-1">¿A cuál te refieres?:</span>
              {clarificationOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    sounds.playSuccess();
                    onNavigate(opt.screen);
                    handleCloseAgent();
                  }}
                  className="px-3 py-1 rounded-full bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-400/30 text-indigo-200 text-[11px] font-semibold transition-all cursor-pointer zentry-press"
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
