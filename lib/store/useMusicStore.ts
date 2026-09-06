import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Playlist, Song, User } from '@/types';

interface MusicState {
  currentSong: Song | null;
  queue: Song[];
  recentlyPlayed: Song[];
  isPlaying: boolean;
  volume: number;
  progress: number;
  playlists: Playlist[];
  authUser: User | null;
  searchQuery: string;
  selectedGenre: string;
  selectedArtist: string;
  selectedAlbum: string;
  setCurrentSong: (song: Song | null) => void;
  setQueue: (queue: Song[]) => void;
  startPlayback: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  seek: (progress: number) => void;
  incrementProgress: (amount: number) => void;
  setPlaylists: (playlists: Playlist[]) => void;
  addPlaylist: (playlist: Playlist) => void;
  updatePlaylist: (playlist: Playlist) => void;
  deletePlaylist: (playlistId: string) => void;
  addSongToPlaylist: (playlistId: string, songId: string) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  setAuthUser: (user: User | null) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: { genre?: string; artist?: string; album?: string }) => void;
  clearRecentlyPlayed: () => void;
  cleanRecentlyPlayed: (validIds: string[]) => void;
}

export const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => ({
      currentSong: null,
      queue: [],
      recentlyPlayed: [],
      isPlaying: false,
      volume: 72,
      progress: 0,
      playlists: [],
      authUser: null,
      searchQuery: '',
      selectedGenre: '',
      selectedArtist: '',
      selectedAlbum: '',
      setQueue: (queue) => set({ queue }),
      clearRecentlyPlayed: () => set({ recentlyPlayed: [] }),
      cleanRecentlyPlayed: (validIds) => set({
        recentlyPlayed: (get().recentlyPlayed || []).filter(s => validIds.includes(s.id))
      }),
      setCurrentSong: (song) => {
        if (song) {
          const currentRecent = get().recentlyPlayed || [];
          const updatedRecent = [
            song,
            ...currentRecent.filter((s) => s.id !== song.id)
          ].slice(0, 10);
          set({ currentSong: song, progress: 0, isPlaying: true, recentlyPlayed: updatedRecent });
        } else {
          set({ currentSong: null, progress: 0, isPlaying: false });
        }
      },
      startPlayback: () => set({ isPlaying: true }),
      togglePlay: () => set({ isPlaying: !get().isPlaying }),
      setVolume: (volume) => set({ volume: Math.min(100, Math.max(0, volume)) }),
      seek: (progress) => set({ progress }),
      incrementProgress: (amount) => set({ progress: Math.min(get().currentSong?.duration || 180, Math.max(0, get().progress + amount)) }),
      setPlaylists: (playlists) => set({ playlists }),
      addPlaylist: (playlist) => set({ playlists: [...get().playlists, playlist] }),
      updatePlaylist: (playlist) => set({ playlists: get().playlists.map((item) => item.id === playlist.id ? playlist : item) }),
      deletePlaylist: (playlistId) => set({ playlists: get().playlists.filter((playlist) => playlist.id !== playlistId) }),
      addSongToPlaylist: (playlistId, songId) => set({ playlists: get().playlists.map((playlist) => {
        if (playlist.id !== playlistId) return playlist;
        return { ...playlist, songIds: playlist.songIds.includes(songId) ? playlist.songIds : [...playlist.songIds, songId] };
      })}),
      removeSongFromPlaylist: (playlistId, songId) => set({ playlists: get().playlists.map((playlist) => {
        if (playlist.id !== playlistId) return playlist;
        return { ...playlist, songIds: playlist.songIds.filter((id) => id !== songId) };
      })}),
      setAuthUser: (user) => set({ authUser: user }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilters: (filters) => set({ selectedGenre: filters.genre ?? '', selectedArtist: filters.artist ?? '', selectedAlbum: filters.album ?? '' })
    }),
    {
      name: 'music-player-store',
      partialize: (state) => ({
        currentSong: state.currentSong,
        recentlyPlayed: state.recentlyPlayed,
        isPlaying: state.isPlaying,
        volume: state.volume,
        progress: state.progress,
        playlists: state.playlists,
        authUser: state.authUser,
        searchQuery: state.searchQuery,
        selectedGenre: state.selectedGenre,
        selectedArtist: state.selectedArtist,
        selectedAlbum: state.selectedAlbum
      })
    }
  )
);
