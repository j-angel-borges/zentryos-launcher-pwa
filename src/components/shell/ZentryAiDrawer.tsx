import React, { useState } from 'react';
import { Sparkles, X, Send, Mic, ExternalLink, Bot, MessageCircle, Volume2 } from 'lucide-react';
import type { ScreenId, AgeTier } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';
import { askZentryAi } from '../../services/aiService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: ScreenId) => void;
  isDark: boolean;
  ageTier?: AgeTier;
}

export const ZentryAiDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  onNavigate,
  isDark,
  ageTier = 'toddler'
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text:
        ageTier === 'toddler'
          ? '¡Hola, pequeño explorador! Soy Zentry. ¿Qué curiosidad o aventura descubriremos hoy? ✨'
          : '¡Hola! Soy Zentry, tu copiloto inteligente. ¿Qué tema o proyecto deseas investigar hoy?',
      timestamp: 'Ahora'
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toddlerPrompts = [
    '🌟 ¿Por qué brillan las estrellas?',
    '🦖 Cuéntame un cuento de dinosaurios',
    '🎨 ¿Cómo se mezclan los colores?',
    '🚀 ¿Cómo vuelan los cohetes al espacio?'
  ];

  const explorerPrompts = [
    '🪐 Explícame cómo funciona un agujero negro',
    '💡 ¿Cómo inventaron la electricidad?',
    '🌿 ¿Por qué las plantas son verdes?',
    '📐 Ayúdame a resolver un reto matemático'
  ];

  const quickPrompts = ageTier === 'toddler' ? toddlerPrompts : explorerPrompts;

  if (!isOpen) return null;

  const handleSendPrompt = async (promptText: string) => {
    const text = promptText.trim();
    if (!text || isLoading) return;

    sounds.playTap();
    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const systemPrompt = `Eres Zentry AI, un tutor socrático cariñoso, motivador y divertido para un niño (${
        ageTier === 'toddler' ? '2 a 5 años' : '5 a 10+ años'
      }).
Responde a esta pregunta: "${text}".
Mantén la respuesta en 2 oraciones breves, comprensibles, alegres y socráticas.`;

      const aiResponse = await askZentryAi('general_ai', systemPrompt);
      sounds.playSuccess();

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
      voiceService.speakFeedback(aiResponse);
    } catch {
      const errorMsg: ChatMessage = {
        id: 'ai-err-' + Date.now(),
        sender: 'ai',
        text: '¡Vaya! Mi conexión estelar parpadeó, pero estoy aquí contigo. ¿Probamos otra pregunta?',
        timestamp: 'Ahora'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-lg flex flex-col justify-end items-center p-3 animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sounds.playTap();
          onClose();
        }
      }}
    >
      <div
        className={
          (isDark ? 'zentry-glass-dark text-white ' : 'zentry-glass-light text-[#1E293B] ') +
          'w-full max-w-lg rounded-[38px] p-5 shadow-2xl border border-purple-400/40 space-y-4 animate-in slide-in-from-bottom-8 duration-300 relative max-h-[82vh] flex flex-col'
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg relative">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black tracking-tight">Zentry AI Assistant</h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-[9px] text-purple-300 font-bold border border-purple-500/30">
                  {ageTier === 'toddler' ? 'Modo Primera Infancia' : 'Modo Explorador'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Tutor socrático, visión y curiosidades</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sounds.playTap();
                onClose();
                onNavigate('ai');
              }}
              className="p-2 rounded-full hover:bg-white/10 text-indigo-400 hover:text-indigo-300 cursor-pointer"
              title="Abrir pantalla completa"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                onClose();
              }}
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              title="Cerrar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(prompt)}
              className="shrink-0 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-bold text-slate-200 border border-white/15 shadow-sm transition-all zentry-press cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Conversation Message List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1 no-scrollbar min-h-[160px] max-h-[300px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={
                  (msg.sender === 'user'
                    ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-sm '
                    : 'bg-white/15 text-slate-100 rounded-2xl rounded-tl-sm border border-white/15 ') +
                  'px-4 py-2.5 max-w-[86%] text-xs font-semibold shadow-md space-y-1'
                }
              >
                <div className="leading-relaxed">{msg.text}</div>
                {msg.sender === 'ai' && (
                  <button
                    onClick={() => voiceService.speakFeedback(msg.text)}
                    className="flex items-center gap-1 text-[10px] text-purple-300 hover:text-white pt-0.5 cursor-pointer"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Escuchar</span>
                  </button>
                )}
              </div>
              <span className="text-[9px] text-slate-400 px-1 pt-0.5 font-mono">{msg.timestamp}</span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/10 text-xs text-slate-300 w-fit animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span>Zentry está pensando...</span>
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(inputQuery);
          }}
          className="w-full flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/15 border border-white/30 backdrop-blur-xl shadow-lg shrink-0"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={ageTier === 'toddler' ? 'Pregunta lo que quieras...' : 'Escribe tu consulta...'}
            className="flex-1 bg-transparent text-xs font-bold text-white placeholder-slate-400 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="p-2 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white cursor-pointer shadow-md disabled:opacity-40 zentry-press"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
