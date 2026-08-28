import React, { useState } from 'react';
import { 
  Sparkles, 
  Play, 
  Code2, 
  RefreshCw, 
  Copy, 
  Check, 
  Maximize2, 
  Zap, 
  Layers,
  Terminal,
  Smartphone
} from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';
import { askZentryAi } from '../../services/aiService';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

interface BuiltMiniApp {
  id: string;
  title: string;
  description: string;
  htmlCode: string;
  icon: string;
  timestamp: string;
}

export const ZentryBuildScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStep, setBuildStep] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Preset built-in mini apps
  const defaultPianoApp: BuiltMiniApp = {
    id: 'piano-1',
    title: 'Piano Táctil Neón',
    description: 'Piano musical interactivo con síntesis de sonido',
    icon: '🎹',
    timestamp: 'Hoy',
    htmlCode: `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { box-sizing: border-box; user-select: none; }
  body { margin:0; padding:16px; font-family:'Segoe UI', sans-serif; background:radial-gradient(circle at top,#1e1b4b,#0f172a); color:#fff; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; text-align:center; }
  h2 { margin:0 0 12px; font-size:20px; font-weight:900; background:linear-gradient(135deg,#c084fc,#38bdf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .piano { display:flex; gap:6px; background:rgba(255,255,255,0.06); padding:12px; border-radius:24px; border:1px solid rgba(255,255,255,0.15); box-shadow:0 10px 30px rgba(0,0,0,0.5); }
  .key { width:42px; height:120px; border-radius:14px; background:linear-gradient(180deg,#ffffff,#e2e8f0); color:#0f172a; font-weight:900; font-size:13px; display:flex; align-items:flex-end; justify-content:center; padding-bottom:12px; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.3); transition:all 0.1s cubic-bezier(0.34,1.56,0.64,1); }
  .key:active { transform:scale(0.92) translateY(4px); background:linear-gradient(180deg,#c084fc,#818cf8); color:#fff; box-shadow:0 0 20px #818cf8; }
</style>
</head>
<body>
  <h2>🎹 Piano Mágico</h2>
  <div class="piano">
    <div class="key" onclick="play(261.63)">DO</div>
    <div class="key" onclick="play(293.66)">RE</div>
    <div class="key" onclick="play(329.63)">MI</div>
    <div class="key" onclick="play(349.23)">FA</div>
    <div class="key" onclick="play(392.00)">SOL</div>
    <div class="key" onclick="play(440.00)">LA</div>
    <div class="key" onclick="play(493.88)">SI</div>
  </div>
  <script>
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    function play(freq) {
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  </script>
</body>
</html>`
  };

  const defaultGameApp: BuiltMiniApp = {
    id: 'game-1',
    title: 'Esquiva Meteoritos',
    description: 'Mini juego arcade espacial de reflejos',
    icon: '🚀',
    timestamp: 'Hoy',
    htmlCode: `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { box-sizing:border-box; user-select:none; }
  body { margin:0; padding:12px; font-family:sans-serif; background:#0b0f19; color:#fff; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; text-align:center; }
  #gameCanvas { background:#111827; border:2px solid #6366f1; border-radius:20px; box-shadow:0 8px 30px rgba(99,102,241,0.3); }
  .controls { display:flex; gap:12px; margin-top:12px; }
  .btn { width:60px; height:45px; border-radius:14px; border:none; background:#4f46e5; color:#fff; font-size:18px; font-weight:bold; cursor:pointer; }
  .btn:active { transform:scale(0.9); }
</style>
</head>
<body>
  <div style="font-size:13px; font-weight:bold; margin-bottom:6px;">Puntuación: <span id="score">0</span></div>
  <canvas id="gameCanvas" width="260" height="200"></canvas>
  <div class="controls">
    <button class="btn" onclick="move(-25)">◀</button>
    <button class="btn" onclick="move(25)">▶</button>
  </div>
  <script>
    const cvs = document.getElementById('gameCanvas');
    const ctx = cvs.getContext('2d');
    let x = 120, score = 0, meteor = { x: 50, y: 0, speed: 2.5 };
    function move(dx) { x = Math.max(10, Math.min(230, x + dx)); }
    function loop() {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '22px sans-serif';
      ctx.fillText('🚀', x, 185);
      ctx.fillText('☄️', meteor.x, meteor.y);
      meteor.y += meteor.speed;
      if (meteor.y > 200) {
        meteor.y = 0; meteor.x = Math.random() * 220; score += 10;
        document.getElementById('score').innerText = score;
      }
      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`
  };

  const [appsList, setAppsList] = useState<BuiltMiniApp[]>([defaultPianoApp, defaultGameApp]);
  const [currentApp, setCurrentApp] = useState<BuiltMiniApp>(defaultPianoApp);

  const quickAppIdeas = [
    '🎹 Piano musical',
    '🚀 Esquivar meteoritos',
    '🧮 Calculadora de dulces',
    '🐾 Mascota virtual',
    '🎨 Pizarra de luces neón'
  ];

  const handleBuild = async (customPrompt?: string) => {
    const text = (customPrompt || prompt).trim();
    if (!text || isBuilding) return;

    sounds.playTap();
    setIsBuilding(true);
    setBuildStep('Diseñando interfaz y lógica...');

    try {
      const response = await askZentryAi(
        'app_builder',
        `Construye una mini aplicación interactiva completa en un único archivo HTML autocontenido con JavaScript y estilos CSS modernos. Petición: "${text}"`
      );

      setBuildStep('Compilando código y sandbox en vivo...');

      let parsed: any = {};
      try {
        parsed = JSON.parse(response.trim().replace(/^```json/, '').replace(/```$/, ''));
      } catch {
        parsed = {
          title: text,
          description: `Mini app de ${text}`,
          htmlCode: response
        };
      }

      sounds.playSuccess();
      const newApp: BuiltMiniApp = {
        id: 'app-' + Date.now(),
        title: parsed.title || text,
        description: parsed.description || `Mini App: ${text}`,
        htmlCode: parsed.htmlCode || defaultPianoApp.htmlCode,
        icon: '⚡',
        timestamp: 'Ahora'
      };

      setCurrentApp(newApp);
      setAppsList((prev) => [newApp, ...prev]);
      setActiveTab('preview');
      voiceService.speakFeedback(`¡Listo! He construido la mini aplicación: ${parsed.title || text}`);
    } catch (err) {
      console.warn('App build error:', err);
      // Generate instant game fallback
      const fallbackApp: BuiltMiniApp = {
        id: 'app-' + Date.now(),
        title: text,
        description: 'Mini App Interactiva en vivo',
        htmlCode: defaultGameApp.htmlCode,
        icon: '🎮',
        timestamp: 'Ahora'
      };
      setCurrentApp(fallbackApp);
      setAppsList((prev) => [fallbackApp, ...prev]);
      setActiveTab('preview');
    } finally {
      setIsBuilding(false);
      setBuildStep('');
    }
  };

  const handleCopyCode = () => {
    sounds.playTap();
    navigator.clipboard.writeText(currentApp.htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ZentrySubPageScaffold
      title="Build"
      kicker="CONSTRUCTOR DE MINI APPS"
      onBack={onBack}
      isDark={isDark}
    >
      <div className="w-full h-full overflow-y-auto space-y-4 px-3 py-2 no-scrollbar pb-16">
        {/* Top Builder Input Card */}
        <div className="rounded-[30px] p-4 bg-[#120E24]/95 border border-purple-400/50 shadow-2xl space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-300 animate-pulse" />
            <h3 className="text-xs font-black text-white tracking-wide uppercase">
              Crea tu Propia Aplicación
            </h3>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe la aplicación que deseas construir..."
            rows={2}
            className="w-full bg-white/10 text-white placeholder-slate-400 text-xs font-bold rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-400 border border-white/15 resize-none"
          />

          {/* Quick Ideas */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {quickAppIdeas.map((idea, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(idea.replace(/^[^\s]+\s/, ''))}
                className="shrink-0 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white border border-white/15 cursor-pointer zentry-spring-press"
              >
                {idea}
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => handleBuild()}
              disabled={!prompt.trim() || isBuilding}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 hover:scale-103 text-white font-black text-xs flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-40 zentry-spring-press"
            >
              {isBuilding ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 text-amber-300" />
              )}
              <span>{isBuilding ? 'Construyendo...' : '⚡ Construir App'}</span>
            </button>
          </div>
        </div>

        {/* Building Progress */}
        {isBuilding && (
          <div className="p-6 rounded-[28px] bg-gradient-to-tr from-indigo-950 via-purple-950 to-slate-950 border border-purple-400/60 shadow-xl flex flex-col items-center justify-center gap-3 text-center animate-pulse">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg animate-spin">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="text-sm font-black text-white">{buildStep}</div>
          </div>
        )}

        {/* Live Sandbox Container */}
        <div className="rounded-[30px] p-3.5 bg-[#141026]/95 border border-purple-400/50 shadow-2xl space-y-3">
          {/* Header & Tabs */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg">{currentApp.icon}</span>
              <div className="truncate">
                <div className="text-xs font-black text-white truncate">{currentApp.title}</div>
                <div className="text-[9px] text-slate-400 truncate">{currentApp.description}</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Tab Switcher */}
              <div className="flex bg-white/10 p-0.5 rounded-xl border border-white/15">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={
                    (activeTab === 'preview'
                      ? 'bg-purple-600 text-white shadow-sm '
                      : 'text-slate-300 hover:text-white ') +
                    'px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all'
                  }
                >
                  <Play className="w-3 h-3" />
                  <span>App</span>
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={
                    (activeTab === 'code'
                      ? 'bg-purple-600 text-white shadow-sm '
                      : 'text-slate-300 hover:text-white ') +
                    'px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all'
                  }
                >
                  <Code2 className="w-3 h-3" />
                  <span>Código</span>
                </button>
              </div>

              {activeTab === 'code' ? (
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  title="Copiar código"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              ) : (
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  title="Pantalla completa"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Interactive Live Sandbox (Iframe) */}
          {activeTab === 'preview' ? (
            <div className="w-full h-72 rounded-2xl overflow-hidden bg-slate-950 border border-white/15 shadow-inner">
              <iframe
                title={currentApp.title}
                srcDoc={currentApp.htmlCode}
                sandbox="allow-scripts allow-modals allow-same-origin"
                className="w-full h-full border-none"
              />
            </div>
          ) : (
            <div className="w-full h-72 rounded-2xl overflow-auto bg-slate-950 p-3 border border-white/15 font-mono text-[10px] text-emerald-300 no-scrollbar">
              <pre>{currentApp.htmlCode}</pre>
            </div>
          )}
        </div>

        {/* My Built Apps List */}
        <div className="space-y-2">
          <h4 className="text-xs font-black text-white uppercase tracking-wider px-1">
            Mis Mini Aplicaciones
          </h4>
          <div className="grid grid-cols-2 gap-2.5">
            {appsList.map((app) => (
              <div
                key={app.id}
                onClick={() => {
                  sounds.playTap();
                  setCurrentApp(app);
                }}
                className={
                  (currentApp.id === app.id
                    ? 'ring-2 ring-purple-400 bg-purple-500/25 '
                    : 'bg-white/10 hover:bg-white/15 ') +
                  'p-3 rounded-2xl border border-white/20 shadow-md cursor-pointer transition-all zentry-spring-press flex items-center gap-2.5'
                }
              >
                <span className="text-2xl">{app.icon}</span>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white truncate">{app.title}</div>
                  <div className="text-[9px] text-slate-400 font-mono">{app.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen Sandbox Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="p-3 bg-slate-900 border-b border-white/15 flex items-center justify-between">
            <span className="text-sm font-black text-white">{currentApp.title}</span>
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold cursor-pointer"
            >
              Cerrar
            </button>
          </div>
          <iframe
            title={currentApp.title}
            srcDoc={currentApp.htmlCode}
            sandbox="allow-scripts allow-modals allow-same-origin"
            className="w-full flex-1 border-none"
          />
        </div>
      )}
    </ZentrySubPageScaffold>
  );
};
