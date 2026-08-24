import React, { useState } from 'react';
import { Wallpaper, Lock, Shield, Check, Smartphone, ExternalLink, Copy } from 'lucide-react';
import type { WallpaperId, AgeTier } from '../../types/zentry';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { getStoredDeviceId, setStoredDeviceId, syncRealDeviceTelemetry } from '../../services/firebase';

interface Props {
  onBack: () => void;
  currentWallpaper: WallpaperId;
  onSelectWallpaper: (id: WallpaperId) => void;
  ageTier?: AgeTier;
  onSelectAgeTier?: (tier: AgeTier) => void;
  isDark: boolean;
}

export const ZentrySettingsScreen: React.FC<Props> = ({
  onBack,
  currentWallpaper,
  onSelectWallpaper,
  isDark
}) => {
  const [deviceId, setDeviceId] = useState(getStoredDeviceId);
  const [isEditingId, setIsEditingId] = useState(false);
  const [tempId, setTempId] = useState(deviceId);
  const [copied, setCopied] = useState(false);

  const wallpapers: { id: WallpaperId; name: string; color: string }[] = [
    { id: 'Glacial', name: 'Glacial', color: '#F1F5F9' },
    { id: 'Lila', name: 'Lila', color: '#E9E3FF' },
    { id: 'Aura', name: 'Aura', color: '#FFE8E8' },
    { id: 'Brisa', name: 'Brisa', color: '#E3F2FD' },
    { id: 'Espacio', name: 'Espacio', color: '#26262B' }
  ];

  const handleSaveDeviceId = () => {
    if (!tempId.trim()) return;
    sounds.playSuccess();
    setStoredDeviceId(tempId.trim());
    setDeviceId(tempId.trim());
    setIsEditingId(false);
    syncRealDeviceTelemetry(tempId.trim());
  };

  const handleCopy = () => {
    sounds.playTap();
    navigator.clipboard.writeText(deviceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ZentrySubPageScaffold title="Configuración" kicker="SISTEMA" onBack={onBack} isDark={isDark}>
      <div className="max-w-lg mx-auto w-full space-y-3 pb-4">
        {/* 1. PARENT DASHBOARD & FIRESTORE PAIRING CARD */}
        <div className={(isDark ? 'zentry-veil-dark border-indigo-500/30 ' : 'zentry-veil-light border-indigo-400/50 ') + 'rounded-[24px] p-4 space-y-3 border shadow-sm'}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
              <Smartphone className="w-4 h-4" />
              <span>Vinculación con Dashboard de Padres</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>En Vivo</span>
            </div>
          </div>

          <div className="p-3 rounded-[18px] bg-black/20 space-y-2 border border-white/10">
            <div className="text-[11px] text-slate-300">
              Identificador único de este dispositivo en Firestore:
            </div>

            {isEditingId ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tempId}
                  onChange={(e) => setTempId(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white/10 text-xs font-mono font-bold text-white border border-indigo-400 focus:outline-none"
                  placeholder="ID del dispositivo..."
                />
                <button
                  onClick={handleSaveDeviceId}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer zentry-press"
                >
                  Guardar
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-amber-300 bg-white/10 px-2.5 py-1 rounded-lg">
                  {deviceId}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-[11px] flex items-center gap-1 cursor-pointer"
                    title="Copiar ID"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setTempId(deviceId);
                      setIsEditingId(true);
                    }}
                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-[11px] cursor-pointer"
                  >
                    Cambiar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              Abre el portal de supervisión para padres:
            </span>
            <button
              onClick={() => {
                sounds.playTap();
                window.open('https://zentry-parent-dashboard.vercel.app/', '_blank');
              }}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[11px] font-bold shadow-md flex items-center gap-1.5 cursor-pointer zentry-press"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir Dashboard</span>
            </button>
          </div>
        </div>

        {/* 2. WALLPAPERS */}
        <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[22px] p-4 space-y-3'}>
          <div className="flex items-center gap-2 text-xs font-bold">
            <Wallpaper className="w-4 h-4 text-[#8B5CF6]" />
            <span>Lienzo Vivo (Wallpaper Circadiano)</span>
          </div>
          <div className="flex items-center gap-3">
            {wallpapers.map((wp) => {
              const active = currentWallpaper === wp.id;
              return (
                <button
                  key={wp.id}
                  onClick={() => {
                    sounds.playTap();
                    onSelectWallpaper(wp.id);
                  }}
                  style={{ backgroundColor: wp.color }}
                  className={'w-9 h-9 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ' + (active ? 'border-[#8B5CF6] scale-110 shadow-lg' : 'border-white/40')}
                  title={wp.name}
                >
                  {active && <Check className="w-4 h-4 text-[#4A306D]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. SECURITY & PIN */}
        <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[22px] p-4 space-y-2'}>
          <div className="flex items-center gap-2 text-xs font-bold">
            <Lock className="w-4 h-4 text-[#8B5CF6]" />
            <span>Seguridad y PIN de Acceso</span>
          </div>
          <div className="text-xs text-slate-400">PIN de desbloqueo de emergencia: 1234</div>
        </div>

        {/* 4. KIOSK ATTRIBUTION */}
        <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[22px] p-4 space-y-1'}>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Shield className="w-4 h-4" />
            <span>Administrador de Dispositivo Zentry</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Escudo contra algoritmos adictivos y sincronización de telemetría activa.
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-500 pt-1">
          ZentryOS 2026 • v1.3.0 - cloud connected
        </div>
      </div>
    </ZentrySubPageScaffold>
  );
};
