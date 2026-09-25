import React, { useState, useEffect } from 'react';
import { Card } from '../types/game';
import { CARD_DATABASE, PRIMAL_AVATARS_LIST } from '../data/cards';
import { CardView } from './CardView';
import { Plus, Trash2, Save, Filter } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface DeckBuilderProps {
  onBack: () => void;
  onSaveDeck: (customDeck: Card[], primalAvatar?: Card) => void;
}

const PACT_OPTIONS = [
  { id: 'all', name: 'All Pacts' },
  { id: 'Corefeast', name: 'Corefeast' },
  { id: 'Voidhallow', name: 'Voidhallow' },
  { id: 'Runescale', name: 'Runescale' },
  { id: 'Charmbrand', name: 'Charmbrand' },
  { id: 'Rotwatch', name: 'Rotwatch' },
  { id: 'Ironbound', name: 'Ironbound' },
];

const CARD_TYPE_OPTIONS = [
  { id: 'all', name: 'All Card Types' },
  { id: 'attachment', name: 'Attachments' },
  { id: 'primal_avatar', name: 'Avatars' },
  { id: 'being', name: 'Beings' },
  { id: 'charm', name: 'Charms' },
  { id: 'relic', name: 'Relics' },
  { id: 'rune', name: 'Runes' },
];

export const DeckBuilder: React.FC<DeckBuilderProps> = ({ onBack, onSaveDeck }) => {
  const [currentDeck, setCurrentDeck] = useState<Card[]>([]);
  const [selectedPrimalAvatar, setSelectedPrimalAvatar] = useState<Card>(PRIMAL_AVATARS_LIST[1] || PRIMAL_AVATARS_LIST[0]);
  const [pactFilter, setPactFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [deckName, setDeckName] = useState('Custom Fulcrum Deck');

  useEffect(() => {
    const savedAvatarId = localStorage.getItem('fulcrum_primal_avatar_id');
    if (savedAvatarId) {
      const found = PRIMAL_AVATARS_LIST.find((a) => a.id === savedAvatarId);
      if (found) setSelectedPrimalAvatar(found);
    }
  }, []);

  const addCardToDeck = (card: Card) => {
    // Avatars sit in the dedicated 61st Command Slot, not in the main deck
    if (card.isPrimal || card.type === 'primal_avatar') {
      setSelectedPrimalAvatar(card);
      localStorage.setItem('fulcrum_primal_avatar_id', card.id);
      soundFx.playButtonClickSound();
      return;
    }

    if (currentDeck.length >= 60) return;
    const copies = currentDeck.filter((c) => c.id === card.id).length;
    if (copies >= 3) return;

    soundFx.playButtonClickSound();
    setCurrentDeck([...currentDeck, card]);
  };

  const removeCardFromDeck = (index: number) => {
    soundFx.playButtonClickSound();
    const next = [...currentDeck];
    next.splice(index, 1);
    setCurrentDeck(next);
  };

  const handleClearDeck = () => {
    soundFx.playButtonClickSound();
    setCurrentDeck([]);
  };

  const handleSave = () => {
    soundFx.playVictorySound();
    localStorage.setItem('fulcrum_custom_deck', JSON.stringify(currentDeck));
    localStorage.setItem('fulcrum_primal_avatar_id', selectedPrimalAvatar.id);
    onSaveDeck(currentDeck, selectedPrimalAvatar);
  };

  const filteredPool = CARD_DATABASE.filter((card) => {
    if (selectedPrimalAvatar.pact && card.pact && card.pact.toLowerCase() !== selectedPrimalAvatar.pact.toLowerCase() && !card.isPrimal && card.type !== 'primal_avatar') {
      return false;
    }
    if (pactFilter !== 'all' && card.pact?.toLowerCase() !== pactFilter.toLowerCase()) {
      return false;
    }
    if (typeFilter !== 'all') {
      if (typeFilter === 'primal_avatar' && !(card.isPrimal || card.type === 'primal_avatar')) {
        return false;
      }
      if (typeFilter !== 'primal_avatar' && card.type !== typeFilter) {
        return false;
      }
    }
    return true;
  });

  const getLoadCurve = () => {
    const counts = [0, 0, 0, 0, 0, 0];
    currentDeck.forEach((c) => {
      const idx = Math.min(5, c.load - 1);
      counts[idx]++;
    });
    return counts;
  };

  const curve = getLoadCurve();
  const maxCountInCurve = Math.max(1, ...curve);

  return (
    <div className="w-full min-h-screen p-4 max-w-7xl mx-auto flex flex-col gap-4 text-slate-100 select-none">
      {/* Header */}
      <div className="flex justify-between items-center bg-fulcrum-panel border border-fulcrum-border rounded-xl px-6 py-3 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-600 transition"
          >
            ← Back to Menu
          </button>
          <h2 className="font-serif font-black text-2xl text-gold-gradient tracking-widest uppercase">
            FORGE
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearDeck}
            className="px-3 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-900/80 border border-red-500/50 text-red-300 text-xs font-bold transition"
          >
            Clear Deck
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-fulcrum-gold to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-serif font-bold text-xs shadow-lg transition transform hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>Save & Play</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Left 2 Columns: Card Browser */}
        <div className="lg:col-span-2 bg-fulcrum-panel/70 border border-fulcrum-border rounded-2xl p-4 flex flex-col gap-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-fulcrum-border pb-3">
            <span className="font-serif font-bold text-sm text-slate-300 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-fulcrum-gold" />
              <span>Cards Pool ({filteredPool.length})</span>
            </span>

            <div className="flex flex-wrap items-center gap-3">
              {/* Dropdown 1: Pact */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-slate-400 font-semibold">Pact:</label>
                <select
                  value={pactFilter}
                  onChange={(e) => {
                    soundFx.playButtonClickSound();
                    setPactFilter(e.target.value);
                  }}
                  className="bg-slate-900 border border-fulcrum-border hover:border-fulcrum-gold text-amber-300 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none transition shadow-md"
                >
                  {PACT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id} className="bg-slate-900 text-slate-100">
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown 2: Card Type */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-slate-400 font-semibold">Type:</label>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    soundFx.playButtonClickSound();
                    setTypeFilter(e.target.value);
                  }}
                  className="bg-slate-900 border border-fulcrum-border hover:border-fulcrum-gold text-cyan-300 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none transition shadow-md"
                >
                  {CARD_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id} className="bg-slate-900 text-slate-100">
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overflow-y-auto max-h-[70vh] p-1">
            {filteredPool.map((card) => {
              const isAvatar = card.isPrimal || card.type === 'primal_avatar';
              const copies = currentDeck.filter((c) => c.id === card.id).length;
              const isCurrentAvatar = selectedPrimalAvatar.id === card.id;

              return (
                <div key={card.id} className="relative group flex flex-col items-center">
                  <CardView card={card} size="sm" onClick={() => addCardToDeck(card)} />
                  {isAvatar ? (
                    <button
                      onClick={() => {
                        setSelectedPrimalAvatar(card);
                        localStorage.setItem('fulcrum_primal_avatar_id', card.id);
                        soundFx.playButtonClickSound();
                      }}
                      className={`mt-1.5 flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition ${
                        isCurrentAvatar
                          ? 'bg-amber-950/90 text-amber-300 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                          : 'bg-black/60 text-slate-300 border-white/20 hover:border-amber-400'
                      }`}
                    >
                      <span>{isCurrentAvatar ? '★ Active Avatar' : 'Select Avatar'}</span>
                    </button>
                  ) : (
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-black/60 px-2 py-0.5 rounded-full border border-white/10">
                      <span>{copies}/3 Copies</span>
                      <Plus className="w-3 h-3 text-emerald-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Custom Deck Panel */}
        <div className="bg-fulcrum-panel/90 border border-fulcrum-border rounded-2xl p-4 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex justify-between items-center border-b border-fulcrum-border pb-3 mb-3">
              <div>
                <input
                  type="text"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  className="bg-transparent font-serif font-bold text-lg text-fulcrum-gold border-b border-fulcrum-gold/40 focus:outline-none"
                />
                <div className="text-xs text-slate-400 mt-0.5">
                  Deck Size: <span className="text-white font-bold">{currentDeck.length}</span> Cards
                </div>
              </div>

              <button
                onClick={() => setCurrentDeck([])}
                className="p-1.5 text-red-400 hover:bg-red-950 rounded border border-red-900/50"
                title="Clear Main Deck"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* 61st Slot Primal Avatar Selector */}
            <div className="bg-amber-950/40 border border-amber-500/50 rounded-xl p-3 mb-3">
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                <span>Primal Avatar</span>
                <span className="text-amber-400/90 font-normal">Command Slot</span>
              </div>
              <select
                value={selectedPrimalAvatar.id}
                onChange={(e) => {
                  const found = PRIMAL_AVATARS_LIST.find((a) => a.id === e.target.value);
                  if (found) {
                    setSelectedPrimalAvatar(found);
                    localStorage.setItem('fulcrum_primal_avatar_id', found.id);
                  }
                }}
                className="w-full bg-slate-900 border border-amber-500/70 text-amber-200 text-xs font-bold rounded-lg p-2 focus:outline-none"
              >
                {PRIMAL_AVATARS_LIST.map((avatar) => (
                  <option key={avatar.id} value={avatar.id}>
                    {avatar.name} ({avatar.pact} • Pace {avatar.pace})
                  </option>
                ))}
              </select>
              <div className="text-[10px] text-slate-300 mt-1.5 italic">
                {selectedPrimalAvatar.description}
              </div>
            </div>

            {/* Load Cost Curve */}
            <div className="bg-black/40 border border-white/10 rounded-xl p-3 mb-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Load Curve (Casting Cost)
              </div>
              <div className="flex items-end justify-between h-16 px-2 gap-2">
                {curve.map((count, idx) => {
                  const barHeightPercent = (count / maxCountInCurve) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end">
                      <span className="text-[9px] text-amber-300 font-bold mb-0.5">{count}</span>
                      <div
                        className="w-full bg-gradient-to-t from-amber-600 to-yellow-400 rounded-t transition-all duration-300"
                        style={{ height: `${Math.max(10, barHeightPercent)}%` }}
                      />
                      <span className="text-[9px] text-slate-400 mt-1 font-mono">
                        {idx === 5 ? '6+' : idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5 max-h-[42vh] overflow-y-auto pr-1">
              {currentDeck.length === 0 ? (
                <div className="text-slate-500 text-xs text-center py-8">
                  Main deck is empty. Select your Primal Avatar above!
                </div>
              ) : (
                currentDeck.map((card, idx) => (
                  <div
                    key={card.id + idx}
                    onClick={() => removeCardFromDeck(idx)}
                    className="flex items-center justify-between bg-slate-900/90 border border-slate-700/80 hover:border-red-500/80 rounded-lg px-3 py-1.5 cursor-pointer group transition"
                  >
                    <div className="flex items-center gap-2 text-xs truncate">
                      <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-500 text-amber-300 font-bold text-[10px] flex items-center justify-center">
                        {card.load}
                      </span>
                      <span className="font-serif font-semibold text-slate-200 truncate">{card.name}</span>
                    </div>
                    <Trash2 className="w-3.5 h-3.5 text-slate-600 group-hover:text-red-400 transition" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
