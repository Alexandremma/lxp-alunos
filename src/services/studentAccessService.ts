import { supabase } from "@/lib/supabaseClient";
import { getAccessDateKey } from "@/lib/accessDate";

const pendingAccessByKey = new Map<string, Promise<void>>();

/**
 * Registra que o aluno acessou a plataforma no dia atual (idempotente).
 * Chamado após login / restauração de sessão.
 */
export async function recordStudentDailyAccess(studentProfileId: string): Promise<void> {
  const access_date = getAccessDateKey();
  const key = `${studentProfileId}:${access_date}`;
  const existing = pendingAccessByKey.get(key);
  if (existing) return existing;

  const run = (async () => {
    const { error } = await supabase.from("lxp_student_daily_access").upsert(
      { student_profile_id: studentProfileId, access_date },
      { onConflict: "student_profile_id,access_date", ignoreDuplicates: true },
    );
    if (error) {
      console.warn("[studentAccess] record daily access:", error.message);
    }
  })().finally(() => {
    pendingAccessByKey.delete(key);
  });

  pendingAccessByKey.set(key, run);
  return run;
}

export async function listStudentAccessDates(studentProfileId: string, limit = 400): Promise<string[]> {
  const { data, error } = await supabase
    .from("lxp_student_daily_access")
    .select("access_date")
    .eq("student_profile_id", studentProfileId)
    .order("access_date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row) => String(row.access_date).slice(0, 10));
}
