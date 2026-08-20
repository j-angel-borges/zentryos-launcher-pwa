import React from 'react';
import type { CircadianRhythm } from '../../types/zentry';

interface Props {
  circadian: CircadianRhythm;
}

export const CircadianWallpaper: React.FC<Props> = ({ circadian }) => {
  const getGradientStyles = () => {
    switch (circadian.period) {
      case 'morning':
        return {
          gradient: 'radial-gradient(circle at 20% 20%, rgba(251, 191, 36, 0.25) 0%, rgba(245, 158, 11, 0.1) 40%, transparent 70%), radial-gradient(circle at 80% 80%, rgba(56, 189, 248, 0.2) 0%, transparent 60%), linear-gradient(135deg, #090e1a 0%, #0f172a 50%, #1e1b4b 100%)',
          glowColor: '#f59e0b'
        };
      case 'day':
        return {
          gradient: 'radial-gradient(circle at 30% 10%, rgba(56, 189, 248, 0.28) 0%, rgba(14, 165, 233, 0.12) 45%, transparent 70%), radial-gradient(circle at 85% 75%, rgba(99, 102, 241, 0.2) 0%, transparent 60%), linear-gradient(135deg, #070b14 0%, #0b1528 50%, #172554 100%)',
          glowColor: '#38bdf8'
        };
      case 'evening':
        return {
          gradient: 'radial-gradient(circle at 70% 30%, rgba(236, 72, 153, 0.25) 0%, rgba(168, 85, 247, 0.15) 45%, transparent 70%), radial-gradient(circle at 20% 80%, rgba(249, 115, 22, 0.18) 0%, transparent 60%), linear-gradient(135deg, #0b0714 0%, #190b28 50%, #2e1065 100%)',
          glowColor: '#c084fc'
        };
      case 'night':
      default:
        return {
          gradient: 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.18) 0%, rgba(79, 70, 229, 0.08) 50%, transparent 70%), radial-gradient(circle at 80% 90%, rgba(139, 92, 246, 0.12) 0%, transparent 60%), linear-gradient(135deg, #05070e 0%, #090e1c 50%, #0f172a 100%)',
          glowColor: '#6366f1'
        };
    }
  };

  const style = getGradientStyles();

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 transition-all duration-1000 ease-out">
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{ background: style.gradient }}
      />
      <div 
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[100px] opacity-40 animate-pulse transition-colors duration-1000"
        style={{ backgroundColor: style.glowColor }}
      />
      <div 
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[120px] opacity-30 transition-colors duration-1000"
        style={{ backgroundColor: style.glowColor }}
      />
    </div>
  );
};
