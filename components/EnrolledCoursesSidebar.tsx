"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { Button } from "./Button";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.redclass.redberryinternship.ge/api";

// ─── Icons ────────────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 hover:text-zinc-600 transition-colors">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="#F5A623">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);


// ─── types ───────────────────────────────────────────────────────────────────

interface Enrollment {
  id: number;
  progress: number;
  course: {
    id: number;
    title: string;
    image?: string;
    instructor: { name: string };
    avgRating: number;
  };
  schedule: {
    weeklySchedule: { label: string };
    timeSlot: { label: string; startTime: string; endTime: string };
    sessionType: { name: string };
    location?: string;
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function EnrolledCoursesSidebar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  
  const isOpen = searchParams.get("enrolled") === "true";
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [courseRatings, setCourseRatings] = useState<Record<number, number>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const token =
      (session?.user as any)?.token ||
      (session?.user as any)?.access_token ||
      (session?.user as any)?.data?.token ||
      null;

    if (isOpen && token) {
      setLoading(true);
      fetch(`${API_URL}/enrollments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const fetchedEnrollments: Enrollment[] = data.data || [];
          setEnrollments(fetchedEnrollments);
          
          // Fetch ratings for courses if not provided in the list
          fetchedEnrollments.forEach((enr) => {
            if (enr.course.avgRating) {
              setCourseRatings(prev => ({ ...prev, [enr.course.id]: enr.course.avgRating }));
            } else {
              fetch(`${API_URL}/courses/${enr.course.id}`)
                .then(res => res.json())
                .then(courseData => {
                  const reviews = courseData.data?.reviews || [];
                  const avg = reviews.length > 0 
                    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length 
                    : 0;
                  setCourseRatings(prev => ({ ...prev, [enr.course.id]: avg }));
                })
                .catch(err => console.error(`Failed to fetch rating for course ${enr.course.id}:`, err));
            }
          });
        })
        .catch((err) => console.error("Failed to fetch enrollments:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, session]);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const closeSidebar = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("enrolled");
    const query = params.toString() ? `?${params.toString()}` : "";
    router.replace(`${pathname}${query}`);
  };

  if (!mounted) return null;

  return createPortal(
    <div className={`fixed inset-0 z-100 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm cursor-pointer" 
        onClick={closeSidebar} 
      />
      
      {/* Sidebar */}
      <div className={`absolute top-0 right-0 h-full w-full max-w-[794px] bg-[#f8f9fa] dark:bg-zinc-950 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        {/* Header */}
        <div className="relative p-10 flex items-center bg-white dark:bg-zinc-900/50">
          <div className="w-full flex justify-between">
            <h2 className="text-5xl font-semibold text-gray-950 dark:text-white leading-tight">Enrolled Courses</h2>
            <div className="flex text-[16px] font-semibold items-center gap-2 mt-1">
              <span className="text-gray-950 dark:text-zinc-400 font-medium">Total Enrollments</span>
              <span className="text-gray-950 dark:text-white font-bold">{enrollments.length}</span>
            </div>
          </div>
          <button onClick={closeSidebar} className="absolute top-5 right-5 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 h-[220px] animate-pulse" />
              ))}
            </div>
          ) : enrollments.length > 0 ? (
            enrollments.map((enr) => (
              <div key={enr.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group relative">
                <div className="flex gap-6">
                  {/* Image */}
                  <div className="relative w-40 h-32 rounded-xl overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800">
                    {enr.course.image ? (
                      <Image src={enr.course.image} alt={enr.course.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                         <CalendarIcon />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Instructor <span className="text-zinc-900 dark:text-zinc-200">{enr.course.instructor.name}</span></span>
                      <div className="flex items-center gap-1">
                        <StarIcon />
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">
                          {(courseRatings[enr.course.id] || enr.course.avgRating || 0).toFixed(1)}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-[17px] font-bold text-zinc-900 dark:text-white mb-4 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                      {enr.course.title}
                    </h3>

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5 text-[13px] text-zinc-500 dark:text-zinc-400">
                        <CalendarIcon />
                        <span>{enr.schedule.weeklySchedule.label}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[13px] text-zinc-500 dark:text-zinc-400">
                        <ClockIcon />
                        <span>{enr.schedule.timeSlot.label}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[13px] text-zinc-500 dark:text-zinc-400">
                        <UserIcon />
                        <span className="capitalize">{enr.schedule.sessionType.name.replace('_', ' ')}</span>
                      </div>
                      {enr.schedule.location && (
                        <div className="flex items-center gap-2.5 text-[13px] text-zinc-500 dark:text-zinc-400">
                          <MapPinIcon />
                          <span className="truncate">{enr.schedule.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress bar and View button */}
                <div className="mt-6 pt-6 border-t border-zinc-50 dark:border-zinc-800">
                  <div className="flex items-end justify-between gap-6">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-zinc-900 dark:text-white mb-2">{enr.progress}% Complete</p>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="h-full bg-linear-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-500" 
                          style={{ width: `${enr.progress}%` }} 
                        />
                      </div>
                    </div>
                    <Link href={`/courses/${enr.course.id}`} onClick={closeSidebar}>
                      <button className="px-10 py-3 rounded-xl border border-indigo-200 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors whitespace-nowrap">
                        View
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="mb-6 opacity-40">
                <Image src={"/icons/EmptyBox.svg"} alt="Empty Box" width={190} height={170} />
              </div>
              <h3 className="text-2xl font-semibold text-indigo-800 dark:text-indigo-200 mb-2">No Enrolled Courses Yet</h3>
              <p className="text-sm font-medium text-indigo-800 dark:text-zinc-400 mb-8 max-w-[280px]">
                Your learning journey starts here! Browse courses to get started.
              </p>
              <Link href="/courses" onClick={closeSidebar}>
                <Button variant="solid" className="text-[16px] font-medium px-12 py-3 bg-[#4c40f7] hover:bg-indigo-700">Browse Courses</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
