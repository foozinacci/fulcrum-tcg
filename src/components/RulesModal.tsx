import React from 'react';
import { BookOpen, Shield, Swords, CircleDollarSign, Clock, Flame, Crown, X } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-fulcrum-panel border-2 border-fulcrum-gold rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-fulcrum-border flex justify-between items-center bg-black/50">
          <h2 className="font-serif font-bold text-xl text-gold-gradient flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-fulcrum-gold" />
            OFFICIAL FULCRUM TCG RULES & MECHANICS
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-200 leading-relaxed font-sans">
          {/* Section 1 */}
          <div className="space-y-1 bg-black/40 border border-white/10 rounded-xl p-3">
            <h3 className="font-serif font-bold text-amber-300 flex items-center gap-1.5 text-base">
              <CircleDollarSign className="w-4 h-4 text-emerald-400" />
              1. Resource System: Core Pool
            </h3>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
              <li><strong>Hands are fully revealed</strong> to all players.</li>
              <li>Opening hand's total Core value seeds your initial Core pool.</li>
              <li>Converting a hand card into Core is <strong>only legal the turn it is drawn</strong>.</li>
              <li>Every card has <strong>Core</strong> (value when converted) and <strong>Load</strong> (cost to cast).</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-1 bg-black/40 border border-white/10 rounded-xl p-3">
            <h3 className="font-serif font-bold text-cyan-300 flex items-center gap-1.5 text-base">
              <Clock className="w-4 h-4 text-cyan-400" />
              2. Pace & Expedite Timing
            </h3>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
              <li><strong>Pace</strong> indicates the earliest legal turn to cast a card at standard Load cost.</li>
              <li><strong>Expedite</strong>: An alternative, higher Load cost allowing a card to ignore its Pace restriction and be cast anytime!</li>
              <li>Counterspells exist at every Pace tier with Expedite baked in by default.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-1 bg-black/40 border border-white/10 rounded-xl p-3">
            <h3 className="font-serif font-bold text-amber-300 flex items-center gap-1.5 text-base">
              <Crown className="w-4 h-4 text-amber-400" />
              3. Primal Avatars & Head-Removal Damage
            </h3>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
              <li>60-card main deck + 1 required <strong>Primal Avatar</strong> in a dedicated 61st slot.</li>
              <li><strong>Primal Damage</strong> targets individual players directly and is tracked per-source.</li>
              <li><strong>Head-Removal Rule</strong>: A player is instantly eliminated once cumulative Primal Damage from a single Primal source hits half their starting life total (5 damage for 10 HP)!</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-1 bg-black/40 border border-white/10 rounded-xl p-3">
            <h3 className="font-serif font-bold text-emerald-300 flex items-center gap-1.5 text-base">
              <Swords className="w-4 h-4 text-emerald-400" />
              4. Combat & Permanent States
            </h3>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
              <li><strong>Attacking costs 1 Core</strong> per creature from your pool. Blocking is free.</li>
              <li><strong>Dormant / Alert</strong>: Permanents enter Dormant, and become Alert at the start of your turn.</li>
              <li><strong>Edge</strong> (Offense) vs <strong>Grit</strong> (Defense - resets each turn).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
