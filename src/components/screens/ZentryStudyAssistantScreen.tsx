import React, { useState } from 'react';
import { Sparkles, Send, CheckCircle2, RotateCcw } from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { askZentryAi } from '../../services/aiService';
import { MarkdownView } from '../ui/MarkdownView';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryStudyAssistantScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [topic, setTopic] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleStudy = async () => {
    const query = topic.trim();
    if (!query || isThinking) return;

    sounds.playTap();
    setIsThinking(true);
    setResult(null);

    try {
      const raw = await askZentryAi('study_assistant', `Tema a estudiar: ${query}`);
      const parsed = JSON.parse(raw.trim().replace(/^```json/, '').replace(/```$/, ''));
      sounds.playSuccess();
      setResult(parsed);
    } catch (e) {
      console.warn('Fallback study result:', e);
      setResult({
        answer: `Vamos a analizar "${query}" paso a paso. ¿Qué recuerdas de lo que viste en clase sobre este tema?`,
        diagram: {
          title: query,
          nodes: [
            { id: '1', label: query },
            { id: '2', label: 'Pregunta Clave' },
            { id: '3', label: 'Tu Respuesta' }
          ],
          links: [
            { from: '1', to: '2' },
            { from: '2', to: '3' }
          ]
        }
      });
    } finally {
      setIsThinking(false);
    }
  };

  const handleClear = () => {
    sounds.playTap();
    setTopic('');
    setResult(null);
  };

  return (
    <ZentrySubPageScaffold title="Asistente de Estudio" kicker="APRENDIZAJE GUIADO" onBack={onBack} isDark={isDark}>
      <div className="max-w-xl mx-auto w-full space-y-4">
        {/* Input bar + Clear action */}
        <div className="relative flex gap-2 items-center">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleStudy();
            }}
            placeholder="¿Qué tema o tarea quieres entender hoy?..."
            disabled={isThinking}
            className={(isDark ? 'bg-white/10 text-white placeholder-white/40 border-white/20 ' : 'bg-white/80 text-[#1E293B] placeholder-slate-400 border-white/60 ') + 'flex-1 pl-4 pr-4 py-2.5 rounded-full border text-xs md:text-sm font-medium focus:outline-none shadow-sm'}
          />

          {result && (
            <button
              onClick={handleClear}
              title="Nueva consulta"
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-slate-300 transition-all zentry-press cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleStudy}
            disabled={isThinking || !topic.trim()}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 zentry-press cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isThinking ? 'Pensando...' : 'Consultar'}</span>
          </button>
        </div>

        {/* Thinking Loader */}
        {isThinking && (
          <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[24px] p-6 text-center space-y-2 animate-pulse'}>
            <Sparkles className="w-7 h-7 text-sky-400 mx-auto animate-spin" />
            <div className="text-xs font-bold text-sky-300">Preparando una explicación fácil y clara...</div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-3 animate-in fade-in duration-300">
            {/* Explanation */}
            <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[24px] p-5 space-y-2'}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Paso a Paso</span>
                </div>
                <button
                  onClick={handleClear}
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  Nueva pregunta
                </button>
              </div>
              <MarkdownView content={result.answer} isDark={isDark} />
            </div>

            {/* Concept Diagram Map */}
            {result.diagram && (
              <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[24px] p-5 space-y-3'}>
                <div className="text-xs font-bold text-indigo-300">🗺️ Mapa de Ideas: {result.diagram.title}</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {result.diagram.nodes?.map((node: any) => (
                    <div
                      key={node.id}
                      className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-center text-xs font-semibold text-white shadow-sm"
                    >
                      {node.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ZentrySubPageScaffold>
  );
};
