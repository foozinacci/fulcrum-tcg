import { Card } from '../types/game';

export const PRIMAL_AVATAR_A: Card = {
  id: 'primal_avatar_01',
  name: 'Vanguard Archon',
  load: 6,
  expediteLoad: 8,
  coreValue: 4,
  pace: 1,
  type: 'primal_avatar',
  isPrimal: true,
  edge: 5,
  grit: 6,
  coreAttackRatio: 1.5,
  description: 'PRIMAL AVATAR (61st Slot). Attacks deal Primal Damage (Eliminates target at half starting life). Turn Start: +2 Core.',
  flavorText: 'The supreme commander of the frontline.',
  ability: {
    trigger: 'onTurnStart',
    description: 'Gain +2 Core',
  },
  svgArtId: 'sol_hero',
};

export const PRIMAL_AVATAR_B: Card = {
  id: 'primal_avatar_02',
  name: 'Titan of the Core',
  load: 6,
  expediteLoad: 8,
  coreValue: 4,
  pace: 1,
  type: 'primal_avatar',
  isPrimal: true,
  edge: 6,
  grit: 5,
  coreAttackRatio: 1.5,
  description: 'PRIMAL AVATAR (61st Slot). Attacks deal Primal Damage. On Attack: Drain 1 Life from target.',
  flavorText: 'An ancient leviathan powered by pure Core energy.',
  ability: {
    trigger: 'onAttack',
    description: 'Drain 1 Life',
  },
  svgArtId: 'umbra_hero',
};

export const CARD_DATABASE: Card[] = [
  // --- PACE 1 CARDS ---
  {
    id: 'f_01',
    name: 'Core Scout',
    load: 1,
    expediteLoad: 3,
    coreValue: 2,
    pace: 1,
    type: 'being',
    edge: 2,
    grit: 1,
    coreAttackRatio: 1.0,
    description: 'Pace 1 Being. Fast vanguard scout.',
    flavorText: 'Scouting out Core rich deposits.',
    svgArtId: 'sol_herald',
  },
  {
    id: 'f_02',
    name: 'Pace-1 Nullifying Counter',
    load: 2,
    expediteLoad: 3,
    coreValue: 1,
    pace: 1,
    type: 'charm',
    description: 'Pace 1 CHARM (Expedite 3). Counter target Charm or ability.',
    ability: {
      trigger: 'counterspell',
      description: 'Counter target Charm',
    },
    svgArtId: 'sol_spell',
  },
  {
    id: 'f_03',
    name: 'Basic Iron Armor',
    load: 2,
    expediteLoad: 4,
    coreValue: 2,
    pace: 1,
    type: 'attachment',
    attachmentType: 'armor',
    description: 'Pace 1 ATTACHMENT (Armor). Grants +2 Grit (Defense) to attached Being.',
    ability: {
      trigger: 'onSummon',
      description: 'Buff +2 Grit',
      buffGrit: 2,
    },
    svgArtId: 'neutral_golem',
  },
  {
    id: 'f_04',
    name: 'Rune of Extraction',
    load: 2,
    expediteLoad: 4,
    coreValue: 3,
    pace: 1,
    type: 'rune',
    description: 'Pace 1 RUNE. Turn Start: Produces +2 Core while Alert.',
    ability: {
      trigger: 'onTurnStart',
      description: 'Produce +2 Core',
      produceCore: 2,
    },
    svgArtId: 'neutral_golem',
  },

  // --- PACE 2 CARDS ---
  {
    id: 'f_05',
    name: 'Line Sentinel',
    load: 3,
    expediteLoad: 5,
    coreValue: 2,
    pace: 2,
    type: 'being',
    edge: 2,
    grit: 4,
    coreAttackRatio: 1.0,
    description: 'Pace 2 Being. High Grit wall.',
    flavorText: 'Holding the line against aggressive pushes.',
    svgArtId: 'sol_sentinel',
  },
  {
    id: 'f_06',
    name: 'Pace-2 Disruption Counter',
    load: 3,
    expediteLoad: 4,
    coreValue: 2,
    pace: 2,
    type: 'charm',
    description: 'Pace 2 CHARM (Expedite 4). Counter target Charm or force opponent to discard a card.',
    ability: {
      trigger: 'counterspell',
      description: 'Counter Charm or Discard',
    },
    svgArtId: 'umbra_spell',
  },
  {
    id: 'f_07',
    name: 'Plasma Blade',
    load: 3,
    expediteLoad: 5,
    coreValue: 2,
    pace: 2,
    type: 'attachment',
    attachmentType: 'weapon',
    description: 'Pace 2 ATTACHMENT (Weapon). Grants +3 Edge (Offense) to attached Being.',
    ability: {
      trigger: 'onSummon',
      description: 'Buff +3 Edge',
      buffEdge: 3,
    },
    svgArtId: 'sol_hero',
  },
  {
    id: 'f_08',
    name: 'Core Siphon Relic',
    load: 3,
    expediteLoad: 5,
    coreValue: 2,
    pace: 2,
    type: 'relic',
    description: 'Pace 2 RELIC. On Summon: Draw 2 cards.',
    ability: {
      trigger: 'onSummon',
      description: 'Draw 2 cards',
      drawCards: 2,
    },
    svgArtId: 'neutral_relic',
  },

  // --- PACE 3 CARDS ---
  {
    id: 'f_09',
    name: 'Heavy Juggernaut',
    load: 4,
    expediteLoad: 6,
    coreValue: 3,
    pace: 3,
    type: 'being',
    edge: 4,
    grit: 5,
    coreAttackRatio: 1.25,
    description: 'Pace 3 Being. Heavy frontline bruiser.',
    svgArtId: 'umbra_weaver',
  },
  {
    id: 'f_10',
    name: 'Pace-3 Absorb Counter',
    load: 4,
    expediteLoad: 5,
    coreValue: 2,
    pace: 3,
    type: 'charm',
    description: 'Pace 3 CHARM (Expedite 5). Counter target cast and gain +3 Core.',
    ability: {
      trigger: 'counterspell',
      description: 'Counter cast & gain +3 Core',
      produceCore: 3,
    },
    svgArtId: 'sol_spell',
  },
  {
    id: 'f_11',
    name: 'Rune of Amplification',
    load: 4,
    expediteLoad: 6,
    coreValue: 2,
    pace: 3,
    type: 'rune',
    description: 'Pace 3 RUNE. Turn Start: Produces +3 Core while Alert.',
    ability: {
      trigger: 'onTurnStart',
      description: 'Produce +3 Core',
      produceCore: 3,
    },
    svgArtId: 'sol_prism',
  },

  // --- PACE 4 CARDS ---
  {
    id: 'f_12',
    name: 'Dreadnought Leviathan',
    load: 6,
    expediteLoad: 8,
    coreValue: 4,
    pace: 4,
    type: 'being',
    edge: 6,
    grit: 7,
    coreAttackRatio: 1.5,
    description: 'Pace 4 Being. Massive assault unit.',
    svgArtId: 'umbra_hero',
  },
];

export const STARTER_DECK_A: Card[] = [
  CARD_DATABASE[0], CARD_DATABASE[0], CARD_DATABASE[0], // Core Scout x3
  CARD_DATABASE[1], CARD_DATABASE[1],                   // Pace 1 Counter x2
  CARD_DATABASE[2], CARD_DATABASE[2],                   // Iron Armor x2
  CARD_DATABASE[3], CARD_DATABASE[3], CARD_DATABASE[3], // Rune of Extraction x3
  CARD_DATABASE[4], CARD_DATABASE[4],                   // Line Sentinel x2
  CARD_DATABASE[5], CARD_DATABASE[5],                   // Pace 2 Counter x2
  CARD_DATABASE[6], CARD_DATABASE[6],                   // Plasma Blade x2
  CARD_DATABASE[7], CARD_DATABASE[7],                   // Core Siphon Relic x2
  CARD_DATABASE[8], CARD_DATABASE[8],                   // Heavy Juggernaut x2
];

export const STARTER_DECK_B: Card[] = [
  CARD_DATABASE[0], CARD_DATABASE[0], CARD_DATABASE[0], // Core Scout x3
  CARD_DATABASE[1], CARD_DATABASE[1],                   // Pace 1 Counter x2
  CARD_DATABASE[3], CARD_DATABASE[3], CARD_DATABASE[3], // Rune of Extraction x3
  CARD_DATABASE[4], CARD_DATABASE[4],                   // Line Sentinel x2
  CARD_DATABASE[5], CARD_DATABASE[5],                   // Pace 2 Counter x2
  CARD_DATABASE[8], CARD_DATABASE[8], CARD_DATABASE[8], // Heavy Juggernaut x3
  CARD_DATABASE[9], CARD_DATABASE[9],                   // Pace 3 Counter x2
  CARD_DATABASE[10], CARD_DATABASE[10],                 // Rune of Amp x2
];
