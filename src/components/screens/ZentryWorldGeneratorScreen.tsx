import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Sparkles,
  Camera,
  Volume2,
  VolumeX,
  CheckCircle2,
  Trophy,
  ArrowLeft,
  RefreshCw,
  Compass,
  Shield,
  Star,
  MapPin,
  Play,
  RotateCcw,
  Check,
  ChevronRight,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

interface MissionStep {
  id: number;
  type: 'build' | 'search' | 'action';
  typeLabel: string;
  typeIcon: string;
  title: string;
  description: string;
  audioSpeech: string;
  hint: string;
}

interface AdventureWorld {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  themeColor: string;
  gradient: string;
  storyIntro: string;
  steps: MissionStep[];
}

const ADVENTURE_WORLDS: AdventureWorld[] = [
  {
    id: 'space_station',
    title: 'Estación Espacial Orión',
    subtitle: 'Misión a las Lunas de Cristal',
    icon: '🚀',
    themeColor: '#3B82F6',
    gradient: 'from-blue-600 via-indigo-700 to-slate-900',
    storyIntro: '¡Atención, cadete espacial! El radar de Zentry ha detectado una lluvia de meteoritos brillantes cerca de la estación. Necesitamos tu ayuda para construir tu nave y explorar la órbita.',
    steps: [
      {
        id: 1,
        type: 'build',
        typeLabel: 'Construcción',
        typeIcon: '🧱',
        title: 'Arma tu Módulo Espacial',
        description: 'Usa 2 cojines o una caja de cartón para crear tu cabina de mando. Dibuja o coloca un botón de encendido.',
        audioSpeech: '¡Misión de construcción! Busca dos cojines o una caja para armar tu cabina de mando espacial.',
        hint: 'Puedes usar una toalla como capa espacial.'
      },
      {
        id: 2,
        type: 'search',
        typeLabel: 'Búsqueda',
        typeIcon: '🔍',
        title: 'Recolecta Cristales de Energía',
        description: 'Busca 2 objetos brillantes o de color azul en tu casa que servirán como baterías de propulsión.',
        audioSpeech: '¡Misión de búsqueda! Encuentra dos objetos azules o brillantes en tu casa para alimentar tu nave.',
        hint: 'Revisa en tu habitación o sala.'
      },
      {
        id: 3,
        type: 'action',
        typeLabel: 'Acción',
        typeIcon: '⚡',
        title: 'Despegue en Gravedad Cero',
        description: 'Párate en tu cabina y da 5 saltos en cámara lenta flotando como astronauta en el espacio.',
        audioSpeech: '¡Misión de acción! Da cinco saltos en cámara lenta como si estuvieras flotando en el espacio exterior.',
        hint: '¡Mantén los brazos abiertos para flotar!'
      }
    ]
  },
  {
    id: 'pirate_island',
    title: 'Isla del Tesoro Olvidado',
    subtitle: 'Navegación por Mares Misteriosos',
    icon: '🏴‍☠️',
    themeColor: '#F59E0B',
    gradient: 'from-amber-600 via-orange-700 to-red-900',
    storyIntro: '¡Ah del barco, marinero! El mapa antiguo muestra que el gran cofre de las monedas de oro está escondido en tu archipiélago.',
    steps: [
      {
        id: 1,
        type: 'build',
        typeLabel: 'Construcción',
        typeIcon: '🧱',
        title: 'Arma tu Navío Explorador',
        description: 'Coloca una alfombra o almohadón en el piso que será la cubierta de tu barco pirata.',
        audioSpeech: '¡Misión de construcción! Coloca un cojín en el suelo para armar tu barco pirata.',
        hint: 'Usa un palo o regla como mástil imaginario.'
      },
      {
        id: 2,
        type: 'search',
        typeLabel: 'Búsqueda',
        typeIcon: '🔍',
        title: 'Encuentra la Llave Dorada',
        description: 'Busca un objeto de color amarillo o metálico en tu casa que abrirá el gran cofre.',
        audioSpeech: '¡Misión de búsqueda! Encuentra un objeto amarillo o metálico en tu casa que será tu llave.',
        hint: 'Puede ser un juguete, una cuchara o una moneda grande.'
      },
      {
        id: 3,
        type: 'action',
        typeLabel: 'Acción',
        typeIcon: '⚡',
        title: 'Alerta de Tormenta Marina',
        description: 'Camina sobre una línea imaginaria manteniendo el equilibrio mientras la marea se mueve.',
        audioSpeech: '¡Misión de acción! Camina en puntitas de pie sobre una línea recta imaginaria sin caerte al mar.',
        hint: 'Abre los brazos para no perder el equilibrio.'
      }
    ]
  },
  {
    id: 'dino_valley',
    title: 'Valle de los Dinosaurios',
    subtitle: 'Rastreo en la Jungla Prehistórica',
    icon: '🦖',
    themeColor: '#10B981',
    gradient: 'from-emerald-600 via-teal-700 to-green-950',
    storyIntro: '¡Científico explorador! Hemos encontrado huellas gigantes en la selva. Vamos a investigar qué criatura amable habita en este valle.',
    steps: [
      {
        id: 1,
        type: 'build',
        typeLabel: 'Construcción',
        typeIcon: '🧱',
        title: 'Crea tu Refugio en la Selva',
        description: 'Crea una cueva o tienda de expedición con una sábana o chaqueta sobre una silla.',
        audioSpeech: '¡Misión de construcción! Construye un refugio de expedición con una sábana o prenda sobre una silla.',
        hint: '¡Será tu campamento base!'
      },
      {
        id: 2,
        type: 'search',
        typeLabel: 'Búsqueda',
        typeIcon: '🔍',
        title: 'Muestras de Vegetación Fósil',
        description: 'Recolecta 2 hojas o ramitas pequeñas (o algo de color verde intenso) para analizar.',
        audioSpeech: '¡Misión de búsqueda! Busca dos objetos verdes o dos hojitas para analizar la comida de los dinosaurios.',
        hint: 'Una planta en casa o un juguete verde servirá.'
      },
      {
        id: 3,
        type: 'action',
        typeLabel: 'Acción',
        typeIcon: '⚡',
        title: 'Paso de Braquiosaurio',
        description: 'Da 5 pasos gigantes y pesados imitando los pasos de un enorme dinosaurio herbívoro.',
        audioSpeech: '¡Misión de acción! Da cinco pasos gigantes y pesados como un dinosaurio colosal.',
        hint: '¡Haz sonar el suelo con cada paso suave!'
      }
    ]
  },
  {
    id: 'crystal_castle',
    title: 'Reino del Cristal Mágico',
    subtitle: 'El Encantamiento del Palacio',
    icon: '🏰',
    themeColor: '#A855F7',
    gradient: 'from-purple-600 via-fuchsia-700 to-indigo-950',
    storyIntro: '¡Noble hechicero! Las campanas del reino anuncian que el cristal protector necesita recargarse de creatividad y sonrisas.',
    steps: [
      {
        id: 1,
        type: 'build',
        typeLabel: 'Construcción',
        typeIcon: '🧱',
        title: 'Forja tu Varita de Cristal',
        description: 'Toma un lápiz, marcador o palito y decóralo con una cinta o papel como varita encantada.',
        audioSpeech: '¡Misión de construcción! Toma un lápiz o varita que será tu instrumento mágico.',
        hint: 'Puedes atarle una cinta o ponerle una estrellita.'
      },
      {
        id: 2,
        type: 'search',
        typeLabel: 'Búsqueda',
        typeIcon: '🔍',
        title: 'Poción de Flores Mágicas',
        description: 'Encuentra un objeto de color morado o rosa que representará el rocío de flores encantadas.',
        audioSpeech: '¡Misión de búsqueda! Encuentra un objeto rosa o morado en tu casa para preparar el hechizo.',
        hint: 'Cualquier prenda o juguete de ese color sirve.'
      },
      {
        id: 3,
        type: 'action',
        typeLabel: 'Acción',
        typeIcon: '⚡',
        title: 'Giro del Hechizo Protector',
        description: 'Apunta con tu varita, da 2 vueltas mágicas en tu lugar y pronuncia tu palabra mágica favorita.',
        audioSpeech: '¡Misión de acción! Da dos vueltas con tu varita y lanza tu hechizo de luz protectora.',
        hint: '¡Di una palabra mágica bien fuerte!'
      }
    ]
  }
];

export const ZentryWorldGeneratorScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [selectedWorld, setSelectedWorld] = useState<AdventureWorld | null>(null);
  const [completedStepIds, setCompletedStepIds] = useState<number[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  // Escáner Phygital de Cámara
  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<Record<number, string>>({});

  // Síntesis de Voz
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Trofeos y Logros guardados
  const [trophies, setTrophies] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zentry_world_trophies');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.94;
      utterance.pitch = 1.15;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopVoice = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Seleccionar Mundo
  const handleSelectWorld = (world: AdventureWorld) => {
    if (navigator.vibrate) navigator.vibrate(10);
    sounds.playAppOpen();
    setSelectedWorld(world);
    setCompletedStepIds([]);
    setActiveStepIndex(0);
    speak(`${world.title}. ${world.storyIntro}`);
  };

  // Cámara Phygital
  const handleOpenScanner = async (stepId: number) => {
    setIsScanningCamera(true);
    try {
      if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      speak('Enfoca tu creación física en el centro del escáner.');
    } catch (e) {
      console.warn('Camera error in world generator:', e);
    }
  };

  const handleCaptureValidation = () => {
    if (!videoRef.current) return;
    sounds.playTap();
    setIsAnalyzingPhoto(true);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      const activeStep = selectedWorld?.steps[activeStepIndex];
      if (activeStep) {
        setCapturedPhotos((prev) => ({ ...prev, [activeStep.id]: dataUrl }));
      }
    }

    setTimeout(() => {
      setIsAnalyzingPhoto(false);
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
        setCameraStream(null);
      }
      setIsScanningCamera(false);

      const currentStep = selectedWorld?.steps[activeStepIndex];
      if (currentStep) {
        toggleStepComplete(currentStep.id);
      }
      speak('¡Artefacto analizado con éxito por Zentry! ¡Misión completada!');
    }, 1400);
  };

  // Completar Paso
  const toggleStepComplete = (stepId: number) => {
    if (navigator.vibrate) navigator.vibrate(12);
    sounds.playSuccess();

    setCompletedStepIds((prev) => {
      const isAlready = prev.includes(stepId);
      const next = isAlready ? prev.filter((id) => id !== stepId) : [...prev, stepId];

      if (selectedWorld && next.length === selectedWorld.steps.length) {
        // Gran Victoria
        setTimeout(() => {
          handleWorldCompleted();
        }, 500);
      }
      return next;
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleWorldCompleted = () => {
    sounds.playSuccess();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 }
    });

    if (selectedWorld) {
      const updatedTrophies = [selectedWorld.icon, ...trophies.slice(0, 15)];
      setTrophies(updatedTrophies);
      localStorage.setItem('zentry_world_trophies', JSON.stringify(updatedTrophies));
      speak(`¡Felicitaciones Comandante! Has completado todas las misiones de ${selectedWorld.title}. ¡Has ganado un nuevo trofeo de exploración!`);
    }
  };

  useEffect(() => {
    return () => {
      stopVoice();
      if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
    };
  }, [cameraStream]);

  return (
    <ZentrySubPageScaffold
      title="Generador de Mundos"
      kicker="AVENTURAS Y MISIONES PHYGITAL"
      onBack={() => {
        stopVoice();
        if (selectedWorld) {
          setSelectedWorld(null);
        } else {
          onBack();
        }
      }}
      isDark={isDark}
    >
      {/* ========================================================= */}
      {/* 1. SELECTOR DE UNIVERSOS TEMÁTICOS                        */}
      {/* ========================================================= */}
      {!selectedWorld && (
        <div className="w-full h-full flex flex-col justify-between p-2 md:p-4 space-y-4 overflow-y-auto no-scrollbar">
          <div className="text-center space-y-1">
            <h2 className="text-base md:text-lg font-black tracking-tight text-slate-800 dark:text-white">
              Elige tu Próxima Aventura
            </h2>
            <p className="text-xs text-slate-500 dark:text-white/60">
              Cumple retos reales en tu casa y viaja por mundos fantásticos
            </p>
          </div>

          {/* Tarjetas de Universos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-2xl mx-auto w-full flex-1">
            {ADVENTURE_WORLDS.map((w) => (
              <div
                key={w.id}
                onClick={() => handleSelectWorld(w)}
                className={`p-5 rounded-[32px] bg-gradient-to-br ${w.gradient} text-white shadow-xl border border-white/20 cursor-pointer active:scale-98 transition-all flex flex-col justify-between group hover:shadow-2xl`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-[22px] bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner">
                    {w.icon}
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-white/90">
                    3 Misiones
                  </span>
                </div>

                <div className="pt-4 space-y-1">
                  <h3 className="text-base font-black tracking-tight">{w.title}</h3>
                  <p className="text-xs text-white/80 line-clamp-2">{w.subtitle}</p>
                </div>

                <div className="pt-3 flex items-center justify-between text-xs font-bold text-white/90 border-t border-white/15 mt-3">
                  <span>Iniciar Aventura</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

          {/* Vitrina de Trofeos */}
          {trophies.length > 0 && (
            <div className="max-w-2xl mx-auto w-full rounded-[24px] p-3 bg-white/40 dark:bg-white/10 backdrop-blur-md border border-white/60 dark:border-white/10 flex items-center gap-3 overflow-x-auto no-scrollbar shadow-sm">
              <div className="flex items-center gap-1 text-xs font-black text-amber-500 flex-shrink-0">
                <Trophy className="w-4 h-4" />
                <span>Trofeos ({trophies.length})</span>
              </div>
              <div className="flex items-center gap-2">
                {trophies.map((tr, idx) => (
                  <span key={idx} className="text-2xl p-1 rounded-full bg-white/60 dark:bg-white/20 shadow-sm flex-shrink-0">
                    {tr}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. HOJA DE AVENTURA Y MISIONES EN CURSO                  */}
      {/* ========================================================= */}
      {selectedWorld && (
        <div className="w-full h-full flex flex-col justify-between p-2 md:p-4 space-y-3 overflow-y-auto no-scrollbar max-w-2xl mx-auto">
          {/* Encabezado del Mundo */}
          <div className="p-4 rounded-[28px] bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-slate-900/40 border border-white/20 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[18px] bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
                {selectedWorld.icon}
              </div>
              <div>
                <h3 className="text-sm md:text-base font-black text-white">{selectedWorld.title}</h3>
                <span className="text-xs text-purple-200">{selectedWorld.subtitle}</span>
              </div>
            </div>

            <button
              onClick={() => speak(`${selectedWorld.title}. ${selectedWorld.storyIntro}`)}
              className="p-2.5 rounded-full bg-white/20 text-white hover:bg-white/30 cursor-pointer active:scale-95"
              title="Escuchar Narración"
            >
              <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-bounce text-pink-300' : ''}`} />
            </button>
          </div>

          {/* Lista de 3 Misiones Phygital */}
          <div className="space-y-2.5 flex-1">
            {selectedWorld.steps.map((step, idx) => {
              const isCompleted = completedStepIds.includes(step.id);
              const photo = capturedPhotos[step.id];

              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-[28px] border transition-all shadow-md flex flex-col gap-2 ${
                    isCompleted
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-950 dark:text-emerald-200'
                      : 'bg-white/60 dark:bg-white/10 border-white/60 dark:border-white/15 text-slate-800 dark:text-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-2 rounded-[16px] bg-white/80 dark:bg-white/10 shadow-sm flex-shrink-0">
                        {step.typeIcon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-300">
                            Paso {idx + 1} · {step.typeLabel}
                          </span>
                        </div>
                        <h4 className="text-xs md:text-sm font-black">{step.title}</h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Botón de Audio */}
                      <button
                        onClick={() => speak(step.audioSpeech)}
                        className="p-2 rounded-full bg-purple-500/10 dark:bg-white/10 text-purple-600 dark:text-purple-300 cursor-pointer"
                        title="Escuchar Misión"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      {/* Botón de Escáner Cámara Phygital */}
                      <button
                        onClick={() => {
                          setActiveStepIndex(idx);
                          handleOpenScanner(step.id);
                        }}
                        className="p-2 rounded-full bg-blue-500 text-white shadow-sm cursor-pointer active:scale-95"
                        title="Fotografiar y Validar"
                      >
                        <Camera className="w-4 h-4" />
                      </button>

                      {/* Checkbox de Completado */}
                      <button
                        onClick={() => toggleStepComplete(step.id)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-400 text-white shadow-md'
                            : 'border-slate-300 dark:border-white/30 text-transparent'
                        }`}
                      >
                        <Check className="w-5 h-5 stroke-[3]" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed opacity-90 pl-11">
                    {step.description}
                  </p>

                  {/* Foto Validada */}
                  {photo && (
                    <div className="pl-11 pt-1 flex items-center gap-2">
                      <img src={photo} alt="Foto de misión" className="w-16 h-12 object-cover rounded-[12px] border border-emerald-400 shadow-sm" />
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Validado en el mundo real
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Barra de Rango de Explorador */}
          <div className="p-3.5 rounded-[24px] bg-white/40 dark:bg-white/10 backdrop-blur-md border border-white/60 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              <div>
                <span className="text-[10px] font-bold uppercase opacity-60 block">Progreso de la Aventura</span>
                <span className="text-xs font-black">
                  {completedStepIds.length} de {selectedWorld.steps.length} Misiones
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedWorld(null)}
              className="px-4 py-2 rounded-full bg-white/80 dark:bg-white/20 text-xs font-bold text-slate-800 dark:text-white cursor-pointer active:scale-95"
            >
              Cambiar Mundo
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. VISOR HUD DE ESCÁNER PHYGITAL (CÁMARA REAL)             */}
      {/* ========================================================= */}
      {isScanningCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 animate-in fade-in">
          <div className="flex items-center justify-between text-white px-2 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <h3 className="text-sm font-black">Escáner Phygital Zentry</h3>
            </div>
            <button
              onClick={() => {
                if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
                setIsScanningCamera(false);
              }}
              className="px-4 py-1.5 rounded-full bg-white/20 text-xs font-bold cursor-pointer"
            >
              Cerrar
            </button>
          </div>

          {/* Visor con HUD Holográfico */}
          <div className="relative flex-1 rounded-[32px] overflow-hidden my-3 border-2 border-cyan-400/60 shadow-2xl flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

            {/* Retícula de Enfoque Láser */}
            <div className="absolute w-[80%] h-[70%] border-2 border-dashed border-cyan-400 rounded-[28px] pointer-events-none flex flex-col items-center justify-between p-4">
              <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-cyan-300 text-[11px] font-bold">
                Enfoca tu creación física aquí
              </span>
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
              <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-[10px]">
                Lente Zentry Vision
              </span>
            </div>

            {isAnalyzingPhoto && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center text-white space-y-3">
                <Sparkles className="w-10 h-10 text-cyan-400 animate-spin" />
                <p className="text-xs font-black tracking-wide">Analizando artefacto en el mundo real...</p>
              </div>
            )}
          </div>

          {/* Botón Disparador */}
          <div className="flex items-center justify-center pb-4">
            <button
              onClick={handleCaptureValidation}
              disabled={isAnalyzingPhoto}
              className="w-20 h-20 rounded-full bg-white p-1.5 shadow-2xl flex items-center justify-center cursor-pointer active:scale-90"
            >
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                <Camera className="w-8 h-8" />
              </div>
            </button>
          </div>
        </div>
      )}
    </ZentrySubPageScaffold>
  );
};

export default ZentryWorldGeneratorScreen;
