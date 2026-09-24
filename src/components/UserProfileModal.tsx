import React, { useState } from 'react';
import { UserProfile, UserEconomy } from '../types/game';
import { User, Volume2, VolumeX, Shield, Trophy, Sparkles, X, Check, Award } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface UserProfileModalProps {
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
  economy: UserEconomy;
  onUpdateEconomy: (newEconomy: UserEconomy) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  onClose,
  userProfile,
  onUpdateProfile,
  economy,
  onUpdateEconomy,
}) => {
  const [displayName, setDisplayName] = useState(userProfile.displayName);
  const [selectedTitle, setSelectedTitle] = useState(userProfile.title);

  const handleSave = () => {
    soundFx.playVictorySound();
    onUpdateProfile({
      ...userProfile,
      displayName: displayName.trim() || 'Pact Master',
      title: selectedTitle,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-fulcrum-panel border-2 border-fulcrum-gold rounded-3xl max-w-xl w-full p-6 shadow-[0_0_50px_rgba(243,198,105,0.4)] flex flex-col gap-5 relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-fulcrum-border pb-3">
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-fulcrum-gold" />
            <div>
              <h2 className="font-serif font-black text-xl text-gold-gradient tracking-wide uppercase">
                PLAYER PROFILE & ACCOUNT SETTINGS
              </h2>
              <p className="text-xs text-slate-400 font-sans">Manage display name, titles, audio, and cosmetic card backs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Summary Banner */}
        <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-cyan-950/40 border border-fulcrum-border rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border-2 border-fulcrum-gold flex items-center justify-center shadow-lg font-serif font-black text-amber-300 text-xl">
              {displayName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-serif font-black text-lg text-gold-gradient">{displayName} {userProfile.tag}</div>
              <div className="text-xs text-amber-300 font-serif font-bold">{userProfile.title}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Rank: <span className="text-cyan-300 font-bold">{userProfile.rankTier} ({userProfile.mmr} MMR)</span>
              </div>
            </div>
          </div>

          <div className="text-right space-y-1 font-mono text-xs">
            <div className="text-emerald-400 font-bold">{userProfile.wins} Wins</div>
            <div className="text-red-400 font-bold">{userProfile.losses} Losses</div>
          </div>
        </div>

        {/* Display Name Input */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Display Name:</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 focus:border-fulcrum-gold text-xs text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none font-bold"
          />
        </div>

        {/* Title Selector */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Equipped Player Title:</label>
          <select
            value={selectedTitle}
            onChange={(e) => setSelectedTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-amber-300 font-bold text-xs rounded-xl px-3 py-2.5 focus:outline-none"
          >
            <option value="Avatar of the Fulcrum">Avatar of the Fulcrum</option>
            <option value="Gluttrix Core-Feaster">Gluttrix Core-Feaster</option>
            <option value="Nyssara Void Siphon">Nyssara Void Siphon</option>
            <option value="Kazrith Haste Master">Kazrith Haste Master</option>
            <option value="Grothmaw Spell-Duplicator">Grothmaw Spell-Duplicator</option>
            <option value="Vorrath Ironbound Veteran">Vorrath Ironbound Veteran</option>
          </select>
        </div>

        {/* Audio Toggles */}
        <div className="flex items-center justify-between bg-black/50 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            {userProfile.soundEnabled ? <Volume2 className="w-5 h-5 text-cyan-300" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
            <div>
              <div className="font-serif font-bold text-xs text-slate-200">Audio & Combat Sound Effects</div>
              <div className="text-[10px] text-slate-400">Play spell sounds, attack SFX, and win audio</div>
            </div>
          </div>

          <button
            onClick={() => onUpdateProfile({ ...userProfile, soundEnabled: !userProfile.soundEnabled })}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition ${
              userProfile.soundEnabled ? 'bg-emerald-950 border border-emerald-500 text-emerald-300' : 'bg-slate-900 text-slate-500 border border-slate-700'
            }`}
          >
            {userProfile.soundEnabled ? 'ENABLED' : 'MUTED'}
          </button>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-fulcrum-gold via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-serif font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2 transition transform hover:scale-105"
        >
          <Check className="w-4 h-4" />
          <span>Save Profile Changes</span>
        </button>
      </div>
    </div>
  );
};
