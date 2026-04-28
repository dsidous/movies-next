import type { Metadata } from 'next';

import {
  moviesBrowseStateToDiscoverQuery,
  parseMoviesBrowseSearchParams,
} from '@/lib/movies-discover-search-params';
import { discoverMovies, getMovieGenres } from '@services/tmdb';

import { MovieDiscoverCard } from '@/components/movies/movie-discover-card';
import { MoviesFilters } from '@/components/movies/movies-filters';
import { MoviesPagination } from '@/components/movies/movies-pagination';

export const metadata: Metadata = {
  title: 'Browse movies | Movie Search',
  description:
    'Discover movies from TMDB — sort by popularity, rating, or release date, filter by genre, year, and score.',
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MoviesPage({ searchParams }: PageProps) {
  const raw = (await searchParams) ?? {};
  const browseState = parseMoviesBrowseSearchParams(raw);
  const query = moviesBrowseStateToDiscoverQuery(browseState);

  const [genres, data] = await Promise.all([getMovieGenres(), discoverMovies(query)]);

  const genreMap = new Map(genres.map((g) => [g.id, g.name]));

  return (
    <div className="w-full min-w-0 px-4 py-8 md:px-6 lg:px-10">
      <header className="mb-8 w-full space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Movies</h1>
        <p className="text-muted-foreground">
          Explore releases with filters for sort order, genres, release year, and rating. Results
          come from TMDB&apos;s discover API and update when you change settings.
        </p>
      </header>

      <div className="mb-10 w-full">
        <MoviesFilters genres={genres} state={browseState} />
      </div>

      {data.results.length === 0 ? (
        <div className="w-full rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <p className="text-lg font-medium text-foreground">No movies match these filters</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a lower minimum rating, fewer genres, or set release year and rating back to “Any”.
          </p>
        </div>
      ) : (
        <>
          <ul
            className="grid w-full list-none grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] content-start justify-items-stretch gap-3 sm:gap-4"
            role="list"
          >
            {data.results.map((movie) => (
              <li
                key={movie.id}
                className="w-full max-w-full min-w-0 only:max-w-148 only:justify-self-start"
              >
                <MovieDiscoverCard movie={movie} genreMap={genreMap} />
              </li>
            ))}
          </ul>

          <div className="mt-12 w-full">
            <MoviesPagination
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
