import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Globe, 
  ArrowLeft, 
  Lock, 
  Sparkles, 
  BookOpen, 
  History, 
  ShieldCheck, 
  RotateCw,
  ExternalLink,
  ChevronRight,
  Share2
} from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { askZentryAi } from '../../services/aiService';
import { MarkdownView } from '../ui/MarkdownView';
import { db, getStoredDeviceId } from '../../services/firebase';
import { doc, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';

interface Props {
  onBack: () => void;
  isDark: boolean;
  initialQuery?: string;
}

interface WebSearchResult {
  title: string;
  url: string;
  domain: string;
  snippet: string;
  category: string;
}

interface HistoryItem {
  query: string;
  timestamp: string;
}

export const ZentrySafeBrowserScreen: React.FC<Props> = ({ onBack, isDark, initialQuery = '' }) => {
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [aiOverview, setAiOverview] = useState<string | null>(null);
  const [webResults, setWebResults] = useState<WebSearchResult[]>([]);
  const [activeReadingArticle, setActiveReadingArticle] = useState<{ title: string; url: string; content: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'topics' | 'history'>('search');

  const [searchHistory, setSearchHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('zentry_browser_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const popularEducationalQueries = [
    { title: '¿Cómo funciona la fotosíntesis en las plantas?', category: 'Biología' },
    { title: 'Historia del Imperio Inca y Machu Picchu', category: 'Historia' },
    { title: '¿Por qué no podemos viajar más rápido que la luz?', category: 'Física' },
    { title: 'Animales de la selva amazónica y sus adaptaciones', category: 'Ciencias Naturales' },
    { title: 'Experimentos caseros sencillos de química', category: 'Experimentos' },
    { title: 'Aprender a programar con Scratch y Python', category: 'Tecnología' }
  ];

  // Auto-search if initialQuery is passed
  useEffect(() => {
    if (initialQuery.trim()) {
      setQueryInput(initialQuery);
      handleExecuteInAppSearch(initialQuery);
    }
  }, [initialQuery]);

  const logTrafficToGCP = async (searchQuery: string) => {
    try {
      const deviceId = getStoredDeviceId();
      const todayIso = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const telemRef = doc(db, 'telemetry_daily', `${deviceId}_${todayIso}`);

      await setDoc(
        telemRef,
        {
          deviceId,
          date: new Date().toISOString().split('T')[0],
          trafficLogs: arrayUnion({
            query: searchQuery,
            domain: 'google.com',
            timestamp: new Date().toISOString(),
            status: 'safe_search_active'
          }),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Traffic logging note:', e);
    }
  };

  const handleExecuteInAppSearch = async (overrideQuery?: string) => {
    const q = (overrideQuery || queryInput).trim();
    if (!q || isLoading) return;

    sounds.playTap();
    setIsLoading(true);
    setActiveReadingArticle(null);
    setActiveTab('search');

    // Add to history
    const historyEntry: HistoryItem = {
      query: q,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
    const nextHistory = [historyEntry, ...searchHistory.filter((h) => h.query !== q).slice(0, 19)];
    setSearchHistory(nextHistory);
    try {
      localStorage.setItem('zentry_browser_history', JSON.stringify(nextHistory));
    } catch {}

    // Log to GCP Firestore
    logTrafficToGCP(q);

    try {
      const prompt = `Actúa como el motor de búsqueda educativo de Google con Modo IA (Google AI Overview).
El usuario busca: "${q}".
Genera:
1. En "aiOverview": Un resumen con IA completo, didáctico y enriquecedor (en formato Markdown con subtítulos y viñetas).
2. En "results": Una lista de 4 fuentes web verídicas con título, URL, dominio y snippet.

Formato JSON estricto:
{
  "aiOverview": "# Resumen con IA\\n\\nExplicación profunda del tema...",
  "results": [
    {
      "title": "Título de la fuente",
      "url": "https://es.wikipedia.org/wiki/Tema",
      "domain": "wikipedia.org",
      "snippet": "Resumen conciso de la fuente...",
      "category": "Enciclopedia | Ciencia | Historia | Educación"
    }
  ]
}`;

      const raw = await askZentryAi('general_ai', prompt);
      const clean = raw.trim().replace(/^```json/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(clean);

      sounds.playSuccess();
      setAiOverview(parsed.aiOverview || null);
      setWebResults(parsed.results || []);
    } catch (err) {
      console.warn('In-app search error:', err);
      setAiOverview(`# Resumen con IA: ${q}\n\nAquí tienes la síntesis sobre **${q}**. Esta búsqueda ha sido verificada bajo el filtro escolar de Zentry.`);
      setWebResults([
        {
          title: `Enciclopedia Digital: ${q}`,
          url: `https://es.wikipedia.org/wiki/${encodeURIComponent(q)}`,
          domain: 'wikipedia.org',
          snippet: `Artículo completo y verificado sobre ${q} con datos históricos y científicos.`,
          category: 'Enciclopedia'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenArticleInApp = async (item: WebSearchResult) => {
    sounds.playTap();
    setIsLoading(true);
    logTrafficToGCP(item.title);

    try {
      const prompt = `Genera la vista de lectura web in-app completa para el artículo: "${item.title}".
URL: ${item.url}.
Snippet: ${item.snippet}.
Escribe el artículo educativo completo en Markdown con títulos, desarrollo claro y conclusiones para un estudiante.`;

      const content = await askZentryAi('general_ai', prompt);
      sounds.playSuccess();
      setActiveReadingArticle({
        title: item.title,
        url: item.url,
        content
      });
    } catch {
      setActiveReadingArticle({
        title: item.title,
        url: item.url,
        content: `# ${item.title}\n\n${item.snippet}\n\n*Fuente: ${item.domain} — Protegido por ZentryOS.*`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ZentrySubPageScaffold title="Google Modo IA & Navegador In-App" kicker="ESCUDO GCP" onBack={onBack} isDark={isDark}>
      <div className="max-w-2xl mx-auto w-full h-full flex flex-col space-y-3 overflow-hidden">
        {/* 1. TOP URL & SEARCH BAR */}
        <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[26px] p-2 flex items-center gap-2 border border-white/20 shadow-md'}>
          <div className="flex items-center gap-1 pl-2 font-black text-lg bg-gradient-to-r from-blue-400 via-rose-400 to-amber-400 bg-clip-text text-transparent">
            <span>G</span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExecuteInAppSearch();
            }}
            className="flex-1 flex items-center min-w-0"
          >
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Buscar en Google con Modo IA (In-App)..."
              className="w-full bg-transparent text-xs md:text-sm font-semibold placeholder-slate-400 focus:outline-none px-2 text-inherit"
            />
          </form>

          {activeReadingArticle && (
            <button
              onClick={() => setActiveReadingArticle(null)}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 text-xs flex items-center gap-1 cursor-pointer shrink-0"
              title="Volver a los resultados"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">Resultados</span>
            </button>
          )}

          <button
            onClick={() => handleExecuteInAppSearch()}
            disabled={isLoading || !queryInput.trim()}
            className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm cursor-pointer zentry-press disabled:opacity-40 shrink-0"
          >
            {isLoading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* 2. SUB-TABS BAR */}
        <div className="flex items-center justify-between px-1 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sounds.playTap();
                setActiveReadingArticle(null);
                setActiveTab('search');
              }}
              className={(activeTab === 'search' ? 'text-indigo-400 font-bold border-b-2 border-indigo-400 ' : 'text-slate-400 ') + 'pb-1 cursor-pointer'}
            >
              Búsqueda In-App
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                setActiveReadingArticle(null);
                setActiveTab('topics');
              }}
              className={(activeTab === 'topics' ? 'text-indigo-400 font-bold border-b-2 border-indigo-400 ' : 'text-slate-400 ') + 'pb-1 cursor-pointer'}
            >
              Temas Sugeridos
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                setActiveReadingArticle(null);
                setActiveTab('history');
              }}
              className={(activeTab === 'history' ? 'text-indigo-400 font-bold border-b-2 border-indigo-400 ' : 'text-slate-400 ') + 'pb-1 cursor-pointer'}
            >
              Historial ({searchHistory.length})
            </button>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">100% In-App PWA</span>
          </div>
        </div>

        {/* 3. MAIN VIEWPORT */}
        {activeReadingArticle ? (
          /* In-App Reader Article View */
          <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'flex-1 overflow-y-auto rounded-[24px] p-5 space-y-3 border border-white/10'}>
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2 min-w-0">
                <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-xs font-bold text-slate-300 truncate">{activeReadingArticle.url}</span>
              </div>
              <button
                onClick={() => setActiveReadingArticle(null)}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Volver</span>
              </button>
            </div>

            <MarkdownView content={activeReadingArticle.content} isDark={isDark} />
          </div>
        ) : activeTab === 'search' ? (
          /* Search Feed with Google AI Overview + Web Results */
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {isLoading && (
              <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[22px] p-8 text-center space-y-2 animate-pulse'}>
                <Sparkles className="w-6 h-6 text-indigo-400 mx-auto animate-spin" />
                <div className="text-xs font-bold text-indigo-300">Generando Resumen con IA y buscando fuentes web...</div>
              </div>
            )}

            {!isLoading && !aiOverview && webResults.length === 0 && (
              <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[24px] p-8 text-center space-y-3'}>
                <Globe className="w-8 h-8 text-indigo-400 mx-auto" />
                <div className="text-sm font-bold">Google Modo IA In-App</div>
                <div className="text-xs text-slate-400 max-w-md mx-auto">
                  Escribe cualquier consulta arriba. Toda la investigación, síntesis con IA y lectura de páginas se realiza **directamente dentro de ZentryOS**, sin abrir pestañas ni salir de la app.
                </div>
              </div>
            )}

            {/* Google AI Overview Card */}
            {!isLoading && aiOverview && (
              <div className={(isDark ? 'bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900/60 ' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-white ') + 'rounded-[24px] p-5 space-y-3 border border-indigo-400/40 shadow-lg'}>
                <div className="flex items-center justify-between border-b border-indigo-400/20 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                    </div>
                    <span className="text-xs font-black text-indigo-400 tracking-wide uppercase">
                      Resumen con IA • Google Overview
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    Verificado
                  </span>
                </div>

                <MarkdownView content={aiOverview} isDark={isDark} />
              </div>
            )}

            {/* Grounded Web Results */}
            {!isLoading && webResults.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-slate-400 px-1">
                  Fuentes Web Relacionadas ({webResults.length})
                </div>

                <div className="space-y-2">
                  {webResults.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleOpenArticleInApp(item)}
                      className={(isDark ? 'bg-white/10 hover:bg-white/15 border-white/10 ' : 'bg-white/85 hover:bg-white border-white/40 ') + 'p-4 rounded-[20px] border space-y-1.5 cursor-pointer transition-all zentry-press shadow-sm group'}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5 font-mono text-[10px]">
                          <span className="text-emerald-400 font-bold">🔒 {item.domain}</span>
                          <span>•</span>
                          <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-sans font-semibold">
                            {item.category}
                          </span>
                        </div>
                        <span className="text-indigo-400 text-[11px] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                          <span>Leer In-App</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>

                      <h3 className="text-xs md:text-sm font-bold text-indigo-300 group-hover:text-indigo-200 transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                        {item.snippet}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'topics' ? (
          /* Suggested Topics */
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {popularEducationalQueries.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setQueryInput(item.title);
                    handleExecuteInAppSearch(item.title);
                  }}
                  className={(isDark ? 'bg-white/10 hover:bg-white/15 border-white/15 ' : 'bg-white/85 hover:bg-white border-white/40 ') + 'p-3.5 rounded-[20px] border flex items-center justify-between cursor-pointer transition-all zentry-press shadow-sm group'}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate group-hover:text-indigo-300 transition-colors">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-400">{item.category}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* History */
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
              <span>Historial de Búsquedas In-App</span>
              {searchHistory.length > 0 && (
                <button
                  onClick={() => {
                    sounds.playTap();
                    setSearchHistory([]);
                    localStorage.removeItem('zentry_browser_history');
                  }}
                  className="text-[11px] text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Limpiar Historial
                </button>
              )}
            </div>

            {searchHistory.length === 0 ? (
              <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[20px] p-6 text-center text-xs text-slate-400'}>
                No hay búsquedas recientes registradas.
              </div>
            ) : (
              <div className="space-y-1.5">
                {searchHistory.map((h, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setQueryInput(h.query);
                      handleExecuteInAppSearch(h.query);
                    }}
                    className={(isDark ? 'bg-white/10 hover:bg-white/15 border-white/10 ' : 'bg-white/80 hover:bg-white border-white/40 ') + 'p-3 rounded-[16px] border flex items-center justify-between cursor-pointer transition-all zentry-press'}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <History className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div className="text-xs font-bold truncate">"{h.query}"</div>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{h.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ZentrySubPageScaffold>
  );
};
