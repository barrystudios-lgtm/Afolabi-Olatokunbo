import React from 'react';
import { X, Check, Lock, Zap } from 'lucide-react';
import { HoverboardSkin, Mission } from '../game/types';

interface BoardsModalProps {
  boards: HoverboardSkin[];
  activeBoardId: string;
  missions: Mission[];
  onSelectBoard: (board: HoverboardSkin) => void;
  onClose: () => void;
}

export const BoardsModal: React.FC<BoardsModalProps> = ({
  boards,
  activeBoardId,
  missions,
  onSelectBoard,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900/95 border border-slate-700 rounded-2xl p-6 sm:p-8 flex flex-col max-h-[90vh] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-tech text-sky-400 tracking-widest uppercase font-semibold">
              HOVERBOARD LOCKER & GEAR
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white uppercase">
              HIGHWAY BOARDS
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Boards Grid */}
        <div className="flex-1 overflow-y-auto py-6 grid grid-cols-1 sm:grid-cols-2 gap-4 pr-1">
          {boards.map((board) => {
            const isEquipped = board.id === activeBoardId;
            const relatedMission = missions.find(m => m.id === board.missionId);

            return (
              <div
                key={board.id}
                className={`relative flex flex-col justify-between p-5 rounded-xl border transition-all duration-200 ${
                  isEquipped
                    ? 'bg-slate-800/90 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.25)]'
                    : board.unlocked
                    ? 'bg-slate-900/80 border-slate-700 hover:border-slate-500 hover:bg-slate-850'
                    : 'bg-slate-950/70 border-slate-800 opacity-75'
                }`}
              >
                <div>
                  {/* Board preview graphic */}
                  <div 
                    className="relative w-full h-28 rounded-lg flex items-center justify-center overflow-hidden mb-3 border border-slate-700"
                    style={{
                      background: `linear-gradient(135deg, ${board.color}35 0%, #0f172a 100%)`
                    }}
                  >
                    <div 
                      className="w-36 h-7 rounded-full border-2 flex items-center justify-center shadow-lg relative transform -rotate-12"
                      style={{
                        borderColor: board.color,
                        backgroundColor: `${board.color}50`
                      }}
                    >
                      <Zap className="w-4 h-4 text-white" />
                    </div>

                    {!board.unlocked && (
                      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center">
                        <Lock className="w-6 h-6 text-slate-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-display font-bold text-white tracking-wide">
                      {board.name}
                    </h3>
                    <span className="text-[11px] font-tech text-emerald-400 font-semibold">
                      {board.speedBonus}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {board.description}
                  </p>
                </div>

                {/* Unlock status & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800">
                  {board.unlocked ? (
                    <button
                      onClick={() => onSelectBoard(board)}
                      disabled={isEquipped}
                      className={`w-full py-2.5 px-4 rounded-lg font-display text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 ${
                        isEquipped
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 cursor-default'
                          : 'bg-sky-500 text-black hover:bg-sky-400 active:scale-95 shadow-md'
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <Check className="w-4 h-4" />
                          EQUIPPED
                        </>
                      ) : (
                        'EQUIP BOARD'
                      )}
                    </button>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-tech text-amber-400 font-semibold">
                        MISSION TO UNLOCK:
                      </span>
                      <p className="text-xs text-slate-300 font-medium">
                        {board.unlockCondition}
                      </p>
                      {relatedMission && (
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1">
                          <div 
                            className="bg-amber-400 h-full rounded-full"
                            style={{ width: `${Math.min(100, (relatedMission.progress / relatedMission.target) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
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
