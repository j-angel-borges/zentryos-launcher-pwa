import React, { useState } from 'react';
import { 
  Search, 
  ExternalLink, 
  Sparkles, 
  BookOpen, 
  History,
  ShieldCheck,
  GraduationCap,
  Lock
} from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { db, getStoredDeviceId } from '../../services/firebase';
import { doc, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

interface HistoryItem {
  query: string;
  timestamp: string;
}

export const ZentrySafeBrowserScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [queryInput, setQueryInput] = useState('');
  const [activeTab, setActiveTab] = useState<'google' | 'topics' | 'history'>('google');

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

  const handleLaunchGoogle = (searchQuery?: string) => {
    const q = (searchQuery || queryInput).trim();
    if (!q) return;

    sounds.playSuccess();

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

    // Log to GCP Firestore for Parent Dashboard
    logTrafficToGCP(q);

    // Official Google SafeSearch with AI Overview
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(q)}&safe=active&pws=0`;
    window.open(googleUrl, '_blank');
  };

  const handleLaunchScholar = (searchQuery?: string) => {
    const q = (searchQuery || queryInput).trim();
    if (!q) return;
    sounds.playSuccess();
    logTrafficToGCP(`[Scholar] ${q}`);
    const scholarUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(q)}`;
    window.open(scholarUrl, '_blank');
  };

  return (
    <ZentrySubPageScaffold title="Google SafeSearch & Modo IA" kicker="ESCUDO GCP" onBack={onBack} isDark={isDark}>
      <div className="max-w-2xl mx-auto w-full h-full flex flex-col space-y-3.5 overflow-hidden">
        {/* 1. TOP GOOGLE SEARCH ENGINE BAR */}
        <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[28px] p-2.5 flex items-center gap-2 border border-white/20 shadow-lg'}>
          <div className="flex items-center gap-1.5 pl-2 font-black text-lg bg-gradient-to-r from-blue-400 via-rose-400 to-amber-400 bg-clip-text text-transparent">
            <span>G</span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLaunchGoogle();
            }}
            className="flex-1 flex items-center min-w-0"
          >
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Buscar en Google con Modo IA y SafeSearch..."
              className="w-full bg-transparent text-xs md:text-sm font-semibold placeholder-slate-400 focus:outline-none px-2 text-inherit"
              autoFocus
            />
          </form>

          <button
            onClick={() => handleLaunchGoogle()}
            disabled={!queryInput.trim()}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer zentry-press disabled:opacity-40 shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Buscar</span>
          </button>
        </div>

        {/* 2. SUB-TABS BAR */}
        <div className="flex items-center justify-between px-1 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sounds.playTap();
                setActiveTab('google');
              }}
              className={(activeTab === 'google' ? 'text-indigo-400 font-bold border-b-2 border-indigo-400 ' : 'text-slate-400 ') + 'pb-1 cursor-pointer'}
            >
              Portal Google IA
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                setActiveTab('topics');
              }}
              className={(activeTab === 'topics' ? 'text-indigo-400 font-bold border-b-2 border-indigo-400 ' : 'text-slate-400 ') + 'pb-1 cursor-pointer'}
            >
              Búsquedas Sugeridas
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                setActiveTab('history');
              }}
              className={(activeTab === 'history' ? 'text-indigo-400 font-bold border-b-2 border-indigo-400 ' : 'text-slate-400 ') + 'pb-1 cursor-pointer'}
            >
              Historial ({searchHistory.length})
            </button>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SafeSearch Activo</span>
          </div>
        </div>

        {/* 3. MAIN TAB VIEWPORT */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {activeTab === 'google' ? (
            <div className="space-y-3">
              {/* Google AI Overview Feature Card */}
              <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[24px] p-5 space-y-3 border border-indigo-400/30 shadow-md'}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="text-xs md:text-sm font-bold">Google con Modo IA & SafeSearch</div>
                      <div className="text-[10px] text-slate-400">Resúmenes inteligentes con IA directamente desde Google Oficial</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    Protegido
                  </span>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed bg-black/20 p-3.5 rounded-[18px] border border-white/10">
                  {queryInput.trim() ? (
                    <div className="space-y-2">
                      <div className="text-slate-400 text-[11px]">Búsqueda lista para enviar:</div>
                      <div className="text-white font-bold text-sm italic">"{queryInput}"</div>
                      <div className="text-[11px] text-indigo-300">
                        Al presionar el botón se abrirá el motor oficial de Google con filtro familiar estricto y la síntesis con IA activada.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="font-semibold text-white">¿Cómo funciona el Modo IA de Google?</div>
                      <div className="text-[11px] text-slate-400">
                        Sintetiza la información de toda la web con enlaces directos a las mejores fuentes, garantizando una investigación completa y segura.
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleLaunchGoogle()}
                    disabled={!queryInput.trim()}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer zentry-press disabled:opacity-40"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir Búsqueda con IA en Google</span>
                  </button>

                  <button
                    onClick={() => handleLaunchScholar()}
                    disabled={!queryInput.trim()}
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer zentry-press disabled:opacity-40"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Google Académico (Fuentes Escolares)</span>
                  </button>
                </div>
              </div>

              {/* Safety Explanation Banner */}
              <div className="p-3.5 rounded-[20px] bg-white/10 border border-white/15 flex items-center gap-3 text-xs">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="text-slate-300 text-[11px] leading-tight">
                  <span className="font-bold text-white">Filtro de Tráfico Activo: </span>
                  Todas las consultas se auditan automáticamente y se transmiten al panel de supervisión de los padres.
                </div>
              </div>
            </div>
          ) : activeTab === 'topics' ? (
            /* Suggested Topics */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {popularEducationalQueries.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setQueryInput(item.title);
                    handleLaunchGoogle(item.title);
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
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                </div>
              ))}
            </div>
          ) : (
            /* History */
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                <span>Historial de Búsquedas en Google</span>
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
                        handleLaunchGoogle(h.query);
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
      </div>
    </ZentrySubPageScaffold>
  );
};
