import { supabase } from "@/lib/supabaseClient";
import type { LearningEvidence } from "@/types/learningEvidence";

type DisciplineProgressRow = {
  course_discipline_id: string;
  status: string | null;
  progress_percent: number | null;
  completed_at: string | null;
  updated_at: string | null;
  xp_earned: number | null;
};

type DisciplineRow = {
  id: string;
  name: string | null;
  code: string | null;
};

function toIsoNowIfMissing(value?: string | null): string {
  if (!value) return new Date().toISOString();
  return value;
}

function isDisciplineCompleted(row: DisciplineProgressRow): boolean {
  return row.status === "approved" || row.status === "completed" || (row.progress_percent ?? 0) >= 100;
}

export async function getPortfolioEvidences(profileId: string): Promise<LearningEvidence[]> {
  const [{ data: progressRows, error: progressError }, lessonsResult] = await Promise.all([
    supabase
      .from("lxp_student_discipline_progress")
      .select("course_discipline_id,status,progress_percent,completed_at,updated_at,xp_earned")
      .eq("student_profile_id", profileId),
    supabase
      .from("lxp_student_lesson_progress")
      .select("id", { count: "exact", head: true })
      .eq("student_profile_id", profileId)
      .eq("status", "completed"),
  ]);

  if (progressError) throw progressError;
  if (lessonsResult.error) throw lessonsResult.error;

  const disciplineProgress = (progressRows ?? []) as DisciplineProgressRow[];
  const disciplineIds = disciplineProgress.map((row) => row.course_discipline_id);
  if (disciplineIds.length === 0) return [];

  const { data: disciplines, error: disciplinesError } = await supabase
    .from("lxp_course_disciplines")
    .select("id,name,code")
    .in("id", disciplineIds);
  if (disciplinesError) throw disciplinesError;

  const disciplineById = new Map((disciplines ?? []).map((row: DisciplineRow) => [row.id, row]));
  const evidences: LearningEvidence[] = [];

  for (const progress of disciplineProgress) {
    if (!isDisciplineCompleted(progress)) continue;
    const discipline = disciplineById.get(progress.course_discipline_id);
    const title = discipline?.name?.trim() || discipline?.code?.trim() || "Disciplina concluída";
    const completionDate = toIsoNowIfMissing(progress.completed_at ?? progress.updated_at);

    evidences.push({
      id: `certificate-${progress.course_discipline_id}`,
      title: `Certificado - ${title}`,
      description: "Certificado de conclusão da disciplina.",
      type: "certificate",
      imageUrl: "/placeholder.svg",
      earnedAt: completionDate,
      trailId: progress.course_discipline_id,
      shareUrl: `/certificado/${progress.course_discipline_id}`,
      unlockedBy: "Conclusão da disciplina",
    });
  }

  const lessonsCompleted = lessonsResult.count ?? 0;
  if (lessonsCompleted > 0) {
    evidences.push({
      id: "badge-lessons-first-steps",
      title: "Primeiros Passos",
      description: `Você já concluiu ${lessonsCompleted} aula(s).`,
      type: "badge",
      imageUrl: "/placeholder.svg",
      earnedAt: new Date().toISOString(),
      rarity: lessonsCompleted >= 20 ? "rare" : lessonsCompleted >= 10 ? "uncommon" : "common",
      icon: "book",
      xpReward: Math.min(lessonsCompleted * 5, 200),
      unlockedBy: "Aulas concluídas",
    });
  }

  return evidences.sort(
    (a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime(),
  );
}
