"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import Image from "next/image";
import { CourseDetail } from "@/types/courseDetail";
import { WeeklySchedule } from "@/types/weeklySchedule";
import { TimeSlot } from "@/types/timeSlot";
import { SessionType } from "@/types/sessionType";
import { ConflictError } from "@/types/conflictError";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.redclass.redberryinternship.ge/api";

// ─── Icons ────────────────────────────────────────────────────────────────────

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const DesktopIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ChevronDownIcon = ({ open }: { open: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={`text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const RetakeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const WarningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 shrink-0">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CloseSmallIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 hover:text-zinc-600">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── Star for rating ──────────────────────────────────────────────────────────

function RatingStar({ filled, onClick, onMouseEnter, onMouseLeave, size = 36, disabled }: {
  filled: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  size?: number;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="transition-transform hover:scale-110 disabled:cursor-default"
    >
      <svg width={size} height={size} viewBox="0 0 24 24"
        fill={filled ? "#F5A623" : "none"}
        stroke={filled ? "#F5A623" : "#D1D5DB"}
        strokeWidth="1.5"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </button>
  );
}

// ─── Portal ───────────────────────────────────────────────────────────────────

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

// ─── Accordion Section ────────────────────────────────────────────────────────

function AccordionSection({ stepNum, stepIcon, title, open, onToggle, disabled, children }: {
  stepNum: number;
  stepIcon?: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`transition-opacity ${disabled ? "opacity-40 pointer-events-none" : ""}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3"
      >
        <div className="flex items-center gap-2.5">
          {stepIcon ? (
            <Image src={stepIcon} alt="" width={22} height={22} />
          ) : (
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">
              {stepNum}
            </span>
          )}
          <span className="text-[15px] font-semibold text-zinc-900 dark:text-white">{title}</span>
        </div>
        <ChevronDownIcon open={open} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-[500px] opacity-100 pb-4" : "max-h-0 opacity-0"}`}>
        {children}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface Props {
  course: CourseDetail;
  token: string | null;
  isLoggedIn: boolean;
  profileComplete: boolean;
}

export function CourseDetailPanel({ course, token, isLoggedIn, profileComplete }: Props) {
  const router = useRouter();
  const enrolled = course.enrollment;
  const isEnrolled = !!enrolled;

  // ── Schedule selection state ──────────────────────────────────────────────
  const [schedules, setSchedules] = useState<WeeklySchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<WeeklySchedule | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [selectedSessionType, setSelectedSessionType] = useState<SessionType | null>(null);

  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [loadingSessionTypes, setLoadingSessionTypes] = useState(false);

  // ── Accordion state ─────────────────────────────────────────────────────
  const [openStep, setOpenStep] = useState(1);

  // ── Enrollment state ──────────────────────────────────────────────────────
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  const [conflictData, setConflictData] = useState<ConflictError | null>(null);

  // ── Completion state ──────────────────────────────────────────────────────
  const [completing, setCompleting] = useState(false);
  const [progress, setProgress] = useState(enrolled?.progress ?? 0);
  const [isCompleted, setIsCompleted] = useState((enrolled?.progress ?? 0) >= 100);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ── Retake state ──────────────────────────────────────────────────────────
  const [retaking, setRetaking] = useState(false);

  // ── Rating state ──────────────────────────────────────────────────────────
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingHovered, setRatingHovered] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingDone, setRatingDone] = useState(course.isRated);
  const [ratingError, setRatingError] = useState("");
  const [showRatingPopup, setShowRatingPopup] = useState(false);

  // Show rating popup when course first becomes completed
  useEffect(() => {
    if (isCompleted && !ratingDone) {
      setShowRatingPopup(true);
    }
  }, [isCompleted, ratingDone]);

  // Sync state with props on update (mostly for session/token changes or soft refreshes)
  useEffect(() => {
    if (course.enrollment) {
      setProgress(course.enrollment.progress);
      setIsCompleted(course.enrollment.progress >= 100);
      setRatingDone(course.isRated);
    }
  }, [course]);

  // ── Fetch schedules on mount (if not enrolled) ────────────────────────────
  useEffect(() => {
    if (isEnrolled) return;
    setLoadingSchedules(true);
    fetch(`${API_URL}/courses/${course.id}/weekly-schedules`)
      .then((r) => r.json())
      .then((d) => setSchedules(d.data || []))
      .catch(() => setSchedules([]))
      .finally(() => setLoadingSchedules(false));
  }, [course.id, isEnrolled]);

  // ── When schedule selected → fetch time slots ─────────────────────────────
  const handleSelectSchedule = useCallback(async (schedule: WeeklySchedule) => {
    setSelectedSchedule(schedule);
    setSelectedTimeSlot(null);
    setSelectedSessionType(null);
    setTimeSlots([]);
    setSessionTypes([]);
    setLoadingTimeSlots(true);
    setOpenStep(2);
    try {
      const r = await fetch(`${API_URL}/courses/${course.id}/time-slots?weekly_schedule_id=${schedule.id}`);
      const d = await r.json();
      setTimeSlots(d.data || []);
    } catch {
      setTimeSlots([]);
    } finally {
      setLoadingTimeSlots(false);
    }
  }, [course.id]);

  // ── When time slot selected → fetch session types ─────────────────────────
  const handleSelectTimeSlot = useCallback(async (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
    setSelectedSessionType(null);
    setSessionTypes([]);
    if (!selectedSchedule) return;
    setLoadingSessionTypes(true);
    setOpenStep(3);
    try {
      const r = await fetch(`${API_URL}/courses/${course.id}/session-types?weekly_schedule_id=${selectedSchedule.id}&time_slot_id=${slot.id}`);
      const d = await r.json();
      setSessionTypes(d.data || []);
    } catch {
      setSessionTypes([]);
    } finally {
      setLoadingSessionTypes(false);
    }
  }, [course.id, selectedSchedule]);

  // ── Price calculation ─────────────────────────────────────────────────────
  const basePrice = Number(course.basePrice);
  const modifier = selectedSessionType ? parseFloat(selectedSessionType.priceModifier) : 0;
  const totalPrice = basePrice + modifier;

  // ── Session type display name ─────────────────────────────────────────────
  const sessionTypeName = (name: string) => {
    if (name === "online") return "Online";
    if (name === "in_person") return "In-Person";
    if (name === "hybrid") return "Hybrid";
    return name;
  };

  // ── Enroll handler ────────────────────────────────────────────────────────
  const handleEnroll = useCallback(async (force = false) => {
    setEnrollError("");
    if (!isLoggedIn) {
      router.push("?auth=login");
      return;
    }
    if (!profileComplete) {
      router.push("?auth=profile");
      return;
    }
    if (!selectedSchedule || !selectedTimeSlot || !selectedSessionType) {
      setEnrollError("Please select a weekly schedule, time slot, and session type.");
      return;
    }
    if (selectedSessionType.availableSeats === 0) {
      setEnrollError("This session type is fully booked.");
      return;
    }

    setEnrolling(true);
    try {
      const res = await fetch(`${API_URL}/enrollments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(force ? { "X-Force-Enrollment": "true" } : {}),
        },
        body: JSON.stringify({
          courseId: course.id,
          courseScheduleId: selectedSessionType.courseScheduleId,
          force,
        }),
      });

      if (res.status === 409) {
        const err: ConflictError = await res.json();
        setConflictData(err);
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setEnrollError(errData.message || "Failed to enroll. Please try again.");
        return;
      }

      router.refresh();
    } catch {
      setEnrollError("An unexpected error occurred.");
    } finally {
      setEnrolling(false);
    }
  }, [isLoggedIn, profileComplete, selectedSchedule, selectedTimeSlot, selectedSessionType, token, course.id, router]);
  // ── Complete Course handler ────────────────────────────────────────────────
  const handleComplete = useCallback(async () => {
    if (!token) return;
    setCompleting(true);
    try {
      const res = await fetch(`${API_URL}/enrollments/${enrolled?.id}/complete`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setProgress(100);
        setIsCompleted(true);
        setShowRatingPopup(true);
      }
    } catch {
      /* silent */
    } finally {
      setCompleting(false);
    }
  }, [enrolled?.id, token]);

  // ── Retake Course handler ─────────────────────────────────────────────────
  const handleRetake = useCallback(async () => {
    if (!token || !enrolled) return;
    setRetaking(true);
    try {
      const res = await fetch(`${API_URL}/enrollments/${enrolled.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      /* silent */
    } finally {
      setRetaking(false);
    }
  }, [enrolled, token, router]);

  // ── Rate Course handler ───────────────────────────────────────────────────
  const handleRate = useCallback(async (rating: number) => {
    if (!token || rating === 0) return;
    setRatingSubmitting(true);
    setRatingError("");
    try {
      const res = await fetch(`${API_URL}/courses/${course.id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating }),
      });
      if (res.ok) {
        setRatingDone(true);
        setRatingValue(rating);
        setTimeout(() => setShowRatingPopup(false), 1500);
      } else {
        const d = await res.json().catch(() => ({}));
        setRatingError(d.message || "Failed to submit rating.");
      }
    } catch {
      setRatingError("An unexpected error occurred.");
    } finally {
      setRatingSubmitting(false);
    }
  }, [course.id, token]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Enrolled View ────────────────────────────────────────────────── */}
      {isEnrolled && enrolled ? (
        <div className="flex flex-col gap-5">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">

            {/* Status Badge */}
            <div className="mb-5">
              {isCompleted ? (
                <span className="inline-block px-4 py-1.5 text-sm font-semibold rounded-md border-2 border-green-500 text-green-600">
                  Completed
                </span>
              ) : (
                <span className="inline-block px-4 py-1.5 text-sm font-semibold rounded-md border-2 border-indigo-500 text-indigo-600">
                  Enrolled
                </span>
              )}
            </div>

            {/* Schedule Info */}
            <div className="space-y-3.5 mb-6">
              <div className="flex items-center gap-3">
                <CalendarIcon />
                <span className="text-[14px] text-zinc-700 dark:text-zinc-300">
                  {enrolled.schedule?.weeklySchedule?.label || "—"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ClockIcon />
                <span className="text-[14px] text-zinc-700 dark:text-zinc-300">
                  {enrolled.schedule?.timeSlot?.label
                    ? `${enrolled.schedule.timeSlot.label} ${enrolled.schedule.timeSlot.startTime} - ${enrolled.schedule.timeSlot.endTime}`
                    : "—"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <DesktopIcon />
                <span className="text-[14px] text-zinc-700 dark:text-zinc-300">
                  {sessionTypeName(enrolled.schedule?.sessionType?.name || "")}
                </span>
              </div>
              {enrolled.schedule?.location && (
                <div className="flex items-center gap-3">
                  <MapPinIcon />
                  <span className="text-[14px] text-zinc-700 dark:text-zinc-300">
                    {enrolled.schedule.location}
                  </span>
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="mb-5">
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-2">
                {progress}% Complete
              </p>
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${
                    isCompleted
                      ? "bg-indigo-600"
                      : "bg-linear-to-r from-indigo-600 to-indigo-400"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Action Button */}
            {isCompleted ? (
              <button
                onClick={handleRetake}
                disabled={retaking}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-[15px] transition-colors"
              >
                {retaking ? "Resetting..." : "Retake Course"}
                {!retaking && <RetakeIcon />}
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={completing}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-[15px] transition-colors"
              >
                {completing ? "Completing..." : "Complete Course"}
                {!completing && <CheckIcon />}
              </button>
            )}
          </div>

          {/* Rating Popup (shown when completed) */}
          {showRatingPopup && !ratingDone && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm relative">
              <button
                onClick={() => setShowRatingPopup(false)}
                className="absolute top-3 right-3 p-1"
              >
                <CloseSmallIcon />
              </button>
              <p className="text-center text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">
                Rate your experience
              </p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <RatingStar
                    key={star}
                    filled={(ratingHovered || ratingValue) >= star}
                    onClick={() => {
                      setRatingValue(star);
                      handleRate(star);
                    }}
                    onMouseEnter={() => setRatingHovered(star)}
                    onMouseLeave={() => setRatingHovered(0)}
                    disabled={ratingSubmitting}
                    size={36}
                  />
                ))}
              </div>
              {ratingError && (
                <p className="text-xs text-red-500 text-center mt-2">{ratingError}</p>
              )}
            </div>
          )}

          {/* Rating submitted confirmation */}
          {ratingDone && showRatingPopup && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm text-center">
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Thanks for your rating! 🎉
              </p>
            </div>
          )}
        </div>

      ) : (
        /* ── Non-Enrolled View (Schedule Selection) ─────────────────────── */
        <div className="flex flex-col gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm divide-y divide-zinc-100 dark:divide-zinc-800">

            {/* Step 1: Weekly Schedule */}
            <div className="px-5">
              <AccordionSection
                stepNum={1}
                stepIcon={openStep === 1 ? "/icons/OneFill.svg" : "/icons/One.svg"}
                title="Weekly Schedule"
                open={openStep === 1}
                onToggle={() => setOpenStep(openStep === 1 ? 0 : 1)}
              >
                {loadingSchedules ? (
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => <div key={i} className="h-[52px] w-[90px] rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />)}
                  </div>
                ) : schedules.length === 0 ? (
                  <p className="text-sm text-zinc-400">No schedule options available.</p>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {schedules.map((s) => {
                      const isActive = selectedSchedule?.id === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => handleSelectSchedule(s)}
                          className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                            isActive
                              ? "border-zinc-900 dark:border-white bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                              : "border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 hover:border-zinc-400 hover:text-zinc-600"
                          }`}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </AccordionSection>
            </div>

            {/* Step 2: Time Slot */}
            <div className="px-5">
              <AccordionSection
                stepNum={2}
                stepIcon={openStep === 2 ? "/icons/TwoFill.svg" : "/icons/Two.svg"}
                title="Time Slot"
                open={openStep === 2}
                onToggle={() => setOpenStep(openStep === 2 ? 0 : 2)}
                disabled={!selectedSchedule}
              >
                {loadingTimeSlots ? (
                  <div className="flex gap-2">
                    {[1, 2].map((i) => <div key={i} className="h-10 w-32 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />)}
                  </div>
                ) : timeSlots.length === 0 && selectedSchedule ? (
                  <p className="text-sm text-zinc-400">No time slots available for this schedule.</p>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {timeSlots.map((slot) => {
                      const isActive = selectedTimeSlot?.id === slot.id;
                      return (
                        <button
                          key={slot.id}
                          onClick={() => handleSelectTimeSlot(slot)}
                          className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                            isActive
                              ? "border-zinc-900 dark:border-white bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                              : "border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 hover:border-zinc-400 hover:text-zinc-600"
                          }`}
                        >
                          {slot.label} ({slot.startTime} – {slot.endTime})
                        </button>
                      );
                    })}
                  </div>
                )}
              </AccordionSection>
            </div>

            {/* Step 3: Session Type */}
            <div className="px-5">
              <AccordionSection
                stepNum={3}
                stepIcon={openStep === 3 ? "/icons/ThreeFill.svg" : "/icons/Three.svg"}
                title="Session Type"
                open={openStep === 3}
                onToggle={() => setOpenStep(openStep === 3 ? 0 : 3)}
                disabled={!selectedTimeSlot}
              >
                {loadingSessionTypes ? (
                  <div className="flex flex-col gap-2">
                    {[1, 2].map((i) => <div key={i} className="h-16 w-full rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />)}
                  </div>
                ) : sessionTypes.length === 0 && selectedTimeSlot ? (
                  <p className="text-sm text-zinc-400">No session types available for this selection.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {sessionTypes.map((st) => {
                      const isSelected = selectedSessionType?.id === st.id;
                      const isFullyBooked = st.availableSeats === 0;
                      const isLowSeats = st.availableSeats > 0 && st.availableSeats < 5;
                      const mod = parseFloat(st.priceModifier);
                      const priceLabel = mod === 0 ? "Included" : `+$${mod}`;
                      return (
                        <button
                          key={st.id}
                          onClick={() => !isFullyBooked && setSelectedSessionType(st)}
                          disabled={isFullyBooked}
                          className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all ${
                            isFullyBooked
                              ? "border-zinc-200 dark:border-zinc-800 opacity-50 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900/50"
                              : isSelected
                              ? "border-zinc-900 dark:border-white bg-white dark:bg-zinc-800 shadow-sm"
                              : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm text-zinc-900 dark:text-white">{sessionTypeName(st.name)}</span>
                              {(st.name === "in_person" || st.name === "hybrid") && st.location && (
                                <span className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                                  <MapPinIcon /> {st.location}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`text-sm font-bold ${mod === 0 ? "text-zinc-500" : "text-indigo-600 dark:text-indigo-400"}`}>
                                {priceLabel}
                              </span>
                              {isFullyBooked ? (
                                <span className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">Fully Booked</span>
                              ) : isLowSeats ? (
                                <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                                  Only {st.availableSeats} seats left!
                                </span>
                              ) : (
                                <span className="text-xs text-zinc-400">{st.availableSeats} seats</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </AccordionSection>
            </div>
          </div>

          {/* Price Summary Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Price</span>
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">${totalPrice}</span>
            </div>
            <div className="space-y-1 mb-5">
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Base Price</span>
                <span>+ ${basePrice}</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Session Type</span>
                <span>+ ${modifier}</span>
              </div>
            </div>

            {/* Enroll Button */}
            <button
              onClick={() => handleEnroll(false)}
              disabled={enrolling || !selectedSchedule || !selectedTimeSlot || !selectedSessionType}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-semibold text-[15px] transition-colors"
            >
              {enrolling ? "Enrolling..." : "Enroll Now"}
            </button>
          </div>

          {/* Enroll Error */}
          {enrollError && (
            <div className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
              <WarningIcon />
              <span>{enrollError}</span>
            </div>
          )}

          {/* Profile incomplete warning (authorized + not enrolled) */}
          {isLoggedIn && !profileComplete && (
            <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <WarningIcon />
                <div>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Complete Your Profile</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    You need to fill in your profile details before enrolling in this course.
                  </p>
                </div>
              </div>
              <a
                href="?auth=profile"
                className="shrink-0 ml-3 px-4 py-2 text-sm font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1"
              >
                Complete <span>→</span>
              </a>
            </div>
          )}

          {/* Not authenticated warning */}
          {!isLoggedIn && (
            <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <WarningIcon />
                <div>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Authentication Required</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    You need sign in to your profile before enrolling in this course.
                  </p>
                </div>
              </div>
              <a
                href="?auth=login"
                className="shrink-0 ml-3 px-4 py-2 text-sm font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1"
              >
                Sign In <span>→</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* ── Conflict Warning Modal ────────────────────────────────────────── */}
      {conflictData && (
        <Portal>
          <div className="fixed inset-0 z-9999 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                  <WarningIcon />
                </div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Schedule Conflict</h2>
              </div>
              {conflictData.conflicts.map((c, i) => (
                <p key={i} className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                  You are already enrolled in{" "}
                  <strong className="text-zinc-900 dark:text-white">{c.conflictingCourseName}</strong>{" "}
                  with the same schedule: <strong>{c.schedule}</strong>.
                </p>
              ))}
              <p className="text-sm text-zinc-500 mb-6">Are you sure you want to continue?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConflictData(null)}
                  className="flex-1 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setConflictData(null); handleEnroll(true); }}
                  className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
                >
                  Continue Anyway
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ── Success Modal ─────────────────────────────────────────────────── */}
      {showSuccessModal && (
        <Portal>
          <div className="fixed inset-0 z-9999 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Congratulations!</h2>
              <p className="text-sm text-zinc-500 mb-6">
                You&apos;ve completed <strong className="text-zinc-900 dark:text-white">{course.title}</strong>!
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
              >
                Awesome!
              </button>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
