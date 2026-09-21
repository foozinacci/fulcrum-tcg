export type CardType = 'being' | 'charm' | 'relic' | 'attachment' | 'rune' | 'primal_avatar';

export type AttachmentType = 'weapon' | 'armor';

export interface HandCard {
  card: Card;
  drawnThisTurn: boolean; // Conversion is only legal the turn it is drawn!
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
  load: number;           // Standard Load cost to cast
  expediteLoad?: number;  // Expedite: Higher Load cost to ignore Pace restriction
  coreValue: number;      // Fixed Core value when converted
  pace: number;           // Earliest legal turn to cast at standard Load
  type: CardType;
  attachmentType?: AttachmentType; // Weapon (Edge) or Armor (Grit)
  isPrimal?: boolean;     // Primal supertype (max 1 copy)
  isGuard?: boolean;      // Protects Life & non-guard allies
  edge?: number;          // Offense (Attack power)
  grit?: number;          // Defense/Toughness (Resets at End Step)
  attackCoreCost?: number; // Fixed Core cost paid per attack (default 1)
  coreAttackRatio?: number; // Ratio converting banked Core to extra damage
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
  state: 'dormant' | 'alert'; // Dormant = tapped; Alert = untapped/ready
  bankedCore: number;         // Core banked as reserve converting to damage at a ratio
  attachments: Card[];
  isGuard: boolean;
}

export interface PlayerState {
  id: string;
  name: string;
  isAi: boolean;
  lifeTotal: number;
  startingLife: number;
  primalDamageTaken: Record<string, number>; // Cumulative Primal damage per source ID
  corePool: number;           // Active Core resource pool
  hand: HandCard[];          // Fully revealed hand cards
  deck: Card[];
  graveyard: Card[];
  primalAvatar: Card;         // Dedicated 61st slot Primal Avatar
  field: BoardPermanent[];    // Field permanents
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
  bankCoreAmount: number;     // Core amount to bank onto selected attacker
  isTargeting: boolean;
  validTargetType: 'being' | 'nexus' | 'any' | null;
}
