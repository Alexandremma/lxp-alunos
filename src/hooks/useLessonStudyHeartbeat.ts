/**
 * Heartbeat de estudo na página da aula.
 * Conta tempo só com aba visível; flush a cada 30s (máx. 45s por flush).
 */

import { useEffect, useRef } from "react"
import {
  STUDY_HEARTBEAT_INTERVAL_MS,
  STUDY_HEARTBEAT_MAX_DELTA_SECONDS,
  incrementStudySeconds,
  resolveStudyTimeKeys,
} from "@/services/studyTimeService"

type UseLessonStudyHeartbeatParams = {
  enabled: boolean
  studentProfileId: string | undefined
  trailId: string | undefined
  lessonId: string | undefined
}

function isActivelyStudying(): boolean {
  if (typeof document === "undefined") return false
  if (document.visibilityState !== "visible") return false
  try {
    return document.hasFocus()
  } catch {
    return true
  }
}

export function useLessonStudyHeartbeat({
  enabled,
  studentProfileId,
  trailId,
  lessonId,
}: UseLessonStudyHeartbeatParams): void {
  const keysRef = useRef<{
    externalDisciplineId: string
    externalUnitId: string
  } | null>(null)
  const lastTickRef = useRef<number | null>(null)
  const flushingRef = useRef(false)

  useEffect(() => {
    if (!enabled || !studentProfileId?.trim() || !trailId?.trim() || !lessonId?.trim()) {
      keysRef.current = null
      lastTickRef.current = null
      return
    }

    let cancelled = false
    keysRef.current = null
    lastTickRef.current = null

    void (async () => {
      try {
        const keys = await resolveStudyTimeKeys({
          trailId: trailId.trim(),
          lessonId: lessonId.trim(),
        })
        if (cancelled) return
        keysRef.current = keys
        if (isActivelyStudying()) {
          lastTickRef.current = Date.now()
        }
      } catch (err) {
        console.warn("[study-heartbeat] failed to resolve lesson keys", err)
      }
    })()

    const flush = async (reason: string) => {
      if (flushingRef.current) return
      const keys = keysRef.current
      const started = lastTickRef.current
      if (!keys || started == null) return

      const elapsedMs = Date.now() - started
      lastTickRef.current = isActivelyStudying() ? Date.now() : null
      const deltaSeconds = Math.min(
        Math.floor(elapsedMs / 1000),
        STUDY_HEARTBEAT_MAX_DELTA_SECONDS,
      )
      if (deltaSeconds < 1) return

      flushingRef.current = true
      try {
        await incrementStudySeconds({
          studentProfileId: studentProfileId.trim(),
          externalDisciplineId: keys.externalDisciplineId,
          externalUnitId: keys.externalUnitId,
          deltaSeconds,
        })
      } catch (err) {
        console.warn(`[study-heartbeat] flush failed (${reason})`, err)
      } finally {
        flushingRef.current = false
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        void flush("hidden")
        return
      }
      if (isActivelyStudying()) {
        lastTickRef.current = Date.now()
      }
    }

    const onFocus = () => {
      if (isActivelyStudying() && lastTickRef.current == null) {
        lastTickRef.current = Date.now()
      }
    }

    const onBlur = () => {
      void flush("blur")
    }

    const onPageHide = () => {
      void flush("pagehide")
    }

    const intervalId = window.setInterval(() => {
      if (!isActivelyStudying()) return
      void flush("interval")
    }, STUDY_HEARTBEAT_INTERVAL_MS)

    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("focus", onFocus)
    window.addEventListener("blur", onBlur)
    window.addEventListener("pagehide", onPageHide)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("focus", onFocus)
      window.removeEventListener("blur", onBlur)
      window.removeEventListener("pagehide", onPageHide)
      void flush("unmount")
    }
  }, [enabled, studentProfileId, trailId, lessonId])
}
