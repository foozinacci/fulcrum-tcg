import React, { useState, useEffect } from 'react';
import { socketClient, NetworkStatus } from '../network/socketClient';
import { Card, GameState } from '../types/game';
import { STARTER_DECK_A } from '../data/cards';
import { Globe, Users, X, Loader2, Zap, ShieldCheck, Trophy } from 'lucide-react';

interface OnlineMatchmakingModalProps {
  userId: string;
  onClose: () => void;
  onMatchStart: (matchId: string, role: 'player' | 'opponent', initialState: GameState) => void;
}

export const OnlineMatchmakingModal: React.FC<OnlineMatchmakingModalProps> = ({ userId, onClose, onMatchStart }) => {
  const [status, setStatus] = useState<NetworkStatus>('DISCONNECTED');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    socketClient.connect({
      onStatusChange: (newStatus) => setStatus(newStatus),
      onMatchFound: (matchId, role) => {
        console.log(`[CLIENT] Match found! Match ID: ${matchId}, Role: ${role}`);
      },
      onGameStateUpdate: (serverState) => {
        // Match started, transition UI to live game!
        onMatchStart('live_match', 'player', serverState);
        onClose();
      },
      onActionRejected: (reason) => {
        setErrorMessage(reason);
      },
    });

    return () => {
      // Clean up queue if unmounted while searching
      if (status === 'SEARCHING_MATCH') {
        socketClient.cancelMatchmaking(userId);
      }
    };
  }, [userId, onClose, onMatchStart]);

  const handleStartSearching = () => {
    setErrorMessage(null);
    socketClient.joinMatchmaking(userId, STARTER_DECK_A);
  };

  const handleCancelSearch = () => {
    socketClient.cancelMatchmaking(userId);
    setStatus('DISCONNECTED');
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-fulcrum-panel border-2 border-fulcrum-gold rounded-3xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(243,198,105,0.4)] relative text-center space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center gap-2 border-b border-white/10 pb-4">
          <Globe className="w-12 h-12 text-fulcrum-gold animate-spin mb-1" />
          <h3 className="font-serif font-black text-xl text-gold-gradient tracking-wide uppercase">
            Live 1v1 Online Matchmaking
          </h3>
          <p className="text-xs text-slate-400">Server-Authoritative Real-Time WebSocket Lobby</p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-950/80 border border-red-500 rounded-xl text-red-300 text-xs font-mono">
            {errorMessage}
          </div>
        )}

        {status === 'SEARCHING_MATCH' ? (
          <div className="py-6 flex flex-col items-center space-y-4">
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
            <div>
              <div className="font-serif font-bold text-amber-300 text-base">Searching for Opponent...</div>
              <p className="text-xs text-slate-400 mt-1">Matching by MMR & Cryptographic Deck Commitments</p>
            </div>
            <button
              onClick={handleCancelSearch}
              className="px-6 py-2 rounded-xl bg-red-950 hover:bg-red-900 border border-red-500 text-red-300 font-bold text-xs shadow-lg transition"
            >
              Cancel Matchmaking Queue
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-left font-mono text-xs">
              <div className="bg-black/50 border border-white/10 p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase">Server Status</span>
                <div className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Online (Port 4000)
                </div>
              </div>
              <div className="bg-black/50 border border-white/10 p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase">Match Format</span>
                <div className="text-amber-300 font-bold flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-fulcrum-gold" /> 1v1 Ranked Duel
                </div>
              </div>
            </div>

            <button
              onClick={handleStartSearching}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-fulcrum-gold via-amber-500 to-amber-600 text-slate-950 font-serif font-black text-sm uppercase tracking-widest shadow-[0_0_25px_rgba(243,198,105,0.5)] hover:scale-105 transition"
            >
              Find Live 1v1 Match
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
