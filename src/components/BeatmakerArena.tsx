import React, { useState, useEffect, useRef } from 'react';
import { BEAT_PADS, INITIAL_BEAT_PROJECTS, DEFAULT_MASTERING_SETTINGS } from '../data/musicData';
import { soundEngine } from '../services/soundEngine';
import { BeatPad, BeatProject, SequencerTrack, MasteringSettings, PlayerStats } from '../types';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Sparkles, 
  Flame, 
  Music, 
  Plus, 
  Trash2, 
  Mic, 
  MicOff, 
  FileText, 
  FolderPlus, 
  Save, 
  SlidersHorizontal, 
  Power, 
  Image as ImageIcon, 
  Video, 
  Headphones, 
  Share2, 
  Check,
  Zap,
  Repeat
} from 'lucide-react';

interface BeatmakerArenaProps {
  playerStats: PlayerStats;
  onUpdateStats: (stats: PlayerStats) => void;
  onOpenMastering?: (settings: MasteringSettings) => void;
  onOpenAiArena?: (lyrics: string, genre: string, bpm: number) => void;
}

export const BeatmakerArena: React.FC<BeatmakerArenaProps> = ({
  playerStats,
  onUpdateStats,
  onOpenMastering,
  onOpenAiArena,
}) => {
  // Project Management State
  const [projects, setProjects] = useState<BeatProject[]>(INITIAL_BEAT_PROJECTS as BeatProject[]);
  const [activeProjectId, setActiveProjectId] = useState<string>(projects[0]?.id || 'proj-1');

  const currentProject = projects.find(p => p.id === activeProjectId) || projects[0];

  // Sequencer Engine State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackOn, setPlaybackOn] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [activePadId, setActivePadId] = useState<string | null>(null);

  // Active Project Editable Fields
  const [bpm, setBpm] = useState(currentProject.bpm);
  const [tracks, setTracks] = useState<SequencerTrack[]>(currentProject.tracks);
  const [lyrics, setLyrics] = useState(currentProject.lyrics || '');
  const [projectTitle, setProjectTitle] = useState(currentProject.title);
  const [genre, setGenre] = useState(currentProject.genre);
  const [saveToast, setSaveToast] = useState(false);

  // Vocal Recorder State
  const [isRecordingVocal, setIsRecordingVocal] = useState(false);
  const [vocalAudioUrl, setVocalAudioUrl] = useState<string | null>(currentProject.vocalAudioUrl || null);
  const [isVocalMuted, setIsVocalMuted] = useState(false);
  const [vocalVolume, setVocalVolume] = useState(0.85);

  // Tab: 'sequencer' | 'lyrics' | 'pads' | 'vocal'
  const [activeStudioTab, setActiveStudioTab] = useState<'sequencer' | 'pads' | 'lyrics' | 'vocal'>('sequencer');

  // Sync state when active project changes
  useEffect(() => {
    if (currentProject) {
      setBpm(currentProject.bpm);
      setTracks(currentProject.tracks);
      setLyrics(currentProject.lyrics || '');
      setProjectTitle(currentProject.title);
      setGenre(currentProject.genre);
      setVocalAudioUrl(currentProject.vocalAudioUrl || null);
    }
  }, [activeProjectId]);

  // Main Sequencer 16-Step Loop
  useEffect(() => {
    let timer: number | null = null;
    if (isPlaying && playbackOn) {
      const stepDurationMs = (60 / bpm / 4) * 1000;

      timer = window.setInterval(() => {
        setCurrentStep((prev) => {
          const next = (prev + 1) % 16;
          playStepSounds(next);
          return next;
        });
      }, stepDurationMs);
    } else {
      setCurrentStep(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, bpm, tracks, playbackOn]);

  const playStepSounds = (step: number) => {
    if (!playbackOn) return;

    const hasSolo = tracks.some(t => t.isSolo);

    tracks.forEach((track) => {
      if (track.steps[step]) {
        if (track.isMuted) return;
        if (hasSolo && !track.isSolo) return;

        switch (track.soundType) {
          case 'kick':
            soundEngine.playKick(0, track.volume);
            break;
          case 'snare':
            soundEngine.playSnare(0, track.volume);
            break;
          case 'hihat':
            soundEngine.playHiHat(0, step % 4 === 2, track.volume);
            break;
          case '808':
            soundEngine.play808(0, 48.99, track.volume);
            break;
          case 'clap':
            soundEngine.playClap(0, track.volume);
            break;
          case 'vocalChop':
            soundEngine.playVocalChop(0, 523.25, track.volume);
            break;
          case 'synthLead':
            soundEngine.playSynthNote(440 + (step % 4) * 50, 'sawtooth', 0.15, 0, track.volume);
            break;
          case 'synthChord':
            soundEngine.playChord([220, 261.63, 329.63], 0.3, 0, track.volume);
            break;
          case 'synthBass':
            soundEngine.playSynthNote(110, 'sawtooth', 0.1, 0, track.volume);
            break;
          case 'percussion':
            soundEngine.playPercussion(0, track.volume);
            break;
          case 'rimshot':
            soundEngine.playRimshot(0, track.volume);
            break;
        }
      }
    });
  };

  // Keyboard live triggers for Beat Pads
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      const key = e.key.toUpperCase();
      const pad = BEAT_PADS.find(p => p.keyboardKey === key);
      if (pad) {
        e.preventDefault();
        handleTriggerPad(pad);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTriggerPad = (pad: BeatPad) => {
    setActivePadId(pad.id);
    setTimeout(() => setActivePadId(null), 180);

    switch (pad.soundType) {
      case 'kick':
        soundEngine.playKick();
        break;
      case 'snare':
        soundEngine.playSnare();
        break;
      case 'hihat':
        soundEngine.playHiHat(0, false);
        break;
      case '808':
        soundEngine.play808(0, pad.note === 'F1' ? 43.65 : 48.99);
        break;
      case 'clap':
        soundEngine.playClap();
        break;
      case 'vocalChop':
        soundEngine.playVocalChop(0, pad.note === 'C5' ? 523.25 : 440);
        break;
      case 'synthLead':
        soundEngine.playSynthNote(pad.note === 'G5' ? 783.99 : 523.25, 'sawtooth', 0.2);
        break;
      case 'synthChord':
        soundEngine.playChord(pad.note === 'Am' ? [220, 261.63, 329.63] : [174.61, 220, 261.63], 0.35);
        break;
      case 'synthBass':
        soundEngine.playSynthNote(73.42, 'triangle', 0.25);
        break;
      case 'percussion':
        soundEngine.playPercussion();
        break;
      case 'fxLaser':
        soundEngine.playVoteWhoosh();
        break;
    }
  };

  const handleToggleStep = (trackId: string, stepIndex: number) => {
    soundEngine.playClick();
    setTracks(prev => prev.map(t => {
      if (t.id === trackId) {
        const newSteps = [...t.steps];
        newSteps[stepIndex] = !newSteps[stepIndex];
        return { ...t, steps: newSteps };
      }
      return t;
    }));
  };

  const handleToggleMute = (trackId: string) => {
    soundEngine.playClick();
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, isMuted: !t.isMuted } : t));
  };

  const handleToggleSolo = (trackId: string) => {
    soundEngine.playClick();
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, isSolo: !t.isSolo } : t));
  };

  const handleVolumeChange = (trackId: string, val: number) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, volume: val } : t));
  };

  // Add Instrument Track
  const handleAddTrack = (type: SequencerTrack['soundType']) => {
    soundEngine.playClick();
    const names: Record<SequencerTrack['soundType'], string> = {
      kick: 'Kick Punch',
      snare: 'Trap Snare',
      hihat: '16th Hat',
      808: '808 Sub Slide',
      clap: 'Studio Clap',
      vocalChop: 'Vocal "Ayy" Chop',
      synthLead: 'Lead Synth Arp',
      synthChord: 'Analog Chords',
      synthBass: 'Sub Bass Glide',
      percussion: 'Rim & Shaker',
      rimshot: 'Rimshot Click'
    };

    const colors: Record<SequencerTrack['soundType'], string> = {
      kick: 'bg-purple-600',
      snare: 'bg-fuchsia-500',
      hihat: 'bg-violet-400',
      808: 'bg-purple-950',
      clap: 'bg-pink-500',
      vocalChop: 'bg-rose-500',
      synthLead: 'bg-cyan-400',
      synthChord: 'bg-indigo-500',
      synthBass: 'bg-purple-900',
      percussion: 'bg-zinc-600',
      rimshot: 'bg-purple-400'
    };

    const newTrack: SequencerTrack = {
      id: `track-${Date.now()}`,
      name: names[type] || 'Instrument Track',
      soundType: type,
      color: colors[type] || 'bg-purple-500',
      steps: new Array(16).fill(false),
      volume: 0.8,
      isMuted: false,
      isSolo: false
    };

    setTracks(prev => [...prev, newTrack]);
  };

  const handleRemoveTrack = (trackId: string) => {
    soundEngine.playClick();
    setTracks(prev => prev.filter(t => t.id !== trackId));
  };

  // Save Project
  const handleSaveProject = () => {
    soundEngine.playCorrect();
    const updatedProject: BeatProject = {
      ...currentProject,
      title: projectTitle,
      bpm,
      genre,
      tracks,
      lyrics,
      vocalAudioUrl: vocalAudioUrl || undefined,
      playbackEnabled: playbackOn,
      updatedAt: 'Just now'
    };

    setProjects(prev => prev.map(p => p.id === activeProjectId ? updatedProject : p));
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // Create New Project
  const handleCreateNewProject = () => {
    soundEngine.playFanfare();
    const newProj: BeatProject = {
      id: `proj-${Date.now()}`,
      title: `Beat Project #${projects.length + 1}`,
      bpm: 135,
      key: 'D Minor',
      genre: 'Trap / Dark Drill',
      lyrics: `[Verse 1]\nNew beat loaded in the lab, watch the frequencies glow...`,
      playbackEnabled: true,
      masteringSettings: DEFAULT_MASTERING_SETTINGS,
      tracks: [
        {
          id: 't-kick',
          name: 'Kick Drum (Punch)',
          soundType: 'kick',
          color: 'bg-purple-600',
          steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
          volume: 0.9,
          isMuted: false,
          isSolo: false
        },
        {
          id: 't-snare',
          name: 'Trap Snare',
          soundType: 'snare',
          color: 'bg-fuchsia-500',
          steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
          volume: 0.85,
          isMuted: false,
          isSolo: false
        },
        {
          id: 't-hihat',
          name: 'Hi-Hat 16th',
          soundType: 'hihat',
          color: 'bg-violet-400',
          steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
          volume: 0.7,
          isMuted: false,
          isSolo: false
        },
        {
          id: 't-808',
          name: '808 Sub Bass',
          soundType: '808',
          color: 'bg-purple-900',
          steps: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
          volume: 1.0,
          isMuted: false,
          isSolo: false
        }
      ],
      createdAt: 'Just now',
      updatedAt: 'Just now'
    };

    setProjects(prev => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
  };

  // Vocal Recording
  const handleToggleVocalRecord = async () => {
    if (isRecordingVocal) {
      soundEngine.playClick();
      const url = await soundEngine.stopVocalRecording();
      setIsRecordingVocal(false);
      setVocalAudioUrl(url || 'vocal-recorded-take');
    } else {
      soundEngine.playClick();
      const success = await soundEngine.startVocalRecording();
      setIsRecordingVocal(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Project Selector & Master Control Bar */}
      <div className="relative overflow-hidden rounded-2xl p-5 lg:p-6 bg-gradient-to-r from-[#17082e] via-[#0f041f] to-[#070210] border border-purple-500/30 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          
          {/* Project Title & Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="text-lg md:text-xl font-extrabold text-white bg-transparent border-b border-purple-500/40 focus:border-purple-300 focus:outline-none px-1"
                />
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-400/40">
                  {genre}
                </span>
              </div>
              <p className="text-xs text-zinc-400">16-Step Pattern Sequencer • Multi-Track Studio</p>
            </div>

            {/* Project Switcher Dropdown */}
            <select
              value={activeProjectId}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="bg-[#090412] border border-purple-900/60 text-xs font-bold text-purple-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-400"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>

            <button
              id="new-project-btn"
              onClick={handleCreateNewProject}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-purple-300 hover:text-white transition-all"
              title="Create New Beat Project"
            >
              <FolderPlus className="w-4 h-4" />
            </button>

            <button
              id="save-project-btn"
              onClick={handleSaveProject}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all"
            >
              {saveToast ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saveToast ? 'Saved!' : 'Save'}</span>
            </button>
          </div>

          {/* Master Transport Controls */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Playback On/Off Toggle */}
            <button
              id="playback-mute-toggle-btn"
              onClick={() => {
                soundEngine.playClick();
                setPlaybackOn(!playbackOn);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                playbackOn
                  ? 'bg-purple-950/70 border-purple-500/50 text-purple-200 shadow-sm shadow-purple-500/30'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-500'
              }`}
              title="Master Playback Engine On/Off"
            >
              <Power className={`w-3.5 h-3.5 ${playbackOn ? 'text-purple-400' : 'text-zinc-600'}`} />
              <span>PLAYBACK: {playbackOn ? 'ON' : 'OFF'}</span>
            </button>

            {/* BPM Dial */}
            <div className="flex items-center gap-2 bg-[#090412] px-3 py-1.5 rounded-xl border border-purple-900/50">
              <span className="text-xs font-bold text-zinc-400">BPM</span>
              <input
                type="number"
                min={60}
                max={220}
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
                className="w-14 bg-transparent text-xs font-black text-white focus:outline-none"
              />
            </div>

            {/* Play / Stop Button */}
            <button
              id="master-play-stop-btn"
              onClick={() => {
                soundEngine.playClick();
                setIsPlaying(!isPlaying);
              }}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all shadow-xl ${
                isPlaying
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40'
                  : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-purple-600/40 hover:scale-105'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Loop</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Sequence</span>
                </>
              )}
            </button>

            {/* Mastering Shortcut */}
            {onOpenMastering && (
              <button
                onClick={() => onOpenMastering(currentProject.masteringSettings)}
                className="px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                <span>Mastering</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Studio View Navigation: Sequencer / 16-Pads / Lyrical Notepad / Vocal Studio */}
      <div className="flex items-center gap-2 bg-[#090412] p-1.5 rounded-2xl border border-purple-900/40 w-fit">
        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveStudioTab('sequencer');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeStudioTab === 'sequencer'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>16-Step Sequencer</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveStudioTab('pads');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeStudioTab === 'pads'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>16-Pad MPC Grid</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveStudioTab('vocal');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeStudioTab === 'vocal'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Vocal Studio Take</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveStudioTab('lyrics');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeStudioTab === 'lyrics'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Lyrical Notepad</span>
        </button>
      </div>

      {/* TAB 1: 16-Step Sequencer Multi-Track Matrix */}
      {activeStudioTab === 'sequencer' && (
        <div className="glass-panel rounded-2xl p-6 border border-purple-800/40 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-900/40 pb-4">
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                Multi-Instrument Sequencer Grid
              </h2>
              <p className="text-xs text-zinc-400">Click steps to toggle hits. Solo and mute stems in real time.</p>
            </div>

            {/* Add Instrument Track Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Add Stem:</span>
              {[
                { type: 'vocalChop', label: '+ Vocal Chop' },
                { type: 'synthLead', label: '+ Lead Arp' },
                { type: 'percussion', label: '+ Perc/Rim' },
                { type: 'synthChord', label: '+ Chords' },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => handleAddTrack(item.type as SequencerTrack['soundType'])}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-purple-300 border border-white/10 transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sequencer Track Rows */}
          <div className="space-y-4 overflow-x-auto pb-2">
            {tracks.map((track) => (
              <div key={track.id} className="min-w-[700px] flex items-center gap-4 bg-[#0a0414]/80 p-3 rounded-2xl border border-purple-950/60">
                
                {/* Track Controls (Name, Mute, Solo, Volume, Delete) */}
                <div className="w-48 space-y-1.5 shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{track.name}</span>
                    <button
                      onClick={() => handleRemoveTrack(track.id)}
                      className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                      title="Delete Track"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleMute(track.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold border transition-all ${
                        track.isMuted 
                          ? 'bg-rose-600 text-white border-rose-500' 
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      MUTE
                    </button>

                    <button
                      onClick={() => handleToggleSolo(track.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold border transition-all ${
                        track.isSolo 
                          ? 'bg-amber-500 text-black font-black border-amber-400' 
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      SOLO
                    </button>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={track.volume}
                      onChange={(e) => handleVolumeChange(track.id, parseFloat(e.target.value))}
                      className="w-16 h-1 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-purple-500 ml-auto"
                      title={`Volume: ${Math.round(track.volume * 100)}%`}
                    />
                  </div>
                </div>

                {/* 16 Step Buttons */}
                <div className="flex-1 grid grid-cols-16 gap-1.5">
                  {track.steps.map((isActive, stepIdx) => {
                    const isCurrentBeat = isPlaying && currentStep === stepIdx;
                    const isQuarterBeat = stepIdx % 4 === 0;

                    return (
                      <button
                        key={stepIdx}
                        onClick={() => handleToggleStep(track.id, stepIdx)}
                        className={`h-11 rounded-lg border transition-all flex items-center justify-center relative ${
                          isActive
                            ? 'bg-gradient-to-t from-purple-600 to-fuchsia-500 border-purple-300 shadow-md shadow-purple-600/30'
                            : isQuarterBeat
                              ? 'bg-purple-950/40 border-purple-900/60 hover:bg-purple-900/40'
                              : 'bg-[#06020c] border-purple-950/40 hover:bg-purple-950/20'
                        } ${isCurrentBeat ? 'ring-2 ring-white scale-105 z-10' : ''}`}
                      >
                        {isActive && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                      </button>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 2: 16-Pad MPC Drum Grid */}
      {activeStudioTab === 'pads' && (
        <div className="glass-panel rounded-2xl p-6 border border-purple-800/40 space-y-4">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-purple-400" />
                16-Pad Live Studio Controller
              </h2>
              <p className="text-xs text-zinc-400">Trigger live drum hits and vocal chops with keyboard keys [1-4, Q-R, A-F, Z-V]</p>
            </div>
            <span className="text-[10px] text-purple-300 font-mono">Polyphonic Synth</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {BEAT_PADS.map((pad) => {
              const isActive = activePadId === pad.id;
              return (
                <button
                  key={pad.id}
                  id={`beat-pad-${pad.id}`}
                  onClick={() => handleTriggerPad(pad)}
                  className={`h-24 rounded-2xl p-3 flex flex-col justify-between text-left border transition-all select-none active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-tr from-purple-500 to-fuchsia-400 border-white text-white shadow-xl shadow-purple-600/50 scale-105'
                      : 'bg-[#0e061c] border-purple-800/40 hover:border-purple-500/60 text-purple-100 hover:bg-purple-950/40 shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-wider text-purple-300">{pad.name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-black/50 border border-purple-500/30 text-[10px] font-mono text-zinc-300">
                      {pad.keyboardKey}
                    </span>
                  </div>

                  <div className="flex items-end justify-between">
                    <span className="text-[10px] text-zinc-400 font-mono">{pad.soundType}</span>
                    {pad.note && (
                      <span className="text-[10px] font-extrabold text-purple-300">{pad.note}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Vocal Studio Track */}
      {activeStudioTab === 'vocal' && (
        <div className="glass-panel rounded-2xl p-6 border border-purple-800/40 space-y-6">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Mic className="w-4 h-4 text-purple-400" />
                Vocal Studio Take & Stem Recorder
              </h2>
              <p className="text-xs text-zinc-400">Record human vocal takes over the active beat pattern.</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-400/40">
              Vocal Stem Engine
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-[#090412] border border-purple-900/40 flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Mic Visualizer Icon */}
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white transition-all shadow-xl ${
                isRecordingVocal
                  ? 'bg-rose-600 animate-pulse shadow-rose-600/50 scale-105'
                  : 'bg-gradient-to-tr from-purple-600 to-fuchsia-600 shadow-purple-600/30'
              }`}>
                <Mic className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-white">
                  {isRecordingVocal ? 'Recording Live Vocal Take...' : vocalAudioUrl ? 'Vocal Take Loaded' : 'No Vocal Take Recorded'}
                </h3>
                <p className="text-xs text-zinc-400">
                  {isRecordingVocal ? 'Sing or rap into your mic in sync with the beat!' : 'Start the sequencer and hit record to lay down your voice.'}
                </p>
              </div>
            </div>

            {/* Vocal Record Action */}
            <div className="flex items-center gap-3">
              <button
                id="toggle-vocal-record-btn"
                onClick={handleToggleVocalRecord}
                className={`px-6 py-3 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-xl transition-all ${
                  isRecordingVocal
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40 animate-pulse'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/40 hover:scale-105'
                }`}
              >
                {isRecordingVocal ? (
                  <>
                    <Square className="w-4 h-4 fill-current" />
                    <span>Stop Recording Take</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>{vocalAudioUrl ? 'Re-Record Vocal Take' : 'Record Vocal Take'}</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Vocal Stem Mixer Controls */}
          {vocalAudioUrl && (
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-700/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Headphones className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-xs font-bold text-white">Vocal Stem Channel</div>
                  <div className="text-[10px] text-zinc-400">Processed through Master Chain</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsVocalMuted(!isVocalMuted)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                    isVocalMuted 
                      ? 'bg-rose-600 text-white border-rose-500' 
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  }`}
                >
                  {isVocalMuted ? 'Muted' : 'Audible'}
                </button>

                <div className="flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={vocalVolume}
                    onChange={(e) => setVocalVolume(parseFloat(e.target.value))}
                    className="w-24 h-1.5 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 4: Lyrical Notepad & Rhyme Assistant */}
      {activeStudioTab === 'lyrics' && (
        <div className="glass-panel rounded-2xl p-6 border border-purple-800/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-900/40 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Lyrical Notepad & Rhyme Studio
              </h2>
              <p className="text-xs text-zinc-400">Draft bars, hooks, and sync with your 16-step beat sequence.</p>
            </div>

            {onOpenAiArena && (
              <button
                onClick={() => onOpenAiArena(lyrics, genre, bpm)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>Pair in AI Arena (+$299 MCD)</span>
              </button>
            )}
          </div>

          <textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            rows={10}
            className="w-full bg-[#080312] border border-purple-900/50 rounded-2xl p-4 text-xs font-mono text-purple-100 placeholder-zinc-500 focus:outline-none focus:border-purple-400 leading-relaxed resize-none"
            placeholder="Write your bars, intro, verses, and hooks here..."
          />

          <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
            <span>{lyrics.split('\n').filter(Boolean).length} Lines Written</span>
            <span className="text-purple-300 font-mono">BPM: {bpm} • Tempo: {genre}</span>
          </div>
        </div>
      )}

    </div>
  );
};
