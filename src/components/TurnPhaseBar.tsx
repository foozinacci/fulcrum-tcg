import React from 'react';
import { GamePhase } from '../types/game';
import { CircleDollarSign, Swords, Clock, Layers } from 'lucide-react';

interface TurnPhaseBarProps {
  currentPhase: GamePhase;
  turnNumber: number;
  corePool: number;
}

export const TurnPhaseBar: React.FC<TurnPhaseBarProps> = ({ currentPhase, turnNumber, corePool }) => {
  const phases: { id: GamePhase; label: string }[] = [
    { id: 'draw', label: 'Draw' },
    { id: 'conversion', label: 'Conversion' },
    { id: 'main1', label: 'Main 1' },
    { id: 'combat', label: 'Combat' },
    { id: 'main2', label: 'Main 2' },
    { id: 'end', label: 'End' },
  ];

  return (
    <div className="flex flex-col items-center justify-center bg-fulcrum-panel/90 border border-fulcrum-border rounded-xl p-2.5 shadow-2xl backdrop-blur-md w-72">
      {/* Turn & Core Display */}
      <div className="flex items-center justify-between w-full mb-2 px-1">
        <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-amber-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Turn {turnNumber} (Pace Legal: {turnNumber})</span>
        </div>

        <div className="flex items-center gap-1 bg-emerald-950 border border-emerald-500/60 px-2 py-0.5 rounded text-xs font-bold text-emerald-300">
          <CircleDollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span>{corePool} Core Pool</span>
        </div>
      </div>

      {/* Phase Stepper */}
      <div className="flex justify-between items-center w-full gap-1">
        {phases.map((p) => {
          const isActive = currentPhase === p.id;
          return (
            <div
              key={p.id}
              className={`flex-1 text-center py-1 rounded text-[9px] font-bold uppercase transition ${
                isActive
                  ? 'bg-gradient-to-r from-fulcrum-gold to-amber-500 text-slate-950 shadow-[0_0_10px_#f3c669]'
                  : 'bg-slate-900/80 text-slate-500 border border-slate-800'
              }`}
            >
              {p.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};
