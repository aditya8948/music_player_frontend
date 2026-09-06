export type Genre = 'Electronic' | 'Indie' | 'Soul' | 'Jazz' | 'Hip Hop' | 'Pop' | 'Alt Rock' | 'Afrobeat' | 'Ambient' | 'Classical';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: Genre;
  duration: number;
  releaseYear: number;
  coverImageUrl: string;
  audioUrl: string;
}

export interface Playlist {
  id: string;
  name: string;
  userId?: string;
  coverImageUrl?: string;
  songIds: string[];
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface SearchFilters {
  genre?: string;
  artist?: string;
  album?: string;
}

export interface PlayerState {
  currentSongId: string | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
}

export interface PaginatedSongsResponse {
  songs: Song[];
  currentPage: number;
  totalPages: number;
  totalSongs: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
