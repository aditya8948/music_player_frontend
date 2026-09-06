"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SongCard from '@/components/SongCard';
import { useMusicStore } from '@/lib/store/useMusicStore';
import { getPlaylists, getPaginatedSongs } from '@/services/musicApi';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { 
  ChevronLeft, 
  ChevronRight, 
  SearchX, 
  RotateCcw, 
  Music, 
  Sparkles,
  Search,
  Disc3,
  Trash2,
  UploadCloud
} from 'lucide-react';
import { Song } from '@/types';
import UploadSongModal from '@/components/UploadSongModal';

const PAGE_SIZE = 8;

export default function HomePage() {
  const router = useRouter();
  const { 
    setPlaylists, 
    playlists, 
    searchQuery, 
    setSearchQuery,
    selectedGenre, 
    selectedArtist, 
    selectedAlbum, 
    setFilters,
    setCurrentSong, 
    currentSong,
    recentlyPlayed,
    cleanRecentlyPlayed,
    clearRecentlyPlayed,
    setQueue
  } = useMusicStore();

  const [items, setItems] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSongs, setTotalSongs] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 400);
  const isSearching = Boolean(debouncedQuery.trim() || selectedGenre || selectedArtist || selectedAlbum);
  const libraryRef = useRef<HTMLDivElement>(null);

  // Authentication check
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('music-auth')) {
      router.replace('/login');
      return;
    }
  }, [router]);

  // Initial song setup if not playing
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('music-auth')) {
      const stored = JSON.parse(localStorage.getItem('music-auth') || '{}');
      if (stored?.email && items.length > 0 && !currentSong) {
        setCurrentSong(items[0]);
      }
    }
  }, [items, currentSong, setCurrentSong]);

  // Fetch playlists on mount
  useEffect(() => {
    getPlaylists().then(setPlaylists);
  }, [setPlaylists]);

  // Reset to page 1 whenever search criteria change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, selectedGenre, selectedArtist, selectedAlbum]);

  // Fetch paginated songs whenever page or search parameters change
  useEffect(() => {
    let isCancelled = false;

    const fetchSongs = async () => {
      setLoading(true);
      try {
        const result = await getPaginatedSongs({
          page: currentPage,
          limit: PAGE_SIZE,
          query: debouncedQuery,
          filters: {
            genre: selectedGenre,
            artist: selectedArtist,
            album: selectedAlbum
          }
        });

        if (!isCancelled) {
          setItems(result.songs);
          setQueue(result.songs);
          setTotalPages(result.totalPages);
          setTotalSongs(result.totalSongs);
          setCurrentPage(result.currentPage);
          
          if (result.songs.length > 0) {
            // Clean up any stale/deleted songs from recently played
            cleanRecentlyPlayed(result.songs.map((s: Song) => s.id));
          }
        }
      } catch (err) {
        console.error('Error fetching songs:', err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchSongs();

    return () => {
      isCancelled = true;
    };
  }, [currentPage, debouncedQuery, selectedGenre, selectedArtist, selectedAlbum]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      if (libraryRef.current) {
        libraryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilters({ genre: '', artist: '', album: '' });
  };

  return (
    <div className='space-y-8 pb-12' ref={libraryRef}>
      {/* Header Section */}
      <section className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-lime-300 font-semibold'>
            <Sparkles className='w-3.5 h-3.5' />
            <span>Discover & Stream</span>
          </div>
          <h1 className='mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight text-white'>
            Your Library
          </h1>
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <button
            onClick={() => setShowUploadModal(true)}
            className='inline-flex items-center gap-2 rounded-full border border-lime-300/30 bg-lime-300/10 hover:bg-lime-300 hover:text-black active:scale-95 px-4 py-2 text-xs font-semibold text-lime-300 transition-all shadow-sm'
          >
            <UploadCloud size={15} />
            <span>Upload Song</span>
          </button>

          <div className='rounded-full border border-white/15 bg-white/5 backdrop-blur-md px-4 py-2 text-xs font-medium text-slate-300 shadow-sm'>
            {totalSongs} {totalSongs === 1 ? 'track' : 'tracks'}
          </div>
          <div className='rounded-full border border-white/15 bg-white/5 backdrop-blur-md px-4 py-2 text-xs font-medium text-slate-300 shadow-sm'>
            {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
          </div>
        </div>
      </section>

      {/* Recently Played Section (Visible when NOT searching) */}
      {!isSearching && recentlyPlayed && recentlyPlayed.length > 0 && (
        <section className='space-y-4 border-b border-white/10 pb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='text-xs uppercase tracking-[0.2em] text-pink-300 font-semibold'>Jump Back In</div>
              <h2 className='mt-1 text-2xl font-bold tracking-tight text-white'>Recently Played</h2>
            </div>
            <button 
              onClick={clearRecentlyPlayed}
              className='flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-300 transition-colors'
              title='Clear recently played history'
            >
              <Trash2 size={13} />
              <span>Clear history</span>
            </button>
          </div>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'>
            {recentlyPlayed.map((song) => (
              <SongCard key={`recent-${song.id}`} song={song} />
            ))}
          </div>
        </section>
      )}

      {/* Main Song Library Grid or Empty State */}
      <section className='space-y-6'>
        {isSearching && (
          <div className='flex items-center justify-between border-b border-white/10 pb-3'>
            <div className='flex items-center gap-2 text-sm text-slate-300 font-medium'>
              <Search className='w-4 h-4 text-lime-300' />
              <span>
                Search results for: <span className='text-white font-bold'>&quot;{debouncedQuery || selectedGenre || selectedArtist || selectedAlbum}&quot;</span>
              </span>
            </div>
            <button
              onClick={handleClearSearch}
              className='flex items-center gap-1.5 text-xs text-rose-300 hover:text-rose-200 transition bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full'
            >
              <RotateCcw className='w-3 h-3' />
              Clear search
            </button>
          </div>
        )}

        {loading ? (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 min-h-[300px]'>
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <div 
                key={`skeleton-${index}`}
                className='h-64 rounded-3xl bg-white/5 border border-white/10 animate-pulse flex flex-col p-4 justify-end gap-3'
              >
                <div className='w-3/4 h-5 bg-white/10 rounded-lg' />
                <div className='w-1/2 h-4 bg-white/10 rounded-lg' />
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {items.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        ) : (
          /* Error / Result Not Found State */
          <div className='my-10 rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/80 to-slate-950/80 p-10 text-center backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center min-h-[320px]'>
            <div className='w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mb-4 text-rose-400 shadow-lg shadow-rose-500/10'>
              <SearchX className='w-8 h-8' />
            </div>
            <h3 className='text-2xl font-bold text-white'>Result Not Found</h3>
            <p className='mt-2 max-w-md text-sm text-slate-300 leading-relaxed'>
              We couldn&apos;t find any songs matching your search criteria. Please check your spelling or try another artist, title, or genre.
            </p>
            <div className='mt-6 flex flex-wrap gap-3 justify-center'>
              <button
                onClick={handleClearSearch}
                className='flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-bold text-sm shadow-lg shadow-pink-500/25 hover:brightness-110 active:scale-95 transition-all'
              >
                <RotateCcw className='w-4 h-4' />
                Clear search & filters
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <section className='mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md px-6 py-4'>
          {/* Status info */}
          <div className='text-xs text-slate-300 font-medium'>
            Showing <span className='text-white font-bold'>{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalSongs)}</span> of <span className='text-white font-bold'>{totalSongs}</span> tracks
          </div>

          {/* Page Selector Buttons */}
          <div className='flex items-center gap-1.5'>
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className='flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold border border-white/10 bg-white/5 hover:bg-white/15 text-white disabled:opacity-40 disabled:cursor-not-allowed transition'
              aria-label='Previous page'
            >
              <ChevronLeft className='w-4 h-4' />
              <span>Prev</span>
            </button>

            {/* Numeric Page Buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={`page-${pageNum}`}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow-md shadow-pink-500/30 scale-105'
                      : 'border border-white/10 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className='flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold border border-white/10 bg-white/5 hover:bg-white/15 text-white disabled:opacity-40 disabled:cursor-not-allowed transition'
              aria-label='Next page'
            >
              <span>Next</span>
              <ChevronRight className='w-4 h-4' />
            </button>
          </div>
        </section>
      )}

      {/* Moved down Recently Played Section (when searching with results) */}
      {isSearching && recentlyPlayed && recentlyPlayed.length > 0 && (
        <section className='space-y-4 pt-10 border-t border-white/10'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold'>History</div>
              <h3 className='mt-1 text-xl font-bold tracking-tight text-white'>Recently Played Songs</h3>
            </div>
          </div>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'>
            {recentlyPlayed.map((song) => (
              <SongCard key={`search-recent-${song.id}`} song={song} />
            ))}
          </div>
        </section>
      )}

      {/* Upload Song Modal */}
      <UploadSongModal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => {
          // Trigger refresh of catalog
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }}
      />
    </div>
  );
}
