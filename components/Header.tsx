"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ListMusic, Search, UserRound, LogOut, X } from 'lucide-react';
import { useMusicStore } from '@/lib/store/useMusicStore';
import { logoutFromZitadel } from '@/lib/auth/zitadelAuth';

export default function Header() {
  const router = useRouter();
  const { 
    searchQuery, 
    setSearchQuery, 
    authUser, 
    setAuthUser,
    setPlaylists,
    clearRecentlyPlayed
  } = useMusicStore();

  const applySearch = (value: string) => {
    setSearchQuery(value);
  };

  const logout = async () => {
    try {
      setAuthUser(null);
      setPlaylists([]);
      clearRecentlyPlayed();
    } catch (e) {
      console.warn("Store cleanup error:", e);
    }
    await logoutFromZitadel();
  };

  return (
    <header className='fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#11151b]/90 backdrop-blur-xl'>
      <div className='mx-auto flex max-w-[1500px] items-center justify-between px-6 py-3'>
        <Link href='/' className='flex items-center gap-3'>
          <img src='/musekit-logo.jpg' alt='MuseKit' className='h-10 w-10 rounded-full' />
          <span className='font-semibold tracking-wide text-[#fafff7] text-lg'>MuseKit</span>
        </Link>

        <nav className='hidden md:flex items-center gap-8'>
          <Link href='/' className='text-sm text-soft hover:text-white transition'>
            <span className='inline-flex gap-2 items-center'><Home size={16} />Library</span>
          </Link>
          <Link href='/playlists' className='text-sm text-soft hover:text-white transition'>
            <span className='inline-flex gap-2 items-center'><ListMusic size={16} />Playlists</span>
          </Link>
        </nav>

        <div className='flex items-center gap-3'>
          {/* Main Search Bar (Elasticsearch Powered) */}
          <div className='relative hidden md:block'>
            <Search size={16} className='absolute left-4 top-1/2 -translate-y-1/2 text-soft pointer-events-none' />
            <input
              className='w-[320px] lg:w-[400px] rounded-full border border-white/10 bg-[#202633] pl-11 pr-9 py-2 text-sm outline-none focus:border-lime-300/80 text-white placeholder:text-slate-400 transition-all'
              placeholder='Search songs, artists, albums, genres...'
              value={searchQuery}
              onChange={(event) => applySearch(event.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-0.5 rounded-full hover:bg-white/10'
                title='Clear search'
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* User Profile */}
          <div className='hidden md:flex flex-col items-center justify-center px-1'>
            <div className='relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 p-[1.5px] shadow-md shadow-pink-500/25'>
              <div className='flex h-full w-full items-center justify-center rounded-full bg-[#161a23] text-pink-200 font-bold text-xs'>
                {authUser?.name ? authUser.name.charAt(0).toUpperCase() : <UserRound size={15} />}
              </div>
            </div>
            <span className='mt-0.5 max-w-[80px] truncate text-[11px] font-semibold text-slate-200 leading-tight'>
              {authUser?.name ?? 'Guest'}
            </span>
          </div>

          {/* Styled Logout Button */}
          <button
            onClick={logout}
            title='Log out of MuseKit'
            className='group relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 hover:border-rose-400 hover:text-white transition-all duration-300 shadow-md shadow-rose-950/40 active:scale-95 cursor-pointer overflow-hidden'
          >
            <span className='absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/20 to-rose-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none' />
            <LogOut size={14} className='text-rose-400 group-hover:text-rose-200 group-hover:-translate-x-0.5 transition-all duration-200' />
            <span className='text-xs font-bold tracking-wide'>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className='md:hidden px-4 pb-3'>
        <div className='relative'>
          <Search size={16} className='absolute left-4 top-1/2 -translate-y-1/2 text-soft pointer-events-none' />
          <input
            className='w-full rounded-full border border-white/10 bg-[#202633] pl-11 pr-9 py-2 text-sm outline-none focus:border-lime-300/80 text-white placeholder:text-slate-400'
            placeholder='Search songs, artists, albums, genres...'
            value={searchQuery}
            onChange={(event) => applySearch(event.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5'
              title='Clear search'
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
