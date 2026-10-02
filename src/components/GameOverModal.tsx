import React from 'react';
import { RotateCcw, Home, Trophy, Coins, Zap, ShieldAlert, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GameOverModalProps {
  stats: {
    score: number;
    coins: number;
    distance: number;
    vehiclesJumped: number;
    gantriesSlid: number;
    survivalSecs: number;
  };
  highScore: number;
  isNewRecord: boolean;
  unlockedSkins: string[];
  unlockedBoards: string[];
  onPlayAgain: () => void;
  onGoToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  highScore,
  isNewRecord,
  unlockedSkins,
  unlockedBoards,
  onPlayAgain,
  onGoToMenu
}) => {
  React.useEffect(() => {
    if (isNewRecord || unlockedSkins.length > 0 || unlockedBoards.length > 0) {
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // fallback
      }
    }
  }, [isNewRecord, unlockedSkins, unlockedBoards]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900/95 border border-slate-700 rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl">
        {/* Police Interception Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/60 border border-red-500/40 text-red-400 font-tech text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>ROBOTIC POLICE PATROL INTERCEPTION</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-white uppercase">
          PURSUIT TERMINATED
        </h2>

        {/* Score Display */}
        <div className="mt-6 w-full p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col items-center">
          <span className="text-xs font-tech text-slate-400 tracking-widest uppercase font-semibold">
            FINAL HIGHWAY SCORE
          </span>
          <span className="text-4xl sm:text-5xl font-display font-black tracking-wider text-amber-400 tabular-nums my-1">
            {stats.score.toLocaleString()}
          </span>

          {isNewRecord ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-tech text-xs font-bold uppercase tracking-wider mt-1 animate-pulse">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>NEW PERSONAL RECORD!</span>
            </div>
          ) : (
            <span className="text-xs font-tech text-slate-400 font-medium">
              BEST CAREER: {highScore.toLocaleString()}
            </span>
          )}
        </div>

        {/* Rewards Unlocked Notification */}
        {(unlockedSkins.length > 0 || unlockedBoards.length > 0) && (
          <div className="mt-4 w-full p-3.5 rounded-xl bg-gradient-to-r from-sky-950/60 to-amber-950/60 border border-sky-400/40 flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 text-xs font-tech font-bold text-amber-300 uppercase">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>MISSION COMPLETED · NEW REWARDS UNLOCKED!</span>
            </div>
            {unlockedSkins.map((s, i) => (
              <span key={i} className="text-sm font-display font-bold text-sky-300 mt-1">
                Unlocked Runner: {s}
              </span>
            ))}
            {unlockedBoards.map((b, i) => (
              <span key={i} className="text-sm font-display font-bold text-amber-300 mt-1">
                Unlocked Board: {b}
              </span>
            ))}
          </div>
        )}

        {/* Breakdown Stats Grid */}
        <div className="grid grid-cols-2 gap-3 w-full my-5 text-left text-xs font-tech">
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> COINS:
            </span>
            <span className="text-white font-bold tabular-nums">+{stats.coins}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-sky-400" /> DISTANCE:
            </span>
            <span className="text-white font-bold tabular-nums">{stats.distance}m</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <span className="text-slate-300">VEHICLES CLEARED:</span>
            <span className="text-white font-bold tabular-nums">{stats.vehiclesJumped}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <span className="text-slate-300">GANTRIES SLID:</span>
            <span className="text-white font-bold tabular-nums">{stats.gantriesSlid}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3.5 px-6 rounded-lg bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 text-black font-display font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
            RUN AGAIN
          </button>

          <button
            onClick={onGoToMenu}
            className="py-3 px-6 rounded-lg bg-slate-800 text-slate-200 font-tech font-semibold text-xs tracking-wider uppercase hover:bg-slate-700 active:scale-95 transition-all border border-slate-700 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            LOBBY
          </button>
        </div>
      </div>
    </div>
  );
};
