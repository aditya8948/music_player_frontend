import { Playlist } from '@/types';

export const playlists: Playlist[] = [
  {
    id: 'playlist-favorites',
    name: 'Favorites',
    coverImageUrl: 'https://images.unsplash.com/photo-1513829096960-ef0251ee4100?auto=format&fit=crop&w=900&q=80', // Heart-like music photography cover
    songIds: [],
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'playlist-1',
    name: 'Night Drive',
    coverImageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80',
    songIds: ['song-1', 'song-4', 'song-8'],
    createdAt: '2024-01-04T10:00:00.000Z'
  },
  {
    id: 'playlist-2',
    name: 'Soft Focus',
    coverImageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
    songIds: ['song-2', 'song-7', 'song-12'],
    createdAt: '2024-01-05T12:00:00.000Z'
  },
  {
    id: 'playlist-3',
    name: 'Morning Flow',
    coverImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    songIds: ['song-3', 'song-5', 'song-11'],
    createdAt: '2024-01-06T14:00:00.000Z'
  }
];
