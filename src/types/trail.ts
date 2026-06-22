export type TrailContentIssueReason =
  | "no_integration"
  | "empty_catalog"
  | "external_error"

export type TrailContentStatus =
  | { state: "ready" }
  | {
      state: "unavailable"
      reason: TrailContentIssueReason
      title: string
      description: string
    }

export type Trail = {
  id: string
  title: string
  description?: string
  thumbnail?: string
  category?: string
  instructor?: string
  totalModules: number
  totalLessons: number
  completedLessons: number
  estimatedHours: number
  xpReward: number
  deadline?: string
}

export type TrailModule = {
  id: string
  title: string
  description?: string
  order: number
  status: "completed" | "in_progress" | "available" | "locked"
  lessonsCount?: number
}

export type TrailLesson = {
  id: string
  moduleId: string
  title: string
  description?: string
  content?: string
  duration: number
  type?: "video" | "reading" | "quiz" | "project" | "discussion"
  xpReward: number
  status: "completed" | "in_progress" | "available" | "locked"
  ebookPath?: string
  /** Hash ?c= do Alice (GET /api/rents) para launch POST no iframe */
  aliceContentId?: string
}
