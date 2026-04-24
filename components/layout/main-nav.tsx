import Link from 'next/link';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';

const items = [
  { href: '/movies', label: 'Movies' },
  { href: '/tv', label: 'TV' },
  { href: '/persons', label: 'Persons' },
  { href: '/watchlist', label: 'Watchlist' },
] as const;

export function MainNav({ className }: { className?: string }) {
  return (
    <NavigationMenu className={cn('max-w-none justify-start', className)} viewport={false}>
      <NavigationMenuList className="flex flex-wrap gap-0">
        {items.map((item) => (
          <NavigationMenuItem key={item.href}>
            <NavigationMenuLink asChild>
              <Link href={item.href} className={navigationMenuTriggerStyle()}>
                {item.label}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export function MainNavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {items.map((item) => (
        <Button key={item.href} variant="ghost" className="justify-start" asChild>
          <Link href={item.href} onClick={onNavigate}>
            {item.label}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
