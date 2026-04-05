import Image from "next/image";
import Link from "next/link";
import { Button } from "./Button";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto flex py-6 max-w-[1566px] items-center justify-between px-4 lg:px-0">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Logo"
              width={60}
              height={60}
              className="rounded-md"
            />
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-xl font-medium text-gray-600 hover:text-black dark:text-zinc-300 dark:hover:text-white transition-colors">
            <Image src="/icons/BrowseCourses.svg" alt="Browse Courses" width={26} height={26} className="dark:invert" />
            Browse Courses
          </button>
          
          <div className="hidden sm:flex items-center gap-4 ml-4">
            {/* <ThemeToggle /> */}
            <Button variant="outline" className="w-[114px] h-[60px] text-xl border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 border">Log In</Button>
            <Button variant="solid" className="w-[125px] h-[60px] text-xl">Sign Up</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
