import React, { useState, useEffect } from 'react';
import { GameState, Card, BoardPermanent } from '../types/game';
import { playHandCard, executeCombat, convertHandCardToCore, endTurn } from '../logic/gameEngine';
import { runAiTurnStep } from '../logic/aiBot';
import { CardView } from './CardView';
import { FulcrumDial } from './FulcrumDial';
import { Shield, Zap, ScrollText, Volume2, VolumeX, RotateCcw, Crown, CircleDollarSign, Flame, Clock } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface GameBoardProps {
  initialState: GameState;
  onRestart: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ initialState, onRestart }) => {
  const [state, setState] = useState<GameState>(initialState);
  const [showLogs, setShowLogs] = useState(false);
  const [isExpediteMode, setIsExpediteMode] = useState(false);
  const [isMuted, setIsMuted] = useState(soundFx.isMuted());

  useEffect(() => {
    if (state.turnOwner === 'opponent' && !state.winner) {
      const timer = setTimeout(() => {
        setState((prevState) => runAiTurnStep(prevState));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.turnOwner, state.turnNumber, state.winner]);

  const toggleSound = () => {
    setIsMuted(soundFx.toggleMute());
  };

  const handleHandCardClick = (card: Card) => {
    if (state.turnOwner !== 'player' || state.winner) return;
    soundFx.playButtonClickSound();

    if (card.type === 'charm' && card.ability?.damage) {
      setState((prev) => ({
        ...prev,
        selectedHandCardId: card.id,
        selectedBoardInstanceId: null,
        isTargeting: true,
        validTargetType: 'any',
      }));
    } else {
      setState((prev) => playHandCard(prev, card.id, isExpediteMode));
    }
  };

  const handleConvertCard = (card: Card, e: React.MouseEvent) => {
    e.stopPropagation();
    if (state.turnOwner !== 'player' || state.winner) return;
    soundFx.playButtonClickSound();
    setState((prev) => convertHandCardToCore(prev, card.id));
  };

  const handleFriendlyUnitClick = (perm: BoardPermanent) => {
    if (state.turnOwner !== 'player' || state.winner) return;
    soundFx.playButtonClickSound();

    if (perm.state !== 'alert') return;

    if (state.selectedBoardInstanceId === perm.instanceId) {
      setState((prev) => ({ ...prev, selectedBoardInstanceId: null, isTargeting: false }));
    } else {
      setState((prev) => ({
        ...prev,
        selectedBoardInstanceId: perm.instanceId,
        selectedHandCardId: null,
        isTargeting: true,
        validTargetType: 'any',
      }));
    }
  };

  const handleOpponentUnitClick = (perm: BoardPermanent) => {
    if (state.turnOwner !== 'player' || state.winner) return;
    soundFx.playButtonClickSound();

    if (state.selectedBoardInstanceId) {
      setState((prev) => executeCombat(prev, prev.selectedBoardInstanceId!, perm.instanceId));
    } else if (state.selectedHandCardId) {
      setState((prev) => playHandCard(prev, prev.selectedHandCardId!, isExpediteMode, perm.instanceId));
    }
  };

  const handleOpponentNexusClick = () => {
    if (state.turnOwner !== 'player' || state.winner) return;
    soundFx.playButtonClickSound();

    if (state.selectedBoardInstanceId) {
      setState((prev) => executeCombat(prev, prev.selectedBoardInstanceId!, 'nexus'));
    } else if (state.selectedHandCardId) {
      setState((prev) => playHandCard(prev, prev.selectedHandCardId!, isExpediteMode, 'nexus'));
    }
  };

  const isAttackerSelected = !!state.selectedBoardInstanceId;
  const isSpellSelected = !!state.selectedHandCardId;

  // Primal Damage progress for opponent
  const oppPrimalDmg = state.opponent.primalDamageTaken[state.player.primalAvatar.id] || 0;

  return (
    <div className="w-full min-h-screen flex flex-col justify-between p-2 md:p-4 max-w-7xl mx-auto relative select-none">
      {/* Top Navbar */}
      <div className="flex justify-between items-center bg-fulcrum-panel/90 border border-fulcrum-border rounded-xl px-4 py-2 backdrop-blur-md z-30 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="font-serif font-black text-xl text-gold-gradient tracking-wider">FULCRUM</span>
          <span className="text-xs bg-purple-900/60 border border-purple-500/40 text-purple-200 px-2.5 py-0.5 rounded-full font-sans">
            Turn {state.turnNumber} • {state.turnOwner === 'player' ? 'Your Move' : 'AI Thinking...'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Expedite Toggle Button */}
          <button
            onClick={() => setIsExpediteMode(!isExpediteMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
              isExpediteMode
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_15px_#f3c669]'
                : 'bg-slate-800 text-slate-300 border-slate-600 hover:text-white'
            }`}
            title="Expedite Mode: Ignore Pace restriction for higher Load cost"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>EXPEDITE MODE: {isExpediteMode ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-fulcrum-gold" />}
          </button>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-600"
          >
            <ScrollText className="w-4 h-4 text-cyan-400" />
            <span>Logs</span>
          </button>
          <button
            onClick={onRestart}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-xs font-semibold text-amber-200 border border-amber-600"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Restart</span>
          </button>
        </div>
      </div>

      {/* Main Playmat */}
      <div className="flex-1 flex flex-col justify-between py-2 relative gap-2">
        {/* OPPONENT ZONE */}
        <div className="flex flex-col items-center gap-2">
          {/* Opponent Stat Bar */}
          <div
            onClick={handleOpponentNexusClick}
            className={`w-full max-w-xl bg-gradient-to-r from-purple-950/90 via-slate-900/90 to-purple-950/90 border border-purple-500/40 rounded-xl p-2.5 flex items-center justify-between shadow-2xl transition ${
              isAttackerSelected || isSpellSelected ? 'hover:border-red-500 cursor-pointer hover:shadow-[0_0_20px_#ef4444]' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-900 border-2 border-purple-400 flex items-center justify-center font-bold text-lg text-purple-200">
                AI
              </div>
              <div>
                <div className="font-serif font-bold text-slate-100 text-sm">{state.opponent.name}</div>
                <div className="text-[11px] text-purple-300 font-sans">
                  Primal Dmg Taken: <span className="font-bold text-amber-300">{oppPrimalDmg}/5</span> (Head-Removal)
                </div>
              </div>
            </div>

            {/* Life Total & Core Pool */}
            <div className="flex items-center gap-3">
              <div className="w-40 bg-slate-950 h-5 rounded-full border border-slate-700 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-500"
                  style={{ width: `${(state.opponent.lifeTotal / state.opponent.startingLife) * 100}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow">
                  {state.opponent.lifeTotal} / {state.opponent.startingLife} Life
                </span>
              </div>

              {/* Core Pool */}
              <div className="flex items-center gap-1 bg-emerald-950 border border-emerald-500/60 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-300">
                <CircleDollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>{state.opponent.corePool} Core</span>
              </div>
            </div>
          </div>

          {/* Opponent Hand (Fully Revealed as per FULCRUM rules!) */}
          <div className="flex justify-center -space-x-6">
            {state.opponent.hand.map((card, idx) => (
              <CardView key={card.id + idx} card={card} size="sm" className="shadow-lg" />
            ))}
          </div>

          {/* Opponent Field (Beings + Primal Avatar) */}
          <div className="w-full max-w-4xl min-h-[140px] bg-purple-950/20 border border-purple-900/30 rounded-2xl p-2 flex justify-center items-center gap-3">
            {/* Primal Avatar Card */}
            <div className="relative">
              <CardView
                card={state.opponent.primalAvatar}
                size="md"
                isTargetable={isAttackerSelected || isSpellSelected}
              />
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-bold text-[9px] px-1.5 rounded-full uppercase flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5" /> 61st Slot
              </div>
            </div>

            {state.opponent.field.map((perm) => (
              <CardView
                key={perm.instanceId}
                card={perm.card}
                customEdge={perm.currentEdge}
                customGrit={perm.currentGrit}
                isDormant={perm.state === 'dormant'}
                size="md"
                isTargetable={isAttackerSelected || isSpellSelected}
                onClick={() => handleOpponentUnitClick(perm)}
              />
            ))}
          </div>
        </div>

        {/* FULCRUM DIAL & ACTION BAR */}
        <div className="flex items-center justify-between px-4 z-20">
          <div className="w-48 text-xs text-slate-400 font-sans hidden md:block">
            <span className="font-bold text-amber-300">Attacking Cost:</span>
            <div className="text-slate-300">1 Core per attacker</div>
          </div>

          <FulcrumDial balance={state.fulcrumBalance} />

          <div className="w-48 flex justify-end">
            <button
              onClick={() => setState((prev) => endTurn(prev))}
              disabled={state.turnOwner !== 'player' || !!state.winner}
              className={`px-6 py-3 rounded-xl font-serif font-bold text-sm tracking-wider uppercase shadow-xl transition-all ${
                state.turnOwner === 'player' && !state.winner
                  ? 'bg-gradient-to-r from-fulcrum-gold to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-[0_0_20px_rgba(243,198,105,0.4)] cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              {state.turnOwner === 'player' ? 'End Turn' : 'AI Turn'}
            </button>
          </div>
        </div>

        {/* PLAYER ZONE */}
        <div className="flex flex-col items-center gap-2">
          {/* Player Field */}
          <div className="w-full max-w-4xl min-h-[140px] bg-amber-950/15 border border-amber-900/30 rounded-2xl p-2 flex justify-center items-center gap-3">
            {/* Player Primal Avatar */}
            <div className="relative">
              <CardView
                card={state.player.primalAvatar}
                size="md"
                isSelected={state.selectedBoardInstanceId === state.player.primalAvatar.id}
                onClick={() =>
                  handleFriendlyUnitClick({
                    instanceId: state.player.primalAvatar.id,
                    card: state.player.primalAvatar,
                    currentEdge: state.player.primalAvatar.edge || 5,
                    currentGrit: state.player.primalAvatar.grit || 6,
                    maxGrit: state.player.primalAvatar.grit || 6,
                    state: 'alert',
                    bankedCore: 0,
                    isGuard: true,
                  })
                }
              />
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-bold text-[9px] px-1.5 rounded-full uppercase flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5" /> 61st Slot
              </div>
            </div>

            {state.player.field.map((perm) => (
              <CardView
                key={perm.instanceId}
                card={perm.card}
                customEdge={perm.currentEdge}
                customGrit={perm.currentGrit}
                isDormant={perm.state === 'dormant'}
                size="md"
                isSelected={state.selectedBoardInstanceId === perm.instanceId}
                onClick={() => handleFriendlyUnitClick(perm)}
              />
            ))}
          </div>

          {/* Player Hand & Conversion Buttons */}
          <div className="flex justify-center -space-x-3 hover:space-x-1 transition-all py-1">
            {state.player.hand.map((card) => {
              const isSelected = state.selectedHandCardId === card.id;
              return (
                <div key={card.id} className="relative group flex flex-col items-center">
                  <CardView
                    card={card}
                    size="md"
                    isSelected={isSelected}
                    showExpedite={isExpediteMode}
                    onClick={() => handleHandCardClick(card)}
                    className="hover:-translate-y-4 hover:z-30 transition-transform"
                  />
                  {/* Convert to Core Button */}
                  <button
                    onClick={(e) => handleConvertCard(card, e)}
                    className="mt-1 opacity-0 group-hover:opacity-100 transition px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-[9px] font-bold text-emerald-300 flex items-center gap-1 shadow-lg"
                    title="Convert card into Core pool"
                  >
                    <CircleDollarSign className="w-3 h-3 text-emerald-400" />
                    <span>Convert +{card.coreValue}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Player Stat Bar */}
          <div className="w-full max-w-xl bg-gradient-to-r from-amber-950/90 via-slate-900/90 to-amber-950/90 border border-amber-500/40 rounded-xl p-2.5 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-900 border-2 border-amber-400 flex items-center justify-center font-bold text-lg text-amber-200">
                YOU
              </div>
              <div>
                <div className="font-serif font-bold text-slate-100 text-sm">{state.player.name}</div>
                <div className="text-[11px] text-amber-300 font-sans">
                  Deck: {state.player.deck.length} | Discard: {state.player.graveyard.length}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-40 bg-slate-950 h-5 rounded-full border border-slate-700 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-500"
                  style={{ width: `${(state.player.lifeTotal / state.player.startingLife) * 100}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow">
                  {state.player.lifeTotal} / {state.player.startingLife} Life
                </span>
              </div>

              {/* Core Pool Counter */}
              <div className="flex items-center gap-1 bg-emerald-950 border border-emerald-500/60 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-300">
                <CircleDollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>{state.player.corePool} Core</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Modal */}
      {showLogs && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-fulcrum-panel border border-fulcrum-border rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-3 border-b border-fulcrum-border flex justify-between items-center bg-black/40">
              <h3 className="font-serif font-bold text-slate-200 flex items-center gap-2">
                <ScrollText className="w-4 h-4 text-cyan-400" /> Game Log
              </h3>
              <button onClick={() => setShowLogs(false)} className="text-slate-400 font-bold px-2">
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex flex-col gap-2 font-mono text-xs">
              {state.logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2 rounded border ${
                    log.type === 'primal'
                      ? 'bg-amber-950/60 border-amber-500 text-amber-200 font-bold'
                      : log.type === 'conversion'
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                      : log.type === 'combat'
                      ? 'bg-red-950/40 border-red-500 text-red-200'
                      : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 mr-2">[{log.timestamp}]</span>
                  {log.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Victory / Defeat Modal */}
      {state.winner && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#1c1538] to-[#0a0717] border-2 border-fulcrum-gold rounded-3xl p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4">
            <Crown className="w-16 h-16 text-fulcrum-gold animate-bounce" />
            <h2 className="font-serif font-black text-3xl tracking-widest uppercase text-gold-gradient">
              {state.winner === 'player' ? 'VICTORY Achieved!' : 'DEFEAT'}
            </h2>
            <button
              onClick={onRestart}
              className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-fulcrum-gold to-amber-600 text-slate-950 font-serif font-bold uppercase text-sm shadow-lg"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
