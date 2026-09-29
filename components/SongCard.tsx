"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  MoreHorizontal, 
  Play, 
  Pause, 
  Check, 
  Plus, 
  Download,
  Trash2,
  FolderPlus
} from 'lucide-react';
import { Song, Playlist } from '@/types';
import { useMusicStore } from '@/lib/store/useMusicStore';
import { 
  addSongToPlaylist as addSongToPlaylistApi, 
  removeSongFromPlaylist as removeSongFromPlaylistApi, 
  getPlaylists, 
  createPlaylist, 
  getDownloadUrl, 
  safeMediaUrl 
} from '@/services/musicApi';

export default function SongCard({ 
  song, 
  playlistMode = false, 
  playlistId 
}: { 
  song: Song; 
  playlistMode?: boolean; 
  playlistId?: string; 
}) {
  const { 
    currentSong, 
    isPlaying, 
    togglePlay, 
    setCurrentSong, 
    startPlayback, 
    playlists, 
    setPlaylists, 
    removeSongFromPlaylist 
  } = useMusicStore();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
        setIsCreatingNew(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    if (isCreatingNew && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreatingNew]);

  const isCurrentSong = currentSong?.id === song.id;
  const isCurrentlyPlaying = isCurrentSong && isPlaying;

  const handlePlayPause = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isCurrentSong) {
      togglePlay();
    } else {
      setCurrentSong(song);
      startPlayback();
    }
  };

  const handleToggleSongInPlaylist = async (targetPlaylist: Playlist) => {
    const isAlreadyIn = (targetPlaylist.songIds || []).includes(song.id);

    try {
      if (isAlreadyIn) {
        await removeSongFromPlaylistApi(targetPlaylist.id, song.id);
        removeSongFromPlaylist(targetPlaylist.id, song.id);
        const updated = await getPlaylists();
        setPlaylists(updated);
        setFeedback(`Removed from ${targetPlaylist.name}`);
      } else {
        await addSongToPlaylistApi(targetPlaylist.id, song.id);
        const updated = await getPlaylists();
        setPlaylists(updated);
        setFeedback(`Added to ${targetPlaylist.name}`);
      }
      setTimeout(() => setFeedback(null), 1500);
    } catch (err) {
      console.error('Failed to toggle song in playlist:', err);
    }
  };

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newPlaylistName.trim();
    if (!name) return;

    try {
      const newPlaylist = await createPlaylist(name, song.coverImageUrl);
      await addSongToPlaylistApi(newPlaylist.id, song.id);
      const updated = await getPlaylists();
      setPlaylists(updated);
      setNewPlaylistName('');
      setIsCreatingNew(false);
      setFeedback(`Added to ${name}`);
      setTimeout(() => setFeedback(null), 1500);
    } catch (err) {
      console.error('Failed to create playlist and add song:', err);
    }
  };

  const handleRemoveFromCurrent = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playlistId) return;
    try {
      await removeSongFromPlaylistApi(playlistId, song.id);
      removeSongFromPlaylist(playlistId, song.id);
      const updated = await getPlaylists();
      setPlaylists(updated);
    } catch (err) {
      console.error('Failed to remove from playlist:', err);
    }
  };

  const coverSrc = safeMediaUrl(song.coverImageUrl);

  return (
    <article className='group relative rounded-2xl border border-stone-200/90 bg-white p-2.5 hover:border-stone-300 hover:shadow-xl transition-all duration-200 shadow-xs rounded-2xl flex flex-col justify-between group'>
      
      {/* Album Artwork */}
      <div 
        onClick={handlePlayPause}
        className={`relative aspect-square w-full overflow-hidden rounded-xl bg-stone-100 cursor-pointer group/cover transition duration-300 ${
          isCurrentlyPlaying ? 'ring-2 ring-stone-900 shadow-md' : ''
        }`}
      >
        <Image 
          src={coverSrc} 
          alt={song.title} 
          fill 
          className='object-cover group-hover/cover:scale-105 transition duration-300' 
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />

        {/* Live Playing Badge */}
        {isCurrentlyPlaying && (
          <div className='absolute top-2 left-2 flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-md px-2 py-1 border border-stone-300 shadow-sm'>
            <span className='h-2 w-0.5 bg-stone-900 rounded-full animate-pulse' />
            <span className='h-3 w-0.5 bg-stone-900 rounded-full animate-pulse delay-75' />
            <span className='h-1.5 w-0.5 bg-stone-900 rounded-full animate-pulse delay-150' />
            <span className='text-[9px] font-extrabold text-stone-900 ml-0.5 tracking-wider'>PLAYING</span>
          </div>
        )}

        {/* Play / Pause Overlay Button */}
        <button 
          type='button'
          onClick={handlePlayPause} 
          style={{ backgroundColor: '#b8ff70', color: '#000000' }}
          className={`absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-white transition-all duration-200 active:scale-95 cursor-pointer shadow-xl hover:bg-black hover:scale-105 ${
            isCurrentlyPlaying
              ? 'opacity-100 ring-2 ring-white scale-100'
              : 'opacity-90 sm:opacity-0 sm:group-hover/cover:opacity-100'
          }`}
          title={isCurrentlyPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
        >
          {isCurrentlyPlaying ? (
            <Pause size={18} className='fill-white stroke-[2.5]' />
          ) : (
            <Play size={18} className='fill-white stroke-[2.5] ml-0.5' />
          )}
        </button>
      </div>

      {/* Info & Menu */}
      <div className='mt-2.5 flex items-start justify-between gap-1.5'>
        <div className='min-w-0 flex-1' onClick={handlePlayPause} role='button'>
          <h3 className='truncate text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-amber-800 transition-colors'>
            {song.title}
          </h3>
          <p className='truncate text-[11px] text-stone-500 mt-0.5'>
            {song.artist}
          </p>
        </div>

        {/* Three-dot Context Dropdown (No full-screen modal!) */}
        <div className='relative shrink-0' ref={dropdownRef}>
          {playlistMode ? (
            <button 
              onClick={handleRemoveFromCurrent}
              className='rounded-full p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors'
              title="Remove from playlist"
            >
              <Trash2 size={14} />
            </button>
          ) : (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(!dropdownOpen);
                setIsCreatingNew(false);
              }} 
              className='rounded-full p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer'
              title="Add to playlist"
            >
              <MoreHorizontal size={15} />
            </button>
          )}

          {/* Clean Inline Dropdown Menu */}
          {dropdownOpen && (
            <div 
              className='absolute right-0 top-full mt-1.5 z-40 w-48 rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl rounded-xl animate-in fade-in zoom-in-95 duration-100'
              onClick={(e) => e.stopPropagation()}
            >
              {feedback ? (
                <div className='px-2.5 py-2 text-[11px] font-semibold text-stone-900 text-center font-semibold'>
                  {feedback}
                </div>
              ) : (
                <>
                  <div className='px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 mb-1'>
                    Add to Playlist
                  </div>

                  {/* Playlists list */}
                  <div className='max-h-36 overflow-y-auto space-y-0.5'>
                    {playlists.length === 0 ? (
                      <div className='px-2.5 py-1.5 text-xs text-slate-500'>No playlists yet</div>
                    ) : (
                      playlists.map((p) => {
                        const inPlaylist = (p.songIds || []).includes(song.id);
                        return (
                          <button
                            key={p.id}
                            onClick={() => handleToggleSongInPlaylist(p)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition ${
                              inPlaylist 
                                ? 'bg-stone-100 text-stone-900 font-semibold' 
                                : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                            }`}
                          >
                            <span className='truncate'>{p.name}</span>
                            {inPlaylist ? (
                              <Check size={13} className='text-stone-900 shrink-0 ml-1.5' />
                            ) : (
                              <Plus size={13} className='text-slate-500 shrink-0 ml-1.5' />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Create New Playlist Inline Form */}
                  <div className='mt-1 pt-1 border-t border-stone-100'>
                    {!isCreatingNew ? (
                      <button
                        onClick={() => setIsCreatingNew(true)}
                        className='w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-stone-800 hover:bg-stone-50 font-medium transition'
                      >
                        <FolderPlus size={13} />
                        <span>New Playlist</span>
                      </button>
                    ) : (
                      <form onSubmit={handleCreateAndAdd} className='p-1 space-y-1.5'>
                        <input
                          ref={inputRef}
                          type='text'
                          value={newPlaylistName}
                          onChange={(e) => setNewPlaylistName(e.target.value)}
                          placeholder='Playlist name...'
                          className='w-full rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-xs text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-400 focus:bg-white'
                        />
                        <div className='flex items-center justify-end gap-1'>
                          <button
                            type='button'
                            onClick={() => setIsCreatingNew(false)}
                            className='px-2 py-0.5 rounded text-[10px] text-stone-500 hover:text-stone-900'
                          >
                            Cancel
                          </button>
                          <button
                            type='submit'
                            className='px-2 py-0.5 rounded bg-stone-900 text-white font-semibold text-[10px] hover:bg-black'
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Direct download option */}
                  <a
                    href={getDownloadUrl(song.id)}
                    download
                    className='w-full flex items-center gap-1.5 px-2.5 py-1.5 mt-0.5 rounded-lg text-xs text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition'
                  >
                    <Download size={13} />
                    <span>Download</span>
                  </a>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Album & Duration Footer */}
      <div className='mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400'>
        <span className='truncate max-w-[100px] text-[10px]'>{song.genre || song.album}</span>
        <span className='font-mono text-[10px]'>
          {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
        </span>
      </div>
    </article>
  );
}
