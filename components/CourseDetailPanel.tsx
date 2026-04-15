"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CourseDetail } from "@/types/courseDetail";
import { WeeklySchedule } from "@/types/weeklySchedule";
import { TimeSlot } from "@/types/timeSlot";
import { SessionType } from "@/types/sessionType";
import { ConflictError } from "@/types/conflictError";
import { apiFetch, API_URL } from "@/lib/api";
import { CourseRatingSection } from "./course/CourseRatingSection";
import { CourseConflictModal } from "./course/CourseConflictModal";
import { CourseSuccessModal } from "./course/CourseSuccessModal";

import { MaskedIcon } from "./icons/MaskedIcon";

const CalendarIcon = () => <MaskedIcon src="/icons/CalendarDots.svg" size={20} className="bg-zinc-500" />;
const ClockIcon = () => <MaskedIcon src="/icons/Clock.svg" size={20} className="bg-zinc-500" />;
const DesktopIcon = () => <MaskedIcon src="/icons/Desktop.svg" size={20} className="bg-zinc-500" />;
const MapPinIcon = ({ className }: { className?: string }) => <MaskedIcon src="/icons/MapPin.svg" size={20} className={className || "bg-zinc-500"} />;

const ChevronDownIcon = ({ open }: { open: boolean }) => (
  <div className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
    <MaskedIcon src="/icons/Arrow.svg" size={20} className="bg-zinc-400" />
  </div>
);

const CheckIcon = () => <MaskedIcon src="/icons/Check.svg" size={18} className="bg-white" />;
const RetakeIcon = () => <MaskedIcon src="/icons/Retake.svg" size={18} className="bg-white" />;
const WarningIcon = () => <MaskedIcon src="/icons/Warning.svg" size={16} className="bg-amber-500 shrink-0" />;
const CloseSmallIcon = () => (
  <div className="text-zinc-400 hover:text-zinc-600 transition-colors">
    <MaskedIcon src="/icons/Close.svg" size={16} className="bg-current" />
  </div>
);


const formatTimeString = (timeStr: string) => {
  if (!timeStr) return "";
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  const [h, m] = parts;
  let hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12;
  return `${hour}:${m} ${ampm}`;
};


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

  // ── Retake state ──────────────────────────────────────────────────────────
  const [retaking, setRetaking] = useState(false);


  // Sync state with props on update (mostly for session/token changes or soft refreshes)
  useEffect(() => {
    if (course.enrollment) {
      setProgress(course.enrollment.progress);
      setIsCompleted(course.enrollment.progress >= 100);
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
      const data = await apiFetch<TimeSlot[]>(`/courses/${course.id}/time-slots?weekly_schedule_id=${schedule.id}`);
      setTimeSlots(data || []);
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
      const data = await apiFetch<SessionType[]>(`/courses/${course.id}/session-types?weekly_schedule_id=${selectedSchedule.id}&time_slot_id=${slot.id}`);
      setSessionTypes(data || []);
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


  return (
    <div className="w-full shrink-0">
      {/* ── Enrolled View ────────────────────────────────────────────────── */}
      {isEnrolled && enrolled ? (
        <div className="flex flex-col gap-5">
          <div className="bg-transparent">

            <div className="mb-5">
              {isCompleted ? (
                <div className="flex flex-col items-center justify-center py-4 px-4 rounded-2xl bg-green-500/10 text-green-500 gap-1 border border-green-500/20">
                  <span className="text-xl font-bold flex items-center gap-2">
                    Completed <CheckIcon />
                  </span>
                  <span className="text-sm font-medium">Course Completed! 🎉</span>
                </div>
              ) : (
                <span className="h-[56px] inline-flex items-center justify-center px-4 py-1.5 text-xl font-semibold rounded-[100px] bg-indigo-500/10 text-indigo-400">
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
                    ? enrolled.schedule.timeSlot.label.replace(/[()]/g, "")
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
                Course Progress: {progress}%
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
          <CourseRatingSection
            courseId={course.id}
            token={token}
            isCompleted={isCompleted}
            initialRatingDone={course.isRated}
          />
        </div>

      ) : (
        /* ── Non-Enrolled View (Schedule Selection) ─────────────────────── */
        <div className="flex flex-col gap-4">
          <div className="bg-transparent rounded-2xl divide-y divide-zinc-100 dark:divide-zinc-800">

            {/* Step 1: Weekly Schedule */}
            <div className="">
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
                  <div className="flex gap-2 text-xs">
                    {schedules.map((s) => {
                      const isActive = selectedSchedule?.id === s.id;
                      const formattedLabel = s.label.split('-').map(p => {
                        const trimmed = p.trim();
                        if (trimmed.toLowerCase().includes('weekend')) {
                          return trimmed.split(' ')[0];
                        }
                        return trimmed.substring(0, 3);
                      }).join(' - ');
                      return (
                        <button
                          key={s.id}
                          onClick={() => handleSelectSchedule(s)}
                          className={`p-5 rounded-xl border text-[15px] font-semibold transition-all ${
                            isActive
                              ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500 text-indigo-700 dark:text-indigo-400 shadow-sm"
                              : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-500 shadow-sm"
                          }`}
                        >
                          {formattedLabel}
                        </button>
                      );
                    })}
                  </div>
                )}
              </AccordionSection>
            </div>

            {/* Step 2: Time Slot */}
            <div className="">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {timeSlots.map((slot) => {
                      const isActive = selectedTimeSlot?.id === slot.id;
                      const displayName = slot.label.split("(")[0].trim();
                      const formattedRange = `${formatTimeString(slot.startTime)} – ${formatTimeString(slot.endTime)}`;

                      let iconPath = "/icons/Sun.svg";
                      const labelLow = slot.label.toLowerCase();
                      if (labelLow.includes("morning")) iconPath = "/icons/CloudSun.svg";
                      else if (labelLow.includes("afternoon")) iconPath = "/icons/Sun.svg";
                      else if (labelLow.includes("evening")) iconPath = "/icons/Moon.svg";

                      return (
                        <button
                          key={slot.id}
                          onClick={() => handleSelectTimeSlot(slot)}
                          className={`flex items-center p-5 h-15 rounded-2xl border transition-all ${
                            isActive
                              ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500 shadow-sm"
                              : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-500 shadow-sm"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-[26px] h-[26px] shrink-0 ${isActive ? "bg-indigo-600 dark:bg-indigo-400" : "bg-zinc-600 dark:bg-zinc-400"}`}
                              style={{
                                maskImage: `url(${iconPath})`,
                                maskSize: "contain",
                                maskRepeat: "no-repeat",
                                maskPosition: "center",
                                WebkitMaskImage: `url(${iconPath})`,
                                WebkitMaskSize: "contain",
                                WebkitMaskRepeat: "no-repeat",
                                WebkitMaskPosition: "center",
                              }}
                            />
                            <div className="flex flex-col items-start text-left">
                              <span className={`font-medium text-sm ${isActive ? "text-indigo-700 dark:text-indigo-400" : "text-zinc-600 dark:text-zinc-200"}`}>
                                {displayName}
                              </span>
                              <span className={`text-[10px] font-regular ${isActive ? "text-indigo-500 dark:text-indigo-500" : "text-zinc-500 dark:text-zinc-400"}`}>
                                {formattedRange}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </AccordionSection>
            </div>

            {/* Step 3: Session Type */}
            <div className="">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {sessionTypes.map((st) => {
                      const isSelected = selectedSessionType?.id === st.id;
                      const isFullyBooked = st.availableSeats === 0;
                      const isLowSeats = st.availableSeats > 0 && st.availableSeats < 5;
                      const mod = parseFloat(st.priceModifier);
                      const priceLabel = mod === 0 ? "Included" : `+ $${mod}`;
                      
                      let iconPath = "/icons/Online.svg";
                      if (st.name === "in_person") iconPath = "/icons/InPerson.svg";
                      if (st.name === "hybrid") iconPath = "/icons/Hybrid.svg";

                      return (
                        <div key={st.id} className="flex flex-col gap-2">
                          <button
                            onClick={() => !isFullyBooked && setSelectedSessionType(st)}
                            disabled={isFullyBooked}
                            className={`flex flex-col items-center justify-center py-[15px] px-5 rounded-2xl border transition-all ${
                              isFullyBooked
                                ? "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 opacity-60 cursor-not-allowed"
                                : isSelected
                                ? "border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm"
                                : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-500 shadow-sm"
                            }`}
                          >
                            <div
                              className={`w-[26px] h-[26px] ${isSelected ? "bg-indigo-600 dark:bg-indigo-400" : "bg-zinc-600 dark:bg-zinc-400"} mb-[6px]`}
                              style={{
                                maskImage: `url(${iconPath})`,
                                maskSize: "contain",
                                maskRepeat: "no-repeat",
                                maskPosition: "center",
                                WebkitMaskImage: `url(${iconPath})`,
                                WebkitMaskSize: "contain",
                                WebkitMaskRepeat: "no-repeat",
                                WebkitMaskPosition: "center",
                              }}
                            />
                            <span className={`font-semibold text-[16px] ${isSelected ? "text-indigo-700 dark:text-indigo-400" : "text-zinc-600 dark:text-zinc-200"}`}>
                              {sessionTypeName(st.name)}
                            </span>
                            
                            {st.name === "online" ? (
                              <span className={`text-[12px] font-regular mt-1 ${isSelected ? "text-indigo-500" : "text-zinc-500 dark:text-zinc-400"}`}>
                                {st.location || "Google Meet"}
                              </span>
                            ) : (
                              <span className={`text-[12px] font-regular mt-1 flex items-center gap-1 ${isSelected ? "text-indigo-500 dark:text-indigo-400" : "text-zinc-500 dark:text-zinc-400"}`}>
                                <MapPinIcon className={isSelected ? "text-indigo-500 dark:text-indigo-400" : "text-zinc-500 dark:text-zinc-400"} /> 
                                {st.location || "Chavchavadze St.34"}
                              </span>
                            )}

                            <span className={`text-[14px] font-medium mt-3 ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-indigo-500 dark:text-indigo-500"}`}>
                              {priceLabel}
                            </span>
                          </button>

                          <div className="text-center flex justify-center items-center gap-1 mt-0.5">
                            {isFullyBooked ? (
                              <span className="text-[13px] font-medium text-zinc-500 dark:text-zinc-500">Fully Booked</span>
                            ) : isLowSeats ? (
                              <>
                                <WarningIcon />
                                <span className="text-xs font-medium text-amber-500 dark:text-amber-400">
                                  Only {st.availableSeats} seats left!
                                </span>
                              </>
                            ) : (
                              <span className="text-[13px] font-medium text-zinc-800 dark:text-zinc-300">
                                {st.availableSeats} Seats Available
                              </span>
                            )}
                          </div>
                        </div>
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
                className="shrink-0 ml-3 px-4 py-2 text-sm font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
              >
                Complete <MaskedIcon src="/icons/ArrowRight.svg" size={14} className="bg-current" />
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
                className="shrink-0 ml-3 px-4 py-2 text-sm font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
              >
                Sign In <MaskedIcon src="/icons/ArrowRight.svg" size={14} className="bg-current" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* ── Conflict Warning Modal ────────────────────────────────────────── */}
      {conflictData && (
        <CourseConflictModal
          conflictData={conflictData}
          onCancel={() => setConflictData(null)}
          onContinue={() => {
            setConflictData(null);
            handleEnroll(true);
          }}
        />
      )}

    </div>
  );
}
