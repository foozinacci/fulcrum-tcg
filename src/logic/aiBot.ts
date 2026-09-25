import { GameState } from '../types/game';
import { playHandCard, executeCombat, convertHandCardToCore, endTurn } from './gameEngine';

export function runAiTurnStep(state: GameState): GameState {
  if (state.turnOwner !== 'opponent' || state.winner) return state;

  const ai = state.opponent;
  const player = state.player;

  // 1. Conversion Phase: Convert extra card if Core pool is low
  if (ai.corePool < 2 && ai.hand.length > 0) {
    const convertable = ai.hand.find((hc) => hc.drawnThisTurn || ai.primalAvatar.id === 'primal_kharv_06');
    if (convertable) {
      const next = convertHandCardToCore(state, convertable.card.id);
      if (next !== state) return next;
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
      if (next !== state) return next;
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
      if (next !== state) return next;
    }
  }

  // 4. End AI Turn
  return endTurn(state);
}
