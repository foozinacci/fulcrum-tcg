import React, { useState, useEffect } from 'react';
import { GameState, Card, BoardPermanent } from '../types/game';
import { playHandCard, executeCombat, convertHandCardToCore, advancePhase, endTurn } from '../logic/gameEngine';
import { runAiTurnStep } from '../logic/aiBot';
import { CardView } from './CardView';
import { TurnPhaseBar } from './TurnPhaseBar';
import { OracleSearchModal } from './OracleSearchModal';
import { ScrollText, Volume2, VolumeX, RotateCcw, Crown, CircleDollarSign, BookOpen, Swords, Zap, Shield, Sparkles, ChevronRight, RotateCw, Search } from 'lucide-react';
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

  // Interaction Handlers
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
        {/* CENTER/LEFT BATTLEFIELD (3 COLUMNS - CLEAN SYMMETRICAL PLAYMAT STAGE)     */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-2 h-full min-h-0 overflow-hidden bg-fulcrum-panel/50 border-2 border-fulcrum-gold rounded-3xl p-3 shadow-[0_0_60px_rgba(243,198,105,0.3)] relative order-1">
          
          {/* Decorative Gold Filigree Accents */}
          <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-fulcrum-gold pointer-events-none" />
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-fulcrum-gold pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-fulcrum-gold pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-fulcrum-gold pointer-events-none" />

          {/* ----------------------------------------------------------------------- */}
          {/* ROW 1: OPPONENT TERRITORY & 50% TOP-CENTER SYMMETRICAL COMMAND PEDESTAL   */}
          {/* ----------------------------------------------------------------------- */}
          <div className="flex items-center justify-between gap-3 h-[25%] bg-black/40 border border-white/10 rounded-2xl px-4 py-2 relative overflow-hidden">
            {/* Top Left: Opponent Discard Pile */}
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

            {/* 50% TOP-CENTER: OPPONENT SYMMETRICAL PRIMAL COMMAND PEDESTAL */}
            <div
              onMouseEnter={() => setHoveredCard(state.opponent.primalAvatar)}
              onClick={handleOpponentNexusClick}
              className={`flex items-center gap-3 cursor-pointer transition transform hover:scale-105 relative px-5 py-2 rounded-2xl border-2 shadow-2xl ${
                isAttackerSelected || isSpellSelected
                  ? 'border-red-500 bg-red-950/60 shadow-[0_0_25px_rgba(239,68,68,0.6)] animate-pulse'
                  : 'border-fulcrum-gold bg-black/70'
              }`}
            >
              <CardView card={state.opponent.primalAvatar} size="sm" disableClickFlip={true} disableHoverPreview={true} />
              
              <div className="space-y-1 text-left font-mono min-w-[150px]">
                <div className="font-serif font-black text-xs text-gold-gradient uppercase flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-fulcrum-gold" />
                  <span>{state.opponent.primalAvatar.name}</span>
                </div>
                <div className="text-xs font-bold text-red-400">
                  {state.opponent.lifeTotal} / {state.opponent.startingLife} HP
                </div>
                <div className="text-[10px] font-bold text-amber-300">
                  Primal Dmg: <span className="text-red-400">{oppPrimalDmg}</span> / 5
                </div>
                <div className="text-[10px] text-cyan-300 font-bold">Core Pool: {state.opponent.corePool}</div>
              </div>
            </div>

            {/* Top Right: Opponent FULCRUM Card Back Deck Stack */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-14 h-20 rounded-xl border border-fulcrum-gold/80 bg-[#0a0814] overflow-hidden relative shadow-lg">
                <img src="/assets/card-back.jpg" alt="Opponent Deck" className="w-full h-full object-cover" />
                <span className="absolute inset-0 bg-black/40 flex items-center justify-center font-mono font-bold text-xs text-amber-300">
                  {state.opponent.deck.length}
                </span>
              </div>
              <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Opp Deck</span>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* ROW 2 & 3: TACTICAL FIELD SLOTS (UN-CLUTTERED CENTER BATTLEFIELD)         */}
          {/* ----------------------------------------------------------------------- */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDropOnField}
            className="flex-1 my-1 bg-black/30 border border-white/10 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden"
          >
            {/* Opponent Tactical Field Slots */}
            <div className="flex items-center justify-center gap-3 overflow-x-auto min-h-[100px]">
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

            {/* Subtle Battlefield Divider Line */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-fulcrum-gold/40 to-transparent my-1" />

            {/* Player Tactical Field Slots */}
            <div className="flex items-center justify-center gap-3 overflow-x-auto min-h-[100px]">
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
          {/* ROW 4: PLAYER TERRITORY & 50% BOTTOM-CENTER SYMMETRICAL COMMAND PEDESTAL */}
          {/* ----------------------------------------------------------------------- */}
          <div className="flex flex-col justify-between bg-black/40 border border-white/10 rounded-2xl p-3 relative">
            
            {/* Top Sub-Bar: Symmetrical Player Avatar + Deck & Discard Piles */}
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
              {/* Bottom Left: Player Discard Pile */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-14 h-20 rounded-xl border border-slate-700 bg-slate-950 flex items-center justify-center relative shadow-lg">
                  {state.player.graveyard.length > 0 ? (
                    <CardView card={state.player.graveyard[state.player.graveyard.length - 1]} size="sm" disableClickFlip={true} disableHoverPreview={true} />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-600">Discard</span>
                  )}
                  <span className="absolute inset-0 bg-black/50 flex items-center justify-center font-mono font-bold text-xs text-slate-200">
                    {state.player.graveyard.length}
                  </span>
                </div>
                <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Your Discard</span>
              </div>

              {/* 50% BOTTOM-CENTER: PLAYER SYMMETRICAL PRIMAL COMMAND PEDESTAL (EXACT MATCH TO OPPONENT) */}
              <div
                onMouseEnter={() => setHoveredCard(state.player.primalAvatar)}
                className="flex items-center gap-3 bg-black/70 border-2 border-fulcrum-gold rounded-2xl px-5 py-2 shadow-2xl"
              >
                <CardView card={state.player.primalAvatar} size="sm" disableClickFlip={true} disableHoverPreview={true} />
                
                <div className="space-y-1 text-left font-mono min-w-[150px]">
                  <div className="font-serif font-black text-xs text-gold-gradient uppercase flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-fulcrum-gold" />
                    <span>{state.player.primalAvatar.name}</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-400">
                    {state.player.lifeTotal} / {state.player.startingLife} HP
                  </div>
                  <div className="text-[10px] font-bold text-amber-300">
                    Primal Dmg: <span className="text-red-400">{playerPrimalDmg}</span> / 5
                  </div>
                  <div className="text-[10px] text-cyan-300 font-bold">Core Pool: {state.player.corePool}</div>
                </div>
              </div>

              {/* Bottom Right: Player FULCRUM Card Back Deck Stack */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-14 h-20 rounded-xl border border-fulcrum-gold/80 bg-[#0a0814] overflow-hidden relative shadow-lg">
                  <img src="/assets/card-back.jpg" alt="Your Deck" className="w-full h-full object-cover" />
                  <span className="absolute inset-0 bg-black/40 flex items-center justify-center font-mono font-bold text-xs text-amber-300">
                    {state.player.deck.length}
                  </span>
                </div>
                <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Your Deck</span>
              </div>
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
              onClick={toggleSound}
              className="py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-fulcrum-gold text-slate-300 font-serif font-bold text-[10px] flex items-center justify-center gap-1 transition"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-fulcrum-gold" />}
              <span>{isMuted ? 'Muted' : 'Audio'}</span>
            </button>
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
