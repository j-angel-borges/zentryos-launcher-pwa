import React from 'react';
import { Tablet, Smartphone, Maximize2 } from 'lucide-react';
import type { DeviceFrameType } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';

interface Props {
  frameType: DeviceFrameType;
  onChangeFrame: (type: DeviceFrameType) => void;
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<Props> = ({
  frameType,
  onChangeFrame,
  children
}) => {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-6 select-none">
      {/* Top Floating Frame Switcher */}
      <div className="mb-3 flex items-center gap-2 p-1.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-xl text-xs z-50">
        <button
          onClick={() => {
            sounds.playTap();
            onChangeFrame('tablet');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
            frameType === 'tablet' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Tablet className="w-4 h-4" />
          <span>Tablet 10.1" (Kiosk)</span>
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            onChangeFrame('phone');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
            frameType === 'phone' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Smartphone</span>
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            onChangeFrame('fullscreen');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
            frameType === 'fullscreen' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Maximize2 className="w-4 h-4" />
          <span>Pantalla Completa</span>
        </button>
      </div>

      {/* Frame Container */}
      <div
        className={`relative overflow-hidden transition-all duration-500 ${
          frameType === 'tablet'
            ? 'w-full max-w-5xl h-[820px] rounded-[40px] border-[12px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] ring-1 ring-white/20'
            : frameType === 'phone'
            ? 'w-full max-w-sm h-[780px] rounded-[48px] border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] ring-1 ring-white/20'
            : 'w-full h-screen rounded-none border-none shadow-none'
        }`}
      >
        {children}
      </div>
    </div>
  );
};
