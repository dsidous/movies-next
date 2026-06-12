'use client';

import { Suspense, useEffect, useState } from 'react';

import { usePathname, useSearchParams } from 'next/navigation';

import { Loader2 } from 'lucide-react';

function canonicalRouteKey(pathname: string, params: URLSearchParams) {
  const sorted = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  const q = new URLSearchParams(sorted).toString();
  return q ? `${pathname}?${q}` : pathname;
}

function NavigationLoadingOverlayInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState<string | null>(null);

  const here = canonicalRouteKey(pathname, searchParams);

  const [prevHere, setPrevHere] = useState(here);
  if (here !== prevHere) {
    setPrevHere(here);
    if (pending !== null) {
      setPending(null);
    }
  }

  const visible = pending !== null && pending !== here;

  useEffect(() => {
    const onClickCapture = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;

      // Card-style links often wrap a `<Link>` around a tile; controls inside (e.g. watchlist
      // button) must not arm the "navigating" overlay or it sticks forever when the URL unchanged.
      const nestedControl = target.closest('button, input, textarea, select, [role="button"]');
      if (nestedControl && nestedControl !== anchor) return;
      if (anchor.target === '_blank') return;
      if (anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      if (href.startsWith('mailto:') || href.startsWith('tel:')) return;

      let next: URL;
      try {
        next = new URL(href, window.location.origin);
      } catch {
        return;
      }
      if (next.origin !== window.location.origin) return;

      const dest = canonicalRouteKey(next.pathname, new URLSearchParams(next.search));
      const cur = new URL(window.location.href);
      const curKey = canonicalRouteKey(cur.pathname, new URLSearchParams(cur.search));
      if (dest === curKey) return;

      setPending(dest);
    };

    const onPopState = () => {
      const u = new URL(window.location.href);
      setPending(canonicalRouteKey(u.pathname, new URLSearchParams(u.search)));
    };

    document.addEventListener('click', onClickCapture, true);
    window.addEventListener('popstate', onPopState);
    return () => {
      document.removeEventListener('click', onClickCapture, true);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/55 backdrop-blur-[2px]"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <Loader2 className="size-10 animate-spin text-primary" aria-hidden />
      <span className="sr-only">Loading page</span>
    </div>
  );
}

export function NavigationLoadingOverlay() {
  return (
    <Suspense fallback={null}>
      <NavigationLoadingOverlayInner />
    </Suspense>
  );
}
