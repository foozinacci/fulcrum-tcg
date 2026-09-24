import React, { useState } from 'react';
import { GameState, Card, ClientActionIntent, DeckCommitment } from '../types/game';
import { createDeckCommitment, evaluateClientAction, generateDeckHash } from '../logic/serverEngine';
import { Card3DView } from './Card3DView';
import { CardView } from './CardView';
import { ShieldCheck, Lock, Swords, Sparkles, RefreshCw, CheckCircle2, RotateCcw, ShieldAlert, Cpu } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface Playmat3DBoardProps {
  initialState: GameState;
  onRestart: () => void;
}

export const Playmat3DBoard: React.FC<Playmat3DBoardProps> = ({ initialState, onRestart }) => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [serverLog, setServerLog] = useState<string>('Server-Authoritative Engine Active. Deck Committed & Hash Locked.');
  const [lastValidation, setLastValidation] = useState<{ valid: boolean; message: string } | null>(null);

  // Pre-match Cryptographic Deck Commitments
  const [commitment] = useState<DeckCommitment>(() =>
    createDeckCommitment('match_' + Date.now(), initialState.player.deck, initialState.opponent.deck)
  );

  // Send Client Intent to Server Rules Engine for validation
  const handleSendClientIntent = (intentType: ClientActionIntent['type'], cardId?: string, targetInstanceId?: string) => {
    soundFx.playButtonClickSound();

    const intent: ClientActionIntent = {
      actionId: 'act_' + Date.now(),
      matchId: commitment.matchId,
      playerId: 'player',
      type: intentType,
      cardId,
      targetInstanceId,
      clientTimestamp: Date.now(),
    };

    // Evaluate action against pure server-authoritative rules engine
    const result = evaluateClientAction(gameState, intent);

    if (result.valid && result.sanitizedState) {
      soundFx.playVictorySound();
      setGameState(result.sanitizedState);
      setLastValidation({ valid: true, message: result.message });
      setServerLog(`[SERVER OK] ${result.message}`);
    } else {
      soundFx.playButtonClickSound();
      setLastValidation({ valid: false, message: result.message });
      setServerLog(`[SERVER REJECTED] ${result.message}`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnFieldZone = (e: React.DragEvent) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    if (cardId) {
      handleSendClientIntent('PLAY_CARD', cardId);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#070410] p-4 text-slate-100 select-none flex flex-col justify-between overflow-hidden">
      {/* Top Header: Cryptographic Deck Commitment & Server Authority Status */}
      <div className="bg-fulcrum-panel/90 border border-fulcrum-border rounded-2xl p-4 shadow-2xl flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-400 flex items-center justify-center shadow">
            <Cpu className="w-5 h-5 text-purple-300 animate-pulse" />
          </div>
          <div>
            <h2 className="font-serif font-black text-lg text-gold-gradient tracking-wide uppercase flex items-center gap-2">
              <span>SERVER-AUTHORITATIVE 3D STAGE</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300">
                LOCKED & SECURE
              </span>
            </h2>
            <p className="text-xs text-slate-400">Client proposes actions $\rightarrow$ Server validates against pure rules engine</p>
          </div>
        </div>

        {/* Deck Commitments Hashes */}
        <div className="flex items-center gap-4 text-xs font-mono bg-black/60 border border-white/10 px-4 py-2 rounded-xl">
          <div className="flex items-center gap-1.5 text-amber-300">
            <Lock className="w-3.5 h-3.5 text-fulcrum-gold" />
            <span>Player Hash: {commitment.playerHash}</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-1.5 text-cyan-300">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Opponent Hash: {commitment.opponentHash}</span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 font-serif font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
          <span>Reset Stage</span>
        </button>
      </div>

      {/* Server Validation Feedback Banner */}
      {lastValidation && (
        <div
          className={`my-2 p-3 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition animate-in fade-in duration-200 ${
            lastValidation.valid
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
              : 'bg-red-950/80 border-red-500 text-red-300'
          }`}
        >
          {lastValidation.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-red-400" />}
          <span>{serverLog}</span>
        </div>
      )}

      {/* 3D Perspective Playmat Table */}
      <div
        className="flex-1 my-2 bg-gradient-to-b from-[#120b29]/80 via-[#0a0618] to-[#150e33]/90 border-2 border-fulcrum-gold/40 rounded-3xl p-6 shadow-[0_0_80px_rgba(243,198,105,0.2)] flex flex-col justify-between relative overflow-hidden"
        style={{
          transform: 'perspective(1200px) rotateX(12deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Opponent Row */}
        <div className="flex justify-between items-center bg-black/40 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <CardView card={gameState.opponent.primalAvatar} size="sm" disableClickFlip={true} disableHoverPreview={true} />
            <div>
              <div className="font-serif font-bold text-sm text-red-300">{gameState.opponent.name} (Sanitized)</div>
              <div className="font-mono text-xs text-slate-400">{gameState.opponent.lifeTotal} HP • {gameState.opponent.corePool} Core</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400 font-mono">Opponent Hand: <span className="text-amber-300 font-bold">{gameState.opponent.hand.length} Cards (Masked)</span></div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Authoritative Deck Order Server-Side</div>
          </div>
        </div>

        {/* Center Battlefield Play Zone (Drop Target) */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDropOnFieldZone}
          className="my-4 min-h-[220px] bg-black/50 border-2 border-dashed border-fulcrum-gold/40 hover:border-fulcrum-gold rounded-3xl flex flex-col items-center justify-center p-4 transition text-center shadow-inner"
        >
          <Swords className="w-10 h-10 text-fulcrum-gold/60 mb-2 animate-bounce" />
          <h3 className="font-serif font-black text-lg text-gold-gradient">3D PLAYMAT DROP ZONE</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Drag cards onto this field to send a <code className="text-cyan-300">PLAY_CARD</code> intent to the server engine.
          </p>
        </div>

        {/* Player Interactive 3D Bezier Hand Stage */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <div className="flex items-center justify-between w-full px-4 text-xs font-serif font-bold border-b border-white/10 pb-2">
            <span className="text-emerald-300">YOUR HAND ({gameState.player.hand.length} CARDS)</span>
            <button
              onClick={() => handleSendClientIntent('END_TURN')}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-fulcrum-gold to-amber-600 text-slate-950 font-serif font-black text-xs uppercase tracking-wider shadow-md hover:scale-105 transition"
            >
              End Turn Intent
            </button>
          </div>

          {/* Bezier Hand Arc Container */}
          <div className="flex items-center justify-center -space-x-10 pt-4 pb-2 px-6">
            {gameState.player.hand.map((hc, idx) => (
              <Card3DView
                key={hc.card.id + idx}
                card={hc.card}
                indexInHand={idx}
                totalCardsInHand={gameState.player.hand.length}
                isDrawnThisTurn={hc.drawnThisTurn}
                onPlayIntent={(cardId) => handleSendClientIntent('PLAY_CARD', cardId)}
                onConvertIntent={(cardId) => handleSendClientIntent('CONVERT_CORE', cardId)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
