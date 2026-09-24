import React, { useState, useEffect } from 'react';
import { GameState, Card, BoardPermanent } from '../types/game';
import { playHandCard, executeCombat, convertHandCardToCore, advancePhase, endTurn, activatePrimalAvatarAbility2 } from '../logic/gameEngine';
import { runAiTurnStep } from '../logic/aiBot';
import { CardView, getPactBorderStyle } from './CardView';
import { TurnPhaseBar } from './TurnPhaseBar';
import { OracleSearchModal } from './OracleSearchModal';
import { ScrollText, Volume2, VolumeX, RotateCcw, Crown, CircleDollarSign, BookOpen, Swords, Zap, Shield, Sparkles, ChevronRight } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface FulcrumNextGenArenaProps {
  initialState: GameState;
  onRestart: () => void;
  onMatchEnd?: (winner: 'player' | 'opponent', logs: any[]) => void;
}

export const FulcrumNextGenArena: React.FC<FulcrumNextGenArenaProps> = ({ initialState, onRestart, onMatchEnd }) => {
  const [state, setState] = useState<GameState>(initialState);
  const [showLogs, setShowLogs] = useState(false);
  const [showOracle, setShowOracle] = useState(false);
  const [isMuted, setIsMuted] = useState(soundFx.isMuted());
  const [hoveredCard, setHoveredCard] = useState<Card | null>(null);
  const [hasNotifiedEnd, setHasNotifiedEnd] = useState(false);

  // AI Turn Step Trigger
  useEffect(() => {
    if (state.turnOwner === 'opponent' && !state.winner) {
      const timer = setTimeout(() => {
        setState((prevState) => runAiTurnStep(prevState));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.turnOwner, state.turnNumber, state.winner]);

  // Match End Notification
  useEffect(() => {
    if (state.winner && !hasNotifiedEnd) {
      setHasNotifiedEnd(true);
      if (onMatchEnd) {
        onMatchEnd(state.winner, state.logs);
      }
    }
  }, [state.winner, hasNotifiedEnd, onMatchEnd, state.logs]);

  const toggleSound = () => {
    setIsMuted(soundFx.toggleMute());
  };

  // Interactions
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
    setState((prev) => ({
      ...prev,
      selectedBoardInstanceId: state.selectedBoardInstanceId === perm.instanceId ? null : perm.instanceId,
      selectedHandCardId: null,
      isTargeting: state.selectedBoardInstanceId !== perm.instanceId,
      validTargetType: 'being',
    }));
  };

  const handleOpponentUnitClick = (targetPerm: BoardPermanent) => {
    if (state.turnOwner !== 'player' || state.winner) return;

    if (state.selectedBoardInstanceId) {
      soundFx.playButtonClickSound();
      setState((prev) => executeCombat(prev, state.selectedBoardInstanceId!, targetPerm.instanceId));
    } else if (state.selectedHandCardId) {
      soundFx.playCardDrawSound();
      setState((prev) => playHandCard(prev, state.selectedHandCardId!, targetPerm.instanceId));
    }
  };

  const handleOpponentNexusClick = () => {
    if (state.turnOwner !== 'player' || state.winner) return;

    if (state.selectedBoardInstanceId) {
      soundFx.playButtonClickSound();
      setState((prev) => executeCombat(prev, state.selectedBoardInstanceId!, 'nexus'));
    } else if (state.selectedHandCardId) {
      soundFx.playCardDrawSound();
      setState((prev) => playHandCard(prev, state.selectedHandCardId!, 'nexus'));
    }
  };

  const handleEndTurn = () => {
    if (state.turnOwner !== 'player' || state.winner) return;
    soundFx.playButtonClickSound();
    setState((prev) => endTurn(prev));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnField = (e: React.DragEvent) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    if (!cardId || state.turnOwner !== 'player' || state.winner) return;
    soundFx.playButtonClickSound();
    setState((prev) => playHandCard(prev, cardId));
  };

  const isAttackerSelected = !!state.selectedBoardInstanceId;
  const isSpellSelected = !!state.selectedHandCardId;
  const oppPrimalDmg = state.opponent.primalDamageTaken[state.player.primalAvatar.id] || 0;
  const playerPrimalDmg = state.player.primalDamageTaken[state.opponent.primalAvatar.id] || 0;

  return (
    <div className="w-full h-screen max-h-screen overflow-hidden p-2 bg-[#05030d] text-slate-100 select-none relative font-sans">
      {/* Main Layout Grid: Left Inspector Dock (1 Col) + Center 3D Cosmic Art-Deco Arena (3 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 h-full gap-3 min-h-0 overflow-hidden">
        
        {/* ========================================================================= */}
        {/* LEFT-HAND INSPECTOR DOCK (Yu-Gi-Oh! Master Duel Style Inspector Panel)   */}
        {/* ========================================================================= */}
        <div className="hidden lg:flex flex-col justify-between bg-fulcrum-panel/90 border-2 border-fulcrum-gold rounded-3xl p-4 shadow-[0_0_40px_rgba(243,198,105,0.2)] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2 font-serif font-black text-amber-300 text-xs tracking-wider">
              <BookOpen className="w-4 h-4 text-fulcrum-gold" />
              <span>ORACLE DOCK</span>
            </div>
            <button
              onClick={() => setShowOracle(true)}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 border border-purple-500 text-purple-300 hover:scale-105 transition"
            >
              Search
            </button>
          </div>

          {/* Card Inspect Preview */}
          <div className="flex-1 flex flex-col items-center justify-center my-2 overflow-y-auto">
            {hoveredCard ? (
              <div className="flex flex-col items-center gap-2 w-full animate-in fade-in duration-150">
                <CardView card={hoveredCard} size="md" disableClickFlip={true} disableHoverPreview={true} />
                
                {/* Stat Badges Grid */}
                <div className="w-full grid grid-cols-5 gap-1 text-center font-mono text-[10px] font-bold bg-black/60 border border-white/10 p-2 rounded-xl mt-1">
                  <span className="text-lime-400">P{hoveredCard.pace}</span>
                  <span className="text-pink-400">L{hoveredCard.load}</span>
                  <span className="text-yellow-400">+{hoveredCard.coreValue || 0}</span>
                  <span className="text-cyan-400">E{hoveredCard.edge || '-'}</span>
                  <span className="text-blue-400">G{hoveredCard.grit || '-'}</span>
                </div>

                {/* Description Box */}
                <div className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-[11px] text-slate-200 leading-relaxed font-sans max-h-36 overflow-y-auto">
                  <div className="font-serif font-bold text-amber-300 text-xs mb-1">{hoveredCard.name} ({hoveredCard.pact})</div>
                  <div>{hoveredCard.description}</div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center text-slate-500 p-4 space-y-2">
                <Crown className="w-10 h-10 text-fulcrum-gold/40 animate-pulse" />
                <span className="font-serif font-bold text-slate-300 text-xs uppercase">Card Inspector</span>
                <span className="text-[10.5px] text-slate-500 leading-relaxed">Hover over any card on the field or hand to inspect full artwork & abilities</span>
              </div>
            )}
          </div>

          {/* Bottom Audio & Log Action Bar */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
            <button
              onClick={() => setShowLogs(true)}
              className="py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <ScrollText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Log History</span>
            </button>

            <button
              onClick={toggleSound}
              className="py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-fulcrum-gold text-slate-300 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-fulcrum-gold" />}
              <span>{isMuted ? 'Muted' : 'Audio ON'}</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CENTER 3D COSMIC ART-DECO BATTLEFIELD (MTG Arena / Wonders CCG Style)    */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-2 h-full min-h-0 overflow-hidden bg-fulcrum-panel/50 border-2 border-fulcrum-gold rounded-3xl p-3 shadow-[0_0_60px_rgba(243,198,105,0.3)] relative">
          
          {/* Decorative Art-Deco Gold Filigree Frame Accents */}
          <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-fulcrum-gold pointer-events-none" />
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-fulcrum-gold pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-fulcrum-gold pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-fulcrum-gold pointer-events-none" />

          {/* ----------------------------------------------------------------------- */}
          {/* ROW 1: OPPONENT TERRITORY & 50% TOP-CENTER PRIMAL COMMAND PEDESTAL       */}
          {/* ----------------------------------------------------------------------- */}
          <div className="flex items-center justify-between gap-3 h-[24%] bg-black/40 border border-white/10 rounded-2xl px-4 py-2 relative overflow-hidden">
            {/* Left: Opponent Discard Pile */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-14 h-20 rounded-xl border border-slate-700 bg-slate-950 flex items-center justify-center relative shadow-lg">
                {state.opponent.graveyard.length > 0 ? (
                  <CardView card={state.opponent.graveyard[state.opponent.graveyard.length - 1]} size="sm" disableClickFlip={true} disableHoverPreview={true} />
                ) : (
                  <span className="text-[10px] font-bold text-slate-600">Discard</span>
                )}
                <span className="absolute inset-0 bg-black/50 flex items-center justify-center font-mono font-bold text-xs text-slate-200">
                  {state.opponent.graveyard.length}
                </span>
              </div>
              <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Opp Discard</span>
            </div>

            {/* 50% TOP-CENTER: OPPONENT PRIMAL COMMAND PEDESTAL */}
            <div
              onMouseEnter={() => setHoveredCard(state.opponent.primalAvatar)}
              onClick={handleOpponentNexusClick}
              className={`flex flex-col items-center cursor-pointer transition transform hover:scale-105 relative px-4 py-2 rounded-2xl border-2 shadow-2xl ${
                isAttackerSelected || isSpellSelected
                  ? 'border-red-500 bg-red-950/60 shadow-[0_0_25px_rgba(239,68,68,0.6)] animate-pulse'
                  : 'border-fulcrum-gold bg-black/60'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-fulcrum-gold" />
                <span className="font-serif font-black text-xs text-gold-gradient uppercase">{state.opponent.primalAvatar.name}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <CardView card={state.opponent.primalAvatar} size="sm" disableClickFlip={true} disableHoverPreview={true} />
                
                <div className="space-y-1 text-left font-mono">
                  <div className="text-xs font-bold text-red-400 flex items-center gap-1">
                    <span>{state.opponent.lifeTotal} / {state.opponent.startingLife} HP</span>
                  </div>
                  <div className="text-[10px] font-bold text-amber-300">
                    Primal Dmg: <span className="text-red-400">{oppPrimalDmg}</span> / 5
                  </div>
                  <div className="text-[10px] text-cyan-300">Core Pool: {state.opponent.corePool}</div>
                </div>
              </div>
            </div>

            {/* Right: Opponent Deck Stack */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-14 h-20 rounded-xl border border-fulcrum-gold/60 bg-[#0a0814] overflow-hidden relative shadow-lg">
                <img src="/assets/card-back.jpg" alt="Opponent Deck" className="w-full h-full object-cover" />
                <span className="absolute inset-0 bg-black/40 flex items-center justify-center font-mono font-bold text-xs text-amber-300">
                  {state.opponent.deck.length}
                </span>
              </div>
              <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Opp Deck</span>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* ROW 2 & 3: CENTER BATTLEFIELD FIELD SLOTS & METALLIC DIVISION RAIL      */}
          {/* ----------------------------------------------------------------------- */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDropOnField}
            className="flex-1 my-1 bg-black/30 border border-white/10 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden"
          >
            {/* Opponent Field Unit Slots */}
            <div className="flex items-center justify-center gap-3 overflow-x-auto min-h-[95px]">
              {state.opponent.field.length === 0 ? (
                <div className="border border-dashed border-white/10 rounded-xl px-6 py-4 text-center text-xs text-slate-600 italic">
                  Opponent Tactical Field Empty
                </div>
              ) : (
                state.opponent.field.map((perm) => (
                  <div
                    key={perm.instanceId}
                    onMouseEnter={() => setHoveredCard(perm.card)}
                    onClick={() => handleOpponentUnitClick(perm)}
                    className="flex-shrink-0 transition transform hover:scale-105 cursor-pointer"
                  >
                    <CardView
                      card={perm.card}
                      disableClickFlip={true}
                      disableHoverPreview={true}
                      customEdge={perm.currentEdge}
                      customGrit={perm.currentGrit}
                      isDormant={perm.state === 'dormant'}
                      size="sm"
                      isTargetable={isAttackerSelected || isSpellSelected}
                    />
                  </div>
                ))
              )}
            </div>

            {/* METALLIC CENTER DIVISION RAIL (Turn Phase & Combat Indicator) */}
            <div className="w-full py-1.5 px-4 bg-gradient-to-r from-amber-950/60 via-slate-950 to-cyan-950/60 border-y border-fulcrum-gold/40 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-fulcrum-gold animate-pulse" />
                <span>ORBIT {state.turnNumber} — {state.turnOwner === 'player' ? 'YOUR PRIORITY TURN' : 'OPPONENT THINKING...'}</span>
              </div>

              <TurnPhaseBar
                currentPhase={state.phase}
                turnNumber={state.turnNumber}
                corePool={state.player.corePool}
                onAdvancePhase={() => setState((prev) => advancePhase(prev))}
                isPlayerTurn={state.turnOwner === 'player'}
              />
            </div>

            {/* Player Field Unit Slots */}
            <div className="flex items-center justify-center gap-3 overflow-x-auto min-h-[95px]">
              {state.player.field.length === 0 ? (
                <div className="border border-dashed border-fulcrum-gold/30 rounded-xl px-6 py-4 text-center text-xs text-slate-400 italic">
                  Drag & Drop Beings or Spells Here to Cast
                </div>
              ) : (
                state.player.field.map((perm) => (
                  <div
                    key={perm.instanceId}
                    onMouseEnter={() => setHoveredCard(perm.card)}
                    onClick={() => handleFriendlyUnitClick(perm)}
                    className={`flex-shrink-0 transition transform hover:scale-105 cursor-pointer ${
                      state.selectedBoardInstanceId === perm.instanceId ? 'ring-2 ring-fulcrum-gold rounded-xl scale-105' : ''
                    }`}
                  >
                    <CardView
                      card={perm.card}
                      disableClickFlip={true}
                      disableHoverPreview={true}
                      customEdge={perm.currentEdge}
                      customGrit={perm.currentGrit}
                      isDormant={perm.state === 'dormant'}
                      size="sm"
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* ROW 4: PLAYER TERRITORY, 50% BOTTOM-CENTER AVATAR & BEZIER HAND FAN     */}
          {/* ----------------------------------------------------------------------- */}
          <div className="flex flex-col justify-between bg-black/40 border border-white/10 rounded-2xl p-3 relative">
            
            {/* Top Sub-Bar: 50% BOTTOM-CENTER PLAYER PRIMAL AVATAR + ACTION BUTTONS */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              {/* Left: Player Discard Pile */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-14 rounded-lg border border-slate-700 bg-slate-950 flex items-center justify-center relative font-mono text-xs font-bold text-slate-300">
                  {state.player.graveyard.length}
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Discard</span>
              </div>

              {/* 50% BOTTOM-CENTER: PLAYER PRIMAL COMMAND PEDESTAL */}
              <div
                onMouseEnter={() => setHoveredCard(state.player.primalAvatar)}
                className="flex items-center gap-3 bg-black/60 border border-fulcrum-gold rounded-2xl px-4 py-1.5 shadow-xl"
              >
                <Crown className="w-4 h-4 text-fulcrum-gold" />
                <span className="font-serif font-black text-xs text-gold-gradient uppercase">{state.player.primalAvatar.name}</span>
                <span className="font-mono text-xs text-emerald-400 font-bold">{state.player.lifeTotal} / {state.player.startingLife} HP</span>
                <span className="font-mono text-[10px] text-amber-300">Primal Dmg: <strong className="text-red-400">{playerPrimalDmg}</strong>/5</span>
                <span className="font-mono text-xs text-cyan-300 font-bold">{state.player.corePool} Core</span>
              </div>

              {/* Right: End Turn Action Button */}
              <button
                onClick={handleEndTurn}
                disabled={state.turnOwner !== 'player' || !!state.winner}
                className={`px-5 py-2 rounded-xl font-serif font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-1.5 transition transform hover:scale-105 ${
                  state.turnOwner === 'player' && !state.winner
                    ? 'bg-gradient-to-r from-fulcrum-gold via-amber-500 to-amber-600 text-slate-950'
                    : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <span>End Turn</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Sub-Bar: PLAYER BEZIER CURVED HAND FAN */}
            <div className="flex items-center justify-center -space-x-8 pt-3 pb-1 overflow-x-auto min-h-[110px]">
              {state.player.hand.map((hc, idx) => {
                const isSelected = state.selectedHandCardId === hc.card.id;
                const canConvert = hc.drawnThisTurn && state.player.corePool < 10;
                const canCast = state.player.corePool >= hc.card.load && state.turnNumber >= hc.card.pace;

                return (
                  <div
                    key={hc.card.id + idx}
                    onMouseEnter={() => setHoveredCard(hc.card)}
                    onClick={() => handleHandCardClick(hc.card)}
                    draggable={canCast || canConvert}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', hc.card.id);
                    }}
                    className={`flex-shrink-0 transition-all duration-300 cursor-pointer relative group transform hover:-translate-y-6 hover:scale-110 hover:z-30 ${
                      isSelected ? 'ring-2 ring-fulcrum-gold rounded-xl -translate-y-6 scale-110 z-40' : ''
                    }`}
                  >
                    <CardView card={hc.card} size="sm" disableClickFlip={true} disableHoverPreview={true} />

                    {/* Conversion Quick-Button Hover Overlay */}
                    {canConvert && (
                      <button
                        onClick={(e) => handleConvertCard(hc.card, e)}
                        className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-400 text-emerald-300 font-mono font-bold text-[9px] px-2 py-0.5 rounded-full shadow-lg z-50 whitespace-nowrap"
                      >
                        +1 Core
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Oracle Search Modal */}
      {showOracle && <OracleSearchModal onClose={() => setShowOracle(false)} />}

      {/* Log History Modal */}
      {showLogs && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-fulcrum-panel border border-fulcrum-border rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-3 border-b border-fulcrum-border flex justify-between items-center bg-black/40">
              <h3 className="font-serif font-bold text-slate-200 flex items-center gap-2 text-sm">
                <ScrollText className="w-4 h-4 text-cyan-400" /> Game Action Log
              </h3>
              <button onClick={() => setShowLogs(false)} className="text-slate-400 font-bold px-2">
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex flex-col gap-2 font-mono text-xs">
              {state.logs.map((log) => (
                <div key={log.id} className="p-2 rounded border bg-slate-900 border-slate-700 text-slate-300">
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
          <div className="bg-gradient-to-b from-[#1c1538] to-[#0a0717] border-2 border-fulcrum-gold rounded-3xl p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
            <Crown className="w-16 h-16 text-fulcrum-gold animate-bounce" />
            <h2 className="font-serif font-black text-3xl tracking-widest uppercase text-gold-gradient">
              {state.winner === 'player' ? 'VICTORY!' : 'DEFEAT'}
            </h2>
            <button
              onClick={onRestart}
              className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-fulcrum-gold to-amber-600 text-slate-950 font-serif font-bold uppercase text-sm shadow-lg hover:scale-105 transition"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
