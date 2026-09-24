import React, { useState } from 'react';
import { BugReport, GameState } from '../types/game';
import { Bug, X, Send, CheckCircle2, ShieldAlert } from 'lucide-react';

interface BugReportModalProps {
  gameState: GameState;
  onClose: () => void;
  onSubmitReport: (report: BugReport) => void;
}

export const BugReportModal: React.FC<BugReportModalProps> = ({ gameState, onClose, onSubmitReport }) => {
  const [description, setDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const report: BugReport = {
      id: 'bug_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      actionId: gameState.logs.length > 0 ? gameState.logs[0].id : undefined,
      turnNumber: gameState.turnNumber,
      phase: gameState.phase,
      userDescription: description.trim(),
      gameStateSnapshot: JSON.parse(JSON.stringify(gameState)),
    };

    // Save to local bug storage
    const existing = JSON.parse(localStorage.getItem('fulcrum_bug_reports') || '[]');
    existing.push(report);
    localStorage.setItem('fulcrum_bug_reports', JSON.stringify(existing));

    onSubmitReport(report);
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-fulcrum-panel border-2 border-fulcrum-gold rounded-3xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(243,198,105,0.4)] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-4">
          <Bug className="w-6 h-6 text-amber-400 animate-bounce" />
          <div>
            <h3 className="font-serif font-black text-lg text-gold-gradient uppercase tracking-wide">
              Report Rules / Action Bug
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Direct Per-Action Rule Discrepancy & State Audit Reporter
            </p>
          </div>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
            <h4 className="font-serif font-bold text-emerald-300 text-base">Bug Report Logged & Saved!</h4>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              State snapshot at Turn {gameState.turnNumber} ({gameState.phase.toUpperCase()}) attached to audit report.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="bg-black/40 border border-white/10 rounded-xl p-3 space-y-1 font-mono text-[11px]">
              <div className="text-amber-300 flex items-center gap-1 font-bold">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Action Context Snapshot</span>
              </div>
              <div className="text-slate-300">Turn Number: {gameState.turnNumber} • Phase: {gameState.phase.toUpperCase()}</div>
              <div className="text-slate-400 truncate">
                Last Log: {gameState.logs.length > 0 ? gameState.logs[0].text : 'Match start'}
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="font-bold text-slate-200">Describe the Rule Violation / Discrepancy:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what rule clause was violated or what unexpected state change occurred..."
                rows={4}
                required
                className="w-full bg-slate-950 border border-slate-700 focus:border-fulcrum-gold rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-fulcrum-gold text-xs font-sans resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-serif font-black flex items-center gap-1.5 shadow-lg"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Bug Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
