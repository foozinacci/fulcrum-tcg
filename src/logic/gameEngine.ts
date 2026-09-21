import { GameState, PlayerState, Card, BoardPermanent, GameLogEntry } from '../types/game';
import { STARTER_DECK_SOL, STARTER_DECK_UMBRA, PRIMAL_AVATAR_SOL, PRIMAL_AVATAR_UMBRA } from '../data/cards';
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
  const pDeck = shuffleDeck(customPlayerDeck || STARTER_DECK_SOL);
  const oDeck = shuffleDeck(customOpponentDeck || STARTER_DECK_UMBRA);

  const playerHand = pDeck.splice(0, 4);
  const opponentHand = oDeck.splice(0, 4);

  // Seed initial Core pool from opening hand total coreValue
  const playerInitialCore = playerHand.reduce((acc, c) => acc + c.coreValue, 0);
  const opponentInitialCore = opponentHand.reduce((acc, c) => acc + c.coreValue, 0);

  const player: PlayerState = {
    id: 'player',
    name: 'Archon (You)',
    isAi: false,
    lifeTotal: 10,
    startingLife: 10,
    primalDamageTaken: {},
    corePool: playerInitialCore,
    hand: playerHand,
    deck: pDeck,
    graveyard: [],
    primalAvatar: PRIMAL_AVATAR_SOL,
    field: [],
  };

  const opponent: PlayerState = {
    id: 'opponent',
    name: 'Void Sentinel (AI)',
    isAi: true,
    lifeTotal: 10,
    startingLife: 10,
    primalDamageTaken: {},
    corePool: opponentInitialCore,
    hand: opponentHand,
    deck: oDeck,
    graveyard: [],
    primalAvatar: PRIMAL_AVATAR_UMBRA,
    field: [],
  };

  const initialLogs: GameLogEntry[] = [
    {
      id: Math.random().toString(),
      text: 'Official FULCRUM match initiated! Opening hand seeded starting Core pools.',
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
    fulcrumBalance: 0,
    winner: null,
    logs: initialLogs,
    selectedHandCardId: null,
    selectedBoardInstanceId: null,
    isExpediteMode: false,
    isTargeting: false,
    validTargetType: null,
  };
}

export function convertHandCardToCore(state: GameState, cardId: string): GameState {
  const isPlayer = state.turnOwner === 'player';
  const playerKey = isPlayer ? 'player' : 'opponent';
  const p = { ...state[playerKey] };
  const logs = [...state.logs];

  const cardIndex = p.hand.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) return state;

  const card = p.hand[cardIndex];
  p.hand.splice(cardIndex, 1);
  p.graveyard.push(card);
  p.corePool += card.coreValue;

  logs.unshift({
    id: Math.random().toString(),
    text: `${p.name} converted ${card.name} into +${card.coreValue} Core! (Total Core: ${p.corePool})`,
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

export function drawCard(playerState: PlayerState, logs: GameLogEntry[]): PlayerState {
  const p = { ...playerState };
  if (p.deck.length === 0) {
    p.lifeTotal = Math.max(0, p.lifeTotal - 1);
    logs.unshift({
      id: Math.random().toString(),
      text: `${p.name} deck is empty! Took 1 Deckout damage.`,
      type: 'combat',
      timestamp: new Date().toLocaleTimeString(),
    });
    return p;
  }

  const [topCard, ...remainingDeck] = p.deck;
  p.deck = remainingDeck;
  p.hand = [...p.hand, topCard];

  logs.unshift({
    id: Math.random().toString(),
    text: `${p.name} drew ${topCard.name}.`,
    type: 'info',
    timestamp: new Date().toLocaleTimeString(),
  });

  return p;
}

export function startTurn(state: GameState): GameState {
  const isPlayerTurn = state.turnOwner === 'player';
  const activeKey = isPlayerTurn ? 'player' : 'opponent';

  let activePlayer = { ...state[activeKey] };
  const logs = [...state.logs];

  // 1. Permanents become Alert (untapped)
  activePlayer.field = activePlayer.field.map((perm) => ({
    ...perm,
    state: 'alert',
    currentGrit: perm.maxGrit, // Reset Grit defense each turn
  }));

  // 2. Draw card for turn
  activePlayer = drawCard(activePlayer, logs);

  // 3. Trigger Runes / Relics onTurnStart
  activePlayer.field.forEach((perm) => {
    if (perm.card.ability?.trigger === 'onTurnStart') {
      if (perm.card.type === 'rune') {
        activePlayer.corePool += 2;
        logs.unshift({
          id: Math.random().toString(),
          text: `${perm.card.name} generated +2 Core!`,
          type: 'conversion',
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
    phase: 'main1',
    logs,
  };
}

export function playHandCard(
  state: GameState,
  cardId: string,
  isExpedite: boolean = false,
  targetInstanceId?: string | 'nexus'
): GameState {
  const isPlayer = state.turnOwner === 'player';
  const playerKey = isPlayer ? 'player' : 'opponent';
  const opponentKey = isPlayer ? 'opponent' : 'player';

  let player = { ...state[playerKey] };
  let opponent = { ...state[opponentKey] };
  const logs = [...state.logs];

  const cardIndex = player.hand.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) return state;

  const card = player.hand[cardIndex];

  // Check Pace restriction unless Expedited
  if (!isExpedite && state.turnNumber < card.pace) {
    logs.unshift({
      id: Math.random().toString(),
      text: `Cannot play ${card.name}! Requires Pace ${card.pace} (Current Turn: ${state.turnNumber}).`,
      type: 'info',
      timestamp: new Date().toLocaleTimeString(),
    });
    return { ...state, logs };
  }

  // Calculate Load cost
  const cost = isExpedite ? card.expediteLoad || card.load + 2 : card.load;
  if (player.corePool < cost) {
    logs.unshift({
      id: Math.random().toString(),
      text: `Not enough Core pool to cast ${card.name}! Cost: ${cost}, Core: ${player.corePool}.`,
      type: 'info',
      timestamp: new Date().toLocaleTimeString(),
    });
    return { ...state, logs };
  }

  // Deduct Load from Core pool & remove card from hand
  player.corePool -= cost;
  player.hand.splice(cardIndex, 1);

  // Shift Fulcrum Balance
  let fulcrumBalance = state.fulcrumBalance;
  if (card.ability?.fulcrumShift) {
    const shift = card.ability.fulcrumShift;
    fulcrumBalance = Math.max(-5, Math.min(5, fulcrumBalance + shift));
    soundFx.playFulcrumShiftSound(shift > 0 ? 'sol' : 'umbra');
  }

  if (card.type === 'being') {
    const newBeing: BoardPermanent = {
      instanceId: Math.random().toString(),
      card,
      currentEdge: card.edge || 1,
      currentGrit: card.grit || 1,
      maxGrit: card.grit || 1,
      state: isExpedite ? 'alert' : 'dormant', // Enters Dormant unless Expedited
      bankedCore: 0,
      isGuard: card.isGuard || false,
    };

    player.field.push(newBeing);
    logs.unshift({
      id: Math.random().toString(),
      text: `${player.name} summoned Being: ${card.name} (${newBeing.currentEdge}/${newBeing.currentGrit}) - Enters ${newBeing.state.toUpperCase()}.`,
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
      if (card.ability.heal) {
        player.lifeTotal = Math.min(player.startingLife, player.lifeTotal + card.ability.heal);
      }
      if (card.ability.drawCards) {
        for (let i = 0; i < card.ability.drawCards; i++) {
          player = drawCard(player, logs);
        }
      }
    }

    logs.unshift({
      id: Math.random().toString(),
      text: `${player.name} cast Charm: ${card.name}.`,
      type: 'charm',
      timestamp: new Date().toLocaleTimeString(),
    });
  } else {
    // Relic / Rune / Attachment
    const perm: BoardPermanent = {
      instanceId: Math.random().toString(),
      card,
      currentEdge: 0,
      currentGrit: 1,
      maxGrit: 1,
      state: 'alert',
      bankedCore: 0,
      isGuard: false,
    };
    player.field.push(perm);
    soundFx.playSpellCastSound();
  }

  // Check victory
  let winner: 'player' | 'opponent' | null = null;
  if (opponent.lifeTotal <= 0) winner = isPlayer ? 'player' : 'opponent';
  if (player.lifeTotal <= 0) winner = isPlayer ? 'opponent' : 'player';

  return {
    ...state,
    [playerKey]: player,
    [opponentKey]: opponent,
    fulcrumBalance,
    winner,
    logs,
    selectedHandCardId: null,
    isTargeting: false,
  };
}

export function executeCombat(
  state: GameState,
  attackerInstanceId: string,
  targetId: string | 'nexus'
): GameState {
  const isPlayer = state.turnOwner === 'player';
  const playerKey = isPlayer ? 'player' : 'opponent';
  const opponentKey = isPlayer ? 'opponent' : 'player';

  const player = { ...state[playerKey] };
  const opponent = { ...state[opponentKey] };
  const logs = [...state.logs];

  const attacker = player.field.find((p) => p.instanceId === attackerInstanceId);
  if (!attacker || attacker.state !== 'alert') return state;

  // Attacking costs 1 Core per creature!
  if (player.corePool < 1) {
    logs.unshift({
      id: Math.random().toString(),
      text: `Attacking costs 1 Core! (Core pool: ${player.corePool})`,
      type: 'info',
      timestamp: new Date().toLocaleTimeString(),
    });
    return { ...state, logs };
  }

  player.corePool -= 1;
  attacker.state = 'dormant';

  // Check Guard requirement
  const guardUnits = opponent.field.filter((p) => p.isGuard);
  if (guardUnits.length > 0) {
    if (targetId === 'nexus') {
      logs.unshift({
        id: Math.random().toString(),
        text: `Cannot attack Life pool! Enemy has Guard units active.`,
        type: 'info',
        timestamp: new Date().toLocaleTimeString(),
      });
      return state;
    }
  }

  const damage = attacker.currentEdge + attacker.bankedCore;

  if (targetId === 'nexus') {
    // Check if attacker is Primal Avatar
    if (attacker.card.isPrimal) {
      const sourceId = attacker.card.id;
      const currentPrimalDmg = (opponent.primalDamageTaken[sourceId] || 0) + damage;
      opponent.primalDamageTaken[sourceId] = currentPrimalDmg;

      logs.unshift({
        id: Math.random().toString(),
        text: `PRIMAL DAMAGE! ${attacker.card.name} dealt ${damage} Primal Damage to ${opponent.name} (Total: ${currentPrimalDmg}/${opponent.startingLife / 2}).`,
        type: 'primal',
        timestamp: new Date().toLocaleTimeString(),
      });

      // Primal Elimination Rule: Half starting life
      if (currentPrimalDmg >= opponent.startingLife / 2) {
        opponent.lifeTotal = 0;
        logs.unshift({
          id: Math.random().toString(),
          text: `HEAD-REMOVAL! ${opponent.name} eliminated by Primal Damage threshold!`,
          type: 'primal',
          timestamp: new Date().toLocaleTimeString(),
        });
      } else {
        opponent.lifeTotal = Math.max(0, opponent.lifeTotal - damage);
      }
    } else {
      opponent.lifeTotal = Math.max(0, opponent.lifeTotal - damage);
      logs.unshift({
        id: Math.random().toString(),
        text: `${attacker.card.name} attacked ${opponent.name} Life pool for ${damage} damage!`,
        type: 'combat',
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    soundFx.playNexusDamageSound();
  } else {
    // Combat vs defender Being
    const defender = opponent.field.find((p) => p.instanceId === targetId);
    if (!defender) return state;

    soundFx.playCombatAttackSound();

    defender.currentGrit -= damage;
    attacker.currentGrit -= defender.currentEdge;

    logs.unshift({
      id: Math.random().toString(),
      text: `${attacker.card.name} (Edge ${damage}) engaged ${defender.card.name} (Grit ${defender.currentGrit}).`,
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
    isTargeting: false,
  };
}

export function endTurn(state: GameState): GameState {
  if (state.winner) return state;

  const nextOwner = state.turnOwner === 'player' ? 'opponent' : 'player';
  const nextTurnNumber = state.turnNumber + 1;

  const newState: GameState = {
    ...state,
    turnOwner: nextOwner,
    turnNumber: nextTurnNumber,
    selectedHandCardId: null,
    selectedBoardInstanceId: null,
    isTargeting: false,
  };

  return startTurn(newState);
}
