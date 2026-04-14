"use client";

import { useState, useCallback, useEffect } from "react";
import { API_URL } from "@/lib/api";

interface Props {
  courseId: number;
  token: string | null;
  isCompleted: boolean;
  initialRatingDone: boolean;
}

import { MaskedIcon } from "../icons/MaskedIcon";

const CloseSmallIcon = () => (
  <div className="text-zinc-400 hover:text-zinc-600 transition-colors">
    <MaskedIcon src="/icons/Close.svg" size={16} className="bg-current" />
  </div>
);

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
      aria-label="Rate star"
    >
      <MaskedIcon 
        src="/icons/Rating.svg" 
        size={size} 
        className={filled ? "bg-[#F5A623]" : "bg-zinc-200 dark:bg-zinc-700"} 
      />
    </button>
  );
}

export function CourseRatingSection({ courseId, token, isCompleted, initialRatingDone }: Props) {
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingHovered, setRatingHovered] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingDone, setRatingDone] = useState(initialRatingDone);
  const [ratingError, setRatingError] = useState("");
  const [showRatingPopup, setShowRatingPopup] = useState(false);

  useEffect(() => {
    if (isCompleted && !ratingDone) {
      setShowRatingPopup(true);
    }
  }, [isCompleted, ratingDone]);

  useEffect(() => {
    setRatingDone(initialRatingDone);
  }, [initialRatingDone]);

  const handleRate = useCallback(async (rating: number) => {
    if (!token) return;
    setRatingSubmitting(true);
    setRatingError("");
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.redclass.redberryinternship.ge/api";
      const res = await fetch(`${API_URL}/courses/${courseId}/reviews`, {
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
  }, [courseId, token]);

  if (!isCompleted) return null;

  return (
    <>
      {/* Rating Popup (shown when completed) */}
      {showRatingPopup && !ratingDone && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 relative">
          <button
            onClick={() => setShowRatingPopup(false)}
            className="absolute top-3 right-3 p-1"
          >
            <CloseSmallIcon />
          </button>
          <p className="text-center text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">
            Rate your experience
          </p>
          {/* ACCESSIBILITY: Fixing star labels as requested in Phase 6.1 */}
          <div className="flex justify-center gap-1" role="radiogroup" aria-label="Course rating">
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

      {/* Already rated static message */}
      {ratingDone && !showRatingPopup && isCompleted && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm text-center">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            You've already rated this course
          </p>
        </div>
      )}
    </>
  );
}
