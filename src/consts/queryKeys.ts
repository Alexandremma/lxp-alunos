export const queryKeys = {
  dashboard: {
    stats: (profileId: string) => ["dashboard", "stats", profileId] as const,
  },
  progress: {
    overview: (profileId: string) => ["progress", "overview", profileId] as const,
  },
  portfolio: {
    evidences: (profileId: string) => ["portfolio", "evidences", profileId] as const,
  },
  certificate: {
    detail: (profileId: string, courseDisciplineId: string) =>
      ["certificate", "detail", profileId, courseDisciplineId] as const,
  },
  enrollments: {
    activeCourses: (profileId: string) => ["enrollments", "active-courses", profileId] as const,
  },
  myCourse: {
    overview: (profileId: string) => ["my-course", "overview", profileId] as const,
  },
} as const;
