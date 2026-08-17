import React, { useState } from 'react';
import { ClashMatchup, Track } from '../types';
import { TRACK_CATALOG } from '../data/musicData';
import { soundEngine } from '../services/soundEngine';
import confetti from 'canvas-confetti';
import { 
  PlusCircle, 
  Sparkles, 
  Swords, 
  Sliders, 
  Disc, 
  Check, 
  Share2,
  Copy
} from 'lucide-react';

interface CustomClashCreatorProps {
  onCreateMatchup: (newMatchup: ClashMatchup) => void;
}

export const CustomClashCreator: React.FC<CustomClashCreatorProps> = ({
  onCreateMatchup,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Epic Showdown');
  const [description, setDescription] = useState('');
  
  const [selectedTrackAId, setSelectedTrackAId] = useState(TRACK_CATALOG[0].id);
  const [selectedTrackBId, setSelectedTrackBId] = useState(TRACK_CATALOG[2].id);

  const [copiedLink, setCopiedLink] = useState(false);
  const [createdSuccess, setCreatedSuccess] = useState(false);

  const trackA = TRACK_CATALOG.find(t => t.id === selectedTrackAId) || TRACK_CATALOG[0];
  const trackB = TRACK_CATALOG.find(t => t.id === selectedTrackBId) || TRACK_CATALOG[2];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    soundEngine.playFanfare();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });

    const newMatchup: ClashMatchup = {
      id: `custom-clash-${Date.now()}`,
      title: title.trim(),
      category: category.trim() || 'Custom Showdown',
      description: description.trim() || `The ultimate face-off between ${trackA.title} and ${trackB.title}!`,
      trackA,
      trackB,
      votesA: 0,
      votesB: 0,
    };

    onCreateMatchup(newMatchup);
    setCreatedSuccess(true);
    setTimeout(() => setCreatedSuccess(false), 4000);
  };

  const handleCopyLink = () => {
    soundEngine.playClick();
    navigator.clipboard.writeText(`https://musicclash.app/clash?title=${encodeURIComponent(title || 'Epic Clash')}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="glass-panel-glow rounded-2xl border border-purple-500/40 p-5 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-cyan-400 p-[2px] flex items-center justify-center shadow-lg shadow-purple-600/30">
            <div className="w-full h-full bg-[#0d061a] rounded-[10px] flex items-center justify-center text-purple-300">
              <PlusCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Custom Clash Arena Creator</h2>
            <p className="text-xs text-purple-200">Pair any two legendary tracks and challenge the community in the Stadium</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleCreate} className="glass-panel rounded-3xl border border-purple-800/40 p-6 md:p-8 shadow-2xl space-y-6">
        
        {/* Battle Title & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">CLASH BATTLE TITLE</label>
            <input
              type="text"
              required
              placeholder="e.g. 2000s Pop Titan Showdown"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#090412] border border-purple-900/60 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-400 font-semibold transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">GENRE / CATEGORY</label>
            <input
              type="text"
              placeholder="e.g. Modern Trap vs Golden Era"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#090412] border border-purple-900/60 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-400 font-semibold transition-colors"
            />
          </div>
        </div>

        {/* Battle Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-300">BATTLE LORE / PROMPT</label>
          <textarea
            rows={2}
            placeholder="Which song has the dirtier bassline and greater stadium hype?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#090412] border border-purple-900/60 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-400 resize-none font-medium transition-colors"
          />
        </div>

        {/* Pick Track A vs Track B */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          
          {/* TRACK A SELECT */}
          <div className="bg-[#0b0517] p-4 rounded-2xl border border-purple-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-rose-400">CORNER A CONTENDER</span>
              <Disc className="w-4 h-4 text-rose-400" />
            </div>

            <select
              value={selectedTrackAId}
              onChange={(e) => setSelectedTrackAId(e.target.value)}
              className="w-full bg-[#120724] text-zinc-100 text-xs font-bold rounded-xl p-3 border border-purple-800/60 focus:outline-none focus:border-rose-400"
            >
              {TRACK_CATALOG.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} — {t.artist} ({t.year})
                </option>
              ))}
            </select>

            <div className="p-3 bg-[#080210] rounded-xl border border-purple-950 text-xs space-y-1">
              <div className="font-extrabold text-white">{trackA.title}</div>
              <div className="text-zinc-400">{trackA.artist} • {trackA.genre}</div>
              <div className="text-[10px] text-purple-300">{trackA.bpm} BPM • Key: {trackA.key}</div>
            </div>
          </div>

          {/* TRACK B SELECT */}
          <div className="bg-[#0b0517] p-4 rounded-2xl border border-purple-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-cyan-400">CORNER B CONTENDER</span>
              <Disc className="w-4 h-4 text-cyan-400" />
            </div>

            <select
              value={selectedTrackBId}
              onChange={(e) => setSelectedTrackBId(e.target.value)}
              className="w-full bg-[#120724] text-zinc-100 text-xs font-bold rounded-xl p-3 border border-purple-800/60 focus:outline-none focus:border-cyan-400"
            >
              {TRACK_CATALOG.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} — {t.artist} ({t.year})
                </option>
              ))}
            </select>

            <div className="p-3 bg-[#080210] rounded-xl border border-purple-950 text-xs space-y-1">
              <div className="font-extrabold text-white">{trackB.title}</div>
              <div className="text-zinc-400">{trackB.artist} • {trackB.genre}</div>
              <div className="text-[10px] text-cyan-300">{trackB.bpm} BPM • Key: {trackB.key}</div>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-purple-900/40">
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-700/40 text-xs font-bold text-purple-200 flex items-center justify-center gap-2 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Battle Share Code'}</span>
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02]"
          >
            <Swords className="w-4 h-4" />
            <span>LAUNCH CLASH DUEL</span>
          </button>
        </div>

        {createdSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
            ✓ Custom Clash Matchup created and added to active Duel Stadium!
          </div>
        )}

      </form>
    </div>
  );
};
