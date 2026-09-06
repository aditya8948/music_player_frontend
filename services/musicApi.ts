import { Playlist, SearchFilters, Song, PaginatedSongsResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090';
const DEFAULT_FALLBACK_COVER = '/default_cover.jpg';

/**
 * Extract active user's email from localStorage
 */
export function getCurrentUserEmail(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem('music-auth');
    if (!raw) return undefined;
    const user = JSON.parse(raw);
    return user?.email || user?.id || undefined;
  } catch {
    return undefined;
  }
}

function getAuthHeaders(includeContentType = true): HeadersInit {
  const headers: Record<string, string> = {};
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth-token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const userEmail = getCurrentUserEmail();
    if (userEmail && userEmail.includes('@')) {
      headers['X-User-Email'] = userEmail;
    }
  }
  return headers;
}

/**
 * Checks whether a given media URL is syntactically valid for Next Image loaders
 */
export function isValidMediaUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/')
  );
}

/**
 * Safely resolves media URLs and falls back to a guaranteed valid Unsplash image
 * if the string is empty, null, undefined, or an invalid format
 */
export function safeMediaUrl(url?: string | null, fallback = DEFAULT_FALLBACK_COVER): string {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  if (trimmed.startsWith('/uploads/')) {
    return `${API_BASE_URL}${trimmed}`;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }
  return fallback;
}

export function resolveMediaUrl(url?: string | null): string {
  return safeMediaUrl(url, '');
}

const inFlightSongs = new Map<string, Promise<PaginatedSongsResponse>>();
const inFlightPlaylists = new Map<string, Promise<Playlist[]>>();

export interface FetchSongsParams {
  page?: number;
  limit?: number;
  query?: string;
  filters?: SearchFilters;
}

/**
 * Fetch paginated songs directly from the Spring Boot backend at http://localhost:8080/api/songs
 */
export async function getPaginatedSongs({
  page = 1,
  limit = 8,
  query = '',
  filters = {}
}: FetchSongsParams = {}): Promise<PaginatedSongsResponse> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
  if (!token) {
    return {
      songs: [],
      currentPage: 1,
      totalPages: 1,
      totalSongs: 0,
      limit,
      hasNext: false,
      hasPrevious: false
    };
  }

  const normalizedQuery = query.trim();
  const cacheKey = `${page}-${limit}-${normalizedQuery}-${filters.genre || ''}-${filters.artist || ''}-${filters.album || ''}`;

  if (inFlightSongs.has(cacheKey)) {
    return inFlightSongs.get(cacheKey)!;
  }

  const reqPromise = (async (): Promise<PaginatedSongsResponse> => {
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (normalizedQuery) params.set('query', normalizedQuery);
      if (filters.genre) params.set('genre', filters.genre);
      if (filters.artist) params.set('artist', filters.artist);
      if (filters.album) params.set('album', filters.album);

      const res = await fetch(`${API_BASE_URL}/api/songs?${params.toString()}`, {
        headers: getAuthHeaders(false),
        cache: 'no-store'
      });

      if (res.ok) {
        const data = await res.json();
        return {
          songs: data.songs || [],
          currentPage: data.currentPage ?? page,
          totalPages: data.totalPages ?? 1,
          totalSongs: data.totalSongs ?? (data.songs ? data.songs.length : 0),
          limit: data.limit ?? limit,
          hasNext: Boolean(data.hasNext),
          hasPrevious: Boolean(data.hasPrevious)
        };
      }
    } catch (error) {
      console.warn('Backend API fetch failed, falling back to internal route:', error);
    }

    // Next.js internal route fallback
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (normalizedQuery) params.set('query', normalizedQuery);
      if (filters.genre) params.set('genre', filters.genre);
      if (filters.artist) params.set('artist', filters.artist);
      if (filters.album) params.set('album', filters.album);

      const res = await fetch(`/api/songs?${params.toString()}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        return {
          songs: data.songs || [],
          currentPage: data.currentPage || page,
          totalPages: data.totalPages || 1,
          totalSongs: data.totalSongs ?? 0,
          limit: data.limit || limit,
          hasNext: Boolean(data.hasNext),
          hasPrevious: Boolean(data.hasPrevious)
        };
      }
    } catch (innerError) {
      console.warn('Internal route fallback error:', innerError);
    }

    return {
      songs: [],
      currentPage: 1,
      totalPages: 1,
      totalSongs: 0,
      limit,
      hasNext: false,
      hasPrevious: false
    };
  })().finally(() => {
    inFlightSongs.delete(cacheKey);
  });

  inFlightSongs.set(cacheKey, reqPromise);
  return reqPromise;
}

/**
 * Fetch a single song by ID from backend
 */
export async function getSongById(id: string): Promise<Song | null> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/api/songs/${id}`, {
      headers: getAuthHeaders(false),
      cache: 'no-store'
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.warn(`Failed to fetch song ${id} from backend:`, error);
  }
  return null;
}

/**
 * Fetch available genres from backend
 */
export async function getGenres(): Promise<string[]> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
  if (!token) return [];

  try {
    const res = await fetch(`${API_BASE_URL}/api/songs/genres`, {
      headers: getAuthHeaders(false),
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (error) {
    console.warn('Failed to fetch genres from backend:', error);
  }
  return [];
}

/**
 * Upload a song to the backend (multipart/form-data)
 */
export async function uploadSong(formData: FormData): Promise<Song> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/songs/upload`, {
    method: 'POST',
    headers,
    body: formData
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Song upload failed');
  }

  return await res.json();
}

/**
 * Get direct download URL for a song
 */
export function getDownloadUrl(songId: string): string {
  return `${API_BASE_URL}/api/songs/${songId}/download`;
}

export async function getSongs(): Promise<Song[]> {
  const result = await getPaginatedSongs({ page: 1, limit: 100 });
  return result.songs;
}

export async function searchSongs(query = '', filters: SearchFilters = {}): Promise<Song[]> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
  if (!token) return [];
  const result = await getPaginatedSongs({ page: 1, limit: 100, query, filters });
  return result.songs;
}

/* =========================================================================
   USER-ISOLATED PLAYLISTS API INTEGRATION (Spring Boot & MongoDB)
   ========================================================================= */

/**
 * GET http://localhost:8080/api/playlists?userId=...
 * Check logged-in user's email and fetch their isolated playlists.
 */
export async function getPlaylists(userId?: string): Promise<Playlist[]> {
  const userEmail = userId || getCurrentUserEmail();
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;

  const fallbackFavId = userEmail ? `fav-${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}` : 'playlist-favorites';
  const fallbackList: Playlist[] = [
    {
      id: fallbackFavId,
      name: 'Favorites',
      userId: userEmail,
      coverImageUrl: 'https://images.unsplash.com/photo-1513829096960-ef0251ee4100?auto=format&fit=crop&w=900&q=80',
      songIds: [],
      createdAt: new Date().toISOString()
    }
  ];

  if (!token) {
    return [];
  }

  const cacheKey = userEmail || 'authenticated-user';
  if (inFlightPlaylists.has(cacheKey)) {
    return inFlightPlaylists.get(cacheKey)!;
  }

  const reqPromise = (async (): Promise<Playlist[]> => {
    try {
      const url = `${API_BASE_URL}/api/playlists${userEmail ? `?userId=${encodeURIComponent(userEmail)}` : ''}`;
      const res = await fetch(url, {
        headers: getAuthHeaders(false),
        cache: 'no-store'
      });

      if (res.ok) {
        const list: Playlist[] = await res.json();
        if (Array.isArray(list)) {
          return list;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch playlists from backend:', error);
    }
    return fallbackList;
  })().finally(() => {
    inFlightPlaylists.delete(cacheKey);
  });

  inFlightPlaylists.set(cacheKey, reqPromise);
  return reqPromise;
}

/**
 * GET http://localhost:8080/api/playlists/{id}
 */
export async function getPlaylistById(id: string): Promise<Playlist | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/playlists/${id}`, {
      headers: getAuthHeaders(false),
      cache: 'no-store'
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.warn(`Failed to fetch playlist ${id} from backend:`, error);
  }

  const all = await getPlaylists();
  return all.find((p) => p.id === id) || null;
}

/**
 * POST http://localhost:8080/api/playlists
 * Sends JSON: { "name": name, "coverImageUrl": coverImageUrl, "userId": userEmail, "songIds": [] }
 */
export async function createPlaylist(name: string, coverImageUrl?: string, userId?: string): Promise<Playlist> {
  const userEmail = userId || getCurrentUserEmail();

  const payload = {
    name: name.trim(),
    coverImageUrl: coverImageUrl || undefined,
    userId: userEmail || undefined,
    songIds: []
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/playlists`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.warn('Backend createPlaylist failed:', error);
  }

  // Local fallback
  return {
    id: `playlist-${Date.now()}`,
    name,
    userId: userEmail,
    coverImageUrl: coverImageUrl || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80',
    songIds: [],
    createdAt: new Date().toISOString()
  };
}

/**
 * POST http://localhost:8080/api/playlists/${playlistId}/songs
 * Sends JSON: { "songId": songId }
 */
export async function addSongToPlaylist(playlistId: string, songId: string): Promise<Playlist | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/playlists/${playlistId}/songs`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ songId })
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.warn(`Backend addSongToPlaylist failed for playlist ${playlistId}:`, error);
  }
  return null;
}

/**
 * DELETE http://localhost:8080/api/playlists/${playlistId}/songs/${songId}
 */
export async function removeSongFromPlaylist(playlistId: string, songId: string): Promise<Playlist | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/playlists/${playlistId}/songs/${songId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(false)
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.warn(`Backend removeSongFromPlaylist failed for playlist ${playlistId}:`, error);
  }
  return null;
}

/**
 * DELETE http://localhost:8080/api/playlists/${playlistId}
 */
export async function deletePlaylist(playlistId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/playlists/${playlistId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(false)
    });

    if (res.ok) {
      return true;
    }
  } catch (error) {
    console.warn(`Backend deletePlaylist failed for playlist ${playlistId}:`, error);
  }
  return false;
}
