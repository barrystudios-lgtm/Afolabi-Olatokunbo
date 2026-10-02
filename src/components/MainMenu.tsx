import React from 'react';
import { 
  Play, 
  Coins, 
  Trophy, 
  Users, 
  Disc, 
  Target, 
  ShoppingBag, 
  Settings, 
  Volume2, 
  VolumeX, 
  ShieldAlert,
  Zap
} from 'lucide-react';
import { CharacterSkin, HoverboardSkin } from '../game/types';
import { soundEngine } from '../game/audio';

interface MainMenuProps {
  highScore: number;
  totalCredits: number;
  activeSkin: CharacterSkin;
  activeBoard: HoverboardSkin;
  hoverboardInventory: number;
  completedMissionsCount: number;
  totalMissionsCount: number;
  onStartGame: () => void;
  onOpenSkins: () => void;
  onOpenBoards: () => void;
  onOpenMissions: () => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  highScore,
  totalCredits,
  activeSkin,
  activeBoard,
  hoverboardInventory,
  completedMissionsCount,
  totalMissionsCount,
  onStartGame,
  onOpenSkins,
  onOpenBoards,
  onOpenMissions,
  onOpenShop,
  onOpenSettings
}) => {
  const [isMuted, setIsMuted] = React.useState(soundEngine.isMusicMuted);

  const toggleSound = () => {
    const muted = soundEngine.toggleMusicMute();
    soundEngine.toggleSfxMute();
    setIsMuted(muted);
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-8 pointer-events-none select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        {/* Brand Lockup */}
        <div className="flex flex-col">
          <span className="text-[10px] sm:text-xs font-tech text-sky-400 tracking-[0.25em] uppercase font-bold">
            BARRYSTUDIOS
          </span>
          <h1 className="text-xl sm:text-3xl font-display font-black tracking-tight text-white uppercase drop-shadow-md">
            STREET <span className="text-red-500">RUNNER</span>
          </h1>
        </div>

        {/* Currency & Records */}
        <div className="flex items-center gap-3">
          {/* Highway Gold Coins */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/80 backdrop-blur-md shadow-md">
            <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xs sm:text-sm font-display font-bold text-amber-300 tabular-nums">
              {totalCredits.toLocaleString()}
            </span>
          </div>

          {/* High Score */}
          <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/80 backdrop-blur-md shadow-md">
            <Trophy className="w-4 h-4 text-sky-400" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-tech text-slate-400 uppercase leading-none font-semibold">
                RECORD
              </span>
              <span className="text-xs font-display font-bold text-sky-300 tabular-nums leading-tight">
                {highScore.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Audio toggle button */}
          <button
            onClick={toggleSound}
            className="w-10 h-10 rounded-lg bg-slate-900/80 border border-slate-700/80 backdrop-blur-md flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95 shadow-md"
            title="Toggle Audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-lg bg-slate-900/80 border border-slate-700/80 backdrop-blur-md flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95 shadow-md"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Zone: Character Card & Main Launch Button */}
      <div className="self-center flex flex-col items-center max-w-md w-full pointer-events-auto my-auto text-center">
        {/* Selected Runner Tag */}
        <div className="mb-4 flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/85 border border-slate-700 backdrop-blur-md shadow-lg">
          <span 
            className="w-3 h-3 rounded-full border border-white/40 shadow-sm"
            style={{ backgroundColor: activeSkin.primaryColor }}
          />
          <span className="text-xs font-tech text-slate-200 font-medium">
            RUNNER: <strong className="text-white font-display uppercase tracking-wider">{activeSkin.name}</strong>
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs font-tech text-sky-400 font-semibold">
            {activeBoard.name}
          </span>
        </div>

        {/* Big Start Run CTA Button */}
        <button
          onClick={onStartGame}
          className="group relative w-full sm:w-80 py-5 px-8 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 text-black font-display font-black text-xl tracking-wider uppercase transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_10px_35px_rgba(220,38,38,0.5)] flex items-center justify-center gap-3"
        >
          <Play className="w-7 h-7 fill-black group-hover:scale-110 transition-transform" />
          <span>START RUN</span>
        </button>

        <p className="mt-3 text-xs font-tech text-slate-300 tracking-wider font-semibold drop-shadow">
          SPACEBAR OR TAP TO RUN · OUTRUN THE ROBOTIC ENFORCER
        </p>

        {/* Threat Warning Banner */}
        <div className="mt-4 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-red-500/40 text-red-300 text-xs font-tech shadow-md">
          <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
          <span>Robotic Police Unit is patrolling the highway lanes. Stay sharp!</span>
        </div>
      </div>

      {/* Bottom Dock Navigation: Subway Surfers Style Menu Buttons */}
      <div className="w-full flex items-center justify-center gap-2 sm:gap-4 pointer-events-auto">
        {/* Characters / Skins */}
        <button
          onClick={onOpenSkins}
          className="flex-1 max-w-[130px] p-3 rounded-xl bg-slate-900/85 border border-slate-700/80 hover:border-sky-400 hover:bg-slate-800/90 backdrop-blur-md flex flex-col items-center gap-1 transition-all active:scale-95 group shadow-lg"
        >
          <Users className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-display font-bold text-white uppercase tracking-wider">
            SKINS
          </span>
          <span className="text-[9px] font-tech text-sky-400/80 font-semibold">
            ROSTER
          </span>
        </button>

        {/* Hoverboards */}
        <button
          onClick={onOpenBoards}
          className="flex-1 max-w-[130px] p-3 rounded-xl bg-slate-900/85 border border-slate-700/80 hover:border-red-400 hover:bg-slate-800/90 backdrop-blur-md flex flex-col items-center gap-1 transition-all active:scale-95 group shadow-lg"
        >
          <Zap className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-display font-bold text-white uppercase tracking-wider">
            BOARDS
          </span>
          <span className="text-[9px] font-tech text-red-400/80 font-semibold">
            {hoverboardInventory} CELLS
          </span>
        </button>

        {/* Missions */}
        <button
          onClick={onOpenMissions}
          className="flex-1 max-w-[130px] p-3 rounded-xl bg-slate-900/85 border border-slate-700/80 hover:border-amber-400 hover:bg-slate-800/90 backdrop-blur-md flex flex-col items-center gap-1 transition-all active:scale-95 group shadow-lg"
        >
          <Target className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-display font-bold text-white uppercase tracking-wider">
            MISSIONS
          </span>
          <span className="text-[9px] font-tech text-amber-400/80 font-semibold">
            {completedMissionsCount}/{totalMissionsCount} DONE
          </span>
        </button>

        {/* Tech Upgrades / Shop */}
        <button
          onClick={onOpenShop}
          className="flex-1 max-w-[130px] p-3 rounded-xl bg-slate-900/85 border border-slate-700/80 hover:border-emerald-400 hover:bg-slate-800/90 backdrop-blur-md flex flex-col items-center gap-1 transition-all active:scale-95 group shadow-lg"
        >
          <ShoppingBag className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-display font-bold text-white uppercase tracking-wider">
            WORKSHOP
          </span>
          <span className="text-[9px] font-tech text-emerald-400/80 font-semibold">
            UPGRADES
          </span>
        </button>

        {/* Music & Sound Options */}
        <button
          onClick={onOpenSettings}
          className="flex-1 max-w-[130px] p-3 rounded-xl bg-slate-900/85 border border-slate-700/80 hover:border-blue-400 hover:bg-slate-800/90 backdrop-blur-md flex flex-col items-center gap-1 transition-all active:scale-95 group shadow-lg"
        >
          <Disc className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-display font-bold text-white uppercase tracking-wider">
            AUDIO
          </span>
          <span className="text-[9px] font-tech text-blue-400/80 font-semibold">
            TRACKS
          </span>
        </button>
      </div>
    </div>
  );
};
