import React, { useState, useEffect } from 'react';
import { Play, Volume2 } from 'lucide-react';
import { soundEngine } from '../game/audio';

interface StartupLogoProps {
  onEnter: () => void;
}

export const StartupLogo: React.FC<StartupLogoProps> = ({ onEnter }) => {
  const [phase, setPhase] = useState<'intro' | 'title' | 'ready'>('intro');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('title'), 800);
    const t2 = setTimeout(() => setPhase('ready'), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleStart = () => {
    soundEngine.playClick();
    soundEngine.startMusic();
    onEnter();
  };

  return (
    <div 
      onClick={handleStart}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 cursor-pointer overflow-hidden select-none"
    >
      {/* Daylight City Highway Backdrop */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none transform scale-105 transition-transform duration-1000"
        style={{
          backgroundImage: `url('/src/assets/images/daylight_city_highway_1790953179122.jpg')`
        }}
      />

      {/* Daylight Sky Vignette Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-blue-950/40 pointer-events-none" />

      {/* Main Studio & Game Branding Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-xl">
        {/* Studio Identifier */}
        <div className={`transition-all duration-700 ${phase !== 'intro' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-sky-400 text-xs sm:text-sm font-tech font-bold tracking-[0.3em] uppercase shadow-lg">
            <span>BARRYSTUDIOS PRESENTS</span>
          </div>
        </div>

        {/* Game Title: STREET RUNNER */}
        <div className={`mt-6 transition-all duration-700 delay-100 ${phase === 'title' || phase === 'ready' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-black tracking-tight uppercase text-white drop-shadow-2xl">
            STREET <span className="text-red-500">RUNNER</span>
          </h1>
          <p className="mt-3 text-xs sm:text-sm font-tech tracking-widest text-slate-300 uppercase font-semibold">
            DAYLIGHT HIGHWAY TRAFFIC PURSUIT
          </p>
        </div>

        {/* Start Button / Interaction Prompt */}
        <div className={`mt-12 transition-all duration-500 ${phase === 'ready' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStart();
            }}
            className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 rounded-xl text-black font-display font-extrabold text-sm sm:text-base tracking-wider uppercase transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_10px_35px_rgba(220,38,38,0.5)]"
          >
            <Play className="w-5 h-5 fill-black" />
            <span>START RUN</span>
            <Volume2 className="w-4 h-4 ml-1 opacity-80 group-hover:opacity-100" />
          </button>
          
          <p className="mt-4 text-xs font-tech text-slate-400 tracking-wider font-medium">
            PRESS SPACEBAR OR TAP TO HIT THE HIGHWAY
          </p>
        </div>
      </div>

      {/* Bottom studio mark */}
      <div className="absolute bottom-6 text-[11px] font-tech text-slate-500 tracking-widest uppercase">
        © BARRYSTUDIOS · HIGHWAY PURSUIT ENGINE
      </div>
    </div>
  );
};
