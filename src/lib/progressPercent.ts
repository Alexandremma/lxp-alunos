/** Pure helpers for progress percentages — shared across services and UI. */

export function clampProgressPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

/** Progress from completed vs total lessons (same formula as TrailDetail). */
export function lessonProgressPercent(completedLessons: number, totalLessons: number): number {
  if (totalLessons <= 0) return 0;
  return clampProgressPercent((completedLessons / totalLessons) * 100);
}

/** Course progress from completed vs total linked disciplines. */
export function courseProgressFromCompletedCount(completed: number, total: number): number {
  if (total <= 0) return 0;
  return clampProgressPercent((completed / total) * 100);
}

export function averageProgressPercent(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, value) => acc + value, 0);
  return clampProgressPercent(sum / values.length);
}
