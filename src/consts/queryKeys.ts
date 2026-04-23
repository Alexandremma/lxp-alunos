export const queryKeys = {
  dashboard: {
    stats: (profileId: string) => ["dashboard", "stats", profileId] as const,
  },
  progress: {
    overview: (profileId: string) => ["progress", "overview", profileId] as const,
  },
  enrollments: {
    activeCourses: (profileId: string) => ["enrollments", "active-courses", profileId] as const,
  },
  myCourse: {
    overview: (profileId: string) => ["my-course", "overview", profileId] as const,
  },
} as const;
