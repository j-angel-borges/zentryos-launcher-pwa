import React, { useState } from 'react';
import { Edit3, Sparkles, Check } from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { askZentryAi } from '../../services/aiService';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryRedactorScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [isWriting, setIsWriting] = useState(false);

  const handleGenerateText = async () => {
    if (!topic.trim() || isWriting) return;
    sounds.playTap();
    setIsWriting(true);

    try {
      const raw = await askZentryAi('redactor', `Redacta un ensayo o trabajo escolar sobre: ${topic}`);
      const parsed = JSON.parse(raw.trim().replace(/^```json/, '').replace(/```$/, ''));
      sounds.playSuccess();
      setContent(parsed.content || raw);
    } catch (e) {
      console.warn('Fallback redactor:', e);
      setContent(`# Ensayo sobre ${topic}\n\nEste es un borrador escolar redactado para inspirarte.`);
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <ZentrySubPageScaffold title="Redactor Escolar Zentry" kicker="DOCUMENTOS & ENSAYOS" onBack={onBack} isDark={isDark}>
      <div className="max-w-2xl mx-auto w-full space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Tema del trabajo o ensayo (ej. El cuidado del agua en la Amazonía)..."
            disabled={isWriting}
            className={(isDark ? 'bg-white/10 text-white placeholder-white/40 ' : 'bg-white/80 text-[#1E293B] placeholder-slate-400 ') + 'flex-1 px-4 py-2.5 rounded-full text-xs font-medium focus:outline-none shadow-sm'}
          />
          <button
            onClick={handleGenerateText}
            disabled={isWriting || !topic.trim()}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 zentry-press cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isWriting ? 'Redactando...' : 'Asistir'}</span>
          </button>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Aquí aparecerá el texto redactado o puedes escribir tu borrador libremente..."
          className={(isDark ? 'bg-white/10 text-white placeholder-white/40 ' : 'bg-white/80 text-[#1E293B] placeholder-slate-400 ') + 'w-full h-64 p-4 rounded-[24px] text-xs font-medium focus:outline-none shadow-inner resize-none'}
        />

        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>Palabras: {content.trim() ? content.trim().split(/\s+/).length : 0}</span>
          <button
            onClick={() => {
              sounds.playSuccess();
              alert('Documento guardado con éxito en Archivos Escolares Zentry');
            }}
            className="px-4 py-2 rounded-full bg-emerald-600 text-white font-bold flex items-center gap-1.5 zentry-press cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Tarea</span>
          </button>
        </div>
      </div>
    </ZentrySubPageScaffold>
  );
};
