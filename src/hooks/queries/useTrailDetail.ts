import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { queryKeys } from "@/consts/queryKeys";
import { useAuth } from "@/hooks/use-auth";
import {
  getTrailDetail,
  getTrailModules,
  getTrailLessons,
  resolveExternalDisciplineId,
  getDisciplineLessonAccessMode,
  resolveTrailContentStatus,
  type Trail,
  type TrailContentStatus,
  type TrailLesson,
  type TrailModule,
} from "@/services/trailAdapter";
import { fetchLessonProgressMap, mergeTrailLessonsWithProgress } from "@/services/progressService";
import {
  getDisciplineCompleteXp,
  getLessonCompleteXp,
} from "@/services/gamificationXpRulesService";
import { useXpRules } from "@/hooks/queries/useXpRules";

function applyLessonXpToLessons(
  lessons: TrailLesson[],
  lessonXp: number | undefined,
): TrailLesson[] {
  if (lessonXp === undefined) return lessons;
  return lessons.map((l) => ({ ...l, xpReward: lessonXp }));
}

function unlockLessonsForModeration(lessons: TrailLesson[]): TrailLesson[] {
  return lessons.map((lesson) =>
    lesson.status === "locked" ? { ...lesson, status: "available" } : lesson,
  );
}

type UseTrailDetailOptions = {
  moderationMode?: boolean;
};

export function useTrailDetail(trailId?: string, options?: UseTrailDetailOptions) {
  const moderationMode = options?.moderationMode ?? false;
  const { profile } = useAuth();
  const enabled = Boolean(trailId);
  const xpRulesQ = useXpRules();
  const lessonXp = xpRulesQ.data ? getLessonCompleteXp(xpRulesQ.data) : undefined;
  const disciplineCompleteXp = xpRulesQ.data
    ? getDisciplineCompleteXp(xpRulesQ.data)
    : undefined;

  const trail = useQuery<Trail | null>({
    queryKey: queryKeys.trail.detail(trailId!),
    queryFn: () => getTrailDetail(trailId!),
    enabled,
  });

  const modules = useQuery<TrailModule[]>({
    queryKey: queryKeys.trail.modules(trailId!),
    queryFn: () => getTrailModules(trailId!),
    enabled,
  });

  const lessons = useQuery<TrailLesson[]>({
    queryKey: queryKeys.trail.lessons(trailId!),
    queryFn: () => getTrailLessons(trailId!),
    enabled,
  });

  const lessonAccessMode = useQuery({
    queryKey: queryKeys.trail.lessonAccessMode(trailId!),
    queryFn: () => getDisciplineLessonAccessMode(trailId!),
    enabled,
  });

  const progressMap = useQuery({
    queryKey: queryKeys.trail.lessonProgressMap(trailId!, profile?.id),
    queryFn: async () => {
      const ext = await resolveExternalDisciplineId(trailId!);
      return fetchLessonProgressMap(profile!.id, ext);
    },
    enabled: enabled && Boolean(profile?.id) && !moderationMode,
  });

  const lessonsLoaded = lessons.isSuccess && !lessons.isFetching;
  const lessonsEmpty = lessonsLoaded && (lessons.data?.length ?? 0) === 0;

  const contentStatus = useQuery<TrailContentStatus>({
    queryKey: queryKeys.trail.contentStatus(trailId!),
    queryFn: () => resolveTrailContentStatus(trailId!),
    enabled: enabled && lessonsEmpty,
    staleTime: 30_000,
  });

  const accessMode = moderationMode ? "free" : (lessonAccessMode.data ?? "free");

  const mergedLessons = React.useMemo(() => {
    const base = applyLessonXpToLessons(lessons.data ?? [], lessonXp);
    if (moderationMode) {
      return unlockLessonsForModeration(base);
    }
    const map = progressMap.data;
    if (!map) return base;
    return applyLessonXpToLessons(
      mergeTrailLessonsWithProgress(base, map, accessMode),
      lessonXp,
    );
  }, [lessons.data, progressMap.data, lessonXp, accessMode, moderationMode]);

  const mergedTrail = React.useMemo(() => {
    const t = trail.data;
    if (!t) return null;
    const completedLessons = moderationMode
      ? 0
      : mergedLessons.filter((l) => l.status === "completed").length;
    const totalLessons = mergedLessons.length > 0 ? mergedLessons.length : t.totalLessons;
    return {
      ...t,
      totalLessons,
      completedLessons,
      totalModules: totalLessons,
      xpReward: moderationMode || lessonXp === undefined ? t.xpReward : totalLessons * lessonXp,
    };
  }, [trail.data, mergedLessons, lessonXp, moderationMode]);

  return {
    trail: mergedTrail,
    modules: modules.data ?? [],
    lessons: mergedLessons,
    contentStatus: contentStatus.data,
    contentStatusLoading: lessonsEmpty && contentStatus.isLoading,
    lessonXp,
    disciplineCompleteXp: moderationMode ? undefined : disciplineCompleteXp,
    lessonAccessMode: accessMode,
    isLoading:
      trail.isLoading ||
      modules.isLoading ||
      lessons.isLoading ||
      lessonAccessMode.isLoading ||
      (!moderationMode && xpRulesQ.isLoading) ||
      (!moderationMode && Boolean(profile?.id) && progressMap.isLoading) ||
      (lessonsEmpty && contentStatus.isLoading),
    error: trail.error || modules.error || lessons.error || progressMap.error,
  };
}
