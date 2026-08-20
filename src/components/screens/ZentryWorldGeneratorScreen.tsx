import React, { useState } from 'react';
import { Globe, Orbit, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { askZentryAi } from '../../services/aiService';
import { MarkdownView } from '../ui/MarkdownView';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryWorldGeneratorScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [theme, setTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [worldData, setWorldData] = useState<any | null>(null);

  const handleGenerate = async () => {
    const query = theme.trim();
    if (!query || isGenerating) return;

    sounds.playTap();
    setIsGenerating(true);
    setWorldData(null);

    try {
      const raw = await askZentryAi('world_generator', `Tema de la aventura: ${query}`);
      const parsed = JSON.parse(raw.trim().replace(/^```json/, '').replace(/```$/, ''));
      sounds.playSuccess();
      setWorldData(parsed);
    } catch (e) {
      console.warn('Fallback World Generator:', e);
      setWorldData({
        welcomeMessage: `¡Excelente! Vamos a construir tu aventura de ${query}...`,
        parentReport: {
          interests: 'Creatividad, Construcción Manual y Resiliencia',
          skillsDeveloped: 'Motricidad fina y persistencia ante retos',
          parentTip: 'Acompañe a su hijo a construir los controles físicos usando objetos en casa.'
        },
        steps: [
          { title: 'Misión 1', description: 'Busca una caja de cartón y dibuja los mandos.' },
          { title: 'Misión 2', description: 'Prepara el espacio de juego en tu habitación.' },
          { title: 'Misión 3', description: 'Inicia la misión con tus amigos o familia.' }
        ]
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ZentrySubPageScaffold title="Generador de Aventuras" kicker="CREA TUS RETOS" onBack={onBack} isDark={isDark}>
      <div className="max-w-xl mx-auto w-full space-y-4">
        {/* Planet Viewport */}
        <div className="relative w-full h-44 rounded-[28px] bg-gradient-to-b from-[#0B0C1A] to-[#1E1233] border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 shadow-[0_0_40px_rgba(56,189,248,0.4)] animate-pulse flex items-center justify-center">
            <Orbit className="w-12 h-12 text-white/40 animate-spin" />
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGenerate();
            }}
            placeholder="¿De qué quieres que sea tu aventura? (ej. Viaje a la luna, torneo de fútbol)..."
            disabled={isGenerating}
            className={(isDark ? 'bg-white/10 text-white placeholder-white/40 border-white/20 ' : 'bg-white/80 text-[#1E293B] placeholder-slate-400 border-white/60 ') + 'flex-1 px-4 py-2.5 rounded-full border text-xs md:text-sm font-medium focus:outline-none shadow-sm'}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !theme.trim()}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 zentry-press cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Creando...' : 'Crear'}</span>
          </button>
        </div>

        {isGenerating && (
          <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[24px] p-6 text-center space-y-2 animate-pulse'}>
            <Sparkles className="w-7 h-7 text-amber-400 mx-auto animate-spin" />
            <div className="text-xs font-bold text-amber-300">Construyendo las misiones para ti...</div>
          </div>
        )}

        {worldData && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[22px] p-4 space-y-2'}>
              <div className="text-xs font-bold text-amber-400">🪐 Tu Misión</div>
              <MarkdownView content={worldData.welcomeMessage} isDark={isDark} />
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {worldData.steps?.map((st: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-[18px] bg-white/10 border border-white/15 space-y-1">
                  <div className="text-xs font-bold text-sky-400">{st.title}</div>
                  <div className="text-[11px] text-slate-300 leading-snug">{st.description}</div>
                </div>
              ))}
            </div>

            {/* Parent Tip */}
            {worldData.parentReport && (
              <div className="p-4 rounded-[22px] bg-slate-900/90 border border-white/15 text-slate-300 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Reporte para Padres</span>
                </div>
                <div className="text-[11px]"><strong>Habilidades:</strong> {worldData.parentReport.skillsDeveloped}</div>
                <div className="text-[11px] text-slate-400"><strong>Consejo en casa:</strong> {worldData.parentReport.parentTip}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </ZentrySubPageScaffold>
  );
};
