import React, { useState, useEffect } from 'react';
import { GameState, Card, UserEconomy, UserProfile, UserBattlePass, ReplayStep, GameFormat } from './types/game';
import { createInitialGameState } from './logic/gameEngine';
import { PRIMAL_AVATARS_LIST, STARTER_DECK_A } from './data/cards';

// Core Components
import { GameBoard } from './components/GameBoard';
import { FulcrumNextGenArena } from './components/FulcrumNextGenArena';
import { Playmat3DBoard } from './components/Playmat3DBoard';
import { DeckBuilder } from './components/DeckBuilder';
import { CardCodex } from './components/CardCodex';
import { VaultStore } from './components/VaultStore';
import { RulesModal } from './components/RulesModal';
import { ParticleCanvas } from './components/ParticleCanvas';

// 9 Feature Systems
import { TutorialOverlay } from './components/TutorialOverlay';
import { CollectionBinder } from './components/CollectionBinder';
import { MatchmakingModal } from './components/MatchmakingModal';
import { OnlineMatchmakingModal } from './components/OnlineMatchmakingModal';
import { DraftSealedModal } from './components/DraftSealedModal';
import { OracleSearchModal } from './components/OracleSearchModal';
import { ReplayViewer } from './components/ReplayViewer';
import { BattlePassModal } from './components/BattlePassModal';
import { SocialFriendsModal } from './components/SocialFriendsModal';
import { UserProfileModal } from './components/UserProfileModal';

import { Play, Shield, BookOpen, Layers, Sparkles, ShoppingBag, Trophy, Users, User, Clock, GraduationCap, Swords, Package, Search, Cpu } from 'lucide-react';
import { soundFx } from './utils/soundFx';

type ViewMode = 'menu' | 'game' | 'deckbuilder' | 'codex' | 'store' | 'binder' | 'draft' | 'stage3d';

function calculateRankTier(mmr: number): UserProfile['rankTier'] {
  if (mmr >= 2000) return 'Primal Master';
  if (mmr >= 1800) return 'Fulcrum Master';
  if (mmr >= 1600) return 'Diamond';
  if (mmr >= 1400) return 'Platinum';
  if (mmr >= 1200) return 'Gold';
  if (mmr >= 1100) return 'Silver';
  if (mmr >= 1000) return 'Bronze';
  return 'Iron';
}

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('menu');
  const [customDeck, setCustomDeck] = useState<Card[] | undefined>(undefined);
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Economy State (Persistent)
  const [economy, setEconomy] = useState<UserEconomy>(() => {
    const saved = localStorage.getItem('fulcrum_economy');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { shards: 1500, bones: 200, collection: {}, unlockedCardBacks: ['standard'], activeCardBack: 'standard' };
  });

  // User Profile State (Persistent)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('fulcrum_user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      displayName: 'Commander',
      tag: '#' + Math.floor(1000 + Math.random() * 9000),
      avatarId: 'a1',
      title: 'Initiate Commander',
      activeCardBack: 'standard',
      rankTier: 'Bronze',
      mmr: 1000,
      wins: 0,
      losses: 0,
      favoritePact: 'Corefeast',
      soundEnabled: true,
      musicEnabled: true,
    };
  });

  // Battle Pass State (Persistent)
  const [battlePass, setBattlePass] = useState<UserBattlePass>(() => {
    const saved = localStorage.getItem('fulcrum_battle_pass');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      currentLevel: 1,
      currentXp: 0,
      hasPremiumPass: false,
      claimedFreeLevels: [],
      claimedPremiumLevels: [],
    };
  });

  // Replays State (Persistent)
  const [replaySteps, setReplaySteps] = useState<ReplayStep[]>(() => {
    const saved = localStorage.getItem('fulcrum_replays');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Modal Visibilities
  const [showRules, setShowRules] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showMatchmaking, setShowMatchmaking] = useState(false);
  const [showOnlineMatchmaking, setShowOnlineMatchmaking] = useState(false);
  const [showOracle, setShowOracle] = useState(false);
  const [showReplay, setShowReplay] = useState(false);
  const [showBattlePass, setShowBattlePass] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleUpdateEconomy = (newEconomy: UserEconomy) => {
    setEconomy(newEconomy);
    localStorage.setItem('fulcrum_economy', JSON.stringify(newEconomy));
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('fulcrum_user_profile', JSON.stringify(newProfile));
  };

  const handleUpdateBattlePass = (newPass: UserBattlePass) => {
    setBattlePass(newPass);
    localStorage.setItem('fulcrum_battle_pass', JSON.stringify(newPass));
  };

  useEffect(() => {
    const saved = localStorage.getItem('fulcrum_custom_deck');
    if (saved) {
      try { setCustomDeck(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const handleStartGame = (overrideDeck?: Card[], isTutorial: boolean = false) => {
    soundFx.playVictorySound();
    const savedAvatarId = localStorage.getItem('fulcrum_primal_avatar_id');
    const pAvatar = PRIMAL_AVATARS_LIST.find((a: Card) => a.id === savedAvatarId) || PRIMAL_AVATARS_LIST[1] || PRIMAL_AVATARS_LIST[0];
    const oAvatar = PRIMAL_AVATARS_LIST[0];
    const deckToUse = overrideDeck || customDeck;
    const initial = createInitialGameState(deckToUse, undefined, pAvatar, oAvatar);
    setGameState(initial);
    setViewMode('game');
    if (isTutorial) setShowTutorial(true);
  };

  // Real Match Conclusion Handler: Updates Profile MMR, Battle Pass XP, Economy Shards, & Records Replay
  const handleMatchEnd = (winner: 'player' | 'opponent', logs: any[]) => {
    const isWin = winner === 'player';
    
    // 1. Update Profile Stats & MMR
    const newWins = isWin ? userProfile.wins + 1 : userProfile.wins;
    const newLosses = isWin ? userProfile.losses : userProfile.losses + 1;
    const mmrChange = isWin ? 25 : -15;
    const newMmr = Math.max(500, userProfile.mmr + mmrChange);
    const newRank = calculateRankTier(newMmr);

    const updatedProfile: UserProfile = {
      ...userProfile,
      wins: newWins,
      losses: newLosses,
      mmr: newMmr,
      rankTier: newRank,
    };
    handleUpdateProfile(updatedProfile);

    // 2. Award Shards Currency
    const shardReward = isWin ? 150 : 50;
    const updatedEconomy: UserEconomy = {
      ...economy,
      shards: economy.shards + shardReward,
    };
    handleUpdateEconomy(updatedEconomy);

    // 3. Award Battle Pass XP
    const xpReward = isWin ? 250 : 100;
    let nextXp = battlePass.currentXp + xpReward;
    let nextLvl = battlePass.currentLevel;
    if (nextXp >= 1000 && nextLvl < 50) {
      nextXp -= 1000;
      nextLvl += 1;
    }
    const updatedPass: UserBattlePass = {
      ...battlePass,
      currentLevel: nextLvl,
      currentXp: nextXp,
    };
    handleUpdateBattlePass(updatedPass);

    // 4. Record & Save Real Match Replay
    if (logs && logs.length > 0) {
      const realReplay: ReplayStep[] = logs.map((log: any, idx: number) => ({
        stepIndex: idx,
        turnNumber: Math.floor(idx / 2) + 1,
        turnOwner: idx % 2 === 0 ? 'player' : 'opponent',
        logText: log.text || 'Action executed',
        playerLife: 20,
        opponentLife: 20,
        playerCore: 0,
        opponentCore: 0,
        playerFieldCount: 0,
        opponentFieldCount: 0,
      }));
      setReplaySteps(realReplay);
      localStorage.setItem('fulcrum_replays', JSON.stringify(realReplay));
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden select-none bg-[#080512]">
      {/* Background Cosmic Canvas */}
      <ParticleCanvas />

      {/* Main View Switcher */}
      {viewMode === 'menu' && (
        <div className="relative z-10 flex flex-col items-center justify-between min-h-screen p-4 md:p-6 max-w-6xl mx-auto">
          {/* Top User Profile & Social Header Bar */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-fulcrum-panel/90 border border-fulcrum-border rounded-2xl px-5 py-3 shadow-2xl">
            {/* Player Profile Badge */}
            <button
              onClick={() => { soundFx.playButtonClickSound(); setShowProfile(true); }}
              className="flex items-center gap-3 hover:opacity-90 transition text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-fulcrum-gold flex items-center justify-center font-serif font-black text-amber-300 text-sm shadow font-mono">
                {userProfile.displayName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-serif font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  <span>{userProfile.displayName}</span>
                  <span className="text-[10px] text-amber-400 font-mono px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/40">
                    {userProfile.rankTier} ({userProfile.mmr} MMR)
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">{userProfile.title} • {userProfile.wins}W / {userProfile.losses}L</div>
              </div>
            </button>

            {/* Quick Action Header Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => { soundFx.playButtonClickSound(); setShowFriends(true); }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-serif font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Users className="w-3.5 h-3.5 text-cyan-300" />
                <span>Friends</span>
              </button>

              <button
                onClick={() => { soundFx.playButtonClickSound(); setShowBattlePass(true); }}
                className="px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300 font-serif font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Trophy className="w-3.5 h-3.5 text-fulcrum-gold" />
                <span>Battle Pass (Lvl {battlePass.currentLevel})</span>
              </button>

              <button
                onClick={() => { soundFx.playButtonClickSound(); setShowOracle(true); }}
                className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-300 font-serif font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Search className="w-3.5 h-3.5 text-purple-400" />
                <span>Oracle Search</span>
              </button>
            </div>
          </div>

          {/* Central Logo Banner */}
          <div className="flex flex-col items-center text-center my-4">
            <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-fulcrum-panel border border-fulcrum-border text-xs text-fulcrum-gold font-serif mb-2 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-fulcrum-gold animate-pulse" />
              <span>OFFICIAL FULCRUM TCG SIMULATOR</span>
            </div>
            <h1 className="font-serif font-black text-6xl md:text-7xl text-gold-gradient tracking-widest drop-shadow-[0_0_35px_rgba(243,198,105,0.4)]">
              FULCRUM
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-md font-sans mt-1">
              Master Core conversion, Pace timing, Expedite casts, and Primal Head-Removal.
            </p>
          </div>

          {/* Central Card Stage */}
          <div className="my-2 relative group cursor-pointer" onClick={() => handleStartGame()}>
            <div className="w-48 h-72 rounded-2xl overflow-hidden border-2 border-fulcrum-gold shadow-[0_0_40px_rgba(243,198,105,0.3)] transition-transform duration-500 transform group-hover:scale-105 group-hover:rotate-1">
              <img src="/assets/card-back.jpg" alt="FULCRUM Card Back" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-cyan-500/20 blur-xl pointer-events-none -z-10 group-hover:opacity-100 opacity-60 transition" />
          </div>

          {/* Action Navigation Menu */}
          <div className="w-full max-w-2xl flex flex-col gap-2.5 mb-4">
            {/* Row 1: Main Play & Matchmaking */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => handleStartGame()}
                className="py-3.5 rounded-2xl bg-gradient-to-r from-fulcrum-gold via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-serif font-black uppercase text-base shadow-[0_0_20px_rgba(243,198,105,0.4)] flex items-center justify-center gap-2 transition transform hover:scale-[1.02]"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Play VS AI Bot</span>
              </button>

              <button
                onClick={() => { soundFx.playButtonClickSound(); setShowOnlineMatchmaking(true); }}
                className="py-3.5 rounded-2xl bg-gradient-to-r from-cyan-950 via-slate-900 to-amber-950 border border-cyan-500/50 hover:border-fulcrum-gold text-amber-300 font-serif font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition hover:scale-[1.02] shadow-lg"
              >
                <Swords className="w-4 h-4 text-cyan-300" />
                <span>Matchmaking Queues</span>
              </button>

              <button
                onClick={() => { soundFx.playButtonClickSound(); handleStartGame(undefined, true); }}
                className="py-3.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/50 text-emerald-300 font-serif font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition hover:scale-[1.02] shadow-lg"
              >
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>Guided Tutorial</span>
              </button>
            </div>

            {/* Row 2: Limited Formats, Collection Binder & Store */}
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => { soundFx.playButtonClickSound(); setViewMode('draft'); }}
                className="py-3 rounded-xl bg-fulcrum-panel/90 border border-fulcrum-border hover:border-fulcrum-gold text-slate-200 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition hover:bg-slate-800"
              >
                <Package className="w-4 h-4 text-amber-400" />
                <span>Draft & Sealed</span>
              </button>

              <button
                onClick={() => { soundFx.playButtonClickSound(); setViewMode('binder'); }}
                className="py-3 rounded-xl bg-fulcrum-panel/90 border border-fulcrum-border hover:border-fulcrum-gold text-slate-200 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition hover:bg-slate-800"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Collection Binder</span>
              </button>

              <button
                onClick={() => { soundFx.playButtonClickSound(); setViewMode('store'); }}
                className="py-3 rounded-xl bg-fulcrum-panel/90 border border-fulcrum-border hover:border-fulcrum-gold text-amber-300 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition hover:bg-slate-800"
              >
                <ShoppingBag className="w-4 h-4 text-cyan-300" />
                <span>Vault Store ({economy.shards} Shards)</span>
              </button>
            </div>

            {/* Row 3: 3D Stage, Forge, Codex, Replay & Rules */}
            <div className="grid grid-cols-5 gap-2">
              <button
                onClick={() => { soundFx.playButtonClickSound(); setViewMode('stage3d'); }}
                className="py-2.5 rounded-xl bg-purple-950/80 border border-purple-500 hover:border-purple-400 text-purple-200 font-serif font-bold text-xs flex items-center justify-center gap-1 transition"
              >
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>3D Stage</span>
              </button>

              <button
                onClick={() => { soundFx.playButtonClickSound(); setViewMode('deckbuilder'); }}
                className="py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-slate-500 text-slate-300 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Layers className="w-3.5 h-3.5 text-fulcrum-gold" />
                <span>Forge</span>
              </button>

              <button
                onClick={() => { soundFx.playButtonClickSound(); setViewMode('codex'); }}
                className="py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-slate-500 text-slate-300 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Codex</span>
              </button>

              <button
                onClick={() => { soundFx.playButtonClickSound(); setShowReplay(true); }}
                className="py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-slate-500 text-slate-300 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Clock className="w-3.5 h-3.5 text-lime-400" />
                <span>Replay Log</span>
              </button>

              <button
                onClick={() => { soundFx.playButtonClickSound(); setShowRules(true); }}
                className="py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-slate-500 text-slate-300 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>Rules GDD</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Board View (Next-Gen Cosmic Art-Deco Arena) */}
      {viewMode === 'game' && gameState && (
        <FulcrumNextGenArena
          initialState={gameState}
          onRestart={() => {
            const fresh = createInitialGameState(customDeck);
            setGameState(fresh);
          }}
          onMatchEnd={handleMatchEnd}
        />
      )}

      {/* Server-Authoritative 3D Stage View */}
      {viewMode === 'stage3d' && (
        <Playmat3DBoard
          initialState={createInitialGameState(customDeck)}
          onRestart={() => setViewMode('menu')}
        />
      )}

      {/* Store & Vault View */}
      {viewMode === 'store' && (
        <VaultStore
          onBack={() => setViewMode('menu')}
          economy={economy}
          onUpdateEconomy={handleUpdateEconomy}
        />
      )}

      {/* Collection Binder View */}
      {viewMode === 'binder' && (
        <CollectionBinder
          onBack={() => setViewMode('menu')}
          economy={economy}
          onUpdateEconomy={handleUpdateEconomy}
        />
      )}

      {/* Draft & Sealed Events View */}
      {viewMode === 'draft' && (
        <DraftSealedModal
          onBack={() => setViewMode('menu')}
          onStartDraftMatch={(deck, avatar) => {
            handleStartGame(deck);
          }}
        />
      )}

      {/* Deck Builder View */}
      {viewMode === 'deckbuilder' && (
        <DeckBuilder
          onBack={() => setViewMode('menu')}
          onSaveDeck={(deck) => {
            setCustomDeck(deck);
            handleStartGame(deck);
          }}
        />
      )}

      {/* Codex View */}
      {viewMode === 'codex' && <CardCodex onBack={() => setViewMode('menu')} />}

      {/* Overlay Modals for the 9 Feature Systems */}
      {showTutorial && (
        <TutorialOverlay
          onCompleteTutorial={() => setShowTutorial(false)}
          onSkip={() => setShowTutorial(false)}
        />
      )}

      {showMatchmaking && (
        <MatchmakingModal
          onClose={() => setShowMatchmaking(false)}
          userProfile={userProfile}
          onStartMatch={(format, isRanked) => {
            setShowMatchmaking(false);
            handleStartGame();
          }}
        />
      )}

      {showOnlineMatchmaking && (
        <OnlineMatchmakingModal
          userId={`${userProfile.displayName}${userProfile.tag}`}
          onClose={() => setShowOnlineMatchmaking(false)}
          onMatchStart={(_matchId, _role, serverState) => {
            setShowOnlineMatchmaking(false);
            setGameState(serverState);
            setViewMode('game');
          }}
        />
      )}

      {showOracle && <OracleSearchModal onClose={() => setShowOracle(false)} />}

      {showReplay && <ReplayViewer onClose={() => setShowReplay(false)} replaySteps={replaySteps} />}

      {showBattlePass && (
        <BattlePassModal
          onClose={() => setShowBattlePass(false)}
          battlePass={battlePass}
          onUpdateBattlePass={handleUpdateBattlePass}
          economy={economy}
          onUpdateEconomy={handleUpdateEconomy}
        />
      )}

      {showFriends && (
        <SocialFriendsModal
          onClose={() => setShowFriends(false)}
          onChallengeFriend={(friend, format) => {
            setShowFriends(false);
            handleStartGame();
          }}
        />
      )}

      {showProfile && (
        <UserProfileModal
          onClose={() => setShowProfile(false)}
          userProfile={userProfile}
          onUpdateProfile={handleUpdateProfile}
          economy={economy}
          onUpdateEconomy={handleUpdateEconomy}
        />
      )}

      {/* Rules Modal */}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
};
