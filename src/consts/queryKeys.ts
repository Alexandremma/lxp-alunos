export const queryKeys = {
  enrollments: {
    activeCourses: (profileId: string) => ["enrollments", "active-courses", profileId] as const,
  },
  myCourse: {
    overview: (profileId: string) => ["my-course", "overview", profileId] as const,
  },
} as const;
