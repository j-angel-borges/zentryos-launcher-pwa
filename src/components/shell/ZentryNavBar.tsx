import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Home, Sparkles, Mic, Send, X, ExternalLink } from 'lucide-react';
import type { ScreenId, AgeTier } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';
import { processVoiceAgentCommand, matchLocalVoiceCommand } from '../../services/voiceAgentService';
import { ZentryRecentAppsModal } from './ZentryRecentAppsModal';
import { ZentryAiDrawer } from './ZentryAiDrawer';
import { ZentryLogoIcon } from '../ui/ZentryLogoIcon';

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

  // Navigation and UI state
  const [isAiMode, setIsAiMode] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isRecentAppsOpen, setIsRecentAppsOpen] = useState(false);

  // Voice & Input state
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // References
  const longPressTimerRef = useRef<any>(null);
  const isLongPressTriggered = useRef(false);
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

  // Execute Voice / Text Command
  const handleExecuteCommand = async (textToProcess?: string) => {
    const query = (textToProcess || inputText).trim();
    if (!query) return;

    setIsProcessing(true);
    setAgentStatus('Analizando...');

    // 1. Fast-path local instant execution
    const fastDecision = matchLocalVoiceCommand(query);
    if (fastDecision && fastDecision.action === 'navigate' && fastDecision.targetScreen) {
      sounds.playSuccess();
      setAgentStatus(fastDecision.speechResponse);
      setTimeout(() => {
        onNavigate(fastDecision.targetScreen!);
        setInputText('');
        setAgentStatus(null);
        setIsProcessing(false);
        setIsAiMode(false);
      }, 600);
      return;
    }

    // 2. AI agent decision fallback
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
          setIsAiMode(false);
        }, 700);
      } else {
        setIsProcessing(false);
      }
    } catch {
      setAgentStatus('Listo');
      setIsProcessing(false);
    }
  };

  // Back Button Handlers (Tap = Back, Long Press = Recent Apps Modal)
  const handleBackTouchStart = () => {
    isLongPressTriggered.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggered.current = true;
      sounds.playInterventionShield();
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([25, 50, 25]);
      }
      setIsRecentAppsOpen(true);
    }, 380);
  };

  const handleBackTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleBackClick = () => {
    if (isLongPressTriggered.current) {
      isLongPressTriggered.current = false;
      return;
    }
    sounds.playTap();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
    if (canGoBack) {
      onBack();
    } else {
      setIsRecentAppsOpen(true);
    }
  };

  // Home Button Handler
  const handleHomeClick = () => {
    sounds.playTap();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
    setIsAiMode(false);
    setIsAiDrawerOpen(false);
    setIsRecentAppsOpen(false);
    onHome();
  };

  // AI Button Click (Expands bar & opens AI drawer)
  const handleAiButtonClick = () => {
    sounds.playSuccess();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }
    setIsAiMode(true);
    setIsAiDrawerOpen(true);
    if (ageTier === 'toddler') {
      voiceService.speakFeedback('¡Hola! Soy Zentry. ¿Qué quieres explorar o aprender hoy?');
    }
  };

  // Mic Button (Hold / Tap for Speech-to-Text)
  const handleStartMic = () => {
    sounds.playTap();
    setInputText('');
    setAgentStatus(null);
    setIsListening(true);

    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.log('Mic start:', e);
    }
  };

  const handleStopMic = () => {
    try {
      recognitionRef.current?.stop();
    } catch {}
    setIsListening(false);
    if (inputText.trim()) {
      handleExecuteCommand();
    }
  };

  const hasText = inputText.trim().length > 0;

  return (
    <>
      <nav className="w-full py-2.5 px-4 flex items-center justify-center z-40 select-none">
        {/* CONTAINER WITH BOUNCE & SPRING MORPHING PHYSICS */}
        <div
          className={
            (isDark ? 'zentry-glass-dark ' : 'zentry-glass-light ') +
            'transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] rounded-full shadow-2xl border border-white/40 backdrop-blur-2xl ' +
            (isAiMode ? 'w-full max-w-md px-3 py-1.5' : 'w-auto px-2 py-1.5')
          }
        >
          {/* STATE A: EXPANDED AI CHAT & SPEECH-TO-TEXT BAR */}
          {isAiMode ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExecuteCommand();
              }}
              className="w-full flex items-center gap-2 animate-in slide-in-from-right-4 duration-300"
            >
              {/* Mic / Speech-to-Text Button with Waves */}
              <button
                type="button"
                onMouseDown={handleStartMic}
                onMouseUp={handleStopMic}
                onTouchStart={handleStartMic}
                onTouchEnd={handleStopMic}
                onClick={() => {
                  if (isListening) handleStopMic();
                  else handleStartMic();
                }}
                className={
                  (isListening
                    ? 'bg-red-500 text-white animate-pulse scale-110 ring-4 ring-red-400/40 '
                    : 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white hover:scale-105 ') +
                  'w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-lg cursor-pointer transition-all zentry-press relative'
                }
                title="Mantén presionado para hablar"
              >
                <Mic className="w-4 h-4" />
                {isListening && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                )}
              </button>

              {/* Text Input with Live Waves when listening */}
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isListening ? 'Escuchando tu voz...' : 'Escribe o habla a Zentry...'}
                  className={
                    (isDark ? 'text-white placeholder-slate-400 ' : 'text-slate-900 placeholder-slate-500 ') +
                    'w-full bg-transparent text-xs font-bold focus:outline-none'
                  }
                  autoFocus
                />

                {/* Animated Speech Equalizer Waves */}
                {isListening && (
                  <div className="flex items-center gap-1 shrink-0 pr-1">
                    <span className="w-1 h-3 bg-red-400 rounded-full animate-bounce [animation-delay:0s]" />
                    <span className="w-1 h-5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1 h-3.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                  </div>
                )}
              </div>

              {/* Status if processing */}
              {agentStatus && (
                <span className="text-[10px] font-black text-indigo-400 truncate max-w-[80px] animate-in fade-in">
                  {agentStatus}
                </span>
              )}

              {/* Action Button: Send when text typed, or Open Drawer / Close */}
              {hasText ? (
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="p-2 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md hover:scale-105 cursor-pointer zentry-press shrink-0"
                  title="Enviar"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAiDrawerOpen(true)}
                  className="p-2 rounded-full text-indigo-400 hover:text-indigo-300 hover:bg-white/10 cursor-pointer zentry-press shrink-0"
                  title="Desplegar chat Zentry AI"
                >
                  <ZentryLogoIcon className="w-4 h-4 animate-pulse" />
                </button>
              )}

              {/* Close Bar Button (Returns to 3-button pill) */}
              <button
                type="button"
                onClick={() => {
                  sounds.playTap();
                  setIsAiMode(false);
                }}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer shrink-0"
                title="Volver a botones de navegación"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* STATE B: SLEEK 3-BUTTON LIQUID GLASS FLOATING CAPSULE */
            <div className="flex items-center gap-4 px-2">
              {/* 1. BOTÓN RETROCESO (IZQUIERDA) - Click: Back | Long-press: Recent Apps */}
              <button
                onClick={handleBackClick}
                onMouseDown={handleBackTouchStart}
                onMouseUp={handleBackTouchEnd}
                onTouchStart={handleBackTouchStart}
                onTouchEnd={handleBackTouchEnd}
                className={
                  (isDark
                    ? 'text-white hover:bg-white/15 '
                    : 'text-[#1E293B] hover:bg-black/10 ') +
                  'w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 zentry-press cursor-pointer active:scale-90 hover:scale-108 relative group'
                }
                title="Atrás (Mantén presionado para ver Procesos en Segundo Plano)"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>

              {/* 2. BOTÓN INICIO (CENTRO) - Click: Home */}
              <button
                onClick={handleHomeClick}
                className={
                  (isDark
                    ? 'text-white hover:bg-white/15 '
                    : 'text-[#1E293B] hover:bg-black/10 ') +
                  'w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 zentry-press cursor-pointer active:scale-90 hover:scale-108 group'
                }
                title="Pantalla de Inicio"
              >
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>

              {/* 3. BOTÓN INTELIGENCIA ARTIFICIAL (DERECHA) - Click: Morph into AI Chat */}
              <button
                onClick={handleAiButtonClick}
                className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500/25 via-purple-500/25 to-pink-500/25 hover:from-indigo-500/40 hover:to-pink-500/40 flex items-center justify-center transition-all duration-200 zentry-press cursor-pointer active:scale-90 hover:scale-108 border border-white/40 shadow-sm relative group"
                title="Hablar o Chatear con Zentry AI"
              >
                <ZentryLogoIcon className="w-5 h-5 group-hover:scale-115 transition-transform" />
                <span className="w-2 h-2 rounded-full bg-purple-400 absolute -top-0.5 -right-0.5 animate-ping" />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* RECENT APPS / PROCESOS EN SEGUNDO PLANO MODAL (Hold Back Button) */}
      <ZentryRecentAppsModal
        isOpen={isRecentAppsOpen}
        onClose={() => setIsRecentAppsOpen(false)}
        onNavigate={onNavigate}
        currentScreen={currentScreen}
        isDark={isDark}
        ageTier={ageTier}
      />

      {/* ZENTRY AI CHAT & SUGGESTIONS DRAWER (Click AI Button) */}
      <ZentryAiDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => {
          setIsAiDrawerOpen(false);
          setIsAiMode(false);
        }}
        onNavigate={onNavigate}
        isDark={isDark}
        ageTier={ageTier}
      />
    </>
  );
};
