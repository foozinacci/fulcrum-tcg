import React, { useState } from 'react';
import { Card } from '../types/game';
import { CardSvgArt } from './CardSvgArt';
import { Shield, Swords, Crown, CircleDollarSign, Clock, Flame } from 'lucide-react';

interface CardViewProps {
  card: Card;
  isFlipped?: boolean; // FULCRUM Card Back
  isSelected?: boolean;
  isTargetable?: boolean;
  isDormant?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  draggable?: boolean;
  className?: string;
  customEdge?: number;
  customGrit?: number;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  isFlipped = false,
  isSelected = false,
  isTargetable = false,
  isDormant = false,
  size = 'md',
  onClick,
  onDragStart,
  onDragEnd,
  draggable = false,
  className = '',
  customEdge,
  customGrit,
}) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFlipped || isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotation({ x: -(y / 8), y: x / 8 });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  const handleDragStartInternal = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', card.id);
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) onDragStart(e);
  };

  const handleDragEndInternal = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    if (onDragEnd) onDragEnd(e);
  };

  const sizeClasses = {
    sm: 'w-28 h-40 text-xs',
    md: 'w-40 h-60 text-xs',
    lg: 'w-56 h-84 text-sm',
  }[size];

  const getCardBorder = () => {
    if (card.isPrimal) return 'border-fulcrum-gold shadow-[0_0_20px_rgba(243,198,105,0.6)] bg-gradient-to-b from-[#3d2a06] to-[#140b02]';
    return 'border-fulcrum-gold/70 shadow-[0_0_12px_rgba(243,198,105,0.2)] bg-gradient-to-b from-[#21183b] to-[#0c0817]';
  };

  const currentEdge = customEdge !== undefined ? customEdge : card.edge || 0;
  const currentGrit = customGrit !== undefined ? customGrit : card.grit || 0;

  return (
    <div
      onClick={onClick}
      draggable={draggable}
      onDragStart={handleDragStartInternal}
      onDragEnd={handleDragEndInternal}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: isDragging ? 'none' : 'transform 0.15s ease-out, box-shadow 0.2s ease',
      }}
      className={`relative select-none rounded-xl transition-all duration-300 ${sizeClasses} ${
        draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } ${isSelected ? 'ring-4 ring-fulcrum-gold scale-105 z-20 shadow-[0_0_25px_#f3c669]' : ''} ${
        isTargetable ? 'ring-4 ring-red-500 animate-pulse scale-105 z-20' : ''
      } ${isDormant ? 'opacity-60 grayscale-[40%]' : ''} ${
        isDragging ? 'opacity-40 scale-95 ring-2 ring-fulcrum-gold' : ''
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
          className={`w-full h-full rounded-xl border-2 p-1.5 flex flex-col justify-between overflow-hidden relative shadow-xl ${getCardBorder()}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-1 z-10">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-200 flex items-center justify-center font-bold font-serif text-slate-950 text-xs shadow-md">
              {card.load}
            </div>

            <div className="flex-1 text-center font-serif font-bold text-slate-100 truncate px-0.5 tracking-tight text-[11px]">
              {card.name}
            </div>

            <div className="flex items-center gap-0.5 bg-slate-900/90 border border-slate-600 px-1 py-0.5 rounded text-[9px] font-bold text-slate-300">
              <Clock className="w-2.5 h-2.5 text-cyan-400" />
              <span>P{card.pace}</span>
            </div>
          </div>

          {/* Art: Image or SVG */}
          <div className="my-1 flex-1 relative rounded border border-white/10 overflow-hidden bg-black/40">
            {card.imageArtUrl ? (
              <img src={card.imageArtUrl} alt={card.name} className="w-full h-full object-cover" />
            ) : (
              <CardSvgArt artId={card.svgArtId} />
            )}

            <div className="absolute top-1 left-1 flex flex-col gap-0.5">
              {card.coreValue !== undefined && !card.isPrimal && (
                <span className="px-1 py-0.2 rounded bg-emerald-950/90 border border-emerald-500/50 text-[8px] font-bold text-emerald-300 flex items-center gap-0.5">
                  <CircleDollarSign className="w-2.5 h-2.5 text-emerald-400" /> +{card.coreValue} Core
                </span>
              )}
              {card.expediteLoad && (
                <span className="px-1 py-0.2 rounded bg-amber-950/90 border border-amber-500/50 text-[8px] font-bold text-amber-300 flex items-center gap-0.5">
                  <Flame className="w-2.5 h-2.5 text-amber-400" /> Expedite: {card.expediteLoad}
                </span>
              )}
              {card.isPrimal && (
                <span className="px-1 py-0.2 rounded bg-amber-950/90 border border-amber-400/60 text-[8px] font-bold text-amber-300 flex items-center gap-0.5">
                  <Crown className="w-2.5 h-2.5 text-amber-400" /> PRIMAL
                </span>
              )}
            </div>

            {isDormant && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center text-[10px] font-bold text-slate-400 tracking-wider">
                DORMANT
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-black/60 rounded border border-white/10 p-1 text-[9.5px] leading-tight text-slate-200 font-sans min-h-[44px] flex items-center justify-center text-center">
            {card.description}
          </div>

          {/* Stats Bar */}
          {(card.type === 'being' || card.type === 'primal_avatar') && (
            <div className="flex justify-between items-center px-1 mt-1 z-10">
              <div className="flex items-center gap-0.5 bg-amber-950/90 border border-amber-500/80 text-amber-300 font-bold px-1.5 py-0.5 rounded-full text-xs shadow-md">
                <Swords className="w-3 h-3 text-amber-400" />
                <span>{card.isDynamicStats && customEdge === undefined ? '*' : currentEdge}</span>
              </div>
              <div className="flex items-center gap-0.5 bg-blue-950/90 border border-blue-500/80 text-blue-300 font-bold px-1.5 py-0.5 rounded-full text-xs shadow-md">
                <Shield className="w-3 h-3 text-blue-400" />
                <span>{card.isDynamicStats && customGrit === undefined ? '*' : currentGrit}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
