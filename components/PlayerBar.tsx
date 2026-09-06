"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { 
  Heart, 
  ListMusic, 
  Pause, 
  Play, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Download,
  RotateCcw,
  RotateCw
} from 'lucide-react';
import { useMusicStore } from '@/lib/store/useMusicStore';
import { 
  addSongToPlaylist as addSongToPlaylistApi, 
  removeSongFromPlaylist as removeSongFromPlaylistApi, 
  getDownloadUrl, 
  getPlaylists, 
  safeMediaUrl 
} from '@/services/musicApi';
import { Song, Playlist } from '@/types';

export default function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    volume,
    progress,
    togglePlay,
    setVolume,
    setCurrentSong,
    seek,
    playlists,
    setPlaylists,
    addSongToPlaylist,
    removeSongFromPlaylist,
    queue,
    recentlyPlayed
  } = useMusicStore();

  const [actualDuration, setActualDuration] = useState<number>(180);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const song = currentSong;

  const duration = Math.max(actualDuration, song?.duration || 180);
  const progressPosition = duration > 0 ? Math.min(100, Math.max(0, (progress / duration) * 100)) : 0;

  const favoritesPlaylist = playlists.find((p: Playlist) => 
    p.name.toLowerCase() === 'favorites' || 
    p.id === 'playlist-favorites' || 
    p.id.startsWith('fav-')
  );
  const isLiked = song ? (favoritesPlaylist?.songIds.includes(song.id) ?? false) : false;

  const toggleLike = async () => {
    if (!song) return;
    let targetFav = favoritesPlaylist;
    if (!targetFav) {
      const loaded = await getPlaylists();
      setPlaylists(loaded);
      targetFav = loaded.find((p: Playlist) => p.name.toLowerCase() === 'favorites' || p.id === 'playlist-favorites' || p.id.startsWith('fav-'));
    }
    if (!targetFav) return;

    if (isLiked) {
      await removeSongFromPlaylistApi(targetFav.id, song.id);
      removeSongFromPlaylist(targetFav.id, song.id);
    } else {
      await addSongToPlaylistApi(targetFav.id, song.id);
      addSongToPlaylist(targetFav.id, song.id);
    }
    const updated = await getPlaylists();
    setPlaylists(updated);
  };

  const audioSrc = song ? safeMediaUrl(song.audioUrl, '') : '';
  const coverSrc = song ? safeMediaUrl(song.coverImageUrl) : '';

  // Synchronize audio volume
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = Math.max(0, Math.min(1, volume / 100));
  }, [volume]);

  // Synchronize Play / Pause state
  useEffect(() => {
    if (!audioRef.current || !song) return;

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio playback waiting for interaction / format:', err);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, song?.id, audioSrc]);

  // Next Track
  const nextSong = useCallback(() => {
    if (!song) return;
    const list = queue.length > 0 ? queue : (recentlyPlayed.length > 0 ? recentlyPlayed : [song]);
    const index = list.findIndex((item) => item.id === song.id);
    const nextIndex = index >= 0 ? (index + 1) % list.length : 0;
    setCurrentSong(list[nextIndex]);
    seek(0);
  }, [song, queue, recentlyPlayed, setCurrentSong, seek]);

  // Previous Track
  const previousSong = useCallback(() => {
    if (!song) return;
    const list = queue.length > 0 ? queue : (recentlyPlayed.length > 0 ? recentlyPlayed : [song]);
    const index = list.findIndex((item) => item.id === song.id);
    const prevIndex = index > 0 ? index - 1 : list.length - 1;
    setCurrentSong(list[prevIndex]);
    seek(0);
  }, [song, queue, recentlyPlayed, setCurrentSong, seek]);

  // Forward 10 seconds in current song
  const skipForward = () => {
    if (!audioRef.current) return;
    const target = Math.min(duration, audioRef.current.currentTime + 10);
    audioRef.current.currentTime = target;
    seek(target);
  };

  // Backward 10 seconds in current song
  const skipBackward = () => {
    if (!audioRef.current) return;
    const target = Math.max(0, audioRef.current.currentTime - 10);
    audioRef.current.currentTime = target;
    seek(target);
  };

  // Seek bar scrubber
  const handleSeek = (newTime: number) => {
    seek(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  if (!song) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#11151b]/95 backdrop-blur-xl md:bottom-6 md:left-1/2 md:right-auto md:w-[calc(100%-48px)] md:max-w-[1400px] md:-translate-x-1/2 md:rounded-3xl md:border md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.06)] transition-all duration-300">
      
      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
        onTimeUpdate={(e) => {
          seek(e.currentTarget.currentTime);
        }}
        onLoadedMetadata={(e) => {
          if (e.currentTarget.duration && !isNaN(e.currentTarget.duration)) {
            setActualDuration(Math.round(e.currentTarget.duration));
          }
        }}
        onEnded={nextSong}
      />

      <div className="mx-auto flex items-center justify-between gap-4 px-5 py-4 md:py-3.5">

        {/* Song Info */}
        <div className="flex w-[240px] items-center gap-3">
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-lg group">
            <Image
              src={coverSrc}
              alt={song.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold tracking-wide text-white hover:text-lime-300 transition-colors cursor-pointer">{song.title}</div>
            <div className="truncate text-xs text-soft mt-0.5">{song.artist}</div>
          </div>
          <button
            onClick={toggleLike}
            className={`flex-shrink-0 ml-2 rounded-full p-2 transition-all duration-300 hover:bg-white/5 ${
              isLiked ? 'text-rose-500 hover:text-rose-400' : 'text-soft hover:text-lime-300'
            }`}
            title={isLiked ? 'Remove from Favorites' : 'Add to Favorites'}
          >
            <Heart
              size={18}
              fill={isLiked ? 'currentColor' : 'none'}
              className={`transition-transform duration-300 ${isLiked ? 'scale-110 active:scale-95' : 'active:scale-95'}`}
            />
          </button>
        </div>

        {/* Central Playback & Navigation Controls */}
        <div className="flex flex-1 flex-col items-center max-w-[620px]">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Previous Track */}
            <button
              onClick={previousSong}
              className="text-soft hover:text-white transition-colors duration-200 active:scale-90"
              title="Previous Track"
            >
              <SkipBack size={20} fill="currentColor" className="opacity-80 hover:opacity-100" />
            </button>

            {/* Rewind 10 Seconds */}
            <button
              onClick={skipBackward}
              className="text-soft hover:text-lime-300 transition-colors duration-200 active:scale-90 relative group p-1"
              title="Rewind 10s"
            >
              <RotateCcw size={18} />
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-bold text-soft group-hover:text-lime-300 opacity-0 group-hover:opacity-100 transition-opacity">10s</span>
            </button>

            {/* Play / Pause Toggle Button */}
            <button
              onClick={togglePlay}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#b8ff70] text-slate-950 shadow-[0_0_15px_rgba(184,255,112,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(184,255,112,0.65)] active:scale-95 cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={20} className="fill-slate-950 stroke-[2.5]" />
              ) : (
                <Play size={20} className="fill-slate-950 stroke-[2.5] ml-0.5" />
              )}
            </button>

            {/* Forward 10 Seconds */}
            <button
              onClick={skipForward}
              className="text-soft hover:text-lime-300 transition-colors duration-200 active:scale-90 relative group p-1"
              title="Forward 10s"
            >
              <RotateCw size={18} />
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-bold text-soft group-hover:text-lime-300 opacity-0 group-hover:opacity-100 transition-opacity">10s</span>
            </button>

            {/* Next Track */}
            <button
              onClick={nextSong}
              className="text-soft hover:text-white transition-colors duration-200 active:scale-90"
              title="Next Track"
            >
              <SkipForward size={20} fill="currentColor" className="opacity-80 hover:opacity-100" />
            </button>
          </div>

          {/* Scrubbable Progress Timeline */}
          <div className="mt-2.5 flex w-full items-center gap-3">
            <span className="w-10 text-right text-[11px] font-medium font-mono text-soft">
              {Math.floor(progress / 60)}:{String(Math.floor(progress % 60)).padStart(2, '0')}
            </span>
            <div className="slider-wrapper flex-1">
              <input
                type="range"
                min="0"
                max={duration}
                step="0.5"
                value={Math.min(progress, duration)}
                className="slider"
                style={{ '--progress': `${progressPosition}%` } as React.CSSProperties}
                onChange={(event) => handleSeek(Number(event.target.value))}
                title="Seek audio track"
              />
            </div>
            <span className="w-10 text-left text-[11px] font-medium font-mono text-soft">
              {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Volume & Queue Settings & Download */}
        <div className="hidden md:flex items-center gap-3 w-[240px] justify-end">
          <a
            href={getDownloadUrl(song.id)}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="text-soft hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-white/5"
            title="Download Audio"
          >
            <Download size={18} />
          </a>
          <button className="text-soft hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-white/5">
            <ListMusic size={18} />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVolume(volume === 0 ? 70 : 0)}
              className="text-soft hover:text-white transition-colors duration-200"
              title={volume === 0 ? 'Unmute' : 'Mute'}
            >
              {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <div className="slider-wrapper w-20">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                className="slider"
                style={{ '--progress': `${volume}%` } as React.CSSProperties}
                onChange={(event) => setVolume(Number(event.target.value))}
              />
            </div>
          </div>
        </div>

      </div>

      <style jsx>{`
        .slider-wrapper {
          display: flex;
          align-items: center;
          position: relative;
        }

        .slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.1);
          outline: none;
          cursor: pointer;
          transition: height 0.12s ease;
          background-image: linear-gradient(
            to right,
            #b8ff70 var(--progress, 0%),
            rgba(255, 255, 255, 0.1) var(--progress, 0%)
          );
        }

        .slider:hover {
          height: 6px;
        }

        .slider::-webkit-slider-runnable-track {
          background: transparent;
          border: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
          margin-top: -4px;
          opacity: 0;
          transition: opacity 0.12s ease, transform 0.1s ease;
        }

        .slider-wrapper:hover .slider::-webkit-slider-thumb {
          opacity: 1;
        }

        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
          border: none;
          opacity: 0;
          transition: opacity 0.12s ease, transform 0.1s ease;
        }

        .slider-wrapper:hover .slider::-moz-range-thumb {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
