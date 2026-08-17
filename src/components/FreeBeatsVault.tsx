import React, { useState } from 'react';
import { FreeBeat, PlayerStats } from '../types';
import { soundEngine } from '../services/soundEngine';
import { 
  Music2, 
  Play, 
  Square, 
  Download, 
  Heart, 
  Upload, 
  Filter, 
  Sparkles, 
  Video, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Flame, 
  Check,
  Search,
  ExternalLink,
  Power
} from 'lucide-react';

interface FreeBeatsVaultProps {
  playerStats: PlayerStats;
  freeBeats: FreeBeat[];
  onUploadBeatModal: () => void;
  onLoadInBeatLab?: (beat: FreeBeat) => void;
  onCoWriteInAiArena?: (beat: FreeBeat) => void;
}

export const FreeBeatsVault: React.FC<FreeBeatsVaultProps> = ({
  playerStats,
  freeBeats,
  onUploadBeatModal,
  onLoadInBeatLab,
  onCoWriteInAiArena,
}) => {
  const [beatsList, setBeatsList] = useState<FreeBeat[]>(freeBeats);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingBeatId, setPlayingBeatId] = useState<string | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [likedBeats, setLikedBeats] = useState<Record<string, boolean>>({});

  const handleTogglePlay = (beat: FreeBeat) => {
    if (playingBeatId === beat.id) {
      soundEngine.stopPreview();
      setPlayingBeatId(null);
    } else {
      soundEngine.playPreviewRiff(beat.synthRiff);
      setPlayingBeatId(beat.id);
    }
  };

  const handleToggleLike = (beatId: string) => {
    soundEngine.playClick();
    const isLiked = !!likedBeats[beatId];
    setLikedBeats(prev => ({ ...prev, [beatId]: !isLiked }));
    setBeatsList(prev => prev.map(b => {
      if (b.id === beatId) {
        return { ...b, likes: isLiked ? b.likes - 1 : b.likes + 1 };
      }
      return b;
    }));
  };

  const handleDownload = (beat: FreeBeat) => {
    soundEngine.playCorrect();
    setBeatsList(prev => prev.map(b => {
      if (b.id === beat.id) {
        return { ...b, downloads: b.downloads + 1 };
      }
      return b;
    }));
  };

  const filteredBeats = beatsList.filter(beat => {
    const matchesGenre = selectedGenre === 'all' || beat.genre.toLowerCase().includes(selectedGenre.toLowerCase());
    const matchesSearch = beat.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          beat.producer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          beat.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGenre && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8 bg-gradient-to-r from-[#190730] via-[#100320] to-[#080210] border border-purple-500/30 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-extrabold uppercase tracking-wider">
              <Music2 className="w-3.5 h-3.5" />
              Community Beat Vault & Free Stems
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Upload & Download <span className="text-silver-gradient">Royalty-Free Beats</span>
            </h1>
            <p className="text-sm text-zinc-300 max-w-2xl">
              Explore community stems, upload your own beats and video snippets, and instantly open any track in the Beat Lab or AI Lyricist Arena.
            </p>
          </div>

          {/* Upload Beat Button */}
          <button
            id="upload-beat-cta-btn"
            onClick={onUploadBeatModal}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-xs flex items-center gap-2 shadow-xl shadow-purple-600/30 border border-purple-300/40 transition-all hover:scale-105"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Beat / Video</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel-silver rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search beats, producers, tags..."
            className="w-full bg-[#0a0414] border border-purple-900/50 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
          />
        </div>

        {/* Genre Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Beats' },
            { id: 'trap', label: 'Trap & Drill' },
            { id: 'synthwave', label: 'Synthwave' },
            { id: 'lofi', label: 'Lofi & Soul' },
            { id: 'latin', label: 'Reggaeton / Latin' },
          ].map((genre) => (
            <button
              key={genre.id}
              onClick={() => setSelectedGenre(genre.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedGenre === genre.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/40'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10'
              }`}
            >
              {genre.label}
            </button>
          ))}
        </div>

      </div>

      {/* Beats Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredBeats.map((beat) => {
          const isPlaying = playingBeatId === beat.id;
          const isLiked = !!likedBeats[beat.id];

          return (
            <div 
              key={beat.id}
              className="glass-panel rounded-2xl p-5 border border-purple-800/40 hover:border-purple-500/50 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                
                {/* Beat Cover & Header Info */}
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden relative shrink-0 border border-purple-600/30 group-hover:scale-105 transition-transform">
                    <img 
                      src={beat.coverArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'} 
                      alt={beat.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={() => handleTogglePlay(beat)}
                      className={`absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-xs transition-opacity ${
                        isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {isPlaying ? (
                        <Square className="w-6 h-6 text-purple-300 fill-current" />
                      ) : (
                        <Play className="w-6 h-6 text-white fill-current" />
                      )}
                    </button>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {beat.isFree ? 'FREE FOR PROFIT' : 'EXCLUSIVE'}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <button
                          onClick={() => handleToggleLike(beat.id)}
                          className={`p-1 rounded-lg hover:bg-white/10 transition-colors ${
                            isLiked ? 'text-rose-400' : 'text-zinc-400'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                        </button>
                        <span>{beat.likes}</span>
                      </div>
                    </div>

                    <h3 className="text-base font-extrabold text-white group-hover:text-purple-300 transition-colors">
                      {beat.title}
                    </h3>
                    <p className="text-xs text-zinc-400">Prod. {beat.producer}</p>
                    <div className="flex items-center gap-2 text-[11px] text-purple-300 font-mono">
                      <span>{beat.bpm} BPM</span>
                      <span>•</span>
                      <span>Key: {beat.key}</span>
                      <span>•</span>
                      <span>{beat.genre}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {beat.description}
                </p>

                {/* Video Snippet Player (if available) */}
                {beat.videoUrl && (
                  <div className="rounded-xl overflow-hidden border border-purple-900/40 bg-black/60 relative">
                    <video 
                      src={beat.videoUrl}
                      controls={false}
                      autoPlay={isPlaying}
                      loop
                      muted
                      className="w-full h-28 object-cover opacity-80"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[9px] text-purple-300 font-bold border border-purple-500/30 flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      <span>Studio Video Teaser</span>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {beat.tags.map((tag, i) => (
                    <span 
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[#0a0414] text-zinc-400 border border-purple-950/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-purple-900/40 flex flex-wrap items-center justify-between gap-2">
                
                {/* Play / Stop Button */}
                <button
                  id={`play-beat-${beat.id}`}
                  onClick={() => handleTogglePlay(beat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                    isPlaying
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30 animate-pulse'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-200 border-white/15'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop Beat</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current text-purple-400" />
                      <span>Playback Stem</span>
                    </>
                  )}
                </button>

                {/* Integration Actions: Beat Lab / AI Arena / Download */}
                <div className="flex items-center gap-1.5">
                  {onLoadInBeatLab && (
                    <button
                      onClick={() => onLoadInBeatLab(beat)}
                      className="p-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-600/30 text-purple-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1"
                      title="Load pattern into 16-step Beat Lab"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Sequencer</span>
                    </button>
                  )}

                  {onCoWriteInAiArena && (
                    <button
                      onClick={() => onCoWriteInAiArena(beat)}
                      className="p-2 rounded-xl bg-gradient-to-r from-purple-600/30 to-fuchsia-600/30 hover:from-purple-600/50 hover:to-fuchsia-600/50 border border-purple-400/40 text-purple-200 text-xs font-bold flex items-center gap-1"
                      title="Pair beat with AI Lyricist in AI Arena"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                      <span className="hidden sm:inline">AI Arena</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDownload(beat)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-zinc-300 hover:text-white transition-all"
                    title="Download Free Stems"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
