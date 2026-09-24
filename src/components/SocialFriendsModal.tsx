import React, { useState } from 'react';
import { Friend, GameFormat } from '../types/game';
import { Users, UserPlus, Swords, CheckCircle2, X, Circle } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface SocialFriendsModalProps {
  onClose: () => void;
  onChallengeFriend: (friend: Friend, format: GameFormat) => void;
}

const INITIAL_FRIENDS: Friend[] = [
  {
    id: 'f1',
    displayName: 'AetherCore',
    tag: '#1042',
    status: 'online',
    rankTier: 'Fulcrum Master',
    avatarId: 'a1',
  },
  {
    id: 'f2',
    displayName: 'Vortice_TCG',
    tag: '#8821',
    status: 'in_game',
    rankTier: 'Diamond',
    avatarId: 'a2',
  },
  {
    id: 'f3',
    displayName: 'GluttrixFan',
    tag: '#3319',
    status: 'offline',
    rankTier: 'Gold',
    avatarId: 'a3',
  },
];

export const SocialFriendsModal: React.FC<SocialFriendsModalProps> = ({ onClose, onChallengeFriend }) => {
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [newTagInput, setNewTagInput] = useState('');

  const handleAddFriend = () => {
    if (!newTagInput.trim()) return;
    soundFx.playVictorySound();
    const newFriend: Friend = {
      id: 'f_' + Date.now(),
      displayName: newTagInput.split('#')[0] || 'FulcrumPlayer',
      tag: newTagInput.includes('#') ? '#' + newTagInput.split('#')[1] : '#1337',
      status: 'online',
      rankTier: 'Silver',
      avatarId: 'a_default',
    };
    setFriends([...friends, newFriend]);
    setNewTagInput('');
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-fulcrum-panel border-2 border-fulcrum-gold rounded-3xl max-w-xl w-full p-6 shadow-[0_0_50px_rgba(243,198,105,0.4)] flex flex-col gap-5 relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-fulcrum-border pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-fulcrum-gold" />
            <div>
              <h2 className="font-serif font-black text-xl text-gold-gradient tracking-wide uppercase">
                FRIENDS LIST & SOCIAL LAYER
              </h2>
              <p className="text-xs text-slate-400 font-sans">Manage contacts, invite players, and issue direct match challenges</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Friend Input */}
        <div className="flex items-center gap-2 bg-black/50 border border-white/10 p-2 rounded-2xl">
          <UserPlus className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            placeholder="Enter Display Name #Tag (e.g. Player#1337)..."
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            className="bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none flex-1"
          />
          <button
            onClick={handleAddFriend}
            className="px-4 py-2 bg-gradient-to-r from-fulcrum-gold to-amber-600 text-slate-950 font-serif font-bold text-xs rounded-xl uppercase tracking-wider transition hover:scale-105"
          >
            Add Friend
          </button>
        </div>

        {/* Friends Roster List */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between bg-slate-900 border border-white/10 rounded-2xl p-4 transition hover:border-fulcrum-gold"
            >
              <div className="flex items-center gap-3">
                {/* Status Dot */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-950 border border-fulcrum-gold flex items-center justify-center font-bold text-xs text-amber-300">
                    {friend.displayName.substring(0, 2).toUpperCase()}
                  </div>
                  <Circle
                    className={`w-3.5 h-3.5 absolute -bottom-0.5 -right-0.5 fill-current rounded-full ${
                      friend.status === 'online'
                        ? 'text-emerald-400'
                        : friend.status === 'in_game'
                        ? 'text-amber-400 animate-pulse'
                        : 'text-slate-600'
                    }`}
                  />
                </div>

                <div>
                  <div className="font-serif font-bold text-sm text-slate-100 flex items-center gap-1.5">
                    <span>{friend.displayName}</span>
                    <span className="text-slate-500 font-mono text-xs">{friend.tag}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Rank: <span className="text-amber-300">{friend.rankTier}</span> • Status:{' '}
                    <span className="capitalize text-slate-300">{friend.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => {
                  soundFx.playButtonClickSound();
                  onChallengeFriend(friend, '1v1');
                }}
                disabled={friend.status === 'offline'}
                className={`px-4 py-2 rounded-xl font-serif font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition ${
                  friend.status !== 'offline'
                    ? 'bg-gradient-to-r from-amber-600 to-fulcrum-gold text-slate-950 shadow-md hover:scale-105'
                    : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <Swords className="w-3.5 h-3.5 fill-current" />
                <span>Challenge 1v1</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
