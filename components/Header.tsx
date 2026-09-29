"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, LogOut, X } from 'lucide-react';
import { useMusicStore } from '@/lib/store/useMusicStore';
import { logoutFromZitadel } from '@/lib/auth/zitadelAuth';

export default function Header() {
  const pathname = usePathname();
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

  const userInitial = authUser?.name ? authUser.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className='fixed top-0 left-0 right-0 z-50 border-b border-stone-200/90 bg-white/95 backdrop-blur-xl shadow-[0_1px_4px_rgba(0,0,0,0.03)]'>
      <div className='mx-auto flex h-14 max-w-[1500px] items-center justify-between px-6'>
        
        {/* Left: Brand & Navigation */}
        <div className='flex items-center gap-6'>
          <Link href='/' className='flex items-center gap-2.5 group'>
            <img src='/musekit-logo.jpg' alt='MuseKit' className='h-7 w-7 rounded-md object-cover shadow-sm' />
            <span className='font-bold tracking-tight text-stone-900 text-[15px]'>MuseKit</span>
          </Link>

          <div className='h-4 w-px bg-stone-200 hidden sm:block' />

          <nav className='flex items-center gap-1'>
            <Link 
              href='/' 
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition ${
                pathname === '/' 
                  ? 'bg-stone-100 text-stone-900 font-semibold' 
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              Library
            </Link>
            <Link 
              href='/playlists' 
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition ${
                pathname === '/playlists' 
                  ? 'bg-stone-100 text-stone-900 font-semibold' 
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              Playlists
            </Link>
          </nav>
        </div>

        {/* Center: High-Visibility Search Bar */}
        <div className='relative hidden md:block w-80 md:w-[420px] lg:w-[480px]'>
          <Search size={16} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none' />
          <input
            className='w-full h-10 rounded-full border border-stone-300 bg-stone-100/70 hover:bg-stone-100 focus:bg-white pl-10 pr-9 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200 shadow-sm transition-all'
            placeholder='Search songs, artists, albums, genres...'
            value={searchQuery}
            onChange={(e) => applySearch(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 rounded-full hover:bg-stone-200/60 transition-colors'
              title='Clear search'
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Right: Clean User Profile & Logout */}
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2'>
            <div className='h-7 w-7 rounded-full bg-stone-100 border border-stone-300 text-stone-800 font-semibold text-xs flex items-center justify-center shadow-xs'>
              {userInitial}
            </div>
            <span className='text-xs font-medium text-stone-800 hidden sm:inline max-w-[120px] truncate'>
              {authUser?.name ?? 'Account'}
            </span>
          </div>

          <div className='h-4 w-px bg-stone-200' />

          <button
            onClick={logout}
            title='Log out'
            className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition duration-150 cursor-pointer'
          >
            <LogOut size={13} />
            <span className='hidden sm:inline'>Log out</span>
          </button>
        </div>

      </div>

      {/* Mobile Search Bar (Only shown on small screens) */}
      <div className='md:hidden px-4 pb-2.5 pt-1'>
        <div className='relative'>
          <Search size={15} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none' />
          <input
            className='w-full h-9 rounded-full border border-stone-300 bg-stone-100/70 pl-10 pr-9 text-xs text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-500 focus:bg-white'
            placeholder='Search songs, artists...'
            value={searchQuery}
            onChange={(e) => applySearch(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className='absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1'
              title='Clear'
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
