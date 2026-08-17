import React, { useState } from 'react';
import { Crew, CrewChatMessage, CrewMember, PlayerStats } from '../types';
import { soundEngine } from '../services/soundEngine';
import { 
  Users, 
  Plus, 
  Send, 
  Sparkles, 
  Flame, 
  Crown, 
  DollarSign, 
  MessageSquare, 
  Image as ImageIcon, 
  Music, 
  Headphones, 
  Check,
  ShieldCheck,
  Zap,
  Share2
} from 'lucide-react';

interface CrewHubProps {
  playerStats: PlayerStats;
  initialCrew: Crew;
  initialMessages: CrewChatMessage[];
  onUpdateCrew?: (crew: Crew) => void;
}

export const CrewHub: React.FC<CrewHubProps> = ({
  playerStats,
  initialCrew,
  initialMessages,
  onUpdateCrew,
}) => {
  const [crew, setCrew] = useState<Crew>(initialCrew);
  const [messages, setMessages] = useState<CrewChatMessage[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isCreatingCrew, setIsCreatingCrew] = useState(false);

  // New Crew Form State
  const [newCrewName, setNewCrewName] = useState('');
  const [newCrewTag, setNewCrewTag] = useState('');
  const [newCrewBio, setNewCrewBio] = useState('');
  const [newCrewGenre, setNewCrewGenre] = useState('Trap / Dark Drill');
  const [newCrewBanner, setNewCrewBanner] = useState('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    soundEngine.playClick();
    const userText = inputMessage.trim();
    setInputMessage('');

    const newMsg: CrewChatMessage = {
      id: `msg-${Date.now()}`,
      crewId: crew.id,
      senderName: playerStats.djName || 'DJ Sonic Nova (You)',
      senderRole: 'Lead Producer',
      avatarEmoji: '🎧',
      isAi: false,
      message: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: ['🔥']
    };

    setMessages(prev => [...prev, newMsg]);

    // Send to Crew AI endpoint for simulated studio member response
    setIsSending(true);
    try {
      const response = await fetch('/api/crew-ai-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crewName: crew.name,
          memberRole: 'Mastering Engineer',
          memberName: 'Mastering Maestro',
          userMessage: userText,
          projectContext: `Working on beats in ${crew.genreFocus}`
        })
      });

      const data = await response.json();
      if (data && data.reply) {
        setTimeout(() => {
          const aiMsg: CrewChatMessage = {
            id: `msg-${Date.now() + 1}`,
            crewId: crew.id,
            senderName: data.author || 'Mastering Maestro',
            senderRole: data.role || 'Mastering Engineer',
            avatarEmoji: '🎛️',
            isAi: true,
            message: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            reactions: ['⚡']
          };
          setMessages(prev => [...prev, aiMsg]);
          soundEngine.playVoteWhoosh();
          setIsSending(false);
        }, 1200);
      } else {
        setIsSending(false);
      }
    } catch (err) {
      console.warn('Crew AI error:', err);
      setIsSending(false);
    }
  };

  const handleReaction = (msgId: string, emoji: string) => {
    soundEngine.playClick();
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        const reactions = m.reactions || [];
        return {
          ...m,
          reactions: reactions.includes(emoji)
            ? reactions.filter(r => r !== emoji)
            : [...reactions, emoji]
        };
      }
      return m;
    }));
  };

  const handleCreateCrewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrewName.trim()) return;

    soundEngine.playFanfare();
    const created: Crew = {
      id: `crew-${Date.now()}`,
      name: newCrewName,
      tag: newCrewTag || newCrewName.slice(0, 4).toUpperCase(),
      bio: newCrewBio || 'Elite music collective producing hits in Clash Beat Lab.',
      genreFocus: newCrewGenre,
      bannerUrl: newCrewBanner,
      totalBeatsMade: 1,
      crewClashDollars: 1000,
      createdDate: 'Just now',
      members: [
        {
          id: 'm-owner',
          name: playerStats.djName,
          role: 'Lead Producer',
          avatarEmoji: '👑',
          isAi: false,
          isOnline: true
        },
        {
          id: 'm-ai-lyric',
          name: 'AI Ghostwriter',
          role: 'Lyricist',
          avatarEmoji: '⚡',
          isAi: true,
          isOnline: true
        },
        {
          id: 'm-ai-master',
          name: 'Audio Alchemist',
          role: 'Mastering Engineer',
          avatarEmoji: '🎛️',
          isAi: true,
          isOnline: true
        }
      ]
    };

    setCrew(created);
    if (onUpdateCrew) onUpdateCrew(created);
    setIsCreatingCrew(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Crew Banner & Header */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 shadow-2xl bg-[#0e051c]">
        {/* Banner Photo */}
        <div className="h-44 md:h-52 w-full relative overflow-hidden">
          <img 
            src={crew.bannerUrl || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80'} 
            alt={crew.name}
            className="w-full h-full object-cover object-center brightness-75"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e051c] via-[#0e051c]/60 to-transparent" />
        </div>

        {/* Crew Info Overlay */}
        <div className="relative p-6 -mt-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 rounded-2xl bg-purple-950 border-2 border-purple-400/60 p-1 shadow-xl overflow-hidden flex items-center justify-center text-3xl">
              <span>🎧</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{crew.name}</h1>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-black">
                  [{crew.tag}]
                </span>
              </div>
              <p className="text-xs text-zinc-300 max-w-xl">{crew.bio}</p>
              <div className="flex items-center gap-3 text-[11px] text-purple-300 font-semibold pt-1">
                <span>Focus: {crew.genreFocus}</span>
                <span>•</span>
                <span>{crew.members.length} Crew Members</span>
              </div>
            </div>
          </div>

          {/* Create Crew / Switch Crew Button */}
          <div className="flex items-center gap-3">
            <div className="bg-purple-950/60 border border-purple-600/30 px-3 py-2 rounded-xl text-center">
              <div className="text-[10px] text-zinc-400 uppercase font-bold">Crew Vault</div>
              <div className="text-sm font-extrabold text-white">
                {crew.crewClashDollars.toLocaleString()} <span className="text-purple-300 text-[10px]">$MCD</span>
              </div>
            </div>

            <button
              id="create-new-crew-btn"
              onClick={() => {
                soundEngine.playClick();
                setIsCreatingCrew(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all border border-purple-400/40"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Crew</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Chat Room (8 cols) + Crew Roster (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Private Group Chat Room (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-purple-800/40 flex flex-col h-[520px]">
            
            {/* Chat Room Header */}
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  Private Studio Chat Room
                </h2>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">Encrypted Studio Channel</span>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-2">
              {messages.map((msg) => {
                const isUser = !msg.isAi;
                return (
                  <div 
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-sm shadow-md shrink-0">
                      {msg.avatarEmoji}
                    </div>

                    {/* Message Bubble */}
                    <div className={`max-w-[78%] space-y-1 ${isUser ? 'items-end text-right' : 'items-start text-left'}`}>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="font-bold text-zinc-200">{msg.senderName}</span>
                        <span className="px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-800/40 text-[9px]">
                          {msg.senderRole}
                        </span>
                        <span className="text-zinc-500">{msg.timestamp}</span>
                      </div>

                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isUser 
                          ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-tr-none shadow-md shadow-purple-600/20'
                          : 'bg-[#120724] border border-purple-800/40 text-purple-100 rounded-tl-none'
                      }`}>
                        {msg.message}

                        {msg.attachedBeatName && (
                          <div className="mt-2 p-2 rounded-xl bg-black/40 border border-purple-400/30 flex items-center gap-2 text-[11px] text-purple-200">
                            <Music className="w-3.5 h-3.5 text-purple-300" />
                            <span>Attached Stem: <strong>{msg.attachedBeatName}</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Reactions */}
                      <div className="flex items-center gap-1 pt-0.5">
                        {['🔥', '👑', '⚡', '💰'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(msg.id, emoji)}
                            className="px-1.5 py-0.5 rounded-full bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/40 text-[10px] transition-all hover:scale-110"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isSending && (
                <div className="flex items-center gap-2 text-xs text-purple-300 italic pt-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                  <span>Crew producer is typing...</span>
                </div>
              )}
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-purple-900/40 flex items-center gap-2">
              <input
                id="crew-chat-input"
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Share a lyric line, ask for stem feedback, or drop a beat..."
                className="flex-1 bg-[#090412] border border-purple-900/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>

          </div>
        </div>

        {/* Right Column: Crew Members & Studio Status (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-purple-800/40 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                Crew Member Roster
              </h3>
              <span className="text-[10px] text-emerald-400 font-bold">3 Online</span>
            </div>

            <div className="space-y-2.5">
              {crew.members.map((m) => (
                <div 
                  key={m.id}
                  className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/30 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-900/60 border border-purple-500/30 flex items-center justify-center text-base">
                      {m.avatarEmoji}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{m.name}</span>
                        {m.isAi && (
                          <span className="px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold border border-purple-400/30">
                            AI
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400">{m.role}</div>
                    </div>
                  </div>

                  <div className={`w-2 h-2 rounded-full ${m.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                </div>
              ))}
            </div>

            {/* Crew Collab Prompt */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/60 to-fuchsia-950/60 border border-purple-500/30 space-y-2 text-center">
              <Sparkles className="w-5 h-5 text-purple-300 mx-auto" />
              <div className="text-xs font-bold text-white">Live Crew Co-Writing</div>
              <p className="text-[11px] text-zinc-300">
                Drop your beat stems or AI lyrics into the chat room to collaborate with the squad.
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Create Crew Modal */}
      {isCreatingCrew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="glass-panel-glow max-w-lg w-full rounded-2xl p-6 border border-purple-400/50 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Create New Music Producer Crew
              </h3>
              <button 
                onClick={() => setIsCreatingCrew(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCrewSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Crew Name</label>
                <input
                  type="text"
                  required
                  value={newCrewName}
                  onChange={(e) => setNewCrewName(e.target.value)}
                  placeholder="e.g. Midnight 808 Syndicate"
                  className="w-full bg-[#090412] border border-purple-900/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Crew Tag (4 Letters)</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={newCrewTag}
                    onChange={(e) => setNewCrewTag(e.target.value.toUpperCase())}
                    placeholder="808S"
                    className="w-full bg-[#090412] border border-purple-900/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 uppercase font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Genre Specialty</label>
                  <select
                    value={newCrewGenre}
                    onChange={(e) => setNewCrewGenre(e.target.value)}
                    className="w-full bg-[#090412] border border-purple-900/50 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="Trap / Dark Drill">Trap / Dark Drill</option>
                    <option value="Synthwave / EDM">Synthwave / EDM</option>
                    <option value="Lofi / Soulful Hip-Hop">Lofi / Soulful Hip-Hop</option>
                    <option value="Reggaeton / Latin">Reggaeton / Latin</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Crew Bio</label>
                <textarea
                  rows={2}
                  value={newCrewBio}
                  onChange={(e) => setNewCrewBio(e.target.value)}
                  placeholder="Describe your collective's sonic vision..."
                  className="w-full bg-[#090412] border border-purple-900/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingCrew(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-xs font-extrabold shadow-lg shadow-purple-600/30"
                >
                  Launch Crew
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
