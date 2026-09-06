"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  MoreHorizontal, 
  Play, 
  Pause,
  Plus, 
  X, 
  Download, 
  Check, 
  FolderPlus, 
  ListMusic, 
  Music, 
  Sparkles, 
  Trash2, 
  Search,
  Heart
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

function PlaylistThumbnail({ playlist }: { playlist: Playlist }) {
  const isFavorites = playlist.id === 'playlist-favorites' || playlist.name.toLowerCase() === 'favorites' || playlist.id.startsWith('fav-');

  if (isFavorites) {
    return (
      <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white shadow-sm'>
        <Heart size={16} className='fill-white text-white' />
      </div>
    );
  }

  return (
    <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1e2638] to-[#121622] text-lime-300 shadow-sm'>
      <Music size={16} />
    </div>
  );
}

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

  const [modalOpen, setModalOpen] = useState(false);
  const [playlistSearch, setPlaylistSearch] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when expanding "Create New Playlist"
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

  // Toggle selection: 1 click to Add, 1 click to Deselect/Remove
  const handleToggleSongInPlaylist = async (targetPlaylist: Playlist) => {
    const isAlreadyIn = targetPlaylist.songIds.includes(song.id);

    try {
      if (isAlreadyIn) {
        // Deselect / Remove
        await removeSongFromPlaylistApi(targetPlaylist.id, song.id);
        removeSongFromPlaylist(targetPlaylist.id, song.id);
        const updated = await getPlaylists();
        setPlaylists(updated);
        setFeedback(`Removed from "${targetPlaylist.name}"`);
        setTimeout(() => setFeedback(null), 1800);
      } else {
        // Select / Add
        await addSongToPlaylistApi(targetPlaylist.id, song.id);
        const updated = await getPlaylists();
        setPlaylists(updated);
        setFeedback(`✓ Added to "${targetPlaylist.name}"!`);
        setTimeout(() => setFeedback(null), 1800);
      }
    } catch (err) {
      console.error('Failed to toggle song in playlist:', err);
    }
  };

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newPlaylistName.trim();
    if (!name) return;

    try {
      setCreating(true);
      const newPlaylist = await createPlaylist(name, song.coverImageUrl);
      await addSongToPlaylistApi(newPlaylist.id, song.id);
      const updated = await getPlaylists();
      setPlaylists(updated);
      setNewPlaylistName('');
      setIsCreatingNew(false);
      setFeedback(`✓ Created & added to "${name}"!`);
      setTimeout(() => {
        setFeedback(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to create playlist and add song:', err);
    } finally {
      setCreating(false);
    }
  };

  const coverSrc = safeMediaUrl(song.coverImageUrl);

  const filteredPlaylists = playlists.filter((p) => 
    p.name.toLowerCase().includes(playlistSearch.trim().toLowerCase())
  );

  return (
    <>
      <article className='group relative rounded-3xl border border-white/10 bg-[#141b22] p-3 hover:bg-[#171d25] transition duration-300 shadow-lg shadow-black/40'>
        {/* Album Artwork Container */}
        <div 
          onClick={handlePlayPause}
          className={`relative aspect-square overflow-hidden rounded-2xl bg-[#07090d] cursor-pointer group/cover transition-all duration-300 ${
            isCurrentlyPlaying ? 'ring-2 ring-lime-400 shadow-[0_0_25px_rgba(184,255,112,0.3)]' : ''
          }`}
        >
          <Image 
            src={coverSrc} 
            alt={song.title} 
            fill 
            className='object-cover group-hover:scale-105 transition duration-500' 
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent' />

          {/* Live Playing Soundwave Badge */}
          {isCurrentlyPlaying && (
            <div className='absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/85 backdrop-blur-md px-3 py-1.5 border border-lime-300/60 shadow-lg animate-in fade-in'>
              <span className='h-2.5 w-1 bg-[#b8ff70] rounded-full animate-pulse' />
              <span className='h-4 w-1 bg-[#b8ff70] rounded-full animate-pulse delay-75' />
              <span className='h-2 w-1 bg-[#b8ff70] rounded-full animate-pulse delay-150' />
              <span className='text-[10px] font-extrabold text-[#b8ff70] tracking-wider ml-1'>PLAYING</span>
            </div>
          )}

          {/* Ultra-Visible Guaranteed Play / Pause Action Button */}
          <button 
            type='button'
            onClick={handlePlayPause} 
            style={{ backgroundColor: '#b8ff70', color: '#000000' }}
            className={`absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 active:scale-90 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.8)] hover:scale-110 ${
              isCurrentlyPlaying
                ? 'ring-2 ring-white scale-105 shadow-[0_0_25px_rgba(184,255,112,0.7)]'
                : 'shadow-[0_0_20px_rgba(184,255,112,0.5)]'
            }`}
            title={isCurrentlyPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
          >
            {isCurrentlyPlaying ? (
              <Pause size={22} className='fill-black stroke-[2.5]' style={{ color: '#000000' }} />
            ) : (
              <Play size={22} className='fill-black stroke-[2.5] ml-1' style={{ color: '#000000' }} />
            )}
          </button>
        </div>

        {/* Info & Menu Button */}
        <div className='mt-4 flex items-start justify-between gap-3'>
          <div className='min-w-0 flex-1'>
            <h3 className='truncate text-base font-semibold text-white group-hover:text-lime-300 transition-colors'>{song.title}</h3>
            <div className='mt-1 flex items-center gap-2 text-xs text-soft'>
              <span className='truncate'>{song.artist}</span>
              <span className='text-white/30'>•</span>
              <span className='truncate'>{song.genre}</span>
            </div>
          </div>

          <button 
            onClick={() => {
              setModalOpen(true);
              setIsCreatingNew(false);
              setPlaylistSearch('');
              setFeedback(null);
            }} 
            className='rounded-full border border-white/10 p-2 text-soft hover:border-white/20 hover:bg-white/10 hover:text-white transition-colors'
            title="Add to playlist / options"
          >
            <MoreHorizontal size={16}/>
          </button>
        </div>

        <div className='mt-4 flex items-center justify-between text-xs text-soft'>
          <span className='truncate max-w-[140px]'>{song.album}</span>
          <span className='font-mono'>{Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}</span>
        </div>
      </article>

      {/* Full-Featured Centered Modal: Add / Remove from Playlist */}
      {modalOpen && (
        <div 
          className='fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200'
          onClick={() => setModalOpen(false)}
        >
          <div 
            className='relative w-full max-w-lg rounded-3xl border border-white/15 bg-[#141822] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.12)] animate-in zoom-in-95 duration-200'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header: Song Context */}
            <div className='flex items-center justify-between border-b border-white/10 pb-4'>
              <div className='flex items-center gap-3.5 min-w-0'>
                <div className='relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-md'>
                  <Image src={coverSrc} alt={song.title} fill className='object-cover' />
                </div>
                <div className='min-w-0'>
                  <div className='text-xs uppercase tracking-widest text-lime-300 font-bold'>Manage Playlists</div>
                  <h2 className='truncate text-lg font-bold text-white'>{song.title}</h2>
                  <p className='truncate text-xs text-soft'>{song.artist}</p>
                </div>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className='rounded-full border border-white/10 p-2 text-soft hover:bg-white/10 hover:text-white transition'
              >
                <X size={18} />
              </button>
            </div>

            {/* Feedback Notification Banner */}
            {feedback && (
              <div className='mt-4 flex items-center gap-2.5 rounded-2xl bg-lime-400/20 border border-lime-400/40 px-4 py-2.5 text-xs font-bold text-lime-200 animate-in fade-in'>
                <Sparkles size={16} className='text-lime-300 flex-shrink-0' />
                <span>{feedback}</span>
              </div>
            )}

            {/* Action 1: Create New Playlist Row */}
            <div className='mt-5'>
              {!isCreatingNew ? (
                <button
                  onClick={() => setIsCreatingNew(true)}
                  className='flex w-full items-center justify-between rounded-2xl border border-dashed border-lime-300/40 bg-lime-300/10 px-4 py-3 text-left text-sm font-semibold text-lime-300 hover:bg-lime-300/20 hover:border-lime-300/70 transition-all active:scale-[0.99]'
                >
                  <div className='flex items-center gap-3'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-lime-300 text-black shadow-sm'>
                      <Plus size={18} />
                    </div>
                    <span>Create New Playlist</span>
                  </div>
                  <span className='text-xs text-lime-300/70'>+ New</span>
                </button>
              ) : (
                <form onSubmit={handleCreateAndAdd} className='space-y-3 rounded-2xl border border-lime-300/40 bg-[#1c2230] p-4 animate-in fade-in'>
                  <div className='text-xs font-semibold text-lime-300 uppercase tracking-wider'>New Playlist Name</div>
                  <input
                    ref={inputRef}
                    type='text'
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder='e.g. Late Night Vibes, Workout...'
                    className='w-full rounded-xl border border-white/15 bg-[#121620] px-4 py-2.5 text-sm text-white placeholder-slate-400 outline-none focus:border-lime-300 focus:ring-1 focus:ring-lime-300'
                  />
                  <div className='flex items-center justify-end gap-2.5 pt-1'>
                    <button
                      type='button'
                      onClick={() => {
                        setIsCreatingNew(false);
                        setNewPlaylistName('');
                      }}
                      className='rounded-xl border border-white/10 px-4 py-1.5 text-xs font-medium text-soft hover:bg-white/10 hover:text-white transition'
                    >
                      Cancel
                    </button>
                    <button
                      type='submit'
                      disabled={!newPlaylistName.trim() || creating}
                      className='rounded-xl bg-lime-300 px-4 py-1.5 text-xs font-bold text-black hover:bg-lime-200 transition disabled:opacity-50'
                    >
                      {creating ? 'Creating...' : 'Create & Add Track'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Action 2: Existing Playlists Section */}
            <div className='mt-5 space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-xs font-bold uppercase tracking-wider text-slate-300'>
                  Your Playlists ({playlists.length})
                </span>
                {playlists.length > 4 && (
                  <div className='relative w-44'>
                    <Search size={13} className='absolute left-3 top-1/2 -translate-y-1/2 text-soft' />
                    <input
                      type='text'
                      value={playlistSearch}
                      onChange={(e) => setPlaylistSearch(e.target.value)}
                      placeholder='Filter...'
                      className='w-full rounded-full border border-white/10 bg-[#1a202c] pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 outline-none focus:border-lime-300/60'
                    />
                  </div>
                )}
              </div>

              {/* Scrollable List of Existing Playlists */}
              <div className='max-h-56 space-y-2 overflow-y-auto pr-1'>
                {filteredPlaylists.length === 0 ? (
                  <div className='rounded-2xl border border-dashed border-white/10 py-8 text-center text-xs text-soft'>
                    {playlistSearch ? 'No matching playlists found.' : 'No playlists yet. Create one above!'}
                  </div>
                ) : (
                  filteredPlaylists.map((playlist) => {
                    const isAlreadyAdded = playlist.songIds.includes(song.id);
                    return (
                      <button
                        key={playlist.id}
                        onClick={() => handleToggleSongInPlaylist(playlist)}
                        className={`group/item flex w-full items-center justify-between gap-3 rounded-2xl border p-2.5 text-left transition-all ${
                          isAlreadyAdded
                            ? 'border-lime-400/40 bg-lime-400/10 text-white hover:border-rose-500/40 hover:bg-rose-500/10'
                            : 'border-white/10 bg-[#181e28] text-white hover:border-lime-300/40 hover:bg-[#1f2633]'
                        }`}
                        title={isAlreadyAdded ? `Click to remove from ${playlist.name}` : `Click to add to ${playlist.name}`}
                      >
                        <div className='flex items-center gap-3 min-w-0'>
                          <div className='relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl bg-slate-800 border border-white/10 shadow-sm'>
                            <PlaylistThumbnail playlist={playlist} />
                          </div>
                          <div className='min-w-0'>
                            <div className='truncate text-sm font-semibold group-hover/item:text-lime-300 transition-colors'>{playlist.name}</div>
                            <div className='text-xs text-soft'>{playlist.songIds.length} {playlist.songIds.length === 1 ? 'track' : 'tracks'}</div>
                          </div>
                        </div>

                        <div className='flex-shrink-0 pl-2'>
                          {isAlreadyAdded ? (
                            <span className='inline-flex items-center gap-1.5 rounded-full bg-lime-400/25 border border-lime-400/40 px-3 py-1 text-xs font-bold text-lime-300 shadow-sm group-hover/item:border-rose-400/50 group-hover/item:bg-rose-500/20 group-hover/item:text-rose-300 transition-all'>
                              <Check size={13} className='group-hover/item:hidden' />
                              <X size={13} className='hidden group-hover/item:inline' />
                              <span className='group-hover/item:hidden'>In Playlist</span>
                              <span className='hidden group-hover/item:inline'>Remove</span>
                            </span>
                          ) : (
                            <span className='inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300 group-hover/item:border-lime-300 group-hover/item:bg-lime-300 group-hover/item:text-black transition-all'>
                              <Plus size={13} /> Add
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom Actions: Download & Playlist Mode Options */}
            <div className='mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4'>
              <div className='flex items-center gap-2'>
                <a 
                  href={getDownloadUrl(song.id)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  download
                  className='inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition'
                >
                  <Download size={14} />
                  <span>Download MP3</span>
                </a>

                {playlistMode && playlistId && (
                  <button 
                    onClick={() => {
                      if (playlistId) removeSongFromPlaylist(playlistId, song.id);
                      setModalOpen(false);
                    }}
                    className='inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20 hover:text-white transition'
                  >
                    <Trash2 size={13} />
                    <span>Remove from playlist</span>
                  </button>
                )}
              </div>

              <button
                type='button'
                onClick={() => setModalOpen(false)}
                style={{ backgroundColor: '#b8ff70', color: '#000000' }}
                className='rounded-full px-6 py-2 text-xs font-black uppercase tracking-wider transition-all duration-200 hover:brightness-110 active:scale-95 shadow-[0_0_20px_rgba(184,255,112,0.4)] cursor-pointer'
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
