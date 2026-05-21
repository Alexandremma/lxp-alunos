import { supabase } from "@/lib/supabaseClient";
import { getAccessDateKey } from "@/lib/accessDate";

/**
 * Registra que o aluno acessou a plataforma no dia atual (idempotente).
 * Chamado após login / restauração de sessão.
 */
export async function recordStudentDailyAccess(studentProfileId: string): Promise<void> {
  const access_date = getAccessDateKey();
  const { error } = await supabase.from("lxp_student_daily_access").insert({
    student_profile_id: studentProfileId,
    access_date,
  });
  if (error) {
    if (error.code === "23505") return;
    console.warn("[studentAccess] record daily access:", error.message);
  }
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
