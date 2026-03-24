import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/consts/queryKeys";
import { getActiveEnrolledCourses } from "@/services/enrollmentService";

export function useGetActiveEnrolledCourses(profileId?: string) {
  return useQuery({
    queryKey: profileId
      ? queryKeys.enrollments.activeCourses(profileId)
      : (["enrollments", "active-courses", "__none__"] as const),
    enabled: !!profileId,
    queryFn: () => getActiveEnrolledCourses(profileId!),
  });
}
