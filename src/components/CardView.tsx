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
  disableHoverPreview?: boolean;
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
  disableHoverPreview = false,
}) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    if (!isFlipped && !isDragging) {
      setIsHovered(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFlipped || isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotation({ x: -(y / 8), y: x / 8 });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setIsHovered(false);
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
    sm: 'w-28 h-[168px] text-xs',
    md: 'w-40 h-[240px] text-xs',
    lg: 'w-56 h-[336px] text-sm',
  }[size];

  const getCardBorder = () => {
    if (card.pact === 'Voidhallow' || (card.colors?.includes('purple') && card.colors?.includes('amber'))) {
      return 'border-purple-400 shadow-[0_0_18px_rgba(168,85,247,0.5),0_0_18px_rgba(245,158,11,0.4)] bg-gradient-to-b from-[#2e1065] via-[#120826] to-[#451a03]';
    }
    if (card.pact === 'Rotwatch' || (card.colors?.includes('purple') && card.colors?.includes('green'))) {
      return 'border-emerald-400 shadow-[0_0_18px_rgba(168,85,247,0.5),0_0_18px_rgba(16,185,129,0.4)] bg-gradient-to-b from-[#2e1065] via-[#0b1f14] to-[#064e3b]';
    }
    if (card.pact === 'Charmbrand' || (card.colors?.includes('purple') && card.colors?.includes('red'))) {
      return 'border-red-500 shadow-[0_0_18px_rgba(168,85,247,0.5),0_0_18px_rgba(239,68,68,0.4)] bg-gradient-to-b from-[#2e1065] via-[#240a16] to-[#450a0a]';
    }
    if (card.pact === 'Corefeast' || (card.colors?.includes('amber') && card.colors?.includes('green'))) {
      return 'border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.5),0_0_18px_rgba(16,185,129,0.4)] bg-gradient-to-b from-[#451a03] via-[#1a240c] to-[#064e3b]';
    }
    if (card.pact === 'Ironbound' || (card.colors?.includes('amber') && card.colors?.includes('red'))) {
      return 'border-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.5),0_0_18px_rgba(239,68,68,0.4)] bg-gradient-to-b from-[#451a03] via-[#281308] to-[#450a0a]';
    }
    if (card.pact === 'Runescale' || (card.colors?.includes('green') && card.colors?.includes('red'))) {
      return 'border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.5),0_0_18px_rgba(239,68,68,0.4)] bg-gradient-to-b from-[#064e3b] via-[#1f190c] to-[#450a0a]';
    }
    if (card.isPrimal) return 'border-fulcrum-gold shadow-[0_0_20px_rgba(243,198,105,0.6)] bg-gradient-to-b from-[#3d2a06] to-[#140b02]';
    return 'border-fulcrum-gold/70 shadow-[0_0_12px_rgba(243,198,105,0.2)] bg-gradient-to-b from-[#21183b] to-[#0c0817]';
  };

  const currentEdge = customEdge !== undefined ? customEdge : card.edge || 0;
  const currentGrit = customGrit !== undefined ? customGrit : card.grit || 0;

  return (
    <div
      onClick={onClick}
      draggable={draggable}
      onMouseEnter={handleMouseEnter}
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
          <div className="flex items-center justify-between gap-1 z-10 flex-shrink-0">
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

          {/* Art: Image or SVG (Fixed 48% ratio height so all cards crop identically like Grothmaw) */}
          <div className="my-1 h-[48%] relative rounded border border-white/10 overflow-hidden bg-black/40 flex-shrink-0">
            {card.imageArtUrl ? (
              <img
                src={card.imageArtUrl}
                alt={card.name}
                className={`w-full h-full object-cover ${card.imageObjectPosition || 'object-top'}`}
              />
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
          <div className="flex-1 bg-black/60 rounded border border-white/10 p-1 text-[9.5px] leading-tight text-slate-200 font-sans flex items-center justify-center text-center overflow-hidden">
            {card.description}
          </div>

          {/* Stats Bar */}
          {(card.type === 'being' || card.type === 'primal_avatar') && (
            <div className="flex justify-between items-center px-1 mt-1 z-10 flex-shrink-0">
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

      {/* FLOATING HOVER CARD PREVIEW */}
      {isHovered && !disableHoverPreview && !isFlipped && size !== 'lg' && (
        <div className="fixed bottom-6 right-6 z-50 w-72 h-[420px] pointer-events-none rounded-2xl border-2 border-fulcrum-gold bg-[#0f0a1c] p-3 shadow-[0_0_40px_rgba(243,198,105,0.5)] flex flex-col justify-between animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-serif font-black flex items-center justify-center text-sm shadow-md">
              {card.load}
            </div>
            <div className="font-serif font-bold text-slate-100 text-sm truncate px-1">{card.name}</div>
            <div className="text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-600 font-bold text-cyan-400">
              Pace {card.pace}
            </div>
          </div>

          <div className="my-2 flex-1 rounded-xl overflow-hidden border border-white/10 bg-black relative shadow-inner">
            {card.imageArtUrl ? (
              <img
                src={card.imageArtUrl}
                alt={card.name}
                className={`w-full h-full object-cover ${card.imageObjectPosition || 'object-top'}`}
              />
            ) : (
              <CardSvgArt artId={card.svgArtId} />
            )}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {card.isPrimal && (
                <span className="px-2 py-0.5 rounded-md bg-amber-950/95 border border-amber-400 text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <Crown className="w-3 h-3 text-amber-400" /> PRIMAL AVATAR
                </span>
              )}
            </div>
          </div>

          <div className="bg-black/70 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 space-y-1 text-center font-sans">
            <div className="font-semibold">{card.description}</div>
            {card.flavorText && <div className="text-[11px] text-slate-400 italic font-serif mt-1">{card.flavorText}</div>}
          </div>

          {(card.type === 'being' || card.type === 'primal_avatar') && (
            <div className="flex justify-between items-center px-2 mt-2">
              <div className="flex items-center gap-1 bg-amber-950 border border-amber-500 text-amber-300 font-bold px-3 py-1 rounded-full text-xs shadow-md">
                <Swords className="w-3.5 h-3.5 text-amber-400" />
                <span>Edge: {card.isDynamicStats && customEdge === undefined ? '*' : currentEdge}</span>
              </div>
              <div className="flex items-center gap-1 bg-blue-950 border border-blue-500 text-blue-300 font-bold px-3 py-1 rounded-full text-xs shadow-md">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Grit: {card.isDynamicStats && customGrit === undefined ? '*' : currentGrit}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
