import React, { useState, useEffect } from 'react';
import { GameState, Card, BoardPermanent } from '../types/game';
import { playHandCard, executeCombat, convertHandCardToCore, advancePhase, endTurn, activatePrimalAvatarAbility2 } from '../logic/gameEngine';
import { runAiTurnStep } from '../logic/aiBot';
import { CardView, getPactBorderStyle } from './CardView';
import { TurnPhaseBar } from './TurnPhaseBar';
import { OracleSearchModal } from './OracleSearchModal';
import { ScrollText, Volume2, VolumeX, RotateCcw, Crown, CircleDollarSign, BookOpen } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface GameBoardProps {
  initialState: GameState;
  onRestart: () => void;
  onMatchEnd?: (winner: 'player' | 'opponent', logs: any[]) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ initialState, onRestart, onMatchEnd }) => {
  const [state, setState] = useState<GameState>(initialState);
  const [showLogs, setShowLogs] = useState(false);
  const [showOracle, setShowOracle] = useState(false);
  const [isMuted, setIsMuted] = useState(soundFx.isMuted());
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<Card | null>(null);
  const [hasNotifiedEnd, setHasNotifiedEnd] = useState(false);

  useEffect(() => {
    if (state.winner && !hasNotifiedEnd) {
      setHasNotifiedEnd(true);
      if (onMatchEnd) {
        onMatchEnd(state.winner, state.logs);
      }
    }
  }, [state.winner, hasNotifiedEnd, onMatchEnd, state.logs]);

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
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [state]);

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
    <div className="w-full h-screen max-h-screen overflow-hidden p-2 bg-[#080512] text-slate-100 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-4 h-full gap-2 min-h-0 overflow-hidden">
        {/* LEFT PLAYMAT AREA (3 COLUMNS = THE 4 ROWS) */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-1.5 h-full min-h-0 overflow-hidden bg-fulcrum-panel/40 border border-fulcrum-border rounded-2xl p-2 shadow-2xl relative">
          
          {/* ROW 1: OPPONENT HAND ROW */}
          <div className="flex items-center justify-between gap-2 h-[22%] bg-black/40 border border-white/5 rounded-xl px-3 py-1 min-h-0">
            {/* Left: Opponent Avatar Command Slot */}
            <div
              onMouseEnter={() => setHoveredCard(state.opponent.primalAvatar)}
              className="flex flex-col items-center flex-shrink-0 relative group"
            >
              <CardView
                card={state.opponent.primalAvatar}
                size="sm"
                disableClickFlip={true}
                disableHoverPreview={true}
                customEdge={state.opponent.primalAvatar.isDynamicStats ? state.opponent.corePool : (state.opponent.primalAvatar.edge || 5)}
                customGrit={state.opponent.primalAvatar.isDynamicStats ? state.opponent.corePool : (state.opponent.primalAvatar.grit || 6)}
                isTargetable={isAttackerSelected || isSpellSelected}
                onClick={handleOpponentNexusClick}
              />
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-bold text-[8px] px-1.5 rounded-full uppercase flex items-center gap-0.5 z-10 shadow">
                <Crown className="w-2.5 h-2.5" /> Avatar
              </div>
            </div>

            {/* Middle: Opponent Hand Cards */}
            <div className="flex-1 flex items-center justify-center -space-x-8 overflow-x-auto">
              {state.opponent.hand.length === 0 ? (
                <span className="text-[10px] text-slate-600 italic">Opponent Hand Empty</span>
              ) : (
                state.opponent.hand.map((hc, idx) => (
                  <div
                    key={hc.card.id + idx}
                    onMouseEnter={() => setHoveredCard(hc.card)}
                    className="flex-shrink-0"
                  >
                    <CardView card={hc.card} size="sm" disableClickFlip={true} disableHoverPreview={true} className="shadow-lg scale-90" />
                  </div>
                ))
              )}
            </div>

            {/* Right: Opponent Deck Stack */}
            <div className="flex flex-col items-center flex-shrink-0 px-2">
              <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg border border-fulcrum-gold/60 bg-[#0a0814] overflow-hidden relative shadow-lg">
                <img src="/assets/card-back.jpg" alt="Opponent Deck" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center font-bold text-xs text-amber-300">
                  {state.opponent.deck.length}
                </div>
              </div>
              <span className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">Opp Deck</span>
            </div>
          </div>

          {/* ROW 2: OPPONENT FIELD ROW */}
          <div className="flex items-center justify-between gap-2 h-[26%] bg-black/20 border border-white/5 rounded-xl px-3 py-1 min-h-0">
            <div className="w-14 flex-shrink-0 text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden sm:block">
              Opp Field
            </div>

            {/* Middle: Opponent Active Units / Permanents */}
            <div className="flex-1 flex items-center justify-center gap-2 overflow-x-auto">
              {state.opponent.field.length === 0 ? (
                <span className="text-[11px] text-slate-600 italic">Opponent Field Empty</span>
              ) : (
                state.opponent.field.map((perm) => (
                  <div
                    key={perm.instanceId}
                    onMouseEnter={() => setHoveredCard(perm.card)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnTargetUnit(e, perm)}
                    className="flex-shrink-0"
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
                      onClick={() => handleOpponentUnitClick(perm)}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Right: Opponent Discard Pile (Positioned above deck!) */}
            <div className="flex flex-col items-center flex-shrink-0 px-2">
              <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg border border-slate-700 bg-slate-950 flex items-center justify-center relative shadow">
                {state.opponent.graveyard.length > 0 ? (
                  <CardView card={state.opponent.graveyard[state.opponent.graveyard.length - 1]} size="sm" disableClickFlip={true} disableHoverPreview={true} />
                ) : (
                  <span className="text-[10px] font-bold text-slate-600">Empty</span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center font-bold text-xs text-slate-200">
                  {state.opponent.graveyard.length}
                </div>
              </div>
              <span className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">Opp Discard</span>
            </div>
          </div>

          {/* ROW 3: OUR FIELD ROW (Drop Target for playing cards!) */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDropOnField}
            className={`flex items-center justify-between gap-2 h-[26%] border rounded-xl px-3 py-1 min-h-0 transition ${
              draggedCardId
                ? 'bg-amber-950/30 border-amber-400/80 shadow-[0_0_20px_rgba(243,198,105,0.3)]'
                : 'bg-black/20 border-white/5'
            }`}
          >
            <div className="w-14 flex-shrink-0 text-[10px] text-emerald-400 font-bold uppercase tracking-wider hidden sm:block">
              Your Field
            </div>

            {/* Middle: Our Active Units / Permanents */}
            <div className="flex-1 flex items-center justify-center gap-2 overflow-x-auto">
              {state.player.field.length === 0 ? (
                <span className="text-[11px] text-slate-600 italic">Your Field Empty (Drag or click cards from hand to play)</span>
              ) : (
                state.player.field.map((perm) => (
                  <div
                    key={perm.instanceId}
                    onMouseEnter={() => setHoveredCard(perm.card)}
                    className="flex-shrink-0"
                  >
                    <CardView
                      card={perm.card}
                      disableClickFlip={true}
                      disableHoverPreview={true}
                      customEdge={perm.currentEdge}
                      customGrit={perm.currentGrit}
                      isDormant={perm.state === 'dormant'}
                      size="sm"
                      isSelected={state.selectedBoardInstanceId === perm.instanceId}
                      onClick={() => handleFriendlyUnitClick(perm)}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Right: Our Discard Pile (Positioned above deck!) */}
            <div className="flex flex-col items-center flex-shrink-0 px-2">
              <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg border border-slate-700 bg-slate-950 flex items-center justify-center relative shadow">
                {state.player.graveyard.length > 0 ? (
                  <CardView card={state.player.graveyard[state.player.graveyard.length - 1]} size="sm" disableClickFlip={true} disableHoverPreview={true} />
                ) : (
                  <span className="text-[10px] font-bold text-slate-600">Empty</span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center font-bold text-xs text-slate-200">
                  {state.player.graveyard.length}
                </div>
              </div>
              <span className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">Your Discard</span>
            </div>
          </div>

          {/* ROW 4: OUR HAND ROW */}
          <div className="flex items-center justify-between gap-2 h-[22%] bg-black/40 border border-white/5 rounded-xl px-3 py-1 min-h-0">
            {/* Left: Our Avatar Command Slot */}
            <div
              onMouseEnter={() => setHoveredCard(state.player.primalAvatar)}
              className="flex flex-col items-center flex-shrink-0 relative group"
            >
              <CardView
                card={state.player.primalAvatar}
                size="sm"
                disableClickFlip={true}
                disableHoverPreview={true}
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
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-bold text-[8px] px-1.5 rounded-full uppercase flex items-center gap-0.5 z-10 shadow">
                <Crown className="w-2.5 h-2.5" /> Avatar
              </div>

              {state.turnOwner === 'player' && !state.winner && (
                <button
                  onClick={() => setState((prev) => activatePrimalAvatarAbility2(prev))}
                  className="mt-0.5 px-1.5 py-0.5 rounded bg-amber-950/90 hover:bg-amber-900 border border-amber-400 text-[8px] font-bold text-amber-300 shadow transition flex items-center gap-0.5"
                  title="Activate Primal Avatar Ability 2"
                >
                  <span>Ability 2</span>
                </button>
              )}
            </div>

            {/* Middle: Our Hand Cards */}
            <div className="flex-1 flex items-center justify-center -space-x-3 hover:space-x-1 transition-all overflow-x-auto">
              {state.player.hand.length === 0 ? (
                <span className="text-[10px] text-slate-600 italic">Your Hand Empty</span>
              ) : (
                state.player.hand.map((hc) => {
                  const card = hc.card;
                  const isSelected = state.selectedHandCardId === card.id;
                  return (
                    <div
                      key={card.id}
                      onMouseEnter={() => setHoveredCard(card)}
                      className="relative group flex flex-col items-center flex-shrink-0"
                    >
                      <CardView
                        card={card}
                        size="sm"
                        disableClickFlip={true}
                        disableHoverPreview={true}
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
                          className="mt-0.5 transition px-1 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-[8px] font-bold text-emerald-300 flex items-center gap-0.5 shadow"
                          title="Convert card into Core pool"
                        >
                          <CircleDollarSign className="w-2.5 h-2.5 text-emerald-400" />
                          <span>+{card.coreValue}</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Right: Our Deck Stack (Conversion drop target!) */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDropOnConvertZone}
              className={`flex flex-col items-center flex-shrink-0 px-2 rounded-lg p-1 transition ${
                draggedCardId && state.phase === 'conversion'
                  ? 'bg-emerald-950/80 border border-emerald-400 shadow-[0_0_15px_#10b981]'
                  : ''
              }`}
            >
              <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg border border-fulcrum-gold/60 bg-[#0a0814] overflow-hidden relative shadow-lg cursor-pointer">
                <img src="/assets/card-back.jpg" alt="Your Deck" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center font-bold text-xs text-amber-300">
                  {state.player.deck.length}
                </div>
              </div>
              <span className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">Your Deck</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (SIDEBAR: TOP = CARD INSPECTOR PREVIEW; BOTTOM = TRACKERS & STATS) */}
        <div className="lg:col-span-1 flex flex-col justify-between gap-2 h-full min-h-0 overflow-y-auto bg-fulcrum-panel/90 border border-fulcrum-border rounded-2xl p-3 shadow-2xl">
          
          {/* TOP: CARD INSPECTION HOVER PREVIEW */}
          <div className={`rounded-xl p-3 flex flex-col justify-between shadow-inner flex-1 min-h-[260px] overflow-hidden transition-all duration-300 border-2 ${
            hoveredCard ? getPactBorderStyle(hoveredCard) : 'bg-black/60 border-white/10'
          }`}>
            {hoveredCard ? (
              <div className="flex flex-col h-full justify-between animate-in fade-in duration-150 overflow-hidden">
                <div className="text-center font-serif font-bold text-amber-300 text-sm border-b border-white/10 pb-1 truncate">
                  {hoveredCard.name}
                </div>

                <div className="my-1.5 h-32 rounded-lg overflow-hidden border border-white/10 bg-black relative flex-shrink-0">
                  {hoveredCard.imageArtUrl ? (
                    <img
                      src={hoveredCard.imageArtUrl}
                      alt={hoveredCard.name}
                      className={`w-full h-full object-cover ${hoveredCard.imageObjectPosition || 'object-top'}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 font-bold">
                      {hoveredCard.name}
                    </div>
                  )}
                </div>

                <div className="bg-slate-950/80 border border-white/10 rounded-lg p-2 text-[11px] text-slate-200 flex-1 flex flex-col justify-between overflow-y-auto min-h-0">
                  <div className="text-[9.5px] font-bold text-amber-400 uppercase tracking-widest text-center border-b border-white/10 pb-0.5 mb-1 flex-shrink-0">
                    {hoveredCard.isPrimal || hoveredCard.type === 'primal_avatar' ? 'Primal Avatar' : hoveredCard.type.toUpperCase()}
                  </div>
                  <div className="whitespace-pre-line leading-relaxed text-slate-200 text-center font-sans text-[11px] my-auto">
                    {hoveredCard.description}
                  </div>
                  {hoveredCard.flavorText && (
                    <div className="mt-1 pt-1 border-t border-white/10 italic text-[9.5px] text-slate-400 text-center font-serif flex-shrink-0">
                      "{hoveredCard.flavorText}"
                    </div>
                  )}
                </div>

                {/* Bottom Card Stats */}
                <div className="grid grid-cols-5 gap-1 items-center px-1 mt-1.5 text-[10px] font-bold border-t border-white/10 pt-1 w-full text-center">
                  <span className="text-lime-400">P{hoveredCard.pace}</span>
                  <span className="text-pink-400">L{hoveredCard.load}</span>
                  {hoveredCard.coreValue !== undefined && !hoveredCard.isPrimal ? (
                    <span className="text-yellow-400">+{hoveredCard.coreValue}</span>
                  ) : (
                    <span />
                  )}
                  {hoveredCard.edge !== undefined && (hoveredCard.type === 'being' || hoveredCard.type === 'primal_avatar') ? (
                    <span className="text-cyan-400">E{hoveredCard.edge}</span>
                  ) : (
                    <span />
                  )}
                  {hoveredCard.grit !== undefined && (hoveredCard.type === 'being' || hoveredCard.type === 'primal_avatar') ? (
                    <span className="text-blue-400">G{hoveredCard.grit}</span>
                  ) : (
                    <span />
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs p-3">
                <Crown className="w-8 h-8 text-amber-500/40 mb-2 animate-pulse" />
                <p className="font-serif font-bold text-slate-300">CARD INSPECTOR</p>
                <p className="text-[10.5px] text-slate-500 mt-1">Hover over any card in hand or on the field to view details.</p>
              </div>
            )}
          </div>

          {/* BOTTOM: PLAYER & GAME STATS / TRACKERS */}
          <div className="bg-black/50 border border-white/10 rounded-xl p-2.5 flex flex-col gap-2 shadow-inner">
            {/* Opponent Stats Bar */}
            <div className="bg-red-950/40 border border-red-500/40 rounded-lg p-2 flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-serif font-bold text-red-300">{state.opponent.name} (AI)</span>
                <span className="text-[10px] text-amber-300">Primal Dmg: {oppPrimalDmg}/5</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-950 h-3 rounded-full border border-slate-700 overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-300"
                    style={{ width: `${(state.opponent.lifeTotal / state.opponent.startingLife) * 100}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow">
                    {state.opponent.lifeTotal} / {state.opponent.startingLife} HP
                  </span>
                </div>
                <div className="text-[11px] font-bold text-emerald-300 bg-emerald-950 border border-emerald-500/60 px-2 py-0.5 rounded">
                  {state.opponent.corePool} Core
                </div>
              </div>
            </div>

            {/* Player Stats Bar */}
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-lg p-2 flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-serif font-bold text-emerald-300">{state.player.name} (YOU)</span>
                <span className="text-[10px] text-slate-400">Deck: {state.player.deck.length} | Discard: {state.player.graveyard.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-950 h-3 rounded-full border border-slate-700 overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-300"
                    style={{ width: `${(state.player.lifeTotal / state.player.startingLife) * 100}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow">
                    {state.player.lifeTotal} / {state.player.startingLife} HP
                  </span>
                </div>
                <div className="text-[11px] font-bold text-emerald-300 bg-emerald-950 border border-emerald-500/60 px-2 py-0.5 rounded">
                  {state.player.corePool} Core
                </div>
              </div>
            </div>

            {/* Turn & Phase Controls */}
            <div className="bg-slate-900/90 border border-slate-700 rounded-lg p-2 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-amber-300">Turn {state.turnNumber}</span>
                <span className="text-[10px] text-slate-400">{state.turnOwner === 'player' ? 'Your Turn' : 'AI Turn'}</span>
              </div>

              <TurnPhaseBar
                currentPhase={state.phase}
                turnNumber={state.turnNumber}
                corePool={state.player.corePool}
                isPlayerTurn={state.turnOwner === 'player'}
                onAdvancePhase={() => setState((prev) => advancePhase(prev))}
              />

              <button
                onClick={() => setState((prev) => endTurn(prev))}
                disabled={state.turnOwner !== 'player' || !!state.winner}
                className={`w-full py-2 rounded-lg font-serif font-bold text-xs tracking-wider uppercase shadow-lg transition-all ${
                  state.turnOwner === 'player' && !state.winner
                    ? 'bg-gradient-to-r from-fulcrum-gold via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-[0_0_15px_rgba(243,198,105,0.4)] cursor-pointer'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                {state.turnOwner === 'player' ? 'End Turn' : 'AI Turn'}
              </button>
            </div>

            {/* System Toolbar */}
            <div className="flex items-center justify-between gap-1 pt-0.5">
              <button
                onClick={toggleSound}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600"
                title="Toggle Sound"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-fulcrum-gold" />}
              </button>
              <button
                onClick={() => setShowOracle(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-500/60 text-[11px] font-semibold text-purple-200"
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Oracle</span>
              </button>
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 border border-slate-600"
              >
                <ScrollText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Logs</span>
              </button>
              <button
                onClick={onRestart}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-[11px] font-semibold text-amber-200 border border-amber-600"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Restart</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Oracle Rules Search Modal */}
      {showOracle && <OracleSearchModal onClose={() => setShowOracle(false)} />}

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
