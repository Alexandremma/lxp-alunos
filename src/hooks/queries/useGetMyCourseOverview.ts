import { useQuery } from "@tanstack/react-query";
import { getMyCourseOverview } from "@/services/myCourseService";
import { queryKeys } from "@/consts/queryKeys";

export function useGetMyCourseOverview(profileId?: string, courseId?: string) {
  return useQuery({
    queryKey:
      profileId && courseId
        ? queryKeys.myCourse.overview(profileId, courseId)
        : (["my-course", "overview", "__none__"] as const),
    queryFn: () => getMyCourseOverview(profileId!, courseId!),
    enabled: Boolean(profileId && courseId),
  });
}
