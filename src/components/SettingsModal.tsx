import React from 'react';
import { X, Volume2, VolumeX, Music, Disc, Keyboard, Smartphone } from 'lucide-react';
import { MUSIC_TRACKS, soundEngine } from '../game/audio';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const currentTrack = soundEngine.getCurrentTrack();
  const [selectedTrackId, setSelectedTrackId] = React.useState(currentTrack.id);
  const [musicVol, setMusicVol] = React.useState(soundEngine.musicVolume);
  const [sfxVol, setSfxVol] = React.useState(soundEngine.sfxVolume);
  const [musicMuted, setMusicMuted] = React.useState(soundEngine.isMusicMuted);
  const [sfxMuted, setSfxMuted] = React.useState(soundEngine.isSfxMuted);

  const handleSelectTrack = (trackId: string) => {
    setSelectedTrackId(trackId);
    soundEngine.setTrack(trackId);
  };

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setMusicVol(val);
    soundEngine.setMusicVolume(val);
  };

  const handleSfxVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSfxVol(val);
    soundEngine.setSfxVolume(val);
  };

  const toggleMusic = () => {
    const muted = soundEngine.toggleMusicMute();
    setMusicMuted(muted);
  };

  const toggleSfx = () => {
    const muted = soundEngine.toggleSfxMute();
    setSfxMuted(muted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(6,182,212,0.2)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div>
            <span className="text-xs font-tech text-cyan-400 tracking-widest uppercase">
              AUDIO & GAMEPLAY PREFERENCES
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white uppercase">
              AUDIO & SETTINGS
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-6 pr-1">
          {/* Synthwave Music Track Selector */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Disc className="w-4 h-4 text-cyan-400 animate-spin" />
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                RETRO SYNTHWAVE MUSIC TRACKS
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MUSIC_TRACKS.map((track) => {
                const isActive = track.id === selectedTrackId;
                return (
                  <button
                    key={track.id}
                    onClick={() => handleSelectTrack(track.id)}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      isActive
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-800/60 border-white/10 hover:border-cyan-500/40 hover:bg-slate-800'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-cyan-500 text-black' : 'bg-white/10 text-slate-400'
                    }`}>
                      <Music className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-display font-bold text-white truncate">
                          {track.title}
                        </span>
                        <span className="text-[10px] font-tech text-cyan-400 ml-1">
                          {track.bpm} BPM
                        </span>
                      </div>
                      <span className="text-[11px] font-tech text-slate-400 block mt-0.5">
                        {track.style}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume Sliders */}
          <div className="p-4 rounded-xl border border-white/10 bg-slate-800/40 flex flex-col gap-4">
            {/* Music Volume */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-[120px]">
                <button
                  onClick={toggleMusic}
                  className="text-slate-400 hover:text-white"
                >
                  {musicMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
                </button>
                <span className="text-xs font-tech font-bold text-slate-300">
                  MUSIC VOLUME
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicMuted ? 0 : musicVol}
                onChange={handleMusicVolumeChange}
                className="flex-1 accent-cyan-400 h-2 bg-slate-700 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-tech font-bold text-cyan-400 tabular-nums w-10 text-right">
                {musicMuted ? '0%' : `${Math.round(musicVol * 100)}%`}
              </span>
            </div>

            {/* SFX Volume */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-[120px]">
                <button
                  onClick={toggleSfx}
                  className="text-slate-400 hover:text-white"
                >
                  {sfxMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-pink-400" />}
                </button>
                <span className="text-xs font-tech font-bold text-slate-300">
                  SFX VOLUME
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={sfxMuted ? 0 : sfxVol}
                onChange={handleSfxVolumeChange}
                className="flex-1 accent-pink-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-tech font-bold text-pink-400 tabular-nums w-10 text-right">
                {sfxMuted ? '0%' : `${Math.round(sfxVol * 100)}%`}
              </span>
            </div>
          </div>

          {/* Controls Guide */}
          <div>
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider mb-3">
              CONTROLS REFERENCE
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-white/10 bg-slate-800/40 flex items-start gap-3">
                <Keyboard className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-display font-bold text-white mb-1">KEYBOARD</h4>
                  <ul className="space-y-1 text-slate-400 font-tech">
                    <li><strong className="text-white">A / D or ← / → :</strong> Switch Lanes</li>
                    <li><strong className="text-white">W or ↑ :</strong> Jump over cars / barriers</li>
                    <li><strong className="text-white">S or ↓ :</strong> Slide under laser gantries</li>
                    <li><strong className="text-white">SPACE :</strong> Deploy Hoverboard Shield</li>
                    <li><strong className="text-white">ESC / P :</strong> Pause Game</li>
                  </ul>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-white/10 bg-slate-800/40 flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-display font-bold text-white mb-1">TOUCH & MOBILE</h4>
                  <ul className="space-y-1 text-slate-400 font-tech">
                    <li><strong className="text-white">Swipe Left / Right:</strong> Switch Lanes</li>
                    <li><strong className="text-white">Swipe Up:</strong> Jump</li>
                    <li><strong className="text-white">Swipe Down:</strong> Slide</li>
                    <li><strong className="text-white">Double Tap or Button:</strong> Hoverboard</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
