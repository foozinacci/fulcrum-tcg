import React from 'react';
import { BookOpen, Compass, Shield, Swords, Zap, X } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-fulcrum-panel border-2 border-fulcrum-gold rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-fulcrum-border flex justify-between items-center bg-black/50">
          <h2 className="font-serif font-bold text-xl text-gold-gradient flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-fulcrum-gold" />
            FULCRUM GAME RULES & DYNAMICS
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-200 leading-relaxed font-sans">
          {/* Section 1 */}
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-amber-300 flex items-center gap-1.5 text-base">
              <Zap className="w-4 h-4 text-amber-400" />
              1. Objective & Aether (Mana)
            </h3>
            <p className="text-xs text-slate-300">
              Each player starts with <strong>30 Nexus HP</strong> and 1 Aether. Every turn your max Aether increases by 1 (up to 10) and refills completely. Destroy the opponent's Nexus HP to achieve Victory!
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-purple-300 flex items-center gap-1.5 text-base">
              <Compass className="w-4 h-4 text-purple-400" />
              2. The Fulcrum Balance Dial
            </h3>
            <p className="text-xs text-slate-300">
              Playing <strong>Sol (Light)</strong> cards shifts the central dial towards +5. Playing <strong>Umbra (Void)</strong> cards shifts the dial towards -5. When aligned in your faction's direction, your units receive stat power buffs!
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-cyan-300 flex items-center gap-1.5 text-base">
              <Shield className="w-4 h-4 text-cyan-400" />
              3. Guard Units & Vanguard Zone
            </h3>
            <p className="text-xs text-slate-300">
              Units with <strong>GUARD</strong> shield your Nexus and non-guard allies. Enemy attacks MUST target Guard units first before attacking other targets or Nexus!
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-emerald-300 flex items-center gap-1.5 text-base">
              <Swords className="w-4 h-4 text-emerald-400" />
              4. Turn Flow
            </h3>
            <p className="text-xs text-slate-300">
              Draw Card → Refill Aether → Summon Units / Play Spells → Select Attacker & Target → End Turn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
