import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

const profileSizes =
  '(max-width: 639px) 90vw, (max-width: 767px) 22rem, (max-width: 1023px) 28rem, (max-width: 1279px) 32rem, (max-width: 1535px) 34rem, 36rem';

type PersonCardProps = {
  id: number;
  name: string;
  profileUrl: string;
  knownForDepartment?: string | null;
  className?: string;
};

export function PersonCard({
  id,
  name,
  profileUrl,
  knownForDepartment,
  className,
}: PersonCardProps) {
  return (
    <Link
      href={`/person/${id}`}
      prefetch={false}
      className={cn(
        'group block w-full no-underline select-none',
        'cursor-pointer rounded-md ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      aria-label={knownForDepartment ? `${name}, ${knownForDepartment}` : name}
    >
      <div
        className={cn(
          'relative aspect-2/3 w-full overflow-hidden rounded-md bg-zinc-800/80 ring-1 ring-zinc-700/70',
          'transition-transform duration-200',
          'group-hover:scale-[1.02] group-focus-visible:scale-[1.02]',
        )}
      >
        <Image
          src={profileUrl}
          alt=""
          width={500}
          height={750}
          className="h-full w-full object-cover"
          sizes={profileSizes}
          draggable={false}
        />
      </div>
      <p className="mt-1.5 line-clamp-2 text-sm font-medium text-zinc-100 sm:mt-2 sm:text-base">
        {name}
      </p>
      {knownForDepartment ? (
        <p className="mt-0.5 line-clamp-1 text-xs text-zinc-400 sm:text-sm">{knownForDepartment}</p>
      ) : null}
    </Link>
  );
}
