import React, { useState, useEffect, useRef } from 'react';
import { 
  Tv, 
  Radio, 
  Flame, 
  Play, 
  Pause, 
  X, 
  Camera, 
  Mic, 
  ExternalLink, 
  Palette, 
  Activity, 
  Send,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import type { ScreenId, AgeTier } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';
import { mediaPlaybackService, ActiveMediaItem } from '../../services/mediaPlaybackService';
import { agencyService, AgencyState, CreativeIntervention } from '../../services/agencyService';
import { askZentryAi } from '../../services/aiService';
import { ZentryLogoIcon } from '../ui/ZentryLogoIcon';

interface Props {
  currentScreen: ScreenId;
  ageTier?: AgeTier;
  onNavigate: (screen: ScreenId) => void;
  isDark: boolean;
}

export const ZentryDynamicIsland: React.FC<Props> = ({
  currentScreen,
  ageTier = 'toddler',
  onNavigate,
  isDark
}) => {
  // Subscriptions
  const [activeMedia, setActiveMedia] = useState<ActiveMediaItem | null>(null);
  const [agencyState, setAgencyState] = useState<AgencyState>(agencyService.getState());
  
  // UI In-Place Transformation State (3 core tabs: Retos, Ver, Hablar)
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'camera' | 'voice'>('quick');

  // Interactive Voice & Vision QA in Island
  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceResponse, setVoiceResponse] = useState<string | null>(null);
  const [isProcessingAi, setIsProcessingAi] = useState(false);

  // Direct Camera State inside Island
  const [cameraStreamActive, setCameraStreamActive] = useState(false);
  const [cameraCapturedImg, setCameraCapturedImg] = useState<string | null>(null);
  const [cameraAiInsight, setCameraAiInsight] = useState<string | null>(null);
  const islandVideoRef = useRef<HTMLVideoElement | null>(null);
  const islandStreamRef = useRef<MediaStream | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsubMedia = mediaPlaybackService.subscribe((media) => {
      setActiveMedia(media);
    });
    const unsubAgency = agencyService.subscribe((state) => {
      setAgencyState(state);
    });
    return () => {
      unsubMedia();
      unsubAgency();
    };
  }, []);

  useEffect(() => {
    agencyService.setApp(currentScreen);
  }, [currentScreen]);

  // Clean camera stream when collapsed or switching tab
  useEffect(() => {
    if (!isExpanded || activeTab !== 'camera') {
      if (islandStreamRef.current) {
        islandStreamRef.current.getTracks().forEach((t) => t.stop());
        islandStreamRef.current = null;
      }
      setCameraStreamActive(false);
    }
  }, [isExpanded, activeTab]);

  // Handle clicking outside to collapse the island seamlessly
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent | TouchEvent) => {
      if (isExpanded && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        sounds.playTap();
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleDocumentClick);
      document.addEventListener('touchstart', handleDocumentClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('touchstart', handleDocumentClick);
    };
  }, [isExpanded]);

  // Toggle in-place expansion
  const handleToggleIsland = () => {
    sounds.playTap();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
    setIsExpanded((prev) => !prev);
  };

  // Launch camera inside island
  const handleStartIslandCamera = async () => {
    sounds.playTap();
    setActiveTab('camera');
    setCameraCapturedImg(null);
    setCameraAiInsight(null);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        islandStreamRef.current = stream;
        if (islandVideoRef.current) {
          islandVideoRef.current.srcObject = stream;
          islandVideoRef.current.play().catch(() => {});
          setCameraStreamActive(true);
        }
      }
    } catch (e) {
      console.warn('Island camera error:', e);
      setCameraAiInsight('Abriendo cámara...');
      setTimeout(() => {
        setIsExpanded(false);
        onNavigate('camera');
      }, 700);
    }
  };

  // Capture photo in island and analyze
  const handleCaptureAndAsk = async () => {
    sounds.playTap();
    if (!islandVideoRef.current) return;
    const video = islandVideoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    setCameraCapturedImg(base64);
    setIsProcessingAi(true);

    try {
      const prompt = `Eres el Asistente Multimodal en la Isla Dinámica de ZentryOS para un niño (${ageTier === 'toddler' ? '2-5 años' : '5-10+ años'}).
Analiza la imagen que el niño acaba de capturar. Explícale qué es en 2 oraciones divertidas, cálidas y socráticas.`;
      const response = await askZentryAi('camera_vision', prompt, base64);
      sounds.playSuccess();
      setCameraAiInsight(response);
      voiceService.speakFeedback(response);
    } catch {
      setCameraAiInsight('¡Veo algo lindo! Vamos al taller de arte.');
    } finally {
      setIsProcessingAi(false);
    }
  };

  // Trigger Proactive Creative Intervention
  const handleTriggerIntervention = async () => {
    sounds.playTap();
    setIsProcessingAi(true);
    try {
      await agencyService.generateCreativeIntervention(ageTier);
      sounds.playSuccess();
    } finally {
      setIsProcessingAi(false);
    }
  };

  // Execute Voice Query inside Island
  const handleExecuteVoiceQuery = async (queryText: string) => {
    const text = queryText.trim();
    if (!text) return;
    setIsProcessingAi(true);
    setVoiceResponse(null);

    try {
      const prompt = `Eres Zentry AI, asistente cariñoso y socrático para un niño (${ageTier === 'toddler' ? '2 a 5 años' : '5 a 10+ años'}).
Responde a esta pregunta: "${text}".
Mantén la respuesta en 2 oraciones breves, comprensibles, alegres y socráticas.`;
      const response = await askZentryAi('general_ai', prompt);
      sounds.playSuccess();
      setVoiceResponse(response);
      voiceService.speakFeedback(response);
      setVoiceQuery('');
    } catch {
      setVoiceResponse('¡Hola! Estoy aquí para jugar y aprender contigo.');
    } finally {
      setIsProcessingAi(false);
    }
  };

  const getMediaIcon = () => {
    if (!activeMedia) return null;
    switch (activeMedia.type) {
      case 'youtube':
        return <Tv className="w-3.5 h-3.5 text-red-500 shrink-0" />;
      case 'stream':
        return <Radio className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
      case 'tiktok':
        return <Flame className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      default:
        return <Play className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    }
  };

  return (
    <div ref={containerRef} className="relative z-50 flex justify-center w-full max-w-sm select-none">
      {/* ─────────────────────────────────────────────────────────────
          STATE A: COMPACT FLOATING LIQUID GLASS PILL
      ────────────────────────────────────────────────────────────── */}
      {!isExpanded ? (
        <div
          onClick={handleToggleIsland}
          className={
            'flex items-center justify-between gap-2.5 px-3.5 py-1.5 rounded-full cursor-pointer transition-all duration-300 shadow-xl backdrop-blur-2xl border zentry-spring-press ' +
            (activeMedia && activeMedia.isPlaying
              ? 'bg-black/90 text-white border-red-500/70 min-w-[140px] max-w-[210px] '
              : agencyState.currentIntervention
              ? 'bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-900 text-white border-amber-400 animate-pulse min-w-[140px] '
              : 'bg-slate-950/75 hover:bg-slate-900/85 text-white border-white/40 shadow-[0_6px_20px_rgba(0,0,0,0.4)] min-w-[130px] max-w-[160px] ')
          }
          title="Isla Zentry"
        >
          {/* Active Media Preview */}
          {activeMedia && activeMedia.isPlaying ? (
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {getMediaIcon()}
                <span className="text-[10px] font-black text-white truncate max-w-[80px]">
                  {activeMedia.title}
                </span>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <span className="w-0.5 h-3 bg-red-400 rounded-full animate-bounce [animation-delay:0s]" />
                <span className="w-0.5 h-4 bg-purple-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-0.5 h-2.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          ) : agencyState.currentIntervention ? (
            <div className="flex items-center gap-1.5 w-full justify-center">
              <ZentryLogoIcon className="w-3.5 h-3.5 shrink-0 animate-spin" />
              <span className="text-[10px] font-black text-amber-300 truncate">
                ¡A Crear! 🎨
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full gap-2 py-0.5">
              <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-sm shrink-0">
                <ZentryLogoIcon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black tracking-widest text-white drop-shadow-md uppercase">
                ZENTRY
              </span>
            </div>
          )}
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            STATE B: IN-PLACE EXPANDED DYNAMIC ISLAND (ALTO CONTRASTE Y 3 BOTONES)
        ────────────────────────────────────────────────────────────── */
        <div
          className="w-full rounded-[30px] p-3.5 shadow-2xl border border-purple-400/50 bg-[#100D22]/95 text-white backdrop-blur-2xl space-y-3 animate-spring-morph relative overflow-hidden ring-1 ring-white/20"
        >
          {/* Header of Island: Logo + Title + Collapse Button */}
          <div className="flex items-center justify-between border-b border-white/15 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md">
                <ZentryLogoIcon className="w-4 h-4" />
              </div>
              <div className="text-sm font-black tracking-tight text-white drop-shadow-sm">
                Isla Zentry
              </div>
            </div>

            <button
              onClick={handleToggleIsland}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer zentry-spring-press"
              title="Cerrar"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          {/* Active Background Media Player (If playing) */}
          {activeMedia && activeMedia.isPlaying && (
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-black/60 border border-white/20 animate-spring-unfold">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-red-500/30 flex items-center justify-center">
                  {getMediaIcon()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white truncate max-w-[150px]">{activeMedia.title}</div>
                  <div className="text-[9px] text-slate-300 font-bold">{activeMedia.category}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => mediaPlaybackService.togglePlayPause()}
                  className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer"
                >
                  {activeMedia.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => {
                    setIsExpanded(false);
                    onNavigate(activeMedia.sourceScreen);
                  }}
                  className="p-1.5 rounded-full bg-purple-500/40 hover:bg-purple-500/60 text-white cursor-pointer"
                  title="Abrir"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* 3 Core Action Buttons: Retos, Ver, Hablar */}
          <div className="grid grid-cols-3 gap-2">
            {/* 1. RETOS */}
            <button
              onClick={() => {
                sounds.playTap();
                setActiveTab('quick');
              }}
              className={
                (activeTab === 'quick'
                  ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg ring-2 ring-white/50 '
                  : 'bg-white/10 hover:bg-white/20 text-white ') +
                'py-2.5 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all zentry-spring-press cursor-pointer'
              }
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span className="text-xs font-black drop-shadow-sm">Retos</span>
            </button>

            {/* 2. VER (CÁMARA) */}
            <button
              onClick={handleStartIslandCamera}
              className={
                (activeTab === 'camera'
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg ring-2 ring-white/50 '
                  : 'bg-white/10 hover:bg-white/20 text-white ') +
                'py-2.5 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all zentry-spring-press cursor-pointer'
              }
            >
              <Camera className="w-5 h-5 text-amber-200" />
              <span className="text-xs font-black drop-shadow-sm">Ver</span>
            </button>

            {/* 3. HABLAR (VOZ IA) */}
            <button
              onClick={() => {
                sounds.playTap();
                setActiveTab('voice');
              }}
              className={
                (activeTab === 'voice'
                  ? 'bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-lg ring-2 ring-white/50 '
                  : 'bg-white/10 hover:bg-white/20 text-white ') +
                'py-2.5 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all zentry-spring-press cursor-pointer'
              }
            >
              <Mic className="w-5 h-5 text-pink-200" />
              <span className="text-xs font-black drop-shadow-sm">Hablar</span>
            </button>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              SEQUENTIAL FUNCTION DISPLAY
          ────────────────────────────────────────────────────────────── */}
          <div className="pt-1 animate-spring-unfold">
            {/* SUB-VIEW 1: RETOS */}
            {activeTab === 'quick' && (
              <div className="space-y-2">
                {agencyState.currentIntervention ? (
                  <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-950 to-indigo-950 border border-amber-400/80 shadow-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-300 uppercase tracking-wide">
                        ¡Reto Creativo!
                      </span>
                      <button
                        onClick={() => agencyService.clearIntervention()}
                        className="text-slate-400 hover:text-white text-xs cursor-pointer p-1"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs font-bold text-white leading-relaxed">
                      {agencyState.currentIntervention.speechText}
                    </p>
                    <button
                      onClick={() => {
                        const target = agencyState.currentIntervention?.targetScreen || 'creation';
                        agencyService.clearIntervention();
                        setIsExpanded(false);
                        onNavigate(target);
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-xs font-black shadow-md hover:scale-102 transition-transform cursor-pointer"
                    >
                      ¡A Crear! 🎨
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-white/10 border border-white/20 space-y-2.5 text-center">
                    <div className="text-xs font-black text-white">
                      ¿Quieres un reto divertido?
                    </div>
                    <button
                      onClick={handleTriggerIntervention}
                      disabled={isProcessingAi}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white text-xs font-black shadow-md hover:scale-102 transition-transform cursor-pointer disabled:opacity-50"
                    >
                      {isProcessingAi ? 'Pensando...' : '💡 Nuevo Reto'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SUB-VIEW 2: VER (CÁMARA) */}
            {activeTab === 'camera' && (
              <div className="space-y-2">
                <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-black border border-white/20 flex items-center justify-center">
                  <video
                    ref={islandVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!cameraStreamActive && !cameraCapturedImg && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 gap-1">
                      <Camera className="w-6 h-6 animate-pulse text-amber-300" />
                      <span className="text-xs font-bold">Cámara lista</span>
                    </div>
                  )}
                  {cameraCapturedImg && (
                    <img
                      src={cameraCapturedImg}
                      alt="Captura"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCaptureAndAsk}
                    disabled={isProcessingAi}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-50 zentry-spring-press"
                  >
                    {isProcessingAi ? 'Analizando...' : '📸 ¿Qué es?'}
                  </button>
                  <button
                    onClick={() => {
                      setIsExpanded(false);
                      onNavigate('camera');
                    }}
                    className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white cursor-pointer zentry-spring-press"
                    title="Cámara completa"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>

                {cameraAiInsight && (
                  <div className="p-2.5 rounded-xl bg-white/15 border border-white/20 text-xs text-white font-bold leading-relaxed">
                    {cameraAiInsight}
                  </div>
                )}
              </div>
            )}

            {/* SUB-VIEW 3: HABLAR */}
            {activeTab === 'voice' && (
              <div className="space-y-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleExecuteVoiceQuery(voiceQuery);
                  }}
                  className="flex items-center gap-2 p-2 rounded-2xl bg-white/15 border border-white/20"
                >
                  <input
                    type="text"
                    value={voiceQuery}
                    onChange={(e) => setVoiceQuery(e.target.value)}
                    placeholder="Pregunta a Zentry..."
                    className="flex-1 bg-transparent text-xs font-black text-white placeholder-slate-400 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!voiceQuery.trim() || isProcessingAi}
                    className="p-2 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white cursor-pointer disabled:opacity-40 zentry-spring-press"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

                {voiceResponse && (
                  <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-400/50 text-xs text-white font-bold leading-relaxed">
                    {voiceResponse}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
