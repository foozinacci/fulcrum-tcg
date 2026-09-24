import React, { useState } from 'react';
import { TutorialStep } from '../types/game';
import { Sparkles, ArrowRight, CheckCircle2, BookOpen, Shield, Play } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface TutorialOverlayProps {
  onCompleteTutorial: () => void;
  onSkip: () => void;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: '1. Welcome to Fulcrum: Fully Revealed Hands',
    message: 'Unlike traditional TCGs, both players have FULLY REVEALED hands at all times! Strategy is about timing, resource math, and sequencing — zero hidden tricks.',
  },
  {
    id: 2,
    title: '2. Cards Are Resources: Core & Load',
    message: 'No mana or lands! Every card has a CORE value (when converted) and a LOAD cost (to cast). Convert turn-draws into Core to build your resource pool.',
  },
  {
    id: 3,
    title: '3. Pace & Expedite Gating',
    message: 'Pace prevents early-game heavy card drops. A Pace 2 card cannot be cast standard before Turn 2. Use EXPEDITE (instant speed, higher Load) to bypass Pace limits on any turn!',
  },
  {
    id: 4,
    title: '4. Dormant vs Alert Beings',
    message: 'When summoned, Beings enter DORMANT (tapped/resting). At the start of your next turn, they become ALERT (untapped/ready to attack)!',
  },
  {
    id: 5,
    title: '5. Primal Avatars & Head-Removal Win Condition',
    message: 'Every deck features 1 Primal Avatar (61st slot). Whenever a single Primal source deals 50% of starting life in damage, that player is INSTANTLY ELIMINATED outright!',
  },
];

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onCompleteTutorial, onSkip }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const step = TUTORIAL_STEPS[currentStepIndex];

  const handleNext = () => {
    soundFx.playButtonClickSound();
    if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      soundFx.playVictorySound();
      onCompleteTutorial();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-300">
      <div className="bg-fulcrum-panel border-2 border-fulcrum-gold rounded-3xl max-w-xl w-full p-6 shadow-[0_0_50px_rgba(243,198,105,0.4)] flex flex-col gap-5 relative overflow-hidden">
        {/* Step Progress Bar */}
        <div className="flex items-center justify-between text-xs text-amber-300 font-serif font-bold border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-fulcrum-gold animate-pulse" />
            <span>FULCRUM ONBOARDING ACADEMY</span>
          </div>
          <span className="font-mono text-slate-400">Step {currentStepIndex + 1} of {TUTORIAL_STEPS.length}</span>
        </div>

        {/* Step Dots */}
        <div className="flex items-center gap-2 justify-center">
          {TUTORIAL_STEPS.map((s, idx) => (
            <div
              key={s.id}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStepIndex
                  ? 'w-8 bg-fulcrum-gold shadow-[0_0_10px_rgba(243,198,105,0.8)]'
                  : idx < currentStepIndex
                  ? 'w-3 bg-emerald-400'
                  : 'w-3 bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Content Banner */}
        <div className="bg-black/50 border border-white/10 rounded-2xl p-5 space-y-3">
          <h3 className="font-serif font-black text-xl text-gold-gradient tracking-wide">{step.title}</h3>
          <p className="text-sm text-slate-200 leading-relaxed font-sans">{step.message}</p>
        </div>

        {/* Visual Callout Graphic Box */}
        <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-cyan-950/40 border border-fulcrum-border rounded-xl p-4 flex items-center gap-3 text-xs text-slate-300">
          <Shield className="w-8 h-8 text-fulcrum-gold shrink-0" />
          <div>
            <div className="font-bold text-amber-300 uppercase font-serif">Pro Tip for Corefeast Gluttrix Precon:</div>
            <div>Bank excess Core to power up Gluttrix's Core-attack multiplier when launching attacks!</div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onSkip}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            Skip Tutorial
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-fulcrum-gold via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-serif font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 transition transform hover:scale-105"
          >
            <span>{currentStepIndex === TUTORIAL_STEPS.length - 1 ? 'Start First Match!' : 'Next Lesson'}</span>
            {currentStepIndex === TUTORIAL_STEPS.length - 1 ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
