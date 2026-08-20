import React from 'react';
import { Phone, Compass, Settings } from 'lucide-react';
import type { ScreenId } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';

interface Props {
  isDark: boolean;
  onNavigate: (screen: ScreenId) => void;
}

export const OSDock: React.FC<Props> = ({ isDark, onNavigate }) => {
  return (
    <div
      className={(isDark ? 'zentry-glass-dark ' : 'zentry-glass-light ') + 'w-full max-w-sm rounded-[26px] py-2 px-6 flex items-center justify-around shadow-lg'}
    >
      {/* Teléfono */}
      <button
        onClick={() => {
          sounds.playAppOpen();
          onNavigate('phone');
        }}
        className={(isDark ? 'text-white hover:bg-white/10 ' : 'text-[#3B3B58] hover:bg-black/5 ') + 'w-12 h-12 rounded-full flex items-center justify-center transition-all zentry-press cursor-pointer'}
        title="Teléfono"
      >
        <Phone className="w-6 h-6" />
      </button>

      {/* Explorar */}
      <button
        onClick={() => {
          sounds.playAppOpen();
          onNavigate('safe_search');
        }}
        className={(isDark ? 'text-white hover:bg-white/10 ' : 'text-[#3B3B58] hover:bg-black/5 ') + 'w-12 h-12 rounded-full flex items-center justify-center transition-all zentry-press cursor-pointer'}
        title="Explorar"
      >
        <Compass className="w-6 h-6" />
      </button>

      {/* Ajustes */}
      <button
        onClick={() => {
          sounds.playAppOpen();
          onNavigate('settings');
        }}
        className={(isDark ? 'text-white hover:bg-white/10 ' : 'text-[#3B3B58] hover:bg-black/5 ') + 'w-12 h-12 rounded-full flex items-center justify-center transition-all zentry-press cursor-pointer'}
        title="Configuración"
      >
        <Settings className="w-6 h-6" />
      </button>
    </div>
  );
};
