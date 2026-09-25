import { GameState, PlayerState, Card, HandCard, BoardPermanent, GameLogEntry, GamePhase, GameFormat, GameFormatConfig } from '../types/game';
import { STARTER_DECK_A, STARTER_DECK_B, getPreconDeckForAvatar, GLUTTRIX_COREFEASTER, VORRATH_IRONBOUND, NYSSARA_VOIDHALLOWER, GROTHMAW_CHARMBRANDED, KAZRITH_RUNESCALE, KHARV_ROTWATCH, PRIMAL_AVATARS_LIST } from '../data/cards';
import { soundFx } from '../utils/soundFx';

export const GAME_FORMATS: Record<GameFormat, GameFormatConfig> = {
  // Symmetric Formats
  '1v1': { format: '1v1', label: '1v1 Duel (2 Players)', category: 'Symmetric', totalPlayers: 2, startingLife: 20, primalThreshold: 10 },
  '2v2': { format: '2v2', label: '2v2 Team (4 Players)', category: 'Symmetric', totalPlayers: 4, startingLife: 40, teamLifePool: 40, primalThreshold: 20 },
  '3v3': { format: '3v3', label: '3v3 Team (6 Players)', category: 'Symmetric', totalPlayers: 6, startingLife: 60, teamLifePool: 60, primalThreshold: 30 },
  '4v4': { format: '4v4', label: '4v4 Team (8 Players)', category: 'Symmetric', totalPlayers: 8, startingLife: 80, teamLifePool: 80, primalThreshold: 40 },

  // Asymmetric / Outnumbered Formats
  '1v2': { format: '1v2', label: '1v2 Outnumbered (Solo vs 2 Teammates)', category: 'Asymmetric', totalPlayers: 3, startingLife: 60, teamLifePool: 30, primalThreshold: 30 },
  '1v3': { format: '1v3', label: '1v3 Outnumbered (Solo vs 3 Teammates)', category: 'Asymmetric', totalPlayers: 4, startingLife: 80, teamLifePool: 40, primalThreshold: 40 },

  // Free-For-All Formats
  '1v1v1': { format: '1v1v1', label: '3-Player Free-For-All (1v1v1)', category: 'Free-For-All', totalPlayers: 3, startingLife: 30, primalThreshold: 15 },
  '1v1v1v1': { format: '1v1v1v1', label: '4-Player Free-For-All (1v1v1v1)', category: 'Free-For-All', totalPlayers: 4, startingLife: 40, primalThreshold: 20 },
};

function shuffleDeck(deck: Card[]): Card[] {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}

export function createInitialGameState(
  customPlayerDeck?: Card[],
  customOpponentDeck?: Card[],
  playerAvatar?: Card,
  opponentAvatar?: Card,
  startingLife: number = 20
): GameState {
  const pAvatar = playerAvatar || PRIMAL_AVATARS_LIST[0];
  const oAvatar = opponentAvatar || PRIMAL_AVATARS_LIST[1] || PRIMAL_AVATARS_LIST[0];

  const defaultPDeck = getPreconDeckForAvatar(pAvatar);
  const defaultODeck = getPreconDeckForAvatar(oAvatar);

  const pDeck = shuffleDeck(customPlayerDeck && customPlayerDeck.length >= 10 ? customPlayerDeck : defaultPDeck);
  const oDeck = shuffleDeck(customOpponentDeck && customOpponentDeck.length >= 10 ? customOpponentDeck : defaultODeck);
  const oRawHand = oDeck.splice(0, 4);

  const pRawHand = pDeck.splice(0, 4);

  const pHand: HandCard[] = pRawHand.map((card) => ({ card, drawnThisTurn: true }));
  const oHand: HandCard[] = oRawHand.map((card) => ({ card, drawnThisTurn: true }));

  const pCoreSeed = pRawHand.reduce((acc, c) => acc + (c.coreValue || 0), 0);
  const oCoreSeed = oRawHand.reduce((acc, c) => acc + (c.coreValue || 0), 0);

  const player: PlayerState = {
    id: 'player',
    name: 'Player 1',
    isAi: false,
    lifeTotal: startingLife,
    startingLife: startingLife,
    primalDamageTaken: {},
    corePool: pCoreSeed,
    hand: pHand,
    deck: pDeck,
    graveyard: [],
    primalAvatar: pAvatar,
    field: [],
  };

  const opponent: PlayerState = {
    id: 'opponent',
    name: 'Opponent (AI)',
    isAi: true,
    lifeTotal: startingLife,
    startingLife: startingLife,
    primalDamageTaken: {},
    corePool: oCoreSeed,
    hand: oHand,
    deck: oDeck,
    graveyard: [],
    primalAvatar: oAvatar,
    field: [],
  };

  const primalThreshold = startingLife / 2;

  const initialLogs: GameLogEntry[] = [
    {
      id: Math.random().toString(),
      text: `Official FULCRUM Match Started! (${startingLife} HP • Primal Elimination Threshold: ${primalThreshold}). ${pAvatar.name} deployed in 61st Slot.`,
      type: 'info',
      timestamp: new Date().toLocaleTimeString(),
    },
  ];

  return {
    player,
    opponent,
    turnOwner: 'player',
    turnNumber: 1,
    phase: 'conversion',
    winner: null,
    logs: initialLogs,
    selectedHandCardId: null,
    selectedBoardInstanceId: null,
    bankCoreAmount: 0,
    isTargeting: false,
    validTargetType: null,
  };
}

export function drawCard(playerState: PlayerState, logs: GameLogEntry[]): PlayerState {
  const p = { ...playerState };
  if (p.deck.length === 0) {
    logs.unshift({
      id: Math.random().toString(),
      text: `${p.name}'s deck is empty.`,
      type: 'info',
      timestamp: new Date().toLocaleTimeString(),
    });
    return p;
  }

  const [topCard, ...remainingDeck] = p.deck;
  p.deck = remainingDeck;
  p.hand = [...p.hand, { card: topCard, drawnThisTurn: true }];

  logs.unshift({
    id: Math.random().toString(),
    text: `${p.name} drew ${topCard.name}.`,
    type: 'info',
    timestamp: new Date().toLocaleTimeString(),
  });

  return p;
}

export function convertHandCardToCore(state: GameState, cardId: string): GameState {
  const isPlayer = state.turnOwner === 'player';
  const playerKey = isPlayer ? 'player' : 'opponent';
  const p = { ...state[playerKey] };
  const logs = [...state.logs];

  const cardIndex = p.hand.findIndex((hc) => hc.card.id === cardId);
  if (cardIndex === -1) return state;

  const handCard = p.hand[cardIndex];

  if (!handCard.drawnThisTurn && p.primalAvatar.id !== KHARV_ROTWATCH.id) {
    logs.unshift({
      id: Math.random().toString(),
      text: `Cannot convert ${handCard.card.name}! Core conversion is only legal the turn it is drawn (unless controlling Kharv, Rotwatch).`,
      type: 'info',
      timestamp: new Date().toLocaleTimeString(),
    });
    return { ...state, logs };
  }

  const opponentKey = isPlayer ? 'opponent' : 'player';
  const opp = { ...state[opponentKey] };

  const card = handCard.card;
  const coreGain = card.coreValue || 0;
  p.hand.splice(cardIndex, 1);
  p.graveyard.push(card);
  p.corePool += coreGain;

  logs.unshift({
    id: Math.random().toString(),
    text: `${p.name} converted ${card.name} into +${coreGain} Core! (Total Core Pool: ${p.corePool})`,
    type: 'conversion',
    timestamp: new Date().toLocaleTimeString(),
  });

  // Grothmaw Ability 1: Whenever you convert a Charm for Core, you may cast that Charm from graveyard that turn
  if (p.primalAvatar.id === GROTHMAW_CHARMBRANDED.id && card.type === 'charm') {
    card.castableFromGraveyardThisTurn = true;
    logs.unshift({
      id: Math.random().toString(),
      text: `Grothmaw Ability 1: ${card.name} is now castable from Graveyard this turn!`,
      type: 'primal',
      timestamp: new Date().toLocaleTimeString(),
    });
  }

  // Nyssara Ability 1: Whenever an opponent converts a card for core, siphon 2 core from that player.
  if (opp.primalAvatar.id === NYSSARA_VOIDHALLOWER.id) {
    const siphoned = Math.min(2, p.corePool);
    p.corePool -= siphoned;
    opp.corePool += siphoned;
    logs.unshift({
      id: Math.random().toString(),
      text: `Nyssara Ability 1 Triggered! ${opp.name} siphoned ${siphoned} Core from ${p.name}!`,
      type: 'primal',
      timestamp: new Date().toLocaleTimeString(),
    });
  }

  soundFx.playCardSummonSound();

  return {
    ...state,
    [playerKey]: p,
    [opponentKey]: opp,
    logs,
  };
}

export function advancePhase(state: GameState): GameState {
  if (state.winner) return state;

  const phaseOrder: GamePhase[] = ['draw', 'conversion', 'main1', 'combat', 'main2', 'end'];
  const currentIndex = phaseOrder.indexOf(state.phase);

  if (currentIndex === -1 || currentIndex === phaseOrder.length - 1) {
    return endTurn(state);
  }

  const nextPhase = phaseOrder[currentIndex + 1];
  const logs = [...state.logs];

  logs.unshift({
    id: Math.random().toString(),
    text: `Phase Advanced: ${nextPhase.toUpperCase()}`,
    type: 'info',
    timestamp: new Date().toLocaleTimeString(),
  });

  return {
    ...state,
    phase: nextPhase,
    logs,
  };
}

export function startTurn(state: GameState): GameState {
  const isPlayerTurn = state.turnOwner === 'player';
  const activeKey = isPlayerTurn ? 'player' : 'opponent';

  let activePlayer = { ...state[activeKey] };
  const logs = [...state.logs];

  activePlayer.hand = activePlayer.hand.map((hc) => ({ ...hc, drawnThisTurn: false }));
  activePlayer.grothmawDealtDamageThisTurn = false;
  activePlayer.graveyard = activePlayer.graveyard.map((card) => ({
    ...card,
    castableFromGraveyardThisTurn: false,
  }));

  activePlayer.field = activePlayer.field.map((perm) => ({
    ...perm,
    state: 'alert',
    currentGrit: perm.maxGrit,
    ability2UsedThisTurn: false,
  }));

  // Gluttrix Ability 1: Each player draws an additional card at turn start!
  activePlayer = drawCard(activePlayer, logs);
  if (activePlayer.primalAvatar.id === GLUTTRIX_COREFEASTER.id) {
    activePlayer = drawCard(activePlayer, logs);
    logs.unshift({
      id: Math.random().toString(),
      text: `Gluttrix Ability 1: Drew +1 additional card at start of turn!`,
      type: 'info',
      timestamp: new Date().toLocaleTimeString(),
    });
  }

  activePlayer.field.forEach((perm) => {
    if (perm.card.type === 'rune' && perm.card.ability?.produceCore) {
      const extraCore = perm.card.ability.produceCore;
      activePlayer.corePool += extraCore;
      logs.unshift({
        id: Math.random().toString(),
        text: `${perm.card.name} generated +${extraCore} Core!`,
        type: 'conversion',
        timestamp: new Date().toLocaleTimeString(),
      });

      // Kazrith Ability 2: Whenever a Rune is exhausted for Core, Beings get +1 Edge & +1 Grit until end of turn
      if (activePlayer.primalAvatar.id === KAZRITH_RUNESCALE.id) {
        activePlayer.field.forEach((b) => {
          if (b.card.type === 'being') {
            b.currentEdge += 1;
            b.currentGrit += 1;
            b.maxGrit += 1;
          }
        });
        logs.unshift({
          id: Math.random().toString(),
          text: `Kazrith Ability 2 Triggered! All your Beings gained +1 Edge & +1 Grit until end of turn!`,
          type: 'primal',
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    }
  });

  logs.unshift({
    id: Math.random().toString(),
    text: `--- Turn ${state.turnNumber}: ${activePlayer.name}'s Turn ---`,
    type: 'turn',
    timestamp: new Date().toLocaleTimeString(),
  });

  if (isPlayerTurn) soundFx.playTurnStartSound();

  return {
    ...state,
    [activeKey]: activePlayer,
    phase: 'conversion',
    logs,
  };
}

export function playHandCard(
  state: GameState,
  cardId: string,
  targetInstanceId?: string | 'nexus'
): GameState {
  const isPlayer = state.turnOwner === 'player';
  const playerKey = isPlayer ? 'player' : 'opponent';
  const opponentKey = isPlayer ? 'opponent' : 'player';

  let player = { ...state[playerKey] };
  let opponent = { ...state[opponentKey] };
  const logs = [...state.logs];

  const cardIndex = player.hand.findIndex((hc) => hc.card.id === cardId);
  if (cardIndex === -1) return state;

  const card = player.hand[cardIndex].card;

  const isExpediteRequired = state.turnNumber < card.pace;
  let requiredLoadCost = card.load;

  if (isExpediteRequired) {
    if (!card.expediteLoad) {
      logs.unshift({
        id: Math.random().toString(),
        text: `Cannot play ${card.name}! Requires Pace ${card.pace} and has no Expedite option.`,
        type: 'info',
        timestamp: new Date().toLocaleTimeString(),
      });
      return { ...state, logs };
    }
    requiredLoadCost = card.expediteLoad;
  }

  if (player.corePool < requiredLoadCost) {
    logs.unshift({
      id: Math.random().toString(),
      text: `Not enough Core pool to cast ${card.name}! Cost: ${requiredLoadCost}, Core: ${player.corePool}.`,
      type: 'info',
      timestamp: new Date().toLocaleTimeString(),
    });
    return { ...state, logs };
  }

  player.corePool -= requiredLoadCost;
  player.hand.splice(cardIndex, 1);

  if (card.type === 'being') {
    const isKazrithAlert = player.primalAvatar.id === KAZRITH_RUNESCALE.id;
    const initialState = isExpediteRequired || isKazrithAlert ? 'alert' : 'dormant';

    const newBeing: BoardPermanent = {
      instanceId: Math.random().toString(),
      card,
      currentEdge: card.edge || 1,
      currentGrit: card.grit || 1,
      maxGrit: card.grit || 1,
      state: initialState,
      bankedCore: 0,
      attachments: [],
      isGuard: card.isGuard || false,
    };

    player.field.push(newBeing);
    logs.unshift({
      id: Math.random().toString(),
      text: `${player.name} ${isExpediteRequired ? 'EXPEDITED' : 'cast'} Being: ${card.name} (Load: ${requiredLoadCost}) - Enters ${newBeing.state.toUpperCase()}${isKazrithAlert && !isExpediteRequired ? ' (Kazrith Ability 1)' : ''}.`,
      type: 'summon',
      timestamp: new Date().toLocaleTimeString(),
    });

    soundFx.playCardSummonSound();
  } else if (card.type === 'charm') {
    player.graveyard.push(card);
    soundFx.playSpellCastSound();

    const isCopied = !!player.grothmawDealtDamageThisTurn;
    const iterations = isCopied ? 2 : 1;

    if (isCopied) {
      logs.unshift({
        id: Math.random().toString(),
        text: `Grothmaw Ability 2 Triggered: COPYING ${card.name}!`,
        type: 'primal',
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    for (let it = 0; it < iterations; it++) {
      if (card.ability) {
        if (card.ability.damage) {
          const dmg = card.ability.damage;
          if (targetInstanceId === 'nexus') {
            opponent.lifeTotal = Math.max(0, opponent.lifeTotal - dmg);
          } else if (targetInstanceId) {
            const target = opponent.field.find((p) => p.instanceId === targetInstanceId);
            if (target) {
              target.currentGrit -= dmg;
              opponent.field = opponent.field.filter((p) => p.currentGrit > 0);
            }
          }
        }
        if (card.ability.drawCards) {
          for (let i = 0; i < card.ability.drawCards; i++) {
            player = drawCard(player, logs);
          }
        }
        if (card.ability.produceCore) {
          player.corePool += card.ability.produceCore;
        }
      }
    }

    logs.unshift({
      id: Math.random().toString(),
      text: `${player.name} ${isExpediteRequired ? 'EXPEDITED' : 'cast'} Charm: ${card.name}.`,
      type: 'charm',
      timestamp: new Date().toLocaleTimeString(),
    });
  } else if (card.type === 'attachment') {
    const targetBeing = (targetInstanceId && targetInstanceId !== 'nexus')
      ? player.field.find((p) => p.instanceId === targetInstanceId)
      : player.field.find((p) => p.card.type === 'being');

    if (targetBeing) {
      targetBeing.attachments.push(card);
      if (card.ability?.buffEdge) {
        targetBeing.currentEdge += card.ability.buffEdge;
      }
      if (card.ability?.buffGrit) {
        targetBeing.currentGrit += card.ability.buffGrit;
        targetBeing.maxGrit += card.ability.buffGrit;
      }
      logs.unshift({
        id: Math.random().toString(),
        text: `${player.name} attached ${card.name} to ${targetBeing.card.name}.`,
        type: 'summon',
        timestamp: new Date().toLocaleTimeString(),
      });
      soundFx.playSpellCastSound();
    } else {
      const perm: BoardPermanent = {
        instanceId: Math.random().toString(),
        card,
        currentEdge: card.edge || 0,
        currentGrit: card.grit || 1,
        maxGrit: card.grit || 1,
        state: 'alert',
        bankedCore: 0,
        attachments: [],
        isGuard: false,
      };
      player.field.push(perm);
      soundFx.playSpellCastSound();
    }
  } else {
    const perm: BoardPermanent = {
      instanceId: Math.random().toString(),
      card,
      currentEdge: card.edge || 0,
      currentGrit: card.grit || 1,
      maxGrit: card.grit || 1,
      state: 'alert',
      bankedCore: 0,
      attachments: [],
      isGuard: card.isGuard || false,
    };
    player.field.push(perm);
    soundFx.playSpellCastSound();
  }

  let winner: 'player' | 'opponent' | null = null;
  if (opponent.lifeTotal <= 0) winner = isPlayer ? 'player' : 'opponent';
  if (player.lifeTotal <= 0) winner = isPlayer ? 'opponent' : 'player';

  return {
    ...state,
    [playerKey]: player,
    [opponentKey]: opponent,
    winner,
    logs,
    selectedHandCardId: null,
    isTargeting: false,
  };
}

export function executeCombat(
  state: GameState,
  attackerInstanceId: string,
  targetId: string | 'nexus',
  bankedCoreInput: number = 0
): GameState {
  const isPlayer = state.turnOwner === 'player';
  const playerKey = isPlayer ? 'player' : 'opponent';
  const opponentKey = isPlayer ? 'opponent' : 'player';

  const player = { ...state[playerKey] };
  const opponent = { ...state[opponentKey] };
  const logs = [...state.logs];

  const attacker = player.field.find((p) => p.instanceId === attackerInstanceId);
  if (!attacker || attacker.state !== 'alert') return state;

  const perAttackCost = attacker.card.attackCoreCost || 1;
  const totalCoreCost = perAttackCost + bankedCoreInput;

  if (player.corePool < totalCoreCost) {
    logs.unshift({
      id: Math.random().toString(),
      text: `Attacking requires ${totalCoreCost} Core (${perAttackCost} Attack Cost + ${bankedCoreInput} Banked)! Core pool: ${player.corePool}.`,
      type: 'info',
      timestamp: new Date().toLocaleTimeString(),
    });
    return { ...state, logs };
  }

  player.corePool -= totalCoreCost;
  attacker.state = 'dormant';
  attacker.bankedCore += bankedCoreInput;

  const ratio = attacker.card.coreAttackRatio || 1.0;
  const bonusDamage = Math.floor(attacker.bankedCore * ratio);
  const totalDamage = attacker.currentEdge + bonusDamage;

  if (targetId === 'nexus') {
    if (attacker.card.isPrimal) {
      const sourceId = attacker.card.id;
      const currentPrimalDmg = (opponent.primalDamageTaken[sourceId] || 0) + totalDamage;
      opponent.primalDamageTaken[sourceId] = currentPrimalDmg;

      const threshold = opponent.startingLife / 2;
      logs.unshift({
        id: Math.random().toString(),
        text: `PRIMAL DAMAGE! ${attacker.card.name} dealt ${totalDamage} Primal Damage to ${opponent.name} (Total: ${currentPrimalDmg}/${threshold}).`,
        type: 'primal',
        timestamp: new Date().toLocaleTimeString(),
      });

      if (attacker.card.id === GROTHMAW_CHARMBRANDED.id && totalDamage > 0) {
        player.grothmawDealtDamageThisTurn = true;
        logs.unshift({
          id: Math.random().toString(),
          text: `Grothmaw Ability 2: Grothmaw dealt combat damage! Charms cast this turn will be copied!`,
          type: 'primal',
          timestamp: new Date().toLocaleTimeString(),
        });
      }

      if (currentPrimalDmg >= threshold) {
        opponent.lifeTotal = 0;
        logs.unshift({
          id: Math.random().toString(),
          text: `HEAD-REMOVAL ELIMINATION! Cumulative Primal Damage reached half starting life (${currentPrimalDmg}/${threshold})!`,
          type: 'primal',
          timestamp: new Date().toLocaleTimeString(),
        });
      } else {
        opponent.lifeTotal = Math.max(0, opponent.lifeTotal - totalDamage);
      }
    } else {
      opponent.lifeTotal = Math.max(0, opponent.lifeTotal - totalDamage);
      logs.unshift({
        id: Math.random().toString(),
        text: `${attacker.card.name} attacked ${opponent.name} Life pool for ${totalDamage} damage (Edge ${attacker.currentEdge} + Banked ${bonusDamage})!`,
        type: 'combat',
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    soundFx.playNexusDamageSound();
  } else {
    const defender = opponent.field.find((p) => p.instanceId === targetId);
    if (!defender) return state;

    soundFx.playCombatAttackSound();

    defender.currentGrit -= totalDamage;
    attacker.currentGrit -= defender.currentEdge;

    logs.unshift({
      id: Math.random().toString(),
      text: `${attacker.card.name} (Damage ${totalDamage}) engaged ${defender.card.name} (Grit ${defender.currentGrit}).`,
      type: 'combat',
      timestamp: new Date().toLocaleTimeString(),
    });

    if (defender.currentGrit <= 0) {
      opponent.graveyard.push(defender.card);
      opponent.field = opponent.field.filter((p) => p.instanceId !== targetId);
    }
    if (attacker.currentGrit <= 0) {
      player.graveyard.push(attacker.card);
      player.field = player.field.filter((p) => p.instanceId !== attackerInstanceId);
    }
  }

  let winner: 'player' | 'opponent' | null = null;
  if (opponent.lifeTotal <= 0) winner = isPlayer ? 'player' : 'opponent';
  if (player.lifeTotal <= 0) winner = isPlayer ? 'opponent' : 'player';

  return {
    ...state,
    [playerKey]: player,
    [opponentKey]: opponent,
    winner,
    logs,
    selectedBoardInstanceId: null,
    bankCoreAmount: 0,
    isTargeting: false,
  };
}

export function endTurn(state: GameState): GameState {
  if (state.winner) return state;

  const nextOwner = state.turnOwner === 'player' ? 'opponent' : 'player';
  // Orbit Rule: An Orbit completes ONLY after each player takes 1 turn.
  // In 1v1, Orbit increments when passing back from opponent to player.
  const isOrbitCompleting = state.turnOwner === 'opponent';
  const nextTurnNumber = isOrbitCompleting ? state.turnNumber + 1 : state.turnNumber;
  const logs = [...state.logs];

  const player = { ...state.player };
  const opponent = { ...state.opponent };

  player.field = player.field.map((perm) => ({
    ...perm,
    state: 'alert',
    currentGrit: perm.maxGrit,
    ability2UsedThisTurn: false,
  }));
  opponent.field = opponent.field.map((perm) => ({
    ...perm,
    state: 'alert',
    currentGrit: perm.maxGrit,
    ability2UsedThisTurn: false,
  }));

  logs.unshift({
    id: Math.random().toString(),
    text: isOrbitCompleting
      ? `--- Orbit ${nextTurnNumber} Begins! (${nextOwner === 'player' ? player.name : opponent.name}'s Turn) ---`
      : `--- Orbit ${state.turnNumber}: Passed to ${nextOwner === 'player' ? player.name : opponent.name}'s Turn ---`,
    type: 'turn',
    timestamp: new Date().toLocaleTimeString(),
  });

  const newState: GameState = {
    ...state,
    player,
    opponent,
    turnOwner: nextOwner,
    turnNumber: nextTurnNumber,
    selectedHandCardId: null,
    selectedBoardInstanceId: null,
    bankCoreAmount: 0,
    isTargeting: false,
  };

  return startTurn(newState);
}

export function activatePrimalAvatarAbility2(state: GameState): GameState {
  const isPlayer = state.turnOwner === 'player';
  const playerKey = isPlayer ? 'player' : 'opponent';
  const p = { ...state[playerKey] };
  const logs = [...state.logs];

  if (p.primalAvatar.id === GLUTTRIX_COREFEASTER.id) {
    if (p.corePool < 3) {
      logs.unshift({
        id: Math.random().toString(),
        text: `Gluttrix Ability 2 requires 3 Core! Current pool: ${p.corePool}.`,
        type: 'info',
        timestamp: new Date().toLocaleTimeString(),
      });
      return { ...state, logs };
    }
    p.corePool -= 3;
    const targetIdx = p.deck.findIndex((c) => c.type === 'relic' || c.type === 'rune');
    if (targetIdx !== -1) {
      const [tutored] = p.deck.splice(targetIdx, 1);
      p.hand.push({ card: tutored, drawnThisTurn: false });
      logs.unshift({
        id: Math.random().toString(),
        text: `${p.name} activated Gluttrix Ability 2 (Paid 3 Core): Tutored ${tutored.name} into hand!`,
        type: 'primal',
        timestamp: new Date().toLocaleTimeString(),
      });
    } else {
      logs.unshift({
        id: Math.random().toString(),
        text: `${p.name} activated Gluttrix Ability 2 (Paid 3 Core), but no Relic or Rune was found in deck!`,
        type: 'primal',
        timestamp: new Date().toLocaleTimeString(),
      });
    }
    soundFx.playSpellCastSound();
    return { ...state, [playerKey]: p, logs };
  } else if (p.primalAvatar.id === VORRATH_IRONBOUND.id) {
    let sacrificedAttachment: Card | null = null;
    for (const perm of p.field) {
      if (perm.attachments.length > 0) {
        sacrificedAttachment = perm.attachments.pop() || null;
        if (sacrificedAttachment) {
          if (sacrificedAttachment.attachmentType === 'weapon' && sacrificedAttachment.ability?.buffEdge) {
            perm.currentEdge -= sacrificedAttachment.ability.buffEdge;
          }
          if (sacrificedAttachment.attachmentType === 'armor' && sacrificedAttachment.ability?.buffGrit) {
            perm.currentGrit -= sacrificedAttachment.ability.buffGrit;
            perm.maxGrit -= sacrificedAttachment.ability.buffGrit;
          }
          p.graveyard.push(sacrificedAttachment);
          break;
        }
      }
    }

    const sacCoreVal = sacrificedAttachment?.coreValue || 2;
    const tutorIdx = p.deck.findIndex((c) => c.type === 'attachment' && c.load <= sacCoreVal);

    if (tutorIdx !== -1) {
      const [tutored] = p.deck.splice(tutorIdx, 1);
      logs.unshift({
        id: Math.random().toString(),
        text: `${p.name} activated Vorrath Ability 2: Sacrificed ${
          sacrificedAttachment ? sacrificedAttachment.name : 'Attachment'
        } to tutor & attach ${tutored.name} (Load ${tutored.load} <= ${sacCoreVal}) to Vorrath!`,
        type: 'primal',
        timestamp: new Date().toLocaleTimeString(),
      });
    } else {
      logs.unshift({
        id: Math.random().toString(),
        text: `${p.name} activated Vorrath Ability 2: Sacrificed ${
          sacrificedAttachment ? sacrificedAttachment.name : 'Attachment'
        }, but no Attachment (Load <= ${sacCoreVal}) was found in deck.`,
        type: 'primal',
        timestamp: new Date().toLocaleTimeString(),
      });
    }
    soundFx.playSpellCastSound();
    return { ...state, [playerKey]: p, logs };
  } else if (p.primalAvatar.id === NYSSARA_VOIDHALLOWER.id) {
    if (p.corePool < 3) {
      logs.unshift({
        id: Math.random().toString(),
        text: `Nyssara Ability 2 requires 3 Core! Current pool: ${p.corePool}.`,
        type: 'info',
        timestamp: new Date().toLocaleTimeString(),
      });
      return { ...state, logs };
    }
    p.corePool -= 3;
    const opponentKey = isPlayer ? 'opponent' : 'player';
    const opp = { ...state[opponentKey] };

    if (opp.deck.length > 0) {
      const [topCard, ...remainingDeck] = opp.deck;
      opp.deck = remainingDeck;
      opp.graveyard.push(topCard);
      const convertedCore = topCard.coreValue || 0;
      opp.corePool += convertedCore;

      logs.unshift({
        id: Math.random().toString(),
        text: `${p.name} activated Nyssara Ability 2 (Paid 3 Core): Forced ${opp.name} to convert top card ${topCard.name} (+${convertedCore} Core)!`,
        type: 'primal',
        timestamp: new Date().toLocaleTimeString(),
      });

      // Nyssara Ability 1 triggers on opponent conversion!
      const siphoned = Math.min(2, opp.corePool);
      opp.corePool -= siphoned;
      p.corePool += siphoned;

      logs.unshift({
        id: Math.random().toString(),
        text: `Nyssara Ability 1 Siphoned ${siphoned} Core back from ${opp.name}!`,
        type: 'primal',
        timestamp: new Date().toLocaleTimeString(),
      });
    } else {
      logs.unshift({
        id: Math.random().toString(),
        text: `${p.name} activated Nyssara Ability 2, but ${opp.name}'s deck is empty!`,
        type: 'info',
        timestamp: new Date().toLocaleTimeString(),
      });
    }
    soundFx.playSpellCastSound();
    return { ...state, [playerKey]: p, [opponentKey]: opp, logs };
  }

  return state;
}

export function playGraveyardCard(
  state: GameState,
  cardId: string,
  targetInstanceId?: string | 'nexus'
): GameState {
  const isPlayer = state.turnOwner === 'player';
  const playerKey = isPlayer ? 'player' : 'opponent';
  const opponentKey = isPlayer ? 'opponent' : 'player';

  let player = { ...state[playerKey] };
  let opponent = { ...state[opponentKey] };
  const logs = [...state.logs];

  const isKharv = player.primalAvatar.id === KHARV_ROTWATCH.id;
  const cardIndex = player.graveyard.findIndex(
    (c) => c.id === cardId && (c.castableFromGraveyardThisTurn || isKharv)
  );
  if (cardIndex === -1) return state;

  const card = player.graveyard[cardIndex];

  if (player.corePool < card.load) {
    logs.unshift({
      id: Math.random().toString(),
      text: `Not enough Core pool to cast ${card.name} from Graveyard! Cost: ${card.load}, Core: ${player.corePool}.`,
      type: 'info',
      timestamp: new Date().toLocaleTimeString(),
    });
    return { ...state, logs };
  }

  player.corePool -= card.load;
  // Exiled / removed from game on cast!
  player.graveyard.splice(cardIndex, 1);

  if (card.type === 'being') {
    const newBeing: BoardPermanent = {
      instanceId: Math.random().toString(),
      card,
      currentEdge: card.edge || 1,
      currentGrit: card.grit || 1,
      maxGrit: card.grit || 1,
      state: isKharv ? 'alert' : 'dormant',
      bankedCore: 0,
      attachments: [],
      isGuard: card.isGuard || false,
    };
    player.field.push(newBeing);
    logs.unshift({
      id: Math.random().toString(),
      text: `${player.name} cast Being ${card.name} from Graveyard via Kharv Ability 2 (Exiled upon death).`,
      type: 'primal',
      timestamp: new Date().toLocaleTimeString(),
    });
    soundFx.playCardSummonSound();
  } else {
    const isCopied = !!player.grothmawDealtDamageThisTurn;
    const iterations = isCopied ? 2 : 1;

    if (isCopied) {
      logs.unshift({
        id: Math.random().toString(),
        text: `Grothmaw Ability 2 Triggered: COPYING ${card.name} cast from Graveyard!`,
        type: 'primal',
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    for (let it = 0; it < iterations; it++) {
      if (card.ability) {
        if (card.ability.damage) {
          const dmg = card.ability.damage;
          if (targetInstanceId === 'nexus') {
            opponent.lifeTotal = Math.max(0, opponent.lifeTotal - dmg);
          } else if (targetInstanceId) {
            const target = opponent.field.find((p) => p.instanceId === targetInstanceId);
            if (target) {
              target.currentGrit -= dmg;
              opponent.field = opponent.field.filter((p) => p.currentGrit > 0);
            }
          }
        }
        if (card.ability.drawCards) {
          for (let i = 0; i < card.ability.drawCards; i++) {
            player = drawCard(player, logs);
          }
        }
        if (card.ability.produceCore) {
          player.corePool += card.ability.produceCore;
        }
      }
    }

    logs.unshift({
      id: Math.random().toString(),
      text: `${player.name} cast ${card.name} from Graveyard (Exiled from game).`,
      type: 'primal',
      timestamp: new Date().toLocaleTimeString(),
    });
    soundFx.playSpellCastSound();
  }

  let winner: 'player' | 'opponent' | null = null;
  if (opponent.lifeTotal <= 0) winner = isPlayer ? 'player' : 'opponent';
  if (player.lifeTotal <= 0) winner = isPlayer ? 'opponent' : 'player';

  return {
    ...state,
    [playerKey]: player,
    [opponentKey]: opponent,
    winner,
    logs,
  };
}
