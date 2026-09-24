-- FULCRUM TCG PRODUCTION DATABASE SCHEMA (PostgreSQL / Supabase Compatible)

-- 1. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(64) NOT NULL,
    tag VARCHAR(10) NOT NULL,
    rank_tier VARCHAR(32) DEFAULT 'Iron',
    mmr INT DEFAULT 1000,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    shards INT DEFAULT 500,
    bones INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Card Collections
CREATE TABLE IF NOT EXISTS user_collections (
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    card_id VARCHAR(64) NOT NULL,
    count INT DEFAULT 1,
    PRIMARY KEY (user_id, card_id)
);

-- 3. Ranked Leaderboard View
CREATE OR REPLACE VIEW global_leaderboard AS
SELECT 
    id,
    display_name,
    tag,
    rank_tier,
    mmr,
    wins,
    losses,
    ROUND((wins::numeric / NULLIF(wins + losses, 0)::numeric) * 100, 1) as win_rate
FROM users
ORDER BY mmr DESC;

-- 4. Match Replays & Audit Logs
CREATE TABLE IF NOT EXISTS match_replays (
    match_id VARCHAR(64) PRIMARY KEY,
    player1_id VARCHAR(64) REFERENCES users(id),
    player2_id VARCHAR(64) REFERENCES users(id),
    winner_id VARCHAR(64) REFERENCES users(id),
    format VARCHAR(32) NOT NULL,
    total_orbits INT NOT NULL,
    replay_json JSONB NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
