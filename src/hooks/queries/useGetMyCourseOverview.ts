import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/consts/queryKeys";
import { getMyCourseOverview } from "@/services/myCourseService";

export function useGetMyCourseOverview(profileId?: string) {
  return useQuery({
    queryKey: profileId ? queryKeys.myCourse.overview(profileId) : (["my-course", "overview", "__none__"] as const),
    enabled: !!profileId,
    queryFn: () => getMyCourseOverview(profileId!),
  });
}
