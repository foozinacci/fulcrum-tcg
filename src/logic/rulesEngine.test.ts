import { createInitialGameState, endTurn } from './gameEngine';
import { runAiTurnStep } from './aiBot';
import { validateAction, executeValidatedAction, transferCardZone } from './rulesEngine';
import { GameAction, Card } from '../types/game';

/**
 * ============================================================================
 * FULCRUM STRICT RULES ENGINE UNIT TESTS
 * Verifies Legal Happy Path + 3+ Illegal Rejections + Edge Cases
 * ============================================================================
 */

let testCount = 0;
let passCount = 0;

function assert(condition: boolean, testName: string, failureReason?: string) {
  testCount++;
  if (condition) {
    passCount++;
    console.log(`  ✓ PASS [${testCount}]: ${testName}`);
  } else {
    console.error(`  ✗ FAIL [${testCount}]: ${testName} - ${failureReason || 'Assertion failed'}`);
  }
}

export function runRulesEngineTests(): boolean {
  console.log('\n======================================================');
  console.log('RUNNING FULCRUM STRICT RULES ENGINE UNIT TEST SUITE');
  console.log('======================================================\n');

  testCount = 0;
  passCount = 0;

  const initialState = createInitialGameState();

  // --------------------------------------------------------------------------
  // TEST GROUP 1: SINGLE AUTHORITATIVE ZONE MOVEMENT
  // --------------------------------------------------------------------------
  console.log('--- TEST GROUP 1: Zone Transitions ---');
  {
    const testCard: Card = {
      id: 'test_being_1',
      name: 'Test Vanguard',
      load: 2,
      pace: 1,
      type: 'being',
      edge: 2,
      grit: 3,
      svgArtId: 'test',
      description: 'Test unit',
    };

    let state = { ...initialState };
    state.player.hand = [{ card: testCard, drawnThisTurn: true }];

    // Move from hand to field
    state = transferCardZone(state, testCard.id, 'hand', 'field', 'player');
    assert(
      state.player.hand.length === 0 && state.player.field.length === 1,
      'transferCardZone moves card atomically from hand to field'
    );

    // Move from field to graveyard
    state = transferCardZone(state, testCard.id, 'field', 'graveyard', 'player');
    assert(
      state.player.field.length === 0 && state.player.graveyard.length === 1,
      'transferCardZone moves card atomically from field to graveyard'
    );
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 2: CORE CONVERSION RULES (Legal vs 3 Illegal Cases)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: Core Conversion Rules ---');
  {
    const drawnCard: Card = { id: 'drawn_1', name: 'Fresh Draw', load: 3, coreValue: 2, pace: 1, type: 'being', svgArtId: 't', description: 't' };
    const oldCard: Card = { id: 'old_1', name: 'Old Hand Card', load: 3, coreValue: 2, pace: 1, type: 'being', svgArtId: 't', description: 't' };

    let state = { ...initialState };
    state.player.hand = [
      { card: drawnCard, drawnThisTurn: true },
      { card: oldCard, drawnThisTurn: false },
    ];
    state.player.corePool = 5;

    // Happy Path: Convert fresh drawn card
    const legalAction: GameAction = { type: 'CONVERT_CORE', playerId: 'player', cardId: drawnCard.id };
    const check1 = validateAction(state, legalAction);
    assert(check1.valid === true, 'Legal Conversion: Fresh drawn card converts cleanly');

    const state2 = executeValidatedAction(state, legalAction);
    assert(state2.player.corePool === 7, 'Core pool increases by coreValue (5 -> 7)');

    // Illegal Case 1: Convert card not drawn this turn
    const illegalOldAction: GameAction = { type: 'CONVERT_CORE', playerId: 'player', cardId: oldCard.id };
    const check2 = validateAction(state, illegalOldAction);
    assert(check2.valid === false && check2.errorCode === 'ERR_CONVERSION_TIMING', 'Illegal Case 1: Rejects conversion of old hand card');

    // Illegal Case 2: Convert card out of turn
    const illegalTurnAction: GameAction = { type: 'CONVERT_CORE', playerId: 'opponent', cardId: drawnCard.id };
    const check3 = validateAction(state, illegalTurnAction);
    assert(check3.valid === false && check3.errorCode === 'ERR_NOT_YOUR_TURN', 'Illegal Case 2: Rejects conversion out of turn owner priority');

    // Illegal Case 3: Convert when Core pool is hard-capped at 10
    state.player.corePool = 10;
    const check4 = validateAction(state, legalAction);
    assert(check4.valid === false && check4.errorCode === 'ERR_CORE_CAP_EXCEEDED', 'Illegal Case 3: Rejects conversion when Core pool is at 10 hard cap');
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 3: CARD CASTING & PACE GATING (Legal vs 3 Illegal Cases)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 3: Card Casting & Pace Gating ---');
  {
    const pace1Card: Card = { id: 'p1_card', name: 'Low Pace Unit', load: 2, pace: 1, type: 'being', svgArtId: 't', description: 't' };
    const pace5Card: Card = { id: 'p5_card', name: 'High Pace Unit', load: 4, pace: 5, type: 'being', svgArtId: 't', description: 't' };

    let state = { ...initialState };
    state.turnNumber = 1;
    state.player.corePool = 5;
    state.player.hand = [
      { card: pace1Card, drawnThisTurn: false },
      { card: pace5Card, drawnThisTurn: false },
    ];

    // Happy Path: Cast Pace 1 card on Turn 1 with enough Core
    const legalCast: GameAction = { type: 'PLAY_CARD', playerId: 'player', cardId: pace1Card.id };
    const check1 = validateAction(state, legalCast);
    assert(check1.valid === true, 'Legal Cast: Pace 1 card castable on Turn 1');

    // Illegal Case 1: Pace Gated (Cast Pace 5 card on Turn 1)
    const illegalPaceCast: GameAction = { type: 'PLAY_CARD', playerId: 'player', cardId: pace5Card.id };
    const check2 = validateAction(state, illegalPaceCast);
    assert(check2.valid === false && check2.errorCode === 'ERR_PACE_GATED', 'Illegal Case 1: Rejects Pace 5 card cast on Turn 1 without Expedite');

    // Illegal Case 2: Insufficient Core Load
    state.player.corePool = 1;
    const check3 = validateAction(state, legalCast);
    assert(check3.valid === false && check3.errorCode === 'ERR_INSUFFICIENT_CORE', 'Illegal Case 2: Rejects cast when Core pool < Load cost');

    // Illegal Case 3: Card not in hand
    const illegalCardIdCast: GameAction = { type: 'PLAY_CARD', playerId: 'player', cardId: 'non_existent_card' };
    const check4 = validateAction(state, illegalCardIdCast);
    assert(check4.valid === false && check4.errorCode === 'ERR_NOT_IN_ZONE', 'Illegal Case 3: Rejects cast when card is not present in hand');
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 4: GUARD KEYWORD INTERCEPTION & COMBAT PIPELINE
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 4: Guard Keyword Interception & Combat ---');
  {
    const attackerCard: Card = { id: 'attacker_1', name: 'Iron Sentinel', load: 2, pace: 1, type: 'being', edge: 3, grit: 4, attackCoreCost: 1, svgArtId: 't', description: 't' };
    const guardCard: Card = { id: 'guard_1', name: 'Shield Wall', load: 2, pace: 1, type: 'being', edge: 1, grit: 5, isGuard: true, svgArtId: 't', description: 't' };

    let state = { ...initialState };
    state.phase = 'combat';
    state.player.corePool = 5;

    state.player.field = [
      { instanceId: 'att_inst_1', card: attackerCard, currentEdge: 3, currentGrit: 4, maxGrit: 4, state: 'alert', bankedCore: 0, attachments: [], isGuard: false },
    ];
    state.opponent.field = [
      { instanceId: 'guard_inst_1', card: guardCard, currentEdge: 1, currentGrit: 5, maxGrit: 5, state: 'alert', bankedCore: 0, attachments: [], isGuard: true },
    ];

    // Illegal Case 1: Attempting to attack Nexus while Opponent controls Alert Guard unit!
    const illegalNexusAttack: GameAction = { type: 'DECLARE_ATTACKER', playerId: 'player', attackerInstanceId: 'att_inst_1', targetId: 'nexus' };
    const check1 = validateAction(state, illegalNexusAttack);
    assert(check1.valid === false && check1.errorCode === 'ERR_GUARD_INTERCEPTION_REQUIRED', 'Illegal Attack: Guard Interception blocks direct Nexus attack');

    // Happy Path: Attack Guard unit
    const legalGuardAttack: GameAction = { type: 'DECLARE_ATTACKER', playerId: 'player', attackerInstanceId: 'att_inst_1', targetId: 'guard_inst_1' };
    const check2 = validateAction(state, legalGuardAttack);
    assert(check2.valid === true, 'Legal Attack: Targeting opponent Guard unit passes validation');

    const state2 = executeValidatedAction(state, legalGuardAttack);
    assert(state2.opponent.field[0].currentGrit === 2, 'Simultaneous Damage: Guard unit grit reduced (5 - 3 = 2)');
    assert(state2.player.field[0].currentGrit === 3, 'Simultaneous Damage: Attacker grit reduced by blocker edge (4 - 1 = 3)');
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 5: PRIMAL HEAD-REMOVAL 50% ELIMINATION THRESHOLD
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 5: Primal Head-Removal 50% Elimination ---');
  {
    const primalAvatarCard: Card = { id: 'gluttrix_avatar', name: 'Gluttrix Corefeaster', load: 0, pace: 0, type: 'primal_avatar', isPrimal: true, edge: 10, grit: 10, svgArtId: 't', description: 't' };

    let state = createInitialGameState();
    state.phase = 'combat';
    state.opponent.startingLife = 20;
    state.opponent.lifeTotal = 20;
    state.player.corePool = 5;

    state.player.field = [
      { instanceId: 'primal_att_1', card: primalAvatarCard, currentEdge: 10, currentGrit: 10, maxGrit: 10, state: 'alert', bankedCore: 0, attachments: [], isGuard: false },
    ];

    const primalNexusAttack: GameAction = { type: 'DECLARE_ATTACKER', playerId: 'player', attackerInstanceId: 'primal_att_1', targetId: 'nexus' };
    const check5 = validateAction(state, primalNexusAttack);
    assert(check5.valid === true, 'Legal Primal Attack: Direct Nexus attack legal when no enemy Guard units exist');

    const state2 = executeValidatedAction(state, primalNexusAttack);

    assert(state2.opponent.lifeTotal === 0, 'Primal Head-Removal: 10 Primal Damage (50% of 20 HP) instantly eliminates opponent (0 HP)');
    assert(state2.winner === 'player', 'Primal Head-Removal: Player declared match winner');
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 6: AI TURN PROGRESSION & HANDBACK
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 6: AI Turn Progression & Handback ---');
  {
    let state = createInitialGameState();
    state.turnOwner = 'opponent';
    state.phase = 'conversion';

    // Run AI turn steps until control passes back to player or max iterations (20)
    let iterations = 0;
    while (state.turnOwner === 'opponent' && !state.winner && iterations < 20) {
      const nextState = runAiTurnStep(state);
      if (nextState === state) {
        state = endTurn(state);
      } else {
        state = nextState;
      }
      iterations++;
    }

    assert(state.turnOwner === 'player', 'AI turn completes and hands control back to player');
    assert(iterations < 20, 'AI turn completes in finite steps without infinite loop');
  }

  console.log('\n======================================================');
  console.log(`TEST SUITE COMPLETE: ${passCount} / ${testCount} TESTS PASSED`);
  console.log('======================================================\n');

  return passCount === testCount;
}
