export default function CourseDetailLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Hero Skeleton */}
      <div className="h-[400px] w-full bg-zinc-200 dark:bg-zinc-900"></div>
      
      <div className="max-w-[1566px] mx-auto py-12 px-4 flex flex-col lg:flex-row gap-12">
        {/* Main Content Skeleton */}
        <div className="flex-1 space-y-8">
          <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-3/4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-zinc-100 dark:bg-zinc-900 rounded w-full"></div>
            <div className="h-4 bg-zinc-100 dark:bg-zinc-900 rounded w-full"></div>
            <div className="h-4 bg-zinc-100 dark:bg-zinc-900 rounded w-5/6"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-900 rounded-2xl"></div>
            ))}
          </div>
        </div>

        {/* Sidebar Panel Skeleton */}
        <div className="w-full lg:w-[530px] h-[600px] bg-zinc-100 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800"></div>
      </div>
    </div>
  );
}
