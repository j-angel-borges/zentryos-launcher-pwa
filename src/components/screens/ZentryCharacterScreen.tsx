import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  Sparkles,
  Zap,
  ArrowRight,
  ArrowLeft,
  Camera,
  BookOpen,
  Gamepad2,
  RefreshCw,
  CheckCircle2,
  Maximize2,
  Wand2,
  Shield,
  Flame,
  Snowflake,
  Feather,
  Sun
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';
import { askZentryAi } from '../../services/aiService';
import { ZentryLogoIcon } from '../ui/ZentryLogoIcon';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

// Avatar Customization Options
const SKIN_TONES = [
  { id: 'light', color: '#FDDFD0', label: 'Claro' },
  { id: 'tan', color: '#E8B382', label: 'Canela' },
  { id: 'dark', color: '#8D5524', label: 'Moreno' },
  { id: 'star', color: '#C8B6FF', label: 'Galáctico' },
  { id: 'aqua', color: '#A7F3D0', label: 'Mágico' }
];

const HAIR_STYLES = [
  { id: 'spiky', icon: '⚡', label: 'Picos' },
  { id: 'curly', icon: '🌀', label: 'Rizos' },
  { id: 'short', icon: '✂️', label: 'Corto' },
  { id: 'helmet', icon: '🪖', label: 'Casco' },
  { id: 'crown', icon: '👑', label: 'Corona' }
];

const POWERS = [
  { id: 'lightning', name: 'Rayos Mágicos', icon: Zap, color: '#FBBF24', promptWord: 'lightning energy sparks' },
  { id: 'fire', name: 'Fuego Solar', icon: Flame, color: '#F87171', promptWord: 'warm solar fire glow' },
  { id: 'ice', name: 'Hielo Cristal', icon: Snowflake, color: '#38BDF8', promptWord: 'frost crystal ice aura' },
  { id: 'wings', name: 'Vuelo Estelar', icon: Feather, color: '#A78BFA', promptWord: 'cosmic star wings flying' },
  { id: 'nature', name: 'Naturaleza', icon: Sun, color: '#34D399', promptWord: 'glowing nature flora leaves' }
];

const SUIT_COLORS = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

interface ComicPanel {
  caption: string;
  imageUrl: string;
}

interface HeroCreationResult {
  heroName: string;
  heroImageUrl: string;
  comicPanels: ComicPanel[];
  realWorldPlayPrompt: string;
}

export const ZentryCharacterScreen: React.FC<Props> = ({ onBack, isDark }) => {
  // Wizard steps: 0: Customizer, 1: Hero Image, 2: Comic, 3: Real World Play & Room Vision
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

  // Customization State
  const [selectedSkin, setSelectedSkin] = useState(SKIN_TONES[0]);
  const [selectedHair, setSelectedHair] = useState(HAIR_STYLES[0]);
  const [selectedPower, setSelectedPower] = useState(POWERS[0]);
  const [selectedSuitColor, setSelectedSuitColor] = useState(SUIT_COLORS[0]);

  // AI Generation State
  const [isCreatingHero, setIsCreatingHero] = useState(false);
  const [generationPhase, setGenerationPhase] = useState('');
  const [heroResult, setHeroResult] = useState<HeroCreationResult | null>(null);

  // Room Camera World State (Step 3)
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [roomCapturedImg, setRoomCapturedImg] = useState<string | null>(null);
  const [isAnalyzingRoom, setIsAnalyzingRoom] = useState(false);
  const [roomMissionResult, setRoomMissionResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    voiceService.speakFeedback('¡Diseña tu superhéroe con tus colores y superpoderes favoritos!');
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // 1. GENERATE SUPERHERO PIPELINE
  const handleCreateHero = async () => {
    sounds.playTap();
    setIsCreatingHero(true);
    setGenerationPhase('Creando imagen del superhéroe...');

    try {
      const userPrompt = `Crea un superhéroe infantil: Piel ${selectedSkin.label}, Cabello estilo ${selectedHair.label}, Superpoder de ${selectedPower.name}, Traje color ${selectedSuitColor}.`;
      
      const aiResponse = await askZentryAi('character_hero_creator', userPrompt);

      let parsed: any = {};
      try {
        parsed = JSON.parse(aiResponse.trim().replace(/^```json/, '').replace(/```$/, ''));
      } catch {
        parsed = {
          heroName: 'Super Héroe Estelar',
          heroPrompt: `3D Pixar cute superhero toddler character, ${selectedPower.promptWord}, colorful suit, happy glowing`,
          comicPanels: [
            { caption: '¡Un día de aventuras en la ciudad mágica!', prompt: '3D cute superhero toddler standing atop a fluffy cloud' },
            { caption: '¡Un amigo necesita ayuda mágica!', prompt: '3D cute superhero toddler using glowing powers to help a friend' },
            { caption: '¡Misión cumplida con fiesta de estrellas!', prompt: '3D cute superhero toddler celebrating with stars' }
          ],
          realWorldPlayPrompt: '¡Ponte una toalla como capa de superhéroe, da 3 saltos altos y rescata a tu peluche!'
        };
      }

      setGenerationPhase('Generando arte en alta resolución...');

      // Generate Hero Main Image
      const heroEncoded = encodeURIComponent(`${parsed.heroPrompt || '3D cute superhero kid'}, 3D Pixar masterpiece, 8k resolution, cute, vibrant`);
      const heroSeed = Math.floor(Math.random() * 1000000);
      const heroImgUrl = `https://image.pollinations.ai/prompt/${heroEncoded}?width=768&height=768&seed=${heroSeed}&nologo=true`;

      // Generate Comic Panels Images
      const rawPanels = Array.isArray(parsed.comicPanels) ? parsed.comicPanels.slice(0, 3) : [];
      const comicPanels: ComicPanel[] = rawPanels.map((p: any, idx: number) => {
        const panelEncoded = encodeURIComponent(`${p.prompt || p.caption}, 3D cute pixar storybook style`);
        const panelSeed = heroSeed + idx + 1;
        return {
          caption: p.caption || `Viñeta ${idx + 1}`,
          imageUrl: `https://image.pollinations.ai/prompt/${panelEncoded}?width=600&height=450&seed=${panelSeed}&nologo=true`
        };
      });

      sounds.playSuccess();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });

      const finalResult: HeroCreationResult = {
        heroName: parsed.heroName || 'Super Héroe Mágico',
        heroImageUrl: heroImgUrl,
        comicPanels,
        realWorldPlayPrompt: parsed.realWorldPlayPrompt || '¡Usa tu capa y corre como un superhéroe por tu casa!'
      };

      setHeroResult(finalResult);
      setStep(1);
      voiceService.speakFeedback(`¡Conoce a tu superhéroe: ${finalResult.heroName}!`);
    } catch (err) {
      console.warn('Hero creation error:', err);
      const fallbackResult: HeroCreationResult = {
        heroName: 'Super Héroe Mágico',
        heroImageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
        comicPanels: [
          { caption: '¡Despegando hacia las estrellas!', imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
          { caption: '¡Usando su superpoder mágico!', imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80' },
          { caption: '¡Victoria y fiesta con amigos!', imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80' }
        ],
        realWorldPlayPrompt: '¡Ponte una capa imaginaria, da 3 saltos altos y vuela por tu sala!'
      };
      setHeroResult(fallbackResult);
      setStep(1);
      voiceService.speakFeedback('¡Tu superhéroe está listo para la acción!');
    } finally {
      setIsCreatingHero(false);
      setGenerationPhase('');
    }
  };

  // 2. ROOM CAMERA WORLD GENERATOR (Step 3)
  const handleStartRoomCamera = async () => {
    sounds.playTap();
    setIsCameraActive(true);
    setRoomCapturedImg(null);
    setRoomMissionResult(null);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Room camera error:', e);
    }
  };

  const handleCaptureRoomAndGenerateWorld = async () => {
    if (!videoRef.current || isAnalyzingRoom) return;
    sounds.playTap();
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    setRoomCapturedImg(base64);
    setIsAnalyzingRoom(true);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);

    try {
      const response = await askZentryAi(
        'character_world_generator',
        `El niño tiene su superhéroe ${heroResult?.heroName}. Transforma esta habitación/sala en su mundo de aventuras.`,
        base64
      );

      let parsed: any = {};
      try {
        parsed = JSON.parse(response.trim().replace(/^```json/, '').replace(/```$/, ''));
      } catch {
        parsed = {
          spaceObservation: 'Veo tu sala de juegos con cojines.',
          missionIdea: '¡Los cojines son rocas flotantes y la alfombra es un lago de estrellas!',
          speechFeedback: '¡Tu cuarto se convirtió en una base espacial! Camina con cuidado sobre los cojines.'
        };
      }

      sounds.playSuccess();
      confetti({ particleCount: 90, spread: 80 });
      const missionText = `${parsed.missionIdea || ''} ${parsed.speechFeedback || ''}`;
      setRoomMissionResult(missionText);
      voiceService.speakFeedback(missionText);
    } catch (err) {
      const fallbackMission = '¡Tu cuarto es una base mágica! ¡Párate sobre un cojín para activar tu poder!';
      setRoomMissionResult(fallbackMission);
      voiceService.speakFeedback(fallbackMission);
    } finally {
      setIsAnalyzingRoom(false);
    }
  };

  return (
    <ZentrySubPageScaffold title="Personajes" kicker="CREADOR DE SUPERHÉROES" onBack={onBack} isDark={isDark}>
      <div className="w-full h-full flex flex-col justify-between p-2 md:p-3 overflow-y-auto no-scrollbar select-none space-y-3 pb-8">
        {/* ─────────────────────────────────────────────────────────────
            PAGE 0: AVATAR CUSTOMIZER & CREAR SUPERHÉROE
        ────────────────────────────────────────────────────────────── */}
        {step === 0 && (
          <div className="w-full max-w-md mx-auto flex flex-col items-center gap-3 animate-spring-in">
            {/* Live Interactive Avatar Box */}
            <div
              style={{ backgroundColor: selectedSuitColor }}
              className="w-36 h-36 md:w-42 md:h-42 rounded-[38px] flex flex-col items-center justify-center shadow-2xl border-4 border-white relative overflow-hidden transition-all duration-300 zentry-spring-press"
            >
              {/* Hair / Hat */}
              <span className="text-4xl -mb-2 z-10 animate-bounce">{selectedHair.icon}</span>

              {/* Face Shape with Skin Tone */}
              <div
                style={{ backgroundColor: selectedSkin.color }}
                className="w-18 h-18 rounded-full border-2 border-white/60 shadow-inner flex flex-col items-center justify-center relative"
              >
                {/* Eyes & Smile */}
                <div className="flex items-center gap-3 mt-1">
                  <span className="w-2 h-2 rounded-full bg-slate-900" />
                  <span className="w-2 h-2 rounded-full bg-slate-900" />
                </div>
                <span className="text-xs font-black text-rose-500 mt-1">‿</span>
              </div>

              {/* Power Badge */}
              <div
                style={{ backgroundColor: selectedPower.color }}
                className="absolute bottom-2 right-2 p-1.5 rounded-full border-2 border-white text-white shadow-lg animate-pulse"
              >
                <selectedPower.icon className="w-4 h-4" />
              </div>
            </div>

            {/* Customization Selectors Grid */}
            <div className="w-full space-y-2 bg-[#120E24]/90 p-3 rounded-[28px] border border-purple-400/40 shadow-xl">
              {/* 1. Tono de Piel */}
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-wide">Piel</span>
                <div className="flex gap-2">
                  {SKIN_TONES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        sounds.playTap();
                        setSelectedSkin(s);
                      }}
                      style={{ backgroundColor: s.color }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        selectedSkin.id === s.id ? 'scale-120 border-white ring-2 ring-purple-400 shadow-md' : 'border-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* 2. Cabello / Estilo */}
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-wide">Estilo</span>
                <div className="flex gap-1.5">
                  {HAIR_STYLES.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => {
                        sounds.playTap();
                        setSelectedHair(h);
                      }}
                      className={`w-8 h-8 rounded-xl text-lg flex items-center justify-center border transition-all cursor-pointer ${
                        selectedHair.id === h.id ? 'bg-purple-600 border-white scale-110 shadow-md' : 'bg-white/10 border-white/20'
                      }`}
                    >
                      {h.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Superpoder */}
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-wide">Poder</span>
                <div className="flex gap-1.5">
                  {POWERS.map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          sounds.playTap();
                          setSelectedPower(p);
                          voiceService.speakFeedback(p.name);
                        }}
                        style={{ backgroundColor: selectedPower.id === p.id ? p.color : 'rgba(255,255,255,0.1)' }}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all cursor-pointer text-white ${
                          selectedPower.id === p.id ? 'border-white scale-110 shadow-md' : 'border-white/20'
                        }`}
                        title={p.name}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Color del Traje */}
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-wide">Traje</span>
                <div className="flex gap-2">
                  {SUIT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        sounds.playTap();
                        setSelectedSuitColor(c);
                      }}
                      style={{ backgroundColor: c }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        selectedSuitColor === c ? 'scale-120 border-white ring-2 ring-pink-400 shadow-md' : 'border-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* BOTÓN PRINCIPAL: CREAR SUPERHÉROE */}
            <button
              onClick={handleCreateHero}
              disabled={isCreatingHero}
              className="w-full py-4 rounded-[26px] bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-600 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-2xl border-2 border-white cursor-pointer active:scale-95 transition-all zentry-spring-press disabled:opacity-50"
            >
              {isCreatingHero ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-white" />
                  <span className="text-white">{generationPhase}</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-amber-300" />
                  <span>⚡ ¡Crear Superhéroe!</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            PAGE 1: LA IMAGEN DEL SUPERHÉROE GENERADA
        ────────────────────────────────────────────────────────────── */}
        {step === 1 && heroResult && (
          <div className="w-full max-w-md mx-auto flex flex-col items-center gap-3 animate-spring-in text-center">
            <h3 className="text-lg font-black text-white drop-shadow-md">
              {heroResult.heroName}
            </h3>

            {/* Main Generated Image */}
            <div className="relative w-full aspect-square rounded-[30px] overflow-hidden border-3 border-purple-400/60 shadow-2xl bg-black">
              <img
                src={heroResult.heroImageUrl}
                alt={heroResult.heroName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Navigation to Comic */}
            <div className="flex items-center justify-between w-full pt-1 gap-2">
              <button
                onClick={() => setStep(0)}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Editar</span>
              </button>

              <button
                onClick={() => {
                  sounds.playTap();
                  setStep(2);
                  voiceService.speakFeedback('¡Mira tu cómic de aventuras!');
                }}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl border border-white/30 cursor-pointer zentry-spring-press"
              >
                <span>Ver Cómic 📖</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            PAGE 2: EL CÓMIC DE 3 VIÑETAS
        ────────────────────────────────────────────────────────────── */}
        {step === 2 && heroResult && (
          <div className="w-full max-w-md mx-auto flex flex-col items-center gap-3 animate-spring-in">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>Cómic de Aventuras</span>
              </h3>
              <span className="text-[10px] text-purple-300 font-mono font-bold">3 Viñetas</span>
            </div>

            {/* 3 Comic Panels Grid */}
            <div className="w-full space-y-2.5">
              {heroResult.comicPanels.map((panel, idx) => (
                <div
                  key={idx}
                  className="rounded-[24px] p-2.5 bg-[#120E24]/90 border border-purple-400/40 shadow-xl flex items-center gap-3"
                >
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black shrink-0 border border-white/20">
                    <img src={panel.imageUrl} alt={`Viñeta ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black text-amber-300 uppercase">Paso {idx + 1}</div>
                    <p className="text-xs font-bold text-white leading-tight">{panel.caption}</p>
                    <button
                      onClick={() => {
                        sounds.playTap();
                        voiceService.speakFeedback(panel.caption);
                      }}
                      className="mt-1 text-[10px] text-purple-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Escuchar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation to Real World Play */}
            <div className="flex items-center justify-between w-full pt-1 gap-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Héroe</span>
              </button>

              <button
                onClick={() => {
                  sounds.playTap();
                  setStep(3);
                  voiceService.speakFeedback(heroResult.realWorldPlayPrompt);
                }}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl border border-white/30 cursor-pointer zentry-spring-press"
              >
                <span>Jugar en Casa 🏡</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            PAGE 3: JUGAR EN EL MUNDO REAL & FOTO DE TU CUARTO
        ────────────────────────────────────────────────────────────── */}
        {step === 3 && heroResult && (
          <div className="w-full max-w-md mx-auto flex flex-col items-center gap-3 animate-spring-in text-center">
            {/* Real World Mission Card */}
            <div className="w-full p-4 rounded-[30px] bg-[#120E24]/95 border-2 border-amber-400/60 shadow-2xl space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Gamepad2 className="w-5 h-5 text-amber-300 animate-bounce" />
                <h3 className="text-sm font-black text-amber-300 uppercase">Misión en tu Casa</h3>
              </div>
              <p className="text-sm font-black text-white leading-relaxed">
                {heroResult.realWorldPlayPrompt}
              </p>
              <button
                onClick={() => {
                  sounds.playTap();
                  voiceService.speakFeedback(heroResult.realWorldPlayPrompt);
                }}
                className="px-4 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-purple-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Escuchar reto</span>
              </button>
            </div>

            {/* Room Camera Generator Button */}
            {!isCameraActive && !roomCapturedImg && (
              <button
                onClick={handleStartRoomCamera}
                className="w-full py-4 rounded-[28px] bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-2xl border-2 border-white cursor-pointer zentry-spring-press"
              >
                <Camera className="w-5 h-5 text-amber-300" />
                <span>📸 Generar Mundo con Foto de tu Cuarto</span>
              </button>
            )}

            {/* Live Camera Viewport */}
            {isCameraActive && (
              <div className="w-full space-y-2">
                <div className="relative w-full h-52 rounded-[26px] overflow-hidden bg-black border-2 border-purple-400 shadow-xl flex items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                </div>
                <button
                  onClick={handleCaptureRoomAndGenerateWorld}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 font-black text-sm shadow-xl cursor-pointer zentry-spring-press"
                >
                  ⚡ ¡Tomar Foto y Crear Escenario!
                </button>
              </div>
            )}

            {/* AI Room Mission Result */}
            {isAnalyzingRoom && (
              <div className="p-4 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center gap-2 text-white text-xs font-bold animate-pulse">
                <ZentryLogoIcon className="w-4 h-4 animate-spin" />
                <span>Zentry transformando tu habitación en una base secreta...</span>
              </div>
            )}

            {roomMissionResult && (
              <div className="w-full p-4 rounded-[28px] bg-gradient-to-tr from-purple-950 to-indigo-950 border-2 border-emerald-400 shadow-2xl text-left space-y-2 animate-spring-in">
                <div className="text-xs font-black text-emerald-300 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>¡Escenario de Juego Creado!</span>
                </div>
                <p className="text-xs font-bold text-white leading-relaxed">
                  {roomMissionResult}
                </p>
                <button
                  onClick={() => {
                    sounds.playTap();
                    voiceService.speakFeedback(roomMissionResult);
                  }}
                  className="px-3 py-1 rounded-full bg-white/15 text-purple-200 text-[10px] font-bold inline-flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Repetir</span>
                </button>
              </div>
            )}

            {/* Back to Start */}
            <div className="flex items-center justify-between w-full pt-2">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Cómic</span>
              </button>

              <button
                onClick={() => {
                  sounds.playTap();
                  setStep(0);
                }}
                className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold cursor-pointer"
              >
                Nuevo Héroe ✨
              </button>
            </div>
          </div>
        )}
      </div>
    </ZentrySubPageScaffold>
  );
};

export default ZentryCharacterScreen;
