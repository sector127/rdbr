import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuthButtons } from "./AuthModals";



export async function Header() {
  const session = await getServerSession(authOptions);
  const profileComplete = session?.user.data?.user?.profileComplete;
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
          <Link href="/courses" className="flex items-center gap-2 text-xl font-medium text-gray-600 dark:text-zinc-300 transition-colors">
            <Image src="/icons/BrowseCourses.svg" alt="Browse Courses" width={26} height={26} className="dark:invert" />
            Browse Courses
          </Link>

          {session && (
            <Link href="?enrolled=true" scroll={false} className="flex items-center gap-2 text-xl font-medium text-gray-600 dark:text-zinc-300 transition-colors">
              <Image src="/icons/EnrolledCourses.svg" alt="Enrolled Courses" width={26} height={26} className="dark:invert" />
              Enrolled Courses
            </Link>
          )}

          <div className="hidden sm:flex items-center gap-4 ml-2">
            {session ? (


              <div className={`relative flex gap-3 w-[56px] h-[56px] rounded-full bg-indigo-50 ${profileComplete ? "bg-transparent" : ""} items-center justify-center`}>
                <Link href="?auth=profile" scroll={false}>
                  {session.user?.data?.user?.avatar ? (
                    <Image
                      src={session.user.data.user.avatar}
                      alt="User Avatar"
                      width={40}
                      height={40}
                      className="rounded-full border border-gray-200 dark:border-gray-800 hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer"
                    />
                  ) : (
                    <Image src="/icons/AvatarFallback.svg" alt="Avatar" width={38} height={38} className="dark:invert" />
                  )}
                </Link>
                <div className={`absolute bottom-0 right-0 w-4 h-4 ${profileComplete ? "bg-[#1cd14f]" : "bg-[#F4A316]"} rounded-full border-2 border-white dark:border-gray-800`}></div>
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
