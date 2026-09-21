import { Card } from '../types/game';

export const PRIMAL_AVATAR_SOL: Card = {
  id: 'primal_sol_01',
  name: 'Sol-Archon Apex',
  load: 6,
  expediteLoad: 8,
  coreValue: 4,
  pace: 1,
  faction: 'sol',
  type: 'primal_avatar',
  rarity: 'legendary',
  isPrimal: true,
  edge: 5,
  grit: 6,
  coreAttackRatio: 1.5,
  description: 'PRIMAL AVATAR (61st Slot). Attacks deal Primal Damage. Turn Start: Gain +2 Core.',
  flavorText: 'The eternal apex of solar order.',
  isGuard: true,
  ability: {
    trigger: 'onTurnStart',
    description: 'Gain +2 Core',
  },
  svgArtId: 'sol_hero',
};

export const PRIMAL_AVATAR_UMBRA: Card = {
  id: 'primal_umbra_01',
  name: 'Void Monarch Umbra',
  load: 6,
  expediteLoad: 8,
  coreValue: 4,
  pace: 1,
  faction: 'umbra',
  type: 'primal_avatar',
  rarity: 'legendary',
  isPrimal: true,
  edge: 6,
  grit: 5,
  coreAttackRatio: 1.5,
  description: 'PRIMAL AVATAR (61st Slot). Attacks deal Primal Damage. On Attack: Drain 1 Life from target.',
  flavorText: 'Ruler of the abyssal void.',
  ability: {
    trigger: 'onAttack',
    description: 'Drain 1 Life',
  },
  svgArtId: 'umbra_hero',
};

export const CARD_DATABASE: Card[] = [
  // --- SOL FACTION ---
  {
    id: 'sol_1',
    name: 'Dawn Vanguard',
    load: 2,
    expediteLoad: 4,
    coreValue: 2,
    pace: 1,
    faction: 'sol',
    type: 'being',
    rarity: 'common',
    edge: 2,
    grit: 2,
    description: 'Pace 1. On Conversion: +1 bonus Core.',
    flavorText: 'First to march into the light.',
    svgArtId: 'sol_herald',
  },
  {
    id: 'sol_2',
    name: 'Sunstone Wall',
    load: 3,
    expediteLoad: 5,
    coreValue: 1,
    pace: 1,
    faction: 'sol',
    type: 'being',
    rarity: 'common',
    edge: 1,
    grit: 4,
    isGuard: true,
    description: 'Pace 1. GUARD. High Grit defense.',
    flavorText: 'Forged from radiant granite.',
    svgArtId: 'sol_sentinel',
  },
  {
    id: 'sol_3',
    name: 'Solar Grace Charm',
    load: 2,
    expediteLoad: 4,
    coreValue: 2,
    pace: 2,
    faction: 'sol',
    type: 'charm',
    rarity: 'rare',
    description: 'Pace 2 CHARM. Restore 3 Life to your pool. Shift Fulcrum +1.',
    ability: {
      trigger: 'onSummon',
      description: 'Heal 3 Life',
      heal: 3,
      fulcrumShift: 1,
    },
    svgArtId: 'sol_spell',
  },
  {
    id: 'sol_4',
    name: 'Rune of Sol Zenith',
    load: 3,
    expediteLoad: 5,
    coreValue: 1,
    pace: 2,
    faction: 'sol',
    type: 'rune',
    rarity: 'rare',
    description: 'Pace 2 RUNE. Turn Start: Produce +2 Core while Alert.',
    ability: {
      trigger: 'onTurnStart',
      description: 'Produce +2 Core',
    },
    svgArtId: 'sol_prism',
  },
  {
    id: 'sol_5',
    name: 'Radiant Edge Blade',
    load: 3,
    expediteLoad: 4,
    coreValue: 2,
    pace: 3,
    faction: 'sol',
    type: 'attachment',
    rarity: 'epic',
    description: 'Pace 3 ATTACHMENT (Weapon). Grants +3 Edge to attached Being.',
    ability: {
      trigger: 'onSummon',
      description: 'Buff +3 Edge',
      buffEdge: 3,
    },
    svgArtId: 'sol_hero',
  },

  // --- UMBRA FACTION ---
  {
    id: 'umbra_1',
    name: 'Void Crawler',
    load: 1,
    expediteLoad: 3,
    coreValue: 2,
    pace: 1,
    faction: 'umbra',
    type: 'being',
    rarity: 'common',
    edge: 2,
    grit: 1,
    description: 'Pace 1. Fast offensive crawler.',
    flavorText: 'Hungry for raw Core.',
    svgArtId: 'umbra_weaver',
  },
  {
    id: 'umbra_2',
    name: 'Shadow Weaver',
    load: 3,
    expediteLoad: 5,
    coreValue: 2,
    pace: 2,
    faction: 'umbra',
    type: 'being',
    rarity: 'common',
    edge: 3,
    grit: 2,
    description: 'Pace 2. On Summon: Shift Fulcrum -1.',
    ability: {
      trigger: 'onSummon',
      description: 'Shift Fulcrum -1',
      fulcrumShift: -1,
    },
    svgArtId: 'umbra_weaver',
  },
  {
    id: 'umbra_3',
    name: 'Void Spike Charm',
    load: 2,
    expediteLoad: 3,
    coreValue: 2,
    pace: 1,
    faction: 'umbra',
    type: 'charm',
    rarity: 'common',
    description: 'Pace 1 CHARM (Expedite 3). Deal 3 damage to target Being.',
    ability: {
      trigger: 'onSummon',
      description: 'Deal 3 damage',
      damage: 3,
      fulcrumShift: -1,
    },
    svgArtId: 'umbra_spell',
  },
  {
    id: 'umbra_4',
    name: 'Rune of Entropy',
    load: 3,
    expediteLoad: 5,
    coreValue: 1,
    pace: 2,
    faction: 'umbra',
    type: 'rune',
    rarity: 'rare',
    description: 'Pace 2 RUNE. Turn Start: Deal 1 damage to enemy Life.',
    ability: {
      trigger: 'onTurnStart',
      description: 'Deal 1 damage to enemy',
      damage: 1,
    },
    svgArtId: 'umbra_relic',
  },

  // --- NEUTRAL FACTION ---
  {
    id: 'neu_1',
    name: 'Aether Core Engine',
    load: 2,
    expediteLoad: 4,
    coreValue: 3,
    pace: 1,
    faction: 'neutral',
    type: 'rune',
    rarity: 'common',
    description: 'Pace 1. High Core conversion value (3 Core).',
    svgArtId: 'neutral_golem',
  },
  {
    id: 'neu_2',
    name: 'Clockwork Guardian',
    load: 3,
    expediteLoad: 5,
    coreValue: 2,
    pace: 2,
    faction: 'neutral',
    type: 'being',
    rarity: 'common',
    edge: 2,
    grit: 3,
    isGuard: true,
    description: 'Pace 2. GUARD.',
    svgArtId: 'neutral_golem',
  },
  {
    id: 'neu_3',
    name: 'Fulcrum Relic Pillar',
    load: 4,
    expediteLoad: 6,
    coreValue: 2,
    pace: 3,
    faction: 'neutral',
    type: 'relic',
    rarity: 'epic',
    description: 'Pace 3 RELIC. On Summon: Draw 2 cards.',
    ability: {
      trigger: 'onSummon',
      description: 'Draw 2 cards',
      drawCards: 2,
    },
    svgArtId: 'neutral_relic',
  },
];

export const STARTER_DECK_SOL: Card[] = [
  CARD_DATABASE[0], CARD_DATABASE[0], CARD_DATABASE[0], // Dawn Vanguard x3
  CARD_DATABASE[1], CARD_DATABASE[1], CARD_DATABASE[1], // Sunstone Wall x3
  CARD_DATABASE[2], CARD_DATABASE[2],                   // Solar Grace Charm x2
  CARD_DATABASE[3], CARD_DATABASE[3],                   // Rune of Sol Zenith x2
  CARD_DATABASE[4],                                     // Radiant Edge Blade x1
  CARD_DATABASE[9], CARD_DATABASE[9], CARD_DATABASE[9], // Aether Core Engine x3
  CARD_DATABASE[10], CARD_DATABASE[10],                 // Clockwork Guardian x2
  CARD_DATABASE[11],                                    // Fulcrum Relic Pillar x1
];

export const STARTER_DECK_UMBRA: Card[] = [
  CARD_DATABASE[5], CARD_DATABASE[5], CARD_DATABASE[5], // Void Crawler x3
  CARD_DATABASE[6], CARD_DATABASE[6], CARD_DATABASE[6], // Shadow Weaver x3
  CARD_DATABASE[7], CARD_DATABASE[7],                   // Void Spike Charm x2
  CARD_DATABASE[8], CARD_DATABASE[8],                   // Rune of Entropy x2
  CARD_DATABASE[9], CARD_DATABASE[9], CARD_DATABASE[9], // Aether Core Engine x3
  CARD_DATABASE[10], CARD_DATABASE[10],                 // Clockwork Guardian x2
  CARD_DATABASE[11],                                    // Fulcrum Relic Pillar x1
];
