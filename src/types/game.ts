export type CardType = 'being' | 'charm' | 'relic' | 'attachment' | 'rune' | 'primal_avatar';

export type CardRarity = 'common' | 'uncommon' | 'rare' | 'primal';

export type AttachmentType = 'weapon' | 'armor';

export type CardColor = 'purple' | 'amber' | 'green' | 'red';

export type PactName = 'Voidhallow' | 'Rotwatch' | 'Charmbrand' | 'Corefeast' | 'Ironbound' | 'Runescale';

export interface HandCard {
  card: Card;
  drawnThisTurn: boolean; // Conversion into Core is only legal the turn it is drawn!
}

export interface CardAbility {
  trigger: 'onSummon' | 'onDeath' | 'onTurnStart' | 'onAttack' | 'expedite' | 'counterspell' | 'activated' | 'static';
  description: string;
  damage?: number;
  heal?: number;
  drawCards?: number;
  buffEdge?: number;
  buffGrit?: number;
  produceCore?: number;
  tutorType?: 'relic' | 'rune' | 'attachment';
}

export interface Card {
  id: string;
  name: string;
  load: number;           // Standard Load cost to cast
  expediteLoad?: number;  // Expedite: Higher Load cost to ignore Pace restriction
  coreValue?: number;     // Fixed Core value when converted (N/A for Primal Avatars)
  pace: number;           // Earliest legal turn to cast at standard Load
  type: CardType;
  rarity?: CardRarity;    // Common, Uncommon, Rare, or Primal
  attachmentType?: AttachmentType; // Weapon (Edge) or Armor (Grit)
  colors?: CardColor[];   // Color affiliation (Purple, Amber, Green, Red)
  pact?: PactName;        // Dual-color Pact alignment
  isPrimal?: boolean;     // Primal supertype (max 1 copy)
  isGuard?: boolean;      // Protects Life & non-guard allies
  edge?: number;          // Offense (Attack power)
  grit?: number;          // Defense/Toughness (Resets at End Step)
  isDynamicStats?: boolean; // Stats (*/*) derived from active game state (e.g. Vorrath)
  attackCoreCost?: number; // Fixed Core cost paid per attack (default 1)
  coreAttackRatio?: number; // Ratio converting banked Core to extra damage
  description: string;
  flavorText?: string;
  ability?: CardAbility;
  ability2?: CardAbility;
  svgArtId: string;
  imageArtUrl?: string;   // High-res custom card artwork image URL
  imageObjectPosition?: string; // CSS object-position class (e.g. object-top, object-[center_10%])
  castableFromGraveyardThisTurn?: boolean; // Grothmaw Ability 1 flag
}

export interface UserEconomy {
  shards: number; // Earned free-to-play currency
  bones: number;  // Premium store-bought currency
  collection: Record<string, number>; // cardId -> count
  unlockedCardBacks: string[];
  activeCardBack: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  rewardShards: number;
  progress: number;
  maxProgress: number;
  completed: boolean;
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
  ability2UsedThisTurn?: boolean;
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
  grothmawDealtDamageThisTurn?: boolean; // Grothmaw Ability 2 flag
}

export type GamePhase = 'mulligan' | 'draw' | 'conversion' | 'main1' | 'combat' | 'main2' | 'end' | 'gameover';

export interface GameLogEntry {
  id: string;
  text: string;
  type: 'info' | 'conversion' | 'summon' | 'combat' | 'charm' | 'primal' | 'turn';
  timestamp: string;
}

export type GameFormat = '1v1' | '2v2' | '3v3' | '4v4' | '1v2' | '1v3' | '1v1v1' | '1v1v1v1';

export interface GameFormatConfig {
  format: GameFormat;
  label: string;
  category: 'Symmetric' | 'Asymmetric' | 'Free-For-All';
  totalPlayers: number;
  startingLife: number;
  teamLifePool?: number;
  primalThreshold: number;
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
  bankCoreAmount: number;
  isTargeting: boolean;
  validTargetType: 'being' | 'nexus' | 'any' | null;
}

export type ZoneType = 'deck' | 'hand' | 'field' | 'graveyard' | 'primal_slot' | 'exile';

export type CombatStep = 'none' | 'declare_attackers' | 'declare_blockers' | 'assign_damage' | 'combat_resolution';

export interface StackItem {
  id: string;
  controllerId: 'player' | 'opponent';
  type: 'SPELL_CAST' | 'ABILITY_TRIGGER' | 'ATTACK_DECLARATION' | 'BLOCK_DECLARATION';
  sourceCardId: string;
  targetInstanceId?: string | 'nexus';
  timestamp: string;
}

export type ActionErrorCode =
  | 'ERR_NOT_YOUR_TURN'
  | 'ERR_WRONG_PHASE'
  | 'ERR_WRONG_COMBAT_STEP'
  | 'ERR_NOT_IN_ZONE'
  | 'ERR_CONVERSION_TIMING'
  | 'ERR_CORE_CAP_EXCEEDED'
  | 'ERR_INSUFFICIENT_CORE'
  | 'ERR_PACE_GATED'
  | 'ERR_DORMANT_UNIT'
  | 'ERR_GUARD_INTERCEPTION_REQUIRED'
  | 'ERR_INVALID_TARGET'
  | 'ERR_COLOR_IDENTITY_MISMATCH'
  | 'ERR_STACK_NOT_EMPTY';

export interface ValidationResult {
  valid: boolean;
  errorCode?: ActionErrorCode;
  reason?: string;
}

export type GameAction =
  | { type: 'CONVERT_CORE'; playerId: 'player' | 'opponent'; cardId: string }
  | { type: 'PLAY_CARD'; playerId: 'player' | 'opponent'; cardId: string; targetInstanceId?: string | 'nexus' }
  | { type: 'DECLARE_ATTACKER'; playerId: 'player' | 'opponent'; attackerInstanceId: string; targetId: string | 'nexus'; bankedCore?: number }
  | { type: 'DECLARE_BLOCKER'; playerId: 'player' | 'opponent'; blockerInstanceId: string; attackerInstanceId: string }
  | { type: 'RESOLVE_COMBAT'; playerId: 'player' | 'opponent' }
  | { type: 'ACTIVATE_PRIMAL_ABILITY'; playerId: 'player' | 'opponent'; abilityIndex: 1 | 2 }
  | { type: 'PASS_PRIORITY'; playerId: 'player' | 'opponent' }
  | { type: 'END_TURN'; playerId: 'player' | 'opponent' };

export interface BugReport {
  id: string;
  timestamp: string;
  actionId?: string;
  turnNumber: number;
  phase: GamePhase;
  userDescription: string;
  gameStateSnapshot: GameState;
}

// User Profile & Social Types
export interface UserProfile {
  displayName: string;
  tag: string; // e.g. #1337
  avatarId: string;
  title: string;
  activeCardBack: string;
  rankTier: 'Iron' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Fulcrum Master' | 'Primal Master';
  mmr: number;
  wins: number;
  losses: number;
  favoritePact: PactName;
  soundEnabled: boolean;
  musicEnabled: boolean;
}

export interface Friend {
  id: string;
  displayName: string;
  tag: string;
  status: 'online' | 'in_game' | 'offline';
  rankTier: string;
  avatarId: string;
}

// Season / Battle Pass Types
export interface BattlePassReward {
  type: 'shards' | 'bones' | 'pack' | 'card_back' | 'title';
  amount?: number;
  packType?: string;
  title?: string;
  cardBackId?: string;
  label: string;
}

export interface BattlePassTier {
  level: number;
  requiredXp: number;
  freeReward: BattlePassReward;
  premiumReward: BattlePassReward;
}

export interface UserBattlePass {
  currentLevel: number;
  currentXp: number;
  hasPremiumPass: boolean;
  claimedFreeLevels: number[];
  claimedPremiumLevels: number[];
}

// Replay Engine Types
export interface ReplayStep {
  stepIndex: number;
  turnNumber: number;
  turnOwner: 'player' | 'opponent';
  logText: string;
  playerLife: number;
  opponentLife: number;
  playerCore: number;
  opponentCore: number;
  playerFieldCount: number;
  opponentFieldCount: number;
}

// Draft / Sealed Types
export interface DraftPack {
  cards: Card[];
}

export interface DraftState {
  mode: 'sealed' | 'draft';
  activePackIndex: number;
  picks: Card[];
  pool: Card[];
  selectedAvatar: Card | null;
  isCompleted: boolean;
}

// Tutorial Onboarding Types
export interface TutorialStep {
  id: number;
  title: string;
  message: string;
  highlightElement?: string; // CSS selector or identifier
  expectedAction?: 'convert_core' | 'cast_being' | 'attack' | 'end_turn' | 'any';
}

// Server Authority & Network Protocol Types
export interface DeckCommitment {
  matchId: string;
  playerHash: string;
  opponentHash: string;
  rngSeedHash: string;
  committedAt: string;
  isValidated: boolean;
}

export interface ClientActionIntent {
  actionId: string;
  matchId: string;
  playerId: string;
  type: 'CONVERT_CORE' | 'PLAY_CARD' | 'ATTACK_NEXUS' | 'ATTACK_UNIT' | 'END_TURN';
  cardId?: string;
  targetInstanceId?: string;
  clientTimestamp: number;
}

export interface ServerValidationResult {
  valid: boolean;
  errorCode?: string;
  message: string;
  sanitizedState?: GameState;
  auditReplayStep?: ReplayStep;
}
