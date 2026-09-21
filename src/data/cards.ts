import { Card } from '../types/game';

export const GLUTTRIX_CORESEEKER: Card = {
  id: 'primal_gluttrix_01',
  name: 'Gluttrix, Coreseeker',
  load: 4,
  expediteLoad: 7,
  pace: 6,
  type: 'primal_avatar',
  isPrimal: true,
  edge: 5,
  grit: 2,
  coreAttackRatio: 1.5,
  description: 'Pace 6. Ability 1: Draw +1 extra card at turn start. Ability 2: Pay 3 Core to Tutor a Relic or Rune (1x/turn).',
  flavorText: 'An insatiable celestial devourer feeding on the raw essence of the Core.',
  imageArtUrl: '/assets/gluttrix.jpg',
  svgArtId: 'gluttrix_art',
  ability: {
    trigger: 'onTurnStart',
    description: 'Draw 1 extra card at start of turn.',
    drawCards: 1,
  },
  ability2: {
    trigger: 'activated',
    description: 'Pay 3 Core: Tutor a Relic or Rune into hand.',
    tutorType: 'relic',
  },
};

export const VORRATH_IRONBOUND: Card = {
  id: 'primal_vorrath_02',
  name: 'Vorrath, Ironbound',
  load: 4,
  expediteLoad: 7,
  pace: 4,
  type: 'primal_avatar',
  isPrimal: true,
  edge: 0,
  grit: 0,
  isDynamicStats: true,
  coreAttackRatio: 1.5,
  description: "Pace 4. Ability 1: Edge & Grit equal unused Core pool (*/*). Ability 2: Sacrifice an Attachment to tutor an Attachment (Load <= sacrificed Core) & attach to Vorrath (1x/turn).",
  flavorText: 'Bound in cosmic iron, forging power directly from stored Core resonance.',
  imageArtUrl: '/assets/vorrath.jpg',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'onTurnStart',
    description: "Vorrath's Edge and Grit are each equal to your unused core value.",
  },
  ability2: {
    trigger: 'activated',
    description: 'Sacrifice an Attachment to tutor an Attachment with Load <= sacrificed Core value and attach to Vorrath.',
    tutorType: 'attachment',
  },
};

export const NYSSARA_HALLOWER: Card = {
  id: 'primal_nyssara_03',
  name: 'Nyssara, Hallower',
  load: 2,
  expediteLoad: 5,
  pace: 5,
  type: 'primal_avatar',
  isPrimal: true,
  edge: 2,
  grit: 5,
  coreAttackRatio: 1.5,
  description: 'Pace 5. Ability 1: Whenever an opponent converts a card for Core, siphon 2 Core from them. Ability 2: Pay 3 Core: Target player converts top card of deck for its Core value.',
  flavorText: 'A veiled weaver of sacred threads, siphoning raw essence from every conversion.',
  imageArtUrl: '/assets/nyssara.jpg',
  svgArtId: 'sol_herald',
  ability: {
    trigger: 'activated',
    description: 'Whenever an opponent converts a card for Core, siphon 2 Core from that player.',
  },
  ability2: {
    trigger: 'activated',
    description: 'Pay 3 Core: Target player converts the top card of their deck for its Core value.',
  },
};

export const GROTHMAW_CHARMBRANDED: Card = {
  id: 'primal_grothmaw_04',
  name: 'Grothmaw, Charmbranded',
  load: 4,
  expediteLoad: 6,
  pace: 3,
  type: 'primal_avatar',
  isPrimal: true,
  edge: 4,
  grit: 3,
  coreAttackRatio: 1.5,
  description: 'Pace 3. Ability 1: Converting a Charm lets you cast it from graveyard that turn, then exile it. Ability 2: Casting a Charm after Grothmaw deals combat damage to a player copies that Charm.',
  flavorText: 'A runic behemoth branded with ancient Charms, amplifying cast sorceries.',
  imageArtUrl: '/assets/grothmaw.jpg',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'activated',
    description: 'Cast Charms converted this turn from graveyard (exiled on cast).',
  },
  ability2: {
    trigger: 'activated',
    description: 'Copy Charms cast after Grothmaw deals combat damage to a player this turn.',
  },
};

export const PRIMAL_AVATARS_LIST: Card[] = [
  GLUTTRIX_CORESEEKER,
  VORRATH_IRONBOUND,
  NYSSARA_HALLOWER,
  GROTHMAW_CHARMBRANDED,
];

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
  CARD_DATABASE[0], CARD_DATABASE[0],
  CARD_DATABASE[2], CARD_DATABASE[2], CARD_DATABASE[2],
  CARD_DATABASE[3], CARD_DATABASE[3],
  CARD_DATABASE[4], CARD_DATABASE[4], CARD_DATABASE[4],
  CARD_DATABASE[6], CARD_DATABASE[6], CARD_DATABASE[6],
  CARD_DATABASE[7], CARD_DATABASE[7],
  CARD_DATABASE[8], CARD_DATABASE[8], CARD_DATABASE[8],
  CARD_DATABASE[9], CARD_DATABASE[9],
];
