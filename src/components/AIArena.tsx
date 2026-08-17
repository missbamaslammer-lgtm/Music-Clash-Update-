import React, { useState, useEffect } from 'react';
import { PlayerStats, AIArenaSession, BeatProject } from '../types';
import { soundEngine } from '../services/soundEngine';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  CheckCircle2, 
  DollarSign, 
  Wand2, 
  Flame, 
  Music, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Share2, 
  Check, 
  Sliders, 
  Send,
  Headphones,
  Award
} from 'lucide-react';

interface AIArenaProps {
  playerStats: PlayerStats;
  onUpdateStats: (stats: PlayerStats) => void;
  onOpenBeatInLab?: (lyrics: string, genre: string, bpm: number) => void;
  onShareToCrew?: (message: string, attachedBeat?: string) => void;
}

export const AIArena: React.FC<AIArenaProps> = ({
  playerStats,
  onUpdateStats,
  onOpenBeatInLab,
  onShareToCrew,
}) => {
  // Session Form State
  const [topic, setTopic] = useState('Rising from the underground to rule the Clash Beat Lab arena');
  const [genre, setGenre] = useState('Trap / Hip-Hop');
  const [mood, setMood] = useState('Hype & Confident');
  const [tempo, setTempo] = useState(138);
  const [vocalStyle, setVocalStyle] = useState('Melodic Rap with heavy 808 cadence');
  const [isGenerating, setIsGenerating] = useState(false);

  // Active Session State
  const [session, setSession] = useState<AIArenaSession>({
    id: 'ai-session-1',
    topic: 'Rising from the underground to rule the Clash Beat Lab arena',
    genre: 'Trap / Hip-Hop',
    mood: 'Hype & Confident',
    tempo: 138,
    vocalStyle: 'Melodic Rap with heavy 808 cadence',
    generatedLyrics: `[Intro - Heavy 808 & Purple Neon Glow]\n(Yeah, straight from the clash lab, we don't ever fold)\nListen to the frequency, watch the story unfold...\n\n[Verse 1 - Rapid 16th Cadence]\nStarted in the basement with a broken snare\nNow the whole arena got their hands in the air\nEvery kick hitting heavy like an earthquake shock\nTurning silver into gold around the midnight clock\nThey were looking for a champion, I stepped in the ring\nGot the AI writing fire while the vocals sing!\n\n[Hook / Anthem - Soaring Vocal Melodies]\nStacking up the Clash Dollars, crown on my head\nWe making history while they sleep in bed\nFrom the underground cipher to the global stage\nTurn the volume to the max, yeah we turn the page!`,
    cadenceTip: 'Ride the 16th note triplets in the verse, then drop into half-time melodic falsetto for the hook.',
    humanVoiceAccepted: false,
    rewardClaimed: false,
    rewardAmount: 299,
    playbackOn: true
  });

  // Audio & Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingSession, setIsPlayingSession] = useState(false);
  const [backingBeatPlaying, setBackingBeatPlaying] = useState(false);
  const [showAcceptedModal, setShowAcceptedModal] = useState(false);

  const handleGenerateAiLyrics = async () => {
    setIsGenerating(true);
    soundEngine.playClick();

    try {
      const response = await fetch('/api/generate-lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          genre,
          mood,
          tempo,
          vocalType: vocalStyle
        })
      });

      const data = await response.json();
      if (data && data.lyrics) {
        setSession({
          id: `ai-session-${Date.now()}`,
          topic,
          genre,
          mood,
          tempo,
          vocalStyle,
          generatedLyrics: data.lyrics,
          cadenceTip: data.suggestedCadence || 'Emphasize strong rhymes on beats 2 and 4 with syncopated triplets.',
          humanVoiceAccepted: false,
          rewardClaimed: false,
          rewardAmount: 299,
          playbackOn: true
        });
        soundEngine.playCorrect();
      }
    } catch (err) {
      console.warn('Fallback generating:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleBackingBeat = () => {
    if (backingBeatPlaying) {
      soundEngine.stopPreview();
      setBackingBeatPlaying(false);
    } else {
      soundEngine.playPreviewRiff('hiphop');
      setBackingBeatPlaying(true);
    }
  };

  const handleStartRecording = async () => {
    soundEngine.playClick();
    const success = await soundEngine.startVocalRecording();
    if (success) {
      setIsRecording(true);
    } else {
      // simulated voice take fallback for environments without mic permissions
      setIsRecording(true);
    }
  };

  const handleStopRecording = async () => {
    soundEngine.playClick();
    const url = await soundEngine.stopVocalRecording();
    setIsRecording(false);
    setRecordedAudioUrl(url || 'recorded-vocal-blob-demo');
  };

  // ACCEPT PAIRING & CLAIM $299 MUSIC CLASH DOLLARS
  const handleAcceptCollaboration = () => {
    if (session.rewardClaimed) return;

    soundEngine.playFanfare();
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#c084fc', '#ffffff', '#e2e8f0', '#3b82f6']
    });

    const newClashDollars = playerStats.clashDollars + 299;
    const newXp = playerStats.xp + 100;
    const newCollabs = (playerStats.aiCollaborationsAccepted || 0) + 1;

    const updatedBadges = playerStats.badges.map(b => {
      if (b.id === 'badge-ai-collab') {
        return { ...b, unlocked: true, unlockedAt: 'Just now', progress: { current: 1, max: 1 } };
      }
      return b;
    });

    const updatedStats: PlayerStats = {
      ...playerStats,
      clashDollars: newClashDollars,
      xp: newXp,
      aiCollaborationsAccepted: newCollabs,
      matchHistory: [
        {
          id: `ai-collab-${Date.now()}`,
          date: 'Just now',
          type: 'ai_arena',
          title: `AI Lyricist Co-Write: "${session.topic.slice(0, 24)}..."`,
          result: 'Human Vocalist Accepted (+$299 MCD)',
          xpGained: 100,
          coinsGained: 150,
          clashDollarsGained: 299
        },
        ...playerStats.matchHistory
      ],
      badges: updatedBadges
    };

    onUpdateStats(updatedStats);

    setSession(prev => ({
      ...prev,
      humanVoiceAccepted: true,
      rewardClaimed: true
    }));

    setShowAcceptedModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8 bg-gradient-to-r from-[#1b0a33] via-[#120524] to-[#0a0314] border border-purple-500/30 shadow-2xl shadow-purple-950/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              AI Lyricist Arena & Human Voice Studio
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Inspiring Lyricist Paired with <span className="text-silver-gradient">Human Voice</span>
            </h1>
            <p className="text-sm text-zinc-300 max-w-2xl">
              Pair your human vocal delivery with AI-generated lyrical anthems. Accept the collaboration pairing to receive <strong className="text-purple-300 font-bold">$299 Music Clash Dollars</strong> directly into your in-app studio balance!
            </p>
          </div>

          {/* $299 Reward Callout Box */}
          <div className="flex items-center gap-4 bg-purple-950/50 backdrop-blur-xl border border-purple-400/40 p-4 rounded-xl shadow-lg shadow-purple-900/30">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center text-white shadow-md">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-purple-300 uppercase tracking-wide">Collaboration Payout</div>
              <div className="text-2xl font-black text-white tracking-wider">+$299 <span className="text-xs font-semibold text-purple-300">$MCD</span></div>
              <div className="text-[10px] text-zinc-400">In-App Monopoly Currency</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: AI Lyricist Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-purple-800/40 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-purple-400" />
                AI Lyricist Generator
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 border border-purple-500/30 text-purple-300">
                Gemini Powered
              </span>
            </div>

            {/* Topic Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Song Topic / Story Prompt</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                className="w-full bg-[#0a0414] border border-purple-900/50 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400 transition-colors resize-none"
                placeholder="What is your track about? (e.g. Midnight cipher, victory, neon dreams...)"
              />
            </div>

            {/* Genre & Style */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Genre</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-[#0a0414] border border-purple-900/50 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="Trap / Hip-Hop">Trap / Hip-Hop</option>
                  <option value="Synthwave / Pop">Synthwave / Pop</option>
                  <option value="Drill / Boom Bap">Drill / Boom Bap</option>
                  <option value="R&B / Soul">R&B / Soul</option>
                  <option value="EDM / Festival">EDM / Festival</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Tempo (BPM)</label>
                <input
                  type="number"
                  value={tempo}
                  onChange={(e) => setTempo(parseInt(e.target.value) || 120)}
                  className="w-full bg-[#0a0414] border border-purple-900/50 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                  min={60}
                  max={200}
                />
              </div>
            </div>

            {/* Vocal Delivery Style */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Vocal Cadence Style</label>
              <select
                value={vocalStyle}
                onChange={(e) => setVocalStyle(e.target.value)}
                className="w-full bg-[#0a0414] border border-purple-900/50 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
              >
                <option value="Melodic Rap with heavy 808 cadence">Melodic Rap (Auto-Tune Vibe)</option>
                <option value="Aggressive Fast Triplet Flow">Aggressive Fast Triplet Flow</option>
                <option value="Soaring Pop/R&B Anthem Hook">Soaring Pop/R&B Anthem Hook</option>
                <option value="Smooth Lofi Spoken Word Flow">Smooth Lofi Spoken Word Flow</option>
              </select>
            </div>

            {/* Generate Button */}
            <button
              id="generate-ai-lyrics-btn"
              onClick={handleGenerateAiLyrics}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 border border-purple-400/40 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>AI Lyricist Writing Bars...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>Generate AI Lyricist Flow</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Audio Backing Track Controller */}
          <div className="glass-panel-silver rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-purple-400" />
                Backing Studio Beat
              </span>
              <span className="text-[10px] text-zinc-400">{session.tempo} BPM • F Minor</span>
            </div>

            <button
              id="toggle-backing-beat-btn"
              onClick={handleToggleBackingBeat}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                backingBeatPlaying
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30 animate-pulse'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/15'
              }`}
            >
              {backingBeatPlaying ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Backing Beat</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-purple-400" />
                  <span>Play {genre} Backing Beat</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Column: AI Lyrics, Human Vocal Recorder & Accept Action (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Teleprompter / Lyrics Display */}
          <div className="glass-panel rounded-2xl p-6 border border-purple-800/40 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-900/40 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  AI Lyricist Bars & Hook
                </h2>
                <p className="text-xs text-zinc-400">Tempo: {session.tempo} BPM • Cadence: {session.vocalStyle}</p>
              </div>

              {/* Cadence Tip Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-[11px] text-purple-300">
                <Headphones className="w-3 h-3 text-purple-400" />
                <span>{session.cadenceTip}</span>
              </div>
            </div>

            {/* Lyrics Preformatted Text */}
            <div className="bg-[#090412]/80 border border-purple-900/30 rounded-xl p-5 max-h-[300px] overflow-y-auto space-y-2 font-mono text-xs leading-relaxed text-purple-100/90 whitespace-pre-wrap select-all">
              {session.generatedLyrics}
            </div>

            {/* Human Voice Recording & Audition Bar */}
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-600/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isRecording 
                    ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/50' 
                    : 'bg-purple-900/50 text-purple-300 border border-purple-500/40'
                }`}>
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {isRecording ? 'Recording Human Vocal Take...' : recordedAudioUrl ? 'Human Vocal Take Ready' : 'Human Voice Audition'}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {isRecording ? 'Sing or rap into your mic now!' : 'Record your voice or accept to pair'}
                  </div>
                </div>
              </div>

              {/* Record Controls */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {isRecording ? (
                  <button
                    id="stop-vocal-recording-btn"
                    onClick={handleStopRecording}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-rose-600/30 transition-all"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop Take</span>
                  </button>
                ) : (
                  <button
                    id="start-vocal-recording-btn"
                    onClick={handleStartRecording}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-purple-600/30 transition-all"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{recordedAudioUrl ? 'Re-Record Take' : 'Record Voice'}</span>
                  </button>
                )}
              </div>

            </div>

            {/* Collaboration Acceptance Agreement (The $299 Reward Action) */}
            <div className={`p-5 rounded-2xl border transition-all ${
              session.rewardClaimed
                ? 'bg-emerald-950/30 border-emerald-500/40 shadow-lg shadow-emerald-950/40'
                : 'glass-panel-glow border-purple-400/50'
            }`}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                
                <div className="space-y-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className="text-sm font-extrabold text-white">
                      {session.rewardClaimed ? 'Collaboration Confirmed & Paid' : 'Accept Collaboration with AI Lyricist'}
                    </span>
                    {session.rewardClaimed && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        Paid +$299
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300">
                    {session.rewardClaimed 
                      ? 'You successfully paired human voice with the AI lyricist. $299 MCD added to your account.'
                      : 'Lock in this vocal & lyrical track. You will receive 299 Music Clash Dollars ($MCD) instantly.'
                    }
                  </p>
                </div>

                {/* Main Accept Button */}
                <button
                  id="accept-collaboration-btn"
                  onClick={handleAcceptCollaboration}
                  disabled={session.rewardClaimed}
                  className={`px-6 py-3 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all shadow-xl ${
                    session.rewardClaimed
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-600 hover:from-purple-400 hover:to-fuchsia-500 text-white shadow-purple-600/40 hover:scale-105 active:scale-95 border border-purple-300/40'
                  }`}
                >
                  {session.rewardClaimed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>$299 Claimed & Paired</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-purple-200" />
                      <span>Accept & Receive $299 MCD</span>
                    </>
                  )}
                </button>

              </div>
            </div>

            {/* Downstream Actions: Send to Beat Lab / Send to Crew */}
            {session.rewardClaimed && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {onOpenBeatInLab && (
                  <button
                    onClick={() => onOpenBeatInLab(session.generatedLyrics, session.genre, session.tempo)}
                    className="px-4 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 text-xs font-bold text-purple-200 flex items-center gap-2 transition-all"
                  >
                    <Sliders className="w-3.5 h-3.5 text-purple-400" />
                    <span>Open in Beat Lab Sequencer</span>
                  </button>
                )}

                {onShareToCrew && (
                  <button
                    onClick={() => onShareToCrew(`Yo crew! Just paired up in the AI Arena with a fresh lyrical hook: "${session.topic}" (+$299 MCD won!)`, session.topic)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-zinc-200 flex items-center gap-2 transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Share to Crew Room</span>
                  </button>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Success Modal Toast */}
      {showAcceptedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="glass-panel-glow max-w-md w-full rounded-2xl p-6 text-center space-y-4 border border-purple-400/60 shadow-2xl shadow-purple-600/40">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-amber-400 mx-auto flex items-center justify-center text-white shadow-xl shadow-purple-600/40 animate-bounce">
              <DollarSign className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40">
                Collaboration Accepted!
              </span>
              <h3 className="text-2xl font-black text-white">
                +$299 Music Clash Dollars
              </h3>
              <p className="text-xs text-zinc-300">
                You successfully paired human voice with the AI lyricist. Your monopoly funds are ready to spend in the Studio!
              </p>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-around text-xs">
              <div>
                <div className="text-[10px] text-zinc-400">Total $MCD Balance</div>
                <div className="text-base font-extrabold text-white">{(playerStats?.clashDollars ?? 0).toLocaleString()}</div>
              </div>
              <div className="h-6 w-[1px] bg-purple-800/50" />
              <div>
                <div className="text-[10px] text-zinc-400">XP Earned</div>
                <div className="text-base font-extrabold text-purple-300">+100 XP</div>
              </div>
            </div>

            <button
              onClick={() => setShowAcceptedModal(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-xs font-extrabold shadow-lg shadow-purple-600/30"
            >
              Continue Making Beats
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
