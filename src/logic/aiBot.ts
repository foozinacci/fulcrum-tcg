import { GameState } from '../types/game';
import { playHandCard, executeCombat, executeGroupCombat, convertHandCardToCore, convertTopDeckCardToCore, drawCard, endTurn, discardHandCardsForEndStep, advancePhase } from './gameEngine';

export function runAiTurnStep(state: GameState): GameState {
  if (state.turnOwner !== 'opponent' || state.winner) return state;

  const ai = state.opponent;
  const player = state.player;

  // 1. Turn Start Conversion Phase Handling:
  if (state.phase === 'conversion') {
    if (ai.corePool < 2 && ai.deck.length > 0) {
      return convertTopDeckCardToCore(state);
    } else {
      let updatedAi = { ...ai };
      const logs = [...state.logs];
      if (state.turnNumber > 1 && updatedAi.deck.length > 0) {
        updatedAi = drawCard(updatedAi, logs);
      }
      return {
        ...state,
        opponent: updatedAi,
        phase: 'main1',
        logs,
      };
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

  // 3. Combat Phase: Multi-Attack Execution
  if (state.phase === 'combat') {
    const alertAttackers = ai.field.filter((p) => p.state === 'alert' && p.currentEdge > 0);
    if (alertAttackers.length > 0 && ai.corePool >= 1) {
      const maxAttacks = Math.min(alertAttackers.length, ai.corePool);
      const chosenAttackers = alertAttackers.slice(0, maxAttacks);
      const attackerIds = chosenAttackers.map((p) => p.instanceId);
      const playerGuards = player.field.filter((p) => p.card.isGuard);
      const blockerAssignments: Record<string, string> = {};
      if (playerGuards.length > 0) {
        blockerAssignments[playerGuards[0].instanceId] = attackerIds[0];
      }
      return executeGroupCombat(state, attackerIds, blockerAssignments);
    }
    return advancePhase(state);
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

