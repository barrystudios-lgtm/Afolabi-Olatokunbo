import React from 'react';
import { 
  Pause, 
  Play, 
  Coins, 
  Zap, 
  Magnet, 
  Rocket, 
  Flame, 
  ShieldAlert, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { PowerUpType } from '../game/types';

interface GameHUDProps {
  score: number;
  highScore: number;
  coins: number;
  multiplier: number;
  powerUps: { type: PowerUpType; timeLeft: number; duration: number }[];
  hoverboardActive: boolean;
  hoverboardTimeLeft: number;
  hoverboardInventory: number;
  policeWarning: 'SAFE' | 'WARNING' | 'DANGER';
  isPaused: boolean;
  onPauseToggle: () => void;
  onActivateHoverboard: () => void;
  onExitRun: () => void;
  onLeft: () => void;
  onRight: () => void;
  onJump: () => void;
  onSlide: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  highScore,
  coins,
  multiplier,
  powerUps,
  hoverboardActive,
  hoverboardTimeLeft,
  hoverboardInventory,
  policeWarning,
  isPaused,
  onPauseToggle,
  onActivateHoverboard,
  onExitRun,
  onLeft,
  onRight,
  onJump,
  onSlide
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20">
      {/* Danger Screen Border Alert when Police closes in */}
      {policeWarning === 'DANGER' && (
        <div className="absolute inset-0 border-4 border-red-500/80 animate-pulse pointer-events-none z-10 shadow-[inset_0_0_35px_rgba(239,68,68,0.35)]" />
      )}
      {policeWarning === 'WARNING' && (
        <div className="absolute inset-0 border-2 border-amber-500/50 pointer-events-none z-10 shadow-[inset_0_0_15px_rgba(245,158,11,0.2)]" />
      )}

      {/* TOP HEADER HUD */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
        {/* Score & Multiplier */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-4xl font-display font-black tracking-wider text-white tabular-nums drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {score.toLocaleString()}
            </span>
            {multiplier > 1 && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-black font-display font-black text-xs sm:text-sm tracking-wider animate-pulse shadow-md">
                {multiplier}X
              </span>
            )}
          </div>
          <span className="text-[11px] font-tech text-sky-300 font-bold tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            RECORD: {Math.max(score, highScore).toLocaleString()}
          </span>
        </div>

        {/* Police Pursuit Alert Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900/85 border border-slate-700/80 backdrop-blur-md shadow-md">
          <ShieldAlert className={`w-4 h-4 ${
            policeWarning === 'DANGER' ? 'text-red-500 animate-bounce' : 
            policeWarning === 'WARNING' ? 'text-amber-400' : 'text-slate-400'
          }`} />
          <span className={`text-xs font-tech font-bold tracking-widest uppercase ${
            policeWarning === 'DANGER' ? 'text-red-400' : 
            policeWarning === 'WARNING' ? 'text-amber-300' : 'text-slate-400'
          }`}>
            {policeWarning === 'DANGER' ? 'POLICE: CLOSING IN!' : 
             policeWarning === 'WARNING' ? 'POLICE: PURSUING' : 'POLICE: DISTANT'}
          </span>
        </div>

        {/* Right Zone: Coins & Pause */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900/85 border border-slate-700/80 backdrop-blur-md shadow-md">
            <Coins className="w-4 h-4 text-amber-400 fill-amber-400 drop-shadow-sm" />
            <span className="text-sm sm:text-base font-display font-bold text-amber-300 tabular-nums">
              {coins.toLocaleString()}
            </span>
          </div>

          <button
            onClick={onPauseToggle}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-900/85 border border-slate-700/80 text-white hover:bg-slate-800 active:scale-95 transition-all backdrop-blur-md shadow-md"
            title="Pause Game"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ACTIVE POWER-UP STATUS BARS (Left edge) */}
      <div className="absolute left-4 top-24 flex flex-col gap-2 pointer-events-none">
        {powerUps.map((p) => {
          const pct = Math.max(0, Math.min(100, (p.timeLeft / p.duration) * 100));
          return (
            <div 
              key={p.type} 
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/85 border border-slate-700/80 backdrop-blur-md min-w-[130px] shadow-md"
            >
              {p.type === 'MAGNET' && <Magnet className="w-4 h-4 text-red-400" />}
              {p.type === 'JETPACK' && <Rocket className="w-4 h-4 text-sky-400" />}
              {p.type === 'SNEAKERS' && <Flame className="w-4 h-4 text-emerald-400" />}
              {p.type === 'MULTIPLIER' && <Zap className="w-4 h-4 text-amber-400" />}

              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between text-[10px] font-tech text-slate-300 font-semibold">
                  <span>{p.type}</span>
                  <span className="tabular-nums font-bold">{Math.ceil(p.timeLeft)}s</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-400 to-amber-500 rounded-full transition-all duration-100" 
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTTOM RIGHT: HOVERBOARD BUTTON */}
      <div className="absolute right-4 bottom-24 sm:bottom-8 pointer-events-auto flex flex-col items-center gap-1">
        <button
          onClick={onActivateHoverboard}
          disabled={hoverboardActive || hoverboardInventory <= 0}
          className={`relative group w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex flex-col items-center justify-center font-display transition-all duration-200 active:scale-95 shadow-xl ${
            hoverboardActive
              ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.7)] border border-red-400'
              : hoverboardInventory > 0
              ? 'bg-sky-500 text-black hover:bg-sky-400 shadow-lg border border-sky-300'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
          title="Activate Hoverboard (Space / Double Tap)"
        >
          <Zap className="w-6 h-6 fill-current" />
          <span className="text-[10px] font-tech font-bold uppercase tracking-wider mt-0.5">
            {hoverboardActive ? `${Math.ceil(hoverboardTimeLeft)}s` : `${hoverboardInventory}x`}
          </span>
        </button>
        <span className="text-[10px] font-tech text-slate-200 font-bold tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
          SPACE / BOARD
        </span>
      </div>

      {/* MOBILE TOUCH ARROWS (Bottom Left) */}
      <div className="absolute bottom-6 left-4 flex items-center gap-2 pointer-events-auto sm:hidden">
        <button
          onTouchStart={onLeft}
          onClick={onLeft}
          className="w-12 h-12 rounded-lg bg-slate-900/80 border border-slate-700 flex items-center justify-center text-white active:bg-white/20 shadow-md"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onTouchStart={onRight}
          onClick={onRight}
          className="w-12 h-12 rounded-lg bg-slate-900/80 border border-slate-700 flex items-center justify-center text-white active:bg-white/20 shadow-md"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        <button
          onTouchStart={onJump}
          onClick={onJump}
          className="w-12 h-12 rounded-lg bg-slate-900/80 border border-slate-700 flex items-center justify-center text-white active:bg-white/20 shadow-md"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <button
          onTouchStart={onSlide}
          onClick={onSlide}
          className="w-12 h-12 rounded-lg bg-slate-900/80 border border-slate-700 flex items-center justify-center text-white active:bg-white/20 shadow-md"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* PAUSE OVERLAY */}
      {isPaused && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center pointer-events-auto z-40">
          <div className="bg-slate-900/95 border border-slate-700 p-8 rounded-2xl max-w-sm w-full mx-4 flex flex-col items-center text-center shadow-2xl">
            <h2 className="text-3xl font-display font-black tracking-tight text-white mb-6 uppercase">
              GAME PAUSED
            </h2>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={onPauseToggle}
                className="w-full py-3.5 px-6 rounded-lg bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 text-black font-display font-bold text-sm tracking-wider uppercase hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                RESUME RUN
              </button>

              <button
                onClick={onExitRun}
                className="w-full py-3 px-6 rounded-lg bg-slate-800 text-slate-300 font-tech font-semibold text-xs tracking-wider uppercase hover:bg-slate-700 active:scale-95 transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                EXIT TO LOBBY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
