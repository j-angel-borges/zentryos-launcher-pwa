import React from 'react';

interface Props {
  className?: string;
  size?: number;
}

export const ZentryLogoIcon: React.FC<Props> = ({ className = 'w-5 h-5', size }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="zentryZGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="35%" stopColor="#C084FC" />
          <stop offset="70%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
        <filter id="zentryZGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#C084FC" floodOpacity="0.7" />
        </filter>
      </defs>

      {/* Stylized Modern Zentry 'Z' Icon */}
      <path
        d="M4.5 4.75C4.5 4.05964 5.05964 3.5 5.75 3.5H18.25C18.9404 3.5 19.5 4.05964 19.5 4.75C19.5 5.25368 19.1979 5.70425 18.7351 5.9015L9.62402 9.78442L18.4721 16.591C18.9407 16.9515 19.2227 17.5097 19.2483 18.1075C19.2783 18.8078 18.724 19.3957 18.0232 19.4257C17.9823 19.4274 17.9413 19.4274 17.9004 19.4257H5.75C5.05964 19.4257 4.5 18.8661 4.5 18.1757C4.5 17.672 4.80211 17.2215 5.26488 17.0242L14.376 13.1413L5.52787 6.33469C5.05928 5.97424 4.77732 5.41604 4.75168 4.81822C4.74868 4.74815 4.75168 4.67807 4.76067 4.60803L4.5 4.75Z"
        fill="url(#zentryZGradient)"
        filter="url(#zentryZGlow)"
      />
    </svg>
  );
};
