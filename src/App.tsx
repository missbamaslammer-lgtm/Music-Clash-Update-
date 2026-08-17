import React, { useState, useEffect } from 'react';
import { 
  GameMode, 
  ClashMatchup, 
  PlayerStats, 
  Track, 
  FreeBeat, 
  BeatProject, 
  MasteringSettings,
  Crew,
  CrewChatMessage
} from './types';
import { 
  INITIAL_CLASH_MATCHUPS, 
  TRIVIA_QUESTIONS, 
  DEFAULT_PLAYER_STATS,
  INITIAL_FREE_BEATS,
  INITIAL_CREW,
  INITIAL_CREW_MESSAGES,
  DEFAULT_MASTERING_SETTINGS
} from './data/musicData';
import { Navbar } from './components/Navbar';
import { SongClashArena } from './components/SongClashArena';
import { TriviaBlitz } from './components/TriviaBlitz';
import { BeatmakerArena } from './components/BeatmakerArena';
import { AIArena } from './components/AIArena';
import { MasteringStudio } from './components/MasteringStudio';
import { FreeBeatsVault } from './components/FreeBeatsVault';
import { CrewHub } from './components/CrewHub';
import { TournamentBracket } from './components/TournamentBracket';
import { CustomClashCreator } from './components/CustomClashCreator';
import { ProfileAndLeaderboard } from './components/ProfileAndLeaderboard';
import { MediaUploaderModal } from './components/MediaUploaderModal';
import { soundEngine } from './services/soundEngine';

export function App() {
  const [currentMode, setCurrentMode] = useState<GameMode>('duels');
  
  // Clash Matchups State
  const [matchups, setMatchups] = useState<ClashMatchup[]>(() => {
    const saved = localStorage.getItem('music_clash_matchups');
    return saved ? JSON.parse(saved) : INITIAL_CLASH_MATCHUPS;
  });
  const [activeMatchupIndex, setActiveMatchupIndex] = useState<number>(0);
  const [userVotes, setUserVotes] = useState<Record<string, 'A' | 'B'>>(() => {
    const saved = localStorage.getItem('music_clash_user_votes');
    return saved ? JSON.parse(saved) : {};
  });

  // Player Stats State (Including in-app Monopoly Currency $MCD)
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem('music_clash_player_stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_PLAYER_STATS,
          ...parsed,
          clashDollars: typeof parsed.clashDollars === 'number' ? parsed.clashDollars : DEFAULT_PLAYER_STATS.clashDollars,
          coins: typeof parsed.coins === 'number' ? parsed.coins : DEFAULT_PLAYER_STATS.coins,
          xp: typeof parsed.xp === 'number' ? parsed.xp : DEFAULT_PLAYER_STATS.xp,
          xpToNextLevel: typeof parsed.xpToNextLevel === 'number' ? parsed.xpToNextLevel : DEFAULT_PLAYER_STATS.xpToNextLevel,
          level: typeof parsed.level === 'number' ? parsed.level : DEFAULT_PLAYER_STATS.level,
          aiCollaborationsAccepted: typeof parsed.aiCollaborationsAccepted === 'number' ? parsed.aiCollaborationsAccepted : 0,
          badges: Array.isArray(parsed.badges) && parsed.badges.length > 0 ? parsed.badges : DEFAULT_PLAYER_STATS.badges,
          matchHistory: Array.isArray(parsed.matchHistory) ? parsed.matchHistory : [],
        };
      }
    } catch (e) {
      console.warn('Error restoring player stats from storage:', e);
    }
    return DEFAULT_PLAYER_STATS;
  });

  // Free Beats Vault State
  const [freeBeats, setFreeBeats] = useState<FreeBeat[]>(() => {
    try {
      const saved = localStorage.getItem('music_clash_free_beats');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error restoring free beats from storage:', e);
    }
    return INITIAL_FREE_BEATS;
  });

  // Crew & Chat State
  const [crew, setCrew] = useState<Crew>(() => {
    try {
      const saved = localStorage.getItem('music_clash_crew');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_CREW,
          ...parsed,
          crewClashDollars: typeof parsed.crewClashDollars === 'number' ? parsed.crewClashDollars : INITIAL_CREW.crewClashDollars,
          members: Array.isArray(parsed.members) && parsed.members.length > 0 ? parsed.members : INITIAL_CREW.members,
        };
      }
    } catch (e) {
      console.warn('Error restoring crew from storage:', e);
    }
    return INITIAL_CREW;
  });
  const [crewMessages, setCrewMessages] = useState<CrewChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('music_clash_crew_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error restoring crew messages from storage:', e);
    }
    return INITIAL_CREW_MESSAGES;
  });

  // Mastering Settings State
  const [masteringSettings, setMasteringSettings] = useState<MasteringSettings>(DEFAULT_MASTERING_SETTINGS);

  // Universal Media Uploader Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('music_clash_matchups', JSON.stringify(matchups));
  }, [matchups]);

  useEffect(() => {
    localStorage.setItem('music_clash_user_votes', JSON.stringify(userVotes));
  }, [userVotes]);

  useEffect(() => {
    localStorage.setItem('music_clash_player_stats', JSON.stringify(playerStats));
  }, [playerStats]);

  useEffect(() => {
    localStorage.setItem('music_clash_free_beats', JSON.stringify(freeBeats));
  }, [freeBeats]);

  useEffect(() => {
    localStorage.setItem('music_clash_crew', JSON.stringify(crew));
  }, [crew]);

  // Vote in Song Clash
  const handleVote = (matchupId: string, choice: 'A' | 'B') => {
    setUserVotes(prev => ({ ...prev, [matchupId]: choice }));

    // Increment matchup vote counter
    setMatchups(prev => prev.map(m => {
      if (m.id === matchupId) {
        return {
          ...m,
          votesA: choice === 'A' ? m.votesA + 1 : m.votesA,
          votesB: choice === 'B' ? m.votesB + 1 : m.votesB,
          userVote: choice,
        };
      }
      return m;
    }));

    // Award XP, Coins & Clash Dollars
    setPlayerStats(prev => {
      const newXp = prev.xp + 50;
      const newCoins = prev.coins + 100;
      const newClashDollars = prev.clashDollars + 25;
      const totalClashesVoted = prev.clashesVoted + 1;
      const nextLevel = Math.floor(newXp / 500) + 1;

      const updatedBadges = prev.badges.map(b => {
        if (b.id === 'badge-first-vote') return { ...b, unlocked: true };
        if (b.id === 'badge-tastemaker') {
          const current = totalClashesVoted;
          return {
            ...b,
            progress: { current, max: 10 },
            unlocked: current >= 10
          };
        }
        return b;
      });

      const currentMatch = matchups.find(m => m.id === matchupId);
      const votedSong = choice === 'A' ? currentMatch?.trackA.title : currentMatch?.trackB.title;

      return {
        ...prev,
        xp: newXp,
        coins: newCoins,
        clashDollars: newClashDollars,
        level: nextLevel,
        clashesVoted: totalClashesVoted,
        badges: updatedBadges,
        matchHistory: [
          {
            id: `hist-${Date.now()}`,
            date: 'Just now',
            type: 'duel',
            title: currentMatch?.title || 'Song Clash Duel',
            result: `Voted for ${votedSong}`,
            xpGained: 50,
            coinsGained: 100,
            clashDollarsGained: 25
          },
          ...prev.matchHistory.slice(0, 14)
        ]
      };
    });
  };

  // Complete Trivia Game
  const handleCompleteTrivia = (score: number, correctCount: number) => {
    setPlayerStats(prev => {
      const newXp = prev.xp + score;
      const newCoins = prev.coins + Math.round(score / 4);
      const newClashDollars = prev.clashDollars + Math.round(score / 2);
      const newHighScore = Math.max(prev.triviaHighScore, score);
      const nextLevel = Math.floor(newXp / 500) + 1;

      const updatedBadges = prev.badges.map(b => {
        if (b.id === 'badge-trivia-streak' && correctCount >= 5) {
          return { ...b, unlocked: true, progress: { current: 5, max: 5 } };
        }
        return b;
      });

      return {
        ...prev,
        xp: newXp,
        coins: newCoins,
        clashDollars: newClashDollars,
        level: nextLevel,
        triviaHighScore: newHighScore,
        correctTriviaAnswers: prev.correctTriviaAnswers + correctCount,
        badges: updatedBadges,
        matchHistory: [
          {
            id: `hist-${Date.now()}`,
            date: 'Just now',
            type: 'trivia',
            title: 'Trivia Blitz Round',
            result: `Scored ${score} PTS (${correctCount} correct)`,
            xpGained: score,
            coinsGained: Math.round(score / 4),
            clashDollarsGained: Math.round(score / 2)
          },
          ...prev.matchHistory.slice(0, 14)
        ]
      };
    });
  };

  // Tournament Won
  const handleTournamentWin = (champion: Track) => {
    setPlayerStats(prev => {
      const newXp = prev.xp + 300;
      const newCoins = prev.coins + 500;
      const newClashDollars = prev.clashDollars + 150;
      const nextLevel = Math.floor(newXp / 500) + 1;

      const updatedBadges = prev.badges.map(b => {
        if (b.id === 'badge-tournament-champ') {
          return { ...b, unlocked: true };
        }
        return b;
      });

      return {
        ...prev,
        xp: newXp,
        coins: newCoins,
        clashDollars: newClashDollars,
        level: nextLevel,
        tournamentsCompleted: prev.tournamentsCompleted + 1,
        tournamentsWon: prev.tournamentsWon + 1,
        badges: updatedBadges,
        matchHistory: [
          {
            id: `hist-${Date.now()}`,
            date: 'Just now',
            type: 'tournament',
            title: '8-Track Tournament Cup',
            result: `Champion: ${champion.title}`,
            xpGained: 300,
            coinsGained: 500,
            clashDollarsGained: 150
          },
          ...prev.matchHistory.slice(0, 14)
        ]
      };
    });
  };

  // Create Custom Matchup
  const handleCreateMatchup = (newMatchup: ClashMatchup) => {
    setMatchups(prev => [newMatchup, ...prev]);
    setActiveMatchupIndex(0);
    setCurrentMode('duels');
  };

  // Upload New Beat
  const handleUploadNewBeat = (beat: FreeBeat) => {
    setFreeBeats(prev => [beat, ...prev]);
    setPlayerStats(prev => ({
      ...prev,
      clashDollars: prev.clashDollars + 50,
      xp: prev.xp + 100,
      matchHistory: [
        {
          id: `upload-${Date.now()}`,
          date: 'Just now',
          type: 'beat_upload',
          title: `Uploaded Beat: "${beat.title}"`,
          result: 'Published to Free Beats Vault (+$50 MCD)',
          xpGained: 100,
          coinsGained: 100,
          clashDollarsGained: 50
        },
        ...prev.matchHistory.slice(0, 14)
      ]
    }));
  };

  // Share project / message into Crew Chat
  const handleShareToCrew = (msgText: string, attachedBeat?: string) => {
    const newMsg: CrewChatMessage = {
      id: `msg-${Date.now()}`,
      crewId: crew.id,
      senderName: playerStats.djName,
      senderRole: 'Lead Producer',
      avatarEmoji: '🎧',
      isAi: false,
      message: msgText,
      attachedBeatName: attachedBeat,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: ['🔥', '👑']
    };

    setCrewMessages(prev => [...prev, newMsg]);
    setCurrentMode('crew');
  };

  // Update DJ Name
  const handleUpdateDjName = (name: string) => {
    setPlayerStats(prev => ({ ...prev, djName: name }));
  };

  return (
    <div className="min-h-screen bg-[#05010b] text-purple-100 flex flex-col selection:bg-purple-600 selection:text-white">
      
      {/* Sticky Top Header Navigation with Purple Glow & Playback */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={(mode) => {
          soundEngine.stopPreview();
          setCurrentMode(mode);
        }}
        playerStats={playerStats}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />

      {/* Main Content Arena */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-7">
        
        {/* 1. Song Duels Arena */}
        {currentMode === 'duels' && (
          <SongClashArena
            matchups={matchups}
            activeMatchupIndex={activeMatchupIndex}
            onSelectMatchup={(idx) => setActiveMatchupIndex(idx)}
            onVote={handleVote}
            userVotes={userVotes}
          />
        )}

        {/* 2. Beatmaker Lab */}
        {currentMode === 'beatlab' && (
          <BeatmakerArena
            playerStats={playerStats}
            onUpdateStats={setPlayerStats}
            onOpenMastering={(settings) => {
              setMasteringSettings(settings);
              setCurrentMode('mastering');
            }}
            onOpenAiArena={(lyrics, genre, bpm) => {
              setCurrentMode('aiarena');
            }}
          />
        )}

        {/* 3. AI Lyricist Arena ($299 Reward Pairing) */}
        {currentMode === 'aiarena' && (
          <AIArena
            playerStats={playerStats}
            onUpdateStats={setPlayerStats}
            onOpenBeatInLab={(lyrics, genre, bpm) => {
              setCurrentMode('beatlab');
            }}
            onShareToCrew={handleShareToCrew}
          />
        )}

        {/* 4. Mastering Studio Suite */}
        {currentMode === 'mastering' && (
          <MasteringStudio
            initialSettings={masteringSettings}
            onSaveSettings={(s) => setMasteringSettings(s)}
            freeBeats={freeBeats}
            playerStats={playerStats}
            onUpdateStats={setPlayerStats}
          />
        )}

        {/* 5. Free Beats Community Vault */}
        {currentMode === 'beats' && (
          <FreeBeatsVault
            playerStats={playerStats}
            freeBeats={freeBeats}
            onUploadBeatModal={() => setIsUploadModalOpen(true)}
            onLoadInBeatLab={(beat) => {
              setCurrentMode('beatlab');
            }}
            onCoWriteInAiArena={(beat) => {
              setCurrentMode('aiarena');
            }}
          />
        )}

        {/* 6. Studio Crew & Private Chat Room */}
        {currentMode === 'crew' && (
          <CrewHub
            playerStats={playerStats}
            initialCrew={crew}
            initialMessages={crewMessages}
            onUpdateCrew={setCrew}
          />
        )}

        {/* 7. Tournament Bracket Cup */}
        {currentMode === 'tournament' && (
          <TournamentBracket
            onTournamentWin={handleTournamentWin}
          />
        )}

        {/* 8. Trivia Blitz */}
        {currentMode === 'trivia' && (
          <TriviaBlitz
            questions={TRIVIA_QUESTIONS}
            onCompleteGame={handleCompleteTrivia}
          />
        )}

        {/* 9. Create Custom Clash */}
        {currentMode === 'custom' && (
          <CustomClashCreator
            onCreateMatchup={handleCreateMatchup}
          />
        )}

        {/* 10. DJ Profile & Leaderboard */}
        {currentMode === 'profile' && (
          <ProfileAndLeaderboard
            playerStats={playerStats}
            onUpdateDjName={handleUpdateDjName}
          />
        )}

      </main>

      {/* Media Uploader Modal (Videos, Photos, Beats) */}
      <MediaUploaderModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadBeat={handleUploadNewBeat}
      />

      {/* Footer */}
      <footer className="border-t border-purple-900/40 bg-[#070210]/90 backdrop-blur-md py-6 px-4 text-center text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold bg-gradient-to-r from-purple-400 via-fuchsia-300 to-white bg-clip-text text-transparent">
              CLASH BEAT LAB PRO
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-purple-300">AI Lyricist Arena • Audio Mastering • Beat Sequencer</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <span>In-App Currency: <strong>$MCD</strong> (Music Clash Dollars)</span>
            <span>•</span>
            <span>Web Audio Studio Engine</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
