'use client';

import { SignInButton } from '@clerk/nextjs';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function WatchlistSignInPrompt() {
  return (
    <Card className="border-zinc-800 bg-zinc-900/80 text-zinc-100">
      <CardHeader>
        <CardTitle className="text-zinc-50">Your watchlist</CardTitle>
        <CardDescription className="text-zinc-400">
          Sign in to see everything you have saved across devices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignInButton mode="modal">
          <Button type="button" variant="default">
            Sign in
          </Button>
        </SignInButton>
      </CardContent>
    </Card>
  );
}
