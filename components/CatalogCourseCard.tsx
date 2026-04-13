import Image from "next/image";
import Link from "next/link";
import { Button } from "./Button";
import { CategoryIcon } from "./CategoryIcon";

export interface CatalogCourseCardProps {
  id: number;
  title: string;
  lecturer: string;
  rating: number;
  price: number;
  imageUrl?: string;
  category?: string;
  durationWeeks?: number;
}

export function CatalogCourseCard({
  id,
  title,
  lecturer,
  rating,
  price,
  imageUrl,
  category,
  durationWeeks
}: CatalogCourseCardProps) {
  return (
    <div className="group flex flex-col bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
      {/* Image Container */}
      <div className="p-4 pb-0">
        <div className="relative aspect-16/10 w-full rounded-[18px] overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-inner">
          {imageUrl ? (
            <Image 
              src={imageUrl} 
              alt={title} 
              fill 
              className="object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
              <span className="text-indigo-300 opacity-20 transform -rotate-12">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col grow p-6 pt-5">
        {/* Metadata Row */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-[14px] font-medium text-zinc-400 dark:text-zinc-500">
            <span>{lecturer}</span>
            <span className="h-3 w-px bg-zinc-300 dark:bg-zinc-700"></span>
            <span>{durationWeeks} Weeks</span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
            <svg viewBox="0 0 20 20" fill="#F59E0B" className="w-4 h-4">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-[14px] font-bold text-zinc-700 dark:text-zinc-300">{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[20px] md:text-[22px] font-extrabold text-zinc-900 dark:text-zinc-50 leading-[1.2] mb-5 line-clamp-2 min-h-[52.8px]">
          {title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/50 text-zinc-600 dark:text-zinc-400">
            {category ? (
              <CategoryIcon categoryName={category} className="w-4 h-4 opacity-70" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            )}
            <span className="text-[15px] font-semibold">{category || "General"}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex flex-col -gap-1">
            <span className="text-[13px] font-medium text-zinc-400 dark:text-zinc-500">Starting from</span>
            <span className="text-[32px] font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
              ${price}
            </span>
          </div>
          <Link href={`/courses/${id}`}>
            <Button className="h-[54px] px-8 rounded-[16px] text-[18px] font-bold bg-[#4F46E5] hover:bg-[#4338CA] shadow-lg shadow-indigo-500/20 active:scale-[0.98]">
              Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
