import React, { useState, useEffect } from 'react';
import { GameFormat, UserProfile } from '../types/game';
import { Swords, Shield, Trophy, Users, Zap, X, CheckCircle, RefreshCw } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface MatchmakingModalProps {
  onClose: () => void;
  userProfile: UserProfile;
  onStartMatch: (format: GameFormat, isRanked: boolean) => void;
}

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({ onClose, userProfile, onStartMatch }) => {
  const [activeTab, setActiveTab] = useState<'ranked' | 'casual'>('ranked');
  const [selectedFormat, setSelectedFormat] = useState<GameFormat>('1v1');
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimer, setSearchTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      interval = setInterval(() => {
        setSearchTimer((prev) => {
          if (prev >= 3) {
            // Found match!
            clearInterval(interval);
            soundFx.playVictorySound();
            onStartMatch(selectedFormat, activeTab === 'ranked');
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setSearchTimer(0);
    }
    return () => clearInterval(interval);
  }, [isSearching, selectedFormat, activeTab, onStartMatch]);

  const handleStartQueue = () => {
    soundFx.playButtonClickSound();
    setIsSearching(true);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-fulcrum-panel border-2 border-fulcrum-gold rounded-3xl max-w-xl w-full p-6 shadow-[0_0_50px_rgba(243,198,105,0.4)] flex flex-col gap-5 relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-fulcrum-border pb-4">
          <div className="flex items-center gap-2">
            <Swords className="w-6 h-6 text-fulcrum-gold" />
            <div>
              <h2 className="font-serif font-black text-xl text-gold-gradient tracking-wide uppercase">
                AUTOMATED MATCHMAKING QUEUES
              </h2>
              <p className="text-xs text-slate-400 font-sans">Find opponents automatically via MMR skill pairing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 gap-3 bg-slate-950 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => {
              soundFx.playButtonClickSound();
              setActiveTab('ranked');
            }}
            className={`py-3 rounded-xl font-serif font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition ${
              activeTab === 'ranked'
                ? 'bg-gradient-to-r from-amber-600 to-fulcrum-gold text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Ranked Ladder</span>
          </button>

          <button
            onClick={() => {
              soundFx.playButtonClickSound();
              setActiveTab('casual');
            }}
            className={`py-3 rounded-xl font-serif font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition ${
              activeTab === 'casual'
                ? 'bg-gradient-to-r from-cyan-600 to-cyan-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Casual Automatch</span>
          </button>
        </div>

        {/* Player Rank Badge Info */}
        {activeTab === 'ranked' && (
          <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-900 border border-amber-400 flex items-center justify-center font-serif font-black text-amber-300 text-sm shadow-md">
                🏆
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-bold">Current Division</div>
                <div className="font-serif font-bold text-amber-300 text-base">{userProfile.rankTier}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 font-bold uppercase">Rating MMR</div>
              <div className="font-mono font-bold text-cyan-300 text-sm">{userProfile.mmr} MMR</div>
            </div>
          </div>
        )}

        {/* Format Selector */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Select Match Format:</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { format: '1v1', label: '1v1 Competitive Duel', desc: 'Standard 20 HP / 10 Primal' },
              { format: '2v2', label: '2v2 Team Duel', desc: '40 HP Team Pool / 20 Primal' },
              { format: '1v2', label: '1v2 Boss Fight', desc: 'Solo 60 HP vs Team 30 HP' },
              { format: '1v1v1', label: '3-Player Free-For-All', desc: '30 HP each / 15 Primal' },
            ].map((f) => (
              <button
                key={f.format}
                onClick={() => setSelectedFormat(f.format as GameFormat)}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                  selectedFormat === f.format
                    ? 'bg-amber-950/80 border-fulcrum-gold text-amber-300 shadow-md'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="font-serif font-bold text-xs flex items-center justify-between">
                  <span>{f.label}</span>
                  {selectedFormat === f.format && <CheckCircle className="w-3.5 h-3.5 text-fulcrum-gold" />}
                </div>
                <div className="text-[10px] text-slate-400">{f.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Queue Searching Status */}
        {isSearching ? (
          <div className="bg-black/60 border border-cyan-500/50 rounded-2xl p-6 flex flex-col items-center gap-3 text-center animate-pulse">
            <RefreshCw className="w-8 h-8 text-cyan-300 animate-spin" />
            <div>
              <div className="font-serif font-bold text-cyan-300 text-sm uppercase">Searching for Opponent...</div>
              <div className="text-xs text-slate-400 mt-0.5">Matching MMR within +/- 50 rating ({searchTimer}s)</div>
            </div>
            <button
              onClick={() => setIsSearching(false)}
              className="mt-2 px-4 py-1.5 rounded-xl bg-red-950 hover:bg-red-900 border border-red-500 text-red-300 font-bold text-xs transition"
            >
              Cancel Queue
            </button>
          </div>
        ) : (
          <button
            onClick={handleStartQueue}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-fulcrum-gold via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-serif font-black tracking-widest uppercase text-base shadow-[0_0_25px_rgba(243,198,105,0.4)] flex items-center justify-center gap-3 transition transform hover:scale-[1.02]"
          >
            <Swords className="w-5 h-5 fill-current" />
            <span>ENTER {activeTab.toUpperCase()} QUEUE</span>
          </button>
        )}
      </div>
    </div>
  );
};
