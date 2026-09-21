import React from 'react';
import { Sun, Moon, Compass } from 'lucide-react';

interface FulcrumDialProps {
  balance: number; // -5 to +5
}

export const FulcrumDial: React.FC<FulcrumDialProps> = ({ balance }) => {
  // Translate balance -5 to +5 into percentage 0% to 100%
  const percentage = ((balance + 5) / 10) * 100;

  const getAlignmentText = () => {
    if (balance > 2) return { text: 'Sol Domination (+1 Sol Atk)', color: 'text-amber-400' };
    if (balance > 0) return { text: 'Sol Favored', color: 'text-amber-300' };
    if (balance < -2) return { text: 'Umbra Domination (+1 Umbra Atk)', color: 'text-purple-400' };
    if (balance < 0) return { text: 'Umbra Favored', color: 'text-purple-300' };
    return { text: 'Perfect Equilibrium', color: 'text-cyan-400' };
  };

  const align = getAlignmentText();

  return (
    <div className="flex flex-col items-center justify-center bg-fulcrum-panel/90 border border-fulcrum-border rounded-xl p-2.5 shadow-2xl backdrop-blur-md w-64">
      {/* Header */}
      <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-slate-200 uppercase tracking-widest mb-1">
        <Compass className="w-4 h-4 text-fulcrum-gold animate-spin-slow" />
        <span>Fulcrum Balance</span>
      </div>

      {/* Dial Gauge Bar */}
      <div className="w-full relative my-1.5">
        {/* Faction Icons */}
        <div className="flex justify-between items-center mb-1 px-1">
          <div className="flex items-center gap-1 text-purple-400 text-[10px] font-bold">
            <Moon className="w-3 h-3" />
            <span>UMBRA (-5)</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold">
            <span>SOL (+5)</span>
            <Sun className="w-3 h-3" />
          </div>
        </div>

        {/* Meter Track */}
        <div className="w-full h-3 rounded-full bg-gradient-to-r from-purple-950 via-slate-900 to-amber-950 border border-slate-700 relative overflow-hidden">
          {/* Pointer Marker */}
          <div
            className="absolute top-0 bottom-0 w-2.5 bg-white rounded-full shadow-[0_0_10px_#ffffff] transition-all duration-500 transform -translate-x-1/2"
            style={{ left: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Alignment Status */}
      <div className={`text-[11px] font-semibold ${align.color} mt-0.5`}>
        {align.text} ({balance > 0 ? `+${balance}` : balance})
      </div>
    </div>
  );
};
