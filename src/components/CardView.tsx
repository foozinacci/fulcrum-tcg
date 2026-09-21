import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Card } from '../types/game';
import { CardSvgArt } from './CardSvgArt';
import { Shield, Swords, Crown, CircleDollarSign, Clock, Flame } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

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
  disableClickFlip?: boolean;
}

export const getPactBorderStyle = (card: Card) => {
  if (card.pact === 'Voidhallow' || (card.colors?.includes('purple') && card.colors?.includes('amber'))) {
    return 'border-purple-400 shadow-[0_0_22px_rgba(168,85,247,0.6),0_0_22px_rgba(245,158,11,0.5)] bg-gradient-to-b from-[#2e1065] via-[#120826] to-[#451a03]';
  }
  if (card.pact === 'Rotwatch' || (card.colors?.includes('purple') && card.colors?.includes('green'))) {
    return 'border-emerald-400 shadow-[0_0_22px_rgba(168,85,247,0.6),0_0_22px_rgba(16,185,129,0.5)] bg-gradient-to-b from-[#2e1065] via-[#0b1f14] to-[#064e3b]';
  }
  if (card.pact === 'Charmbrand' || (card.colors?.includes('purple') && card.colors?.includes('red'))) {
    return 'border-red-500 shadow-[0_0_22px_rgba(168,85,247,0.6),0_0_22px_rgba(239,68,68,0.5)] bg-gradient-to-b from-[#2e1065] via-[#240a16] to-[#450a0a]';
  }
  if (card.pact === 'Corefeast' || (card.colors?.includes('amber') && card.colors?.includes('green'))) {
    return 'border-amber-400 shadow-[0_0_22px_rgba(245,158,11,0.6),0_0_22px_rgba(16,185,129,0.5)] bg-gradient-to-b from-[#451a03] via-[#1a240c] to-[#064e3b]';
  }
  if (card.pact === 'Ironbound' || (card.colors?.includes('amber') && card.colors?.includes('red'))) {
    return 'border-amber-500 shadow-[0_0_22px_rgba(245,158,11,0.6),0_0_22px_rgba(239,68,68,0.5)] bg-gradient-to-b from-[#451a03] via-[#281308] to-[#450a0a]';
  }
  if (card.pact === 'Runescale' || (card.colors?.includes('green') && card.colors?.includes('red'))) {
    return 'border-emerald-400 shadow-[0_0_22px_rgba(16,185,129,0.6),0_0_22px_rgba(239,68,68,0.5)] bg-gradient-to-b from-[#064e3b] via-[#1f190c] to-[#450a0a]';
  }
  if (card.isPrimal) return 'border-fulcrum-gold shadow-[0_0_25px_rgba(243,198,105,0.7)] bg-gradient-to-b from-[#3d2a06] to-[#140b02]';
  return 'border-fulcrum-gold/70 shadow-[0_0_15px_rgba(243,198,105,0.3)] bg-gradient-to-b from-[#21183b] to-[#0c0817]';
};

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
  disableClickFlip = false,
}) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFlippingAnim, setIsFlippingAnim] = useState(false);
  const [hoverPos, setHoverPos] = useState<{ top: number; left: number } | null>(null);

  const calculateHoverPos = (rect: DOMRect) => {
    const popupWidth = 320; // 20rem = 320px
    const popupHeight = 440; // Max estimated popup height

    // Vertical placement: align with card top, but clamp between 16px and (viewport height - popupHeight - 16px)
    let top = rect.top;
    if (top + popupHeight > window.innerHeight - 16) {
      top = Math.max(16, window.innerHeight - popupHeight - 16);
    }
    if (top < 16) {
      top = 16;
    }

    // Horizontal placement: place to right of card if space allows, else left of card
    let left = rect.right + 16;
    if (left + popupWidth > window.innerWidth - 16) {
      left = rect.left - popupWidth - 16;
    }
    if (left < 16) {
      left = Math.max(16, window.innerWidth - popupWidth - 16);
    }

    return { top, left };
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isFlipped && !isDragging) {
      setIsHovered(true);
      const rect = e.currentTarget.getBoundingClientRect();
      setHoverPos(calculateHoverPos(rect));
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFlipped || isDragging || isFlippingAnim) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotation({ x: -(y / 8), y: x / 8 });

    if (!hoverPos) {
      setHoverPos(calculateHoverPos(rect));
    }
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setIsHovered(false);
    setHoverPos(null);
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

  const handleClickInternal = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) onClick();

    if (!disableClickFlip && !isFlippingAnim) {
      soundFx.playCardDrawSound();
      setIsFlippingAnim(true);

      setTimeout(() => {
        setIsFlippingAnim(false);
      }, 720);
    }
  };

  const sizeClasses = {
    sm: 'w-28 h-[168px] text-xs',
    md: 'w-40 h-[240px] text-xs',
    lg: 'w-56 h-[336px] text-sm',
  }[size];

  const currentEdge = customEdge !== undefined ? customEdge : card.edge || 0;
  const currentGrit = customGrit !== undefined ? customGrit : card.grit || 0;

  return (
    <div
      onClick={handleClickInternal}
      draggable={draggable}
      onMouseEnter={handleMouseEnter}
      onDragStart={handleDragStartInternal}
      onDragEnd={handleDragEndInternal}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative select-none perspective-1000 rounded-xl transition-all duration-300 ${sizeClasses} ${
        draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } ${isSelected ? 'ring-4 ring-fulcrum-gold scale-105 z-20 shadow-[0_0_25px_#f3c669]' : ''} ${
        isTargetable ? 'ring-4 ring-red-500 animate-pulse scale-105 z-20' : ''
      } ${isDormant ? 'opacity-60 grayscale-[40%]' : ''} ${
        isDragging ? 'opacity-40 scale-95 ring-2 ring-fulcrum-gold' : ''
      } ${className}`}
    >
      <div
        className={`w-full h-full relative transform-style-3d ${
          isFlippingAnim
            ? isFlipped
              ? 'animate-card-flip-flipped'
              : 'animate-card-flip'
            : ''
        }`}
        style={{
          transform: isFlippingAnim
            ? undefined
            : isFlipped
            ? `rotateX(${rotation.x}deg) rotateY(${180 + rotation.y}deg)`
            : `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: isFlippingAnim
            ? 'none'
            : isDragging
            ? 'none'
            : 'transform 0.15s ease-out',
        }}
      >
        {/* CARD FRONT FACE */}
        <div
          className={`absolute inset-0 w-full h-full rounded-xl border-2 p-1.5 flex flex-col justify-between overflow-hidden shadow-xl backface-hidden ${getPactBorderStyle(card)}`}
        >
          {/* Header: Full width Card Name (No truncating) */}
          <div className="flex items-center justify-center z-10 flex-shrink-0 py-0.5 px-0.5">
            <div className="font-serif font-bold text-slate-100 text-center tracking-tight text-[11px] sm:text-xs truncate w-full">
              {card.name}
            </div>
          </div>

          {/* Art: Image or SVG (Clean art view, no badges overlaying image) */}
          <div className="my-1 h-[46%] relative rounded border border-white/10 overflow-hidden bg-black/40 flex-shrink-0">
            {card.imageArtUrl ? (
              <img
                src={card.imageArtUrl}
                alt={card.name}
                className={`w-full h-full object-cover ${card.imageObjectPosition || 'object-top'}`}
              />
            ) : (
              <CardSvgArt artId={card.svgArtId} />
            )}

            {isDormant && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center text-[10px] font-bold text-slate-400 tracking-wider">
                DORMANT
              </div>
            )}
          </div>

          {/* Textbox / Description Box (Supertype centered above abilities) */}
          <div className="flex-1 bg-black/60 rounded border border-white/10 p-1 flex flex-col items-center overflow-hidden">
            <div className="text-[8.5px] font-bold tracking-wider text-amber-400/90 uppercase border-b border-white/10 pb-0.5 mb-0.5 w-full text-center flex-shrink-0">
              {card.isPrimal || card.type === 'primal_avatar' ? 'Primal Avatar' : card.type.toUpperCase()}
            </div>
            <div className="flex-1 overflow-y-auto text-center text-[8px] sm:text-[8.5px] leading-tight text-slate-200 font-sans px-0.5 whitespace-pre-line my-auto">
              {card.description}
            </div>
          </div>

          {/* Bottom Stats Bar: PACE - LOAD - CORE - EDGE - GRIT */}
          <div className="flex justify-between items-center gap-0.5 mt-1 z-10 flex-shrink-0 text-[8.5px] font-bold">
            {/* 1. PACE (Lime Green) */}
            <div className="flex items-center justify-center gap-0.5 bg-lime-950/90 border border-lime-500/80 px-1 py-0.5 rounded text-lime-300 shadow-sm min-w-[26px]">
              <Clock className="w-2.5 h-2.5 text-lime-400" />
              <span>P{card.pace}</span>
            </div>

            {/* 2. LOAD (Neon Pink) */}
            <div className="flex items-center justify-center gap-0.5 bg-pink-950/90 border border-pink-500/80 px-1 py-0.5 rounded text-pink-300 shadow-sm min-w-[22px]">
              <span className="font-serif font-black text-pink-300 text-[9.5px]">L{card.load}</span>
            </div>

            {/* 3. CORE (Neon Yellow - Blank space for Avatars) */}
            {card.coreValue !== undefined && !card.isPrimal ? (
              <div className="flex items-center justify-center gap-0.5 bg-yellow-950/90 border border-yellow-400/80 px-1 py-0.5 rounded text-yellow-300 shadow-sm min-w-[26px]">
                <CircleDollarSign className="w-2.5 h-2.5 text-yellow-400" />
                <span>+{card.coreValue}</span>
              </div>
            ) : (
              <div className="min-w-[26px] h-4" />
            )}

            {/* 4. EDGE (Cyan) */}
            {card.type === 'being' || card.type === 'primal_avatar' ? (
              <div className="flex items-center justify-center gap-0.5 bg-cyan-950/90 border border-cyan-400/80 px-1 py-0.5 rounded text-cyan-300 shadow-sm min-w-[22px]">
                <Swords className="w-2.5 h-2.5 text-cyan-400" />
                <span>{card.isDynamicStats && customEdge === undefined ? '*' : currentEdge}</span>
              </div>
            ) : (
              <div className="min-w-[22px] h-4" />
            )}

            {/* 5. GRIT (Neon Blue) */}
            {card.type === 'being' || card.type === 'primal_avatar' ? (
              <div className="flex items-center justify-center gap-0.5 bg-blue-950/90 border border-blue-400/80 px-1 py-0.5 rounded text-blue-300 shadow-sm min-w-[22px]">
                <Shield className="w-2.5 h-2.5 text-blue-400" />
                <span>{card.isDynamicStats && customGrit === undefined ? '*' : currentGrit}</span>
              </div>
            ) : (
              <div className="min-w-[22px] h-4" />
            )}
          </div>
        </div>

        {/* CARD BACK FACE */}
        <div className="absolute inset-0 w-full h-full rounded-xl overflow-hidden border-2 border-fulcrum-gold/80 shadow-2xl bg-[#0a0814] backface-hidden rotate-y-180">
          <img
            src="/assets/card-back.jpg"
            alt="FULCRUM Card Back"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* FLOATING HOVER CARD PREVIEW */}
      {isHovered && !disableHoverPreview && !isFlipped && size !== 'lg' && hoverPos &&
        ReactDOM.createPortal(
          <div
            style={{
              position: 'fixed',
              top: `${hoverPos.top}px`,
              left: `${hoverPos.left}px`,
              zIndex: 99999,
            }}
            className={`w-80 max-h-[85vh] pointer-events-none rounded-2xl border-2 p-3 shadow-2xl flex flex-col justify-between animate-in fade-in zoom-in-95 duration-150 ${getPactBorderStyle(card)}`}
          >
            <div className="flex items-center justify-center border-b border-white/10 pb-1.5 flex-shrink-0">
              <div className="font-serif font-bold text-slate-100 text-base text-center px-1 truncate">{card.name}</div>
            </div>

            <div className="my-1.5 h-40 rounded-xl overflow-hidden border border-white/10 bg-black relative shadow-inner flex-shrink-0">
              {card.imageArtUrl ? (
                <img
                  src={card.imageArtUrl}
                  alt={card.name}
                  className={`w-full h-full object-cover ${card.imageObjectPosition || 'object-top'}`}
                />
              ) : (
                <CardSvgArt artId={card.svgArtId} />
              )}
            </div>

            <div className="bg-black/70 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 flex flex-col items-center font-sans overflow-y-auto max-h-48">
              <div className="text-[10px] font-bold tracking-wider text-amber-400 uppercase border-b border-white/10 pb-0.5 mb-1 w-full text-center flex-shrink-0">
                {card.isPrimal || card.type === 'primal_avatar' ? 'Primal Avatar' : card.type.toUpperCase()}
              </div>
              <div className="font-sans text-center whitespace-pre-line leading-relaxed text-[11px] text-slate-200 w-full">
                {card.description}
              </div>
              {card.flavorText && (
                <div className="text-[10px] text-slate-400 italic font-serif mt-1.5 border-t border-white/10 pt-1 text-center w-full">
                  "{card.flavorText}"
                </div>
              )}
            </div>

            {/* Hover Preview Stats Row: PACE - LOAD - CORE - EDGE - GRIT */}
            <div className="flex justify-between items-center px-1 mt-2 font-bold text-xs flex-shrink-0">
              <div className="flex items-center gap-1 bg-lime-950 border border-lime-500 text-lime-300 px-2 py-1 rounded-md">
                <Clock className="w-3 h-3 text-lime-400" />
                <span>P{card.pace}</span>
              </div>
              <div className="flex items-center gap-1 bg-pink-950 border border-pink-500 text-pink-300 px-2 py-1 rounded-md">
                <span>L{card.load}</span>
              </div>
              {card.coreValue !== undefined && !card.isPrimal ? (
                <div className="flex items-center gap-1 bg-yellow-950 border border-yellow-400 text-yellow-300 px-2 py-1 rounded-md">
                  <CircleDollarSign className="w-3 h-3 text-yellow-400" />
                  <span>+{card.coreValue}</span>
                </div>
              ) : (
                <div className="w-8" />
              )}
              {(card.type === 'being' || card.type === 'primal_avatar') && (
                <>
                  <div className="flex items-center gap-1 bg-cyan-950 border border-cyan-400 text-cyan-300 px-2 py-1 rounded-md">
                    <Swords className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{card.isDynamicStats && customEdge === undefined ? '*' : currentEdge}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-blue-950 border border-blue-400 text-blue-300 px-2 py-1 rounded-md">
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                    <span>{card.isDynamicStats && customGrit === undefined ? '*' : currentGrit}</span>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
