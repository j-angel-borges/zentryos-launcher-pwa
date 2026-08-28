import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Volume2,
  Trophy,
  Dices,
  Check,
  Star,
  Shield,
  Zap,
  Heart,
  Flame,
  Wand2,
  Smile,
  Crown,
  ChevronRight,
  ChevronLeft,
  Camera,
  BookOpen,
  Play,
  RotateCcw,
  CheckCircle2,
  Eye,
  Shirt,
  Scissors
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { askZentryAi } from '../../services/aiService';
import { saveHeroToFirestore } from '../../services/firebase';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

// Opciones de Personalización de Avatar (Estilo Skin Builder)
const BODY_SKINS = [
  { id: 'light', color: '#FCD34D', name: 'Claro' },
  { id: 'tan', color: '#F59E0B', name: 'Trigueño' },
  { id: 'cocoa', color: '#B45309', name: 'Cacao' },
  { id: 'alien_blue', color: '#60A5FA', name: 'Celeste' },
  { id: 'fairy_pink', color: '#F472B6', name: 'Mágico' }
];

const HAIRSTYLES = [
  { id: 'spiky', icon: '⚡', name: 'Espinoso' },
  { id: 'curly', icon: '🌀', name: 'Rizado' },
  { id: 'braids', icon: '🎀', name: 'Coletas' },
  { id: 'smooth', icon: '✨', name: 'Liso' },
  { id: 'helmet', icon: '🪖', name: 'Casco' }
];

const EYE_EXPRESSIONS = [
  { id: 'heroic', icon: '👀', name: 'Valiente' },
  { id: 'star_eyes', icon: '🤩', name: 'Estrellas' },
  { id: 'wink', icon: '😉', name: 'Pícaro' },
  { id: 'happy', icon: '😊', name: 'Alegre' }
];

const HEADGEARS = [
  { id: 'none', icon: '✨', name: 'Sin Sombrero' },
  { id: 'crown', icon: '👑', name: 'Corona' },
  { id: 'space_visor', icon: '🚀', name: 'Visor Espacial' },
  { id: 'flowers', icon: '🌸', name: 'Flores' },
  { id: 'pirate', icon: '🏴‍☠️', name: 'Pirata' },
  { id: 'bunny', icon: '🐰', name: 'Orejas' }
];

const POWERS = [
  { id: 'lightning', name: 'Rayo de Luz', icon: '⚡', color: 'from-amber-400 to-yellow-500' },
  { id: 'shield', name: 'Escudo de Cristal', icon: '🛡️', color: 'from-blue-400 to-cyan-500' },
  { id: 'fire', name: 'Fuego Fénix', icon: '🔥', color: 'from-rose-500 to-orange-500' },
  { id: 'rainbow', name: 'Polvo de Arcoíris', icon: '🌈', color: 'from-pink-500 via-purple-500 to-cyan-400' },
  { id: 'wings', name: 'Alas Cósmicas', icon: '🪽', color: 'from-indigo-400 to-purple-600' },
  { id: 'heart', name: 'Abrazo de Energía', icon: '💖', color: 'from-pink-500 to-rose-600' }
];

const SUIT_COLORS = [
  { id: 'lavender', name: 'Lavanda', class: 'from-[#8B5CF6] via-[#D6C8FA] to-[#533B87]' },
  { id: 'aurora', name: 'Aurora', class: 'from-[#10B981] via-[#C2F4E7] to-[#047857]' },
  { id: 'sunset', name: 'Atardecer', class: 'from-[#EC4899] via-[#F59E0B] to-[#EF4444]' },
  { id: 'ocean', name: 'Océano', class: 'from-[#06B6D4] via-[#3B82F6] to-[#1E40AF]' }
];

const HERO_NAMES_PRESETS = [
  'Aura Spark', 'Cometa Ray', 'Capitán Cristal', 'Lúa Valiente', 'Nova Guardián', 'Zénit Estelar', 'Solarix'
];

interface ComicPanel {
  title: string;
  scene: string;
  dialogue: string;
}

interface RoomWorldData {
  worldName: string;
  roomTransformations: Array<{ realObject: string; magicalRole: string }>;
  voiceSpeech: string;
  firstPhysicalMission: string;
}

export const ZentryCharacterScreen: React.FC<Props> = ({ onBack, isDark }) => {
  // Flujo en Páginas: 'creator' | 'page1_image' | 'page2_comic' | 'page3_world'
  const [currentStepPage, setCurrentStepPage] = useState<'creator' | 'page1_image' | 'page2_comic' | 'page3_world'>('creator');

  // Configuración del Avatar
  const [bodySkin, setBodySkin] = useState(BODY_SKINS[0]);
  const [hairStyle, setHairStyle] = useState(HAIRSTYLES[0]);
  const [eyeExpression, setEyeExpression] = useState(EYE_EXPRESSIONS[0]);
  const [headgear, setHeadgear] = useState(HEADGEARS[0]);
  const [power, setPower] = useState(POWERS[0]);
  const [suitColor, setSuitColor] = useState(SUIT_COLORS[0]);
  const [heroName, setHeroName] = useState<string>('Nova Guardián');

  // Estados de IA y Generación en GCP
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [comicPanels, setComicPanels] = useState<ComicPanel[]>([]);
  const [heroGreetingSpeech, setHeroGreetingSpeech] = useState<string>('');
  const [playAtHomeIdea, setPlayAtHomeIdea] = useState<string>('');

  // Cámara para Generar Mundo de la Habitación
  const [isScanningRoom, setIsScanningRoom] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [capturedRoomPhoto, setCapturedRoomPhoto] = useState<string | null>(null);
  const [isTransformingRoom, setIsTransformingRoom] = useState(false);
  const [roomWorldResult, setRoomWorldResult] = useState<RoomWorldData | null>(null);

  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.94;
      utterance.pitch = 1.2;
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

  const handleRandomName = () => {
    sounds.playTap();
    const random = HERO_NAMES_PRESETS[Math.floor(Math.random() * HERO_NAMES_PRESETS.length)];
    setHeroName(random);
  };

  // ----------------------------------------------------------------
  // BOTÓN PRINCIPAL: CREAR UN SUPERHÉROE (GCP Vertex Backend)
  // ----------------------------------------------------------------
  const handleCreateSuperhero = async () => {
    if (navigator.vibrate) navigator.vibrate(15);
    sounds.playSuccess();
    setIsGeneratingStory(true);
    setCurrentStepPage('page1_image');

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    try {
      const heroPayload = {
        name: heroName,
        skin: bodySkin.name,
        hair: hairStyle.name,
        headgear: headgear.name,
        power: power.name,
        suit: suitColor.name
      };

      const raw = await askZentryAi(
        'character_comic_studio',
        `Configuración del superhéroe: ${JSON.stringify(heroPayload)}. Genera el cómic y la presentación.`
      );

      const parsed = JSON.parse(raw.trim().replace(/^```json/, '').replace(/```$/, ''));
      setHeroGreetingSpeech(parsed.heroGreetingSpeech || `¡Hola! Soy ${heroName}, el defensor del cristal mágico.`);
      setComicPanels(parsed.comicPanels || []);
      setPlayAtHomeIdea(parsed.playAtHomeIdea || '¡Ponte una capa imaginaria y da tres saltos por la sala!');

      // Persistir en Firestore (GCP)
      await saveHeroToFirestore({
        id: String(Date.now()),
        name: heroName,
        archetype: `${hairStyle.name} con ${power.name}`,
        comicStory: parsed.comicPanels?.map((p: any) => `${p.title}: ${p.scene}`).join(' | ')
      });

      speak(parsed.heroGreetingSpeech);
    } catch (error) {
      console.warn('Fallback character generation:', error);
      const fallbackGreeting = `¡Hola amigo! Soy ${heroName} y con mi ${power.name} protegeré el universo de la diversión.`;
      setHeroGreetingSpeech(fallbackGreeting);
      setComicPanels([
        { title: '1. El Despertar', scene: `${heroName} despierta con su traje brillante y su ${power.name}.`, dialogue: '¡Es hora de la aventura!' },
        { title: '2. El Gran Desafío', scene: `Aparece una sombra traviesa que quiere apagar los colores.`, dialogue: '¡Con mi poder de luz todo brillará!' },
        { title: '3. ¡Victoria Total!', scene: `Todos los amigos celebran con fuegos artificiales mágicos.`, dialogue: '¡El bien y la imaginación triunfan siempre!' }
      ]);
      setPlayAtHomeIdea('¡Ponte una capa imaginaria, toma una cuchara mágica y da tres saltos heroicos!');
      speak(fallbackGreeting);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // ----------------------------------------------------------------
  // CÁMARA PHYGITAL: GENERAR MUNDO EN LA HABITACIÓN
  // ----------------------------------------------------------------
  const handleStartRoomCamera = async () => {
    setIsScanningRoom(true);
    try {
      if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      speak('Apunta la cámara a tu sala o habitación para crear tu mundo de juego.');
    } catch (e) {
      console.warn('Camera room error:', e);
    }
  };

  const handleCaptureRoomPhoto = async () => {
    if (!videoRef.current) return;
    sounds.playTap();
    setIsTransformingRoom(true);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedRoomPhoto(dataUrl);

      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
        setCameraStream(null);
      }
      setIsScanningRoom(false);

      try {
        const raw = await askZentryAi(
          'room_world_generator',
          `El niño creó al superhéroe ${heroName}. Analiza la foto de su habitación y genera las transformaciones mágicas para jugar en casa.`,
          dataUrl
        );

        const parsed = JSON.parse(raw.trim().replace(/^```json/, '').replace(/```$/, ''));
        setRoomWorldResult(parsed);
        sounds.playSuccess();

        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.55 }
        });

        speak(parsed.voiceSpeech);
      } catch (e) {
        console.warn('Fallback room transformation:', e);
        const fallbackRoom: RoomWorldData = {
          worldName: 'La Base de los Héroes Espaciales',
          roomTransformations: [
            { realObject: 'El sofá o cama', magicalRole: 'La base de comando de tu nave' },
            { realObject: 'La alfombra del suelo', magicalRole: 'El lago de lava que no debes pisar' },
            { realObject: 'Los cojines y sillas', magicalRole: 'Islas flotantes de paso seguro' }
          ],
          voiceSpeech: `¡He convertido tu espacio en la Base de los Héroes! Tu sillón es el cuartel y la alfombra es lava mágica. ¡Salta en los cojines para avanzar!`,
          firstPhysicalMission: '¡Salta de un cojín a otro sin tocar el suelo para salvar tu juguete favorito!'
        };
        setRoomWorldResult(fallbackRoom);
        sounds.playSuccess();
        speak(fallbackRoom.voiceSpeech);
      } finally {
        setIsTransformingRoom(false);
      }
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
      title="Personajes"
      kicker="TALLER DE SUPERHÉROES Y CÓMICS"
      onBack={() => {
        stopVoice();
        if (currentStepPage !== 'creator') {
          setCurrentStepPage('creator');
        } else {
          onBack();
        }
      }}
      isDark={isDark}
    >
      <div className="w-full h-full flex flex-col justify-between p-2 md:p-4 space-y-3 overflow-y-auto no-scrollbar max-w-3xl mx-auto">
        {/* ========================================================= */}
        {/* PÁGINA 0: EDITOR & CREADOR DE SUPERHÉROES (SKIN BUILDER)  */}
        {/* ========================================================= */}
        {currentStepPage === 'creator' && (
          <>
            {/* Avatar Central en Vivo */}
            <div className="flex flex-col items-center justify-center p-4 rounded-[32px] bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-white/60 dark:border-white/15 shadow-xl relative overflow-hidden">
              <div
                style={{ backgroundColor: bodySkin.color }}
                className={`w-36 h-36 md:w-44 md:h-44 rounded-[40px] p-3 flex flex-col items-center justify-center shadow-2xl border-4 border-white dark:border-white/40 relative overflow-hidden transition-all`}
              >
                {/* Sombrero / Tocado */}
                {headgear.id !== 'none' && (
                  <span className="text-4xl md:text-5xl -mb-3 z-10 animate-bounce">
                    {headgear.icon}
                  </span>
                )}

                {/* Cara con Peinado y Ojos */}
                <div className="flex flex-col items-center select-none">
                  <span className="text-3xl">{hairStyle.icon}</span>
                  <span className="text-4xl -mt-1">{eyeExpression.icon}</span>
                </div>

                {/* Traje y Superpoder */}
                <div className={`absolute bottom-0 inset-x-0 h-10 bg-gradient-to-tr ${suitColor.class} flex items-center justify-center`}>
                  <span className="text-2xl animate-pulse">{power.icon}</span>
                </div>
              </div>

              {/* Nombre del Héroe */}
              <div className="pt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={heroName}
                  onChange={(e) => setHeroName(e.target.value)}
                  className="text-center font-black text-sm md:text-base bg-transparent border-b border-purple-400 focus:outline-none text-slate-800 dark:text-white px-2 py-0.5"
                />
                <button
                  onClick={handleRandomName}
                  className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-purple-600 dark:text-purple-300 cursor-pointer"
                  title="Nombre Aleatorio"
                >
                  <Dices className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Opciones Modulares del Skin Builder */}
            <div className="space-y-2.5 bg-white/30 dark:bg-white/5 p-3.5 rounded-[28px] border border-white/40 dark:border-white/10">
              {/* 1. Tono de Piel */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black text-slate-600 dark:text-white/70 uppercase">Piel</span>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {BODY_SKINS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setBodySkin(s)}
                      style={{ backgroundColor: s.color }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        bodySkin.id === s.id ? 'scale-125 border-purple-600 ring-2 ring-purple-300 shadow-md' : 'border-white'
                      }`}
                      title={s.name}
                    />
                  ))}
                </div>
              </div>

              {/* 2. Peinados */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black text-slate-600 dark:text-white/70 uppercase">Pelo</span>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {HAIRSTYLES.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setHairStyle(h)}
                      className={`p-1.5 rounded-[14px] text-lg border transition-all cursor-pointer ${
                        hairStyle.id === h.id ? 'bg-purple-600 text-white border-white scale-110 shadow-md' : 'bg-white/60 dark:bg-white/10'
                      }`}
                    >
                      {h.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Ojos & Expresiones */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black text-slate-600 dark:text-white/70 uppercase">Ojos</span>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {EYE_EXPRESSIONS.map((eye) => (
                    <button
                      key={eye.id}
                      onClick={() => setEyeExpression(eye)}
                      className={`p-1.5 rounded-[14px] text-lg border transition-all cursor-pointer ${
                        eyeExpression.id === eye.id ? 'bg-purple-600 text-white border-white scale-110 shadow-md' : 'bg-white/60 dark:bg-white/10'
                      }`}
                    >
                      {eye.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Tocados & Sombreros */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black text-slate-600 dark:text-white/70 uppercase">Sombrero</span>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {HEADGEARS.map((hg) => (
                    <button
                      key={hg.id}
                      onClick={() => setHeadgear(hg)}
                      className={`p-1.5 rounded-[14px] text-lg border transition-all cursor-pointer ${
                        headgear.id === hg.id ? 'bg-amber-400 text-white border-white scale-110 shadow-md' : 'bg-white/60 dark:bg-white/10'
                      }`}
                    >
                      {hg.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Superpoder */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black text-slate-600 dark:text-white/70 uppercase">Poder</span>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {POWERS.map((pow) => (
                    <button
                      key={pow.id}
                      onClick={() => setPower(pow)}
                      className={`px-2.5 py-1.5 rounded-[16px] flex items-center gap-1 text-xs font-black border transition-all cursor-pointer ${
                        power.id === pow.id ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-white scale-105 shadow-md' : 'bg-white/60 dark:bg-white/10'
                      }`}
                    >
                      <span>{pow.icon}</span>
                      <span className="hidden sm:inline">{pow.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* BOTÓN PRINCIPAL: CREAR UN SUPERHÉROE */}
            <button
              onClick={handleCreateSuperhero}
              className="w-full py-4 rounded-[28px] bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white font-black text-sm md:text-base shadow-xl shadow-purple-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
            >
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
              <span>Crear un Superhéroe ✨</span>
            </button>
          </>
        )}

        {/* ========================================================= */}
        {/* PÁGINA 1: IMAGEN Y PRESENTACIÓN DEL HÉROE EN ALTA CALIDAD  */}
        {/* ========================================================= */}
        {currentStepPage === 'page1_image' && (
          <div className="space-y-4 max-w-xl mx-auto w-full animate-in zoom-in-95 duration-200">
            {isGeneratingStory ? (
              <div className="py-16 text-center space-y-4 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center text-3xl shadow-2xl animate-spin">
                  <Wand2 className="w-10 h-10" />
                </div>
                <h3 className="text-base font-black text-slate-800 dark:text-white">Dando vida a {heroName}...</h3>
                <p className="text-xs text-purple-600 dark:text-purple-300">Zentry está escribiendo su cómic y preparando su voz mágica.</p>
              </div>
            ) : (
              <>
                <div className="p-6 rounded-[36px] bg-gradient-to-br from-purple-900/60 via-blue-900/50 to-slate-900/60 text-white shadow-2xl border border-white/20 text-center space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 block">
                    Página 1 de 3 · Concepto del Héroe
                  </span>

                  <div className="w-32 h-32 rounded-[32px] bg-gradient-to-tr from-purple-500 to-pink-500 mx-auto flex items-center justify-center shadow-xl border-4 border-white">
                    <span className="text-5xl">{headgear.icon !== '✨' ? headgear.icon : power.icon}</span>
                  </div>

                  <h3 className="text-xl font-black">{heroName}</h3>
                  <p className="text-xs text-purple-100 leading-relaxed font-medium">
                    "{heroGreetingSpeech}"
                  </p>

                  <button
                    onClick={() => speak(heroGreetingSpeech)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-xs font-bold cursor-pointer"
                  >
                    <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce text-yellow-300' : ''}`} />
                    <span>Escuchar Presentación</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentStepPage('creator')}
                    className="px-4 py-3 rounded-full bg-slate-200 dark:bg-white/10 text-xs font-black cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      sounds.playTap();
                      setCurrentStepPage('page2_comic');
                    }}
                    className="flex-1 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Ver el Cómic del Héroe</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* PÁGINA 2: CÓMIC DE 3 VIÑETAS GENERADO EN BACKEND          */}
        {/* ========================================================= */}
        {currentStepPage === 'page2_comic' && (
          <div className="space-y-4 max-w-xl mx-auto w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-1">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-300">
                  Página 2 de 3 · El Cómic Mágico
                </span>
                <h3 className="text-sm font-black text-slate-800 dark:text-white">Las Aventuras de {heroName}</h3>
              </div>
              <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-300" />
            </div>

            {/* 3 Viñetas del Cómic */}
            <div className="grid grid-cols-1 gap-3">
              {comicPanels.map((panel, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-[28px] bg-white/50 dark:bg-white/10 backdrop-blur-md border border-white/60 dark:border-white/15 shadow-md space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-600 dark:text-purple-300">{panel.title}</span>
                    <button
                      onClick={() => speak(`${panel.title}. ${panel.scene} El héroe dice: ${panel.dialogue}`)}
                      className="p-1 rounded-full text-purple-600 dark:text-purple-300 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-white/80 leading-relaxed font-medium">
                    {panel.scene}
                  </p>
                  <div className="p-2 rounded-[16px] bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 text-[11px] font-black text-purple-700 dark:text-purple-200">
                    💬 "{panel.dialogue}"
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentStepPage('page1_image')}
                className="px-4 py-3 rounded-full bg-slate-200 dark:bg-white/10 text-xs font-black cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  sounds.playTap();
                  setCurrentStepPage('page3_world');
                  speak(playAtHomeIdea);
                }}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>¿Cómo jugar en casa?</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PÁGINA 3: GENERAR MUNDO DE JUEGO EN CASA (PHYGITAL CÁMARA)*/}
        {/* ========================================================= */}
        {currentStepPage === 'page3_world' && (
          <div className="space-y-4 max-w-xl mx-auto w-full animate-in zoom-in-95 duration-200">
            <div className="p-5 rounded-[32px] bg-gradient-to-br from-emerald-900/40 via-teal-900/40 to-slate-900/50 border border-white/20 text-white shadow-xl space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block text-center">
                Página 3 de 3 · Jugar en el Mundo Real
              </span>

              <h3 className="text-base font-black text-center">¡Sé el Superhéroe en tu Casa!</h3>

              <div className="p-3.5 rounded-[22px] bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold leading-relaxed text-emerald-100">
                🏡 {playAtHomeIdea}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => speak(playAtHomeIdea)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-xs font-bold cursor-pointer"
                >
                  <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce text-yellow-300' : ''}`} />
                  <span>Escuchar Guía de Juego</span>
                </button>
              </div>
            </div>

            {/* BOTÓN: GENERAR MUNDO (Fotografiar Habitación con IA) */}
            {!roomWorldResult && (
              <div className="p-4 rounded-[28px] bg-white/40 dark:bg-white/10 backdrop-blur-md border border-white/60 dark:border-white/10 text-center space-y-3">
                <p className="text-xs font-bold text-slate-700 dark:text-white">
                  📸 Toma una foto a tu cuarto o sala para que Zentry transforme tus muebles en el mundo del héroe:
                </p>

                <button
                  onClick={handleStartRoomCamera}
                  disabled={isTransformingRoom}
                  className="w-full py-4 rounded-[24px] bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Camera className="w-5 h-5" />
                  <span>{isTransformingRoom ? 'Transformando Habitación...' : 'Generar Mundo con mi Habitación'}</span>
                </button>
              </div>
            )}

            {/* Resultado de la Transformación Phygital de la Habitación */}
            {roomWorldResult && (
              <div className="p-5 rounded-[32px] bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800/40 space-y-3 animate-in zoom-in-95">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-purple-900 dark:text-purple-200">
                    🪐 {roomWorldResult.worldName}
                  </h4>
                  <button
                    onClick={() => speak(roomWorldResult.voiceSpeech)}
                    className="p-1 text-purple-600 dark:text-purple-300 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  {roomWorldResult.roomTransformations.map((t, idx) => (
                    <div key={idx} className="p-2 rounded-[16px] bg-white dark:bg-white/10 flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-white/80">{t.realObject}:</span>
                      <span className="font-black text-purple-600 dark:text-purple-300">👉 {t.magicalRole}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-[20px] bg-emerald-500/15 border border-emerald-400 text-emerald-950 dark:text-emerald-200 font-bold text-xs">
                  🎯 <strong>Primera Misión:</strong> {roomWorldResult.firstPhysicalMission}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentStepPage('page2_comic')}
                className="px-4 py-3 rounded-full bg-slate-200 dark:bg-white/10 text-xs font-black cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  sounds.playSuccess();
                  setCurrentStepPage('creator');
                }}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Crear Otro Personaje!</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal de Cámara para Generar Mundo */}
        {isScanningRoom && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 animate-in fade-in">
            <div className="flex items-center justify-between text-white px-2 pt-2">
              <h3 className="text-sm font-black">Fotografía tu Espacio de Juego</h3>
              <button
                onClick={() => {
                  if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
                  setIsScanningRoom(false);
                }}
                className="px-4 py-1.5 rounded-full bg-white/20 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <div className="relative flex-1 rounded-[32px] overflow-hidden my-3 border-2 border-cyan-400 shadow-2xl flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>

            <div className="flex items-center justify-center pb-4">
              <button
                onClick={handleCaptureRoomPhoto}
                className="w-20 h-20 rounded-full bg-white p-1.5 shadow-2xl flex items-center justify-center cursor-pointer active:scale-90"
              >
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                  <Camera className="w-8 h-8" />
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </ZentrySubPageScaffold>
  );
};

export default ZentryCharacterScreen;
