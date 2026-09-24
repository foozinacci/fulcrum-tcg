import React, { useState } from 'react';
import { Card, DraftState } from '../types/game';
import { CARD_DATABASE, PRIMAL_AVATARS_LIST } from '../data/cards';
import { CardView } from './CardView';
import { Package, Sparkles, Layers, ArrowLeft, CheckCircle2, Play, RefreshCw } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface DraftSealedModalProps {
  onBack: () => void;
  onStartDraftMatch: (deck: Card[], avatar: Card) => void;
}

export const DraftSealedModal: React.FC<DraftSealedModalProps> = ({ onBack, onStartDraftMatch }) => {
  const [eventMode, setEventMode] = useState<'sealed' | 'draft'>('sealed');
  const [draftState, setDraftState] = useState<DraftState | null>(null);

  // Generate 4x 15-card packs (60 cards pool)
  const generateSealedPool = () => {
    soundFx.playVictorySound();
    const commons = CARD_DATABASE.filter((c) => c.rarity === 'common');
    const uncommons = CARD_DATABASE.filter((c) => c.rarity === 'uncommon');
    const rares = CARD_DATABASE.filter((c) => c.rarity === 'rare');
    const pool: Card[] = [];

    // 4 Packs x (8 Common + 4 Uncommon + 2 Rare + 1 Wildcard)
    for (let p = 0; p < 4; p++) {
      for (let i = 0; i < 8; i++) pool.push(commons[Math.floor(Math.random() * commons.length)] || commons[0]);
      for (let i = 0; i < 4; i++) pool.push(uncommons[Math.floor(Math.random() * uncommons.length)] || uncommons[0]);
      for (let i = 0; i < 2; i++) pool.push(rares[Math.floor(Math.random() * rares.length)] || rares[0]);
      pool.push(CARD_DATABASE[Math.floor(Math.random() * CARD_DATABASE.length)]);
    }

    setDraftState({
      mode: 'sealed',
      activePackIndex: 0,
      picks: [],
      pool: pool,
      selectedAvatar: PRIMAL_AVATARS_LIST[0],
      isCompleted: true,
    });
  };

  // Generate 8-player simulated draft pod pack
  const generateDraftPack = () => {
    soundFx.playCardDrawSound();
    const pool: Card[] = [];
    for (let i = 0; i < 15; i++) {
      pool.push(CARD_DATABASE[Math.floor(Math.random() * CARD_DATABASE.length)]);
    }
    return pool;
  };

  const handleStartDraftPod = () => {
    soundFx.playVictorySound();
    const initialPack = generateDraftPack();
    setDraftState({
      mode: 'draft',
      activePackIndex: 1,
      picks: [],
      pool: initialPack,
      selectedAvatar: PRIMAL_AVATARS_LIST[0],
      isCompleted: false,
    });
  };

  const handlePickCard = (card: Card) => {
    if (!draftState) return;
    soundFx.playCardDrawSound();
    const nextPicks = [...draftState.picks, card];

    if (nextPicks.length >= 60) {
      setDraftState({
        ...draftState,
        picks: nextPicks,
        isCompleted: true,
      });
    } else {
      // Pass pack and open next pick
      const nextPack = generateDraftPack();
      setDraftState({
        ...draftState,
        picks: nextPicks,
        pool: nextPack,
        activePackIndex: Math.floor(nextPicks.length / 15) + 1,
      });
    }
  };

  const handleLaunchDraftMatch = () => {
    if (!draftState || !draftState.selectedAvatar) return;
    const finalDeck = draftState.mode === 'sealed' ? draftState.pool : draftState.picks;
    onStartDraftMatch(finalDeck, draftState.selectedAvatar);
  };

  return (
    <div className="w-full min-h-screen p-4 max-w-7xl mx-auto flex flex-col gap-5 text-slate-100 select-none">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-fulcrum-panel border border-fulcrum-border rounded-2xl px-6 py-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
          <div>
            <h2 className="font-serif font-black text-2xl text-gold-gradient tracking-widest uppercase flex items-center gap-2">
              <Package className="w-6 h-6 text-fulcrum-gold" />
              LIMITED FORMAT EVENTS: DRAFT & SEALED
            </h2>
            <p className="text-xs text-slate-400">Open 4x 15-Card Booster Packs (60-Card Pool) or join simulated 8-Player Draft Pods</p>
          </div>
        </div>
      </div>

      {/* Mode Selector Initial Stage */}
      {!draftState && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto">
          {/* Sealed Event Card */}
          <div className="bg-fulcrum-panel/90 border border-fulcrum-border rounded-3xl p-8 flex flex-col justify-between shadow-2xl space-y-6">
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-400 flex items-center justify-center shadow-lg">
                <Package className="w-8 h-8 text-amber-300" />
              </div>
              <h3 className="font-serif font-black text-2xl text-gold-gradient">Sealed Deck Tournament</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Open <strong>4 Booster Packs (60 Cards Pool)</strong> instantly. Pick your Primal Avatar and launch straight into competitive battle!
              </p>
            </div>

            <button
              onClick={generateSealedPool}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-fulcrum-gold via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-serif font-black uppercase text-sm tracking-widest shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Package className="w-5 h-5 fill-current" />
              <span>Open 4x Packs & Start Sealed</span>
            </button>
          </div>

          {/* Draft Pod Card */}
          <div className="bg-fulcrum-panel/90 border border-cyan-500/40 rounded-3xl p-8 flex flex-col justify-between shadow-2xl space-y-6">
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-400 flex items-center justify-center shadow-lg">
                <Layers className="w-8 h-8 text-cyan-300" />
              </div>
              <h3 className="font-serif font-black text-2xl text-cyan-300">8-Player Draft Pod</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pick 1 card per pack from simulated AI opponents across 4 pack rounds (60 picks total) to build your ultimate synergized deck!
              </p>
            </div>

            <button
              onClick={handleStartDraftPod}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-400 hover:from-cyan-500 hover:to-cyan-300 text-slate-950 font-serif font-black uppercase text-sm tracking-widest shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 fill-current" />
              <span>Enter 8-Player Draft Pod</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Draft Pod Picking Screen */}
      {draftState && !draftState.isCompleted && draftState.mode === 'draft' && (
        <div className="bg-fulcrum-panel/80 border border-fulcrum-border rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <div>
              <h3 className="font-serif font-black text-xl text-gold-gradient">
                Draft Pod — Pack #{draftState.activePackIndex} (Pick #{draftState.picks.length + 1} / 60)
              </h3>
              <p className="text-xs text-slate-400">Click a card to draft it into your deck pool</p>
            </div>
            <div className="font-mono text-xs font-bold text-amber-300 bg-black/60 border border-amber-500/40 px-3 py-1.5 rounded-xl">
              Picks Drafted: {draftState.picks.length} / 60
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-h-[60vh] overflow-y-auto p-1">
            {draftState.pool.map((card, idx) => (
              <div
                key={card.id + idx}
                onClick={() => handlePickCard(card)}
                className="cursor-pointer transition transform hover:scale-105 hover:border-fulcrum-gold rounded-xl p-1 bg-black/40 border border-white/10"
              >
                <CardView card={card} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Deck View (Sealed Pool or Completed Draft Picks) */}
      {draftState && draftState.isCompleted && (
        <div className="bg-fulcrum-panel/80 border border-fulcrum-border rounded-3xl p-6 flex flex-col gap-5 shadow-xl">
          <div className="flex flex-wrap justify-between items-center border-b border-white/10 pb-4 gap-4">
            <div>
              <h3 className="font-serif font-black text-2xl text-gold-gradient">
                {draftState.mode === 'sealed' ? 'Sealed Pool Constructed Deck' : 'Completed Draft Deck'} (60 Cards)
              </h3>
              <p className="text-xs text-slate-400">Select your Primal Avatar and launch into the tournament!</p>
            </div>

            {/* Avatar Selector */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 font-bold uppercase">Primal Avatar:</label>
              <select
                value={draftState.selectedAvatar?.id}
                onChange={(e) => {
                  const av = PRIMAL_AVATARS_LIST.find((a) => a.id === e.target.value) || PRIMAL_AVATARS_LIST[0];
                  setDraftState({ ...draftState, selectedAvatar: av });
                }}
                className="bg-slate-900 border border-fulcrum-border text-amber-300 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none"
              >
                {PRIMAL_AVATARS_LIST.map((av) => (
                  <option key={av.id} value={av.id}>
                    {av.name} ({av.pact})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleLaunchDraftMatch}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-fulcrum-gold via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-serif font-black uppercase text-xs tracking-widest shadow-xl transition transform hover:scale-105 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Enter Tournament Match!</span>
            </button>
          </div>

          {/* Cards Display Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 max-h-[60vh] overflow-y-auto p-1">
            {(draftState.mode === 'sealed' ? draftState.pool : draftState.picks).map((card, idx) => (
              <CardView key={card.id + idx} card={card} size="sm" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
