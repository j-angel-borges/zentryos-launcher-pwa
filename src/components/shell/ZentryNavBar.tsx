import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Home, Sparkles, Mic, Send, ExternalLink, X } from 'lucide-react';
import type { ScreenId, AgeTier } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';
import { processVoiceAgentCommand, matchLocalVoiceCommand } from '../../services/voiceAgentService';

interface Props {
  currentScreen: ScreenId;
  onBack: () => void;
  onHome: () => void;
  onNavigate: (screen: ScreenId) => void;
  isDark: boolean;
  ageTier?: AgeTier;
}

export const ZentryNavBar: React.FC<Props> = ({
  currentScreen,
  onBack,
  onHome,
  onNavigate,
  isDark,
  ageTier = 'toddler'
}) => {
  const canGoBack = currentScreen !== 'launcher';

  // Agent State
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clarificationOptions, setClarificationOptions] = useState<{ label: string; screen: ScreenId }[] | null>(null);

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
        setInputText('');
        setAgentStatus(null);
        setIsProcessing(false);
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
          setInputText('');
          setAgentStatus(null);
          setIsProcessing(false);
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

  const handleMicClick = () => {
    if (isListening) {
      sounds.playTap();
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      if (inputText.trim()) {
        handleExecuteCommand();
      }
      return;
    }

    sounds.playTap();
    setInputText('');
    setAgentStatus(null);
    setClarificationOptions(null);
    setIsListening(true);

    if (ageTier === 'toddler') {
      voiceService.speakFeedback('¡Hola! ¿Qué quieres explorar o aprender hoy?');
    }

    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.log('Mic start catch:', e);
    }
  };

  const hasText = inputText.trim().length > 0;

  return (
    <nav className="w-full py-2 px-3 md:px-6 flex flex-col items-center justify-center gap-1.5 z-40 select-none">
      <div className="w-full max-w-lg flex items-center gap-2">
        {/* Left Navigation Buttons: Back & Home */}
        <div
          className={
            (isDark ? 'zentry-glass-dark ' : 'zentry-glass-light ') +
            'flex items-center gap-1 p-1 rounded-full shadow-lg border border-white/30 shrink-0'
          }
        >
          {canGoBack && (
            <button
              onClick={() => {
                sounds.playTap();
                onBack();
              }}
              className={
                (isDark ? 'text-white hover:bg-white/10 ' : 'text-[#1E293B] hover:bg-black/5 ') +
                'p-2 rounded-full transition-all zentry-press cursor-pointer'
              }
              title="Atrás"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              sounds.playTap();
              onHome();
            }}
            className={
              (isDark ? 'text-white hover:bg-white/10 ' : 'text-[#1E293B] hover:bg-black/5 ') +
              'p-2 rounded-full transition-all zentry-press cursor-pointer'
            }
            title="Inicio"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* Center/Right Unified Interactive Voice & Text Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteCommand();
          }}
          className={
            (isDark ? 'zentry-glass-dark text-white ' : 'zentry-glass-light text-[#1E293B] ') +
            'flex-1 flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg border border-white/40 backdrop-blur-xl transition-all min-w-0'
          }
        >
          {/* Mic Button: Tocar para hablar */}
          <button
            type="button"
            onClick={handleMicClick}
            className={
              (isListening
                ? 'bg-red-500 text-white animate-pulse '
                : 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white hover:scale-105 ') +
              'w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md cursor-pointer transition-all zentry-press'
            }
            title={isListening ? 'Detener dictado' : 'Toca para hablar con Zentry'}
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Text Input: Escribir pregunta */}
          <div className="flex-1 flex items-center gap-1.5 min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? 'Escuchando...' : 'Habla o escribe a Zentry...'}
              className={
                (isDark ? 'text-white placeholder-slate-400 ' : 'text-slate-900 placeholder-slate-500 ') +
                'w-full bg-transparent text-xs md:text-sm font-bold focus:outline-none'
              }
            />

            {isListening && (
              <div className="flex items-center gap-0.5 shrink-0 pr-1">
                <div className="w-0.5 h-2.5 bg-red-400 rounded-full animate-bounce" />
                <div className="w-0.5 h-4 bg-purple-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                <div className="w-0.5 h-3 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            )}
          </div>

          {/* Status badge if processing */}
          {agentStatus && (
            <span className="text-[10px] font-extrabold text-indigo-500 truncate max-w-[90px] animate-in fade-in">
              {agentStatus}
            </span>
          )}

          {/* Send or Fullscreen AI Chat Button */}
          {hasText ? (
            <button
              type="submit"
              disabled={isProcessing}
              className="p-1.5 rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-500 cursor-pointer zentry-press shrink-0 disabled:opacity-50"
              title="Enviar comando"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onNavigate('ai');
              }}
              className="p-1.5 rounded-full text-indigo-400 hover:text-indigo-300 hover:bg-white/10 cursor-pointer zentry-press shrink-0 group"
              title="Abrir Tutor Zentry AI en pantalla completa"
            >
              <Sparkles className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
            </button>
          )}
        </form>
      </div>

      {/* Clarification Chips if ambiguous */}
      {clarificationOptions && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 px-2 animate-in fade-in">
          <span className="text-[10px] font-medium text-white/90">¿A cuál te refieres?:</span>
          {clarificationOptions.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => {
                sounds.playSuccess();
                onNavigate(opt.screen);
                setClarificationOptions(null);
                setInputText('');
              }}
              className="px-3 py-1 rounded-full bg-white/95 text-[#1E293B] text-[11px] font-black shadow-md hover:bg-white cursor-pointer zentry-press"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};
