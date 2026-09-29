import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://13.204.214.233:9090';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get('authorization');
  const userEmail = request.headers.get('x-user-email');

  try {
    const headers: Record<string, string> = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    };
    if (authHeader) headers['Authorization'] = authHeader;
    if (userEmail) headers['X-User-Email'] = userEmail;

    const res = await fetch(`${API_BASE_URL}/api/songs?${searchParams.toString()}`, {
      cache: 'no-store',
      headers
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      });
    }
  } catch (error) {
    console.warn('Backend proxy failed in /api/songs route, returning empty response:', error);
  }

  return NextResponse.json({
    songs: [],
    currentPage: 1,
    totalPages: 1,
    totalSongs: 0,
    limit: 8,
    hasNext: false,
    hasPrevious: false
  }, {
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  });
}
