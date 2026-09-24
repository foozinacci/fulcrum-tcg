import { WebSocket, WebSocketServer } from 'ws';
import { GameState, GameAction, Card } from '../src/types/game';
import { createInitialGameState } from '../src/logic/gameEngine';
import { validateAction, executeValidatedAction } from '../src/logic/rulesEngine';
import { sanitizeStateForClient, createDeckCommitment } from '../src/logic/serverEngine';
import { db } from './db/database';

interface QueuePlayer {
  userId: string;
  socket: WebSocket;
  mmr: number;
  deck: Card[];
  joinedAt: number;
}

interface MatchRoom {
  matchId: string;
  p1: { userId: string; socket: WebSocket };
  p2: { userId: string; socket: WebSocket };
  state: GameState;
}

export class FulcrumSocketServer {
  private wss: WebSocketServer;
  private queue: QueuePlayer[] = [];
  private rooms: Map<string, MatchRoom> = new Map();

  constructor(wss: WebSocketServer) {
    this.wss = wss;
    this.init();
  }

  private init(): void {
    console.log('[SERVER] Fulcrum WebSocket Server initialized.');

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('[SOCKET] Client connected.');

      ws.on('message', (message: string) => {
        try {
          const payload = JSON.parse(message.toString());
          this.handleMessage(ws, payload);
        } catch (err) {
          console.error('[SOCKET ERROR] Failed to parse message:', err);
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });
    });

    // Matchmaking Queue Ticker (Every 2 seconds)
    setInterval(() => {
      this.processQueue();
    }, 2000);
  }

  private handleMessage(ws: WebSocket, payload: any): void {
    switch (payload.type) {
      case 'JOIN_MATCHMAKING': {
        const { userId, deck } = payload;
        // Async lookup — fall back to default MMR 1000 if user not found
        (async () => {
          const user = (await db.getUserById(userId)) ?? { id: userId, mmr: 1000 };

          // Remove existing queue instance if present
          this.queue = this.queue.filter((q) => q.userId !== userId);
          this.queue.push({
            userId,
            socket: ws,
            mmr: user.mmr,
            deck: deck || [],
            joinedAt: Date.now(),
          });

          ws.send(JSON.stringify({ type: 'QUEUE_JOINED', message: 'Searching for live opponent...' }));
          console.log(`[QUEUE] Player ${userId} (MMR: ${user.mmr}) joined queue. Total in queue: ${this.queue.length}`);
        })();
        break;
      }

      case 'LEAVE_MATCHMAKING': {
        const { userId } = payload;
        this.queue = this.queue.filter((q) => q.userId !== userId);
        ws.send(JSON.stringify({ type: 'QUEUE_LEFT', message: 'Matchmaking queue cancelled.' }));
        break;
      }

      case 'CLIENT_ACTION_INTENT': {
        const { matchId, action } = payload as { matchId: string; action: GameAction };
        const room = this.rooms.get(matchId);
        if (!room) {
          ws.send(JSON.stringify({ type: 'ACTION_REJECTED', reason: 'Match room not found.' }));
          return;
        }

        const isP1 = room.p1.socket === ws;
        const actionPlayerId: 'player' | 'opponent' = isP1 ? 'player' : 'opponent';
        action.playerId = actionPlayerId;

        // 1. Strict Rules Engine Validation
        const check = validateAction(room.state, action);
        if (!check.valid) {
          ws.send(JSON.stringify({ type: 'ACTION_REJECTED', errorCode: check.errorCode, reason: check.reason }));
          return;
        }

        // 2. Execute Validated State Mutation
        room.state = executeValidatedAction(room.state, action);

        // 3. Broadcast Sanitized States to both players
        this.broadcastState(room);

        // 4. Check Match Completion
        if (room.state.winner) {
          this.handleMatchEnd(room);
        }
        break;
      }
    }
  }

  private processQueue(): void {
    if (this.queue.length < 2) return;

    // Match top 2 players in queue
    const p1 = this.queue.shift()!;
    const p2 = this.queue.shift()!;

    const matchId = 'match_' + Math.random().toString(36).substring(2, 9);
    const initialGameState = createInitialGameState(p1.deck, p2.deck);

    const commitment = createDeckCommitment(matchId, p1.deck, p2.deck);

    const room: MatchRoom = {
      matchId,
      p1: { userId: p1.userId, socket: p1.socket },
      p2: { userId: p2.userId, socket: p2.socket },
      state: initialGameState,
    };

    this.rooms.set(matchId, room);

    // Notify P1 & P2
    p1.socket.send(JSON.stringify({ type: 'MATCH_FOUND', matchId, role: 'player', commitment }));
    p2.socket.send(JSON.stringify({ type: 'MATCH_FOUND', matchId, role: 'opponent', commitment }));

    this.broadcastState(room);
    console.log(`[MATCHMAKER] Created live match ${matchId} between ${p1.userId} and ${p2.userId}`);
  }

  private broadcastState(room: MatchRoom): void {
    const p1State = sanitizeStateForClient(room.state, 'player');
    const p2State = sanitizeStateForClient(room.state, 'opponent');

    if (room.p1.socket.readyState === WebSocket.OPEN) {
      room.p1.socket.send(JSON.stringify({ type: 'GAME_STATE_UPDATE', state: p1State }));
    }
    if (room.p2.socket.readyState === WebSocket.OPEN) {
      room.p2.socket.send(JSON.stringify({ type: 'GAME_STATE_UPDATE', state: p2State }));
    }
  }

  private async handleMatchEnd(room: MatchRoom): Promise<void> {
    const winnerId = room.state.winner === 'player' ? room.p1.userId : room.p2.userId;
    const loserId = room.state.winner === 'player' ? room.p2.userId : room.p1.userId;

    await db.updateUserStats(winnerId, true, +25, 100);
    await db.updateUserStats(loserId, false, -15, 25);

    await db.saveMatchReplay({
      matchId: room.matchId,
      player1Id: room.p1.userId,
      player2Id: room.p2.userId,
      winnerId,
      totalOrbits: room.state.turnNumber,
      steps: [],
      endedAt: new Date().toISOString(),
    });

    console.log(`[MATCH END] Match ${room.matchId} completed. Winner: ${winnerId}`);
    this.rooms.delete(room.matchId);
  }

  private handleDisconnect(ws: WebSocket): void {
    this.queue = this.queue.filter((q) => q.socket !== ws);
    for (const [matchId, room] of this.rooms.entries()) {
      if (room.p1.socket === ws || room.p2.socket === ws) {
        const remainingSocket = room.p1.socket === ws ? room.p2.socket : room.p1.socket;
        if (remainingSocket.readyState === WebSocket.OPEN) {
          remainingSocket.send(JSON.stringify({ type: 'OPPONENT_DISCONNECTED', message: 'Opponent disconnected. You win by forfeit!' }));
        }
        this.rooms.delete(matchId);
      }
    }
  }
}
