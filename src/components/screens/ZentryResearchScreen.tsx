import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, BookOpen, Clock, FileText, Send, ChevronRight, ArrowLeft } from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { askZentryAi } from '../../services/aiService';
import { MarkdownView } from '../ui/MarkdownView';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

interface ResearchHistoryItem {
  id: string;
  topic: string;
  date: string;
  chatMessages: { id: string; text: string; isUser: boolean }[];
  keyFacts: string[];
  fullReport: string;
}

export const ZentryResearchScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [history, setHistory] = useState<ResearchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('zentry_research_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeItem, setActiveItem] = useState<ResearchHistoryItem | null>(null);
  const [input, setInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('zentry_research_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Could not save history:', e);
    }
  }, [history]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeItem?.chatMessages, isSearching]);

  const handleStartResearch = async () => {
    const topic = input.trim();
    if (!topic || isSearching) return;

    sounds.playTap();
    setIsSearching(true);
    setInput('');

    try {
      const raw = await askZentryAi(
        'deep_research',
        `Investigación interactiva para un estudiante sobre el tema: "${topic}". Responde con chatMessage amigable y fullReport en segundo plano.`
      );
      const parsed = JSON.parse(raw.trim().replace(/^```json/, '').replace(/```$/, ''));
      sounds.playSuccess();

      const newItem: ResearchHistoryItem = {
        id: Date.now().toString(),
        topic,
        date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        chatMessages: [
          { id: '1', text: `Quiero investigar sobre: ${topic}`, isUser: true },
          { id: '2', text: parsed.chatMessage || `¡Excelente tema! He investigado sobre ${topic}. ¿Qué aspecto te llama más la atención?`, isUser: false }
        ],
        keyFacts: parsed.keyFacts || [],
        fullReport: parsed.fullReport || `# Investigación: ${topic}\n\nDetalles recopilados con éxito.`
      };

      setHistory((prev) => [newItem, ...prev.filter((h) => h.topic.toLowerCase() !== topic.toLowerCase())]);
      setActiveItem(newItem);
      setShowFullReport(false);
    } catch (e) {
      console.warn('Fallback research:', e);
      const fallbackItem: ResearchHistoryItem = {
        id: Date.now().toString(),
        topic,
        date: 'Hoy',
        chatMessages: [
          { id: '1', text: `Quiero investigar sobre: ${topic}`, isUser: true },
          { id: '2', text: `¡${topic} es un tema fascinante! ¿Sabías que tiene características únicas? ¿Qué te gustaría descubrir primero?`, isUser: false }
        ],
        keyFacts: [`Dato sobre ${topic}`],
        fullReport: `# ${topic}\n\nInvestigación en progreso.`
      };
      setHistory((prev) => [fallbackItem, ...prev]);
      setActiveItem(fallbackItem);
    } finally {
      setIsSearching(false);
    }
  };

  const handleContinueDialogue = async () => {
    const text = input.trim();
    if (!text || !activeItem || isSearching) return;

    sounds.playTap();
    const userMsg = { id: Date.now().toString(), text, isUser: true };

    const updatedItem = {
      ...activeItem,
      chatMessages: [...activeItem.chatMessages, userMsg]
    };
    setActiveItem(updatedItem);
    setInput('');
    setIsSearching(true);

    try {
      const raw = await askZentryAi(
        'deep_research',
        `El estudiante está investigando "${activeItem.topic}" y te responde: "${text}". Continúa la conversación con un dato curioso breve y una nueva pregunta socrática.`
      );
      let replyText = raw;
      try {
        const parsed = JSON.parse(raw.trim().replace(/^```json/, '').replace(/```$/, ''));
        if (parsed.chatMessage) replyText = parsed.chatMessage;
      } catch {}

      sounds.playSuccess();
      const aiMsg = { id: (Date.now() + 1).toString(), text: replyText, isUser: false };
      const finalItem = {
        ...updatedItem,
        chatMessages: [...updatedItem.chatMessages, aiMsg]
      };
      setActiveItem(finalItem);
      setHistory((prev) => prev.map((h) => (h.id === finalItem.id ? finalItem : h)));
    } catch (e) {
      const aiMsg = { id: (Date.now() + 1).toString(), text: '¡Qué gran pregunta! Vamos a seguir explorando este detalle.', isUser: false };
      const finalItem = {
        ...updatedItem,
        chatMessages: [...updatedItem.chatMessages, aiMsg]
      };
      setActiveItem(finalItem);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <ZentrySubPageScaffold title="Investigador de Curiosidades" kicker="DESCUBRIMIENTOS" onBack={onBack} isDark={isDark}>
      <div className="max-w-2xl mx-auto w-full h-full flex flex-col space-y-3">
        {/* If no active topic selected, show search & past history */}
        {!activeItem ? (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleStartResearch();
                }}
                placeholder="¿Qué animal, invento o tema quieres explorar hoy?..."
                disabled={isSearching}
                className={(isDark ? 'bg-white/10 text-white placeholder-white/40 border-white/20 ' : 'bg-white/80 text-[#1E293B] placeholder-slate-400 border-white/60 ') + 'flex-1 px-4 py-3 rounded-full border text-xs md:text-sm font-medium focus:outline-none shadow-sm'}
              />
              <button
                onClick={handleStartResearch}
                disabled={isSearching || !input.trim()}
                className="px-5 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 zentry-press cursor-pointer disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{isSearching ? 'Explorando...' : 'Explorar'}</span>
              </button>
            </div>

            {isSearching && (
              <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[24px] p-6 text-center space-y-2 animate-pulse'}>
                <Sparkles className="w-7 h-7 text-indigo-400 mx-auto animate-spin" />
                <div className="text-xs font-bold text-indigo-300">Buscando los datos más fascinantes para ti...</div>
              </div>
            )}

            {/* History Section */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Clock className="w-4 h-4" />
                <span>Tus Investigaciones Guardadas</span>
              </div>

              {history.length === 0 ? (
                <div className={(isDark ? 'bg-white/5 ' : 'bg-white/40 ') + 'rounded-[20px] p-6 text-center text-xs text-slate-400'}>
                  Aún no has explorado ningún tema. ¡Escribe uno arriba para comenzar! 🚀
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        sounds.playTap();
                        setActiveItem(item);
                        setShowFullReport(false);
                      }}
                      className={(isDark ? 'bg-white/10 hover:bg-white/15 border-white/10 ' : 'bg-white/80 hover:bg-white border-white/40 ') + 'p-3.5 rounded-[20px] border flex items-center justify-between cursor-pointer transition-all zentry-press shadow-sm'}
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        <div>
                          <div className="text-xs font-bold capitalize">{item.topic}</div>
                          <div className="text-[10px] text-slate-400">{item.date} • {item.chatMessages.length} mensajes</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Active Interactive Dialogue & Full Report View */
          <div className="flex-1 flex flex-col space-y-2.5 overflow-hidden">
            {/* Header with back to topics and Toggle Full Report */}
            <div className="flex items-center justify-between py-1 border-b border-white/10">
              <button
                onClick={() => {
                  sounds.playTap();
                  setActiveItem(null);
                }}
                className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ver todos los temas</span>
              </button>

              <div className="text-xs font-bold capitalize">{activeItem.topic}</div>

              <button
                onClick={() => {
                  sounds.playTap();
                  setShowFullReport(!showFullReport);
                }}
                className={(showFullReport ? 'bg-indigo-600 text-white ' : (isDark ? 'bg-white/10 text-slate-200 ' : 'bg-white/80 text-slate-700 ')) + 'px-3 py-1 rounded-full text-[11px] font-semibold border border-white/20 flex items-center gap-1 cursor-pointer zentry-press'}
              >
                <FileText className="w-3 h-3" />
                <span>{showFullReport ? 'Volver al Chat' : 'Ver Cuaderno Completo'}</span>
              </button>
            </div>

            {/* View Mode: Full Structured Report vs Interactive Chat */}
            {showFullReport ? (
              <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'flex-1 overflow-y-auto rounded-[24px] p-5 space-y-3'}>
                <div className="text-xs font-bold text-indigo-400">📖 Cuaderno de Investigación Completo</div>
                <MarkdownView content={activeItem.fullReport} isDark={isDark} />
              </div>
            ) : (
              <div className="flex-1 flex flex-col space-y-2 overflow-hidden">
                {/* Chat Stream */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {activeItem.chatMessages.map((m) => (
                    <div
                      key={m.id}
                      className={'flex ' + (m.isUser ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={
                          m.isUser
                            ? 'bg-[#42A5F5] text-white rounded-[20px] rounded-br-[4px] px-4 py-2 max-w-[80%] text-xs md:text-sm shadow-md'
                            : (isDark ? 'bg-white/15 text-white ' : 'bg-white/90 text-[#263238] ') + 'rounded-[20px] rounded-bl-[4px] px-4 py-2.5 max-w-[85%] text-xs md:text-sm shadow-md leading-relaxed'
                        }
                      >
                        <MarkdownView content={m.text} isDark={isDark} />
                      </div>
                    </div>
                  ))}
                  {isSearching && (
                    <div className="flex justify-start">
                      <div className={(isDark ? 'bg-white/15 text-white ' : 'bg-white/80 text-[#263238] ') + 'rounded-[20px] px-4 py-2 text-xs font-semibold animate-pulse flex items-center gap-2'}>
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                        <span>Buscando más detalles para responderte...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input to continue conversation */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleContinueDialogue();
                  }}
                  className="relative pt-1 flex items-center"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Pregúntale lo que quieras saber sobre esto..."
                    disabled={isSearching}
                    className={(isDark ? 'bg-white/10 text-white placeholder-white/40 border-white/20 ' : 'bg-white/80 text-[#1E293B] placeholder-slate-400 border-white/60 ') + 'w-full pl-4 pr-12 py-2.5 rounded-full border text-xs md:text-sm font-medium focus:outline-none focus:border-indigo-400 shadow-md disabled:opacity-50'}
                  />
                  <button
                    type="submit"
                    disabled={isSearching || !input.trim()}
                    className="absolute right-1.5 w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all zentry-press cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </ZentrySubPageScaffold>
  );
};
