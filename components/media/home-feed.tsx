import type { MovieListItem } from '@services/tmdb/movie/schema';
import type { TvListItem } from '@services/tmdb/tv/schema';

import { MediaCard } from '@/components/media/media-card';
import { MediaRow } from '@/components/media/media-row';

const ROW_CAP = 18;

type MovieRow = { kind: 'movie'; title: string; items: MovieListItem[] };
type TvRow = { kind: 'tv'; title: string; items: TvListItem[] };
export type HomeFeedRow = MovieRow | TvRow;

type HomeFeedProps = {
  rows: HomeFeedRow[];
};

export function HomeFeed({ rows }: HomeFeedProps) {
  return (
    <div className="w-full min-w-0 space-y-6 px-4 pt-2 pb-8 sm:space-y-8 sm:px-5 sm:pb-10 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
      {rows.map((row) => {
        const slice = row.items.slice(0, ROW_CAP);
        if (slice.length === 0) return null;

        if (row.kind === 'movie') {
          const movies = slice as MovieListItem[];
          return (
            <MediaRow key={row.title} title={row.title}>
              {movies.map((m) => (
                <MediaCard
                  key={m.id}
                  id={m.id}
                  type="movie"
                  title={m.title}
                  year={m.releaseYear}
                  posterUrl={m.posterUrl}
                />
              ))}
            </MediaRow>
          );
        }

        const series = slice as TvListItem[];
        return (
          <MediaRow key={row.title} title={row.title}>
            {series.map((t) => (
              <MediaCard
                key={t.id}
                id={t.id}
                type="tv"
                title={t.name}
                year={t.firstAirYear}
                posterUrl={t.posterUrl}
              />
            ))}
          </MediaRow>
        );
      })}
    </div>
  );
}
