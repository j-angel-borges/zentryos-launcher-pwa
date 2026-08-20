import React, { useState } from 'react';
import { BookOpen, Sparkles, Send, CheckCircle2, ArrowRight } from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { askZentryAi } from '../../services/aiService';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryStudyAssistantScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [topic, setTopic] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const presets = [
    'Fotosíntesis y respiración en plantas 🌱',
    'Fracciones equivalentes en matemática 📐',
    'Causas de la Independencia del Perú 🇵🇪',
    'Estructura del átomo y partículas ⚛️'
  ];

  const handleStudy = async (textToStudy?: string) => {
    const query = (textToStudy || topic).trim();
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
      console.warn('Fallback parsed study result:', e);
      setResult({
        answer: `Vamos a analizar "${query}" paso a paso. ¿Qué conceptos o ideas recuerdas de lo que explicó tu profesor en clase?`,
        diagram: {
          title: query,
          nodes: [
            { id: '1', label: query },
            { id: '2', label: 'Pregunta Clave' },
            { id: '3', label: 'Tu Reflexión' }
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

  return (
    <ZentrySubPageScaffold title="Tutor de Estudio Socrático" kicker="MINEDU PERÚ" onBack={onBack} isDark={isDark}>
      <div className="max-w-2xl mx-auto w-full space-y-4">
        <div className="p-3.5 rounded-[22px] bg-sky-500/15 border border-sky-500/30 flex items-center gap-3 text-xs text-sky-300">
          <BookOpen className="w-5 h-5 shrink-0" />
          <span>Alineado con el Currículo Nacional MINEDU. Te guía paso a paso con preguntas reflexivas.</span>
        </div>

        {/* Input */}
        <div className="relative flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Escribe el tema o ejercicio escolar..."
            disabled={isThinking}
            className={(isDark ? 'bg-white/10 text-white placeholder-white/40 ' : 'bg-white/80 text-[#1E293B] placeholder-slate-400 ') + 'flex-1 pl-4 pr-4 py-2.5 rounded-full text-xs font-medium focus:outline-none shadow-sm'}
          />
          <button
            onClick={() => handleStudy()}
            disabled={isThinking || !topic.trim()}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 zentry-press cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isThinking ? 'Analizando...' : 'Consultar'}</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTopic(p);
                handleStudy(p);
              }}
              className={(isDark ? 'bg-white/10 hover:bg-white/20 text-slate-300 ' : 'bg-white/70 hover:bg-white/90 text-[#3B3B58] ') + 'px-3 py-1 rounded-full text-[11px] font-semibold border border-white/20 transition-all zentry-press cursor-pointer'}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Result */}
        {isThinking && (
          <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[24px] p-6 text-center space-y-2 animate-pulse'}>
            <Sparkles className="w-8 h-8 text-sky-400 mx-auto animate-spin" />
            <div className="text-xs font-bold text-sky-300">Consultando Malla Curricular MINEDU y Generando Mapa Conceptual con Gemini 2.5 Flash...</div>
          </div>
        )}

        {result && (
          <div className="space-y-3 animate-in fade-in duration-300">
            {/* Explanation */}
            <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[24px] p-5 space-y-2'}>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Explicación Socrática</span>
              </div>
              <p className={(isDark ? 'text-white ' : 'text-[#1E293B] ') + 'text-xs md:text-sm leading-relaxed'}>
                {result.answer}
              </p>
            </div>

            {/* Concept Diagram Map */}
            {result.diagram && (
              <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[24px] p-5 space-y-3'}>
                <div className="text-xs font-bold text-indigo-300">🗺️ Mapa Conceptual de Aprendizaje: {result.diagram.title}</div>
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
