import { supabase } from "@/lib/supabaseClient";

export type XpRulesMap = Record<string, number>;

const DEFAULT_XP: XpRulesMap = {
  lesson_complete: 10,
  daily_login: 5,
  streak_7_days: 100,
  lesson_comment: 15,
  lesson_comment_reply: 30,
  discipline_complete: 100,
};

/**
 * Regras ativas em lxp_gamification_xp_rules (mesma fonte dos triggers no Supabase).
 */
export async function fetchActiveXpRules(): Promise<XpRulesMap> {
  const { data, error } = await supabase
    .from("lxp_gamification_xp_rules")
    .select("action_key,xp_value,is_active")
    .eq("is_active", true);

  if (error) throw error;

  const map: XpRulesMap = { ...DEFAULT_XP };
  for (const row of data ?? []) {
    const key = row.action_key as string;
    const value = Number(row.xp_value);
    if (key && Number.isFinite(value)) {
      map[key] = value;
    }
  }
  return map;
}

export function getLessonCompleteXp(rules: XpRulesMap): number {
  return rules.lesson_complete ?? DEFAULT_XP.lesson_complete;
}

export function getDisciplineCompleteXp(rules: XpRulesMap): number {
  return rules.discipline_complete ?? DEFAULT_XP.discipline_complete;
}
