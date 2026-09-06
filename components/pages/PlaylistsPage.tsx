"use client";

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ListMusic } from 'lucide-react';
import PlaylistCard from '@/components/PlaylistCard';
import { createPlaylist, getPlaylists } from '@/services/musicApi';
import { useMusicStore } from '@/lib/store/useMusicStore';

export default function PlaylistsPage() {
  const router = useRouter();
  const { playlists, setPlaylists, addPlaylist } = useMusicStore();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('music-auth')) {
      router.replace('/login');
      return;
    }
  }, [router]);

  useEffect(() => {
    const load = async () => {
      const data = await getPlaylists();
      setPlaylists(data);
    };
    load();
  }, [setPlaylists]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      const playlist = await createPlaylist(name.trim());
      addPlaylist(playlist);
      setName('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-8'>
      <section className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <div className='text-xs uppercase tracking-[0.25em] text-lime-300 font-semibold'>Collections</div>
          <h1 className='mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight text-white'>Playlists</h1>
        </div>

        <form onSubmit={handleCreate} className='flex items-center gap-3'>
          <input 
            value={name} 
            onChange={(event) => setName(event.target.value)} 
            placeholder='New playlist name...' 
            className='w-64 sm:w-80 rounded-full border border-white/15 bg-[#1a202c] px-5 py-2.5 text-sm text-white placeholder-slate-400 outline-none focus:border-lime-300 focus:ring-1 focus:ring-lime-300' 
          />
          <button 
            type='submit'
            disabled={!name.trim() || loading}
            className='rounded-full bg-lime-300 px-6 py-2.5 text-sm font-bold text-black inline-flex items-center gap-2 hover:bg-lime-200 transition active:scale-95 disabled:opacity-50 shadow-md'
          >
            <Plus size={16} />
            <span>{loading ? 'Creating...' : 'Create'}</span>
          </button>
        </form>
      </section>

      <section className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </section>
    </div>
  );
}
