import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, Volume2 } from 'lucide-react';
import type { ChatMessage } from '../../types/zentry';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { askZentryAi } from '../../services/aiService';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryAiScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '¡Hola! Soy Zentry AI, tu compañero de aprendizaje inteligente. ¿Qué reto o curiosidad exploramos hoy? 🚀',
      isUser: false,
      timestamp: 'Ahora'
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const suggestions = [
    '¿Por qué el cielo es azul? 🌌',
    'Ayúdame con un problema de fracciones 📐',
    '¿Cómo funciona la fotosíntesis? 🌱',
    'Cuéntame una historia sobre el espacio 🚀'
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isThinking) return;

    sounds.playTap();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: 'Ahora'
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsThinking(true);

    try {
      const response = await askZentryAi('general_ai', text);
      sounds.playSuccess();
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: 'Ahora'
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Vamos a explorarlo paso a paso con el método socrático. ¿Qué pista inicial crees que nos ayuda a resolverlo?',
        isUser: false,
        timestamp: 'Ahora'
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <ZentrySubPageScaffold title="Zentry AI" kicker="COMPAÑERO SOCRÁTICO" onBack={onBack} isDark={isDark}>
      <div className="flex flex-col h-full space-y-4">
        {/* Interactive Avatar Bar */}
        <div className="flex items-center justify-center gap-3 py-1">
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-b from-[#533B87] to-[#3B2E63] border-2 border-white/40 shadow-xl flex items-center justify-center">
            {/* Eyes */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-3 rounded-full bg-[#C2F4E7] animate-pulse" />
              <div className="w-2 h-3 rounded-full bg-[#C2F4E7] animate-pulse" />
            </div>
            {/* Thinking Aura */}
            {isThinking && (
              <div className="absolute -inset-1.5 rounded-full border-2 border-[#D6C8FA] animate-spin" />
            )}
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              className={(isDark ? 'bg-white/10 hover:bg-white/20 text-white ' : 'bg-white/70 hover:bg-white/90 text-[#4A148C] ') + 'px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition-all zentry-press cursor-pointer'}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={'flex ' + (m.isUser ? 'justify-end' : 'justify-start')}
            >
              <div
                className={
                  m.isUser
                    ? 'bg-[#42A5F5] text-white rounded-[20px] rounded-br-[4px] px-4 py-2.5 max-w-[80%] text-sm shadow-md'
                    : (isDark ? 'bg-white/15 text-white ' : 'bg-white/90 text-[#263238] ') + 'rounded-[20px] rounded-bl-[4px] px-4 py-2.5 max-w-[80%] text-sm shadow-md leading-relaxed'
                }
              >
                {m.text}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex justify-start">
              <div className={(isDark ? 'bg-white/15 text-white ' : 'bg-white/80 text-[#263238] ') + 'rounded-[20px] px-4 py-2 text-xs font-semibold animate-pulse flex items-center gap-2'}>
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                <span>Zentry AI (Gemini 2.5 Flash) está razonando...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative pt-1 flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregúntame lo que quieras aprender..."
            disabled={isThinking}
            className={(isDark ? 'bg-white/10 text-white placeholder-white/40 border-white/20 ' : 'bg-white/80 text-[#1E293B] placeholder-slate-400 border-white/60 ') + 'w-full pl-4 pr-12 py-3 rounded-full border text-sm font-medium focus:outline-none focus:border-[#8B5CF6] shadow-md disabled:opacity-50'}
          />
          <button
            type="submit"
            disabled={isThinking || !input.trim()}
            className="absolute right-2 w-9 h-9 rounded-full bg-[#4A148C] hover:bg-[#5E1A9E] text-white flex items-center justify-center transition-all zentry-press cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </ZentrySubPageScaffold>
  );
};
