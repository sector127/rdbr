import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroBanner } from "@/components/HeroBanner";
import { CourseCard } from "@/components/CourseCard";
import { Button } from "@/components/Button";
import { Course } from "@/types/course";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";

async function getFeaturedCourses(): Promise<Course[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.redclass.redberryinternship.ge'}/courses/featured`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
  } catch (e) {
    console.error("Failed to fetch featured courses:", e);
    return [];
  }
}

async function getEnrolledCourses(token: string): Promise<any[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.redclass.redberryinternship.ge'}/courses/in-progress`, {
      headers: {
        "Authorization": `Bearer ${token}`
      },
      cache: 'no-store'
    });
    if (!res.ok) return [];
    
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
  } catch (e) {
    console.error("Failed to fetch in-progress courses:", e);
    return [];
  }
}

async function getCorrectRating(courseId: number, initialRating?: number | null): Promise<number> {
  // If we already have a rating and it's not zero, we can trust it (following sidebar logic)
  const rating = typeof initialRating === 'number' ? initialRating : undefined;
  if (rating && rating > 0) return rating;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.redclass.redberryinternship.ge'}/courses/${courseId}`, {
      next: { revalidate: 300 } // Brief cache for efficiency
    });
    if (!res.ok) return 0;
    
    const data = await res.json();
    const reviews = data.data?.reviews || [];
    if (reviews.length === 0) return 0;
    
    const total = reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
    return Number((total / reviews.length).toFixed(1));
  } catch (e) {
    console.error(`Failed to fetch correct rating for course ${courseId}:`, e);
    return initialRating || 0;
  }
}

export default async function Home() {
  const [coursesData, session] = await Promise.all([
    getFeaturedCourses(),
    getServerSession(authOptions)
  ]);

  // Enrich featured courses with correct ratings
  const displayCoursesWithRatings = await Promise.all(
    coursesData.map(async (course: Course) => {
      const rating = await getCorrectRating(course.id, course.avgRating);
      return {
        id: course.id,
        title: course.title,
        lecturer: course.instructor.name,
        rating,
        price: Number(course.basePrice),
        imageUrl: course.image,
        description: course.description
      };
    })
  );

  const courses = displayCoursesWithRatings.length > 0 ? displayCoursesWithRatings : [
    { id: 1, title: "Advanced React & TypeScript Development", lecturer: "Marilyn Mango", rating: 4.9, price: 299 },
    { id: 2, title: "Advanced React & TypeScript Development", lecturer: "Marilyn Mango", rating: 4.9, price: 299 },
    { id: 3, title: "Advanced React & TypeScript Development", lecturer: "Marilyn Mango", rating: 4.9, price: 299 },
  ];

  let enrolledCourses: any[] = [];
  if (session) {
    const token = (session?.user as any)?.token || (session?.user as any)?.access_token || (session?.user as any)?.data?.token;
    if (token) {
      enrolledCourses = await getEnrolledCourses(token);
    }
  }

  // Enrich progress courses with correct ratings
  const progressCoursesList = enrolledCourses.slice(0, 4);
  const progressCourses = await Promise.all(
    progressCoursesList.map(async (enrollment: any) => {
      const course = enrollment.course || enrollment; 
      const rating = await getCorrectRating(course.id, course.avgRating);
      
      return {
        id: course.id || 1,
        title: course.title || "Unknown Course",
        lecturer: course?.instructor?.name || "Unknown Lecturer",
        rating,
        price: Number(course.basePrice || 0),
        imageUrl: course.image,
        description: course.description,
        progress: enrollment.progress || 0 
      };
    })
  );

  const hasProgress = session && progressCourses.length > 0;

  const featuredSection = (
    <section className={hasProgress ? "mt-24" : "mt-16"}>
      <div className="mb-8">
        <h2 className="text-5xl font-semibold text-gray-950 dark:text-zinc-50 tracking-tight mb-2">
          Start Learning Today
        </h2>
        <p className="text-lg text-gray-700 dark:text-zinc-400 font-medium">
          Choose from our most popular courses and begin your journey
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course: any, index: number) => (
          <CourseCard key={index} {...course} />
        ))}
      </div>
    </section>
  );

  const continueLearningSection = (
    <section className={hasProgress ? "mt-16" : "mt-24"}>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-semibold text-gray-950 dark:text-zinc-50 tracking-tight mb-2">
            Continue Learning
          </h2>
          <p className="text-lg text-gray-700 dark:text-zinc-400 font-medium">
            Pick up where you left
          </p>
        </div>
        {session && progressCourses.length > 0 && (
          <Link href="?enrolled=true" scroll={false} className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline underline-offset-4">See All</Link>
        )}
      </div>
      
      <div className="relative">
        {!session ? (
          <>
            {/* Background blurred cards */}
            <div className="flex gap-6 overflow-hidden">
              {courses.slice(0, 4).map((course: any, index: number) => (
                <div key={`blur-${index}`} className="min-w-[340px] flex-1">
                  <CourseCard {...course} blurred={true} />
                </div>
              ))}
            </div>
            
            {/* Floating Sign In Card */}
            <div className="absolute inset-0 flex items-center justify-center z-10 px-4">
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-8 flex flex-col items-center max-w-sm w-full text-center">
                <div className="h-16 w-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-6">
                  Sign in to track your learning progress
                </h3>
                <Link href="/?auth=login" scroll={false}>
                  <Button variant="solid" className="w-32 py-2.5">
                    Log in
                  </Button>
                </Link>
              </div>
            </div>
          </>
        ) : (
          /* Authenticated States */
          progressCourses.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 flex flex-col items-center text-center">
               <div className="h-20 w-20 bg-indigo-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6 text-indigo-500">
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                 </svg>
               </div>
               <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">You haven't enrolled in any courses yet.</h3>
               <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md">Start your learning journey today by exploring our catalog of industry-leading courses.</p>
               <Link href="/courses">
                 <Button variant="solid" className="px-6 py-2.5">Browse Courses</Button>
               </Link>
            </div>
          ) : (
            <div className="flex gap-8 overflow-x-auto pb-6 scrollbar-hide">
              {progressCourses.map((course: any) => (
                <div key={`prog-${course.id}`} className="min-w-[380px] lg:min-w-0 lg:flex-1">
                  <CourseCard {...course} />
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-black font-sans">
      <Header />
      
      <main className="flex-1 w-full max-w-[1566px] mx-auto px-4 lg:px-0 pb-16">
        <HeroBanner />
        
        {hasProgress ? (
          <>
            {continueLearningSection}
            {featuredSection}
          </>
        ) : (
          <>
            {featuredSection}
            {continueLearningSection}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
