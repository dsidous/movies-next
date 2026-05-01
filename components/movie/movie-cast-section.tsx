import Image from 'next/image';
import Link from 'next/link';

import { MediaRow } from '@/components/media/media-row';
import { cn } from '@/lib/utils';
import type { CastDisplayItem } from '@services/tmdb/movie/schema';

export type CastRowItem = CastDisplayItem;

const posterSizes = '(max-width: 640px) 25vw, 9rem';

type MovieCastSectionProps = {
  cast: CastRowItem[];
  className?: string;
};

export function MovieCastSection({ cast, className }: MovieCastSectionProps) {
  if (cast.length === 0) return null;

  return (
    <div className={cn('text-zinc-100', className)}>
      <MediaRow title="Cast" className="[&>h2]:text-zinc-100">
        {cast.map((c) => (
          <Link
            key={c.creditId || `${c.id}-${c.name}`}
            href={`/person/${c.id}`}
            prefetch={false}
            className="group w-32 shrink-0 snap-start"
          >
            <div
              className={cn(
                'relative aspect-2/3 w-full overflow-hidden rounded-md bg-zinc-800 ring-1 ring-zinc-700/80',
                'transition-transform duration-200 group-hover:scale-[1.03] group-focus-visible:scale-[1.03] group-focus-visible:ring-2 group-focus-visible:ring-white/40',
              )}
            >
              {c.profileUrl ? (
                <Image
                  src={c.profileUrl}
                  alt=""
                  width={300}
                  height={450}
                  className="h-full w-full object-cover"
                  sizes={posterSizes}
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-xs text-zinc-500"
                  aria-hidden
                >
                  No photo
                </div>
              )}
            </div>
            <p className="mt-2 line-clamp-1 text-sm font-medium leading-tight">{c.name}</p>
            {c.character && (
              <p className="mt-0.5 line-clamp-2 text-xs text-zinc-400">{c.character}</p>
            )}
          </Link>
        ))}
      </MediaRow>
    </div>
  );
}
