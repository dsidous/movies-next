import { PlaceholderPage } from '@/components/layout/placeholder-page';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PersonDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <PlaceholderPage title={`Person ${id}`} description="Details page coming soon." />;
}
