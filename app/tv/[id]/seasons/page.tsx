import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getTv } from '@services/tmdb';

import { getSeasonsSummary, parseTmdbIdParam } from '@/lib/tv-helpers';
import { SITE_NAME } from '@/lib/constants/site';
import { TvSeasonsPageClient } from '@/components/tv/tv-seasons-page-client';
import { TvSeasonsShowHeader } from '@/components/tv/tv-seasons-show-header';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: raw } = await params;
  const id = parseTmdbIdParam(raw);
  if (id == null) return { title: 'Seasons' };
  try {
    const show = await getTv(id);
    return {
      title: `Seasons · ${show.name} | ${SITE_NAME}`,
      description: `All seasons of ${show.name}.`,
    };
  } catch {
    return { title: 'Seasons' };
  }
}

export default async function TvSeasonsPage({ params }: PageProps) {
  const { id: raw } = await params;
  const id = parseTmdbIdParam(raw);
  if (id == null) notFound();

  const show = await getTv(id).catch(() => null);
  if (show == null) notFound();

  const seasons = getSeasonsSummary(show);

  return (
    <div className="min-h-screen bg-zinc-950 pb-12 text-zinc-100">
      <div className="w-full min-w-0 px-4 pt-6 sm:px-5 sm:pt-8 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <TvSeasonsShowHeader show={show} seriesId={id} />
        <div className="mt-10 w-full max-w-none">
          <TvSeasonsPageClient seriesId={id} seriesName={show.name} seasons={seasons} />
        </div>
      </div>
    </div>
  );
}
