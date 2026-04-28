import type { Metadata } from 'next';

import {
  parseTvBrowseSearchParams,
  tvBrowseStateToDiscoverQuery,
} from '@/lib/tv-discover-search-params';
import { discoverTv, getTvGenres } from '@services/tmdb';

import { TvDiscoverCard } from '@/components/tv/tv-discover-card';
import { TvDiscoverFilters } from '@/components/tv/tv-discover-filters';
import { TvDiscoverPagination } from '@/components/tv/tv-discover-pagination';

export const metadata: Metadata = {
  title: 'Browse TV series | Movie Search',
  description:
    'Discover TV shows from TMDB — sort by popularity, rating, or first air date, filter by genre, year, and score.',
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TvDiscoverPage({ searchParams }: PageProps) {
  const raw = (await searchParams) ?? {};
  const browseState = parseTvBrowseSearchParams(raw);
  const query = tvBrowseStateToDiscoverQuery(browseState);

  const [genres, data] = await Promise.all([getTvGenres(), discoverTv(query)]);

  const genreMap = new Map(genres.map((g) => [g.id, g.name]));

  return (
    <div className="w-full min-w-0 px-4 py-8 md:px-6 lg:px-10">
      <header className="mx-auto mb-8 max-w-6xl space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">TV series</h1>
        <p className="max-w-2xl text-muted-foreground">
          Explore shows with filters for sort order, genres, first air year, and minimum rating.
          Results come from TMDB&apos;s discover API and update when you change settings.
        </p>
      </header>

      <div className="mx-auto mb-10 max-w-6xl">
        <TvDiscoverFilters genres={genres} state={browseState} />
      </div>

      {data.results.length === 0 ? (
        <div className="mx-auto max-w-6xl rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <p className="text-lg font-medium text-foreground">No series match these filters</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a lower minimum rating, fewer genres, or set first air year and rating back to
            “Any”.
          </p>
        </div>
      ) : (
        <>
          <ul
            className="mx-auto grid max-w-6xl list-none grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            role="list"
          >
            {data.results.map((show) => (
              <li key={show.id}>
                <TvDiscoverCard show={show} genreMap={genreMap} />
              </li>
            ))}
          </ul>

          <div className="mx-auto mt-12 max-w-6xl">
            <TvDiscoverPagination
              state={browseState}
              totalPages={data.total_pages}
              totalResults={data.total_results}
            />
          </div>
        </>
      )}
    </div>
  );
}
