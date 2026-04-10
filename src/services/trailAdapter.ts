// LXP adapter stubs for trail detail, modules and lessons.
// Pending: replace with real HTTP integration once the external API schema/endpoints are available.

export type Trail = {
  id: string
  title: string
  description?: string
  thumbnail?: string
  category?: string
}

export type TrailModule = {
  id: string
  name: string
  lessonsCount?: number
}

export type TrailLesson = {
  id: string
  moduleId: string
  name: string
  duration?: number
  type?: "video" | "reading" | "quiz" | "project" | "discussion"
  xpReward?: number
}

export async function getTrailDetail(trailId: string): Promise<Trail | null> {
  return null
}

export async function getTrailModules(trailId: string): Promise<TrailModule[]> {
  return []
}

export async function getTrailLessons(trailId: string): Promise<TrailLesson[]> {
  return []
}

