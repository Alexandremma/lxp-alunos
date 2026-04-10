import { useCallback } from "react"

// Stub: Replace with real resolution (use progress to compute last or next lesson)
export function useContinueTrail() {
  const resolveNextPath = useCallback((contentId: string) => {
    // Fallback route until lessons/progress are wired:
    return `/trails/${contentId}`
  }, [])

  return { resolveNextPath }
}

