import React, { useState, useMemo, useCallback } from 'react';
import { Card, UserEconomy } from '../types/game';
import { CARD_DATABASE, PRIMAL_AVATARS_LIST } from '../data/cards';
import { CardView } from './CardView';
import {
  Package,
  Sparkles,
  Layers,
  ArrowLeft,
  Play,
  Shield,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Coins,
  Star,
} from 'lucide-react';
import { soundFx } from '../utils/soundFx';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const DRAFT_COST = 500;
const SEALED_COST = 800;
const ABANDON_REFUND_RATE = 0.5;

const ECONOMY_KEY = 'fulcrum_economy';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type Screen =
  | 'select'          // Event selection tiles
  | 'draft_picking'   // Active pick-one-from-pack screen
  | 'draft_build'     // Assemble final 40-card deck from 15 drafted cards
  | 'sealed_build'    // Choose 40 from 60-card sealed pool
  | 'confirm';        // Final deck review before launching match

interface DraftSealedModalProps {
  onBack: () => void;
  onStartDraftMatch: (deck: Card[], avatar?: Card) => void;
}

// Extended card with a unique instance key so duplicates are selectable
interface PoolCard {
  key: string;   // unique per instance (card.id + "-" + index)
  card: Card;
}

// ─────────────────────────────────────────────────────────────────────────────
// ECONOMY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function loadEconomy(): UserEconomy {
  try {
    const raw = localStorage.getItem(ECONOMY_KEY);
    if (raw) return JSON.parse(raw) as UserEconomy;
  } catch {/* ignore */}
  return { shards: 0, bones: 0, collection: {}, unlockedCardBacks: [], activeCardBack: 'default' };
}

function saveEconomy(eco: UserEconomy): void {
  localStorage.setItem(ECONOMY_KEY, JSON.stringify(eco));
}

function deductShards(amount: number): boolean {
  const eco = loadEconomy();
  if (eco.shards < amount) return false;
  eco.shards -= amount;
  saveEconomy(eco);
  return true;
}

function refundShards(amount: number): void {
  const eco = loadEconomy();
  eco.shards += amount;
  saveEconomy(eco);
}

// ─────────────────────────────────────────────────────────────────────────────
// PACK GENERATION
// ─────────────────────────────────────────────────────────────────────────────

/** Fisher-Yates shuffle (in-place) */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Pick `n` random elements from array with replacement */
function pickWithReplacement<T>(arr: T[], n: number): T[] {
  const result: T[] = [];
  for (let i = 0; i < n; i++) {
    result.push(arr[Math.floor(Math.random() * arr.length)]);
  }
  return result;
}

// Non-avatar cards for pack generation
const PACK_POOL = CARD_DATABASE.filter(c => c.type !== 'primal_avatar');
const COMMONS    = PACK_POOL.filter(c => c.rarity === 'common');
const UNCOMMONS  = PACK_POOL.filter(c => c.rarity === 'uncommon');
const RARES      = PACK_POOL.filter(c => c.rarity === 'rare' || c.rarity === 'primal');

// Fallback pools if a rarity tier is empty
const effectiveCommons   = COMMONS.length   > 0 ? COMMONS   : PACK_POOL;
const effectiveUncommons = UNCOMMONS.length > 0 ? UNCOMMONS : PACK_POOL;
const effectiveRares     = RARES.length     > 0 ? RARES     : PACK_POOL;

/**
 * Generate a Draft pack (15 cards): 8 commons, 5 uncommons, 2 rares.
 * Falls back to next-lower rarity if pool is empty.
 */
function generateDraftPack(): Card[] {
  const cards: Card[] = [
    ...pickWithReplacement(effectiveCommons, 8),
    ...pickWithReplacement(effectiveUncommons, 5),
    ...pickWithReplacement(effectiveRares, 2),
  ];
  return shuffle(cards);
}

/**
 * Generate a Sealed pack (10 cards): 6 commons, 3 uncommons, 1 rare.
 */
function generateSealedPack(): Card[] {
  const cards: Card[] = [
    ...pickWithReplacement(effectiveCommons, 6),
    ...pickWithReplacement(effectiveUncommons, 3),
    ...pickWithReplacement(effectiveRares, 1),
  ];
  return shuffle(cards);
}

/** Assign unique instance keys to a flat card array */
function toPoolCards(cards: Card[], offset = 0): PoolCard[] {
  return cards.map((card, i) => ({ key: `${card.id}-${offset + i}`, card }));
}

// ─────────────────────────────────────────────────────────────────────────────
// PACT COLOR MAP
// ─────────────────────────────────────────────────────────────────────────────

function getPactDotColor(card: Card): string {
  const pact = card.pact;
  if (!pact) return 'bg-slate-500';
  const map: Record<string, string> = {
    Voidhallow: 'bg-purple-500',
    Rotwatch:   'bg-emerald-500',
    Charmbrand: 'bg-red-500',
    Corefeast:  'bg-amber-500',
    Ironbound:  'bg-orange-500',
    Runescale:  'bg-green-500',
  };
  return map[pact] ?? 'bg-slate-500';
}

function getRarityColor(card: Card): string {
  switch (card.rarity) {
    case 'common':   return 'text-slate-300';
    case 'uncommon': return 'text-blue-300';
    case 'rare':     return 'text-amber-300';
    case 'primal':   return 'text-yellow-300';
    default:         return 'text-slate-300';
  }
}

function getRarityBadge(card: Card): string {
  switch (card.rarity) {
    case 'common':   return 'C';
    case 'uncommon': return 'U';
    case 'rare':     return 'R';
    case 'primal':   return '★';
    default:         return '?';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MINI CARD ROW (for deck list / pool view)
// ─────────────────────────────────────────────────────────────────────────────

interface MiniCardRowProps {
  pc: PoolCard;
  isSelected: boolean;
  onClick: () => void;
  showCheckbox?: boolean;
}

const MiniCardRow: React.FC<MiniCardRowProps> = ({ pc, isSelected, onClick, showCheckbox }) => {
  const { card } = pc;
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-150 border
        ${isSelected
          ? 'border-amber-400 bg-amber-950/60 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
          : 'border-white/10 bg-black/30 hover:border-amber-400/40 hover:bg-amber-950/20'
        }`}
    >
      {showCheckbox && (
        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-amber-400 bg-amber-500' : 'border-white/30 bg-transparent'}`}>
          {isSelected && <CheckCircle2 className="w-3 h-3 text-black" />}
        </div>
      )}
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getPactDotColor(card)}`} />
      <span className="text-xs font-semibold text-slate-100 flex-1 truncate leading-tight">{card.name}</span>
      <span className={`text-[10px] font-bold flex-shrink-0 ${getRarityColor(card)}`}>{getRarityBadge(card)}</span>
      <span className="text-[10px] text-slate-400 flex-shrink-0 font-mono">{card.type.slice(0, 3).toUpperCase()}</span>
      {card.load !== undefined && (
        <span className="text-[10px] text-amber-300 flex-shrink-0 font-mono">L{card.load}</span>
      )}
      {card.edge !== undefined && card.grit !== undefined && (
        <span className="text-[10px] text-slate-400 flex-shrink-0 font-mono">{card.edge}/{card.grit}</span>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DRAFT PACK CARD (large pick UI)
// ─────────────────────────────────────────────────────────────────────────────

interface DraftPickCardProps {
  pc: PoolCard;
  onPick: () => void;
}

const DraftPickCard: React.FC<DraftPickCardProps> = ({ pc, onPick }) => {
  const { card } = pc;
  return (
    <div
      onClick={onPick}
      className="group cursor-pointer relative rounded-xl border border-white/10 bg-black/40 hover:border-amber-400 hover:shadow-[0_0_16px_rgba(251,191,36,0.5)] transition-all duration-200 overflow-hidden"
    >
      <div className="p-1">
        <CardView card={card} size="sm" disableHoverPreview={false} />
      </div>
      <div className="absolute inset-0 bg-amber-400/0 group-hover:bg-amber-400/5 transition-all duration-200 pointer-events-none rounded-xl" />
      <div className="absolute bottom-1 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="text-[10px] font-bold text-amber-300 bg-black/80 px-2 py-0.5 rounded-full">PICK</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const DraftSealedModal: React.FC<DraftSealedModalProps> = ({ onBack, onStartDraftMatch }) => {
  // ── Screen / flow state ──────────────────────────────────────────────────
  const [screen, setScreen] = useState<Screen>('select');
  const [eventType, setEventType] = useState<'draft' | 'sealed' | null>(null);
  const [entryCost, setEntryCost] = useState(0);

  // ── Economy display (re-read on each render from localStorage) ───────────
  const [economyVersion, setEconomyVersion] = useState(0);
  const economy = useMemo(() => loadEconomy(), [economyVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Draft state ──────────────────────────────────────────────────────────
  // draft_picking: show one pack at a time, player picks 1 of 15
  // allPacks[packIdx] holds remaining cards in current pack
  const [allPacks, setAllPacks] = useState<Card[][]>([]);   // [pack0, pack1, pack2] each starts at 15
  const [packIdx, setPackIdx] = useState(0);                 // which pack we're on (0-2)
  const [pickNum, setPickNum] = useState(0);                 // picks made in current pack (0-14)
  const [draftPicks, setDraftPicks] = useState<Card[]>([]);  // player's 15 drafted cards

  // ── Sealed state ─────────────────────────────────────────────────────────
  const [sealedPool, setSealedPool] = useState<PoolCard[]>([]);
  const [sealedSelected, setSealedSelected] = useState<Set<string>>(new Set());

  // ── Deck build state (draft_build) ────────────────────────────────────────
  // Player selects exactly 40 cards from (draftPicks + basic fillers)
  const [buildPool, setBuildPool] = useState<PoolCard[]>([]);
  const [buildSelected, setBuildSelected] = useState<Set<string>>(new Set());

  // ── Avatar selection ──────────────────────────────────────────────────────
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(PRIMAL_AVATARS_LIST[0]?.id ?? '');

  // ── Confirmed final deck ───────────────────────────────────────────────────
  const [finalDeck, setFinalDeck] = useState<Card[]>([]);

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  const refreshEconomy = useCallback(() => setEconomyVersion(v => v + 1), []);

  const selectedAvatar = PRIMAL_AVATARS_LIST.find(a => a.id === selectedAvatarId) ?? PRIMAL_AVATARS_LIST[0];

  // Most-drafted pact (for basic land fills)
  function dominantPact(picks: Card[]): string {
    const counts: Record<string, number> = {};
    for (const c of picks) {
      if (c.pact) counts[c.pact] = (counts[c.pact] ?? 0) + 1;
    }
    let best = '';
    let bestCount = 0;
    for (const [pact, count] of Object.entries(counts)) {
      if (count > bestCount) { bestCount = count; best = pact; }
    }
    return best;
  }

  // Build "basic filler" cards (Pact Runes/Totems matching dominant pact)
  function buildBasicFillers(picks: Card[], needed: number): Card[] {
    const pact = dominantPact(picks);
    // Find a matching basic (Incantation or Totem) from PACK_POOL
    const basics = PACK_POOL.filter(c => c.pact === pact || (!pact));
    if (basics.length === 0) return PACK_POOL.slice(0, needed);
    const fillers: Card[] = [];
    for (let i = 0; i < needed; i++) {
      fillers.push(basics[i % basics.length]);
    }
    return fillers;
  }

  // Current pack cards in the draft picker
  const currentPackCards: PoolCard[] = useMemo(() => {
    if (screen !== 'draft_picking' || allPacks.length === 0) return [];
    const pack = allPacks[packIdx] ?? [];
    return toPoolCards(pack, packIdx * 100 + pickNum * 20);
  }, [screen, allPacks, packIdx, pickNum]);

  // Sealed pool grouped by pact for sorted display
  const sealedGrouped = useMemo(() => {
    if (screen !== 'sealed_build') return {};
    const groups: Record<string, PoolCard[]> = {};
    for (const pc of sealedPool) {
      const key = pc.card.pact ?? pc.card.type ?? 'Other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(pc);
    }
    return groups;
  }, [screen, sealedPool]);

  // Build pool grouped by pact
  const buildGrouped = useMemo(() => {
    if (screen !== 'draft_build') return {};
    const groups: Record<string, PoolCard[]> = {};
    for (const pc of buildPool) {
      const key = pc.card.pact ?? pc.card.type ?? 'Other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(pc);
    }
    return groups;
  }, [screen, buildPool]);

  // ─────────────────────────────────────────────────────────────────────────
  // ENTER EVENTS
  // ─────────────────────────────────────────────────────────────────────────

  const handleEnterDraft = () => {
    const eco = loadEconomy();
    if (eco.shards < DRAFT_COST) return;
    const ok = deductShards(DRAFT_COST);
    if (!ok) return;
    refreshEconomy();
    soundFx.playVictorySound();

    // Generate 3 packs of 15 cards each
    const packs = [generateDraftPack(), generateDraftPack(), generateDraftPack()];
    setAllPacks(packs);
    setPackIdx(0);
    setPickNum(0);
    setDraftPicks([]);
    setEventType('draft');
    setEntryCost(DRAFT_COST);
    setScreen('draft_picking');
  };

  const handleEnterSealed = () => {
    const eco = loadEconomy();
    if (eco.shards < SEALED_COST) return;
    const ok = deductShards(SEALED_COST);
    if (!ok) return;
    refreshEconomy();
    soundFx.playVictorySound();

    // Open 6 packs of 10 cards = 60-card pool
    const pool: Card[] = [];
    for (let i = 0; i < 6; i++) {
      pool.push(...generateSealedPack());
    }
    const poolCards = toPoolCards(pool);
    setSealedPool(poolCards);
    setSealedSelected(new Set());
    setEventType('sealed');
    setEntryCost(SEALED_COST);
    setScreen('sealed_build');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // DRAFT PICKING
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Pack mechanics (8-player pod simulation):
  //   - Pack has 15 cards. Each "pass round":
  //     1. Player picks 1 card.
  //     2. 2 bot seats auto-pick 2 random cards (simulated).
  //     → Pack shrinks by 3 per round. 5 rounds × 3 = 15 cards exhausted.
  //   - Player gets 5 picks per pack × 3 packs = 15 drafted cards total.

  const PICKS_PER_PACK = 5;
  const BOT_PICKS_PER_ROUND = 2; // bots consume 2 cards after each player pick

  const handleDraftPick = (pc: PoolCard) => {
    soundFx.playCardDrawSound();
    const picked = pc.card;
    const newPicks = [...draftPicks, picked];

    // Remove the player's picked card from the current pack
    let currentPack = [...(allPacks[packIdx] ?? [])];
    const playerPickIdx = currentPack.findIndex(c => c.id === picked.id);
    if (playerPickIdx !== -1) currentPack.splice(playerPickIdx, 1);

    // Simulate bot auto-picks: remove BOT_PICKS_PER_ROUND random cards
    for (let b = 0; b < BOT_PICKS_PER_ROUND && currentPack.length > 0; b++) {
      const botIdx = Math.floor(Math.random() * currentPack.length);
      currentPack.splice(botIdx, 1);
    }

    const newAllPacks = [...allPacks];
    newAllPacks[packIdx] = currentPack;

    const newPickNum = pickNum + 1; // player picks made in this pack

    const finishDraft = (finalPicks: Card[]) => {
      setDraftPicks(finalPicks);
      setAllPacks(newAllPacks);
      // Build the deck builder pool: drafted cards + basic fillers for 40-card deck building
      const fillers = buildBasicFillers(finalPicks, 25);
      const fullPool = toPoolCards([...finalPicks, ...fillers]);
      setBuildPool(fullPool);
      // Pre-select all drafted cards
      const preSelected = new Set(fullPool.slice(0, finalPicks.length).map(p => p.key));
      setBuildSelected(preSelected);
      setScreen('draft_build');
    };

    if (newPickNum >= PICKS_PER_PACK) {
      if (packIdx + 1 >= 3) {
        // All 3 packs done → go to deck build
        finishDraft(newPicks);
      } else {
        // Advance to next pack
        setAllPacks(newAllPacks);
        setPackIdx(packIdx + 1);
        setPickNum(0);
        setDraftPicks(newPicks);
      }
    } else {
      setAllPacks(newAllPacks);
      setPickNum(newPickNum);
      setDraftPicks(newPicks);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // DECK BUILDING (DRAFT)
  // ─────────────────────────────────────────────────────────────────────────

  const handleToggleBuildCard = (key: string) => {
    soundFx.playButtonClickSound();
    const next = new Set(buildSelected);
    if (next.has(key)) {
      next.delete(key);
    } else {
      if (next.size >= 40) return; // cap at 40
      next.add(key);
    }
    setBuildSelected(next);
  };

  const handleConfirmDraftDeck = () => {
    if (buildSelected.size !== 40) return;
    soundFx.playCardSummonSound();
    const deck = buildPool
      .filter(pc => buildSelected.has(pc.key))
      .map(pc => pc.card);
    setFinalDeck(deck);
    setScreen('confirm');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // DECK BUILDING (SEALED)
  // ─────────────────────────────────────────────────────────────────────────

  const handleToggleSealedCard = (key: string) => {
    soundFx.playButtonClickSound();
    const next = new Set(sealedSelected);
    if (next.has(key)) {
      next.delete(key);
    } else {
      if (next.size >= 40) return; // cap at 40
      next.add(key);
    }
    setSealedSelected(next);
  };

  const handleConfirmSealedDeck = () => {
    if (sealedSelected.size !== 40) return;
    soundFx.playCardSummonSound();
    const deck = sealedPool
      .filter(pc => sealedSelected.has(pc.key))
      .map(pc => pc.card);
    setFinalDeck(deck);
    setScreen('confirm');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // FINAL ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  const handlePlayDeck = () => {
    soundFx.playVictorySound();
    onStartDraftMatch(finalDeck, selectedAvatar);
  };

  const handleAbandon = () => {
    soundFx.playDefeatSound();
    // Refund 50% of entry cost
    const refund = Math.floor(entryCost * ABANDON_REFUND_RATE);
    refundShards(refund);
    refreshEconomy();
    // Reset all state
    setScreen('select');
    setEventType(null);
    setEntryCost(0);
    setAllPacks([]);
    setPackIdx(0);
    setPickNum(0);
    setDraftPicks([]);
    setSealedPool([]);
    setSealedSelected(new Set());
    setBuildPool([]);
    setBuildSelected(new Set());
    setFinalDeck([]);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  const totalDraftPicks = 15; // 3 packs × 5 picks per pack = 15 total drafted cards
  const totalPackPicks = 5;   // player gets 5 picks per pack (2 bots auto-pick after each player pick)

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full min-h-screen bg-[#080512] flex flex-col overflow-hidden select-none">

      {/* ── Top Header Bar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#0d0920] border-b border-white/10 shadow-lg flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={screen === 'select' ? onBack : handleAbandon}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {screen === 'select' ? 'Main Menu' : 'Abandon (50% Refund)'}
          </button>
          <div>
            <h2 className="font-serif font-black text-lg text-amber-300 tracking-widest uppercase flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              Limited Format Events
            </h2>
            <p className="text-[11px] text-slate-500 leading-none">Booster Draft · Sealed Deck</p>
          </div>
        </div>

        {/* Economy Badge */}
        <div className="flex items-center gap-2 bg-black/40 border border-amber-500/30 rounded-xl px-3 py-1.5">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="text-amber-300 font-bold text-sm font-mono">{economy.shards.toLocaleString()}</span>
          <span className="text-slate-500 text-xs">Shards</span>
        </div>
      </div>

      {/* ── Content Area ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">

        {/* ════════════════════════════════════════════════════════════════
            SCREEN: EVENT SELECTION
        ════════════════════════════════════════════════════════════════ */}
        {screen === 'select' && (
          <div className="max-w-4xl mx-auto flex flex-col gap-8 pt-6">
            <div className="text-center">
              <h1 className="font-serif font-black text-3xl text-amber-300 tracking-widest uppercase mb-2">
                Choose Your Event
              </h1>
              <p className="text-slate-400 text-sm">Build a deck from freshly opened packs and battle your way to glory.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Booster Draft Tile */}
              <EventTile
                icon={<Layers className="w-8 h-8 text-cyan-300" />}
                iconBg="bg-cyan-950/80 border-cyan-500/60"
                title="Booster Draft"
                titleColor="text-cyan-300"
                borderColor="border-cyan-500/40"
                glowColor="hover:shadow-[0_0_40px_rgba(6,182,212,0.25)]"
                cost={DRAFT_COST}
                canAfford={economy.shards >= DRAFT_COST}
                description={
                  <>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Draft from a simulated <strong className="text-slate-100">8-player pod</strong>.
                      You receive <strong className="text-slate-100">3 packs of 15 cards</strong>.
                      Pick <strong className="text-slate-100">1 card per pass</strong> — 15 total picks.
                    </p>
                    <ul className="text-xs text-slate-400 space-y-1 mt-3">
                      <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-cyan-400" /> 3 × 15-card packs (8C / 5U / 2R each)</li>
                      <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-cyan-400" /> 15 total player picks</li>
                      <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-cyan-400" /> Build 40-card deck with basic fillers</li>
                    </ul>
                  </>
                }
                buttonLabel="Enter Draft Pod"
                buttonIcon={<Sparkles className="w-4 h-4" />}
                buttonClass="from-cyan-600 to-cyan-400 hover:from-cyan-500 hover:to-cyan-300"
                onEnter={handleEnterDraft}
              />

              {/* Sealed Deck Tile */}
              <EventTile
                icon={<Package className="w-8 h-8 text-amber-300" />}
                iconBg="bg-amber-950/80 border-amber-500/60"
                title="Sealed Deck"
                titleColor="text-amber-300"
                borderColor="border-amber-500/40"
                glowColor="hover:shadow-[0_0_40px_rgba(251,191,36,0.25)]"
                cost={SEALED_COST}
                canAfford={economy.shards >= SEALED_COST}
                description={
                  <>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Open <strong className="text-slate-100">6 booster packs</strong> instantly and receive a
                      <strong className="text-slate-100"> 60-card pool</strong>.
                      Select exactly <strong className="text-slate-100">40 cards</strong> to build your sealed deck.
                    </p>
                    <ul className="text-xs text-slate-400 space-y-1 mt-3">
                      <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-amber-400" /> 6 × 10-card packs (6C / 3U / 1R each)</li>
                      <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-amber-400" /> 60-card pool, sorted by pact</li>
                      <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-amber-400" /> Select exactly 40 cards to play</li>
                    </ul>
                  </>
                }
                buttonLabel="Open Sealed Pool"
                buttonIcon={<Package className="w-4 h-4" />}
                buttonClass="from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-300"
                onEnter={handleEnterSealed}
              />
            </div>

            {/* Info bar */}
            <div className="flex items-center gap-3 bg-slate-900/60 border border-white/10 rounded-2xl px-5 py-4 text-xs text-slate-400">
              <Shield className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span>Abandoning an event mid-draft refunds <strong className="text-slate-300">50%</strong> of the entry cost back to your Shards wallet.</span>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            SCREEN: DRAFT PICKING
        ════════════════════════════════════════════════════════════════ */}
        {screen === 'draft_picking' && (
          <div className="max-w-6xl mx-auto flex flex-col gap-4">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0d0920] border border-cyan-500/30 rounded-2xl px-5 py-3">
              <div>
                <h3 className="font-serif font-black text-xl text-cyan-300">
                  Pack {packIdx + 1} of 3 &mdash; Pick {pickNum + 1} of {totalPackPicks}
                </h3>
                <p className="text-xs text-slate-400">Click a card to draft it into your pool</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Pack progress */}
                <div className="flex flex-col gap-1 items-end">
                  <div className="text-xs text-slate-400">Pack Progress</div>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPackPicks }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${i < pickNum ? 'bg-cyan-400' : 'bg-slate-700'}`}
                      />
                    ))}
                  </div>
                </div>
                {/* Draft picks tally */}
                <div className="font-mono text-xs font-bold text-amber-300 bg-black/60 border border-amber-500/40 px-3 py-1.5 rounded-xl">
                  {draftPicks.length} / {totalDraftPicks} Drafted
                </div>
              </div>
            </div>

            {/* Current pack grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {currentPackCards.map(pc => (
                <DraftPickCard key={pc.key} pc={pc} onPick={() => handleDraftPick(pc)} />
              ))}
            </div>

            {/* Drafted pile preview */}
            {draftPicks.length > 0 && (
              <div className="bg-[#0d0920] border border-white/10 rounded-2xl px-5 py-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Your Drafted Cards ({draftPicks.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {draftPicks.map((c, i) => (
                    <div
                      key={c.id + i}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs font-semibold ${getPactDotColor(c).replace('bg-', 'border-').replace('500', '600')} bg-black/30 text-slate-200`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${getPactDotColor(c)}`} />
                      {c.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            SCREEN: DRAFT DECK BUILD
        ════════════════════════════════════════════════════════════════ */}
        {screen === 'draft_build' && (
          <div className="max-w-5xl mx-auto flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0d0920] border border-amber-500/30 rounded-2xl px-5 py-3">
              <div>
                <h3 className="font-serif font-black text-xl text-amber-300">Build Your Draft Deck</h3>
                <p className="text-xs text-slate-400">
                  Select exactly <strong className="text-amber-300">40 cards</strong> from your drafted picks + basic fillers.
                  Your 15 drafted cards are pre-selected.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`font-mono text-sm font-bold px-3 py-1.5 rounded-xl border ${buildSelected.size === 40 ? 'text-green-300 border-green-500/50 bg-green-950/40' : 'text-amber-300 border-amber-500/40 bg-black/40'}`}>
                  {buildSelected.size} / 40
                </div>
                <button
                  onClick={handleConfirmDraftDeck}
                  disabled={buildSelected.size !== 40}
                  className={`px-5 py-2.5 rounded-xl font-serif font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all duration-200
                    ${buildSelected.size === 40
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 hover:scale-105 shadow-[0_0_16px_rgba(251,191,36,0.5)]'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                >
                  <Play className="w-4 h-4" />
                  Confirm Deck
                </button>
              </div>
            </div>

            <DeckBuilderGrid
              groups={buildGrouped}
              selected={buildSelected}
              onToggle={handleToggleBuildCard}
              draftedKeys={new Set(buildPool.slice(0, draftPicks.length).map(pc => pc.key))}
            />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            SCREEN: SEALED DECK BUILD
        ════════════════════════════════════════════════════════════════ */}
        {screen === 'sealed_build' && (
          <div className="max-w-5xl mx-auto flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0d0920] border border-amber-500/30 rounded-2xl px-5 py-3">
              <div>
                <h3 className="font-serif font-black text-xl text-amber-300">Build Your Sealed Deck</h3>
                <p className="text-xs text-slate-400">
                  Select exactly <strong className="text-amber-300">40 cards</strong> from your {sealedPool.length}-card pool.
                  Pool is sorted by pact.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`font-mono text-sm font-bold px-3 py-1.5 rounded-xl border ${sealedSelected.size === 40 ? 'text-green-300 border-green-500/50 bg-green-950/40' : 'text-amber-300 border-amber-500/40 bg-black/40'}`}>
                  {sealedSelected.size} / 40
                </div>
                <button
                  onClick={handleConfirmSealedDeck}
                  disabled={sealedSelected.size !== 40}
                  title={sealedSelected.size !== 40 ? `Select ${40 - sealedSelected.size} more card(s)` : 'Build sealed deck'}
                  className={`px-5 py-2.5 rounded-xl font-serif font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all duration-200
                    ${sealedSelected.size === 40
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 hover:scale-105 shadow-[0_0_16px_rgba(251,191,36,0.5)]'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                >
                  <Play className="w-4 h-4" />
                  Build Deck ({40 - sealedSelected.size} needed)
                </button>
              </div>
            </div>

            <DeckBuilderGrid
              groups={sealedGrouped}
              selected={sealedSelected}
              onToggle={handleToggleSealedCard}
            />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            SCREEN: CONFIRM / LAUNCH
        ════════════════════════════════════════════════════════════════ */}
        {screen === 'confirm' && (
          <div className="max-w-5xl mx-auto flex flex-col gap-6 pt-4">
            {/* Hero banner */}
            <div className="bg-gradient-to-r from-amber-950/60 via-[#0d0920] to-amber-950/60 border border-amber-500/50 rounded-3xl px-8 py-6 text-center shadow-[0_0_40px_rgba(251,191,36,0.2)]">
              <CheckCircle2 className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h2 className="font-serif font-black text-3xl text-amber-300 tracking-widest uppercase mb-1">
                Deck Ready!
              </h2>
              <p className="text-slate-400 text-sm">
                Your {eventType === 'draft' ? 'Draft' : 'Sealed'} deck is locked in ({finalDeck.length} cards).
                Choose your Primal Avatar and enter the arena!
              </p>
            </div>

            {/* Avatar selector */}
            <div className="bg-[#0d0920] border border-white/10 rounded-2xl px-5 py-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Select Primal Avatar</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {PRIMAL_AVATARS_LIST.map(av => (
                  <div
                    key={av.id}
                    onClick={() => { soundFx.playButtonClickSound(); setSelectedAvatarId(av.id); }}
                    className={`cursor-pointer rounded-xl border p-2 transition-all duration-200
                      ${selectedAvatarId === av.id
                        ? 'border-amber-400 bg-amber-950/60 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                        : 'border-white/10 bg-black/30 hover:border-amber-400/50 hover:bg-amber-950/20'
                      }`}
                  >
                    <CardView card={av} size="sm" disableHoverPreview={false} />
                  </div>
                ))}
              </div>
            </div>

            {/* Final deck list */}
            <div className="bg-[#0d0920] border border-white/10 rounded-2xl px-5 py-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Your 40-Card Deck
              </h4>
              <DeckSummaryList cards={finalDeck} />
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handlePlayDeck}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-serif font-black uppercase tracking-widest text-sm shadow-[0_0_24px_rgba(251,191,36,0.5)] hover:scale-105 transition-all duration-200"
              >
                <Play className="w-5 h-5 fill-current" />
                Play with this Deck!
              </button>
              <button
                onClick={handleAbandon}
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 font-serif font-bold uppercase tracking-widest text-sm transition-colors"
              >
                <XCircle className="w-5 h-5" />
                Abandon Draft
                <span className="text-xs text-slate-500 normal-case font-normal">(+{Math.floor(entryCost * 0.5)} Shards refund)</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

interface EventTileProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  titleColor: string;
  borderColor: string;
  glowColor: string;
  cost: number;
  canAfford: boolean;
  description: React.ReactNode;
  buttonLabel: string;
  buttonIcon: React.ReactNode;
  buttonClass: string;
  onEnter: () => void;
}

const EventTile: React.FC<EventTileProps> = ({
  icon, iconBg, title, titleColor, borderColor, glowColor,
  cost, canAfford, description, buttonLabel, buttonIcon, buttonClass, onEnter,
}) => (
  <div className={`bg-[#0d0920]/90 border ${borderColor} rounded-3xl p-7 flex flex-col justify-between gap-6 shadow-2xl transition-shadow duration-300 ${glowColor}`}>
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className={`w-14 h-14 rounded-2xl ${iconBg} border flex items-center justify-center shadow-lg`}>
          {icon}
        </div>
        {/* Cost badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold
          ${canAfford ? 'border-amber-500/40 bg-amber-950/40 text-amber-300' : 'border-red-500/40 bg-red-950/40 text-red-400'}`}>
          <Coins className="w-3.5 h-3.5" />
          {cost.toLocaleString()} Shards
        </div>
      </div>
      <h3 className={`font-serif font-black text-2xl ${titleColor}`}>{title}</h3>
      <div className="space-y-2">{description}</div>
    </div>
    <div>
      {!canAfford && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-500/30 rounded-xl px-3 py-2 mb-3">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          Insufficient Shards — need {cost.toLocaleString()}, you have {loadEconomy().shards.toLocaleString()}
        </div>
      )}
      <button
        onClick={canAfford ? onEnter : undefined}
        disabled={!canAfford}
        title={!canAfford ? 'Insufficient Shards' : undefined}
        className={`w-full py-3.5 rounded-2xl bg-gradient-to-r ${buttonClass} text-slate-950 font-serif font-black uppercase text-sm tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all duration-200
          ${canAfford ? 'hover:scale-105 cursor-pointer' : 'opacity-40 cursor-not-allowed grayscale'}`}
      >
        {buttonIcon}
        {buttonLabel}
      </button>
    </div>
  </div>
);

// ── Deck Builder Grid ─────────────────────────────────────────────────────────

interface DeckBuilderGridProps {
  groups: Record<string, PoolCard[]>;
  selected: Set<string>;
  onToggle: (key: string) => void;
  draftedKeys?: Set<string>; // highlight drafted cards in the draft build screen
}

const DeckBuilderGrid: React.FC<DeckBuilderGridProps> = ({ groups, selected, onToggle, draftedKeys }) => {
  const sortedGroupNames = Object.keys(groups).sort();
  return (
    <div className="flex flex-col gap-4">
      {sortedGroupNames.map(groupName => (
        <div key={groupName} className="bg-[#0d0920] border border-white/10 rounded-2xl p-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Star className="w-3 h-3 text-amber-500" />
            {groupName}
            <span className="text-slate-600 font-normal">({groups[groupName].length} cards)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
            {groups[groupName].map(pc => (
              <div key={pc.key} className="relative">
                <MiniCardRow
                  pc={pc}
                  isSelected={selected.has(pc.key)}
                  onClick={() => onToggle(pc.key)}
                  showCheckbox
                />
                {draftedKeys?.has(pc.key) && (
                  <span className="absolute right-1 top-0.5 text-[9px] font-bold text-cyan-400 bg-cyan-950/70 px-1 py-0.5 rounded">
                    DRAFTED
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Deck Summary List ─────────────────────────────────────────────────────────

interface DeckSummaryListProps {
  cards: Card[];
}

const DeckSummaryList: React.FC<DeckSummaryListProps> = ({ cards }) => {
  // Group by pact/type and count duplicates
  const groups: Record<string, { card: Card; count: number }[]> = {};
  const seen = new Map<string, { card: Card; count: number }>();
  for (const card of cards) {
    const existing = seen.get(card.id);
    if (existing) {
      existing.count++;
    } else {
      const entry = { card, count: 1 };
      seen.set(card.id, entry);
      const key = card.pact ?? card.type ?? 'Other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    }
  }
  const sortedKeys = Object.keys(groups).sort();
  return (
    <div className="flex flex-col gap-3">
      {sortedKeys.map(key => (
        <div key={key}>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{key}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
            {groups[key].map(({ card, count }) => (
              <div key={card.id} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-black/30 border border-white/5">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getPactDotColor(card)}`} />
                <span className="text-xs text-slate-200 flex-1 truncate">{card.name}</span>
                <span className={`text-[10px] font-bold flex-shrink-0 ${getRarityColor(card)}`}>{getRarityBadge(card)}</span>
                {count > 1 && (
                  <span className="text-xs font-bold text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded-md">×{count}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
