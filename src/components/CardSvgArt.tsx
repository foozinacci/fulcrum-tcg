import React from 'react';

interface CardSvgArtProps {
  artId: string;
  className?: string;
}

export const CardSvgArt: React.FC<CardSvgArtProps> = ({ artId, className = '' }) => {
  const colors = { main: '#f3c669', glow: '#ffe596', bg1: '#261b04', bg2: '#0e0902' };

  const renderArtContent = () => {
    switch (artId) {
      case 'sol_sentinel':
      case 'sol_hero':
        return (
          <g>
            <circle cx="100" cy="100" r="45" fill="none" stroke={colors.main} strokeWidth="3" strokeDasharray="4 2" />
            <polygon points="100,30 140,80 125,150 100,170 75,150 60,80" fill={colors.main} fillOpacity="0.25" stroke={colors.glow} strokeWidth="2" />
            <line x1="100" y1="20" x2="100" y2="180" stroke={colors.glow} strokeWidth="4" />
            <line x1="60" y1="60" x2="140" y2="60" stroke={colors.glow} strokeWidth="3" />
            <circle cx="100" cy="100" r="15" fill={colors.glow} className="animate-pulse" />
          </g>
        );

      case 'sol_prism':
      case 'sol_spell':
        return (
          <g>
            <polygon points="100,20 160,100 100,180 40,100" fill="url(#corePrismGrad)" stroke={colors.glow} strokeWidth="2" />
            <circle cx="100" cy="100" r="30" fill="none" stroke={colors.main} strokeWidth="2" />
            <line x1="100" y1="0" x2="100" y2="200" stroke={colors.glow} strokeWidth="2" strokeDasharray="5 5" />
          </g>
        );

      default:
        return (
          <g>
            <circle cx="100" cy="100" r="55" fill="none" stroke={colors.main} strokeWidth="2" strokeDasharray="6 3" />
            <polygon points="100,40 145,85 145,135 100,160 55,135 55,85" fill={colors.main} fillOpacity="0.3" stroke={colors.glow} strokeWidth="2" />
            <circle cx="100" cy="100" r="18" fill={colors.glow} />
          </g>
        );
    }
  };

  return (
    <svg
      viewBox="0 0 200 200"
      className={`w-full h-full object-cover rounded ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="corePrismGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe596" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#f3c669" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#1a1102" stopOpacity="0.8" />
        </radialGradient>
      </defs>

      <rect width="200" height="200" fill={colors.bg2} />
      <circle cx="100" cy="100" r="90" fill={colors.bg1} fillOpacity="0.6" />
      <circle cx="100" cy="100" r="75" fill="none" stroke={colors.main} strokeOpacity="0.2" strokeWidth="1" />
      {renderArtContent()}
    </svg>
  );
};
