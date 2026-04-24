import { PlaceholderPage } from '@/components/layout/placeholder-page';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MovieDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <PlaceholderPage title={`Movie ${id}`} description="Details page coming soon." />;
}
