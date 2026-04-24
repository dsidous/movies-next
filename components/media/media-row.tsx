'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

const EDGE_EPS = 2;

type MediaRowProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function MediaRow({ title, children, className }: MediaRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    if (scrollWidth <= clientWidth + EDGE_EPS) {
      setShowLeft(false);
      setShowRight(false);
      return;
    }
    const max = scrollWidth - clientWidth;
    setShowLeft(scrollLeft > EDGE_EPS);
    setShowRight(scrollLeft < max - EDGE_EPS);
  }, []);

  const scrollByPage = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85 * direction;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      updateArrows();
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(updateArrows);
    });
    ro.observe(el);

    requestAnimationFrame(updateArrows);

    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
  }, [updateArrows]);

  return (
    <section className={cn('space-y-0 sm:space-y-1', className)} aria-label={title}>
      <h2 className="mb-1.5 text-base font-semibold tracking-tight text-foreground sm:mb-2 sm:text-lg">
        {title}
      </h2>
      <div className="relative">
        {showLeft && (
          <>
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-12 bg-linear-to-r from-background via-background/80 to-transparent sm:block"
              aria-hidden
            />
            <div className="absolute top-1/2 left-0 z-30 hidden -translate-y-1/2 pl-0.5 sm:block sm:pl-0">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="size-9 rounded-full border border-border/60 bg-background/90 shadow-md backdrop-blur-sm"
                onClick={() => scrollByPage(-1)}
                aria-label={`Scroll “${title}” left`}
              >
                <ChevronLeft className="size-5" />
              </Button>
            </div>
          </>
        )}

        {showRight && (
          <>
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-12 bg-linear-to-l from-background via-background/80 to-transparent sm:block"
              aria-hidden
            />
            <div className="absolute top-1/2 right-0 z-30 hidden -translate-y-1/2 pr-0.5 sm:block sm:pr-0">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="size-9 rounded-full border border-border/60 bg-background/90 shadow-md backdrop-blur-sm"
                onClick={() => scrollByPage(1)}
                aria-label={`Scroll “${title}” right`}
              >
                <ChevronRight className="size-5" />
              </Button>
            </div>
          </>
        )}

        <div
          ref={scrollerRef}
          className={cn(
            'flex min-h-0 snap-x snap-proximity gap-4 overflow-x-auto overflow-y-hidden py-0.5 pe-3 sm:pe-4',
            'scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden',
            'touch-pan-x',
            'sm:px-0.5',
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
