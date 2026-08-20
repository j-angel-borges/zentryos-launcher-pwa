import React, { useState, useEffect, useRef } from 'react';
import { Edit3, Sparkles, Check, Clock, FileText, Send, ArrowLeft, Eye, ChevronRight, Trash2, Pencil, X, Save } from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { askZentryAi } from '../../services/aiService';
import { MarkdownView } from '../ui/MarkdownView';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

interface DraftDocument {
  id: string;
  title: string;
  date: string;
  chatMessages: { id: string; text: string; isUser: boolean }[];
  documentContent: string;
}

export const ZentryRedactorScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [drafts, setDrafts] = useState<DraftDocument[]>(() => {
    try {
      const saved = localStorage.getItem('zentry_redactor_drafts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeDraft, setActiveDraft] = useState<DraftDocument | null>(null);
  const [input, setInput] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  const [viewMode, setViewMode] = useState<'chat' | 'document' | 'editor'>('chat');

  // Inline rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Editable text content
  const [editableContent, setEditableContent] = useState('');

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('zentry_redactor_drafts', JSON.stringify(drafts));
    } catch (e) {
      console.warn('Could not save drafts:', e);
    }
  }, [drafts]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeDraft?.chatMessages, isWriting]);

  useEffect(() => {
    if (activeDraft) {
      setEditableContent(activeDraft.documentContent);
    }
  }, [activeDraft?.documentContent]);

  const handleStartStory = async () => {
    const topic = input.trim();
    if (!topic || isWriting) return;

    sounds.playTap();
    setIsWriting(true);
    setInput('');

    try {
      const raw = await askZentryAi(
        'redactor',
        `El estudiante quiere escribir: "${topic}". Como co-autor amigable, escribe el inicio en documentContent, define title, y en chatMessage hazle una pregunta corta para decidir qué pasará después.`
      );
      const parsed = JSON.parse(raw.trim().replace(/^```json/, '').replace(/```$/, ''));
      sounds.playSuccess();

      const newDraft: DraftDocument = {
        id: Date.now().toString(),
        title: parsed.title || topic,
        date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        chatMessages: [
          { id: '1', text: `Quiero escribir sobre: ${topic}`, isUser: true },
          { id: '2', text: parsed.chatMessage || '¡Qué gran idea! He preparado el inicio del borrador. ¿Qué te gustaría que ocurra a continuación?', isUser: false }
        ],
        documentContent: parsed.documentContent || `# ${topic}\n\nHabía una vez...`
      };

      setDrafts((prev) => [newDraft, ...prev]);
      setActiveDraft(newDraft);
      setViewMode('chat');
    } catch (e) {
      console.warn('Fallback redactor:', e);
      const fallbackDraft: DraftDocument = {
        id: Date.now().toString(),
        title: topic,
        date: 'Hoy',
        chatMessages: [
          { id: '1', text: `Quiero escribir sobre: ${topic}`, isUser: true },
          { id: '2', text: `¡Me encanta la idea de escribir sobre ${topic}! ¿Quién será el protagonista de nuestra historia?`, isUser: false }
        ],
        documentContent: `# ${topic}\n\nBorrador de historia iniciado.`
      };
      setDrafts((prev) => [fallbackDraft, ...prev]);
      setActiveDraft(fallbackDraft);
    } finally {
      setIsWriting(false);
    }
  };

  const handleContinueWriting = async () => {
    const text = input.trim();
    if (!text || !activeDraft || isWriting) return;

    sounds.playTap();
    const userMsg = { id: Date.now().toString(), text, isUser: true };

    const updated = {
      ...activeDraft,
      chatMessages: [...activeDraft.chatMessages, userMsg]
    };
    setActiveDraft(updated);
    setInput('');
    setIsWriting(true);

    try {
      const raw = await askZentryAi(
        'redactor',
        `El borrador actual es:\n${activeDraft.documentContent}\n\nEl estudiante propone continuar con: "${text}". Actualiza el documentContent incorporando esta idea, y en chatMessage dale ánimo y una nueva pregunta para el siguiente paso.`
      );
      const parsed = JSON.parse(raw.trim().replace(/^```json/, '').replace(/```$/, ''));
      sounds.playSuccess();

      const aiMsg = { id: (Date.now() + 1).toString(), text: parsed.chatMessage || '¡Excelente idea! Lo he agregado a nuestro documento.', isUser: false };
      const finalDraft = {
        ...updated,
        documentContent: parsed.documentContent || updated.documentContent,
        chatMessages: [...updated.chatMessages, aiMsg]
      };
      setActiveDraft(finalDraft);
      setDrafts((prev) => prev.map((d) => (d.id === finalDraft.id ? finalDraft : d)));
    } catch (e) {
      const aiMsg = { id: (Date.now() + 1).toString(), text: '¡Genial! Continuemos con el siguiente párrafo.', isUser: false };
      const finalDraft = {
        ...updated,
        chatMessages: [...updated.chatMessages, aiMsg]
      };
      setActiveDraft(finalDraft);
    } finally {
      setIsWriting(false);
    }
  };

  const handleDeleteDraft = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    sounds.playTap();
    if (window.confirm('¿Deseas eliminar este documento borrador?')) {
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      if (activeDraft?.id === id) {
        setActiveDraft(null);
      }
    }
  };

  const handleClearAllDrafts = () => {
    sounds.playTap();
    if (window.confirm('¿Deseas borrar todos los borradores guardados?')) {
      setDrafts([]);
      setActiveDraft(null);
      localStorage.removeItem('zentry_redactor_drafts');
    }
  };

  const handleSaveRename = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!editingTitle.trim()) return;
    sounds.playSuccess();
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, title: editingTitle.trim() } : d))
    );
    if (activeDraft?.id === id) {
      setActiveDraft((prev) => (prev ? { ...prev, title: editingTitle.trim() } : null));
    }
    setEditingId(null);
    setEditingTitle('');
  };

  const handleSaveManualEdit = () => {
    if (!activeDraft) return;
    sounds.playSuccess();
    const updated = {
      ...activeDraft,
      documentContent: editableContent
    };
    setActiveDraft(updated);
    setDrafts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    setViewMode('document');
  };

  return (
    <ZentrySubPageScaffold title="Redactor Creativo" kicker="CO-AUTORÍA" onBack={onBack} isDark={isDark}>
      <div className="max-w-2xl mx-auto w-full h-full flex flex-col space-y-3">
        {!activeDraft ? (
          <div className="space-y-4">
            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleStartStory();
                }}
                placeholder="¿Qué cuento, ensayo o trabajo quieres escribir hoy?..."
                disabled={isWriting}
                className={(isDark ? 'bg-white/10 text-white placeholder-white/40 border-white/20 ' : 'bg-white/80 text-[#1E293B] placeholder-slate-400 border-white/60 ') + 'flex-1 px-4 py-3 rounded-full border text-xs md:text-sm font-medium focus:outline-none shadow-sm'}
              />
              <button
                onClick={handleStartStory}
                disabled={isWriting || !input.trim()}
                className="px-5 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 zentry-press cursor-pointer disabled:opacity-50"
              >
                <Edit3 className="w-4 h-4" />
                <span>{isWriting ? 'Iniciando...' : 'Crear'}</span>
              </button>
            </div>

            {isWriting && (
              <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[24px] p-6 text-center space-y-2 animate-pulse'}>
                <Sparkles className="w-7 h-7 text-emerald-400 mx-auto animate-spin" />
                <div className="text-xs font-bold text-emerald-300">Iniciando el borrador y preparando ideas contigo...</div>
              </div>
            )}

            {/* Saved Drafts */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>Tus Trabajos y Borradores ({drafts.length})</span>
                </div>
                {drafts.length > 0 && (
                  <button
                    onClick={handleClearAllDrafts}
                    className="text-[11px] font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer zentry-press"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Borrar Todo</span>
                  </button>
                )}
              </div>

              {drafts.length === 0 ? (
                <div className={(isDark ? 'bg-white/5 ' : 'bg-white/40 ') + 'rounded-[20px] p-6 text-center text-xs text-slate-400'}>
                  Aún no has escrito ningún borrador. ¡Escribe una idea arriba para crear tu primer trabajo! ✍️
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {drafts.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => {
                        sounds.playTap();
                        setActiveDraft(d);
                        setViewMode('chat');
                      }}
                      className={(isDark ? 'bg-white/10 hover:bg-white/15 border-white/10 ' : 'bg-white/80 hover:bg-white border-white/40 ') + 'p-3.5 rounded-[20px] border flex items-center justify-between cursor-pointer transition-all zentry-press shadow-sm group'}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                        {editingId === d.id ? (
                          <div className="flex items-center gap-1.5 flex-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              className="px-2 py-1 rounded bg-black/40 text-white text-xs border border-emerald-400 w-full focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={(e) => handleSaveRename(d.id, e)}
                              className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(null);
                              }}
                              className="p-1 rounded bg-slate-600 text-white hover:bg-slate-500"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold capitalize truncate">{d.title}</div>
                            <div className="text-[10px] text-slate-400">{d.date} • {d.chatMessages.length} pasos</div>
                          </div>
                        )}
                      </div>

                      {editingId !== d.id && (
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(d.id);
                              setEditingTitle(d.title);
                            }}
                            title="Editar título"
                            className="p-1.5 rounded-full hover:bg-white/20 text-slate-400 hover:text-emerald-300"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteDraft(d.id, e)}
                            title="Eliminar"
                            className="p-1.5 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Active Draft: Chat vs Document View vs Direct Editor */
          <div className="flex-1 flex flex-col space-y-2.5 overflow-hidden">
            <div className="flex items-center justify-between py-1 border-b border-white/10 gap-2">
              <button
                onClick={() => {
                  sounds.playTap();
                  setActiveDraft(null);
                }}
                className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mis Trabajos</span>
              </button>

              <div className="text-xs font-bold capitalize truncate max-w-[160px]">{activeDraft.title}</div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={(e) => handleDeleteDraft(activeDraft.id, e)}
                  title="Eliminar este borrador"
                  className="p-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 cursor-pointer zentry-press"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {viewMode === 'editor' ? (
                  <button
                    onClick={handleSaveManualEdit}
                    className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer zentry-press"
                  >
                    <Save className="w-3 h-3" />
                    <span>Guardar Cambios</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      sounds.playTap();
                      setViewMode(viewMode === 'chat' ? 'document' : 'chat');
                    }}
                    className={(viewMode === 'document' ? 'bg-emerald-600 text-white ' : (isDark ? 'bg-white/10 text-slate-200 ' : 'bg-white/80 text-slate-700 ')) + 'px-3 py-1 rounded-full text-[11px] font-semibold border border-white/20 flex items-center gap-1 cursor-pointer zentry-press'}
                  >
                    {viewMode === 'chat' ? <Eye className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                    <span>{viewMode === 'chat' ? 'Ver Documento' : 'Conversar'}</span>
                  </button>
                )}
              </div>
            </div>

            {viewMode === 'editor' ? (
              <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'flex-1 flex flex-col rounded-[24px] p-4 space-y-2'}>
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span>✏️ Editor Manual de Texto</span>
                  <button
                    onClick={() => setViewMode('document')}
                    className="text-slate-400 hover:text-white text-[11px]"
                  >
                    Cancelar
                  </button>
                </div>
                <textarea
                  value={editableContent}
                  onChange={(e) => setEditableContent(e.target.value)}
                  className="flex-1 w-full p-3 rounded-[16px] bg-black/20 text-xs md:text-sm font-sans focus:outline-none resize-none border border-white/10"
                />
              </div>
            ) : viewMode === 'document' ? (
              <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'flex-1 overflow-y-auto rounded-[24px] p-5 space-y-3'}>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-emerald-400">📄 Documento Escrito</div>
                  <button
                    onClick={() => setViewMode('editor')}
                    className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Editar Manualmente</span>
                  </button>
                </div>
                <MarkdownView content={activeDraft.documentContent} isDark={isDark} />
              </div>
            ) : (
              <div className="flex-1 flex flex-col space-y-2 overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {activeDraft.chatMessages.map((m) => (
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
                  {isWriting && (
                    <div className="flex justify-start">
                      <div className={(isDark ? 'bg-white/15 text-white ' : 'bg-white/80 text-[#263238] ') + 'rounded-[20px] px-4 py-2 text-xs font-semibold animate-pulse flex items-center gap-2'}>
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                        <span>Redactando y organizando ideas...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleContinueWriting();
                  }}
                  className="relative pt-1 flex items-center"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Dile qué te gustaría agregar o cambiar en el texto..."
                    disabled={isWriting}
                    className={(isDark ? 'bg-white/10 text-white placeholder-white/40 border-white/20 ' : 'bg-white/80 text-[#1E293B] placeholder-slate-400 border-white/60 ') + 'w-full pl-4 pr-12 py-2.5 rounded-full border text-xs md:text-sm font-medium focus:outline-none focus:border-emerald-400 shadow-md disabled:opacity-50'}
                  />
                  <button
                    type="submit"
                    disabled={isWriting || !input.trim()}
                    className="absolute right-1.5 w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all zentry-press cursor-pointer disabled:opacity-50"
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
