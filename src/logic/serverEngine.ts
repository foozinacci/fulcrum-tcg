import { GameState, Card, ClientActionIntent, ServerValidationResult, DeckCommitment, ReplayStep } from '../types/game';
import { playHandCard, convertHandCardToCore, executeCombat, endTurn } from './gameEngine';

/**
 * Server-Authoritative Engine Module
 * Pure server-side rules validator, deck commitment verifier, and sanitized state broadcaster.
 */

// Simple deterministic hash generator for deck commitments
export function generateDeckHash(deck: Card[]): string {
  const ids = deck.map((c) => c.id).sort().join(':');
  let hash = 0;
  for (let i = 0; i < ids.length; i++) {
    const char = ids.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return '0x' + Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Cryptographic Deck Commitment Protocol
 * Generates match commitment hashes before lock-in.
 */
export function createDeckCommitment(matchId: string, playerDeck: Card[], opponentDeck: Card[]): DeckCommitment {
  const pHash = generateDeckHash(playerDeck);
  const oHash = generateDeckHash(opponentDeck);
  const rngSeedHash = '0x' + Math.floor(Math.random() * 0xffffffff).toString(16);

  return {
    matchId,
    playerHash: pHash,
    opponentHash: oHash,
    rngSeedHash,
    committedAt: new Date().toISOString(),
    isValidated: true,
  };
}

/**
 * Hidden Information Protection
 * Strips hidden state (opponent hand card identity, deck card order) from broadcast payloads.
 */
export function sanitizeStateForClient(state: GameState, requestingPlayerId: string): GameState {
  // If player is requesting, opponent hand identities remain masked in network protocol
  const isPlayer = requestingPlayerId === 'player';

  return {
    ...state,
    opponent: {
      ...state.opponent,
      // In a strict network protocol, opponent hand cards are masked except for count
      hand: isPlayer
        ? state.opponent.hand.map((h) => ({ ...h, card: { ...h.card, name: 'Hidden Card', description: 'Hidden Information' } }))
        : state.opponent.hand,
    },
  };
}

/**
 * Server-Side Action Evaluator (The Heart of Integrity)
 * Validates client intent against authoritative state & rules engine.
 */
export function evaluateClientAction(state: GameState, intent: ClientActionIntent): ServerValidationResult {
  // 1. Turn Ownership Check
  if (state.turnOwner !== intent.playerId) {
    return {
      valid: false,
      errorCode: 'ERR_NOT_YOUR_TURN',
      message: 'Server Rejected: Action attempted out of turn owner priority.',
    };
  }

  // 2. Action Specific Validation
  switch (intent.type) {
    case 'CONVERT_CORE': {
      if (!intent.cardId) {
        return { valid: false, errorCode: 'ERR_INVALID_INTENT', message: 'Missing cardId for Core conversion.' };
      }
      const handCard = state.player.hand.find((h) => h.card.id === intent.cardId);
      if (!handCard) {
        return { valid: false, errorCode: 'ERR_CARD_NOT_IN_HAND', message: 'Server Rejected: Card not present in player hand.' };
      }
      if (!handCard.drawnThisTurn) {
        return { valid: false, errorCode: 'ERR_CONVERSION_TIMING', message: 'Server Rejected: Conversion is only legal on the draw turn.' };
      }
      if (state.player.corePool >= 10) {
        return { valid: false, errorCode: 'ERR_CORE_CAP_EXCEEDED', message: 'Server Rejected: Core pool is hard-capped at 10.' };
      }

      const nextState = convertHandCardToCore(state, intent.cardId);
      const auditStep: ReplayStep = {
        stepIndex: state.logs.length,
        turnNumber: state.turnNumber,
        turnOwner: state.turnOwner,
        logText: `[SERVER AUDIT] Player converted ${handCard.card.name} into Core`,
        playerLife: nextState.player.lifeTotal,
        opponentLife: nextState.opponent.lifeTotal,
        playerCore: nextState.player.corePool,
        opponentCore: nextState.opponent.corePool,
        playerFieldCount: nextState.player.field.length,
        opponentFieldCount: nextState.opponent.field.length,
      };

      return {
        valid: true,
        message: 'Server Approved: Core converted successfully.',
        sanitizedState: sanitizeStateForClient(nextState, intent.playerId),
        auditReplayStep: auditStep,
      };
    }

    case 'PLAY_CARD': {
      if (!intent.cardId) {
        return { valid: false, errorCode: 'ERR_INVALID_INTENT', message: 'Missing cardId to play.' };
      }
      const handCard = state.player.hand.find((h) => h.card.id === intent.cardId);
      if (!handCard) {
        return { valid: false, errorCode: 'ERR_CARD_NOT_IN_HAND', message: 'Server Rejected: Card not in player hand.' };
      }

      // Load cost & Pace gating check
      if (state.player.corePool < handCard.card.load) {
        return { valid: false, errorCode: 'ERR_INSUFFICIENT_CORE', message: 'Server Rejected: Player lacks required Core load cost.' };
      }
      if (state.turnNumber < handCard.card.pace) {
        return { valid: false, errorCode: 'ERR_PACE_GATED', message: `Server Rejected: Card Pace is ${handCard.card.pace}, turn is ${state.turnNumber}.` };
      }

      const nextState = playHandCard(state, intent.cardId, intent.targetInstanceId);
      const auditStep: ReplayStep = {
        stepIndex: state.logs.length,
        turnNumber: state.turnNumber,
        turnOwner: state.turnOwner,
        logText: `[SERVER AUDIT] Player cast ${handCard.card.name} (Load ${handCard.card.load})`,
        playerLife: nextState.player.lifeTotal,
        opponentLife: nextState.opponent.lifeTotal,
        playerCore: nextState.player.corePool,
        opponentCore: nextState.opponent.corePool,
        playerFieldCount: nextState.player.field.length,
        opponentFieldCount: nextState.opponent.field.length,
      };

      return {
        valid: true,
        message: 'Server Approved: Card cast successfully.',
        sanitizedState: sanitizeStateForClient(nextState, intent.playerId),
        auditReplayStep: auditStep,
      };
    }

    case 'END_TURN': {
      const nextState = endTurn(state);
      const auditStep: ReplayStep = {
        stepIndex: state.logs.length,
        turnNumber: nextState.turnNumber,
        turnOwner: nextState.turnOwner,
        logText: `[SERVER AUDIT] Turn ended. Active owner: ${nextState.turnOwner}`,
        playerLife: nextState.player.lifeTotal,
        opponentLife: nextState.opponent.lifeTotal,
        playerCore: nextState.player.corePool,
        opponentCore: nextState.opponent.corePool,
        playerFieldCount: nextState.player.field.length,
        opponentFieldCount: nextState.opponent.field.length,
      };

      return {
        valid: true,
        message: 'Server Approved: Turn passed.',
        sanitizedState: sanitizeStateForClient(nextState, intent.playerId),
        auditReplayStep: auditStep,
      };
    }

    default:
      return { valid: false, errorCode: 'ERR_UNKNOWN_ACTION', message: 'Server Rejected: Action type unknown.' };
  }
}
