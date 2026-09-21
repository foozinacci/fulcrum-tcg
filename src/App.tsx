import React, { useState, useEffect } from 'react';
import { GameState, Card } from './types/game';
import { createInitialGameState } from './logic/gameEngine';
import { GameBoard } from './components/GameBoard';
import { DeckBuilder } from './components/DeckBuilder';
import { CardCodex } from './components/CardCodex';
import { RulesModal } from './components/RulesModal';
import { ParticleCanvas } from './components/ParticleCanvas';
import { Play, Shield, BookOpen, Layers, Sparkles, Swords } from 'lucide-react';
import { soundFx } from './utils/soundFx';

type ViewMode = 'menu' | 'game' | 'deckbuilder' | 'codex';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('menu');
  const [showRules, setShowRules] = useState(false);
  const [customDeck, setCustomDeck] = useState<Card[] | undefined>(undefined);
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('fulcrum_custom_deck');
    if (saved) {
      try {
        setCustomDeck(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleStartGame = () => {
    soundFx.playVictorySound();
    const initial = createInitialGameState(customDeck);
    setGameState(initial);
    setViewMode('game');
  };

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden select-none bg-[#080512]">
      {/* Background Cosmic Canvas */}
      <ParticleCanvas />

      {/* View Switcher */}
      {viewMode === 'menu' && (
        <div className="relative z-10 flex flex-col items-center justify-between min-h-screen p-6 max-w-5xl mx-auto">
          {/* Top Logo / Title Banner */}
          <div className="flex flex-col items-center text-center mt-6">
            <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-fulcrum-panel border border-fulcrum-border text-xs text-fulcrum-gold font-serif mb-3 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-fulcrum-gold animate-pulse" />
              <span>OFFICIAL FULCRUM TCG SIMULATOR</span>
            </div>
            <h1 className="font-serif font-black text-6xl md:text-7xl text-gold-gradient tracking-widest drop-shadow-[0_0_35px_rgba(243,198,105,0.4)]">
              FULCRUM
            </h1>
            <p className="text-sm md:text-base text-slate-300 max-w-md font-sans mt-2">
              Align Sol & Umbra. Balance the cosmic core. Claim absolute victory.
            </p>
          </div>

          {/* Central Stage: User Card Back Showcase */}
          <div className="my-6 relative group">
            <div className="w-52 h-80 rounded-2xl overflow-hidden border-2 border-fulcrum-gold shadow-[0_0_40px_rgba(243,198,105,0.3)] transition-transform duration-500 transform group-hover:scale-105 group-hover:rotate-1">
              <img
                src="/assets/card-back.jpg"
                alt="FULCRUM Card Back"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Metallic Glow Ring */}
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-cyan-500/20 blur-xl pointer-events-none -z-10 group-hover:opacity-100 opacity-60 transition" />
          </div>

          {/* Action Menu Buttons */}
          <div className="w-full max-w-md flex flex-col gap-3 mb-8">
            <button
              onClick={handleStartGame}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-fulcrum-gold via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-serif font-black tracking-widest uppercase text-lg shadow-[0_0_25px_rgba(243,198,105,0.4)] flex items-center justify-center gap-3 transition transform hover:scale-[1.02]"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>PLAY VS AI BOT</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  soundFx.playButtonClickSound();
                  setViewMode('deckbuilder');
                }}
                className="py-3 rounded-xl bg-fulcrum-panel/90 border border-fulcrum-border hover:border-fulcrum-gold text-slate-200 font-serif font-bold text-sm flex items-center justify-center gap-2 transition hover:bg-slate-800"
              >
                <Layers className="w-4 h-4 text-fulcrum-gold" />
                <span>DECK FORGE</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playButtonClickSound();
                  setViewMode('codex');
                }}
                className="py-3 rounded-xl bg-fulcrum-panel/90 border border-fulcrum-border hover:border-fulcrum-gold text-slate-200 font-serif font-bold text-sm flex items-center justify-center gap-2 transition hover:bg-slate-800"
              >
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>CARD CODEX</span>
              </button>
            </div>

            <button
              onClick={() => {
                soundFx.playButtonClickSound();
                setShowRules(true);
              }}
              className="py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 font-sans text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>How to Play & Rules</span>
            </button>
          </div>
        </div>
      )}

      {/* Game View */}
      {viewMode === 'game' && gameState && (
        <GameBoard
          initialState={gameState}
          onRestart={() => {
            const fresh = createInitialGameState(customDeck);
            setGameState(fresh);
          }}
        />
      )}

      {/* Deck Builder View */}
      {viewMode === 'deckbuilder' && (
        <DeckBuilder
          onBack={() => setViewMode('menu')}
          onSaveDeck={(deck) => {
            setCustomDeck(deck);
            handleStartGame();
          }}
        />
      )}

      {/* Codex View */}
      {viewMode === 'codex' && <CardCodex onBack={() => setViewMode('menu')} />}

      {/* Rules Modal */}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
};
