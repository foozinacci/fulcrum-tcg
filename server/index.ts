import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import { FulcrumSocketServer } from './socketServer';
import { db } from './db/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ----------------------------------------------------------------------------
// REST API ENDPOINTS
// ----------------------------------------------------------------------------

// 1. Server Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'FULCRUM TCG Game Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 2. Global Ranked Leaderboard
app.get('/api/leaderboard', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const leaderboard = db.getGlobalLeaderboard(limit);
  res.json({ success: true, leaderboard });
});

// 3. User Profile & MMR Query
app.get('/api/profile/:userId', (req, res) => {
  const user = db.getUserById(req.params.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User profile not found.' });
  }
  res.json({ success: true, user });
});

// 4. Match Replay Audit Query
app.get('/api/replays/:matchId', (req, res) => {
  const replay = db.getMatchReplay(req.params.matchId);
  if (!replay) {
    return res.status(404).json({ success: false, message: 'Match replay audit log not found.' });
  }
  res.json({ success: true, replay });
});

// ----------------------------------------------------------------------------
// HTTP & WEBSOCKET SERVER BINDING
// ----------------------------------------------------------------------------
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Initialize WebSocket matchmaker & room manager
new FulcrumSocketServer(wss);

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`FULCRUM TCG STANDALONE GAME SERVER RUNNING ON PORT ${PORT}`);
  console.log(`REST API: http://localhost:${PORT}/api/health`);
  console.log(`WEBSOCKET: ws://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
