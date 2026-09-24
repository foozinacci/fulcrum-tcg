import React, { useState } from 'react';
import { BookOpen, Shield, Swords, CircleDollarSign, Clock, Flame, Crown, X, Layers, Users, Zap, Scale, Heart, Sparkles } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'pillars' | 'formats' | 'resources' | 'pace' | 'primal' | 'archetypes' | 'economy'>('all');

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 select-none animate-in fade-in duration-200">
      <div className="bg-fulcrum-panel border-2 border-fulcrum-gold rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(243,198,105,0.4)]">
        {/* Header */}
        <div className="p-4 border-b border-fulcrum-border flex justify-between items-center bg-black/60 px-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-fulcrum-gold" />
            <div>
              <h2 className="font-serif font-black text-xl text-gold-gradient tracking-wide">
                FULCRUM — GAME DESIGN DOCUMENT (GDD)
              </h2>
              <p className="text-[11px] text-slate-400 font-sans">Official Rules & System Specifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar Filter */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-950/80 border-b border-white/10 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg border transition ${activeTab === 'all' ? 'bg-amber-950/90 border-amber-400 text-amber-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
          >
            Full Document
          </button>
          <button
            onClick={() => setActiveTab('pillars')}
            className={`px-3 py-1.5 rounded-lg border transition ${activeTab === 'pillars' ? 'bg-amber-950/90 border-amber-400 text-amber-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
          >
            3 Pillars
          </button>
          <button
            onClick={() => setActiveTab('formats')}
            className={`px-3 py-1.5 rounded-lg border transition ${activeTab === 'formats' ? 'bg-amber-950/90 border-amber-400 text-amber-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
          >
            Formats & Life
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-3 py-1.5 rounded-lg border transition ${activeTab === 'resources' ? 'bg-amber-950/90 border-amber-400 text-amber-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
          >
            Core & Load
          </button>
          <button
            onClick={() => setActiveTab('pace')}
            className={`px-3 py-1.5 rounded-lg border transition ${activeTab === 'pace' ? 'bg-amber-950/90 border-amber-400 text-amber-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
          >
            Pace & Expedite
          </button>
          <button
            onClick={() => setActiveTab('primal')}
            className={`px-3 py-1.5 rounded-lg border transition ${activeTab === 'primal' ? 'bg-amber-950/90 border-amber-400 text-amber-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
          >
            Primal Avatars & Damage
          </button>
          <button
            onClick={() => setActiveTab('archetypes')}
            className={`px-3 py-1.5 rounded-lg border transition ${activeTab === 'archetypes' ? 'bg-amber-950/90 border-amber-400 text-amber-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
          >
            6 Archetypes
          </button>
          <button
            onClick={() => setActiveTab('economy')}
            className={`px-3 py-1.5 rounded-lg border transition ${activeTab === 'economy' ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
          >
            Economy & Progression
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-200 leading-relaxed font-sans max-h-[75vh]">

          {/* SECTION 1: OVERVIEW & PILLARS */}
          {(activeTab === 'all' || activeTab === 'pillars') && (
            <div className="space-y-3 bg-black/40 border border-white/10 rounded-2xl p-5 shadow-inner">
              <div className="flex items-center gap-2 text-base font-serif font-black text-gold-gradient border-b border-white/10 pb-2">
                <Sparkles className="w-5 h-5 text-fulcrum-gold" />
                <h3>Overview & Three Core Pillars</h3>
              </div>
              <p className="text-xs text-slate-300">
                Fulcrum is an original trading card game built to stand apart from existing TCGs at the mechanical level, not just the flavor level. Its core identity rests on three pillars:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="bg-purple-950/40 border border-purple-500/40 rounded-xl p-3 space-y-1">
                  <div className="font-serif font-bold text-purple-300 text-xs flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-400" />
                    1. Fully Revealed Hands
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Players see each other's hands at all times. Tension comes entirely from resource math, sequencing, and threat response — zero hidden information.
                  </p>
                </div>

                <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 space-y-1">
                  <div className="font-serif font-bold text-amber-300 text-xs flex items-center gap-1.5">
                    <CircleDollarSign className="w-4 h-4 text-amber-400" />
                    2. Cards Are Resources
                  </div>
                  <p className="text-[11px] text-slate-300">
                    No mana or lands. Every card in hand is potential board impact (cast it) or potential fuel (convert it) — never both.
                  </p>
                </div>

                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 space-y-1">
                  <div className="font-serif font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-emerald-400" />
                    3. Adaptive Scaling Rules
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Life totals, team pools, and Primal win thresholds scale dynamically per format (1v1, 2v2, 1v2, 1v3, FFA) rather than a flat static number.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: FORMATS & LIFE TOTALS */}
          {(activeTab === 'all' || activeTab === 'formats') && (
            <div className="space-y-3 bg-black/40 border border-white/10 rounded-2xl p-5 shadow-inner">
              <div className="flex items-center gap-2 text-base font-serif font-black text-cyan-300 border-b border-white/10 pb-2">
                <Heart className="w-5 h-5 text-red-400" />
                <h3>Formats & Dynamic Life Totals</h3>
              </div>
              <p className="text-xs text-slate-300">
                Starting life pools and Primal Elimination thresholds scale dynamically based on the total number of players and table balance (Symmetric Teams, Outnumbered Boss Battles, or Free-For-All). In all formats, deck sizes remain strictly invariant (60 main + 1 Primal Avatar), while Primal Damage Elimination threshold is always <strong>50% of the target's starting life pool</strong>:
              </p>

              {/* Formats Table */}
              <div className="overflow-x-auto rounded-xl border border-white/10 mt-2">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-900/90 text-amber-300 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Format Type</th>
                      <th className="p-2.5">Table Setup</th>
                      <th className="p-2.5">Life Calculation Formula</th>
                      <th className="p-2.5">Starting Life Pool</th>
                      <th className="p-2.5">Primal Elim. Threshold</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 bg-black/30 text-slate-300">
                    {/* Symmetric */}
                    <tr>
                      <td className="p-2.5 font-bold text-amber-400">Symmetric</td>
                      <td className="p-2.5 font-semibold text-slate-200">1v1 Duel</td>
                      <td className="p-2.5">2 Players (1 vs 1)</td>
                      <td className="p-2.5 text-slate-400 font-mono">10 * 2 players = 20 HP</td>
                      <td className="p-2.5 font-bold text-emerald-400">20 HP per player</td>
                      <td className="p-2.5 font-bold text-red-400">10 Primal Damage</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-amber-400">Symmetric</td>
                      <td className="p-2.5 font-semibold text-slate-200">2v2 Team</td>
                      <td className="p-2.5">4 Players (2 vs 2)</td>
                      <td className="p-2.5 text-slate-400 font-mono">10 * 4 players = 40 HP</td>
                      <td className="p-2.5 font-bold text-emerald-400">40 HP Team Pool</td>
                      <td className="p-2.5 font-bold text-red-400">20 Primal Damage</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-amber-400">Symmetric</td>
                      <td className="p-2.5 font-semibold text-slate-200">3v3 Team</td>
                      <td className="p-2.5">6 Players (3 vs 3)</td>
                      <td className="p-2.5 text-slate-400 font-mono">10 * 6 players = 60 HP</td>
                      <td className="p-2.5 font-bold text-emerald-400">60 HP Team Pool</td>
                      <td className="p-2.5 font-bold text-red-400">30 Primal Damage</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-amber-400">Symmetric</td>
                      <td className="p-2.5 font-semibold text-slate-200">4v4 Team</td>
                      <td className="p-2.5">8 Players (4 vs 4)</td>
                      <td className="p-2.5 text-slate-400 font-mono">10 * 8 players = 80 HP</td>
                      <td className="p-2.5 font-bold text-emerald-400">80 HP Team Pool</td>
                      <td className="p-2.5 font-bold text-red-400">40 Primal Damage</td>
                    </tr>

                    {/* Asymmetric / Outnumbered */}
                    <tr>
                      <td className="p-2.5 font-bold text-purple-400">Asymmetric</td>
                      <td className="p-2.5 font-semibold text-slate-200">1v2 Outnumbered</td>
                      <td className="p-2.5">Solo vs 2 Teammates</td>
                      <td className="p-2.5 text-slate-400 font-mono">Team = 10*(2+1) = 30 HP | Solo = 2*Team = 60 HP</td>
                      <td className="p-2.5 font-bold text-emerald-400">Solo: 60 HP | Team: 30 HP Pool</td>
                      <td className="p-2.5 font-bold text-red-400">Solo: 30 | Teammate: 15</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-purple-400">Asymmetric</td>
                      <td className="p-2.5 font-semibold text-slate-200">1v3 Outnumbered</td>
                      <td className="p-2.5">Solo vs 3 Teammates</td>
                      <td className="p-2.5 text-slate-400 font-mono">Team = 10*(3+1) = 40 HP | Solo = 2*Team = 80 HP</td>
                      <td className="p-2.5 font-bold text-emerald-400">Solo: 80 HP | Team: 40 HP Pool</td>
                      <td className="p-2.5 font-bold text-red-400">Solo: 40 | Teammate: 20</td>
                    </tr>

                    {/* Free-For-All */}
                    <tr>
                      <td className="p-2.5 font-bold text-cyan-400">Free-For-All</td>
                      <td className="p-2.5 font-semibold text-slate-200">3-Player FFA (1v1v1)</td>
                      <td className="p-2.5">3 Players (No Teams)</td>
                      <td className="p-2.5 text-slate-400 font-mono">10 * 3 players = 30 HP</td>
                      <td className="p-2.5 font-bold text-emerald-400">30 HP each</td>
                      <td className="p-2.5 font-bold text-red-400">15 Primal Damage</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-cyan-400">Free-For-All</td>
                      <td className="p-2.5 font-semibold text-slate-200">4-Player FFA (1v1v1v1)</td>
                      <td className="p-2.5">4 Players (No Teams)</td>
                      <td className="p-2.5 text-slate-400 font-mono">10 * 4 players = 40 HP</td>
                      <td className="p-2.5 font-bold text-emerald-400">40 HP each</td>
                      <td className="p-2.5 font-bold text-red-400">20 Primal Damage</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 3: THE RESOURCE SYSTEM (CORE & LOAD) */}
          {(activeTab === 'all' || activeTab === 'resources') && (
            <div className="space-y-3 bg-black/40 border border-white/10 rounded-2xl p-5 shadow-inner">
              <div className="flex items-center gap-2 text-base font-serif font-black text-yellow-300 border-b border-white/10 pb-2">
                <CircleDollarSign className="w-5 h-5 text-yellow-400" />
                <h3>The Resource System: Core & Load</h3>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <p>
                  Every card has two independent stats: <strong>Core</strong> (value gained when converted) and <strong>Load</strong> (Core cost to cast). Load is generally higher than Core, so resources do not grow passively — you must actively choose between casting a card or converting it.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3 space-y-1">
                    <span className="font-bold text-yellow-300 uppercase tracking-wider text-[10px]">Conversion Rules</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                      <li><strong>Opening Hand Seed</strong>: Opening hand total Core value seeds your starting pool. Opening-hand cards can still be cast later, but can NEVER be converted.</li>
                      <li><strong>Turn-Draw Conversion</strong>: After opening hand, <em>only the card just drawn that turn</em> can be converted. If un-converted on draw turn, the conversion option is lost forever.</li>
                      <li><strong>Hand Size Check</strong>: Forced discards at turn end (limit 6) yield zero Core.</li>
                    </ul>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3 space-y-1">
                    <span className="font-bold text-yellow-300 uppercase tracking-wider text-[10px]">10 Core Hard Cap</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                      <li>Core is hard-capped at <strong>10</strong> at any single moment.</li>
                      <li>Spending Core opens room to convert more in the same turn, allowing multi-cycle combos.</li>
                      <li>Opening hand seed is the only allowed temporary exception to the cap.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: PACE & EXPEDITE */}
          {(activeTab === 'all' || activeTab === 'pace') && (
            <div className="space-y-3 bg-black/40 border border-white/10 rounded-2xl p-5 shadow-inner">
              <div className="flex items-center gap-2 text-base font-serif font-black text-lime-300 border-b border-white/10 pb-2">
                <Clock className="w-5 h-5 text-lime-400" />
                <h3>Pace & Expedite Timing</h3>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <p>
                  <strong>Pace</strong> is a second gating stat alongside Load. A card with <code>Pace: N</code> cannot be played before turn N, regardless of how much Core you have.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="bg-lime-950/30 border border-lime-500/30 rounded-xl p-3 space-y-1">
                    <span className="font-bold text-lime-300 uppercase tracking-wider text-[10px]">Pace Gating</span>
                    <p className="text-[11px] text-slate-300">
                      Pace values are whole numbers applying to all cards. Higher Pace does not mean pure power — it represents scale and role. Pace 1 cards are tightly balanced as immediate opening options.
                    </p>
                  </div>

                  <div className="bg-pink-950/30 border border-pink-500/30 rounded-xl p-3 space-y-1">
                    <span className="font-bold text-pink-300 uppercase tracking-wider text-[10px]">Expedite Instant Casting</span>
                    <p className="text-[11px] text-slate-300">
                      <strong>Expedite</strong> is a keyword (typically <code>Load + 2</code>) allowing a card to be cast at instant speed on anyone's turn, bypassing Pace limits. All Counterspells feature Expedite.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: PRIMAL AVATARS & PRIMAL DAMAGE */}
          {(activeTab === 'all' || activeTab === 'primal') && (
            <div className="space-y-3 bg-black/40 border border-white/10 rounded-2xl p-5 shadow-inner">
              <div className="flex items-center gap-2 text-base font-serif font-black text-amber-300 border-b border-white/10 pb-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3>Primal Avatars & Head-Removal Damage</h3>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 space-y-1">
                    <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px]">60 + 1 Deckbuilding</span>
                    <p className="text-[11px] text-slate-300">
                      Every deck contains 60 main deck cards (max 3 copies per non-Primal card) plus <strong>exactly 1 Primal Avatar</strong> sitting in a dedicated 61st slot outside the main deck. It has Edge/Grit and archetype-defining abilities.
                    </p>
                  </div>

                  <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-3 space-y-1">
                    <span className="font-bold text-red-300 uppercase tracking-wider text-[10px]">Head-Removal Rule (50% Threshold)</span>
                    <p className="text-[11px] text-slate-300">
                      Primal damage targets individual players directly. Once a single Primal source deals cumulative damage equal to <strong>50% of starting life total</strong>, that player is instantly eliminated outright, bypassing team life pools!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: 6 ARCHETYPES */}
          {(activeTab === 'all' || activeTab === 'archetypes') && (
            <div className="space-y-3 bg-black/40 border border-white/10 rounded-2xl p-5 shadow-inner">
              <div className="flex items-center gap-2 text-base font-serif font-black text-emerald-300 border-b border-white/10 pb-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <h3>The 6 Official Pact Archetypes</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3">
                  <div className="font-serif font-bold text-amber-300 text-xs">Corefeast (Amber + Green) — Gluttrix</div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Resource-flow combo deck. Expands Core cap (+5) and digs aggressively through conversions for multi-cycle spending bursts.
                  </p>
                </div>

                <div className="bg-purple-950/40 border border-amber-500/40 rounded-xl p-3">
                  <div className="font-serif font-bold text-purple-300 text-xs">Voidhallow (Purple + Amber) — Nyssara</div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Reactive control deck. Siphons Core directly from opponents whenever they convert, forcing enemy deck conversions into a mill clock.
                  </p>
                </div>

                <div className="bg-emerald-950/40 border border-red-500/40 rounded-xl p-3">
                  <div className="font-serif font-bold text-emerald-300 text-xs">Runescale (Green + Red) — Kazrith</div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Traditional aggro deck. Grants Alert haste to Beings and leverages exhausted Runes to fuel non-stop attacks and combat buffs.
                  </p>
                </div>

                <div className="bg-purple-950/40 border border-red-500/40 rounded-xl p-3">
                  <div className="font-serif font-bold text-red-300 text-xs">Charmbrand (Purple + Red) — Grothmaw</div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Spells-matter Charm-slinging deck. Casts converted Charms from graveyard and copies Charms cast after Grothmaw deals combat damage.
                  </p>
                </div>

                <div className="bg-purple-950/40 border border-emerald-500/40 rounded-xl p-3">
                  <div className="font-serif font-bold text-emerald-300 text-xs">Rotwatch (Purple + Green) — Kharv</div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Graveyard recursion engine. Discards hand cards into Core freely and recasts dead cards directly from discard for their Load cost.
                  </p>
                </div>

                <div className="bg-amber-950/40 border border-red-500/40 rounded-xl p-3">
                  <div className="font-serif font-bold text-amber-300 text-xs">Ironbound (Amber + Red) — Vorrath</div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Single-threat Attachment deck. Stats scale off unused Core (*/*) and sacrifices Attachments to tutor bigger Equipment directly onto Vorrath.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: ECONOMY, PROGRESSION & CRAFTING */}
          {(activeTab === 'all' || activeTab === 'economy') && (
            <div className="space-y-3 bg-black/40 border border-white/10 rounded-2xl p-5 shadow-inner">
              <div className="flex items-center gap-2 text-base font-serif font-black text-cyan-300 border-b border-white/10 pb-2">
                <CircleDollarSign className="w-5 h-5 text-cyan-400" />
                <h3>Economy, Progression, Packs & Crafting Engine</h3>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  Fulcrum features a dual-currency ecosystem balancing free-to-play progression accessibility with premium cosmetic chase support.
                </p>

                {/* Dual Currencies Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-xl p-3 space-y-1">
                    <span className="font-serif font-bold text-cyan-300 text-xs uppercase tracking-wider">Shards (Earned F2P Currency)</span>
                    <p className="text-[11px] text-slate-300">
                      Earned via daily challenges, weekly objectives, match wins, first-win bonuses, and format milestones. Spent on 15-card packs, 60-card precons, and card crafting.
                    </p>
                  </div>

                  <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 space-y-1">
                    <span className="font-serif font-bold text-amber-300 text-xs uppercase tracking-wider">Bones (Premium Store Currency)</span>
                    <p className="text-[11px] text-slate-300">
                      Store-bought currency used for Primal Showcase collector packs (exclusive Primal Avatars & alt-art), cosmetics, and currency conversion.
                    </p>
                  </div>
                </div>

                {/* Rarity & Pack Slot Breakdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3 space-y-1.5">
                    <span className="font-bold text-fulcrum-gold uppercase tracking-wider text-[10px]">15-Card Pack Rarity Breakdown</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px] font-mono">
                      <li>8 Common Card Slots</li>
                      <li>4 Uncommon Card Slots</li>
                      <li>2 Rare Card Slots</li>
                      <li>1 Wildcard / Showcase Slot</li>
                    </ul>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3 space-y-1.5">
                    <span className="font-bold text-fulcrum-gold uppercase tracking-wider text-[10px]">60-Card Precon Slot Breakdown</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px] font-mono">
                      <li>24 Common Slots</li>
                      <li>20 Uncommon Slots</li>
                      <li>12 Rare Slots</li>
                      <li>4 Signature / Top-Tier Slots</li>
                    </ul>
                  </div>
                </div>

                {/* Crafting & Disenchant Engine Table */}
                <div className="overflow-x-auto rounded-xl border border-white/10 mt-2">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-slate-900/90 text-cyan-300 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-2">Card Rarity Tier</th>
                        <th className="p-2">Craft Cost (Shards)</th>
                        <th className="p-2">Disenchant Yield (Shards)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-black/30 text-slate-300 font-mono text-[11px]">
                      <tr>
                        <td className="p-2 font-bold text-slate-300">Common</td>
                        <td className="p-2 text-cyan-300 font-bold">50 Shards</td>
                        <td className="p-2 text-emerald-400 font-bold">+10 Shards</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-emerald-400">Uncommon</td>
                        <td className="p-2 text-cyan-300 font-bold">150 Shards</td>
                        <td className="p-2 text-emerald-400 font-bold">+25 Shards</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-purple-400">Rare</td>
                        <td className="p-2 text-cyan-300 font-bold">500 Shards</td>
                        <td className="p-2 text-emerald-400 font-bold">+100 Shards</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-amber-400">Primal Supertype</td>
                        <td className="p-2 text-cyan-300 font-bold">1,200 Shards</td>
                        <td className="p-2 text-emerald-400 font-bold">+250 Shards</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
