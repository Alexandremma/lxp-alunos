import { useQuery } from "@tanstack/react-query";
import { listMyCourseSummaries } from "@/services/myCourseService";
import { queryKeys } from "@/consts/queryKeys";

export function useListMyCourseSummaries(profileId?: string) {
  return useQuery({
    queryKey: profileId
      ? queryKeys.myCourse.summaries(profileId)
      : (["my-course", "summaries", "__none__"] as const),
    queryFn: () => listMyCourseSummaries(profileId!),
    enabled: Boolean(profileId),
  });
}
