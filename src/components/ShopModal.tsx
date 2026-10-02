import React from 'react';
import { X, Magnet, Rocket, Flame, Zap, Coins, ChevronUp, Plus } from 'lucide-react';
import { Upgrades } from '../game/types';
import { soundEngine } from '../game/audio';

interface ShopModalProps {
  upgrades: Upgrades;
  coins: number;
  hoverboardInventory: number;
  onUpgrade: (type: keyof Upgrades, cost: number) => void;
  onBuyHoverboards: (amount: number, cost: number) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  upgrades,
  coins,
  hoverboardInventory,
  onUpgrade,
  onBuyHoverboards,
  onClose
}) => {
  const getUpgradeCost = (level: number) => level * 150;

  const handleUpgradeClick = (key: keyof Upgrades, level: number) => {
    const cost = getUpgradeCost(level);
    if (coins >= cost && level < 5) {
      soundEngine.playPowerup();
      onUpgrade(key, cost);
    }
  };

  const handleBuyBoardsClick = () => {
    const cost = 200;
    if (coins >= cost) {
      soundEngine.playPowerup();
      onBuyHoverboards(3, cost);
    }
  };

  const UPGRADE_ITEMS: {
    key: keyof Upgrades;
    name: string;
    description: string;
    level: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }[] = [
    {
      key: 'magnetLevel',
      name: 'Cyber Magnet',
      description: 'Increases credit attractor duration (+3s per level)',
      level: upgrades.magnetLevel,
      icon: Magnet,
      color: '#ec4899'
    },
    {
      key: 'jetpackLevel',
      name: 'Skyway Jetpack',
      description: 'Extends aerial skyway flight duration (+2.5s per level)',
      level: upgrades.jetpackLevel,
      icon: Rocket,
      color: '#3b82f6'
    },
    {
      key: 'sneakersLevel',
      name: 'Super Jump Boots',
      description: 'Extends mega jump boost duration (+3s per level)',
      level: upgrades.sneakersLevel,
      icon: Flame,
      color: '#10b981'
    },
    {
      key: 'multiplierLevel',
      name: '2X Score Booster',
      description: 'Extends double score multiplier duration (+3s per level)',
      level: upgrades.multiplierLevel,
      icon: Zap,
      color: '#f59e0b'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900/95 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(6,182,212,0.2)]">
        {/* Header with coins balance */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div>
            <span className="text-xs font-tech text-cyan-400 tracking-widest uppercase">
              TECH WORKSHOP
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white uppercase">
              POWER-UP UPGRADES
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 shadow-sm">
              <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-display font-bold text-amber-300 tabular-nums">
                {coins.toLocaleString()}
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Shop items */}
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-4 pr-1">
          {/* Hoverboard Supply pack */}
          <div className="p-4 sm:p-5 rounded-xl border border-pink-500/30 bg-pink-950/20 flex flex-col sm:flex-row items-start sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center">
                <Zap className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-white">
                  Hoverboard Energy Cells (3-Pack)
                </h3>
                <p className="text-xs text-slate-400">
                  Currently in inventory: <span className="text-white font-bold">{hoverboardInventory} boards</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleBuyBoardsClick}
              disabled={coins < 200}
              className={`px-4 py-2.5 rounded-lg font-display text-xs font-bold tracking-wider uppercase flex items-center gap-2 transition-all ${
                coins >= 200
                  ? 'bg-pink-500 text-white hover:bg-pink-400 active:scale-95 shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              BUY (200 CREDITS)
            </button>
          </div>

          {/* Upgrades */}
          {UPGRADE_ITEMS.map((item) => {
            const cost = getUpgradeCost(item.level);
            const isMax = item.level >= 5;
            const canAfford = coins >= cost && !isMax;

            return (
              <div
                key={item.key}
                className="p-4 sm:p-5 rounded-xl border border-white/10 bg-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl border flex items-center justify-center"
                    style={{ 
                      borderColor: `${item.color}40`,
                      backgroundColor: `${item.color}15`
                    }}
                  >
                    <item.icon className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-display font-bold text-white">
                        {item.name}
                      </h3>
                      <span className="text-xs font-tech font-bold text-cyan-400">
                        LVL {item.level} / 5
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {item.description}
                    </p>

                    {/* Level pips */}
                    <div className="flex items-center gap-1.5 mt-2">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`w-6 h-1.5 rounded-full ${
                            lvl <= item.level
                              ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                              : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleUpgradeClick(item.key, item.level)}
                  disabled={!canAfford}
                  className={`px-4 py-2.5 rounded-lg font-display text-xs font-bold tracking-wider uppercase flex items-center gap-2 transition-all ${
                    isMax
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-default'
                      : canAfford
                      ? 'bg-cyan-500 text-black hover:bg-cyan-400 active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  {isMax ? (
                    'MAX LEVEL'
                  ) : (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      UPGRADE ({cost} CREDITS)
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
