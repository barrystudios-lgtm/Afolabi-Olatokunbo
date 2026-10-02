import React from 'react';
import { X, CheckCircle, Sparkles, Award } from 'lucide-react';
import { Mission } from '../game/types';

interface MissionsModalProps {
  missions: Mission[];
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({ missions, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900/95 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(6,182,212,0.2)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div>
            <span className="text-xs font-tech text-cyan-400 tracking-widest uppercase">
              REWARD OBJECTIVES
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white uppercase">
              ACTIVE MISSIONS
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Missions list */}
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-3 pr-1">
          {missions.map((mission) => {
            const pct = Math.min(100, Math.floor((mission.progress / mission.target) * 100));

            return (
              <div
                key={mission.id}
                className={`p-4 sm:p-5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  mission.completed
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                    : 'bg-slate-800/60 border-white/10'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-display font-bold text-white tracking-wide">
                      {mission.title}
                    </h3>
                    {mission.completed && (
                      <span className="flex items-center gap-1 text-[10px] font-tech font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        <CheckCircle className="w-3 h-3" />
                        COMPLETED
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mb-3">
                    {mission.description}
                  </p>

                  {/* Progress bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          mission.completed
                            ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]'
                            : 'bg-gradient-to-r from-cyan-400 to-pink-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-tech text-slate-300 font-bold tabular-nums min-w-[50px] text-right">
                      {mission.progress.toLocaleString()} / {mission.target.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Reward pill */}
                <div className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-black/50 border border-white/10 sm:self-center">
                  <Award className="w-4 h-4 text-amber-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-tech text-slate-400 uppercase">
                      UNLOCKS
                    </span>
                    <span className="text-xs font-display font-bold text-amber-300">
                      {mission.rewardName}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
