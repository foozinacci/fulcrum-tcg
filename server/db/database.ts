import { ReplayStep } from '../../src/types/game';
import { supabase } from './supabaseClient';

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

// ---------------------------------------------------------------------------
// Internal helpers: map between camelCase DbUser and snake_case Supabase rows
// ---------------------------------------------------------------------------

function rowToDbUser(row: Record<string, unknown>): DbUser {
  return {
    id: row.id as string,
    email: row.email as string,
    displayName: row.display_name as string,
    tag: row.tag as string,
    rankTier: row.rank_tier as string,
    mmr: row.mmr as number,
    wins: row.wins as number,
    losses: row.losses as number,
    shards: row.shards as number,
    bones: row.bones as number,
    collection: (row.collection as Record<string, number>) ?? {},
  };
}

function replayToRow(replay: DbMatchReplay): Record<string, unknown> {
  return {
    match_id: replay.matchId,
    player1_id: replay.player1Id,
    player2_id: replay.player2Id,
    winner_id: replay.winnerId,
    format: 'Ranked1v1',
    total_orbits: replay.totalOrbits,
    replay_json: replay.steps,
    ended_at: replay.endedAt,
  };
}

function rowToDbReplay(row: Record<string, unknown>): DbMatchReplay {
  return {
    matchId: row.match_id as string,
    player1Id: row.player1_id as string,
    player2Id: row.player2_id as string,
    winnerId: row.winner_id as string,
    totalOrbits: row.total_orbits as number,
    steps: (row.replay_json as ReplayStep[]) ?? [],
    endedAt: row.ended_at as string,
  };
}

function deriveRankTier(mmr: number): string {
  if (mmr >= 2000) return 'Primal Master';
  if (mmr >= 1800) return 'Fulcrum Master';
  if (mmr >= 1500) return 'Diamond';
  if (mmr >= 1300) return 'Platinum';
  if (mmr >= 1100) return 'Gold';
  if (mmr >= 900) return 'Silver';
  return 'Bronze';
}

/**
 * Production Database Service Layer
 * Supports high-performance in-memory cache + persistent Supabase cloud binding.
 *
 * When SUPABASE_URL and SUPABASE_ANON_KEY are set in .env, all reads/writes
 * are routed to the live Supabase PostgreSQL database (schema.sql tables).
 * When those env vars are absent, falls back to the existing in-memory Maps —
 * zero behavior change for local development.
 */
class ProductionDatabase {
  private users: Map<string, DbUser> = new Map();
  private replays: Map<string, DbMatchReplay> = new Map();

  constructor() {
    if (supabase) {
      console.log('[DB] Using Supabase cloud database');
    } else {
      console.log('[DB] Supabase not configured — using in-memory store');
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
        collection: { primal_gluttrix_01: 1, Being_01: 3 },
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
        collection: { primal_nyssara_03: 1, Being_02: 3 },
      });
    }
  }

  public seedUser(user: DbUser): void {
    this.users.set(user.id, user);
  }

  public async getUserById(userId: string): Promise<DbUser | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (error) {
        console.error('[DB] getUserById error:', error.message);
        return null;
      }
      return data ? rowToDbUser(data as Record<string, unknown>) : null;
    }
    return this.users.get(userId) ?? null;
  }

  public async getUserByEmail(email: string): Promise<DbUser | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email)
        .maybeSingle();
      if (error) {
        console.error('[DB] getUserByEmail error:', error.message);
        return null;
      }
      return data ? rowToDbUser(data as Record<string, unknown>) : null;
    }
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return null;
  }

  public async updateUserStats(
    userId: string,
    isWin: boolean,
    mmrDelta: number,
    shardsEarned: number,
  ): Promise<DbUser | null> {
    if (supabase) {
      // Fetch current values first so we can compute new totals
      const current = await this.getUserById(userId);
      if (!current) return null;

      const newMmr = Math.max(0, current.mmr + mmrDelta);
      const updates: Record<string, unknown> = {
        mmr: newMmr,
        rank_tier: deriveRankTier(newMmr),
        shards: current.shards + shardsEarned,
        wins: isWin ? current.wins + 1 : current.wins,
        losses: isWin ? current.losses : current.losses + 1,
      };

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .maybeSingle();

      if (error) {
        console.error('[DB] updateUserStats error:', error.message);
        return null;
      }
      return data ? rowToDbUser(data as Record<string, unknown>) : null;
    }

    // In-memory fallback
    const user = this.users.get(userId);
    if (!user) return null;

    user.mmr = Math.max(0, user.mmr + mmrDelta);
    if (isWin) { user.wins += 1; } else { user.losses += 1; }
    user.shards += shardsEarned;
    user.rankTier = deriveRankTier(user.mmr);

    this.users.set(userId, user);
    return user;
  }

  public async getGlobalLeaderboard(limit: number = 20): Promise<DbUser[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('mmr', { ascending: false })
        .limit(limit);
      if (error) {
        console.error('[DB] getGlobalLeaderboard error:', error.message);
        return [];
      }
      return (data as Record<string, unknown>[]).map(rowToDbUser);
    }
    const list = Array.from(this.users.values());
    list.sort((a, b) => b.mmr - a.mmr);
    return list.slice(0, limit);
  }

  public async saveMatchReplay(replay: DbMatchReplay): Promise<void> {
    if (supabase) {
      const { error } = await supabase
        .from('match_replays')
        .upsert(replayToRow(replay), { onConflict: 'match_id' });
      if (error) {
        console.error('[DB] saveMatchReplay error:', error.message);
      }
      return;
    }
    this.replays.set(replay.matchId, replay);
  }

  public async getMatchReplay(matchId: string): Promise<DbMatchReplay | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from('match_replays')
        .select('*')
        .eq('match_id', matchId)
        .maybeSingle();
      if (error) {
        console.error('[DB] getMatchReplay error:', error.message);
        return null;
      }
      return data ? rowToDbReplay(data as Record<string, unknown>) : null;
    }
    return this.replays.get(matchId) ?? null;
  }
}

export const db = new ProductionDatabase();
