import { Card } from '../types/game';

export const GLUTTRIX_COREFEASTER: Card = {
  id: 'primal_gluttrix_01',
  name: 'Gluttrix, Corefeaster',
  load: 4,
  pace: 6,
  type: 'primal_avatar',
  rarity: 'primal',
  pact: 'Corefeast',
  colors: ['amber', 'green'],
  isPrimal: true,
  edge: 5,
  grit: 2,
  coreAttackRatio: 1.5,
  description: "Your Core cap is increased +5. Each player draws an additional card at the beginning of each of their turns.\nPay 3 Core: Tutor a Relic or Rune and put it into your hand. This ability may only be exhausted once per turn.",
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
  rarity: 'primal',
  pact: 'Ironbound',
  colors: ['amber', 'red'],
  isPrimal: true,
  edge: 0,
  grit: 0,
  isDynamicStats: true,
  coreAttackRatio: 1.5,
  description: "Vorrath's Edge and Grit are each equal to your unused core value.\nSacrifice an Attachment you control to tutor for an Attachment with Load less than or equal to its Core value and attach it to Vorrath. Exhaust this only once per turn.",
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
  rarity: 'primal',
  pact: 'Voidhallow',
  colors: ['purple', 'amber'],
  isPrimal: true,
  edge: 2,
  grit: 5,
  coreAttackRatio: 1.5,
  description: "Whenever an opponent converts a card for core, siphon 2 core from that player.\nPay 3 core: Target player converts the top card of their deck for its core value.",
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
  rarity: 'primal',
  pact: 'Charmbrand',
  colors: ['purple', 'red'],
  isPrimal: true,
  edge: 4,
  grit: 3,
  coreAttackRatio: 1.5,
  description: "Whenever you convert a Charm for Core, you may cast that Charm from the graveyard that turn, then remove it from the game.\nWhenever you cast a Charm after this deals combat damage to a player, you may copy that Charm.",
  flavorText: 'A runic behemoth branded with ancient Charms, amplifying cast sorceries.',
  imageArtUrl: '/assets/grothmaw.jpg',
  imageObjectPosition: 'object-[center_15%]',
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
  rarity: 'primal',
  pact: 'Runescale',
  colors: ['green', 'red'],
  isPrimal: true,
  edge: 2,
  grit: 2,
  coreAttackRatio: 1.5,
  description: "Other Beings you control enter play Alert instead of Dormant.\nWhenever you exhaust a Rune for Core, Beings you control get +1 Edge and +1 Grit until end of turn.",
  flavorText: 'A swift draconic predator whose scales resonate with every exhausted Rune.',
  imageArtUrl: '/assets/kazrith.jpg',
  imageObjectPosition: 'object-[center_15%]',
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
  rarity: 'primal',
  pact: 'Rotwatch',
  colors: ['purple', 'green'],
  isPrimal: true,
  edge: 1,
  grit: 1,
  coreAttackRatio: 1.5,
  description: "Instead of converting the cards from the top of your deck you may discard cards from your hand to convert into core.\nPay X Core to cast something from your discard pile where X is equal to its Load. Remove it from the game if it dies or after it resolves.",
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

// --- 6 PACT RELICS (PACE 2, LOAD 2, CORE 2) ---
export const COREFEAST_TOTEM: Card = {
  id: 'relic_corefeast_01',
  name: 'Corefeast Totem',
  load: 2,
  pace: 2,
  coreValue: 2,
  type: 'relic',
  rarity: 'uncommon',
  pact: 'Corefeast',
  colors: ['amber', 'green'],
  description: 'First Corefeast spell each turn with Load 3+ costs 1 less.',
  svgArtId: 'neutral_relic',
  ability: {
    trigger: 'static',
    description: 'First Corefeast spell each turn with Load 3+ costs 1 less.',
  },
};

export const IRONBOUND_TOTEM: Card = {
  id: 'relic_ironbound_02',
  name: 'Ironbound Totem',
  load: 2,
  pace: 2,
  coreValue: 2,
  type: 'relic',
  rarity: 'uncommon',
  pact: 'Ironbound',
  colors: ['amber', 'red'],
  description: 'First Ironbound spell each turn with Load 3+ costs 1 less.',
  svgArtId: 'neutral_relic',
  ability: {
    trigger: 'static',
    description: 'First Ironbound spell each turn with Load 3+ costs 1 less.',
  },
};

export const VOIDHALLOW_TOTEM: Card = {
  id: 'relic_voidhallow_03',
  name: 'Voidhallow Totem',
  load: 2,
  pace: 2,
  coreValue: 2,
  type: 'relic',
  rarity: 'rare',
  pact: 'Voidhallow',
  colors: ['purple', 'amber'],
  description: 'First Voidhallow spell each turn with Load 3+ costs 1 less.',
  svgArtId: 'neutral_relic',
  ability: {
    trigger: 'static',
    description: 'First Voidhallow spell each turn with Load 3+ costs 1 less.',
  },
};

export const CHARMBRAND_TOTEM: Card = {
  id: 'relic_charmbrand_04',
  name: 'Charmbrand Totem',
  load: 2,
  pace: 2,
  coreValue: 2,
  type: 'relic',
  rarity: 'rare',
  pact: 'Charmbrand',
  colors: ['purple', 'red'],
  description: 'First Charmbrand spell each turn with Load 3+ costs 1 less.',
  svgArtId: 'neutral_relic',
  ability: {
    trigger: 'static',
    description: 'First Charmbrand spell each turn with Load 3+ costs 1 less.',
  },
};

export const RUNESCALE_TOTEM: Card = {
  id: 'relic_runescale_05',
  name: 'Runescale Totem',
  load: 2,
  pace: 2,
  coreValue: 2,
  type: 'relic',
  rarity: 'common',
  pact: 'Runescale',
  colors: ['green', 'red'],
  description: 'First Runescale spell each turn with Load 3+ costs 1 less.',
  svgArtId: 'neutral_relic',
  ability: {
    trigger: 'static',
    description: 'First Runescale spell each turn with Load 3+ costs 1 less.',
  },
};

export const ROTWATCH_TOTEM: Card = {
  id: 'relic_rotwatch_06',
  name: 'Rotwatch Totem',
  load: 2,
  pace: 2,
  coreValue: 2,
  type: 'relic',
  rarity: 'common',
  pact: 'Rotwatch',
  colors: ['purple', 'green'],
  description: 'First Rotwatch spell each turn with Load 3+ costs 1 less.',
  svgArtId: 'neutral_relic',
  ability: {
    trigger: 'static',
    description: 'First Rotwatch spell each turn with Load 3+ costs 1 less.',
  },
};

export const PACT_RELICS_LIST: Card[] = [
  COREFEAST_TOTEM,
  IRONBOUND_TOTEM,
  VOIDHALLOW_TOTEM,
  CHARMBRAND_TOTEM,
  RUNESCALE_TOTEM,
  ROTWATCH_TOTEM,
];

// --- 6 PACT RUNES (PACE 2, LOAD 2, CORE 2) ---
export const COREFEAST_INCANTATION: Card = {
  id: 'rune_corefeast_01',
  name: 'Corefeast Incantation',
  load: 2,
  pace: 2,
  coreValue: 2,
  type: 'rune',
  rarity: 'common',
  pact: 'Corefeast',
  colors: ['amber', 'green'],
  description: 'Generates 1 Core each of your turns.\nSacrifice: return a Corefeast spell from discard to hand.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'onTurnStart',
    description: 'Generates 1 Core each of your turns.',
    produceCore: 1,
  },
  ability2: {
    trigger: 'activated',
    description: 'Sacrifice: return a Corefeast spell from discard to hand.',
  },
};

export const IRONBOUND_INCANTATION: Card = {
  id: 'rune_ironbound_02',
  name: 'Ironbound Incantation',
  load: 2,
  pace: 2,
  coreValue: 2,
  type: 'rune',
  rarity: 'common',
  pact: 'Ironbound',
  colors: ['amber', 'red'],
  description: 'Generates 1 Core each of your turns.\nSacrifice: return an Ironbound spell from discard to hand.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'onTurnStart',
    description: 'Generates 1 Core each of your turns.',
    produceCore: 1,
  },
  ability2: {
    trigger: 'activated',
    description: 'Sacrifice: return an Ironbound spell from discard to hand.',
  },
};

export const VOIDHALLOW_INCANTATION: Card = {
  id: 'rune_voidhallow_03',
  name: 'Voidhallow Incantation',
  load: 2,
  pace: 2,
  coreValue: 2,
  type: 'rune',
  rarity: 'uncommon',
  pact: 'Voidhallow',
  colors: ['purple', 'amber'],
  description: 'Generates 1 Core each of your turns.\nSacrifice: return a Voidhallow spell from discard to hand.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'onTurnStart',
    description: 'Generates 1 Core each of your turns.',
    produceCore: 1,
  },
  ability2: {
    trigger: 'activated',
    description: 'Sacrifice: return a Voidhallow spell from discard to hand.',
  },
};

export const CHARMBRAND_INCANTATION: Card = {
  id: 'rune_charmbrand_04',
  name: 'Charmbrand Incantation',
  load: 2,
  pace: 2,
  coreValue: 2,
  type: 'rune',
  rarity: 'uncommon',
  pact: 'Charmbrand',
  colors: ['purple', 'red'],
  description: 'Generates 1 Core each of your turns.\nSacrifice: return a Charmbrand spell from discard to hand.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'onTurnStart',
    description: 'Generates 1 Core each of your turns.',
    produceCore: 1,
  },
  ability2: {
    trigger: 'activated',
    description: 'Sacrifice: return a Charmbrand spell from discard to hand.',
  },
};

export const RUNESCALE_INCANTATION: Card = {
  id: 'rune_runescale_05',
  name: 'Runescale Incantation',
  load: 2,
  pace: 2,
  coreValue: 2,
  type: 'rune',
  rarity: 'rare',
  pact: 'Runescale',
  colors: ['green', 'red'],
  description: 'Generates 1 Core each of your turns.\nSacrifice: return a Runescale spell from discard to hand.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'onTurnStart',
    description: 'Generates 1 Core each of your turns.',
    produceCore: 1,
  },
  ability2: {
    trigger: 'activated',
    description: 'Sacrifice: return a Runescale spell from discard to hand.',
  },
};

export const ROTWATCH_INCANTATION: Card = {
  id: 'rune_rotwatch_06',
  name: 'Rotwatch Incantation',
  load: 2,
  pace: 2,
  coreValue: 2,
  type: 'rune',
  rarity: 'rare',
  pact: 'Rotwatch',
  colors: ['purple', 'green'],
  description: 'Generates 1 Core each of your turns.\nSacrifice: return a Rotwatch spell from discard to hand.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'onTurnStart',
    description: 'Generates 1 Core each of your turns.',
    produceCore: 1,
  },
  ability2: {
    trigger: 'activated',
    description: 'Sacrifice: return a Rotwatch spell from discard to hand.',
  },
};

export const PACT_RUNES_LIST: Card[] = [
  COREFEAST_INCANTATION,
  IRONBOUND_INCANTATION,
  VOIDHALLOW_INCANTATION,
  CHARMBRAND_INCANTATION,
  RUNESCALE_INCANTATION,
  ROTWATCH_INCANTATION,
];

// ============================================================
// BEINGS — 6 per Pact × 6 stat tiers = 36 total
// ============================================================

// --- COREFEAST BEINGS (amber, green) ---
export const BEING_COREFEAST_01: Card = {
  id: 'being_corefeast_01',
  name: 'Ambervine Sprout',
  load: 1, pace: 1, coreValue: 1,
  type: 'being', rarity: 'common',
  pact: 'Corefeast', colors: ['amber', 'green'],
  edge: 1, grit: 1,
  description: 'A tender shoot that hungers for Core essence.',
  svgArtId: 'neutral_golem',
};

export const BEING_COREFEAST_02: Card = {
  id: 'being_corefeast_02',
  name: 'Coreguzzler Hound',
  load: 2, pace: 2, coreValue: 2,
  type: 'being', rarity: 'common',
  pact: 'Corefeast', colors: ['amber', 'green'],
  edge: 2, grit: 2,
  description: 'A ravenous hound that feeds on ambient Core runoff.',
  svgArtId: 'neutral_golem',
};

export const BEING_COREFEAST_03: Card = {
  id: 'being_corefeast_03',
  name: 'Verdant Warden',
  load: 3, pace: 2, coreValue: 2,
  type: 'being', rarity: 'uncommon',
  pact: 'Corefeast', colors: ['amber', 'green'],
  edge: 3, grit: 2,
  isGuard: true,
  description: 'Guard. Stands between allies and destruction, fueled by Core growth.',
  svgArtId: 'neutral_golem',
};

export const BEING_COREFEAST_04: Card = {
  id: 'being_corefeast_04',
  name: 'Feastwall Sentinel',
  load: 3, pace: 3, coreValue: 2,
  type: 'being', rarity: 'uncommon',
  pact: 'Corefeast', colors: ['amber', 'green'],
  edge: 2, grit: 4,
  description: 'Alert. This sentinel stands ever-ready, pulsing with stored Core energy.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Alert — enters play ready to block.',
  },
};

export const BEING_COREFEAST_05: Card = {
  id: 'being_corefeast_05',
  name: 'Embervein Ravager',
  load: 4, pace: 3, coreValue: 3,
  type: 'being', rarity: 'rare',
  pact: 'Corefeast', colors: ['amber', 'green'],
  edge: 4, grit: 3,
  description: 'Swift. Blazes through Core ley lines, outpacing most defenders.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Swift — may attack the turn it enters play.',
  },
};

export const BEING_COREFEAST_06: Card = {
  id: 'being_corefeast_06',
  name: 'Gluttrix Broodlord',
  load: 5, pace: 4, coreValue: 3,
  type: 'being', rarity: 'rare',
  pact: 'Corefeast', colors: ['amber', 'green'],
  edge: 5, grit: 5,
  description: 'Piercing. A colossal spawn of Gluttrix, its attacks punch through any defense.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Piercing — excess damage carries through to the opponent\'s nexus.',
  },
};

// --- IRONBOUND BEINGS (amber, red) ---
export const BEING_IRONBOUND_01: Card = {
  id: 'being_ironbound_01',
  name: 'Iron Pup',
  load: 1, pace: 1, coreValue: 1,
  type: 'being', rarity: 'common',
  pact: 'Ironbound', colors: ['amber', 'red'],
  edge: 1, grit: 1,
  description: 'A scrappy forge-hound still learning to smelt.',
  svgArtId: 'neutral_golem',
};

export const BEING_IRONBOUND_02: Card = {
  id: 'being_ironbound_02',
  name: 'Slagborn Grunt',
  load: 2, pace: 2, coreValue: 2,
  type: 'being', rarity: 'common',
  pact: 'Ironbound', colors: ['amber', 'red'],
  edge: 2, grit: 2,
  description: 'Forged from slag and red-hot Core, this grunt charges without hesitation.',
  svgArtId: 'neutral_golem',
};

export const BEING_IRONBOUND_03: Card = {
  id: 'being_ironbound_03',
  name: 'Furnace Bulwark',
  load: 3, pace: 2, coreValue: 2,
  type: 'being', rarity: 'uncommon',
  pact: 'Ironbound', colors: ['amber', 'red'],
  edge: 3, grit: 2,
  isGuard: true,
  description: 'Guard. A walking furnace that absorbs blows meant for weaker allies.',
  svgArtId: 'neutral_golem',
};

export const BEING_IRONBOUND_04: Card = {
  id: 'being_ironbound_04',
  name: 'Ironclad Vanguard',
  load: 3, pace: 3, coreValue: 2,
  type: 'being', rarity: 'uncommon',
  pact: 'Ironbound', colors: ['amber', 'red'],
  edge: 2, grit: 4,
  description: 'Alert. Always ready to intercept the next strike before it lands.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Alert — enters play ready to block.',
  },
};

export const BEING_IRONBOUND_05: Card = {
  id: 'being_ironbound_05',
  name: 'Redhot Striker',
  load: 4, pace: 3, coreValue: 3,
  type: 'being', rarity: 'rare',
  pact: 'Ironbound', colors: ['amber', 'red'],
  edge: 4, grit: 3,
  description: 'Swift. Strikes with the momentum of a freshly-forged blade.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Swift — may attack the turn it enters play.',
  },
};

export const BEING_IRONBOUND_06: Card = {
  id: 'being_ironbound_06',
  name: 'Vorrath\'s Colossus',
  load: 5, pace: 4, coreValue: 3,
  type: 'being', rarity: 'rare',
  pact: 'Ironbound', colors: ['amber', 'red'],
  edge: 5, grit: 5,
  description: 'Piercing. An ironclad titan whose blows shatter armor and nexus alike.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Piercing — excess damage carries through to the opponent\'s nexus.',
  },
};

// --- VOIDHALLOW BEINGS (purple, amber) ---
export const BEING_VOIDHALLOW_01: Card = {
  id: 'being_voidhallow_01',
  name: 'Voidmote Wisp',
  load: 1, pace: 1, coreValue: 1,
  type: 'being', rarity: 'common',
  pact: 'Voidhallow', colors: ['purple', 'amber'],
  edge: 1, grit: 1,
  description: 'A faint mote of Void energy flickering between planes.',
  svgArtId: 'neutral_golem',
};

export const BEING_VOIDHALLOW_02: Card = {
  id: 'being_voidhallow_02',
  name: 'Hollowed Shade',
  load: 2, pace: 2, coreValue: 2,
  type: 'being', rarity: 'common',
  pact: 'Voidhallow', colors: ['purple', 'amber'],
  edge: 2, grit: 2,
  description: 'A shade hollowed by the Void, drifting through the battlefield.',
  svgArtId: 'neutral_golem',
};

export const BEING_VOIDHALLOW_03: Card = {
  id: 'being_voidhallow_03',
  name: 'Veilborn Sentinel',
  load: 3, pace: 2, coreValue: 2,
  type: 'being', rarity: 'uncommon',
  pact: 'Voidhallow', colors: ['purple', 'amber'],
  edge: 3, grit: 2,
  isGuard: true,
  description: 'Guard. Emerges from the Veil to shield its allies from harm.',
  svgArtId: 'neutral_golem',
};

export const BEING_VOIDHALLOW_04: Card = {
  id: 'being_voidhallow_04',
  name: 'Nether Watcher',
  load: 3, pace: 3, coreValue: 2,
  type: 'being', rarity: 'uncommon',
  pact: 'Voidhallow', colors: ['purple', 'amber'],
  edge: 2, grit: 4,
  description: 'Alert. Its many eyes never close, scanning every angle of the void rift.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Alert — enters play ready to block.',
  },
};

export const BEING_VOIDHALLOW_05: Card = {
  id: 'being_voidhallow_05',
  name: 'Rift Stalker',
  load: 4, pace: 3, coreValue: 3,
  type: 'being', rarity: 'rare',
  pact: 'Voidhallow', colors: ['purple', 'amber'],
  edge: 4, grit: 3,
  description: 'Swift. Steps between rifts to strike before opponents can react.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Swift — may attack the turn it enters play.',
  },
};

export const BEING_VOIDHALLOW_06: Card = {
  id: 'being_voidhallow_06',
  name: 'Nyssara\'s Dreadform',
  load: 5, pace: 4, coreValue: 3,
  type: 'being', rarity: 'rare',
  pact: 'Voidhallow', colors: ['purple', 'amber'],
  edge: 5, grit: 5,
  description: 'Piercing. Nyssara\'s most fearsome manifestation, tearing through both flesh and Core.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Piercing — excess damage carries through to the opponent\'s nexus.',
  },
};

// --- CHARMBRAND BEINGS (purple, red) ---
export const BEING_CHARMBRAND_01: Card = {
  id: 'being_charmbrand_01',
  name: 'Branded Imp',
  load: 1, pace: 1, coreValue: 1,
  type: 'being', rarity: 'common',
  pact: 'Charmbrand', colors: ['purple', 'red'],
  edge: 1, grit: 1,
  description: 'A mischievous imp seared with rudimentary Charm sigils.',
  svgArtId: 'neutral_golem',
};

export const BEING_CHARMBRAND_02: Card = {
  id: 'being_charmbrand_02',
  name: 'Sigil Cur',
  load: 2, pace: 2, coreValue: 2,
  type: 'being', rarity: 'common',
  pact: 'Charmbrand', colors: ['purple', 'red'],
  edge: 2, grit: 2,
  description: 'A hound scarred with Charm brands, drawn to magical conflicts.',
  svgArtId: 'neutral_golem',
};

export const BEING_CHARMBRAND_03: Card = {
  id: 'being_charmbrand_03',
  name: 'Grimward Protector',
  load: 3, pace: 2, coreValue: 2,
  type: 'being', rarity: 'uncommon',
  pact: 'Charmbrand', colors: ['purple', 'red'],
  edge: 3, grit: 2,
  isGuard: true,
  description: 'Guard. Blazing with Charm-fire, it bars passage to all who threaten the caster.',
  svgArtId: 'neutral_golem',
};

export const BEING_CHARMBRAND_04: Card = {
  id: 'being_charmbrand_04',
  name: 'Runebranded Vigil',
  load: 3, pace: 3, coreValue: 2,
  type: 'being', rarity: 'uncommon',
  pact: 'Charmbrand', colors: ['purple', 'red'],
  edge: 2, grit: 4,
  description: 'Alert. Inscribed with dozens of wards, it reacts the instant danger manifests.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Alert — enters play ready to block.',
  },
};

export const BEING_CHARMBRAND_05: Card = {
  id: 'being_charmbrand_05',
  name: 'Hex Dasher',
  load: 4, pace: 3, coreValue: 3,
  type: 'being', rarity: 'rare',
  pact: 'Charmbrand', colors: ['purple', 'red'],
  edge: 4, grit: 3,
  description: 'Swift. Propelled by cascading Charm energy, it attacks before defenses form.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Swift — may attack the turn it enters play.',
  },
};

export const BEING_CHARMBRAND_06: Card = {
  id: 'being_charmbrand_06',
  name: 'Grothmaw\'s Brand-Titan',
  load: 5, pace: 4, coreValue: 3,
  type: 'being', rarity: 'rare',
  pact: 'Charmbrand', colors: ['purple', 'red'],
  edge: 5, grit: 5,
  description: 'Piercing. Covered head to toe in Grothmaw\'s oldest brands, its strikes cleave through every guard.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Piercing — excess damage carries through to the opponent\'s nexus.',
  },
};

// --- RUNESCALE BEINGS (green, red) ---
export const BEING_RUNESCALE_01: Card = {
  id: 'being_runescale_01',
  name: 'Scaleling Hatchling',
  load: 1, pace: 1, coreValue: 1,
  type: 'being', rarity: 'common',
  pact: 'Runescale', colors: ['green', 'red'],
  edge: 1, grit: 1,
  description: 'A tiny dragon hatchling whose scales faintly hum with rune-script.',
  svgArtId: 'neutral_golem',
};

export const BEING_RUNESCALE_02: Card = {
  id: 'being_runescale_02',
  name: 'Runetongue Drake',
  load: 2, pace: 2, coreValue: 2,
  type: 'being', rarity: 'common',
  pact: 'Runescale', colors: ['green', 'red'],
  edge: 2, grit: 2,
  description: 'A young drake whose tongue carves runes into anything it breathes on.',
  svgArtId: 'neutral_golem',
};

export const BEING_RUNESCALE_03: Card = {
  id: 'being_runescale_03',
  name: 'Scale-Warden',
  load: 3, pace: 2, coreValue: 2,
  type: 'being', rarity: 'uncommon',
  pact: 'Runescale', colors: ['green', 'red'],
  edge: 3, grit: 2,
  isGuard: true,
  description: 'Guard. A guardian drake that steps in front of allies to weather enemy strikes.',
  svgArtId: 'neutral_golem',
};

export const BEING_RUNESCALE_04: Card = {
  id: 'being_runescale_04',
  name: 'Emblazon Sentinel',
  load: 3, pace: 3, coreValue: 2,
  type: 'being', rarity: 'uncommon',
  pact: 'Runescale', colors: ['green', 'red'],
  edge: 2, grit: 4,
  description: 'Alert. Runes etched across its hide flare at the first sign of aggression.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Alert — enters play ready to block.',
  },
};

export const BEING_RUNESCALE_05: Card = {
  id: 'being_runescale_05',
  name: 'Rune-Blazer',
  load: 4, pace: 3, coreValue: 3,
  type: 'being', rarity: 'rare',
  pact: 'Runescale', colors: ['green', 'red'],
  edge: 4, grit: 3,
  description: 'Swift. Blazes forward with rune-enhanced momentum, striking before enemies can respond.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Swift — may attack the turn it enters play.',
  },
};

export const BEING_RUNESCALE_06: Card = {
  id: 'being_runescale_06',
  name: 'Kazrith\'s Apex Wyrm',
  load: 5, pace: 4, coreValue: 3,
  type: 'being', rarity: 'rare',
  pact: 'Runescale', colors: ['green', 'red'],
  edge: 5, grit: 5,
  description: 'Piercing. Kazrith\'s mightiest kin, whose rune-edged scales tear through steel and sorcery alike.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Piercing — excess damage carries through to the opponent\'s nexus.',
  },
};

// --- ROTWATCH BEINGS (purple, green) ---
export const BEING_ROTWATCH_01: Card = {
  id: 'being_rotwatch_01',
  name: 'Mossblight Crawler',
  load: 1, pace: 1, coreValue: 1,
  type: 'being', rarity: 'common',
  pact: 'Rotwatch', colors: ['purple', 'green'],
  edge: 1, grit: 1,
  description: 'A tiny crawler trailing moss and rot in its wake.',
  svgArtId: 'neutral_golem',
};

export const BEING_ROTWATCH_02: Card = {
  id: 'being_rotwatch_02',
  name: 'Blightback Hound',
  load: 2, pace: 2, coreValue: 2,
  type: 'being', rarity: 'common',
  pact: 'Rotwatch', colors: ['purple', 'green'],
  edge: 2, grit: 2,
  description: 'A hound whose back is overgrown with fungal rot, spreading decay with each bite.',
  svgArtId: 'neutral_golem',
};

export const BEING_ROTWATCH_03: Card = {
  id: 'being_rotwatch_03',
  name: 'Decay Bulwark',
  load: 3, pace: 2, coreValue: 2,
  type: 'being', rarity: 'uncommon',
  pact: 'Rotwatch', colors: ['purple', 'green'],
  edge: 3, grit: 2,
  isGuard: true,
  description: 'Guard. Its rotting frame absorbs punishment, shielding more vital allies behind it.',
  svgArtId: 'neutral_golem',
};

export const BEING_ROTWATCH_04: Card = {
  id: 'being_rotwatch_04',
  name: 'Vigil of Rot',
  load: 3, pace: 3, coreValue: 2,
  type: 'being', rarity: 'uncommon',
  pact: 'Rotwatch', colors: ['purple', 'green'],
  edge: 2, grit: 4,
  description: 'Alert. An ever-watchful protector of the rot cycle, always ready to intercept.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Alert — enters play ready to block.',
  },
};

export const BEING_ROTWATCH_05: Card = {
  id: 'being_rotwatch_05',
  name: 'Spore Dasher',
  load: 4, pace: 3, coreValue: 3,
  type: 'being', rarity: 'rare',
  pact: 'Rotwatch', colors: ['purple', 'green'],
  edge: 4, grit: 3,
  description: 'Swift. Propelled by explosive spore bursts, it strikes with reckless speed.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Swift — may attack the turn it enters play.',
  },
};

export const BEING_ROTWATCH_06: Card = {
  id: 'being_rotwatch_06',
  name: 'Kharv\'s Plagueborn',
  load: 5, pace: 4, coreValue: 3,
  type: 'being', rarity: 'rare',
  pact: 'Rotwatch', colors: ['purple', 'green'],
  edge: 5, grit: 5,
  description: 'Piercing. Kharv\'s champion, born of concentrated rot — its strikes bypass all resilience.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Piercing — excess damage carries through to the opponent\'s nexus.',
  },
};

export const BEINGS_LIST: Card[] = [
  BEING_COREFEAST_01, BEING_COREFEAST_02, BEING_COREFEAST_03,
  BEING_COREFEAST_04, BEING_COREFEAST_05, BEING_COREFEAST_06,
  BEING_IRONBOUND_01, BEING_IRONBOUND_02, BEING_IRONBOUND_03,
  BEING_IRONBOUND_04, BEING_IRONBOUND_05, BEING_IRONBOUND_06,
  BEING_VOIDHALLOW_01, BEING_VOIDHALLOW_02, BEING_VOIDHALLOW_03,
  BEING_VOIDHALLOW_04, BEING_VOIDHALLOW_05, BEING_VOIDHALLOW_06,
  BEING_CHARMBRAND_01, BEING_CHARMBRAND_02, BEING_CHARMBRAND_03,
  BEING_CHARMBRAND_04, BEING_CHARMBRAND_05, BEING_CHARMBRAND_06,
  BEING_RUNESCALE_01, BEING_RUNESCALE_02, BEING_RUNESCALE_03,
  BEING_RUNESCALE_04, BEING_RUNESCALE_05, BEING_RUNESCALE_06,
  BEING_ROTWATCH_01, BEING_ROTWATCH_02, BEING_ROTWATCH_03,
  BEING_ROTWATCH_04, BEING_ROTWATCH_05, BEING_ROTWATCH_06,
];

// ============================================================
// CHARMS — 3 per Pact × 6 = 18 total
// ============================================================

// --- COREFEAST CHARMS ---
export const CHARM_COREFEAST_01: Card = {
  id: 'charm_corefeast_01',
  name: 'Amberfeed',
  load: 1, pace: 1, coreValue: 1,
  type: 'charm', rarity: 'common',
  pact: 'Corefeast', colors: ['amber', 'green'],
  description: 'Deal 1 damage to any target.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'onSummon',
    description: 'Deal 1 damage to any target.',
    damage: 1,
  },
};

export const CHARM_COREFEAST_02: Card = {
  id: 'charm_corefeast_02',
  name: 'Core Harvest',
  load: 2, pace: 2, coreValue: 2,
  type: 'charm', rarity: 'uncommon',
  pact: 'Corefeast', colors: ['amber', 'green'],
  description: 'Produce 2 Core.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'onSummon',
    description: 'Produce 2 Core.',
    produceCore: 2,
  },
};

export const CHARM_COREFEAST_03: Card = {
  id: 'charm_corefeast_03',
  name: 'Glutton\'s Gift',
  load: 3, pace: 2, coreValue: 2,
  type: 'charm', rarity: 'rare',
  pact: 'Corefeast', colors: ['amber', 'green'],
  description: 'Draw 2 cards.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'onSummon',
    description: 'Draw 2 cards.',
    drawCards: 2,
  },
};

// --- IRONBOUND CHARMS ---
export const CHARM_IRONBOUND_01: Card = {
  id: 'charm_ironbound_01',
  name: 'Forge Bolt',
  load: 1, pace: 1, coreValue: 1,
  type: 'charm', rarity: 'common',
  pact: 'Ironbound', colors: ['amber', 'red'],
  description: 'Deal 1 damage to any target.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'onSummon',
    description: 'Deal 1 damage to any target.',
    damage: 1,
  },
};

export const CHARM_IRONBOUND_02: Card = {
  id: 'charm_ironbound_02',
  name: 'Iron Will',
  load: 2, pace: 2, coreValue: 2,
  type: 'charm', rarity: 'uncommon',
  pact: 'Ironbound', colors: ['amber', 'red'],
  description: 'Give target Being +2 Grit until end of turn.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'onSummon',
    description: 'Give target Being +2 Grit until end of turn.',
    buffGrit: 2,
  },
};

export const CHARM_IRONBOUND_03: Card = {
  id: 'charm_ironbound_03',
  name: 'Molten Surge',
  load: 3, pace: 2, coreValue: 2,
  type: 'charm', rarity: 'rare',
  pact: 'Ironbound', colors: ['amber', 'red'],
  description: 'Deal 3 damage to any target.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'onSummon',
    description: 'Deal 3 damage to any target.',
    damage: 3,
  },
};

// --- VOIDHALLOW CHARMS ---
export const CHARM_VOIDHALLOW_01: Card = {
  id: 'charm_voidhallow_01',
  name: 'Void Pulse',
  load: 1, pace: 1, coreValue: 1,
  type: 'charm', rarity: 'common',
  pact: 'Voidhallow', colors: ['purple', 'amber'],
  description: 'Deal 1 damage to any target.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'onSummon',
    description: 'Deal 1 damage to any target.',
    damage: 1,
  },
};

export const CHARM_VOIDHALLOW_02: Card = {
  id: 'charm_voidhallow_02',
  name: 'Essence Siphon',
  load: 2, pace: 2, coreValue: 2,
  type: 'charm', rarity: 'uncommon',
  pact: 'Voidhallow', colors: ['purple', 'amber'],
  description: 'Produce 2 Core.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'onSummon',
    description: 'Produce 2 Core.',
    produceCore: 2,
  },
};

export const CHARM_VOIDHALLOW_03: Card = {
  id: 'charm_voidhallow_03',
  name: 'Hollow Gaze',
  load: 3, pace: 2, coreValue: 2,
  type: 'charm', rarity: 'rare',
  pact: 'Voidhallow', colors: ['purple', 'amber'],
  description: 'Draw 2 cards.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'onSummon',
    description: 'Draw 2 cards.',
    drawCards: 2,
  },
};

// --- CHARMBRAND CHARMS ---
export const CHARM_CHARMBRAND_01: Card = {
  id: 'charm_charmbrand_01',
  name: 'Brand Flare',
  load: 1, pace: 1, coreValue: 1,
  type: 'charm', rarity: 'common',
  pact: 'Charmbrand', colors: ['purple', 'red'],
  description: 'Deal 1 damage to any target.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'onSummon',
    description: 'Deal 1 damage to any target.',
    damage: 1,
  },
};

export const CHARM_CHARMBRAND_02: Card = {
  id: 'charm_charmbrand_02',
  name: 'Hex Surge',
  load: 2, pace: 2, coreValue: 2,
  type: 'charm', rarity: 'uncommon',
  pact: 'Charmbrand', colors: ['purple', 'red'],
  description: 'Give target Being +2 Edge until end of turn.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'onSummon',
    description: 'Give target Being +2 Edge until end of turn.',
    buffEdge: 2,
  },
};

export const CHARM_CHARMBRAND_03: Card = {
  id: 'charm_charmbrand_03',
  name: 'Grimfire Blast',
  load: 3, pace: 2, coreValue: 2,
  type: 'charm', rarity: 'rare',
  pact: 'Charmbrand', colors: ['purple', 'red'],
  description: 'Deal 3 damage to any target.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'onSummon',
    description: 'Deal 3 damage to any target.',
    damage: 3,
  },
};

// --- RUNESCALE CHARMS ---
export const CHARM_RUNESCALE_01: Card = {
  id: 'charm_runescale_01',
  name: 'Scale Shard',
  load: 1, pace: 1, coreValue: 1,
  type: 'charm', rarity: 'common',
  pact: 'Runescale', colors: ['green', 'red'],
  description: 'Deal 1 damage to any target.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'onSummon',
    description: 'Deal 1 damage to any target.',
    damage: 1,
  },
};

export const CHARM_RUNESCALE_02: Card = {
  id: 'charm_runescale_02',
  name: 'Rune Empowerment',
  load: 2, pace: 2, coreValue: 2,
  type: 'charm', rarity: 'uncommon',
  pact: 'Runescale', colors: ['green', 'red'],
  description: 'Give target Being +1 Edge and +1 Grit until end of turn.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'onSummon',
    description: 'Give target Being +1 Edge and +1 Grit until end of turn.',
    buffEdge: 1,
    buffGrit: 1,
  },
};

export const CHARM_RUNESCALE_03: Card = {
  id: 'charm_runescale_03',
  name: 'Dragon Roar',
  load: 3, pace: 2, coreValue: 2,
  type: 'charm', rarity: 'rare',
  pact: 'Runescale', colors: ['green', 'red'],
  description: 'Draw 2 cards.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'onSummon',
    description: 'Draw 2 cards.',
    drawCards: 2,
  },
};

// --- ROTWATCH CHARMS ---
export const CHARM_ROTWATCH_01: Card = {
  id: 'charm_rotwatch_01',
  name: 'Rot Burst',
  load: 1, pace: 1, coreValue: 1,
  type: 'charm', rarity: 'common',
  pact: 'Rotwatch', colors: ['purple', 'green'],
  description: 'Deal 1 damage to any target.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'onSummon',
    description: 'Deal 1 damage to any target.',
    damage: 1,
  },
};

export const CHARM_ROTWATCH_02: Card = {
  id: 'charm_rotwatch_02',
  name: 'Fungal Bloom',
  load: 2, pace: 2, coreValue: 2,
  type: 'charm', rarity: 'uncommon',
  pact: 'Rotwatch', colors: ['purple', 'green'],
  description: 'Produce 2 Core.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'onSummon',
    description: 'Produce 2 Core.',
    produceCore: 2,
  },
};

export const CHARM_ROTWATCH_03: Card = {
  id: 'charm_rotwatch_03',
  name: 'Spore Cascade',
  load: 3, pace: 2, coreValue: 2,
  type: 'charm', rarity: 'rare',
  pact: 'Rotwatch', colors: ['purple', 'green'],
  description: 'Deal 3 damage to any target.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'onSummon',
    description: 'Deal 3 damage to any target.',
    damage: 3,
  },
};

export const CHARMS_LIST: Card[] = [
  CHARM_COREFEAST_01, CHARM_COREFEAST_02, CHARM_COREFEAST_03,
  CHARM_IRONBOUND_01, CHARM_IRONBOUND_02, CHARM_IRONBOUND_03,
  CHARM_VOIDHALLOW_01, CHARM_VOIDHALLOW_02, CHARM_VOIDHALLOW_03,
  CHARM_CHARMBRAND_01, CHARM_CHARMBRAND_02, CHARM_CHARMBRAND_03,
  CHARM_RUNESCALE_01, CHARM_RUNESCALE_02, CHARM_RUNESCALE_03,
  CHARM_ROTWATCH_01, CHARM_ROTWATCH_02, CHARM_ROTWATCH_03,
];

// ============================================================
// ATTACHMENTS — 2 per Pact × 6 = 12 total
// ============================================================

// --- COREFEAST ATTACHMENTS ---
export const ATTACHMENT_COREFEAST_01: Card = {
  id: 'attachment_corefeast_01',
  name: 'Ambervine Blade',
  load: 2, pace: 2, coreValue: 2,
  type: 'attachment', rarity: 'uncommon',
  attachmentType: 'weapon',
  pact: 'Corefeast', colors: ['amber', 'green'],
  description: 'Attached Being gets +2 Edge.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Attached Being gets +2 Edge.',
    buffEdge: 2,
  },
};

export const ATTACHMENT_COREFEAST_02: Card = {
  id: 'attachment_corefeast_02',
  name: 'Verdant Carapace',
  load: 3, pace: 2, coreValue: 2,
  type: 'attachment', rarity: 'uncommon',
  attachmentType: 'armor',
  pact: 'Corefeast', colors: ['amber', 'green'],
  description: 'Attached Being gets +3 Grit.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Attached Being gets +3 Grit.',
    buffGrit: 3,
  },
};

// --- IRONBOUND ATTACHMENTS ---
export const ATTACHMENT_IRONBOUND_01: Card = {
  id: 'attachment_ironbound_01',
  name: 'Forgehammer',
  load: 2, pace: 2, coreValue: 2,
  type: 'attachment', rarity: 'uncommon',
  attachmentType: 'weapon',
  pact: 'Ironbound', colors: ['amber', 'red'],
  description: 'Attached Being gets +2 Edge.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Attached Being gets +2 Edge.',
    buffEdge: 2,
  },
};

export const ATTACHMENT_IRONBOUND_02: Card = {
  id: 'attachment_ironbound_02',
  name: 'Iron Plating',
  load: 3, pace: 2, coreValue: 2,
  type: 'attachment', rarity: 'uncommon',
  attachmentType: 'armor',
  pact: 'Ironbound', colors: ['amber', 'red'],
  description: 'Attached Being gets +3 Grit.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Attached Being gets +3 Grit.',
    buffGrit: 3,
  },
};

// --- VOIDHALLOW ATTACHMENTS ---
export const ATTACHMENT_VOIDHALLOW_01: Card = {
  id: 'attachment_voidhallow_01',
  name: 'Veil Fang',
  load: 2, pace: 2, coreValue: 2,
  type: 'attachment', rarity: 'uncommon',
  attachmentType: 'weapon',
  pact: 'Voidhallow', colors: ['purple', 'amber'],
  description: 'Attached Being gets +2 Edge.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Attached Being gets +2 Edge.',
    buffEdge: 2,
  },
};

export const ATTACHMENT_VOIDHALLOW_02: Card = {
  id: 'attachment_voidhallow_02',
  name: 'Netherweave Shroud',
  load: 3, pace: 2, coreValue: 2,
  type: 'attachment', rarity: 'uncommon',
  attachmentType: 'armor',
  pact: 'Voidhallow', colors: ['purple', 'amber'],
  description: 'Attached Being gets +3 Grit.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Attached Being gets +3 Grit.',
    buffGrit: 3,
  },
};

// --- CHARMBRAND ATTACHMENTS ---
export const ATTACHMENT_CHARMBRAND_01: Card = {
  id: 'attachment_charmbrand_01',
  name: 'Brand Claw',
  load: 2, pace: 2, coreValue: 2,
  type: 'attachment', rarity: 'uncommon',
  attachmentType: 'weapon',
  pact: 'Charmbrand', colors: ['purple', 'red'],
  description: 'Attached Being gets +2 Edge.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Attached Being gets +2 Edge.',
    buffEdge: 2,
  },
};

export const ATTACHMENT_CHARMBRAND_02: Card = {
  id: 'attachment_charmbrand_02',
  name: 'Hexward Mail',
  load: 3, pace: 2, coreValue: 2,
  type: 'attachment', rarity: 'uncommon',
  attachmentType: 'armor',
  pact: 'Charmbrand', colors: ['purple', 'red'],
  description: 'Attached Being gets +3 Grit.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Attached Being gets +3 Grit.',
    buffGrit: 3,
  },
};

// --- RUNESCALE ATTACHMENTS ---
export const ATTACHMENT_RUNESCALE_01: Card = {
  id: 'attachment_runescale_01',
  name: 'Rune-Etched Talon',
  load: 2, pace: 2, coreValue: 2,
  type: 'attachment', rarity: 'uncommon',
  attachmentType: 'weapon',
  pact: 'Runescale', colors: ['green', 'red'],
  description: 'Attached Being gets +2 Edge.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Attached Being gets +2 Edge.',
    buffEdge: 2,
  },
};

export const ATTACHMENT_RUNESCALE_02: Card = {
  id: 'attachment_runescale_02',
  name: 'Scalehide Mantle',
  load: 3, pace: 2, coreValue: 2,
  type: 'attachment', rarity: 'uncommon',
  attachmentType: 'armor',
  pact: 'Runescale', colors: ['green', 'red'],
  description: 'Attached Being gets +3 Grit.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Attached Being gets +3 Grit.',
    buffGrit: 3,
  },
};

// --- ROTWATCH ATTACHMENTS ---
export const ATTACHMENT_ROTWATCH_01: Card = {
  id: 'attachment_rotwatch_01',
  name: 'Blightclaw',
  load: 2, pace: 2, coreValue: 2,
  type: 'attachment', rarity: 'uncommon',
  attachmentType: 'weapon',
  pact: 'Rotwatch', colors: ['purple', 'green'],
  description: 'Attached Being gets +2 Edge.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Attached Being gets +2 Edge.',
    buffEdge: 2,
  },
};

export const ATTACHMENT_ROTWATCH_02: Card = {
  id: 'attachment_rotwatch_02',
  name: 'Rotmoss Husk',
  load: 3, pace: 2, coreValue: 2,
  type: 'attachment', rarity: 'uncommon',
  attachmentType: 'armor',
  pact: 'Rotwatch', colors: ['purple', 'green'],
  description: 'Attached Being gets +3 Grit.',
  svgArtId: 'neutral_golem',
  ability: {
    trigger: 'static',
    description: 'Attached Being gets +3 Grit.',
    buffGrit: 3,
  },
};

export const ATTACHMENTS_LIST: Card[] = [
  ATTACHMENT_COREFEAST_01, ATTACHMENT_COREFEAST_02,
  ATTACHMENT_IRONBOUND_01, ATTACHMENT_IRONBOUND_02,
  ATTACHMENT_VOIDHALLOW_01, ATTACHMENT_VOIDHALLOW_02,
  ATTACHMENT_CHARMBRAND_01, ATTACHMENT_CHARMBRAND_02,
  ATTACHMENT_RUNESCALE_01, ATTACHMENT_RUNESCALE_02,
  ATTACHMENT_ROTWATCH_01, ATTACHMENT_ROTWATCH_02,
];

// ============================================================
// CARD DATABASE & PLAYABLE SPELLS (updated)
// ============================================================

export const CARD_DATABASE: Card[] = [
  ...PRIMAL_AVATARS_LIST,
  ...PACT_RELICS_LIST,
  ...PACT_RUNES_LIST,
  ...BEINGS_LIST,
  ...CHARMS_LIST,
  ...ATTACHMENTS_LIST,
];

export const PLAYABLE_SPELLS: Card[] = [
  ...PACT_RELICS_LIST,
  ...PACT_RUNES_LIST,
  ...BEINGS_LIST,
  ...CHARMS_LIST,
  ...ATTACHMENTS_LIST,
];

// ============================================================
// STARTER DECKS
// ============================================================

// 60-Card Precon constructed deck matching 24 Common, 20 Uncommon, 12 Rare, 4 Signature slots (max 3 copies per card)
export const STARTER_DECK_A: Card[] = [
  // 18 Commons — Beings tier 1 & 2 + Charms tier 1 (3 copies each × 6 slots)
  BEING_COREFEAST_01, BEING_COREFEAST_01, BEING_COREFEAST_01,
  BEING_COREFEAST_02, BEING_COREFEAST_02, BEING_COREFEAST_02,
  BEING_VOIDHALLOW_01, BEING_VOIDHALLOW_01, BEING_VOIDHALLOW_01,
  BEING_VOIDHALLOW_02, BEING_VOIDHALLOW_02, BEING_VOIDHALLOW_02,
  CHARM_COREFEAST_01, CHARM_COREFEAST_01, CHARM_COREFEAST_01,
  CHARM_VOIDHALLOW_01, CHARM_VOIDHALLOW_01, CHARM_VOIDHALLOW_01,

  // 18 Uncommons — Beings tier 3 & 4, Charms tier 2, Attachments (3 copies each × 6 slots)
  BEING_COREFEAST_03, BEING_COREFEAST_03, BEING_COREFEAST_03,
  BEING_COREFEAST_04, BEING_COREFEAST_04, BEING_COREFEAST_04,
  BEING_VOIDHALLOW_03, BEING_VOIDHALLOW_03, BEING_VOIDHALLOW_03,
  CHARM_COREFEAST_02, CHARM_COREFEAST_02, CHARM_COREFEAST_02,
  ATTACHMENT_COREFEAST_01, ATTACHMENT_COREFEAST_01, ATTACHMENT_COREFEAST_01,
  ATTACHMENT_VOIDHALLOW_01, ATTACHMENT_VOIDHALLOW_01, ATTACHMENT_VOIDHALLOW_01,

  // 12 Rares — Beings tier 5 & 6, Charms tier 3 (3 copies each × 4 slots)
  BEING_COREFEAST_05, BEING_COREFEAST_05, BEING_COREFEAST_05,
  BEING_VOIDHALLOW_05, BEING_VOIDHALLOW_05, BEING_VOIDHALLOW_05,
  CHARM_COREFEAST_03, CHARM_COREFEAST_03, CHARM_COREFEAST_03,
  CHARM_VOIDHALLOW_03, CHARM_VOIDHALLOW_03, CHARM_VOIDHALLOW_03,

  // 12 Signature — Apex Beings + Runes & Relics (3 copies each × 4 slots)
  BEING_COREFEAST_06, BEING_COREFEAST_06, BEING_COREFEAST_06,
  BEING_VOIDHALLOW_06, BEING_VOIDHALLOW_06, BEING_VOIDHALLOW_06,
  COREFEAST_INCANTATION, COREFEAST_INCANTATION, COREFEAST_INCANTATION,
  VOIDHALLOW_INCANTATION, VOIDHALLOW_INCANTATION, VOIDHALLOW_INCANTATION,
];

// 60-Card AI Opponent Precon — uses new Beings, Charms, Attachments (Ironbound + Runescale theme)
export const STARTER_DECK_B: Card[] = [
  // 18 Commons — Beings tier 1 & 2 (3 copies each × 6 slots)
  BEING_IRONBOUND_01, BEING_IRONBOUND_01, BEING_IRONBOUND_01,
  BEING_IRONBOUND_02, BEING_IRONBOUND_02, BEING_IRONBOUND_02,
  BEING_RUNESCALE_01, BEING_RUNESCALE_01, BEING_RUNESCALE_01,
  BEING_RUNESCALE_02, BEING_RUNESCALE_02, BEING_RUNESCALE_02,
  CHARM_IRONBOUND_01, CHARM_IRONBOUND_01, CHARM_IRONBOUND_01,
  CHARM_RUNESCALE_01, CHARM_RUNESCALE_01, CHARM_RUNESCALE_01,

  // 18 Uncommons — Beings tier 3 & 4, Charms tier 2, Attachments (3 copies each × 6 slots)
  BEING_IRONBOUND_03, BEING_IRONBOUND_03, BEING_IRONBOUND_03,
  BEING_IRONBOUND_04, BEING_IRONBOUND_04, BEING_IRONBOUND_04,
  BEING_RUNESCALE_03, BEING_RUNESCALE_03, BEING_RUNESCALE_03,
  CHARM_IRONBOUND_02, CHARM_IRONBOUND_02, CHARM_IRONBOUND_02,
  ATTACHMENT_IRONBOUND_01, ATTACHMENT_IRONBOUND_01, ATTACHMENT_IRONBOUND_01,
  ATTACHMENT_RUNESCALE_01, ATTACHMENT_RUNESCALE_01, ATTACHMENT_RUNESCALE_01,

  // 12 Rares — Beings tier 5 & 6, Charms tier 3 (3 copies each × 4 slots)
  BEING_IRONBOUND_05, BEING_IRONBOUND_05, BEING_IRONBOUND_05,
  BEING_RUNESCALE_05, BEING_RUNESCALE_05, BEING_RUNESCALE_05,
  CHARM_IRONBOUND_03, CHARM_IRONBOUND_03, CHARM_IRONBOUND_03,
  CHARM_RUNESCALE_03, CHARM_RUNESCALE_03, CHARM_RUNESCALE_03,

  // 12 Signature — Apex Beings + Runes (3 copies each × 4 slots)
  BEING_IRONBOUND_06, BEING_IRONBOUND_06, BEING_IRONBOUND_06,
  BEING_RUNESCALE_06, BEING_RUNESCALE_06, BEING_RUNESCALE_06,
  IRONBOUND_INCANTATION, IRONBOUND_INCANTATION, IRONBOUND_INCANTATION,
  RUNESCALE_INCANTATION, RUNESCALE_INCANTATION, RUNESCALE_INCANTATION,
];

