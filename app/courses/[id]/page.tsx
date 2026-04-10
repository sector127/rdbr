import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CourseDetailPanel } from "@/components/CourseDetailPanel";
import { authOptions } from "@/lib/auth";
import { CourseDetail } from "@/types/courseDetail";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.redclass.redberryinternship.ge/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getCourse(id: string, token: string | null): Promise<CourseDetail | null> {
  try {
    const res = await fetch(`${API_URL}/courses/${id}`, {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
}

function StarRatingDisplay({ rating }: { rating: number | null }) {
  const r = rating ?? 0;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} viewBox="0 0 20 20" className={`w-4 h-4 ${star <= Math.round(r) ? "text-amber-400 fill-current" : "text-zinc-300 dark:text-zinc-600"}`}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {rating !== null && <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">{rating.toFixed(1)}</span>}
    </div>
  );
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const token =
    (session?.user as any)?.token ||
    (session?.user as any)?.access_token ||
    (session?.user as any)?.data?.token ||
    null;

  const profileComplete =
    !!session?.user?.data?.user?.fullName ||
    !!session?.user?.data?.user?.profileComplete;

  const course = await getCourse(id, token);

  if (!course) {
    notFound();
  }

  const avgRating = course.reviews?.length
    ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-zinc-950 font-sans">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-[1566px] mx-auto px-4 lg:px-8 py-4">
          <nav className="flex gap-2 text-sm text-zinc-500 font-medium items-center">
            <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            <span className="text-zinc-300 dark:text-zinc-700">›</span>
            <Link href="/courses" className="hover:text-indigo-600 transition-colors">Browse</Link>
            <span className="text-zinc-300 dark:text-zinc-700">›</span>
            <span className="text-indigo-600 dark:text-indigo-400 truncate max-w-[200px]">{course.category?.name || "Course"}</span>
          </nav>
        </div>
      </div>

      <main className="flex-1 w-full max-w-[1566px] mx-auto px-4 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-10 items-start">

          {/* ── Left Column ──────────────────────────────────────────────── */}
          <div className="flex flex-col gap-6">

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-zinc-900 dark:text-white leading-tight">
              {course.title}
            </h1>

            {/* Hero Image */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-sm">
              {course.image ? (
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-indigo-900 to-zinc-900 flex items-center justify-center">
                  <span className="text-white/20 text-6xl font-mono">&lt;/&gt;</span>
                </div>
              )}
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-5">
                {/* Duration weeks */}
                <div className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{course.durationWeeks} Weeks</span>
                </div>
                {/* Duration hours */}
                <div className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{course.durationWeeks * 10} Hours</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Rating */}
                {avgRating !== null && (
                  <StarRatingDisplay rating={avgRating} />
                )}

                {/* Category */}
                {course.category?.name && (
                  <div className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                    {course.category.name}
                  </div>
                )}
              </div>
            </div>

            {/* Instructor */}
            {course.instructor && (
              <div className="flex items-center gap-3">
                {course.instructor.avatar ? (
                  <Image
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    width={36}
                    height={36}
                    className="rounded-full border border-zinc-200 dark:border-zinc-700"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                    {course.instructor.name[0]}
                  </div>
                )}
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{course.instructor.name}</span>
              </div>
            )}

            {/* Description */}
            <div>
              <h2 className="text-base font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
                Course Description
              </h2>
              <div className="prose prose-zinc dark:prose-invert max-w-none text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 space-y-3">
                {course.description?.split("\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Column (sticky panel) ───────────────────────────────── */}
          <div className="lg:sticky lg:top-24">
            <CourseDetailPanel
              course={course}
              token={token}
              isLoggedIn={!!session}
              profileComplete={profileComplete}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
