import React, { useState } from 'react';
import { Card, CardRarity, PactName, CardType, UserEconomy } from '../types/game';
import { CARD_DATABASE, PRIMAL_AVATARS_LIST } from '../data/cards';
import { CardView } from './CardView';
import { ArrowLeft, BookOpen, Search, Filter, Hammer, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface CollectionBinderProps {
  onBack: () => void;
  economy: UserEconomy;
  onUpdateEconomy: (newEconomy: UserEconomy) => void;
}

const CRAFT_COSTS: Record<CardRarity, number> = {
  common: 50,
  uncommon: 150,
  rare: 500,
  primal: 1200,
};

const DISENCHANT_YIELDS: Record<CardRarity, number> = {
  common: 10,
  uncommon: 25,
  rare: 100,
  primal: 250,
};

export const CollectionBinder: React.FC<CollectionBinderProps> = ({ onBack, economy, onUpdateEconomy }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPact, setSelectedPact] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);

  // Combine full card pool including Avatars
  const allCards = [...CARD_DATABASE, ...PRIMAL_AVATARS_LIST];

  // Filter cards
  const filteredCards = allCards.filter((card) => {
    const matchesSearch =
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (card.pact && card.pact.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPact = selectedPact === 'all' || card.pact === selectedPact;
    const matchesRarity = selectedRarity === 'all' || (card.rarity || 'common') === selectedRarity;
    const matchesType = selectedType === 'all' || card.type === selectedType;

    const ownedCount = economy.collection[card.id] || 0;
    const matchesOwned = !showOwnedOnly || ownedCount > 0;

    return matchesSearch && matchesPact && matchesRarity && matchesType && matchesOwned;
  });

  const handleCraft = (card: Card) => {
    const rarity = card.rarity || 'common';
    const cost = CRAFT_COSTS[rarity];
    if (economy.shards < cost) {
      alert(`Not enough Shards! Need ${cost} Shards to craft.`);
      return;
    }
    soundFx.playCardDrawSound();
    const nextCol = { ...economy.collection, [card.id]: (economy.collection[card.id] || 0) + 1 };
    onUpdateEconomy({
      ...economy,
      shards: economy.shards - cost,
      collection: nextCol,
    });
  };

  const handleDisenchant = (card: Card) => {
    const count = economy.collection[card.id] || 0;
    if (count <= 0) return;
    const rarity = card.rarity || 'common';
    const yieldShards = DISENCHANT_YIELDS[rarity];
    soundFx.playButtonClickSound();
    const nextCol = { ...economy.collection, [card.id]: count - 1 };
    onUpdateEconomy({
      ...economy,
      shards: economy.shards + yieldShards,
      collection: nextCol,
    });
  };

  return (
    <div className="w-full min-h-screen p-4 max-w-7xl mx-auto flex flex-col gap-5 text-slate-100 select-none">
      {/* Top Header */}
      <div className="flex flex-wrap justify-between items-center bg-fulcrum-panel border border-fulcrum-border rounded-2xl px-6 py-4 shadow-2xl">
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
              <BookOpen className="w-6 h-6 text-fulcrum-gold" />
              COLLECTION BINDER & VAULT
            </h2>
            <p className="text-xs text-slate-400">Browse owned cards, check copy limits, and craft/dismantle for Dust</p>
          </div>
        </div>

        {/* Currency Display */}
        <div className="flex items-center gap-2 bg-slate-950/80 border border-cyan-500/40 rounded-xl px-4 py-2">
          <Hammer className="w-4 h-4 text-cyan-300" />
          <span className="text-xs text-slate-400 font-bold uppercase">Shards Dust:</span>
          <span className="font-mono font-bold text-cyan-300 text-base">{economy.shards.toLocaleString()}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-fulcrum-panel/90 border border-fulcrum-border rounded-2xl p-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by card name, text, or Pact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 focus:border-fulcrum-gold text-xs text-slate-200 rounded-xl pl-9 pr-4 py-2 focus:outline-none"
            />
          </div>

          {/* Pact Filter */}
          <select
            value={selectedPact}
            onChange={(e) => setSelectedPact(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-amber-300 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">All 6 Pacts</option>
            <option value="Corefeast">Corefeast (Gluttrix)</option>
            <option value="Voidhallow">Voidhallow (Nyssara)</option>
            <option value="Runescale">Runescale (Kazrith)</option>
            <option value="Charmbrand">Charmbrand (Grothmaw)</option>
            <option value="Rotwatch">Rotwatch (Kharv)</option>
            <option value="Ironbound">Ironbound (Vorrath)</option>
          </select>

          {/* Rarity Filter */}
          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-amber-300 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">All Rarities</option>
            <option value="common">Common (50/10)</option>
            <option value="uncommon">Uncommon (150/25)</option>
            <option value="rare">Rare (500/100)</option>
            <option value="primal">Primal (1200/250)</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-amber-300 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">All Card Types</option>
            <option value="being">Being</option>
            <option value="charm">Charm</option>
            <option value="relic">Relic</option>
            <option value="rune">Rune</option>
            <option value="attachment">Attachment</option>
            <option value="primal_avatar">Primal Avatar</option>
          </select>
        </div>

        {/* Owned Only Checkbox */}
        <label className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl cursor-pointer">
          <input
            type="checkbox"
            checked={showOwnedOnly}
            onChange={(e) => setShowOwnedOnly(e.target.checked)}
            className="rounded border-slate-600 text-fulcrum-gold focus:ring-0"
          />
          <span>Show Owned Only</span>
        </label>
      </div>

      {/* Binder Grid View */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[70vh] overflow-y-auto p-1">
        {filteredCards.map((card) => {
          const ownedCount = economy.collection[card.id] || 0;
          const rarity = card.rarity || 'common';
          const craftCost = CRAFT_COSTS[rarity];
          const disenchantYield = DISENCHANT_YIELDS[rarity];

          return (
            <div
              key={card.id}
              className={`flex flex-col items-center bg-black/40 border rounded-2xl p-2.5 gap-2 shadow-lg transition hover:border-fulcrum-gold ${
                ownedCount > 0 ? 'border-white/10' : 'border-slate-800 opacity-60'
              }`}
            >
              <div className="relative">
                <CardView card={card} size="sm" />
                {/* Owned Badge */}
                <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-slate-950 border border-fulcrum-gold font-mono font-bold text-[10px] text-fulcrum-gold shadow-md">
                  x{ownedCount}
                </span>
              </div>

              {/* Craft / Disenchant Controls */}
              <div className="w-full grid grid-cols-2 gap-1 text-[10px] pt-1">
                <button
                  onClick={() => handleCraft(card)}
                  className="py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500 text-cyan-300 font-bold transition"
                  title={`Craft for ${craftCost} Shards`}
                >
                  Craft ({craftCost})
                </button>

                <button
                  onClick={() => handleDisenchant(card)}
                  disabled={ownedCount <= 0}
                  className={`py-1 rounded font-bold transition ${
                    ownedCount > 0
                      ? 'bg-red-950 hover:bg-red-900 border border-red-500 text-red-300'
                      : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                  }`}
                  title={`Dismantle for +${disenchantYield} Shards`}
                >
                  +{disenchantYield} Dust
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
