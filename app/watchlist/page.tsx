import type { Metadata } from 'next';
import Link from 'next/link';

import { auth } from '@clerk/nextjs/server';

import { MediaCard } from '@/components/media/media-card';
import { WatchlistSignInPrompt } from '@/components/watchlist/watchlist-sign-in-prompt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { resolveWatchlistCards } from '@/services/watchlist-cards';
import { watchlistService } from '@/services/watchlist';
import { ensureUserByClerkId } from '@/services/users';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Watchlist | Movie Search',
  description: 'Movies and TV shows you have saved.',
};

const listClass = 'flex list-none flex-wrap gap-4 p-0 sm:gap-5';

export default async function WatchlistPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6 sm:py-16">
        <WatchlistSignInPrompt />
      </div>
    );
  }

  const user = await ensureUserByClerkId(clerkUserId);
  const rows = await watchlistService.getForUser(user.id);
  const cards = await resolveWatchlistCards(rows);

  return (
    <div className="min-h-screen bg-zinc-950 pb-12 text-zinc-100">
      <div className="w-full min-w-0 px-4 pt-8 sm:px-5 sm:pt-10 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <header className="mb-8 max-w-3xl sm:mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
            Your watchlist
          </h1>
          <p className="mt-2 text-sm text-zinc-400 sm:text-base">
            {cards.length === 0
              ? 'Save titles from any movie or TV card with the bookmark control.'
              : `${cards.length} saved ${cards.length === 1 ? 'title' : 'titles'}`}
          </p>
        </header>

        {cards.length === 0 ? (
          <Card className="max-w-lg border-zinc-800 bg-zinc-900/60">
            <CardHeader>
              <CardTitle className="text-lg text-zinc-100">Nothing here yet</CardTitle>
              <CardDescription className="text-zinc-400">
                Browse the homepage or movies and TV sections, then tap the bookmark on a poster to
                add it here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <Link href="/">Browse titles</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ul className={listClass}>
            {cards.map((item) => (
              <li key={item.entryId} className="shrink-0">
                <MediaCard
                  id={item.id}
                  type={item.type}
                  title={item.title}
                  year={item.year}
                  posterUrl={item.posterUrl}
                  voteAverage={item.voteAverage}
                  voteCount={item.voteCount}
                  isWatchlisted
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
