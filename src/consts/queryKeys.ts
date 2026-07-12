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
    ready: (
      profileId: string,
      courseDisciplineId: string,
      completedLessons: number,
      totalLessons: number,
    ) =>
      ["certificate", "ready", profileId, courseDisciplineId, completedLessons, totalLessons] as const,
  },
  enrollments: {
    activeCourses: (profileId: string) => ["enrollments", "active-courses", profileId] as const,
  },
  myCourse: {
    overview: (profileId: string, courseId: string) =>
      ["my-course", "overview", profileId, courseId] as const,
    overviewAll: (profileId: string) => ["my-course", "overview", profileId] as const,
    summaries: (profileId: string) => ["my-course", "summaries", profileId] as const,
  },
  backoffice: {
    member: (userId?: string) => ["backoffice", "member", userId] as const,
  },
  trail: {
    detail: (trailId: string) => ["lxp", "trail", "detail", trailId] as const,
    modules: (trailId: string) => ["lxp", "trail", "modules", trailId] as const,
    lessons: (trailId: string) => ["lxp", "trail", "lessons", trailId] as const,
    lessonAccessMode: (trailId: string) => ["lxp", "trail", "lesson-access-mode", trailId] as const,
    lessonProgressMap: (trailId: string, profileId?: string) =>
      ["lxp", "trail", "lesson-progress-map", trailId, profileId] as const,
    contentStatus: (trailId: string) => ["lxp", "trail", "content-status", trailId] as const,
    disciplineWorkload: (disciplineId: string) => ["lxp", "discipline-workload", disciplineId] as const,
  },
  catalog: {
    all: ["lxp", "catalog"] as const,
    dataset: (filterKey: Record<string, unknown>) => ["lxp", "catalog", "dataset", filterKey] as const,
    stats: (profileId?: string) => ["lxp", "catalog", "stats", profileId] as const,
  },
  discipline: {
    access: (profileId: string | undefined, disciplineId: string | undefined, isModerator: boolean) =>
      ["lxp", "discipline-access", profileId, disciplineId, isModerator] as const,
  },
  gamification: {
    xpRules: ["gamification", "xp-rules-active"] as const,
  },
  lessonComments: {
    list: (disciplineId: string, unitId: string) =>
      ["lesson-comments", disciplineId, unitId] as const,
  },
  lessonNotes: {
    list: (profileId: string, disciplineId: string, unitId: string) =>
      ["lesson-notes", profileId, disciplineId, unitId] as const,
  },
  moderatorCatalog: {
    list: (params: Record<string, unknown>) => ["moderator", "catalog", params] as const,
    courses: () => ["moderator", "catalog", "courses"] as const,
  },
} as const;
