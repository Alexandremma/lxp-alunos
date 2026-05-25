import { supabase } from "@/lib/supabaseClient";
import type { LearningEvidence } from "@/types/learningEvidence";

type DisciplineProgressRow = {
  course_discipline_id: string;
  status: string | null;
  grade: number | null;
  xp_earned: number | null;
  last_updated_at: string | null;
  created_at: string | null;
};

type DisciplineRow = {
  id: string;
  name: string | null;
  code: string | null;
};

type BadgeAwardRow = {
  earned_at: string;
  badge_id: string;
};

type BadgeDefRow = {
  id: string;
  name: string;
  description: string | null;
  icon_id: string | null;
  rarity: string | null;
  xp_reward: number | null;
  slug: string;
};

function toIsoNowIfMissing(value?: string | null): string {
  if (!value) return new Date().toISOString();
  return value;
}

function isDisciplineCompleted(row: DisciplineProgressRow): boolean {
  return row.status === "approved";
}

const rarityOrder: Record<string, LearningEvidence["rarity"]> = {
  legendary: "legendary",
  epic: "epic",
  rare: "rare",
  uncommon: "uncommon",
  common: "common",
};

function mapRarity(r: string | null): LearningEvidence["rarity"] {
  if (!r) return "common";
  return rarityOrder[r] ?? "common";
}

export async function getPortfolioEvidences(profileId: string): Promise<LearningEvidence[]> {
  const [{ data: progressRows, error: progressError }, awardsRes] = await Promise.all([
    supabase
      .from("lxp_student_discipline_progress")
      .select("course_discipline_id,status,grade,xp_earned,last_updated_at,created_at")
      .eq("student_profile_id", profileId),
    supabase
      .from("lxp_student_badge_awards")
      .select("earned_at,badge_id")
      .eq("student_profile_id", profileId)
      .order("earned_at", { ascending: false }),
  ]);

  if (progressError) throw progressError;
  if (awardsRes.error) throw awardsRes.error;

  const disciplineProgress = (progressRows ?? []) as DisciplineProgressRow[];
  const disciplineIds = disciplineProgress.map((row) => row.course_discipline_id);
  const evidences: LearningEvidence[] = [];

  if (disciplineIds.length > 0) {
    const [{ data: disciplines, error: disciplinesError }, { data: issues, error: issuesError }] =
      await Promise.all([
        supabase
          .from("lxp_course_disciplines")
          .select("id,name,code")
          .in("id", disciplineIds),
        supabase
          .from("lxp_certificate_issues")
          .select("course_discipline_id,validation_code")
          .eq("student_profile_id", profileId)
          .in("course_discipline_id", disciplineIds),
      ]);
    if (disciplinesError) throw disciplinesError;
    if (issuesError) throw issuesError;

    const disciplineById = new Map((disciplines ?? []).map((row: DisciplineRow) => [row.id, row]));
    const codeByDiscipline = new Map(
      (issues ?? []).map((row: { course_discipline_id: string; validation_code: string }) => [
        row.course_discipline_id,
        row.validation_code,
      ]),
    );

    for (const progress of disciplineProgress) {
      if (!isDisciplineCompleted(progress)) continue;
      const discipline = disciplineById.get(progress.course_discipline_id);
      const title = discipline?.name?.trim() || discipline?.code?.trim() || "Disciplina concluída";
      const completionDate = toIsoNowIfMissing(progress.last_updated_at ?? progress.created_at);
      const validationCode = codeByDiscipline.get(progress.course_discipline_id);

      evidences.push({
        id: `certificate-${progress.course_discipline_id}`,
        title,
        description: validationCode
          ? `Código de validação: ${validationCode}`
          : "Certificado de conclusão da disciplina.",
        type: "certificate",
        imageUrl: "/placeholder.svg",
        earnedAt: completionDate,
        trailId: progress.course_discipline_id,
        unlockedBy: "Conclusão da disciplina",
      });
    }
  }

  const awardRows = (awardsRes.data ?? []) as BadgeAwardRow[];
  if (awardRows.length > 0) {
    const badgeIds = [...new Set(awardRows.map((a) => a.badge_id))];
    const { data: badgeDefs, error: bdErr } = await supabase
      .from("lxp_gamification_badges")
      .select("id,name,description,icon_id,rarity,xp_reward,slug")
      .in("id", badgeIds);
    if (bdErr) throw bdErr;
    const badgeById = new Map((badgeDefs ?? []).map((b: BadgeDefRow) => [b.id, b]));

    for (const a of awardRows) {
      const b = badgeById.get(a.badge_id);
      if (!b) continue;
      evidences.push({
        id: `badge-${b.id}`,
        title: b.name,
        description: b.description?.trim() || `Badge ${b.slug}`,
        type: "badge",
        imageUrl: "/placeholder.svg",
        earnedAt: a.earned_at,
        rarity: mapRarity(b.rarity),
        icon: b.icon_id ?? "award",
        xpReward: b.xp_reward ?? 0,
        unlockedBy: "Gamificação",
      });
    }
  }

  return evidences.sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime());
}
