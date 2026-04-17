import { useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import { fetchLessonProgressMap } from "@/services/progressService"
import { getTrailLessons, resolveExternalDisciplineId } from "@/services/trailAdapter"

export function useContinueTrail() {
  const { profile } = useAuth()

  const resolveNextPath = useCallback(
    async (contentId: string): Promise<string> => {
      const trailPath = `/trails/${contentId}`
      const lessons = await getTrailLessons(contentId)
      if (lessons.length === 0) return trailPath

      // Sem sessao de aluno, cai no detalhe da trilha.
      if (!profile?.id) return trailPath

      const externalDisciplineId = await resolveExternalDisciplineId(contentId)
      const progressByLesson = await fetchLessonProgressMap(profile.id, externalDisciplineId)

      const nextLesson =
        lessons.find((lesson) => progressByLesson[lesson.id] !== "completed") ?? lessons[0]

      return `/trails/${contentId}/lesson/${nextLesson.id}`
    },
    [profile?.id],
  )

  return { resolveNextPath }
}

