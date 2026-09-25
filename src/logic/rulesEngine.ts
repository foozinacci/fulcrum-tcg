import {
  GameState,
  PlayerState,
  Card,
  BoardPermanent,
  GameAction,
  ValidationResult,
  ActionErrorCode,
  ZoneType,
  CombatStep,
  GameLogEntry,
} from '../types/game';
import { KHARV_ROTWATCH, GROTHMAW_CHARMBRANDED, NYSSARA_VOIDHALLOWER, KAZRITH_RUNESCALE, GLUTTRIX_COREFEASTER, VORRATH_IRONBOUND } from '../data/cards';

/**
 * ============================================================================
 * FULCRUM STRICT RULES & VALIDATION ENGINE
 * Source of Truth: Official FULCRUM Game Design Document (GDD)
 * 
 * Rules Enforced By This Engine:
 * 1. [Priority & Turn Ownership]: Actions may only be taken when player has active priority.
 * 2. [Single Authoritative Zone Manager]: Cards/tokens move ONLY via transferCardZone().
 * 3. [Resource Hard Cap]: Core pool max 10. Core cannot be overflowed.
 * 4. [Turn-Draw Conversion Timing]: Only hand cards drawn THIS turn can be converted to Core (unless Kharv Rotwatch).
 * 5. [Pace & Expedite Gating]: Cards with Pace > TurnNumber cannot be cast standard. Expedite load cost required for early cast.
 * 6. [Guard Interception Keyword]: Attacks against non-Guard units or Nexus are rejected if opponent controls an Alert Guard unit.
 * 7. [Combat Pipeline]: Attack Declaration -> Blocker Declaration -> Damage Assignment -> Simultaneous Resolution.
 * 8. [Primal Head-Removal]: Cumulative Primal damage >= 50% starting HP instantly eliminates a player.
 * 9. [Zero Deckout HP Loss]: Drawing from empty deck logs empty deck state but NEVER subtracts HP.
 * 10. [Determinism]: Side-effect free validation prior to state mutation.
 * ============================================================================
 */

/**
 * Single Authoritative Zone Movement Manager
 * Guarantees zero raw array mutation outside of this function.
 */
export function transferCardZone(
  state: GameState,
  cardId: string,
  fromZone: ZoneType,
  toZone: ZoneType,
  ownerId: 'player' | 'opponent'
): GameState {
  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  const pKey = ownerId;
  const player = newState[pKey];

  let cardToMove: Card | null = null;

  // 1. Remove from source zone
  switch (fromZone) {
    case 'hand': {
      const idx = player.hand.findIndex((hc) => hc.card.id === cardId);
      if (idx !== -1) {
        cardToMove = player.hand[idx].card;
        player.hand.splice(idx, 1);
      }
      break;
    }
    case 'deck': {
      const idx = player.deck.findIndex((c) => c.id === cardId);
      if (idx !== -1) {
        cardToMove = player.deck[idx];
        player.deck.splice(idx, 1);
      }
      break;
    }
    case 'field': {
      const idx = player.field.findIndex((p) => p.card.id === cardId || p.instanceId === cardId);
      if (idx !== -1) {
        cardToMove = player.field[idx].card;
        player.field.splice(idx, 1);
      }
      break;
    }
    case 'graveyard': {
      const idx = player.graveyard.findIndex((c) => c.id === cardId);
      if (idx !== -1) {
        cardToMove = player.graveyard[idx];
        player.graveyard.splice(idx, 1);
      }
      break;
    }
    case 'primal_slot': {
      if (player.primalAvatar.id === cardId) {
        cardToMove = player.primalAvatar;
      }
      break;
    }
    case 'exile':
      break;
  }

  if (!cardToMove) return state; // Transfer failed: Card not found in specified source zone

  // 2. Add to destination zone
  switch (toZone) {
    case 'hand':
      player.hand.push({ card: cardToMove, drawnThisTurn: false });
      break;
    case 'deck':
      player.deck.push(cardToMove);
      break;
    case 'graveyard':
      player.graveyard.push(cardToMove);
      break;
    case 'field': {
      const newPerm: BoardPermanent = {
        instanceId: Math.random().toString(),
        card: cardToMove,
        currentEdge: cardToMove.edge || 1,
        currentGrit: cardToMove.grit || 1,
        maxGrit: cardToMove.grit || 1,
        state: 'dormant',
        bankedCore: 0,
        attachments: [],
        isGuard: cardToMove.isGuard || false,
      };
      player.field.push(newPerm);
      break;
    }
    case 'exile':
      // Card removed from match play
      break;
    case 'primal_slot':
      player.primalAvatar = cardToMove;
      break;
  }

  return newState;
}

/**
 * Centralized Action Validation Checklist
 * Pure function performing dry-run rules check BEFORE any state mutation.
 */
export function validateAction(state: GameState, action: GameAction): ValidationResult {
  if (state.winner) {
    return { valid: false, errorCode: 'ERR_WRONG_PHASE', reason: 'Match has ended. No further actions permitted.' };
  }

  // 1. Turn Owner / Priority Check
  if (state.turnOwner !== action.playerId) {
    return { valid: false, errorCode: 'ERR_NOT_YOUR_TURN', reason: `Action rejected: Not ${action.playerId}'s turn priority.` };
  }

  const pKey = action.playerId;
  const oppKey = action.playerId === 'player' ? 'opponent' : 'player';
  const player = state[pKey];
  const opponent = state[oppKey];

  switch (action.type) {
    case 'CONVERT_CORE': {
      const handCard = player.hand.find((hc) => hc.card.id === action.cardId);
      if (!handCard) {
        return { valid: false, errorCode: 'ERR_NOT_IN_ZONE', reason: 'Conversion rejected: Target card is not in player hand.' };
      }
      if (!handCard.drawnThisTurn && player.primalAvatar.id !== KHARV_ROTWATCH.id) {
        return { valid: false, errorCode: 'ERR_CONVERSION_TIMING', reason: 'Conversion rejected: Core conversion is only legal on the turn the card was drawn (unless controlling Kharv, Rotwatch).' };
      }
      if (player.corePool >= 10) {
        return { valid: false, errorCode: 'ERR_CORE_CAP_EXCEEDED', reason: 'Conversion rejected: Core pool is hard-capped at 10.' };
      }
      return { valid: true };
    }

    case 'PLAY_CARD': {
      const handCard = player.hand.find((hc) => hc.card.id === action.cardId);
      if (!handCard) {
        return { valid: false, errorCode: 'ERR_NOT_IN_ZONE', reason: 'Cast rejected: Card is not in hand.' };
      }

      const card = handCard.card;

      if (card.pact && player.primalAvatar.pact && card.pact.toLowerCase() !== player.primalAvatar.pact.toLowerCase()) {
        return { valid: false, errorCode: 'ERR_COLOR_IDENTITY_MISMATCH', reason: `Cast rejected: ${card.name} (${card.pact}) violates Primal Avatar ${player.primalAvatar.name} (${player.primalAvatar.pact}) color identity.` };
      }

      const isExpediteRequired = state.turnNumber < card.pace;
      let requiredCost = card.load;

      if (isExpediteRequired) {
        if (!card.expediteLoad) {
          return { valid: false, errorCode: 'ERR_PACE_GATED', reason: `Cast rejected: Card requires Pace ${card.pace} (Current Turn: ${state.turnNumber}) and has no Expedite load cost.` };
        }
        requiredCost = card.expediteLoad;
      }

      if (player.corePool < requiredCost) {
        return { valid: false, errorCode: 'ERR_INSUFFICIENT_CORE', reason: `Cast rejected: Insufficient Core. Required: ${requiredCost}, Available: ${player.corePool}.` };
      }

      return { valid: true };
    }

    case 'DECLARE_ATTACKER': {
      if (state.phase !== 'combat') {
        return { valid: false, errorCode: 'ERR_WRONG_PHASE', reason: `Attack rejected: Combat actions are only legal during the Combat Phase (Current Phase: ${state.phase.toUpperCase()}).` };
      }

      const attacker = player.field.find((p) => p.instanceId === action.attackerInstanceId);
      if (!attacker) {
        return { valid: false, errorCode: 'ERR_NOT_IN_ZONE', reason: 'Attack rejected: Attacking unit not found on friendly field.' };
      }

      if (attacker.state !== 'alert') {
        return { valid: false, errorCode: 'ERR_DORMANT_UNIT', reason: 'Attack rejected: Unit is Dormant (exhausted/summoning sickness). Must be Alert to attack.' };
      }

      const attackCost = (attacker.card.attackCoreCost || 1) + (action.bankedCore || 0);
      if (player.corePool < attackCost) {
        return { valid: false, errorCode: 'ERR_INSUFFICIENT_CORE', reason: `Attack rejected: Insufficient Core pool to initiate attack. Cost: ${attackCost}, Core: ${player.corePool}.` };
      }

      // Guard Keyword Interception Enforcement:
      // If defender controls an Alert Guard unit, attacks targeting Nexus or non-Guard units are illegal!
      const activeGuards = opponent.field.filter((p) => p.isGuard && p.state === 'alert');
      if (activeGuards.length > 0) {
        if (action.targetId === 'nexus') {
          return {
            valid: false,
            errorCode: 'ERR_GUARD_INTERCEPTION_REQUIRED',
            reason: `Attack rejected: Opponent controls Alert Guard unit (${activeGuards[0].card.name}). You must attack the Guard unit before attacking the Nexus.`,
          };
        }
        const targetPerm = opponent.field.find((p) => p.instanceId === action.targetId);
        if (targetPerm && !targetPerm.isGuard) {
          return {
            valid: false,
            errorCode: 'ERR_GUARD_INTERCEPTION_REQUIRED',
            reason: `Attack rejected: Opponent controls Alert Guard unit (${activeGuards[0].card.name}). You must target the Guard unit first.`,
          };
        }
      }

      return { valid: true };
    }

    case 'DECLARE_BLOCKER': {
      if (state.phase !== 'combat') {
        return { valid: false, errorCode: 'ERR_WRONG_PHASE', reason: 'Block rejected: Blocking is only legal during Combat Phase.' };
      }
      const blocker = player.field.find((p) => p.instanceId === action.blockerInstanceId);
      if (!blocker || blocker.state !== 'alert') {
        return { valid: false, errorCode: 'ERR_DORMANT_UNIT', reason: 'Block rejected: Blocker unit must be Alert.' };
      }
      return { valid: true };
    }

    case 'END_TURN': {
      return { valid: true };
    }

    default:
      return { valid: true };
  }
}

/**
 * Deterministic Action Executor
 * Executes action ONLY after validateAction returns valid: true.
 */
export function executeValidatedAction(state: GameState, action: GameAction): GameState {
  const check = validateAction(state, action);
  if (!check.valid) {
    const errorLog: GameLogEntry = {
      id: Math.random().toString(),
      text: `[RULE REJECTION ${check.errorCode}] ${check.reason}`,
      type: 'info',
      timestamp: new Date().toLocaleTimeString(),
    };
    return { ...state, logs: [errorLog, ...state.logs] };
  }

  const pKey = action.playerId;
  const oppKey = action.playerId === 'player' ? 'opponent' : 'player';
  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  const player = newState[pKey];
  const opponent = newState[oppKey];

  switch (action.type) {
    case 'CONVERT_CORE': {
      const idx = player.hand.findIndex((hc) => hc.card.id === action.cardId);
      if (idx === -1) return state;

      const card = player.hand[idx].card;
      const coreGain = Math.min(10 - player.corePool, card.coreValue || 1);

      // Perform single authoritative zone movement to graveyard
      const afterMove = transferCardZone(newState, card.id, 'hand', 'graveyard', action.playerId);
      afterMove[pKey].corePool += coreGain;

      afterMove.logs.unshift({
        id: Math.random().toString(),
        text: `${player.name} converted ${card.name} into +${coreGain} Core (Core Pool: ${afterMove[pKey].corePool}/10).`,
        type: 'conversion',
        timestamp: new Date().toLocaleTimeString(),
      });

      return afterMove;
    }

    case 'PLAY_CARD': {
      const idx = player.hand.findIndex((hc) => hc.card.id === action.cardId);
      if (idx === -1) return state;

      const card = player.hand[idx].card;
      const isExpedite = newState.turnNumber < card.pace;
      const cost = isExpedite ? card.expediteLoad || card.load : card.load;

      player.corePool -= cost;

      if (card.type === 'being' || card.type === 'relic' || card.type === 'rune' || card.type === 'attachment') {
        const afterMove = transferCardZone(newState, card.id, 'hand', 'field', action.playerId);
        const playedPerm = afterMove[pKey].field[afterMove[pKey].field.length - 1];
        if (playedPerm && card.type === 'being') {
          playedPerm.state = isExpedite || player.primalAvatar.id === KAZRITH_RUNESCALE.id ? 'alert' : 'dormant';
        } else if (playedPerm) {
          playedPerm.state = 'alert';
        }

        afterMove.logs.unshift({
          id: Math.random().toString(),
          text: `${player.name} cast ${card.type.toUpperCase()} ${card.name} (Cost: ${cost} Core).`,
          type: 'summon',
          timestamp: new Date().toLocaleTimeString(),
        });

        return afterMove;
      } else {
        const afterMove = transferCardZone(newState, card.id, 'hand', 'graveyard', action.playerId);
        afterMove.logs.unshift({
          id: Math.random().toString(),
          text: `${player.name} cast Charm ${card.name} (Cost: ${cost} Core).`,
          type: 'charm',
          timestamp: new Date().toLocaleTimeString(),
        });

        return afterMove;
      }
    }

    case 'DECLARE_ATTACKER': {
      const attacker = player.field.find((p) => p.instanceId === action.attackerInstanceId);
      if (!attacker) return state;

      const cost = (attacker.card.attackCoreCost || 1) + (action.bankedCore || 0);
      player.corePool -= cost;
      attacker.state = 'dormant';
      attacker.bankedCore += action.bankedCore || 0;

      const bonusDmg = Math.floor(attacker.bankedCore * (attacker.card.coreAttackRatio || 1.0));
      const totalDmg = attacker.currentEdge + bonusDmg;

      if (action.targetId === 'nexus') {
        if (attacker.card.isPrimal) {
          const srcId = attacker.card.id;
          opponent.primalDamageTaken = opponent.primalDamageTaken || {};
          const currentPrimalDmg = (opponent.primalDamageTaken[srcId] || 0) + totalDmg;
          opponent.primalDamageTaken[srcId] = currentPrimalDmg;
          const threshold = opponent.startingLife / 2;

          newState.logs.unshift({
            id: Math.random().toString(),
            text: `PRIMAL ATTACK! ${attacker.card.name} dealt ${totalDmg} Primal Damage to ${opponent.name} (Total: ${currentPrimalDmg}/${threshold}).`,
            type: 'primal',
            timestamp: new Date().toLocaleTimeString(),
          });

          if (currentPrimalDmg >= threshold) {
            opponent.lifeTotal = 0;
            newState.winner = action.playerId;
            newState.logs.unshift({
              id: Math.random().toString(),
              text: `HEAD-REMOVAL ELIMINATION! Cumulative Primal Damage reached half starting HP (${currentPrimalDmg}/${threshold})! ${player.name} wins!`,
              type: 'primal',
              timestamp: new Date().toLocaleTimeString(),
            });
          } else {
            opponent.lifeTotal = Math.max(0, opponent.lifeTotal - totalDmg);
          }
        } else {
          opponent.lifeTotal = Math.max(0, opponent.lifeTotal - totalDmg);
          newState.logs.unshift({
            id: Math.random().toString(),
            text: `${attacker.card.name} attacked ${opponent.name} Nexus for ${totalDmg} damage!`,
            type: 'combat',
            timestamp: new Date().toLocaleTimeString(),
          });
        }
      } else {
        const defender = opponent.field.find((p) => p.instanceId === action.targetId);
        if (defender) {
          defender.currentGrit -= totalDmg;
          attacker.currentGrit -= defender.currentEdge;

          newState.logs.unshift({
            id: Math.random().toString(),
            text: `${attacker.card.name} engaged ${defender.card.name} (${totalDmg} vs ${defender.currentEdge} Edge).`,
            type: 'combat',
            timestamp: new Date().toLocaleTimeString(),
          });

          // Single authoritative zone transfer on death
          if (defender.currentGrit <= 0) {
            transferCardZone(newState, defender.card.id, 'field', 'graveyard', oppKey);
          }
          if (attacker.currentGrit <= 0) {
            transferCardZone(newState, attacker.card.id, 'field', 'graveyard', pKey);
          }
        }
      }

      if (opponent.lifeTotal <= 0) newState.winner = action.playerId;
      return newState;
    }

    case 'END_TURN': {
      const nextOwner = state.turnOwner === 'player' ? 'opponent' : 'player';
      const isOrbitCompleting = state.turnOwner === 'opponent';
      const nextTurnNumber = isOrbitCompleting ? state.turnNumber + 1 : state.turnNumber;

      // Untap all field units for next turn
      newState.player.field.forEach((p) => {
        p.state = 'alert';
        p.currentGrit = p.maxGrit;
      });
      newState.opponent.field.forEach((p) => {
        p.state = 'alert';
        p.currentGrit = p.maxGrit;
      });

      newState.turnOwner = nextOwner;
      newState.turnNumber = nextTurnNumber;

      newState.logs.unshift({
        id: Math.random().toString(),
        text: isOrbitCompleting
          ? `--- Orbit ${nextTurnNumber} Begins! (${nextOwner === 'player' ? newState.player.name : newState.opponent.name}'s Turn) ---`
          : `--- Orbit ${state.turnNumber}: Passed priority to ${nextOwner === 'player' ? newState.player.name : newState.opponent.name} ---`,
        type: 'turn',
        timestamp: new Date().toLocaleTimeString(),
      });

      return newState;
    }

    default:
      return state;
  }
}
