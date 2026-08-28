import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Tv, 
  Radio, 
  Flame, 
  Play, 
  Pause, 
  X, 
  Camera, 
  Bot, 
  Mic, 
  Eye, 
  ExternalLink, 
  Palette, 
  CheckCircle2, 
  Activity, 
  Send,
  HelpCircle,
  Clock,
  ChevronRight,
  Volume2,
  GraduationCap,
  Zap
} from 'lucide-react';
import type { ScreenId, AgeTier } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';
import { voiceService, VOICE_PERSONAS, type VoicePersona } from '../../services/voiceSpeech';
import { mediaPlaybackService, ActiveMediaItem } from '../../services/mediaPlaybackService';
import { agencyService, AgencyState, CreativeIntervention } from '../../services/agencyService';
import { askZentryAi } from '../../services/aiService';

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
  // Global Media & Agency Subscriptions
  const [activeMedia, setActiveMedia] = useState<ActiveMediaItem | null>(null);
  const [agencyState, setAgencyState] = useState<AgencyState>(agencyService.getState());
  
  // Dynamic Island UI States
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'camera' | 'voice' | 'memory'>('quick');

  // Interactive Voice & Vision QA in Island
  const [selectedPersona, setSelectedPersona] = useState<VoicePersona>(() => voiceService.getPersona());
  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceResponse, setVoiceResponse] = useState<string | null>(null);
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [screenAnalysis, setScreenAnalysis] = useState<string | null>(null);

  // Direct Camera State inside Island
  const [cameraStreamActive, setCameraStreamActive] = useState(false);
  const [cameraCapturedImg, setCameraCapturedImg] = useState<string | null>(null);
  const [cameraAiInsight, setCameraAiInsight] = useState<string | null>(null);
  const islandVideoRef = useRef<HTMLVideoElement | null>(null);
  const islandStreamRef = useRef<MediaStream | null>(null);

  // Click & Double-click timer
  const clickTimerRef = useRef<any>(null);

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

  // Update current screen in agency service
  useEffect(() => {
    agencyService.setApp(currentScreen);
    setScreenAnalysis(null);
  }, [currentScreen]);

  // Clean camera stream when unmounted or closed
  useEffect(() => {
    if (!isExpanded || activeTab !== 'camera') {
      if (islandStreamRef.current) {
        islandStreamRef.current.getTracks().forEach((t) => t.stop());
        islandStreamRef.current = null;
      }
      setCameraStreamActive(false);
    }
  }, [isExpanded, activeTab]);

  // Handle Pill Clicks (1 Tap = Expand / Controls, 2 Taps = Multimodal AI Assistant)
  const handlePillClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      // Double tap triggered!
      sounds.playSuccess();
      setIsExpanded(true);
      setActiveTab('quick');
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([20, 40, 20]);
      }
      if (ageTier === 'toddler') {
        voiceService.speakFeedback('¡Hola! Soy tu Isla Dinámica Zentry. ¿Qué exploramos?');
      }
      return;
    }

    clickTimerRef.current = setTimeout(() => {
      clickTimerRef.current = null;
      sounds.playTap();
      setIsExpanded((prev) => !prev);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(15);
      }
    }, 240);
  };

  // Launch direct camera stream
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
      console.warn('Island camera stream error:', e);
      setCameraAiInsight('No se pudo acceder a la cámara. Abriendo la app de Cámara...');
      setTimeout(() => {
        setIsExpanded(false);
        onNavigate('camera');
      }, 900);
    }
  };

  // Capture photo in island and analyze with Multimodal Gemini
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
Analiza la imagen que el niño acaba de enfocar en el mundo real. Explícale qué es de forma divertida, cálida y socrática en 2 oraciones breves.`;
      const response = await askZentryAi('camera_vision', prompt, base64);
      sounds.playSuccess();
      try {
        const parsed = JSON.parse(response.trim().replace(/^```json/, '').replace(/```$/, ''));
        const text = parsed.observation ? `${parsed.title}: ${parsed.observation} ${parsed.step || ''}` : response;
        setCameraAiInsight(text);
        voiceService.speakFeedback(text);
      } catch {
        setCameraAiInsight(response);
        voiceService.speakFeedback(response);
      }
    } catch (err) {
      setCameraAiInsight('¡Veo algo fascinante! Exploremos más en el estudio creativo.');
    } finally {
      setIsProcessingAi(false);
    }
  };

  // Screen analysis helper (Multimodal system awareness)
  const handleAnalyzeScreen = async () => {
    sounds.playTap();
    setIsProcessingAi(true);
    try {
      const screenNames: Record<ScreenId, string> = {
        launcher: 'Pantalla de Inicio con widgets y microapps',
        ai: 'Tutor Socrático Zentry AI',
        creation: 'Centro de Creación y Estudio',
        tutor_hub: 'Centro de Tutoría y Asistencia',
        safe_search: 'Buscador de Conocimiento Seguro',
        calculator: 'Calculadora Matemática',
        camera: 'Cámara Multimodal con Visión Artificial',
        reloj: 'Reloj Circadiano y Alarmas',
        calendar: 'Calendario Escolar',
        files: 'Bóveda de Archivos y Tareas',
        phone: 'Teléfono y Contactos Seguros',
        settings: 'Ajustes del Sistema y Fondos',
        neuro_art: 'Lienzo de Dibujo NeuroArt',
        world_generator: 'Generador de Mundos y Misiones',
        characters: 'Taller de Personajes y Avatares Mágicos',
        free_canvas: 'Lienzo de Dibujo Libre y Expresión Artística',
        real_missions: 'Misiones Reales y Retos de Movimiento Físico',
        monsters: 'Monstruos Amigables y Expresión de Emociones',
        study_assistant: 'Asistente de Estudio Escolar',
        deep_research: 'Investigador de Curiosidades Científicas',
        redactor: 'Redactor Creativo de Cuentos y Ensayos',
        workspace_app: 'Aplicación Escolar en Pantalla',
        entertainment_hub: 'Hub de Medios Curados Zentry',
        zentry_tube: 'ZentryTube con 50 videos educativos STEM',
        zentry_tok: 'ZentryTok con microcápsulas científicas',
        zentry_gram: 'ZentryGram con fotografías de ciencia y naturaleza',
        zentry_stream: 'ZentryStream con directos educativos'
      };

      const currentDesc = screenNames[currentScreen] || currentScreen;
      const prompt = `El estudiante está actualmente en la pantalla "${currentDesc}".
Si está viendo un video o juego, o en una app escolar, dale una recomendación o pista socrática de 1 o 2 frases motivadoras y amigables en español.`;

      const res = await askZentryAi('general_ai', prompt);
      sounds.playSuccess();
      setScreenAnalysis(res);
      voiceService.speakFeedback(res);
    } catch {
      setScreenAnalysis('Estoy observando tu pantalla. ¡Estás haciendo un gran trabajo explorando ZentryOS!');
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

  // Select voice persona and play sample greeting
  const handleSelectVoicePersona = (personaId: VoicePersona) => {
    sounds.playTap();
    setSelectedPersona(personaId);
    voiceService.setPersona(personaId);

    const greetings: Record<VoicePersona, string> = {
      female_jovial: '¡Hola! Soy Sofía. ¡Qué emoción tenerte aquí, vamos a explorar y jugar juntos!',
      female_adult: 'Hola. Soy Elena. Estoy aquí para acompañarte, cuidarte y guiarte con serenidad.',
      male_jovial: '¡Ey! Soy Lucas. ¿Preparado para construir ideas geniales y superar retos hoy?',
      male_adult: 'Buenas tardes. Soy Carlos. Cuenta conmigo para proteger tu progreso y tomar las mejores decisiones.',
      socratic_mentor: 'Bienvenido. Soy el Maestro Aurelius. Cada pregunta que formules abre una nueva puerta al conocimiento.',
      zentry_jovial: '¡Hola! Soy Sofía. ¡Qué emoción tenerte aquí, vamos a explorar y jugar juntos!',
      toddler_sweet: '¡Hola! Soy Sofía. ¡Qué emoción tenerte aquí, vamos a explorar y jugar juntos!',
      companion_spark: '¡Ey! Soy Lucas. ¿Preparado para construir ideas geniales y superar retos hoy?'
    };

    const phrase = greetings[personaId] || 'Voz seleccionada.';
    voiceService.speakFeedback(phrase, { personaId });
  };

  // Execute Voice Query inside Island
  const handleExecuteVoiceQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsProcessingAi(true);
    setVoiceResponse(null);
    try {
      const res = await askZentryAi(
        'general_ai',
        `Responde a esta pregunta de un niño (${ageTier === 'toddler' ? '2 a 5 años' : '5 a 10+ años'}): "${queryText}". Máximo 2 oraciones, de forma socrática, cariñosa y clara.`
      );
      sounds.playSuccess();
      setVoiceResponse(res);
      voiceService.speakFeedback(res);
      agencyService.addMemoryLog('user_voice', `Pregunta de voz: "${queryText}" -> Respuesta: "${res}"`);
    } catch {
      setVoiceResponse('Estoy aquí para ayudarte. ¿Quieres que abramos el Tutor Zentry AI?');
    } finally {
      setIsProcessingAi(false);
    }
  };

  // Get Media icon
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
    <>
      {/* 1. LIQUID GLASS DYNAMIC ISLAND PILL (Rendered centrally in ZentryStatusBar) */}
      <div
        onClick={handlePillClick}
        className={
          'relative z-30 flex items-center justify-between gap-2.5 px-3.5 py-1.5 rounded-full cursor-pointer select-none transition-all duration-300 shadow-md backdrop-blur-xl border ' +
          (isExpanded
            ? 'bg-slate-950/95 text-white border-purple-400/80 ring-2 ring-purple-500/50 scale-105 min-w-[140px] '
            : activeMedia && activeMedia.isPlaying
            ? 'bg-black/90 text-white border-red-500/60 hover:border-red-400 min-w-[140px] max-w-[210px] '
            : agencyState.currentIntervention
            ? 'bg-gradient-to-r from-purple-900/90 to-indigo-900/90 text-white border-amber-400/80 animate-pulse min-w-[140px] '
            : /* Default Idle Liquid Glass representation with ZENTRY branding */
              'bg-gradient-to-r from-[#C8B6FF]/30 via-[#E0C3FC]/25 to-[#B3E5FC]/30 hover:from-[#C8B6FF]/45 hover:to-[#B3E5FC]/45 text-white border-white/60 shadow-[0_4px_16px_rgba(200,182,255,0.35)] min-w-[130px] max-w-[160px] ')
        }
        title="Isla Dinámica Zentry • Toca para expandir o 2 clics para Asistencia Multimodal"
      >
        {/* CASE A: Active Background Media */}
        {activeMedia && activeMedia.isPlaying ? (
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              {getMediaIcon()}
              <span className="text-[10px] font-bold text-slate-100 truncate max-w-[80px]">
                {activeMedia.title}
              </span>
            </div>

            {/* Animated Equalizer Wave Bars */}
            <div className="flex items-center gap-0.5 shrink-0">
              <span className="w-0.5 h-3 bg-red-400 rounded-full animate-bounce [animation-delay:0s]" />
              <span className="w-0.5 h-4 bg-purple-400 rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-0.5 h-2.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.3s]" />
            </div>
          </div>
        ) : agencyState.currentIntervention ? (
          /* CASE B: Attention Governance Creative Intervention Alert */
          <div className="flex items-center gap-1.5 w-full justify-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin shrink-0" />
            <span className="text-[10px] font-black text-amber-200 truncate">
              {ageTier === 'toddler' ? '¡Hora de Crear! 🎨' : 'Reto Práctico 🚀'}
            </span>
          </div>
        ) : (
          /* CASE C: Default ZENTRY Liquid Glass Pill (Solo texto ZENTRY con destello) */
          <div className="flex items-center justify-center w-full gap-2 py-0.5">
            <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-amber-300 shadow-sm shrink-0">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <span className="text-xs font-black tracking-widest text-white drop-shadow-md uppercase">
              ZENTRY
            </span>
          </div>
        )}
      </div>

      {/* 2. EXPANDED DYNAMIC ISLAND MODAL (Rich Floating Command Center) */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-start pt-3 px-3 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              sounds.playTap();
              setIsExpanded(false);
            }
          }}
        >
          <div
            className={
              (isDark ? 'zentry-glass-dark text-white ' : 'zentry-glass-light text-[#1E293B] ') +
              'w-full max-w-lg rounded-[32px] p-4 shadow-2xl space-y-3.5 border border-purple-400/40 animate-in slide-in-from-top-4 duration-300 overflow-hidden relative'
            }
          >
            {/* Top Bar with Mode & Close */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
                    <span>Isla Dinámica Zentry</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-[9px] text-purple-300 font-bold border border-purple-500/30">
                      {ageTier === 'toddler' ? '2-5 Años' : '5-10+ Años'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Gobernanza de Atención & Multimodalidad Activa
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playTap();
                  setIsExpanded(false);
                }}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                title="Cerrar Isla Dinámica"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Navigation Tabs inside Island */}
            <div className="grid grid-cols-4 gap-1.5">
              {/* Botón 1: Multimodalidad & Acciones */}
              <button
                onClick={() => {
                  sounds.playTap();
                  setActiveTab('quick');
                }}
                className={
                  (activeTab === 'quick'
                    ? 'bg-purple-600 text-white shadow-md font-bold '
                    : 'bg-white/10 text-slate-300 hover:text-white ') +
                  'py-2 px-1 rounded-2xl text-[11px] flex flex-col items-center gap-1 cursor-pointer transition-all zentry-press'
                }
              >
                <Bot className="w-4 h-4" />
                <span>Acciones</span>
              </button>

              {/* Botón 2: Cámara Multimodal Directa */}
              <button
                onClick={handleStartIslandCamera}
                className={
                  (activeTab === 'camera'
                    ? 'bg-purple-600 text-white shadow-md font-bold '
                    : 'bg-white/10 text-slate-300 hover:text-white ') +
                  'py-2 px-1 rounded-2xl text-[11px] flex flex-col items-center gap-1 cursor-pointer transition-all zentry-press'
                }
              >
                <Camera className="w-4 h-4 text-amber-300" />
                <span>Ver Mundo</span>
              </button>

              {/* Botón 3: Audio & Selección de Voz */}
              <button
                onClick={() => {
                  sounds.playTap();
                  setActiveTab('voice');
                  setSelectedPersona(voiceService.getPersona());
                }}
                className={
                  (activeTab === 'voice'
                    ? 'bg-purple-600 text-white shadow-md font-bold '
                    : 'bg-white/10 text-slate-300 hover:text-white ') +
                  'py-2 px-1 rounded-2xl text-[11px] flex flex-col items-center gap-1 cursor-pointer transition-all zentry-press'
                }
              >
                <Volume2 className="w-4 h-4 text-sky-400" />
                <span>Audio / Voz</span>
              </button>

              {/* Botón 4: Memoria & Bitácora de Agencia */}
              <button
                onClick={() => {
                  sounds.playTap();
                  setActiveTab('memory');
                }}
                className={
                  (activeTab === 'memory'
                    ? 'bg-purple-600 text-white shadow-md font-bold '
                    : 'bg-white/10 text-slate-300 hover:text-white ') +
                  'py-2 px-1 rounded-2xl text-[11px] flex flex-col items-center gap-1 cursor-pointer transition-all zentry-press'
                }
              >
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Memoria</span>
              </button>
            </div>

            {/* TAB CONTENT 1: ACCIONES & AGENCIA (TUTOR PROACTIVO) */}
            {activeTab === 'quick' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                {/* Active Background Media Player Card (If Playing) */}
                {activeMedia && (
                  <div className="p-3.5 rounded-[22px] bg-gradient-to-r from-slate-900/90 to-purple-950/90 border border-purple-400/40 space-y-2 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getMediaIcon()}
                        <span className="text-xs font-bold text-white truncate max-w-[190px]">
                          {activeMedia.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-300 font-mono">
                        {activeMedia.creator}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => {
                          sounds.playTap();
                          mediaPlaybackService.togglePlayPause();
                        }}
                        className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer zentry-press"
                      >
                        {activeMedia.isPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-white" />
                            <span>Pausar</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Reanudar</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          sounds.playTap();
                          setIsExpanded(false);
                          onNavigate(activeMedia.sourceScreen);
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer zentry-press shadow-md"
                      >
                        <span>Volver a la App</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Proactive Attention Governance Card */}
                <div className="p-3.5 rounded-[22px] bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-500/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      <span>Agencia de Atención Activa</span>
                    </div>

                    <button
                      onClick={() => {
                        sounds.playTap();
                        agencyService.toggleAgency();
                      }}
                      className={
                        (agencyState.isActive
                          ? 'bg-emerald-500 text-white '
                          : 'bg-white/10 text-slate-400 ') +
                        'px-2.5 py-0.5 rounded-full text-[10px] font-black transition-all cursor-pointer'
                      }
                    >
                      {agencyState.isActive ? 'ACTIVADA' : 'PAUSADA'}
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-300 leading-snug">
                    {agencyState.isActive
                      ? 'ZentryOS observa tus momentos de consumo y te propondrá retos del mundo real (dibujar, modelar o construir) tras ver videos.'
                      : 'La agencia está en pausa. Actívala para recibir guía interactiva y retos prácticos.'}
                  </div>

                  {/* Pending or Active Creative Intervention */}
                  {agencyState.currentIntervention ? (
                    <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 space-y-2 animate-in zoom-in-95">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-200">
                          {agencyState.currentIntervention.title}
                        </span>
                        <span className="text-[9px] text-amber-300 font-mono">
                          {agencyState.currentIntervention.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-white font-medium leading-tight">
                        {agencyState.currentIntervention.explanation}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => {
                            sounds.playSuccess();
                            const target = agencyState.currentIntervention?.targetScreen || 'neuro_art';
                            setIsExpanded(false);
                            onNavigate(target);
                          }}
                          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer zentry-press"
                        >
                          <Palette className="w-4 h-4" />
                          <span>{agencyState.currentIntervention.actionButtonLabel}</span>
                        </button>
                        <button
                          onClick={() => {
                            sounds.playTap();
                            agencyService.clearIntervention();
                          }}
                          className="p-2 rounded-xl bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                          title="Descartar reto"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">
                        {activeMedia
                          ? `Viendo contenido (${Math.round(agencyState.elapsedSecondsOnMedia)}s)`
                          : 'Listo para transformar consumo en creación'}
                      </span>
                      <button
                        onClick={handleTriggerIntervention}
                        disabled={isProcessingAi}
                        className="px-3 py-1.5 rounded-full bg-indigo-600/80 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer zentry-press disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>{isProcessingAi ? 'Pensando...' : 'Proponer Reto Real'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Multimodal Screen Awareness Button */}
                <div className="p-3 rounded-[22px] bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Eye className="w-4 h-4 text-cyan-400" />
                      <span>Visión de Pantalla Activa</span>
                    </div>
                    <button
                      onClick={handleAnalyzeScreen}
                      disabled={isProcessingAi}
                      className="px-3 py-1 rounded-full bg-cyan-600/80 hover:bg-cyan-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer zentry-press disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{isProcessingAi ? 'Analizando...' : '¿Qué hay en pantalla?'}</span>
                    </button>
                  </div>

                  {screenAnalysis && (
                    <div className="text-xs text-cyan-200 bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-500/30 leading-snug animate-in fade-in">
                      💡 {screenAnalysis}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: CÁMARA MULTIMODAL DIRECTA */}
            {activeTab === 'camera' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="relative aspect-video w-full rounded-[24px] overflow-hidden bg-black flex items-center justify-center border border-white/20 shadow-lg">
                  {cameraCapturedImg ? (
                    <img src={cameraCapturedImg} alt="Captura" className="w-full h-full object-cover" />
                  ) : (
                    <video
                      ref={islandVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  )}

                  {!cameraStreamActive && !cameraCapturedImg && (
                    <div className="p-4 text-center text-xs text-slate-300">
                      Iniciando visor rápido de cámara...
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleCaptureAndAsk}
                    disabled={isProcessingAi}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white text-xs font-extrabold shadow-lg flex items-center gap-2 cursor-pointer zentry-press disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{isProcessingAi ? 'Examinando con Gemini...' : 'Capturar y Preguntar a la IA'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsExpanded(false);
                      onNavigate('camera');
                    }}
                    className="px-3.5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="Abrir pantalla completa de cámara"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>

                {cameraAiInsight && (
                  <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-400/40 text-xs text-purple-200 leading-snug animate-in fade-in">
                    🎯 {cameraAiInsight}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 3: AUDIO & SELECCIÓN DE VOZ NEURONAL */}
            {activeTab === 'voice' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                {/* 1. Selector de Personalidad Vocal (5 Voces Hiperrealistas) */}
                <div className="p-3.5 rounded-[22px] bg-white/5 border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Volume2 className="w-4 h-4 text-purple-400" />
                      <span>Elegir Voz de Zentry</span>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                      5 Voces HD
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-tight">
                    Toca una voz para activarla y escuchar una muestra al instante:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {(['female_jovial', 'female_adult', 'male_jovial', 'male_adult', 'socratic_mentor'] as VoicePersona[]).map((pKey) => {
                      const persona = VOICE_PERSONAS[pKey];
                      const isSelected = selectedPersona === pKey || (pKey === 'female_jovial' && selectedPersona === 'zentry_jovial');
                      return (
                        <button
                          key={pKey}
                          onClick={() => handleSelectVoicePersona(pKey)}
                          className={
                            'p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 zentry-press ' +
                            (isSelected
                              ? 'bg-purple-600/30 border-purple-400 shadow-md ring-1 ring-purple-400/50'
                              : 'bg-white/5 border-white/10 hover:bg-white/10')
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                              {pKey === 'female_jovial' && <Sparkles className="w-3.5 h-3.5 text-pink-400" />}
                              {pKey === 'female_adult' && <GraduationCap className="w-3.5 h-3.5 text-purple-400" />}
                              {pKey === 'male_jovial' && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                              {pKey === 'male_adult' && <Volume2 className="w-3.5 h-3.5 text-blue-400" />}
                              {pKey === 'socratic_mentor' && <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
                              <span className="truncate">{persona.name.split(' (')[0]}</span>
                            </div>
                            {isSelected ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                            ) : (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-slate-400">
                                {persona.gender === 'FEMALE' ? 'Fem' : 'Masc'}
                              </span>
                            )}
                          </div>
                          <div className="text-[9px] text-slate-300 line-clamp-1">
                            {persona.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Preguntas por Voz & Chat Socrático */}
                <div className="p-3.5 rounded-[22px] bg-white/5 border border-white/10 space-y-2">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Mic className="w-4 h-4 text-sky-400" />
                    <span>Pregúntale lo que quieras a Zentry AI</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={voiceQuery}
                      onChange={(e) => setVoiceQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleExecuteVoiceQuery(voiceQuery)}
                      placeholder={ageTier === 'toddler' ? '¿Por qué brilla el sol?...' : '¿Cómo se forman los agujeros negros?...'}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-white/10 text-xs font-medium text-white placeholder-slate-400 border border-white/15 focus:outline-none focus:border-purple-400"
                    />
                    <button
                      onClick={() => handleExecuteVoiceQuery(voiceQuery)}
                      disabled={isProcessingAi || !voiceQuery.trim()}
                      className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer disabled:opacity-40 zentry-press"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {voiceResponse && (
                  <div className="p-3.5 rounded-[22px] bg-indigo-950/60 border border-indigo-400/40 text-xs text-indigo-200 space-y-1.5 animate-in fade-in">
                    <div className="font-bold text-white flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Respuesta Socrática:</span>
                      </div>
                      <button
                        onClick={() => voiceService.speakFeedback(voiceResponse)}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-200 flex items-center gap-1 cursor-pointer"
                        title="Repetir audio"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Escuchar</span>
                      </button>
                    </div>
                    <p className="leading-relaxed">{voiceResponse}</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 4: BITÁCORA Y MEMORIA DE SESIÓN */}
            {activeTab === 'memory' && (
              <div className="space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Memoria Viva de la Sesión</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {agencyState.memoryLogs.length} eventos
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                  {agencyState.memoryLogs.slice().reverse().map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span
                          className={
                            log.type === 'recommendation'
                              ? 'text-amber-300 font-bold'
                              : log.type === 'user_voice'
                              ? 'text-sky-300 font-bold'
                              : 'text-indigo-300'
                          }
                        >
                          {log.type.toUpperCase()}
                        </span>
                        <span>{log.timestamp}</span>
                      </div>
                      <p className="text-slate-200 leading-snug">{log.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
