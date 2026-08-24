import React, { useState, useRef } from 'react';
import { 
  Wifi, 
  Signal, 
  Bluetooth, 
  Flashlight, 
  RotateCw, 
  Camera, 
  Shield, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  X, 
  Bell, 
  CheckCircle2, 
  Sparkles,
  Sliders,
  BookOpen
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface Props {
  isOpen: boolean;
  initialTab?: 'quick' | 'notices';
  brightness: number;
  onBrightnessChange: (val: number) => void;
  volume: number;
  onVolumeChange: (val: number) => void;
  onClose: () => void;
  isDark: boolean;
  onToggleTorch?: () => void;
  torchActive?: boolean;
}

export const ZentryTopPanels: React.FC<Props> = ({
  isOpen,
  initialTab = 'quick',
  brightness,
  onBrightnessChange,
  volume,
  onVolumeChange,
  onClose,
  isDark,
  onToggleTorch,
  torchActive = false
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'notices'>(initialTab);

  // Quick controls state
  const [wifi, setWifi] = useState(true);
  const [cellular, setCellular] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [readingMode, setReadingMode] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [shieldActive, setShieldActive] = useState(true);
  const [monkMode, setMonkMode] = useState(false);

  const startY = useRef<number | null>(null);

  if (!isOpen) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    const endY = e.changedTouches[0].clientY;
    const deltaY = endY - startY.current;
    startY.current = null;
    if (deltaY < -40) {
      sounds.playTap();
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex flex-col items-center justify-start animate-in fade-in duration-200 select-none"
      style={{ WebkitTapHighlightColor: 'transparent' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sounds.playTap();
          onClose();
        }
      }}
    >
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={(isDark ? 'zentry-glass-dark text-white ' : 'zentry-glass-light text-[#1E293B] ') + 'w-full max-w-xl rounded-b-[36px] p-5 shadow-2xl space-y-4 animate-in slide-in-from-top duration-300 border-b border-white/20'}
      >
        {/* Header with Tabs & Close */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playTap();
                setActiveTab('quick');
              }}
              className={'px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer outline-none ' + (activeTab === 'quick' ? 'bg-[#6366F1] text-white shadow-md' : 'text-slate-400 hover:text-white')}
            >
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Controles Zentry</span>
              </span>
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                setActiveTab('notices');
              }}
              className={'px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer outline-none ' + (activeTab === 'notices' ? 'bg-[#6366F1] text-white shadow-md' : 'text-slate-400 hover:text-white')}
            >
              <span className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" />
                <span>Notificaciones</span>
              </span>
            </button>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer outline-none"
            title="Cerrar panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab 1: Controles Rápidos */}
        {activeTab === 'quick' && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            {/* Focus Shield Notice Banner */}
            <div className="p-3 rounded-[20px] bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#C8B6FF] shrink-0 animate-pulse" />
              <div className="text-[11px] leading-tight">
                <div className="font-bold text-white">Escudo Digital Zentry Activo</div>
                <div className="text-slate-300">Sin algoritmos adictivos. Tu atención y privacidad están protegidas.</div>
              </div>
            </div>

            {/* Quick Toggles Grid */}
            <div className="grid grid-cols-4 gap-2">
              {/* Wi-Fi */}
              <button
                onClick={() => {
                  sounds.playTap();
                  setWifi(!wifi);
                }}
                className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'p-2.5 rounded-[18px] flex flex-col items-center gap-1 cursor-pointer zentry-press transition-all outline-none ' + (wifi ? 'border-[#8B5CF6] ring-1 ring-[#8B5CF6]/40' : 'opacity-50')}
              >
                <div className={'w-9 h-9 rounded-full flex items-center justify-center ' + (wifi ? 'bg-[#6366F1] text-white' : 'bg-white/10 text-slate-400')}>
                  <Wifi className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold">Wi-Fi</span>
              </button>

              {/* Datos Móviles */}
              <button
                onClick={() => {
                  sounds.playTap();
                  setCellular(!cellular);
                }}
                className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'p-2.5 rounded-[18px] flex flex-col items-center gap-1 cursor-pointer zentry-press transition-all outline-none ' + (cellular ? 'border-emerald-500 ring-1 ring-emerald-500/40' : 'opacity-50')}
              >
                <div className={'w-9 h-9 rounded-full flex items-center justify-center ' + (cellular ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400')}>
                  <Signal className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold">Datos</span>
              </button>

              {/* Bluetooth */}
              <button
                onClick={() => {
                  sounds.playTap();
                  setBluetooth(!bluetooth);
                }}
                className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'p-2.5 rounded-[18px] flex flex-col items-center gap-1 cursor-pointer zentry-press transition-all outline-none ' + (bluetooth ? 'border-sky-500 ring-1 ring-sky-500/40' : 'opacity-50')}
              >
                <div className={'w-9 h-9 rounded-full flex items-center justify-center ' + (bluetooth ? 'bg-sky-500 text-white' : 'bg-white/10 text-slate-400')}>
                  <Bluetooth className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold">Bluetooth</span>
              </button>

              {/* Linterna de Pantalla */}
              <button
                onClick={() => {
                  sounds.playTap();
                  onToggleTorch?.();
                }}
                className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'p-2.5 rounded-[18px] flex flex-col items-center gap-1 cursor-pointer zentry-press transition-all outline-none ' + (torchActive ? 'border-amber-400 ring-1 ring-amber-400/40 bg-amber-500/20' : 'opacity-60')}
              >
                <div className={'w-9 h-9 rounded-full flex items-center justify-center ' + (torchActive ? 'bg-amber-400 text-black' : 'bg-white/10 text-slate-400')}>
                  <Flashlight className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold">Linterna</span>
              </button>

              {/* Modo Lectura */}
              <button
                onClick={() => {
                  sounds.playTap();
                  setReadingMode(!readingMode);
                }}
                className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'p-2.5 rounded-[18px] flex flex-col items-center gap-1 cursor-pointer zentry-press transition-all outline-none ' + (readingMode ? 'border-amber-500 ring-1 ring-amber-500/40' : 'opacity-50')}
              >
                <div className={'w-9 h-9 rounded-full flex items-center justify-center ' + (readingMode ? 'bg-amber-600 text-white' : 'bg-white/10 text-slate-400')}>
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold">Lectura</span>
              </button>

              {/* Giro Automático */}
              <button
                onClick={() => {
                  sounds.playTap();
                  setAutoRotate(!autoRotate);
                }}
                className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'p-2.5 rounded-[18px] flex flex-col items-center gap-1 cursor-pointer zentry-press transition-all outline-none ' + (autoRotate ? 'border-indigo-500 ring-1 ring-indigo-500/40' : 'opacity-50')}
              >
                <div className={'w-9 h-9 rounded-full flex items-center justify-center ' + (autoRotate ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400')}>
                  <RotateCw className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold">Girar</span>
              </button>

              {/* Escudo IA */}
              <button
                onClick={() => {
                  sounds.playTap();
                  setShieldActive(!shieldActive);
                }}
                className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'p-2.5 rounded-[18px] flex flex-col items-center gap-1 cursor-pointer zentry-press transition-all outline-none ' + (shieldActive ? 'border-purple-500 ring-1 ring-purple-500/40' : 'opacity-50')}
              >
                <div className={'w-9 h-9 rounded-full flex items-center justify-center ' + (shieldActive ? 'bg-purple-600 text-white' : 'bg-white/10 text-slate-400')}>
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold">Escudo IA</span>
              </button>

              {/* Modo Noche / Concentración */}
              <button
                onClick={() => {
                  sounds.playTap();
                  setMonkMode(!monkMode);
                }}
                className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'p-2.5 rounded-[18px] flex flex-col items-center gap-1 cursor-pointer zentry-press transition-all outline-none ' + (monkMode ? 'border-rose-500 ring-1 ring-rose-500/40' : 'opacity-50')}
              >
                <div className={'w-9 h-9 rounded-full flex items-center justify-center ' + (monkMode ? 'bg-rose-500 text-white' : 'bg-white/10 text-slate-400')}>
                  <Moon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold">Silencio</span>
              </button>
            </div>

            {/* Real Hardware Sliders: Brillo y Volumen */}
            <div className="space-y-2 pt-1">
              {/* Slider Brillo */}
              <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'px-4 py-2.5 rounded-[18px] flex items-center gap-3'}>
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={brightness}
                  onChange={(e) => {
                    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                      navigator.vibrate(5);
                    }
                    onBrightnessChange(Number(e.target.value));
                  }}
                  className="w-full accent-amber-400 h-2 bg-white/20 rounded-lg cursor-pointer outline-none"
                />
                <span className="text-[10px] font-mono w-7 text-right text-slate-300">{brightness}%</span>
              </div>

              {/* Slider Volumen */}
              <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'px-4 py-2.5 rounded-[18px] flex items-center gap-3'}>
                {volume > 0 ? (
                  <Volume2 className="w-4 h-4 text-sky-400 shrink-0" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => {
                    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                      navigator.vibrate(5);
                    }
                    onVolumeChange(Number(e.target.value));
                  }}
                  className="w-full accent-sky-400 h-2 bg-white/20 rounded-lg cursor-pointer outline-none"
                />
                <span className="text-[10px] font-mono w-7 text-right text-slate-300">{volume}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Notificaciones */}
        {activeTab === 'notices' && (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 animate-in fade-in duration-150">
            <div className="p-3 rounded-[18px] bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-emerald-300">Escuela Zentry • Tarea Registrada</div>
                <div className="text-slate-300 text-[11px]">Tu documento fue guardado en tu Cloud Vault.</div>
              </div>
            </div>

            <div className="p-3 rounded-[18px] bg-indigo-500/15 border border-indigo-500/30 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-indigo-300">Tutor Zentry AI</div>
                <div className="text-slate-300 text-[11px]">Reto disponible: Geometría y Exploración Científica.</div>
              </div>
            </div>
          </div>
        )}

        {/* Drag Handle to Close */}
        <div 
          onClick={() => {
            sounds.playTap();
            onClose();
          }}
          className="pt-1 flex justify-center cursor-pointer group"
          title="Cerrar panel"
        >
          <div className="w-12 h-1.5 rounded-full bg-white/30 group-hover:bg-white/60 transition-colors" />
        </div>
      </div>
    </div>
  );
};
