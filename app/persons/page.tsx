import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PersonPopularInfinite } from '@/components/person/person-popular-infinite';
import { SITE_NAME } from '@/lib/constants/site';
import { getPopularPeople } from '@services/tmdb';

export const metadata: Metadata = {
  title: `Popular people | ${SITE_NAME}`,
  description: 'Browse popular actors, directors, and other people on TMDB.',
};

export default async function PersonsPage() {
  const data = await getPopularPeople({ page: 1 }).catch(() => null);
  if (data == null) notFound();

  return (
    <div className="min-h-screen bg-zinc-950 pb-10 text-zinc-100">
      <div className="w-full min-w-0 px-4 pt-6 sm:px-5 sm:pt-8 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
          Popular people
        </h1>
        <p className="mt-1.5 text-sm text-zinc-400 sm:mt-2 sm:text-base">
          Trending and highly searched on TMDB.
        </p>
        <div className="mt-8 min-w-0 sm:mt-10">
          <PersonPopularInfinite initial={data} />
        </div>
      </div>
    </div>
  );
}
