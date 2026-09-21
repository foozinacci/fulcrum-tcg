import { Card } from '../types/game';

export const GLUTTRIX_COREFEASTER: Card = {
  id: 'primal_gluttrix_01',
  name: 'Gluttrix, Corefeaster',
  load: 4,
  pace: 6,
  type: 'primal_avatar',
  pact: 'Corefeast',
  colors: ['amber', 'green'],
  isPrimal: true,
  edge: 5,
  grit: 2,
  coreAttackRatio: 1.5,
  description: 'Ability 1: Your Core cap is increased +5. Draw +1 extra card at turn start. Ability 2: Pay 3 Core: Tutor a Relic or Rune into hand (1x/turn).',
  flavorText: 'An insatiable celestial devourer feasting on raw Core essence.',
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
  pace: 4,
  type: 'primal_avatar',
  pact: 'Ironbound',
  colors: ['amber', 'red'],
  isPrimal: true,
  edge: 0,
  grit: 0,
  isDynamicStats: true,
  coreAttackRatio: 1.5,
  description: "Ability 1: Edge & Grit equal unused Core pool (*/*). Ability 2: Sacrifice an Attachment to tutor an Attachment (Load <= sacrificed Core) & attach to Vorrath (1x/turn).",
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

export const NYSSARA_VOIDHALLOWER: Card = {
  id: 'primal_nyssara_03',
  name: 'Nyssara, Voidhallower',
  load: 2,
  pace: 5,
  type: 'primal_avatar',
  pact: 'Voidhallow',
  colors: ['purple', 'amber'],
  isPrimal: true,
  edge: 2,
  grit: 5,
  coreAttackRatio: 1.5,
  description: 'Ability 1: Whenever an opponent converts a card for Core, siphon 2 Core from them. Ability 2: Pay 3 Core: Target player converts top card of deck for its Core value.',
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
  pace: 3,
  type: 'primal_avatar',
  pact: 'Charmbrand',
  colors: ['purple', 'red'],
  isPrimal: true,
  edge: 4,
  grit: 3,
  coreAttackRatio: 1.5,
  description: 'Ability 1: Converting a Charm lets you cast it from graveyard that turn, then exile it. Ability 2: Casting a Charm after Grothmaw deals combat damage to a player copies that Charm.',
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

export const KAZRITH_RUNESCALE: Card = {
  id: 'primal_kazrith_05',
  name: 'Kazrith, Runescale',
  load: 1,
  pace: 2,
  type: 'primal_avatar',
  pact: 'Runescale',
  colors: ['green', 'red'],
  isPrimal: true,
  edge: 2,
  grit: 2,
  coreAttackRatio: 1.5,
  description: 'Ability 1: Other Beings enter play Alert instead of Dormant. Ability 2: Whenever a Rune is exhausted for Core, your Beings gain +1 Edge & +1 Grit until end of turn.',
  flavorText: 'A swift draconic predator whose scales resonate with every exhausted Rune.',
  imageArtUrl: '/assets/kazrith.jpg',
  svgArtId: 'sol_herald',
  ability: {
    trigger: 'onSummon',
    description: 'Other Beings enter play Alert instead of Dormant.',
  },
  ability2: {
    trigger: 'activated',
    description: 'Exhausting a Rune grants +1 Edge and +1 Grit to your Beings until end of turn.',
  },
};

export const KHARV_ROTWATCH: Card = {
  id: 'primal_kharv_06',
  name: 'Kharv, Rotwatch',
  load: 1,
  pace: 1,
  type: 'primal_avatar',
  pact: 'Rotwatch',
  colors: ['purple', 'green'],
  isPrimal: true,
  edge: 1,
  grit: 1,
  coreAttackRatio: 1.5,
  description: 'Ability 1: Convert any card from hand into Core (bypasses turn-drawn rule). Ability 2: Pay X Core (X = Load) to cast any card from graveyard (exiled on resolution or death).',
  flavorText: 'An ancient multi-eyed watcher watching over the cycle of rot and rebirth.',
  imageArtUrl: '/assets/kharv.jpg',
  svgArtId: 'umbra_weaver',
  ability: {
    trigger: 'activated',
    description: 'Convert any hand card into Core anytime during conversion phase.',
  },
  ability2: {
    trigger: 'activated',
    description: 'Pay X Core (X = Load) to cast any card from graveyard (exiled on death or resolution).',
  },
};

export const PRIMAL_AVATARS_LIST: Card[] = [
  GLUTTRIX_COREFEASTER,
  VORRATH_IRONBOUND,
  NYSSARA_VOIDHALLOWER,
  GROTHMAW_CHARMBRANDED,
  KAZRITH_RUNESCALE,
  KHARV_ROTWATCH,
];

export const CARD_DATABASE: Card[] = [
  ...PRIMAL_AVATARS_LIST,
];

export const PLAYABLE_SPELLS: Card[] = [
  {
    id: 'f_01',
    name: 'Core Scout',
    load: 1,
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
    expediteLoad: 4,
    coreValue: 1,
    pace: 1,
    type: 'charm',
    description: 'Pace 1 CHARM (Expedite 4). Counter target Charm or ability.',
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
  {
    id: 'f_05',
    name: 'Line Sentinel',
    load: 2,
    coreValue: 2,
    pace: 2,
    type: 'being',
    isGuard: true,
    edge: 2,
    grit: 4,
    coreAttackRatio: 1.0,
    description: 'Pace 2 Being (GUARD). Protects non-guard allies.',
    svgArtId: 'umbra_weaver',
  },
  {
    id: 'f_06',
    name: 'Pace-2 Siphon Counter',
    load: 3,
    expediteLoad: 5,
    coreValue: 1,
    pace: 2,
    type: 'charm',
    description: 'Pace 2 CHARM (Expedite 5). Counter spell and gain +2 Core.',
    ability: {
      trigger: 'counterspell',
      description: 'Counter & gain +2 Core',
      produceCore: 2,
    },
    svgArtId: 'sol_spell',
  },
  {
    id: 'f_07',
    name: 'Plasma Blade',
    load: 3,
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
    svgArtId: 'sol_herald',
  },
  {
    id: 'f_08',
    name: 'Core Siphon Relic',
    load: 3,
    coreValue: 2,
    pace: 2,
    type: 'relic',
    description: 'Pace 2 RELIC. Persistent relic object.',
    svgArtId: 'neutral_relic',
  },
  {
    id: 'f_09',
    name: 'Heavy Juggernaut',
    load: 4,
    coreValue: 3,
    pace: 3,
    type: 'being',
    edge: 4,
    grit: 5,
    coreAttackRatio: 1.25,
    description: 'Pace 3 Being. Heavy frontline bruiser.',
    svgArtId: 'umbra_weaver',
  },
];

export const STARTER_DECK_A: Card[] = [
  PLAYABLE_SPELLS[0], PLAYABLE_SPELLS[0], PLAYABLE_SPELLS[0], // Core Scout x3
  PLAYABLE_SPELLS[1], PLAYABLE_SPELLS[1],                   // Pace 1 Counter x2
  PLAYABLE_SPELLS[2], PLAYABLE_SPELLS[2],                   // Iron Armor x2
  PLAYABLE_SPELLS[3], PLAYABLE_SPELLS[3], PLAYABLE_SPELLS[3], // Rune of Extraction x3
  PLAYABLE_SPELLS[4], PLAYABLE_SPELLS[4],                   // Line Sentinel x2
  PLAYABLE_SPELLS[5], PLAYABLE_SPELLS[5],                   // Pace 2 Counter x2
  PLAYABLE_SPELLS[6], PLAYABLE_SPELLS[6],                   // Plasma Blade x2
  PLAYABLE_SPELLS[7], PLAYABLE_SPELLS[7],                   // Core Siphon Relic x2
  PLAYABLE_SPELLS[8], PLAYABLE_SPELLS[8],                   // Heavy Juggernaut x2
];

export const STARTER_DECK_B: Card[] = [
  PLAYABLE_SPELLS[0], PLAYABLE_SPELLS[0],
  PLAYABLE_SPELLS[2], PLAYABLE_SPELLS[2], PLAYABLE_SPELLS[2],
  PLAYABLE_SPELLS[3], PLAYABLE_SPELLS[3],
  PLAYABLE_SPELLS[4], PLAYABLE_SPELLS[4], PLAYABLE_SPELLS[4],
  PLAYABLE_SPELLS[6], PLAYABLE_SPELLS[6], PLAYABLE_SPELLS[6],
  PLAYABLE_SPELLS[7], PLAYABLE_SPELLS[7],
  PLAYABLE_SPELLS[8], PLAYABLE_SPELLS[8], PLAYABLE_SPELLS[8],
];
