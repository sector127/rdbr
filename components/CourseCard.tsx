import Image from "next/image";
import Link from "next/link";
import { Button } from "./Button";

export interface CourseCardProps {
  id?: number;
  title: string;
  lecturer: string;
  rating: number;
  price: number;
  imageUrl?: string;
  blurred?: boolean;
  description?: string;
  progress?: number;
  category?: string;
  durationWeeks?: number;
  hideDescription?: boolean;
}

export function CourseCard({ id, title, lecturer, rating, price, imageUrl, blurred, description, progress, category, durationWeeks, hideDescription }: CourseCardProps) {
  // If progress is defined or blurred is true, use the horizontal layout
  const isHorizontal = progress !== undefined || blurred;

  if (isHorizontal) {
    return (
      <div className={`flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-4 md:p-5 gap-5 transition-all hover:shadow-md ${blurred ? 'blur-sm opacity-65 pointer-events-none' : ''}`}>
        {/* Left: Thumbnail image */}
        <div className="flex gap-4">
        <div className="relative w-[140px] h-[123px] shrink-0 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {imageUrl ? (
            <Image src={imageUrl} alt={title} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-indigo-900 to-zinc-950 flex items-center justify-center">
               <svg className="w-8 h-8 text-indigo-400 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                 <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                 <line x1="8" y1="21" x2="16" y2="21"></line>
                 <line x1="12" y1="17" x2="12" y2="21"></line>
               </svg>
            </div>
          )}
        </div>
        {/* Right: Content */}
        <div className="flex flex-col grow py-0.5">
          {/* Top row: Lecturer & Rating */}
          <div className="flex justify-between items-start mb-1">
            <span className="text-sm font-medium text-gray-500 dark:text-zinc-500">
              Lecturer <span className="text-gray-500 dark:text-zinc-300 ml-1">{lecturer}</span>
            </span>
            <span className="flex items-center gap-1.5 font-bold text-gray-600 dark:text-zinc-400 text-sm">
              <svg viewBox="0 0 20 20" fill="#DFB300" className="w-4 h-4">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {rating}
            </span>
          </div>
          {/* Title */}
          <h3 className="text-xl md:text-xl font-bold text-gray-900 dark:text-white leading-tight mb-4 line-clamp-2">
            {title}
          </h3>
          {/* Bottom row: Progress & Button */}
        </div>
        </div>
          <div className="mt-auto flex items-end gap-6 justify-between">
            <div className="grow">
              <div className="text-xs font-bold text-gray-900 dark:text-zinc-300 mb-2">
                {progress || 0}% Complete
              </div>
              <div className="w-full bg-indigo-50 dark:bg-zinc-800 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-indigo-500 dark:bg-indigo-500 h-full rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progress || 0}%` }}
                ></div>
              </div>
            </div>
            <Link href={`/courses/${id || '#'}`}>
              <Button variant="outline" className="px-7 py-2 w-[90px] h-[48px] border-indigo-400 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 rounded-xl">
                View
              </Button>
            </Link>
          </div>
      </div>
    );
  }

  // Default Vertical Layout (for Featured/Catalog)
  return (
    <div className={`flex flex-col bg-white overflow-hidden rounded-xl border border-zinc-200 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900`}>
      <div className="relative h-68 w-full bg-white dark:bg-zinc-800 p-4 pt-4">
        {imageUrl ? (
          <div className="absolute inset-2 md:inset-4 rounded-lg overflow-hidden shadow-inner">
            <Image src={imageUrl} alt={title} fill className="object-cover" />
          </div>
        ) : (
          <div className="absolute inset-2 md:inset-4 rounded-lg bg-linear-to-br from-indigo-900 to-zinc-900 overflow-hidden shadow-inner flex flex-col">
             <div className="text-xs text-green-400 font-mono p-4 opacity-50 whitespace-pre">
               {`const app = express();
app.get('/', (req, res) => {
  res.send('Hello World!');
});`}
             </div>
             <div className="h-full bg-zinc-950 opacity-40"></div>
          </div>
        )}
      </div>
      
      <div className="flex flex-col grow p-6">
        <div className="flex justify-between items-start mb-2 text-xs">
          <span className="text-gray-500 text-sm font-medium">
            <span className="text-zinc-800 dark:text-zinc-300">Lecturer {lecturer}</span>
            {durationWeeks && <span className="mx-1.5 text-zinc-300 dark:text-zinc-600">|</span>}
            {durationWeeks && <span>{durationWeeks} Weeks</span>}
          </span>
          <span className="flex items-center gap-1 font-bold text-gray-600">
            <svg viewBox="0 0 20 20" fill="#DFB300" className="w-4 h-4">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {rating}
          </span>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-3">
          {title}
        </h3>
        
        {category && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-300">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
              {category}
            </span>
          </div>
        )}

        {!hideDescription && (
          <p className="text-[16px] text-gray-500 dark:text-zinc-400 mb-6 grow line-clamp-3">
            {description || "Master modern React patterns, hooks, and TypeScript integration for building scalable web applications."}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">Starting from</span>
            <span className="text-[32px] font-semibold text-gray-900 dark:text-white">${price}</span>
          </div>
          <Link href={`/courses/${id || '#'}`}>
            <Button variant="solid" className="text-xl px-5 w-[116px] h-[58px]">Details</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
