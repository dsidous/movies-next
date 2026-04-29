'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

const items = [
  { href: '/movies', label: 'Movies' },
  { href: '/tv', label: 'TV' },
  { href: '/persons', label: 'Persons' },
  { href: '/watchlist', label: 'Watchlist' },
] as const;

type NavHref = (typeof items)[number]['href'];

function isMainNavActive(pathname: string, href: NavHref): boolean {
  if (pathname === href) return true;
  if (href === '/movies' && pathname.startsWith('/movie/')) return true;
  if (href === '/tv' && pathname.startsWith('/tv')) return true;
  if (href === '/persons' && pathname.startsWith('/person/')) return true;
  return false;
}

const navLinkActive =
  'bg-primary/15 font-semibold text-primary shadow-sm hover:bg-primary/20 hover:text-primary focus:bg-primary/20 focus:text-primary';

export function MainNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <NavigationMenu className={cn('max-w-none justify-start', className)} viewport={false}>
      <NavigationMenuList className="flex flex-wrap gap-0">
        {items.map((item) => {
          const active = isMainNavActive(pathname, item.href);
          return (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink asChild active={active}>
                <Link
                  href={item.href}
                  className={cn(navigationMenuTriggerStyle(), active && navLinkActive)}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export function MainNavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {items.map((item) => {
        const active = isMainNavActive(pathname, item.href);
        return (
          <Button
            key={item.href}
            variant="ghost"
            className={cn('justify-start font-medium', active && navLinkActive)}
            asChild
          >
            <Link href={item.href} onClick={onNavigate} aria-current={active ? 'page' : undefined}>
              {item.label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
