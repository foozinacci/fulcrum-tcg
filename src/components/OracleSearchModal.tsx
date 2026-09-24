import React, { useState } from 'react';
import { Card } from '../types/game';
import { CARD_DATABASE, PRIMAL_AVATARS_LIST } from '../data/cards';
import { CardView } from './CardView';
import { Search, BookOpen, Shield, HelpCircle, X, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface OracleSearchModalProps {
  onClose: () => void;
}

const KEYWORD_GLOSSARY: Record<string, string> = {
  Expedite: 'Instant speed casting cost. Bypasses Pace restrictions on any turn.',
  Pace: 'Earliest turn number required to cast a card at standard Load cost.',
  Core: 'Resource generated when converting hand cards. Core pool caps at 10.',
  Load: 'The Core cost required to cast a card from hand.',
  'Dormant vs Alert': 'Dormant = resting/tapped upon entry. Alert = ready to attack or activate on your turn.',
  'Primal Head-Removal': 'Cumulative damage dealt by a single Primal source. Eliminates target instantly upon hitting 50% of starting life.',
  Siphon: 'Steals active Core directly from an opponent into your own resource pool.',
  Guard: 'Forces all enemy physical attacks to target this Being first.',
  'Dynamic Stats (*/*)': 'Offense/defense numbers derived from active game state (e.g. Vorrath scaling off unspent Core).',
};

export const OracleSearchModal: React.FC<OracleSearchModalProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'cards' | 'keywords'>('cards');

  const allCards = [...CARD_DATABASE, ...PRIMAL_AVATARS_LIST];

  const filteredCards = allCards.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase()) ||
      (c.pact && c.pact.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-fulcrum-panel border-2 border-fulcrum-gold rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(243,198,105,0.4)]">
        {/* Header */}
        <div className="p-4 border-b border-fulcrum-border flex justify-between items-center bg-black/60 px-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-fulcrum-gold" />
            <div>
              <h2 className="font-serif font-black text-xl text-gold-gradient tracking-wide uppercase">
                ORACLE RULES REFERENCE & CARD SEARCH
              </h2>
              <p className="text-[11px] text-slate-400 font-sans">Official keyword definitions, rulings, and full card text search</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Controls: Search Bar & Tabs */}
        <div className="p-4 bg-slate-950/80 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 px-6">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cards by keyword, name, or text..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 focus:border-fulcrum-gold text-xs text-slate-200 rounded-xl pl-9 pr-4 py-2 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-4 py-2 rounded-xl text-xs font-serif font-bold uppercase transition ${
                activeTab === 'cards'
                  ? 'bg-amber-950 border border-amber-400 text-amber-300'
                  : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              Card Text ({filteredCards.length})
            </button>
            <button
              onClick={() => setActiveTab('keywords')}
              className={`px-4 py-2 rounded-xl text-xs font-serif font-bold uppercase transition ${
                activeTab === 'keywords'
                  ? 'bg-cyan-950 border border-cyan-400 text-cyan-300'
                  : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              Keyword Glossary
            </button>
          </div>
        </div>

        {/* Content View */}
        <div className="p-6 overflow-y-auto max-h-[65vh]">
          {activeTab === 'cards' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {filteredCards.map((card) => (
                <div key={card.id} className="flex flex-col items-center">
                  <CardView card={card} size="sm" />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'keywords' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(KEYWORD_GLOSSARY).map(([kw, desc]) => (
                <div key={kw} className="bg-black/50 border border-white/10 rounded-2xl p-4 space-y-1">
                  <div className="font-serif font-bold text-amber-300 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-fulcrum-gold" />
                    <span>{kw}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
