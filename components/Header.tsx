import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuthButtons } from "./AuthModals";

export async function Header() {
  const session = await getServerSession(authOptions);
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

        <div className="flex items-center gap-6">
          <Link href="/courses" className="flex items-center gap-2 text-xl font-medium text-gray-600 hover:text-black dark:text-zinc-300 dark:hover:text-white transition-colors">
            <Image src="/icons/BrowseCourses.svg" alt="Browse Courses" width={26} height={26} className="dark:invert" />
            Browse Courses
          </Link>

          {session && (
            <Link href="?enrolled=true" className="flex items-center gap-2 text-xl font-medium text-gray-600 hover:text-black dark:text-zinc-300 dark:hover:text-white transition-colors">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="dark:invert">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                <polyline points="9 7 13 10 9 13" />
              </svg>
              Enrolled Courses
            </Link>
          )}

          <div className="hidden sm:flex items-center gap-4 ml-2">
            {session ? (
              <div className="flex items-center gap-3">
                <Link href="?auth=profile">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="User Avatar"
                      width={40}
                      height={40}
                      className="rounded-full border border-gray-200 dark:border-gray-800 hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 text-lg hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer">
                      {session.user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </Link>
              </div>
            ) : (
              <AuthButtons />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
