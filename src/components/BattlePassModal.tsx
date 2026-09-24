import React from 'react';
import { UserBattlePass, UserEconomy, BattlePassTier } from '../types/game';
import { Trophy, Sparkles, CheckCircle2, Lock, Coins, Zap, Package, X, Award } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface BattlePassModalProps {
  onClose: () => void;
  battlePass: UserBattlePass;
  onUpdateBattlePass: (newPass: UserBattlePass) => void;
  economy: UserEconomy;
  onUpdateEconomy: (newEco: UserEconomy) => void;
}

// Generate 50 Tiers
const BATTLE_PASS_TIERS: BattlePassTier[] = Array.from({ length: 50 }, (_, i) => {
  const lvl = i + 1;
  const isMilestone = lvl % 5 === 0;

  return {
    level: lvl,
    requiredXp: lvl * 200,
    freeReward: {
      type: 'shards',
      amount: isMilestone ? 500 : 150,
      label: `${isMilestone ? 500 : 150} Shards`,
    },
    premiumReward: {
      type: isMilestone ? 'bones' : 'pack',
      amount: isMilestone ? 100 : 1,
      label: isMilestone ? '100 Bones' : 'Booster Pack',
    },
  };
});

export const BattlePassModal: React.FC<BattlePassModalProps> = ({
  onClose,
  battlePass,
  onUpdateBattlePass,
  economy,
  onUpdateEconomy,
}) => {
  const handleClaimFree = (level: number) => {
    if (battlePass.currentLevel < level || battlePass.claimedFreeLevels.includes(level)) return;
    soundFx.playVictorySound();
    const tier = BATTLE_PASS_TIERS.find((t) => t.level === level);
    if (!tier) return;

    onUpdateBattlePass({
      ...battlePass,
      claimedFreeLevels: [...battlePass.claimedFreeLevels, level],
    });

    onUpdateEconomy({
      ...economy,
      shards: economy.shards + (tier.freeReward.amount || 150),
    });
  };

  const handleClaimPremium = (level: number) => {
    if (!battlePass.hasPremiumPass || battlePass.currentLevel < level || battlePass.claimedPremiumLevels.includes(level)) return;
    soundFx.playVictorySound();
    const tier = BATTLE_PASS_TIERS.find((t) => t.level === level);
    if (!tier) return;

    onUpdateBattlePass({
      ...battlePass,
      claimedPremiumLevels: [...battlePass.claimedPremiumLevels, level],
    });

    if (tier.premiumReward.type === 'bones') {
      onUpdateEconomy({
        ...economy,
        bones: economy.bones + (tier.premiumReward.amount || 100),
      });
    } else {
      onUpdateEconomy({
        ...economy,
        shards: economy.shards + 300,
      });
    }
  };

  const handleUnlockPremiumPass = () => {
    if (economy.bones < 500) {
      alert('Not enough Bones! Purchase Bones in Vault Store to unlock Premium Season Pass.');
      return;
    }
    soundFx.playVictorySound();
    onUpdateEconomy({
      ...economy,
      bones: economy.bones - 500,
    });
    onUpdateBattlePass({
      ...battlePass,
      hasPremiumPass: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-fulcrum-panel border-2 border-fulcrum-gold rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(243,198,105,0.4)]">
        {/* Header Banner */}
        <div className="p-6 border-b border-fulcrum-border bg-gradient-to-r from-amber-950/60 via-purple-950/60 to-cyan-950/60 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-fulcrum-gold" />
            <div>
              <h2 className="font-serif font-black text-2xl text-gold-gradient tracking-wide uppercase">
                SEASON 1: RISE OF THE PRIMALS BATTLE PASS
              </h2>
              <p className="text-xs text-slate-300">Level 1-50 Progression Track (Earn Shards, Bones & Cosmetics)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!battlePass.hasPremiumPass && (
              <button
                onClick={handleUnlockPremiumPass}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-fulcrum-gold via-amber-500 to-amber-600 text-slate-950 font-serif font-black text-xs uppercase tracking-widest shadow-lg transition transform hover:scale-105 flex items-center gap-1.5"
              >
                <Coins className="w-4 h-4 fill-current" />
                <span>Unlock Premium (500 Bones)</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Level & XP Status */}
        <div className="px-6 py-3 bg-slate-950/90 border-b border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="font-serif font-bold text-amber-300 text-sm">Level {battlePass.currentLevel}</span>
            <div className="w-48 bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/10">
              <div
                className="bg-gradient-to-r from-cyan-400 to-fulcrum-gold h-full"
                style={{ width: `${(battlePass.currentXp / 1000) * 100}%` }}
              />
            </div>
            <span className="font-mono text-slate-400">{battlePass.currentXp} / 1000 XP</span>
          </div>

          <span className="text-[11px] text-slate-400">Earn XP by playing matches & completing daily quests</span>
        </div>

        {/* Battle Pass Track Grid */}
        <div className="p-6 overflow-y-auto max-h-[65vh] space-y-3">
          {BATTLE_PASS_TIERS.map((tier) => {
            const isUnlocked = battlePass.currentLevel >= tier.level;
            const claimedFree = battlePass.claimedFreeLevels.includes(tier.level);
            const claimedPremium = battlePass.claimedPremiumLevels.includes(tier.level);

            return (
              <div
                key={tier.level}
                className={`flex items-center justify-between border rounded-2xl p-4 transition ${
                  isUnlocked ? 'bg-black/50 border-fulcrum-border' : 'bg-black/30 border-white/5 opacity-60'
                }`}
              >
                {/* Level Badge */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-fulcrum-gold flex items-center justify-center font-mono font-bold text-amber-300 text-sm">
                    {tier.level}
                  </div>

                  {/* Free Reward */}
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-cyan-300 font-bold uppercase">Free Track</div>
                    <div className="text-xs font-serif font-bold text-slate-100">{tier.freeReward.label}</div>
                  </div>
                </div>

                {/* Premium Reward */}
                <div className="space-y-0.5 text-center">
                  <div className="text-[10px] text-amber-300 font-bold uppercase flex items-center gap-1 justify-center">
                    <Sparkles className="w-3 h-3 text-fulcrum-gold" /> Premium Track
                  </div>
                  <div className="text-xs font-serif font-bold text-amber-200">{tier.premiumReward.label}</div>
                </div>

                {/* Claim Buttons */}
                <div className="flex items-center gap-2">
                  {/* Free Claim */}
                  {claimedFree ? (
                    <span className="px-3 py-1 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Free Claimed
                    </span>
                  ) : (
                    <button
                      onClick={() => handleClaimFree(tier.level)}
                      disabled={!isUnlocked}
                      className={`px-3 py-1.5 rounded-xl font-serif font-bold text-[10px] uppercase transition ${
                        isUnlocked
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-md'
                          : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                      }`}
                    >
                      Claim Free
                    </button>
                  )}

                  {/* Premium Claim */}
                  {claimedPremium ? (
                    <span className="px-3 py-1 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Premium Claimed
                    </span>
                  ) : (
                    <button
                      onClick={() => handleClaimPremium(tier.level)}
                      disabled={!isUnlocked || !battlePass.hasPremiumPass}
                      className={`px-3 py-1.5 rounded-xl font-serif font-bold text-[10px] uppercase transition ${
                        isUnlocked && battlePass.hasPremiumPass
                          ? 'bg-fulcrum-gold hover:bg-amber-400 text-slate-950 shadow-md'
                          : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                      }`}
                    >
                      {battlePass.hasPremiumPass ? 'Claim Premium' : 'Locked'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
