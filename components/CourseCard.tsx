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
  return (
    <div className={`flex flex-col bg-white overflow-hidden rounded-xl border border-zinc-200 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 ${blurred ? 'blur-sm opacity-60 pointer-events-none' : ''}`}>
      <div className="relative h-48 w-full bg-zinc-100 dark:bg-zinc-800 p-4 pt-4">
        {imageUrl ? (
          <div className="absolute inset-2 md:inset-4 rounded-lg overflow-hidden shadow-inner">
            <Image src={imageUrl} alt={title} fill className="object-cover" />
          </div>
        ) : (
          <div className="absolute inset-2 md:inset-4 rounded-lg bg-gradient-to-br from-indigo-900 to-zinc-900 overflow-hidden shadow-inner flex flex-col">
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
      
      <div className="flex flex-col flex-grow p-6">
        <div className="flex justify-between items-start mb-2 text-xs">
          <span className="text-zinc-500 font-medium">
            <span className="text-zinc-800 dark:text-zinc-300">{lecturer}</span>
            {durationWeeks && <span className="mx-1.5 text-zinc-300 dark:text-zinc-600">|</span>}
            {durationWeeks && <span>{durationWeeks} Weeks</span>}
          </span>
          <span className="flex items-center gap-1 font-bold text-amber-500">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {rating}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight mb-3">
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
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 flex-grow line-clamp-3">
            {description || "Master modern React patterns, hooks, and TypeScript integration for building scalable web applications."}
          </p>
        )}

        {progress !== undefined && (
          <div className="mb-4 w-full">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Course Progress</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{progress}% Complete</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
          {progress === undefined ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-zinc-400">Starting from</span>
                <span className="text-xl font-bold text-zinc-900 dark:text-white">${price}</span>
              </div>
              <Link href={`/courses/${id || '#'}`}>
                <Button variant="solid" className="px-5">View Details</Button>
              </Link>
            </>
          ) : (
            <Link href={`/courses/${id || '#'}`} className="w-full">
              <Button variant="solid" className="w-full">Continue</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
