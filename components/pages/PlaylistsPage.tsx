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
          
          <h1 className='mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900'>Playlists</h1>
        </div>

        <form onSubmit={handleCreate} className='flex items-center gap-3'>
          <input 
            value={name} 
            onChange={(event) => setName(event.target.value)} 
            placeholder='New playlist name...' 
            className='w-64 sm:w-80 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 shadow-sm transition' 
          />
          <button 
            type='submit'
            disabled={!name.trim() || loading}
            className='rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white inline-flex items-center gap-1.5 hover:bg-slate-800 transition active:scale-95 disabled:opacity-40 shadow-sm'
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
