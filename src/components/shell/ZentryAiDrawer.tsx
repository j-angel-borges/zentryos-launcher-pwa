import React, { useState } from 'react';
import { X, Send, ExternalLink, Volume2 } from 'lucide-react';
import type { ScreenId, AgeTier } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';
import { askZentryAi } from '../../services/aiService';
import { ZentryLogoIcon } from '../ui/ZentryLogoIcon';

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
  ageTier = 'toddler'
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text:
        ageTier === 'toddler'
          ? '¡Hola! Soy Zentry. ¿Qué quieres descubrir hoy? ✨'
          : '¡Hola! Soy Zentry. ¿Qué tema investigamos hoy?',
      timestamp: 'Ahora'
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toddlerPrompts = [
    '🌟 Estrellas',
    '🦖 Dinosaurios',
    '🎨 Colores',
    '🚀 Cohetes'
  ];

  const explorerPrompts = [
    '🪐 Universo',
    '💡 Inventos',
    '🌿 Plantas',
    '📐 Reto'
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
        text: '¡Estoy aquí contigo! ¿Probamos otra pregunta?',
        timestamp: 'Ahora'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex flex-col justify-end items-center p-3 animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sounds.playTap();
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-lg rounded-[38px] p-5 shadow-2xl border border-purple-400/50 bg-[#120E24]/95 text-white space-y-4 animate-in slide-in-from-bottom-8 duration-300 relative max-h-[82vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg relative">
              <ZentryLogoIcon className="w-5 h-5" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-ping" />
            </div>
            <h3 className="text-base font-black tracking-tight text-white drop-shadow-sm">
              Zentry
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sounds.playTap();
                onClose();
                onNavigate('ai');
              }}
              className="p-2 rounded-full hover:bg-white/10 text-indigo-300 hover:text-white cursor-pointer"
              title="Pantalla completa"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                onClose();
              }}
              className="p-2 rounded-full hover:bg-white/10 text-white cursor-pointer"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips (1-2 words) */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(prompt)}
              className="shrink-0 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-xs font-black text-white border border-white/20 shadow-md transition-all zentry-spring-press cursor-pointer"
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
                    : 'bg-white/15 text-white rounded-2xl rounded-tl-sm border border-white/20 ') +
                  'px-4 py-2.5 max-w-[86%] text-xs font-black shadow-md space-y-1'
                }
              >
                <div className="leading-relaxed drop-shadow-sm">{msg.text}</div>
                {msg.sender === 'ai' && (
                  <button
                    onClick={() => voiceService.speakFeedback(msg.text)}
                    className="flex items-center gap-1 text-[10px] text-purple-300 hover:text-white pt-0.5 cursor-pointer font-bold"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Escuchar</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/15 text-xs text-white font-bold w-fit animate-pulse">
              <ZentryLogoIcon className="w-4 h-4 animate-spin" />
              <span>Pensando...</span>
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(inputQuery);
          }}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white/15 border border-white/30 backdrop-blur-xl shadow-lg shrink-0"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Pregunta algo..."
            className="flex-1 bg-transparent text-xs font-black text-white placeholder-slate-400 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="p-2 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white cursor-pointer shadow-md disabled:opacity-40 zentry-spring-press"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
