import React, { useState, useRef } from 'react';
import { Card } from '../types/game';
import { CardView } from './CardView';
import { soundFx } from '../utils/soundFx';

interface Card3DViewProps {
  card: Card;
  indexInHand?: number;
  totalCardsInHand?: number;
  isDrawnThisTurn?: boolean;
  onPlayIntent?: (cardId: string) => void;
  onConvertIntent?: (cardId: string) => void;
  disabled?: boolean;
}

export const Card3DView: React.FC<Card3DViewProps> = ({
  card,
  indexInHand = 0,
  totalCardsInHand = 1,
  isDrawnThisTurn = false,
  onPlayIntent,
  onConvertIntent,
  disabled = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, rz: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Bezier Curve Hand Fan Mathematics
  const midIndex = (totalCardsInHand - 1) / 2;
  const offsetFromCenter = indexInHand - midIndex;

  // Curve Calculations
  const fanRotationAngle = offsetFromCenter * 4; // Degrees rotation along hand arc
  const fanYOffset = Math.abs(offsetFromCenter) * Math.abs(offsetFromCenter) * 3; // Parabolic arc drop

  // Mouse tilt physics for 3D depth interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isDragging) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      rx: -(y / (rect.height / 2)) * 12, // Pitch tilt
      ry: (x / (rect.width / 2)) * 12,   // Yaw tilt
      rz: fanRotationAngle,
    });
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    setIsHovered(true);
    soundFx.playButtonClickSound();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rx: 0, ry: 0, rz: fanRotationAngle });
  };

  // Drag Intent Handlers
  const handleDragStart = (e: React.DragEvent) => {
    if (disabled) return;
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', card.id);
    e.dataTransfer.effectAllowed = 'move';
    soundFx.playCardDrawSound();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setTilt({ rx: 0, ry: 0, rz: fanRotationAngle });
  };

  return (
    <div
      ref={cardRef}
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      className={`relative transition-all duration-300 ease-out select-none cursor-grab active:cursor-grabbing ${
        isHovered ? 'z-40' : 'z-10'
      }`}
      style={{
        transform: isHovered
          ? `translateY(-36px) scale(1.12) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) rotateZ(0deg) translateZ(30px)`
          : `translateY(${fanYOffset}px) rotateZ(${fanRotationAngle}deg) scale(0.95)`,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      {/* 3D Dynamic Gloss & Ambient Drop Shadow */}
      <div
        className={`relative transition-shadow duration-300 rounded-2xl ${
          isHovered
            ? 'shadow-[0_20px_35px_rgba(243,198,105,0.4)] border border-fulcrum-gold/80'
            : 'shadow-lg border border-white/10'
        }`}
      >
        <CardView card={card} size="sm" disableClickFlip={true} disableHoverPreview={true} />

        {/* Conversion Action Trigger Overlay on Hover */}
        {isHovered && !disabled && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs rounded-xl p-2 flex flex-col items-center justify-center gap-1.5 animate-in fade-in duration-150 z-50">
            {onPlayIntent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayIntent(card.id);
                }}
                className="w-full py-1.5 rounded-lg bg-gradient-to-r from-fulcrum-gold to-amber-600 text-slate-950 font-serif font-black text-[10px] uppercase tracking-wider shadow-md hover:scale-105 transition"
              >
                Propose Cast (Load {card.load})
              </button>
            )}

            {isDrawnThisTurn && onConvertIntent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onConvertIntent(card.id);
                }}
                className="w-full py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500 text-emerald-300 font-bold text-[9px] uppercase tracking-wider transition"
              >
                Convert to Core (+{card.coreValue || 1})
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
