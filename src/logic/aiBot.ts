import { GameState } from '../types/game';
import { playHandCard, executeCombat, convertHandCardToCore, endTurn } from './gameEngine';

export function runAiTurnStep(state: GameState): GameState {
  if (state.turnOwner !== 'opponent' || state.winner) return state;

  const ai = state.opponent;
  const player = state.player;

  // 1. Conversion Phase: Convert extra card if Core pool is low
  if (ai.corePool < 2 && ai.hand.length > 3) {
    const cardToConvert = ai.hand[0].card;
    return convertHandCardToCore(state, cardToConvert.id);
  }

  // 2. Play Hand Cards (Evaluating standard Load vs Expedite Load)
  const playableHandCards = ai.hand.filter((hc) => {
    const card = hc.card;
    if (state.turnNumber >= card.pace) {
      return card.load <= ai.corePool;
    } else if (card.expediteLoad) {
      return card.expediteLoad <= ai.corePool;
    }
    return false;
  });

  if (playableHandCards.length > 0 && ai.field.length < 5) {
    playableHandCards.sort((a, b) => b.card.load - a.card.load);
    const cardToPlay = playableHandCards[0].card;

    let target: string | 'nexus' | undefined = undefined;
    if (cardToPlay.type === 'charm' && cardToPlay.ability?.damage) {
      if (player.field.length > 0) {
        target = player.field[0].instanceId;
      } else {
        target = 'nexus';
      }
    }

    return playHandCard(state, cardToPlay.id, target);
  }

  // 3. Attack with Alert Beings
  const alertAttackers = ai.field.filter((p) => p.state === 'alert' && p.currentEdge > 0);
  if (alertAttackers.length > 0 && ai.corePool >= 1) {
    const attacker = alertAttackers[0];
    const playerGuards = player.field.filter((p) => p.card.isGuard);

    let targetId: string | 'nexus' = 'nexus';
    if (playerGuards.length > 0) {
      targetId = playerGuards[0].instanceId;
    }

    return executeCombat(state, attacker.instanceId, targetId);
  }

  // 4. End AI Turn
  return endTurn(state);
}
