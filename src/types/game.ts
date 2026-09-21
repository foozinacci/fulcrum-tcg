export type CardType = 'being' | 'charm' | 'relic' | 'attachment' | 'rune' | 'primal_avatar';

export type AttachmentType = 'weapon' | 'armor';

export interface HandCard {
  card: Card;
  drawnThisTurn: boolean; // Conversion into Core is only legal the turn it is drawn!
}

export interface CardAbility {
  trigger: 'onSummon' | 'onDeath' | 'onTurnStart' | 'onAttack' | 'expedite' | 'counterspell';
  description: string;
  damage?: number;
  heal?: number;
  drawCards?: number;
  buffEdge?: number;
  buffGrit?: number;
  produceCore?: number;
}

export interface Card {
  id: string;
  name: string;
  load: number;           // Standard Load cost (used when turn >= pace)
  expediteLoad?: number;  // Expedite mechanic: Alternative higher Load cost to cast before Pace turn!
  coreValue: number;      // Value if converted into Core pool
  pace: number;           // Earliest legal turn to cast at standard Load
  type: CardType;
  attachmentType?: AttachmentType; // Weapon (Edge) or Armor (Grit)
  isPrimal?: boolean;     // Primal supertype (max 1 copy)
  isGuard?: boolean;      // Protects Life & non-guard allies
  edge?: number;          // Offense (Attack power)
  grit?: number;          // Defense/Toughness (Resets each turn)
  coreAttackRatio?: number; // Custom ratio converting banked Core to extra damage
  description: string;
  flavorText?: string;
  ability?: CardAbility;
  svgArtId: string;
}

export interface BoardPermanent {
  instanceId: string;
  card: Card;
  currentEdge: number;
  currentGrit: number;
  maxGrit: number;
  state: 'dormant' | 'alert'; // Dormant = tapped/summoning sick; Alert = ready
  bankedCore: number;         // Banked Core converting to damage on attack
  attachments: Card[];        // Attached Weapons or Armor
  isGuard: boolean;
}

export interface PlayerState {
  id: string;
  name: string;
  isAi: boolean;
  lifeTotal: number;
  startingLife: number;
  primalDamageTaken: Record<string, number>; // Cumulative Primal damage per source ID
  corePool: number;           // Current Core resource pool
  hand: HandCard[];          // Fully revealed hand cards
  deck: Card[];
  graveyard: Card[];
  primalAvatar: Card;         // Dedicated 61st slot Primal Avatar
  field: BoardPermanent[];    // Beings, Relics, Runes, Attachments in play
}

export type GamePhase = 'draw' | 'conversion' | 'main1' | 'combat' | 'main2' | 'end' | 'gameover';

export interface GameLogEntry {
  id: string;
  text: string;
  type: 'info' | 'conversion' | 'summon' | 'combat' | 'charm' | 'primal' | 'turn';
  timestamp: string;
}

export interface GameState {
  player: PlayerState;
  opponent: PlayerState;
  turnOwner: 'player' | 'opponent';
  turnNumber: number;
  phase: GamePhase;
  winner: 'player' | 'opponent' | null;
  logs: GameLogEntry[];

  // Interactive state
  selectedHandCardId: string | null;
  selectedBoardInstanceId: string | null;
  isTargeting: boolean;
  validTargetType: 'being' | 'nexus' | 'any' | null;
}
