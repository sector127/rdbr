export interface ConflictDetail {
  requestedCourseId: number;
  conflictingEnrollmentId: number;
  conflictingCourseName: string;
  schedule: string;
}

export interface ConflictError {
  message: string;
  conflicts: ConflictDetail[];
}
