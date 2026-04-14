export default function CoursesLoading() {
  return (
    <div className="max-w-[1566px] mx-auto py-10">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 animate-pulse">
        {/* Sidebar Skeleton */}
        <div className="w-full md:w-[320px] shrink-0 space-y-8">
          <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-1/2"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-zinc-100 dark:bg-zinc-900 rounded-lg"></div>
            ))}
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="flex-1 space-y-8">
          <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/5] bg-zinc-100 dark:bg-zinc-900 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
