'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import { getTvSeasonAction, type TvSeasonPayload } from '@/lib/actions/tv';
import type { SeasonSummary } from '@/lib/tv-helpers';
import { cn } from '@/lib/utils';
import type { TvEpisode } from '@services/tmdb/tv/schema';
import { Loader2 } from 'lucide-react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

type TvSeasonsPageClientProps = {
  seriesId: number;
  seriesName: string;
  seasons: SeasonSummary[];
  className?: string;
};

function seasonSubtitle(s: SeasonSummary) {
  const parts: string[] = [];
  if (s.episodeCount > 0) {
    parts.push(`${s.episodeCount} episode${s.episodeCount === 1 ? '' : 's'}`);
  }
  if (s.airDate && s.airDate.length >= 4) {
    const y = s.airDate.slice(0, 4);
    parts.push(`First air ${y}`);
  }
  return parts.join(' · ') || null;
}

function formatAir(iso: string | null | undefined) {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(t);
}

function seasonValue(n: number) {
  return `season-${n}`;
}

function SeasonEpisodesPanel({
  seriesId,
  seasonNumber,
  isExpanded,
}: {
  seriesId: number;
  seasonNumber: number;
  isExpanded: boolean;
}) {
  const [data, setData] = useState<TvSeasonPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setError(null);
    const res = await getTvSeasonAction(seriesId, seasonNumber);
    if (!res.ok) {
      setData(null);
      setError(res.error);
    } else {
      setData(res.data);
    }
    setLoading(false);
    inFlight.current = false;
  }, [seriesId, seasonNumber]);

  useEffect(() => {
    if (!isExpanded) return;
    if (data) return;
    void load();
  }, [isExpanded, data, load]);

  const episodes: TvEpisode[] = data?.episodes ?? [];
  const sorted = [...episodes].sort((a, b) => a.episode_number - b.episode_number);

  if (!isExpanded) {
    return null;
  }

  return (
    <div className="pb-1">
      {loading && (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-zinc-400">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading episodes…
        </div>
      )}
      {error && !loading && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-sm text-red-400">{error}</p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              setData(null);
              setError(null);
            }}
          >
            Retry
          </Button>
        </div>
      )}
      {!loading && !error && sorted.length === 0 && (
        <p className="py-8 text-center text-sm text-zinc-500">No episodes in this season.</p>
      )}
      {!loading && !error && sorted.length > 0 && (
        <ol className="divide-y divide-zinc-800/90">
          {sorted.map((ep) => {
            const sub = [formatAir(ep.air_date), ep.runtime ? `${ep.runtime}m` : null]
              .filter(Boolean)
              .join(' · ');
            return (
              <li key={ep.id} className="flex gap-3 py-3 first:pt-1 last:pb-0 sm:gap-4">
                <div
                  className="relative h-14 w-24 shrink-0 overflow-hidden rounded-md bg-zinc-800 sm:h-16 sm:w-28"
                  aria-hidden
                >
                  {ep.stillUrl != null && ep.stillUrl !== '' ? (
                    <Image
                      src={ep.stillUrl as string}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-100">
                    <span className="text-zinc-500">E{ep.episode_number}.</span> {ep.name}
                  </p>
                  {sub ? <p className="mt-0.5 text-xs text-zinc-500 sm:text-sm">{sub}</p> : null}
                  {ep.overview?.trim() ? (
                    <p className="mt-1.5 text-xs leading-relaxed text-zinc-400 sm:text-sm">
                      {ep.overview.trim()}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export function TvSeasonsPageClient({ seriesId, seriesName, seasons, className }: TvSeasonsPageClientProps) {
  const [open, setOpen] = useState<string[]>([]);

  if (seasons.length === 0) {
    return <p className="text-sm text-zinc-500">No season information available.</p>;
  }

  return (
    <div className={cn('w-full min-w-0', className)}>
      <h2 className="mb-4 text-lg font-semibold text-zinc-100 sm:text-xl">Seasons</h2>
      <p className="mb-4 text-sm text-zinc-500">
        Expand a season to load and read every episode — {seriesName}.
      </p>
      <Accordion
        type="multiple"
        defaultValue={[]}
        onValueChange={setOpen}
        className="w-full space-y-3"
      >
        {seasons.map((s) => {
          const sub = seasonSubtitle(s);
          const val = seasonValue(s.seasonNumber);
          const expanded = open.includes(val);
          return (
            <AccordionItem
              key={s.seasonNumber}
              value={val}
              className="rounded-lg border border-zinc-800 bg-zinc-900/35 px-1 data-[state=open]:border-zinc-700/90 data-[state=open]:bg-zinc-900/55 sm:px-2"
            >
              <AccordionTrigger className="px-3 py-4 text-zinc-100 hover:no-underline sm:px-4">
                <span className="min-w-0 flex-1 text-left">
                  <span className="block font-medium">{s.name}</span>
                  {sub ? <span className="mt-0.5 block text-xs font-normal text-zinc-500 sm:text-sm">{sub}</span> : null}
                </span>
              </AccordionTrigger>
              <AccordionContent className="border-t border-zinc-800/80 px-3 sm:px-4">
                <SeasonEpisodesPanel
                  seriesId={seriesId}
                  seasonNumber={s.seasonNumber}
                  isExpanded={expanded}
                />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
