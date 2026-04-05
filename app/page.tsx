import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroBanner } from "@/components/HeroBanner";
import { CourseCard } from "@/components/CourseCard";
import { Button } from "@/components/Button";
import { Course } from "@/types/course";
import Link from "next/link";

async function getFeaturedCourses(): Promise<Course[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.redclass.redberryinternship.ge'}/api/courses`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    
    const data = await res.json();
    const coursesList: Course[] = data.data || [];
    return coursesList.filter(c => c.isFeatured).slice(0, 3);
  } catch (e) {
    console.error("Failed to fetch courses:", e);
    return [];
  }
}

export default async function Home() {
  const coursesData = await getFeaturedCourses();
  const displayCourses = coursesData.map(course => ({
    title: course.title,
    lecturer: course.instructor.name,
    rating: course.avgRating || 0,
    price: Number(course.basePrice),
    imageUrl: course.image,
    description: course.description
  }));

  const courses = displayCourses.length > 0 ? displayCourses : [
    { title: "Advanced React & TypeScript Development", lecturer: "Marilyn Mango", rating: 4.9, price: 299 },
    { title: "Advanced React & TypeScript Development", lecturer: "Marilyn Mango", rating: 4.9, price: 299 },
    { title: "Advanced React & TypeScript Development", lecturer: "Marilyn Mango", rating: 4.9, price: 299 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-black font-sans">
      <Header />
      
      <main className="flex-1 w-full max-w-[1566px] mx-auto px-4 lg:px-0 pb-16">
        <HeroBanner />
        
        <section className="mt-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-2">
              Start Learning Today
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              Choose from our most popular courses and begin your journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <CourseCard key={index} {...course} />
            ))}
          </div>
        </section>
        
        <section className="mt-20">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-2">
                Continue Learning
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                Pick up where you left
              </p>
            </div>
            <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline underline-offset-4">See All</a>
          </div>
          
          <div className="relative">
            {/* Background blurred cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
              {courses.slice(0, 3).map((course, index) => (
                <CourseCard key={`blur-${index}`} {...course} blurred={true} />
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
                <Link href="/?auth=login">
                  <Button variant="solid" className="w-32 py-2.5">
                    Log in
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
