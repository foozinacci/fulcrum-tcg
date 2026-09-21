export type CardType = 'being' | 'charm' | 'relic' | 'attachment' | 'rune' | 'primal_avatar';

export type Faction = 'sol' | 'umbra' | 'neutral';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface CardAbility {
  trigger: 'onSummon' | 'onDeath' | 'onTurnStart' | 'onAttack' | 'passive' | 'expedite';
  description: string;
  fulcrumShift?: number; // Shifts Fulcrum Balance
  damage?: number;
  heal?: number;
  drawCards?: number;
  buffEdge?: number;
  buffGrit?: number;
  grantGuard?: boolean;
}

export interface Card {
  id: string;
  name: string;
  load: number;          // Cost to cast normal
  expediteLoad?: number; // Cost to cast with Expedite (ignores Pace)
  coreValue: number;     // Value if converted into Core resource pool
  pace: number;          // Earliest legal turn to cast
  faction: Faction;
  type: CardType;
  rarity: Rarity;
  isPrimal?: boolean;    // Primal supertype (max 1 copy)
  edge?: number;         // Attack power (Offense)
  grit?: number;         // Toughness/Defense (Resets each turn)
  coreAttackRatio?: number; // Core banked to damage ratio (default 1)
  description: string;
  flavorText?: string;
  isGuard?: boolean;
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
  bankedCore: number;         // Core banked on creature for boosted damage
  isGuard: boolean;
}

export interface PlayerState {
  id: string;
  name: string;
  isAi: boolean;
  lifeTotal: number;
  startingLife: number;
  primalDamageTaken: Record<string, number>; // Tracked per Primal source ID
  corePool: number;           // Current Core resource pool
  hand: Card[];
  deck: Card[];
  graveyard: Card[];
  primalAvatar: Card;         // Dedicated 61st slot Primal Avatar
  field: BoardPermanent[];    // Beings, Relics, Runes, Attachments on field
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
  fulcrumBalance: number;     // -5 (Umbra) to +5 (Sol)
  winner: 'player' | 'opponent' | null;
  logs: GameLogEntry[];

  // Interactive UI state
  selectedHandCardId: string | null;
  selectedBoardInstanceId: string | null;
  isExpediteMode: boolean;
  isTargeting: boolean;
  validTargetType: 'being' | 'nexus' | 'any' | null;
}
