import React, { useState } from 'react';
import { CARD_DATABASE } from '../data/cards';
import { CardView } from './CardView';
import { ArrowLeft, FlipHorizontal, BookOpen } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface CardCodexProps {
  onBack: () => void;
}

export const CardCodex: React.FC<CardCodexProps> = ({ onBack }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const selectedCard = CARD_DATABASE[selectedIndex];

  const handleNext = () => {
    soundFx.playButtonClickSound();
    setSelectedIndex((prev) => (prev + 1) % CARD_DATABASE.length);
  };

  const handlePrev = () => {
    soundFx.playButtonClickSound();
    setSelectedIndex((prev) => (prev - 1 + CARD_DATABASE.length) % CARD_DATABASE.length);
  };

  return (
    <div className="w-full min-h-screen p-4 max-w-6xl mx-auto flex flex-col gap-6 text-slate-100 select-none">
      {/* Header */}
      <div className="flex justify-between items-center bg-fulcrum-panel border border-fulcrum-border rounded-xl px-6 py-3 shadow-xl">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </button>

        <h2 className="font-serif font-black text-xl text-gold-gradient tracking-wide flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-fulcrum-gold" />
          FULCRUM CARD CODEX
        </h2>

        <button
          onClick={() => {
            soundFx.playCardDrawSound();
            setIsFlipped(!isFlipped);
          }}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-900 border border-amber-500/60 hover:bg-slate-800 text-amber-200 text-xs font-bold transition"
        >
          <FlipHorizontal className="w-4 h-4" />
          <span>{isFlipped ? 'View Front Face' : 'View Card Back'}</span>
        </button>
      </div>

      {/* Card Inspector Stage */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-fulcrum-panel/60 border border-fulcrum-border rounded-3xl p-8 shadow-2xl backdrop-blur-md">
        {/* Left Stage */}
        <div className="flex flex-col items-center justify-center gap-4">
          <CardView card={selectedCard} isFlipped={isFlipped} size="lg" className="shadow-[0_0_35px_rgba(243,198,105,0.3)]" />

          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={handlePrev}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-600"
            >
              ← Previous
            </button>
            <span className="text-xs font-mono text-slate-400">
              {selectedIndex + 1} / {CARD_DATABASE.length}
            </span>
            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-600"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Right Stage */}
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300">
              Type: {(selectedCard.isPrimal || selectedCard.type === 'primal_avatar' ? 'Primal Avatar' : selectedCard.type).replace('_', ' ').toUpperCase()}
            </span>
            <h1 className="font-serif font-black text-3xl text-gold-gradient mt-3">
              {selectedCard.name}
            </h1>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-2xl p-4 space-y-3">
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Official FULCRUM Stats</div>
              <div className="flex flex-wrap gap-4 mt-1 text-sm font-semibold">
                <span className="text-lime-400">Pace: {selectedCard.pace}</span>
                <span className="text-pink-400">
                  Load: {selectedCard.load}{selectedCard.expediteLoad !== undefined ? ` (Expedite: ${selectedCard.expediteLoad})` : ''}
                </span>
                {selectedCard.coreValue !== undefined && !selectedCard.isPrimal && (
                  <span className="text-yellow-400">Core Value: +{selectedCard.coreValue}</span>
                )}
                {selectedCard.edge !== undefined && (
                  <span className="text-cyan-400">Edge: {selectedCard.isDynamicStats ? '*' : selectedCard.edge}</span>
                )}
                {selectedCard.grit !== undefined && (
                  <span className="text-blue-400">Grit: {selectedCard.isDynamicStats ? '*' : selectedCard.grit}</span>
                )}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ability & Timing</div>
              <p className="text-sm text-slate-200 mt-1 whitespace-pre-line leading-relaxed">{selectedCard.description}</p>
            </div>

            {selectedCard.flavorText && (
              <div className="pt-2 border-t border-white/10 italic text-xs text-slate-400 font-serif">
                "{selectedCard.flavorText}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
