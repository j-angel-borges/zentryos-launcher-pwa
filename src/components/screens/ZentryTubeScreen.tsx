import React, { useState } from 'react';
import { 
  Tv, 
  Search, 
  ThumbsUp, 
  Share2, 
  Bookmark, 
  Sparkles, 
  X, 
  Play, 
  CheckCircle2, 
  HelpCircle,
  Clock
} from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { YOUTUBE_VIDEOS, UniversalMediaItem } from '../../services/entertainmentData';
import { askZentryAi } from '../../services/aiService';
import { mediaPlaybackService } from '../../services/mediaPlaybackService';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryTubeScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState<UniversalMediaItem | null>(null);
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});

  // Socratic Quiz State
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizData, setQuizData] = useState<any | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showQuizResult, setShowQuizResult] = useState(false);

  const categories = [
    'Todos', 
    'Ciencia', 
    'Física', 
    'IA & Código', 
    'Historia', 
    'Matemáticas', 
    'Espacio', 
    'Arte & Música'
  ];

  const filteredVideos = YOUTUBE_VIDEOS.filter((v) => {
    if (selectedCategory !== 'Todos' && v.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return v.title.toLowerCase().includes(q) || v.creator.toLowerCase().includes(q);
    }
    return true;
  });

  const handleGenerateQuiz = async (video: UniversalMediaItem) => {
    sounds.playTap();
    setIsGeneratingQuiz(true);
    setQuizData(null);
    setSelectedAnswers({});
    setShowQuizResult(false);

    try {
      const prompt = `Genera un mini-quiz de 3 preguntas de opción múltiple pedagógicas para un estudiante sobre el video: "${video.title}" del canal "${video.creator}".
Formato JSON estricto:
{
  "questions": [
    {
      "question": "¿Pregunta 1?",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correctIndex": 0,
      "explanation": "Explicación socrática de por qué es la correcta."
    }
  ]
}`;

      const raw = await askZentryAi('general_ai', prompt);
      const clean = raw.trim().replace(/^```json/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(clean);
      sounds.playSuccess();
      setQuizData(parsed.questions || []);
    } catch (e) {
      console.warn('Quiz generation error:', e);
      setQuizData([
        {
          question: `¿Cuál es el objetivo principal del video sobre ${video.category}?`,
          options: [
            'Comprender los principios fundamentales explicados',
            'Memorizar fechas sin entender',
            'Copiar código sin ejecutarlo',
            'Ignorar las leyes físicas'
          ],
          correctIndex: 0,
          explanation: 'El método Zentry prioriza el razonamiento crítico y la comprensión de conceptos.'
        }
      ]);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  return (
    <ZentrySubPageScaffold title="ZentryTube" kicker="YOUTUBE GUARD" onBack={onBack} isDark={isDark}>
      <div className="max-w-3xl mx-auto w-full h-full flex flex-col space-y-3 overflow-hidden">
        {/* Top YouTube Header Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md">
              <Tv className="w-4 h-4" />
            </div>
            <div className="font-black text-sm tracking-tight text-white flex items-center gap-1">
              <span>Zentry</span>
              <span className="text-red-500 font-extrabold">Tube</span>
            </div>
          </div>

          <div className="flex-1 max-w-sm relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar entre 50 videos educativos..."
              className={(isDark ? 'bg-white/10 text-white placeholder-slate-400 border-white/20 ' : 'bg-white/80 text-[#1E293B] placeholder-slate-400 border-white/60 ') + 'w-full pl-9 pr-3 py-1.5 rounded-full border text-xs font-medium focus:outline-none'}
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sounds.playTap();
                setSelectedCategory(cat);
              }}
              className={(selectedCategory === cat ? 'bg-red-600 text-white font-bold shadow-md ' : (isDark ? 'bg-white/10 text-slate-300 ' : 'bg-white/80 text-slate-700 ')) + 'px-3 py-1 rounded-full text-[11px] whitespace-nowrap cursor-pointer zentry-press transition-all border border-white/10'}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Videos Grid */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => {
                  sounds.playTap();
                  setActiveVideo(video);
                  setQuizData(null);
                  mediaPlaybackService.playMedia({
                    id: video.id,
                    mediaId: video.mediaId,
                    title: video.title,
                    creator: video.creator,
                    creatorAvatar: video.creatorAvatar,
                    category: video.category,
                    type: 'youtube',
                    sourceScreen: 'zentry_tube',
                    duration: video.duration
                  });
                }}
                className={(isDark ? 'bg-white/10 hover:bg-white/15 border-white/15 ' : 'bg-white/85 hover:bg-white border-white/40 ') + 'rounded-[22px] overflow-hidden border cursor-pointer transition-all zentry-press shadow-md group flex flex-col justify-between'}
              >
                {/* Video Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                  <img
                    src={`https://img.youtube.com/vi/${video.mediaId}/hqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-white flex items-center gap-1 font-bold">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{video.duration || '15:00'}</span>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-red-600/90 text-[9px] font-bold text-white shadow-sm">
                    {video.category}
                  </div>
                </div>

                {/* Video Details */}
                <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div className="flex items-start gap-2.5">
                    <img
                      src={video.creatorAvatar}
                      alt={video.creator}
                      className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/20 mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className={(isDark ? 'text-white ' : 'text-[#1E293B] ') + 'text-xs font-bold line-clamp-2 leading-snug group-hover:text-red-400 transition-colors'}>
                        {video.title}
                      </h4>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
                        <span className="font-semibold text-slate-300">{video.creator}</span>
                        <span>•</span>
                        <span>{video.viewsOrLikes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Video Player Modal with Socratic AI Tutor */}
        {activeVideo && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
            <div className={(isDark ? 'zentry-glass-dark text-white ' : 'zentry-glass-light text-[#1E293B] ') + 'w-full max-w-3xl max-h-[92vh] rounded-[28px] p-4 shadow-2xl flex flex-col space-y-3 overflow-hidden border border-white/30'}>
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-bold truncate">{activeVideo.title}</span>
                </div>
                <button
                  onClick={() => {
                    sounds.playTap();
                    setActiveVideo(null);
                  }}
                  className="p-1.5 rounded-full hover:bg-white/20 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* In-App YouTube IFrame Player */}
              <div className="relative aspect-video w-full rounded-[20px] overflow-hidden bg-black shadow-lg border border-white/10">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.mediaId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <img
                    src={activeVideo.creatorAvatar}
                    alt={activeVideo.creator}
                    className="w-8 h-8 rounded-full object-cover border border-white/20"
                  />
                  <div>
                    <div className="text-xs font-bold">{activeVideo.creator}</div>
                    <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Canal Educativo Verificado
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      sounds.playSuccess();
                      setLikedVideos((prev) => ({ ...prev, [activeVideo.id]: !prev[activeVideo.id] }));
                    }}
                    className={(likedVideos[activeVideo.id] ? 'bg-red-600 text-white ' : 'bg-white/10 text-slate-300 ') + 'px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer zentry-press'}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{likedVideos[activeVideo.id] ? 'Me gusta' : 'Me gusta'}</span>
                  </button>

                  <button
                    onClick={() => handleGenerateQuiz(activeVideo)}
                    disabled={isGeneratingQuiz}
                    className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer zentry-press shadow-md disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isGeneratingQuiz ? 'Generando Quiz...' : 'Tutor Quiz IA'}</span>
                  </button>
                </div>
              </div>

              {/* Socratic Quiz & Description Viewport */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {quizData ? (
                  <div className="p-4 rounded-[20px] bg-indigo-950/30 border border-indigo-400/30 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-indigo-400/20 pb-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                        <HelpCircle className="w-4 h-4" />
                        <span>Desafío de Comprensión Zentry</span>
                      </div>
                      {showQuizResult && (
                        <span className="text-xs font-extrabold text-emerald-400">
                          ¡Quiz Completado!
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      {quizData.map((q: any, qIdx: number) => {
                        return (
                          <div key={qIdx} className="space-y-1.5 bg-black/20 p-3 rounded-xl">
                            <div className="text-xs font-bold text-white">
                              {qIdx + 1}. {q.question}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                              {q.options.map((opt: string, optIdx: number) => {
                                const selected = selectedAnswers[qIdx] === optIdx;
                                let btnColor = 'bg-white/10 hover:bg-white/20 text-slate-200';
                                if (showQuizResult) {
                                  if (optIdx === q.correctIndex) btnColor = 'bg-emerald-600 text-white font-bold';
                                  else if (selected) btnColor = 'bg-red-600 text-white';
                                } else if (selected) {
                                  btnColor = 'bg-indigo-600 text-white font-bold';
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => {
                                      sounds.playTap();
                                      setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
                                    }}
                                    className={`p-2 rounded-lg text-[11px] text-left transition-colors cursor-pointer ${btnColor}`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                            {showQuizResult && (
                              <div className="text-[10px] text-slate-300 italic pt-1">
                                💡 {q.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {!showQuizResult && (
                      <button
                        onClick={() => {
                          sounds.playSuccess();
                          setShowQuizResult(true);
                        }}
                        disabled={Object.keys(selectedAnswers).length < quizData.length}
                        className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer disabled:opacity-40"
                      >
                        Comprobar Respuestas
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-300 bg-white/5 p-3 rounded-[18px]">
                    <div className="font-bold text-white mb-1">Descripción del Aprendizaje:</div>
                    <p className="leading-relaxed text-[11px]">{activeVideo.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ZentrySubPageScaffold>
  );
};
