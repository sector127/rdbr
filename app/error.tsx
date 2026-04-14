"use client";

import { useEffect } from "react";
import { Button } from "@/components/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Something went wrong</h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md">
        We encountered an error while loading this page. Please try refreshing or come back later.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="solid" className="px-8">
          Try Again
        </Button>
        <Button onClick={() => window.location.href = "/"} variant="outline" className="px-8">
          Go Home
        </Button>
      </div>
    </div>
  );
}
