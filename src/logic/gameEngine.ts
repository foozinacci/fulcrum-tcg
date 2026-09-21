import { GameState, PlayerState, Card, HandCard, BoardPermanent, GameLogEntry, GamePhase } from '../types/game';
import { STARTER_DECK_A, STARTER_DECK_B, PRIMAL_AVATAR_A, PRIMAL_AVATAR_B } from '../data/cards';
import { soundFx } from '../utils/soundFx';

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
  customOpponentDeck?: Card[]
): GameState {
  const pDeck = shuffleDeck(customPlayerDeck || STARTER_DECK_A);
  const oDeck = shuffleDeck(customOpponentDeck || STARTER_DECK_B);

  const pRawHand = pDeck.splice(0, 4);
  const oRawHand = oDeck.splice(0, 4);

  const pHand: HandCard[] = pRawHand.map((card) => ({ card, drawnThisTurn: true }));
  const oHand: HandCard[] = oRawHand.map((card) => ({ card, drawnThisTurn: true }));

  // Opening hand's total Core value seeds one-time starting Core pool!
  const pCoreSeed = pRawHand.reduce((acc, c) => acc + c.coreValue, 0);
  const oCoreSeed = oRawHand.reduce((acc, c) => acc + c.coreValue, 0);

  const player: PlayerState = {
    id: 'player',
    name: 'Player 1',
    isAi: false,
    lifeTotal: 10,
    startingLife: 10,
    primalDamageTaken: {},
    corePool: pCoreSeed,
    hand: pHand,
    deck: pDeck,
    graveyard: [],
    primalAvatar: PRIMAL_AVATAR_A,
    field: [],
  };

  const opponent: PlayerState = {
    id: 'opponent',
    name: 'Opponent (AI)',
    isAi: true,
    lifeTotal: 10,
    startingLife: 10,
    primalDamageTaken: {},
    corePool: oCoreSeed,
    hand: oHand,
    deck: oDeck,
    graveyard: [],
    primalAvatar: PRIMAL_AVATAR_B,
    field: [],
  };

  const initialLogs: GameLogEntry[] = [
    {
      id: Math.random().toString(),
      text: 'Official FULCRUM Match Initiated! Opening hand total seeded starting Core pools.',
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
    p.lifeTotal = Math.max(0, p.lifeTotal - 1);
    logs.unshift({
      id: Math.random().toString(),
      text: `${p.name} deck empty! Suffered 1 deckout damage.`,
      type: 'combat',
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

  // Rule: Core conversion is legal ONLY for cards drawn this turn during Conversion Phase!
  if (!handCard.drawnThisTurn) {
    logs.unshift({
      id: Math.random().toString(),
      text: `Cannot convert ${handCard.card.name}! Core conversion is only legal the turn it is drawn.`,
      type: 'info',
      timestamp: new Date().toLocaleTimeString(),
    });
    return { ...state, logs };
  }

  const card = handCard.card;
  p.hand.splice(cardIndex, 1);
  p.graveyard.push(card);
  p.corePool += card.coreValue;

  logs.unshift({
    id: Math.random().toString(),
    text: `${p.name} converted ${card.name} into +${card.coreValue} Core! (Total Core Pool: ${p.corePool})`,
    type: 'conversion',
    timestamp: new Date().toLocaleTimeString(),
  });

  soundFx.playCardSummonSound();

  return {
    ...state,
    [playerKey]: p,
    logs,
  };
}

export function advancePhase(state: GameState): GameState {
  if (state.winner) return state;

  const phaseOrder: GamePhase[] = ['draw', 'conversion', 'main1', 'combat', 'main2', 'end'];
  const currentIndex = phaseOrder.indexOf(state.phase);

  if (currentIndex === -1 || currentIndex === phaseOrder.length - 1) {
    // End Step -> Switch Turn Owner & Start Draw Phase of Next Turn
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

  // 1. Mark previous hand cards as drawnThisTurn = false
  activePlayer.hand = activePlayer.hand.map((hc) => ({ ...hc, drawnThisTurn: false }));

  // 2. Draw Phase: Draw top card
  activePlayer = drawCard(activePlayer, logs);

  // 3. Trigger Runes while Alert
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
    const newBeing: BoardPermanent = {
      instanceId: Math.random().toString(),
      card,
      currentEdge: card.edge || 1,
      currentGrit: card.grit || 1,
      maxGrit: card.grit || 1,
      state: isExpediteRequired ? 'alert' : 'dormant',
      bankedCore: 0,
      attachments: [],
      isGuard: card.isGuard || false,
    };

    player.field.push(newBeing);
    logs.unshift({
      id: Math.random().toString(),
      text: `${player.name} ${isExpediteRequired ? 'EXPEDITED' : 'cast'} Being: ${card.name} (Load: ${requiredLoadCost}) - Enters ${newBeing.state.toUpperCase()}.`,
      type: 'summon',
      timestamp: new Date().toLocaleTimeString(),
    });

    soundFx.playCardSummonSound();
  } else if (card.type === 'charm') {
    player.graveyard.push(card);
    soundFx.playSpellCastSound();

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

    logs.unshift({
      id: Math.random().toString(),
      text: `${player.name} ${isExpediteRequired ? 'EXPEDITED' : 'cast'} Charm: ${card.name}.`,
      type: 'charm',
      timestamp: new Date().toLocaleTimeString(),
    });
  } else if (card.type === 'attachment') {
    if (targetInstanceId && targetInstanceId !== 'nexus') {
      const targetBeing = player.field.find((p) => p.instanceId === targetInstanceId);
      if (targetBeing) {
        targetBeing.attachments.push(card);
        if (card.attachmentType === 'weapon' && card.ability?.buffEdge) {
          targetBeing.currentEdge += card.ability.buffEdge;
        }
        if (card.attachmentType === 'armor' && card.ability?.buffGrit) {
          targetBeing.currentGrit += card.ability.buffGrit;
          targetBeing.maxGrit += card.ability.buffGrit;
        }
        logs.unshift({
          id: Math.random().toString(),
          text: `${player.name} attached ${card.name} to ${targetBeing.card.name}.`,
          type: 'summon',
          timestamp: new Date().toLocaleTimeString(),
        });
      }
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
      // PRIMAL DAMAGE HEAD-REMOVAL
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
  const nextTurnNumber = state.turnNumber + 1;
  const logs = [...state.logs];

  // End Step: Toughness / Grit damage resets to max; creatures untap / become Alert
  const player = { ...state.player };
  const opponent = { ...state.opponent };

  player.field = player.field.map((perm) => ({
    ...perm,
    state: 'alert',
    currentGrit: perm.maxGrit,
  }));
  opponent.field = opponent.field.filter((perm) => ({
    ...perm,
    state: 'alert',
    currentGrit: perm.maxGrit,
  }));

  logs.unshift({
    id: Math.random().toString(),
    text: `End Step: Grit (Defense) damage reset to max. Permanents become Alert.`,
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
