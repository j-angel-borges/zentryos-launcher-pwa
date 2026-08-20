import React, { useState } from 'react';
import { Send } from 'lucide-react';
import type { ChatMessage } from '../../types/zentry';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryAiScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '¡Hola! Soy Zentry AI, tu compañero de aprendizaje inteligente. ¿Qué descubrimos hoy?',
      isUser: false,
      timestamp: 'Ahora'
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const suggestions = [
    '¿Por qué el cielo es azul? 🌌',
    'Cuéntame un chiste 🎭',
    'Inventa una historia 📚'
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    sounds.playTap();
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: text.trim(), isUser: true, timestamp: 'Ahora' }
    ]);
    if (!textToSend) setInput('');
    setIsThinking(true);

    setTimeout(() => {
      sounds.playSuccess();
      setIsThinking(false);
      let reply = 'He analizado tu consulta sobre ' + text + '. ';
      if (text.includes('azul')) {
        reply += 'La luz del sol se dispersa en la atmósfera mediante la Dispersión de Rayleigh. Las ondas de luz azul son más cortas y se dispersan más que los otros colores.';
      } else if (text.includes('chiste')) {
        reply += '¿Qué le dice un jardinero a otro? ¡Nos vemos cuando podamos!';
      } else if (text.includes('historia')) {
        reply += 'Había una vez un pequeño robot explorador en los Andes peruanos que descubrió una ciudad secreta impulsada por energía solar incaica...';
      } else {
        reply += 'Vamos a explorarlo paso a paso con el método socrático. ¿Qué pista inicial crees que nos ayuda a resolverlo?';
      }

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), text: reply, isUser: false, timestamp: 'Ahora' }
      ]);
    }, 1000);
  };

  return (
    <ZentrySubPageScaffold title="Zentry AI" kicker="COMPAÑERO INTELIGENTE" onBack={onBack} isDark={isDark}>
      <div className="flex flex-col h-full space-y-4">
        <div className="flex items-center justify-center gap-3 py-1">
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-b from-[#533B87] to-[#3B2E63] border-2 border-white/40 shadow-xl flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-3 rounded-full bg-[#C2F4E7] animate-pulse" />
              <div className="w-2 h-3 rounded-full bg-[#C2F4E7] animate-pulse" />
            </div>
            {isThinking && (
              <div className="absolute -inset-1.5 rounded-full border-2 border-[#D6C8FA] animate-spin" />
            )}
          </div>
        </div>

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
              <div className={(isDark ? 'bg-white/15 text-white ' : 'bg-white/80 text-[#263238] ') + 'rounded-[20px] px-4 py-2 text-xs font-semibold animate-pulse'}>
                Zentry AI está pensando...
              </div>
            </div>
          )}
        </div>

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
            placeholder="Pregúntame lo que quieras..."
            className={(isDark ? 'bg-white/10 text-white placeholder-white/40 border-white/20 ' : 'bg-white/80 text-[#1E293B] placeholder-slate-400 border-white/60 ') + 'w-full pl-4 pr-12 py-3 rounded-full border text-sm font-medium focus:outline-none focus:border-[#8B5CF6] shadow-md'}
          />
          <button
            type="submit"
            className="absolute right-2 w-9 h-9 rounded-full bg-[#4A148C] hover:bg-[#5E1A9E] text-white flex items-center justify-center transition-all zentry-press cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </ZentrySubPageScaffold>
  );
};
