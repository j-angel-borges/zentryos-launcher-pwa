import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Download, 
  RefreshCw, 
  Maximize2, 
  Palette, 
  Wand2, 
  Trash2,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';
import { askZentryAi } from '../../services/aiService';

interface Props {
  onBack: () => void;
  onNavigate: (screen: any) => void;
  isDark: boolean;
}

interface GeneratedArt {
  id: string;
  title: string;
  url: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  timestamp: string;
}

export const ZentryImagineScreen: React.FC<Props> = ({ onBack, onNavigate, isDark }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('3D Pixar');
  const [selectedAspect, setSelectedAspect] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [currentImage, setCurrentImage] = useState<GeneratedArt | null>(null);
  const [fullscreenImg, setFullscreenImg] = useState<GeneratedArt | null>(null);

  const [history, setHistory] = useState<GeneratedArt[]>(() => {
    try {
      const saved = localStorage.getItem('zentry_imagine_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'init-1',
        title: 'Castillo Espacial',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        prompt: 'Un castillo de cristal flotando en el espacio con estrellas de colores',
        style: '3D Pixar',
        aspectRatio: '1:1',
        timestamp: 'Ayer'
      },
      {
        id: 'init-2',
        title: 'Gatito Astronauta',
        url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
        prompt: 'Un gatito con traje de astronauta descubriendo un planeta de queso',
        style: 'Cuento Mágico',
        aspectRatio: '1:1',
        timestamp: 'Hoy'
      }
    ];
  });

  const styles = [
    { id: '3D Pixar', label: '🎨 3D Pixar' },
    { id: 'Realista', label: '🌌 Realista' },
    { id: 'Pixel Art', label: '👾 Pixel' },
    { id: 'Acuarela', label: '🖌️ Acuarela' },
    { id: 'Cyberpunk', label: '🚀 Neón' },
    { id: 'Cuento Mágico', label: '📚 Cuento' }
  ];

  const quickIdeas = [
    '🏰 Castillo de cristal',
    '🐱 Gato astronauta',
    '🚀 Cohete en Saturno',
    '🌿 Dragón amigable',
    '🏎️ Auto volador'
  ];

  const saveHistory = (items: GeneratedArt[]) => {
    setHistory(items);
    try {
      localStorage.setItem('zentry_imagine_history', JSON.stringify(items));
    } catch {}
  };

  const handleGenerate = async (customPrompt?: string) => {
    const text = (customPrompt || prompt).trim();
    if (!text || isGenerating) return;

    sounds.playTap();
    setIsGenerating(true);
    setGenerationStep('Zentry refinando detalles...');

    try {
      const aiResponse = await askZentryAi(
        'image_generator',
        `Genera una imagen con estilo ${selectedStyle}, relación ${selectedAspect}. Petición: "${text}"`
      );

      let parsed: any = {};
      try {
        parsed = JSON.parse(aiResponse.trim().replace(/^```json/, '').replace(/```$/, ''));
      } catch {
        parsed = {
          title: text,
          enhancedPrompt: `${text}, ${selectedStyle} style, highly detailed, 8k resolution, vibrant colors`,
          spanishSummary: `Imaginando: ${text}`
        };
      }

      setGenerationStep('Creando arte visual en alta resolución...');

      // Build resolution based on aspect ratio
      const width = selectedAspect === '16:9' ? 1024 : selectedAspect === '9:16' ? 576 : 768;
      const height = selectedAspect === '16:9' ? 576 : selectedAspect === '9:16' ? 1024 : 768;

      const encodedPrompt = encodeURIComponent(
        `${parsed.enhancedPrompt || text}, ${selectedStyle} masterpiece, best quality`
      );
      const seed = Math.floor(Math.random() * 1000000);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

      // Preload image
      const img = new Image();
      img.src = imageUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // Continue on fallback
      });

      sounds.playSuccess();
      const newArt: GeneratedArt = {
        id: 'art-' + Date.now(),
        title: parsed.title || text,
        url: imageUrl,
        prompt: text,
        style: selectedStyle,
        aspectRatio: selectedAspect,
        timestamp: 'Ahora'
      };

      setCurrentImage(newArt);
      saveHistory([newArt, ...history]);
      voiceService.speakFeedback(`¡Listo! He imaginado: ${parsed.title || text}`);
    } catch (err) {
      console.warn('Imagine generation error:', err);
      // Fallback curated generated image
      const fallbackArt: GeneratedArt = {
        id: 'art-' + Date.now(),
        title: text,
        url: `https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80`,
        prompt: text,
        style: selectedStyle,
        aspectRatio: selectedAspect,
        timestamp: 'Ahora'
      };
      setCurrentImage(fallbackArt);
      saveHistory([fallbackArt, ...history]);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleDownload = (art: GeneratedArt) => {
    sounds.playTap();
    const a = document.createElement('a');
    a.href = art.url;
    a.download = `zentry-imagine-${art.id}.jpg`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ZentrySubPageScaffold
      title="Imagine"
      kicker="ARTE GENERATIVO AI"
      onBack={onBack}
      isDark={isDark}
    >
      <div className="w-full h-full overflow-y-auto space-y-4 px-3 py-2 no-scrollbar pb-16">
        {/* Top Prompt Card */}
        <div className="rounded-[30px] p-4 bg-[#120E24]/95 border border-purple-400/50 shadow-2xl space-y-3">
          {/* Textarea Input */}
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe lo que quieres imaginar..."
              rows={2}
              className="w-full bg-white/10 text-white placeholder-slate-400 text-xs font-bold rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-400 border border-white/15 resize-none"
            />
          </div>

          {/* Quick Idea Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {quickIdeas.map((idea, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(idea.replace(/^[^\s]+\s/, ''));
                }}
                className="shrink-0 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white border border-white/15 cursor-pointer zentry-spring-press"
              >
                {idea}
              </button>
            ))}
          </div>

          {/* Styles & Aspect Ratio Row */}
          <div className="flex items-center justify-between gap-2 pt-1">
            {/* Style Selector Pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar flex-1">
              {styles.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    sounds.playTap();
                    setSelectedStyle(s.id);
                  }}
                  className={
                    (selectedStyle === s.id
                      ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md ring-1 ring-white/40 '
                      : 'bg-white/10 text-slate-300 hover:text-white ') +
                    'px-3 py-1.5 rounded-xl text-[10px] font-bold shrink-0 transition-all cursor-pointer'
                  }
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Generate Button */}
            <button
              onClick={() => handleGenerate()}
              disabled={!prompt.trim() || isGenerating}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg cursor-pointer disabled:opacity-40 zentry-spring-press shrink-0"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              <span>{isGenerating ? 'Creando...' : 'Imaginar'}</span>
            </button>
          </div>
        </div>

        {/* Loading Progress Animation */}
        {isGenerating && (
          <div className="p-6 rounded-[28px] bg-gradient-to-tr from-purple-950/80 via-indigo-950/80 to-slate-950/80 border border-purple-400/60 shadow-xl flex flex-col items-center justify-center gap-3 text-center animate-pulse">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-pink-500 flex items-center justify-center text-white shadow-lg animate-spin">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="text-sm font-black text-white">{generationStep}</div>
          </div>
        )}

        {/* Latest Generated Image Hero */}
        {currentImage && !isGenerating && (
          <div className="rounded-[30px] p-3.5 bg-[#141026]/95 border border-purple-400/50 shadow-2xl space-y-3 animate-spring-in">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black text-white truncate max-w-[200px]">
                {currentImage.title}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleDownload(currentImage)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  title="Descargar"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setFullscreenImg(currentImage)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  title="Ver completa"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-white/20 bg-black aspect-square max-h-[300px] flex items-center justify-center">
              <img
                src={currentImage.url}
                alt={currentImage.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Galería Creada
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              {history.length} obras
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => setCurrentImage(item)}
                className="rounded-2xl overflow-hidden bg-white/10 border border-white/20 shadow-md cursor-pointer hover:border-purple-400 transition-all zentry-spring-press relative group aspect-square"
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                  <span className="text-[11px] font-black text-white truncate">
                    {item.title}
                  </span>
                  <span className="text-[9px] text-purple-300 font-medium">
                    {item.style}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {fullscreenImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in select-none"
          onClick={() => setFullscreenImg(null)}
        >
          <div className="relative max-w-lg w-full max-h-[85vh] flex flex-col items-center gap-3">
            <img
              src={fullscreenImg.url}
              alt={fullscreenImg.title}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/30"
            />
            <div className="flex items-center justify-between w-full px-2">
              <span className="text-sm font-black text-white">{fullscreenImg.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(fullscreenImg);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Descargar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </ZentrySubPageScaffold>
  );
};
