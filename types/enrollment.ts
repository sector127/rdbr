import { Course } from "./course";
import { WeeklySchedule } from "./weeklySchedule";
import { TimeSlot } from "./timeSlot";
import { SessionType } from "./sessionType";

export interface Enrollment {
  id: number;
  quantity: number;
  totalPrice: number;
  progress: number;
  completedAt: string | null;
  course: Course;
  schedule: {
    weeklySchedule: WeeklySchedule;
    timeSlot: TimeSlot;
    sessionType: SessionType;
    location: string | null;
  };
}
