import { Category } from "./category";
import { Topic } from "./topic";
import { Instructor } from "./instructor";
import { Enrollment } from "./enrollment";

export interface CourseReview {
  userId: number;
  rating: number; // minimum: 1, maximum: 5
}

export interface CourseDetail {
  id: number;
  title: string;
  description: string;
  image: string;
  basePrice: number;
  durationWeeks: number;
  isFeatured: boolean;
  reviews: CourseReview[];
  isRated: boolean;
  category: Category;
  topic: Topic;
  instructor: Instructor;
  enrollment: Enrollment | null;
}
