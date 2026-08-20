import React, { useState } from 'react';
import { Globe, Orbit, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { askZentryAi } from '../../services/aiService';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryWorldGeneratorScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [theme, setTheme] = useState('Aventura Espacial en la Luna');
  const [isGenerating, setIsGenerating] = useState(false);
  const [worldData, setWorldData] = useState<any | null>(null);

  const presets = [
    'Aventura Espacial en la Luna 🚀',
    'Entrenamiento de Fútbol de Perseverancia ⚽',
    'Expedición Arqueológica en Machu Picchu 🏛️',
    'Laboratorio Submarino en el Océano Pacífico 🌊'
  ];

  const handleGenerate = async (presetTheme?: string) => {
    const query = presetTheme || theme;
    if (!query.trim() || isGenerating) return;

    sounds.playTap();
    setIsGenerating(true);
    setWorldData(null);

    try {
      const raw = await askZentryAi('world_generator', `Tema de la aventura Phygital: ${query}`);
      const parsed = JSON.parse(raw.trim().replace(/^```json/, '').replace(/```$/, ''));
      sounds.playSuccess();
      setWorldData(parsed);
    } catch (e) {
      console.warn('Fallback World Generator:', e);
      setWorldData({
        welcomeMessage: `¡Excelente capitán! Vamos a construir tu aventura de ${query}...`,
        parentReport: {
          interests: 'Creatividad, Construcción Manual y Resiliencia',
          skillsDeveloped: 'Motricidad fina y persistencia ante retos',
          parentTip: 'Acompañe a su hijo a construir los controles físicos usando objetos reciclados en casa.'
        },
        steps: [
          { title: 'Paso 1: Construye la cabina física', description: 'Busca una caja de cartón y dibuja los mandos de despegue.' },
          { title: 'Paso 2: Parabrisas virtual', description: 'Si tienes Chromecast o cable HDMI, proyecta la pantalla en la TV.' },
          { title: 'Paso 3: Misión de exploración', description: 'Navega esquivando los obstáculos del camino.' }
        ]
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ZentrySubPageScaffold title="Generador de Mundos Phygital" kicker="SIMULACIÓN LÚDICA" onBack={onBack} isDark={isDark}>
      <div className="max-w-2xl mx-auto w-full space-y-4">
        {/* Planet Viewport */}
        <div className="relative w-full h-56 rounded-[28px] bg-gradient-to-b from-[#0B0C1A] to-[#1E1233] border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 shadow-[0_0_50px_rgba(56,189,248,0.4)] animate-pulse flex items-center justify-center">
            <Orbit className="w-14 h-14 text-white/40 animate-spin" />
          </div>
          <div className="absolute top-4 left-4 text-xs font-mono text-sky-400">
            Mundo Phygital Zentry • Motor Gemini 2.5 Flash
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTheme(p);
                handleGenerate(p);
              }}
              className={(isDark ? 'bg-white/10 hover:bg-white/20 text-slate-300 ' : 'bg-white/70 hover:bg-white/90 text-[#3B3B58] ') + 'px-3 py-1 rounded-full text-[11px] font-semibold border border-white/20 transition-all zentry-press cursor-pointer'}
            >
              {p}
            </button>
          ))}
        </div>

        {isGenerating && (
          <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[24px] p-6 text-center space-y-2 animate-pulse'}>
            <Sparkles className="w-8 h-8 text-amber-400 mx-auto animate-spin" />
            <div className="text-xs font-bold text-amber-300">Generando misiones Phygitales y reporte pedagógico con Gemini 2.5 Flash...</div>
          </div>
        )}

        {worldData && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[22px] p-4 space-y-2'}>
              <div className="text-xs font-bold text-amber-400">🪐 Misión de Rol Simbólico</div>
              <p className="text-xs md:text-sm leading-relaxed">{worldData.welcomeMessage}</p>
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
                  <span>Reporte Pedagógico de Desarrollo (Padres)</span>
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
