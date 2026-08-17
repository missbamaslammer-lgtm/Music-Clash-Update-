import React, { useState } from 'react';
import { PlayerStats, UserBadge } from '../types';
import { soundEngine } from '../services/soundEngine';
import { 
  User, 
  Trophy, 
  Coins, 
  Sparkles, 
  Flame, 
  Award, 
  History, 
  Volume2, 
  Edit3, 
  Check, 
  Zap, 
  Radio, 
  ShieldCheck,
  DollarSign,
  Sliders,
  Users
} from 'lucide-react';

interface ProfileAndLeaderboardProps {
  playerStats: PlayerStats;
  onUpdateDjName: (name: string) => void;
}

const LEADERBOARD_DATA = [
  { rank: 1, name: 'DJ VinylVortex', title: 'Sonic Grandmaster', level: 18, score: 9450, clashDollars: 8500, badges: 8 },
  { rank: 2, name: 'DJ Bassdrop King', title: 'Drop Maestro', level: 15, score: 7820, clashDollars: 6200, badges: 7 },
  { rank: 3, name: 'DJ MelodicMist', title: 'Harmonic Oracle', level: 12, score: 6190, clashDollars: 5100, badges: 6 },
  { rank: 4, name: 'DJ RetroPulse', title: '80s Synth Wizard', level: 9, score: 4520, clashDollars: 3900, badges: 5 },
  { rank: 5, name: 'DJ TrapTitan', title: 'Sub-Bass General', level: 8, score: 3910, clashDollars: 3200, badges: 4 },
];

export const ProfileAndLeaderboard: React.FC<ProfileAndLeaderboardProps> = ({
  playerStats,
  onUpdateDjName,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(playerStats.djName);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      soundEngine.playClick();
      onUpdateDjName(nameInput.trim());
      setIsEditingName(false);
    }
  };

  const xpPercentage = Math.min(100, Math.round((playerStats.xp / playerStats.xpToNextLevel) * 100));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* DJ Hero Profile Card */}
      <div className="glass-panel-glow rounded-3xl border border-purple-500/40 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Glow Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10">
          
          {/* Avatar & DJ Details */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-cyan-400 p-[3px] shadow-xl shadow-purple-600/30">
              <div className="w-full h-full bg-[#0d0718] rounded-[21px] flex items-center justify-center text-4xl">
                🎧
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="bg-[#090412] border border-purple-400 rounded-lg px-2.5 py-1 text-base font-black text-white focus:outline-none"
                    />
                    <button
                      onClick={handleSaveName}
                      className="p-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-500"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                      {playerStats.djName}
                    </h2>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-zinc-500 hover:text-purple-300 transition-colors"
                      title="Edit DJ Handle"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold">
                  {playerStats.djTitle}
                </span>

                {/* Monopoly Currency Badge */}
                <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-400/50 text-white text-xs font-bold flex items-center gap-1 shadow-sm">
                  <span className="text-purple-400 font-extrabold">$MCD</span>
                  <span>{(playerStats?.clashDollars ?? 0).toLocaleString()}</span>
                </span>

                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1">
                  <Coins className="w-3 h-3" />
                  <span>{playerStats?.coins ?? 0} Coins</span>
                </span>
              </div>
            </div>
          </div>

          {/* Level Progress Widget */}
          <div className="w-full md:w-72 bg-[#0d0718]/90 p-4 rounded-2xl border border-purple-800/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-zinc-400">DJ LEVEL PROGRESS</span>
              <span className="text-purple-300 font-mono">LVL {playerStats?.level ?? 1}</span>
            </div>
            <div className="h-2.5 w-full bg-purple-950/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-700 shadow-sm shadow-purple-500/50"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>{playerStats?.xp ?? 0} XP</span>
              <span>{playerStats?.xpToNextLevel ?? 1000} XP (Next Lvl)</span>
            </div>
          </div>

        </div>

        {/* Player Metric Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
          <div className="bg-[#0b0514]/80 p-4 rounded-2xl border border-purple-900/50 text-center">
            <div className="text-[11px] font-bold text-zinc-400 uppercase">Clash Dollars ($MCD)</div>
            <div className="text-2xl font-black text-white mt-1">
              ${(playerStats?.clashDollars ?? 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-[#0b0514]/80 p-4 rounded-2xl border border-purple-900/50 text-center">
            <div className="text-[11px] font-bold text-zinc-400 uppercase">AI Lyricist Pairs</div>
            <div className="text-2xl font-black text-purple-300 mt-1">{playerStats?.aiCollaborationsAccepted || 0}</div>
          </div>
          <div className="bg-[#0b0514]/80 p-4 rounded-2xl border border-purple-900/50 text-center">
            <div className="text-[11px] font-bold text-zinc-400 uppercase">Tournaments Won</div>
            <div className="text-2xl font-black text-fuchsia-400 mt-1">{playerStats?.tournamentsWon ?? 0}</div>
          </div>
          <div className="bg-[#0b0514]/80 p-4 rounded-2xl border border-purple-900/50 text-center">
            <div className="text-[11px] font-bold text-zinc-400 uppercase">Trophies Unlocked</div>
            <div className="text-2xl font-black text-silver-gradient mt-1">
              {(playerStats?.badges || []).filter(b => b.unlocked).length} / {(playerStats?.badges || []).length}
            </div>
          </div>
        </div>

      </div>

      {/* Badges & Trophies Showcase */}
      <div className="glass-panel rounded-3xl border border-purple-800/40 p-6 md:p-8 shadow-2xl space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-extrabold text-white tracking-tight">Sonic Mastery Badges</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(playerStats?.badges || []).map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                badge.unlocked
                  ? 'bg-purple-950/40 border-purple-500/50 shadow-lg shadow-purple-950/50'
                  : 'bg-[#080310]/60 border-purple-950/40 opacity-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                badge.unlocked ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40' : 'bg-zinc-900 text-zinc-600'
              }`}>
                <Trophy className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{badge.title}</span>
                  {badge.unlocked && (
                    <span className="text-[9px] font-extrabold text-purple-300 px-1.5 py-0.2 rounded bg-purple-500/20">
                      UNLOCKED
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Studio Leaderboard */}
      <div className="glass-panel rounded-3xl border border-purple-800/40 p-6 md:p-8 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-extrabold text-white tracking-tight">Studio Producer Leaderboard</h3>
          </div>
          <span className="text-xs font-bold text-purple-300">Global Ranking</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-purple-900/40 text-zinc-400">
                <th className="py-3 px-4 font-bold">Rank</th>
                <th className="py-3 px-4 font-bold">Producer Handle</th>
                <th className="py-3 px-4 font-bold">Level</th>
                <th className="py-3 px-4 font-bold">Total $MCD</th>
                <th className="py-3 px-4 font-bold text-right">Studio Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-950/40">
              {LEADERBOARD_DATA.map((user) => (
                <tr key={user.rank} className="hover:bg-purple-950/20 transition-colors">
                  <td className="py-3 px-4 font-bold">
                    <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black ${
                      user.rank === 1 ? 'bg-amber-400 text-black' : user.rank === 2 ? 'bg-zinc-300 text-black' : user.rank === 3 ? 'bg-amber-700 text-white' : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {user.rank}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    <div>{user.name}</div>
                    <div className="text-[10px] text-zinc-400 font-normal">{user.title}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-purple-300">LVL {user.level}</td>
                  <td className="py-3 px-4 font-bold text-white">${user.clashDollars.toLocaleString()} <span className="text-[10px] text-purple-400 font-normal">$MCD</span></td>
                  <td className="py-3 px-4 font-mono font-bold text-white text-right">{user.score.toLocaleString()} PTS</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
