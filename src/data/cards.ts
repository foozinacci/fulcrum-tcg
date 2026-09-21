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

export const CARD_DATABASE: Card[] = [
  ...PRIMAL_AVATARS_LIST,
];

export const PLAYABLE_SPELLS: Card[] = [];

export const STARTER_DECK_A: Card[] = [];

export const STARTER_DECK_B: Card[] = [];
