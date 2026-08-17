export type GameMode = 
  | 'duels' 
  | 'beatlab' 
  | 'aiarena' 
  | 'mastering' 
  | 'crew' 
  | 'beats' 
  | 'trivia' 
  | 'tournament' 
  | 'custom' 
  | 'profile';

export interface TrackStats {
  vocals: number; // 0-100
  beatDrop: number;
  lyrics: number;
  hype: number;
  catchiness: number;
}

export type SynthRiffType = 'rock' | 'pop' | 'hiphop' | 'edm' | 'synthwave' | 'soul' | 'latin' | 'funk';

export interface Track {
  id: string;
  title: string;
  artist: string;
  year: number;
  genre: string;
  coverGradient: string;
  coverImage?: string;
  videoUrl?: string;
  accentColor: string;
  bpm: number;
  key: string;
  stats: TrackStats;
  previewDescription: string;
  lyricsSnippet: string;
  funFact: string;
  synthRiff: SynthRiffType;
  tags: string[];
}

export interface ClashMatchup {
  id: string;
  title: string;
  category: string;
  description: string;
  trackA: Track;
  trackB: Track;
  votesA: number;
  votesB: number;
  userVote?: 'A' | 'B';
}

export type TriviaType = 'guess-song' | 'guess-artist' | 'finish-lyrics' | 'audio-sample' | 'year-match';

export interface TriviaQuestion {
  id: string;
  type: TriviaType;
  category: string;
  prompt: string;
  audioRiff?: SynthRiffType;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface BeatPad {
  id: string;
  name: string;
  keyboardKey: string;
  soundType: 'kick' | 'snare' | 'hihat' | '808' | 'clap' | 'synthLead' | 'synthChord' | 'synthBass' | 'fxLaser' | 'vocalChop' | 'percussion';
  color: string;
  note?: string;
}

export interface SequencerTrack {
  id: string;
  name: string;
  soundType: 'kick' | 'snare' | 'hihat' | '808' | 'clap' | 'synthLead' | 'synthChord' | 'synthBass' | 'vocalChop' | 'percussion' | 'rimshot';
  color: string;
  steps: boolean[]; // 16 steps
  volume: number; // 0-1
  isMuted: boolean;
  isSolo: boolean;
}

export interface MasteringSettings {
  enabled: boolean;
  preset: 'clean' | 'punchy-rap' | 'warm-vinyl' | 'edm-maximizer' | 'crystal-pop' | 'lofi-glow';
  warmth: number; // 0-100
  limiting: number; // 0-100
  stereoWidth: number; // 0-100
  subBassBoost: number; // 0-100
  airClarity: number; // 0-100
  spatialReverb: number; // 0-100
}

export interface BeatProject {
  id: string;
  title: string;
  bpm: number;
  key: string;
  genre: string;
  coverImage?: string;
  videoUrl?: string;
  tracks: SequencerTrack[];
  lyrics: string;
  vocalAudioUrl?: string;
  isVocalMuted?: boolean;
  playbackEnabled: boolean;
  masteringSettings: MasteringSettings;
  createdAt: string;
  updatedAt: string;
}

export interface AIArenaSession {
  id: string;
  topic: string;
  genre: string;
  mood: string;
  tempo: number;
  vocalStyle: string;
  generatedLyrics: string;
  cadenceTip: string;
  humanVoiceAccepted: boolean;
  rewardClaimed: boolean;
  rewardAmount: number; // $299 Music Clash Dollars
  vocalRecordingUrl?: string;
  isRecording?: boolean;
  backingBeatId?: string;
  playbackOn: boolean;
}

export interface CrewMember {
  id: string;
  name: string;
  role: 'Lead Producer' | 'Mastering Engineer' | 'Lyricist' | 'Vocalist' | 'Beatmaker';
  avatarEmoji: string;
  isAi: boolean;
  isOnline: boolean;
}

export interface CrewChatMessage {
  id: string;
  crewId: string;
  senderName: string;
  senderRole: string;
  avatarEmoji: string;
  isAi: boolean;
  message: string;
  timestamp: string;
  attachedBeatName?: string;
  reactions?: string[];
}

export interface Crew {
  id: string;
  name: string;
  tag: string;
  bio: string;
  avatarUrl?: string;
  bannerUrl?: string;
  genreFocus: string;
  members: CrewMember[];
  createdDate: string;
  totalBeatsMade: number;
  crewClashDollars: number;
}

export interface FreeBeat {
  id: string;
  title: string;
  producer: string;
  bpm: number;
  key: string;
  genre: string;
  synthRiff: SynthRiffType;
  coverArt?: string;
  videoUrl?: string;
  isFree: boolean;
  downloads: number;
  likes: number;
  description: string;
  tags: string[];
}

export interface TournamentMatch {
  id: string;
  round: number; // 1 = quarters, 2 = semis, 3 = final
  matchIndex: number;
  trackA?: Track;
  trackB?: Track;
  winner?: Track;
  userVoted?: 'A' | 'B';
  votesA: number;
  votesB: number;
}

export interface UserBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: { current: number; max: number };
}

export interface PlayerStats {
  djName: string;
  djTitle: string;
  avatarSeed: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  clashDollars: number; // In-app Monopoly Value Currency $MCD
  clashesVoted: number;
  correctTriviaAnswers: number;
  triviaHighScore: number;
  tournamentsCompleted: number;
  tournamentsWon: number;
  streakCount: number;
  beatsCreated: number;
  aiCollaborationsAccepted: number;
  activeCrewId?: string;
  matchHistory: {
    id: string;
    date: string;
    type: 'duel' | 'trivia' | 'tournament' | 'ai_arena' | 'beat_master' | 'beat_upload';
    title: string;
    result: string;
    xpGained: number;
    coinsGained: number;
    clashDollarsGained?: number;
  }[];
  badges: UserBadge[];
}
