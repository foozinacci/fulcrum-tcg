import React, { useState, useEffect } from 'react';
import { GameState, Card, BoardPermanent } from '../types/game';
import { playHandCard, executeCombat, convertHandCardToCore, advancePhase, endTurn, activatePrimalAvatarAbility2 } from '../logic/gameEngine';
import { runAiTurnStep } from '../logic/aiBot';
import { CardView } from './CardView';
import { TurnPhaseBar } from './TurnPhaseBar';
import { ScrollText, Volume2, VolumeX, RotateCcw, Crown, CircleDollarSign } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface GameBoardProps {
  initialState: GameState;
  onRestart: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ initialState, onRestart }) => {
  const [state, setState] = useState<GameState>(initialState);
  const [showLogs, setShowLogs] = useState(false);
  const [isMuted, setIsMuted] = useState(soundFx.isMuted());
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

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

  // Hand Card Click Fallback
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
      setState((prev) => playHandCard(prev, card.id));
    }
  };

  const handleConvertCard = (card: Card, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
      setState((prev) => executeCombat(prev, prev.selectedBoardInstanceId!, perm.instanceId, prev.bankCoreAmount));
    } else if (state.selectedHandCardId) {
      setState((prev) => playHandCard(prev, prev.selectedHandCardId!, perm.instanceId));
    }
  };

  const handleOpponentNexusClick = () => {
    if (state.turnOwner !== 'player' || state.winner) return;
    soundFx.playButtonClickSound();

    if (state.selectedBoardInstanceId) {
      setState((prev) => executeCombat(prev, prev.selectedBoardInstanceId!, 'nexus', prev.bankCoreAmount));
    } else if (state.selectedHandCardId) {
      setState((prev) => playHandCard(prev, prev.selectedHandCardId!, 'nexus'));
    }
  };

  // --- DRAG AND DROP HANDLERS ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnField = (e: React.DragEvent) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain') || draggedCardId;
    if (!cardId || state.turnOwner !== 'player' || state.winner) return;

    soundFx.playButtonClickSound();
    setState((prev) => playHandCard(prev, cardId));
    setDraggedCardId(null);
  };

  const handleDropOnConvertZone = (e: React.DragEvent) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain') || draggedCardId;
    if (!cardId || state.turnOwner !== 'player' || state.winner) return;

    soundFx.playButtonClickSound();
    setState((prev) => convertHandCardToCore(prev, cardId));
    setDraggedCardId(null);
  };

  const handleDropOnTargetUnit = (e: React.DragEvent, perm: BoardPermanent) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain') || draggedCardId;
    if (!cardId || state.turnOwner !== 'player' || state.winner) return;

    soundFx.playButtonClickSound();
    setState((prev) => playHandCard(prev, cardId, perm.instanceId));
    setDraggedCardId(null);
  };

  const isAttackerSelected = !!state.selectedBoardInstanceId;
  const isSpellSelected = !!state.selectedHandCardId;

  const oppPrimalDmg = state.opponent.primalDamageTaken[state.player.primalAvatar.id] || 0;

  return (
    <div className="w-full h-screen max-h-screen flex flex-col justify-between p-2 md:p-3 max-w-7xl mx-auto relative select-none overflow-hidden">
      {/* Top Navbar */}
      <div className="flex justify-between items-center bg-fulcrum-panel/90 border border-fulcrum-border rounded-xl px-4 py-1.5 backdrop-blur-md z-30 shadow-lg flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-serif font-black text-lg text-gold-gradient tracking-wider">FULCRUM</span>
          <span className="text-xs bg-amber-900/60 border border-amber-500/40 text-amber-200 px-2.5 py-0.5 rounded-full font-sans">
            Turn {state.turnNumber} • {state.turnOwner === 'player' ? 'Your Turn' : 'AI Turn'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-fulcrum-gold" />}
          </button>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-600"
          >
            <ScrollText className="w-4 h-4 text-cyan-400" />
            <span>Logs</span>
          </button>
          <button
            onClick={onRestart}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-xs font-semibold text-amber-200 border border-amber-600"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Restart</span>
          </button>
        </div>
      </div>

      {/* Main Playmat */}
      <div className="flex-1 flex flex-col justify-between py-1 relative gap-2 min-h-0 overflow-hidden">
        {/* OPPONENT SELF-CONTAINED FIELD */}
        <div className="bg-fulcrum-panel/60 border border-fulcrum-border rounded-2xl p-2.5 flex flex-col gap-2 shadow-xl flex-1 justify-between min-h-0">
          {/* Opponent Header Stats Bar */}
          <div
            onClick={handleOpponentNexusClick}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDropOnTargetUnit(e, { instanceId: 'nexus' } as unknown as BoardPermanent)}
            className={`w-full bg-gradient-to-r from-slate-950/90 via-slate-900/90 to-slate-950/90 border border-amber-500/40 rounded-xl px-3 py-1.5 flex items-center justify-between shadow-md transition ${
              isAttackerSelected || isSpellSelected ? 'hover:border-red-500 cursor-pointer hover:shadow-[0_0_20px_#ef4444]' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-amber-400 flex items-center justify-center font-bold text-xs text-amber-200">
                AI
              </div>
              <div>
                <div className="font-serif font-bold text-slate-100 text-xs">{state.opponent.name}</div>
                <div className="text-[10px] text-amber-300 font-sans">
                  Primal Dmg Taken: <span className="font-bold text-amber-300">{oppPrimalDmg}/5</span> (Head-Removal)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-32 sm:w-44 bg-slate-950 h-4 rounded-full border border-slate-700 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-500"
                  style={{ width: `${(state.opponent.lifeTotal / state.opponent.startingLife) * 100}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow">
                  {state.opponent.lifeTotal} / {state.opponent.startingLife} Life
                </span>
              </div>

              <div className="flex items-center gap-1 bg-emerald-950 border border-emerald-500/60 px-2 py-0.5 rounded-lg text-xs font-bold text-emerald-300">
                <CircleDollarSign className="w-3 h-3 text-emerald-400" />
                <span>{state.opponent.corePool} Core</span>
              </div>
            </div>
          </div>

          {/* Opponent Field & Command Avatar Area */}
          <div className="flex-1 flex items-center justify-between gap-3 min-h-0 bg-black/30 border border-white/5 rounded-xl p-2 overflow-x-auto">
            {/* Command Slot Primal Avatar */}
            <div className="flex flex-col items-center flex-shrink-0 relative">
              <CardView
                card={state.opponent.primalAvatar}
                size="sm"
                disableClickFlip={true}
                customEdge={state.opponent.primalAvatar.isDynamicStats ? state.opponent.corePool : (state.opponent.primalAvatar.edge || 5)}
                customGrit={state.opponent.primalAvatar.isDynamicStats ? state.opponent.corePool : (state.opponent.primalAvatar.grit || 6)}
                isTargetable={isAttackerSelected || isSpellSelected}
                onClick={handleOpponentNexusClick}
              />
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-bold text-[8px] px-1.5 rounded-full uppercase flex items-center gap-0.5 z-10 shadow">
                <Crown className="w-2.5 h-2.5" /> 61st Slot
              </div>
            </div>

            {/* Active Permanents */}
            <div className="flex-1 flex items-center justify-center gap-2 overflow-x-auto">
              {state.opponent.field.length === 0 ? (
                <div className="text-[11px] text-slate-600 italic">No Active Opponent Units</div>
              ) : (
                state.opponent.field.map((perm) => (
                  <div
                    key={perm.instanceId}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnTargetUnit(e, perm)}
                  >
                    <CardView
                      card={perm.card}
                      disableClickFlip={true}
                      customEdge={perm.currentEdge}
                      customGrit={perm.currentGrit}
                      isDormant={perm.state === 'dormant'}
                      size="sm"
                      isTargetable={isAttackerSelected || isSpellSelected}
                      onClick={() => handleOpponentUnitClick(perm)}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Opponent Revealed Hand Cards */}
            <div className="flex items-center -space-x-8 flex-shrink-0">
              {state.opponent.hand.length === 0 ? (
                <div className="text-[10px] text-slate-600 italic px-2">Hand Empty</div>
              ) : (
                state.opponent.hand.map((hc, idx) => (
                  <CardView key={hc.card.id + idx} card={hc.card} size="sm" disableClickFlip={true} className="shadow-lg scale-90" />
                ))
              )}
            </div>
          </div>
        </div>

        {/* TURN PHASE BAR (CENTER CONTROL LINE) */}
        <div className="flex items-center justify-between px-3 py-1 bg-black/40 border border-white/10 rounded-xl z-20 flex-shrink-0">
          <div className="text-[11px] text-slate-400 font-sans hidden md:block">
            <span className="font-bold text-amber-300">Attack Cost:</span> 1 Core per attack
          </div>

          <TurnPhaseBar
            currentPhase={state.phase}
            turnNumber={state.turnNumber}
            corePool={state.player.corePool}
            isPlayerTurn={state.turnOwner === 'player'}
            onAdvancePhase={() => setState((prev) => advancePhase(prev))}
          />

          <div>
            <button
              onClick={() => setState((prev) => endTurn(prev))}
              disabled={state.turnOwner !== 'player' || !!state.winner}
              className={`px-5 py-2 rounded-xl font-serif font-bold text-xs tracking-wider uppercase shadow-xl transition-all ${
                state.turnOwner === 'player' && !state.winner
                  ? 'bg-gradient-to-r from-fulcrum-gold to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-[0_0_15px_rgba(243,198,105,0.4)] cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              {state.turnOwner === 'player' ? 'End Turn' : 'AI Turn'}
            </button>
          </div>
        </div>

        {/* PLAYER SELF-CONTAINED FIELD */}
        <div className="bg-fulcrum-panel/60 border border-fulcrum-border rounded-2xl p-2.5 flex flex-col gap-2 shadow-xl flex-1 justify-between min-h-0">
          {/* Player Field & Command Avatar Area (Drop Target for playing cards!) */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDropOnField}
            className={`flex-1 flex items-center justify-between gap-3 min-h-0 border rounded-xl p-2 transition overflow-x-auto ${
              draggedCardId
                ? 'bg-amber-950/30 border-amber-400/80 shadow-[0_0_20px_rgba(243,198,105,0.3)]'
                : 'bg-black/30 border-white/5'
            }`}
          >
            {/* Player Command Slot Primal Avatar */}
            <div className="flex flex-col items-center flex-shrink-0 relative">
              <CardView
                card={state.player.primalAvatar}
                size="sm"
                disableClickFlip={true}
                customEdge={state.player.primalAvatar.isDynamicStats ? state.player.corePool : (state.player.primalAvatar.edge || 5)}
                customGrit={state.player.primalAvatar.isDynamicStats ? state.player.corePool : (state.player.primalAvatar.grit || 6)}
                isSelected={state.selectedBoardInstanceId === state.player.primalAvatar.id}
                onClick={() => {
                  const pEdge = state.player.primalAvatar.isDynamicStats ? state.player.corePool : (state.player.primalAvatar.edge || 5);
                  const pGrit = state.player.primalAvatar.isDynamicStats ? state.player.corePool : (state.player.primalAvatar.grit || 6);
                  handleFriendlyUnitClick({
                    instanceId: state.player.primalAvatar.id,
                    card: state.player.primalAvatar,
                    currentEdge: pEdge,
                    currentGrit: pGrit,
                    maxGrit: pGrit,
                    state: 'alert',
                    bankedCore: 0,
                    attachments: [],
                    isGuard: false,
                  });
                }}
              />
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-bold text-[8px] px-1.5 rounded-full uppercase flex items-center gap-0.5 z-10 shadow">
                <Crown className="w-2.5 h-2.5" /> 61st Slot
              </div>

              {state.turnOwner === 'player' && !state.winner && (
                <button
                  onClick={() => setState((prev) => activatePrimalAvatarAbility2(prev))}
                  className="mt-1 px-2 py-0.5 rounded bg-amber-950/90 hover:bg-amber-900 border border-amber-400 text-[8.5px] font-bold text-amber-300 shadow-md transition flex items-center gap-1"
                  title="Activate Primal Avatar Ability 2"
                >
                  <span>Use Ability 2</span>
                </button>
              )}
            </div>

            {/* Player Active Field Permanents */}
            <div className="flex-1 flex items-center justify-center gap-2 overflow-x-auto">
              {state.player.field.length === 0 ? (
                <div className="text-[11px] text-slate-600 italic">No Active Units (Drag or click cards from hand to play)</div>
              ) : (
                state.player.field.map((perm) => (
                  <CardView
                    key={perm.instanceId}
                    card={perm.card}
                    disableClickFlip={true}
                    customEdge={perm.currentEdge}
                    customGrit={perm.currentGrit}
                    isDormant={perm.state === 'dormant'}
                    size="sm"
                    isSelected={state.selectedBoardInstanceId === perm.instanceId}
                    onClick={() => handleFriendlyUnitClick(perm)}
                  />
                ))
              )}
            </div>

            {/* Player Hand Cards */}
            <div className="flex items-center -space-x-3 hover:space-x-1 transition-all flex-shrink-0">
              {state.player.hand.length === 0 ? (
                <div className="text-[10px] text-slate-600 italic px-2">Hand Empty</div>
              ) : (
                state.player.hand.map((hc) => {
                  const card = hc.card;
                  const isSelected = state.selectedHandCardId === card.id;
                  return (
                    <div key={card.id} className="relative group flex flex-col items-center">
                      <CardView
                        card={card}
                        size="sm"
                        disableClickFlip={true}
                        isSelected={isSelected}
                        draggable={state.turnOwner === 'player' && !state.winner}
                        onDragStart={() => setDraggedCardId(card.id)}
                        onDragEnd={() => setDraggedCardId(null)}
                        onClick={() => handleHandCardClick(card)}
                        className="hover:-translate-y-3 hover:z-30 transition-transform cursor-grab active:cursor-grabbing"
                      />
                      {hc.drawnThisTurn && state.phase === 'conversion' && (
                        <button
                          onClick={(e) => handleConvertCard(card, e)}
                          onDragOver={handleDragOver}
                          onDrop={handleDropOnConvertZone}
                          className="mt-1 transition px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-[8.5px] font-bold text-emerald-300 flex items-center gap-0.5 shadow-lg"
                          title="Convert card into Core pool"
                        >
                          <CircleDollarSign className="w-2.5 h-2.5 text-emerald-400" />
                          <span>Convert +{card.coreValue}</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Player Header Stats Bar (Core Drop Target for Conversion!) */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDropOnConvertZone}
            className={`w-full border rounded-xl px-3 py-1.5 flex items-center justify-between shadow-md transition ${
              draggedCardId && state.phase === 'conversion'
                ? 'bg-emerald-950/80 border-emerald-400/80 shadow-[0_0_20px_#10b981]'
                : 'bg-gradient-to-r from-slate-950/90 via-slate-900/90 to-slate-950/90 border-amber-500/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-amber-400 flex items-center justify-center font-bold text-xs text-amber-200">
                YOU
              </div>
              <div>
                <div className="font-serif font-bold text-slate-100 text-xs">{state.player.name}</div>
                <div className="text-[10px] text-amber-300 font-sans">
                  Deck: {state.player.deck.length} | Discard: {state.player.graveyard.length}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-32 sm:w-44 bg-slate-950 h-4 rounded-full border border-slate-700 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-500"
                  style={{ width: `${(state.player.lifeTotal / state.player.startingLife) * 100}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow">
                  {state.player.lifeTotal} / {state.player.startingLife} Life
                </span>
              </div>

              <div className="flex items-center gap-1 bg-emerald-950 border border-emerald-500/60 px-2 py-0.5 rounded-lg text-xs font-bold text-emerald-300">
                <CircleDollarSign className="w-3 h-3 text-emerald-400" />
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
              {state.winner === 'player' ? 'VICTORY!' : 'DEFEAT'}
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
