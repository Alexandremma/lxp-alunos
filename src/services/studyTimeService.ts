/**
 * Tempo de estudo (M2) — heartbeat LXP.
 * Persiste via RPC atômica `lxp_increment_study_seconds`.
 */

import { supabase } from "@/lib/supabaseClient"
import { resolveExternalDisciplineId } from "@/services/trail/trailFetch"

export const STUDY_HEARTBEAT_INTERVAL_MS = 30_000
/** Teto por flush (alinhado à migration / RPC). */
export const STUDY_HEARTBEAT_MAX_DELTA_SECONDS = 45

export async function incrementStudySeconds(params: {
  studentProfileId: string
  externalDisciplineId: string
  externalUnitId: string
  deltaSeconds: number
}): Promise<number> {
  const delta = Math.min(
    Math.max(Math.floor(params.deltaSeconds), 0),
    STUDY_HEARTBEAT_MAX_DELTA_SECONDS,
  )
  if (delta < 1) return 0

  const { data, error } = await supabase.rpc("lxp_increment_study_seconds", {
    p_student_profile_id: params.studentProfileId,
    p_external_discipline_id: params.externalDisciplineId,
    p_external_unit_id: params.externalUnitId,
    p_delta_seconds: delta,
  })

  if (error) throw error
  return typeof data === "number" ? data : Number(data ?? 0)
}

export async function sumStudySecondsForProfile(
  studentProfileId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("lxp_student_study_time")
    .select("seconds")
    .eq("student_profile_id", studentProfileId)

  if (error) throw error
  return (data ?? []).reduce(
    (acc, row) => acc + (typeof row.seconds === "number" ? row.seconds : 0),
    0,
  )
}

export async function resolveStudyTimeKeys(params: {
  trailId: string
  lessonId: string
}): Promise<{ externalDisciplineId: string; externalUnitId: string }> {
  const externalDisciplineId = await resolveExternalDisciplineId(params.trailId)
  return {
    externalDisciplineId,
    externalUnitId: String(params.lessonId),
  }
}

export function secondsToStudyHours(totalSeconds: number): number {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return 0
  return Number((totalSeconds / 3600).toFixed(1))
}
