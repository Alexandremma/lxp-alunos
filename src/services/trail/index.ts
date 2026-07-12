export type {
  Trail,
  TrailModule,
  TrailLesson,
  TrailContentIssueReason,
  TrailContentStatus,
} from "@/types/trail"
export type { LessonAccessMode } from "@/types/discipline"

export {
  getDisciplineLessonAccessMode,
  courseDisciplineHasLibraryLink,
  resolveExternalDisciplineId,
} from "@/services/trail/trailFetch"

export {
  getTrailModules,
  getTrailLessons,
  resolveTrailContentStatus,
  getTrailDetail,
} from "@/services/trail/trailMap"
