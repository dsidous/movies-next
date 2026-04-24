import { PlaceholderPage } from '@/components/layout/placeholder-page';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TvDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <PlaceholderPage title={`TV ${id}`} description="Details page coming soon." />;
}
