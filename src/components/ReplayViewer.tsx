import React, { useState, useEffect } from 'react';
import { ReplayStep } from '../types/game';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, X, Shield, Swords, Clock } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface ReplayViewerProps {
  onClose: () => void;
  replaySteps: ReplayStep[];
}

export const ReplayViewer: React.FC<ReplayViewerProps> = ({ onClose, replaySteps }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= replaySteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, replaySteps.length]);

  if (!replaySteps || replaySteps.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-fulcrum-panel border border-fulcrum-border rounded-2xl p-6 text-center text-slate-300">
          <p>No replay history available yet. Play a match to record game replay!</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold">
            Close
          </button>
        </div>
      </div>
    );
  }

  const step = replaySteps[currentStepIndex];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-fulcrum-panel border-2 border-fulcrum-gold rounded-3xl max-w-2xl w-full p-6 shadow-[0_0_50px_rgba(243,198,105,0.4)] flex flex-col gap-5 relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-fulcrum-border pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-fulcrum-gold" />
            <div>
              <h2 className="font-serif font-black text-xl text-gold-gradient tracking-wide uppercase">
                MATCH REPLAY SYSTEM
              </h2>
              <p className="text-xs text-slate-400 font-sans">Turn-by-turn action playback review engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Board Snapshot Display Header */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/50 border border-cyan-500/40 rounded-2xl p-4 flex flex-col items-center gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Player State</span>
            <div className="font-mono font-bold text-emerald-400 text-lg">{step.playerLife} HP</div>
            <div className="text-xs font-mono text-cyan-300">{step.playerCore} Core</div>
          </div>

          <div className="bg-black/50 border border-red-500/40 rounded-2xl p-4 flex flex-col items-center gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Opponent State</span>
            <div className="font-mono font-bold text-red-400 text-lg">{step.opponentLife} HP</div>
            <div className="text-xs font-mono text-cyan-300">{step.opponentCore} Core</div>
          </div>
        </div>

        {/* Current Log Banner */}
        <div className="bg-slate-900 border border-fulcrum-gold rounded-2xl p-5 text-center space-y-1">
          <div className="text-xs text-amber-300 font-serif font-bold uppercase">
            Turn {step.turnNumber} ({step.turnOwner === 'player' ? 'Player Turn' : 'Opponent Turn'})
          </div>
          <p className="text-sm font-sans font-bold text-slate-100">{step.logText}</p>
        </div>

        {/* Timeline Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={replaySteps.length - 1}
            value={currentStepIndex}
            onChange={(e) => setCurrentStepIndex(Number(e.target.value))}
            className="w-full accent-fulcrum-gold cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>Step 1</span>
            <span>Step {currentStepIndex + 1} of {replaySteps.length}</span>
            <span>End</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              soundFx.playButtonClickSound();
              setCurrentStepIndex(0);
            }}
            className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              soundFx.playButtonClickSound();
              if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1);
            }}
            className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              soundFx.playButtonClickSound();
              setIsPlaying(!isPlaying);
            }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-fulcrum-gold via-amber-500 to-amber-600 text-slate-950 font-black flex items-center gap-2 shadow-lg transition transform hover:scale-105"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            <span className="font-serif uppercase text-xs tracking-wider">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={() => {
              soundFx.playButtonClickSound();
              if (currentStepIndex < replaySteps.length - 1) setCurrentStepIndex(currentStepIndex + 1);
            }}
            className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
