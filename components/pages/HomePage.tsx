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
} from 'lucide-react';
import { Song } from '@/types';

const PAGE_SIZE = 12;

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
          
// Preserved recently played across pages
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
      <section className='flex items-center justify-between'>
        <h1 className='text-3xl sm:text-4xl font-bold tracking-tight text-stone-900'>
          Your Library
        </h1>
      </section>

      {/* Recently Played Section (Visible when NOT searching) */}
      {!isSearching && recentlyPlayed && recentlyPlayed.length > 0 && (
        <section className='space-y-4 border-b border-stone-200/80 pb-8'>
          <div className='flex items-center justify-between'>
            <div>
              
              <h2 className='mt-1 text-2xl font-bold tracking-tight text-stone-900'>Recently Played</h2>
            </div>
            <button 
              onClick={clearRecentlyPlayed}
              className='flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-800 transition-colors'
              title='Clear recently played history'
            >
              <Trash2 size={13} />
              <span>Clear history</span>
            </button>
          </div>
          <div className='grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
            {recentlyPlayed.map((song) => (
              <SongCard key={`recent-${song.id}`} song={song} />
            ))}
          </div>
        </section>
      )}

      {/* Main Song Library Grid or Empty State */}
      <section className='space-y-6'>
        {isSearching && (
          <div className='flex items-center justify-between border-b border-stone-200/80 pb-3'>
            <div className='flex items-center gap-2 text-sm text-stone-600 font-medium'>
              <Search className='w-4 h-4 text-lime-300' />
              <span>
                Search results for: <span className='text-stone-900 font-bold'>&quot;{debouncedQuery || selectedGenre || selectedArtist || selectedAlbum}&quot;</span>
              </span>
            </div>
            <button
              onClick={handleClearSearch}
              className='flex items-center gap-1.5 text-xs text-stone-700 hover:text-stone-900 transition bg-stone-100 hover:bg-stone-200 border border-stone-300 px-3 py-1 rounded-full font-medium'
            >
              <RotateCcw className='w-3 h-3' />
              Clear search
            </button>
          </div>
        )}

        {loading ? (
          <div className='grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 min-h-[300px]'>
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <div 
                key={`skeleton-${index}`}
                className='h-52 rounded-2xl bg-white/5 border border-white/10 animate-pulse flex flex-col p-4 justify-end gap-3'
              >
                <div className='w-3/4 h-5 bg-white/10 rounded-lg' />
                <div className='w-1/2 h-4 bg-white/10 rounded-lg' />
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className='grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
            {items.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        ) : (
          /* Error / Result Not Found State */
          <div className='my-10 rounded-3xl border border-stone-200 bg-white p-10 text-center shadow-lg rounded-3xl flex flex-col items-center justify-center min-h-[320px]'>
            <div className='w-16 h-16 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mb-4 text-stone-700 shadow-xs'>
              <SearchX className='w-8 h-8' />
            </div>
            <h3 className='text-2xl font-bold text-stone-900'>Result Not Found</h3>
            <p className='mt-2 max-w-md text-sm text-stone-600 leading-relaxed'>
              We couldn&apos;t find any songs matching your search criteria. Please check your spelling or try another artist, title, or genre.
            </p>
            <div className='mt-6 flex flex-wrap gap-3 justify-center'>
              <button
                onClick={handleClearSearch}
                className='flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-white font-semibold text-sm shadow-md hover:bg-black active:scale-95 transition-all'
              >
                <RotateCcw className='w-4 h-4' />
                Clear search & filters
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Simple & Clean Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className='mt-8 mb-6 flex items-center justify-center gap-3'>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className='flex items-center gap-1.5 px-4 py-2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300 text-xs font-semibold text-stone-700 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs transition duration-150'
            aria-label='Previous page'
          >
            <ChevronLeft className='w-4 h-4' />
            <span>Previous</span>
          </button>

          <span className='px-4 py-2 text-xs font-medium text-slate-500 rounded-full border border-stone-200 bg-white/80 shadow-xs'>
            Page <span className='text-stone-900 font-semibold'>{currentPage}</span> of {totalPages.toLocaleString()}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className='flex items-center gap-1.5 px-4 py-2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300 text-xs font-semibold text-stone-700 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs transition duration-150'
            aria-label='Next page'
          >
            <span>Next</span>
            <ChevronRight className='w-4 h-4' />
          </button>
        </div>
      )}

      {/* Moved down Recently Played Section (when searching with results) */}
      {isSearching && recentlyPlayed && recentlyPlayed.length > 0 && (
        <section className='space-y-4 pt-10 border-t border-stone-200/80'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold'>History</div>
              <h3 className='mt-1 text-xl font-bold tracking-tight text-stone-900'>Recently Played Songs</h3>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
            {recentlyPlayed.map((song) => (
              <SongCard key={`search-recent-${song.id}`} song={song} />
            ))}
          </div>
        </section>
      )}


    </div>
  );
}
