import React, { useState, useEffect } from 'react';
import { GameState, Card, BoardPermanent } from '../types/game';
import { playHandCard, executeCombat, convertHandCardToCore, advancePhase, endTurn, executeMulligan, discardHandCardsForEndStep, drawCard } from '../logic/gameEngine';
import { runAiTurnStep } from '../logic/aiBot';
import { CardView } from './CardView';
import { TurnPhaseBar } from './TurnPhaseBar';
import { OracleSearchModal } from './OracleSearchModal';
import { BugReportModal } from './BugReportModal';
import { ScrollText, Volume2, VolumeX, RotateCcw, Crown, CircleDollarSign, BookOpen, Swords, Zap, Shield, Sparkles, ChevronRight, RotateCw, Search, Bug, Crosshair } from 'lucide-react';
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
  const [showBugReport, setShowBugReport] = useState(false);
  const [mulliganSelectedIds, setMulliganSelectedIds] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(soundFx.isMuted());
  const [hoveredCard, setHoveredCard] = useState<Card | null>(null);
  const [hasNotifiedEnd, setHasNotifiedEnd] = useState(false);
  
  // Discard Pile Inspection Modal State
  const [inspectingGraveyard, setInspectingGraveyard] = useState<'player' | 'opponent' | null>(null);

  // End Step Max Hand Size (6) Discard Modal State
  const [showEndStepDiscardModal, setShowEndStepDiscardModal] = useState(false);
  const [endStepDiscardSelectedIds, setEndStepDiscardSelectedIds] = useState<string[]>([]);

  // AI Turn Step Trigger with Fail-safe Watchdog
  useEffect(() => {
    if (state.turnOwner === 'opponent' && !state.winner) {
      const timer = setTimeout(() => {
        setState((prevState) => {
          if (prevState.turnOwner !== 'opponent' || prevState.winner) return prevState;
          const nextState = runAiTurnStep(prevState);
          if (nextState === prevState) {
            return endTurn(prevState);
          }
          return nextState;
        });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [state.turnOwner, state.turnNumber, state.phase, state.winner]);

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

  // Interaction Handlers
  const handleHandCardClick = (card: Card) => {
    if (state.turnOwner !== 'player' || state.winner) return;
    soundFx.playButtonClickSound();

    if (card.type === 'attachment') {
      const friendlyBeings = state.player.field.filter((p) => p.card.type === 'being');
      if (friendlyBeings.length > 0) {
        setState((prev) => ({
          ...prev,
          selectedHandCardId: card.id,
          selectedBoardInstanceId: null,
          isTargeting: true,
          validTargetType: 'being',
        }));
        return;
      }
    }

    if (card.type === 'charm' && (card.ability?.damage || card.ability?.buffEdge || card.ability?.buffGrit)) {
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

    if (state.selectedHandCardId) {
      soundFx.playCardDrawSound();
      setState((prev) => playHandCard(prev, state.selectedHandCardId!, perm.instanceId));
    } else {
      setState((prev) => ({
        ...prev,
        selectedBoardInstanceId: state.selectedBoardInstanceId === perm.instanceId ? null : perm.instanceId,
        selectedHandCardId: null,
        isTargeting: state.selectedBoardInstanceId !== perm.instanceId,
        validTargetType: 'being',
      }));
    }
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

    if (state.player.hand.length > 6) {
      setShowEndStepDiscardModal(true);
      setEndStepDiscardSelectedIds([]);
      return;
    }

    setState((prev) => endTurn(prev));
  };

  const handleConfirmEndStepDiscards = () => {
    const requiredCount = state.player.hand.length - 6;
    if (endStepDiscardSelectedIds.length !== requiredCount) return;
    soundFx.playButtonClickSound();
    setShowEndStepDiscardModal(false);
    setState((prev) => discardHandCardsForEndStep(prev, endStepDiscardSelectedIds));
    setEndStepDiscardSelectedIds([]);
  };

  const handleTurnStartDraw = () => {
    soundFx.playButtonClickSound();
    setState((prev) => {
      const updatedPlayer = drawCard(prev.player, prev.logs);
      return {
        ...prev,
        player: updatedPlayer,
        phase: 'main1',
        logs: [
          {
            id: Math.random().toString(),
            text: `${prev.player.name} selected Turn Start Action: Drew 1 card from deck.`,
            type: 'info',
            timestamp: new Date().toLocaleTimeString(),
          },
          ...prev.logs,
        ],
      };
    });
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
      
      {/* Mobile Portrait Warning Overlay */}
      <div className="md:hidden landscape:hidden fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center text-amber-300">
        <RotateCw className="w-12 h-12 text-fulcrum-gold animate-spin mb-3" />
        <h3 className="font-serif font-black text-xl uppercase text-gold-gradient">Rotate Device to Landscape</h3>
        <p className="text-xs text-slate-300 mt-2 max-w-xs">
          Fulcrum Arena requires Mobile Landscape Mode for optimal 3D board view, deck stacks, and card inspection.
        </p>
      </div>

      {/* Main Arena Layout: Left/Center 3D Battlefield (3 Cols) + Right Oracle & Game Info Dock (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 h-full gap-3 min-h-0 overflow-hidden">
        
        {/* ========================================================================= */}
        {/* CENTER/LEFT BATTLEFIELD (3 COLUMNS - ISOMETRIC 3D ARENA STAGE)            */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-2 h-full min-h-0 overflow-hidden bg-gradient-to-b from-[#0e0a1f] via-[#070412] to-[#0c081b] border-2 border-fulcrum-gold rounded-3xl p-3 sm:p-4 shadow-[0_0_80px_rgba(243,198,105,0.35)] relative order-1">
          
          {/* Volumetric Sub-surface Ambient Stage Lighting */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(243,198,105,0.08)_0%,transparent_75%)] pointer-events-none" />
          <div className="absolute inset-0 [background-image:radial-gradient(rgba(243,198,105,0.06)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />

          {/* Decorative Gold Filigree Accents with Ambient Glow */}
          <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-fulcrum-gold shadow-[0_0_12px_rgba(243,198,105,0.5)] pointer-events-none z-10" />
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-fulcrum-gold shadow-[0_0_12px_rgba(243,198,105,0.5)] pointer-events-none z-10" />
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-fulcrum-gold shadow-[0_0_12px_rgba(243,198,105,0.5)] pointer-events-none z-10" />
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-fulcrum-gold shadow-[0_0_12px_rgba(243,198,105,0.5)] pointer-events-none z-10" />

          {/* BATTLEFIELD STAGE CONTAINER */}
          <div className="flex flex-col justify-between h-full min-h-0 w-full space-y-2">

            {/* ----------------------------------------------------------------------- */}
            {/* ZONE 1: OPPONENT TERRITORY (DISCARD/DECK LEFT | HAND TOP | AVATAR RIGHT)  */}
            {/* ----------------------------------------------------------------------- */}
            <div className="flex items-center justify-between gap-3 min-h-[100px] sm:min-h-[115px] flex-shrink-0 bg-gradient-to-b from-black/80 via-purple-950/20 to-black/60 border border-white/15 rounded-2xl px-4 py-2 relative overflow-visible shadow-lg">
              
              {/* Volumetric Top Glow Halo */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-20 bg-amber-500/10 blur-2xl pointer-events-none rounded-full" />

              {/* TOP LEFT: Stacked Opponent DISCARD (Top) & DECK (Bottom) */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                {/* Discard */}
                <div
                  onClick={() => setInspectingGraveyard('opponent')}
                  onMouseEnter={() => {
                    if (state.opponent.graveyard.length > 0) {
                      setHoveredCard(state.opponent.graveyard[state.opponent.graveyard.length - 1]);
                    }
                  }}
                  title="Click to View Opponent's Discard Pile"
                  className="w-12 h-16 rounded-lg border border-slate-700 bg-slate-950 flex items-center justify-center relative shadow-md cursor-pointer hover:scale-105 hover:border-fulcrum-gold transition"
                >
                  {state.opponent.graveyard.length > 0 ? (
                    <CardView card={state.opponent.graveyard[state.opponent.graveyard.length - 1]} size="sm" disableClickFlip={true} disableHoverPreview={true} />
                  ) : (
                    <span className="text-[8px] font-bold text-slate-500 uppercase">Discard</span>
                  )}
                  <span className="absolute inset-0 bg-black/60 flex items-center justify-center font-mono font-bold text-xs text-slate-200">
                    {state.opponent.graveyard.length}
                  </span>
                </div>

                {/* Deck */}
                <div className="w-12 h-16 rounded-lg border border-fulcrum-gold/80 bg-[#0a0814] overflow-hidden relative shadow-md">
                  <img src="/assets/card-back.jpg" alt="Opponent Deck" className="w-full h-full object-cover" />
                  <span className="absolute inset-0 bg-black/40 flex items-center justify-center font-mono font-bold text-xs text-amber-300">
                    {state.opponent.deck.length}
                  </span>
                </div>
              </div>

              {/* TOP CENTER: OPPONENT HAND (FULLY REVEALED - OPEN INFORMATION) */}
              <div className="flex items-center justify-center -space-x-5 pt-1 pb-1 px-2 overflow-visible min-h-[100px] flex-1">
                {state.opponent.hand.map((hc, idx) => (
                  <div
                    key={hc.card.id + idx}
                    onMouseEnter={() => setHoveredCard(hc.card)}
                    className="flex-shrink-0 transition-all duration-300 cursor-pointer relative group transform hover:-translate-y-3 hover:scale-105 hover:z-30 shadow-md rounded-xl"
                  >
                    <CardView card={hc.card} size="sm" disableClickFlip={true} disableHoverPreview={true} />
                  </div>
                ))}
              </div>

              {/* TOP RIGHT: OPPONENT AVATAR */}
              <div
                onMouseEnter={() => setHoveredCard(state.opponent.primalAvatar)}
                onClick={handleOpponentNexusClick}
                className={`flex items-center gap-2.5 cursor-pointer transition-all duration-300 relative px-4 py-2 rounded-2xl border-2 shadow-lg ${
                  isAttackerSelected || isSpellSelected || (state.isTargeting && state.selectedHandCardId)
                    ? 'border-red-500 bg-red-950/80 shadow-[0_0_25px_rgba(239,68,68,0.8)] animate-pulse scale-105 ring-2 ring-red-400'
                    : 'border-fulcrum-gold bg-gradient-to-r from-black/90 via-slate-950/90 to-black/90 hover:scale-105 hover:border-amber-300'
                }`}
              >
                <div className="shadow-md rounded-lg overflow-hidden border border-amber-400/40">
                  <CardView card={state.opponent.primalAvatar} size="sm" disableClickFlip={true} disableHoverPreview={true} />
                </div>
                
                <div className="space-y-0.5 text-left font-mono min-w-[140px]">
                  <div className="font-serif font-black text-xs text-gold-gradient uppercase flex items-center gap-1 drop-shadow">
                    <Crown className="w-3.5 h-3.5 text-fulcrum-gold animate-bounce" />
                    <span>{state.opponent.primalAvatar.name}</span>
                  </div>
                  <div className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-red-500" />
                    <span>{state.opponent.lifeTotal} / {state.opponent.startingLife} HP</span>
                  </div>
                  <div className="text-[9.5px] font-bold text-amber-300">
                    Primal Dmg: <span className="text-red-400 font-extrabold">{oppPrimalDmg}</span> / 5
                  </div>
                  <div className="text-[9.5px] text-cyan-300 font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span>Core: {state.opponent.corePool}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TURN START CONVERSION PHASE PROMPT BANNER */}
            {state.turnOwner === 'player' && state.phase === 'conversion' && !state.winner && (
              <div className="bg-gradient-to-r from-amber-950/90 via-purple-950/90 to-amber-950/90 border-2 border-fulcrum-gold rounded-2xl p-3 my-1 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_30px_rgba(243,198,105,0.4)] z-30 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-amber-200">
                  <Sparkles className="w-5 h-5 text-fulcrum-gold animate-spin" />
                  <div>
                    <span className="font-serif font-black uppercase text-sm text-gold-gradient block">Conversion Phase — Turn Start Action</span>
                    <span className="text-xs text-slate-300">Click a fresh card below to Convert (+Core), draw from deck, or proceed to Main 1.</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTurnStartDraw}
                    className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold text-xs px-3 py-1.5 rounded-xl shadow-md transition cursor-pointer"
                  >
                    Draw 1 Card from Deck
                  </button>
                  <button
                    onClick={() => {
                      soundFx.playButtonClickSound();
                      setState((prev) => advancePhase(prev));
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-600 shadow-md transition cursor-pointer"
                  >
                    Proceed to Main 1 &gt;
                  </button>
                </div>
              </div>
            )}

            {/* SPELL / ABILITY TARGETING MODE PROMPT BANNER */}
            {state.isTargeting && state.selectedHandCardId && (
              <div className="bg-gradient-to-r from-red-950/90 via-amber-950/90 to-red-950/90 border-2 border-amber-400 rounded-2xl p-2.5 my-1 flex items-center justify-between gap-3 shadow-[0_0_25px_rgba(243,198,105,0.7)] z-30 animate-pulse">
                <div className="flex items-center gap-2 text-amber-200 font-bold text-xs">
                  <Crosshair className="w-5 h-5 text-red-400 animate-spin" />
                  <span>TARGET SELECTION REQUIRED: Click an enemy unit or opponent Nexus to resolve spell!</span>
                </div>
                <button
                  onClick={() => setState((prev) => ({ ...prev, isTargeting: false, selectedHandCardId: null }))}
                  className="bg-red-900/80 hover:bg-red-800 text-red-200 font-bold text-[10px] px-3 py-1 rounded-full border border-red-500/50 cursor-pointer"
                >
                  Cancel Target Selection
                </button>
              </div>
            )}

            {/* ----------------------------------------------------------------------- */}
            {/* ZONE 2, 3 & 4: RECESSED TACTICAL FIELD & VOLUMETRIC FULCRUM CATALYST     */}
            {/* ----------------------------------------------------------------------- */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDropOnField}
              className="flex-1 my-1 bg-gradient-to-b from-[#0a0618] via-[#04020a] to-[#0a0618] border border-white/10 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden shadow-[inset_0_12px_30px_rgba(0,0,0,0.95)] [transform:translateZ(5px)]"
            >
              {/* Opponent Tactical Field Zone (Upper Battlefield) */}
              <div className="flex items-center justify-center gap-3 overflow-x-auto min-h-[105px] py-1">
                {state.opponent.field.length === 0 ? (
                  <div className="border border-dashed border-white/10 rounded-xl px-8 py-4 text-center text-xs text-slate-600 italic bg-black/20">
                    Opponent Tactical Field Empty
                  </div>
                ) : (
                  state.opponent.field.map((perm) => (
                    <div
                      key={perm.instanceId}
                      onMouseEnter={() => setHoveredCard(perm.card)}
                      onClick={() => handleOpponentUnitClick(perm)}
                      className={`flex-shrink-0 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 cursor-pointer shadow-[0_12px_24px_rgba(0,0,0,0.85)] rounded-xl ${
                        state.isTargeting && state.selectedHandCardId ? 'ring-2 ring-red-500 animate-pulse scale-105' : ''
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
                        isTargetable={isAttackerSelected || isSpellSelected || (state.isTargeting && !!state.selectedHandCardId)}
                      />
                    </div>
                  ))
                )}
              </div>

              {/* ZONE 3: FULCRUM CATALYST ENERGY CONDUIT (VOLUMETRIC DIVIDER) */}
              <div className="relative my-2 flex items-center justify-center">
                <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-fulcrum-gold/80 to-transparent shadow-[0_0_20px_rgba(243,198,105,0.9)]" />
                <div className="absolute px-4 py-0.5 rounded-full bg-black/90 border border-fulcrum-gold text-[9px] font-serif font-bold text-amber-300 uppercase tracking-widest shadow-[0_0_15px_rgba(243,198,105,0.4)] flex items-center gap-1.5 [transform:translateZ(10px)]">
                  <Sparkles className="w-3 h-3 text-fulcrum-gold animate-spin" />
                  <span>Fulcrum Nexus Catalyst Zone</span>
                  <Sparkles className="w-3 h-3 text-fulcrum-gold animate-spin" />
                </div>
              </div>

              {/* Player Tactical Field Zone (Lower Battlefield) */}
              <div className="flex items-center justify-center gap-3 overflow-x-auto min-h-[105px] py-1">
                {state.player.field.length === 0 ? (
                  <div className="border border-dashed border-fulcrum-gold/30 rounded-xl px-8 py-4 text-center text-xs text-slate-400 italic bg-amber-950/10">
                    Drag & Drop Beings or Spells Here to Cast
                  </div>
                ) : (
                  state.player.field.map((perm) => (
                    <div
                      key={perm.instanceId}
                      onMouseEnter={() => setHoveredCard(perm.card)}
                      onClick={() => handleFriendlyUnitClick(perm)}
                      className={`flex-shrink-0 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 cursor-pointer shadow-[0_12px_24px_rgba(0,0,0,0.85)] rounded-xl ${
                        state.selectedBoardInstanceId === perm.instanceId ? 'ring-2 ring-fulcrum-gold rounded-xl scale-110 -translate-y-2 shadow-[0_0_30px_rgba(243,198,105,0.6)]' : ''
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
            {/* ZONE 5 & 6: PLAYER TERRITORY (AVATAR LEFT | HAND BOTTOM | DECK/DISCARD RIGHT) */}
            {/* ----------------------------------------------------------------------- */}
            <div className="flex items-center justify-between gap-3 min-h-[110px] sm:min-h-[120px] flex-shrink-0 bg-gradient-to-b from-black/60 via-amber-950/20 to-black/80 border border-white/15 rounded-2xl px-4 py-2 relative overflow-visible shadow-lg">
              
              {/* Volumetric Bottom Ambient Halo */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-96 h-20 bg-cyan-500/10 blur-2xl pointer-events-none rounded-full" />

              {/* BOTTOM LEFT: PLAYER AVATAR */}
              <div
                onMouseEnter={() => setHoveredCard(state.player.primalAvatar)}
                className="flex items-center gap-2.5 bg-gradient-to-r from-black/90 via-slate-950/90 to-black/90 border-2 border-fulcrum-gold rounded-2xl px-4 py-2 shadow-lg hover:scale-105 transition-all duration-300 flex-shrink-0"
              >
                <div className="shadow-md rounded-lg overflow-hidden border border-amber-400/40">
                  <CardView card={state.player.primalAvatar} size="sm" disableClickFlip={true} disableHoverPreview={true} />
                </div>
                
                <div className="space-y-0.5 text-left font-mono min-w-[140px]">
                  <div className="font-serif font-black text-xs text-gold-gradient uppercase flex items-center gap-1 drop-shadow">
                    <Crown className="w-3.5 h-3.5 text-fulcrum-gold animate-bounce" />
                    <span>{state.player.primalAvatar.name}</span>
                  </div>
                  <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    <span>{state.player.lifeTotal} / {state.player.startingLife} HP</span>
                  </div>
                  <div className="text-[9.5px] font-bold text-amber-300">
                    Primal Dmg: <span className="text-red-400 font-extrabold">{playerPrimalDmg}</span> / 5
                  </div>
                  <div className="text-[9.5px] text-cyan-300 font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span>Core: {state.player.corePool}</span>
                  </div>
                </div>
              </div>

              {/* BOTTOM CENTER: PLAYER HAND FAN */}
              <div className="flex items-center justify-center -space-x-4 sm:-space-x-5 pt-3 pb-1 px-4 overflow-x-auto max-w-full min-h-[120px] flex-1 scrollbar-thin scrollbar-thumb-fulcrum-gold/40">
                {state.player.hand.map((hc, idx) => {
                  const isSelected = state.selectedHandCardId === hc.card.id;
                  const canConvert = state.phase === 'conversion' && hc.drawnThisTurn && state.player.corePool < 10;
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
                      className={`flex-shrink-0 transition-all duration-300 cursor-pointer relative group transform hover:-translate-y-4 hover:scale-105 hover:z-30 shadow-md rounded-xl ${
                        isSelected ? 'ring-2 ring-fulcrum-gold rounded-xl -translate-y-4 scale-105 z-40 shadow-[0_0_25px_rgba(243,198,105,0.7)]' : ''
                      }`}
                    >
                      <CardView card={hc.card} size="sm" disableClickFlip={true} disableHoverPreview={true} />

                      {canConvert && (
                        <button
                          onClick={(e) => handleConvertCard(hc.card, e)}
                          className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-400 text-emerald-300 font-mono font-bold text-[9px] px-2 py-0.5 rounded-full shadow-md z-50 whitespace-nowrap"
                        >
                          +1 Core
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* BOTTOM RIGHT: Stacked Player DECK (Top) & DISCARD (Bottom) */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                {/* Deck */}
                <div className="w-12 h-16 rounded-lg border-2 border-fulcrum-gold/90 bg-[#0a0814] overflow-hidden relative shadow-md">
                  <img src="/assets/card-back.jpg" alt="Your Deck" className="w-full h-full object-cover" />
                  <span className="absolute inset-0 bg-black/40 flex items-center justify-center font-mono font-bold text-xs text-amber-300">
                    {state.player.deck.length}
                  </span>
                </div>

                {/* Discard */}
                <div
                  onClick={() => setInspectingGraveyard('player')}
                  onMouseEnter={() => {
                    if (state.player.graveyard.length > 0) {
                      setHoveredCard(state.player.graveyard[state.player.graveyard.length - 1]);
                    }
                  }}
                  title="Click to View Your Discard Pile"
                  className="w-12 h-16 rounded-lg border border-slate-700 bg-slate-950 flex items-center justify-center relative shadow-md cursor-pointer hover:scale-105 hover:border-fulcrum-gold transition"
                >
                  {state.player.graveyard.length > 0 ? (
                    <CardView card={state.player.graveyard[state.player.graveyard.length - 1]} size="sm" disableClickFlip={true} disableHoverPreview={true} />
                  ) : (
                    <span className="text-[8px] font-bold text-slate-500 uppercase">Discard</span>
                  )}
                  <span className="absolute inset-0 bg-black/60 flex items-center justify-center font-mono font-bold text-xs text-slate-200">
                    {state.player.graveyard.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT-HAND DOCK: ORACLE INSPECTOR & GAME STATUS INFO (RIGHT SIDE OF SCREEN)*/}
        {/* ========================================================================= */}
        <div className="lg:col-span-1 flex flex-col justify-between bg-fulcrum-panel/90 border-2 border-fulcrum-gold rounded-3xl p-4 shadow-[0_0_40px_rgba(243,198,105,0.2)] overflow-hidden order-2 lg:order-last">
          
          {/* TOP SECTION: GAME INFO & ORBIT PROGRESSION */}
          <div className="bg-black/60 border border-white/10 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5 font-serif font-black text-amber-300 text-xs tracking-wider">
                <Sparkles className="w-4 h-4 text-fulcrum-gold animate-pulse" />
                <span>ORBIT {state.turnNumber}</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                state.turnOwner === 'player' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500' : 'bg-red-950 text-red-300 border border-red-500'
              }`}>
                {state.turnOwner === 'player' ? 'Your Turn' : 'Opponent Turn'}
              </span>
            </div>

            {/* Turn Phase Stepper */}
            <TurnPhaseBar
              currentPhase={state.phase}
              turnNumber={state.turnNumber}
              corePool={state.player.corePool}
              onAdvancePhase={() => setState((prev) => advancePhase(prev))}
              isPlayerTurn={state.turnOwner === 'player'}
            />

            {/* Primary Action Button: End Turn / Next Phase */}
            <button
              onClick={handleEndTurn}
              disabled={state.turnOwner !== 'player' || !!state.winner}
              className={`w-full py-2.5 rounded-xl font-serif font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition transform hover:scale-105 ${
                state.turnOwner === 'player' && !state.winner
                  ? 'bg-gradient-to-r from-fulcrum-gold via-amber-500 to-amber-600 text-slate-950'
                  : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <span>End Priority Turn</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* MIDDLE SECTION: ORACLE CARD INSPECTOR */}
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

                {/* Oracle Description Box */}
                <div className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-[11px] text-slate-200 leading-relaxed font-sans max-h-32 overflow-y-auto">
                  <div className="font-serif font-bold text-amber-300 text-xs mb-1">{hoveredCard.name} ({hoveredCard.pact || 'Neutral'})</div>
                  <div>{hoveredCard.description}</div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center text-slate-500 p-4 space-y-2">
                <Crown className="w-10 h-10 text-fulcrum-gold/40 animate-pulse" />
                <span className="font-serif font-bold text-slate-300 text-xs uppercase">Oracle Inspector</span>
                <span className="text-[10.5px] text-slate-500 leading-relaxed">Hover over any card on the field or hand to inspect full artwork & abilities</span>
              </div>
            )}
          </div>

          {/* BOTTOM SECTION: AUDIO & UTILITY CONTROLS */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
            <button
              onClick={() => setShowOracle(true)}
              className="py-2 rounded-xl bg-purple-950/80 border border-purple-500 hover:border-purple-400 text-purple-200 font-serif font-bold text-[10px] flex items-center justify-center gap-1 transition"
            >
              <Search className="w-3.5 h-3.5 text-purple-400" />
              <span>Rules</span>
            </button>

            <button
              onClick={() => setShowLogs(true)}
              className="py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 font-serif font-bold text-[10px] flex items-center justify-center gap-1 transition"
            >
              <ScrollText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Logs</span>
            </button>

            <button
              onClick={() => setShowBugReport(true)}
              className="py-2 rounded-xl bg-amber-950/80 border border-amber-500 hover:border-amber-400 text-amber-200 font-serif font-bold text-[10px] flex items-center justify-center gap-1 transition"
            >
              <Bug className="w-3.5 h-3.5 text-amber-400" />
              <span>Report Bug</span>
            </button>
          </div>
        </div>

      </div>

      {/* Bug Report Modal */}
      {showBugReport && (
        <BugReportModal
          gameState={state}
          onClose={() => setShowBugReport(false)}
          onSubmitReport={(report) => {
            console.log('User logged bug report:', report.id);
          }}
        />
      )}

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
      {/* Discard Pile Inspection Modal */}
      {inspectingGraveyard && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0e0a1f] border-2 border-fulcrum-gold rounded-3xl p-6 max-w-4xl w-full max-h-[85vh] flex flex-col shadow-[0_0_60px_rgba(243,198,105,0.4)]">
            <div className="flex items-center justify-between border-b border-fulcrum-gold/40 pb-4 mb-4">
              <h3 className="font-serif font-black text-xl text-gold-gradient uppercase flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-fulcrum-gold" />
                <span>{inspectingGraveyard === 'player' ? 'Your Discard Pile' : "Opponent's Discard Pile"} ({state[inspectingGraveyard].graveyard.length} Cards)</span>
              </h3>
              <button
                onClick={() => setInspectingGraveyard(null)}
                className="text-slate-400 hover:text-white font-bold text-sm px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-900 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {state[inspectingGraveyard].graveyard.length === 0 ? (
                <div className="text-center py-16 text-slate-500 font-mono italic">
                  Discard pile is currently empty.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {state[inspectingGraveyard].graveyard.map((card, idx) => (
                    <div
                      key={card.id + idx}
                      onMouseEnter={() => setHoveredCard(card)}
                      className="transform hover:scale-105 transition cursor-pointer shadow-lg rounded-xl overflow-hidden"
                    >
                      <CardView card={card} size="sm" disableClickFlip={true} disableHoverPreview={true} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* End Step Max Hand Size (6) Discard Modal */}
      {showEndStepDiscardModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-[#0e0a1f] border-2 border-red-500 rounded-3xl p-6 max-w-2xl w-full flex flex-col shadow-[0_0_60px_rgba(239,68,68,0.5)]">
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-950 border border-red-500 text-red-400">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-black text-2xl text-red-400 uppercase">Maximum Hand Size Exceeded</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                At End Step, maximum hand size is <span className="text-amber-300 font-bold">6 cards</span>.
                You currently have <span className="text-red-400 font-bold">{state.player.hand.length} cards</span>.
                Select <span className="text-fulcrum-gold font-bold">{state.player.hand.length - 6} card(s)</span> to discard to your graveyard.
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto p-2 mb-6">
              {state.player.hand.map((hc) => {
                const isSelected = endStepDiscardSelectedIds.includes(hc.card.id);
                return (
                  <div
                    key={hc.card.id}
                    onClick={() => {
                      soundFx.playButtonClickSound();
                      setEndStepDiscardSelectedIds((prev) =>
                        prev.includes(hc.card.id) ? prev.filter((id) => id !== hc.card.id) : [...prev, hc.card.id]
                      );
                    }}
                    className={`cursor-pointer transition-all duration-300 rounded-xl overflow-hidden relative ${
                      isSelected ? 'ring-4 ring-red-500 scale-105 shadow-[0_0_20px_rgba(239,68,68,0.8)]' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <CardView card={hc.card} size="sm" disableClickFlip={true} disableHoverPreview={true} />
                    {isSelected && (
                      <div className="absolute inset-0 bg-red-950/60 flex items-center justify-center font-black text-red-300 uppercase text-xs">
                        Discarding
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-xs font-mono text-slate-400">
                Selected: {endStepDiscardSelectedIds.length} / {state.player.hand.length - 6}
              </span>
              <button
                disabled={endStepDiscardSelectedIds.length !== state.player.hand.length - 6}
                onClick={handleConfirmEndStepDiscards}
                className={`font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg transition ${
                  endStepDiscardSelectedIds.length === state.player.hand.length - 6
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                Confirm Discard & Pass Turn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mulligan Phase Overlay */}
      {state.phase === 'mulligan' && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#1c1538] via-[#0f0a21] to-[#080512] border-2 border-fulcrum-gold rounded-3xl p-6 max-w-2xl w-full text-center shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-fulcrum-gold font-serif font-black text-xs uppercase tracking-widest px-4 py-1 rounded-full bg-black/50 border border-fulcrum-gold/40">
              <Sparkles className="w-4 h-4 text-fulcrum-gold animate-pulse" />
              <span>Official FULCRUM Opening Hand Rule</span>
            </div>

            <h2 className="font-serif font-black text-2xl text-gold-gradient tracking-wider uppercase">
              OPENING HAND MULLIGAN
            </h2>

            <p className="text-xs text-slate-300 max-w-md font-sans">
              You drew <span className="text-amber-300 font-bold">6 cards</span> (54 cards remaining in deck). Select <span className="text-cyan-300 font-bold">up to 3 cards</span> to shuffle back into your deck and redraw replacement(s).
            </p>

            {/* Hand Cards Grid for Mulligan */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 my-2 w-full">
              {state.player.hand.map((hc) => {
                const isSelected = mulliganSelectedIds.includes(hc.card.id);
                return (
                  <div
                    key={hc.card.id}
                    onClick={() => {
                      soundFx.playButtonClickSound();
                      if (isSelected) {
                        setMulliganSelectedIds(mulliganSelectedIds.filter((id) => id !== hc.card.id));
                      } else if (mulliganSelectedIds.length < 3) {
                        setMulliganSelectedIds([...mulliganSelectedIds, hc.card.id]);
                      }
                    }}
                    className={`cursor-pointer transition-all duration-200 relative rounded-xl border-2 p-1 flex flex-col items-center ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/80 ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] scale-105'
                        : 'border-slate-700 bg-slate-900/60 hover:border-fulcrum-gold'
                    }`}
                  >
                    <CardView card={hc.card} size="sm" disableClickFlip={true} disableHoverPreview={true} />
                    <span className={`text-[9px] font-mono font-bold mt-1 px-2 py-0.5 rounded ${
                      isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isSelected ? 'SHUFFLE BACK' : 'KEEP'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  soundFx.playVictorySound();
                  setState((prev) => executeMulligan(prev, mulliganSelectedIds));
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-fulcrum-gold via-amber-500 to-amber-600 text-slate-950 font-serif font-black uppercase text-xs tracking-wider shadow-lg hover:scale-105 transition flex items-center gap-2"
              >
                <span>Confirm Mulligan ({mulliganSelectedIds.length}/3 Shuffled)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
