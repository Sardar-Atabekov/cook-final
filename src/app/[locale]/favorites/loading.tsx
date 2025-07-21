import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <Skeleton className="h-10 w-48 mx-auto mb-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="space-y-3 rounded-lg border p-2 bg-white shadow-sm"
          >
            <div className="relative w-full h-48">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="absolute top-3 left-3 h-6 w-16 rounded-full" />{' '}
              {/* match badge */}
              <Skeleton className="absolute top-3 right-3 h-8 w-8 rounded-full" />{' '}
              {/* like button */}
            </div>
            <div className="flex items-center justify-between mt-2">
              <Skeleton className="h-4 w-20" /> {/* время */}
              <Skeleton className="h-4 w-12" /> {/* рейтинг */}
            </div>
            <Skeleton className="h-5 w-3/4" /> {/* заголовок */}
            <Skeleton className="h-4 w-full" /> {/* описание */}
            <Skeleton className="h-4 w-1/2" /> {/* ингредиенты/статус */}
          </div>
        ))}
      </div>
    </div>
  );
}
