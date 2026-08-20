import React, { useState } from 'react';
import { Palette, Sparkles, Wand2, Download, RefreshCw } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

export const NeuroArtStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('Un león mecánico de cristal explorando la selva del Amazonas');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop'
  );

  const samplePrompts = [
    'Un castillo flotante entre nebulosas de colores pastel',
    'Un rover explorador en Marte descubriendo cristales de agua',
    'Retrato futurista de un colibrí cibernético en estilo acuarela'
  ];

  const handleGenerate = (customPrompt?: string) => {
    sounds.playTap();
    const p = customPrompt || prompt;
    setIsGenerating(true);

    setTimeout(() => {
      sounds.playSuccess();
      setIsGenerating(false);
      setGeneratedImage(
        'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800&auto=format&fit=crop'
      );
    }, 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-4xl mx-auto w-full space-y-5 text-white animate-in fade-in duration-300">
      <div className="liquid-glass rounded-3xl p-4 border border-pink-400/30 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-300 shadow-md">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">NeuroArt Studio</h3>
            <p className="text-xs text-slate-300">Convierte tus ideas y descripciones en obras de arte digital generadas por IA.</p>
          </div>
        </div>
      </div>

      <div className="relative w-full h-80 rounded-3xl overflow-hidden liquid-glass border border-white/20 shadow-2xl flex items-center justify-center bg-slate-950 group">
        <img 
          src={generatedImage} 
          alt="NeuroArt Canvas" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
        />
        {isGenerating && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center space-y-3">
            <Sparkles className="w-8 h-8 text-pink-400 animate-spin" />
            <span className="text-xs font-semibold text-pink-300">Sintetizando tu obra de arte...</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="relative flex items-center">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe la obra de arte que imaginas..."
            className="w-full pl-4 pr-32 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-xs md:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-pink-400 backdrop-blur-xl shadow-lg transition-colors"
          />
          <button
            onClick={() => handleGenerate()}
            disabled={isGenerating}
            className="absolute right-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold text-xs shadow-md shadow-pink-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Crear</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {samplePrompts.map((sp, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(sp);
                handleGenerate(sp);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95 truncate max-w-xs"
            >
              ✨ {sp}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
