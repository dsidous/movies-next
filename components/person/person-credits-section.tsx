import { MediaCard } from '@/components/media/media-card';
import { watchlistLookupKey } from '@/lib/watchlist-key';
import { cn } from '@/lib/utils';
import type { PersonCreditCardItem } from '@services/tmdb/person/schema';

const SECTION_CAP = 48;

const creditGridClass =
  'grid w-full [grid-template-columns:repeat(auto-fit,minmax(9.5rem,1fr))] content-start justify-items-stretch gap-3 sm:gap-4';

function PersonCreditSubsection({
  id,
  title,
  items,
  watchlistedKeys,
  className,
}: {
  id: string;
  title: string;
  items: PersonCreditCardItem[];
  watchlistedKeys: string[];
  className?: string;
}) {
  if (items.length === 0) return null;

  const saved = new Set(watchlistedKeys);

  return (
    <section className={cn('min-w-0', className)} aria-labelledby={id}>
      <h2
        id={id}
        className="mb-3 text-base font-semibold tracking-tight text-zinc-100 sm:mb-4 sm:text-lg"
      >
        {title}
      </h2>
      <ul className={creditGridClass}>
        {items.map((c) => (
          <li
            key={`${c.type}-${c.id}`}
            className="w-full max-w-full min-w-0 only:max-w-44 only:justify-self-start"
          >
            <MediaCard
              id={c.id}
              type={c.type}
              title={c.title}
              year={c.year}
              posterUrl={c.posterUrl}
              voteAverage={c.vote_average}
              voteCount={c.vote_count}
              subtitle={c.character || undefined}
              className="w-full! max-w-full min-w-0 snap-none"
              isWatchlisted={saved.has(watchlistLookupKey(c.type, c.id))}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

type PersonCreditsSectionProps = {
  items: PersonCreditCardItem[];
  watchlistedKeys: string[];
  className?: string;
};

export function PersonCreditsSection({ items, watchlistedKeys, className }: PersonCreditsSectionProps) {
  const movies: PersonCreditCardItem[] = [];
  const series: PersonCreditCardItem[] = [];
  for (const c of items) {
    if (c.type === 'movie') movies.push(c);
    else if (c.type === 'tv') series.push(c);
  }

  const movieSlice = movies.slice(0, SECTION_CAP);
  const tvSlice = series.slice(0, SECTION_CAP);

  if (movieSlice.length === 0 && tvSlice.length === 0) return null;

  return (
    <section
      className={cn('text-zinc-100', className)}
      aria-label="Acting and appearances by medium"
    >
      <div className="flex flex-col gap-10 sm:gap-12">
        <PersonCreditSubsection
          id="person-credits-movies"
          title="Movies"
          items={movieSlice}
          watchlistedKeys={watchlistedKeys}
        />
        <PersonCreditSubsection
          id="person-credits-tv"
          title="TV shows"
          items={tvSlice}
          watchlistedKeys={watchlistedKeys}
        />
      </div>
    </section>
  );
}
