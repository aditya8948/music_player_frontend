"use client";

import { useState, useEffect } from 'react';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useMusicStore } from '@/lib/store/useMusicStore';
import { getSongs, getGenres } from '@/services/musicApi';
import { Song } from '@/types';

export default function AdvancedSearchPanel({ 
  onClose 
}: { 
  filters?: { genre?: string; artist?: string; album?: string }; 
  onClose: () => void 
}) {
  const { selectedGenre, selectedArtist, selectedAlbum, setFilters } = useMusicStore();
  const [genres, setGenres] = useState<string[]>([]);
  const [artists, setArtists] = useState<string[]>([]);
  const [albums, setAlbums] = useState<string[]>([]);

  useEffect(() => {
    // Fetch live distinct genres, artists, and albums present in the catalog
    Promise.all([getGenres(), getSongs()]).then(([loadedGenres, liveSongs]) => {
      if (Array.isArray(liveSongs) && liveSongs.length > 0) {
        const uniqueArtists = Array.from(new Set(liveSongs.map((s) => s.artist?.trim()).filter(Boolean))).sort();
        const uniqueAlbums = Array.from(new Set(liveSongs.map((s) => s.album?.trim()).filter(Boolean))).sort();
        const uniqueGenres = Array.from(
          new Set([...loadedGenres, ...liveSongs.map((s) => s.genre?.trim()).filter(Boolean)])
        ).sort();

        setArtists(uniqueArtists);
        setAlbums(uniqueAlbums);
        setGenres(uniqueGenres);
      } else if (loadedGenres.length > 0) {
        setGenres(loadedGenres.sort());
      }
    });
  }, []);

  return (
    <div className='fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200'>
      <div className='w-full max-w-xl rounded-3xl border border-white/15 bg-[#141822] p-6 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.1)] animate-in zoom-in-95 duration-200'>
        
        {/* Header */}
        <div className='mb-6 flex items-center justify-between border-b border-white/10 pb-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-300/10 border border-lime-300/30 text-lime-300 shadow-sm'>
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <p className='text-xs uppercase tracking-[0.2em] text-lime-300 font-semibold'>Advanced Search</p>
              <h2 className='text-lg font-bold text-white tracking-wide'>Filter Music Library</h2>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className='rounded-full border border-white/10 bg-white/5 p-2 text-soft hover:bg-white/10 hover:text-white transition'
          >
            <X size={16} />
          </button>
        </div>

        {/* Dropdowns for only existing options */}
        <div className='grid gap-4 sm:grid-cols-3'>
          <label className='space-y-1.5'>
            <span className='text-[11px] font-semibold uppercase tracking-wider text-soft'>Genre</span>
            <select 
              className='w-full rounded-xl border border-white/10 bg-[#181d28] px-3.5 py-2.5 text-xs text-white outline-none focus:border-lime-300/80 transition cursor-pointer'
              value={selectedGenre} 
              onChange={(event) => setFilters({ genre: event.target.value, artist: selectedArtist, album: selectedAlbum })}
            >
              <option value=''>All genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre} className='bg-[#141822] text-white'>
                  {genre}
                </option>
              ))}
            </select>
          </label>

          <label className='space-y-1.5'>
            <span className='text-[11px] font-semibold uppercase tracking-wider text-soft'>Artist</span>
            <select 
              className='w-full rounded-xl border border-white/10 bg-[#181d28] px-3.5 py-2.5 text-xs text-white outline-none focus:border-lime-300/80 transition cursor-pointer'
              value={selectedArtist} 
              onChange={(event) => setFilters({ genre: selectedGenre, artist: event.target.value, album: selectedAlbum })}
            >
              <option value=''>All artists</option>
              {artists.map((artist) => (
                <option key={artist} value={artist} className='bg-[#141822] text-white'>
                  {artist}
                </option>
              ))}
            </select>
          </label>

          <label className='space-y-1.5'>
            <span className='text-[11px] font-semibold uppercase tracking-wider text-soft'>Album</span>
            <select 
              className='w-full rounded-xl border border-white/10 bg-[#181d28] px-3.5 py-2.5 text-xs text-white outline-none focus:border-lime-300/80 transition cursor-pointer'
              value={selectedAlbum} 
              onChange={(event) => setFilters({ genre: selectedGenre, artist: selectedArtist, album: event.target.value })}
            >
              <option value=''>All albums</option>
              {albums.map((album) => (
                <option key={album} value={album} className='bg-[#141822] text-white'>
                  {album}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Footer Actions with High-Visibility Buttons */}
        <div className='mt-7 flex items-center justify-end gap-3 pt-4 border-t border-white/10'>
          <button 
            onClick={() => { 
              setFilters({ genre: '', artist: '', album: '' }); 
              onClose(); 
            }} 
            className='inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 hover:text-white transition cursor-pointer'
          >
            <RotateCcw size={14} />
            <span>Clear Filters</span>
          </button>
          <button 
            onClick={onClose} 
            style={{ backgroundColor: '#b8ff70', color: '#000000' }}
            className='inline-flex items-center gap-2 rounded-xl px-7 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-200 hover:brightness-110 active:scale-95 shadow-[0_0_20px_rgba(184,255,112,0.5)] cursor-pointer'
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
