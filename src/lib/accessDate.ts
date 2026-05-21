const ACCESS_TIMEZONE = "America/Sao_Paulo";

/** Data civil (YYYY-MM-DD) no fuso da instituição — usada para streak de login. */
export function getAccessDateKey(reference = new Date()): string {
  return reference.toLocaleDateString("en-CA", { timeZone: ACCESS_TIMEZONE });
}

export function addAccessDays(dateKey: string, deltaDays: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + deltaDays, 12, 0, 0));
  return utc.toISOString().slice(0, 10);
}

/**
 * Dias consecutivos de login: conta a partir de hoje ou de ontem (se ainda não entrou hoje),
 * voltando dia a dia enquanto houver registro em `accessDates`.
 */
export function computeConsecutiveLoginStreak(
  accessDates: Iterable<string>,
  todayKey = getAccessDateKey(),
): number {
  const set = new Set(accessDates);
  if (set.size === 0) return 0;

  const yesterdayKey = addAccessDays(todayKey, -1);
  let anchor = todayKey;
  if (!set.has(todayKey)) {
    if (!set.has(yesterdayKey)) return 0;
    anchor = yesterdayKey;
  }

  let streak = 0;
  let cursor = anchor;
  while (set.has(cursor)) {
    streak += 1;
    cursor = addAccessDays(cursor, -1);
  }
  return streak;
}
