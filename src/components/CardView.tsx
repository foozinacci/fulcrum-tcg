import React, { useState } from 'react';
import { Card } from '../types/game';
import { CardSvgArt } from './CardSvgArt';
import { Shield, Zap, Swords, Heart, Crown, CircleDollarSign, Clock } from 'lucide-react';

interface CardViewProps {
  card: Card;
  isFlipped?: boolean; // FULCRUM Card Back
  isSelected?: boolean;
  isTargetable?: boolean;
  isDormant?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  customEdge?: number;
  customGrit?: number;
  showExpedite?: boolean;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  isFlipped = false,
  isSelected = false,
  isTargetable = false,
  isDormant = false,
  size = 'md',
  onClick,
  className = '',
  customEdge,
  customGrit,
  showExpedite = false,
}) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFlipped) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotation({ x: -(y / 8), y: x / 8 });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  const sizeClasses = {
    sm: 'w-28 h-40 text-xs',
    md: 'w-40 h-60 text-xs',
    lg: 'w-56 h-84 text-sm',
  }[size];

  const getFactionBorder = () => {
    if (card.isPrimal) return 'border-fulcrum-gold shadow-[0_0_20px_rgba(243,198,105,0.6)] bg-gradient-to-b from-[#3d2a06] to-[#140b02]';
    switch (card.faction) {
      case 'sol':
        return 'border-fulcrum-gold/80 shadow-[0_0_12px_rgba(234,179,8,0.25)] bg-gradient-to-b from-[#2a1e05] to-[#120c02]';
      case 'umbra':
        return 'border-fulcrum-umbra/80 shadow-[0_0_12px_rgba(168,85,247,0.25)] bg-gradient-to-b from-[#210638] to-[#0c0217]';
      default:
        return 'border-fulcrum-aether/80 shadow-[0_0_12px_rgba(6,182,212,0.25)] bg-gradient-to-b from-[#042136] to-[#020d18]';
    }
  };

  const currentEdge = customEdge !== undefined ? customEdge : card.edge || 0;
  const currentGrit = customGrit !== undefined ? customGrit : card.grit || 0;

  return (
    <div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: 'transform 0.15s ease-out, box-shadow 0.2s ease',
      }}
      className={`relative cursor-pointer select-none rounded-xl transition-all duration-300 ${sizeClasses} ${
        isSelected ? 'ring-4 ring-fulcrum-gold scale-105 z-20 shadow-[0_0_25px_#f3c669]' : ''
      } ${isTargetable ? 'ring-4 ring-red-500 animate-pulse scale-105 z-20' : ''} ${
        isDormant ? 'opacity-60 grayscale-[40%]' : ''
      } ${className}`}
    >
      {/* CARD BACK */}
      {isFlipped ? (
        <div className="w-full h-full rounded-xl overflow-hidden border-2 border-fulcrum-gold/80 shadow-2xl relative bg-[#0a0814]">
          <img
            src="/assets/card-back.jpg"
            alt="FULCRUM Card Back"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
        </div>
      ) : (
        /* CARD FRONT */
        <div
          className={`w-full h-full rounded-xl border-2 p-1.5 flex flex-col justify-between overflow-hidden relative shadow-xl ${getFactionBorder()}`}
        >
          {/* Header: Load Cost & Pace Badge & Name */}
          <div className="flex items-center justify-between gap-1 z-10">
            {/* Load Orb */}
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-200 flex items-center justify-center font-bold font-serif text-slate-950 text-xs shadow-md">
              {showExpedite ? card.expediteLoad || card.load + 2 : card.load}
            </div>

            {/* Name */}
            <div className="flex-1 text-center font-serif font-bold text-slate-100 truncate px-0.5 tracking-tight text-[11px]">
              {card.name}
            </div>

            {/* Pace Badge */}
            <div className="flex items-center gap-0.5 bg-slate-900/90 border border-slate-600 px-1 py-0.5 rounded text-[9px] font-bold text-slate-300" title={`Pace ${card.pace}`}>
              <Clock className="w-2.5 h-2.5 text-cyan-400" />
              <span>P{card.pace}</span>
            </div>
          </div>

          {/* SVG Artwork Container */}
          <div className="my-1 flex-1 relative rounded border border-white/10 overflow-hidden bg-black/40">
            <CardSvgArt artId={card.svgArtId} faction={card.faction} />

            {/* Core Conversion & Primal Badges */}
            <div className="absolute top-1 left-1 flex flex-col gap-0.5">
              <span className="px-1 py-0.2 rounded bg-emerald-950/90 border border-emerald-500/50 text-[8px] font-bold text-emerald-300 flex items-center gap-0.5">
                <CircleDollarSign className="w-2.5 h-2.5 text-emerald-400" /> +{card.coreValue} Core
              </span>
              {card.isPrimal && (
                <span className="px-1 py-0.2 rounded bg-amber-950/90 border border-amber-400/60 text-[8px] font-bold text-amber-300 flex items-center gap-0.5">
                  <Crown className="w-2.5 h-2.5 text-amber-400" /> PRIMAL
                </span>
              )}
            </div>

            {/* Dormant / Alert Overlay */}
            {isDormant && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center text-[10px] font-bold text-slate-400 tracking-wider">
                DORMANT
              </div>
            )}
          </div>

          {/* Card Description Box */}
          <div className="bg-black/60 rounded border border-white/10 p-1 text-[9.5px] leading-tight text-slate-200 font-sans min-h-[44px] flex items-center justify-center text-center">
            {card.description}
          </div>

          {/* Stats Bar (Edge & Grit) */}
          {(card.type === 'being' || card.type === 'primal_avatar') && (
            <div className="flex justify-between items-center px-1 mt-1 z-10">
              {/* Edge (Offense) */}
              <div className="flex items-center gap-0.5 bg-amber-950/90 border border-amber-500/80 text-amber-300 font-bold px-1.5 py-0.5 rounded-full text-xs shadow-md" title="Edge (Offense)">
                <Swords className="w-3 h-3 text-amber-400" />
                <span>{currentEdge}</span>
              </div>
              {/* Grit (Defense) */}
              <div className="flex items-center gap-0.5 bg-blue-950/90 border border-blue-500/80 text-blue-300 font-bold px-1.5 py-0.5 rounded-full text-xs shadow-md" title="Grit (Defense)">
                <Shield className="w-3 h-3 text-blue-400" />
                <span>{currentGrit}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
