import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  enrichPersonCombinedCastForDisplay,
  getConfiguration,
  getPerson,
  getPersonCombinedCredits,
} from '@services/tmdb';

import { parseMovieIdParam } from '@/components/movie/movie-helpers';
import { PersonCreditsSection } from '@/components/person/person-credits-section';
import { PersonHero } from '@/components/person/person-hero';
import { SITE_NAME } from '@/lib/constants/site';
import { getWatchlistedKeys } from '@/lib/watchlisted-keys';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: raw } = await params;
  const id = parseMovieIdParam(raw);
  if (id == null) return { title: 'Person' };
  try {
    const person = await getPerson(id);
    return {
      title: `${person.name} | ${SITE_NAME}`,
      description:
        person.biography?.trim().slice(0, 180) || `Profile and credits for ${person.name}`,
    };
  } catch {
    return { title: 'Person' };
  }
}

export default async function PersonDetailPage({ params }: PageProps) {
  const { id: raw } = await params;
  const id = parseMovieIdParam(raw);
  if (id == null) notFound();

  const data = await Promise.all([
    getPerson(id),
    getPersonCombinedCredits(id),
    getConfiguration(),
    getWatchlistedKeys(),
  ]).catch(() => null);

  if (data === null) notFound();

  const [person, combined, { images }, watchlistedKeys] = data;
  const { imageBaseUrl } = images;

  const creditItems = enrichPersonCombinedCastForDisplay(combined.cast, imageBaseUrl);

  return (
    <div className="min-h-screen bg-zinc-950 pb-10 text-zinc-100">
      <div className="w-full min-w-0 px-4 pt-6 sm:px-5 sm:pt-8 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <PersonHero person={person} />
        <div className="mt-8 space-y-8 sm:mt-10 sm:space-y-10">
          <PersonCreditsSection items={creditItems} watchlistedKeys={watchlistedKeys} />
        </div>
      </div>
    </div>
  );
}
