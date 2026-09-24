import { GameState, GameAction, Card } from '../types/game';

export type NetworkStatus = 'DISCONNECTED' | 'CONNECTING' | 'SEARCHING_MATCH' | 'IN_MATCH';

export interface NetworkMessageHandlers {
  onStatusChange?: (status: NetworkStatus) => void;
  onMatchFound?: (matchId: string, role: 'player' | 'opponent') => void;
  onGameStateUpdate?: (state: GameState) => void;
  onActionRejected?: (reason: string) => void;
  onOpponentDisconnected?: (message: string) => void;
}

export class FulcrumSocketClient {
  private socket: WebSocket | null = null;
  private serverUrl: string;
  private handlers: NetworkMessageHandlers = {};
  private currentStatus: NetworkStatus = 'DISCONNECTED';
  private matchId: string | null = null;

  constructor(serverUrl: string = 'ws://localhost:4000') {
    this.serverUrl = serverUrl;
  }

  public connect(handlers: NetworkMessageHandlers): void {
    this.handlers = handlers;
    this.setStatus('CONNECTING');

    try {
      this.socket = new WebSocket(this.serverUrl);

      this.socket.onopen = () => {
        console.log('[CLIENT NET] Connected to Fulcrum WebSocket Game Server.');
        this.setStatus('SEARCHING_MATCH');
      };

      this.socket.onmessage = (event: MessageEvent) => {
        try {
          const payload = JSON.parse(event.data);
          this.handleServerPayload(payload);
        } catch (err) {
          console.error('[CLIENT NET ERROR] Failed to parse payload:', err);
        }
      };

      this.socket.onclose = () => {
        console.log('[CLIENT NET] Disconnected from server.');
        this.setStatus('DISCONNECTED');
      };

      this.socket.onerror = (err) => {
        console.error('[CLIENT NET ERROR] Socket error:', err);
        this.setStatus('DISCONNECTED');
      };
    } catch (err) {
      console.error('[CLIENT NET EXCEPTION] Connection failed:', err);
      this.setStatus('DISCONNECTED');
    }
  }

  public joinMatchmaking(userId: string, deck: Card[]): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.connect(this.handlers);
    }
    this.send({ type: 'JOIN_MATCHMAKING', userId, deck });
    this.setStatus('SEARCHING_MATCH');
  }

  public cancelMatchmaking(userId: string): void {
    this.send({ type: 'LEAVE_MATCHMAKING', userId });
    this.setStatus('DISCONNECTED');
  }

  public sendActionIntent(action: GameAction): void {
    if (!this.matchId) return;
    this.send({ type: 'CLIENT_ACTION_INTENT', matchId: this.matchId, action });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.setStatus('DISCONNECTED');
  }

  private send(data: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  private handleServerPayload(payload: any): void {
    switch (payload.type) {
      case 'MATCH_FOUND':
        this.matchId = payload.matchId;
        this.setStatus('IN_MATCH');
        if (this.handlers.onMatchFound) {
          this.handlers.onMatchFound(payload.matchId, payload.role);
        }
        break;

      case 'GAME_STATE_UPDATE':
        if (this.handlers.onGameStateUpdate) {
          this.handlers.onGameStateUpdate(payload.state);
        }
        break;

      case 'ACTION_REJECTED':
        if (this.handlers.onActionRejected) {
          this.handlers.onActionRejected(payload.reason || 'Server rejected action.');
        }
        break;

      case 'OPPONENT_DISCONNECTED':
        if (this.handlers.onOpponentDisconnected) {
          this.handlers.onOpponentDisconnected(payload.message);
        }
        break;
    }
  }

  private setStatus(status: NetworkStatus): void {
    this.currentStatus = status;
    if (this.handlers.onStatusChange) {
      this.handlers.onStatusChange(status);
    }
  }

  public getStatus(): NetworkStatus {
    return this.currentStatus;
  }
}

export const socketClient = new FulcrumSocketClient();
