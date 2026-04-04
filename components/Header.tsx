import Image from "next/image";
import Link from "next/link";
import { Button } from "./Button";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto flex h-16 max-w-[1566px] items-center justify-between px-4 lg:px-0">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="rounded-md"
            />
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-sm font-medium text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white transition-colors">
            <Image src="/icons/BrowseCourses.svg" alt="Browse Courses" width={20} height={20} className="dark:invert" />
            Browse Courses
          </button>
          
          <div className="hidden sm:flex items-center gap-4 ml-4">
            <ThemeToggle />
            <Button variant="outline" className="border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 border">Log In</Button>
            <Button variant="solid">Sign Up</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
