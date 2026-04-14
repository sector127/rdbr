import Link from "next/link";
import { Button } from "@/components/Button";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
      <div className="relative mb-8">
        <h1 className="text-[120px] font-black text-zinc-100 dark:text-zinc-900 leading-none select-none">404</h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-2xl rotate-12 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 dark:text-indigo-400 -rotate-12">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        </div>
      </div>
      <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-3">Page not found</h2>
      <p className="text-zinc-500 dark:text-zinc-400 mb-10 max-w-sm mx-auto text-lg">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link href="/">
        <Button variant="solid" className="px-10 py-3 text-lg rounded-xl h-auto">
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
