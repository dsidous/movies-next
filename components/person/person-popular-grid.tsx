import { cn } from '@/lib/utils';
import type { PersonPopularListItem } from '@services/tmdb/person/schema';

import { PersonCard } from '@/components/person/person-card';

type PersonPopularGridProps = {
  people: PersonPopularListItem[];
  className?: string;
};

export function PersonPopularGrid({ people, className }: PersonPopularGridProps) {
  if (people.length === 0) {
    return <p className="text-sm text-zinc-400">No people to show right now.</p>;
  }

  return (
    <ul
      className={cn(
        'm-0 w-full list-none p-0',
        'grid w-full content-start justify-items-stretch gap-3 sm:gap-4 md:gap-5',
        'grid-cols-[repeat(auto-fit,minmax(10.5rem,1fr))]',
        'xl:grid-cols-[repeat(auto-fit,minmax(18rem,1fr))]',
        className,
      )}
    >
      {people.map((p) => (
        <li
          key={p.id}
          className="w-full max-w-80 min-w-0 justify-self-start sm:max-w-88 md:max-w-104 lg:max-w-md xl:max-w-lg 2xl:max-w-xl"
        >
          <PersonCard
            id={p.id}
            name={p.name}
            profileUrl={p.profileUrl}
            knownForDepartment={p.known_for_department}
            className="w-full min-w-0"
          />
        </li>
      ))}
    </ul>
  );
}
