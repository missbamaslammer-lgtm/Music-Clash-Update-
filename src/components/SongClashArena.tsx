import React, { useState } from 'react';
import { ClashMatchup, Track, TrackStats } from '../types';
import { soundEngine } from '../services/soundEngine';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Square, 
  Flame, 
  Award, 
  Disc, 
  Sparkles, 
  BarChart2, 
  Info, 
  ChevronRight, 
  Shuffle, 
  CheckCircle2, 
  MessageSquareQuote,
  Zap,
  TrendingUp,
  Volume2
} from 'lucide-react';

interface SongClashArenaProps {
  matchups: ClashMatchup[];
  activeMatchupIndex: number;
  onSelectMatchup: (index: number) => void;
  onVote: (matchupId: string, choice: 'A' | 'B') => void;
  userVotes: Record<string, 'A' | 'B'>;
}

export const SongClashArena: React.FC<SongClashArenaProps> = ({
  matchups,
  activeMatchupIndex,
  onSelectMatchup,
  onVote,
  userVotes,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeAudioPlayingTrackId, setActiveAudioPlayingTrackId] = useState<string | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<{ A: boolean; B: boolean }>({ A: false, B: false });
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({
    '🔥 Hype': 142,
    '🎤 Vocals': 98,
    '🥁 Beat Drop': 176,
    '👑 Timeless': 210,
  });

  const currentMatchup = matchups[activeMatchupIndex] || matchups[0];
  const userVote = userVotes[currentMatchup.id] || currentMatchup.userVote;

  const categories = ['All', 'Electronic / Pop', 'Hip-Hop / Rap', 'Classic Rock', 'Dance-Pop', 'EDM / Dance', '80s Royalty'];

  const filteredMatchups = selectedCategory === 'All' 
    ? matchups 
    : matchups.filter(m => m.category.toLowerCase().includes(selectedCategory.toLowerCase()) || selectedCategory.toLowerCase().includes(m.category.toLowerCase()));

  const handleToggleAudio = (track: Track) => {
    if (activeAudioPlayingTrackId === track.id) {
      soundEngine.stopPreview();
      setActiveAudioPlayingTrackId(null);
    } else {
      soundEngine.playPreviewRiff(track.synthRiff);
      setActiveAudioPlayingTrackId(track.id);
    }
  };

  const handleCastVote = (choice: 'A' | 'B') => {
    if (userVote) return; // already voted for this matchup

    soundEngine.playVoteWhoosh();
    soundEngine.playGong();

    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: choice === 'A' ? ['#f43f5e', '#fb7185', '#fda4af'] : ['#06b6d4', '#38bdf8', '#818cf8']
    });

    onVote(currentMatchup.id, choice);
  };

  const handleNextMatchup = () => {
    soundEngine.playClick();
    soundEngine.stopPreview();
    setActiveAudioPlayingTrackId(null);
    const nextIdx = (activeMatchupIndex + 1) % matchups.length;
    onSelectMatchup(nextIdx);
  };

  const handleRandomMatchup = () => {
    soundEngine.playClick();
    soundEngine.stopPreview();
    setActiveAudioPlayingTrackId(null);
    const randomIdx = Math.floor(Math.random() * matchups.length);
    onSelectMatchup(randomIdx);
  };

  const handleAddReaction = (emojiLabel: string) => {
    soundEngine.playClick();
    setReactionCounts(prev => ({
      ...prev,
      [emojiLabel]: (prev[emojiLabel] || 0) + 1
    }));
  };

  // Calculate vote percentage
  const totalVotes = currentMatchup.votesA + currentMatchup.votesB;
  const pctA = totalVotes > 0 ? Math.round((currentMatchup.votesA / totalVotes) * 100) : 50;
  const pctB = 100 - pctA;

  return (
    <div className="space-y-6">
      
      {/* Category Pills & Duel Selector Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800/80">
        
        {/* Category filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundEngine.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Action Controls: Shuffle / Matchup dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <select
            id="clash-matchup-select"
            value={activeMatchupIndex}
            onChange={(e) => {
              soundEngine.playClick();
              soundEngine.stopPreview();
              setActiveAudioPlayingTrackId(null);
              onSelectMatchup(parseInt(e.target.value));
            }}
            className="bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-xl px-3 py-2 border border-zinc-700 focus:outline-none focus:border-rose-500 max-w-[200px] truncate"
          >
            {matchups.map((m, idx) => (
              <option key={m.id} value={idx}>
                #{idx + 1}: {m.trackA.title} vs {m.trackB.title}
              </option>
            ))}
          </select>

          <button
            id="shuffle-clash-btn"
            onClick={handleRandomMatchup}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-zinc-200 transition-colors"
            title="Random Clash Matchup"
          >
            <Shuffle className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Shuffle</span>
          </button>
        </div>
      </div>

      {/* Main Clash Stage Card */}
      <div className="relative bg-zinc-900/90 rounded-3xl border border-zinc-800 p-5 md:p-8 shadow-2xl overflow-hidden">
        
        {/* Stage Glow Accents */}
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Clash Title & Matchup Info */}
        <div className="text-center max-w-2xl mx-auto mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/90 border border-zinc-700/80 text-xs font-bold text-rose-400 mb-2">
            <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>{currentMatchup.category}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {currentMatchup.title}
          </h2>
          <p className="text-sm text-zinc-400 mt-1.5">
            {currentMatchup.description}
          </p>
        </div>

        {/* Arena Dual Grid: Track A vs Track B */}
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-stretch relative z-10">
          
          {/* TRACK A CARD */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-zinc-950/80 rounded-2xl border-2 border-zinc-800/90 hover:border-rose-500/60 p-5 md:p-6 transition-all duration-300 relative group overflow-hidden">
            
            {/* Playing Glow Accent */}
            {activeAudioPlayingTrackId === currentMatchup.trackA.id && (
              <div className="absolute inset-0 bg-rose-500/5 pointer-events-none border-2 border-rose-500/60 rounded-2xl" />
            )}

            <div>
              {/* Card Header & Genre */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  CORNER A
                </span>
                <span className="text-[11px] font-semibold text-zinc-400 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                  {currentMatchup.trackA.genre}
                </span>
              </div>

              {/* Album Art & Vinyl Disc */}
              <div className="relative flex items-center justify-center my-4 py-2">
                
                {/* Vinyl Record */}
                <div className={`w-36 h-36 md:w-44 md:h-44 rounded-full bg-zinc-950 border-4 border-zinc-900 shadow-2xl flex items-center justify-center relative transition-transform duration-700 ${
                  activeAudioPlayingTrackId === currentMatchup.trackA.id ? 'animate-spin' : ''
                }`}>
                  {/* Vinyl Grooves */}
                  <div className="absolute inset-2 rounded-full border border-zinc-800/60" />
                  <div className="absolute inset-5 rounded-full border border-zinc-800/40" />
                  <div className="absolute inset-8 rounded-full border border-zinc-800/30" />
                  {/* Center Label */}
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr ${currentMatchup.trackA.coverGradient} flex items-center justify-center text-white text-center p-2 shadow-inner`}>
                    <Disc className="w-6 h-6 text-white/90" />
                  </div>
                </div>

                {/* Audio Synth Preview Trigger */}
                <button
                  id={`play-preview-${currentMatchup.trackA.id}`}
                  onClick={() => handleToggleAudio(currentMatchup.trackA)}
                  className={`absolute bottom-2 right-4 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
                    activeAudioPlayingTrackId === currentMatchup.trackA.id
                      ? 'bg-rose-600 text-white shadow-rose-600/40 animate-pulse'
                      : 'bg-zinc-800/90 text-zinc-200 hover:bg-rose-500 hover:text-white border border-zinc-700'
                  }`}
                  title="Play/Stop synthesized preview"
                >
                  {activeAudioPlayingTrackId === currentMatchup.trackA.id ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop Synth</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Hear Riff</span>
                    </>
                  )}
                </button>
              </div>

              {/* Title & Artist */}
              <div className="text-center mt-2 mb-4">
                <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  {currentMatchup.trackA.title}
                </h3>
                <p className="text-sm font-semibold text-zinc-400 mt-0.5">
                  {currentMatchup.trackA.artist} • <span className="text-zinc-500">{currentMatchup.trackA.year}</span>
                </p>
                <div className="flex items-center justify-center gap-3 text-xs text-zinc-400 mt-2">
                  <span className="font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {currentMatchup.trackA.bpm} BPM
                  </span>
                  <span className="font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    Key: {currentMatchup.trackA.key}
                  </span>
                </div>
              </div>

              {/* Sonic Stat Radar Bars */}
              <div className="bg-zinc-900/90 rounded-xl p-3.5 border border-zinc-800/80 mb-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 mb-1">
                  <span className="flex items-center gap-1">
                    <BarChart2 className="w-3.5 h-3.5 text-rose-400" />
                    SONIC ATTRIBUTES
                  </span>
                  <span className="text-rose-400">Score Rating</span>
                </div>

                {/* Vocals */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-zinc-300">
                    <span>Vocals</span>
                    <span className="font-mono font-semibold">{currentMatchup.trackA.stats.vocals}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${currentMatchup.trackA.stats.vocals}%` }} />
                  </div>
                </div>

                {/* Beat Drop / Rhythm */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-zinc-300">
                    <span>Beat Drop / Groove</span>
                    <span className="font-mono font-semibold">{currentMatchup.trackA.stats.beatDrop}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${currentMatchup.trackA.stats.beatDrop}%` }} />
                  </div>
                </div>

                {/* Hype Energy */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-zinc-300">
                    <span>Hype / Energy</span>
                    <span className="font-mono font-semibold">{currentMatchup.trackA.stats.hype}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${currentMatchup.trackA.stats.hype}%` }} />
                  </div>
                </div>
              </div>

              {/* Lyrical Quote snippet */}
              <div className="bg-zinc-900/60 rounded-xl p-3 border border-zinc-800 text-xs italic text-zinc-300 mb-4 flex items-start gap-2">
                <MessageSquareQuote className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p>"{currentMatchup.trackA.lyricsSnippet}"</p>
              </div>

              {/* Fun Fact Toggle */}
              <div className="mb-4">
                <button
                  onClick={() => setExpandedDetails(prev => ({ ...prev, A: !prev.A }))}
                  className="text-xs font-semibold text-zinc-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>{expandedDetails.A ? 'Hide Fun Fact' : 'Show Song Lore'}</span>
                </button>
                {expandedDetails.A && (
                  <p className="text-xs text-zinc-400 bg-zinc-900/90 p-2.5 rounded-lg border border-zinc-800 mt-2">
                    {currentMatchup.trackA.funFact}
                  </p>
                )}
              </div>
            </div>

            {/* VOTE BUTTON A */}
            <div className="pt-2">
              <button
                id="vote-track-a-btn"
                onClick={() => handleCastVote('A')}
                className={`w-full py-3.5 px-4 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all shadow-lg ${
                  userVote === 'A'
                    ? 'bg-emerald-500 text-zinc-950 shadow-emerald-500/25 ring-2 ring-emerald-400'
                    : userVote === 'B'
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-rose-500/30 hover:scale-[1.02]'
                }`}
              >
                {userVote === 'A' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>YOUR VOTE ({pctA}%)</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4" />
                    <span>VOTE FOR {currentMatchup.trackA.title.toUpperCase()}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CENTER VS GAUGE & BATTLE METER */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center py-4 lg:py-0 gap-4">
            
            {/* VS Badge */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-cyan-400 p-[2px] shadow-xl shadow-purple-500/30">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <span className="font-black text-lg bg-gradient-to-br from-rose-400 to-cyan-400 bg-clip-text text-transparent">
                  VS
                </span>
              </div>
            </div>

            {/* Live Vote % Meter */}
            <div className="w-full text-center space-y-1">
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                VOTES
              </div>
              <div className="flex items-center justify-between text-xs font-black px-1 font-mono">
                <span className="text-rose-400">{pctA}%</span>
                <span className="text-cyan-400">{pctB}%</span>
              </div>
              <div className="h-3 w-full bg-zinc-950 rounded-full border border-zinc-800 p-0.5 flex overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-l-full transition-all duration-700"
                  style={{ width: `${pctA}%` }} 
                />
                <div 
                  className="h-full bg-cyan-400 rounded-r-full transition-all duration-700"
                  style={{ width: `${pctB}%` }} 
                />
              </div>
              <div className="text-[10px] text-zinc-500 font-mono">
                {totalVotes.toLocaleString()} cast
              </div>
            </div>

            {/* Next Clash Trigger */}
            <button
              id="next-matchup-btn"
              onClick={handleNextMatchup}
              className="mt-2 p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white transition-colors"
              title="Next Clash Matchup"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* TRACK B CARD */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-zinc-950/80 rounded-2xl border-2 border-zinc-800/90 hover:border-cyan-500/60 p-5 md:p-6 transition-all duration-300 relative group overflow-hidden">
            
            {/* Playing Glow Accent */}
            {activeAudioPlayingTrackId === currentMatchup.trackB.id && (
              <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none border-2 border-cyan-500/60 rounded-2xl" />
            )}

            <div>
              {/* Card Header & Genre */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  CORNER B
                </span>
                <span className="text-[11px] font-semibold text-zinc-400 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                  {currentMatchup.trackB.genre}
                </span>
              </div>

              {/* Album Art & Vinyl Disc */}
              <div className="relative flex items-center justify-center my-4 py-2">
                
                {/* Vinyl Record */}
                <div className={`w-36 h-36 md:w-44 md:h-44 rounded-full bg-zinc-950 border-4 border-zinc-900 shadow-2xl flex items-center justify-center relative transition-transform duration-700 ${
                  activeAudioPlayingTrackId === currentMatchup.trackB.id ? 'animate-spin' : ''
                }`}>
                  {/* Vinyl Grooves */}
                  <div className="absolute inset-2 rounded-full border border-zinc-800/60" />
                  <div className="absolute inset-5 rounded-full border border-zinc-800/40" />
                  <div className="absolute inset-8 rounded-full border border-zinc-800/30" />
                  {/* Center Label */}
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr ${currentMatchup.trackB.coverGradient} flex items-center justify-center text-white text-center p-2 shadow-inner`}>
                    <Disc className="w-6 h-6 text-white/90" />
                  </div>
                </div>

                {/* Audio Synth Preview Trigger */}
                <button
                  id={`play-preview-${currentMatchup.trackB.id}`}
                  onClick={() => handleToggleAudio(currentMatchup.trackB)}
                  className={`absolute bottom-2 right-4 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
                    activeAudioPlayingTrackId === currentMatchup.trackB.id
                      ? 'bg-cyan-500 text-zinc-950 shadow-cyan-500/40 animate-pulse'
                      : 'bg-zinc-800/90 text-zinc-200 hover:bg-cyan-500 hover:text-zinc-950 border border-zinc-700'
                  }`}
                  title="Play/Stop synthesized preview"
                >
                  {activeAudioPlayingTrackId === currentMatchup.trackB.id ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop Synth</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Hear Riff</span>
                    </>
                  )}
                </button>
              </div>

              {/* Title & Artist */}
              <div className="text-center mt-2 mb-4">
                <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  {currentMatchup.trackB.title}
                </h3>
                <p className="text-sm font-semibold text-zinc-400 mt-0.5">
                  {currentMatchup.trackB.artist} • <span className="text-zinc-500">{currentMatchup.trackB.year}</span>
                </p>
                <div className="flex items-center justify-center gap-3 text-xs text-zinc-400 mt-2">
                  <span className="font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {currentMatchup.trackB.bpm} BPM
                  </span>
                  <span className="font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    Key: {currentMatchup.trackB.key}
                  </span>
                </div>
              </div>

              {/* Sonic Stat Radar Bars */}
              <div className="bg-zinc-900/90 rounded-xl p-3.5 border border-zinc-800/80 mb-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 mb-1">
                  <span className="flex items-center gap-1">
                    <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
                    SONIC ATTRIBUTES
                  </span>
                  <span className="text-cyan-400">Score Rating</span>
                </div>

                {/* Vocals */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-zinc-300">
                    <span>Vocals</span>
                    <span className="font-mono font-semibold">{currentMatchup.trackB.stats.vocals}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full transition-all duration-500" style={{ width: `${currentMatchup.trackB.stats.vocals}%` }} />
                  </div>
                </div>

                {/* Beat Drop / Rhythm */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-zinc-300">
                    <span>Beat Drop / Groove</span>
                    <span className="font-mono font-semibold">{currentMatchup.trackB.stats.beatDrop}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full transition-all duration-500" style={{ width: `${currentMatchup.trackB.stats.beatDrop}%` }} />
                  </div>
                </div>

                {/* Hype Energy */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-zinc-300">
                    <span>Hype / Energy</span>
                    <span className="font-mono font-semibold">{currentMatchup.trackB.stats.hype}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full transition-all duration-500" style={{ width: `${currentMatchup.trackB.stats.hype}%` }} />
                  </div>
                </div>
              </div>

              {/* Lyrical Quote snippet */}
              <div className="bg-zinc-900/60 rounded-xl p-3 border border-zinc-800 text-xs italic text-zinc-300 mb-4 flex items-start gap-2">
                <MessageSquareQuote className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p>"{currentMatchup.trackB.lyricsSnippet}"</p>
              </div>

              {/* Fun Fact Toggle */}
              <div className="mb-4">
                <button
                  onClick={() => setExpandedDetails(prev => ({ ...prev, B: !prev.B }))}
                  className="text-xs font-semibold text-zinc-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>{expandedDetails.B ? 'Hide Fun Fact' : 'Show Song Lore'}</span>
                </button>
                {expandedDetails.B && (
                  <p className="text-xs text-zinc-400 bg-zinc-900/90 p-2.5 rounded-lg border border-zinc-800 mt-2">
                    {currentMatchup.trackB.funFact}
                  </p>
                )}
              </div>
            </div>

            {/* VOTE BUTTON B */}
            <div className="pt-2">
              <button
                id="vote-track-b-btn"
                onClick={() => handleCastVote('B')}
                className={`w-full py-3.5 px-4 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all shadow-lg ${
                  userVote === 'B'
                    ? 'bg-emerald-500 text-zinc-950 shadow-emerald-500/25 ring-2 ring-emerald-400'
                    : userVote === 'A'
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-zinc-950 font-black shadow-cyan-500/30 hover:scale-[1.02]'
                }`}
              >
                {userVote === 'B' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>YOUR VOTE ({pctB}%)</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>VOTE FOR {currentMatchup.trackB.title.toUpperCase()}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Live Crowd Reactions Footer */}
        <div className="mt-8 pt-6 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400">Crowd Energy Reactions:</span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(reactionCounts).map(([label, count]) => (
                <button
                  key={label}
                  onClick={() => handleAddReaction(label)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-200 transition-all hover:scale-105 active:scale-95"
                >
                  <span>{label}</span>
                  <span className="text-zinc-400 font-mono text-[10px]">{count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Earn +50 XP & 100 Coins per vote</span>
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
