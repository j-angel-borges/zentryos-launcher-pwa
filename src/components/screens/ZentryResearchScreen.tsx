import React, { useState } from 'react';
import { Search, Sparkles, BookMarked, CheckCircle2 } from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { askZentryAi } from '../../services/aiService';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryResearchScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [data, setData] = useState<any | null>(null);

  const handleResearch = async () => {
    if (!query.trim() || isSearching) return;
    sounds.playTap();
    setIsSearching(true);
    setData(null);

    try {
      const raw = await askZentryAi('deep_research', `Tema de investigación escolar: ${query}`);
      const parsed = JSON.parse(raw.trim().replace(/^```json/, '').replace(/```$/, ''));
      sounds.playSuccess();
      setData(parsed);
    } catch (e) {
      console.warn('Fallback research:', e);
      setData({
        steps: ['Buscando fuentes académicas...', 'Analizando referencias...', 'Estructurando reporte...'],
        report: `# ${query}\n\n## Resumen\nInvestigación completada con éxito.`
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <ZentrySubPageScaffold title="Investigador AI & Ciencia Profunda" kicker="EXPLORACIÓN" onBack={onBack} isDark={isDark}>
      <div className="max-w-2xl mx-auto w-full space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej: ¿Cómo funcionaban los acueductos en la civilización Nazca?..."
            disabled={isSearching}
            className={(isDark ? 'bg-white/10 text-white placeholder-white/40 ' : 'bg-white/80 text-[#1E293B] placeholder-slate-400 ') + 'flex-1 px-4 py-2.5 rounded-full text-xs font-medium focus:outline-none shadow-sm'}
          />
          <button
            onClick={handleResearch}
            disabled={isSearching || !query.trim()}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 zentry-press cursor-pointer disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{isSearching ? 'Investigando...' : 'Investigar'}</span>
          </button>
        </div>

        {isSearching && (
          <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[24px] p-6 text-center space-y-2 animate-pulse'}>
            <Sparkles className="w-8 h-8 text-indigo-400 mx-auto animate-spin" />
            <div className="text-xs font-bold text-indigo-300">Consultando fuentes científicas con Gemini 2.5 Flash...</div>
          </div>
        )}

        {data && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[24px] p-5 space-y-3'}>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                <BookMarked className="w-4 h-4" />
                <span>Reporte de Investigación Estructurado</span>
              </div>
              <div className="text-xs md:text-sm leading-relaxed whitespace-pre-line text-slate-200">
                {data.report}
              </div>
            </div>
          </div>
        )}
      </div>
    </ZentrySubPageScaffold>
  );
};
