"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Trash2, Heart, Music } from 'lucide-react';
import { getPlaylistById, getPlaylists, removeSongFromPlaylist, safeMediaUrl, getSongs } from '@/services/musicApi';
import { useMusicStore } from '@/lib/store/useMusicStore';
import { Playlist, Song } from '@/types';

export default function PlaylistDetailPage({ playlistId }: { playlistId: string }) {
  const router = useRouter();
  const { setPlaylists } = useMusicStore();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [items, setItems] = useState<Song[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('music-auth')) {
      router.replace('/login');
      return;
    }
  }, [router]);

  useEffect(() => {
    getPlaylists().then((allPlaylists) => {
      setPlaylists(allPlaylists);
      const current = allPlaylists.find((p) => p.id === playlistId);
      setPlaylist(current || null);
    });
  }, [playlistId, setPlaylists]);

  useEffect(() => {
    if (playlist && playlist.songIds && playlist.songIds.length > 0) {
      getSongs().then((liveSongs) => {
        const songsInPlaylist = liveSongs.filter((song) => playlist.songIds.includes(song.id));
        setItems(songsInPlaylist);
      });
    } else {
      setItems([]);
    }
  }, [playlist]);

  const handleRemoveSong = async (songId: string) => {
    if (!playlist) return;
    await removeSongFromPlaylist(playlist.id, songId);
    const updated = await getPlaylists();
    setPlaylists(updated);
    const refreshed = updated.find((p) => p.id === playlistId);
    setPlaylist(refreshed || null);
  };

  if (!playlist) {
    return (
      <div className='py-20 text-center text-soft'>
        Playlist not found.
      </div>
    );
  }

  const isFavorites = playlist.id === 'playlist-favorites' || playlist.name.toLowerCase() === 'favorites' || playlist.id.startsWith('fav-');

  return (
    <div className='space-y-8'>
      <section className='flex items-center justify-between'>
        <Link href='/playlists' className='flex items-center gap-2 text-sm text-soft hover:text-lime-300 transition-colors'>
          <ArrowLeft size={16} /> back to playlists
        </Link>
      </section>

      <section className='grid gap-8 rounded-[2rem] border border-white/10 bg-[#11151d] p-8 md:grid-cols-[280px,1fr] shadow-xl'>
        <div className='relative h-[280px] w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl flex items-center justify-center'>
          {isFavorites ? (
            <div className='relative flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600'>
              <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.25),transparent_60%)]' />
              <div className='flex h-32 w-32 items-center justify-center rounded-full bg-white/20 backdrop-blur-md shadow-2xl border border-white/30'>
                <Heart size={64} className='fill-white text-white drop-shadow-lg' />
              </div>
            </div>
          ) : (
            <div className='relative flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1c2436] via-[#151c2a] to-[#0f141f]'>
              <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(184,255,112,0.15),transparent_70%)]' />
              <div className='flex h-32 w-32 items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-lime-300 shadow-2xl'>
                <Music size={60} className='text-lime-300' />
              </div>
            </div>
          )}
        </div>

        <div className='flex flex-col justify-center'>
          <div className='text-xs uppercase tracking-[0.25em] text-lime-300'>Playlist</div>
          <h1 className='mt-3 text-5xl font-semibold'>{playlist.name}</h1>
          <div className='mt-6 flex items-center gap-3'>
            <span className='rounded-full border border-white/10 px-4 py-2 text-xs text-soft'>{items.length} tracks</span>
            <button className='rounded-full border border-white/10 px-4 py-2 text-xs hover:bg-white/10'>Add song</button>
          </div>
        </div>
      </section>

      <section className='space-y-3'>
        {items.length === 0 && <div className='rounded-3xl border border-dashed border-white/20 p-8 text-soft'>No songs yet</div>}
        {items.map((song) => (
          <div key={song.id} className='flex items-center justify-between rounded-3xl border border-white/10 bg-[#11151d] px-5 py-4'>
            <div className='flex items-center gap-4'>
              <Image
                src={safeMediaUrl(song.coverImageUrl)}
                alt=''
                width={50}
                height={50}
                className='rounded-xl object-cover'
              />
              <div>
                <div className='font-semibold'>{song.title}</div>
                <div className='text-xs text-soft'>{song.artist} • {song.album}</div>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <span className='text-xs text-soft'>{song.genre}</span>
              <span className='text-xs text-soft'>{Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}</span>
              <button onClick={() => handleRemoveSong(song.id)} className='rounded-full p-2 text-soft hover:bg-white/10 hover:text-rose-300'>
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
