import React, { useState } from 'react';
import { Card, CardRarity, UserEconomy, Quest } from '../types/game';
import { CARD_DATABASE, PRIMAL_AVATARS_LIST, PACT_RELICS_LIST, PACT_RUNES_LIST, STARTER_DECK_A } from '../data/cards';
import { CardView } from './CardView';
import { ArrowLeft, Sparkles, Package, Coins, Flame, Award, Hammer, Zap, ShoppingBag, CheckCircle, RefreshCw } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface VaultStoreProps {
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

const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q1',
    title: 'First Win of the Day',
    description: 'Win 1 match in any format (1v1, 2v2, FFA).',
    rewardShards: 200,
    progress: 1,
    maxProgress: 1,
    completed: false,
  },
  {
    id: 'q2',
    title: 'Asymmetric Milestone',
    description: 'Complete a run in an Outnumbered 1v2 or 1v3 format.',
    rewardShards: 300,
    progress: 0,
    maxProgress: 1,
    completed: false,
  },
  {
    id: 'q3',
    title: 'Core Converter',
    description: 'Convert 5 hand cards into Core during matches.',
    rewardShards: 150,
    progress: 3,
    maxProgress: 5,
    completed: false,
  },
  {
    id: 'q4',
    title: 'Weekly Objective',
    description: 'Cast 10 Relic or Rune spells.',
    rewardShards: 500,
    progress: 6,
    maxProgress: 10,
    completed: false,
  },
];

export const VaultStore: React.FC<VaultStoreProps> = ({ onBack, economy, onUpdateEconomy }) => {
  const [activeTab, setActiveTab] = useState<'packs' | 'crafting' | 'quests'>('packs');
  const [openedPackCards, setOpenedPackCards] = useState<Card[] | null>(null);
  const [packTitle, setPackTitle] = useState<string>('');
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [craftFilter, setCraftFilter] = useState<string>('all');

  // Helper: Open 15-Card Pack (8 Common, 4 Uncommon, 2 Rare, 1 Wildcard)
  const handleOpenStandardPack = () => {
    if (economy.shards < 300) {
      alert('Not enough Shards! Earn more Shards from daily challenges or match wins.');
      return;
    }

    soundFx.playVictorySound();

    const commons = CARD_DATABASE.filter((c) => c.rarity === 'common');
    const uncommons = CARD_DATABASE.filter((c) => c.rarity === 'uncommon');
    const rares = CARD_DATABASE.filter((c) => c.rarity === 'rare');
    const wildcards = CARD_DATABASE;

    const drawn: Card[] = [];

    // 8 Commons
    for (let i = 0; i < 8; i++) {
      drawn.push(commons[Math.floor(Math.random() * commons.length)] || commons[0]);
    }
    // 4 Uncommons
    for (let i = 0; i < 4; i++) {
      drawn.push(uncommons[Math.floor(Math.random() * uncommons.length)] || uncommons[0]);
    }
    // 2 Rares
    for (let i = 0; i < 2; i++) {
      drawn.push(rares[Math.floor(Math.random() * rares.length)] || rares[0]);
    }
    // 1 Wildcard
    drawn.push(wildcards[Math.floor(Math.random() * wildcards.length)]);

    // Update collection
    const nextCol = { ...economy.collection };
    drawn.forEach((c) => {
      nextCol[c.id] = (nextCol[c.id] || 0) + 1;
    });

    onUpdateEconomy({
      ...economy,
      shards: economy.shards - 300,
      collection: nextCol,
    });

    setOpenedPackCards(drawn);
    setPackTitle('Standard 15-Card Booster Pack (8 Common, 4 Uncommon, 2 Rare, 1 Wildcard)');
  };

  // Helper: Open Primal Showcase Pack (100 Bones - Exclusive Primal Avatars)
  const handleOpenPrimalPack = () => {
    if (economy.bones < 100) {
      alert('Not enough Bones! Purchase Bones in the store to open Showcase Primal Packs.');
      return;
    }

    soundFx.playVictorySound();

    const primals = PRIMAL_AVATARS_LIST;
    const drawn: Card[] = [];

    // Pulls 3 Showcase Primal Avatars
    for (let i = 0; i < 3; i++) {
      drawn.push(primals[Math.floor(Math.random() * primals.length)]);
    }

    const nextCol = { ...economy.collection };
    drawn.forEach((c) => {
      nextCol[c.id] = (nextCol[c.id] || 0) + 1;
    });

    onUpdateEconomy({
      ...economy,
      bones: economy.bones - 100,
      collection: nextCol,
    });

    setOpenedPackCards(drawn);
    setPackTitle('Primal Showcase Collector Pack (Exclusive Avatars & Showcase Art)');
  };

  // Crafting specific card
  const handleCraftCard = (card: Card) => {
    const rarity = card.rarity || 'common';
    const cost = CRAFT_COSTS[rarity];

    if (economy.shards < cost) {
      alert(`Not enough Shards to craft ${card.name} (${cost} Shards required).`);
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

  // Disenchant card into Shards
  const handleDisenchantCard = (card: Card) => {
    const currentCount = economy.collection[card.id] || 0;
    if (currentCount <= 0) return;

    const rarity = card.rarity || 'common';
    const yieldShards = DISENCHANT_YIELDS[rarity];

    soundFx.playButtonClickSound();
    const nextCol = { ...economy.collection, [card.id]: currentCount - 1 };
    onUpdateEconomy({
      ...economy,
      shards: economy.shards + yieldShards,
      collection: nextCol,
    });
  };

  // Claim Daily Quest
  const handleClaimQuest = (questId: string) => {
    const q = quests.find((item) => item.id === questId);
    if (!q || q.completed || q.progress < q.maxProgress) return;

    soundFx.playVictorySound();
    setQuests(quests.map((item) => (item.id === questId ? { ...item, completed: true } : item)));
    onUpdateEconomy({
      ...economy,
      shards: economy.shards + q.rewardShards,
    });
  };

  // Convert Bones to Shards
  const handleConvertBonesToShards = () => {
    if (economy.bones < 100) {
      alert('Not enough Bones to convert!');
      return;
    }
    soundFx.playVictorySound();
    onUpdateEconomy({
      ...economy,
      bones: economy.bones - 100,
      shards: economy.shards + 1000,
    });
  };

  return (
    <div className="w-full min-h-screen p-4 max-w-7xl mx-auto flex flex-col gap-5 text-slate-100 select-none">
      {/* Top Header & Currencies Bar */}
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
              <ShoppingBag className="w-6 h-6 text-fulcrum-gold" />
              FULCRUM VAULT & STORE
            </h2>
            <p className="text-xs text-slate-400">Manage Shards, Bones, Booster Packs & Crafting</p>
          </div>
        </div>

        {/* Currency Counters */}
        <div className="flex items-center gap-4 bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2">
          {/* Shards (F2P Earned) */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.5)]">
              <Zap className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Shards (Earned)</div>
              <div className="font-mono font-bold text-cyan-300 text-sm">{economy.shards.toLocaleString()}</div>
            </div>
          </div>

          <div className="h-6 w-px bg-white/10" />

          {/* Bones (Premium Store) */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-950 border border-amber-400 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.5)]">
              <Coins className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Bones (Premium)</div>
              <div className="font-mono font-bold text-amber-300 text-sm">{economy.bones.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 bg-fulcrum-panel/80 border border-fulcrum-border rounded-2xl p-2 shadow-lg">
        <button
          onClick={() => {
            soundFx.playButtonClickSound();
            setActiveTab('packs');
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-serif font-bold text-xs uppercase tracking-wider transition ${
            activeTab === 'packs'
              ? 'bg-gradient-to-r from-amber-600 to-fulcrum-gold text-slate-950 shadow-md'
              : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Booster Packs & Precons</span>
        </button>

        <button
          onClick={() => {
            soundFx.playButtonClickSound();
            setActiveTab('crafting');
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-serif font-bold text-xs uppercase tracking-wider transition ${
            activeTab === 'crafting'
              ? 'bg-gradient-to-r from-cyan-600 to-cyan-400 text-slate-950 shadow-md'
              : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <Hammer className="w-4 h-4" />
          <span>Crafting & Disenchant</span>
        </button>

        <button
          onClick={() => {
            soundFx.playButtonClickSound();
            setActiveTab('quests');
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-serif font-bold text-xs uppercase tracking-wider transition ${
            activeTab === 'quests'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 text-slate-950 shadow-md'
              : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Earn Shards (Dailies & Quests)</span>
        </button>
      </div>

      {/* TAB 1: BOOSTER PACKS & PRECONS */}
      {activeTab === 'packs' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Standard 15-Card Pack */}
          <div className="bg-fulcrum-panel/90 border border-fulcrum-border rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-400 flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-cyan-300" />
              </div>
              <h3 className="font-serif font-black text-xl text-gold-gradient">Standard 15-Card Pack</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Contains 15 cards with the official rarity breakdown: <strong>8 Commons, 4 Uncommons, 2 Rares, and 1 Wildcard slot</strong>.
              </p>
              <div className="bg-black/50 border border-white/10 rounded-xl p-3 text-xs space-y-1 font-mono text-cyan-200">
                <div>• 8 Common Slots</div>
                <div>• 4 Uncommon Slots</div>
                <div>• 2 Rare Slots</div>
                <div>• 1 Wildcard / Showcase Slot</div>
              </div>
            </div>

            <button
              onClick={handleOpenStandardPack}
              className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-400 hover:from-cyan-500 hover:to-cyan-300 text-slate-950 font-serif font-black text-xs uppercase tracking-widest shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Buy for 300 Shards</span>
            </button>
          </div>

          {/* Card 2: Primal Showcase Pack */}
          <div className="bg-fulcrum-panel/90 border border-amber-500/50 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                <Sparkles className="w-6 h-6 text-amber-300" />
              </div>
              <h3 className="font-serif font-black text-xl text-gold-gradient">Primal Showcase Pack</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Premium collector-style showcase product pulling exclusively from Primal-supertype Avatars with showcase treatment tiers.
              </p>
              <div className="bg-black/50 border border-amber-500/30 rounded-xl p-3 text-xs space-y-1 font-mono text-amber-200">
                <div>• 3 Showcase Primal Cards</div>
                <div>• Exclusive Alt-Art Avatars</div>
                <div>• 100% Primal Supertype Pool</div>
              </div>
            </div>

            <button
              onClick={handleOpenPrimalPack}
              className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-fulcrum-gold via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-serif font-black text-xs uppercase tracking-widest shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Coins className="w-4 h-4 fill-current" />
              <span>Buy for 100 Bones</span>
            </button>
          </div>

          {/* Card 3: 60-Card Precon & Bones Converter */}
          <div className="bg-fulcrum-panel/90 border border-fulcrum-border rounded-3xl p-6 flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-400 flex items-center justify-center shadow-lg">
                <Flame className="w-6 h-6 text-purple-300" />
              </div>
              <h3 className="font-serif font-black text-xl text-gold-gradient">60-Card Pact Precon Deck</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Full constructed deck (24 Common, 20 Uncommon, 12 Rare, 4 Top-Tier slots) respecting the 3-copy limit.
              </p>
              <div className="bg-black/50 border border-white/10 rounded-xl p-3 text-xs space-y-1 font-mono text-purple-200">
                <div>• 24 Commons | 20 Uncommons</div>
                <div>• 12 Rares | 4 Signature Slots</div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <button
                onClick={() => {
                  if (economy.shards < 1200) {
                    alert('Not enough Shards!');
                    return;
                  }
                  soundFx.playVictorySound();
                  onUpdateEconomy({ ...economy, shards: economy.shards - 1200 });
                  alert('Purchased 60-Card Precon Deck! Added to Forge.');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-serif font-bold text-xs uppercase tracking-wider transition"
              >
                Buy for 1,200 Shards
              </button>

              <button
                onClick={handleConvertBonesToShards}
                className="w-full py-2 rounded-xl bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 font-sans text-xs flex items-center justify-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Convert 100 Bones → 1,000 Shards</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PACK OPENING REVEAL MODAL */}
      {openedPackCards && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-200">
          <div className="text-center mb-6">
            <h3 className="font-serif font-black text-3xl text-gold-gradient">{packTitle}</h3>
            <p className="text-xs text-slate-400 mt-1">New cards added to your collection!</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 max-h-[65vh] overflow-y-auto p-2">
            {openedPackCards.map((card, idx) => (
              <div key={card.id + idx} className="flex flex-col items-center gap-1 animate-in slide-in-from-bottom duration-300">
                <CardView card={card} size="sm" />
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-black/80 border border-white/20 text-amber-300">
                  {card.rarity?.toUpperCase() || 'COMMON'}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setOpenedPackCards(null)}
            className="mt-6 px-8 py-3 rounded-2xl bg-gradient-to-r from-fulcrum-gold to-amber-600 text-slate-950 font-serif font-black uppercase text-sm tracking-widest shadow-xl transition transform hover:scale-105"
          >
            Claim & Return to Vault
          </button>
        </div>
      )}

      {/* TAB 2: CRAFTING & DISENCHANT */}
      {activeTab === 'crafting' && (
        <div className="bg-fulcrum-panel/80 border border-fulcrum-border rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="font-serif font-black text-xl text-gold-gradient">Card Crafting & Disenchant Engine</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Convert unwanted card copies into Shards, or craft missing cards by rarity (Common: 50 | Uncommon: 150 | Rare: 500 | Primal: 1,200).
              </p>
            </div>

            {/* Rarity Filter */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 font-bold uppercase">Filter Rarity:</label>
              <select
                value={craftFilter}
                onChange={(e) => setCraftFilter(e.target.value)}
                className="bg-slate-900 border border-fulcrum-border text-amber-300 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none"
              >
                <option value="all">All Rarities</option>
                <option value="common">Common (50 Shards)</option>
                <option value="uncommon">Uncommon (150 Shards)</option>
                <option value="rare">Rare (500 Shards)</option>
                <option value="primal">Primal (1,200 Shards)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[65vh] overflow-y-auto p-1">
            {CARD_DATABASE.filter((c) => craftFilter === 'all' || c.rarity === craftFilter).map((card) => {
              const count = economy.collection[card.id] || 0;
              const rarity = card.rarity || 'common';
              const craftCost = CRAFT_COSTS[rarity];
              const disenchantYield = DISENCHANT_YIELDS[rarity];

              return (
                <div key={card.id} className="flex flex-col items-center bg-black/40 border border-white/10 rounded-2xl p-2 gap-2 shadow-md">
                  <CardView card={card} size="sm" />
                  <div className="text-[11px] font-bold text-slate-300">Owned: <span className="text-amber-300">{count}</span></div>

                  <div className="w-full grid grid-cols-2 gap-1 text-[10px]">
                    <button
                      onClick={() => handleCraftCard(card)}
                      className="py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500 text-cyan-300 font-bold transition"
                      title={`Craft for ${craftCost} Shards`}
                    >
                      Craft ({craftCost})
                    </button>
                    <button
                      onClick={() => handleDisenchantCard(card)}
                      disabled={count <= 0}
                      className={`py-1 rounded font-bold transition ${
                        count > 0
                          ? 'bg-red-950 hover:bg-red-900 border border-red-500 text-red-300'
                          : 'bg-slate-900 text-slate-600 border border-slate-800'
                      }`}
                      title={`Disenchant for +${disenchantYield} Shards`}
                    >
                      +{disenchantYield} Dust
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DAILY QUESTS & OBJECTIVES */}
      {activeTab === 'quests' && (
        <div className="bg-fulcrum-panel/80 border border-fulcrum-border rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="font-serif font-black text-xl text-gold-gradient">Daily Challenges & Milestones</h3>
            <p className="text-xs text-slate-400 mt-0.5">Complete in-game objectives to earn Shards!</p>
          </div>

          <div className="space-y-3">
            {quests.map((q) => (
              <div key={q.id} className="flex flex-wrap items-center justify-between bg-black/50 border border-white/10 rounded-2xl p-4 gap-4 shadow-md">
                <div className="space-y-1">
                  <div className="font-serif font-bold text-sm text-slate-100 flex items-center gap-2">
                    <Award className="w-4 h-4 text-fulcrum-gold" />
                    <span>{q.title}</span>
                  </div>
                  <p className="text-xs text-slate-400">{q.description}</p>
                  <div className="w-48 bg-slate-900 h-2 rounded-full overflow-hidden border border-white/10 mt-1">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-300"
                      style={{ width: `${(q.progress / q.maxProgress) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Reward</div>
                    <div className="font-mono font-bold text-cyan-300 text-sm">+{q.rewardShards} Shards</div>
                  </div>

                  {q.completed ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500 px-3 py-1.5 rounded-xl">
                      <CheckCircle className="w-4 h-4" /> Claimed
                    </span>
                  ) : (
                    <button
                      onClick={() => handleClaimQuest(q.id)}
                      disabled={q.progress < q.maxProgress}
                      className={`px-4 py-2 rounded-xl font-serif font-bold text-xs uppercase tracking-wider transition ${
                        q.progress >= q.maxProgress
                          ? 'bg-gradient-to-r from-fulcrum-gold to-amber-600 text-slate-950 shadow-lg hover:scale-105'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      Claim Reward
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
