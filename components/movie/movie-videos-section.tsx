'use client';

import { useState } from 'react';

import Image from 'next/image';

import {
  buildYoutubeEmbedUrl,
  type VideoListItemForUi,
} from '@/components/movie/movie-helpers';
import { MediaRow } from '@/components/media/media-row';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Play } from 'lucide-react';

export type VideoCardModel = VideoListItemForUi;

type MovieVideosSectionProps = {
  videos: VideoCardModel[];
  className?: string;
};

/** One fixed column width for every card so thumbs stay identical (MediaRow is horizontal) */
const CARD_WIDTH = 'w-64 min-w-64 sm:w-72 sm:min-w-72';
const thumbSizes = '288px';

export function MovieVideosSection({ videos, className }: MovieVideosSectionProps) {
  const [open, setOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  if (videos.length === 0) return null;

  const openVideo = (key: string) => {
    setActiveKey(key);
    setOpen(true);
  };

  return (
    <div
      id="trailers"
      className={cn('scroll-mt-4 text-zinc-100', className)}
      role="region"
      aria-label="Trailers and videos"
    >
      <MediaRow title="Trailers & more" className="[&>h2]:text-zinc-100">
        {videos.map((v) => (
          <div key={v.key} className={cn('shrink-0 snap-start', CARD_WIDTH)}>
            <Button
              type="button"
              variant="ghost"
              className={cn(
                'h-auto w-full min-w-0 flex-col items-stretch gap-0 p-0',
                'text-left text-inherit hover:bg-transparent',
                'focus-visible:ring-0 focus-visible:ring-offset-0',
              )}
              onClick={() => openVideo(v.key)}
            >
              <div
                className={cn(
                  'relative aspect-video w-full shrink-0 overflow-hidden rounded-md bg-zinc-900 ring-1 ring-zinc-700/90',
                  'transition-transform duration-200 hover:scale-[1.02] focus-visible:scale-[1.02] focus-visible:ring-2 focus-visible:ring-white/50',
                )}
              >
                <Image
                  src={v.thumbnailUrl}
                  alt=""
                  width={640}
                  height={360}
                  className="h-full w-full object-cover"
                  sizes={thumbSizes}
                />
                <span
                  className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors hover:bg-black/40"
                  aria-hidden
                >
                  <span className="flex size-14 items-center justify-center rounded-full bg-white/95 text-zinc-950 shadow-lg">
                    <Play className="size-7 fill-current" aria-hidden />
                  </span>
                </span>
              </div>
              <div className="mt-2.5 w-full min-w-0 self-stretch">
                <p className="line-clamp-2 text-sm font-medium leading-snug text-zinc-100">
                  {v.name}
                </p>
                {v.type ? (
                  <p className="mt-0.5 line-clamp-1 text-xs text-zinc-400">{v.type}</p>
                ) : null}
              </div>
            </Button>
          </div>
        ))}
      </MediaRow>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setActiveKey(null);
        }}
      >
        <DialogContent
          showCloseButton
          className="w-[min(100vw-2rem,56rem)] max-w-[calc(100vw-2rem)] border-zinc-800 bg-zinc-950 p-0 sm:max-w-[min(100vw-2rem,56rem)]"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Video player</DialogTitle>
          </DialogHeader>
          {activeKey && (
            <div className="aspect-video w-full overflow-hidden">
              <iframe
                title="YouTube video"
                src={open ? buildYoutubeEmbedUrl(activeKey) : undefined}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
