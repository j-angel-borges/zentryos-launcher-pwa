import React from 'react';
import { Lock, ShieldAlert, Clock, Sparkles } from 'lucide-react';
import type { DeviceFirestoreState } from '../../types/zentry';

interface Props {
  deviceState: DeviceFirestoreState;
  onSimulateUnlock?: () => void;
}

export const LockScreenModal: React.FC<Props> = ({ deviceState, onSimulateUnlock }) => {
  if (!deviceState.isLocked) return null;

  return (
    <div className="absolute inset-0 z-50 bg-[#060a14]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center text-white animate-in fade-in duration-300 select-none">
      <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-6 shadow-2xl shadow-rose-500/30 animate-pulse">
        <Lock className="w-10 h-10" />
      </div>

      <div className="max-w-md space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold">
          <ShieldAlert className="w-4 h-4" />
          <span>Gobernanza ZentryOS Activa</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
          Dispositivo Protegido por tus Padres
        </h2>

        <p className="text-sm text-slate-300 leading-relaxed">
          {deviceState.lockReason || 'Has alcanzado el límite de tiempo de pantalla o el horario de descanso circadiano programado.'}
        </p>

        <div className="pt-6">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-400 space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-sky-300 font-semibold">
              <Clock className="w-4 h-4" />
              <span>Siguiente sesión programada</span>
            </div>
            <div>Mañana a las 8:00 AM • Ventana de Enfoque Matutino</div>
          </div>
        </div>

        {onSimulateUnlock && (
          <div className="pt-4">
            <button
              onClick={onSimulateUnlock}
              className="text-xs text-slate-500 hover:text-slate-300 underline cursor-pointer"
            >
              [Demo: Desbloquear Simulador]
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
