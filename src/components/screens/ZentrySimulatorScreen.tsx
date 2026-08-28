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
  Wand2,
  Shield,
  Flame,
  Snowflake,
  Feather,
  Sun,
  Moon,
  Globe,
  Trophy,
  Award,
  Sparkle,
  Crown,
  Glasses,
  CloudRain,
  CircleDot,
  Waves,
  Scissors,
  Smile,
  Rocket,
  Trees,
  Building2,
  type LucideIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';
import { askZentryAi } from '../../services/aiService';
import { ZentryLogoIcon } from '../ui/ZentryLogoIcon';
import type { AgeTier } from '../../types/zentry';

interface Props {
  onBack: () => void;
  ageTier?: AgeTier;
  isDark?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. DATA MODELS & CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export interface AuraConfig {
  id: 'cosmic' | 'cyber' | 'solar' | 'emerald';
  name: string;
  subtitle: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  glowClass: string;
  badgeBg: string;
  Icon: LucideIcon;
  description: string;
  powerName: string;
}

export const AURA_TYPES: AuraConfig[] = [
  {
    id: 'cosmic',
    name: 'Cosmic Starlight',
    subtitle: 'Energía Astral Pulsante',
    primaryColor: '#C084FC',
    secondaryColor: '#38BDF8',
    glowColor: 'rgba(192, 132, 252, 0.7)',
    glowClass: 'shadow-[0_0_35px_rgba(192,132,252,0.8),inset_0_0_20px_rgba(56,189,248,0.6)]',
    badgeBg: 'bg-purple-500/20 text-purple-200 border-purple-400/50',
    Icon: Sparkles,
    description: 'Resplandor pulsante violeta y cian con destellos de polvo estelar.',
    powerName: 'Rayo Astral'
  },
  {
    id: 'cyber',
    name: 'Neon Cyber Grid',
    subtitle: 'Sobrecarga Eléctrica Neón',
    primaryColor: '#06B6D4',
    secondaryColor: '#F43F5E',
    glowColor: 'rgba(6, 182, 212, 0.75)',
    glowClass: 'shadow-[0_0_35px_rgba(6,182,212,0.8),inset_0_0_20px_rgba(244,63,94,0.6)]',
    badgeBg: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50',
    Icon: Zap,
    description: 'Rejilla cuántica de energía azul eléctrica y fucsia hiper-velocidad.',
    powerName: 'Pulso Cuántico'
  },
  {
    id: 'solar',
    name: 'Solar Flare / Fuego',
    subtitle: 'Llama Sagrada Solar',
    primaryColor: '#FBBF24',
    secondaryColor: '#EF4444',
    glowColor: 'rgba(251, 191, 36, 0.8)',
    glowClass: 'shadow-[0_0_35px_rgba(251,191,36,0.85),inset_0_0_20px_rgba(239,68,68,0.7)]',
    badgeBg: 'bg-amber-500/20 text-amber-200 border-amber-400/50',
    Icon: Flame,
    description: 'Calidez radiante de llama dorada solar y destellos carmesí.',
    powerName: 'Llamarada Solar'
  },
  {
    id: 'emerald',
    name: 'Nature Emerald',
    subtitle: 'Bioluminiscencia Esmeralda',
    primaryColor: '#10B981',
    secondaryColor: '#FDE047',
    glowColor: 'rgba(16, 185, 129, 0.75)',
    glowClass: 'shadow-[0_0_35px_rgba(16,185,129,0.8),inset_0_0_20px_rgba(253,224,71,0.6)]',
    badgeBg: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50',
    Icon: Sun,
    description: 'Energía de hojas místicas y vida vegetal resplandeciente.',
    powerName: 'Vórtice Flora'
  }
];

export interface AccessoryConfig {
  id: 'none' | 'wings' | 'cape' | 'shield' | 'wand' | 'crown' | 'helmet' | 'goggles';
  name: string;
  Icon: LucideIcon;
  layer: 'back' | 'head' | 'face' | 'hand' | 'none';
  bonusStat: string;
  bonusValue: number;
}

export const HERO_ACCESSORIES: AccessoryConfig[] = [
  { id: 'none', name: 'Ninguno', Icon: Sparkles, layer: 'none', bonusStat: 'Agilidad', bonusValue: 5 },
  { id: 'wings', name: 'Alas Cósmicas', Icon: Feather, layer: 'back', bonusStat: 'Vuelo', bonusValue: 25 },
  { id: 'cape', name: 'Capa Heroica', Icon: Shield, layer: 'back', bonusStat: 'Carisma', bonusValue: 20 },
  { id: 'shield', name: 'Escudo Estelar', Icon: Shield, layer: 'hand', bonusStat: 'Defensa', bonusValue: 30 },
  { id: 'wand', name: 'Varita Mágica', Icon: Wand2, layer: 'hand', bonusStat: 'Magia', bonusValue: 35 },
  { id: 'crown', name: 'Corona Astral', Icon: Crown, layer: 'head', bonusStat: 'Sabiduría', bonusValue: 25 },
  { id: 'helmet', name: 'Casco Cyber', Icon: Shield, layer: 'head', bonusStat: 'Blindaje', bonusValue: 28 },
  { id: 'goggles', name: 'Gafas Cyber HUD', Icon: Glasses, layer: 'face', bonusStat: 'Percepción', bonusValue: 22 }
];

export type WeatherType = 'starfall' | 'mystic_rain' | 'nebula' | 'bubbles' | 'clear';

export interface WeatherOption {
  id: WeatherType;
  name: string;
  Icon: LucideIcon;
  description: string;
}

export const WEATHER_OPTIONS: WeatherOption[] = [
  { id: 'starfall', name: 'Lluvia Estelar', Icon: Sparkles, description: 'Polvo de estrellas cayendo suavemente' },
  { id: 'mystic_rain', name: 'Lluvia Mística', Icon: CloudRain, description: 'Gotas de neón luminosas con ondas' },
  { id: 'nebula', name: 'Nebulosa Espacial', Icon: Sparkles, description: 'Nubes interestelares flotantes y orbes' },
  { id: 'bubbles', name: 'Burbujas Oceánicas', Icon: CircleDot, description: 'Burbujas interactivas que explotan' },
  { id: 'clear', name: 'Cielo Despejado', Icon: Sun, description: 'Brillo ambiental tranquilo' }
];

const SKIN_TONES = [
  { id: 'light', color: '#FDDFD0', label: 'Claro' },
  { id: 'tan', color: '#E8B382', label: 'Canela' },
  { id: 'dark', color: '#8D5524', label: 'Moreno' },
  { id: 'star', color: '#C8B6FF', label: 'Galáctico' },
  { id: 'aqua', color: '#A7F3D0', label: 'Mágico' }
];

const HAIR_STYLES: Array<{ id: string; Icon: LucideIcon; label: string }> = [
  { id: 'spiky', Icon: Zap, label: 'Picos' },
  { id: 'curly', Icon: Waves, label: 'Rizos' },
  { id: 'short', Icon: Scissors, label: 'Corto' },
  { id: 'buns', Icon: Smile, label: 'Moñitos' },
  { id: 'crown', Icon: Crown, label: 'Corona' },
  { id: 'helmet', Icon: Shield, label: 'Casco' }
];

const POWERS = [
  { id: 'lightning', name: 'Rayos Mágicos', icon: Zap, color: '#FBBF24', promptWord: 'lightning energy sparks' },
  { id: 'fire', name: 'Fuego Solar', icon: Flame, color: '#F87171', promptWord: 'warm solar fire glow' },
  { id: 'ice', name: 'Hielo Cristal', icon: Snowflake, color: '#38BDF8', promptWord: 'frost crystal ice aura' },
  { id: 'wings', name: 'Vuelo Estelar', icon: Feather, color: '#A78BFA', promptWord: 'cosmic star wings flying' },
  { id: 'nature', name: 'Naturaleza', icon: Sun, color: '#34D399', promptWord: 'glowing nature flora leaves' }
];

const SUIT_COLORS = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const PRESET_WORLDS: Array<{ id: string; name: string; Icon: LucideIcon; prompt: string }> = [
  { id: 'space', name: 'Galaxia Neón', Icon: Rocket, prompt: 'Cosmic glowing galaxy floating city with colorful nebula stars' },
  { id: 'ocean', name: 'Reino Marino', Icon: Waves, prompt: 'Underwater glowing crystal palace with friendly glowing dolphins' },
  { id: 'forest', name: 'Bosque Mágico', Icon: Trees, prompt: 'Enchanted bioluminescent fairy forest with giant colorful mushrooms' },
  { id: 'future', name: 'Ciudad Flotante', Icon: Building2, prompt: 'Futuristic floating sky metropolis with holographic flying cars' },
  { id: 'dino', name: 'Valle Jurásico', Icon: Sparkles, prompt: 'Prehistoric lush valley with friendly colorful baby dinosaurs' }
];

interface ComicPanel {
  title: string;
  caption: string;
  imageUrl: string;
  soundEffect: string;
}

interface HeroCreationResult {
  heroName: string;
  heroTitle: string;
  heroImageUrl: string;
  comicPanels: ComicPanel[];
  realWorldPlayPrompt: string;
  stats: {
    strength: number;
    speed: number;
    magic: number;
    defense: number;
    cosmicPower: number;
  };
  auraName: string;
  accessoryName: string;
}

interface SceneResult {
  title: string;
  imageUrl: string;
  loreStory: string;
  interactiveElements: Array<{ name: string; effect: string }>;
  speechFeedback: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ATMOSPHERIC PARTICLE BACKGROUND CANVAS
// ─────────────────────────────────────────────────────────────────────────────

const AtmosphericParticlesCanvas: React.FC<{
  weather: WeatherType;
  isCelestialNight: boolean;
}> = ({ weather, isCelestialNight }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pools
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      phase: number;
      hue: number;
      alpha: number;
      speed: number;
      radius?: number;
    }

    const particles: Particle[] = [];
    const count = weather === 'starfall' ? 55 : weather === 'mystic_rain' ? 80 : weather === 'bubbles' ? 32 : weather === 'nebula' ? 24 : 15;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: weather === 'mystic_rain' ? 4 + Math.random() * 4 : weather === 'bubbles' ? -(0.6 + Math.random() * 0.8) : 0.3 + Math.random() * 0.7,
        size: weather === 'bubbles' ? 6 + Math.random() * 16 : weather === 'nebula' ? 30 + Math.random() * 50 : 2 + Math.random() * 4,
        phase: Math.random() * Math.PI * 2,
        hue: isCelestialNight ? 240 + Math.random() * 60 : 45 + Math.random() * 40,
        alpha: 0.3 + Math.random() * 0.6,
        speed: 0.02 + Math.random() * 0.04
      });
    }

    let time = 0;

    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      // 1. STARFALL
      if (weather === 'starfall') {
        particles.forEach((p) => {
          p.y += p.vy;
          p.x += Math.sin(time * 2 + p.phase) * 0.8;
          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }

          const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(time * 3 + p.phase));
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(time + p.phase);
          ctx.fillStyle = isCelestialNight ? `rgba(200, 182, 255, ${p.alpha * twinkle})` : `rgba(253, 224, 71, ${p.alpha * twinkle})`;
          ctx.shadowColor = isCelestialNight ? '#c084fc' : '#fbbf24';
          ctx.shadowBlur = 8;

          // 4-point star
          ctx.beginPath();
          for (let i = 0; i < 4; i++) {
            ctx.lineTo(Math.cos((i * Math.PI) / 2) * p.size * 1.5, Math.sin((i * Math.PI) / 2) * p.size * 1.5);
            ctx.lineTo(Math.cos((i * Math.PI) / 2 + Math.PI / 4) * (p.size * 0.4), Math.sin((i * Math.PI) / 2 + Math.PI / 4) * (p.size * 0.4));
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        });
      }

      // 2. MYSTIC RAIN
      else if (weather === 'mystic_rain') {
        ctx.lineWidth = 1.5;
        particles.forEach((p) => {
          p.y += p.vy;
          p.x += p.vx;
          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }

          ctx.strokeStyle = isCelestialNight ? 'rgba(56, 189, 248, 0.7)' : 'rgba(167, 139, 250, 0.8)';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 2, p.y + p.vy * 3);
          ctx.stroke();

          // Ground ripple when hitting lower 20%
          if (p.y > height - 40) {
            ctx.beginPath();
            ctx.ellipse(p.x, height - 10, 4 + Math.sin(time * 5 + p.phase) * 3, 1.5, 0, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 * (1 - (height - p.y) / 40)})`;
            ctx.stroke();
          }
        });
      }

      // 3. SPATIAL NEBULAE
      else if (weather === 'nebula') {
        ctx.globalCompositeOperation = 'screen';
        particles.forEach((p) => {
          p.x += Math.cos(time * 0.4 + p.phase) * 0.4;
          p.y += Math.sin(time * 0.3 + p.phase) * 0.4;

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          const color = isCelestialNight
            ? p.phase > Math.PI ? 'rgba(192, 132, 252, 0.18)' : 'rgba(56, 189, 248, 0.15)'
            : p.phase > Math.PI ? 'rgba(251, 191, 36, 0.2)' : 'rgba(244, 63, 94, 0.15)';
          grad.addColorStop(0, color);
          grad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalCompositeOperation = 'source-over';
      }

      // 4. OCEANIC BUBBLES
      else if (weather === 'bubbles') {
        particles.forEach((p) => {
          p.y += p.vy;
          p.x += Math.cos(time * 2 + p.phase) * 0.6;
          if (p.y < -30) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }

          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = isCelestialNight ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.2)';
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = isCelestialNight ? 'rgba(167, 139, 250, 0.5)' : 'rgba(255, 255, 255, 0.6)';
          ctx.stroke();

          // Bubble gleam highlight
          ctx.beginPath();
          ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fill();
          ctx.restore();
        });
      }

      // 5. CLEAR / DEFAULT AMBIENT FLOATERS
      else {
        particles.forEach((p) => {
          p.y += Math.sin(time + p.phase) * 0.2;
          p.x += Math.cos(time + p.phase) * 0.2;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = isCelestialNight ? 'rgba(192, 132, 252, 0.4)' : 'rgba(251, 191, 36, 0.4)';
          ctx.fill();
        });
      }

      animIdRef.current = requestAnimationFrame(render);
    };

    render();

    // Click to pop bubble
    const handleCanvasClick = (e: MouseEvent) => {
      if (weather !== 'bubbles') return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      particles.forEach((p) => {
        const dx = p.x - clickX;
        const dy = p.y - clickY;
        if (Math.hypot(dx, dy) < p.size + 15) {
          p.y = height + 20;
          sounds.playSparkle(1.5);
          sounds.vibrate(8);
        }
      });
    };
    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleCanvasClick);
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [weather, isCelestialNight]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-auto z-0 opacity-80" />;
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. LAYERED AVATAR & AURA RENDERER (SVG + CSS PARTICLES)
// ─────────────────────────────────────────────────────────────────────────────

interface AvatarPreviewProps {
  skin: typeof SKIN_TONES[0];
  hair: typeof HAIR_STYLES[0];
  power: typeof POWERS[0];
  suitColor: string;
  aura: AuraConfig;
  accessory: AccessoryConfig;
  isPulsing?: boolean;
}

const LayeredHeroAvatar: React.FC<AvatarPreviewProps> = ({
  skin,
  hair,
  power,
  suitColor,
  aura,
  accessory,
  isPulsing = true
}) => {
  const PowerIcon = power.icon;

  return (
    <div className="relative w-44 h-44 md:w-52 md:h-52 flex items-center justify-center select-none group">
      {/* 1. LAYER 0: LUMINOUS ENERGY AURA SHADER FIELD */}
      <div
        className={`absolute inset-0 rounded-[44px] transition-all duration-500 pointer-events-none ${
          isPulsing ? 'animate-pulse' : ''
        }`}
        style={{
          boxShadow: `0 0 45px ${aura.glowColor}, inset 0 0 25px ${aura.secondaryColor}`,
          background: `radial-gradient(circle, ${aura.primaryColor}22 0%, ${aura.secondaryColor}11 70%, transparent 100%)`
        }}
      >
        {/* Animated aura ring spikes */}
        <div
          className="absolute inset-[-8px] rounded-[52px] border-2 border-dashed opacity-40 animate-spin"
          style={{
            borderColor: aura.primaryColor,
            animationDuration: '18s'
          }}
        />
        <div
          className="absolute inset-[-14px] rounded-[58px] border border-dotted opacity-25 animate-spin"
          style={{
            borderColor: aura.secondaryColor,
            animationDuration: '28s',
            animationDirection: 'reverse'
          }}
        />
      </div>

      {/* 2. LAYER 1: BACK ACCESSORIES (WINGS & CAPE) */}
      {accessory.id === 'wings' && (
        <div className="absolute inset-x-[-18px] top-4 flex justify-between z-10 pointer-events-none animate-bounce">
          <svg className="w-16 h-20 text-purple-300 drop-shadow-[0_0_12px_#c084fc] -scale-x-100" viewBox="0 0 100 100">
            <path
              d="M10,80 Q40,10 90,30 Q60,70 10,80 Z"
              fill="url(#wingGrad)"
              stroke="white"
              strokeWidth="2"
            />
            <defs>
              <linearGradient id="wingGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#E9D5FF" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
            </defs>
          </svg>
          <svg className="w-16 h-20 text-purple-300 drop-shadow-[0_0_12px_#c084fc]" viewBox="0 0 100 100">
            <path
              d="M10,80 Q40,10 90,30 Q60,70 10,80 Z"
              fill="url(#wingGrad)"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        </div>
      )}

      {accessory.id === 'cape' && (
        <div className="absolute inset-x-6 bottom-0 top-12 z-10 pointer-events-none flex justify-center">
          <svg className="w-32 h-36 drop-shadow-[0_4px_12px_rgba(239,68,68,0.6)]" viewBox="0 0 100 100">
            <path
              d="M25,20 Q50,28 75,20 L88,95 Q50,85 12,95 Z"
              fill="url(#capeGrad)"
              stroke="#B91C1C"
              strokeWidth="1.5"
            />
            <defs>
              <linearGradient id="capeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#991B1B" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* 3. LAYER 2: HERO SUIT BASE BODY BOX */}
      <div
        style={{ backgroundColor: suitColor }}
        className="w-36 h-36 md:w-42 md:h-42 rounded-[38px] flex flex-col items-center justify-center shadow-2xl border-4 border-white relative overflow-hidden transition-all duration-300 zentry-spring-press z-20"
      >
        {/* Suit Energy Lines & Shoulder Armour */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/30 pointer-events-none" />

        {/* 4. LAYER 3: HEAD & SKIN TONE */}
        <div
          style={{ backgroundColor: skin.color }}
          className="w-18 h-18 md:w-20 md:h-20 rounded-full border-2 border-white/80 shadow-inner flex flex-col items-center justify-center relative z-25 transition-transform duration-300"
        >
          {/* Eyes with gleam */}
          <div className="flex items-center gap-3.5 mt-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 flex items-start justify-end p-0.5 shadow-sm">
              <div className="w-1 h-1 rounded-full bg-white" />
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 flex items-start justify-end p-0.5 shadow-sm">
              <div className="w-1 h-1 rounded-full bg-white" />
            </div>
          </div>

          {/* Cute Rosy Blushing Cheeks */}
          <div className="flex items-center justify-between w-12 mt-0.5 px-0.5">
            <span className="w-2.5 h-1.5 rounded-full bg-rose-400/60 blur-[0.5px]" />
            <span className="w-2.5 h-1.5 rounded-full bg-rose-400/60 blur-[0.5px]" />
          </div>

          {/* Happy Mouth */}
          <span className="text-xs font-black text-rose-500 -mt-1">‿</span>

          {/* 5. LAYER 4: FACE ACCESSORIES (CYBER GOGGLES) */}
          {accessory.id === 'goggles' && (
            <div className="absolute top-3.5 inset-x-1 h-5 rounded-lg bg-cyan-400/80 border-2 border-cyan-200 flex items-center justify-around px-1 shadow-[0_0_10px_#06b6d4] z-30">
              <div className="w-3 h-2 rounded-sm bg-white/70" />
              <div className="w-3 h-2 rounded-sm bg-white/70" />
            </div>
          )}
        </div>

        {/* 6. LAYER 5: HAIR STYLE & HEAD ACCESSORIES */}
        <div className="absolute top-2 z-30 flex flex-col items-center pointer-events-none">
          {accessory.id === 'crown' ? (
            <Crown className="w-8 h-8 text-amber-300 fill-amber-300 drop-shadow-[0_0_10px_#fbbf24] animate-bounce" />
          ) : accessory.id === 'helmet' ? (
            <Shield className="w-8 h-8 text-cyan-300 fill-cyan-300 drop-shadow-[0_0_10px_#38bdf8]" />
          ) : (
            <hair.Icon className="w-7 h-7 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-bounce" />
          )}
        </div>

        {/* Chest Energy Core / Hero Star Emblem */}
        <div
          className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center mt-1 z-25 shadow-md animate-pulse"
          style={{ backgroundColor: aura.primaryColor }}
        >
          <Sparkle className="w-3.5 h-3.5 text-white" />
        </div>
      </div>

      {/* 7. LAYER 6: HANDHELD GEAR (SHIELD & MAGIC WAND) */}
      {accessory.id === 'shield' && (
        <div className="absolute -left-3 bottom-6 z-35 animate-pulse">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 border-2 border-white shadow-[0_0_15px_#38bdf8] text-white">
            <Shield className="w-6 h-6" />
          </div>
        </div>
      )}

      {accessory.id === 'wand' && (
        <div className="absolute -right-3 bottom-6 z-35 rotate-12">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-amber-400 to-pink-500 border-2 border-white shadow-[0_0_15px_#fbbf24] text-white animate-spin" style={{ animationDuration: '6s' }}>
            <Wand2 className="w-6 h-6" />
          </div>
        </div>
      )}

      {/* 8. LAYER 7: ACTIVE POWER BADGE */}
      <div
        style={{ backgroundColor: power.color }}
        className="absolute bottom-2 right-2 p-2 rounded-2xl border-2 border-white text-white shadow-xl animate-bounce z-40"
        title={power.name}
      >
        <PowerIcon className="w-4 h-4" />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. MAIN ZENTRY SIMULATOR SCREEN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const ZentrySimulatorScreen: React.FC<Props> = ({ onBack, ageTier = 'toddler', isDark = true }) => {
  // Mode Selector: Characters vs Scenes
  const [simulatorMode, setSimulatorMode] = useState<'characters' | 'scenes'>('characters');

  // Narrative Pipeline: 0: Customizer, 1: 3D Hero Card, 2: Comic Strip, 3: Real-World Camera AI Quest
  const [charStep, setCharStep] = useState<0 | 1 | 2 | 3>(0);

  // Customization States
  const [selectedSkin, setSelectedSkin] = useState(SKIN_TONES[0]);
  const [selectedHair, setSelectedHair] = useState(HAIR_STYLES[0]);
  const [selectedPower, setSelectedPower] = useState(POWERS[0]);
  const [selectedSuitColor, setSelectedSuitColor] = useState(SUIT_COLORS[0]);
  const [selectedAura, setSelectedAura] = useState<AuraConfig>(AURA_TYPES[0]);
  const [selectedAccessory, setSelectedAccessory] = useState<AccessoryConfig>(HERO_ACCESSORIES[1]);

  // Atmospheric Environment Controls
  const [activeWeather, setActiveWeather] = useState<WeatherType>('starfall');
  const [isCelestialNight, setIsCelestialNight] = useState(true);

  // Generation & Pipeline States
  const [isCreatingHero, setIsCreatingHero] = useState(false);
  const [generationPhase, setGenerationPhase] = useState('');
  const [heroResult, setHeroResult] = useState<HeroCreationResult | null>(null);

  // 3D Card Interactive Tilt
  const [cardTilt, setCardTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Camera & Real-World AI Vision Quest (Step 3)
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [roomCapturedImg, setRoomCapturedImg] = useState<string | null>(null);
  const [isAnalyzingRoom, setIsAnalyzingRoom] = useState(false);
  const [crystalPowerCharge, setCrystalPowerCharge] = useState<number>(0);
  const [roomMissionResult, setRoomMissionResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Scene Simulator States
  const [scenePrompt, setScenePrompt] = useState('');
  const [isGeneratingScene, setIsGeneratingScene] = useState(false);
  const [sceneResult, setSceneResult] = useState<SceneResult | null>(null);

  // Welcome Voice Narration
  useEffect(() => {
    voiceService.speakFeedback('¡Bienvenido al Simulador Multidimensional! Elige tu aura, accesorios y crea a tu héroe.');
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE 1: GENERATE HERO & 3D POWER STATS
  // ─────────────────────────────────────────────────────────────────────────
  const handleCreateHero = async () => {
    sounds.playTap();
    sounds.playSparkle();
    setIsCreatingHero(true);
    setGenerationPhase('Canalizando energía astral y forjando tu héroe...');

    try {
      const userPrompt = `Crea un superhéroe infantil épico (${ageTier === 'toddler' ? '2 a 5 años' : '5 a 10 años'}):
      - Piel: ${selectedSkin.label}
      - Cabello: ${selectedHair.label}
      - Superpoder: ${selectedPower.name} (${selectedPower.promptWord})
      - Aura Luminosa: ${selectedAura.name} (${selectedAura.subtitle})
      - Accesorio Clave: ${selectedAccessory.name} (${selectedAccessory.bonusStat})
      - Color del Traje: ${selectedSuitColor}
      - Clima y Entorno: ${activeWeather}, Modo ${isCelestialNight ? 'Noche Celestial' : 'Día Radiante'}.`;

      const aiResponse = await askZentryAi('character_hero_creator', userPrompt);

      let parsed: any = {};
      try {
        parsed = JSON.parse(aiResponse.trim().replace(/^```json/, '').replace(/```$/, ''));
      } catch {
        parsed = {
          heroName: 'Guardián Estelar Nexus',
          heroTitle: `Maestro del ${selectedAura.name}`,
          heroPrompt: `3D Pixar cute superhero kid with ${selectedAura.name} glowing aura, wearing ${selectedAccessory.name}, ${selectedPower.promptWord}, vibrant cinematic lighting, 8k resolution`,
          comicPanels: [
            { title: 'El Origen', caption: `¡Despierta el poder del ${selectedAura.name} en el cielo!`, soundEffect: '¡SHINE!' },
            { title: 'El Desafío', caption: `¡Un amigo galáctico necesita ayuda con su nave de cristal!`, soundEffect: '¡BOOM!' },
            { title: 'La Victoria', caption: `¡Misión cumplida usando el poder de ${selectedPower.name}!`, soundEffect: '¡VICTORIA!' }
          ],
          realWorldPlayPrompt: `¡Tu cristal cósmico necesita energía! Busca en tu habitación un objeto brillante o de color para recargarlo.`
        };
      }

      setGenerationPhase('Renderizando Carta de Poder 3D en alta resolución...');

      // High-resolution image synthesis
      const heroEncoded = encodeURIComponent(
        `${parsed.heroPrompt || '3D cute superhero toddler'}, glowing ${selectedAura.name} energy aura, ${selectedAccessory.name}, 3D Pixar masterpiece, volumetric lighting, 8k resolution`
      );
      const heroSeed = Math.floor(Math.random() * 1000000);
      const heroImgUrl = `https://image.pollinations.ai/prompt/${heroEncoded}?width=768&height=768&seed=${heroSeed}&nologo=true`;

      // Comic Panels with dynamic imagery
      const rawPanels = Array.isArray(parsed.comicPanels) ? parsed.comicPanels.slice(0, 3) : [];
      const soundBadges = ['¡BOOM!', '¡ZAP!', '¡VICTORIA!'];
      const comicPanels: ComicPanel[] = rawPanels.map((p: any, idx: number) => {
        const panelEncoded = encodeURIComponent(`${p.prompt || p.caption}, 3D cute pixar storybook style, vibrant`);
        const panelSeed = heroSeed + idx + 10;
        return {
          title: p.title || `Panel ${idx + 1}`,
          caption: p.caption || `Aventura del héroe viñeta ${idx + 1}`,
          imageUrl: `https://image.pollinations.ai/prompt/${panelEncoded}?width=600&height=450&seed=${panelSeed}&nologo=true`,
          soundEffect: p.soundEffect || soundBadges[idx % soundBadges.length]
        };
      });

      // Calculate RPG stats
      const baseStat = 80 + Math.floor(Math.random() * 12);
      const stats = {
        strength: Math.min(99, baseStat + (selectedPower.id === 'fire' || selectedPower.id === 'lightning' ? 8 : 4)),
        speed: Math.min(99, baseStat + (selectedAura.id === 'cyber' ? 10 : 5)),
        magic: Math.min(99, baseStat + (selectedAura.id === 'cosmic' || selectedAccessory.id === 'wand' ? 12 : 6)),
        defense: Math.min(99, baseStat + (selectedAccessory.id === 'shield' || selectedAccessory.id === 'helmet' ? 14 : 5)),
        cosmicPower: Math.min(100, 92 + Math.floor(Math.random() * 8))
      };

      const finalResult: HeroCreationResult = {
        heroName: parsed.heroName || 'Capitán Cósmico',
        heroTitle: parsed.heroTitle || `Guardián de la ${selectedAura.name}`,
        heroImageUrl: heroImgUrl,
        comicPanels,
        realWorldPlayPrompt: parsed.realWorldPlayPrompt || '¡Ponte tu capa imaginaria y busca una fuente de luz en tu habitación!',
        stats,
        auraName: selectedAura.name,
        accessoryName: selectedAccessory.name
      };

      sounds.playStarBurst();
      sounds.playSuccess();
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });

      setHeroResult(finalResult);
      setCharStep(1);
      voiceService.speakFeedback(`¡Tu héroe ${finalResult.heroName} ha nacido con poder de ${selectedAura.name}!`);
    } catch (err) {
      console.warn('Hero creation error:', err);
      // Fallback
      const fallbackResult: HeroCreationResult = {
        heroName: 'Guardián Estelar',
        heroTitle: `Maestro de ${selectedAura.name}`,
        heroImageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
        comicPanels: [
          { title: 'El Despertar', caption: '¡Despegando hacia las estrellas con aura brillante!', imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80', soundEffect: '¡SHINE!' },
          { title: 'La Misión', caption: '¡Usando el poder cósmico para proteger la galaxia!', imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80', soundEffect: '¡BOOM!' },
          { title: 'La Celebración', caption: '¡Victoria y fiesta con fuegos artificiales estelares!', imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80', soundEffect: '¡VICTORIA!' }
        ],
        realWorldPlayPrompt: '¡Ponte una capa imaginaria, da 3 saltos altos y rescata la energía de tu habitación!',
        stats: { strength: 92, speed: 95, magic: 98, defense: 89, cosmicPower: 96 },
        auraName: selectedAura.name,
        accessoryName: selectedAccessory.name
      };
      setHeroResult(fallbackResult);
      setCharStep(1);
      voiceService.speakFeedback('¡Tu héroe está listo para la acción!');
    } finally {
      setIsCreatingHero(false);
      setGenerationPhase('');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE 3: REAL-WORLD CAMERA AI QUEST PIPELINE
  // ─────────────────────────────────────────────────────────────────────────
  const handleStartRoomCamera = async () => {
    sounds.playTap();
    sounds.playSparkle();
    setIsCameraActive(true);
    setRoomCapturedImg(null);
    setRoomMissionResult(null);
    setCrystalPowerCharge(0);

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
      console.warn('Room camera access error:', e);
    }
  };

  const handleCaptureRoomAndEvaluate = async () => {
    if (!videoRef.current || isAnalyzingRoom) return;
    sounds.playTap();
    sounds.playSparkle();
    setIsAnalyzingRoom(true);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    setRoomCapturedImg(base64);

    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);

    // Real computer vision: analyze pixel brightness & color saturation
    let calculatedBrightness = 75;
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let totalLuma = 0;
      for (let i = 0; i < imgData.data.length; i += 40) {
        const r = imgData.data[i];
        const g = imgData.data[i + 1];
        const b = imgData.data[i + 2];
        totalLuma += 0.299 * r + 0.587 * g + 0.114 * b;
      }
      const avgLuma = totalLuma / (imgData.data.length / 40);
      calculatedBrightness = Math.min(100, Math.max(65, Math.round((avgLuma / 255) * 100 + 20)));
    } catch {
      calculatedBrightness = 88;
    }

    try {
      const response = await askZentryAi(
        'character_world_generator',
        `El niño completó la misión con su héroe ${heroResult?.heroName} (Aura ${heroResult?.auraName}). Analiza esta foto de su habitación.
        Explica cómo la luz y los objetos de su cuarto cargaron su cristal cósmico con energía real.`,
        base64
      );

      let parsed: any = {};
      try {
        parsed = JSON.parse(response.trim().replace(/^```json/, '').replace(/```$/, ''));
      } catch {
        parsed = {
          spaceObservation: 'Veo la iluminación y los colores en tu cuarto.',
          missionIdea: '¡Tu cristal absorbió la luz de la habitación y se llenó al 100% de poder astral!',
          speechFeedback: '¡Misión cumplida! Tu superhéroe ahora tiene energía infinita.'
        };
      }

      setCrystalPowerCharge(calculatedBrightness);
      sounds.playVictoryFanfare();
      sounds.playSuccess();
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });

      const missionMessage = `${parsed.missionIdea || ''} ${parsed.speechFeedback || ''}`;
      setRoomMissionResult(missionMessage);
      voiceService.speakFeedback(missionMessage);
    } catch (err) {
      setCrystalPowerCharge(95);
      sounds.playVictoryFanfare();
      confetti({ particleCount: 100, spread: 80 });
      const fallbackMission = '¡Increíble! La luz de tu cuarto recargó el cristal cósmico al 95%. ¡Eres un Guardián Legendario!';
      setRoomMissionResult(fallbackMission);
      voiceService.speakFeedback(fallbackMission);
    } finally {
      setIsAnalyzingRoom(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SCENE SIMULATOR PIPELINE
  // ─────────────────────────────────────────────────────────────────────────
  const handleSimulateScene = async (customPrompt?: string) => {
    const text = (customPrompt || scenePrompt).trim();
    if (!text || isGeneratingScene) return;

    sounds.playTap();
    sounds.playSparkle();
    setIsGeneratingScene(true);

    try {
      const response = await askZentryAi(
        'scene_simulator',
        `Simula un mundo panorámico interactivo para niños (${ageTier === 'toddler' ? '2 a 5 años' : '5 a 10 años'}). Petición: "${text}" con atmósfera ${activeWeather}.`
      );

      let parsed: any = {};
      try {
        parsed = JSON.parse(response.trim().replace(/^```json/, '').replace(/```$/, ''));
      } catch {
        parsed = {
          title: text,
          environmentType: 'fantasy',
          scenePrompt: `${text}, 3D Pixar panoramic environment, magical atmospheric lighting, 8k resolution`,
          loreStory: `Un universo fascinante donde la energía de ${text} cobra vida.`,
          interactiveElements: [
            { name: 'Portal de Luz', effect: 'Emite destellos de arcoíris' },
            { name: 'Criatura Guía', effect: 'Te saluda con un canto estelar' }
          ],
          speechFeedback: `¡Bienvenido al mundo de ${text}! ¡Explora sus misterios!`
        };
      }

      const encoded = encodeURIComponent(`${parsed.scenePrompt || text}, 3D Pixar panoramic landscape, 8k resolution, ray tracing, vibrant`);
      const seed = Math.floor(Math.random() * 1000000);
      const imgUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=576&seed=${seed}&nologo=true`;

      sounds.playSuccess();
      confetti({ particleCount: 90, spread: 80 });

      const finalScene: SceneResult = {
        title: parsed.title || text,
        imageUrl: imgUrl,
        loreStory: parsed.loreStory || 'Explora este mundo fascinante.',
        interactiveElements: parsed.interactiveElements || [],
        speechFeedback: parsed.speechFeedback || '¡Mundo simulado con éxito!'
      };

      setSceneResult(finalScene);
      voiceService.speakFeedback(finalScene.speechFeedback);
    } catch (err) {
      console.warn('Scene generation error:', err);
      const fallbackScene: SceneResult = {
        title: text,
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1024&auto=format&fit=crop&q=80',
        loreStory: 'Un universo mágico lleno de estrellas y secretos.',
        interactiveElements: [{ name: 'Estrella Fugaz', effect: 'Concede un deseo espacial' }],
        speechFeedback: '¡Hemos abierto un portal a este mundo mágico!'
      };
      setSceneResult(fallbackScene);
      voiceService.speakFeedback(fallbackScene.speechFeedback);
    } finally {
      setIsGeneratingScene(false);
    }
  };

  return (
    <ZentrySubPageScaffold
      title="Simulador"
      kicker={ageTier === 'toddler' ? 'HÉROES Y MUNDOS 3D' : 'SIMULADOR MULTIDIMENSIONAL'}
      onBack={onBack}
      isDark={isDark}
    >
      {/* Background Canvas Particles */}
      <div className="relative w-full h-full min-h-[85vh] flex flex-col justify-between overflow-hidden">
        <AtmosphericParticlesCanvas weather={activeWeather} isCelestialNight={isCelestialNight} />

        <div className="relative z-10 w-full h-full flex flex-col justify-between p-2 md:p-3 overflow-y-auto no-scrollbar select-none space-y-3 pb-12">
          {/* Top Control Bar: Mode Toggle + Weather + Celestial Day/Night */}
          <div className="flex items-center justify-between gap-2 max-w-lg mx-auto w-full">
            {/* Mode Switch: Personajes vs Escenas */}
            <div className="flex items-center p-1 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20">
              <button
                onClick={() => {
                  sounds.playTap();
                  setSimulatorMode('characters');
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  simulatorMode === 'characters'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Héroes</span>
              </button>
              <button
                onClick={() => {
                  sounds.playTap();
                  setSimulatorMode('scenes');
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  simulatorMode === 'scenes'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Escenas</span>
              </button>
            </div>

            {/* Weather & Day/Night Toolbar */}
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1 rounded-2xl border border-white/20">
              {/* Weather Quick Picker */}
              <div className="flex gap-1">
                {WEATHER_OPTIONS.slice(0, 4).map((w) => {
                  const WeatherIcon = w.Icon;
                  return (
                    <button
                      key={w.id}
                      onClick={() => {
                        sounds.playTap();
                        setActiveWeather(w.id);
                        sounds.vibrate(6);
                      }}
                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                        activeWeather === w.id
                          ? 'bg-purple-600/80 border border-white text-white scale-110 shadow-md'
                          : 'bg-white/5 hover:bg-white/15 text-slate-300'
                      }`}
                      title={w.name}
                    >
                      <WeatherIcon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>

              {/* Day / Night Celestial Toggle */}
              <button
                onClick={() => {
                  sounds.playTap();
                  setIsCelestialNight(!isCelestialNight);
                  sounds.vibrate(8);
                }}
                className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center border transition-all cursor-pointer ${
                  isCelestialNight
                    ? 'bg-indigo-950 border-purple-400 text-amber-300 shadow-[0_0_10px_#a855f7]'
                    : 'bg-amber-400 border-amber-200 text-slate-950 shadow-[0_0_10px_#fbbf24]'
                }`}
                title={isCelestialNight ? 'Modo Noche Cósmica' : 'Modo Día Radiante'}
              >
                {isCelestialNight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              MODO 1: PERSONAJES Y 3-PHASE NARRATIVE PIPELINE
          ────────────────────────────────────────────────────────────── */}
          {simulatorMode === 'characters' && (
            <>
              {/* ═════════════════════════════════════════════════════════
                  STEP 0: AVATAR CUSTOMIZER & AURA / ACCESSORY SELECTORS
              ══════════════════════════════════════════════════════════ */}
              {charStep === 0 && (
                <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-3 animate-spring-in">
                  {/* Live Avatar Preview with Layered Accessories & Glow Aura */}
                  <LayeredHeroAvatar
                    skin={selectedSkin}
                    hair={selectedHair}
                    power={selectedPower}
                    suitColor={selectedSuitColor}
                    aura={selectedAura}
                    accessory={selectedAccessory}
                  />

                  {/* Aura & Accessory Headline Badges */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${selectedAura.badgeBg} flex items-center gap-1`}>
                      <selectedAura.Icon className="w-3.5 h-3.5" />
                      <span>{selectedAura.name}</span>
                    </span>
                    {selectedAccessory.id !== 'none' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black border bg-cyan-500/20 text-cyan-200 border-cyan-400/50 flex items-center gap-1">
                        <selectedAccessory.Icon className="w-3.5 h-3.5" />
                        <span>{selectedAccessory.name} (+{selectedAccessory.bonusValue} {selectedAccessory.bonusStat})</span>
                      </span>
                    )}
                  </div>

                  {/* CUSTOMIZATION ACCORDIONS / PANELS */}
                  <div className="w-full space-y-2.5 bg-[#120E24]/90 backdrop-blur-md p-3.5 rounded-[28px] border border-purple-400/40 shadow-2xl">
                    {/* 1. Luminous Aura Selector */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Aura de Energía Luminosa</span>
                        </span>
                        <span className="text-[9px] text-purple-300 font-bold">{selectedAura.subtitle}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {AURA_TYPES.map((aura) => {
                          const isSelected = selectedAura.id === aura.id;
                          const AuraIcon = aura.Icon;
                          return (
                            <button
                              key={aura.id}
                              onClick={() => {
                                sounds.playTap();
                                sounds.playSparkle();
                                setSelectedAura(aura);
                                voiceService.speakFeedback(aura.name);
                              }}
                              style={{
                                borderColor: isSelected ? aura.primaryColor : 'rgba(255,255,255,0.15)',
                                background: isSelected
                                  ? `linear-gradient(135deg, ${aura.primaryColor}33, ${aura.secondaryColor}22)`
                                  : 'rgba(255,255,255,0.05)'
                              }}
                              className={`p-2 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                                isSelected ? 'scale-105 shadow-lg ring-1 ring-white/50' : 'hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <AuraIcon className="w-4 h-4 text-white" />
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                              </div>
                              <div className="text-[11px] font-black text-white truncate mt-1">{aura.name}</div>
                              <div className="text-[8px] text-slate-300 truncate">{aura.powerName}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Accessories Selector */}
                    <div className="space-y-1.5 pt-1 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-cyan-300" />
                          <span>Accesorios de Poder</span>
                        </span>
                        <span className="text-[9px] text-cyan-200 font-bold">
                          {selectedAccessory.name}
                        </span>
                      </div>
                      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                        {HERO_ACCESSORIES.map((acc) => {
                          const isSelected = selectedAccessory.id === acc.id;
                          const AccIcon = acc.Icon;
                          return (
                            <button
                              key={acc.id}
                              onClick={() => {
                                sounds.playTap();
                                setSelectedAccessory(acc);
                                voiceService.speakFeedback(acc.name);
                              }}
                              className={`shrink-0 px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 border-white text-white scale-105 shadow-md'
                                  : 'bg-white/10 border-white/20 text-slate-300 hover:bg-white/20'
                              }`}
                            >
                              <AccIcon className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-black whitespace-nowrap">{acc.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. Base Customization (Skin, Hair, Power, Suit) */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
                      {/* Piel */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-wide">Tono Piel</span>
                        <div className="flex gap-1.5">
                          {SKIN_TONES.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => {
                                sounds.playTap();
                                setSelectedSkin(s);
                              }}
                              style={{ backgroundColor: s.color }}
                              className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                                selectedSkin.id === s.id ? 'scale-125 border-white ring-2 ring-purple-400' : 'border-white/40'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Traje */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-wide">Color Traje</span>
                        <div className="flex gap-1.5">
                          {SUIT_COLORS.slice(0, 5).map((c) => (
                            <button
                              key={c}
                              onClick={() => {
                                sounds.playTap();
                                setSelectedSuitColor(c);
                              }}
                              style={{ backgroundColor: c }}
                              className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                                selectedSuitColor === c ? 'scale-125 border-white ring-2 ring-pink-400' : 'border-white/40'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Superpoder */}
                    <div className="space-y-1 pt-1 border-t border-white/10">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-wide">Poder Clave</span>
                      <div className="flex gap-1.5 justify-between">
                        {POWERS.map((p) => {
                          const Icon = p.icon;
                          const isSelected = selectedPower.id === p.id;
                          return (
                            <button
                              key={p.id}
                              onClick={() => {
                                sounds.playTap();
                                setSelectedPower(p);
                                voiceService.speakFeedback(p.name);
                              }}
                              style={{ backgroundColor: isSelected ? p.color : 'rgba(255,255,255,0.08)' }}
                              className={`flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1 border transition-all cursor-pointer text-white ${
                                isSelected ? 'border-white scale-105 shadow-md' : 'border-white/15'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span className="text-[9px] font-black hidden sm:inline">{p.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* GENERATE HERO CTA BUTTON */}
                  <button
                    onClick={handleCreateHero}
                    disabled={isCreatingHero}
                    className="w-full py-4 rounded-[26px] bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-600 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-2xl border-2 border-white cursor-pointer active:scale-95 transition-all zentry-spring-press disabled:opacity-50"
                  >
                    {isCreatingHero ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin text-white" />
                        <span className="text-white text-sm">{generationPhase}</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 text-amber-300 fill-amber-300 animate-bounce" />
                        <span>⚡ ¡Forjar Superhéroe 3D!</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* ═════════════════════════════════════════════════════════
                  STEP 1: 3D HERO CARD & LORE STATS (PHASE 1)
              ══════════════════════════════════════════════════════════ */}
              {charStep === 1 && heroResult && (
                <div className="w-full max-w-md mx-auto flex flex-col items-center gap-3 animate-spring-in">
                  {/* Holographic 3D Hero Card */}
                  <div
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = (e.clientX - rect.left) / rect.width - 0.5;
                      const y = (e.clientY - rect.top) / rect.height - 0.5;
                      setCardTilt({ x: x * 15, y: -y * 15 });
                    }}
                    onMouseLeave={() => setCardTilt({ x: 0, y: 0 })}
                    style={{
                      transform: `perspective(1000px) rotateY(${cardTilt.x}deg) rotateX(${cardTilt.y}deg)`,
                      transition: 'transform 0.1s ease-out'
                    }}
                    className="relative w-full rounded-[32px] p-4 bg-gradient-to-b from-[#1E1438] via-[#120E24] to-[#0A0716] border-2 border-purple-400/60 shadow-[0_0_40px_rgba(192,132,252,0.5)] overflow-hidden"
                  >
                    {/* Holographic Sheen Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none opacity-60" />

                    {/* Card Header: Title & Rank */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/15">
                      <div>
                        <div className="text-sm font-black text-white drop-shadow-md flex items-center gap-1.5">
                          <span>{heroResult.heroName}</span>
                          <span className="text-amber-300">★</span>
                        </div>
                        <div className="text-[10px] font-bold text-purple-300">{heroResult.heroTitle}</div>
                      </div>
                      <div className="px-2.5 py-1 rounded-full bg-amber-400/20 border border-amber-300/60 text-amber-300 text-[10px] font-black uppercase">
                        Rango Cósmico S+
                      </div>
                    </div>

                    {/* Hero Portrait Display */}
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-white/20 my-3 bg-black/80 shadow-inner group">
                      <img
                        src={heroResult.heroImageUrl}
                        alt={heroResult.heroName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-[9px] font-bold text-white flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-300" />
                        <span>Aura: {heroResult.auraName}</span>
                      </div>
                    </div>

                    {/* RPG Lore Stats Grid */}
                    <div className="space-y-1.5 bg-black/40 p-2.5 rounded-2xl border border-white/10">
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        {/* Fuerza */}
                        <div>
                          <div className="flex justify-between font-bold text-slate-300 mb-0.5">
                            <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-red-400" /> Fuerza</span>
                            <span className="text-white">{heroResult.stats.strength}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-red-500 to-amber-400 rounded-full" style={{ width: `${heroResult.stats.strength}%` }} />
                          </div>
                        </div>

                        {/* Velocidad */}
                        <div>
                          <div className="flex justify-between font-bold text-slate-300 mb-0.5">
                            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-cyan-400" /> Velocidad</span>
                            <span className="text-white">{heroResult.stats.speed}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" style={{ width: `${heroResult.stats.speed}%` }} />
                          </div>
                        </div>

                        {/* Magia */}
                        <div>
                          <div className="flex justify-between font-bold text-slate-300 mb-0.5">
                            <span className="flex items-center gap-1"><Wand2 className="w-3 h-3 text-purple-400" /> Magia</span>
                            <span className="text-white">{heroResult.stats.magic}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full" style={{ width: `${heroResult.stats.magic}%` }} />
                          </div>
                        </div>

                        {/* Defensa */}
                        <div>
                          <div className="flex justify-between font-bold text-slate-300 mb-0.5">
                            <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-400" /> Defensa</span>
                            <span className="text-white">{heroResult.stats.defense}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-400 to-lime-300 rounded-full" style={{ width: `${heroResult.stats.defense}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between w-full pt-1 gap-2">
                    <button
                      onClick={() => setCharStep(0)}
                      className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => {
                        sounds.playTap();
                        sounds.playSparkle();
                        setCharStep(2);
                        voiceService.speakFeedback('¡Mira tu tira cómica de aventuras!');
                      }}
                      className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl border border-white/30 cursor-pointer zentry-spring-press"
                    >
                      <span>📖 Ver Cómic Épico</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ═════════════════════════════════════════════════════════
                  STEP 2: 3-PANEL COMIC STRIP GENERATOR (PHASE 2)
              ══════════════════════════════════════════════════════════ */}
              {charStep === 2 && heroResult && (
                <div className="w-full max-w-md mx-auto flex flex-col items-center gap-3 animate-spring-in">
                  <div className="flex items-center justify-between w-full">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-300" />
                      <span>Cómic Épico de Aventuras</span>
                    </h3>
                    <span className="text-[10px] text-purple-300 font-mono font-bold bg-white/10 px-2 py-0.5 rounded-full">
                      3 Viñetas
                    </span>
                  </div>

                  {/* 3 Comic Panels Stack */}
                  <div className="w-full space-y-2.5">
                    {heroResult.comicPanels.map((panel, idx) => (
                      <div
                        key={idx}
                        className="rounded-[26px] p-3 bg-[#120E24]/95 border-2 border-purple-400/40 shadow-xl flex items-center gap-3 relative overflow-hidden group hover:border-purple-300 transition-all"
                      >
                        {/* Sound Effect Comic Badge */}
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 font-black text-[9px] -rotate-6 shadow-md">
                          {panel.soundEffect}
                        </div>

                        {/* Panel Image */}
                        <div className="w-22 h-22 rounded-2xl overflow-hidden bg-black shrink-0 border border-white/20 relative">
                          <img src={panel.imageUrl} alt={panel.title} className="w-full h-full object-cover" />
                        </div>

                        {/* Panel Lore Content */}
                        <div className="flex-1 min-w-0 pr-12">
                          <div className="text-[9px] font-black text-amber-300 uppercase tracking-wider">
                            Acto {idx + 1}: {panel.title}
                          </div>
                          <p className="text-xs font-bold text-white leading-snug mt-0.5">{panel.caption}</p>
                          <button
                            onClick={() => {
                              sounds.playTap();
                              sounds.playSparkle();
                              voiceService.speakFeedback(panel.caption);
                            }}
                            className="mt-1.5 text-[10px] text-purple-300 hover:text-white font-bold inline-flex items-center gap-1 cursor-pointer bg-white/10 px-2 py-0.5 rounded-full"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>Narrar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between w-full pt-1 gap-2">
                    <button
                      onClick={() => setCharStep(1)}
                      className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Carta 3D</span>
                    </button>

                    <button
                      onClick={() => {
                        sounds.playTap();
                        sounds.playSparkle();
                        setCharStep(3);
                        voiceService.speakFeedback(heroResult.realWorldPlayPrompt);
                      }}
                      className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl border border-white/30 cursor-pointer zentry-spring-press"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Misión en tu Habitación</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ═════════════════════════════════════════════════════════
                  STEP 3: REAL-WORLD CAMERA AI QUEST PIPELINE (PHASE 3)
              ══════════════════════════════════════════════════════════ */}
              {charStep === 3 && heroResult && (
                <div className="w-full max-w-md mx-auto flex flex-col items-center gap-3 animate-spring-in text-center">
                  {/* Quest Card Header */}
                  <div className="w-full p-4 rounded-[30px] bg-[#120E24]/95 border-2 border-amber-400/60 shadow-2xl space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Gamepad2 className="w-5 h-5 text-amber-300 animate-bounce" />
                      <h3 className="text-sm font-black text-amber-300 uppercase">Misión Física en el Mundo Real</h3>
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

                  {/* Start Camera Trigger */}
                  {!isCameraActive && !roomCapturedImg && (
                    <button
                      onClick={handleStartRoomCamera}
                      className="w-full py-4 rounded-[28px] bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-2xl border-2 border-white cursor-pointer zentry-spring-press"
                    >
                      <Camera className="w-5 h-5 text-amber-300" />
                      <span>Abrir Cámara y Escanear Habitación</span>
                    </button>
                  )}

                  {/* Live Viewfinder & Snap Button */}
                  {isCameraActive && (
                    <div className="w-full space-y-2">
                      <div className="relative w-full h-56 rounded-[28px] overflow-hidden bg-black border-3 border-purple-400 shadow-2xl flex items-center justify-center">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        {/* Viewfinder Target Crosshairs */}
                        <div className="absolute inset-8 border-2 border-dashed border-cyan-400/70 rounded-2xl pointer-events-none flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-cyan-400/50 animate-ping" />
                        </div>
                      </div>
                      <button
                        onClick={handleCaptureRoomAndEvaluate}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-pink-500 text-slate-950 font-black text-sm shadow-xl cursor-pointer zentry-spring-press flex items-center justify-center gap-2"
                      >
                        <Zap className="w-5 h-5 text-slate-950" />
                        <span>¡Escanear Luz y Cargar Cristal!</span>
                      </button>
                    </div>
                  )}

                  {/* Analyzing Spinner */}
                  {isAnalyzingRoom && (
                    <div className="p-4 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center gap-2 text-white text-xs font-bold animate-pulse">
                      <ZentryLogoIcon className="w-4 h-4 animate-spin" />
                      <span>Analizando energía de la habitación y recargando cristal...</span>
                    </div>
                  )}

                  {/* Quest Victory & Crystal Power Result */}
                  {roomMissionResult && (
                    <div className="w-full p-4 rounded-[28px] bg-gradient-to-tr from-purple-950 via-indigo-950 to-slate-950 border-2 border-emerald-400 shadow-2xl text-left space-y-3 animate-spring-in">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-black text-emerald-300 uppercase flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-amber-300" />
                          <span>¡Cristal de Poder Recargado!</span>
                        </div>
                        <span className="text-xs font-black text-emerald-400">{crystalPowerCharge}% CARGA</span>
                      </div>

                      {/* Crystal Energy Gauge */}
                      <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden border border-white/20 p-0.5">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-300 rounded-full transition-all duration-1000 shadow-[0_0_12px_#34d399]"
                          style={{ width: `${crystalPowerCharge}%` }}
                        />
                      </div>

                      <p className="text-xs font-bold text-white leading-relaxed">{roomMissionResult}</p>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5 text-amber-300 text-[10px] font-black">
                          <Award className="w-4 h-4" />
                          <span>Medalla Guardián Cósmico Desbloqueada</span>
                        </div>
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
                    </div>
                  )}

                  {/* Step Navigation */}
                  <div className="flex items-center justify-between w-full pt-2">
                    <button
                      onClick={() => setCharStep(2)}
                      className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Cómic</span>
                    </button>

                    <button
                      onClick={() => {
                        sounds.playTap();
                        setCharStep(0);
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Nuevo Héroe</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ─────────────────────────────────────────────────────────────
              MODO 2: SIMULADOR DE ESCENAS Y MUNDOS 3D
          ────────────────────────────────────────────────────────────── */}
          {simulatorMode === 'scenes' && (
            <div className="w-full max-w-md mx-auto space-y-3 animate-spring-in">
              {/* Scene Prompt Input Box */}
              <div className="rounded-[28px] p-3.5 bg-[#120E24]/90 border border-cyan-400/40 shadow-xl space-y-2.5">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-300 animate-spin" />
                  <span className="text-xs font-black text-white uppercase tracking-wide">
                    Simular Nuevo Entorno Multidimensional
                  </span>
                </div>

                <textarea
                  value={scenePrompt}
                  onChange={(e) => setScenePrompt(e.target.value)}
                  placeholder="Describe el mundo o planeta que deseas simular..."
                  rows={2}
                  className="w-full bg-white/10 text-white placeholder-slate-400 text-xs font-bold rounded-2xl p-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400 border border-white/15 resize-none"
                />

                {/* Preset Worlds Chips */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {PRESET_WORLDS.map((w) => {
                    const WorldIcon = w.Icon;
                    return (
                      <button
                        key={w.id}
                        onClick={() => {
                          sounds.playTap();
                          setScenePrompt(w.prompt);
                          handleSimulateScene(w.prompt);
                        }}
                        className="shrink-0 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white border border-white/15 cursor-pointer flex items-center gap-1.5 zentry-spring-press"
                      >
                        <WorldIcon className="w-3.5 h-3.5 text-cyan-300" />
                        <span>{w.name}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => handleSimulateScene()}
                    disabled={!scenePrompt.trim() || isGeneratingScene}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 text-white font-black text-xs flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-40 zentry-spring-press"
                  >
                    {isGeneratingScene ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Globe className="w-4 h-4 text-cyan-300" />
                    )}
                    <span>{isGeneratingScene ? 'Simulando...' : 'Simular Mundo'}</span>
                  </button>
                </div>
              </div>

              {/* Generated Scene Display */}
              {sceneResult && (
                <div className="rounded-[30px] p-3.5 bg-[#141026]/95 border border-cyan-400/50 shadow-2xl space-y-2.5 animate-spring-in">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-black text-white truncate max-w-[200px]">
                      {sceneResult.title}
                    </div>
                    <button
                      onClick={() => {
                        sounds.playTap();
                        voiceService.speakFeedback(sceneResult.loreStory);
                      }}
                      className="p-2 rounded-xl bg-white/10 text-cyan-300 hover:text-white cursor-pointer"
                      title="Escuchar historia"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-white/20 bg-black">
                    <img src={sceneResult.imageUrl} alt={sceneResult.title} className="w-full h-full object-cover" />
                  </div>

                  <p className="text-xs font-bold text-white leading-relaxed">{sceneResult.loreStory}</p>

                  {/* Interactive Elements */}
                  {sceneResult.interactiveElements.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-black text-cyan-300 uppercase tracking-wider block">
                        Elementos del Escenario:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {sceneResult.interactiveElements.map((elem, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              sounds.playSuccess();
                              voiceService.speakFeedback(`${elem.name}: ${elem.effect}`);
                            }}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 cursor-pointer zentry-spring-press"
                          >
                            <div className="text-xs font-black text-white">{elem.name}</div>
                            <div className="text-[9px] text-slate-300 truncate">{elem.effect}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ZentrySubPageScaffold>
  );
};

export default ZentrySimulatorScreen;
