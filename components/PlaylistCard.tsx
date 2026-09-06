"use client";

import Link from 'next/link';
import { Trash2, Heart, Music } from 'lucide-react';
import { Playlist } from '@/types';
import { useMusicStore } from '@/lib/store/useMusicStore';
import { deletePlaylist } from '@/services/musicApi';

export default function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const { deletePlaylist: removePlaylist } = useMusicStore();
  const isFavorites = playlist.id === 'playlist-favorites' || playlist.name.toLowerCase() === 'favorites' || playlist.id.startsWith('fav-');

  const handleDelete = async () => {
    await deletePlaylist(playlist.id);
    removePlaylist(playlist.id);
  };

  return (
    <article className='group relative rounded-3xl border border-white/10 bg-[#141822] p-4 shadow-lg shadow-black/40 hover:border-white/20 hover:bg-[#181d2a] transition-all duration-300'>
      <Link href={`/playlists/${playlist.id}`} className='block'>
        <div className='relative h-44 w-full overflow-hidden rounded-2xl border border-white/10 shadow-inner flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]'>
          {isFavorites ? (
            <div className='relative flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 shadow-inner'>
              <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.25),transparent_60%)]' />
              <div className='flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-md shadow-lg border border-white/30'>
                <Heart size={40} className='fill-white text-white drop-shadow-md' />
              </div>
            </div>
          ) : (
            <div className='relative flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1c2436] via-[#151c2a] to-[#0f141f]'>
              <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(184,255,112,0.12),transparent_70%)]' />
              <div className='flex h-20 w-20 items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-lime-300 group-hover:text-lime-200 group-hover:border-lime-300/40 transition-colors shadow-md'>
                <Music size={38} className='text-lime-300' />
              </div>
            </div>
          )}
        </div>
      </Link>

      <div className='mt-4 flex items-center justify-between gap-3'>
        <div className='min-w-0'>
          <Link href={`/playlists/${playlist.id}`} className='truncate block text-base font-bold text-white group-hover:text-lime-300 transition-colors'>
            {playlist.name}
          </Link>
          <div className='mt-0.5 text-xs text-soft font-medium'>
            {playlist.songIds.length} {playlist.songIds.length === 1 ? 'song' : 'songs'}
          </div>
        </div>

        {playlist.id !== 'playlist-favorites' && (
          <button
            onClick={handleDelete}
            className='rounded-full p-2 text-soft hover:bg-rose-500/20 hover:text-rose-300 transition-colors'
            title="Delete Playlist"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </article>
  );
}
