import React, { useState, useRef } from 'react';
import { Palette, Sparkles, Download, Undo2, Eraser } from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryNeuroArtScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [color, setColor] = useState('#8B5CF6');
  const [brushSize, setBrushSize] = useState(8);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiImage, setAiImage] = useState<string | null>(null);

  const colors = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#FFFFFF', '#000000'];

  const handleAiGen = () => {
    if (!prompt.trim()) return;
    sounds.playTap();
    setIsGenerating(true);

    setTimeout(() => {
      sounds.playSuccess();
      setIsGenerating(false);
      setAiImage('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop');
    }, 1500);
  };

  return (
    <ZentrySubPageScaffold title="Art-Attack & NeuroArt Studio" kicker="CREATIVIDAD" onBack={onBack} isDark={isDark}>
      <div className="max-w-2xl mx-auto w-full space-y-4">
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
        <div className="relative w-full h-72 rounded-[24px] bg-white border border-white/20 shadow-inner overflow-hidden flex items-center justify-center">
          {aiImage ? (
            <img src={aiImage} alt="Arte Generado" className="w-full h-full object-cover animate-in fade-in" />
          ) : (
            <div className="text-slate-400 text-xs font-semibold select-none text-center p-4">
              🎨 Lienzo de Dibujo Activo • Dibuja libremente o genera con IA abajo
            </div>
          )}
        </div>

        {/* AI Prompt Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej: Un cóndor cósmico volando sobre Machu Picchu futurista..."
            className={(isDark ? 'bg-white/10 text-white placeholder-white/40 ' : 'bg-white/80 text-[#1E293B] placeholder-slate-400 ') + 'flex-1 px-4 py-2.5 rounded-full text-xs font-medium focus:outline-none shadow-sm'}
          />
          <button
            onClick={handleAiGen}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 zentry-press cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Creando...' : 'Generar IA'}</span>
          </button>
        </div>
      </div>
    </ZentrySubPageScaffold>
  );
};
