import { GameState } from '../types/game';
import { playHandCard, executeCombat, convertHandCardToCore, endTurn, discardHandCardsForEndStep } from './gameEngine';

export function runAiTurnStep(state: GameState): GameState {
  if (state.turnOwner !== 'opponent' || state.winner) return state;

  const ai = state.opponent;
  const player = state.player;

  // 1. Conversion Phase: Convert extra card if Core pool is low
  if (state.phase === 'conversion' && ai.corePool < 2 && ai.hand.length > 0) {
    const convertable = ai.hand.find((hc) => hc.drawnThisTurn || ai.primalAvatar.id === 'primal_kharv_06');
    if (convertable) {
      const next = convertHandCardToCore(state, convertable.card.id);
      if (next.opponent.hand.length < ai.hand.length || next.opponent.corePool > ai.corePool) {
        return next;
      }
    }
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

  if (playableHandCards.length > 0 && ai.field.length < 6) {
    playableHandCards.sort((a, b) => b.card.load - a.card.load);
    for (const hc of playableHandCards) {
      const cardToPlay = hc.card;
      let target: string | 'nexus' | undefined = undefined;

      if (cardToPlay.type === 'attachment') {
        const aiBeings = ai.field.filter((p) => p.card.type === 'being');
        if (aiBeings.length > 0) {
          target = aiBeings[0].instanceId;
        }
      } else if (cardToPlay.type === 'charm' && cardToPlay.ability?.damage) {
        if (player.field.length > 0) {
          target = player.field[0].instanceId;
        } else {
          target = 'nexus';
        }
      }

      const next = playHandCard(state, cardToPlay.id, target);
      if (next.opponent.hand.length < ai.hand.length) {
        return next;
      }
    }
  }

  // 3. Attack with Alert Beings
  const alertAttackers = ai.field.filter((p) => p.state === 'alert' && p.currentEdge > 0);
  if (alertAttackers.length > 0 && ai.corePool >= 1) {
    for (const attacker of alertAttackers) {
      const playerGuards = player.field.filter((p) => p.card.isGuard);
      let targetId: string | 'nexus' = 'nexus';
      if (playerGuards.length > 0) {
        targetId = playerGuards[0].instanceId;
      }
      const next = executeCombat(state, attacker.instanceId, targetId);
      const updatedAttacker = next.opponent.field.find((p) => p.instanceId === attacker.instanceId);
      if (!updatedAttacker || updatedAttacker.state !== 'alert') {
        return next;
      }
    }
  }

  // 4. Hand size limit check before ending turn (max 6 in hand)
  if (ai.hand.length > 6) {
    const extraCount = ai.hand.length - 6;
    const sortedHand = [...ai.hand].sort((a, b) => (a.card.coreValue || 1) - (b.card.coreValue || 1));
    const toDiscardIds = sortedHand.slice(0, extraCount).map((hc) => hc.card.id);
    return discardHandCardsForEndStep(state, toDiscardIds);
  }

  // 5. End AI Turn
  return endTurn(state);
}

