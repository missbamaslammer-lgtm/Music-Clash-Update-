import React, { useState } from 'react';
import { Track, TournamentMatch } from '../types';
import { TRACK_CATALOG } from '../data/musicData';
import { soundEngine } from '../services/soundEngine';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Play, 
  Square, 
  Crown, 
  RotateCcw, 
  Swords, 
  CheckCircle2, 
  Sparkles,
  Flame
} from 'lucide-react';

interface TournamentBracketProps {
  onTournamentWin: (champion: Track) => void;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  onTournamentWin,
}) => {
  // 8 tracks seeded for Quarterfinals
  const [seeds, setSeeds] = useState<Track[]>(() => TRACK_CATALOG.slice(0, 8));
  
  // Quarterfinals (4 matches)
  const [qfWinners, setQfWinners] = useState<(Track | null)[]>([null, null, null, null]);
  // Semifinals (2 matches)
  const [sfWinners, setSfWinners] = useState<(Track | null)[]>([null, null]);
  // Final champion
  const [champion, setChampion] = useState<Track | null>(null);

  const [activePlayingTrackId, setActivePlayingTrackId] = useState<string | null>(null);

  const handleToggleAudio = (track: Track) => {
    if (activePlayingTrackId === track.id) {
      soundEngine.stopPreview();
      setActivePlayingTrackId(null);
    } else {
      soundEngine.playPreviewRiff(track.synthRiff);
      setActivePlayingTrackId(track.id);
    }
  };

  // Vote Quarterfinal Match (matchIdx 0..3)
  const handleVoteQF = (matchIdx: number, winnerTrack: Track) => {
    soundEngine.playVoteWhoosh();
    setQfWinners(prev => {
      const next = [...prev];
      next[matchIdx] = winnerTrack;
      return next;
    });

    // If winning track changes, invalidate subsequent rounds
    const sfIdx = Math.floor(matchIdx / 2);
    setSfWinners(prev => {
      const next = [...prev];
      next[sfIdx] = null;
      return next;
    });
    setChampion(null);
  };

  // Vote Semifinal Match (sfIdx 0..1)
  const handleVoteSF = (sfIdx: number, winnerTrack: Track) => {
    soundEngine.playVoteWhoosh();
    setSfWinners(prev => {
      const next = [...prev];
      next[sfIdx] = winnerTrack;
      return next;
    });
    setChampion(null);
  };

  // Vote Final Match
  const handleVoteFinal = (winnerTrack: Track) => {
    soundEngine.playFanfare();
    setChampion(winnerTrack);
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981']
    });
    onTournamentWin(winnerTrack);
  };

  const handleResetTournament = () => {
    soundEngine.playClick();
    soundEngine.stopPreview();
    setActivePlayingTrackId(null);
    // Shuffle 8 tracks for a fresh tournament
    const shuffled = [...TRACK_CATALOG].sort(() => 0.5 - Math.random()).slice(0, 8);
    setSeeds(shuffled);
    setQfWinners([null, null, null, null]);
    setSfWinners([null, null]);
    setChampion(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">8-Track Championship Cup</h2>
            <p className="text-xs text-zinc-400">Vote through Quarterfinals, Semis & Crown the Ultimate Anthem</p>
          </div>
        </div>

        <button
          id="reset-tournament-btn"
          onClick={handleResetTournament}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-zinc-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Bracket Seeds</span>
        </button>
      </div>

      {/* Champion Podium (if crowned) */}
      {champion && (
        <div className="bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-600/20 rounded-3xl border-2 border-amber-500/60 p-6 md:p-8 shadow-2xl text-center space-y-4 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>TOURNAMENT CHAMPION CROWNED</span>
          </div>

          <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            {champion.title}
          </h3>
          <p className="text-base font-semibold text-zinc-300">
            by <span className="text-white font-bold">{champion.artist}</span> ({champion.genre})
          </p>

          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={() => handleToggleAudio(champion)}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all"
            >
              {activePlayingTrackId === champion.id ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Victory Riff</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Champion Riff</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Interactive Bracket Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        
        {/* QUARTERFINALS (4 MATCHES) */}
        <div className="space-y-4">
          <div className="text-xs font-black text-rose-400 uppercase tracking-widest text-center lg:text-left">
            QUARTERFINALS (ROUND 1)
          </div>

          {[0, 1, 2, 3].map((matchIdx) => {
            const trackA = seeds[matchIdx * 2];
            const trackB = seeds[matchIdx * 2 + 1];
            const winner = qfWinners[matchIdx];

            return (
              <div key={matchIdx} className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-3.5 space-y-2 shadow-md">
                <div className="text-[10px] font-mono font-bold text-zinc-500 flex justify-between">
                  <span>MATCH #{matchIdx + 1}</span>
                  {winner && <span className="text-emerald-400">✓ Advanced</span>}
                </div>

                {/* Track A button */}
                <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                  winner?.id === trackA.id
                    ? 'bg-rose-500/20 border-rose-500 text-white font-bold'
                    : 'bg-zinc-950 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                }`}>
                  <button
                    onClick={() => handleVoteQF(matchIdx, trackA)}
                    className="text-left flex-1 truncate text-xs focus:outline-none"
                  >
                    <div className="font-extrabold truncate">{trackA.title}</div>
                    <div className="text-[10px] text-zinc-400 truncate">{trackA.artist}</div>
                  </button>
                  <button
                    onClick={() => handleToggleAudio(trackA)}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                    title="Audio Preview"
                  >
                    {activePlayingTrackId === trackA.id ? <Square className="w-3 h-3 text-rose-400 fill-current" /> : <Play className="w-3 h-3" />}
                  </button>
                </div>

                {/* Track B button */}
                <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                  winner?.id === trackB.id
                    ? 'bg-rose-500/20 border-rose-500 text-white font-bold'
                    : 'bg-zinc-950 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                }`}>
                  <button
                    onClick={() => handleVoteQF(matchIdx, trackB)}
                    className="text-left flex-1 truncate text-xs focus:outline-none"
                  >
                    <div className="font-extrabold truncate">{trackB.title}</div>
                    <div className="text-[10px] text-zinc-400 truncate">{trackB.artist}</div>
                  </button>
                  <button
                    onClick={() => handleToggleAudio(trackB)}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                    title="Audio Preview"
                  >
                    {activePlayingTrackId === trackB.id ? <Square className="w-3 h-3 text-rose-400 fill-current" /> : <Play className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* SEMIFINALS (2 MATCHES) */}
        <div className="space-y-6">
          <div className="text-xs font-black text-purple-400 uppercase tracking-widest text-center">
            SEMIFINALS (ROUND 2)
          </div>

          {[0, 1].map((sfIdx) => {
            const trackA = qfWinners[sfIdx * 2];
            const trackB = qfWinners[sfIdx * 2 + 1];
            const winner = sfWinners[sfIdx];

            return (
              <div key={sfIdx} className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-4 space-y-2.5 shadow-lg">
                <div className="text-[10px] font-mono font-bold text-zinc-500 flex justify-between">
                  <span>SEMIFINAL #{sfIdx + 1}</span>
                  {winner && <span className="text-emerald-400">✓ Advanced</span>}
                </div>

                {trackA ? (
                  <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                    winner?.id === trackA.id
                      ? 'bg-purple-500/20 border-purple-500 text-white font-bold'
                      : 'bg-zinc-950 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                  }`}>
                    <button
                      onClick={() => handleVoteSF(sfIdx, trackA)}
                      className="text-left flex-1 truncate text-xs focus:outline-none"
                    >
                      <div className="font-extrabold truncate">{trackA.title}</div>
                      <div className="text-[10px] text-zinc-400 truncate">{trackA.artist}</div>
                    </button>
                    <button
                      onClick={() => handleToggleAudio(trackA)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                    >
                      {activePlayingTrackId === trackA.id ? <Square className="w-3 h-3 text-purple-400 fill-current" /> : <Play className="w-3 h-3" />}
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-dashed border-zinc-800 text-center text-xs text-zinc-600">
                    Awaiting Quarterfinal Winner
                  </div>
                )}

                {trackB ? (
                  <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                    winner?.id === trackB.id
                      ? 'bg-purple-500/20 border-purple-500 text-white font-bold'
                      : 'bg-zinc-950 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                  }`}>
                    <button
                      onClick={() => handleVoteSF(sfIdx, trackB)}
                      className="text-left flex-1 truncate text-xs focus:outline-none"
                    >
                      <div className="font-extrabold truncate">{trackB.title}</div>
                      <div className="text-[10px] text-zinc-400 truncate">{trackB.artist}</div>
                    </button>
                    <button
                      onClick={() => handleToggleAudio(trackB)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                    >
                      {activePlayingTrackId === trackB.id ? <Square className="w-3 h-3 text-purple-400 fill-current" /> : <Play className="w-3 h-3" />}
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-dashed border-zinc-800 text-center text-xs text-zinc-600">
                    Awaiting Quarterfinal Winner
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* GRAND FINAL (1 MATCH) */}
        <div className="space-y-4">
          <div className="text-xs font-black text-amber-400 uppercase tracking-widest text-center lg:text-right">
            CHAMPIONSHIP FINAL
          </div>

          <div className="bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 rounded-3xl border-2 border-amber-500/40 p-5 space-y-4 shadow-2xl">
            <div className="text-center">
              <Crown className="w-6 h-6 text-amber-400 mx-auto mb-1" />
              <h4 className="text-sm font-black text-white">THE GRAND FINAL DUEL</h4>
              <p className="text-[11px] text-zinc-400">Click to crown the ultimate anthem</p>
            </div>

            {sfWinners[0] ? (
              <button
                id="final-track-a-btn"
                onClick={() => handleVoteFinal(sfWinners[0]!)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                  champion?.id === sfWinners[0]!.id
                    ? 'bg-amber-500 text-zinc-950 font-black border-amber-400 shadow-lg shadow-amber-500/30'
                    : 'bg-zinc-950 hover:bg-zinc-800 border-zinc-800 text-zinc-200 hover:border-amber-500/50'
                }`}
              >
                <div className="font-extrabold text-sm truncate">{sfWinners[0]!.title}</div>
                <div className={`text-xs ${champion?.id === sfWinners[0]!.id ? 'text-zinc-900 font-bold' : 'text-zinc-400'}`}>
                  {sfWinners[0]!.artist}
                </div>
              </button>
            ) : (
              <div className="p-4 rounded-2xl border border-dashed border-zinc-800 text-center text-xs text-zinc-600">
                Awaiting Finalist 1
              </div>
            )}

            <div className="text-center font-black text-xs text-zinc-500">VS</div>

            {sfWinners[1] ? (
              <button
                id="final-track-b-btn"
                onClick={() => handleVoteFinal(sfWinners[1]!)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                  champion?.id === sfWinners[1]!.id
                    ? 'bg-amber-500 text-zinc-950 font-black border-amber-400 shadow-lg shadow-amber-500/30'
                    : 'bg-zinc-950 hover:bg-zinc-800 border-zinc-800 text-zinc-200 hover:border-amber-500/50'
                }`}
              >
                <div className="font-extrabold text-sm truncate">{sfWinners[1]!.title}</div>
                <div className={`text-xs ${champion?.id === sfWinners[1]!.id ? 'text-zinc-900 font-bold' : 'text-zinc-400'}`}>
                  {sfWinners[1]!.artist}
                </div>
              </button>
            ) : (
              <div className="p-4 rounded-2xl border border-dashed border-zinc-800 text-center text-xs text-zinc-600">
                Awaiting Finalist 2
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
