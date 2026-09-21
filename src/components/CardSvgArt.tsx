import React from 'react';

interface CardSvgArtProps {
  artId: string;
  faction: 'sol' | 'umbra' | 'neutral';
  className?: string;
}

export const CardSvgArt: React.FC<CardSvgArtProps> = ({ artId, faction, className = '' }) => {
  const getGradientColors = () => {
    switch (faction) {
      case 'sol':
        return { main: '#eab308', glow: '#fef08a', bg1: '#3b1c04', bg2: '#180a02' };
      case 'umbra':
        return { main: '#a855f7', glow: '#e9d5ff', bg1: '#26043b', bg2: '#0e0218' };
      default:
        return { main: '#06b6d4', glow: '#a5f3fc', bg1: '#04273b', bg2: '#020f18' };
    }
  };

  const colors = getGradientColors();

  const renderArtContent = () => {
    switch (artId) {
      case 'sol_sentinel':
      case 'sol_hero':
        return (
          <g>
            {/* Celestial Shield & Sword */}
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
            {/* Sol Diamond Light Ray */}
            <polygon points="100,20 160,100 100,180 40,100" fill="url(#solPrismGrad)" stroke={colors.glow} strokeWidth="2" />
            <circle cx="100" cy="100" r="30" fill="none" stroke={colors.main} strokeWidth="2" />
            <line x1="100" y1="0" x2="100" y2="200" stroke={colors.glow} strokeWidth="2" strokeDasharray="5 5" />
            <line x1="0" y1="100" x2="200" y2="100" stroke={colors.glow} strokeWidth="2" strokeDasharray="5 5" />
          </g>
        );

      case 'umbra_weaver':
      case 'umbra_hero':
        return (
          <g>
            {/* Void Eye & Arcane Sigils */}
            <path d="M 20,100 Q 100,30 180,100 Q 100,170 20,100 Z" fill="url(#umbraVoidGrad)" stroke={colors.glow} strokeWidth="2" />
            <circle cx="100" cy="100" r="35" fill="#080210" stroke={colors.main} strokeWidth="3" />
            <polygon points="100,75 120,115 80,115" fill={colors.glow} />
            <circle cx="100" cy="100" r="10" fill={colors.glow} />
          </g>
        );

      case 'umbra_spell':
      case 'umbra_relic':
        return (
          <g>
            {/* Dark Star & Swirl */}
            <circle cx="100" cy="100" r="50" fill="none" stroke={colors.main} strokeWidth="2" />
            <polygon points="100,30 120,80 170,100 120,120 100,170 80,120 30,100 80,80" fill={colors.main} fillOpacity="0.4" stroke={colors.glow} strokeWidth="2" />
            <circle cx="100" cy="100" r="20" fill={colors.glow} />
          </g>
        );

      case 'neutral_golem':
      case 'neutral_relic':
        return (
          <g>
            {/* Celestial Gear / Aether Core */}
            <rect x="50" y="50" width="100" height="100" rx="15" fill="url(#neutralCoreGrad)" stroke={colors.glow} strokeWidth="3" transform="rotate(45 100 100)" />
            <circle cx="100" cy="100" r="40" fill="#031622" stroke={colors.main} strokeWidth="2" />
            <circle cx="100" cy="100" r="20" fill={colors.glow} />
            <line x1="30" y1="30" x2="170" y2="170" stroke={colors.glow} strokeWidth="2" />
            <line x1="170" y1="30" x2="30" y2="170" stroke={colors.glow} strokeWidth="2" />
          </g>
        );

      default:
        return (
          <g>
            {/* Fulcrum Core Gem */}
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
        <radialGradient id="solPrismGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#eab308" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3b1c04" stopOpacity="0.8" />
        </radialGradient>
        <radialGradient id="umbraVoidGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f5d0fe" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#a855f7" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#140224" stopOpacity="0.9" />
        </radialGradient>
        <radialGradient id="neutralCoreGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a5f3fc" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#020f18" stopOpacity="0.9" />
        </radialGradient>
      </defs>

      {/* Background Frame */}
      <rect width="200" height="200" fill={colors.bg2} />
      <circle cx="100" cy="100" r="90" fill={colors.bg1} fillOpacity="0.6" />
      
      {/* Background Grid / Geometry */}
      <circle cx="100" cy="100" r="75" fill="none" stroke={colors.main} strokeOpacity="0.2" strokeWidth="1" />
      <circle cx="100" cy="100" r="60" fill="none" stroke={colors.main} strokeOpacity="0.3" strokeWidth="1" strokeDasharray="2 4" />

      {/* Main Vector Art */}
      {renderArtContent()}
    </svg>
  );
};
