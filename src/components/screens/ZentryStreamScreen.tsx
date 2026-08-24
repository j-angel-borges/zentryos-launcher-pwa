import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Heart, 
  Music, 
  ArrowLeft, 
  Volume2, 
  Sparkles,
  Gamepad2,
  Smile
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';
import { YTMUSIC_TRACKS, UniversalMediaItem } from '../../services/entertainmentData';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryStreamScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [selectedCategory, setSelectedCategory] = useState<'Todos' | 'Música de Juegos' | 'Música de Niños'>('Todos');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [likedTracks, setLikedTracks] = useState<Record<string, boolean>>({});

  const filteredTracks = YTMUSIC_TRACKS.filter((t) => {
    if (selectedCategory === 'Todos') return true;
    return t.category === selectedCategory;
  });

  const currentTrack: UniversalMediaItem = filteredTracks[currentTrackIndex] || filteredTracks[0] || YTMUSIC_TRACKS[0];

  const handleSelectTrack = (idx: number) => {
    sounds.playTap();
    setCurrentTrackIndex(idx);
    setIsPlaying(true);
    voiceService.speakFeedback(filteredTracks[idx].title);
  };

  const handleTogglePlay = () => {
    sounds.playTap();
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentTrackIndex < filteredTracks.length - 1) {
      sounds.playTap();
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentTrackIndex > 0) {
      sounds.playTap();
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-2 sm:p-4 md:p-6 overflow-hidden z-10 select-none relative">
      {/* Outer Main Container */}
      <div className={(isDark ? 'bg-[#030303] text-white ' : 'bg-[#18181b] text-white ') + 'flex-1 rounded-[32px] sm:rounded-[40px] p-3 sm:p-5 md:p-6 flex flex-col space-y-3 overflow-hidden shadow-2xl border border-white/10 relative'}>
        
        {/* Top Header */}
        <div className="flex items-center justify-between z-20 pb-1 shrink-0">
          <button
            onClick={() => {
              sounds.playTap();
              onBack();
            }}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all zentry-press cursor-pointer shadow-sm border border-white/10"
            title="Volver"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* YouTube Music Red/Black Badge */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/90 text-white shadow-lg border border-red-400/40">
            <Music className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="font-black text-sm tracking-tight">YouTube Music</span>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              voiceService.speakFeedback('¡Toca para escuchar música tranquila y de juegos!');
            }}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-red-500 to-purple-600 flex items-center justify-center text-white shadow-md border border-purple-300/40 zentry-press cursor-pointer"
            title="Escuchar"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 shrink-0">
          <button
            onClick={() => {
              sounds.playTap();
              setSelectedCategory('Todos');
              setCurrentTrackIndex(0);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${
              selectedCategory === 'Todos' ? 'bg-red-600 text-white shadow' : 'bg-white/10 text-slate-300'
            }`}
          >
            ✨ Todo (50)
          </button>
          <button
            onClick={() => {
              sounds.playTap();
              setSelectedCategory('Música de Juegos');
              setCurrentTrackIndex(0);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${
              selectedCategory === 'Música de Juegos' ? 'bg-red-600 text-white shadow' : 'bg-white/10 text-slate-300'
            }`}
          >
            🎮 Juegos (25)
          </button>
          <button
            onClick={() => {
              sounds.playTap();
              setSelectedCategory('Música de Niños');
              setCurrentTrackIndex(0);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${
              selectedCategory === 'Música de Niños' ? 'bg-red-600 text-white shadow' : 'bg-white/10 text-slate-300'
            }`}
          >
            👶 Canciones (25)
          </button>
        </div>

        {/* Player Stage & Turntable */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Left: Vinyl Turntable & Current Track Player */}
          <div className="flex flex-col items-center justify-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/10 h-full max-h-[400px]">
            {/* Spinning Vinyl Album Art */}
            <div className={`relative w-44 h-44 sm:w-52 sm:h-52 rounded-full p-2.5 bg-gradient-to-tr from-black via-zinc-900 to-black border-4 border-zinc-700 shadow-2xl flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }}>
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/40 shadow-inner">
                <img
                  src={currentTrack.creatorAvatar}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute w-6 h-6 rounded-full bg-black border-2 border-zinc-600 center" />
            </div>

            {/* Track Info */}
            <div className="text-center max-w-xs">
              <h3 className="text-sm font-black text-white truncate">{currentTrack.title}</h3>
              <p className="text-xs text-slate-400 font-bold truncate mt-0.5">{currentTrack.creator}</p>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrev}
                disabled={currentTrackIndex === 0}
                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 disabled:opacity-30 cursor-pointer"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={handleTogglePlay}
                className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
              </button>

              <button
                onClick={handleNext}
                disabled={currentTrackIndex === filteredTracks.length - 1}
                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 disabled:opacity-30 cursor-pointer"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right: Playlist Queue */}
          <div className="flex-1 h-full max-h-[400px] overflow-y-auto space-y-2 pr-1">
            {filteredTracks.map((track, idx) => {
              const isSelected = idx === currentTrackIndex;
              return (
                <div
                  key={track.id}
                  onClick={() => handleSelectTrack(idx)}
                  className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-red-600/30 border-red-500/50 shadow-md'
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <img
                    src={track.creatorAvatar}
                    alt={track.creator}
                    className="w-10 h-10 rounded-xl object-cover border border-white/20"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-white truncate">{track.title}</h4>
                    <span className="text-[10px] text-slate-400 font-bold">{track.creator}</span>
                  </div>
                  {isSelected && (
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
