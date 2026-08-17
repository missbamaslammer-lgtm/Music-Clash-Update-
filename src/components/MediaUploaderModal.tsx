import React, { useState } from 'react';
import { FreeBeat, BeatProject } from '../types';
import { soundEngine } from '../services/soundEngine';
import { 
  Upload, 
  Music, 
  Video, 
  Image as ImageIcon, 
  Check, 
  Sparkles, 
  X, 
  FileAudio, 
  Film, 
  DollarSign
} from 'lucide-react';

interface MediaUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadBeat: (beat: FreeBeat) => void;
  onUploadMedia?: (mediaType: 'photo' | 'video' | 'audio', url: string, name: string) => void;
}

export const MediaUploaderModal: React.FC<MediaUploaderModalProps> = ({
  isOpen,
  onClose,
  onUploadBeat,
  onUploadMedia,
}) => {
  const [tab, setTab] = useState<'beat' | 'video' | 'photo'>('beat');
  const [title, setTitle] = useState('');
  const [producer, setProducer] = useState('DJ Sonic Nova');
  const [genre, setGenre] = useState('Trap / Dark 808');
  const [bpm, setBpm] = useState(140);
  const [keySignature, setKeySignature] = useState('F Minor');
  const [isFree, setIsFree] = useState(true);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('808, Trap, Free Beats, Studio Stems');
  const [mediaUrl, setMediaUrl] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const fakeUrl = URL.createObjectURL(file);
      setMediaUrl(fakeUrl);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playFanfare();

    if (tab === 'beat') {
      const newBeat: FreeBeat = {
        id: `beat-upload-${Date.now()}`,
        title: title || 'Untitled Studio Beat',
        producer: producer || 'DJ Producer',
        bpm: bpm || 130,
        key: keySignature || 'C Minor',
        genre: genre || 'Hip-Hop',
        synthRiff: 'hiphop',
        coverArt: mediaUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        videoUrl: undefined,
        isFree,
        downloads: 0,
        likes: 1,
        description: description || 'High-energy studio beat produced in Clash Beat Lab.',
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      onUploadBeat(newBeat);
    } else {
      if (onUploadMedia) {
        onUploadMedia(tab, mediaUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', title || fileName || 'Uploaded Media');
      }
    }

    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel-glow max-w-xl w-full rounded-2xl p-6 border border-purple-400/50 shadow-2xl space-y-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-purple-300">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Studio Media Uploader</h2>
              <p className="text-[11px] text-zinc-400">Upload custom beats, video snippets, or artwork photos</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Type Selector */}
        <div className="grid grid-cols-3 gap-2 bg-[#090412] p-1.5 rounded-xl border border-purple-900/40">
          <button
            type="button"
            onClick={() => setTab('beat')}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              tab === 'beat' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/40' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Upload Beat</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('video')}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              tab === 'video' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/40' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Upload Video</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('photo')}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              tab === 'photo' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/40' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Drag & Drop File Box */}
          <label className="block p-6 rounded-2xl border-2 border-dashed border-purple-700/50 hover:border-purple-400/80 bg-purple-950/20 hover:bg-purple-950/30 cursor-pointer text-center space-y-2 transition-all">
            <input 
              type="file" 
              accept={tab === 'beat' ? 'audio/*' : tab === 'video' ? 'video/*' : 'image/*'} 
              className="hidden" 
              onChange={handleFileChange}
            />
            <div className="w-10 h-10 rounded-full bg-purple-900/60 border border-purple-500/40 mx-auto flex items-center justify-center text-purple-300">
              {tab === 'beat' ? <FileAudio className="w-5 h-5" /> : tab === 'video' ? <Film className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
            </div>
            <div className="text-xs font-bold text-white">
              {fileName ? fileName : `Click to browse or drop ${tab} file`}
            </div>
            <div className="text-[10px] text-zinc-400">
              Supports MP3, WAV, MP4, WEBM, PNG, JPG (Local upload)
            </div>
          </label>

          {/* Form Fields */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Title / Track Name</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Purple Nebula 808 Anthem"
                className="w-full bg-[#0a0414] border border-purple-900/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            {tab === 'beat' && (
              <>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Genre</label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full bg-[#0a0414] border border-purple-900/50 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="Trap / Dark 808">Trap / Dark 808</option>
                      <option value="Synthwave / EDM">Synthwave / EDM</option>
                      <option value="Lofi / Soul">Lofi / Soul</option>
                      <option value="Reggaeton / Latin">Reggaeton / Latin</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">BPM</label>
                    <input
                      type="number"
                      value={bpm}
                      onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
                      className="w-full bg-[#0a0414] border border-purple-900/50 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Key</label>
                    <input
                      type="text"
                      value={keySignature}
                      onChange={(e) => setKeySignature(e.target.value)}
                      placeholder="F Minor"
                      className="w-full bg-[#0a0414] border border-purple-900/50 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a0414] border border-purple-900/40">
                  <div>
                    <div className="text-xs font-bold text-white">Free For Profit License</div>
                    <div className="text-[10px] text-zinc-400">Allow community artists to record free vocal takes</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    className="w-4 h-4 accent-purple-500 rounded"
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="808, Trap, Free Beats, Gunna Vibe"
                className="w-full bg-[#0a0414] border border-purple-900/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-purple-600/30"
            >
              {uploadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Uploaded to Studio!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>Publish to Clash Beat Lab</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
