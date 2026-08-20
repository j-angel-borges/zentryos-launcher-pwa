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
  Sliders
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface Props {
  isOpen: boolean;
  initialTab?: 'quick' | 'notices';
  onClose: () => void;
  isDark: boolean;
}

export const ZentryTopPanels: React.FC<Props> = ({
  isOpen,
  initialTab = 'quick',
  onClose,
  isDark
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'notices'>(initialTab);

  // Quick controls state
  const [wifi, setWifi] = useState(true);
  const [cellular, setCellular] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [torch, setTorch] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [shieldActive, setShieldActive] = useState(true);
  const [monkMode, setMonkMode] = useState(false);

  const [brightness, setBrightness] = useState(85);
  const [volume, setVolume] = useState(70);

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
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex flex-col items-center justify-start animate-in fade-in duration-200"
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
        className={(isDark ? 'zentry-glass-dark text-white ' : 'zentry-glass-light text-[#1E293B] ') + 'w-full max-w-xl rounded-b-[36px] p-6 shadow-2xl space-y-4 animate-in slide-in-from-top duration-300'}
      >
        {/* Header with Tabs & Close */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playTap();
                setActiveTab('quick');
              }}
              className={'px-3 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ' + (activeTab === 'quick' ? 'bg-[#6366F1] text-white shadow-md' : 'text-slate-400 hover:text-white')}
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
              className={'px-3 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ' + (activeTab === 'notices' ? 'bg-[#6366F1] text-white shadow-md' : 'text-slate-400 hover:text-white')}
            >
              <span className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" />
                <span>Feed de Conciencia</span>
              </span>
            </button>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Cerrar panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab 1: Controles Rápidos */}
        {activeTab === 'quick' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Focus Shield Notice Banner matching CircadianTimerOverlay in Android */}
            <div className="p-3.5 rounded-[22px] bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#C8B6FF] shrink-0 animate-pulse" />
              <div className="text-[11px] leading-tight">
                <div className="font-bold text-white">Escudo Digital Zentry Activo</div>
                <div className="text-slate-300">Sin algoritmos adictivos ni distracciones. Tu enfoque está protegido.</div>
              </div>
            </div>

            {/* Quick Toggles Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {/* Wi-Fi */}
              <button
                onClick={() => {
                  sounds.playTap();
                  setWifi(!wifi);
                }}
                className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'p-3 rounded-[20px] flex flex-col items-center gap-1.5 cursor-pointer zentry-press transition-all ' + (wifi ? 'border-[#8B5CF6] ring-1 ring-[#8B5CF6]/40' : 'opacity-60')}
              >
                <div className={'w-10 h-10 rounded-full flex items-center justify-center ' + (wifi ? 'bg-[#6366F1] text-white' : 'bg-white/10 text-slate-400')}>
                  <Wifi className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold">Wi-Fi</span>
                <span className="text-[9px] text-slate-400 truncate max-w-[70px]">{wifi ? 'Zentry_5G' : 'Desactivado'}</span>
              </button>

              {/* Datos Móviles */}
              <button
                onClick={() => {
                  sounds.playTap();
                  setCellular(!cellular);
                }}
                className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'p-3 rounded-[20px] flex flex-col items-center gap-1.5 cursor-pointer zentry-press transition-all ' + (cellular ? 'border-emerald-500 ring-1 ring-emerald-500/40' : 'opacity-60')}
              >
                <div className={'w-10 h-10 rounded-full flex items-center justify-center ' + (cellular ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400')}>
                  <Signal className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold">Datos</span>
                <span className="text-[9px] text-slate-400">{cellular ? '4G LTE' : 'Off'}</span>
              </button>

              {/* Bluetooth */}
              <button
                onClick={() => {
                  sounds.playTap();
                  setBluetooth(!bluetooth);
                }}
                className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'p-3 rounded-[20px] flex flex-col items-center gap-1.5 cursor-pointer zentry-press transition-all ' + (bluetooth ? 'border-sky-500 ring-1 ring-sky-500/40' : 'opacity-60')}
              >
                <div className={'w-10 h-10 rounded-full flex items-center justify-center ' + (bluetooth ? 'bg-sky-500 text-white' : 'bg-white/10 text-slate-400')}>
                  <Bluetooth className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold">Bluetooth</span>
                <span className="text-[9px] text-slate-400">{bluetooth ? 'Activo' : 'Off'}</span>
              </button>

              {/* Linterna */}
              <button
                onClick={() => {
                  sounds.playTap();
                  setTorch(!torch);
                }}
                className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'p-3 rounded-[20px] flex flex-col items-center gap-1.5 cursor-pointer zentry-press transition-all ' + (torch ? 'border-amber-500 ring-1 ring-amber-500/40' : 'opacity-60')}
              >
                <div className={'w-10 h-10 rounded-full flex items-center justify-center ' + (torch ? 'bg-amber-500 text-white' : 'bg-white/10 text-slate-400')}>
                  <Flashlight className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold">Linterna</span>
                <span className="text-[9px] text-slate-400">{torch ? 'Encendida' : 'Apagada'}</span>
              </button>

              {/* Giro Automático */}
              <button
                onClick={() => {
                  sounds.playTap();
                  setAutoRotate(!autoRotate);
                }}
                className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'p-3 rounded-[20px] flex flex-col items-center gap-1.5 cursor-pointer zentry-press transition-all ' + (autoRotate ? 'border-indigo-500' : 'opacity-60')}
              >
                <div className={'w-10 h-10 rounded-full flex items-center justify-center ' + (autoRotate ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400')}>
                  <RotateCw className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold">Girar</span>
                <span className="text-[9px] text-slate-400">{autoRotate ? 'Auto' : 'Bloqueado'}</span>
              </button>

              {/* Captura de Pantalla */}
              <button
                onClick={() => {
                  sounds.playSuccess();
                  alert('📸 Captura de pantalla guardada en Galería Zentry');
                }}
                className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'p-3 rounded-[20px] flex flex-col items-center gap-1.5 cursor-pointer zentry-press'}
              >
                <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold">Captura</span>
                <span className="text-[9px] text-slate-400">Instantánea</span>
              </button>

              {/* Escudo IA */}
              <button
                onClick={() => {
                  sounds.playTap();
                  setShieldActive(!shieldActive);
                }}
                className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'p-3 rounded-[20px] flex flex-col items-center gap-1.5 cursor-pointer zentry-press transition-all ' + (shieldActive ? 'border-purple-500' : 'opacity-60')}
              >
                <div className={'w-10 h-10 rounded-full flex items-center justify-center ' + (shieldActive ? 'bg-purple-600 text-white' : 'bg-white/10 text-slate-400')}>
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold">Escudo IA</span>
                <span className="text-[9px] text-slate-400">{shieldActive ? 'Protegido' : 'Pausado'}</span>
              </button>

              {/* Modo Monje */}
              <button
                onClick={() => {
                  sounds.playTap();
                  setMonkMode(!monkMode);
                }}
                className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'p-3 rounded-[20px] flex flex-col items-center gap-1.5 cursor-pointer zentry-press transition-all ' + (monkMode ? 'border-rose-500' : 'opacity-60')}
              >
                <div className={'w-10 h-10 rounded-full flex items-center justify-center ' + (monkMode ? 'bg-rose-500 text-white' : 'bg-white/10 text-slate-400')}>
                  <Moon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold">Modo Monje</span>
                <span className="text-[9px] text-slate-400">{monkMode ? 'Sin Notifs' : 'Normal'}</span>
              </button>
            </div>

            {/* Tactile Sliders: Brillo y Volumen */}
            <div className="space-y-2 pt-1">
              {/* Slider Brillo */}
              <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'px-4 py-2.5 rounded-[18px] flex items-center gap-3'}>
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-amber-400 h-1.5 bg-white/20 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] font-mono w-7 text-right text-slate-400">{brightness}%</span>
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
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full accent-sky-400 h-1.5 bg-white/20 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] font-mono w-7 text-right text-slate-400">{volume}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Feed de Conciencia (Notificaciones) */}
        {activeTab === 'notices' && (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1 animate-in fade-in duration-150">
            <div className="p-3.5 rounded-[20px] bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-emerald-300">Escuela San Agustín • Tarea Entregada</div>
                <div className="text-slate-300 text-[11px]">Tu ensayo de historia fue calificado con nota sobresaliente (AD).</div>
              </div>
            </div>

            <div className="p-3.5 rounded-[20px] bg-indigo-500/15 border border-indigo-500/30 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-indigo-300">Tutor Socrático Zentry</div>
                <div className="text-slate-300 text-[11px]">Nuevo reto de matemáticas disponible: Fracciones y Geometría 3D.</div>
              </div>
            </div>

            <div className="p-3.5 rounded-[20px] bg-white/10 border border-white/15 flex items-center gap-3 opacity-70">
              <Shield className="w-5 h-5 text-slate-300 shrink-0" />
              <div className="text-xs">
                <div className="font-bold">Notificación de Red Social Filtrada</div>
                <div className="text-slate-400 text-[11px]">Las alertas adictivas fueron disueltas pacíficamente durante tu ventana de estudio.</div>
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
          className="pt-2 flex justify-center cursor-pointer group"
          title="Desliza hacia arriba o haz clic para cerrar"
        >
          <div className="w-12 h-1.5 rounded-full bg-white/30 group-hover:bg-white/60 transition-colors" />
        </div>
      </div>
    </div>
  );
};
