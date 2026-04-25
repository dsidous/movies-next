import Image from 'next/image';

import { cn } from '@/lib/utils';
import type { PersonDetails } from '@services/tmdb/person/schema';

const profileSizes = '(max-width: 768px) 45vw, 16rem';

function formatListDate(s: string | null | undefined) {
  if (!s?.trim()) return null;
  const d = s.includes('T') ? new Date(s) : new Date(`${s}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function biographyToParagraphs(biography: string): string[] {
  const parts = biography.split(/\n\s*\n/);
  return parts.map((p) => p.trim()).filter(Boolean);
}

type PersonHeroProps = {
  person: PersonDetails;
  className?: string;
};

export function PersonHero({ person, className }: PersonHeroProps) {
  const { name, known_for_department, biography, birthday, deathday, place_of_birth, profileUrl } =
    person;

  const birthLine = formatListDate(birthday);
  const deathLine = formatListDate(deathday);
  const rawBio = biography?.trim() ?? '';
  const fromSplits = rawBio ? biographyToParagraphs(rawBio) : [];
  const bioParagraphs = fromSplits.length > 0 ? fromSplits : rawBio ? [rawBio] : [];

  return (
    <section
      className={cn('w-full border-b border-zinc-800/80 pb-8 sm:pb-10', className)}
      aria-label={name}
    >
      <div
        className={cn(
          'grid w-full min-w-0 grid-cols-1 gap-8 sm:gap-9',
          'md:grid-cols-[min(100%,12rem)_minmax(0,1fr)] md:items-start md:gap-8',
          'lg:grid-cols-[min(100%,15rem)_minmax(0,1fr)] lg:gap-10',
          'xl:grid-cols-[17rem_minmax(0,1fr)]',
        )}
      >
        <div
          className={cn(
            'mx-auto w-full max-w-52 overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-zinc-800/90',
            'shrink-0 md:mx-0 md:max-w-none md:justify-self-start',
          )}
        >
          <div className="relative aspect-2/3 w-full">
            <Image
              src={profileUrl}
              alt=""
              fill
              className="object-cover"
              sizes={profileSizes}
              priority
            />
          </div>
        </div>

        <div
          className={cn(
            'flex w-full min-w-0 flex-col gap-5 text-pretty',
            'text-center sm:gap-6 md:text-left',
          )}
        >
          <header className="shrink-0 space-y-1.5 sm:space-y-2">
            <h1
              className={cn(
                'text-3xl font-bold tracking-tight text-white [text-shadow:0_2px_24px_rgb(0_0_0/0.75)]',
                'sm:text-4xl md:text-5xl lg:text-6xl',
              )}
            >
              {name}
            </h1>
            {known_for_department && (
              <p className="text-sm font-medium text-zinc-400 sm:text-base">
                {known_for_department}
              </p>
            )}
            <div className="space-y-1.5 pt-2 text-sm text-zinc-300/95 sm:pt-3 sm:text-base">
              {place_of_birth && <p className="text-balance text-zinc-400">{place_of_birth}</p>}
              {birthLine && (
                <p>
                  Born <time dateTime={birthday ?? undefined}>{birthLine}</time>
                  {deathLine ? (
                    <>
                      {' '}
                      · Died <time dateTime={deathday ?? undefined}>{deathLine}</time>
                    </>
                  ) : null}
                </p>
              )}
              {!birthLine && deathLine && (
                <p>
                  Died <time dateTime={deathday ?? undefined}>{deathLine}</time>
                </p>
              )}
            </div>
          </header>

          {bioParagraphs.length > 0 ? (
            <article className="w-full min-w-0 border-t border-zinc-800/80 pt-5 text-left sm:pt-0 md:mt-1 md:border-t-0 md:pt-0">
              <h2 className="mb-3 text-xs font-semibold tracking-wider text-zinc-500 uppercase sm:mb-4">
                Biography
              </h2>
              <div className="w-full max-w-full min-w-0 space-y-4 sm:space-y-5">
                {bioParagraphs.map((para, i) => (
                  <p
                    key={i}
                    className="text-sm leading-7 whitespace-pre-line text-zinc-300/95 sm:text-base sm:leading-8"
                  >
                    {para}
                  </p>
                ))}
              </div>
            </article>
          ) : null}
        </div>
      </div>
    </section>
  );
}
