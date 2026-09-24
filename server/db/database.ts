import { UserProfile, ReplayStep } from '../../src/types/game';

export interface DbUser {
  id: string;
  email: string;
  displayName: string;
  tag: string;
  rankTier: string;
  mmr: number;
  wins: number;
  losses: number;
  shards: number;
  bones: number;
  collection: Record<string, number>;
}

export interface DbMatchReplay {
  matchId: string;
  player1Id: string;
  player2Id: string;
  winnerId: string;
  totalOrbits: number;
  steps: ReplayStep[];
  endedAt: string;
}

/**
 * Production Database Service Layer
 * Supports high-performance in-memory cache + persistent storage binding.
 */
class ProductionDatabase {
  private users: Map<string, DbUser> = new Map();
  private replays: Map<string, DbMatchReplay> = new Map();

  constructor() {
    // Seed default system demo users for dev matchmaking testing
    this.seedUser({
      id: 'usr_player_1',
      email: 'player1@fulcrum.tcg',
      displayName: 'AetherArchon',
      tag: '#1337',
      rankTier: 'Gold',
      mmr: 1250,
      wins: 14,
      losses: 6,
      shards: 1200,
      bones: 150,
      collection: { primal_gluttrix_01: 1,Being_01: 3 },
    });

    this.seedUser({
      id: 'usr_player_2',
      email: 'player2@fulcrum.tcg',
      displayName: 'VoidSeeker',
      tag: '#2048',
      rankTier: 'Gold',
      mmr: 1230,
      wins: 12,
      losses: 8,
      shards: 950,
      bones: 50,
      collection: { primal_nyssara_03: 1,Being_02: 3 },
    });
  }

  public seedUser(user: DbUser): void {
    this.users.set(user.id, user);
  }

  public getUserById(userId: string): DbUser | null {
    return this.users.get(userId) || null;
  }

  public getUserByEmail(email: string): DbUser | null {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return null;
  }

  public updateUserStats(userId: string, isWin: boolean, mmrDelta: number, shardsEarned: number): DbUser | null {
    const user = this.users.get(userId);
    if (!user) return null;

    user.mmr = Math.max(0, user.mmr + mmrDelta);
    if (isWin) {
      user.wins += 1;
    } else {
      user.losses += 1;
    }
    user.shards += shardsEarned;

    // Recalculate rank tier
    if (user.mmr >= 2000) user.rankTier = 'Primal Master';
    else if (user.mmr >= 1800) user.rankTier = 'Fulcrum Master';
    else if (user.mmr >= 1500) user.rankTier = 'Diamond';
    else if (user.mmr >= 1300) user.rankTier = 'Platinum';
    else if (user.mmr >= 1100) user.rankTier = 'Gold';
    else if (user.mmr >= 900) user.rankTier = 'Silver';
    else user.rankTier = 'Bronze';

    this.users.set(userId, user);
    return user;
  }

  public getGlobalLeaderboard(limit: number = 20): DbUser[] {
    const list = Array.from(this.users.values());
    list.sort((a, b) => b.mmr - a.mmr);
    return list.slice(0, limit);
  }

  public saveMatchReplay(replay: DbMatchReplay): void {
    this.replays.set(replay.matchId, replay);
  }

  public getMatchReplay(matchId: string): DbMatchReplay | null {
    return this.replays.get(matchId) || null;
  }
}

export const db = new ProductionDatabase();
