import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { MasteringSettings, FreeBeat, PlayerStats, SynthRiffType } from '../types';
import { soundEngine } from '../services/soundEngine';
import { INITIAL_BEAT_PROJECTS, INITIAL_FREE_BEATS, TRACK_CATALOG } from '../data/musicData';
import {
  processBatchExport,
  BatchExportTrack,
  BatchExportConfig,
  BatchExportProgress,
  ExportedTrackResult,
  ExportBitrate,
  ExportFormat,
  SampleRateOption,
  LoudnessTarget,
  formatBytes,
} from '../services/batchMasterExporter';
import {
  SlidersHorizontal,
  Power,
  Sparkles,
  Play,
  Square,
  Volume2,
  RotateCcw,
  Check,
  Download,
  Radio,
  Activity,
  Zap,
  Gauge,
  Layers,
  FolderArchive,
  Music,
  Upload,
  Plus,
  Trash2,
  Sliders,
  Settings,
  Disc,
  ArrowRight,
  Headphones,
  CheckCircle2,
  FileAudio,
  HardDrive,
  Info,
  Clock,
  Sparkle,
} from 'lucide-react';

interface MasteringStudioProps {
  initialSettings?: MasteringSettings;
  onSaveSettings?: (settings: MasteringSettings) => void;
  freeBeats?: FreeBeat[];
  playerStats?: PlayerStats;
  onUpdateStats?: (stats: PlayerStats) => void;
}

export const MasteringStudio: React.FC<MasteringStudioProps> = ({
  initialSettings,
  onSaveSettings,
  freeBeats = INITIAL_FREE_BEATS,
  playerStats,
  onUpdateStats,
}) => {
  // Active Mastering Rack Settings
  const [settings, setSettings] = useState<MasteringSettings>(
    initialSettings || {
      enabled: true,
      preset: 'punchy-rap',
      warmth: 70,
      limiting: 80,
      stereoWidth: 75,
      subBassBoost: 85,
      airClarity: 80,
      spatialReverb: 35,
    }
  );

  // Studio Mode: 'rack' (Knobs & Spectrum) | 'batch-export' (Batch Multi-Track Exporter) | 'compare' (Profiles Compare)
  const [studioMode, setStudioMode] = useState<'rack' | 'batch-export' | 'compare'>('rack');

  const [isPlayingTestLoop, setIsPlayingTestLoop] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- BATCH EXPORT QUEUE & CONFIG STATE ---
  const [batchTracks, setBatchTracks] = useState<BatchExportTrack[]>(() => {
    const initialList: BatchExportTrack[] = [];

    // 1. Add Beat Projects
    INITIAL_BEAT_PROJECTS.forEach((proj, idx) => {
      initialList.push({
        id: `batch-proj-${proj.id}`,
        title: proj.title,
        artistOrProducer: 'DJ Sonic Nova (Your Project)',
        genre: proj.genre,
        bpm: proj.bpm,
        key: proj.key,
        sourceType: 'project',
        synthRiff: idx === 0 ? 'hiphop' : 'synthwave',
        durationSeconds: 16.0,
        selected: true,
      });
    });

    // 2. Add Vault Free Beats
    freeBeats.slice(0, 4).forEach((beat) => {
      initialList.push({
        id: `batch-vault-${beat.id}`,
        title: beat.title,
        artistOrProducer: beat.producer,
        genre: beat.genre,
        bpm: beat.bpm,
        key: beat.key,
        sourceType: 'vault_beat',
        synthRiff: beat.synthRiff,
        durationSeconds: 16.0,
        selected: true,
      });
    });

    // 3. Add Catalog Tracks
    TRACK_CATALOG.slice(0, 2).forEach((trk) => {
      initialList.push({
        id: `batch-catalog-${trk.id}`,
        title: trk.title,
        artistOrProducer: trk.artist,
        genre: trk.genre,
        bpm: trk.bpm,
        key: trk.key,
        sourceType: 'catalog',
        synthRiff: trk.synthRiff,
        durationSeconds: 16.0,
        selected: false,
      });
    });

    return initialList;
  });

  // Batch Export Options
  const [exportConfig, setExportConfig] = useState<BatchExportConfig>({
    bitrate: '320k',
    format: 'mp3',
    sampleRate: 44100,
    loudnessTarget: '-0.1db',
    embedMetadata: true,
    zipPackage: true,
    zipFileName: `MusicClash_Mastered_Batch_${new Date().toISOString().slice(0, 10)}.zip`,
    normalizeLoudness: true,
  });

  // Custom numeric bitrate slider value (e.g. 128 to 320)
  const [customBitrateNum, setCustomBitrateNum] = useState<number>(320);

  // Batch Processing Status
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<BatchExportProgress | null>(null);
  const [exportResults, setExportResults] = useState<{
    results: ExportedTrackResult[];
    zipBlob?: Blob;
    zipDownloadUrl?: string;
  } | null>(null);

  // Auditioning track in queue
  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(null);

  // File Upload input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Apply settings to Web Audio engine whenever changed
  useEffect(() => {
    soundEngine.applyMasteringSettings(settings);
  }, [settings]);

  // Spectrum visualizer animation loop
  useEffect(() => {
    let animId: number;

    const draw = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const freqData = soundEngine.getFrequencyData();
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const barWidth = (canvas.width / (freqData.length || 32)) * 1.5;
          let x = 0;

          for (let i = 0; i < freqData.length; i++) {
            const barHeight =
              ((freqData[i] || (isPlayingTestLoop || previewingTrackId ? Math.random() * 140 : 15)) / 255) *
              canvas.height;

            const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
            grad.addColorStop(0, '#7e22ce');
            grad.addColorStop(0.6, '#c084fc');
            grad.addColorStop(1, '#ffffff');

            ctx.fillStyle = grad;
            ctx.shadowBlur = settings.enabled ? 12 : 2;
            ctx.shadowColor = '#a855f7';

            ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
            x += barWidth;
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [isPlayingTestLoop, previewingTrackId, settings.enabled]);

  const handleToggleMaster = () => {
    soundEngine.playClick();
    setSettings((prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  const handlePresetSelect = (preset: MasteringSettings['preset']) => {
    soundEngine.playClick();
    let newSettings: MasteringSettings;

    switch (preset) {
      case 'punchy-rap':
        newSettings = {
          enabled: true,
          preset,
          warmth: 75,
          limiting: 85,
          stereoWidth: 70,
          subBassBoost: 90,
          airClarity: 80,
          spatialReverb: 25,
        };
        break;
      case 'warm-vinyl':
        newSettings = {
          enabled: true,
          preset,
          warmth: 95,
          limiting: 60,
          stereoWidth: 60,
          subBassBoost: 75,
          airClarity: 65,
          spatialReverb: 50,
        };
        break;
      case 'edm-maximizer':
        newSettings = {
          enabled: true,
          preset,
          warmth: 60,
          limiting: 95,
          stereoWidth: 95,
          subBassBoost: 80,
          airClarity: 90,
          spatialReverb: 40,
        };
        break;
      case 'crystal-pop':
        newSettings = {
          enabled: true,
          preset,
          warmth: 50,
          limiting: 75,
          stereoWidth: 85,
          subBassBoost: 65,
          airClarity: 95,
          spatialReverb: 45,
        };
        break;
      case 'lofi-glow':
        newSettings = {
          enabled: true,
          preset,
          warmth: 85,
          limiting: 50,
          stereoWidth: 50,
          subBassBoost: 80,
          airClarity: 55,
          spatialReverb: 60,
        };
        break;
      case 'clean':
      default:
        newSettings = {
          enabled: true,
          preset: 'clean',
          warmth: 20,
          limiting: 40,
          stereoWidth: 50,
          subBassBoost: 30,
          airClarity: 40,
          spatialReverb: 15,
        };
        break;
    }

    setSettings(newSettings);
  };

  const handleToggleTestLoop = () => {
    if (isPlayingTestLoop) {
      soundEngine.stopPreview();
      setIsPlayingTestLoop(false);
    } else {
      soundEngine.playPreviewRiff('hiphop');
      setIsPlayingTestLoop(true);
    }
  };

  const handleSave = () => {
    soundEngine.playCorrect();
    if (onSaveSettings) {
      onSaveSettings(settings);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // --- BATCH EXPORT HANDLERS ---

  const handleToggleTrackSelection = (id: string) => {
    soundEngine.playClick();
    setBatchTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t))
    );
  };

  const handleSelectAll = (select: boolean) => {
    soundEngine.playClick();
    setBatchTracks((prev) => prev.map((t) => ({ ...t, selected: select })));
  };

  const handleSelectByType = (type: 'project' | 'vault_beat') => {
    soundEngine.playClick();
    setBatchTracks((prev) =>
      prev.map((t) => ({ ...t, selected: t.sourceType === type }))
    );
  };

  const handleRemoveTrack = (id: string) => {
    soundEngine.playClick();
    setBatchTracks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateTrackPreset = (id: string, presetStr: string) => {
    soundEngine.playClick();
    setBatchTracks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          if (presetStr === 'global') {
            return { ...t, customSettings: undefined };
          }
          // Clone global and change preset
          return {
            ...t,
            customSettings: {
              ...settings,
              preset: presetStr as MasteringSettings['preset'],
            },
          };
        }
        return t;
      })
    );
  };

  const handlePreviewQueueTrack = (track: BatchExportTrack) => {
    if (previewingTrackId === track.id) {
      soundEngine.stopPreview();
      setPreviewingTrackId(null);
    } else {
      soundEngine.stopPreview();
      // Apply track specific mastering or global
      soundEngine.applyMasteringSettings(track.customSettings || settings);
      soundEngine.playPreviewRiff(track.synthRiff || 'hiphop');
      setPreviewingTrackId(track.id);
    }
  };

  // Handle local file uploads to batch mastering queue
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    soundEngine.playFanfare();
    const newQueueItems: BatchExportTrack[] = [];

    Array.from(files).forEach((file, idx) => {
      const blobUrl = URL.createObjectURL(file);
      newQueueItems.push({
        id: `batch-upload-${Date.now()}-${idx}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artistOrProducer: 'Imported Audio File',
        genre: 'User Audio Stem',
        bpm: 128,
        sourceType: 'uploaded',
        audioBlobUrl: blobUrl,
        durationSeconds: 20.0,
        selected: true,
      });
    });

    setBatchTracks((prev) => [...newQueueItems, ...prev]);
    e.target.value = '';
  };

  // Bitrate Preset change
  const handleBitratePresetChange = (bitrateVal: ExportBitrate) => {
    soundEngine.playClick();
    let numVal = 320;
    if (bitrateVal === '320k') numVal = 320;
    else if (bitrateVal === '256k') numVal = 256;
    else if (bitrateVal === '192k') numVal = 192;
    else if (bitrateVal === '128k') numVal = 128;
    else if (bitrateVal === 'wav-24bit' || bitrateVal === 'wav-16bit') numVal = 320;

    setCustomBitrateNum(numVal);
    setExportConfig((prev) => ({
      ...prev,
      bitrate: bitrateVal,
      format: bitrateVal.startsWith('wav') ? 'wav' : prev.format,
    }));
  };

  // Custom Bitrate slider change
  const handleCustomBitrateSlider = (val: number) => {
    setCustomBitrateNum(val);
    let mappedBitrate: ExportBitrate = '320k';
    if (val >= 300) mappedBitrate = '320k';
    else if (val >= 240) mappedBitrate = '256k';
    else if (val >= 180) mappedBitrate = '192k';
    else mappedBitrate = '128k';

    setExportConfig((prev) => ({
      ...prev,
      bitrate: mappedBitrate,
    }));
  };

  // Execute Batch Master Export
  const handleStartBatchExport = async () => {
    const selectedCount = batchTracks.filter((t) => t.selected).length;
    if (selectedCount === 0) return;

    soundEngine.playClick();
    setIsExporting(true);
    setExportResults(null);

    try {
      const { results, zipBlob } = await processBatchExport(
        batchTracks,
        exportConfig,
        settings,
        (progress) => {
          setExportProgress(progress);
        }
      );

      const zipDownloadUrl = zipBlob ? URL.createObjectURL(zipBlob) : undefined;
      setExportResults({ results, zipBlob, zipDownloadUrl });

      // Celebration Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#ec4899', '#38bdf8', '#ffffff'],
        });
      } catch {
        // Safe fallback
      }

      soundEngine.playFanfare();

      // Award Player Stats Bonus ($50 MCD + 100 XP)
      if (playerStats && onUpdateStats) {
        onUpdateStats({
          ...playerStats,
          clashDollars: (playerStats.clashDollars || 0) + 50,
          xp: (playerStats.xp || 0) + 100,
          matchHistory: [
            {
              id: `master-export-${Date.now()}`,
              date: 'Just now',
              type: 'beat_master',
              title: `Batch Mastered ${selectedCount} Tracks (${exportConfig.bitrate})`,
              result: 'Exported High-Fidelity Master Package (+$50 MCD)',
              xpGained: 100,
              coinsGained: 100,
              clashDollarsGained: 50,
            },
            ...(playerStats.matchHistory || []).slice(0, 14),
          ],
        });
      }
    } catch (err) {
      console.error('Batch export failed:', err);
      soundEngine.playWrong();
    } finally {
      setIsExporting(false);
    }
  };

  // Trigger individual file download
  const handleDownloadSingleTrack = (res: ExportedTrackResult) => {
    soundEngine.playClick();
    const a = document.createElement('a');
    a.href = res.downloadUrl;
    a.download = res.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Trigger ZIP download
  const handleDownloadZip = () => {
    if (!exportResults?.zipDownloadUrl) return;
    soundEngine.playClick();
    const a = document.createElement('a');
    a.href = exportResults.zipDownloadUrl;
    a.download = exportConfig.zipFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const selectedTracksCount = batchTracks.filter((t) => t.selected).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Hidden File Input for uploading custom stems */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.wav,.mp3,.ogg,.m4a"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Studio Top Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8 bg-gradient-to-r from-[#17082e] via-[#0f041f] to-[#070210] border border-purple-500/30 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-extrabold uppercase tracking-wider">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Pro Audio Mastering Suite & Batch Exporter
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Mastering Rack & <span className="text-silver-gradient">Analog Heat Console</span>
            </h1>
            <p className="text-sm text-zinc-300 max-w-2xl">
              Apply analog tape warmth, 90Hz 808 sub-bass punch, and dynamic ceiling limiting. Batch export multiple mastered tracks at once with custom bitrates (320k, 256k, 192k, Lossless WAV).
            </p>
          </div>

          {/* Master Power Bypass & Quick Batch Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-[#0d051c] p-3 rounded-2xl border border-purple-700/40">
              <div className="text-right">
                <div className="text-xs font-extrabold text-white">Master Chain</div>
                <div
                  className={`text-[10px] font-bold ${
                    settings.enabled ? 'text-purple-400' : 'text-zinc-500'
                  }`}
                >
                  {settings.enabled ? 'ACTIVE (PROCESSED)' : 'BYPASS (DRY)'}
                </div>
              </div>

              <button
                id="master-chain-toggle-btn"
                onClick={handleToggleMaster}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg ${
                  settings.enabled
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/40 border border-purple-300/40'
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                }`}
                title="Toggle Master Audio Chain"
              >
                <Power className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Studio Navigation Tabs: Rack vs Batch Exporter vs Profiles */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-900/40 pb-3">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#0e061c] border border-purple-800/40">
          <button
            id="tab-mastering-rack"
            onClick={() => {
              soundEngine.playClick();
              setStudioMode('rack');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              studioMode === 'rack'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Mastering Rack & Knobs</span>
          </button>

          <button
            id="tab-batch-exporter"
            onClick={() => {
              soundEngine.playClick();
              setStudioMode('batch-export');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
              studioMode === 'batch-export'
                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FolderArchive className="w-4 h-4 text-purple-300" />
            <span>Batch Multi-Track Exporter</span>
            {selectedTracksCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-purple-900 text-purple-200 text-[10px] font-mono font-extrabold border border-purple-400/40">
                {selectedTracksCount}
              </span>
            )}
          </button>

          <button
            id="tab-profiles-compare"
            onClick={() => {
              soundEngine.playClick();
              setStudioMode('compare');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              studioMode === 'compare'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Profiles & A/B Compare</span>
          </button>
        </div>

        {/* Quick Actions / Batch shortcut */}
        {studioMode === 'rack' ? (
          <button
            onClick={() => {
              soundEngine.playClick();
              setStudioMode('batch-export');
            }}
            className="px-4 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs font-extrabold flex items-center gap-2 transition-all"
          >
            <FolderArchive className="w-4 h-4 text-fuchsia-400" />
            <span>Batch Export Mastered Tracks ({selectedTracksCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-zinc-200 flex items-center gap-2 transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              <span>Import Audio Stems</span>
            </button>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODE 1: BATCH AUDIO EXPORTER SUITE */}
      {/* ============================================================ */}
      {studioMode === 'batch-export' && (
        <div className="space-y-6">
          {/* Batch Exporter Banner & Custom Bitrate Quick Controls */}
          <div className="glass-panel-silver rounded-2xl p-6 border border-purple-500/40 space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FolderArchive className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-extrabold text-white">
                    Batch Export Mastered Audio Package
                  </h2>
                </div>
                <p className="text-xs text-zinc-300 max-w-xl">
                  Select multiple tracks from your beat projects, free vault beats, or uploaded audio. Choose custom bitrate encodings, loudness targets, and export as a single ZIP archive or individual mastered tracks.
                </p>
              </div>

              {/* Master & Batch Export Primary CTA */}
              <button
                id="start-batch-export-btn"
                onClick={handleStartBatchExport}
                disabled={isExporting || selectedTracksCount === 0}
                className={`px-6 py-3.5 rounded-2xl font-extrabold text-xs tracking-wider uppercase flex items-center gap-2.5 transition-all shadow-xl ${
                  selectedTracksCount > 0 && !isExporting
                    ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-500 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-purple-600/40 border border-purple-300/40 hover:scale-[1.02]'
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                }`}
              >
                {isExporting ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin text-purple-300" />
                    <span>Processing Masters...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-purple-200" />
                    <span>
                      Export {selectedTracksCount} Mastered Track{selectedTracksCount === 1 ? '' : 's'} ({exportConfig.bitrate})
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Custom Bitrate & Format Configuration Console */}
            <div className="p-5 rounded-2xl bg-[#090314]/90 border border-purple-900/60 space-y-5">
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
                <span className="text-xs font-extrabold text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-purple-400" />
                  Custom Bitrate & Audio Encoding Parameters
                </span>
                <span className="text-[11px] font-mono text-purple-300 bg-purple-950/80 px-2.5 py-1 rounded-full border border-purple-700/40">
                  Target Profile: {settings.preset.toUpperCase()} • {exportConfig.bitrate.toUpperCase()}
                </span>
              </div>

              {/* 1. Custom Bitrate Buttons & Numeric Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-300 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-purple-400" />
                    Bitrate Quality Setting:
                  </span>
                  <span className="text-purple-300 font-mono font-extrabold">
                    {exportConfig.bitrate === 'wav-24bit'
                      ? '24-Bit / 48kHz (Lossless Studio Broadcast)'
                      : exportConfig.bitrate === 'wav-16bit'
                      ? '16-Bit / 44.1kHz (CD Quality Lossless)'
                      : `${customBitrateNum} kbps (Custom MP3/AAC)`}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {[
                    { id: '320k', label: '320 kbps', desc: 'Studio Ultra HD', badge: 'MAX MP3' },
                    { id: '256k', label: '256 kbps', desc: 'Apple/Spotify HQ', badge: 'STREAM' },
                    { id: '192k', label: '192 kbps', desc: 'Standard Web', badge: 'BALANCED' },
                    { id: '128k', label: '128 kbps', desc: 'Radio/Demo', badge: 'COMPACT' },
                    { id: 'wav-24bit', label: '24-Bit WAV', desc: '48kHz Broadcast', badge: 'LOSSLESS' },
                    { id: 'wav-16bit', label: '16-Bit WAV', desc: '44.1kHz Redbook', badge: 'CD QUALITY' },
                  ].map((b) => {
                    const isSelected = exportConfig.bitrate === b.id;
                    return (
                      <button
                        key={b.id}
                        id={`bitrate-btn-${b.id}`}
                        onClick={() => handleBitratePresetChange(b.id as ExportBitrate)}
                        className={`p-3 rounded-xl text-left transition-all border ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-300 shadow-md shadow-purple-600/30'
                            : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black">{b.label}</span>
                          <span
                            className={`text-[9px] font-mono px-1 rounded ${
                              isSelected ? 'bg-black/30 text-white' : 'bg-purple-950 text-purple-300'
                            }`}
                          >
                            {b.badge}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-300/80 mt-1">{b.desc}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Granular Bitrate Slider (Active when MP3 selected) */}
                {!exportConfig.bitrate.startsWith('wav') && (
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 bg-purple-950/30 p-3 rounded-xl border border-purple-800/30">
                    <span className="text-xs text-zinc-300 whitespace-nowrap font-medium">
                      Fine-Tune Bitrate:
                    </span>
                    <input
                      type="range"
                      min="96"
                      max="320"
                      step="32"
                      value={customBitrateNum}
                      onChange={(e) => handleCustomBitrateSlider(parseInt(e.target.value))}
                      className="w-full h-2 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <span className="text-xs font-mono font-bold text-purple-200 min-w-[70px] text-right">
                      {customBitrateNum} kbps
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Format, Sample Rate & Loudness Ceilings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* Format */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <FileAudio className="w-3.5 h-3.5 text-purple-400" />
                    Container Format:
                  </label>
                  <select
                    value={exportConfig.format}
                    onChange={(e) =>
                      setExportConfig({ ...exportConfig, format: e.target.value as ExportFormat })
                    }
                    className="w-full bg-[#0e061c] border border-purple-800/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="mp3">MP3 Audio (.mp3)</option>
                    <option value="wav">Broadcast Wave (.wav)</option>
                    <option value="flac">Lossless FLAC (.flac)</option>
                    <option value="m4a">AAC Audio (.m4a)</option>
                  </select>
                </div>

                {/* Sample Rate */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-purple-400" />
                    Master Sample Rate:
                  </label>
                  <select
                    value={exportConfig.sampleRate}
                    onChange={(e) =>
                      setExportConfig({
                        ...exportConfig,
                        sampleRate: parseInt(e.target.value) as SampleRateOption,
                      })
                    }
                    className="w-full bg-[#0e061c] border border-purple-800/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="44100">44.1 kHz (CD / Streaming Standard)</option>
                    <option value="48000">48.0 kHz (Pro Studio Master)</option>
                    <option value="96000">96.0 kHz (High-Res 96k Master)</option>
                  </select>
                </div>

                {/* Loudness Target */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-purple-400" />
                    Loudness & True Peak Target:
                  </label>
                  <select
                    value={exportConfig.loudnessTarget}
                    onChange={(e) =>
                      setExportConfig({
                        ...exportConfig,
                        loudnessTarget: e.target.value as LoudnessTarget,
                      })
                    }
                    className="w-full bg-[#0e061c] border border-purple-800/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="-0.1db">-0.1 dB True Peak (Club & DJ Set Master)</option>
                    <option value="-1.0db">-1.0 dB True Peak (Spotify/Apple Compliant)</option>
                    <option value="-8lufs">-8.0 LUFS (Commercial Competitive Loudness)</option>
                    <option value="-14lufs">-14.0 LUFS (Broadcast / Streaming Standard)</option>
                  </select>
                </div>
              </div>

              {/* 3. Packaging & Metadata Options */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-purple-900/40 text-xs">
                <div className="flex flex-wrap items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 font-medium">
                    <input
                      type="checkbox"
                      checked={exportConfig.zipPackage}
                      onChange={(e) =>
                        setExportConfig({ ...exportConfig, zipPackage: e.target.checked })
                      }
                      className="rounded bg-purple-950 border-purple-700 text-purple-600 focus:ring-purple-500 w-4 h-4"
                    />
                    <span>Bundle into Single .ZIP Package</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 font-medium">
                    <input
                      type="checkbox"
                      checked={exportConfig.embedMetadata}
                      onChange={(e) =>
                        setExportConfig({ ...exportConfig, embedMetadata: e.target.checked })
                      }
                      className="rounded bg-purple-950 border-purple-700 text-purple-600 focus:ring-purple-500 w-4 h-4"
                    />
                    <span>Generate Mastering Report & ID3 Tags</span>
                  </label>
                </div>

                <div className="text-[11px] text-zinc-400 font-mono">
                  Est. Batch Size: ~{(selectedTracksCount * (exportConfig.bitrate.startsWith('wav') ? 5.2 : 1.4)).toFixed(1)} MB
                </div>
              </div>
            </div>
          </div>

          {/* Batch Queue Management Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0e061c] p-4 rounded-2xl border border-purple-800/40">
            <div className="flex items-center gap-3">
              <Disc className="w-5 h-5 text-purple-400 animate-spin-slow" />
              <div>
                <div className="text-xs font-extrabold text-white">
                  Mastering Batch Queue ({selectedTracksCount} of {batchTracks.length} Selected)
                </div>
                <div className="text-[11px] text-zinc-400">
                  Click any track to toggle, preview with master chain, or customize individual profiles.
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleSelectAll(true)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold border border-white/10"
              >
                Select All
              </button>
              <button
                onClick={() => handleSelectByType('project')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold border border-white/10"
              >
                Projects Only
              </button>
              <button
                onClick={() => handleSelectByType('vault_beat')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold border border-white/10"
              >
                Free Beats Only
              </button>
              <button
                onClick={() => handleSelectAll(false)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 text-xs font-bold border border-white/10"
              >
                Deselect All
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-bold border border-purple-400/40 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stems</span>
              </button>
            </div>
          </div>

          {/* Queued Tracks Cards List */}
          <div className="space-y-3">
            {batchTracks.map((track, idx) => {
              const isPreviewing = previewingTrackId === track.id;
              const trackPreset = track.customSettings?.preset || settings.preset;

              return (
                <div
                  key={track.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    track.selected
                      ? 'bg-[#0f0721]/90 border-purple-600/50 shadow-md shadow-purple-950/40'
                      : 'bg-[#080312]/60 border-purple-950/40 opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* Left: Checkbox, Number & Info */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={track.selected}
                      onChange={() => handleToggleTrackSelection(track.id)}
                      className="rounded bg-purple-950 border-purple-700 text-purple-600 focus:ring-purple-500 w-5 h-5 cursor-pointer"
                    />

                    <span className="text-xs font-mono font-bold text-zinc-400 w-5 text-center">
                      #{idx + 1}
                    </span>

                    {/* Source Icon Badge */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                        track.sourceType === 'project'
                          ? 'bg-purple-900/60 border-purple-500/40 text-purple-300'
                          : track.sourceType === 'vault_beat'
                          ? 'bg-fuchsia-900/60 border-fuchsia-500/40 text-fuchsia-300'
                          : track.sourceType === 'uploaded'
                          ? 'bg-emerald-900/60 border-emerald-500/40 text-emerald-300'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                      }`}
                    >
                      {track.sourceType === 'project' ? (
                        <Music className="w-5 h-5" />
                      ) : track.sourceType === 'vault_beat' ? (
                        <Sparkles className="w-5 h-5" />
                      ) : track.sourceType === 'uploaded' ? (
                        <Upload className="w-5 h-5" />
                      ) : (
                        <Disc className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-extrabold text-white truncate max-w-xs sm:max-w-sm">
                          {track.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-700/50 text-[10px] font-mono text-purple-300">
                          {track.genre}
                        </span>
                        {track.bpm && (
                          <span className="text-[10px] font-mono text-zinc-400">
                            {track.bpm} BPM
                          </span>
                        )}
                        {track.key && (
                          <span className="text-[10px] font-mono text-zinc-400">
                            • {track.key}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 truncate">
                        {track.artistOrProducer} •{' '}
                        <span className="text-purple-400 capitalize">
                          {track.sourceType.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Audition Button, Profile Override & Remove */}
                  <div className="flex items-center gap-3 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-purple-900/30">
                    {/* Live Audition Button */}
                    <button
                      id={`preview-track-btn-${track.id}`}
                      onClick={() => handlePreviewQueueTrack(track)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                        isPreviewing
                          ? 'bg-purple-600 text-white border-purple-300 shadow-md shadow-purple-600/40 animate-pulse'
                          : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'
                      }`}
                      title="Audition with Mastering Applied"
                    >
                      {isPreviewing ? (
                        <>
                          <Square className="w-3 h-3 fill-current" />
                          <span>Auditioning...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current text-purple-400" />
                          <span>Audition Master</span>
                        </>
                      )}
                    </button>

                    {/* Mastering Preset Override Selector */}
                    <div className="relative">
                      <select
                        value={track.customSettings ? track.customSettings.preset : 'global'}
                        onChange={(e) => handleUpdateTrackPreset(track.id, e.target.value)}
                        className="bg-[#0b0416] border border-purple-800/60 rounded-xl px-2.5 py-1.5 text-xs font-bold text-purple-200 focus:outline-none focus:border-purple-400"
                        title="Mastering Profile Override for this Track"
                      >
                        <option value="global">
                          Global Rack ({settings.preset.replace('-', ' ')})
                        </option>
                        <option value="punchy-rap">🔥 Punchy Rap / 808</option>
                        <option value="warm-vinyl">📼 Warm Tape Vinyl</option>
                        <option value="edm-maximizer">⚡ EDM Maximizer</option>
                        <option value="crystal-pop">💎 Crystal Pop</option>
                        <option value="lofi-glow">🌙 Lofi Purple Glow</option>
                        <option value="clean">✨ Clean Transparent</option>
                      </select>
                    </div>

                    {/* Remove Track Button */}
                    <button
                      onClick={() => handleRemoveTrack(track.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-all"
                      title="Remove from batch queue"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Export Trigger & Rewards Banner */}
          <div className="glass-panel rounded-2xl p-6 border border-purple-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-600/40 flex items-center justify-center text-purple-300">
                <Sparkle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-white">
                  Batch Mastering Rewards: +$50 Music Clash Dollars & +100 XP
                </div>
                <div className="text-[11px] text-zinc-400">
                  Exporting this batch will render full DSP analog mastering and add to your studio producer portfolio.
                </div>
              </div>
            </div>

            <button
              onClick={handleStartBatchExport}
              disabled={isExporting || selectedTracksCount === 0}
              className={`px-6 py-3 rounded-xl font-extrabold text-xs tracking-wider uppercase flex items-center gap-2 transition-all shadow-lg ${
                selectedTracksCount > 0 && !isExporting
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-purple-600/30 border border-purple-300/40'
                  : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Batch Master & Export ({selectedTracksCount} Tracks)</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 2: MASTERING RACK & ANALOG CONSOLE */}
      {/* ============================================================ */}
      {studioMode === 'rack' && (
        <div className="space-y-6">
          {/* Preset Selector Ribbon */}
          <div className="glass-panel-silver rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Mastering Profiles:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'punchy-rap', label: 'Punchy Rap / 808', icon: '🔥' },
                { id: 'warm-vinyl', label: 'Warm Tape Vinyl', icon: '📼' },
                { id: 'edm-maximizer', label: 'EDM Club Maximizer', icon: '⚡' },
                { id: 'crystal-pop', label: 'Crystal Pop Shimmer', icon: '💎' },
                { id: 'lofi-glow', label: 'Lofi Purple Glow', icon: '🌙' },
                { id: 'clean', label: 'Clean Transparent', icon: '✨' },
              ].map((p) => {
                const isSelected = settings.preset === p.id;
                return (
                  <button
                    key={p.id}
                    id={`preset-btn-${p.id}`}
                    onClick={() => handlePresetSelect(p.id as MasteringSettings['preset'])}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-300/40'
                        : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10'
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Realtime Frequency Spectrum Analyzer Canvas */}
          <div className="glass-panel rounded-2xl p-5 border border-purple-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Frequency Spectrum & LUFS Ceiling
                </h3>
              </div>

              {/* Test Audio Button */}
              <button
                id="test-audio-loop-btn"
                onClick={handleToggleTestLoop}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
                  isPlayingTestLoop
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30'
                    : 'bg-white/5 hover:bg-white/10 text-zinc-200 border-white/15'
                }`}
              >
                {isPlayingTestLoop ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop Master Test Beat</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current text-purple-400" />
                    <span>Play Master Test Beat</span>
                  </>
                )}
              </button>
            </div>

            {/* Canvas Visualizer */}
            <div className="w-full h-32 bg-[#080312] rounded-xl overflow-hidden border border-purple-950/60 relative flex items-center justify-center">
              <canvas ref={canvasRef} width={700} height={128} className="w-full h-full" />
              <div className="absolute bottom-2 left-4 text-[10px] text-purple-300/60 font-mono">
                20Hz ── 100Hz (Sub) ── 1kHz (Mids) ── 10kHz (Air) ── 20kHz
              </div>
              <div className="absolute top-2 right-4 text-[10px] text-zinc-400 font-mono">
                LUFS: {settings.enabled ? '-8.6 LUFS' : '-16.2 LUFS'}
              </div>
            </div>
          </div>

          {/* 6 High-Precision Mastering Knobs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Tube Warmth / Tape Saturation */}
            <div className="glass-panel rounded-2xl p-5 border border-purple-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  Tube Warmth & Tape Drive
                </span>
                <span className="text-xs font-mono font-bold text-purple-300">
                  {settings.warmth}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.warmth}
                onChange={(e) =>
                  setSettings({ ...settings, warmth: parseInt(e.target.value) })
                }
                disabled={!settings.enabled}
                className="w-full h-2 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-40"
              />
              <p className="text-[11px] text-zinc-400">
                Adds analog even-harmonic saturation for warmth and glue.
              </p>
            </div>

            {/* 2. Sub-Bass 90Hz Boost */}
            <div className="glass-panel rounded-2xl p-5 border border-purple-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  808 Sub-Bass Punch (90Hz)
                </span>
                <span className="text-xs font-mono font-bold text-purple-300">
                  {settings.subBassBoost}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.subBassBoost}
                onChange={(e) =>
                  setSettings({ ...settings, subBassBoost: parseInt(e.target.value) })
                }
                disabled={!settings.enabled}
                className="w-full h-2 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-40"
              />
              <p className="text-[11px] text-zinc-400">
                Tightens low-end weight without muddying the vocal midrange.
              </p>
            </div>

            {/* 3. Limiter & Loudness Maximizer */}
            <div className="glass-panel rounded-2xl p-5 border border-purple-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-purple-400" />
                  Limiter / Loudness Ceiling
                </span>
                <span className="text-xs font-mono font-bold text-purple-300">
                  {settings.limiting}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.limiting}
                onChange={(e) =>
                  setSettings({ ...settings, limiting: parseInt(e.target.value) })
                }
                disabled={!settings.enabled}
                className="w-full h-2 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-40"
              />
              <p className="text-[11px] text-zinc-400">
                Maximizes commercial volume while preventing digital clipping.
              </p>
            </div>

            {/* 4. Air & Clarity (8.5kHz Shelf) */}
            <div className="glass-panel rounded-2xl p-5 border border-purple-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Air & Shimmer Clarity (8.5kHz)
                </span>
                <span className="text-xs font-mono font-bold text-purple-300">
                  {settings.airClarity}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.airClarity}
                onChange={(e) =>
                  setSettings({ ...settings, airClarity: parseInt(e.target.value) })
                }
                disabled={!settings.enabled}
                className="w-full h-2 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-40"
              />
              <p className="text-[11px] text-zinc-400">
                Brings hi-hats, vocal consonants, and synth tops to life.
              </p>
            </div>

            {/* 5. Stereo Imager & Widener */}
            <div className="glass-panel rounded-2xl p-5 border border-purple-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-purple-400" />
                  Stereo Width & Imager
                </span>
                <span className="text-xs font-mono font-bold text-purple-300">
                  {settings.stereoWidth}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.stereoWidth}
                onChange={(e) =>
                  setSettings({ ...settings, stereoWidth: parseInt(e.target.value) })
                }
                disabled={!settings.enabled}
                className="w-full h-2 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-40"
              />
              <p className="text-[11px] text-zinc-400">
                Expands the stereo field for expansive spatial separation.
              </p>
            </div>

            {/* 6. Studio Spatial Reverb */}
            <div className="glass-panel rounded-2xl p-5 border border-purple-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                  Spatial Room Acoustic Depth
                </span>
                <span className="text-xs font-mono font-bold text-purple-300">
                  {settings.spatialReverb}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.spatialReverb}
                onChange={(e) =>
                  setSettings({ ...settings, spatialReverb: parseInt(e.target.value) })
                }
                disabled={!settings.enabled}
                className="w-full h-2 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-40"
              />
              <p className="text-[11px] text-zinc-400">
                Simulates high-end acoustic mastering studio room reflections.
              </p>
            </div>
          </div>

          {/* Footer Save & Export Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={() => handlePresetSelect('punchy-rap')}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-zinc-300 transition-all"
            >
              Reset to Default Rack
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setStudioMode('batch-export');
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 font-extrabold text-xs flex items-center gap-2 transition-all shadow-md"
              >
                <FolderArchive className="w-4 h-4 text-fuchsia-400" />
                <span>Open Batch Exporter ({selectedTracksCount} queued)</span>
              </button>

              <button
                id="save-master-settings-btn"
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Master Profile Applied!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-purple-200" />
                    <span>Apply Profile to All Studio Projects</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 3: PROFILES & A/B COMPARISON */}
      {/* ============================================================ */}
      {studioMode === 'compare' && (
        <div className="space-y-6">
          <div className="glass-panel-silver rounded-2xl p-6 border border-purple-500/30 space-y-2">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Mastering Profile A/B Audio Comparison
            </h2>
            <p className="text-xs text-zinc-300">
              Listen to how each specialized DSP curve alters dynamic range, transient punch, and high-frequency shimmer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: 'punchy-rap',
                name: 'Punchy Rap / 808 Heavy',
                desc: 'Heavy 90Hz low shelf boost, aggressive fast-attack limiter, tightened mids for trap kicks & 808s.',
                warmth: 75,
                subBass: 90,
                limiting: 85,
                air: 80,
                color: 'from-purple-900 to-fuchsia-950',
              },
              {
                id: 'warm-vinyl',
                name: 'Warm Tape Vinyl Saturation',
                desc: 'Thick 2nd-harmonic tube warmth, gentle limiting, rich room reverberation for lofi & vintage boom-bap.',
                warmth: 95,
                subBass: 75,
                limiting: 60,
                air: 65,
                color: 'from-amber-950 to-purple-950',
              },
              {
                id: 'edm-maximizer',
                name: 'EDM Club Maximizer',
                desc: 'Ultra-wide stereo imager, -8 LUFS ceiling, bright highs for festival synthesizers and four-on-the-floor.',
                warmth: 60,
                subBass: 80,
                limiting: 95,
                air: 90,
                color: 'from-blue-950 to-purple-950',
              },
              {
                id: 'crystal-pop',
                name: 'Crystal Pop Shimmer',
                desc: '8.5kHz high shelf shimmer, transparent limiting, pristine vocal consonants and crisp claps.',
                warmth: 50,
                subBass: 65,
                limiting: 75,
                air: 95,
                color: 'from-pink-950 to-purple-950',
              },
              {
                id: 'lofi-glow',
                name: 'Lofi Purple Glow',
                desc: 'Deep warm midrange saturation, lush acoustic depth, soft transient rounding for chill sessions.',
                warmth: 85,
                subBass: 80,
                limiting: 50,
                air: 55,
                color: 'from-indigo-950 to-purple-950',
              },
              {
                id: 'clean',
                name: 'Clean Transparent',
                desc: 'Minimal coloration, true-peak protection, perfectly flat neutral mastering profile.',
                warmth: 20,
                subBass: 30,
                limiting: 40,
                air: 40,
                color: 'from-zinc-900 to-purple-950',
              },
            ].map((prof) => {
              const isActive = settings.preset === prof.id;
              return (
                <div
                  key={prof.id}
                  className={`p-5 rounded-2xl border transition-all space-y-4 ${
                    isActive
                      ? 'bg-gradient-to-b from-purple-950/90 to-[#0c0419] border-purple-400 shadow-lg shadow-purple-950/60'
                      : 'bg-[#090312]/70 border-purple-900/40 hover:border-purple-700/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-white">{prof.name}</h3>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white text-[10px] font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-300">{prof.desc}</p>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400 pt-2 border-t border-purple-900/40">
                    <div>Warmth: {prof.warmth}%</div>
                    <div>808 Sub: {prof.subBass}%</div>
                    <div>Limiter: {prof.limiting}%</div>
                    <div>Air Clarity: {prof.air}%</div>
                  </div>

                  <button
                    onClick={() => {
                      handlePresetSelect(prof.id as MasteringSettings['preset']);
                      soundEngine.playPreviewRiff('hiphop');
                      setIsPlayingTestLoop(true);
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Audition Profile</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* BATCH EXPORT PROGRESS & RESULTS MODAL */}
      {/* ============================================================ */}
      {(isExporting || exportResults) && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e061c] border border-purple-500/50 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-purple-900/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  {exportResults ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <Activity className="w-6 h-6 text-purple-400 animate-spin" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {exportResults
                      ? 'Batch Mastering Complete!'
                      : 'Mastering & Encoding Batch Audio...'}
                  </h3>
                  <div className="text-xs text-zinc-400">
                    {exportResults
                      ? `${exportResults.results.length} tracks mastered at ${exportConfig.bitrate.toUpperCase()} (${exportConfig.format.toUpperCase()})`
                      : exportProgress?.statusMessage || 'Initializing Web Audio DSP...'}
                  </div>
                </div>
              </div>

              {exportResults && (
                <button
                  onClick={() => {
                    setExportResults(null);
                    setExportProgress(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-400 hover:text-white transition-all"
                >
                  Close
                </button>
              )}
            </div>

            {/* Progress Display (During export) */}
            {isExporting && exportProgress && (
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span className="text-purple-300">
                      Track {exportProgress.completedTracks + 1} of {exportProgress.totalTracks}:{' '}
                      {exportProgress.currentTrackTitle}
                    </span>
                    <span className="text-white">{exportProgress.percent}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-3 w-full bg-purple-950/80 rounded-full overflow-hidden border border-purple-800/40 p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-400 rounded-full transition-all duration-300"
                      style={{ width: `${exportProgress.percent}%` }}
                    />
                  </div>
                </div>

                {/* DSP Stages Checklist */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 font-mono bg-[#070210] p-3.5 rounded-xl border border-purple-950">
                  <div className="flex items-center gap-1.5 text-purple-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Analog Tube Warmth</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-purple-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>90Hz 808 Sub-Bass Shelf</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-purple-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>8.5kHz Air & Shimmer</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-purple-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Dynamic Ceiling Maximizer</span>
                  </div>
                </div>
              </div>
            )}

            {/* Completed Results List & Downloads */}
            {exportResults && (
              <div className="space-y-4">
                {/* ZIP Package Card */}
                {exportResults.zipDownloadUrl && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/90 via-fuchsia-950/60 to-purple-950/90 border border-purple-400/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
                        <FolderArchive className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-white">
                          Download Complete Mastered Album (.ZIP)
                        </div>
                        <div className="text-xs text-purple-200">
                          Includes all {exportResults.results.length} mastered audio files & mastering report.
                        </div>
                      </div>
                    </div>

                    <button
                      id="download-all-zip-btn"
                      onClick={handleDownloadZip}
                      className="px-5 py-2.5 rounded-xl bg-white text-purple-950 font-black text-xs hover:bg-purple-100 transition-all flex items-center gap-2 shadow-lg w-full sm:w-auto justify-center"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download .ZIP ({formatBytes(exportResults.zipBlob?.size || 0)})</span>
                    </button>
                  </div>
                )}

                {/* Individual Tracks Mastered List */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Individual Mastered Tracks ({exportResults.results.length}):
                  </div>

                  {exportResults.results.map((res, i) => (
                    <div
                      key={res.trackId}
                      className="p-3 rounded-xl bg-[#080212] border border-purple-900/40 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-purple-400 font-bold">#{i + 1}</span>
                        <div className="min-w-0">
                          <div className="font-extrabold text-white truncate max-w-xs sm:max-w-md">
                            {res.fileName}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            {res.format} • {res.bitrate} • {res.durationFormatted} • {res.fileSizeFormatted}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <audio src={res.downloadUrl} controls className="h-7 w-28 sm:w-36" />
                        <button
                          onClick={() => handleDownloadSingleTrack(res)}
                          className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/60 border border-purple-400/40 text-purple-200 text-xs font-bold flex items-center gap-1 transition-all"
                          title="Download individual mastered file"
                        >
                          <Download className="w-3 h-3" />
                          <span className="hidden sm:inline">Save</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rewards earned notification */}
                <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-700/40 flex items-center justify-between text-xs font-mono text-purple-300">
                  <span>Producer Rewards Claimed:</span>
                  <span className="font-extrabold text-emerald-400">+$50 MCD • +100 XP</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
