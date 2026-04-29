'use client';

import { useState } from 'react';

import Link from 'next/link';

import { cn } from '@/lib/utils';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Menu } from 'lucide-react';

import { MainNav, MainNavList } from '@/components/layout/main-nav';
import { MultiSearch } from '@/components/search/multi-search';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export function SiteHeader({ className }: { className?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md',
        className,
      )}
    >
      <div className="flex h-14 w-full min-w-0 items-center gap-3 px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 md:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(100%,20rem)]">
            <SheetHeader>
              <SheetTitle className="text-left">Menu</SheetTitle>
            </SheetHeader>
            <MainNavList onNavigate={() => setMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        <Link href="/" className="shrink-0 text-lg font-semibold tracking-tight">
          Movie Search
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-2 md:flex">
          <MainNav className="flex-1 justify-center" />
        </div>

        <div className="min-w-0 flex-1 md:max-w-md md:flex-none">
          <MultiSearch />
        </div>
        <Show when="signed-out">
          <div className="flex shrink-0 items-center gap-2">
            <SignInButton mode="modal">
              <Button type="button" variant="outline" size="default">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button type="button" variant="default" size="default">
                Sign Up
              </Button>
            </SignUpButton>
          </div>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  );
}
