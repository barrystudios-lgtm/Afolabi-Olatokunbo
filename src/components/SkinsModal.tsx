import React from 'react';
import { X, Check, Lock, Shield, Sparkles } from 'lucide-react';
import { CharacterSkin, Mission } from '../game/types';

interface SkinsModalProps {
  skins: CharacterSkin[];
  activeSkinId: string;
  missions: Mission[];
  onSelectSkin: (skin: CharacterSkin) => void;
  onClose: () => void;
}

export const SkinsModal: React.FC<SkinsModalProps> = ({
  skins,
  activeSkinId,
  missions,
  onSelectSkin,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900/95 border border-slate-700 rounded-2xl p-6 sm:p-8 flex flex-col max-h-[90vh] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-tech text-sky-400 tracking-widest uppercase font-semibold">
              HIGHWAY RUNNER ROSTER & MISSIONS
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white uppercase">
              CHARACTER SKINS
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Skins Grid */}
        <div className="flex-1 overflow-y-auto py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pr-1">
          {skins.map((skin) => {
            const isEquipped = skin.id === activeSkinId;
            const relatedMission = missions.find(m => m.id === skin.missionId);

            return (
              <div
                key={skin.id}
                className={`relative flex flex-col justify-between p-5 rounded-xl border transition-all duration-200 ${
                  isEquipped
                    ? 'bg-slate-800/90 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.25)]'
                    : skin.unlocked
                    ? 'bg-slate-900/80 border-slate-700 hover:border-slate-500 hover:bg-slate-850'
                    : 'bg-slate-950/70 border-slate-800 opacity-75'
                }`}
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span 
                      className="text-[10px] font-tech font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                      style={{ 
                        color: skin.primaryColor, 
                        borderColor: `${skin.primaryColor}50`,
                        backgroundColor: `${skin.primaryColor}15`
                      }}
                    >
                      {skin.codename}
                    </span>

                    <span className="text-[11px] font-tech text-slate-400 font-semibold">
                      {skin.rarity}
                    </span>
                  </div>

                  {/* Character Avatar Frame */}
                  <div 
                    className="relative w-full h-32 rounded-lg flex items-center justify-center overflow-hidden mb-3 border border-slate-700"
                    style={{
                      background: `linear-gradient(135deg, ${skin.primaryColor}30 0%, #0f172a 100%)`
                    }}
                  >
                    <div className="relative z-10 flex flex-col items-center">
                      <div 
                        className="w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-lg"
                        style={{ 
                          borderColor: skin.primaryColor,
                          backgroundColor: `${skin.primaryColor}40`
                        }}
                      >
                        <Shield className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-[11px] font-tech text-slate-300 font-bold uppercase mt-2">
                        {skin.outfitStyle} STYLE
                      </span>
                    </div>

                    {!skin.unlocked && (
                      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center">
                        <Lock className="w-7 h-7 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Skin Info */}
                  <h3 className="text-lg font-display font-bold text-white tracking-wide">
                    {skin.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {skin.description}
                  </p>
                </div>

                {/* Unlock Requirement / Action */}
                <div className="mt-4 pt-3 border-t border-slate-800">
                  {skin.unlocked ? (
                    <button
                      onClick={() => onSelectSkin(skin)}
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
                        'SELECT RUNNER'
                      )}
                    </button>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-tech text-amber-400 font-semibold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>MISSION TO UNLOCK:</span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">
                        {skin.unlockCondition}
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
