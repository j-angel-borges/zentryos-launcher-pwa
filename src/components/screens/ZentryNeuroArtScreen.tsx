import React, { useState } from 'react';
import { Palette, Sparkles, Lock } from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { askZentryAi } from '../../services/aiService';
import { MarkdownView } from '../ui/MarkdownView';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryNeuroArtScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [color, setColor] = useState('#8B5CF6');
  const [brushSize, setBrushSize] = useState(8);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [evolutionResult, setEvolutionResult] = useState<any | null>(null);

  const colors = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#FFFFFF', '#000000'];

  const handleAiGen = async () => {
    if (!prompt.trim() || isGenerating) return;
    sounds.playTap();
    setIsGenerating(true);
    setEvolutionResult(null);

    try {
      const raw = await askZentryAi('neuro_art', `El niño dibujó o describió su idea: "${prompt}". Genera la evolución creativa y reporte.`);
      const parsed = JSON.parse(raw.trim().replace(/^```json/, '').replace(/```$/, ''));
      sounds.playSuccess();
      setEvolutionResult(parsed);
    } catch (e) {
      console.warn('Fallback NeuroArt response:', e);
      setEvolutionResult({
        speechText: `¡Qué dibujo tan genial! Veo que usaste mucha imaginación con ${prompt}. ¿Qué superpoder le pondrías a este personaje?`,
        evolutionType: 'digital_drawing',
        evolutionDescription: `Evolución Creativa: Zentry transformó "${prompt}" en una ilustración de aventuras.`,
        parentReport: `Reporte para Padres: El menor demuestra un pensamiento simbólico creativo y originalidad.`
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ZentrySubPageScaffold title="Estudio de Dibujo y Arte" kicker="CREA Y DIBUJA" onBack={onBack} isDark={isDark}>
      <div className="max-w-xl mx-auto w-full space-y-4">
        {/* Color Palette & Brush Size */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  sounds.playTap();
                  setColor(c);
                }}
                style={{ backgroundColor: c }}
                className={'w-6 h-6 rounded-full border border-white/40 cursor-pointer ' + (color === c ? 'scale-125 ring-2 ring-[#8B5CF6]' : '')}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Grosor:</span>
            <input
              type="range"
              min="2"
              max="24"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-24 accent-[#8B5CF6] h-1.5 bg-white/20 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Canvas Area */}
        <div className="relative w-full h-48 rounded-[24px] bg-white border border-white/20 shadow-inner overflow-hidden flex items-center justify-center">
          <div className="text-slate-400 text-xs font-semibold select-none text-center p-4">
            🎨 Lienzo de Dibujo • Dibuja o describe tu personaje abajo para descubrir su historia
          </div>
        </div>

        {/* AI Prompt Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAiGen();
            }}
            placeholder="Describe tu dibujo o personaje (ej. Un dragón que viaja entre volcanes)..."
            disabled={isGenerating}
            className={(isDark ? 'bg-white/10 text-white placeholder-white/40 border-white/20 ' : 'bg-white/80 text-[#1E293B] placeholder-slate-400 border-white/60 ') + 'flex-1 px-4 py-2.5 rounded-full border text-xs md:text-sm font-medium focus:outline-none shadow-sm'}
          />
          <button
            onClick={handleAiGen}
            disabled={isGenerating || !prompt.trim()}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 zentry-press cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Imaginando...' : 'Descubrir'}</span>
          </button>
        </div>

        {/* Evolution & Parent Report Result */}
        {evolutionResult && (
          <div className="space-y-3 animate-in fade-in duration-300">
            {/* Child Speech */}
            <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[22px] p-4 space-y-1.5 border border-purple-500/30'}>
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                <Sparkles className="w-4 h-4" />
                <span>Mensaje de Zentry</span>
              </div>
              <MarkdownView content={evolutionResult.speechText} isDark={isDark} />
              <div className="text-xs font-semibold text-pink-400 pt-1">{evolutionResult.evolutionDescription}</div>
            </div>

            {/* Parent Report */}
            {evolutionResult.parentReport && (
              <div className="p-4 rounded-[22px] bg-slate-900/90 border border-white/15 text-slate-300 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Reporte para Padres</span>
                </div>
                <p className="text-[11px] leading-relaxed">{evolutionResult.parentReport}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </ZentrySubPageScaffold>
  );
};
