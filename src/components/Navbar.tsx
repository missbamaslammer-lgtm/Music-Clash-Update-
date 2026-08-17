import React, { useState, useEffect } from 'react';
import { GameMode, PlayerStats } from '../types';
import { soundEngine } from '../services/soundEngine';
import { 
  Swords, 
  Flame, 
  Sliders, 
  Trophy, 
  PlusCircle, 
  User, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Square,
  Mic,
  SlidersHorizontal,
  Users,
  Music2,
  Power,
  UploadCloud,
  DollarSign
} from 'lucide-react';

interface NavbarProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  playerStats: PlayerStats;
  onOpenUploadModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  playerStats,
  onOpenUploadModal,
}) => {
  const [isMuted, setIsMuted] = useState(soundEngine.getIsMuted());
  const [volume, setVolume] = useState(soundEngine.getVolume());
  const [isPlaybackOn, setIsPlaybackOn] = useState(soundEngine.getPlaybackOn());
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    soundEngine.registerStateListener((playing) => {
      setIsPlayingAudio(playing);
    });
  }, []);

  const handleTogglePlayback = () => {
    const nextState = !isPlaybackOn;
    setIsPlaybackOn(nextState);
    soundEngine.setPlaybackOn(nextState);
    soundEngine.playClick();
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    soundEngine.setMuted(nextMuted);
    setIsMuted(nextMuted);
    if (!nextMuted) {
      soundEngine.playClick();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundEngine.setVolume(val);
  };

  const handleStopAllSound = () => {
    soundEngine.stopPreview();
    soundEngine.playClick();
  };

  const navItems: { id: GameMode; label: string; icon: React.ReactNode; badge?: string; glow?: boolean }[] = [
    { id: 'duels', label: 'Song Duels', icon: <Swords className="w-3.5 h-3.5" /> },
    { id: 'beatlab', label: 'Beat Lab', icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: 'aiarena', label: 'AI Arena', icon: <Sparkles className="w-3.5 h-3.5" />, badge: '+$299 MCD', glow: true },
    { id: 'mastering', label: 'Mastering', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
    { id: 'beats', label: 'Free Beats', icon: <Music2 className="w-3.5 h-3.5" /> },
    { id: 'crew', label: 'Crew & Chat', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'tournament', label: 'Tournaments', icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'trivia', label: 'Trivia Blitz', icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'custom', label: 'Custom Clash', icon: <PlusCircle className="w-3.5 h-3.5" /> },
    { id: 'profile', label: 'DJ Profile', icon: <User className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#07030f]/90 backdrop-blur-xl border-b border-purple-900/40 px-3 lg:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-center justify-between gap-3">
        
        {/* Brand Logo & Playback Button */}
        <div className="flex items-center justify-between w-full xl:w-auto gap-4">
          <button
            id="brand-logo-btn"
            onClick={() => {
              soundEngine.playGong();
              onSelectMode('duels');
            }}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-cyan-300 p-[1.5px] flex items-center justify-center shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0d0718] rounded-[10px] flex items-center justify-center">
                <Music2 className="w-4 h-4 text-purple-300 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-white via-purple-200 to-fuchsia-300 bg-clip-text text-transparent">
                  CLASH BEAT LAB
                </span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-sm shadow-purple-500/20">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">Beat Making • AI Lyricist • Audio Mastering</p>
            </div>
          </button>

          {/* Quick Header Actions for Mobile */}
          <div className="flex xl:hidden items-center gap-2">
            <button
              onClick={handleTogglePlayback}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                isPlaybackOn 
                  ? 'bg-purple-950/60 border-purple-500/50 text-purple-300 shadow-sm shadow-purple-500/30' 
                  : 'bg-zinc-900 border-zinc-700 text-zinc-500'
              }`}
              title={isPlaybackOn ? 'Master Playback ON' : 'Master Playback OFF'}
            >
              <Power className={`w-3 h-3 ${isPlaybackOn ? 'text-purple-400' : 'text-zinc-600'}`} />
              <span>{isPlaybackOn ? 'PLAY ON' : 'PLAY OFF'}</span>
            </button>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-950/40 border border-purple-500/30 text-xs font-semibold text-purple-200">
              <span className="text-purple-400 font-bold">$MCD</span>
              <span>{(playerStats?.clashDollars ?? 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto w-full xl:w-auto p-1 bg-[#0f071e]/80 rounded-xl border border-purple-900/40 scrollbar-none">
          {navItems.map((item) => {
            const isActive = currentMode === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => {
                  soundEngine.playClick();
                  onSelectMode(item.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-600/30 border border-purple-300/30'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-purple-950/40'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : item.glow 
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-400/50 shadow-sm shadow-purple-500/40 animate-pulse'
                        : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Desktop Controls: Playback Toggle, Monopoly $MCD Currency, Upload, Audio Engine */}
        <div className="hidden xl:flex items-center gap-3">
          
          {/* Master Playback Switch */}
          <button
            id="global-playback-toggle-btn"
            onClick={handleTogglePlayback}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isPlaybackOn 
                ? 'bg-purple-950/70 border-purple-500/50 text-purple-200 shadow-md shadow-purple-500/25' 
                : 'bg-zinc-900/80 border-zinc-700 text-zinc-500'
            }`}
            title="Toggle Global Master Playback Engine"
          >
            <Power className={`w-3.5 h-3.5 ${isPlaybackOn ? 'text-purple-400' : 'text-zinc-600'}`} />
            <span>PLAYBACK: {isPlaybackOn ? 'ON' : 'OFF'}</span>
          </button>

          {/* Upload Button */}
          <button
            id="quick-upload-header-btn"
            onClick={() => {
              soundEngine.playClick();
              onOpenUploadModal();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-slate-100 hover:text-white transition-all shadow-sm"
          >
            <UploadCloud className="w-3.5 h-3.5 text-purple-300" />
            <span>Upload</span>
          </button>

          {/* Active Audio Playing Indicator */}
          {isPlayingAudio && (
            <button
              id="stop-audio-btn"
              onClick={handleStopAllSound}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-200 text-xs font-semibold hover:bg-purple-600/30 transition-all animate-pulse"
              title="Stop playing synth stem"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Playing</span>
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 bg-purple-400 h-2 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-0.5 bg-purple-400 h-3 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-0.5 bg-purple-400 h-1 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </button>
          )}

          {/* In-App Monopoly Currency Display ($MCD) */}
          <div className="flex items-center gap-2 bg-[#120924]/90 border border-purple-800/40 px-3 py-1.5 rounded-xl shadow-inner">
            <div className="flex items-center gap-1 text-xs font-extrabold text-purple-200">
              <span className="px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-400/40 text-[10px]">
                $MCD
              </span>
              <span className="text-white tracking-wide">{(playerStats?.clashDollars ?? 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Audio Volume Slider & Mute Toggle */}
          <div className="flex items-center gap-2 bg-[#120924]/90 border border-purple-800/40 px-2.5 py-1.5 rounded-xl">
            <button
              id="audio-mute-toggle-btn"
              onClick={handleToggleMute}
              className="text-zinc-400 hover:text-purple-300 transition-colors focus:outline-none"
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-zinc-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-purple-300" />
              )}
            </button>
            <input
              id="audio-volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              disabled={isMuted}
              className="w-14 h-1.5 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
          </div>

        </div>

      </div>
    </header>
  );
};
