import PlaylistDetailPage from '@/components/pages/PlaylistDetailPage';

export default async function PlaylistDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlaylistDetailPage playlistId={id} />;
}
